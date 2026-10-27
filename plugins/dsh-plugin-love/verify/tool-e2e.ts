import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { apply } from '../lib/index.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const badPath = join(root, 'test', 'fixtures', 'bad-plugin');
const home = await mkdtemp(join(tmpdir(), 'love-e2e-'));
const previousHome = process.env.DSH_HOME;
process.env.DSH_HOME = home;

try {
  const tools: any[] = [];
  const routes: any[] = [];
  const ctx = {
    effect(fn: () => any) { return fn(); },
    inject(_deps: string[], cb: (scope: any) => void) {
      cb({
        effect: (fn: () => any) => fn(),
        connection: { fetch: { register: (route: any) => { routes.push(route); return async () => {}; } } },
      });
    },
    tools: { register(definition: any) { tools.push(definition); return () => {}; } },
  };
  apply(ctx, {});

  const tool = tools.find((item) => item.name === 'love_review');
  if (!tool) throw new Error('love_review was not registered');

  const result = await tool.execute({
    target: badPath,
    lang: 'zh',
    depth: 'standard',
  }, { signal: new AbortController().signal });

  console.log(JSON.stringify({
    registeredTools: tools.map((item) => item.name),
    registeredRoutes: routes.map((route) => route.path),
    target: result.target,
    total: result.total,
    verdict: result.verdict,
    markdownLength: result.markdown.length,
    hasTopFixes: result.markdown.includes('如果只改三件事'),
    hasFooter: result.markdown.includes('把刺留在代码上，不留在人身上。'),
  }, null, 2));
} finally {
  if (previousHome === undefined) delete process.env.DSH_HOME;
  else process.env.DSH_HOME = previousHome;
  await rm(home, { recursive: true, force: true });
}
