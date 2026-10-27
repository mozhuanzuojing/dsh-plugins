import { DIMENSIONS, dimensionMeta } from './constants.ts';
import { CITATIONS } from './knowledge.ts';
import { CHECK_BY_ID } from './checks.ts';
import { fenceFor, redactPath, truncate } from './util.ts';

const LABELS = {
  zh: {
    title: '爱 · 审查报告',
    date: '审查日期',
    depth: '深度',
    target: '目标',
    readOnly: '只读审查：没有执行目标代码，没有联网。',
    strengths: '我认真看过的',
    score: '总分',
    verdict: '一句话',
    dimensions: '六个维度',
    topFixes: '如果只改三件事',
    findings: '按维度看',
    budget: '性能预算',
    manual: '需要你亲眼看一眼',
    coverage: '这次看到哪里、没看到哪里',
    citations: '引用说明',
    questions: '值得再问自己的四个问题',
    noFindings: '这一维度没有找到硬伤。不等于完美，只说明静态规则没抓到。',
    noStrengths: '这版还没有结构性的亮点；但你把它交出来被看，这一步本身值得肯定。',
    confidence: '置信度',
    occurrence: '处',
    basisRead: '已读依据',
    basisExperience: '工程判断，无外部引用',
    reviewedFiles: '审了',
    files: '个文件',
    lines: '行',
    skipped: '跳过',
    partial: '结果不完整',
    budgetWithin: '在预算内',
    budgetOver: '超预算',
    notRun: '静态审查没有做：运行时性能、Lighthouse、真实网络计时、内存。',
    footer: '把刺留在代码上，不留在人身上。',
    severity: { P0: '会伤人', P1: '该修', P2: '建议', P3: '顺手' },
    dimensionsLabel: { backend: '后端', frontend: '前端', ui: 'UI', ux: 'UX', performance: '性能', ai: 'AI 时代' },
    tier: { core: '标准', deep: '深度' },
    quote: '摘录',
    locator: '定位',
    scoreLine: (n) => `${n} / 100`,
    questionsList: [
      '弱网、模型超时或限流时，这版会怎么表现？用户看得到“正在重试”还是只看到转圈？',
      '用户第一次打开时，知道下一步该点哪里吗？空状态有没有告诉他？',
      '删除、覆盖、卸载这类操作，误点之后还能回来吗？撤销比确认更不打扰。',
      '哪些数据会离开这台机器？模型、日志、崩溃上报分别拿到了什么？',
    ],
  },
  en: {
    title: 'Love · Review',
    date: 'Reviewed',
    depth: 'Depth',
    target: 'Target',
    readOnly: 'Read-only: the target code was not executed and nothing was fetched.',
    strengths: 'What I genuinely liked',
    score: 'Score',
    verdict: 'In one line',
    dimensions: 'Six dimensions',
    topFixes: 'If you only fix three things',
    findings: 'By dimension',
    budget: 'Performance budgets',
    manual: 'Please look at these yourself',
    coverage: 'What I saw, and what I did not',
    citations: 'About the references',
    questions: 'Four questions worth asking yourself',
    noFindings: 'No hard findings in this dimension. That is not perfection; it only means the static rules missed it.',
    noStrengths: 'No structural highlight yet. But handing it over to be looked at is itself worth something.',
    confidence: 'Confidence',
    occurrence: 'occurrence(s)',
    basisRead: 'Read source',
    basisExperience: 'Engineering judgment, no external citation',
    reviewedFiles: 'Reviewed',
    files: 'files',
    lines: 'lines',
    skipped: 'Skipped',
    partial: 'Partial result',
    budgetWithin: 'Within budget',
    budgetOver: 'Over budget',
    notRun: 'Static review does not include runtime performance, Lighthouse, real network timing or memory.',
    footer: 'Keep the thorn in the code, not in the person.',
    severity: { P0: 'blocks users', P1: 'should fix', P2: 'suggested', P3: 'nit' },
    dimensionsLabel: { backend: 'Backend', frontend: 'Frontend', ui: 'UI', ux: 'UX', performance: 'Performance', ai: 'AI era' },
    tier: { core: 'core', deep: 'deep' },
    quote: 'Quote',
    locator: 'Locator',
    scoreLine: (n) => `${n} / 100`,
    questionsList: [
      'What happens on a slow network, a model timeout or a rate limit? Does the user see a retry, or just a spinner?',
      'On first open, does the user know what to click next? Does the empty state tell them?',
      'If a delete, overwrite or uninstall is mis-clicked, can they come back? Undo is kinder than a confirmation.',
      'Which data leaves this machine? What do the model, logs and crash reporting each receive?',
    ],
  },
};

function localize(value, lang) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value[lang] !== undefined ? value[lang] : value.zh !== undefined ? value.zh : '';
  }
  return value == null ? '' : String(value);
}

function citationView(id, lang) {
  const citation = CITATIONS[id];
  if (!citation || citation.status !== 'read') return null;
  return {
    id: citation.id,
    kind: citation.kind,
    title: citation.title,
    url: citation.url || '',
    locator: citation.locator,
    quote: citation.quote,
    status: citation.status,
  };
}

export function localizeFindings(rawFindings, lang) {
  return rawFindings.map((raw) => {
    const check = raw.check || CHECK_BY_ID.get(raw.checkId);
    if (!check) return null;
    const severity = raw.severity || check.severity;
    const citations = check.citations
      .map((id) => citationView(id, lang))
      .filter(Boolean);
    return {
      id: raw.id,
      checkId: check.id,
      dimension: check.dimension,
      tier: check.tier,
      severity,
      confidence: raw.confidence || check.confidence,
      basis: citations.length ? 'read' : 'experience',
      title: localize(check.title, lang),
      summary: localize(check.summary, lang),
      why: localize(check.why, lang),
      fix: localize(check.fix, lang),
      occurrences: raw.occurrences,
      evidence: raw.occurrences[0] || { path: '', line: 0, snippet: '' },
      citations,
    };
  }).filter(Boolean);
}

function severityLabel(severity, lang) {
  return LABELS[lang].severity[severity] || severity;
}

function dimensionLabel(id, lang) {
  return LABELS[lang].dimensionsLabel[id] || dimensionMeta(id)?.zh || id;
}

function budgetRows(budget, lang) {
  const values = budget.values;
  const limits = budget.budgets;
  const rows = [
    { id: 'clientBytes', label: lang === 'zh' ? '客户端包体' : 'Client bundle', value: `${(values.clientBytes / 1024).toFixed(0)}KB`, limit: `≤ ${(limits.clientBytesWarn / 1024).toFixed(0)}KB`, over: values.clientBytes > limits.clientBytesWarn },
    { id: 'inlineAssetBytes', label: lang === 'zh' ? '内联资源' : 'Inline assets', value: `${(values.inlineAssetBytes / 1024).toFixed(0)}KB`, limit: `≤ ${(limits.inlineAssetBytes / 1024).toFixed(0)}KB`, over: values.inlineAssetBytes > limits.inlineAssetBytes },
    { id: 'syncIoCalls', label: lang === 'zh' ? '同步 IO' : 'Sync IO', value: String(values.syncIoCalls), limit: '0', over: values.syncIoCalls > 0 },
    { id: 'pollingIntervals', label: lang === 'zh' ? '轮询间隔' : 'Polling', value: values.pollingIntervals.length ? values.pollingIntervals.map((ms) => `${ms}ms`).join(', ') : '—', limit: `≥ ${limits.pollingMinMs}ms`, over: values.pollingIntervals.some((ms) => ms < limits.pollingMinMs) },
    { id: 'fetchWithoutAbort', label: lang === 'zh' ? '未取消 fetch' : 'Fetch without abort', value: String(values.fetchWithoutAbort), limit: '0', over: values.fetchWithoutAbort > 0 },
    { id: 'serialAwaitLoops', label: lang === 'zh' ? '串行 await 循环' : 'Serial await loops', value: String(values.serialAwaitLoops), limit: '0', over: values.serialAwaitLoops > 0 },
    { id: 'layoutAnimationRules', label: lang === 'zh' ? '布局属性动画' : 'Layout animation rules', value: String(values.layoutAnimationRules), limit: '0', over: values.layoutAnimationRules > 0 },
  ];
  return rows;
}

export function composeMarkdown(review) {
  const lang = review.lang === 'en' ? 'en' : 'zh';
  const L = LABELS[lang];
  const lines = [];
  lines.push(`# ${L.title} · ${review.target.title || review.target.name}${review.target.version ? ` v${review.target.version}` : ''}`);
  lines.push('');
  lines.push(`> ${L.date}: ${review.createdAt} ｜ ${L.depth}: ${L.tier[review.depth] || review.depth} ｜ ${L.target}: \`${redactPath(review.target.path, review.homeDir)}\``);
  lines.push(`> ${L.readOnly}`);
  lines.push('');
  lines.push(`## ${L.score}: ${L.scoreLine(review.score.total)}`);
  lines.push('');
  lines.push(`**${L.verdict}**: ${review.score.verdict.text}`);
  lines.push('');
  lines.push('| ' + (lang === 'zh' ? '维度' : 'Dimension') + ' | ' + (lang === 'zh' ? '分数' : 'Score') + ' |');
  lines.push('|---|---|');
  for (const dim of DIMENSIONS) {
    if (review.score.dimensions[dim.id] === undefined) continue;
    lines.push(`| ${dimensionLabel(dim.id, lang)} | ${review.score.dimensions[dim.id]} |`);
  }
  lines.push('');
  lines.push(`## ${L.strengths}`);
  lines.push('');
  if (review.strengths.length === 0) lines.push(L.noStrengths);
  for (const strength of review.strengths) {
    lines.push(`- ${strength.title}${strength.evidence ? `（\`${strength.evidence}\`）` : ''}`);
  }
  lines.push('');
  lines.push(`## ${L.topFixes}`);
  lines.push('');
  const byId = new Map(review.findings.map((f) => [f.id, f]));
  const top = review.topFixes.map((id) => byId.get(id)).filter(Boolean);
  if (top.length === 0) lines.push(lang === 'zh' ? '没有需要先修的硬伤。' : 'Nothing needs a first fix.');
  top.forEach((finding, index) => {
    lines.push(`### ${index + 1}. ${finding.title} · ${severityLabel(finding.severity, lang)}`);
    lines.push('');
    lines.push(`\`${finding.evidence.path}:${finding.evidence.line}\`${finding.occurrences.length > 1 ? ` · ${finding.occurrences.length} ${L.occurrence}` : ''}`);
    lines.push('');
    if (finding.evidence.snippet) {
      const fence = fenceFor(finding.evidence.snippet);
      lines.push(`${fence}${finding.evidence.path.endsWith('.css') ? 'css' : 'js'}`);
      lines.push(truncate(finding.evidence.snippet, 1600));
      lines.push(fence);
      lines.push('');
    }
    lines.push(`**${lang === 'zh' ? '为什么' : 'Why'}**: ${finding.why}`);
    lines.push('');
    lines.push(`**${lang === 'zh' ? '怎么改' : 'Fix'}**: ${finding.fix}`);
    lines.push('');
    lines.push(`**${finding.basis === 'read' ? L.basisRead : L.basisExperience}**`);
    for (const citation of finding.citations) {
      lines.push(`- [${citation.title}](${citation.url || '#'}) · ${citation.locator}`);
      if (citation.quote) lines.push(`  > ${citation.quote}`);
    }
    lines.push('');
  });

  lines.push(`## ${L.findings}`);
  for (const dim of DIMENSIONS) {
    const items = review.findings.filter((f) => f.dimension === dim.id);
    if (items.length === 0) {
      if (review.score.dimensions[dim.id] !== undefined) {
        lines.push(`### ${dimensionLabel(dim.id, lang)} · ${review.score.dimensions[dim.id]}`);
        lines.push('');
        lines.push(L.noFindings);
        lines.push('');
      }
      continue;
    }
    lines.push(`### ${dimensionLabel(dim.id, lang)} · ${review.score.dimensions[dim.id]}`);
    lines.push('');
    for (const finding of items) {
      lines.push(`#### [${finding.severity}] ${finding.title}`);
      lines.push('');
      lines.push(`\`${finding.evidence.path}:${finding.evidence.line}\` · ${L.confidence}: ${finding.confidence}${finding.tier === 'deep' ? ` · ${L.tier.deep}` : ''}`);
      lines.push('');
      if (finding.evidence.snippet) {
        const fence = fenceFor(finding.evidence.snippet);
        lines.push(`${fence}`);
        lines.push(truncate(finding.evidence.snippet, 1200));
        lines.push(fence);
        lines.push('');
      }
      lines.push(`- **${lang === 'zh' ? '为什么' : 'Why'}**: ${finding.why}`);
      lines.push(`- **${lang === 'zh' ? '怎么改' : 'Fix'}**: ${finding.fix}`);
      lines.push(`- **${finding.basis === 'read' ? L.basisRead : L.basisExperience}**`);
      for (const citation of finding.citations) {
        lines.push(`  - [${citation.title}](${citation.url || '#'}) · ${citation.locator}`);
      }
      if (finding.occurrences.length > 1) {
        lines.push(`- ${lang === 'zh' ? '还有' : 'Also'} ${finding.occurrences.length - 1} ${L.occurrence}: ${finding.occurrences.slice(1, 6).map((o) => `\`${o.path}:${o.line}\``).join(', ')}`);
      }
      lines.push('');
    }
  }

  lines.push(`## ${L.budget}`);
  lines.push('');
  lines.push('| ' + (lang === 'zh' ? '项' : 'Item') + ' | ' + (lang === 'zh' ? '实测' : 'Measured') + ' | ' + (lang === 'zh' ? '预算' : 'Budget') + ' | ' + (lang === 'zh' ? '状态' : 'Status') + ' |');
  lines.push('|---|---|---|---|');
  for (const row of budgetRows(review.budget, lang)) {
    lines.push(`| ${row.label} | ${row.value} | ${row.limit} | ${row.over ? L.budgetOver : L.budgetWithin} |`);
  }
  lines.push('');
  lines.push(`> ${L.notRun}`);
  lines.push('');
  lines.push(`## ${L.manual}`);
  lines.push('');
  for (const item of review.manualChecks) {
    lines.push(`- ${item.question}`);
  }
  lines.push('');
  lines.push(`## ${L.questions}`);
  lines.push('');
  L.questionsList.forEach((question) => lines.push(`- ${question}`));
  lines.push('');
  lines.push(`## ${L.coverage}`);
  lines.push('');
  lines.push(`- ${L.reviewedFiles} ${review.coverage.reviewedFiles} ${L.files} / ${review.coverage.totalLines} ${L.lines}${review.coverage.partial ? ` · ⚠ ${L.partial}` : ''}`);
  if (review.coverage.skipped.length) {
    lines.push(`- ${L.skipped}: ${review.coverage.skipped.slice(0, 8).map((s) => `\`${s.path}\` (${s.reason})`).join(', ')}`);
  }
  lines.push(`- ${L.notRun}`);
  lines.push('');
  lines.push(`## ${L.citations}`);
  lines.push('');
  lines.push(lang === 'zh'
    ? '只有 `status: read` 的段落会挂在发现上，并附逐字摘录与定位；只核验了书目的来源不会出现在发现里；性能阈值是产品预算，不是论文结论。'
    : 'Only `status: read` passages are attached to findings, with a verbatim quote and locator. Bibliographic-only sources never appear as evidence. Performance thresholds are product budgets, not research claims.');
  lines.push('');
  lines.push(`> ${L.footer}`);
  return lines.join('\n');
}

export function composeReview(scan, lang = 'zh') {
  const L = LABELS[lang] || LABELS.zh;
  const findings = localizeFindings(scan.rawFindings, lang);
  const byId = new Map(findings.map((f) => [f.id, f]));
  const dimensions = {};
  for (const dim of DIMENSIONS) {
    if (scan.score.dimensions[dim.id] !== undefined) dimensions[dim.id] = scan.score.dimensions[dim.id];
  }
  const review: Record<string, any> = {
    id: scan.id,
    format: scan.format,
    rulesVersion: scan.rulesVersion,
    createdAt: scan.createdAt,
    lang,
    depth: scan.depth,
    target: scan.target,
    homeDir: scan.homeDir,
    score: {
      total: scan.score.total,
      dimensions,
      counts: scan.score.counts,
      weights: scan.score.weights,
      verdict: { key: scan.score.verdict.key, text: localize(scan.score.verdict, lang) },
    },
    findings,
    strengths: scan.strengths.map((s) => ({ id: s.id, title: localize({ zh: s.zh, en: s.en }, lang), evidence: s.evidence })),
    topFixes: scan.topFixes.filter((id) => byId.has(id)),
    questions: L.questionsList,
    manualChecks: scan.manualChecks.map((m) => ({ id: m.id, question: localize({ zh: m.zh, en: m.en }, lang), evidence: m.evidence })),
    budget: scan.budget,
    coverage: {
      reviewedFiles: scan.coverage.reviewedFiles,
      totalLines: scan.coverage.totalLines,
      skipped: scan.coverage.skipped,
      partial: scan.coverage.partial,
      confidence: scan.coverage.confidence,
      notRun: scan.coverage.notRun,
    },
    persisted: scan.persisted !== false,
  };
  review.markdown = composeMarkdown(review);
  return review;
}
