import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { rename } from 'node:fs/promises';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { reviewTarget } from '../src/review.ts';
import { allChecks, checksFor } from '../src/checks.ts';
import { CITATIONS } from '../src/knowledge.ts';
import { apply } from '../src/index.ts';
import { resolveTarget, walkPlugin, listInstalledTargets } from '../src/scan.ts';
import { analyzeInventory, computeBudget } from '../src/analyze.ts';
import { DICTIONARY } from '../src/client/locale.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const goodPath = join(root, 'test', 'fixtures', 'good-plugin');
const badPath = join(root, 'test', 'fixtures', 'bad-plugin');

let good: any;
let badStandard: any;
let badDeep: any;

beforeAll(async () => {
  good = await reviewTarget(goodPath, { lang: 'zh', depth: 'standard', persist: false });
  badStandard = await reviewTarget(badPath, { lang: 'zh', depth: 'standard', persist: false });
  badDeep = await reviewTarget(badPath, { lang: 'zh', depth: 'deep', persist: false });
}, 60000);

describe('fixtures', () => {
  it('good fixture has no findings and a perfect score', () => {
    expect(good.findings).toHaveLength(0);
    expect(good.score.total).toBe(100);
  });

  it('bad fixture is well below the good one in standard mode', () => {
    expect(badStandard.score.total).toBeLessThan(60);
    expect(badStandard.score.total).toBeLessThan(good.score.total);
  });

  it('bad fixture triggers all core checks in standard mode', () => {
    const found = new Set(badStandard.findings.map((finding: any) => finding.checkId));
    const missing = checksFor({ depth: 'standard' }).map((check) => check.id).filter((id) => !found.has(id));
    expect(missing).toEqual([]);
  });

  it('deep mode adds every deep check', () => {
    const found = new Set(badDeep.findings.map((finding: any) => finding.checkId));
    const missing = checksFor({ depth: 'deep' }).filter((check) => check.tier === 'deep').map((check) => check.id).filter((id) => !found.has(id));
    expect(missing).toEqual([]);
  });

  it('deep findings never appear in standard mode', () => {
    const deepIds = new Set(checksFor({ depth: 'deep' }).filter((check) => check.tier === 'deep').map((check) => check.id));
    expect(badStandard.findings.some((finding: any) => deepIds.has(finding.checkId))).toBe(false);
  });
});

describe('citations', () => {
  it('every check declares a valid basis', () => {
    for (const check of allChecks()) {
      expect(['read', 'experience']).toContain(check.basis);
      if (check.basis === 'read') {
        expect(check.citations.length, check.id).toBeGreaterThan(0);
        for (const id of check.citations) {
          const citation = (CITATIONS as any)[id];
          expect(citation, `${check.id} -> ${id}`).toBeTruthy();
          expect(citation.status, `${check.id} -> ${id}`).toBe('read');
          expect(citation.quote.length, `${check.id} -> ${id}`).toBeGreaterThan(40);
          expect(citation.locator.length, `${check.id} -> ${id}`).toBeGreaterThan(2);
          expect(citation.supportsRules, `${check.id} -> ${id}`).toContain(check.id);
        }
      } else {
        expect(check.citations, check.id).toHaveLength(0);
      }
    }
  });

  it('read findings carry citations, experience findings do not', () => {
    for (const finding of badDeep.findings) {
      if (finding.basis === 'read') expect(finding.citations.length).toBeGreaterThan(0);
      else expect(finding.citations).toHaveLength(0);
    }
  });
});

describe('review output', () => {
  it('masks hardcoded secrets', () => {
    expect(badStandard.markdown).not.toContain('sk-live-1234567890abcdef');
    expect(badStandard.markdown).toContain('sk-l…cdef');
  });

  it('has the love-letter sections and footer', () => {
    expect(badStandard.markdown).toContain('如果只改三件事');
    expect(badStandard.markdown).toContain('性能预算');
    expect(badStandard.markdown).toContain('把刺留在代码上，不留在人身上。');
  });

  it('reports performance budgets from the fixture', () => {
    expect(badStandard.budget.values.clientBytes).toBeGreaterThan(500 * 1024);
    expect(badStandard.budget.values.inlineAssetBytes).toBeGreaterThan(100 * 1024);
    expect(badStandard.budget.values.pollingIntervals).toContain(200);
    expect(badStandard.budget.values.fetchWithoutAbort).toBeGreaterThan(0);
  });

  it('keeps zh/en dictionaries aligned', () => {
    expect(Object.keys(DICTIONARY.zh).sort()).toEqual(Object.keys(DICTIONARY.en).sort());
  });
});

describe('target safety', () => {
  it('distinguishes an uninstalled package name from a relative path', async () => {
    await expect(resolveTarget('some-plugin-not-installed')).rejects.toMatchObject({ code: 'PACKAGE_NOT_INSTALLED' });
    await expect(resolveTarget('test/fixtures/good-plugin')).rejects.toMatchObject({ code: 'NOT_ABSOLUTE' });
  });

  it('resolves installed package names even without DSH profile env vars', async () => {
    const savedDir = process.env.DSH_PROFILE_DIR;
    const savedName = process.env.DSH_PROFILE;
    delete process.env.DSH_PROFILE_DIR;
    delete process.env.DSH_PROFILE;
    try {
      const targets = await listInstalledTargets();
      if (targets.length === 0) return; // This machine has no profile dirs; nothing to assert.
      const resolved = await resolveTarget(targets[0].name);
      expect(resolved.source).toBe('installed');
    } finally {
      if (savedDir !== undefined) process.env.DSH_PROFILE_DIR = savedDir;
      if (savedName !== undefined) process.env.DSH_PROFILE = savedName;
    }
  });

  it('never reports a budget-skipped file as a missing manifest entry', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'love-bigclient-'));
    try {
      await writeFile(join(dir, 'package.json'), JSON.stringify({
        name: 'big-client-plugin',
        version: '1.0.0',
        type: 'module',
        main: 'index.js',
        exports: { '.': './index.js', './client': './client.js', './icon': './icon.svg' },
        icon: './icon.svg',
        dsh: { bundle: { patch: './cordis.patch.yml' }, client: { platform: 'web', immediately: true, inject: [] } },
      }, null, 2), 'utf8');
      await writeFile(join(dir, 'cordis.patch.yml'), "- insert:\n    - id: big-client-plugin\n      name: 'big-client-plugin'\n", 'utf8');
      await writeFile(join(dir, 'index.js'), "export function apply(ctx) { ctx.effect(() => {}, 'x'); }\n", 'utf8');
      await writeFile(join(dir, 'icon.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"></svg>\n', 'utf8');
      await mkdir(join(dir, 'src'), { recursive: true });
      await writeFile(join(dir, 'src', 'client.src.js'), "window.__ModuleLoader__.load({ id: 'big-client-plugin', factory() { return {}; } });\n", 'utf8');
      await writeFile(join(dir, 'client.js'), `window.__ModuleLoader__.load({ id: 'big-client-plugin', factory() { return {}; } });\n// pad ${'x'.repeat(600 * 1024)}\n`, 'utf8');
      await mkdir(join(dir, 'locale'), { recursive: true });
      await writeFile(join(dir, 'locale', 'zh.json'), JSON.stringify({ meta: { title: '大客户端', description: '构建产物被预算跳过' } }), 'utf8');
      await writeFile(join(dir, 'locale', 'en.json'), JSON.stringify({ meta: { title: 'Big client', description: 'Bundle skipped by budget' } }), 'utf8');

      // A budget this small forces client.js to be skipped without being read.
      const review = await reviewTarget(dir, { lang: 'zh', depth: 'standard', persist: false, maxFileBytes: 200 * 1024 });
      const checkIds = review.findings.map((finding: any) => finding.checkId);
      expect(checkIds).not.toContain('meta.manifest-mismatch');
      expect(checkIds).not.toContain('perf.bundle-size');
      expect(review.coverage.skipped.some((item: any) => item.path === 'client.js' && String(item.reason).startsWith('too-large'))).toBe(true);
      expect(review.budget.details.clientArtifact).toMatchObject({ path: 'client.js', generated: true });
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('never treats a dependent retry loop as parallelizable', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'love-retry-'));
    try {
      await writeFile(join(dir, 'package.json'), JSON.stringify({ name: 'retry-plugin', version: '1.0.0', type: 'module', main: 'index.js' }), 'utf8');
      await writeFile(join(dir, 'index.js'), [
        'export async function renameWithRetry(from, to) {',
        '  const delays = [0, 20, 60, 140, 300];',
        '  let last;',
        '  for (const delay of delays) {',
        '    await new Promise((resolve) => setTimeout(resolve, delay));',
        '    try { await rename(from, to); return; } catch (error) { last = error; if (!error) break; }',
        '  }',
        '  throw last;',
        '}',
        '',
      ].join('\n'), 'utf8');
      const review = await reviewTarget(dir, { lang: 'zh', depth: 'standard', persist: false });
      expect(review.findings.map((finding: any) => finding.checkId)).not.toContain('perf.serial-await');
      expect(review.budget.values.serialAwaitLoops).toBe(0);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('rejects a relative path', async () => {
    await expect(resolveTarget('test/fixtures/good-plugin')).rejects.toMatchObject({ code: 'NOT_ABSOLUTE' });
  });

  it('rejects a directory without plugin markers', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'love-empty-'));
    try {
      await expect(resolveTarget(dir)).rejects.toMatchObject({ code: 'NOT_A_PLUGIN' });
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe('manifest contract', () => {
  it('does not call a bundle that composes host modules a manifest mismatch', async () => {
    // dsh-kit shape: the patch inserts a host plugin for the bundle's own config,
    // so its `name` never equals package.name — and the plugin still works.
    const dir = await mkdtemp(join(tmpdir(), 'love-bundle-'));
    try {
      await writeFile(join(dir, 'package.json'), JSON.stringify({
        name: 'kit-bundle',
        version: '1.0.0',
        type: 'module',
        main: 'index.js',
        dsh: { bundle: { patch: './cordis.patch.yml' } },
      }, null, 2), 'utf8');
      await writeFile(join(dir, 'cordis.patch.yml'), [
        '- insert:',
        '    - id: kit-bundle-skill-filesystem',
        "      name: '@deepseek-ai/dsh-skill-filesystem'",
        '      config:',
        '        providerName: kit-bundle',
        '',
      ].join('\n'), 'utf8');
      await writeFile(join(dir, 'index.js'), 'export function apply() {}\n', 'utf8');

      const review = await reviewTarget(dir, { lang: 'zh', depth: 'standard', persist: false });
      expect(review.findings.map((finding: any) => finding.checkId)).not.toContain('meta.manifest-mismatch');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('still flags a patch that inserts someone else, and no id at all', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'love-stale-'));
    try {
      await writeFile(join(dir, 'package.json'), JSON.stringify({ name: 'renamed-plugin', version: '1.0.0' }, null, 2), 'utf8');
      await writeFile(join(dir, 'cordis.patch.yml'), "- insert:\n    - name: 'old-plugin-name'\n", 'utf8');
      await writeFile(join(dir, 'index.js'), 'export function apply() {}\n', 'utf8');

      const review = await reviewTarget(dir, { lang: 'zh', depth: 'standard', persist: false });
      const finding = review.findings.find((item: any) => item.checkId === 'meta.manifest-mismatch');
      expect(finding).toBeTruthy();
      expect(finding.severity).toBe('P1');
      const details = finding.occurrences.map((occ: any) => occ.detail).join(' | ');
      expect(details).toContain('old-plugin-name');
      expect(details).toContain('insert.id');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe('icon contract', () => {
  const manifest = (extra: Record<string, unknown> = {}) => JSON.stringify({
    name: 'host-only-plugin',
    version: '0.1.0',
    type: 'module',
    main: 'index.js',
    exports: { '.': './index.js', './cordis.patch.yml': './cordis.patch.yml' },
    dsh: { bundle: { patch: './cordis.patch.yml' } },
    ...extra,
  }, null, 2);

  it('reports a plugin without any icon as P3 polish, never as a manifest mismatch', async () => {
    // This is the dsh-plugin-control-your-capture shape: host-only, no dsh.client,
    // no icon at all. The host inventory marks icon optional, so it must not be P1.
    const dir = await mkdtemp(join(tmpdir(), 'love-noicon-'));
    try {
      await writeFile(join(dir, 'package.json'), manifest(), 'utf8');
      await writeFile(join(dir, 'cordis.patch.yml'), "- insert:\n    - id: host-only-plugin\n      name: 'host-only-plugin'\n", 'utf8');
      await writeFile(join(dir, 'index.js'), 'export function apply() {}\n', 'utf8');

      const review = await reviewTarget(dir, { lang: 'zh', depth: 'standard', persist: false });
      const ids = review.findings.map((finding: any) => finding.checkId);
      expect(ids).not.toContain('meta.manifest-mismatch');

      const icon = review.findings.find((finding: any) => finding.checkId === 'meta.icon');
      expect(icon).toBeTruthy();
      expect(icon.severity).toBe('P3');
      expect(icon.occurrences[0].detail).toContain('没有插件图标');
      // The plugin still loads, so nothing here may claim the "won't load" story.
      expect(icon.why).not.toContain('不会加载');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('reports a declared but missing icon as a P2 inconsistency, not P1', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'love-badicon-'));
    try {
      await writeFile(join(dir, 'package.json'), JSON.stringify({
        name: 'bad-icon-plugin',
        version: '0.1.0',
        type: 'module',
        main: 'index.js',
        icon: './icon.svg',
        exports: { '.': './index.js', './icon': './icon.svg' },
        dsh: { bundle: { patch: './cordis.patch.yml' } },
      }, null, 2), 'utf8');
      await writeFile(join(dir, 'cordis.patch.yml'), "- insert:\n    - id: bad-icon-plugin\n      name: 'bad-icon-plugin'\n", 'utf8');
      await writeFile(join(dir, 'index.js'), 'export function apply() {}\n', 'utf8');

      const review = await reviewTarget(dir, { lang: 'zh', depth: 'standard', persist: false });
      const ids = review.findings.map((finding: any) => finding.checkId);
      expect(ids).not.toContain('meta.manifest-mismatch');
      const icon = review.findings.find((finding: any) => finding.checkId === 'meta.icon');
      expect(icon).toBeTruthy();
      expect(icon.severity).toBe('P2');
      expect(icon.occurrences[0].detail).toContain('icon.svg');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('keeps a clean icon out of the findings and in the strengths', async () => {
    const review = await reviewTarget(join(root, 'test', 'fixtures', 'good-plugin'), { lang: 'zh', depth: 'standard', persist: false });
    expect(review.findings.map((finding: any) => finding.checkId)).not.toContain('meta.icon');
    expect(review.strengths.map((strength: any) => strength.id)).toContain('icon');
  });
});

describe('walk limits', () => {
  it('skips node_modules and credential files', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'love-walk-'));
    try {
      await writeFile(join(dir, 'package.json'), JSON.stringify({ name: 'walk-fixture', version: '1.0.0' }), 'utf8');
      await writeFile(join(dir, 'index.js'), 'export function apply() {}\n', 'utf8');
      await writeFile(join(dir, '.env'), 'SECRET=1\n', 'utf8');
      await mkdir(join(dir, 'node_modules', 'x'), { recursive: true });
      await writeFile(join(dir, 'node_modules', 'x', 'index.js'), 'x\n', 'utf8');
      const inventory = await walkPlugin(dir);
      const paths = inventory.files.map((file) => file.path);
      expect(paths).toContain('index.js');
      expect(paths.some((path) => path.includes('node_modules'))).toBe(false);
      expect(paths).not.toContain('.env');
      expect(inventory.skipped.some((item) => item.path === '.env')).toBe(true);
      await writeFile(join(dir, '.credentials.yaml'), 'token: x\n', 'utf8');
      const inventory2 = await walkPlugin(dir);
      expect(inventory2.files.map((file) => file.path)).not.toContain('.credentials.yaml');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe('host surface', () => {
  it('registers the love_review tool and both routes', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'love-host-'));
    const previous = process.env.DSH_HOME;
    process.env.DSH_HOME = dir;
    try {
      const tools: any[] = [];
      const routes: any[] = [];
      const ctx = {
        effect(fn: () => any) { return fn(); },
        inject(_deps: string[], cb: (scope: any) => void) {
          cb({ effect: (fn: () => any) => fn(), connection: { fetch: { register: (route: any) => { routes.push(route); return async () => {}; } } } });
        },
        tools: { register: (definition: any) => { tools.push(definition); return () => {}; } },
      };
      apply(ctx, {});
      expect(tools.map((tool) => tool.name)).toContain('love_review');
      expect(routes.map((route) => route.path)).toEqual(['/api/love/state', '/api/love/review']);

      const stateRoute = routes.find((route) => route.path === '/api/love/state');
      const stateResponse = await stateRoute.fetch(new Request('http://local/api/love/state?lang=zh'));
      expect(stateResponse.status).toBe(200);
      const state = await stateResponse.json();
      expect(state.ok).toBe(true);
      expect(Array.isArray(state.targets)).toBe(true);

      const reviewRoute = routes.find((route) => route.path === '/api/love/review');
      const badRequest = new Request('http://local/api/love/review', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ target: badPath, lang: 'zh', depth: 'standard' }),
      });
      const reviewResponse = await reviewRoute.fetch(badRequest);
      expect(reviewResponse.status).toBe(200);
      const payload = await reviewResponse.json();
      expect(payload.ok).toBe(true);
      expect(payload.review.findings.length).toBeGreaterThan(0);
      expect(payload.review.markdown).toContain('如果只改三件事');

      const missingRequest = new Request('http://local/api/love/review', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ target: join(dir, 'nope'), lang: 'zh' }),
      });
      const missingResponse = await reviewRoute.fetch(missingRequest);
      expect(missingResponse.status).toBe(404);
    } finally {
      if (previous === undefined) delete process.env.DSH_HOME;
      else process.env.DSH_HOME = previous;
      await rm(dir, { recursive: true, force: true });
    }
  }, 60000);
});
