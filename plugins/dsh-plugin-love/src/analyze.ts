import { lstat, readFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { BUDGETS } from './constants.ts';
import { flattenKeys, parseColor, contrastRatio, callBlocks, toPosix, balancedBlock } from './util.ts';
import { filesOf } from './scan.ts';

function issue(checkId, file, text, index, detail) {
  const before = text.slice(0, Math.max(0, index));
  const line = before.split('\n').length;
  const start = text.lastIndexOf('\n', Math.max(0, index - 1)) + 1;
  let end = text.indexOf('\n', index);
  if (end === -1) end = text.length;
  return {
    checkId,
    path: file ? file.path : '',
    line,
    snippet: text.slice(start, Math.min(end, start + 500)).replace(/\r/g, ''),
    detail: detail || '',
  };
}

function patchNames(text) {
  const names = [];
  const ids = [];
  const nameRegex = /^\s*(?:-\s*)?name\s*:\s*['"]?([^'"\s#]+)['"]?\s*$/gm;
  const idRegex = /^\s*(?:-\s*)?id\s*:\s*['"]?([^'"\s#]+)['"]?\s*$/gm;
  let match;
  while ((match = nameRegex.exec(text)) !== null) names.push(match[1]);
  while ((match = idRegex.exec(text)) !== null) ids.push(match[1]);
  return { names, ids };
}

function existsOnDisk(inventory, relPath) {
  if (!relPath) return Promise.resolve(false);
  if (inventory.byPath.has(toPosix(relPath).toLowerCase())) return Promise.resolve(true);
  // A file skipped by the read budget is still on disk; "couldn't read it"
  // must never be reported as "the manifest points at a missing file".
  return lstat(join(inventory.root, relPath)).then(() => true).catch(() => false);
}

function iconInfo(inventory, pkg) {
  const candidates = [];
  if (pkg && typeof pkg.icon === 'string') candidates.push(pkg.icon.replace(/^\.\//, ''));
  candidates.push('icon.svg', 'icon.png', 'icon.webp', 'icon.jpg', 'icon.jpeg');
  for (const candidate of candidates) {
    const file = inventory.byPath.get(candidate.toLowerCase());
    if (!file) continue;
    const ext = extname(file.path).toLowerCase();
    const valid = ['.svg', '.png', '.jpg', '.jpeg', '.webp'].includes(ext);
    const signature = file.text.slice(0, 200).trim();
    const svgOk = ext !== '.svg' || signature.startsWith('<svg') || signature.startsWith('<?xml');
    return {
      path: file.path,
      bytes: file.bytes,
      valid: valid && svgOk && file.bytes <= 256 * 1024,
      reason: !valid ? 'unsupported-format' : !svgOk ? 'bad-svg-signature' : file.bytes > 256 * 1024 ? 'too-large' : '',
    };
  }
  return { path: '', bytes: 0, valid: false, reason: 'missing' };
}

/** Icon bytes cannot be inspected when the budget skipped it; then trust the manifest. */
async function iconInfoChecked(inventory, pkg) {
  const icon = iconInfo(inventory, pkg);
  if (icon.valid || icon.reason !== 'missing') return icon;
  const declared = pkg && typeof pkg.icon === 'string' ? pkg.icon.replace(/^\.\//, '') : '';
  if (declared && await existsOnDisk(inventory, declared)) {
    return { path: declared, bytes: 0, valid: true, reason: '', note: 'skipped-by-budget' };
  }
  return icon;
}

export async function analyzeInventory(inventory, target) {
  const issues = [];
  const pkg = inventory.packageJson;
  const manifestFile = inventory.manifestFile;
  const patchFile = inventory.patchFile;

  if (!pkg) {
    if (manifestFile) issues.push(issue('meta.manifest-mismatch', manifestFile, manifestFile.text, 0, 'package.json 解析失败'));
    else issues.push({ checkId: 'meta.manifest-mismatch', path: 'package.json', line: 1, snippet: '', detail: '缺少 package.json' });
  }

  if (pkg && patchFile) {
    const { names, ids } = patchNames(patchFile.text);
    const packageName = String(pkg.name || '');
    if (packageName && names.length > 0 && !names.includes(packageName)) {
      // A patch may compose *other* modules on purpose: bundle packages (dsh-kit
      // is one) insert a host plugin such as `@deepseek-ai/dsh-skill-filesystem`
      // and hand it config, without loading themselves. Host modules live inside
      // the DSH runtime, so their absence from the walked root proves nothing —
      // calling that a self-load break is a false P1. A non-host name that is not
      // ours, by contrast, is the classic stale-rename signature.
      const hostComposed = names.every((name) => name.startsWith('@deepseek-ai/'));
      if (!hostComposed) {
        issues.push(issue('meta.manifest-mismatch', patchFile, patchFile.text, patchFile.text.indexOf('name'), `cordis.patch.yml 的 name=${names.join(', ')} 与 package.name=${packageName} 不一致`));
      }
    }
    if (ids.length === 0) {
      issues.push(issue('meta.manifest-mismatch', patchFile, patchFile.text, 0, 'cordis.patch.yml 没有 insert.id'));
    }
  } else if (pkg && pkg.dsh && pkg.dsh.bundle && !patchFile) {
    issues.push(issue('meta.manifest-mismatch', manifestFile, manifestFile.text, 0, 'package.json 声明了 dsh.bundle.patch，但目录里没有 cordis.patch.yml'));
  }

  if (pkg && pkg.dsh && pkg.dsh.client) {
    const exportsMap = pkg.exports && typeof pkg.exports === 'object' ? pkg.exports : {};
    const clientExport = exportsMap['./client'];
    const clientPath = typeof clientExport === 'string' ? clientExport : clientExport && clientExport.default;
    if (!clientPath) {
      issues.push(issue('meta.manifest-mismatch', manifestFile, manifestFile.text, 0, 'dsh.client 存在，但 exports 没有 ./client'));
    } else {
      const rel = String(clientPath).replace(/^\.\//, '');
      if (!await existsOnDisk(inventory, rel)) {
        issues.push(issue('meta.manifest-mismatch', manifestFile, manifestFile.text, 0, `exports["./client"] 指向的 ${rel} 不存在`));
      }
    }
  }

  // The host plugin inventory documents `icon` as an *optional* base64 data URL
  // taken from the package root's manifest icon or an exported `<specifier>/icon`
  // (dsh-host-plugin-inventory: "icon?: ... optional"). A missing icon makes the
  // plugin row render without an image; it never stops the plugin from loading.
  // So this is a polish note, not the "installed but nothing happens" P1 that
  // meta.manifest-mismatch exists for — that check stays structural only.
  const icon = await iconInfoChecked(inventory, pkg);
  if (!icon.valid) {
    const declared = pkg && typeof pkg.icon === 'string' ? pkg.icon.trim() : '';
    const where = manifestFile || patchFile;
    issues.push({
      checkId: 'meta.icon',
      path: where ? where.path : declared || 'icon.svg',
      line: 1,
      snippet: '',
      detail: declared
        ? `package.json 声明的图标 ${declared} 缺失或无效（${icon.reason || 'unknown'}）`
        : '没有插件图标（宿主 schema 里 icon 可选，Plugin Manager 显示为无图标的行）',
      // A manifest that points at a file which is not there is a real (if minor)
      // inconsistency; shipping no icon at all is optional by contract.
      severity: declared ? 'P2' : 'P3',
    });
  }

  // Locale pairing and metadata.
  const localeByLang = new Map();
  for (const file of inventory.localeFiles) {
    const lang = basename(file.path, '.json').toLowerCase();
    if (!['zh', 'en'].includes(lang)) continue;
    try {
      localeByLang.set(lang, { file, data: JSON.parse(file.text) });
    } catch {
      issues.push(issue('meta.locale-mismatch', file, file.text, 0, `${file.path} 不是合法 JSON`));
    }
  }
  if (localeByLang.size === 0) {
    issues.push({ checkId: 'meta.locale-mismatch', path: 'locale/', line: 1, snippet: '', detail: '没有 locale/zh.json 或 locale/en.json，Plugin Manager 只能回退到包名/描述' });
  } else {
    const zh = localeByLang.get('zh');
    const en = localeByLang.get('en');
    for (const entry of [zh, en]) {
      if (!entry) continue;
      if (!entry.data || !entry.data.meta || typeof entry.data.meta.title !== 'string' || !entry.data.meta.title.trim()) {
        issues.push(issue('meta.locale-mismatch', entry.file, entry.file.text, 0, `${entry.file.path} 缺 meta.title`));
      }
      if (!entry.data || !entry.data.meta || typeof entry.data.meta.description !== 'string' || !entry.data.meta.description.trim()) {
        issues.push(issue('meta.locale-mismatch', entry.file, entry.file.text, 0, `${entry.file.path} 缺 meta.description`));
      }
    }
    if (zh && en) {
      const zhKeys = new Set(flattenKeys(zh.data));
      const enKeys = new Set(flattenKeys(en.data));
      const missingEn = [...zhKeys].filter((key) => !enKeys.has(key));
      const missingZh = [...enKeys].filter((key) => !zhKeys.has(key));
      if (missingEn.length || missingZh.length) {
        const detail = `zh/en key 不配对：zh 多 ${missingEn.slice(0, 5).join(', ') || '无'}；en 多 ${missingZh.slice(0, 5).join(', ') || '无'}`;
        issues.push(issue('meta.locale-mismatch', zh.file, zh.file.text, 0, detail));
      }
    }
  }

  return { issues, icon, localeByLang };
}

export function computeBudget(inventory) {
  const clientCandidates = inventory.files.filter((f) => f.role === 'client' || (f.role === 'generated' && (f as any).sourceRole === 'client'));
  const hasClientArtifact = clientCandidates.some((f) => f.generated);
  const clientFiles = hasClientArtifact ? clientCandidates.filter((f) => f.generated) : clientCandidates;
  const largeClientFiles = (inventory.largeFiles || []).filter((f) => f.role === 'client' || (f.role === 'generated' && (f as any).sourceRole === 'client'));
  const clientBytes = clientFiles.reduce((sum, file) => sum + file.bytes, 0)
    + largeClientFiles.reduce((sum, file) => sum + file.bytes, 0);
  const clientArtifact = [
    ...clientFiles.map((file) => ({ path: file.path, bytes: file.bytes, generated: file.generated })),
    ...largeClientFiles.map((file) => ({ path: file.path, bytes: file.bytes, generated: (file as any).generated === true || file.role === 'generated' })),
  ].sort((a, b) => b.bytes - a.bytes)[0] || null;

  let inlineAssetBytes = 0;
  const inlineOccurrences = [];
  for (const file of inventory.files) {
    if (!['client', 'generated', 'style', 'host'].includes(file.role)) continue;
    const re = /data:(?:image|font)\/[^;]+;base64,([A-Za-z0-9+/=\s]{1000,})/g;
    let match;
    while ((match = re.exec(file.text)) !== null) {
      const bytes = Math.floor((match[1].replace(/\s/g, '').length * 3) / 4);
      inlineAssetBytes += bytes;
      if (inlineOccurrences.length < 5) {
        const before = file.text.slice(0, match.index);
        inlineOccurrences.push({ path: file.path, line: before.split('\n').length, bytes });
      }
    }
  }

  const hostFiles = filesOf(inventory, ['host']);
  const syncIoCalls = [];
  const pollingIntervals = [];
  const serialAwaitLoops = [];
  for (const file of hostFiles) {
    const lines = file.lines;
    lines.forEach((line, index) => {
      if (/\b(?:readFileSync|writeFileSync)\s*\(/.test(line) && !/^\s*import\b/.test(line) && !/^\s*(\/\/|\*)/.test(line)) {
        const window = lines.slice(Math.max(0, index - 30), index + 1).join('\n');
        const hotPath = /fetch:|execute\s*[:(]|requestBody|onRequest/.test(window);
        syncIoCalls.push({ path: file.path, line: index + 1, code: line.trim().slice(0, 160), hotPath });
      }
    });
    const pollRe = /setInterval\s*\([^,]*,\s*(\d+)\s*\)/g;
    let match;
    while ((match = pollRe.exec(file.text)) !== null) {
      const ms = Number(match[1]);
      if (Number.isFinite(ms) && ms < BUDGETS.pollingMinMs) {
        pollingIntervals.push({ path: file.path, line: file.text.slice(0, match.index).split('\n').length, ms });
      }
    }
    // Scan whole for-loops with balanced braces: the retry signature
    // (catch/break) usually sits after the first `}`, so a lazy `[^}]*`
    // body would misclassify dependent loops as parallelizable.
    const forRe = /\bfor\s*[({\s]/g;
    let forMatch;
    while ((forMatch = forRe.exec(file.text)) !== null) {
      const lineStart = file.text.lastIndexOf('\n', Math.max(0, forMatch.index - 1)) + 1;
      let lineEnd = file.text.indexOf('\n', forMatch.index);
      if (lineEnd === -1) lineEnd = file.text.length;
      const lineText = file.text.slice(lineStart, lineEnd);
      if (!/^\s*(?:await\s+)?for\b/.test(lineText)) continue;
      if (/^\s*(?:\/\/|\*)/.test(lineText) || /['"`]/.test(lineText)) continue;
      if (/^\s*(?:const|let|var)\s+\w+\s*=\s*\//.test(lineText) || /new\s+RegExp/.test(lineText)) continue;
      const brace = file.text.indexOf('{', forMatch.index);
      if (brace === -1 || brace > lineEnd + 4000) continue;
      const body = balancedBlock(file.text, brace, '{', '}');
      if (!body) continue;
      forRe.lastIndex = Math.max(forRe.lastIndex, body.end + 1);
      const inner = body.text;
      if (!/\bawait\b/.test(inner)) continue;
      if (/\bPromise\.all\b|\bPromise\.allSettled\b/.test(inner)) continue;
      // Retry/backoff, early-exit search and fail-fast loops are serial on
      // purpose: parallelizing them would change behaviour, not just speed.
      if (/\bbreak\b|\bcatch\b|\bthrow\b|\breturn\b/.test(inner)) continue;
      serialAwaitLoops.push({ path: file.path, line: file.text.slice(0, forMatch.index).split('\n').length });
    }
  }

  let fetchWithoutAbort = 0;
  const fetchOccurrences = [];
  const clientFilesForEffects = filesOf(inventory, ['client']);
  for (const file of clientFilesForEffects) {
    for (const block of callBlocks(file.text, 'useEffect')) {
      if (!/\bfetch\s*\(/.test(block.text)) continue;
      if (/AbortController|AbortSignal|signal\s*:/.test(block.text)) continue;
      fetchWithoutAbort += 1;
      if (fetchOccurrences.length < 5) {
        fetchOccurrences.push({ path: file.path, line: file.text.slice(0, block.start).split('\n').length });
      }
    }
  }

  let layoutAnimationRules = 0;
  const layoutOccurrences = [];
  for (const file of filesOf(inventory, ['client', 'style'])) {
    const re = /(?:transition(?:-property)?|animation)\s*:[^;{}]*\b(width|height|top|left|right|bottom|margin|padding)\b/gi;
    let match;
    while ((match = re.exec(file.text)) !== null) {
      layoutAnimationRules += 1;
      if (layoutOccurrences.length < 5) {
        layoutOccurrences.push({ path: file.path, line: file.text.slice(0, match.index).split('\n').length, property: match[1] });
      }
    }
  }

  return {
    values: {
      clientBytes,
      largestFileBytes: clientArtifact ? clientArtifact.bytes : 0,
      inlineAssetBytes,
      syncIoCalls: syncIoCalls.length,
      pollingIntervals: pollingIntervals.map((item) => item.ms),
      fetchWithoutAbort,
      serialAwaitLoops: serialAwaitLoops.length,
      layoutAnimationRules,
    },
    details: {
      clientArtifact: clientArtifact ? { path: clientArtifact.path, bytes: clientArtifact.bytes, generated: clientArtifact.generated } : null,
      inlineOccurrences,
      syncIoCalls,
      pollingIntervals,
      serialAwaitLoops,
      fetchWithoutAbort: fetchOccurrences,
      layoutAnimationRules: layoutOccurrences,
    },
    budgets: {
      clientBytesWarn: BUDGETS.clientBytesWarn,
      clientBytesBad: BUDGETS.clientBytesBad,
      inlineAssetBytes: BUDGETS.inlineAssetBytes,
      pollingMinMs: BUDGETS.pollingMinMs,
    },
  };
}

/** Parse a CSS file into simple `{selector, body, index}` rules. */
export function cssRules(text) {
  const rules = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    const selector = match[1].trim().replace(/\s+/g, ' ');
    if (!selector || selector.startsWith('@')) continue;
    rules.push({ selector, body: match[2], index: match.index });
  }
  return rules;
}

export function inlineColorPairs(text) {
  const pairs = [];
  // CSS rule bodies.
  for (const rule of cssRules(text)) {
    const fg = rule.body.match(/(?:^|[;\s])color\s*:\s*([^;]+)/i);
    const bg = rule.body.match(/(?:^|[;\s])background(?:-color)?\s*:\s*([^;]+)/i);
    if (fg && bg) {
      const fgValue = fg[1].trim();
      const bgValue = bg[1].trim();
      const ratio = contrastRatio(fgValue, bgValue);
      if (ratio !== null) pairs.push({ index: rule.index, selector: rule.selector, fg: fgValue, bg: bgValue, ratio });
    }
  }
  // Inline React style objects: { color: '#111', backgroundColor: '#fff' }
  const objectRe = /\{[^{}]{0,800}?color\s*:\s*['"]([^'"]+)['"][^{}]{0,800}?backgroundColor\s*:\s*['"]([^'"]+)['"][^{}]{0,300}?\}/g;
  let match;
  while ((match = objectRe.exec(text)) !== null) {
    const ratio = contrastRatio(match[1], match[2]);
    if (ratio !== null) pairs.push({ index: match.index, selector: 'inline-style', fg: match[1], bg: match[2], ratio });
  }
  return pairs;
}

export function isLiteralColor(value) {
  return !!parseColor(value);
}
