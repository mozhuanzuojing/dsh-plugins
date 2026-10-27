import { DEFAULT_LIMITS, PLUGIN_VERSION } from './constants.ts';
import { reviewTarget } from './review.ts';
import { listInstalledTargets } from './scan.ts';
import { listReviews, loadReview } from './store.ts';

export const name = 'dsh-plugin-love';
export const inject = ['tools'];

const TOOL_NAME = 'love_review';
const ROUTE_STATE = '/api/love/state';
const ROUTE_REVIEW = '/api/love/review';
const MAX_BODY_BYTES = DEFAULT_LIMITS.bodyBytes;

function json(value, status = 200) {
  return Response.json(value, {
    status,
    headers: { 'cache-control': 'no-store' },
  });
}

function errorStatus(code) {
  switch (code) {
    case 'EMPTY_TARGET':
    case 'TARGET_TOO_LONG':
    case 'NOT_ABSOLUTE':
    case 'INVALID_LANG':
    case 'INVALID_DEPTH':
    case 'INVALID_FOCUS':
    case 'INVALID_ID':
      return 400;
    case 'NOT_FOUND':
    case 'NOT_A_PLUGIN':
    case 'NOT_DIRECTORY':
      return 404;
    case 'UNSAFE_TARGET':
      return 403;
    case 'BODY_TOO_LARGE':
      return 413;
    default:
      return 500;
  }
}

function fail(code, message) {
  return json({ ok: false, error: { code, message } }, errorStatus(code));
}

function parseLang(value) {
  if (value === undefined || value === null || value === '') return 'zh';
  if (value === 'zh' || value === 'en') return value;
  return null;
}

function parseDepth(value) {
  if (value === undefined || value === null || value === '') return 'standard';
  if (value === 'quick' || value === 'standard' || value === 'deep') return value;
  return null;
}

function parseFocus(value) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) return null;
  const allowed = new Set(['backend', 'frontend', 'ui', 'ux', 'performance', 'ai']);
  const list = [...new Set(value.filter((item) => typeof item === 'string'))];
  if (list.some((item) => !allowed.has(item))) return null;
  return list;
}

async function readBody(request) {
  const text = await request.text();
  if (Buffer.byteLength(text, 'utf8') > MAX_BODY_BYTES) {
    const error = new Error('请求体过大');
    (error as any).code = 'BODY_TOO_LARGE';
    throw error;
  }
  if (!text.trim()) return {};
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('body must be an object');
    return parsed;
  } catch {
    const error = new Error('请求体不是合法 JSON 对象');
    (error as any).code = 'BAD_BODY';
    throw error;
  }
}

function reviewForPanel(value, lang) {
  return {
    id: value.id,
    createdAt: value.createdAt,
    depth: value.depth,
    lang,
    target: value.target,
    score: value.score,
    findings: value.findings,
    strengths: value.strengths,
    topFixes: value.topFixes,
    manualChecks: value.manualChecks,
    budget: value.budget,
    coverage: value.coverage,
    markdown: value.markdown,
    persisted: value.persisted !== false,
  };
}

function applyTool(ctx, config) {
  ctx.effect(() => ctx.tools.register({
    name: TOOL_NAME,
    description: 'Review a DSH or Node plugin from source with evidence-based, constructive criticism: backend, frontend, UI, UX, performance and AI-era readiness. Read-only; never executes the target. Returns a structured verdict plus a Markdown love letter. Use it when the user asks to review, critique, roast (kindly), audit, or improve someone else’s plugin. Read the evidence, then write the final answer in the user’s language; do not invent findings or citations.',
    parameters: {
      type: 'object',
      properties: {
        target: {
          type: 'string',
          description: 'Absolute path to the plugin directory, or an installed package name from the current DSH profile.',
        },
        lang: {
          type: 'string',
          enum: ['zh', 'en'],
          description: 'Language of the review text. Defaults to zh.',
        },
        focus: {
          type: 'array',
          items: { type: 'string', enum: ['backend', 'frontend', 'ui', 'ux', 'performance', 'ai'] },
          description: 'Optional subset of dimensions. Defaults to all six.',
        },
        depth: {
          type: 'string',
          enum: ['quick', 'standard', 'deep'],
          description: 'quick: P0/P1 core checks; standard: 37 core checks; deep: all 47 checks including UI/UX/performance deep checks. Defaults to standard.',
        },
      },
      required: ['target'],
      additionalProperties: false,
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          target: { type: 'string' },
          total: { type: 'integer' },
          verdict: { type: 'string' },
          summary: { type: 'string' },
          markdown: { type: 'string' },
        },
        required: ['target', 'total', 'verdict', 'summary', 'markdown'],
      },
      render: (_args, value) => [{ type: 'text', text: value.markdown }],
      presentationMeta: (_args, value) => ({ target: value.target, total: value.total, verdict: value.verdict }),
    },
    timeoutMs: 30000,
    isConcurrencySafe: () => true,
    presentCall: (args) => ({
      card: 'generic',
      title: `Love · ${args && args.target ? String(args.target) : 'plugin'}`,
      kind: 'read',
      rawInput: args,
    }),
    async execute(rawArgs) {
      const args = rawArgs && typeof rawArgs === 'object' ? rawArgs : {};
      const target = typeof args.target === 'string' ? args.target.trim() : '';
      if (!target) {
        const error = new Error('target 必填：绝对目录或已安装包名');
        (error as any).code = 'EMPTY_TARGET';
        throw error;
      }
      if (target.length > 1024) {
        const error = new Error('target 太长');
        (error as any).code = 'TARGET_TOO_LONG';
        throw error;
      }
      const lang = parseLang(args.lang);
      if (!lang) {
        const error = new Error('lang 只能是 zh 或 en');
        (error as any).code = 'INVALID_LANG';
        throw error;
      }
      const depth = parseDepth(args.depth);
      if (!depth) {
        const error = new Error('depth 只能是 quick/standard/deep');
        (error as any).code = 'INVALID_DEPTH';
        throw error;
      }
      const focus = parseFocus(args.focus);
      if (!focus) {
        const error = new Error('focus 只能包含 backend/frontend/ui/ux/performance/ai');
        (error as any).code = 'INVALID_FOCUS';
        throw error;
      }
      const review = await reviewTarget(target, { lang, depth, focus, config });
      return {
        target: review.target.title || review.target.name,
        total: review.score.total,
        verdict: review.score.verdict.text,
        summary: review.score.verdict.text,
        markdown: review.markdown,
      };
    },
  }), 'love: love_review tool');
}

function applyRoutes(ctx, config) {
  ctx.inject(['connection'], (scope) => {
    const fetch = scope.connection && scope.connection.fetch;
    if (!fetch || typeof fetch.register !== 'function') {
      console.warn('love: connection.fetch unavailable; panel routes disabled');
      return;
    }

    scope.effect(() => fetch.register({
      path: ROUTE_STATE,
      methods: ['GET'],
      requestBody: 'buffered',
      fetch: async (request) => {
        try {
          const url = new URL(request.url);
          const lang = parseLang(url.searchParams.get('lang'));
          if (!lang) return fail('INVALID_LANG', 'lang 只能是 zh 或 en');
          const [targets, reviews] = await Promise.all([listInstalledTargets(), listReviews(lang, 20)]);
          return json({
            ok: true,
            version: PLUGIN_VERSION,
            targets,
            reviews,
            limits: {
              maxFiles: config && config.maxFiles ? config.maxFiles : DEFAULT_LIMITS.maxFiles,
              historyLimit: config && config.historyLimit ? config.historyLimit : DEFAULT_LIMITS.historyLimit,
            },
          });
        } catch (error) {
          console.warn('love: state route failed:', error && error.message ? error.message : error);
          return fail('INTERNAL', '读取审查状态失败');
        }
      },
    }), 'love: state route');

    scope.effect(() => fetch.register({
      path: ROUTE_REVIEW,
      methods: ['GET', 'POST'],
      requestBody: 'buffered',
      fetch: async (request) => {
        try {
          const url = new URL(request.url);
          if (request.method === 'GET') {
            const lang = parseLang(url.searchParams.get('lang'));
            if (!lang) return fail('INVALID_LANG', 'lang 只能是 zh 或 en');
            const id = url.searchParams.get('id') || '';
            const review = await loadReview(id, lang);
            return json({ ok: true, review: reviewForPanel(review, lang) });
          }
          const body = await readBody(request);
          const target = typeof body.target === 'string' ? body.target.trim() : '';
          if (!target) return fail('EMPTY_TARGET', 'target 必填：绝对目录或已安装包名');
          if (target.length > 1024) return fail('TARGET_TOO_LONG', 'target 太长');
          const lang = parseLang(body.lang);
          if (!lang) return fail('INVALID_LANG', 'lang 只能是 zh 或 en');
          const depth = parseDepth(body.depth);
          if (!depth) return fail('INVALID_DEPTH', 'depth 只能是 quick/standard/deep');
          const focus = parseFocus(body.focus);
          if (!focus) return fail('INVALID_FOCUS', 'focus 只能包含 backend/frontend/ui/ux/performance/ai');
          const review = await reviewTarget(target, { lang, depth, focus, config });
          return json({ ok: true, review: reviewForPanel(review, lang) });
        } catch (error) {
          const code = error && (error as any).code && errorStatus((error as any).code) !== 500 ? (error as any).code : 'INTERNAL';
          if (code === 'INTERNAL') {
            console.warn('love: review route failed:', error && error.message ? error.message : error);
          }
          return fail(code, code === 'INTERNAL' ? '审查失败，请检查目标是否可读' : error.message);
        }
      },
    }), 'love: review route');
  });
}

export function apply(ctx, config) {
  applyTool(ctx, config);
  applyRoutes(ctx, config);
}
