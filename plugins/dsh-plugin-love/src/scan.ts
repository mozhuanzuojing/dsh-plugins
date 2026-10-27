import { lstat, readdir, readFile, realpath, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import {
  DEFAULT_LIMITS,
  SKIP_DIRS,
  SKIP_FILES,
  TEXT_EXTENSIONS,
} from './constants.ts';
import { toPosix, truncate } from './util.ts';

export function dshHome() {
  const override = process.env.DSH_HOME;
  if (typeof override === 'string' && override.trim()) return override.trim();
  return join(homedir(), '.dsh');
}

export function profileDir() {
  const dir = process.env.DSH_PROFILE_DIR;
  return typeof dir === 'string' && dir.trim() ? dir.trim() : '';
}

function within(parent, child) {
  const rel = relative(parent, child);
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
}

/**
 * Installed-profile lookup must not rely on env alone: the DSH Host process
 * does not always carry `DSH_PROFILE_DIR` / `DSH_PROFILE`, but shells spawned
 * by a profile do. Fall back from env to the named profile, then to every
 * profile under `~/.dsh/profiles`.
 */
export async function profileCandidates(): Promise<string[]> {
  const home = dshHome();
  const out: string[] = [];
  const push = async (dir: string) => {
    if (!dir || out.includes(dir)) return;
    const ok = await lstat(dir).then((info) => info.isDirectory()).catch(() => false);
    if (ok) out.push(dir);
  };
  await push(profileDir());
  const named = process.env.DSH_PROFILE;
  if (typeof named === 'string' && named.trim()) await push(join(home, 'profiles', named.trim()));
  const profilesRoot = join(home, 'profiles');
  try {
    const entries = await readdir(profilesRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() || entry.isSymbolicLink()) await push(join(profilesRoot, entry.name));
    }
  } catch {
    // No profiles directory at all; callers see an empty candidate list.
  }
  return out;
}

async function isUnsafeRoot(root: string) {
  const home = resolve(homedir());
  const dsh = resolve(dshHome());
  const profiles = await profileCandidates();
  const rootResolved = resolve(root);
  if (rootResolved === home || rootResolved === dsh || profiles.some((dir) => rootResolved === resolve(dir))) {
    return '目标是 home / DSH 根目录 / profile 根目录，请选具体插件目录';
  }
  if (/^[A-Za-z]:[\\/]?$/.test(rootResolved) || rootResolved === sep) return '目标是磁盘根目录，请选具体插件目录';
  const normalized = toPosix(rootResolved).toLowerCase();
  for (const part of ['/sessions', '/attachments', '/credentials']) {
    if (normalized.endsWith(part)) return '目标是 DSH 会话/凭据目录，不审';
  }
  return '';
}

export async function listInstalledTargets() {
  const dirs = await profileCandidates();
  const out = [];
  const seen = new Set();
  for (const dir of dirs) {
    let pkg;
    try {
      pkg = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8'));
    } catch {
      continue;
    }
    const deps = pkg && pkg.dependencies && typeof pkg.dependencies === 'object' ? pkg.dependencies : {};
    for (const name of Object.keys(deps)) {
      if (seen.has(name)) continue;
      const packageDir = join(dir, 'node_modules', name);
      try {
        const raw = JSON.parse(await readFile(join(packageDir, 'package.json'), 'utf8'));
        const hasPatch = await lstat(join(packageDir, 'cordis.patch.yml')).then(() => true).catch(() => false);
        if (!raw.dsh && !hasPatch) continue;
        let root = packageDir;
        try { root = await realpath(packageDir); } catch { /* keep the link path */ }
        const locale = await readLocaleTitle(root);
        out.push({
          name: raw.name || name,
          version: raw.version || '',
          description: raw.description || '',
          title: locale.title || raw.name || name,
          path: root,
          kind: raw.dsh ? 'dsh-plugin' : 'node-package',
          source: 'installed',
        });
        seen.add(name);
      } catch {
        // A dependency that is not installed is not a review target.
      }
    }
  }
  out.sort((a, b) => String(a.title).localeCompare(String(b.title), 'zh-Hans-CN'));
  return out;
}

async function readLocaleTitle(root) {
  for (const lang of ['zh', 'en']) {
    try {
      const parsed = JSON.parse(await readFile(join(root, 'locale', `${lang}.json`), 'utf8'));
      if (parsed && parsed.meta && typeof parsed.meta.title === 'string') return { title: parsed.meta.title };
    } catch {
      // Fall through to the next locale.
    }
  }
  return {};
}

/**
 * Resolve a review target. Accepts an absolute directory or an installed
 * package name from the current profile. Relative paths are rejected on
 * purpose: the Host process cwd is not the user's session cwd.
 */
export async function resolveTarget(input: string, options: any = {}) {
  const raw = typeof input === 'string' ? input.trim() : '';
  if (!raw) throw targetError('EMPTY_TARGET', '请提供插件目录的绝对路径或已安装包名');
  if (raw.length > 1024) throw targetError('TARGET_TOO_LONG', '目标字符串过长');

  let root = '';
  let source = 'path';
  let installed = null;
  const installedTargets = await listInstalledTargets();
  const byName = installedTargets.find((item) => item.name === raw);
  if (byName) {
    root = byName.path;
    source = 'installed';
    installed = byName;
  } else if (isAbsolute(raw)) {
    root = raw;
  } else if (options.allowRelative && options.cwd) {
    root = resolve(options.cwd, raw);
  } else if (/^(@[A-Za-z0-9._-]+\/)?[A-Za-z0-9._-]+$/.test(raw) && !raw.includes('\\')) {
    const known = installedTargets.map((item) => item.name);
    throw targetError(
      'PACKAGE_NOT_INSTALLED',
      `「${raw}」不是当前 profile 已安装的包${known.length ? `；可审的已安装包：${known.join('、')}` : '（当前 profile 没发现已安装的 DSH 包，可能没有 DSH profile 环境变量）'}。也可以直接给插件目录的绝对路径。`,
    );
  } else {
    throw targetError('NOT_ABSOLUTE', '相对路径不可靠：请用绝对路径，或直接填已安装包名');
  }

  const unsafe = await isUnsafeRoot(root);
  if (unsafe) throw targetError('UNSAFE_TARGET', unsafe);

  let info;
  try {
    info = await lstat(root);
  } catch {
    throw targetError('NOT_FOUND', `找不到目标：${root}`);
  }
  if (!info.isDirectory()) throw targetError('NOT_DIRECTORY', '目标不是目录');

  let real = root;
  try { real = await realpath(root); } catch { /* keep original */ }

  const hasPackage = await lstat(join(real, 'package.json')).then((s) => s.isFile()).catch(() => false);
  const hasPatch = await lstat(join(real, 'cordis.patch.yml')).then((s) => s.isFile()).catch(() => false);
  const hasEntry = await lstat(join(real, 'index.js')).then((s) => s.isFile()).catch(() => false);
  if (!hasPackage && !hasPatch && !hasEntry) {
    throw targetError('NOT_A_PLUGIN', '这个目录没有 package.json / cordis.patch.yml / index.js，不像插件目录');
  }

  let pkg = null;
  if (hasPackage) {
    try {
      pkg = JSON.parse(await readFile(join(real, 'package.json'), 'utf8'));
    } catch {
      pkg = null;
    }
  }
  const kind = pkg && pkg.dsh ? 'dsh-plugin' : pkg ? 'node-package' : 'directory';
  const name = pkg && pkg.name ? String(pkg.name) : basename(real);
  const version = pkg && pkg.version ? String(pkg.version) : '';
  const locale = await readLocaleTitle(real);
  return {
    root: real,
    requested: raw,
    source,
    kind,
    name,
    version,
    description: pkg && pkg.description ? String(pkg.description) : '',
    title: (installed && installed.title) || locale.title || name,
    packageJson: pkg,
  };
}

export function targetError(code, message) {
  const error = new Error(message);
  (error as any).code = code;
  return error;
}

function isSkippedFile(name) {
  return SKIP_FILES.some((pattern) => pattern.test(name));
}

function classify(relPath) {
  const posix = toPosix(relPath).toLowerCase();
  const base = basename(posix);
  if (posix === 'package.json') return 'manifest';
  if (posix === 'cordis.patch.yml' || posix === 'cordis.yml') return 'patch';
  if (/^locale\/[^/]+\.json$/.test(posix)) return 'locale';
  if (base === 'readme.md' || base === 'readme.en.md' || base === 'changelog.md' || posix.startsWith('docs/')) return 'docs';
  if (posix.startsWith('test/') || posix.startsWith('tests/') || posix.startsWith('smoke/') || /\.(test|spec)\.[cm]?[jt]sx?$/.test(posix)) return 'test';
  if (base.endsWith('.css') || base.endsWith('.scss') || base.endsWith('.less')) return 'style';
  if (base === 'client.js' || base === 'client.ts' || base === 'client.tsx' || posix.includes('/client/') || base.startsWith('client.')) return 'client';
  if (base === 'index.js' || base === 'index.ts' || posix.startsWith('src/') || posix.startsWith('lib/')) return 'host';
  if (base.endsWith('.svg')) return 'asset';
  return 'other';
}

const ROLE_PRIORITY = {
  manifest: 0, patch: 1, host: 2, client: 3, locale: 4, style: 5, docs: 6, test: 7, asset: 8, other: 9,
};

function looksGenerated(text) {
  return text.includes('//# sourceMappingURL=') || text.includes('/*# sourceMappingURL=');
}

async function readTextFile(absPath, relPath, options, budget, meta) {
  let info;
  try {
    info = await lstat(absPath);
  } catch {
    budget.skipped.push({ path: relPath, reason: 'not-readable' });
    return null;
  }
  if (info.isSymbolicLink()) {
    budget.skipped.push({ path: relPath, reason: 'symlink' });
    return null;
  }
  if (!info.isFile()) return null;
  if (isSkippedFile(basename(relPath))) {
    budget.skipped.push({ path: relPath, reason: 'sensitive-or-generated' });
    return null;
  }
  const ext = extname(absPath).toLowerCase();
  if (!TEXT_EXTENSIONS.has(ext)) {
    budget.skipped.push({ path: relPath, reason: 'unsupported-extension' });
    return null;
  }
  if (info.size > options.maxFileBytes) {
    const role = classify(relPath) as string;
    if (role === 'client' || role === 'generated') {
      budget.largeFiles.push({ path: toPosix(relPath), bytes: info.size, role });
      budget.partial = true;
      budget.reason.push('large-client-skipped');
    }
    budget.skipped.push({ path: relPath, reason: `too-large:${info.size}` });
    return null;
  }
  if (budget.totalBytes + info.size > options.maxTotalBytes) {
    budget.partial = true;
    budget.skipped.push({ path: relPath, reason: 'total-budget' });
    return null;
  }
  let buffer;
  try {
    buffer = await readFile(absPath);
  } catch {
    budget.skipped.push({ path: relPath, reason: 'read-failed' });
    return null;
  }
  if (buffer.subarray(0, 4096).includes(0)) {
    budget.skipped.push({ path: relPath, reason: 'binary' });
    return null;
  }
  const text = buffer.toString('utf8');
  budget.totalBytes += info.size;
  const role = classify(relPath);
  const file = {
    path: toPosix(relPath),
    absPath,
    role,
    ext,
    bytes: info.size,
    text,
    lines: text.split('\n'),
    lineCount: text.length === 0 ? 0 : text.split('\n').length,
    generated: looksGenerated(text),
  };
  if (file.generated) file.role = 'generated';
  meta.maxLine = Math.max(meta.maxLine, ...file.lines.map((line) => line.length));
  meta.largestFile = !meta.largestFile || file.bytes > meta.largestFile.bytes ? { path: file.path, bytes: file.bytes } : meta.largestFile;
  return file;
}

/**
 * Read a plugin with hard bounds. Never follows symlinks and never reads
 * credential-like files. `partial` is explicit when a budget forced a stop.
 */
export async function walkPlugin(root: string, options: any = {}) {
  const limits = { ...DEFAULT_LIMITS, ...options };
  const deadline = Date.now() + (typeof limits.deadlineMs === 'number' ? limits.deadlineMs : limits.deadlineMs.standard);
  const budget = {
    totalBytes: 0,
    skipped: [],
    largeFiles: [],
    partial: false,
    reason: [],
  };
  const files = [];
  const meta = { maxLine: 0, largestFile: null };
  const seenDirs = new Set();

  async function visit(dir, depth) {
    if (depth > limits.maxDepth) {
      budget.partial = true;
      budget.skipped.push({ path: toPosix(relative(root, dir)), reason: 'max-depth' });
      return;
    }
    if (Date.now() > deadline) {
      budget.partial = true;
      budget.reason.push('deadline');
      return;
    }
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      budget.skipped.push({ path: toPosix(relative(root, dir) || '.'), reason: 'dir-read-failed' });
      return;
    }
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (Date.now() > deadline) {
        budget.partial = true;
        budget.reason.push('deadline');
        return;
      }
      const absPath = join(dir, entry.name);
      const relPath = toPosix(relative(root, absPath));
      if (entry.isSymbolicLink()) {
        budget.skipped.push({ path: relPath, reason: 'symlink' });
        continue;
      }
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name.toLowerCase())) {
          budget.skipped.push({ path: relPath, reason: 'skipped-dir' });
          continue;
        }
        if (depth + 1 > limits.maxDepth) {
          budget.partial = true;
          budget.skipped.push({ path: relPath, reason: 'max-depth' });
          continue;
        }
        if (seenDirs.has(absPath)) continue;
        seenDirs.add(absPath);
        await visit(absPath, depth + 1);
        continue;
      }
      if (!entry.isFile()) continue;
      if (files.length >= limits.maxFiles) {
        budget.partial = true;
        budget.skipped.push({ path: relPath, reason: 'max-files' });
        continue;
      }
      const file = await readTextFile(absPath, relPath, limits, budget, meta);
      if (file) files.push(file);
    }
  }

  await visit(root, 0);
  files.sort((a, b) => (ROLE_PRIORITY[a.role] ?? 9) - (ROLE_PRIORITY[b.role] ?? 9) || a.path.localeCompare(b.path));

  const byPath = new Map(files.map((f) => [f.path.toLowerCase(), f]));
  const hasClientSource = files.some((f) => /(^|\/)client\.src\.[cm]?[jt]sx?$|(^|\/)src\/client\//.test(f.path.toLowerCase()));
  const hasHostSource = files.some((f) => f.path === 'src/index.ts' || f.path === 'src/index.tsx');
  for (const file of files) {
    if (file.role === 'client' && hasClientSource && /__ModuleLoader__\.load/.test(file.text)) {
      file.generated = true;
      (file as any).sourceRole = 'client';
      (file as any).role = 'generated';
      file.skipReason = 'generated-bundle-has-source';
    }
    if (file.generated && hasClientSource) file.skipReason = 'generated-bundle-has-source';
  }
  // A client artifact skipped for size still counts as generated when its
  // source is present; otherwise `perf.bundle-size` would demand “keep the
  // source” from a plugin that already ships it.
  if (hasClientSource) {
    for (const large of budget.largeFiles) {
      if (large.role === 'client' || large.role === 'generated') (large as any).generated = true;
    }
  }

  const manifestFile = files.find((f) => f.role === 'manifest');
  const patchFile = files.find((f) => f.role === 'patch');
  let packageJson = null;
  if (manifestFile) {
    try { packageJson = JSON.parse(manifestFile.text); } catch { packageJson = null; }
  }
  if (hasHostSource && packageJson && typeof packageJson.main === 'string') {
    const mainPath = toPosix(packageJson.main).replace(/^\.\//, '');
    for (const file of files) {
      if (file.role === 'host' && file.path === mainPath && mainPath.startsWith('lib/')) {
        file.generated = true;
        (file as any).sourceRole = 'host';
        (file as any).role = 'generated';
        file.skipReason = 'generated-host-bundle-has-source';
      }
    }
  }
  const localeFiles = files.filter((f) => f.role === 'locale');
  const readmeFile = files.find((f) => f.role === 'docs' && /^readme/i.test(basename(f.path)));
  return {
    root,
    files,
    byPath,
    packageJson,
    manifestFile,
    patchFile,
    localeFiles,
    readmeFile,
    skipped: budget.skipped,
    partial: budget.partial,
    reason: budget.reason,
    totalBytes: budget.totalBytes,
    totalLines: files.reduce((sum, f) => sum + f.lineCount, 0),
    largestFile: meta.largestFile,
    largeFiles: budget.largeFiles,
    hasClientSource,
    limits,
  };
}

export function fileText(inventory, path) {
  const file = inventory.byPath.get(toPosix(path).toLowerCase());
  return file ? file.text : '';
}

export function filesOf(inventory, roles, { includeGenerated = false } = {}) {
  const wanted = new Set(Array.isArray(roles) ? roles : [roles]);
  return inventory.files.filter((file) => wanted.has(file.role) && (includeGenerated || !file.generated));
}

export function displayTargetPath(target) {
  return truncate(target.root, 500);
}
