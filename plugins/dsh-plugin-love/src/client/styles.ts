export const CSS = `
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
