/**
 * Behavioural verification for dsh-approval-notify.
 *
 * The plugin sits in the approval path, so the tests are written the way the
 * failure modes actually hurt:
 *
 *  - a thrown notification must NOT stop the approval (the request still has to
 *    reach the shipped UI via next);
 *  - the middleware must pass the SAME request down and return what next returns,
 *    or it silently rewrites the approval waterfall;
 *  - a focused window must stay quiet, and one approval must not produce a burst.
 *
 * Runs the real bundle against stubs for the browser APIs it touches. No React:
 * this plugin renders nothing.
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

/** Fresh browser-ish environment for one scenario. */
function makeEnv({ focused = false, permission = 'granted', throwOnNotify = false } = {}) {
  const toasts = [];
  class FakeNotification {
    static permission = permission;
    static requestPermission() {
      return Promise.resolve(permission);
    }
    constructor(title, options) {
      if (throwOnNotify) throw new Error('toast exploded');
      this.title = title;
      this.options = options ?? {};
      this.closed = false;
      this.onclick = null;
      toasts.push(this);
    }
    close() {
      this.closed = true;
    }
  }

  const handlers = new Map();
  const warnings = [];
  let focusCalls = 0;

  globalThis.Notification = FakeNotification;
  globalThis.document = {
    hasFocus: () => focused,
    visibilityState: focused ? 'visible' : 'hidden',
  };
  globalThis.window = {
    __ModuleLoader__: { load: (def) => { globalThis.__reg = def; } },
    focus: () => {
      focusCalls += 1;
    },
  };
  const realWarn = console.warn;
  console.warn = (...args) => warnings.push(args.map(String).join(' '));

  let registration = null;
  globalThis.window.__ModuleLoader__.load = (def) => {
    registration = def;
  };
  new Function(source)();

  const exp = registration.factory(() => {
    throw new Error('this plugin requires no modules');
  });

  const dicts = {};
  const ctx = {
    locale: {
      register: (ns, lang, dict) => {
        dicts[`${ns}:${lang}`] = dict;
      },
      bind: () => (key) => (dicts['dsh-approval-notify:zh'] ?? {})[key] ?? `!${key}`,
    },
    remote: {
      $on: (event, handler) => {
        handlers.set(event, handler);
        return () => {};
      },
    },
    effect: (fn) => fn(),
  };
  exp.apply(ctx);

  return {
    exp,
    dicts,
    handlers,
    toasts,
    warnings,
    focusCallsRef: () => focusCalls,
    restore: () => {
      console.warn = realWarn;
    },
  };
}

// --- 1. registration shape ----------------------------------------------
{
  const env = makeEnv();
  verdict('registers on the approval/request remote event', env.handlers.has('approval/request'), [...env.handlers.keys()].join(','));
  verdict(
    'registers both dictionaries with matching key sets',
    JSON.stringify(Object.keys(env.dicts['dsh-approval-notify:zh'] ?? {}).sort()) ===
      JSON.stringify(Object.keys(env.dicts['dsh-approval-notify:en'] ?? {}).sort()),
    'zh/en key parity',
  );
  env.restore();
}

// --- 2. the approval is passed down untouched ---------------------------
{
  const env = makeEnv({ focused: false });
  const handler = env.handlers.get('approval/request');
  const seen = [];
  const request = { key: 'a1', reason: '写文件到 D:\\x' };
  const returned = handler(request, (req) => {
    seen.push(req);
    return 'ANSWERED-BY-UI';
  });
  verdict(
    'passes the same request down and returns next() result',
    seen.length === 1 && seen[0] === request && returned === 'ANSWERED-BY-UI',
    `next saw ${seen.length} request(s), returned ${JSON.stringify(returned)}`,
  );
  env.restore();
}

// --- 3. notifies when out of sight -------------------------------------
{
  const env = makeEnv({ focused: false });
  env.handlers.get('approval/request')({ key: 'a2', reason: '写文件到 D:\\x' }, () => 'ok');
  const toast = env.toasts[0];
  verdict(
    'raises one notification carrying the reason when the window is not focused',
    env.toasts.length === 1 && String(toast.title).includes('审批') && toast.options.body === '写文件到 D:\\x',
    `${env.toasts.length} toast(s), title=${JSON.stringify(toast?.title)}, body=${JSON.stringify(toast?.options?.body)}`,
  );
  verdict(
    'keeps the notification until the user deals with it',
    toast?.options?.requireInteraction === true,
    `requireInteraction=${String(toast?.options?.requireInteraction)}`,
  );
  env.restore();
}

// --- 4. stays quiet while focused --------------------------------------
{
  const env = makeEnv({ focused: true });
  env.handlers.get('approval/request')({ key: 'a3', reason: 'x' }, () => 'ok');
  verdict('does not notify while the window is focused', env.toasts.length === 0, `${env.toasts.length} toast(s)`);
  env.restore();
}

// --- 5. dedupe is by dispatch identity, not by request data ------------
// The host request has no key/id, only optional callId and reason, so a
// data-derived key would merge distinct approvals that share a reason string.
{
  const env = makeEnv({ focused: false });
  const handler = env.handlers.get('approval/request');
  const request = { toolName: 't', reason: 'x' };
  handler(request, () => 'ok');
  handler(request, () => 'ok');
  verdict('the same dispatch notifies once', env.toasts.length === 1, `${env.toasts.length} toast(s) for 2 events on one request object`);

  // A different request with identical data is a different approval.
  handler({ toolName: 't', reason: 'x' }, () => 'ok');
  verdict(
    'a distinct approval with identical data still notifies',
    env.toasts.length === 2,
    `${env.toasts.length} toast(s): the second, separate approval must not be swallowed`,
  );
  env.restore();
}

// --- 6. a broken toast must not stall the approval ---------------------
{
  const env = makeEnv({ focused: false, throwOnNotify: true });
  const handler = env.handlers.get('approval/request');
  const seen = [];
  let returned;
  let threw = null;
  try {
    returned = handler({ key: 'boom', reason: 'x' }, (req) => {
      seen.push(req);
      return 'ANSWERED';
    });
  } catch (error) {
    threw = error;
  }
  verdict(
    'a throwing notification still delivers the approval downstream',
    threw === null && seen.length === 1 && returned === 'ANSWERED',
    threw === null ? `next saw ${seen.length}, returned ${JSON.stringify(returned)}` : `threw: ${threw.message}`,
  );
  verdict('logs the swallowed notification failure', env.warnings.length >= 1, env.warnings[0] ?? '(no warning)');
  env.restore();
}

// --- 7. denied permission degrades loudly, not silently ----------------
{
  const env = makeEnv({ focused: false, permission: 'denied' });
  const handler = env.handlers.get('approval/request');
  let returned;
  handler({ key: 'd1', reason: 'x' }, () => 'OK1');
  returned = handler({ key: 'd2', reason: 'x' }, () => 'OK2');
  verdict(
    'denied permission: no toast, approval still flows, one warning',
    env.toasts.length === 0 && returned === 'OK2' && env.warnings.length === 1,
    `${env.toasts.length} toast(s), ${env.warnings.length} warning(s)`,
  );
  env.restore();
}

// --- 8. unsupported environment degrades loudly ------------------------
{
  const env = makeEnv({ focused: false });
  const savedNotification = globalThis.Notification;
  delete globalThis.Notification;
  const returned = env.handlers.get('approval/request')({ key: 'u1', reason: 'x' }, () => 'OK');
  verdict(
    'missing Notification API: approval flows and a warning is emitted',
    returned === 'OK' && env.warnings.length === 1,
    `returned=${JSON.stringify(returned)}, warnings=${env.warnings.length}`,
  );
  globalThis.Notification = savedNotification;
  env.restore();
}

// --- 9. the body identifies what is asking ------------------------------
// toolName is always on the host request; reason is optional. A body without the
// tool name forces the user to switch windows to learn what is being asked.
{
  const env = makeEnv({ focused: false });
  env.handlers.get('approval/request')({ toolName: 'run_command', reason: '需要执行命令' }, () => 'ok');
  const body = String(env.toasts[0]?.options?.body ?? '');
  verdict(
    'the body names the tool alongside the reason',
    body.includes('run_command') && body.includes('需要执行命令'),
    `body=${JSON.stringify(body)}`,
  );
  env.restore();
}
{
  const env = makeEnv({ focused: false });
  env.handlers.get('approval/request')({ toolName: 'delete_path' }, () => 'ok');
  const body = String(env.toasts[0]?.options?.body ?? '');
  verdict(
    'a reason-less request still names the tool',
    body.includes('delete_path'),
    `body=${JSON.stringify(body)} (reason is optional on the host request)`,
  );
  env.restore();
}

// --- report -------------------------------------------------------------
for (const f of findings) {
  console.log(`${f.ok ? 'HOLDS   ' : 'DEFECT  '} ${f.name}\n         ${f.detail}\n`);
}
const bad = findings.filter((f) => !f.ok);
console.log(`${findings.length - bad.length}/${findings.length} hold, ${bad.length} defect(s)`);
process.exitCode = bad.length === 0 ? 0 : 1;
