import {
  CONFIDENCE,
  DIMENSIONS,
  DIMENSION_WEIGHT_BY_ID,
  SEVERITIES,
  SEVERITY_ORDER,
  verdictFor,
} from './constants.ts';

const DIMENSION_IMPACT = {
  backend: 5,
  frontend: 4,
  ui: 4.5,
  ux: 4.5,
  performance: 4,
  ai: 4,
};

export function scoreFindings(findings, includedDimensions) {
  const dimensionsToScore = includedDimensions && includedDimensions.length ? includedDimensions : DIMENSIONS.map((d) => d.id);
  const sums = Object.fromEntries(dimensionsToScore.map((id) => [id, 0]));
  for (const finding of findings) {
    if (!(finding.dimension in sums)) continue;
    const severity = SEVERITIES[finding.severity] || SEVERITIES.P3;
    const confidence = CONFIDENCE[finding.confidence] || 0.7;
    const occurrences = Array.isArray(finding.occurrences) ? finding.occurrences.length : 1;
    const occurrenceFactor = Math.min(1.3, 1 + Math.max(0, occurrences - 1) * 0.1);
    const penalty = Math.min(35, severity.penalty * confidence * occurrenceFactor);
    sums[finding.dimension] += penalty;
  }
  const dimensions = {};
  for (const id of dimensionsToScore) dimensions[id] = Math.max(0, Math.round(100 - sums[id]));
  const totalWeight = dimensionsToScore.reduce((sum, id) => sum + (DIMENSION_WEIGHT_BY_ID[id] || 0), 0) || 1;
  const total = Math.round(dimensionsToScore.reduce((sum, id) => sum + dimensions[id] * ((DIMENSION_WEIGHT_BY_ID[id] || 0) / totalWeight), 0));
  const counts = { P0: 0, P1: 0, P2: 0, P3: 0 };
  for (const finding of findings) counts[finding.severity] = (counts[finding.severity] || 0) + 1;
  return {
    total,
    dimensions,
    counts,
    verdict: verdictFor(total),
    weights: Object.fromEntries(dimensionsToScore.map((id) => [id, (DIMENSION_WEIGHT_BY_ID[id] || 0) / totalWeight])),
  };
}

export function topFixes(findings, limit = 3) {
  const sorted = findings.slice().sort((a, b) => {
    const sev = SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
    if (sev !== 0) return sev;
    const impact = (DIMENSION_IMPACT[b.dimension] || 0) - (DIMENSION_IMPACT[a.dimension] || 0);
    if (impact !== 0) return impact;
    return a.id.localeCompare(b.id);
  });
  const seen = new Set();
  const out = [];
  for (const finding of sorted) {
    if (seen.has(finding.checkId)) continue;
    seen.add(finding.checkId);
    out.push(finding.id);
    if (out.length >= limit) break;
  }
  return out;
}

function has(file, pattern) {
  return file && pattern.test(file.text);
}

export function buildStrengths(inventory, analysis, findings, budget) {
  const strengths = [];
  const host = inventory.files.filter((f) => f.role === 'host' && !f.generated);
  const client = inventory.files.filter((f) => f.role === 'client' && !f.generated);
  const styles = inventory.files.filter((f) => f.role === 'style');

  if (host.some((f) => /ctx\.effect|ctx\.on/.test(f.text))) {
    strengths.push({
      id: 'owned-lifecycle',
      zh: '副作用有主人：资源注册收在 ctx.effect/ctx.on 里，卸载时能收回来。',
      en: 'Side effects have an owner: resources are registered inside ctx.effect/ctx.on and can be cleaned up.',
      evidence: host.find((f) => /ctx\.effect|ctx\.on/.test(f.text)).path,
    });
  }
  if (client.some((f) => /return\s*(?:\(\)|function)[\s\S]{0,120}(?:abort|clear|remove|unsubscribe)/.test(f.text))) {
    strengths.push({
      id: 'cleanup',
      zh: '客户端副作用写了 cleanup，组件走了会收尾。',
      en: 'The client effect returns a cleanup, so unmounting leaves no tail.',
      evidence: client.find((f) => /return\s*(?:\(\)|function)/.test(f.text)).path,
    });
  }
  const zh = analysis.localeByLang && analysis.localeByLang.get('zh');
  const en = analysis.localeByLang && analysis.localeByLang.get('en');
  if (zh && en) {
    strengths.push({
      id: 'paired-locales',
      zh: '中英字典都在，Plugin Manager 能拿到标题和描述。',
      en: 'Both zh/en dictionaries exist; Plugin Manager can read the title and description.',
      evidence: zh.file.path,
    });
  }
  if (analysis.icon && analysis.icon.valid) {
    strengths.push({
      id: 'icon',
      zh: '有可渲染的插件图标，不是默认占位图。',
      en: 'A renderable plugin icon is present, not the default placeholder.',
      evidence: analysis.icon.path,
    });
  }
  if ([...styles, ...client].some((f) => /--dsw-alias-/.test(f.text))) {
    strengths.push({
      id: 'theme-tokens',
      zh: '用了宿主 theme token，亮暗切换时大色块会跟着走。',
      en: 'Host theme tokens are used, so large surfaces follow light/dark switching.',
      evidence: [...styles, ...client].find((f) => /--dsw-alias-/.test(f.text)).path,
    });
  }
  if (inventory.files.some((f) => f.role === 'test') || inventory.files.some((f) => /\.github\/workflows\//.test(f.path))) {
    strengths.push({
      id: 'tests',
      zh: '带了测试或 CI，改完有东西能替你守门。',
      en: 'Tests or CI exist, so a future change has a gate.',
      evidence: inventory.files.find((f) => f.role === 'test')?.path || '.github/workflows',
    });
  }
  if (inventory.readmeFile && /(?:^|\n)##\s*(?:安装|Install)/i.test(inventory.readmeFile.text)) {
    strengths.push({
      id: 'readme-install',
      zh: 'README 有安装段，第一次用的人知道从哪开始。',
      en: 'The README has an install section; a first-time user knows where to start.',
      evidence: inventory.readmeFile.path,
    });
  }
  if (client.some((f) => /confirm\s*\(|undo|撤销|确认/.test(f.text)) && !findings.some((f) => f.checkId === 'ux.destructive-no-confirm')) {
    strengths.push({
      id: 'confirm',
      zh: '破坏性操作有确认或撤销，用户不会被一次误点送走。',
      en: 'Destructive actions have confirmation or undo, so one mis-click does not end the story.',
      evidence: client.find((f) => /confirm\s*\(|undo|撤销|确认/.test(f.text)).path,
    });
  }
  const withinBudget = budget && budget.values
    && budget.values.clientBytes <= budget.budgets.clientBytesWarn
    && budget.values.inlineAssetBytes <= budget.budgets.inlineAssetBytes
    && budget.values.syncIoCalls === 0
    && budget.values.fetchWithoutAbort === 0;
  if (withinBudget) {
    strengths.push({
      id: 'budget',
      zh: '性能预算没超线：包体、内联资源、同步 IO 和 fetch 取消都还在范围内。',
      en: 'Performance budgets are respected: bundle, inline assets, sync IO and fetch cancellation are within range.',
      evidence: budget.details.clientArtifact ? budget.details.clientArtifact.path : 'budget',
    });
  }
  if (!findings.some((f) => f.severity === 'P0')) {
    strengths.push({
      id: 'no-p0',
      zh: '没有 P0：这版没有“会直接伤到用户或数据”的硬伤。',
      en: 'No P0: nothing here directly hurts users or data.',
      evidence: 'score',
    });
  }
  return strengths.slice(0, 6);
}

export function manualChecks(inventory, findings) {
  const items = [
    {
      id: 'ui.contrast-token-bg',
      zh: 'token 背景上的文字对比度：静态只能算字面量，token 的实际值要看渲染。',
      en: 'Contrast on token backgrounds: static analysis only computes literals; the rendered token value needs a human look.',
      evidence: inventory.files.find((f) => f.role === 'style')?.path || 'client',
    },
    {
      id: 'ui.focus-trap',
      zh: '焦点陷阱：打开弹层后 Tab 是否被困在弹层里，关闭后是否回到触发按钮。',
      en: 'Focus trap: does Tab stay inside the dialog, and does focus return to the trigger after close?',
      evidence: inventory.files.find((f) => f.role === 'client')?.path || 'client',
    },
    {
      id: 'ui.hierarchy',
      zh: '视觉层级：标题、正文、次要信息在真实数据量下是否还分得清。',
      en: 'Visual hierarchy: with real data, are title, body and secondary information still distinguishable?',
      evidence: inventory.files.find((f) => f.role === 'style')?.path || 'client',
    },
    {
      id: 'ui.motion-comfort',
      zh: '动效舒适度：连续操作 10 秒，动效是帮助定位还是让人晕。',
      en: 'Motion comfort: after ten seconds of use, does motion help orientation or cause discomfort?',
      evidence: 'manual',
    },
    {
      id: 'ui.narrow',
      zh: '真实窄屏：拖到 320px，长插件名、长路径、长错误文案会不会把布局撑坏。',
      en: 'Real narrow width: at 320px, do long plugin names, paths and errors break the layout?',
      evidence: 'manual',
    },
    {
      id: 'perf.runtime',
      zh: '运行时性能：静态没有 Lighthouse/内存/真实网络计时；首屏和滚动要在真实环境看。',
      en: 'Runtime performance: static analysis has no Lighthouse, memory or real network timing; first paint and scroll need a real environment.',
      evidence: 'manual',
    },
  ];
  if (findings.some((f) => f.checkId === 'ui.contrast-literal')) {
    return items.filter((item) => item.id !== 'ui.contrast-token-bg' || true);
  }
  return items;
}
