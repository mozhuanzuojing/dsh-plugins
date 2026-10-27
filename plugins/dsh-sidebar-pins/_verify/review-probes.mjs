/**
 * Adversarial review probes for dsh-sidebar-pins.
 *
 * Each probe encodes one suspicion raised by reading the code. A probe that
 * FAILS is a confirmed defect, not a broken test — that is the point.
 *
 * The DOM is faked faithfully enough to exercise the hiding pass: the plugin
 * marks exact row nodes with a flag instead of building selectors from labels,
 * which is what these probes verify.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Paths are relative to this file so the probes run from any checkout.
const here = dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolve(here, '..');
const reactHome = process.env.DSH_REACT_HOME ?? pluginRoot;

const require = createRequire(join(reactHome, 'package.json'));
let React;
let renderToStaticMarkup;
try {
  React = require('react');
  ({ renderToStaticMarkup } = require('react-dom/server'));
} catch (error) {
  console.error(
    'These probes need react + react-dom.\n' +
      `Looked in: ${reactHome}\n` +
      'Set DSH_REACT_HOME to a directory whose node_modules provides them.\n' +
      `Underlying error: ${error.message}`,
  );
  process.exit(2);
}

const CLIENT = join(pluginRoot, 'client', 'index.js');
const source = readFileSync(CLIENT, 'utf8');
const STORAGE_KEY = 'dsh-sidebar-pins:folded:v1';

const findings = [];
function verdict(name, ok, detail) {
  findings.push({ name, verdict: ok ? 'HOLDS' : 'CONFIRMED DEFECT', detail });
}

// --- fake DOM ------------------------------------------------------------
/** A sidebar row as the host renders it: button._panelRow[aria-label]. */
function makeRow(label) {
  const attrs = new Map([
    ['class', 'x_panelRow'],
    ['aria-label', label],
  ]);
  return {
    getAttribute: (n) => (attrs.has(n) ? attrs.get(n) : null),
    setAttribute: (n, v) => attrs.set(n, String(v)),
    removeAttribute: (n) => attrs.delete(n),
    _attrs: attrs,
    get hidden() {
      return attrs.has('data-sidebar-pins-hidden');
    },
  };
}

const styleTags = [];
function makeDocument(rows) {
  return {
    querySelector: (sel) => {
      const m = /data-plugin-css="([^"]+)"/.exec(String(sel));
      if (!m) return null;
      return styleTags.find((t) => t.dataset.pluginCss === m[1]) ?? null;
    },
    querySelectorAll: (sel) => (String(sel).includes('_panelRow') ? rows : []),
    createElement: () => {
      const t = { dataset: {}, textContent: '' };
      styleTags.push(t);
      return t;
    },
    contains: () => true,
    head: { appendChild() {} },
  };
}

function makeStorage(stored) {
  const map = new Map();
  if (stored !== undefined) map.set(STORAGE_KEY, stored);
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    _map: map,
  };
}

const primitives = {
  MenuItemButton: ({ children, icon, current, onSelect, disabled }) =>
    React.createElement('button', { type: 'button', role: 'menuitem', 'aria-current': current === true ? 'page' : undefined, disabled, onClick: onSelect }, [
      icon ? React.createElement('span', { key: 'i' }) : null,
      typeof children === 'string' ? children : null,
    ]),
  MenuGroup: ({ label, children }) =>
    React.createElement('section', { 'data-menu-group': '', 'aria-label': label }, [
      React.createElement('span', { key: 'h' }, label),
      ...(Array.isArray(children) ? children : [children]),
    ]),
  IconPinFillRegular: () => React.createElement('i', {}),
  IconPinOutlineRegular: () => React.createElement('i', {}),
  IconSlidersTwoOutlineRegular: () => React.createElement('i', {}),
};

function boot({ entries, stored }) {
  styleTags.length = 0;
  globalThis.localStorage = makeStorage(stored);
  const rows = entries.map((e) => makeRow(e.renderedLabel ?? String(e.options.label?.() ?? e.options.id)));
  // The More row is also a panelRow button but has no panellist aria-label match.
  rows.push(makeRow('更多'));
  globalThis.document = makeDocument(rows);
  let reg = null;
  globalThis.window = { __ModuleLoader__: { load: (d) => { reg = d; } } };
  new Function(source)();
  const exp = reg.factory((id) => {
    if (id === 'react') return React;
    if (id === '@deepseek-ai/dsh-client-ui-primitives') return primitives;
    throw new Error(`unexpected: ${id}`);
  });
  const dicts = {};
  const slots = { entries, register: null };
  const ctx = {
    locale: {
      register: (ns, lang, d) => { dicts[`${ns}:${lang}`] = d; },
      bind: () => (k) => (dicts['dsh-sidebar-pins:zh'] ?? {})[k] ?? `!${k}`,
      subscribe: () => () => {},
    },
    slots: {
      inject: (_n, cb) => cb(),
      register: (o, c) => { slots.register = { options: o, component: c }; return () => {}; },
      subscribe: () => () => {},
      entriesOfSlot: () => slots.entries,
    },
    effect: (fn) => fn(),
  };
  exp.apply(ctx);
  const hideCss = styleTags.find((t) => t.dataset.pluginCss === 'dsh-sidebar-pins/folded.css')?.textContent ?? '';
  const hiddenLabels = rows.filter((r) => r.hidden).map((r) => r.getAttribute('aria-label'));
  return { slots, hideCss, dicts, rows, hiddenLabels };
}

const OWNER = (id, label, active = false) => ({ id, label, pinned: true, active });
const baseEntries = [
  { options: { id: 'remote-wsl', order: 20, label: () => '远程资源管理器' } },
  { options: { id: 'paper-os', order: 50, label: () => '便签' } },
  { options: { id: 'love', order: 60, label: () => '爱' } },
];

// === P1: duplicate labels must not over-hide ============================
{
  const dup = [
    { options: { id: 'remote-wsl', order: 20, label: () => '同名面板' } },
    { options: { id: 'love', order: 60, label: () => '同名面板' } },
  ];
  const { hiddenLabels } = boot({ entries: dup, stored: JSON.stringify(['remote-wsl']) });
  verdict(
    'P1 duplicate labels hide only the folded twin',
    hiddenLabels.length === 1 && hiddenLabels[0] === '同名面板',
    `folded remote-wsl of two "同名面板" rows; hidden rows = ${hiddenLabels.length} (must be exactly 1)`,
  );
}

// === P2: a newline in a label must not break the rule ===================
{
  const weird = [{ options: { id: 'remote-wsl', order: 20, label: () => 'multi\nline' } }];
  const { hideCss, hiddenLabels } = boot({ entries: weird, stored: JSON.stringify(['remote-wsl']) });
  const validCss = !/"[^"\n]*\n[^"]*"/.test(hideCss) && hideCss.trim() !== '';
  verdict(
    'P2 labels never reach CSS, so newlines cannot break the rule',
    validCss && hiddenLabels.length === 1,
    `css=${JSON.stringify(hideCss)} hidden=${JSON.stringify(hiddenLabels)}`,
  );
}

// === P3: quotes and backslashes in labels ===============================
{
  const weird = [{ options: { id: 'remote-wsl', order: 20, label: () => 'He said "hi" \\ ok' } }];
  const { hideCss, hiddenLabels } = boot({ entries: weird, stored: JSON.stringify(['remote-wsl']) });
  verdict(
    'P3 quotes/backslashes in labels are inert',
    hiddenLabels.length === 1 && !hideCss.includes('He said'),
    `css=${JSON.stringify(hideCss)} hidden=${JSON.stringify(hiddenLabels)}`,
  );
}

// === P4: stale ids are ignored ==========================================
{
  const { hiddenLabels, hideCss } = boot({ entries: baseEntries, stored: JSON.stringify(['love', 'ghost']) });
  verdict(
    'P4 stale ids are harmless',
    hiddenLabels.length === 1 && hiddenLabels[0] === '爱',
    `hidden=${JSON.stringify(hiddenLabels)} css=${JSON.stringify(hideCss)}`,
  );
}

// === P5: explicit empty choice ==========================================
{
  const { hiddenLabels } = boot({ entries: baseEntries, stored: '[]' });
  verdict('P5 explicit empty choice is honoured', hiddenLabels.length === 0, `hidden=${JSON.stringify(hiddenLabels)}`);
}

// === P6/P7: corrupt or non-array storage falls back =====================
{
  const a = boot({ entries: baseEntries, stored: 'not json{{' });
  const b = boot({ entries: baseEntries, stored: JSON.stringify({ folded: ['love'] }) });
  verdict(
    'P6/P7 corrupt and non-array storage fall back to the shipped default',
    a.hiddenLabels.length === 3 && b.hiddenLabels.length === 3,
    `corrupt hidden=${a.hiddenLabels.length}, object hidden=${b.hiddenLabels.length} (both must be 3)`,
  );
}

// === P8: the flag is cleared when a panel is unfolded ===================
{
  // First boot folds love; then the same DOM is re-synced with love unfolded.
  const { slots } = boot({ entries: baseEntries, stored: JSON.stringify(['love']) });
  const rows = globalThis.document.querySelectorAll('button[class*="_panelRow"]');
  const before = rows.filter((r) => r.hidden).length;
  // Simulate the user choosing "show in sidebar" via localStorage + a re-sync.
  const mod = { stored: JSON.stringify([]) };
  globalThis.localStorage = makeStorage(mod.stored);
  // Re-run the bundle so it re-reads storage and re-marks the SAME row nodes.
  let reg2 = null;
  globalThis.window = { __ModuleLoader__: { load: (d) => { reg2 = d; } } };
  new Function(source)();
  const exp2 = reg2.factory((id) => {
    if (id === 'react') return React;
    if (id === '@deepseek-ai/dsh-client-ui-primitives') return primitives;
    throw new Error(`unexpected: ${id}`);
  });
  const slots2 = { entries: baseEntries, register: null };
  const ctx2 = {
    locale: { register: () => {}, bind: () => (k) => k, subscribe: () => () => {} },
    slots: {
      inject: (_n, cb) => cb(),
      register: (o, c) => { slots2.register = { options: o, component: c }; return () => {}; },
      subscribe: () => () => {},
      entriesOfSlot: () => slots2.entries,
    },
    effect: (fn) => fn(),
  };
  exp2.apply(ctx2);
  const after = rows.filter((r) => r.hidden).length;
  verdict(
    'P8 unfolding clears the hidden flag from previously marked rows',
    before === 1 && after === 0,
    `hidden before=${before} after=${after} (must be 1 then 0)`,
  );
  void slots;
}

// === P9: menu renders and toggles without onPinnedChange ================
{
  const { slots } = boot({ entries: baseEntries, stored: '[]' });
  let threw = null;
  const realCreate = React.createElement;
  const captured = [];
  React.createElement = function patched(type, props, ...rest) {
    if (props && typeof props.onClick === 'function') captured.push({ props });
    return realCreate.call(this, type, props, ...rest);
  };
  let html = '';
  try {
    html = renderToStaticMarkup(
      React.createElement(slots.register.component, {
        entries: baseEntries.map((e) => OWNER(e.options.id, e.options.label())),
        onOpen: () => {},
        onDismiss: () => {},
      }),
    );
  } catch (e) {
    threw = e;
  } finally {
    React.createElement = realCreate;
  }
  let toggleThrew = null;
  if (!threw) {
    const foldRow = captured.find((c) => {
      const kids = Array.isArray(c.props.children) ? c.props.children : [c.props.children];
      return kids.some((k) => typeof k === 'string' && k.includes('收进'));
    });
    try {
      foldRow?.props.onClick();
    } catch (e) {
      toggleThrew = e;
    }
  }
  verdict(
    'P9 missing onPinnedChange does not break render or toggle',
    threw === null && toggleThrew === null && html.length > 0,
    `render=${threw ? 'threw' : 'ok'} toggle=${toggleThrew ? 'threw' : 'ok'}`,
  );
}

// === P10: no dead props are passed to host atoms ========================
{
  // MenuItemButton accepts no `title`; passing one was dead code.
  const srcHasTitleProp = /MenuItemButton,\s*\{[^}]*\btitle:/.test(source);
  verdict('P10 no unsupported title prop reaches MenuItemButton', !srcHasTitleProp, srcHasTitleProp ? 'title: still passed' : 'clean');
}

for (const f of findings) {
  console.log(`${f.verdict.padEnd(18)} ${f.name}\n                   ${f.detail}\n`);
}
const bad = findings.filter((f) => f.verdict !== 'HOLDS');
console.log(`\n${findings.length - bad.length}/${findings.length} hold, ${bad.length} confirmed defect(s)`);
process.exitCode = bad.length === 0 ? 0 : 1;
