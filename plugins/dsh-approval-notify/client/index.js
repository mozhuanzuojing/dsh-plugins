/**
 * dsh-approval-notify —— client half.
 *
 * Why here
 * --------
 * An approval is a renderer-side interaction: `@deepseek-ai/dsh-client-ui-approval`
 * intercepts the remote event `approval/request` and renders the composer
 * takeover. The desktop main process has no notification code (it never
 * constructs an Electron `Notification`), so the renderer is both the only place
 * that learns an approval is waiting and the only place that can reach the OS
 * notification API.
 *
 * What it does
 * ------------
 * Registers a second middleware on `approval/request`, shows a desktop
 * notification when the window is not in front, and passes the request straight
 * down the chain with `next(request)`. It never answers, defers or reorders the
 * approval — the shipped UI still owns that. Notification failure is caught and
 * logged once: an approval must never be lost because a toast could not be shown.
 *
 * Deliberately no notification while the window is focused — the prompt is
 * already on screen, and a toast on top of it is noise.
 */

const NS = 'dsh-approval-notify';

const DICTIONARY = {
  zh: {
    'notify.title': 'DSH 正在等待审批',
    'notify.fallbackReason': '有一个操作需要你确认',
    'notify.denied': '审批通知：系统通知权限被拒绝，无法弹出通知',
    'notify.unsupported': '审批通知：当前环境不支持系统通知',
  },
  en: {
    'notify.title': 'DSH is waiting for an approval',
    'notify.fallbackReason': 'An action needs your confirmation',
    'notify.denied': 'Approval notifications: notification permission is denied',
    'notify.unsupported': 'Approval notifications: this environment has no system notifications',
  },
};

/**
 * Requests already notified, by object identity.
 *
 * The host dispatches an approval as
 * `ctx.waterfall(target, 'approval/request', req, …)`, where `req` carries only
 * `{ agent, toolName, callId?, reason?, signal? }` — there is no `key` and no
 * `id` on it (the audit `id` is a local variable inside `approval.request()`).
 * A dedupe key built from request DATA therefore degrades to `callId ?? reason`,
 * and two ordinary distinct approvals sharing a reason string (the same tool
 * asking twice) would collapse into one notification — the exact missed approval
 * this plugin exists to prevent.
 *
 * Object identity is the honest key: one dispatch is one object, a fresh
 * approval is a fresh object. A WeakSet also lets answered requests be collected
 * instead of accumulating for the life of the session.
 */
const notified = new WeakSet();

/** Warn about a permanently unavailable channel once, not on every approval. */
let warned = null;

/** Monotonic per-dispatch counter, used only to give each toast a distinct tag. */
let toastSeq = 0;

/**
 * Whether the window is out of sight, which is the only case worth a toast.
 *
 * Electron hides a backgrounded window's visibility state only when it is
 * minimised; a merely unfocused window stays "visible". Both cases count, so
 * both signals are checked. If neither API exists, assume unfocused: a redundant
 * toast is better than a missed approval.
 *
 * @returns true when a notification should be raised
 */
function windowIsOutOfSight() {
  try {
    if (typeof document !== 'undefined' && typeof document.hasFocus === 'function') {
      if (document.hasFocus()) return false;
    } else if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      return false;
    }
    return true;
  } catch {
    return true;
  }
}

/**
 * The notification body: what is asking, and why.
 *
 * `toolName` is always present on the host request while `reason` is optional,
 * so the tool name leads and the reason follows when there is one. Without the
 * tool name the toast just says "an approval is pending", which forces the user
 * to switch windows to find out what — defeating the point of notifying.
 *
 * @param request - the approval request payload
 * @param t - locale lookup for this plugin's namespace
 * @returns the body text for the notification
 */
function describeRequest(request, t) {
  const tool = typeof request?.toolName === 'string' ? request.toolName.trim() : '';
  // Only the fields the host actually puts on the request are read here:
  // `toolName` (always) and `reason` (optional). `displayReason` exists on the
  // CLIENT's PendingApproval, not on the request dispatched to the waterfall.
  const reason = typeof request?.reason === 'string' ? request.reason.trim() : '';
  if (tool !== '' && reason !== '') return `${tool} · ${reason}`;
  if (tool !== '') return `${tool} · ${t('notify.fallbackReason')}`;
  if (reason !== '') return reason;
  return t('notify.fallbackReason');
}

/**
 * Show the notification for one approval.
 *
 * @param request - the approval request payload
 * @param t - locale lookup for this plugin's namespace
 */
function notifyApproval(request, t) {
  // Identity dedupe: the same dispatch must not produce a burst, while a new
  // approval carrying an identical reason still notifies (see the WeakSet note).
  if (request !== null && typeof request === 'object') {
    if (notified.has(request)) return;
    notified.add(request);
  }

  if (typeof Notification !== 'function') {
    if (warned !== 'unsupported') {
      warned = 'unsupported';
      console.warn(t('notify.unsupported'));
    }
    return;
  }
  if (Notification.permission === 'denied') {
    if (warned !== 'denied') {
      warned = 'denied';
      console.warn(t('notify.denied'));
    }
    return;
  }

  const toast = new Notification(t('notify.title'), {
    body: describeRequest(request, t),
    // One tag per approval dispatch; the tag only collapses a re-shown toast.
    tag: `${NS}:${toastSeq += 1}`,
    // Let the OS keep it around until the user deals with it; an approval that
    // auto-vanishes is the thing this plugin exists to prevent.
    requireInteraction: true,
  });
  toast.onclick = () => {
    try {
      window.focus();
      toast.close();
    } catch {
      /* focus is best-effort; the notification was still delivered */
    }
  };
}

window.__ModuleLoader__.load({
  id: NS,
  factory() {
    return {
      name: NS,
      inject: ['remote', 'locale'],
      apply(ctx) {
        const t = ctx.locale.bind(NS);
        ctx.effect(() => ctx.locale.register(NS, 'zh', DICTIONARY.zh), `${NS}: zh dictionary`);
        ctx.effect(() => ctx.locale.register(NS, 'en', DICTIONARY.en), `${NS}: en dictionary`);

        ctx.effect(
          () =>
            ctx.remote.$on('approval/request', (request, next) => {
              // Notify first, then hand the request down untouched. Anything
              // thrown here would stall the approval, so it is contained.
              try {
                if (windowIsOutOfSight()) notifyApproval(request, t);
              } catch (error) {
                console.warn(`${NS}: approval notification failed`, error);
              }
              return typeof next === 'function' ? next(request) : undefined;
            }),
          `${NS}: approval notifications`,
        );
      },
    };
  },
});
