(() => {
  // src/client/styles.ts
  var CSS = `
.wl-root {
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-base);
  font-size: 13px;
  line-height: 1.45;
}
.wl-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px 10px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1);
}
.wl-header-row { display: flex; align-items: center; gap: 8px; }
.wl-mark { width: 22px; height: 22px; color: var(--dsw-alias-brand-primary); flex: 0 0 auto; }
.wl-title { margin: 0; font-size: 15px; font-weight: 600; letter-spacing: 0.01em; }
.wl-tagline { margin: 0; color: var(--dsw-alias-label-secondary); font-size: 12px; }
.wl-toolbar {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  align-items: flex-end;
  flex-wrap: wrap;
}
.wl-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1 1 240px; }
.wl-field--depth { flex: 0 0 120px; }
.wl-label { color: var(--dsw-alias-label-secondary); font-size: 11px; }
.wl-input, .wl-select {
  width: 100%;
  min-height: 30px;
  padding: 4px 8px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  box-sizing: border-box;
}
.wl-input:focus-visible, .wl-select:focus-visible, .wl-btn:focus-visible, .wl-tab:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: 2px;
}
.wl-btn {
  min-height: 30px;
  padding: 4px 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  cursor: pointer;
}
.wl-btn--primary {
  border-color: var(--dsw-alias-brand-primary);
  background: var(--dsw-alias-brand-primary);
  color: var(--dsw-alias-bg-base);
  font-weight: 600;
}
.wl-btn:disabled { cursor: default; opacity: 0.6; }
.wl-btn--ghost { border-color: transparent; background: transparent; }
.wl-layout { display: flex; flex: 1 1 auto; min-height: 0; }
.wl-history {
  flex: 0 0 210px;
  min-width: 0;
  border-right: 1px solid var(--dsw-alias-border-l1);
  padding: 10px;
  overflow: auto;
  background: var(--dsw-alias-bg-layer-1);
}
.wl-history-title { margin: 0 0 8px; font-size: 11px; color: var(--dsw-alias-label-secondary); text-transform: uppercase; letter-spacing: 0.08em; }
.wl-history-empty { color: var(--dsw-alias-label-secondary); font-size: 12px; }
.wl-history-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  padding: 7px 8px;
  margin: 0 0 4px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  text-align: left;
  font: inherit;
  cursor: pointer;
}
.wl-history-item[data-active="true"] { border-color: var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); }
.wl-history-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wl-history-meta { color: var(--dsw-alias-label-secondary); font-size: 11px; }
.wl-main { flex: 1 1 auto; min-width: 0; overflow: auto; padding: 14px 16px 28px; }
.wl-empty { display: flex; flex-direction: column; gap: 10px; max-width: 680px; }
.wl-empty h2 { margin: 0; font-size: 18px; }
.wl-empty p { margin: 0; color: var(--dsw-alias-label-secondary); }
.wl-steps { margin: 0; padding-left: 18px; color: var(--dsw-alias-label-secondary); }
.wl-principles { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8px; }
.wl-principle { padding: 10px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; background: var(--dsw-alias-bg-layer-1); }
.wl-privacy { color: var(--dsw-alias-label-secondary); font-size: 11px; }
.wl-hero { display: flex; flex-direction: column; gap: 10px; padding: 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); }
.wl-hero-top { display: flex; gap: 14px; align-items: baseline; flex-wrap: wrap; }
.wl-score { font-size: 30px; font-weight: 700; line-height: 1; }
.wl-score small { font-size: 12px; font-weight: 400; color: var(--dsw-alias-label-secondary); }
.wl-verdict { font-size: 14px; font-weight: 600; }
.wl-counts { display: flex; gap: 6px; flex-wrap: wrap; }
.wl-chip { display: inline-flex; align-items: center; gap: 5px; padding: 1px 7px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 999px; font-size: 11px; color: var(--dsw-alias-label-secondary); }
.wl-dot { width: 7px; height: 7px; border-radius: 999px; background: var(--dsw-alias-state-idle-primary); }
.wl-dot--p0 { background: var(--dsw-alias-state-error-primary); }
.wl-dot--p1 { background: var(--dsw-alias-state-warn-primary); }
.wl-dot--p2 { background: var(--dsw-alias-brand-primary); }
.wl-dot--p3 { background: var(--dsw-alias-state-idle-primary); }
.wl-dims { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; }
.wl-dim { display: flex; flex-direction: column; gap: 3px; }
.wl-dim-head { display: flex; justify-content: space-between; font-size: 12px; }
.wl-bar { height: 5px; border-radius: 999px; background: var(--dsw-alias-bg-layer-2); overflow: hidden; }
.wl-bar > span { display: block; height: 100%; border-radius: inherit; background: var(--dsw-alias-brand-primary); }
.wl-section { margin-top: 16px; }
.wl-section-title { display: flex; align-items: baseline; gap: 8px; margin: 0 0 8px; font-size: 13px; font-weight: 600; }
.wl-section-title small { color: var(--dsw-alias-label-secondary); font-weight: 400; font-size: 11px; }
.wl-list { display: flex; flex-direction: column; gap: 8px; }
.wl-card { padding: 10px 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; background: var(--dsw-alias-bg-layer-1); }
.wl-card--fix { border-left: 3px solid var(--dsw-alias-brand-primary); }
.wl-card-head { display: flex; gap: 8px; align-items: baseline; justify-content: space-between; flex-wrap: wrap; }
.wl-card-title { font-weight: 600; }
.wl-meta { color: var(--dsw-alias-label-secondary); font-size: 11px; }
.wl-why { margin: 6px 0 0; }
.wl-fix { margin: 4px 0 0; }
.wl-code { margin: 6px 0 0; padding: 8px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 6px; background: var(--dsw-alias-bg-layer-2); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; line-height: 1.5; overflow: auto; max-height: 220px; white-space: pre; }
.wl-citations { margin: 6px 0 0; padding-left: 18px; color: var(--dsw-alias-label-secondary); font-size: 11px; }
.wl-citations a { color: var(--dsw-alias-brand-primary); }
.wl-tabs { display: flex; gap: 2px; flex-wrap: wrap; margin: 12px 0 8px; border-bottom: 1px solid var(--dsw-alias-border-l1); }
.wl-tab { padding: 5px 9px; border: 0; border-bottom: 2px solid transparent; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; cursor: pointer; }
.wl-tab[aria-selected="true"] { color: var(--dsw-alias-label-primary); border-bottom-color: var(--dsw-alias-brand-primary); }
.wl-tab small { margin-left: 4px; color: var(--dsw-alias-label-secondary); }
.wl-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.wl-table th, .wl-table td { padding: 5px 6px; border-bottom: 1px solid var(--dsw-alias-border-l1); text-align: left; vertical-align: top; }
.wl-table th { color: var(--dsw-alias-label-secondary); font-weight: 500; }
.wl-status { display: inline-flex; align-items: center; gap: 5px; }
.wl-actions { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
.wl-alert { padding: 8px 10px; border: 1px solid var(--dsw-alias-state-error-primary); border-radius: 8px; background: var(--dsw-alias-bg-layer-1); }
.wl-note { color: var(--dsw-alias-label-secondary); font-size: 11px; }
.wl-skeleton { height: 14px; border-radius: 4px; background: var(--dsw-alias-bg-layer-2); animation: wl-pulse 1.2s ease-in-out infinite; }
@keyframes wl-pulse { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .wl-skeleton { animation: none; }
  .wl-root * { transition: none !important; }
}
@container (max-width: 760px) {
  .wl-layout { flex-direction: column; }
  .wl-history { flex: 0 0 auto; border-right: 0; border-bottom: 1px solid var(--dsw-alias-border-l1); max-height: 120px; display: flex; gap: 6px; overflow-x: auto; padding: 8px; }
  .wl-history-title { display: none; }
  .wl-history-item { min-width: 150px; margin: 0; }
  .wl-toolbar { align-items: stretch; }
  .wl-field, .wl-field--depth { flex: 1 1 100%; }
}
`;

  // src/client/locale.ts
  var DICTIONARY = {
    zh: {
      "panel.title": "\u7231",
      "panel.tagline": "\u4EE5\u7231\u4E3A\u8D77\u70B9\uFF0C\u4EE5\u5BA1\u67E5\u4E3A\u65B9\u6CD5\u3002\u628A\u523A\u7559\u5728\u4EE3\u7801\u4E0A\uFF0C\u4E0D\u7559\u5728\u4EBA\u8EAB\u4E0A\u3002",
      "panel.target": "\u5BA1\u67E5\u5BF9\u8C61",
      "panel.targetPlaceholder": "\u7EDD\u5BF9\u8DEF\u5F84\uFF0C\u6216\u4ECE\u5DF2\u5B89\u88C5\u63D2\u4EF6\u91CC\u9009\u4E00\u4E2A",
      "panel.installed": "\u5DF2\u5B89\u88C5\u63D2\u4EF6",
      "panel.run": "\u5F00\u59CB\u5BA1\u67E5",
      "panel.running": "\u6B63\u5728\u5BA1\u67E5\u2026",
      "panel.depth": "\u6DF1\u5EA6",
      "panel.depth.quick": "\u5FEB\u901F",
      "panel.depth.standard": "\u6807\u51C6",
      "panel.depth.deep": "\u6DF1\u5EA6",
      "panel.history": "\u5386\u53F2",
      "panel.historyEmpty": "\u8FD8\u6CA1\u6709\u5BA1\u67E5\u8BB0\u5F55\u3002",
      "panel.emptyTitle": "\u628A\u63D2\u4EF6\u76EE\u5F55\u7ED9\u6211",
      "panel.emptyBody": "\u6211\u4F1A\u5148\u8BFB\u6E05\u5355\u3001\u5165\u53E3\u3001\u5BA2\u6237\u7AEF\u548C\u6837\u5F0F\uFF0C\u518D\u5BF9\u7167 README \u7684\u627F\u8BFA\u3002\u53EA\u8BFB\uFF0C\u4E0D\u6267\u884C\u4F60\u7684\u4EE3\u7801\u3002",
      "panel.emptyStep1": "\u9009\u4E00\u4E2A\u5DF2\u5B89\u88C5\u63D2\u4EF6\uFF0C\u6216\u586B\u7EDD\u5BF9\u8DEF\u5F84\u3002",
      "panel.emptyStep2": "\u9009\u6807\u51C6\u6216\u6DF1\u5EA6\u5BA1\u67E5\u3002",
      "panel.emptyStep3": "\u5148\u770B\u201C\u5982\u679C\u53EA\u6539\u4E09\u4EF6\u4E8B\u201D\uFF0C\u518D\u770B\u7EC6\u8282\u3002",
      "panel.principle1": "\u5148\u8C08\u5F71\u54CD\uFF0C\u518D\u8C08\u98CE\u683C\u3002",
      "panel.principle2": "\u6BCF\u6761\u90FD\u6709\u4F4D\u7F6E\u548C\u6539\u6CD5\u3002",
      "panel.principle3": "\u6253\u5206\u7684\u662F\u8FD9\u4E00\u7248\uFF0C\u4E0D\u662F\u5199\u5B83\u7684\u4EBA\u3002",
      "panel.privacy": "\u53EA\u8BFB\u5BA1\u67E5 \xB7 \u4E0D\u6267\u884C\u76EE\u6807\u4EE3\u7801 \xB7 \u4E0D\u8054\u7F51 \xB7 \u5386\u53F2\u4FDD\u5B58\u5728\u672C\u673A",
      "panel.score": "\u603B\u5206",
      "panel.verdict": "\u4E00\u53E5\u8BDD",
      "panel.strengths": "\u5B83\u505A\u5BF9\u7684",
      "panel.topFixes": "\u5982\u679C\u53EA\u6539\u4E09\u4EF6\u4E8B",
      "panel.findings": "\u6309\u7EF4\u5EA6\u770B",
      "panel.budget": "\u6027\u80FD\u9884\u7B97",
      "panel.manual": "\u9700\u8981\u4F60\u4EB2\u773C\u770B\u4E00\u773C",
      "panel.coverage": "\u770B\u5230\u54EA\u91CC\u3001\u6CA1\u770B\u5230\u54EA\u91CC",
      "panel.questions": "\u503C\u5F97\u518D\u95EE\u81EA\u5DF1\u7684\u56DB\u4E2A\u95EE\u9898",
      "panel.copy": "\u590D\u5236\u62A5\u544A",
      "panel.copied": "\u5DF2\u590D\u5236",
      "panel.export": "\u5BFC\u51FA Markdown",
      "panel.copyPrompt": "\u590D\u5236\u7ED9 AI \u7684\u590D\u5BA1\u63D0\u793A",
      "panel.promptCopied": "\u63D0\u793A\u5DF2\u590D\u5236",
      "panel.loading": "\u6B63\u5728\u8BFB\u53D6\u2026",
      "panel.error": "\u8BFB\u53D6\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u76EE\u6807\u662F\u5426\u53EF\u8BFB\u3002",
      "panel.retry": "\u91CD\u8BD5",
      "panel.noFindings": "\u8FD9\u4E00\u7EF4\u5EA6\u6CA1\u6709\u627E\u5230\u786C\u4F24\u3002\u4E0D\u7B49\u4E8E\u5B8C\u7F8E\uFF0C\u53EA\u8BF4\u660E\u9759\u6001\u89C4\u5219\u6CA1\u6293\u5230\u3002",
      "panel.noStrengths": "\u8FD9\u7248\u8FD8\u6CA1\u6709\u7ED3\u6784\u6027\u7684\u4EAE\u70B9\uFF1B\u4F46\u5B83\u88AB\u8BA4\u771F\u770B\u8FC7\u4E86\uFF0C\u8FD9\u672C\u8EAB\u662F\u4E00\u4E2A\u5F00\u59CB\u3002",
      "panel.more": "\u5C55\u5F00",
      "panel.less": "\u6536\u8D77",
      "panel.occurrences": "\u5904",
      "panel.confidence": "\u7F6E\u4FE1\u5EA6",
      "panel.basisRead": "\u5DF2\u8BFB\u4F9D\u636E",
      "panel.basisExperience": "\u5DE5\u7A0B\u5224\u65AD",
      "panel.severity.P0": "\u4F1A\u4F24\u4EBA",
      "panel.severity.P1": "\u8BE5\u4FEE",
      "panel.severity.P2": "\u5EFA\u8BAE",
      "panel.severity.P3": "\u987A\u624B",
      "panel.dimension.all": "\u5168\u90E8",
      "panel.dimension.backend": "\u540E\u7AEF",
      "panel.dimension.frontend": "\u524D\u7AEF",
      "panel.dimension.ui": "UI",
      "panel.dimension.ux": "UX",
      "panel.dimension.performance": "\u6027\u80FD",
      "panel.dimension.ai": "AI \u65F6\u4EE3",
      "panel.depthBadge": "\u6DF1\u5EA6\u5BA1\u67E5",
      "panel.partial": "\u7ED3\u679C\u4E0D\u5B8C\u6574",
      "panel.persistedFalse": "\u672C\u6B21\u7ED3\u679C\u672A\u843D\u76D8",
      "panel.reviewed": "\u5BA1\u4E86",
      "panel.lines": "\u884C",
      "panel.skipped": "\u8DF3\u8FC7",
      "panel.notRun": "\u9759\u6001\u5BA1\u67E5\u6CA1\u6709\u505A\uFF1A\u8FD0\u884C\u65F6\u6027\u80FD\u3001Lighthouse\u3001\u771F\u5B9E\u7F51\u7EDC\u8BA1\u65F6\u3001\u5185\u5B58\u3002",
      "panel.budgetWithin": "\u5728\u9884\u7B97\u5185",
      "panel.budgetOver": "\u8D85\u9884\u7B97",
      "panel.budgetValue": "\u5B9E\u6D4B",
      "panel.budgetLimit": "\u9884\u7B97",
      "panel.budgetStatus": "\u72B6\u6001",
      "panel.budget.clientBytes": "\u5BA2\u6237\u7AEF\u5305\u4F53",
      "panel.budget.inlineAssetBytes": "\u5185\u8054\u8D44\u6E90",
      "panel.budget.syncIoCalls": "\u540C\u6B65 IO",
      "panel.budget.pollingIntervals": "\u8F6E\u8BE2\u95F4\u9694",
      "panel.budget.fetchWithoutAbort": "\u672A\u53D6\u6D88 fetch",
      "panel.budget.serialAwaitLoops": "\u4E32\u884C await \u5FAA\u73AF",
      "panel.budget.layoutAnimationRules": "\u5E03\u5C40\u5C5E\u6027\u52A8\u753B",
      "panel.fixLabel": "\u600E\u4E48\u6539",
      "panel.questions.0": "\u5F31\u7F51\u3001\u6A21\u578B\u8D85\u65F6\u6216\u9650\u6D41\u65F6\uFF0C\u8FD9\u7248\u4F1A\u600E\u4E48\u8868\u73B0\uFF1F\u7528\u6237\u770B\u5F97\u5230\u201C\u6B63\u5728\u91CD\u8BD5\u201D\u8FD8\u662F\u53EA\u770B\u5230\u8F6C\u5708\uFF1F",
      "panel.questions.1": "\u7528\u6237\u7B2C\u4E00\u6B21\u6253\u5F00\u65F6\uFF0C\u77E5\u9053\u4E0B\u4E00\u6B65\u8BE5\u70B9\u54EA\u91CC\u5417\uFF1F\u7A7A\u72B6\u6001\u6709\u6CA1\u6709\u544A\u8BC9\u4ED6\uFF1F",
      "panel.questions.2": "\u5220\u9664\u3001\u8986\u76D6\u3001\u5378\u8F7D\u8FD9\u7C7B\u64CD\u4F5C\uFF0C\u8BEF\u70B9\u4E4B\u540E\u8FD8\u80FD\u56DE\u6765\u5417\uFF1F\u64A4\u9500\u6BD4\u786E\u8BA4\u66F4\u4E0D\u6253\u6270\u3002",
      "panel.questions.3": "\u54EA\u4E9B\u6570\u636E\u4F1A\u79BB\u5F00\u8FD9\u53F0\u673A\u5668\uFF1F\u6A21\u578B\u3001\u65E5\u5FD7\u3001\u5D29\u6E83\u4E0A\u62A5\u5206\u522B\u62FF\u5230\u4E86\u4EC0\u4E48\uFF1F",
      "panel.aiPrompt": "\u8BF7\u57FA\u4E8E\u4E0B\u9762\u8FD9\u4EFD\u53EA\u8BFB\u5BA1\u67E5\u8BC1\u636E\uFF0C\u7528\u4E2D\u6587\u5199\u4E00\u6BB5\u201C\u4EE5\u7231\u4E3A\u8D77\u70B9\u201D\u7684\u590D\u5BA1\uFF1A\u5148\u8BF4\u6211\u505A\u5BF9\u7684\u5730\u65B9\uFF0C\u518D\u6311\u4E09\u4EF6\u6700\u503C\u5F97\u5148\u4FEE\u7684\uFF0C\u6BCF\u6761\u7ED9\u8BC1\u636E\u3001\u7528\u6237\u5F71\u54CD\u548C\u6700\u5C0F\u6539\u6CD5\u3002\u4E0D\u8981\u7F16\u9020\u6CA1\u6709\u8BC1\u636E\u7684\u95EE\u9898\u3002\n\n\u76EE\u6807\uFF1A{target}\n\u5206\u6570\uFF1A{score}\n\n{markdown}",
      "panel.selectHint": "\u5DF2\u5B89\u88C5\u63D2\u4EF6\u53EF\u76F4\u63A5\u9009\uFF1B\u4E5F\u53EF\u4EE5\u586B\u4EFB\u610F\u672C\u5730\u63D2\u4EF6\u76EE\u5F55\u3002",
      "panel.oldRules": "\u65E7\u89C4\u5219\u7248\u672C",
      "panel.close": "\u5173\u95ED"
    },
    en: {
      "panel.title": "Love",
      "panel.tagline": "Love is the starting point; review is the method. Keep the thorn in the code, not in the person.",
      "panel.target": "Target",
      "panel.targetPlaceholder": "Absolute path, or pick an installed plugin",
      "panel.installed": "Installed plugins",
      "panel.run": "Review",
      "panel.running": "Reviewing\u2026",
      "panel.depth": "Depth",
      "panel.depth.quick": "Quick",
      "panel.depth.standard": "Standard",
      "panel.depth.deep": "Deep",
      "panel.history": "History",
      "panel.historyEmpty": "No reviews yet.",
      "panel.emptyTitle": "Give me a plugin directory",
      "panel.emptyBody": "I read the manifest, entries, client and styles, then compare them with the README. Read-only; I never execute your code.",
      "panel.emptyStep1": "Pick an installed plugin or enter an absolute path.",
      "panel.emptyStep2": "Choose standard or deep review.",
      "panel.emptyStep3": "Read \u201Cif you only fix three things\u201D first, then the details.",
      "panel.principle1": "Impact first, style second.",
      "panel.principle2": "Every finding has a location and a fix.",
      "panel.principle3": "The score is about this version, not the person who wrote it.",
      "panel.privacy": "Read-only \xB7 no target execution \xB7 no network \xB7 history stays local",
      "panel.score": "Score",
      "panel.verdict": "In one line",
      "panel.strengths": "What it gets right",
      "panel.topFixes": "If you only fix three things",
      "panel.findings": "By dimension",
      "panel.budget": "Performance budgets",
      "panel.manual": "Please look at these yourself",
      "panel.coverage": "What I saw, and what I did not",
      "panel.questions": "Four questions worth asking yourself",
      "panel.copy": "Copy report",
      "panel.copied": "Copied",
      "panel.export": "Export Markdown",
      "panel.copyPrompt": "Copy AI review prompt",
      "panel.promptCopied": "Prompt copied",
      "panel.loading": "Loading\u2026",
      "panel.error": "Could not load. Check that the target is readable.",
      "panel.retry": "Retry",
      "panel.noFindings": "No hard findings in this dimension. That is not perfection; the static rules simply missed it.",
      "panel.noStrengths": "No structural highlight yet; but it has been looked at carefully, and that is a start.",
      "panel.more": "Expand",
      "panel.less": "Collapse",
      "panel.occurrences": "occurrence(s)",
      "panel.confidence": "Confidence",
      "panel.basisRead": "Read source",
      "panel.basisExperience": "Engineering judgment",
      "panel.severity.P0": "blocks users",
      "panel.severity.P1": "should fix",
      "panel.severity.P2": "suggested",
      "panel.severity.P3": "nit",
      "panel.dimension.all": "All",
      "panel.dimension.backend": "Backend",
      "panel.dimension.frontend": "Frontend",
      "panel.dimension.ui": "UI",
      "panel.dimension.ux": "UX",
      "panel.dimension.performance": "Performance",
      "panel.dimension.ai": "AI era",
      "panel.depthBadge": "Deep review",
      "panel.partial": "Partial result",
      "panel.persistedFalse": "This result was not saved",
      "panel.reviewed": "Reviewed",
      "panel.lines": "lines",
      "panel.skipped": "Skipped",
      "panel.notRun": "Static review does not include runtime performance, Lighthouse, real network timing or memory.",
      "panel.budgetWithin": "Within budget",
      "panel.budgetOver": "Over budget",
      "panel.budgetValue": "Measured",
      "panel.budgetLimit": "Budget",
      "panel.budgetStatus": "Status",
      "panel.budget.clientBytes": "Client bundle",
      "panel.budget.inlineAssetBytes": "Inline assets",
      "panel.budget.syncIoCalls": "Sync IO",
      "panel.budget.pollingIntervals": "Polling",
      "panel.budget.fetchWithoutAbort": "Fetch without abort",
      "panel.budget.serialAwaitLoops": "Serial await loops",
      "panel.budget.layoutAnimationRules": "Layout animation rules",
      "panel.fixLabel": "Fix",
      "panel.questions.0": "What happens on a slow network, a model timeout or a rate limit? Does the user see a retry, or just a spinner?",
      "panel.questions.1": "On first open, does the user know what to click next? Does the empty state tell them?",
      "panel.questions.2": "If a delete, overwrite or uninstall is mis-clicked, can they come back? Undo is kinder than a confirmation.",
      "panel.questions.3": "Which data leaves this machine? What do the model, logs and crash reporting each receive?",
      "panel.aiPrompt": "Using the read-only review evidence below, write a \u201Clove-first\u201D follow-up in English: start with what the plugin gets right, then pick the three fixes that matter most. Every point needs evidence, user impact and the smallest fix. Do not invent findings.\n\nTarget: {target}\nScore: {score}\n\n{markdown}",
      "panel.selectHint": "Pick an installed plugin, or enter any local plugin directory.",
      "panel.oldRules": "Older rules version",
      "panel.close": "Close"
    }
  };

  // src/client/app.tsx
  var React;
  function setReactRuntime(runtime) {
    React = runtime;
  }
  var DIMENSIONS = ["backend", "frontend", "ui", "ux", "performance", "ai"];
  function translate(lang, key, params) {
    const dict = DICTIONARY[lang] || DICTIONARY.zh;
    const fallback = DICTIONARY.en[key] || key;
    let text = dict[key] ?? fallback;
    if (params) {
      for (const [name, value] of Object.entries(params)) text = text.replaceAll(`{${name}}`, String(value));
    }
    return text;
  }
  function useLang(ctx) {
    const subscribe = (callback) => ctx.locale.subscribe(callback);
    const getSnapshot = () => {
      const snapshot = typeof ctx.locale.getSnapshot === "function" ? ctx.locale.getSnapshot() : ctx.locale.getLocale();
      return snapshot && snapshot.active === "en" ? "en" : "zh";
    };
    return React.useSyncExternalStore(subscribe, getSnapshot, () => "zh");
  }
  async function requestJson(url, options = {}) {
    const response = await fetch(url, {
      credentials: "same-origin",
      headers: { accept: "application/json", ...options.body ? { "content-type": "application/json" } : {} },
      ...options
    });
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    if (!response.ok || !data || data.ok !== true) {
      const message = data && data.error && data.error.message ? data.error.message : `HTTP ${response.status}`;
      throw new Error(message);
    }
    return data;
  }
  function formatDate(value, lang) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    try {
      return new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-GB", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(date);
    } catch {
      return value;
    }
  }
  function severityLabel(lang, severity) {
    return translate(lang, `panel.severity.${severity}`);
  }
  function dimensionLabel(lang, id) {
    return translate(lang, `panel.dimension.${id}`);
  }
  function activeText(lang, review) {
    return lang === "zh" ? review.score.verdict.text : review.score.verdict.text;
  }
  function budgetRows(lang, budget) {
    if (!budget || !budget.values || !budget.budgets) return [];
    const v = budget.values;
    const b = budget.budgets;
    return [
      { id: "clientBytes", label: translate(lang, "panel.budget.clientBytes"), value: `${(v.clientBytes / 1024).toFixed(0)}KB`, limit: `\u2264 ${(b.clientBytesWarn / 1024).toFixed(0)}KB`, over: v.clientBytes > b.clientBytesWarn },
      { id: "inlineAssetBytes", label: translate(lang, "panel.budget.inlineAssetBytes"), value: `${(v.inlineAssetBytes / 1024).toFixed(0)}KB`, limit: `\u2264 ${(b.inlineAssetBytes / 1024).toFixed(0)}KB`, over: v.inlineAssetBytes > b.inlineAssetBytes },
      { id: "syncIoCalls", label: translate(lang, "panel.budget.syncIoCalls"), value: String(v.syncIoCalls), limit: "0", over: v.syncIoCalls > 0 },
      { id: "pollingIntervals", label: translate(lang, "panel.budget.pollingIntervals"), value: v.pollingIntervals.length ? v.pollingIntervals.map((ms) => `${ms}ms`).join(", ") : "\u2014", limit: `\u2265 ${b.pollingMinMs}ms`, over: v.pollingIntervals.some((ms) => ms < b.pollingMinMs) },
      { id: "fetchWithoutAbort", label: translate(lang, "panel.budget.fetchWithoutAbort"), value: String(v.fetchWithoutAbort), limit: "0", over: v.fetchWithoutAbort > 0 },
      { id: "serialAwaitLoops", label: translate(lang, "panel.budget.serialAwaitLoops"), value: String(v.serialAwaitLoops), limit: "0", over: v.serialAwaitLoops > 0 },
      { id: "layoutAnimationRules", label: translate(lang, "panel.budget.layoutAnimationRules"), value: String(v.layoutAnimationRules), limit: "0", over: v.layoutAnimationRules > 0 }
    ];
  }
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
  function downloadMarkdown(review) {
    const blob = new Blob([review.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${review.target && review.target.name || "plugin"}-review-${review.id}.md`;
    anchor.rel = "noreferrer";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1e3);
  }
  function SidebarIcon(props) {
    const size = props && props.size ? props.size : 16;
    return /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true", style: { display: "inline-flex", width: size, height: size } }, /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", width: size, height: size, fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M12 20s-7-4.4-7-9.4A4 4 0 0 1 12 8a4 4 0 0 1 7 2.6C19 15.6 12 20 12 20Z" }), /* @__PURE__ */ React.createElement("circle", { cx: "11", cy: "10.5", r: "2.4" }), /* @__PURE__ */ React.createElement("path", { d: "m13 12.5 2.3 2.3" })));
  }
  function FindingCard(props) {
    const { finding, lang, expanded, onToggle } = props;
    const t = (key) => translate(lang, key);
    const citations = Array.isArray(finding.citations) ? finding.citations : [];
    return /* @__PURE__ */ React.createElement("article", { className: "wl-card" }, /* @__PURE__ */ React.createElement("div", { className: "wl-card-head" }, /* @__PURE__ */ React.createElement("span", { className: "wl-card-title" }, /* @__PURE__ */ React.createElement("span", { className: `wl-dot wl-dot--${finding.severity.toLowerCase()}`, "aria-hidden": "true" }), " ", finding.title), /* @__PURE__ */ React.createElement("span", { className: "wl-meta" }, severityLabel(lang, finding.severity), " \xB7 ", t("panel.confidence"), " ", finding.confidence)), /* @__PURE__ */ React.createElement("div", { className: "wl-meta" }, /* @__PURE__ */ React.createElement("code", null, finding.evidence.path, ":", finding.evidence.line), finding.occurrences.length > 1 ? ` \xB7 ${finding.occurrences.length} ${t("panel.occurrences")}` : ""), /* @__PURE__ */ React.createElement("p", { className: "wl-why" }, finding.why), /* @__PURE__ */ React.createElement("p", { className: "wl-fix" }, /* @__PURE__ */ React.createElement("strong", null, t("panel.fixLabel"), "\uFF1A"), finding.fix), /* @__PURE__ */ React.createElement("button", { type: "button", className: "wl-btn wl-btn--ghost", "aria-expanded": expanded, onClick: onToggle }, expanded ? t("panel.less") : t("panel.more")), expanded ? /* @__PURE__ */ React.createElement("div", null, finding.evidence.snippet ? /* @__PURE__ */ React.createElement("pre", { className: "wl-code" }, finding.evidence.snippet) : null, finding.occurrences.length > 1 ? /* @__PURE__ */ React.createElement("ul", { className: "wl-citations" }, finding.occurrences.slice(1, 8).map((item) => /* @__PURE__ */ React.createElement("li", { key: `${item.path}:${item.line}` }, /* @__PURE__ */ React.createElement("code", null, item.path, ":", item.line), item.detail ? ` \u2014 ${item.detail}` : ""))) : null, /* @__PURE__ */ React.createElement("div", { className: "wl-meta" }, finding.basis === "read" ? t("panel.basisRead") : t("panel.basisExperience")), citations.length ? /* @__PURE__ */ React.createElement("ul", { className: "wl-citations" }, citations.map((citation) => /* @__PURE__ */ React.createElement("li", { key: citation.id }, citation.url ? /* @__PURE__ */ React.createElement("a", { href: citation.url, target: "_blank", rel: "noreferrer" }, citation.title) : citation.title, citation.locator ? ` \xB7 ${citation.locator}` : ""))) : null) : null);
  }
  function App(props) {
    const { ctx } = props;
    const lang = useLang(ctx);
    const t = (key, params) => translate(lang, key, params);
    const [state, setState] = React.useState({ targets: [], reviews: [] });
    const [target, setTarget] = React.useState("");
    const [depth, setDepth] = React.useState("standard");
    const [review, setReview] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");
    const [activeTab, setActiveTab] = React.useState("all");
    const [expanded, setExpanded] = React.useState({});
    const [copied, setCopied] = React.useState(false);
    const [promptCopied, setPromptCopied] = React.useState(false);
    const runController = React.useRef(null);
    const copyTimer = React.useRef(void 0);
    const promptTimer = React.useRef(void 0);
    const reviewId = React.useRef("");
    const refreshState = React.useCallback(async (signal) => {
      const data = await requestJson(`/api/love/state?lang=${lang}`, { signal });
      setState({ targets: data.targets || [], reviews: data.reviews || [] });
    }, [lang]);
    React.useEffect(() => {
      const controller = new AbortController();
      refreshState(controller.signal).catch((err) => {
        if (err && err.name !== "AbortError") setError(t("panel.error"));
      });
      return () => controller.abort();
    }, [refreshState, lang]);
    React.useEffect(() => {
      if (!reviewId.current) return;
      const controller = new AbortController();
      requestJson(`/api/love/review?id=${encodeURIComponent(reviewId.current)}&lang=${lang}`, { signal: controller.signal }).then((data) => setReview(data.review)).catch((err) => {
        if (err && err.name !== "AbortError") setError(t("panel.error"));
      });
      return () => controller.abort();
    }, [lang]);
    React.useEffect(() => () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      if (promptTimer.current) window.clearTimeout(promptTimer.current);
      if (runController.current) runController.current.abort();
    }, []);
    const runReview = async () => {
      if (!target.trim() || loading) return;
      if (runController.current) runController.current.abort();
      const controller = new AbortController();
      runController.current = controller;
      setLoading(true);
      setError("");
      try {
        const data = await requestJson("/api/love/review", {
          method: "POST",
          body: JSON.stringify({ target: target.trim(), lang, depth }),
          signal: controller.signal
        });
        setReview(data.review);
        reviewId.current = data.review.id;
        setActiveTab("all");
        setExpanded({});
        await refreshState(controller.signal);
      } catch (err) {
        if (!err || err.name !== "AbortError") setError(t("panel.error"));
      } finally {
        if (runController.current === controller) setLoading(false);
      }
    };
    const loadHistory = async (id) => {
      setLoading(true);
      setError("");
      try {
        const data = await requestJson(`/api/love/review?id=${encodeURIComponent(id)}&lang=${lang}`);
        setReview(data.review);
        reviewId.current = data.review.id;
        setActiveTab("all");
        setExpanded({});
      } catch {
        setError(t("panel.error"));
      } finally {
        setLoading(false);
      }
    };
    const onCopy = async () => {
      if (!review) return;
      if (await copyText(review.markdown)) {
        setCopied(true);
        if (copyTimer.current) window.clearTimeout(copyTimer.current);
        copyTimer.current = window.setTimeout(() => setCopied(false), 1800);
      }
    };
    const onCopyPrompt = async () => {
      if (!review) return;
      const prompt = t("panel.aiPrompt", {
        target: review.target.title || review.target.name,
        score: String(review.score.total),
        markdown: review.markdown
      });
      if (await copyText(prompt)) {
        setPromptCopied(true);
        if (promptTimer.current) window.clearTimeout(promptTimer.current);
        promptTimer.current = window.setTimeout(() => setPromptCopied(false), 1800);
      }
    };
    const tabs = ["all", ...DIMENSIONS];
    const tabCount = (id) => id === "all" ? review ? review.findings.length : 0 : review ? review.findings.filter((finding) => finding.dimension === id).length : 0;
    const visibleFindings = review ? review.findings.filter((finding) => activeTab === "all" || finding.dimension === activeTab) : [];
    const topFixes = review && review.topFixes ? review.topFixes.map((id) => review.findings.find((finding) => finding.id === id)).filter(Boolean) : [];
    return /* @__PURE__ */ React.createElement("div", { className: "wl-root" }, /* @__PURE__ */ React.createElement("style", null, CSS), /* @__PURE__ */ React.createElement("header", { className: "wl-header" }, /* @__PURE__ */ React.createElement("div", { className: "wl-header-row" }, /* @__PURE__ */ React.createElement("span", { className: "wl-mark" }, /* @__PURE__ */ React.createElement(SidebarIcon, { size: 22 })), /* @__PURE__ */ React.createElement("h1", { className: "wl-title" }, t("panel.title"))), /* @__PURE__ */ React.createElement("p", { className: "wl-tagline" }, t("panel.tagline"))), /* @__PURE__ */ React.createElement("div", { className: "wl-toolbar" }, /* @__PURE__ */ React.createElement("label", { className: "wl-field" }, /* @__PURE__ */ React.createElement("span", { className: "wl-label" }, t("panel.target")), /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "wl-input",
        list: "wl-target-list",
        value: target,
        placeholder: t("panel.targetPlaceholder"),
        onChange: (event) => setTarget(event.target.value),
        onKeyDown: (event) => {
          if (event.key === "Enter") void runReview();
        }
      }
    ), /* @__PURE__ */ React.createElement("datalist", { id: "wl-target-list" }, state.targets.map((item) => /* @__PURE__ */ React.createElement("option", { key: item.name, value: item.name }, item.title || item.name)))), /* @__PURE__ */ React.createElement("label", { className: "wl-field wl-field--depth" }, /* @__PURE__ */ React.createElement("span", { className: "wl-label" }, t("panel.depth")), /* @__PURE__ */ React.createElement("select", { className: "wl-select", value: depth, onChange: (event) => setDepth(event.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "quick" }, t("panel.depth.quick")), /* @__PURE__ */ React.createElement("option", { value: "standard" }, t("panel.depth.standard")), /* @__PURE__ */ React.createElement("option", { value: "deep" }, t("panel.depth.deep")))), /* @__PURE__ */ React.createElement("button", { type: "button", className: "wl-btn wl-btn--primary", onClick: () => void runReview(), disabled: loading || !target.trim() }, loading ? t("panel.running") : t("panel.run"))), /* @__PURE__ */ React.createElement("div", { className: "wl-layout" }, /* @__PURE__ */ React.createElement("aside", { className: "wl-history", "aria-label": t("panel.history") }, /* @__PURE__ */ React.createElement("h2", { className: "wl-history-title" }, t("panel.history")), state.reviews.length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "wl-history-empty" }, t("panel.historyEmpty")) : null, state.reviews.map((item) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: item.id,
        type: "button",
        className: "wl-history-item",
        "data-active": review && review.id === item.id ? "true" : "false",
        onClick: () => void loadHistory(item.id)
      },
      /* @__PURE__ */ React.createElement("span", { className: "wl-history-name" }, item.target ? item.target.title || item.target.name : item.id),
      /* @__PURE__ */ React.createElement("span", { className: "wl-history-meta" }, item.score == null ? "" : item.score, " \xB7 ", formatDate(item.createdAt, lang), " \xB7 ", item.depth)
    ))), /* @__PURE__ */ React.createElement("main", { className: "wl-main" }, error ? /* @__PURE__ */ React.createElement("div", { className: "wl-alert", role: "alert" }, /* @__PURE__ */ React.createElement("p", null, error), /* @__PURE__ */ React.createElement("button", { type: "button", className: "wl-btn", onClick: () => reviewId.current ? void loadHistory(reviewId.current) : void runReview() }, t("panel.retry"))) : null, !review && loading ? /* @__PURE__ */ React.createElement("div", { className: "wl-list", "aria-live": "polite" }, /* @__PURE__ */ React.createElement("div", { className: "wl-skeleton", style: { width: "40%" } }), /* @__PURE__ */ React.createElement("div", { className: "wl-skeleton", style: { width: "70%" } }), /* @__PURE__ */ React.createElement("div", { className: "wl-skeleton", style: { width: "55%" } })) : null, !review && !loading && !error ? /* @__PURE__ */ React.createElement("div", { className: "wl-empty" }, /* @__PURE__ */ React.createElement("h2", null, t("panel.emptyTitle")), /* @__PURE__ */ React.createElement("p", null, t("panel.emptyBody")), /* @__PURE__ */ React.createElement("ol", { className: "wl-steps" }, /* @__PURE__ */ React.createElement("li", null, t("panel.emptyStep1")), /* @__PURE__ */ React.createElement("li", null, t("panel.emptyStep2")), /* @__PURE__ */ React.createElement("li", null, t("panel.emptyStep3"))), /* @__PURE__ */ React.createElement("div", { className: "wl-principles" }, /* @__PURE__ */ React.createElement("div", { className: "wl-principle" }, t("panel.principle1")), /* @__PURE__ */ React.createElement("div", { className: "wl-principle" }, t("panel.principle2")), /* @__PURE__ */ React.createElement("div", { className: "wl-principle" }, t("panel.principle3"))), /* @__PURE__ */ React.createElement("p", { className: "wl-privacy" }, t("panel.privacy")), /* @__PURE__ */ React.createElement("p", { className: "wl-note" }, t("panel.selectHint"))) : null, review ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("section", { className: "wl-hero" }, /* @__PURE__ */ React.createElement("div", { className: "wl-hero-top" }, /* @__PURE__ */ React.createElement("div", { className: "wl-score" }, review.score.total, /* @__PURE__ */ React.createElement("small", null, " / 100")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "wl-verdict" }, activeText(lang, review)), /* @__PURE__ */ React.createElement("div", { className: "wl-meta" }, review.target.title || review.target.name, review.target.version ? ` v${review.target.version}` : "", " \xB7 ", formatDate(review.createdAt, lang), " \xB7 ", t(`panel.depth.${review.depth}`), review.depth === "deep" ? ` \xB7 ${t("panel.depthBadge")}` : ""))), /* @__PURE__ */ React.createElement("div", { className: "wl-counts" }, ["P0", "P1", "P2", "P3"].map((severity) => /* @__PURE__ */ React.createElement("span", { className: "wl-chip", key: severity }, /* @__PURE__ */ React.createElement("span", { className: `wl-dot wl-dot--${severity.toLowerCase()}`, "aria-hidden": "true" }), severityLabel(lang, severity), " ", review.score.counts[severity] || 0)), review.persisted === false ? /* @__PURE__ */ React.createElement("span", { className: "wl-chip" }, t("panel.persistedFalse")) : null, review.coverage && review.coverage.partial ? /* @__PURE__ */ React.createElement("span", { className: "wl-chip" }, t("panel.partial")) : null), /* @__PURE__ */ React.createElement("div", { className: "wl-dims" }, DIMENSIONS.filter((id) => review.score.dimensions[id] !== void 0).map((id) => /* @__PURE__ */ React.createElement("div", { className: "wl-dim", key: id }, /* @__PURE__ */ React.createElement("div", { className: "wl-dim-head" }, /* @__PURE__ */ React.createElement("span", null, dimensionLabel(lang, id)), /* @__PURE__ */ React.createElement("span", null, review.score.dimensions[id])), /* @__PURE__ */ React.createElement("div", { className: "wl-bar" }, /* @__PURE__ */ React.createElement("span", { style: { width: `${Math.max(0, Math.min(100, review.score.dimensions[id]))}%` } }))))), /* @__PURE__ */ React.createElement("div", { className: "wl-actions" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "wl-btn", onClick: () => void onCopy() }, copied ? t("panel.copied") : t("panel.copy")), /* @__PURE__ */ React.createElement("button", { type: "button", className: "wl-btn", onClick: () => downloadMarkdown(review) }, t("panel.export")), /* @__PURE__ */ React.createElement("button", { type: "button", className: "wl-btn", onClick: () => void onCopyPrompt() }, promptCopied ? t("panel.promptCopied") : t("panel.copyPrompt")))), /* @__PURE__ */ React.createElement("section", { className: "wl-section" }, /* @__PURE__ */ React.createElement("h2", { className: "wl-section-title" }, t("panel.strengths")), review.strengths.length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "wl-note" }, t("panel.noStrengths")) : /* @__PURE__ */ React.createElement("ul", null, review.strengths.map((item) => /* @__PURE__ */ React.createElement("li", { key: item.id }, item.title, item.evidence ? /* @__PURE__ */ React.createElement("span", { className: "wl-meta" }, " \u2014 ", /* @__PURE__ */ React.createElement("code", null, item.evidence)) : null)))), /* @__PURE__ */ React.createElement("section", { className: "wl-section" }, /* @__PURE__ */ React.createElement("h2", { className: "wl-section-title" }, t("panel.topFixes")), /* @__PURE__ */ React.createElement("div", { className: "wl-list" }, topFixes.length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "wl-note" }, t("panel.noFindings")) : topFixes.map((finding) => /* @__PURE__ */ React.createElement("div", { className: "wl-card wl-card--fix", key: `top-${finding.id}` }, /* @__PURE__ */ React.createElement("div", { className: "wl-card-head" }, /* @__PURE__ */ React.createElement("span", { className: "wl-card-title" }, finding.title), /* @__PURE__ */ React.createElement("span", { className: "wl-meta" }, severityLabel(lang, finding.severity), " \xB7 ", /* @__PURE__ */ React.createElement("code", null, finding.evidence.path, ":", finding.evidence.line))), /* @__PURE__ */ React.createElement("p", { className: "wl-why" }, finding.why), /* @__PURE__ */ React.createElement("p", { className: "wl-fix" }, /* @__PURE__ */ React.createElement("strong", null, t("panel.fixLabel"), "\uFF1A"), finding.fix))))), /* @__PURE__ */ React.createElement("section", { className: "wl-section" }, /* @__PURE__ */ React.createElement("h2", { className: "wl-section-title" }, t("panel.findings")), /* @__PURE__ */ React.createElement("div", { className: "wl-tabs", role: "tablist", "aria-label": t("panel.findings") }, tabs.map((id) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: id,
        type: "button",
        role: "tab",
        className: "wl-tab",
        "aria-selected": activeTab === id,
        onClick: () => setActiveTab(id)
      },
      dimensionLabel(lang, id),
      /* @__PURE__ */ React.createElement("small", null, tabCount(id))
    ))), /* @__PURE__ */ React.createElement("div", { className: "wl-list", role: "tabpanel" }, visibleFindings.length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "wl-note" }, t("panel.noFindings")) : visibleFindings.map((finding) => /* @__PURE__ */ React.createElement(
      FindingCard,
      {
        key: finding.id,
        finding,
        lang,
        expanded: !!expanded[finding.id],
        onToggle: () => setExpanded((current) => ({ ...current, [finding.id]: !current[finding.id] }))
      }
    )))), /* @__PURE__ */ React.createElement("section", { className: "wl-section" }, /* @__PURE__ */ React.createElement("h2", { className: "wl-section-title" }, t("panel.budget")), /* @__PURE__ */ React.createElement("table", { className: "wl-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, t("panel.budgetValue")), /* @__PURE__ */ React.createElement("th", null, t("panel.budgetLimit")), /* @__PURE__ */ React.createElement("th", null, t("panel.budgetStatus")))), /* @__PURE__ */ React.createElement("tbody", null, budgetRows(lang, review.budget).map((row) => /* @__PURE__ */ React.createElement("tr", { key: row.id }, /* @__PURE__ */ React.createElement("td", null, row.label, /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { className: "wl-meta" }, row.value)), /* @__PURE__ */ React.createElement("td", null, row.limit), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "wl-status" }, /* @__PURE__ */ React.createElement("span", { className: `wl-dot ${row.over ? "wl-dot--p1" : "wl-dot--p3"}`, "aria-hidden": "true" }), row.over ? t("panel.budgetOver") : t("panel.budgetWithin"))))))), /* @__PURE__ */ React.createElement("p", { className: "wl-note" }, t("panel.notRun"))), /* @__PURE__ */ React.createElement("section", { className: "wl-section" }, /* @__PURE__ */ React.createElement("h2", { className: "wl-section-title" }, t("panel.manual")), /* @__PURE__ */ React.createElement("ul", null, review.manualChecks.map((item) => /* @__PURE__ */ React.createElement("li", { key: item.id }, item.question)))), /* @__PURE__ */ React.createElement("section", { className: "wl-section" }, /* @__PURE__ */ React.createElement("h2", { className: "wl-section-title" }, t("panel.questions")), /* @__PURE__ */ React.createElement(Questions, { lang })), /* @__PURE__ */ React.createElement("section", { className: "wl-section" }, /* @__PURE__ */ React.createElement("h2", { className: "wl-section-title" }, t("panel.coverage")), /* @__PURE__ */ React.createElement("p", { className: "wl-meta" }, t("panel.reviewed"), " ", review.coverage.reviewedFiles, " \xB7 ", review.coverage.totalLines, " ", t("panel.lines"), review.coverage.partial ? ` \xB7 ${t("panel.partial")}` : ""), review.coverage.skipped.length ? /* @__PURE__ */ React.createElement("p", { className: "wl-note" }, t("panel.skipped"), ": ", review.coverage.skipped.slice(0, 8).map((item) => `${item.path} (${item.reason})`).join(", ")) : null, /* @__PURE__ */ React.createElement("p", { className: "wl-note" }, t("panel.notRun")))) : null)));
  }
  function Questions(props) {
    const items = [0, 1, 2, 3].map((index) => translate(props.lang, `panel.questions.${index}`));
    return /* @__PURE__ */ React.createElement("ul", null, items.map((item) => /* @__PURE__ */ React.createElement("li", { key: item }, item)));
  }

  // src/client/index.tsx
  var NS = "dsh-plugin-love";
  window.__ModuleLoader__.load({
    id: NS,
    factory(require2) {
      const React2 = require2("react");
      setReactRuntime(React2);
      return {
        name: NS,
        inject: ["slots", "locale"],
        apply(ctx) {
          const t = ctx.locale.bind(NS);
          ctx.effect(() => ctx.locale.register(NS, "zh", DICTIONARY.zh), "love: zh dictionary");
          ctx.effect(() => ctx.locale.register(NS, "en", DICTIONARY.en), "love: en dictionary");
          ctx.effect(() => ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
            name: "sidebar.panellist",
            id: "love",
            order: 60,
            label: () => t("panel.title"),
            locale: NS
          }, SidebarIcon)), "love: sidebar entry");
          ctx.effect(() => ctx.slots.inject("main", () => ctx.slots.register({
            name: "main",
            key: "love",
            locale: NS
          }, () => React2.createElement(App, { ctx }))), "love: main panel");
        }
      };
    }
  });
})();
