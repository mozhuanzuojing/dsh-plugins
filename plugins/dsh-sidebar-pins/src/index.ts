/**
 * dsh-sidebar-pins —— host half.
 *
 * The sidebar's global panel rows are declared by each feature plugin into the
 * root-scoped `sidebar.panellist` list (ui-sidebar renders one row per
 * registration). Whether a row shows in the column is the sidebar's own
 * in-memory `unpinned` snapshot, and its own More menu ships without any row
 * that calls `onPinnedChange` — so out of the box there is no way to fold a
 * panel entry into More.
 *
 * This package adds no host behaviour of its own. The client half registers a
 * second occupant into `sidebar.panellist.actions` (documented extension point:
 * "Pin callbacks remain available to other registrations"), lists every panel
 * row there, and toggles the pin through the owner-supplied `onPinnedChange`.
 */
export const name = 'dsh-sidebar-pins'

/** No host services are required: the package is browser-only. */
export const inject = []

export function apply() {}
