/** Shared vocabulary for the Love review engine. */

export const PLUGIN_NAME = 'dsh-plugin-love';
export const PLUGIN_VERSION = '0.1.1';
export const REVIEW_FORMAT = 'love/review@1';
export const RULES_VERSION = 2; // 2: icon is polish (meta.icon), no longer a manifest-mismatch P1

export const DIMENSIONS = [
  { id: 'backend', weight: 0.12, zh: '后端', en: 'Backend', zhNote: 'Host、HTTP 路由、子进程、密钥与生命周期。', enNote: 'Host code, HTTP routes, subprocesses, secrets and lifecycle.' },
  { id: 'frontend', weight: 0.13, zh: '前端', en: 'Frontend', zhNote: 'React、副作用、DOM 边界、i18n 与注入面。', enNote: 'React, effects, DOM boundaries, i18n and injection surface.' },
  { id: 'ui', weight: 0.20, zh: 'UI', en: 'UI', zhNote: '主题、对比度、焦点、目标尺寸、动效与布局。', enNote: 'Theme, contrast, focus, target size, motion and layout.' },
  { id: 'ux', weight: 0.20, zh: 'UX', en: 'UX', zhNote: '状态、错误恢复、破坏性操作、键盘与反馈。', enNote: 'States, error recovery, destructive actions, keyboard and feedback.' },
  { id: 'performance', weight: 0.20, zh: '性能', en: 'Performance', zhNote: '体积、主线程、网络、渲染与 CSS 动画。', enNote: 'Bundle, main thread, network, rendering and CSS animation.' },
  { id: 'ai', weight: 0.15, zh: 'AI 时代', en: 'AI era', zhNote: '工具描述、确认、降级、上下文与不可信内容。', enNote: 'Tool contracts, confirmation, fallbacks, context and untrusted content.' },
];

export const DIMENSION_IDS = DIMENSIONS.map((d) => d.id);

export const SEVERITIES = {
  P0: { id: 'P0', penalty: 35, zh: '会伤人', en: 'blocks users' },
  P1: { id: 'P1', penalty: 18, zh: '该修', en: 'should fix' },
  P2: { id: 'P2', penalty: 8, zh: '建议', en: 'suggested' },
  P3: { id: 'P3', penalty: 3, zh: '顺手', en: 'nit' },
};

export const SEVERITY_ORDER = ['P0', 'P1', 'P2', 'P3'];
export const CONFIDENCE = { high: 1, medium: 0.7, low: 0.4 };
export const CONFIDENCE_LABEL = {
  high: { zh: '高', en: 'high' },
  medium: { zh: '中', en: 'medium' },
  low: { zh: '低', en: 'low' },
};

export const TIERS = {
  core: { zh: '标准', en: 'core' },
  deep: { zh: '深度', en: 'deep' },
};

export const DEFAULT_LIMITS = {
  maxFiles: 300,
  maxFileBytes: 512 * 1024,
  maxTotalBytes: 8 * 1024 * 1024,
  maxDepth: 8,
  maxFindings: 60,
  historyLimit: 50,
  bodyBytes: 256 * 1024,
  deadlineMs: { quick: 5000, standard: 15000, deep: 25000 },
};

export const BUDGETS = {
  clientBytesWarn: 500 * 1024,
  clientBytesBad: 1024 * 1024,
  inlineAssetBytes: 100 * 1024,
  pollingMinMs: 1000,
  syncIoCalls: 0,
  serialAwaitLoops: 0,
};

export const TEXT_EXTENSIONS = new Set([
  '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.json', '.yml', '.yaml',
  '.css', '.html', '.md', '.svg',
]);

export const SKIP_DIRS = new Set([
  'node_modules', '.git', '.hg', '.svn', 'dist', 'build', 'out', 'coverage',
  '.next', '.nuxt', '.cache', '.turbo', 'vendor', '__pycache__',
]);

export const SKIP_FILES = [
  /^\.env(\..*)?$/i,
  /^\.credentials/i,
  /^credentials\.ya?ml$/i,
  /\.pem$/i, /\.key$/i, /\.p12$/i, /\.pfx$/i, /^id_rsa/i,
  /\.log$/i, /\.map$/i, /\.min\.js$/i,
  /^pnpm-lock\.yaml$/i, /^package-lock\.json$/i, /^yarn\.lock$/i, /^bun\.lockb$/i,
];

export const SENSITIVE_DIRS = ['.git', 'node_modules', 'sessions', 'attachments', 'credentials'];

export const VERDICT_BANDS = [
  { min: 90, key: 'loved', zh: '很稳，可以放心用', en: 'Solid. Safe to use.' },
  { min: 75, key: 'good', zh: '底子好，修几处就顺', en: 'Good bones. A few fixes will smooth it out.' },
  { min: 60, key: 'usable', zh: '能用，但会让人卡一下', en: 'Usable, but people will stumble.' },
  { min: 40, key: 'needs-work', zh: '先修硬伤，再谈体验', en: 'Fix the hard injuries before the polish.' },
  { min: 0, key: 'hold', zh: '先别急着让人用', en: 'Please do not ship this yet.' },
];

export const DIMENSION_WEIGHT_BY_ID = Object.fromEntries(DIMENSIONS.map((d) => [d.id, d.weight]));

export function dimensionMeta(id) {
  return DIMENSIONS.find((d) => d.id === id);
}

export function severityMeta(id) {
  return SEVERITIES[id] || SEVERITIES.P3;
}

export function verdictFor(total) {
  return VERDICT_BANDS.find((band) => total >= band.min) || VERDICT_BANDS[VERDICT_BANDS.length - 1];
}
