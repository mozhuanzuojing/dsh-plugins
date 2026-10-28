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

/** Keys already notified, so one approval never produces a burst of toasts. */
const notified = new Set();

/** Warn about a permanently unavailable channel once, not on every approval. */
let warned = null;

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
 * Stable identity for one approval, so dedupe works across repeated events.
 *
 * @param request - the approval request payload
 * @returns a key usable in a Set
 */
function approvalKey(request) {
  if (request === null || typeof request !== 'object') return String(request);
  return String(request.key ?? request.callId ?? request.id ?? request.reason ?? 'unknown');
}

/**
 * Show the notification for one approval.
 *
 * @param request - the approval request payload
 * @param t - locale lookup for this plugin's namespace
 */
function notifyApproval(request, t) {
  const key = approvalKey(request);
  if (notified.has(key)) return;
  notified.add(key);

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

  const reason =
    typeof request?.displayReason === 'string' && request.displayReason !== ''
      ? request.displayReason
      : typeof request?.reason === 'string' && request.reason !== ''
        ? request.reason
        : t('notify.fallbackReason');

  const toast = new Notification(t('notify.title'), {
    body: reason,
    tag: `${NS}:${key}`,
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
