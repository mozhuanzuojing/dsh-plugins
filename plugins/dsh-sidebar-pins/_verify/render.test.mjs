/**
 * Behavioural verification for dsh-sidebar-pins client half.
 *
 * Runs the REAL plugin bundle under a stub `window.__ModuleLoader__` with the
 * REAL React runtime plus a faithful stub of the host's menu primitives, then
 * asserts the behaviour the user asked for: chosen panels are folded into More
 * by DEFAULT and the choice survives a reload.
 *
 * Adversarial by design, because earlier revisions each hid a bug that a naive
 * test would have missed:
 *  - a markup-only assertion passed while the pin direction was inverted, so
 *    handlers are invoked for real here;
 *  - the menu once rendered unstyled because one style tag was shared by the
 *    hiding rule and the menu CSS, so the two tags are asserted separately.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve everything relative to THIS file so the suite works from any checkout
// location. DSH_REACT_HOME may point at a directory that has react/react-dom
// installed (the plugin itself ships no runtime dependencies).
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
    'This suite needs react + react-dom to render the registered component.\n' +
      `Looked in: ${reactHome}\n` +
      'Set DSH_REACT_HOME to a directory whose node_modules provides them.\n' +
      `Underlying error: ${error.message}`,
  );
  process.exit(2);
}

const CLIENT = join(pluginRoot, 'client', 'index.js');
const source = readFileSync(CLIENT, 'utf8');

// --- minimal browser surface --------------------------------------------
function makeStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
    _map: map,
  };
}

const styleTags = [];

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
    get hidden() {
      return attrs.has('data-sidebar-pins-hidden');
    },
  };
}

/** Row nodes the fake document hands back; filled per boot(). */
let domRows = [];

function makeDocument() {
  return {
    // The plugin looks tags up by data-plugin-css; report what it created.
    querySelector: (selector) => {
      const match = /data-plugin-css="([^"]+)"/.exec(String(selector));
      if (match === null) return null;
      return styleTags.find((tag) => tag.dataset.pluginCss === match[1]) ?? null;
    },
    querySelectorAll: (selector) => (String(selector).includes('_panelRow') ? domRows : []),
    createElement: () => {
      const tag = { dataset: {}, textContent: '' };
      styleTags.push(tag);
      return tag;
    },
    contains: () => true,
    head: { appendChild() {} },
  };
}

// --- faithful stub of the host primitives this plugin consumes ----------
// Shapes mirror the shipped components: MenuItemButton renders a
// role="menuitem" button; MenuGroup wraps its children with a heading.
const primitives = {
  MenuItemButton: ({ children, icon, current, onSelect, title }) =>
    React.createElement(
      'button',
      {
        type: 'button',
        role: 'menuitem',
        'aria-current': current === true ? 'page' : undefined,
        title,
        onClick: onSelect,
      },
      [
        icon ? React.createElement('span', { key: 'i', 'data-icon': true }) : null,
        typeof children === 'string' ? children : null,
      ],
    ),
  MenuGroup: ({ label, children }) =>
    React.createElement(
      'section',
      { 'data-menu-group': '', 'aria-label': label },
      [React.createElement('span', { key: 'h' }, label), ...(Array.isArray(children) ? children : [children])],
    ),
  IconPinFillRegular: () => React.createElement('i', { 'data-glyph': 'pin-fill' }),
  IconPinOutlineRegular: () => React.createElement('i', { 'data-glyph': 'pin-outline' }),
  IconSlidersTwoOutlineRegular: () => React.createElement('i', { 'data-glyph': 'sliders' }),
};

// --- load the bundle once (module state persists per browser session) ----
function loadBundle(rowLabels) {
  domRows = (rowLabels ?? []).map(makeRow);
  // The More row is also a panelRow button, but carries no panellist label.
  domRows.push(makeRow('更多'));
  let registration = null;
  globalThis.window = { __ModuleLoader__: { load: (definition) => { registration = definition; } } };
  globalThis.document = makeDocument();
  new Function(source)();
  assert.equal(registration?.id, 'dsh-sidebar-pins', 'bundle must register under its package name');
  const exportsObj = registration.factory((id) => {
    if (id === 'react') return React;
    if (id === '@deepseek-ai/dsh-client-ui-primitives') return primitives;
    throw new Error(`unexpected require: ${id}`);
  });
  assert.equal(typeof exportsObj.apply, 'function', 'factory must expose apply');
  return exportsObj;
}

// --- stub cordis context -------------------------------------------------
function makeContext(slots) {
  const dicts = {};
  const ctx = {
    locale: {
      register: (ns, lang, dict) => { dicts[`${ns}:${lang}`] = dict; },
      bind: () => (key) => (dicts['dsh-sidebar-pins:zh'] ?? {})[key] ?? `!${key}`,
      subscribe: () => () => {},
    },
    slots: {
      inject: (_name, cb) => cb(),
      register: (options, component) => { slots.register = { options, component }; return () => {}; },
      subscribe: () => () => {},
      entriesOfSlot: () => slots.entries,
    },
    effect: (fn) => fn(),
  };
  return { ctx, dicts };
}

// Panel registrations as the real profile declares them (id + label thunk).
const PANELS = [
  { options: { id: 'remote-wsl', order: 20, label: () => '远程资源管理器' } },
  { options: { id: 'paper-os', order: 50, label: () => '便签' } },
  { options: { id: 'love', order: 60, label: () => '爱' } },
  { options: { id: 'my-extra', order: 70, label: () => '自建面板' } },
];

const OWNER_ENTRIES = [
  { id: 'remote-wsl', label: '远程资源管理器', pinned: true, active: false },
  { id: 'paper-os', label: '便签', pinned: true, active: true },
  { id: 'love', label: '爱', pinned: true, active: false },
  { id: 'my-extra', label: '自建面板', pinned: true, active: false },
];

/** Tags created so far, keyed by their tag id. */
function tagsById() {
  const map = {};
  for (const tag of styleTags) map[tag.dataset.pluginCss] = tag.textContent;
  return map;
}

// === Session 1: first run, no stored choice ==============================
globalThis.localStorage = makeStorage();
const storage = globalThis.localStorage;
const exportsObj = loadBundle(PANELS.map((entry) => entry.options.label()));
const slots = { entries: PANELS, register: null };
const { ctx, dicts } = makeContext(slots);
exportsObj.apply(ctx);

assert.equal(slots.register?.options?.name, 'sidebar.panellist.actions', 'must register into the More menu actions slot');
assert.equal(slots.register.options.id, 'dsh-sidebar-pins', 'must use its own id, not replace the shipped occupant');
assert.deepEqual(
  Object.keys(dicts['dsh-sidebar-pins:en']).sort(),
  Object.keys(dicts['dsh-sidebar-pins:zh']).sort(),
  'en dictionary must cover exactly the zh key set',
);

// Two style tags per concern, so syncing the hiding rule can never overwrite
// the menu CSS. The hiding rule is now one static flag-keyed rule; which rows
// it applies to is decided by the DOM pass, asserted below.
const tags = tagsById();
assert.ok(tags['dsh-sidebar-pins/folded.css'] !== undefined, 'hiding rules need their own style tag');
assert.ok(tags['dsh-sidebar-pins/ui.css'] !== undefined, 'menu CSS needs its own style tag');

const css = tags['dsh-sidebar-pins/folded.css'];
assert.match(css, /data-sidebar-pins-hidden/, 'the hiding rule must key on the flag the plugin owns');
assert.match(css, /display:\s*none/, 'the hiding rule must actually hide');
// Labels must never be interpolated into a selector: arbitrary label text (quotes,
// newlines) would otherwise be able to break the whole rule.
assert.ok(!css.includes('aria-label'), 'labels must not be baked into CSS selectors');

const hiddenNow = domRows.filter((row) => row.hidden).map((row) => row.getAttribute('aria-label'));
assert.deepEqual(
  hiddenNow.sort(),
  ['便签', '爱', '远程资源管理器'].sort(),
  'the three default-folded rows must carry the hidden flag, and nothing else',
);
const moreRow = domRows[domRows.length - 1];
assert.equal(moreRow.getAttribute('aria-label'), '更多');
assert.equal(moreRow.hidden, false, 'the More row itself must never be hidden');

// The default folded set is what the user circled. First run writes nothing on
// purpose: absence of the key means "use the shipped default".
assert.equal(
  storage.getItem('dsh-sidebar-pins:folded:v1'),
  null,
  'first run must not write storage (absence = shipped default)',
);

// --- render the More menu with real owner props -------------------------
const calls = [];
const props = {
  entries: OWNER_ENTRIES,
  onOpen: (id) => calls.push(['open', id]),
  onPinnedChange: (id, pinned) => calls.push(['host-pin', id, pinned]),
  onDismiss: () => calls.push(['dismiss']),
};

const html = renderToStaticMarkup(React.createElement(slots.register.component, props));

for (const entry of OWNER_ENTRIES) {
  assert.ok(html.includes(entry.label), `More must still list "${entry.label}" so nothing is unreachable`);
}
assert.ok(!html.includes('!pins'), 'every locale key used by the UI must exist');
// Rows are built from host atoms, not raw buttons: that was the "ugly" report.
assert.ok(!html.includes('dsh-sidebar-pins-open'), 'must not hand-roll a row button');
assert.match(html, /data-menu-group/, 'rows must be wrapped in the host MenuGroup');
assert.ok(!html.includes('aria-pressed'), 'must not hand-roll a toggle button inside the menu');

/** All rendered menu rows, with their label text. */
function rowsOf(markup) {
  return [...markup.matchAll(/<button[^>]*role="menuitem"[^>]*>(.*?)<\/button>/gs)].map((match) => ({
    attrs: match[0].slice(0, match[0].indexOf('>')),
    text: match[1].replace(/<[^>]+>/g, ''),
  }));
}

const rows = rowsOf(html);
// 4 open rows + 4 visibility rows + 1 reset.
assert.equal(rows.length, 9, 'expected one row per action, no nested buttons');

const unfoldRow = rows.find((row) => row.text === '远程资源管理器 — 显示在侧栏');
assert.ok(unfoldRow, 'a folded panel must offer "show in the sidebar"');
assert.ok(
  !/aria-current="page"/.test(unfoldRow.attrs),
  'a folded panel must NOT be marked as showing in the sidebar',
);

const shownUnfoldRow = rows.find((row) => row.text === '自建面板 — 收进「更多」');
assert.ok(shownUnfoldRow, 'a shown panel must offer "move into More"');
assert.match(
  shownUnfoldRow.attrs,
  /aria-current="page"/,
  'the visibility row of a panel already in the sidebar must be marked current',
);

const foldRow = rows.find((row) => row.text === '自建面板 — 收进「更多」');
assert.ok(foldRow, 'a shown panel must offer "move into More"');
assert.ok(rows.filter((row) => row.text === '便签').length >= 1, 'active panel must still list an open row');

// === Interaction: invoke the real handlers ==============================
// Re-render through a capturing createElement so the onClick handlers the host
// primitives received can be called for real.
const realCreateElement = React.createElement;
const created = [];
React.createElement = function patched(type, propsArg, ...rest) {
  const children = rest.length <= 1 ? rest[0] : rest;
  const record = { type, props: { ...(propsArg ?? {}), children } };
  if (propsArg && typeof propsArg === 'object' && typeof propsArg.onClick === 'function') created.push(record);
  return realCreateElement.call(this, type, propsArg, ...rest);
};
try {
  renderToStaticMarkup(React.createElement(slots.register.component, props));
} finally {
  React.createElement = realCreateElement;
}

const buttons = created.filter((node) => node.props.role === 'menuitem');
assert.equal(buttons.length, 9, 'all rows must render as host menu items');

/** Plain text of one captured row. */
function rowText(node) {
  const kids = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
  return kids.filter((child) => typeof child === 'string').join('');
}

/** Find a captured row whose text starts with `prefix`. */
function findByPrefix(prefix) {
  return buttons.find((node) => rowText(node).startsWith(prefix));
}

calls.length = 0;
const unfoldNode = findByPrefix('远程资源管理器 — 显示在侧栏');
assert.ok(unfoldNode, 'unfold row handler must be reachable');
unfoldNode.props.onClick();
assert.deepEqual(calls, [['host-pin', 'remote-wsl', true]], 'unfolding must ask the host to show the row (pinned=true)');
assert.ok(
  !JSON.parse(storage.getItem('dsh-sidebar-pins:folded:v1')).includes('remote-wsl'),
  'unfolding must drop the id from the persisted set',
);

calls.length = 0;
const foldNode = findByPrefix('自建面板 — 收进');
assert.ok(foldNode, 'fold row handler must be reachable');
foldNode.props.onClick();
assert.deepEqual(calls, [['host-pin', 'my-extra', false]], 'folding must ask the host to hide the row (pinned=false)');
assert.ok(
  JSON.parse(storage.getItem('dsh-sidebar-pins:folded:v1')).includes('my-extra'),
  'folding must add the id to the persisted set',
);

calls.length = 0;
const openNode = buttons.find((node) => rowText(node) === '远程资源管理器');
assert.ok(openNode, 'open row handler must be reachable');
openNode.props.onClick();
assert.deepEqual(calls, [['dismiss'], ['open', 'remote-wsl']], 'open must dismiss the menu, then select the panel');

calls.length = 0;
const resetNode = buttons.find((node) => rowText(node) === '全部显示在侧栏');
assert.ok(resetNode, 'reset row must exist while something is folded');
resetNode.props.onClick();
assert.deepEqual(
  JSON.parse(storage.getItem('dsh-sidebar-pins:folded:v1')),
  [],
  'reset must persist an empty folded set',
);

// === Session 2: reload must keep the choice ==============================
storage.setItem('dsh-sidebar-pins:folded:v1', JSON.stringify(['love']));
styleTags.length = 0;
const reloadedExports = loadBundle(PANELS.map((entry) => entry.options.label()));
const reloadSlots = { entries: PANELS, register: null };
const { ctx: reloadCtx } = makeContext(reloadSlots);
reloadedExports.apply(reloadCtx);

const reloadHidden = domRows.filter((row) => row.hidden).map((row) => row.getAttribute('aria-label'));
assert.deepEqual(
  reloadHidden,
  ['爱'],
  'reload must hide exactly the panel chosen last session (and restore the other two)',
);

// === Boot race: rows that render late must still get the flag ============
// Registration and rendering are not synchronous. This reproduces the real
// defect found in the browser: at first sync the sidebar had committed only
// two of the three folded rows, so the third panel stayed visible. The plugin
// must re-apply after the DOM settles.
{
  styleTags.length = 0;
  globalThis.localStorage = makeStorage();
  // Start with only two rows present, mirroring the pre-commit moment.
  domRows = [makeRow('插件'), makeRow('自动化任务'), makeRow('便签'), makeRow('爱'), makeRow('更多')];
  let reg = null;
  globalThis.window = { __ModuleLoader__: { load: (d) => { reg = d; } } };
  globalThis.document = makeDocument();
  // Deterministic timers: capture the callbacks instead of waiting.
  const timers = [];
  globalThis.setTimeout = (fn) => {
    timers.push(fn);
    return timers.length;
  };
  globalThis.clearTimeout = () => {};
  globalThis.requestAnimationFrame = (fn) => {
    timers.push(fn);
    return timers.length;
  };
  globalThis.cancelAnimationFrame = () => {};
  new Function(source)();
  const exp = reg.factory((id) => {
    if (id === 'react') return React;
    if (id === '@deepseek-ai/dsh-client-ui-primitives') return primitives;
    throw new Error(`unexpected: ${id}`);
  });
  const raceSlots = { entries: PANELS, register: null };
  const { ctx: raceCtx } = makeContext(raceSlots);
  exp.apply(raceCtx);

  // First pass ran with the row missing.
  const before = domRows.filter((row) => row.hidden).map((row) => row.getAttribute('aria-label'));
  assert.deepEqual(before, ['便签', '爱'], 'precondition: the late row is not marked yet');

  // The late row arrives (remote-wsl mounts), then the deferred pass runs.
  domRows.splice(2, 0, makeRow('远程资源管理器'));
  for (const fn of timers.slice()) fn();
  const after = domRows.filter((row) => row.hidden).map((row) => row.getAttribute('aria-label'));
  assert.deepEqual(
    after.sort(),
    ['便签', '爱', '远程资源管理器'].sort(),
    'the deferred pass must hide the row that rendered after the first sync',
  );

  // Restore the real timers for the remaining assertions.
  delete globalThis.setTimeout;
  delete globalThis.clearTimeout;
  delete globalThis.requestAnimationFrame;
  delete globalThis.cancelAnimationFrame;
}

// === Unfolding must clear the flag from previously marked rows ===========
// Without this, a row hidden once stays hidden until a full page reload, which
// looked like "the toggle does nothing" in manual testing.
{
  styleTags.length = 0;
  globalThis.localStorage = makeStorage();
  globalThis.localStorage.setItem('dsh-sidebar-pins:folded:v1', JSON.stringify(['love']));
  domRows = [makeRow('插件'), makeRow('便签'), makeRow('爱'), makeRow('更多')];
  let reg = null;
  globalThis.window = { __ModuleLoader__: { load: (d) => { reg = d; } } };
  globalThis.document = makeDocument();
  new Function(source)();
  const exp = reg.factory((id) => {
    if (id === 'react') return React;
    if (id === '@deepseek-ai/dsh-client-ui-primitives') return primitives;
    throw new Error(`unexpected: ${id}`);
  });
  const clearSlots = { entries: PANELS, register: null };
  const { ctx: clearCtx } = makeContext(clearSlots);
  exp.apply(clearCtx);
  assert.deepEqual(
    domRows.filter((row) => row.hidden).map((row) => row.getAttribute('aria-label')),
    ['爱'],
    'precondition: love is hidden',
  );

  // The user chooses "show in sidebar". Re-apply the pass with love unfolded;
  // the SAME row nodes must lose the flag (no reload involved).
  globalThis.localStorage.setItem('dsh-sidebar-pins:folded:v1', JSON.stringify([]));
  let reg2 = null;
  globalThis.window = { __ModuleLoader__: { load: (d) => { reg2 = d; } } };
  new Function(source)();
  const exp2 = reg2.factory((id) => {
    if (id === 'react') return React;
    if (id === '@deepseek-ai/dsh-client-ui-primitives') return primitives;
    throw new Error(`unexpected: ${id}`);
  });
  const clearSlots2 = { entries: PANELS, register: null };
  const { ctx: clearCtx2 } = makeContext(clearSlots2);
  exp2.apply(clearCtx2);
  assert.deepEqual(
    domRows.filter((row) => row.hidden).map((row) => row.getAttribute('aria-label')),
    [],
    'an unfolded panel must lose its hidden flag',
  );
}

// === Fresh empty registry must not throw ================================
const emptySlots = { entries: [], register: null };
const { ctx: emptyCtx } = makeContext(emptySlots);
const emptyExports = loadBundle([]);
emptyExports.apply(emptyCtx);
const emptyHtml = renderToStaticMarkup(
  React.createElement(emptySlots.register.component, { ...props, entries: [] }),
);
assert.match(emptyHtml, /侧栏还没有任何面板条目/, 'empty state must be explicit');
assert.ok(!emptyHtml.includes('全部显示在侧栏'), 'empty state must not offer a reset action');

console.log('PASS: registration, locale parity, host-atom rows, boot default fold, persisted reload, toggle direction, reset, empty state');
