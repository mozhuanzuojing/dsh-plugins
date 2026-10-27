import type * as ReactNS from 'react';
import { CSS } from './styles.ts';
import { DICTIONARY, type Lang } from './locale.ts';

let React!: typeof ReactNS;

export function setReactRuntime(runtime: typeof ReactNS): void {
  React = runtime;
}

const NS = 'dsh-plugin-love';
const DIMENSIONS = ['backend', 'frontend', 'ui', 'ux', 'performance', 'ai'] as const;

function translate(lang: Lang, key: string, params?: Record<string, string | number>): string {
  const dict = DICTIONARY[lang] || DICTIONARY.zh;
  const fallback = DICTIONARY.en[key] || key;
  let text = dict[key] ?? fallback;
  if (params) {
    for (const [name, value] of Object.entries(params)) text = text.replaceAll(`{${name}}`, String(value));
  }
  return text;
}

function useLang(ctx: any): Lang {
  const subscribe = (callback: () => void) => ctx.locale.subscribe(callback);
  const getSnapshot = () => {
    const snapshot = typeof ctx.locale.getSnapshot === 'function' ? ctx.locale.getSnapshot() : ctx.locale.getLocale();
    return snapshot && snapshot.active === 'en' ? 'en' : 'zh';
  };
  return React.useSyncExternalStore(subscribe, getSnapshot, () => 'zh');
}

async function requestJson(url: string, options: RequestInit = {}): Promise<any> {
  const response = await fetch(url, {
    credentials: 'same-origin',
    headers: { accept: 'application/json', ...(options.body ? { 'content-type': 'application/json' } : {}) },
    ...options,
  });
  let data: any = null;
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

function formatDate(value: string, lang: Lang): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  try {
    return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-GB', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return value;
  }
}

function severityLabel(lang: Lang, severity: string): string {
  return translate(lang, `panel.severity.${severity}`);
}

function dimensionLabel(lang: Lang, id: string): string {
  return translate(lang, `panel.dimension.${id}`);
}

function activeText(lang: Lang, review: any): string {
  return lang === 'zh' ? review.score.verdict.text : review.score.verdict.text;
}

function budgetRows(lang: Lang, budget: any) {
  if (!budget || !budget.values || !budget.budgets) return [];
  const v = budget.values;
  const b = budget.budgets;
  return [
    { id: 'clientBytes', label: translate(lang, 'panel.budget.clientBytes'), value: `${(v.clientBytes / 1024).toFixed(0)}KB`, limit: `≤ ${(b.clientBytesWarn / 1024).toFixed(0)}KB`, over: v.clientBytes > b.clientBytesWarn },
    { id: 'inlineAssetBytes', label: translate(lang, 'panel.budget.inlineAssetBytes'), value: `${(v.inlineAssetBytes / 1024).toFixed(0)}KB`, limit: `≤ ${(b.inlineAssetBytes / 1024).toFixed(0)}KB`, over: v.inlineAssetBytes > b.inlineAssetBytes },
    { id: 'syncIoCalls', label: translate(lang, 'panel.budget.syncIoCalls'), value: String(v.syncIoCalls), limit: '0', over: v.syncIoCalls > 0 },
    { id: 'pollingIntervals', label: translate(lang, 'panel.budget.pollingIntervals'), value: v.pollingIntervals.length ? v.pollingIntervals.map((ms: number) => `${ms}ms`).join(', ') : '—', limit: `≥ ${b.pollingMinMs}ms`, over: v.pollingIntervals.some((ms: number) => ms < b.pollingMinMs) },
    { id: 'fetchWithoutAbort', label: translate(lang, 'panel.budget.fetchWithoutAbort'), value: String(v.fetchWithoutAbort), limit: '0', over: v.fetchWithoutAbort > 0 },
    { id: 'serialAwaitLoops', label: translate(lang, 'panel.budget.serialAwaitLoops'), value: String(v.serialAwaitLoops), limit: '0', over: v.serialAwaitLoops > 0 },
    { id: 'layoutAnimationRules', label: translate(lang, 'panel.budget.layoutAnimationRules'), value: String(v.layoutAnimationRules), limit: '0', over: v.layoutAnimationRules > 0 },
  ];
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function downloadMarkdown(review: any): void {
  const blob = new Blob([review.markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${(review.target && review.target.name) || 'plugin'}-review-${review.id}.md`;
  anchor.rel = 'noreferrer';
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function SidebarIcon(props: { size?: number }) {
  const size = props && props.size ? props.size : 16;
  return (
    <span aria-hidden="true" style={{ display: 'inline-flex', width: size, height: size }}>
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20s-7-4.4-7-9.4A4 4 0 0 1 12 8a4 4 0 0 1 7 2.6C19 15.6 12 20 12 20Z" />
        <circle cx="11" cy="10.5" r="2.4" />
        <path d="m13 12.5 2.3 2.3" />
      </svg>
    </span>
  );
}

function FindingCard(props: { finding: any; lang: Lang; expanded: boolean; onToggle: () => void }) {
  const { finding, lang, expanded, onToggle } = props;
  const t = (key: string) => translate(lang, key);
  const citations = Array.isArray(finding.citations) ? finding.citations : [];
  return (
    <article className="wl-card">
      <div className="wl-card-head">
        <span className="wl-card-title">
          <span className={`wl-dot wl-dot--${finding.severity.toLowerCase()}`} aria-hidden="true" />{' '}
          {finding.title}
        </span>
        <span className="wl-meta">
          {severityLabel(lang, finding.severity)} · {t('panel.confidence')} {finding.confidence}
        </span>
      </div>
      <div className="wl-meta">
        <code>{finding.evidence.path}:{finding.evidence.line}</code>
        {finding.occurrences.length > 1 ? ` · ${finding.occurrences.length} ${t('panel.occurrences')}` : ''}
      </div>
      <p className="wl-why">{finding.why}</p>
      <p className="wl-fix"><strong>{t('panel.fixLabel')}：</strong>{finding.fix}</p>
      <button type="button" className="wl-btn wl-btn--ghost" aria-expanded={expanded} onClick={onToggle}>
        {expanded ? t('panel.less') : t('panel.more')}
      </button>
      {expanded ? (
        <div>
          {finding.evidence.snippet ? <pre className="wl-code">{finding.evidence.snippet}</pre> : null}
          {finding.occurrences.length > 1 ? (
            <ul className="wl-citations">
              {finding.occurrences.slice(1, 8).map((item: any) => (
                <li key={`${item.path}:${item.line}`}><code>{item.path}:{item.line}</code>{item.detail ? ` — ${item.detail}` : ''}</li>
              ))}
            </ul>
          ) : null}
          <div className="wl-meta">
            {finding.basis === 'read' ? t('panel.basisRead') : t('panel.basisExperience')}
          </div>
          {citations.length ? (
            <ul className="wl-citations">
              {citations.map((citation: any) => (
                <li key={citation.id}>
                  {citation.url ? <a href={citation.url} target="_blank" rel="noreferrer">{citation.title}</a> : citation.title}
                  {citation.locator ? ` · ${citation.locator}` : ''}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function App(props: { ctx: any }) {
  const { ctx } = props;
  const lang = useLang(ctx);
  const t = (key: string, params?: Record<string, string | number>) => translate(lang, key, params);
  const [state, setState] = React.useState<any>({ targets: [], reviews: [] });
  const [target, setTarget] = React.useState('');
  const [depth, setDepth] = React.useState<'quick' | 'standard' | 'deep'>('standard');
  const [review, setReview] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('all');
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [copied, setCopied] = React.useState(false);
  const [promptCopied, setPromptCopied] = React.useState(false);
  const runController = React.useRef<AbortController | null>(null);
  const copyTimer = React.useRef<number | undefined>(undefined);
  const promptTimer = React.useRef<number | undefined>(undefined);
  const reviewId = React.useRef<string>('');

  const refreshState = React.useCallback(async (signal?: AbortSignal) => {
    const data = await requestJson(`/api/love/state?lang=${lang}`, { signal });
    setState({ targets: data.targets || [], reviews: data.reviews || [] });
  }, [lang]);

  React.useEffect(() => {
    const controller = new AbortController();
    refreshState(controller.signal).catch((err) => {
      if (err && err.name !== 'AbortError') setError(t('panel.error'));
    });
    return () => controller.abort();
  }, [refreshState, lang]);

  React.useEffect(() => {
    if (!reviewId.current) return;
    const controller = new AbortController();
    requestJson(`/api/love/review?id=${encodeURIComponent(reviewId.current)}&lang=${lang}`, { signal: controller.signal })
      .then((data) => setReview(data.review))
      .catch((err) => { if (err && err.name !== 'AbortError') setError(t('panel.error')); });
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
    setError('');
    try {
      const data = await requestJson('/api/love/review', {
        method: 'POST',
        body: JSON.stringify({ target: target.trim(), lang, depth }),
        signal: controller.signal,
      });
      setReview(data.review);
      reviewId.current = data.review.id;
      setActiveTab('all');
      setExpanded({});
      await refreshState(controller.signal);
    } catch (err: any) {
      if (!err || err.name !== 'AbortError') setError(t('panel.error'));
    } finally {
      if (runController.current === controller) setLoading(false);
    }
  };

  const loadHistory = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await requestJson(`/api/love/review?id=${encodeURIComponent(id)}&lang=${lang}`);
      setReview(data.review);
      reviewId.current = data.review.id;
      setActiveTab('all');
      setExpanded({});
    } catch {
      setError(t('panel.error'));
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
    const prompt = t('panel.aiPrompt', {
      target: review.target.title || review.target.name,
      score: String(review.score.total),
      markdown: review.markdown,
    });
    if (await copyText(prompt)) {
      setPromptCopied(true);
      if (promptTimer.current) window.clearTimeout(promptTimer.current);
      promptTimer.current = window.setTimeout(() => setPromptCopied(false), 1800);
    }
  };

  const tabs = ['all', ...DIMENSIONS];
  const tabCount = (id: string) => id === 'all'
    ? (review ? review.findings.length : 0)
    : (review ? review.findings.filter((finding: any) => finding.dimension === id).length : 0);
  const visibleFindings = review
    ? review.findings.filter((finding: any) => activeTab === 'all' || finding.dimension === activeTab)
    : [];
  const topFixes = review && review.topFixes
    ? review.topFixes.map((id: string) => review.findings.find((finding: any) => finding.id === id)).filter(Boolean)
    : [];

  return (
    <div className="wl-root">
      <style>{CSS}</style>
      <header className="wl-header">
        <div className="wl-header-row">
          <span className="wl-mark"><SidebarIcon size={22} /></span>
          <h1 className="wl-title">{t('panel.title')}</h1>
        </div>
        <p className="wl-tagline">{t('panel.tagline')}</p>
      </header>

      <div className="wl-toolbar">
        <label className="wl-field">
          <span className="wl-label">{t('panel.target')}</span>
          <input
            className="wl-input"
            list="wl-target-list"
            value={target}
            placeholder={t('panel.targetPlaceholder')}
            onChange={(event) => setTarget(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') void runReview(); }}
          />
          <datalist id="wl-target-list">
            {state.targets.map((item: any) => <option key={item.name} value={item.name}>{item.title || item.name}</option>)}
          </datalist>
        </label>
        <label className="wl-field wl-field--depth">
          <span className="wl-label">{t('panel.depth')}</span>
          <select className="wl-select" value={depth} onChange={(event) => setDepth(event.target.value as any)}>
            <option value="quick">{t('panel.depth.quick')}</option>
            <option value="standard">{t('panel.depth.standard')}</option>
            <option value="deep">{t('panel.depth.deep')}</option>
          </select>
        </label>
        <button type="button" className="wl-btn wl-btn--primary" onClick={() => void runReview()} disabled={loading || !target.trim()}>
          {loading ? t('panel.running') : t('panel.run')}
        </button>
      </div>

      <div className="wl-layout">
        <aside className="wl-history" aria-label={t('panel.history')}>
          <h2 className="wl-history-title">{t('panel.history')}</h2>
          {state.reviews.length === 0 ? <p className="wl-history-empty">{t('panel.historyEmpty')}</p> : null}
          {state.reviews.map((item: any) => (
            <button
              key={item.id}
              type="button"
              className="wl-history-item"
              data-active={review && review.id === item.id ? 'true' : 'false'}
              onClick={() => void loadHistory(item.id)}
            >
              <span className="wl-history-name">{item.target ? (item.target.title || item.target.name) : item.id}</span>
              <span className="wl-history-meta">{item.score == null ? '' : item.score} · {formatDate(item.createdAt, lang)} · {item.depth}</span>
            </button>
          ))}
        </aside>

        <main className="wl-main">
          {error ? (
            <div className="wl-alert" role="alert">
              <p>{error}</p>
              <button type="button" className="wl-btn" onClick={() => (reviewId.current ? void loadHistory(reviewId.current) : void runReview())}>{t('panel.retry')}</button>
            </div>
          ) : null}

          {!review && loading ? (
            <div className="wl-list" aria-live="polite">
              <div className="wl-skeleton" style={{ width: '40%' }} />
              <div className="wl-skeleton" style={{ width: '70%' }} />
              <div className="wl-skeleton" style={{ width: '55%' }} />
            </div>
          ) : null}

          {!review && !loading && !error ? (
            <div className="wl-empty">
              <h2>{t('panel.emptyTitle')}</h2>
              <p>{t('panel.emptyBody')}</p>
              <ol className="wl-steps">
                <li>{t('panel.emptyStep1')}</li>
                <li>{t('panel.emptyStep2')}</li>
                <li>{t('panel.emptyStep3')}</li>
              </ol>
              <div className="wl-principles">
                <div className="wl-principle">{t('panel.principle1')}</div>
                <div className="wl-principle">{t('panel.principle2')}</div>
                <div className="wl-principle">{t('panel.principle3')}</div>
              </div>
              <p className="wl-privacy">{t('panel.privacy')}</p>
              <p className="wl-note">{t('panel.selectHint')}</p>
            </div>
          ) : null}

          {review ? (
            <>
              <section className="wl-hero">
                <div className="wl-hero-top">
                  <div className="wl-score">{review.score.total}<small> / 100</small></div>
                  <div>
                    <div className="wl-verdict">{activeText(lang, review)}</div>
                    <div className="wl-meta">
                      {review.target.title || review.target.name}{review.target.version ? ` v${review.target.version}` : ''} · {formatDate(review.createdAt, lang)} · {t(`panel.depth.${review.depth}`)}
                      {review.depth === 'deep' ? ` · ${t('panel.depthBadge')}` : ''}
                    </div>
                  </div>
                </div>
                <div className="wl-counts">
                  {(['P0', 'P1', 'P2', 'P3'] as const).map((severity) => (
                    <span className="wl-chip" key={severity}>
                      <span className={`wl-dot wl-dot--${severity.toLowerCase()}`} aria-hidden="true" />
                      {severityLabel(lang, severity)} {review.score.counts[severity] || 0}
                    </span>
                  ))}
                  {review.persisted === false ? <span className="wl-chip">{t('panel.persistedFalse')}</span> : null}
                  {review.coverage && review.coverage.partial ? <span className="wl-chip">{t('panel.partial')}</span> : null}
                </div>
                <div className="wl-dims">
                  {DIMENSIONS.filter((id) => review.score.dimensions[id] !== undefined).map((id) => (
                    <div className="wl-dim" key={id}>
                      <div className="wl-dim-head"><span>{dimensionLabel(lang, id)}</span><span>{review.score.dimensions[id]}</span></div>
                      <div className="wl-bar"><span style={{ width: `${Math.max(0, Math.min(100, review.score.dimensions[id]))}%` }} /></div>
                    </div>
                  ))}
                </div>
                <div className="wl-actions">
                  <button type="button" className="wl-btn" onClick={() => void onCopy()}>{copied ? t('panel.copied') : t('panel.copy')}</button>
                  <button type="button" className="wl-btn" onClick={() => downloadMarkdown(review)}>{t('panel.export')}</button>
                  <button type="button" className="wl-btn" onClick={() => void onCopyPrompt()}>{promptCopied ? t('panel.promptCopied') : t('panel.copyPrompt')}</button>
                </div>
              </section>

              <section className="wl-section">
                <h2 className="wl-section-title">{t('panel.strengths')}</h2>
                {review.strengths.length === 0 ? <p className="wl-note">{t('panel.noStrengths')}</p> : (
                  <ul>{review.strengths.map((item: any) => <li key={item.id}>{item.title}{item.evidence ? <span className="wl-meta"> — <code>{item.evidence}</code></span> : null}</li>)}</ul>
                )}
              </section>

              <section className="wl-section">
                <h2 className="wl-section-title">{t('panel.topFixes')}</h2>
                <div className="wl-list">
                  {topFixes.length === 0 ? <p className="wl-note">{t('panel.noFindings')}</p> : topFixes.map((finding: any) => (
                    <div className="wl-card wl-card--fix" key={`top-${finding.id}`}>
                      <div className="wl-card-head">
                        <span className="wl-card-title">{finding.title}</span>
                        <span className="wl-meta">{severityLabel(lang, finding.severity)} · <code>{finding.evidence.path}:{finding.evidence.line}</code></span>
                      </div>
                      <p className="wl-why">{finding.why}</p>
                      <p className="wl-fix"><strong>{t('panel.fixLabel')}：</strong>{finding.fix}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="wl-section">
                <h2 className="wl-section-title">{t('panel.findings')}</h2>
                <div className="wl-tabs" role="tablist" aria-label={t('panel.findings')}>
                  {tabs.map((id) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      className="wl-tab"
                      aria-selected={activeTab === id}
                      onClick={() => setActiveTab(id)}
                    >
                      {dimensionLabel(lang, id)}<small>{tabCount(id)}</small>
                    </button>
                  ))}
                </div>
                <div className="wl-list" role="tabpanel">
                  {visibleFindings.length === 0 ? <p className="wl-note">{t('panel.noFindings')}</p> : visibleFindings.map((finding: any) => (
                    <FindingCard
                      key={finding.id}
                      finding={finding}
                      lang={lang}
                      expanded={!!expanded[finding.id]}
                      onToggle={() => setExpanded((current) => ({ ...current, [finding.id]: !current[finding.id] }))}
                    />
                  ))}
                </div>
              </section>

              <section className="wl-section">
                <h2 className="wl-section-title">{t('panel.budget')}</h2>
                <table className="wl-table">
                  <thead><tr><th>{t('panel.budgetValue')}</th><th>{t('panel.budgetLimit')}</th><th>{t('panel.budgetStatus')}</th></tr></thead>
                  <tbody>
                    {budgetRows(lang, review.budget).map((row) => (
                      <tr key={row.id}>
                        <td>{row.label}<br /><span className="wl-meta">{row.value}</span></td>
                        <td>{row.limit}</td>
                        <td><span className="wl-status"><span className={`wl-dot ${row.over ? 'wl-dot--p1' : 'wl-dot--p3'}`} aria-hidden="true" />{row.over ? t('panel.budgetOver') : t('panel.budgetWithin')}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="wl-note">{t('panel.notRun')}</p>
              </section>

              <section className="wl-section">
                <h2 className="wl-section-title">{t('panel.manual')}</h2>
                <ul>{review.manualChecks.map((item: any) => <li key={item.id}>{item.question}</li>)}</ul>
              </section>

              <section className="wl-section">
                <h2 className="wl-section-title">{t('panel.questions')}</h2>
                <Questions lang={lang} />
              </section>

              <section className="wl-section">
                <h2 className="wl-section-title">{t('panel.coverage')}</h2>
                <p className="wl-meta">
                  {t('panel.reviewed')} {review.coverage.reviewedFiles} · {review.coverage.totalLines} {t('panel.lines')}
                  {review.coverage.partial ? ` · ${t('panel.partial')}` : ''}
                </p>
                {review.coverage.skipped.length ? (
                  <p className="wl-note">{t('panel.skipped')}: {review.coverage.skipped.slice(0, 8).map((item: any) => `${item.path} (${item.reason})`).join(', ')}</p>
                ) : null}
                <p className="wl-note">{t('panel.notRun')}</p>
              </section>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function Questions(props: { lang: Lang }) {
  const items = [0, 1, 2, 3].map((index) => translate(props.lang, `panel.questions.${index}`));
  return <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}
