# dsh-sidebar-pins

把左侧栏的全局面板条目收进「更多」菜单：逐项决定谁留在侧栏，选择会被记住，面板本身始终可点开。

## 为什么需要它（而不是改配置）

宿主 `@deepseek-ai/dsh-client-ui-sidebar` 的侧栏条目由 `sidebar.panellist` 渲染，「更多」菜单由 `sidebar.panellist.actions` 渲染。宿主预留了把条目收进「更多」的能力（`onPinnedChange` → 内部 `unpinned` 快照），但出厂的「更多」菜单只画「浏览更多插件」「创建你的插件」，没有任何控件调用它；且 `unpinned` 是纯内存状态，唯一写入口只在菜单展开时挂载，因此**启动时无法通过宿主 API 预设折叠**。官方 README 亦明确写「More menus provide no visibility controls」。所以只能作为第三方注册项，往那个官方扩展点添加。

## 它做什么

- 自己保存折叠集合（`localStorage`，键 `dsh-sidebar-pins:folded:v1`）；首次运行用 `DEFAULT_FOLDED`（`remote-wsl`、`paper-os`、`love`、`local-workbench`）。
  - 已存过折叠集合的老 profile 不会自动获得后加的默认项，所以升级时有一次性的 `seeded-local-workbench:v1` 迁移：把 `local-workbench` 并入已存集合并立刻落盘；之后用户的「显示在侧栏」选择照常生效。
- 给匹配的侧栏行打标记 `data-sidebar-pins-hidden`，由一条静态 CSS 规则隐藏。**标签文本不进入 CSS**。
- 在「更多」里提供两个分组：「打开面板」与「侧栏显示」；每行一个动作（宿主 `MenuItemButton`）。
- 切换时同步调用宿主 `onPinnedChange`，让宿主自身的过滤与本插件在本次会话内保持一致。

## 已知设计边界

| 项 | 现状 | 原因 |
|---|---|---|
| 默认折叠集合 | 写死四个 id | 宿主未提供「默认收起」配置位 |
| 新装侧栏插件 | 不会自动收进「更多」 | 同上；需手动点一次，之后记住 |
| 选择持久化 | 本插件 localStorage | 宿主 `unpinned` 不持久化（官方如此） |
| 行定位方式 | 打标记 + aria-label 配对 | 侧栏行 DOM 不暴露 panel id |
| 依赖 DOM 结构 | `button[class*="_panelRow"]` | CSS Module 哈希前缀会变，局部名不变 |

`_panelRow` 与 `data-slot="sidebar.panellist"` 的用法已核对：`_panelRow` 仅 `ui-sidebar` 使用，选择器作用域安全。

## 开发与验证

```powershell
# 语法
node --check client/index.js

# 行为回归（真实 React 渲染 + 真实 handler 调用）
node _verify/render.test.mjs

# 对抗式探针（每条对应一个审查怀疑点；失败即确认缺陷）
node _verify/review-probes.mjs

# 变异测试（证明测试有防守力）
pwsh -NoProfile -File _verify/mutation.ps1
```

行为套件与探针需要 `react` / `react-dom`（本插件自身零运行时依赖，仅在验证时用）。默认在插件目录内解析；其它位置用 `DSH_REACT_HOME` 指一个有这两个包（或其 `node_modules`）的目录：

```powershell
$env:DSH_REACT_HOME = 'D:\path\to\dir-with-react'
node _verify/render.test.mjs
```

`mutation.ps1` 只在 Windows/pwsh 下可用（CI 跳过它，`test` 与 `test:probes` 在 Linux 上也跑）。

安装（官方 CLI，勿手改 node_modules）：

```powershell
dsh plugin --profile <profile> install
```

profile 的 `package.json` 需同时有两处：`dependencies` 里 `"dsh-sidebar-pins": "link:<abs path>"`，以及 `dsh.profile.bundles` 末尾追加 `"dsh-sidebar-pins"`。

## 审查记录（2026-10-27）

静态审查工具给 100 分，但人工逐行审查 + 对抗探针确认了 4 个真实缺陷，均已修复并补回归：

1. **重复标签会误隐藏** —— 原实现用 label 生成 CSS 属性选择器，两个同名面板中只折叠一个，另一个也被隐藏。改为 DOM 标记后按注册顺序配对。
2. **标签含换行会废掉整条规则** —— CSS 字符串内裸换行是解析错误，浏览器丢弃整条规则，导致所有折叠行重新显示。改为标签不进入 CSS。
3. **向 `MenuItemButton` 传了不存在的 `title` 参数** —— 死代码，提示从未显示。已移除。
4. **首屏同步早于行渲染** —— 浏览器实测 `remote-wsl` 漏标记（注册与渲染不同步）。补 `requestAnimationFrame` + 250ms 双次重试，幂等。

变异测试覆盖 6 条（开关方向、持久化、默认值、样式标签共用、清除标记、重试），全部可被杀。
