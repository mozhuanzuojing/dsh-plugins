/**
 * dsh-approval-notify —— host half.
 *
 * The approval prompt is a browser-side interaction: `@deepseek-ai/dsh-client-ui-approval`
 * intercepts the remote event `approval/request` and renders the composer takeover.
 * The host shell has no notification code of its own (the desktop main process
 * never constructs an Electron `Notification`), so the only place that knows an
 * approval is waiting — and the only place that can reach the OS notification
 * API — is the renderer.
 *
 * This package therefore adds no host behaviour: it exists so the bundle layer can
 * mount the client half. The plugin logic is entirely in `client/index.js`.
 */
export const name = 'dsh-approval-notify'

/** No host services are required: the package is browser-only. */
export const inject = []

export function apply() {}
