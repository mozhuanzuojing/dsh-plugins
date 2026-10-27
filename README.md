# dsh-plugins

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 插件集合。每个插件一个子目录，可单独安装。

## 本仓库的插件

| 插件 | 一句话 | 版本 |
|---|---|---|
| [dsh-sidebar-pins](plugins/dsh-sidebar-pins/) | 把左侧栏的全局面板条目收进「更多」菜单，逐项控制归属，选择会被记住 | 0.1.0 |
| [dsh-plugin-love](plugins/dsh-plugin-love/) | 「爱」：读第三方 DSH 插件源码，按后端/前端/UI/UX/性能/AI 时代六维给出带证据的审查（工具 `love_review`） | 0.1.1 |

两个插件都是 **bundle 形态**，装法相同（见下）。各自的配置项、设计边界与已知限制写在各自目录的 README 里。

| 插件 | 平台 | 额外要求 |
|---|---|---|
| dsh-sidebar-pins | 任意 | 无 |
| dsh-plugin-love | 任意 | 无（构建/测试需要 `pnpm install`） |

## 独立仓库的插件

这些插件有自己的仓库与发布历史，**不在本仓库内**，请到各自仓库获取：

| 插件 | 仓库 | 一句话 |
|---|---|---|
| dsh-remote-wsl | [mozhuanzuojing/dsh-remote-wsl](https://github.com/mozhuanzuojing/dsh-remote-wsl) | 把 WSL 发行版当作远端执行宿主：状态、终端、常驻 agent、Web UI 窗口、桌面版本对齐（**仅 Windows 宿主 + WSL2**） |

## 安装某个插件

以 `dsh-sidebar-pins` 为例（其它插件同理，替换目录名即可）。

**1. 让 profile 认识这个包** —— 编辑 `~/.dsh/profiles/<profile>/package.json`，在 `dependencies` 里加一条：

```json
"dsh-sidebar-pins": "link:D:/path/to/dsh-plugins/plugins/dsh-sidebar-pins"
```

**2. 把它加进 bundle 列表** —— 同一个文件里的 `dsh.profile.bundles` 末尾追加：

```json
"dsh-sidebar-pins"
```

**3. 用官方 CLI 安装依赖**（不要手改 `node_modules`）：

```powershell
dsh plugin --profile <profile> install
```

**4. 重启 DeepSeek Harness** 生效。

Windows 上 `link:` 需要目录联接（Junction）已存在时才能解析；若启动日志报 `cannot resolve profile bundle`，先建联接再重跑第 3 步：

```powershell
New-Item -ItemType Junction -Path "$env:USERPROFILE\.dsh\profiles\<profile>\node_modules\dsh-sidebar-pins" -Target "D:\path\to\dsh-plugins\plugins\dsh-sidebar-pins"
```

## 开发约定

- 插件是 **bundle 形态**：`package.json` 声明 `dsh.bundle.patch` 与 `dsh.client`，宿主据此挂载并分发客户端半。
- 客户端半（`client/index.js`）是手写的 lazy-CJS bundle，形状固定为 `window.__ModuleLoader__.load({ id, factory })`；不引入构建步骤，也不写 JSX。
- 界面文本走宿主 locale 服务；菜单行复用宿主 `@deepseek-ai/dsh-client-ui-primitives` 的原语，不自己画按钮。
- 每个插件自带 `_verify/`：行为回归、对抗探针、变异测试。三个都必须绿。

## 许可

[MIT](LICENSE)
