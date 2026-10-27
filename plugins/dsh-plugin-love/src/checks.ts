import { BUDGETS } from './constants.ts';
import { CITATIONS } from './knowledge.ts';
import { callBlocks, makeOccurrence, maskSecret, parseColor, contrastRatio, balancedBlock } from './util.ts';
import { filesOf } from './scan.ts';
import { inlineColorPairs, cssRules } from './analyze.ts';

function copy(zhTitle, enTitle, zhSummary, enSummary, zhWhy, enWhy, zhFix, enFix) {
  return {
    title: { zh: zhTitle, en: enTitle },
    summary: { zh: zhSummary, en: enSummary },
    why: { zh: zhWhy, en: enWhy },
    fix: { zh: zhFix, en: enFix },
  };
}

function citationsFor(id) {
  return Object.values(CITATIONS)
    .filter((citation) => citation.status === 'read' && citation.supportsRules.includes(id))
    .map((citation) => citation.id);
}

function check(id, dimension, tier, severity, confidence, basis, texts, detect) {
  return { id, dimension, tier, severity, confidence, basis, citations: citationsFor(id), ...texts, detect };
}

function occ(file, index, detail = '') {
  return makeOccurrence(file, file.text, index, detail ? { detail } : {});
}

function collect(files, pattern: RegExp, { skipComments = true, limit = 5, detail = '' }: { skipComments?: boolean; limit?: number; detail?: string | ((match: RegExpExecArray, file: any) => string) } = {}) {
  const out = [];
  for (const file of files) {
    const re = pattern instanceof RegExp ? new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g') : null;
    if (!re) continue;
    let match;
    while ((match = re.exec(file.text)) !== null) {
      if (skipComments) {
        const start = file.text.lastIndexOf('\n', Math.max(0, match.index - 1)) + 1;
        let end = file.text.indexOf('\n', match.index);
        if (end === -1) end = file.text.length;
        const lineText = file.text.slice(start, end);
        if (/^\s*(\/\/|\*|<!--)/.test(lineText)) continue;
      }
      out.push(occ(file, match.index, typeof detail === 'function' ? detail(match, file) : detail));
      if (out.length >= limit) return out;
    }
  }
  return out;
}

function findBlockRange(file, block, needle = '') {
  // `block.start` is the open paren; find the line of the call start.
  return file.text.slice(0, block.start).split('\n').length;
}

function localeBlockRanges(file) {
  const ranges = [];
  const text = file.text;
  for (const name of ['DICTIONARY', 'ZH', 'EN', 'zh', 'en']) {
    const re = new RegExp(`(?:var|let|const)\\s+${name}(?:\\s*:\\s*[^=]+)?\\s*=\\s*\\{`, 'g');
    let match;
    while ((match = re.exec(text)) !== null) {
      const brace = text.indexOf('{', match.index);
      const block = balancedBlock(text, brace, '{', '}');
      if (block) ranges.push([block.start, block.end]);
    }
  }
  for (const block of callBlocks(text, 'register')) {
    if (/locale\s*\.\s*register|ctx\.locale\.register/.test(block.text)) ranges.push([block.start, block.end]);
  }
  return ranges;
}

function inRanges(index, ranges) {
  return ranges.some(([start, end]) => index >= start && index <= end);
}

function issueOccurrences(ctx, checkId) {
  return (ctx.analysis.issues || [])
    .filter((issue) => issue.checkId === checkId)
    .slice(0, 8)
    .map((issue) => ({
      path: issue.path,
      line: issue.line,
      snippet: issue.snippet,
      detail: issue.detail,
      // An analysis issue may grade itself: a declared-but-missing icon is a
      // smaller deal than a structural manifest mismatch. The review keeps the
      // worst occurrence, so leaving this undefined falls back to the check.
      ...(issue.severity ? { severity: issue.severity } : {}),
    }));
}

const HOST = (ctx) => filesOf(ctx.inventory, ['host']);
const CLIENT = (ctx) => filesOf(ctx.inventory, ['client']);
const STYLE = (ctx) => filesOf(ctx.inventory, ['style']);
const SOURCE = (ctx) => filesOf(ctx.inventory, ['host', 'client']);

export const CHECKS = [
  // ------------------------------------------------------------------ backend
  check(
    'host.empty-catch', 'backend', 'core', 'P1', 'high', 'experience',
    copy(
      '错误被 catch 静默吞掉',
      'Errors are swallowed by an empty catch',
      '空 catch 或只打日志的 catch 会让失败看起来像成功。',
      'An empty catch (or a log-only catch) makes a failure look like success.',
      '调用方拿到的是正常返回，用户看到的是“已保存”，实际什么都没发生；这是最伤信任的一种失败。',
      'The caller gets a normal return and the user sees “saved” when nothing happened. This is the most trust-damaging kind of failure.',
      '保留错误对象并向上返回，或返回带 code 的可理解错误；UI 给可重试的提示，不要只 console。',
      'Keep the error, rethrow or return a typed error, and give the UI a retryable message instead of a bare console line.',
    ),
    (ctx) => {
      const out = [];
      for (const file of HOST(ctx)) {
        const patterns = [
          /catch\s*(?:\([^)]*\))?\s*\{\s*\}/g,
          /\.catch\(\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*\{\s*\}\s*\)/g,
        ];
        for (const pattern of patterns) {
          let match;
          while ((match = pattern.exec(file.text)) !== null) {
            out.push(occ(file, match.index));
            if (out.length >= 6) return out;
          }
        }
      }
      return out;
    },
  ),
  check(
    'host.unmanaged-lifecycle', 'backend', 'core', 'P1', 'medium', 'read',
    copy(
      '副作用没有主人',
      'Side effects have no owner',
      'apply 里起了 timer/listener/route，却没有 ctx.effect / ctx.on 或返回清理函数。',
      'A timer, listener or route is created without ctx.effect / ctx.on or a returned cleanup.',
      '插件卸载、热重载或 profile 切换后，回调还在跑；轻则重复注册，重则关不掉、泄漏资源。',
      'After unload, HMR or a profile switch the callback still runs: duplicate registrations at best, leaked or unclosable resources at worst.',
      '把每个资源注册包进 ctx.effect 并返回 disposer；listener 用 ctx.on；路由和工具让框架持有生命周期。',
      'Wrap each registration in ctx.effect and return its disposer; use ctx.on for listeners; let the framework own routes and tools.',
    ),
    (ctx) => {
      const out = [];
      for (const file of HOST(ctx)) {
        if (/ctx\.effect|ctx\.on|return\s*(?:\(\)|function)\s*=>?/.test(file.text)) continue;
        const re = /\b(setInterval|setTimeout|addEventListener|process\.on)\s*\(|\.register\s*\(/g;
        let match;
        while ((match = re.exec(file.text)) !== null) {
          out.push(occ(file, match.index, '文件里没有看到 ctx.effect / ctx.on / 清理函数'));
          break;
        }
        if (out.length >= 4) break;
      }
      return out;
    },
  ),
  check(
    'host.command-injection', 'backend', 'core', 'P0', 'high', 'read',
    copy(
      '外部输入被拼进系统命令',
      'External input is interpolated into a shell command',
      'exec/execSync/spawn 里出现变量拼接或 shell:true。',
      'exec/execSync/spawn uses string interpolation or shell:true.',
      '只要输入里有一个 &、| 或反引号，攻击者就能执行自己的命令；参数注入也能改写原本的意图。',
      'One &, | or backtick in the input lets an attacker run their own command; argument injection can also change the intended operation.',
      '优先用内置 API；必须起进程时用参数数组、固定可执行文件、allowlist 校验参数，并关掉 shell。',
      'Prefer built-in APIs. If a process is unavoidable, use an argument array, a fixed executable, allowlist validation, and disable the shell.',
    ),
    (ctx) => {
      const out = [];
      for (const file of HOST(ctx)) {
        const re = /\b(exec|execSync|spawn|spawnSync)\s*\(/g;
        let match;
        while ((match = re.exec(file.text)) !== null) {
          const lineStart = file.text.lastIndexOf('\n', Math.max(0, match.index - 1)) + 1;
          let lineEnd = file.text.indexOf('\n', match.index);
          if (lineEnd === -1) lineEnd = file.text.length;
          const lineText = file.text.slice(lineStart, lineEnd);
          if (/^\s*(?:const|let|var)\s+\w+\s*=\s*\//.test(lineText) || /new\s+RegExp/.test(lineText)) continue;
          const tail = file.text.slice(match.index, match.index + 400);
          if (/shell\s*:\s*true|\$\{|['"]\s*\+|\+\s*['"]/.test(tail)) {
            out.push(occ(file, match.index, tail.includes('shell: true') ? 'shell:true' : '拼接了变量'));
            if (out.length >= 5) return out;
          }
        }
      }
      return out;
    },
  ),
  check(
    'host.hardcoded-secret', 'backend', 'core', 'P0', 'high', 'read',
    copy(
      '源码里躺着密钥',
      'A secret is hardcoded in source',
      'token/apiKey/secret/password 以字面量出现。',
      'A token/apiKey/secret/password appears as a literal.',
      '源码会被复制、打包、截图、上传；密钥一旦进 git 历史，轮换之前都算泄漏。',
      'Source gets copied, bundled, screenshotted and pushed. Once a key enters git history it is leaked until rotated.',
      '改从环境变量或凭据服务读取；立刻轮换已提交的密钥；日志与错误里不要回显。',
      'Read it from env or a credential service; rotate anything already committed; never echo it in logs or errors.',
    ),
    (ctx) => {
      const out = [];
      for (const file of HOST(ctx)) {
        const patterns = [
          /(?:apiKey|api_key|token|secret|password|passwd|authorization)\s*[:=]\s*['"]([^'"]{8,})['"]/gi,
          /\b(sk-[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{10,})\b/g,
        ];
        for (const pattern of patterns) {
          let match;
          while ((match = pattern.exec(file.text)) !== null) {
            const value = match[1] || match[0];
            if (/process\.env|your[_-]?|example|placeholder|xxxx|\$\{|<[^>]+>|test[_-]?/i.test(value)) continue;
            const lineStart = file.text.lastIndexOf('\n', Math.max(0, match.index - 1)) + 1;
            let lineEnd = file.text.indexOf('\n', match.index);
            if (lineEnd === -1) lineEnd = file.text.length;
            const rawLine = file.text.slice(lineStart, lineEnd);
            const masked = rawLine.replaceAll(value, maskSecret(value));
            out.push({
              path: file.path,
              line: file.text.slice(0, match.index).split('\n').length,
              snippet: masked,
              detail: '已掩码；请轮换密钥',
            });
            if (out.length >= 5) return out;
          }
        }
      }
      return out;
    },
  ),
  check(
    'host.absolute-path', 'backend', 'deep', 'P2', 'medium', 'experience',
    copy(
      '路径写死在某一台机器上',
      'A path only exists on one machine',
      '源码里出现 C:\\、/Users/、/home/ 这类绝对路径。',
      'Source contains an absolute path such as C:\\, /Users/ or /home/.',
      '换一台机器、换一个用户名就找不到；CI 和同事的机器会先坏。',
      'Another machine or username will not find it; CI and teammates break first.',
      '用 path.join(os.homedir(), …)、环境变量或相对包路径；把差异放进配置。',
      'Use path.join(os.homedir(), …), env vars or package-relative paths; keep differences in configuration.',
    ),
    (ctx) => collect(SOURCE(ctx), /['"](?:[A-Za-z]:\\|\/Users\/|\/home\/)/g, { limit: 5, detail: '硬编码绝对路径' }),
  ),

  // ----------------------------------------------------------------- frontend
  check(
    'client.unsafe-html', 'frontend', 'core', 'P0', 'high', 'experience',
    copy(
      '把未处理的 HTML 塞进页面',
      'Untrusted HTML is written into the page',
      'dangerouslySetInnerHTML、innerHTML、insertAdjacentHTML、eval 或 new Function。',
      'dangerouslySetInnerHTML, innerHTML, insertAdjacentHTML, eval or new Function.',
      '一旦内容来自用户、插件或模型，脚本就能在宿主页面里执行；这是最直接的 XSS 面。',
      'Once the content comes from a user, another plugin or a model, script can execute inside the host page — a direct XSS surface.',
      '用文本节点或白名单 sanitizer；不要 eval 动态代码；把“渲染字符串”改成“渲染数据”。',
      'Use text nodes or an allowlisted sanitizer; never eval dynamic code; render data instead of HTML strings.',
    ),
    (ctx) => collect(CLIENT(ctx), /dangerouslySetInnerHTML|\.innerHTML\s*=|insertAdjacentHTML|\beval\s*\(|new\s+Function\s*\(/g, { limit: 6 }),
  ),
  check(
    'client.effect-cleanup', 'frontend', 'core', 'P1', 'medium', 'read',
    copy(
      '副作用没有收尾',
      'An effect has no cleanup',
      'useEffect 里订阅、起 timer 或 fetch，却没有返回 cleanup。',
      'A useEffect subscribes, starts a timer or fetches without returning a cleanup.',
      '组件卸载或依赖变化后，旧回调还在更新已经不存在的东西；开发态会重复执行，线上会泄漏。',
      'After unmount or a dependency change the old callback still updates something that is gone; dev double-runs and production leaks follow.',
      '返回 cleanup：取消订阅、clearTimeout、AbortController.abort；fetch 要 cancel 或 ignore。',
      'Return a cleanup: unsubscribe, clearTimeout, AbortController.abort; cancel or ignore the fetch.',
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        for (const block of callBlocks(file.text, 'useEffect')) {
          const body = block.text;
          if (!/(addEventListener|setInterval|setTimeout|subscribe\s*\(|fetch\s*\()/.test(body)) continue;
          if (/return\s*(?:\(\)|function)\s*=>?|AbortController|AbortSignal|\.abort\s*\(/.test(body)) continue;
          out.push({
            path: file.path,
            line: findBlockRange(file, block),
            snippet: file.text.slice(block.start, Math.min(block.end + 1, block.start + 400)),
            detail: '有订阅/timer/fetch，但没有 cleanup',
          });
          if (out.length >= 5) return out;
        }
      }
      return out;
    },
  ),
  check(
    'client.body-dom', 'frontend', 'core', 'P1', 'high', 'read',
    copy(
      '把 DOM 写到组件外面',
      'DOM is written outside the component',
      'document.body/head.appendChild 或跨插件读 DOM。',
      'document.body/head.appendChild or reading another plugin’s DOM.',
      '宿主和其他插件共享同一棵 DOM；写外面会破坏布局、被别的插件清掉，卸载时也收不回来。',
      'The host and other plugins share one DOM; writing outside breaks layout, gets wiped by another plugin, and cannot be cleaned up on unmount.',
      '在组件内渲染；样式用组件里的 <style> 或 CSS module；不要 append 到 body/head。',
      'Render inside the component; use a component-scoped <style> or CSS module; never append to body/head.',
    ),
    (ctx) => collect(CLIENT(ctx), /document\.(?:body|head)\.(?:appendChild|append|prepend|insertBefore)\s*\(/g, { limit: 5 }),
  ),
  check(
    'client.hardcoded-text', 'frontend', 'core', 'P2', 'medium', 'read',
    copy(
      '界面文案写死在客户端',
      'Visible copy is hardcoded in the client',
      '客户端源码里出现 CJK 文案，却没有走 locale 字典。',
      'CJK copy appears in client source without going through the locale dictionary.',
      '宿主切英文时这行字不会变；用户看到半中半英，插件像没做完。',
      'When the host switches to English this line does not change; users see half-Chinese, half-English and the plugin looks unfinished.',
      '把文案放进 locale 字典，用 t()/ctx.locale.bind 读取；动态内容也要走同一套。',
      'Move copy into the locale dictionary and read it through t()/ctx.locale.bind; dynamic copy goes through the same path.',
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        if (/\/locale\.tsx?$|\/locale\//.test(file.path)) continue;
        const ranges = localeBlockRanges(file);
        const re = /['"`]([^'"`]*[\u4e00-\u9fff][^'"`]*)['"`]/g;
        let match;
        while ((match = re.exec(file.text)) !== null) {
          if (inRanges(match.index, ranges)) continue;
          const lineStart = file.text.lastIndexOf('\n', Math.max(0, match.index - 1)) + 1;
          let lineEnd = file.text.indexOf('\n', match.index);
          if (lineEnd === -1) lineEnd = file.text.length;
          const lineText = file.text.slice(lineStart, lineEnd);
          if (/^\s*(\/\/|\*|<!--)/.test(lineText)) continue;
          if (/\bt\(|\btextFor\(|locale\./.test(lineText)) continue;
          out.push(occ(file, match.index, 'CJK 文案不在 locale 字典里'));
          if (out.length >= 5) return out;
        }
      }
      return out;
    },
  ),
  check(
    'client.inaccessible-control', 'frontend', 'core', 'P1', 'medium', 'read',
    copy(
      '可点击的 div 键盘按不到',
      'A clickable div is unreachable by keyboard',
      'div/span 上挂了 onClick，却没有 role/tabIndex/键盘处理。',
      'A div/span has onClick but no role, tabIndex or keyboard handler.',
      '键盘用户和读屏用户不知道它能点，也按不到；这违反 2.1.1。',
      'Keyboard and screen-reader users do not know it is actionable and cannot reach it; this violates 2.1.1.',
      '用 <button>；必须用 div 时补 role="button"、tabIndex={0}、Enter/Space 处理。',
      'Use <button>. If a div is unavoidable, add role="button", tabIndex={0} and Enter/Space handling.',
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        const createRe = /createElement\s*\(\s*['"](div|span)['"]\s*,\s*\{/g;
        let match;
        while ((match = createRe.exec(file.text)) !== null) {
          const brace = file.text.indexOf('{', match.index);
          const attrs = balancedBlock(file.text, brace, '{', '}');
          if (!attrs) continue;
          if (!/onClick/.test(attrs.text)) continue;
          if (/role\s*:|tabIndex|onKeyDown|onKeyUp|onKeyPress/.test(attrs.text)) continue;
          out.push({
            path: file.path,
            line: file.text.slice(0, match.index).split('\n').length,
            snippet: file.text.slice(match.index, Math.min(attrs.end + 1, match.index + 300)),
            detail: 'div/span onClick 无 role/tabIndex/键盘处理',
          });
          if (out.length >= 5) return out;
        }
        const jsxRe = /<(div|span)\b[^>]*\bonClick\b[^>]*>/g;
        while ((match = jsxRe.exec(file.text)) !== null) {
          const tag = match[0];
          if (/role=|tabIndex|onKeyDown|onKeyUp|onKeyPress/.test(tag)) continue;
          out.push(occ(file, match.index, 'JSX div/span onClick 无 role/tabIndex/键盘处理'));
          if (out.length >= 5) return out;
        }
      }
      return out;
    },
  ),
  check(
    'client.iframe-panel', 'frontend', 'core', 'P2', 'high', 'read',
    copy(
      '用 iframe 承载面板',
      'The panel is hosted in an iframe',
      '客户端用 <iframe> 或 createElement("iframe") 渲染主体界面。',
      'Client renders the main UI with <iframe> or createElement("iframe").',
      'iframe 文档拿不到宿主的 theme token、亮暗切换和 ctx.locale；看起来像另一个应用。',
      'An iframe document misses the host theme tokens, light/dark switching and ctx.locale; it looks like a different app.',
      '用 slot 里的 React 组件直接渲染；必须隔离样式时用前缀和 component-scoped CSS。',
      'Render a React component in the slot; for style isolation use prefixes and component-scoped CSS.',
    ),
    (ctx) => collect(CLIENT(ctx), /<iframe\b|createElement\(\s*['"]iframe['"]/g, { limit: 3 }),
  ),
  check(
    'client.duplicate-react', 'frontend', 'deep', 'P1', 'high', 'read',
    copy(
      '自己又加载了一份 React',
      'A second React copy is loaded',
      '从 CDN/UMD 取 React，而不是用宿主模块表。',
      'React comes from a CDN/UMD instead of the host module table.',
      '两份 React 会让 hooks 报错、context 断链，还会把包体撑大。',
      'Two React copies break hooks and context, and inflate the bundle.',
      '用 factory(require) 里的 require("react")；不要在客户端 bundle 里再装一份。',
      'Use require("react") from factory(require); never bundle a second copy.',
    ),
    (ctx) => collect(CLIENT(ctx), /unpkg\.com\/react|cdn\.jsdelivr\.net\/npm\/react|window\.React\b|ReactDOM\.render/g, { limit: 3 }),
  ),

  // ----------------------------------------------------------------------- UI
  check(
    'ui.state-color-text', 'ui', 'core', 'P1', 'high', 'read',
    copy(
      '状态色被拿来当正文颜色',
      'A state color is used as body text color',
      'color: var(--dsw-alias-state-*) 直接用于正文。',
      'color: var(--dsw-alias-state-*) is used for body text.',
      '状态色是为圆点/边框设计的，当文字通常达不到 4.5:1；白底上尤其明显。',
      'State colors are designed for dots and borders; as text they usually miss 4.5:1, especially on light backgrounds.',
      '状态色只留在圆点/边框；文字用 label-primary/secondary。',
      'Keep state colors on dots and borders; use label-primary/secondary for text.',
    ),
    (ctx) => collect([...SOURCE(ctx), ...STYLE(ctx)], /(?:^|[;\s])color\s*:\s*var\(--dsw-alias-state-[^)]+\)/g, { limit: 5 }),
  ),
  check(
    'ui.contrast-literal', 'ui', 'core', 'P1', 'high', 'read',
    copy(
      '字色和背景的对比度不够',
      'Text and background do not have enough contrast',
      '同一规则块内字色/背景都是字面量，正文低于 4.5:1 或大字低于 3:1。',
      'Both text and background are literals and the ratio is below 4.5:1 for body text or 3:1 for large text.',
      '低对比度对低视力、老年用户和强光环境是直接不可读，不是审美问题。',
      'Low contrast is directly unreadable for low vision, older users and bright environments — not a taste issue.',
      '改用 theme token；必须自定义时按 WCAG 公式算到 4.5:1（大字 3:1）。',
      'Use theme tokens; if custom colors are required, compute WCAG 4.5:1 (3:1 for large text).',
    ),
    (ctx) => {
      const out = [];
      for (const file of STYLE(ctx)) {
        for (const pair of inlineColorPairs(file.text)) {
          const big = /font-size\s*:\s*(\d+(?:\.\d+)?)px/i.exec(pair.selector + ' ' + file.text.slice(pair.index, pair.index + 600));
          const large = big && Number(big[1]) >= 24;
          const threshold = large ? 3 : 4.5;
          if (pair.ratio + 0.001 >= threshold) continue;
          out.push({
            path: file.path,
            line: file.text.slice(0, pair.index).split('\n').length,
            snippet: file.text.slice(pair.index, pair.index + 300),
            detail: `对比度 ${pair.ratio.toFixed(2)}:1，低于 ${threshold}:1`,
          });
          if (out.length >= 5) return out;
        }
      }
      return out;
    },
  ),
  check(
    'ui.focus-visible', 'ui', 'core', 'P1', 'high', 'read',
    copy(
      '焦点环被关掉了',
      'The focus ring is removed',
      'CSS 里 outline:none/0，且没有 :focus-visible 替代。',
      'CSS sets outline:none/0 without a :focus-visible replacement.',
      '键盘用户看不到当前焦点，等于在黑暗里按 Tab。',
      'Keyboard users cannot see where focus is; tabbing becomes guesswork.',
      '保留 outline，或给 :focus-visible 一个 2px brand 色外框；不要只删不补。',
      'Keep the outline, or give :focus-visible a 2px brand ring; never remove without a replacement.',
    ),
    (ctx) => {
      const out = [];
      for (const file of STYLE(ctx)) {
        if (!/outline\s*:\s*(?:none|0)/.test(file.text)) continue;
        if (/:focus-visible/.test(file.text)) continue;
        const match = /outline\s*:\s*(?:none|0)/.exec(file.text);
        out.push(occ(file, match.index, 'outline 被移除且没有 :focus-visible 替代'));
        if (out.length >= 3) break;
      }
      return out;
    },
  ),
  check(
    'ui.touch-target', 'ui', 'core', 'P2', 'medium', 'read',
    copy(
      '点击目标太小',
      'Click targets are too small',
      '按钮/图标目标小于 24×24 CSS px。',
      'Button or icon targets are smaller than 24×24 CSS px.',
      '手抖、触屏、触控板用户会点错；24×24 是 WCAG 2.5.8 的最低线。',
      'Users with tremors, touchscreens or trackpads mis-click; 24×24 is the WCAG 2.5.8 minimum.',
      '给按钮至少 24×24 的可点击区域；图标小可以，热区不能小。',
      'Give every button at least a 24×24 hit area; the glyph can stay small, the target cannot.',
    ),
    (ctx) => {
      const out = [];
      for (const file of STYLE(ctx)) {
        for (const rule of cssRules(file.text)) {
          if (!/(?:button|btn|icon|close|toggle|chip)/i.test(rule.selector)) continue;
          const width = /(?:^|[;\s])(?:width|min-width)\s*:\s*(\d+(?:\.\d+)?)px/i.exec(rule.body);
          const height = /(?:^|[;\s])(?:height|min-height)\s*:\s*(\d+(?:\.\d+)?)px/i.exec(rule.body);
          const w = width ? Number(width[1]) : null;
          const h = height ? Number(height[1]) : null;
          if ((w !== null && w < 24) || (h !== null && h < 24)) {
            out.push({
              path: file.path,
              line: file.text.slice(0, rule.index).split('\n').length,
              snippet: `${rule.selector} { ${rule.body.trim().slice(0, 180)} }`,
              detail: `目标尺寸 ${w ?? '?'}×${h ?? '?'}px，低于 24×24`,
            });
            if (out.length >= 5) return out;
          }
        }
      }
      return out;
    },
  ),
  check(
    'ui.reduced-motion', 'ui', 'core', 'P2', 'high', 'read',
    copy(
      '动效没有尊重减少动态偏好',
      'Motion ignores reduced-motion',
      '有 animation/transition，但没有 prefers-reduced-motion。',
      'Animation or transition exists without a prefers-reduced-motion branch.',
      '前庭障碍用户会被非必要动效弄晕；这是可关闭的偏好，不是装饰自由。',
      'Vestibular users get dizzy from non-essential motion; it is a preference that must be respected.',
      '加 @media (prefers-reduced-motion: reduce)，把非必要 animation/transition 关掉或缩短。',
      'Add @media (prefers-reduced-motion: reduce) and disable or shorten non-essential motion.',
    ),
    (ctx) => {
      const out = [];
      for (const file of STYLE(ctx)) {
        if (!/(?:animation|transition)\s*:/.test(file.text)) continue;
        if (/prefers-reduced-motion/.test(file.text)) continue;
        const match = /(?:animation|transition)\s*:/.exec(file.text);
        out.push(occ(file, match.index, '缺少 prefers-reduced-motion 分支'));
        if (out.length >= 3) break;
      }
      return out;
    },
  ),
  check(
    'ui.tiny-type', 'ui', 'core', 'P2', 'medium', 'experience',
    copy(
      '正文太小或行高太挤',
      'Body text is too small or too tight',
      'font-size <12px，或 line-height <1.3。',
      'font-size is below 12px, or line-height is below 1.3.',
      '长时间读会累；中文尤其需要更大的字号和行距。',
      'Long reading sessions hurt; CJK text needs more size and leading, not less.',
      '正文至少 12px，推荐 13–14px；行高至少 1.4。',
      'Body text at least 12px, ideally 13–14px; line-height at least 1.4.',
    ),
    (ctx) => {
      const out = [];
      for (const file of STYLE(ctx)) {
        for (const rule of cssRules(file.text)) {
          const font = /(?:^|[;\s])font-size\s*:\s*(\d+(?:\.\d+)?)px/i.exec(rule.body);
          const lh = /(?:^|[;\s])line-height\s*:\s*(\d+(?:\.\d+)?)(?!px|%|em|rem)/i.exec(rule.body);
          if (font && Number(font[1]) < 12) {
            out.push({ path: file.path, line: file.text.slice(0, rule.index).split('\n').length, snippet: `${rule.selector} { ${rule.body.trim().slice(0, 160)} }`, detail: `font-size ${font[1]}px` });
          } else if (lh && Number(lh[1]) < 1.3) {
            out.push({ path: file.path, line: file.text.slice(0, rule.index).split('\n').length, snippet: `${rule.selector} { ${rule.body.trim().slice(0, 160)} }`, detail: `line-height ${lh[1]}` });
          }
          if (out.length >= 5) return out;
        }
      }
      return out;
    },
  ),
  check(
    'ui.layout-shift', 'ui', 'core', 'P2', 'medium', 'experience',
    copy(
      '图片/异步内容没有预留位置',
      'Images or async content reserve no space',
      'img 没有 width/height/aspect-ratio，异步内容插入不占位。',
      'An img has no width/height/aspect-ratio, or async content inserts without reserved space.',
      '内容加载时页面会跳，用户点错、读丢行；这是 CLS 的典型来源。',
      'The page jumps while content loads; users mis-click and lose their place — a classic CLS source.',
      '给图片写 width/height 或 aspect-ratio；异步区域先占位再替换。',
      'Set width/height or aspect-ratio on images; reserve space before replacing async content.',
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        const re = /<img\b[^>]*>/g;
        let match;
        while ((match = re.exec(file.text)) !== null) {
          const tag = match[0];
          if (/\bwidth=|\bheight=|aspect-ratio|aspectRatio/.test(tag)) continue;
          out.push(occ(file, match.index, 'img 没有尺寸/比例'));
          if (out.length >= 5) return out;
        }
        const createRe = /createElement\(\s*['"]img['"]\s*,\s*\{([^}]*)\}/g;
        while ((match = createRe.exec(file.text)) !== null) {
          if (/\bwidth\s*:|\bheight\s*:|aspectRatio/.test(match[1])) continue;
          out.push(occ(file, match.index, 'img 没有尺寸/比例'));
          if (out.length >= 5) return out;
        }
      }
      return out;
    },
  ),
  check(
    'ui.double-scroll', 'ui', 'deep', 'P2', 'medium', 'experience',
    copy(
      '面板里出现双滚动',
      'The panel has nested scrolling',
      'height:100vh 或多层 overflow:auto。',
      'height:100vh or multiple overflow:auto containers.',
      '面板本身已经被宿主管滚动；再套一层会让滚轮卡住、滚动条打架。',
      'The host already scrolls the panel; another layer makes the wheel stick and scrollbars fight.',
      '面板高度用 100%/min-height:0，只留一个滚动容器。',
      'Use 100%/min-height:0 for panel height and keep one scroll container.',
    ),
    (ctx) => {
      const out = [];
      for (const file of STYLE(ctx)) {
        if (/height\s*:\s*100vh/.test(file.text)) {
          const match = /height\s*:\s*100vh/.exec(file.text);
          out.push(occ(file, match.index, '面板内 height:100vh'));
        }
        const overflowCount = (file.text.match(/overflow(?:-y)?\s*:\s*auto/g) || []).length;
        if (overflowCount >= 2) {
          const match = /overflow(?:-y)?\s*:\s*auto/.exec(file.text);
          out.push(occ(file, match.index, `${overflowCount} 层 overflow:auto`));
        }
        if (out.length >= 3) return out;
      }
      return out;
    },
  ),
  check(
    'ui.color-only-status', 'ui', 'deep', 'P2', 'medium', 'read',
    copy(
      '状态只靠颜色表达',
      'Status is conveyed by color alone',
      '状态点没有文字/图标/aria-label。',
      'A status dot has no text, icon or aria-label.',
      '色觉差异用户看不出绿/红/黄；状态必须还有第二种表达。',
      'Color-vision-deficient users cannot tell green/red/amber apart; status needs a second channel.',
      '在圆点旁加文字（运行中/失败/未知）或 aria-label；不要只换颜色。',
      'Add text (running/failed/unknown) or an aria-label next to the dot; do not just change the color.',
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        if (/aria-label|ariaLabel/.test(file.text)) continue;
        const re = /(?:StatusDot|status[-_]?dot|statusDot)/g;
        let match;
        while ((match = re.exec(file.text)) !== null) {
          const windowText = file.text.slice(Math.max(0, match.index - 400), Math.min(file.text.length, match.index + 800));
          if (/aria-label|title\s*:|children|>\s*\{[^}]*label|运行中|失败|未知/.test(windowText)) continue;
          out.push(occ(file, match.index, '状态点附近没有文字/aria-label'));
          if (out.length >= 4) return out;
        }
      }
      return out;
    },
  ),

  // ---------------------------------------------------------------------- UX
  check(
    'ux.destructive-no-confirm', 'ux', 'core', 'P1', 'medium', 'experience',
    copy(
      '破坏性操作没有确认或撤销',
      'A destructive action has no confirmation or undo',
      '删除/清空/覆盖/卸载按钮直接执行。',
      'Delete/clear/overwrite/uninstall runs immediately.',
      '一次误点就永久丢数据；确认框烦人，但不可逆操作至少要有确认或撤销。',
      'One mis-click loses data for good; a confirmation is annoying, but an irreversible action needs confirm or undo.',
      '优先给撤销；不能撤销时二次确认，并把按钮从默认焦点移开。',
      'Prefer undo; when impossible, ask for confirmation and keep the button out of the default focus.',
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        const re = /['"`]([^'"`]*(?:删除|清空|移除|卸载|Delete|Remove|Clear|Uninstall)[^'"`]*)['"`]/g;
        let match;
        while ((match = re.exec(file.text)) !== null) {
          if (/confirm\s*\(|undo|撤销|确认|risky/i.test(file.text)) continue;
          out.push(occ(file, match.index, '破坏性文案附近没有 confirm/undo'));
          if (out.length >= 5) return out;
        }
      }
      return out;
    },
  ),
  check(
    'ux.raw-error', 'ux', 'core', 'P2', 'medium', 'read',
    copy(
      '把原始异常直接甩给用户',
      'The raw exception is shown to the user',
      'String(error)、异常 JSON 或堆栈直接进 UI。',
      'String(error), error JSON or a stack trace is rendered in the UI.',
      '用户看不懂内部诊断，还会暴露路径、token 和实现细节；错误信息应该是可行动的话。',
      'Users cannot act on internal diagnostics, and it leaks paths, tokens and implementation details; an error should say what to do next.',
      '给用户可理解的一句话 + 重试；原始错误进日志/诊断，不进正文。',
      'Show one understandable sentence plus retry; keep the raw error in logs/diagnostics, not in the body.',
    ),
    (ctx) => collect(CLIENT(ctx), /String\(\s*(?:error|err|e)\s*\)|JSON\.stringify\(\s*(?:error|err|e)\s*\)|(?<![.\w])(?:error|err)\.message\b/g, { limit: 5 }),
  ),
  check(
    'ux.no-states', 'ux', 'core', 'P2', 'low', 'experience',
    copy(
      '没有 loading / empty / error 状态',
      'No loading / empty / error states',
      '大面板只有成功路径，没有加载、空和失败文案。',
      'A large panel only has the happy path; no loading, empty or failure copy.',
      '用户不知道是在加载、没数据还是坏了；只能反复点。',
      'Users cannot tell loading from empty from broken; they just click again.',
      '补上三种状态文案和对应动作；空状态告诉用户下一步。',
      'Add the three states and their actions; the empty state should say what to do next.',
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        if (file.lineCount < 400) continue;
        if (/loading|empty|error|加载|空|重试|出错/i.test(file.text)) continue;
        out.push({ path: file.path, line: 1, snippet: '', detail: '大面板没有 loading/empty/error 文案' });
        if (out.length >= 2) return out;
      }
      return out;
    },
  ),
  check(
    'ux.keyboard-only-mouse', 'ux', 'core', 'P2', 'medium', 'read',
    copy(
      '拖拽/指针操作没有键盘替代',
      'Drag/pointer interaction has no keyboard path',
      'onPointerDown/onMouseDown/onDragStart 存在，但没有键盘处理。',
      'onPointerDown/onMouseDown/onDragStart exists without a keyboard handler.',
      '键盘用户和部分运动障碍用户无法完成同一件事；2.5.7 要求单指针替代，2.1.1 要求键盘可达。',
      'Keyboard users and some mobility users cannot do the same thing; 2.5.7 needs a single-pointer alternative and 2.1.1 needs keyboard access.',
      '给上下/左右按钮、输入框或“选择后移动”的替代路径。',
      'Provide up/down/left/right buttons, a text input, or a select-then-move alternative.',
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        if (!/onPointerDown|onMouseDown|onDragStart|\bdraggable\b/.test(file.text)) continue;
        if (/onKeyDown|onKeyUp|onKeyPress|tabIndex/.test(file.text)) continue;
        const match = /onPointerDown|onMouseDown|onDragStart|\bdraggable\b/.exec(file.text);
        out.push(occ(file, match.index, '有拖拽/指针操作，没有键盘处理'));
        if (out.length >= 3) break;
      }
      return out;
    },
  ),
  check(
    'ux.no-escape', 'ux', 'core', 'P2', 'medium', 'experience',
    copy(
      '弹层关不掉',
      'An overlay cannot be dismissed',
      'dialog/overlay/popover 没有 Esc 或点外关闭。',
      'A dialog/overlay/popover has no Escape or outside-click close.',
      '用户被困在弹层里，只能刷新页面；这是最常见的“看起来能用、实际卡死”。',
      'Users get trapped and have to refresh; the classic “looks usable, actually stuck” case.',
      '监听 Escape 和点外关闭，关闭后把焦点还给触发按钮。',
      'Handle Escape and outside click, and return focus to the trigger after closing.',
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        if (!/role\s*:\s*['"]dialog|role="dialog"|(?:overlay|modal|popover)/i.test(file.text)) continue;
        if (/Escape|keydown|onKeyDown/.test(file.text)) continue;
        const match = /role\s*:\s*['"]dialog|role="dialog"|(?:overlay|modal|popover)/i.exec(file.text);
        out.push(occ(file, match.index, '弹层没有 Escape 处理'));
        if (out.length >= 3) break;
      }
      return out;
    },
  ),
  check(
    'ux.no-retry', 'ux', 'core', 'P2', 'low', 'experience',
    copy(
      '失败后没有重试入口',
      'A failure has no retry path',
      '错误文案存在，但没有重试/恢复动作。',
      'Error copy exists, but there is no retry or recovery action.',
      '用户只能重新打开插件；小失败被放大成流程中断。',
      'Users have to reopen the plugin; a small failure becomes a broken flow.',
      '在错误态给“重试”和“返回”；保留上次输入。',
      'Add Retry and Back in the error state; keep the previous input.',
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        if (!/setError|catch\s*\(|error\s*[:=]|失败|出错/i.test(file.text)) continue;
        if (/retry|重试|再试|tryAgain/.test(file.text)) continue;
        const match = /setError|catch\s*\(|失败|出错/i.exec(file.text);
        out.push(occ(file, match.index, '错误路径没有 retry'));
        if (out.length >= 3) break;
      }
      return out;
    },
  ),
  check(
    'ux.no-copy-save-feedback', 'ux', 'deep', 'P3', 'low', 'experience',
    copy(
      '复制/保存没有反馈',
      'Copy/save gives no feedback',
      'clipboard.writeText 或 save 调用后没有成功/失败提示。',
      'clipboard.writeText or save runs without a success/failure message.',
      '用户不知道到底成没成，只能再点一次；重复保存也可能造成重复数据。',
      'Users cannot tell whether it worked and click again; repeated saves can duplicate data.',
      '给短提示（已复制/保存失败）或用按钮状态变化表达；失败要可重试。',
      'Show a short “copied”/“save failed” state or change the button state; failures must be retryable.',
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        if (!/clipboard\.writeText|navigator\.clipboard|saveWorkspace|save\(/i.test(file.text)) continue;
        if (/copied|saved|已复制|已保存|复制成功|保存成功|保存失败/i.test(file.text)) continue;
        const match = /clipboard\.writeText|navigator\.clipboard|saveWorkspace|save\(/i.exec(file.text);
        out.push(occ(file, match.index, '复制/保存没有反馈'));
        if (out.length >= 3) break;
      }
      return out;
    },
  ),
  check(
    'ux.no-progress-cancel', 'ux', 'deep', 'P2', 'low', 'experience',
    copy(
      '长任务没有进度或取消',
      'A long task has no progress or cancel',
      '扫描/导入/导出/上传只有转圈，没有进度或取消。',
      'Scan/import/export/upload only spins, with no progress or cancel.',
      '用户不知道还要多久，也无法停下；慢的时候会以为卡死。',
      'Users do not know how long it will take and cannot stop it; a slow task looks hung.',
      '给阶段文案/进度和取消；取消后清理临时资源。',
      'Show stage/progress and a cancel action; clean up temporary resources on cancel.',
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        if (file.lineCount < 250) continue;
        if (!/(?:scan|import|export|upload|generate)\w*\s*\(|保存|扫描|导入|导出|上传/i.test(file.text)) continue;
        if (/progress|cancel|取消|进度/i.test(file.text)) continue;
        const match = /(?:scan|import|export|upload|generate)\w*\s*\(|保存|扫描|导入|导出|上传/i.exec(file.text);
        out.push(occ(file, match.index, '长任务没有进度/取消'));
        if (out.length >= 3) break;
      }
      return out;
    },
  ),
  check(
    'ux.unsaved-guard', 'ux', 'deep', 'P2', 'low', 'experience',
    copy(
      '关闭时没有未保存提醒',
      'No unsaved-changes guard',
      '可编辑内容关闭/切走时没有 dirty 检查。',
      'Editable content closes or navigates away without a dirty check.',
      '用户写了一屏字，一次误关就没了；自动保存也要有失败提示。',
      'A screen of writing disappears on one mis-close; even autosave needs a failure signal.',
      '有未保存改动时拦截关闭/切换，给“保存/丢弃/取消”。',
      'Intercept close/navigation when dirty and offer Save / Discard / Cancel.',
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        if (!/(?:textarea|contentEditable|\bdirty\b|\bunsaved\b|beforeunload)/i.test(file.text)) continue;
        if (/beforeunload|useBlocker|未保存|unsaved|dirty/i.test(file.text)) continue;
        const match = /textarea|contentEditable|useState/i.exec(file.text);
        out.push(occ(file, match.index, '可编辑内容没有未保存提醒'));
        if (out.length >= 2) break;
      }
      return out;
    },
  ),

  // --------------------------------------------------------------- performance
  check(
    'perf.bundle-size', 'performance', 'core', 'P2', 'high', 'experience',
    copy(
      '客户端包体偏大',
      'The client bundle is large',
      '手写客户端产物超过 500KB（1MB 以上更严重）。',
      'The authored client artifact is over 500KB (worse above 1MB).',
      '每次打开面板都要下载、解析、执行；包体是用户每次都要付的税。',
      'Every panel open downloads, parses and executes it; bundle size is a tax users pay every time.',
      '拆包/懒加载/把大资源移出客户端；构建产物要保留源码，别只提交 bundle。',
      'Split/lazy-load or move large assets out of the client; keep the source for generated artifacts.',
    ),
    (ctx) => {
      const artifact = ctx.budget.details.clientArtifact;
      if (!artifact) return [];
      if (artifact.generated && ctx.inventory.hasClientSource) return [];
      if (artifact.bytes <= BUDGETS.clientBytesWarn) return [];
      return [{
        path: artifact.path,
        line: 1,
        snippet: '',
        detail: `${(artifact.bytes / 1024).toFixed(0)}KB${artifact.bytes > BUDGETS.clientBytesBad ? '，超过 1MB' : ''}`,
        severity: artifact.bytes > BUDGETS.clientBytesBad ? 'P1' : 'P2',
      }];
    },
  ),
  check(
    'perf.inline-asset', 'performance', 'core', 'P2', 'high', 'experience',
    copy(
      '大资源被 base64 内联进 JS/CSS',
      'A large asset is inlined as base64',
      '单块 base64 图片/字体超过 100KB。',
      'A single base64 image/font block is over 100KB.',
      'base64 比二进制多约 33%，还会阻塞解析；它让首屏变慢，且无法单独缓存。',
      'Base64 is about 33% larger than binary and blocks parsing; it slows first paint and cannot be cached separately.',
      '把资源放独立文件，用 URL/路由加载；需要内联时设上限。',
      'Ship the asset as a file and load it by URL/route; cap any inline payload.',
    ),
    (ctx) => {
      const out = [];
      for (const item of ctx.budget.details.inlineOccurrences) {
        if (item.bytes < BUDGETS.inlineAssetBytes) continue;
        out.push({ path: item.path, line: item.line, snippet: '', detail: `内联约 ${(item.bytes / 1024).toFixed(0)}KB` });
        if (out.length >= 3) return out;
      }
      return out;
    },
  ),
  check(
    'perf.sync-io', 'performance', 'core', 'P1', 'high', 'experience',
    copy(
      '请求/工具热路径里做同步 IO',
      'Synchronous IO in a request/tool hot path',
      '路由、tool execute 或 apply 里出现 readFileSync/writeFileSync。',
      'readFileSync/writeFileSync appears in a route, tool execute or apply.',
      '同步 IO 会卡住整个 Host 事件循环；一个慢盘就能让所有会话一起卡。',
      'Sync IO blocks the whole Host event loop; one slow disk stalls every session.',
      '改 await fs.promises.readFile/writeFile；缓存可复用结果；大文件流式处理。',
      'Use await fs.promises.readFile/writeFile; cache reusable results; stream large files.',
    ),
    (ctx) => ctx.budget.details.syncIoCalls.slice(0, 5).map((item) => ({
      path: item.path,
      line: item.line,
      snippet: item.code,
      detail: item.hotPath ? '同步 IO 在请求/工具热路径' : '同步 IO 在启动/一次性路径（降为建议）',
      severity: item.hotPath ? 'P1' : 'P2',
    })),
  ),
  check(
    'perf.polling', 'performance', 'core', 'P2', 'high', 'experience',
    copy(
      '轮询太频繁',
      'Polling is too frequent',
      'setInterval 小于 1000ms 轮询状态。',
      'setInterval polls status faster than 1000ms.',
      '空闲时也一直唤醒 CPU/网络；多个插件叠加会把宿主拖慢。',
      'It wakes CPU/network while idle; several plugins stack into a slow host.',
      '先订阅事件；必须轮询时 ≥1s，并在不可见时暂停。',
      'Subscribe to events first; if polling is unavoidable, use ≥1s and pause when hidden.',
    ),
    (ctx) => ctx.budget.details.pollingIntervals.slice(0, 5).map((item) => ({
      path: item.path,
      line: item.line,
      snippet: '',
      detail: `setInterval ${item.ms}ms`,
    })),
  ),
  check(
    'perf.no-abort', 'performance', 'core', 'P1', 'high', 'read',
    copy(
      'fetch 没有取消',
      'A fetch is never cancelled',
      'useEffect 里 fetch，没有 AbortController/signal。',
      'fetch runs in useEffect without AbortController/signal.',
      '组件卸载或依赖变化后请求还在跑，回来时更新已卸载组件；慢网下会堆积。',
      'The request keeps running after unmount/dependency change and updates a gone component; slow networks pile them up.',
      '在 effect 里创建 AbortController，cleanup 调 abort；fetch 传 signal。',
      'Create an AbortController in the effect, call abort in cleanup, and pass signal to fetch.',
    ),
    (ctx) => ctx.budget.details.fetchWithoutAbort.slice(0, 5).map((item) => ({
      path: item.path,
      line: item.line,
      snippet: '',
      detail: 'useEffect fetch 没有 AbortController',
    })),
  ),
  check(
    'perf.serial-await', 'performance', 'core', 'P2', 'medium', 'experience',
    copy(
      '串行 await 可以并行',
      'Serial awaits could run in parallel',
      '循环里对互相独立的项逐个 await。',
      'A loop awaits independent items one by one.',
      'N 个 200ms 请求串起来就是 N×200ms；用户看到的是“怎么这么慢”。',
      'N independent 200ms calls become N×200ms; users feel it as “why is this slow”.',
      '用 Promise.all 并发；有依赖再串行；限制并发数避免打爆下游。',
      'Use Promise.all for independent work; keep serial only for real dependencies; cap concurrency.',
    ),
    (ctx) => ctx.budget.details.serialAwaitLoops.slice(0, 5).map((item) => ({
      path: item.path,
      line: item.line,
      snippet: '',
      detail: '循环内串行 await',
    })),
  ),
  check(
    'perf.layout-animation', 'performance', 'deep', 'P2', 'medium', 'experience',
    copy(
      '动画在改布局属性',
      'Animation changes layout properties',
      'transition/animation 动 width/height/top/left/margin/padding。',
      'transition/animation animates width/height/top/left/margin/padding.',
      '布局动画每帧都触发布局/绘制，低端机和长列表会掉帧。',
      'Layout animation forces layout/paint every frame; low-end machines and long lists drop frames.',
      '改 transform/opacity；必须改尺寸时用 FLIP 或减少元素数量。',
      'Animate transform/opacity; if size must change, use FLIP or reduce the element count.',
    ),
    (ctx) => ctx.budget.details.layoutAnimationRules.slice(0, 5).map((item) => ({
      path: item.path,
      line: item.line,
      snippet: '',
      detail: `动画属性 ${item.property}`,
    })),
  ),
  check(
    'perf.font-display', 'performance', 'deep', 'P3', 'medium', 'experience',
    copy(
      '@font-face 没有 font-display',
      '@font-face lacks font-display',
      '自定义字体没有 font-display: swap/optional。',
      'A custom font has no font-display: swap/optional.',
      '字体没到之前文字可能不可见，首屏像空白；慢网下尤其明显。',
      'Text may stay invisible until the font arrives; slow networks make the first paint look blank.',
      '加 font-display: swap；或先系统字体，字体到了再换。',
      'Add font-display: swap, or start with a system font and swap when ready.',
    ),
    (ctx) => {
      const out = [];
      for (const file of STYLE(ctx)) {
        const re = /@font-face\s*\{([\s\S]*?)\}/g;
        let match;
        while ((match = re.exec(file.text)) !== null) {
          if (/font-display\s*:/.test(match[1])) continue;
          out.push(occ(file, match.index, '@font-face 没有 font-display'));
          if (out.length >= 3) return out;
        }
      }
      return out;
    },
  ),
  check(
    'perf.virtualization', 'performance', 'deep', 'P3', 'low', 'experience',
    copy(
      '长列表一次性渲染',
      'A long list renders all at once',
      '对无上限数组直接 .map 渲染，没有窗口化/分页。',
      'An unbounded array is rendered with .map and no windowing/pagination.',
      '列表一长，首次渲染和滚动都会卡；用户越多越明显。',
      'Long lists make first render and scrolling janky; it gets worse with more data.',
      '窗口化/分页/限制返回条数；先渲染首屏，滚动再取。',
      'Window, paginate or cap the result count; render the first screen and fetch on scroll.',
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        if (file.lineCount < 300) continue;
        const re = /(?:items|list|rows|data)\.map\s*\(/g;
        let match;
        while ((match = re.exec(file.text)) !== null) {
          if (/slice\s*\(|virtual|window\.|pagination|分页/.test(file.text.slice(Math.max(0, match.index - 600), match.index + 600))) continue;
          out.push(occ(file, match.index, '无上限列表直接 .map'));
          if (out.length >= 3) return out;
        }
      }
      return out;
    },
  ),

  // ---------------------------------------------------------------------- AI
  check(
    'ai.tool-description', 'ai', 'core', 'P1', 'medium', 'experience',
    copy(
      '工具描述太薄',
      'The tool description is too thin',
      '工具 description 少于 40 字，或参数没有 description。',
      'Tool description is under 40 characters, or parameters have no description.',
      'Agent 只能靠描述决定何时调用、怎么传参；描述太薄就会误用或不敢用。',
      'The agent decides when and how to call from the description alone; thin descriptions cause misuse or avoidance.',
      '写清用途、边界、返回什么、什么时候不要用；每个参数都写 description。',
      'State purpose, boundaries, return shape and when not to use it; describe every parameter.',
    ),
    (ctx) => {
      const out = [];
      for (const file of HOST(ctx)) {
        for (const block of toolRegisterBlocks(file.text)) {
          const description = /description\s*:\s*(['"`])([\s\S]*?)\1/.exec(block.text);
          if (description && description[2].trim().length >= 40) continue;
          const params = /parameters\s*:\s*\{([\s\S]*)\}/.exec(block.text);
          if (description && description[2].trim().length >= 20 && params && /description\s*:/.test(params[1])) continue;
          out.push({
            path: file.path,
            line: file.text.slice(0, block.start).split('\n').length,
            snippet: block.text.slice(0, 300),
            detail: description ? `description 只有 ${description[2].trim().length} 字` : '缺少 description',
          });
          if (out.length >= 3) return out;
        }
      }
      return out;
    },
  ),
  check(
    'ai.destructive-tool', 'ai', 'core', 'P0', 'medium', 'experience',
    copy(
      '破坏性工具没有确认',
      'A destructive tool has no confirmation',
      'tool execute 里写/删/执行，但没有确认或审批。',
      'A tool execute writes/deletes/executes without confirmation or approval.',
      'Agent 一次误调用就能删数据或跑命令；人类没有机会在副作用前踩刹车。',
      'One wrong agent call can delete data or run a command; humans get no chance to brake before the side effect.',
      '破坏性工具先走 userQuestions/approval；或拆成“预览 + 确认执行”两步。',
      'Route destructive tools through userQuestions/approval, or split into preview + confirmed execute.',
    ),
    (ctx) => {
      const out = [];
      for (const file of HOST(ctx)) {
        for (const block of toolRegisterBlocks(file.text)) {
          const executeIndex = block.text.search(/execute\s*[:(]/);
          if (executeIndex === -1) continue;
          const body = block.text.slice(executeIndex);
          if (!/(writeFile|rm\s*\(|unlink|rename\s*\(|exec\s*\(|spawn\s*\()/.test(body)) continue;
          if (/userQuestions|ask\(|confirm|approval|preview/.test(block.text)) continue;
          out.push({
            path: file.path,
            line: file.text.slice(0, block.start).split('\n').length,
            snippet: block.text.slice(0, 400),
            detail: '工具会写/删/执行，但没有确认/审批',
          });
          if (out.length >= 3) return out;
        }
      }
      return out;
    },
  ),
  check(
    'ai.no-fallback', 'ai', 'core', 'P2', 'medium', 'experience',
    copy(
      '模型调用没有失败路径',
      'A model call has no failure path',
      '调用 llm/stream/prepareCall，但没有 try/catch 或降级。',
      'Calls llm/stream/prepareCall without try/catch or a degraded path.',
      '模型会超时、限流、返回空；没有降级时用户只看到转圈或崩溃。',
      'Models time out, rate-limit and return empty; without a fallback users see a spinner or a crash.',
      '给超时、重试、可理解的错误和离线/保守模式；把失败写进 UI。',
      'Add timeout, retry, an understandable error and an offline/conservative mode; surface the failure in the UI.',
    ),
    (ctx) => {
      const out = [];
      for (const file of HOST(ctx)) {
        const index = file.text.search(/ctx\.llm|prepareCall\s*\(|\.stream\s*\(\s*\{|generate\s*\(/);
        if (index === -1) continue;
        const windowText = file.text.slice(Math.max(0, index - 700), Math.min(file.text.length, index + 1600));
        if (/try\s*\{|catch\s*\(|fallback|degraded/.test(windowText)) continue;
        out.push(occ(file, index, '模型调用附近没有 try/catch/降级'));
        if (out.length >= 3) break;
      }
      return out;
    },
  ),
  check(
    'ai.context-bloat', 'ai', 'core', 'P2', 'medium', 'experience',
    copy(
      '上下文被整块塞满',
      'Context is stuffed with whole blocks',
      'systemPrompt/inject 塞整文件或超长文本。',
      'systemPrompt/inject carries whole files or very long text.',
      '上下文越长，中间信息越容易被忽略，成本和延迟也一起上去。',
      'Longer context makes middle information easier to miss and raises cost and latency.',
      '只给需要的片段和索引；长内容按需读取；工具输出设上限。',
      'Send only the needed snippets and an index; read long content on demand; cap tool output.',
    ),
    (ctx) => {
      const out = [];
      for (const file of HOST(ctx)) {
        if (!/systemPrompt\s*\.\s*section/.test(file.text)) continue;
        for (const block of callBlocks(file.text, 'section')) {
          if (block.text.length <= 4000) continue;
          out.push({ path: file.path, line: findBlockRange(file, block), snippet: block.text.slice(0, 300), detail: `systemPrompt section ${block.text.length} 字符` });
          if (out.length >= 3) return out;
        }
        if (/inject\s*\([^)]*readFile|readFile[^)]*inject\s*\(/s.test(file.text)) {
          const match = /readFile/.exec(file.text);
          out.push(occ(file, match.index, '把整文件读进 prompt'));
        }
        if (out.length >= 3) return out;
      }
      return out;
    },
  ),
  check(
    'ai.untrusted-content', 'ai', 'core', 'P1', 'medium', 'read',
    copy(
      '外部内容没有“不可信”边界',
      'External content has no untrusted-data boundary',
      'web/文件内容进 prompt，没有标明是数据而非指令。',
      'Web/file content enters the prompt without being marked as data rather than instructions.',
      '间接提示注入会把检索到的内容变成指令；模型分不清“资料”和“命令”。',
      'Indirect prompt injection turns retrieved content into instructions; the model cannot tell data from commands.',
      '把外部内容放进明确的“不可信数据”块，禁止执行其中的指令；工具输出只当资料。',
      'Put external content in an explicit untrusted-data block, forbid following its instructions, and treat tool output as data.',
    ),
    (ctx) => {
      const out = [];
      for (const file of HOST(ctx)) {
        if (!/ctx\.web\.(?:fetch|search)|readFile\s*\(/.test(file.text)) continue;
        if (!/messages\s*:|system\s*:|prompt\s*:|content\s*:/.test(file.text)) continue;
        if (/untrusted|external content|不可信|外部内容/i.test(file.text)) continue;
        const match = /ctx\.web\.(?:fetch|search)|readFile\s*\(/.exec(file.text);
        out.push(occ(file, match.index, '外部内容进 prompt，没有不可信边界'));
        if (out.length >= 2) break;
      }
      return out;
    },
  ),

  // ------------------------------------------------------------------- meta
  check(
    'meta.manifest-mismatch', 'backend', 'core', 'P1', 'high', 'read',
    copy(
      '清单/补丁/客户端入口对不上',
      'Manifest, patch and client entry do not line up',
      'package/patch/client export 缺失或不一致。',
      'package/patch/client export is missing or inconsistent.',
      'DSH 找不到入口就不会加载；用户看到的是“装了但没反应”。',
      'DSH cannot find the entry and will not load it; users see “installed but nothing happens”.',
      '让 package.name、cordis.patch.yml 的 name、exports["./client"] 互相对齐。',
      'Align package.name, the patch name and exports["./client"].',
    ),
    (ctx) => issueOccurrences(ctx, 'meta.manifest-mismatch'),
  ),
  check(
    'meta.icon', 'backend', 'core', 'P3', 'high', 'experience',
    copy(
      '没有可渲染的插件图标',
      'No renderable plugin icon',
      'package.json 没声明 icon，或声明的图标缺失/无效。',
      'No `icon` in package.json, or the declared icon is missing or invalid.',
      '宿主把 icon 当可选字段：缺了照样加载，只是 Plugin Manager 和插件市场里这一行没有图，只能靠标题认人；声明的路径写错则连这个回退都没有。',
      'The host treats `icon` as optional: the plugin still loads, but its row in Plugin Manager and the market has no image, so people recognise it by title alone — and a wrong declared path silently yields nothing.',
      '放一个小 icon.svg，并在 package.json 里同时写 icon 与 exports["./icon"]；别把大图塞成 base64。',
      'Ship a small icon.svg and declare both `icon` and `exports["./icon"]` in package.json; do not inline a large base64 image.',
    ),
    (ctx) => issueOccurrences(ctx, 'meta.icon'),
  ),
  check(
    'meta.locale-mismatch', 'backend', 'core', 'P2', 'high', 'read',
    copy(
      '中英字典不配对',
      'The zh/en dictionaries are not paired',
      'zh/en key 集不同，或缺 meta.title/description。',
      'zh/en key sets differ, or meta.title/description is missing.',
      '切语言时会出现 key 本身或空白；Plugin Manager 也拿不到标题。',
      'Switching language can show raw keys or blanks; Plugin Manager cannot read the title either.',
      '两种语言的 key 严格配对；meta.title/description 都要有。',
      'Keep both locales key-for-key identical, including meta.title/description.',
    ),
    (ctx) => issueOccurrences(ctx, 'meta.locale-mismatch'),
  ),
];

function toolRegisterBlocks(text) {
  const blocks = [];
  const re = /\.register\s*\(/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    const paren = text.indexOf('(', match.index);
    const block = balancedBlock(text, paren, '(', ')');
    if (!block) continue;
    if (!/\bname\s*:/.test(block.text)) continue;
    if (!/\bdescription\s*:/.test(block.text)) continue;
    blocks.push(block);
    re.lastIndex = block.end + 1;
  }
  return blocks;
}

export function checksFor({ depth = 'standard', focus = [] } = {}) {
  const wantedDimensions = focus.length ? new Set(focus) : null;
  return CHECKS.filter((item) => {
    if (depth === 'quick' && !(item.tier === 'core' && (item.severity === 'P0' || item.severity === 'P1'))) return false;
    if (depth === 'standard' && item.tier !== 'core') return false;
    if (wantedDimensions && !wantedDimensions.has(item.dimension)) return false;
    return true;
  });
}

export function allChecks() {
  return CHECKS;
}

export const CHECK_BY_ID = new Map(CHECKS.map((item) => [item.id, item]));
