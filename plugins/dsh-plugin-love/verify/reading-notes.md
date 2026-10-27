# 引用阅读记录（`read` 层）

> 规则：只有这里记录过「逐字摘录 + 定位」的来源，才允许绑定到 finding。
> 只核验了标题/作者/年份的，状态是 `metadata`，只能进附录，不能挂规则。
> 未核验的是 `candidate`，不出现。

## 已读

### DSH 插件开发规范（本地，`cordis-plugin-development`）

- `references/host-plugin.md` · “Host plugin export forms”
  > Register every resource inside `apply` with `ctx.effect` or `ctx.on` and return its cleanup.
- `references/ui-plugin.md` · “Client module”
  > Route visible UI text through the Client locale service.
- `references/ui-plugin.md` · “Client module”
  > Do not replace the app root or append a second application to `document.body`.
- `references/ui-plugin.md` · “Client module”
  > React comes from the browser module table; no duplicate React installation, CDN script, or UMD search is needed.
- `references/practices.md` · “UI”
  > Do not serve an HTML page from the Host and embed it in an iframe: an iframe document does not receive the host's theme tokens, light/dark switching, or `ctx.locale`.
- `references/practices.md` · “UI”
  > Do not write DOM outside your component or append to `document.body`.

### React

- <https://react.dev/learn/synchronizing-with-effects> · “Step 3: Add cleanup if needed”
  > Some Effects need to specify how to stop, undo, or clean up whatever they were doing. For example, "connect" needs "disconnect", "subscribe" needs "unsubscribe", and "fetch" needs either "cancel" or "ignore".
- <https://react.dev/reference/react/useEffect> · “Reference”
  > The cleanup function runs when the component unmounts, and before every re-run of the Effect.

### WCAG 2.2 Understanding（W3C，已读正文）

- <https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html> · SC 1.4.1
  > Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.
- <https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html> · SC 1.4.3
  > The visual presentation of text and images of text has a contrast ratio of at least 4.5:1 ... Large-scale text and images of large-scale text have a contrast ratio of at least 3:1.
- <https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html> · SC 2.1.1
  > All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes.
- <https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html> · SC 2.3.3
  > Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed.
- <https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html> · SC 2.4.7
  > Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.
- <https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html> · SC 2.5.7
  > All functionality that uses a dragging movement for operation can be achieved by a single pointer without dragging, unless dragging is essential.
- <https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html> · SC 2.5.8
  > The size of the target for pointer inputs is at least 24 by 24 CSS pixels.
- <https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html> · SC 3.3.1
  > If an input error is automatically detected, the item that is in error is identified and the error is described to the user in text.

### OWASP Cheat Sheet Series（已读具体页）

- <https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.md> · “Primary Defenses > Defense Option 1”
  > The primary defense is to avoid calling OS commands directly. Built-in library functions are a very good alternative to OS Commands.
- <https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.md> · “Layer 2”
  > Do not interpolate an unquoted value into a shell command.
- <https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/cheatsheets/Secrets_Management_Cheat_Sheet.md> · “1 Introduction”
  > Many organizations have them hardcoded within the source code in plaintext, littered throughout configuration files and configuration management tools.
- <https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/cheatsheets/Input_Validation_Cheat_Sheet.md> · “Parse Safely, Then Validate”
  > Apply request size limits before buffering or parsing input, and configure parser limits such as maximum nesting depth.

### 论文摘要级（只读摘要，规则措辞不超出摘要）

- <https://arxiv.org/abs/2302.12173> · Abstract
  > We reveal new attack vectors, using Indirect Prompt Injection, that enable adversaries to remotely ... exploit LLM-integrated applications by strategically injecting prompts into data likely to be retrieved.

## 只核验了书目（`metadata`，不得挂规则）

- Amershi et al., *Guidelines for Human-AI Interaction*, CHI 2019, DOI `10.1145/3290605.3300233`
- Liu et al., *Lost in the Middle*, arXiv:2307.03172（TACL 2023）
- Sculley et al., *Hidden Technical Debt in Machine Learning Systems*, NeurIPS 2015
- Horvitz, *Principles of Mixed-Initiative User Interfaces*, CHI 1999, DOI `10.1145/302979.303030`
- Sweller, *Cognitive Load During Problem Solving*, 1988, DOI `10.1207/s15516709cog1202_4`
- Zamfirescu-Pereira et al., *Why Johnny Can't Prompt*, CHI 2023, DOI `10.1145/3544548.3581388`
- Shneiderman, *Human-Centered AI*, arXiv:2002.04087
- Fitts, *The information capacity of the human motor system*, 1954, DOI `10.1037/h0055392`
  - 注：`10.1037/h0061266` 是 Tiffin & Asher 的 Purdue Pegboard（1948），不是 Fitts。

## 未核验（`candidate`，不出现）

- `goldbergyoni/nodebestpractices`
- `modelcontextprotocol/modelcontextprotocol`
- `web.dev/Chrome` 性能预算文档
- Nielsen Norman Group 十原则
- MDN ARIA

## 结论

- 有 `read` 依据的规则：DSH 结构/生命周期、React cleanup/abort、WCAG 对比度/焦点/目标/动效/键盘/拖拽/错误识别、OWASP 命令注入/密钥、间接提示注入。
- 其余规则一律 `basis: experience`，报告标「工程判断，无外部引用」。
- 性能阈值是产品预算，不挂论文。
