# Changelog

## 0.1.1

- 修误报：缺图标不再算 `meta.manifest-mismatch` P1。宿主 `dsh-host-plugin-inventory` 把 `icon` 标为 **可选**（来自 manifest icon 或 `exports["<specifier>/icon"]`），缺图标只让 Plugin Manager 少一张图，不会导致「装了没反应」。
  - 新增 `meta.icon`（core，P3）：没有图标是**顺手**级建议，文案与严重度对齐真实后果。
  - `package.json` 声明了图标但文件缺失/无效时，该条按 P2 记账（清单指了个不存在的文件，是真不一致，但不拦加载）。
  - `meta.manifest-mismatch` 收窄为结构性问题（package/patch/client export），保持 P1。
- `RULES_VERSION` 1 → 2（规则集变化）。
- 47 条检查：core 37 + deep 10。

## 0.1.0

- 命名：**爱 / Love**——爱是出发点，`love_review` 是方法；不再用「以爱」这种把爱当手段的读法。
- TypeScript host + React client, built with esbuild; Vitest suite.
- 46 checks across backend, frontend, UI, UX, performance and AI era.
- Sidebar panel with six dimensions, performance budgets and history.
- `love_review` tool and `/api/love/*` routes.
- Three-tier citation discipline (`read` / `metadata` / `candidate`) and a citation gate.
