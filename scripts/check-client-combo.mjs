/**
 * Repo-wide guard: every hand-written client bundle must survive being CONCATENATED.
 *
 * Why this exists
 * ---------------
 * `@deepseek-ai/dsh-client-modules` does not load each plugin's client bundle in
 * its own scope. It serves a "combo" resource — the ordered plugin list joined
 * into ONE script (`comboSearch()` builds `??a/client.js,b/client.js,…`) — so
 * every plugin's top-level declarations share a single scope. Two clients that
 * both declare `const NS` therefore produce
 *
 *     Uncaught SyntaxError: Identifier 'NS' has already been declared
 *
 * which fails the import of the whole combo: the bootstrap reports
 * "web boot: N entry did not activate" and the page comes up degraded. The crash
 * log `crash-*-web-boot.log` records it verbatim.
 *
 * A per-file `node --check` cannot catch this: each file is valid on its own.
 *
 * What it does
 * ------------
 * Concatenates the bundles the same way the host does and COMPILES the result
 * with `new Function`, which is where a duplicate top-level binding throws.
 * Nothing is executed — `window` and `module` do not exist here by design.
 *
 * Usage:
 *   node scripts/check-client-combo.mjs                 # every plugin under plugins/
 *   node scripts/check-client-combo.mjs <dir> [...]     # also scan extra roots
 *
 * Each plugin directory is probed for "client.js" or "client/index.js", which are
 * the two shapes this repo uses.
 *
 * Exit code 0 = every bundle coexists; 1 = a collision (details printed).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Candidate client bundles of one plugin directory, in host load shape. */
function clientFilesOf(pluginDir) {
  const found = [];
  for (const candidate of [join(pluginDir, 'client.js'), join(pluginDir, 'client', 'index.js')]) {
    try {
      if (statSync(candidate).isFile()) found.push(candidate);
    } catch {
      /* absent is normal: host-only plugins ship no client half */
    }
  }
  return found;
}

/** Every client bundle under `<root>/plugins/<name>/`. */
function collectFromRepo() {
  const pluginsDir = join(repoRoot, 'plugins');
  const out = [];
  let names = [];
  try {
    names = readdirSync(pluginsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch {
    return out;
  }
  for (const name of names) out.push(...clientFilesOf(join(pluginsDir, name)));
  return out;
}

/** Every client bundle under an arbitrary root (a profile's node_modules, etc.). */
function collectFromRoot(root) {
  const out = [];
  let names = [];
  try {
    names = readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch {
    return out;
  }
  for (const name of names) out.push(...clientFilesOf(join(root, name)));
  return out;
}

const extraRoots = process.argv.slice(2);
/** Bundle plus whether this repo owns it (the IIFE rule is ours to enforce). */
const files = [
  ...collectFromRepo().map((path) => ({ path, owned: true })),
  ...extraRoots.flatMap((root) => collectFromRoot(resolve(root)).map((path) => ({ path, owned: false }))),
];

if (files.length === 0) {
  console.error('check-client-combo: no client bundles found');
  process.exit(1);
}

console.log(`check-client-combo: ${files.length} bundle(s)`);
for (const { path } of files) console.log(`  - ${relative(repoRoot, path)}`);

const combo = files
  .map(({ path }) => `// ---- ${relative(repoRoot, path)} ----\n${readFileSync(path, 'utf8')}`)
  .join('\n');

try {
  // Compiling is enough: duplicate top-level bindings are a SyntaxError, and
  // nothing here may run (no window, no document, no module).
  new Function(combo);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\nFAIL: the concatenated client bundle does not compile.`);
  console.error(`  ${message}`);
  console.error('');
  console.error('Each file is valid alone, so this is a cross-plugin scope collision.');
  console.error('Fix: wrap the whole client bundle in an IIFE so its declarations stay private:');
  console.error('');
  console.error('  (() => {');
  console.error("    window.__ModuleLoader__.load({ id: 'pkg-name', factory() { /* … */ } })");
  console.error('  })();');
  process.exit(1);
}

// A second, narrower guard: a bare top-level `const NS` is harmless only while it
// is the ONLY one, and the next plugin that picks the same name breaks the whole
// combo. Report unwrapped bundles before that happens.
//
// The IIFE opener sits after the file header comment, so the whole source is
// scanned for the first CODE line rather than only the first few hundred bytes —
// scanning a prefix reported every well-documented bundle as unwrapped.
const OPENERS = /^\s*(\(\s*\(\s*\)\s*=>|\(\s*function\s*\(|!function\s*\(|void function\s*\(|\(\s*async\s*\(\s*\)\s*=>)/m;

/** First line that is real code, ignoring blank lines and a leading block comment. */
function firstCodeLine(source) {
  const withoutHeader = source.replace(/^\uFEFF/, '').replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '');
  for (const line of withoutHeader.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('//')) continue;
    return line;
  }
  return '';
}

const offenders = [];
for (const { path, owned } of files) {
  // Third-party bundles from an extra root are checked for collisions only: their
  // style is not ours to enforce, and a bundle that keeps its declarations inside
  // the factory is genuinely safe without an IIFE.
  if (!owned) continue;
  const source = readFileSync(path, 'utf8');
  if (!OPENERS.test(firstCodeLine(source))) offenders.push(path);
}
if (offenders.length > 0) {
  console.error('\nFAIL: these client bundles are not IIFE-wrapped, so their top-level');
  console.error('declarations leak into the combo scope and can collide with a sibling:');
  for (const file of offenders) console.error(`  - ${relative(repoRoot, file)}`);
  console.error('\nWrap each one as:');
  console.error("  (() => { window.__ModuleLoader__.load({ id: 'pkg', factory() { /* … */ } }) })();");
  process.exit(1);
}

console.log('\nOK: every client bundle compiles together and is IIFE-wrapped.');
