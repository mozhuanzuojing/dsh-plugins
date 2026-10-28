# dsh-approval-notify

DSH 等待审批时弹**系统通知**，切到别的窗口也不会漏掉待审批提示。

## 它解决什么

DSH 的审批提示只在窗口里显示（`@deepseek-ai/dsh-client-ui-approval` 接管输入框区域）。人在别的窗口时，这个提示没有任何声音或通知，容易一直卡着。

## 怎么做的（依据，不是猜）

- 审批是以远端事件 `approval/request` 下发的，转发模式在 `@deepseek-ai/dsh-api-remotes` 里声明为 **`waterfall`**（`{ event: "approval/request", mode: "waterfall" }`），即多个处理器按注册顺序逐级 `next`。所以旁挂一个处理器不会覆盖官方 UI 的处理器。
- 该事件同时在 `ctx.remote.$on` 的允许键集（`API_REMOTE_FORWARDED_EVENTS`）内，第三方插件可以订阅。
- 桌面主进程没有任何通知实现（全仓扫描 `new Notification` / `showNotification` 命中 0），所以通知只能在渲染进程发——这也是唯一知道「审批在等」的地方。

插件注册 `approval/request` 的中间件：窗口不在前台时弹一条 `Notification`，然后原样 `next(request)` 把请求交给官方 UI。**不回答、不延迟、不改变审批顺序。**

## 行为细节

| 场景 | 行为 |
|---|---|
| 窗口不在前台（失焦或最小化） | 弹通知，携带审批理由；`requireInteraction: true`，不会自动消失 |
| 窗口在前台 | 不弹（提示已经在屏幕上，再弹是噪音） |
| 点击通知 | 聚焦 DSH 窗口并关闭该通知 |
| 通知正文 | `工具名 · 理由`；理由可缺省，工具名一定在 |
| 同一次审批重复事件 | 按**请求对象身份**去重（`WeakSet`），只弹一次 |
| 两个不同的审批、理由相同 | **各弹一次**（不会互相吞掉） |
| 通知抛错 | 吞掉并 `console.warn`，**审批照常继续**（绝不因通知失败卡住审批） |
| 权限被拒 / 环境不支持 | 不弹，但只警告一次（不静默失败） |

## 安装

```jsonc
// ~/.dsh/profiles/<profile>/package.json
"dependencies": { "dsh-approval-notify": "link:D:/path/to/dsh-plugins/plugins/dsh-approval-notify" }
// dsh.profile.bundles 末尾追加
"dsh-approval-notify"
```

```powershell
dsh plugin --profile <profile> install
```

重启 DeepSeek Harness 生效。

## 验证

```powershell
node --check client/index.js
node _verify/notify.test.mjs                 # 14 条行为断言
node _verify/review-probes.mjs               # 5 条对抗探针（对着真实宿主契约）
pwsh -NoProfile -File _verify/mutation.ps1   # 6 条变异，必须全 KILLED
```

测试不需要 React（本插件不渲染 UI）。覆盖：注册形状、请求原样下传并返回 `next()` 结果、失焦才弹、按对象身份去重、**通知抛错时审批仍继续**、权限拒绝与不支持时的降级、正文带工具名。

## 审查记录（2026-10-28）

静态审查工具给 100 分，但按宿主真实契约写的对抗探针确认了 4 个缺陷，均已修复并补回归：

1. **会漏通知（功能缺陷）** —— 原实现按请求数据去重（`key ?? callId ?? reason`）。但宿主 `approval/request` 的载荷是 `req`，只有 `{ agent, toolName, callId?, reason?, signal? }`，**没有 `key` 也没有 `id`**（审计 `id` 是 `approval.request()` 的局部变量）。于是键退化成 `reason`：同一工具连续两次审批若理由文字相同，第二次被完全吞掉——正是本插件要防的场景。改为按请求对象身份去重。
2. **无界增长** —— 去重集合只增不减，长会话会一直累积。换成 `WeakSet`，已处理的请求可被回收。
3. **正文不说明是谁在问** —— `toolName` 是宿主请求上必定存在的字段，原来没用上，通知只说「有操作待确认」，用户仍得切回窗口才知道要批什么。
4. **一个未验证的死分支** —— 原代码优先读 `displayReason`，但那是**客户端** `PendingApproval` 的字段，不在下发给 waterfall 的请求上，永远取不到。已删除。

变异测试新增两条（`dedupe-by-data`、`body-without-tool`）专门编码第 1、3 条，防止回退。

## 已知边界

- **通知是否真的出现在 Windows 通知中心，未在本机实机验证**（需要真实触发一次审批）。逻辑层已用断言覆盖，权限与降级路径也覆盖了。
- 点击通知时调用 `window.focus()`；在 Electron 里这未必能把 OS 窗口提到最前（提窗要走主进程 `BrowserWindow.focus()`），所以「点击聚焦」可能只是把焦点给回渲染进程。
- `requireInteraction: true` 在 Windows 上可能被系统忽略，通知仍会自动消失。
- 浏览器里打开 Web UI 时，需要你对站点授予通知权限；Electron 桌面端通常直接可用。
- 「是否在前台」用 `document.hasFocus()` 判断；某些系统上窗口被完全遮挡但仍有焦点时可能不弹（此时提示本来也在可见区域内）。
