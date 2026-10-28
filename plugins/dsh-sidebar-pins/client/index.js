/**
 * dsh-sidebar-pins —— client half.
 *
 * What the host gives us (read from the shipped packages, not guessed):
 *
 * - ui-sidebar renders one row per `sidebar.panellist` registration, and hides
 *   a row while its id sits in its own **in-memory** `unpinned` store
 *   (`createPanelPins()` -> `createSnapshotStore`; no localStorage).
 * - The only writer of that store is `setPinned`, handed to occupants of
 *   `sidebar.panellist.actions`.
 * - That actions list is rendered *inside* the More `Menu`, and the Menu mounts
 *   its children only while it is open (`const H = open && …`). So at boot —
 *   and on every reload — no reachable API can pre-unpin a panel.
 * - ui-entry-customization documents the consequence: "More menus provide no
 *   visibility controls… choices reset when the plugin reloads".
 *
 * Therefore a boot-time default cannot be expressed through the host's pin
 * store. This plugin keeps its own folded set instead:
 *
 *  1. folded ids persist in localStorage (first run seeds DEFAULT_FOLDED), so
 *     the choice survives reloads;
 *  2. the matching sidebar rows are hidden by an injected CSS rule keyed on the
 *     row's own accessible name, so they are gone from the column on first paint;
 *  3. every panel stays listed in More, so nothing becomes unreachable;
 *  4. toggling a row also calls the host's `onPinnedChange`, so the sidebar's own
 *     filter agrees with ours for the rest of the session.
 *
 * Presentation note: the menu rows are built from the host's own primitives
 * (`MenuItemButton`, `MenuGroup`, and its icon set), not hand-rolled buttons.
 * That is deliberate — an earlier revision drew raw <button>s, which rendered
 * unstyled inside the host Menu and looked broken. Reusing the shipped menu
 * atoms makes the rows inherit the host's typography, spacing, hover, focus and
 * disabled states for free, and keeps them in step when the host restyles.
 *
 * Isolation note: the host concatenates several client bundles into one combo
 * script. Everything below therefore lives inside an IIFE so top-level
 * `const`/`let` names (`NS`, `DICTIONARY`, …) cannot collide with a sibling
 * plugin and crash web boot with "Identifier 'NS' has already been declared".
 */

(() => {
const NS = 'dsh-sidebar-pins';

/** Panels folded into More when this profile has never chosen otherwise. */
const DEFAULT_FOLDED = ['remote-wsl', 'paper-os', 'love', 'local-workbench'];

/** localStorage key holding the folded id list (absent = never chosen). */
const STORAGE_KEY = `${NS}:folded:v1`;

/**
 * One-time marker for profiles that stored a folded set before the workbench
 * panel existed. A stored set suppresses every later DEFAULT_FOLDED addition,
 * so without this seed an upgrading profile would show the new panel in the
 * column while a fresh install would fold it. The seed runs once and is then
 * forgotten, so the user's own later unfold choice always wins.
 */
const WORKBENCH_SEED_KEY = `${NS}:seeded-local-workbench:v1`;

const DICTIONARY = {
  zh: {
    'pins.openGroup': '打开面板',
    'pins.foldGroup': '侧栏显示',
    'pins.shown': '现在显示在侧栏',
    'pins.folded': '现在收在「更多」里',
    'pins.fold': '收进「更多」',
    'pins.unfold': '显示在侧栏',
    'pins.reset': '全部显示在侧栏',
    'pins.empty': '侧栏还没有任何面板条目',
  },
  en: {
    'pins.openGroup': 'Open panel',
    'pins.foldGroup': 'Sidebar visibility',
    'pins.shown': 'Shown in the sidebar',
    'pins.folded': 'Folded into More',
    'pins.fold': 'Move into More',
    'pins.unfold': 'Show in the sidebar',
    'pins.reset': 'Show all in the sidebar',
    'pins.empty': 'No panel entries yet',
  },
};

/**
 * The host hands React and the menu primitives to the factory, but the
 * components below live at module scope so the factory body stays a thin
 * registration shim. Both bindings are assigned once, before any registration
 * can render.
 */
let React = null;
let primitives = null;

//#region folded store -------------------------------------------------------

/** Current folded ids, or null until `apply` seeds it. */
let folded = null;
const listeners = new Set();

/** Read the persisted folded set, seeding from DEFAULT_FOLDED on first run. */
function readFolded() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return new Set(DEFAULT_FOLDED);
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const set = new Set(parsed.filter((id) => typeof id === 'string'));
      // Read the marker separately: a blocked read still counts as "not seeded
      // yet", so the in-memory set below carries the new default this session.
      let seedNeeded = true;
      try {
        seedNeeded = localStorage.getItem(WORKBENCH_SEED_KEY) === null;
      } catch {
        /* treat unreadable storage as an unseeded profile */
      }
      if (seedNeeded) {
        if (!set.has('local-workbench')) set.add('local-workbench');
        try {
          localStorage.setItem(WORKBENCH_SEED_KEY, '1');
          localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
        } catch {
          /* storage blocked: the seeded set still applies for this session */
        }
      }
      return set;
    }
  } catch {
    /* unreadable or blocked storage: fall back to the shipped default */
  }
  return new Set(DEFAULT_FOLDED);
}

/** Persist and publish the next folded set. */
function writeFolded(next) {
  folded = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    // The first explicit choice consumes the one-time workbench seed: without
    // this, a fresh profile that unfolds the workbench would have it re-added
    // on the next boot, because no stored set existed when the seed check ran.
    if (localStorage.getItem(WORKBENCH_SEED_KEY) === null) {
      localStorage.setItem(WORKBENCH_SEED_KEY, '1');
    }
  } catch {
    /* storage full or blocked: the in-memory choice still applies this session */
  }
  for (const listener of [...listeners]) {
    try {
      listener();
    } catch {
      /* a broken subscriber must not stop the others */
    }
  }
}

/** Whether this panel currently lives in More instead of the column. */
function isFolded(id) {
  return folded === null ? false : folded.has(id);
}

/** Fold one panel into More, or bring it back to the column. */
function setFolded(id, value) {
  const next = new Set(folded ?? []);
  if (value) next.add(id);
  else next.delete(id);
  writeFolded(next);
}

//#endregion

//#region style tags ---------------------------------------------------------

/**
 * One <style> tag per concern. They are kept apart on purpose: the hiding rule
 * is rewritten on every sync, and an earlier revision wrote both concerns into
 * one tag, so syncing the rule erased the menu's own styles and the rows
 * rendered unstyled.
 */
const hideStyleTagId = `${NS}/folded.css`;
const uiStyleTagId = `${NS}/ui.css`;

/** Return the plugin's <style> tag for `tagId`, creating it on first use. */
function ensureStyleTag(tagId) {
  const existing = document.querySelector(`style[data-plugin-css=${JSON.stringify(tagId)}]`);
  if (existing !== null) return existing;
  const tag = document.createElement('style');
  tag.dataset.plugin = NS;
  tag.dataset.pluginCss = tagId;
  document.head.appendChild(tag);
  return tag;
}

/** Resolve the label a panellist registration projects into its row. */
function resolveLabel(options, id) {
  try {
    const label = options?.label;
    if (typeof label === 'function') {
      const value = label();
      if (typeof value === 'string' && value !== '') return value;
    } else if (typeof label === 'string' && label !== '') {
      return label;
    }
  } catch {
    /* a label thunk that throws must not break the sidebar */
  }
  return id;
}

/**
 * Hide the sidebar row of every folded panel.
 *
 * The row button carries the panel label as its accessible name and a
 * CSS-module class ending in `_panelRow` (the hash prefix changes per build, the
 * local name does not). It exposes no panel id, so the label is the only handle
 * the sidebar gives us.
 *
 * Two consequences shaped this function:
 *
 * 1. A label is not unique. Two panels may share one, and a CSS attribute
 *    selector cannot tell them apart, so a label-keyed rule would hide a panel
 *    the user never folded. Marking the exact DOM node avoids that.
 * 2. A label is arbitrary text. It may contain quotes, backslashes or newlines,
 *    and an unescaped newline inside a CSS string makes the browser drop the
 *    entire rule — which would silently un-hide everything. So the label is
 *    only ever used for a direct DOM comparison here, never substituted into a
 *    selector.
 *
 * The DOM pass runs after React commits, because the rows (and their labels,
 * which are locale-aware thunks) are re-projected on every locale change.
 */
const HIDDEN_FLAG = 'data-sidebar-pins-hidden';

/** Mark exactly the folded rows, and clear the mark from every other row. */
function syncHiddenRows(ctx) {
  if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') return;
  const entries = ctx.slots.entriesOfSlot('sidebar.panellist');

  // Ordered [label, folded] pairs; the sidebar renders rows in this same order.
  const wanted = entries.map((entry) => ({
    label: resolveLabel(entry.options, entry.options?.id),
    folded: isFolded(entry.options?.id),
  }));

  const rows = document.querySelectorAll('button[class*="_panelRow"]');
  /** Labels still available per pass, so duplicates pair up in order. */
  const pending = new Map();
  for (const item of wanted) {
    if (!pending.has(item.label)) pending.set(item.label, []);
    pending.get(item.label).push(item.folded);
  }

  for (const row of rows) {
    const label = row.getAttribute('aria-label');
    const queue = pending.get(label);
    // Only rows the sidebar itself renders for a panellist are candidates; the
    // More button carries no aria-label match and is skipped by the queue miss.
    if (!queue || queue.length === 0) {
      row.removeAttribute(HIDDEN_FLAG);
      continue;
    }
    const foldedHere = queue.shift();
    if (foldedHere) row.setAttribute(HIDDEN_FLAG, 'true');
    else row.removeAttribute(HIDDEN_FLAG);
  }

  // One static rule keyed on the flag this function owns, so the label text
  // never reaches CSS.
  ensureStyleTag(hideStyleTagId).textContent =
    `button[class*="_panelRow"][${HIDDEN_FLAG}]{display:none!important}`;
}

//#endregion

//#region presentation -------------------------------------------------------

/** Subscribe a component to folded-set changes. */
function useFoldedSet() {
  const [snapshot, setSnapshot] = React.useState(() => folded ?? new Set());
  React.useEffect(() => {
    const listener = () => setSnapshot(folded ?? new Set());
    listeners.add(listener);
    listener();
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return snapshot;
}

/**
 * One "open this panel" row, in the host's own menu idiom.
 *
 * @param props - entry (id/label/active), whether it is folded, and the
 *   owner-supplied open/dismiss callbacks.
 */
function OpenPanelRow({ entry, folded: isFoldedRow, onOpen, onDismiss, t }) {
  const PinIcon = isFoldedRow ? primitives.IconPinOutlineRegular : primitives.IconPinFillRegular;
  return React.createElement(primitives.MenuItemButton, {
    icon: React.createElement(PinIcon, { size: 16 }),
    // `current` is the host's only "this is the active one" mark (a check glyph).
    // MenuItemButton accepts no title/tooltip prop, so state is expressed through
    // the icon and the group it sits in rather than a discarded attribute.
    current: entry.active === true,
    onSelect: () => {
      onDismiss();
      onOpen(entry.id);
    },
    children: entry.label,
  });
}

/**
 * One "show in sidebar / fold into More" row, in the host's own menu idiom.
 *
 * @param props - entry (id/label), whether it is folded, and the toggle.
 */
function FoldPanelRow({ entry, folded: isFoldedRow, onToggle, t }) {
  const shown = !isFoldedRow;
  const PinIcon = shown ? primitives.IconPinFillRegular : primitives.IconPinOutlineRegular;
  return React.createElement(primitives.MenuItemButton, {
    icon: React.createElement(PinIcon, { size: 16 }),
    // A check mark reads as "this one shows in the sidebar".
    current: shown,
    onSelect: () => {
      onToggle(entry.id);
    },
    children: `${entry.label} — ${shown ? t('pins.fold') : t('pins.unfold')}`,
  });
}

/**
 * Menu body: an open group, a visibility group, and a reset.
 *
 * Splitting the two actions into separate rows (instead of nesting a toggle
 * button inside an open button) keeps every row a single host MenuItemButton —
 * one action per row, which is the shape the shipped menus use.
 *
 * @param props - owner-supplied props of `sidebar.panellist.actions`.
 */
function SidebarPinsMenu({ entries, onOpen, onPinnedChange, onDismiss, t }) {
  const foldedSet = useFoldedSet();
  const list = Array.isArray(entries) ? entries : [];

  /** Fold/unfold one panel, keeping the host's own pin store in step. */
  const toggle = (id) => {
    // Read the live store, not the render snapshot: two quick clicks must not
    // both compute from the same stale value.
    const nextFolded = !isFolded(id);
    setFolded(id, nextFolded);
    try {
      onPinnedChange(id, !nextFolded);
    } catch {
      /* a sidebar that refuses the update must not lose our own state */
    }
  };

  if (list.length === 0) {
    return React.createElement('div', { className: 'dsh-sidebar-pins-empty' }, t('pins.empty'));
  }

  // Offer the reset only while a folded panel is actually listed here: a stored
  // id whose plugin is not mounted has no row to restore, and a reset under an
  // empty menu would be a dead control.
  const foldedListed = list.filter((entry) => isFolded(entry.id));

  return React.createElement(React.Fragment, null, [
    React.createElement(
      primitives.MenuGroup,
      { key: 'open', label: t('pins.openGroup') },
      list.map((entry) =>
        React.createElement(OpenPanelRow, {
          key: entry.id,
          entry,
          folded: foldedSet.has(entry.id),
          onOpen,
          onDismiss,
          t,
        }),
      ),
    ),
    React.createElement(
      primitives.MenuGroup,
      { key: 'fold', label: t('pins.foldGroup') },
      [
        ...list.map((entry) =>
          React.createElement(FoldPanelRow, {
            key: entry.id,
            entry,
            folded: foldedSet.has(entry.id),
            onToggle: toggle,
            t,
          }),
        ),
        foldedListed.length > 0
          ? React.createElement(primitives.MenuItemButton, {
              key: 'reset',
              icon: React.createElement(primitives.IconSlidersTwoOutlineRegular, { size: 16 }),
              onSelect: () => {
                // Live set: restore exactly what is folded now.
                for (const id of [...(folded ?? [])]) {
                  setFolded(id, false);
                  try {
                    onPinnedChange(id, true);
                  } catch {
                    /* see above */
                  }
                }
              },
              children: t('pins.reset'),
            })
          : null,
      ],
    ),
  ]);
}

/** Only the bits the host atoms do not already style: the empty state. */
const CSS = `
.dsh-sidebar-pins-empty{margin:0;padding:8px 10px;color:var(--dsw-alias-label-caption);font-size:12px}
`;

//#endregion

window.__ModuleLoader__.load({
  id: NS,
  factory(require) {
    React = require('react');
    primitives = require('@deepseek-ai/dsh-client-ui-primitives');
    ensureStyleTag(uiStyleTagId).textContent = CSS;
    return {
      name: NS,
      inject: ['slots', 'locale'],
      apply(ctx) {
        const t = ctx.locale.bind(NS);
        ctx.effect(() => ctx.locale.register(NS, 'zh', DICTIONARY.zh), `${NS}: zh dictionary`);
        ctx.effect(() => ctx.locale.register(NS, 'en', DICTIONARY.en), `${NS}: en dictionary`);

        // Seed the persisted set, then keep the hidden rows in step with it as
        // panellist registrations, the active locale, or the folded set change.
        folded = readFolded();

        /**
         * Re-apply the hidden flags, then once more after the rows exist.
         *
         * Registration and rendering are not synchronous: when this runs at boot
         * (or right after a slot change) the sidebar may not have committed the
         * matching row yet, so the DOM pass would miss it and that panel would
         * stay visible. Re-running on the next frame — and after a short delay,
         * which covers panels whose client half loads late — closes that gap.
         * The extra passes are idempotent: the pass clears flags it does not
         * want, so a settled DOM costs one attribute scan and nothing else.
         */
        let pendingPasses = null;
        const sync = () => {
          try {
            syncHiddenRows(ctx);
          } catch {
            /* a registry that is momentarily empty must not throw at boot */
          }
        };
        const scheduleSettle = () => {
          if (pendingPasses !== null) {
            for (const cancel of pendingPasses) cancel();
          }
          const cancels = [];
          if (typeof requestAnimationFrame === 'function') {
            const id = requestAnimationFrame(() => sync());
            cancels.push(() => cancelAnimationFrame(id));
          }
          if (typeof setTimeout === 'function') {
            const timer = setTimeout(() => sync(), 250);
            cancels.push(() => clearTimeout(timer));
          }
          pendingPasses = cancels;
        };
        /** Run the pass now and again once the DOM settles. */
        const syncAndSettle = () => {
          sync();
          scheduleSettle();
        };

        ctx.effect(() => {
          syncAndSettle();
          listeners.add(sync);
          const offSlots = ctx.slots.subscribe('sidebar.panellist', syncAndSettle);
          const offLocale = ctx.locale.subscribe(syncAndSettle);
          return () => {
            listeners.delete(sync);
            if (pendingPasses !== null) {
              for (const cancel of pendingPasses) cancel();
              pendingPasses = null;
            }
            if (typeof offSlots === 'function') offSlots();
            if (typeof offLocale === 'function') offLocale();
          };
        }, `${NS}: hide folded sidebar rows`);

        ctx.effect(
          () =>
            ctx.slots.inject('sidebar.panellist.actions', () =>
              ctx.slots.register(
                {
                  name: 'sidebar.panellist.actions',
                  id: NS,
                  order: 10,
                  locale: NS,
                },
                (props) => React.createElement(SidebarPinsMenu, { ...props, t }),
              ),
            ),
          `${NS}: sidebar More menu rows`,
        );
      },
    };
  },
});
})();
