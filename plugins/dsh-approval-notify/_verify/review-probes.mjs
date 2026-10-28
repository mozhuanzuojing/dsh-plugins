/**
 * Adversarial review probes for dsh-approval-notify.
 *
 * Each probe encodes a suspicion from reading the plugin against the REAL host
 * contract. A probe that fails is a confirmed defect, not a broken test.
 *
 * The contract that matters (read from @deepseek-ai/dsh-user-approval):
 *   ctx.waterfall(target, 'approval/request', req, () => 'unavailable')
 * where `req` carries { agent, toolName, callId?, reason?, signal? } — there is
 * NO `key` and NO `id` on it (the audit `id` is a local variable inside
 * approval.request()). Any dedupe key built from `key`/`id` therefore degrades.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolve(here, '..');
const source = readFileSync(join(pluginRoot, 'client', 'index.js'), 'utf8');

const findings = [];
function verdict(name, ok, detail) {
  findings.push({ name, ok, detail });
}

function makeEnv({ focused = false } = {}) {
  const toasts = [];
  class FakeNotification {
    static permission = 'granted';
    constructor(title, options) {
      this.title = title;
      this.options = options ?? {};
      toasts.push(this);
    }
    close() {}
  }
  const handlers = new Map();
  globalThis.Notification = FakeNotification;
  globalThis.document = { hasFocus: () => focused, visibilityState: focused ? 'visible' : 'hidden' };
  let registration = null;
  globalThis.window = {
    __ModuleLoader__: { load: (def) => { registration = def; } },
    focus: () => {},
  };
  new Function(source)();
  const exp = registration.factory(() => {
    throw new Error('no modules required');
  });
  const dicts = {};
  const ctx = {
    locale: {
      register: (ns, lang, dict) => { dicts[`${ns}:${lang}`] = dict; },
      bind: () => (key) => (dicts['dsh-approval-notify:zh'] ?? {})[key] ?? `!${key}`,
    },
    remote: {
      $on: (event, handler) => { handlers.set(event, handler); return () => {}; },
    },
    effect: (fn) => fn(),
  };
  exp.apply(ctx);
  return { handler: handlers.get('approval/request'), toasts };
}

// === R1: two DISTINCT approvals sharing a reason must both notify =======
// Host requests carry no key/id; only callId (optional) and reason. Two
// different tool calls of the same tool with the same reason text are ordinary
// (e.g. two writes that both explain "需要写入文件"). Suppressing the second is
// exactly the missed-approval this plugin exists to prevent.
{
  const env = makeEnv();
  const a = { toolName: 'write_file', reason: '需要写入文件', signal: {} };
  const b = { toolName: 'write_file', reason: '需要写入文件', signal: {} };
  env.handler(a, () => 'ok');
  env.handler(b, () => 'ok');
  verdict(
    'R1 distinct approvals with identical reason both notify',
    env.toasts.length === 2,
    `2 separate requests (no key, no callId, same reason) produced ${env.toasts.length} notification(s)`,
  );
}

// === R2: the notifier must not grow without bound =====================
// A long session raises many approvals; a Set of keys keyed by request data is
// never pruned. Probe: how many entries remain after many distinct approvals.
{
  const env = makeEnv();
  for (let i = 0; i < 500; i += 1) {
    env.handler({ toolName: 't', reason: `reason-${i}` }, () => 'ok');
  }
  // The plugin keeps its dedupe state in module scope; read it back through a
  // fresh bundle execution is not possible, so probe behaviour instead: a
  // memory-retaining structure would keep suppressing a recycled reason.
  const reused = { toolName: 't', reason: 'reason-0' };
  const before = env.toasts.length;
  env.handler(reused, () => 'ok');
  verdict(
    'R2 a recycled-but-distinct approval still notifies',
    env.toasts.length === before + 1,
    `after 500 approvals, a NEW request reusing an old reason produced ${env.toasts.length - before} notification(s)`,
  );
}

// === R3: the notification should identify the tool =====================
// toolName is always present on the host request; reason is optional. A toast
// that says only "DSH 正在等待审批" forces the user to switch windows to learn
// what is being asked.
{
  const env = makeEnv();
  env.handler({ toolName: 'run_command', reason: '需要执行命令' }, () => 'ok');
  const body = String(env.toasts[0]?.options?.body ?? '');
  verdict(
    'R3 the body names the tool asking for approval',
    body.includes('run_command'),
    `body=${JSON.stringify(body)} (toolName is always available on the host request)`,
  );
}

// === R4: a request with NO reason must still be identifiable ===========
{
  const env = makeEnv();
  env.handler({ toolName: 'delete_path' }, () => 'ok');
  const body = String(env.toasts[0]?.options?.body ?? '');
  verdict(
    'R4 a reason-less request still produces a useful body',
    body.includes('delete_path'),
    `body=${JSON.stringify(body)} (reason is optional on the host request)`,
  );
}

// === R5: same request object dispatched twice notifies once ============
{
  const env = makeEnv();
  const one = { toolName: 't', callId: 'c1', reason: 'r' };
  env.handler(one, () => 'ok');
  env.handler(one, () => 'ok');
  verdict('R5 the same approval object notifies once', env.toasts.length === 1, `${env.toasts.length} toast(s)`);
}

// --- report -------------------------------------------------------------
for (const f of findings) {
  console.log(`${f.ok ? 'HOLDS   ' : 'DEFECT  '} ${f.name}\n         ${f.detail}\n`);
}
const bad = findings.filter((f) => !f.ok);
console.log(`${findings.length - bad.length}/${findings.length} hold, ${bad.length} defect(s)`);
process.exitCode = bad.length === 0 ? 0 : 1;
