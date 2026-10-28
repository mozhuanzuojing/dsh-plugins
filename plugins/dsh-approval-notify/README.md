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
| 同一次审批重复事件 | 按 `key`/`callId` 去重，只弹一次 |
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
node _verify/notify.test.mjs          # 11 条行为断言
pwsh -NoProfile -File _verify/mutation.ps1   # 4 条变异，必须全 KILLED
```

测试不需要 React（本插件不渲染 UI）。覆盖：注册形状、请求原样下传并返回 `next()` 结果、失焦才弹、同审批去重、**通知抛错时审批仍继续**、权限拒绝与不支持时的降级。

## 已知边界

- **通知是否真的出现在 Windows 通知中心，未在本机实机验证**（需要真实触发一次审批）。逻辑层已用断言覆盖，权限与降级路径也覆盖了。
- 浏览器里打开 Web UI 时，需要你对站点授予通知权限；Electron 桌面端通常直接可用。
- 「是否在前台」用 `document.hasFocus()` 判断；某些系统上窗口被完全遮挡但仍有焦点时可能不弹（此时提示本来也在可见区域内）。
