// src/constants.ts
var PLUGIN_VERSION = "0.1.1";
var REVIEW_FORMAT = "love/review@1";
var RULES_VERSION = 2;
var DIMENSIONS = [
  { id: "backend", weight: 0.12, zh: "\u540E\u7AEF", en: "Backend", zhNote: "Host\u3001HTTP \u8DEF\u7531\u3001\u5B50\u8FDB\u7A0B\u3001\u5BC6\u94A5\u4E0E\u751F\u547D\u5468\u671F\u3002", enNote: "Host code, HTTP routes, subprocesses, secrets and lifecycle." },
  { id: "frontend", weight: 0.13, zh: "\u524D\u7AEF", en: "Frontend", zhNote: "React\u3001\u526F\u4F5C\u7528\u3001DOM \u8FB9\u754C\u3001i18n \u4E0E\u6CE8\u5165\u9762\u3002", enNote: "React, effects, DOM boundaries, i18n and injection surface." },
  { id: "ui", weight: 0.2, zh: "UI", en: "UI", zhNote: "\u4E3B\u9898\u3001\u5BF9\u6BD4\u5EA6\u3001\u7126\u70B9\u3001\u76EE\u6807\u5C3A\u5BF8\u3001\u52A8\u6548\u4E0E\u5E03\u5C40\u3002", enNote: "Theme, contrast, focus, target size, motion and layout." },
  { id: "ux", weight: 0.2, zh: "UX", en: "UX", zhNote: "\u72B6\u6001\u3001\u9519\u8BEF\u6062\u590D\u3001\u7834\u574F\u6027\u64CD\u4F5C\u3001\u952E\u76D8\u4E0E\u53CD\u9988\u3002", enNote: "States, error recovery, destructive actions, keyboard and feedback." },
  { id: "performance", weight: 0.2, zh: "\u6027\u80FD", en: "Performance", zhNote: "\u4F53\u79EF\u3001\u4E3B\u7EBF\u7A0B\u3001\u7F51\u7EDC\u3001\u6E32\u67D3\u4E0E CSS \u52A8\u753B\u3002", enNote: "Bundle, main thread, network, rendering and CSS animation." },
  { id: "ai", weight: 0.15, zh: "AI \u65F6\u4EE3", en: "AI era", zhNote: "\u5DE5\u5177\u63CF\u8FF0\u3001\u786E\u8BA4\u3001\u964D\u7EA7\u3001\u4E0A\u4E0B\u6587\u4E0E\u4E0D\u53EF\u4FE1\u5185\u5BB9\u3002", enNote: "Tool contracts, confirmation, fallbacks, context and untrusted content." }
];
var DIMENSION_IDS = DIMENSIONS.map((d) => d.id);
var SEVERITIES = {
  P0: { id: "P0", penalty: 35, zh: "\u4F1A\u4F24\u4EBA", en: "blocks users" },
  P1: { id: "P1", penalty: 18, zh: "\u8BE5\u4FEE", en: "should fix" },
  P2: { id: "P2", penalty: 8, zh: "\u5EFA\u8BAE", en: "suggested" },
  P3: { id: "P3", penalty: 3, zh: "\u987A\u624B", en: "nit" }
};
var SEVERITY_ORDER = ["P0", "P1", "P2", "P3"];
var CONFIDENCE = { high: 1, medium: 0.7, low: 0.4 };
var DEFAULT_LIMITS = {
  maxFiles: 300,
  maxFileBytes: 512 * 1024,
  maxTotalBytes: 8 * 1024 * 1024,
  maxDepth: 8,
  maxFindings: 60,
  historyLimit: 50,
  bodyBytes: 256 * 1024,
  deadlineMs: { quick: 5e3, standard: 15e3, deep: 25e3 }
};
var BUDGETS = {
  clientBytesWarn: 500 * 1024,
  clientBytesBad: 1024 * 1024,
  inlineAssetBytes: 100 * 1024,
  pollingMinMs: 1e3,
  syncIoCalls: 0,
  serialAwaitLoops: 0
};
var TEXT_EXTENSIONS = /* @__PURE__ */ new Set([
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".jsx",
  ".json",
  ".yml",
  ".yaml",
  ".css",
  ".html",
  ".md",
  ".svg"
]);
var SKIP_DIRS = /* @__PURE__ */ new Set([
  "node_modules",
  ".git",
  ".hg",
  ".svn",
  "dist",
  "build",
  "out",
  "coverage",
  ".next",
  ".nuxt",
  ".cache",
  ".turbo",
  "vendor",
  "__pycache__"
]);
var SKIP_FILES = [
  /^\.env(\..*)?$/i,
  /^\.credentials/i,
  /^credentials\.ya?ml$/i,
  /\.pem$/i,
  /\.key$/i,
  /\.p12$/i,
  /\.pfx$/i,
  /^id_rsa/i,
  /\.log$/i,
  /\.map$/i,
  /\.min\.js$/i,
  /^pnpm-lock\.yaml$/i,
  /^package-lock\.json$/i,
  /^yarn\.lock$/i,
  /^bun\.lockb$/i
];
var VERDICT_BANDS = [
  { min: 90, key: "loved", zh: "\u5F88\u7A33\uFF0C\u53EF\u4EE5\u653E\u5FC3\u7528", en: "Solid. Safe to use." },
  { min: 75, key: "good", zh: "\u5E95\u5B50\u597D\uFF0C\u4FEE\u51E0\u5904\u5C31\u987A", en: "Good bones. A few fixes will smooth it out." },
  { min: 60, key: "usable", zh: "\u80FD\u7528\uFF0C\u4F46\u4F1A\u8BA9\u4EBA\u5361\u4E00\u4E0B", en: "Usable, but people will stumble." },
  { min: 40, key: "needs-work", zh: "\u5148\u4FEE\u786C\u4F24\uFF0C\u518D\u8C08\u4F53\u9A8C", en: "Fix the hard injuries before the polish." },
  { min: 0, key: "hold", zh: "\u5148\u522B\u6025\u7740\u8BA9\u4EBA\u7528", en: "Please do not ship this yet." }
];
var DIMENSION_WEIGHT_BY_ID = Object.fromEntries(DIMENSIONS.map((d) => [d.id, d.weight]));
function dimensionMeta(id) {
  return DIMENSIONS.find((d) => d.id === id);
}
function verdictFor(total) {
  return VERDICT_BANDS.find((band) => total >= band.min) || VERDICT_BANDS[VERDICT_BANDS.length - 1];
}

// src/analyze.ts
import { lstat as lstat2 } from "node:fs/promises";
import { basename as basename2, extname as extname2, join as join2 } from "node:path";

// src/util.ts
function toPosix(value) {
  return String(value).replace(/\\/g, "/");
}
function lineAt(text, index) {
  if (index <= 0) return 1;
  let line = 1;
  for (let i = 0; i < index && i < text.length; i += 1) {
    if (text.charCodeAt(i) === 10) line += 1;
  }
  return line;
}
function snippetAt(text, index, maxLines = 3) {
  const start = Math.max(0, text.lastIndexOf("\n", Math.max(0, index - 1)) + 1);
  let end = text.indexOf("\n", index);
  if (end === -1) end = text.length;
  for (let i = 1; i < maxLines; i += 1) {
    const next = text.indexOf("\n", end + 1);
    if (next === -1) {
      end = text.length;
      break;
    }
    end = next;
  }
  return text.slice(start, Math.min(end, start + 4e3)).replace(/\r/g, "");
}
function makeOccurrence(file, text, index, extra = {}) {
  const line = lineAt(text, index);
  return {
    path: file.path,
    line,
    snippet: snippetAt(text, index),
    ...extra
  };
}
function maskSecret(value) {
  const text = String(value);
  if (text.length <= 8) return "****";
  return text.slice(0, 4) + "\u2026" + text.slice(-4);
}
function redactPath(value, homeDir) {
  let text = String(value);
  if (homeDir) {
    const normalized = toPosix(text);
    const home = toPosix(homeDir).replace(/\/+$/, "");
    if (home && normalized.startsWith(home)) text = "~" + normalized.slice(home.length);
  }
  return text;
}
var NAMED = {
  transparent: [0, 0, 0, 0],
  black: [0, 0, 0, 1],
  white: [255, 255, 255, 1],
  red: [255, 0, 0, 1],
  green: [0, 128, 0, 1],
  blue: [0, 0, 255, 1],
  gray: [128, 128, 128, 1],
  grey: [128, 128, 128, 1]
};
function parseColor(input) {
  if (typeof input !== "string") return null;
  const value = input.trim().toLowerCase();
  if (NAMED[value]) return NAMED[value].slice();
  if (value.startsWith("#")) {
    const hex = value.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      const parts = hex.split("").map((c) => parseInt(c + c, 16));
      if (parts.some((n) => Number.isNaN(n))) return null;
      return [parts[0], parts[1], parts[2], parts.length === 4 ? parts[3] / 255 : 1];
    }
    if (hex.length === 6 || hex.length === 8) {
      const nums = [];
      for (let i = 0; i < hex.length; i += 2) nums.push(parseInt(hex.slice(i, i + 2), 16));
      if (nums.some((n) => Number.isNaN(n))) return null;
      return [nums[0], nums[1], nums[2], nums.length === 4 ? nums[3] / 255 : 1];
    }
    return null;
  }
  const match = value.match(/^rgba?\(([^)]+)\)$/);
  if (match) {
    const parts = match[1].split(",").map((p) => p.trim());
    if (parts.length < 3) return null;
    const nums = parts.slice(0, 3).map((p) => p.endsWith("%") ? Math.round(parseFloat(p) * 2.55) : parseInt(p, 10));
    if (nums.some((n) => Number.isNaN(n))) return null;
    const alpha = parts[3] === void 0 ? 1 : parts[3].endsWith("%") ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
    return [nums[0], nums[1], nums[2], Number.isFinite(alpha) ? alpha : 1];
  }
  return null;
}
function channel(value) {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
function relativeLuminance(rgb) {
  return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
}
function contrastRatio(foreground, background) {
  const fg = parseColor(foreground);
  const bg = parseColor(background);
  if (!fg || !bg) return null;
  if (fg[3] < 1 || bg[3] < 1) return null;
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
function balancedBlock(text, from, open = "(", close = ")") {
  const start = text.indexOf(open, from);
  if (start === -1) return null;
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        i += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "/" && next === "/") {
      lineComment = true;
      i += 1;
      continue;
    }
    if (ch === "/" && next === "*") {
      blockComment = true;
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === open) depth += 1;
    if (ch === close) {
      depth -= 1;
      if (depth === 0) {
        return { start, end: i, text: text.slice(start, i + 1) };
      }
    }
  }
  return null;
}
function callBlocks(text, name2) {
  const blocks = [];
  const pattern = new RegExp(`(?:^|[^\\w$])${name2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\(`, "g");
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const paren = text.indexOf("(", match.index);
    const block = balancedBlock(text, paren, "(", ")");
    if (block) {
      blocks.push(block);
      pattern.lastIndex = block.end + 1;
    }
  }
  return blocks;
}
function flattenKeys(value, prefix = "") {
  const keys = [];
  if (!value || typeof value !== "object" || Array.isArray(value)) return keys;
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object" && !Array.isArray(child)) keys.push(...flattenKeys(child, path));
    else keys.push(path);
  }
  return keys;
}
function uniqueBy(items, key) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const item of items) {
    const value = typeof key === "function" ? key(item) : item[key];
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(item);
  }
  return out;
}
function truncate(value, max = 4e3) {
  const text = String(value == null ? "" : value);
  return text.length > max ? text.slice(0, max) + "\n\u2026\uFF08\u622A\u65AD\uFF09" : text;
}
function fenceFor(text) {
  const value = String(text == null ? "" : text);
  const max = Math.max(3, ...(value.match(/`+/g) || []).map((m) => m.length + 1));
  return "`".repeat(max);
}

// src/scan.ts
import { lstat, readdir, readFile, realpath } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
function dshHome() {
  const override = process.env.DSH_HOME;
  if (typeof override === "string" && override.trim()) return override.trim();
  return join(homedir(), ".dsh");
}
function profileDir() {
  const dir = process.env.DSH_PROFILE_DIR;
  return typeof dir === "string" && dir.trim() ? dir.trim() : "";
}
async function profileCandidates() {
  const home = dshHome();
  const out = [];
  const push = async (dir) => {
    if (!dir || out.includes(dir)) return;
    const ok = await lstat(dir).then((info) => info.isDirectory()).catch(() => false);
    if (ok) out.push(dir);
  };
  await push(profileDir());
  const named = process.env.DSH_PROFILE;
  if (typeof named === "string" && named.trim()) await push(join(home, "profiles", named.trim()));
  const profilesRoot = join(home, "profiles");
  try {
    const entries = await readdir(profilesRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() || entry.isSymbolicLink()) await push(join(profilesRoot, entry.name));
    }
  } catch {
  }
  return out;
}
async function isUnsafeRoot(root) {
  const home = resolve(homedir());
  const dsh = resolve(dshHome());
  const profiles = await profileCandidates();
  const rootResolved = resolve(root);
  if (rootResolved === home || rootResolved === dsh || profiles.some((dir) => rootResolved === resolve(dir))) {
    return "\u76EE\u6807\u662F home / DSH \u6839\u76EE\u5F55 / profile \u6839\u76EE\u5F55\uFF0C\u8BF7\u9009\u5177\u4F53\u63D2\u4EF6\u76EE\u5F55";
  }
  if (/^[A-Za-z]:[\\/]?$/.test(rootResolved) || rootResolved === sep) return "\u76EE\u6807\u662F\u78C1\u76D8\u6839\u76EE\u5F55\uFF0C\u8BF7\u9009\u5177\u4F53\u63D2\u4EF6\u76EE\u5F55";
  const normalized = toPosix(rootResolved).toLowerCase();
  for (const part of ["/sessions", "/attachments", "/credentials"]) {
    if (normalized.endsWith(part)) return "\u76EE\u6807\u662F DSH \u4F1A\u8BDD/\u51ED\u636E\u76EE\u5F55\uFF0C\u4E0D\u5BA1";
  }
  return "";
}
async function listInstalledTargets() {
  const dirs = await profileCandidates();
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const dir of dirs) {
    let pkg;
    try {
      pkg = JSON.parse(await readFile(join(dir, "package.json"), "utf8"));
    } catch {
      continue;
    }
    const deps = pkg && pkg.dependencies && typeof pkg.dependencies === "object" ? pkg.dependencies : {};
    for (const name2 of Object.keys(deps)) {
      if (seen.has(name2)) continue;
      const packageDir = join(dir, "node_modules", name2);
      try {
        const raw = JSON.parse(await readFile(join(packageDir, "package.json"), "utf8"));
        const hasPatch = await lstat(join(packageDir, "cordis.patch.yml")).then(() => true).catch(() => false);
        if (!raw.dsh && !hasPatch) continue;
        let root = packageDir;
        try {
          root = await realpath(packageDir);
        } catch {
        }
        const locale = await readLocaleTitle(root);
        out.push({
          name: raw.name || name2,
          version: raw.version || "",
          description: raw.description || "",
          title: locale.title || raw.name || name2,
          path: root,
          kind: raw.dsh ? "dsh-plugin" : "node-package",
          source: "installed"
        });
        seen.add(name2);
      } catch {
      }
    }
  }
  out.sort((a, b) => String(a.title).localeCompare(String(b.title), "zh-Hans-CN"));
  return out;
}
async function readLocaleTitle(root) {
  for (const lang of ["zh", "en"]) {
    try {
      const parsed = JSON.parse(await readFile(join(root, "locale", `${lang}.json`), "utf8"));
      if (parsed && parsed.meta && typeof parsed.meta.title === "string") return { title: parsed.meta.title };
    } catch {
    }
  }
  return {};
}
async function resolveTarget(input, options = {}) {
  const raw = typeof input === "string" ? input.trim() : "";
  if (!raw) throw targetError("EMPTY_TARGET", "\u8BF7\u63D0\u4F9B\u63D2\u4EF6\u76EE\u5F55\u7684\u7EDD\u5BF9\u8DEF\u5F84\u6216\u5DF2\u5B89\u88C5\u5305\u540D");
  if (raw.length > 1024) throw targetError("TARGET_TOO_LONG", "\u76EE\u6807\u5B57\u7B26\u4E32\u8FC7\u957F");
  let root = "";
  let source = "path";
  let installed = null;
  const installedTargets = await listInstalledTargets();
  const byName = installedTargets.find((item) => item.name === raw);
  if (byName) {
    root = byName.path;
    source = "installed";
    installed = byName;
  } else if (isAbsolute(raw)) {
    root = raw;
  } else if (options.allowRelative && options.cwd) {
    root = resolve(options.cwd, raw);
  } else if (/^(@[A-Za-z0-9._-]+\/)?[A-Za-z0-9._-]+$/.test(raw) && !raw.includes("\\")) {
    const known = installedTargets.map((item) => item.name);
    throw targetError(
      "PACKAGE_NOT_INSTALLED",
      `\u300C${raw}\u300D\u4E0D\u662F\u5F53\u524D profile \u5DF2\u5B89\u88C5\u7684\u5305${known.length ? `\uFF1B\u53EF\u5BA1\u7684\u5DF2\u5B89\u88C5\u5305\uFF1A${known.join("\u3001")}` : "\uFF08\u5F53\u524D profile \u6CA1\u53D1\u73B0\u5DF2\u5B89\u88C5\u7684 DSH \u5305\uFF0C\u53EF\u80FD\u6CA1\u6709 DSH profile \u73AF\u5883\u53D8\u91CF\uFF09"}\u3002\u4E5F\u53EF\u4EE5\u76F4\u63A5\u7ED9\u63D2\u4EF6\u76EE\u5F55\u7684\u7EDD\u5BF9\u8DEF\u5F84\u3002`
    );
  } else {
    throw targetError("NOT_ABSOLUTE", "\u76F8\u5BF9\u8DEF\u5F84\u4E0D\u53EF\u9760\uFF1A\u8BF7\u7528\u7EDD\u5BF9\u8DEF\u5F84\uFF0C\u6216\u76F4\u63A5\u586B\u5DF2\u5B89\u88C5\u5305\u540D");
  }
  const unsafe = await isUnsafeRoot(root);
  if (unsafe) throw targetError("UNSAFE_TARGET", unsafe);
  let info;
  try {
    info = await lstat(root);
  } catch {
    throw targetError("NOT_FOUND", `\u627E\u4E0D\u5230\u76EE\u6807\uFF1A${root}`);
  }
  if (!info.isDirectory()) throw targetError("NOT_DIRECTORY", "\u76EE\u6807\u4E0D\u662F\u76EE\u5F55");
  let real = root;
  try {
    real = await realpath(root);
  } catch {
  }
  const hasPackage = await lstat(join(real, "package.json")).then((s) => s.isFile()).catch(() => false);
  const hasPatch = await lstat(join(real, "cordis.patch.yml")).then((s) => s.isFile()).catch(() => false);
  const hasEntry = await lstat(join(real, "index.js")).then((s) => s.isFile()).catch(() => false);
  if (!hasPackage && !hasPatch && !hasEntry) {
    throw targetError("NOT_A_PLUGIN", "\u8FD9\u4E2A\u76EE\u5F55\u6CA1\u6709 package.json / cordis.patch.yml / index.js\uFF0C\u4E0D\u50CF\u63D2\u4EF6\u76EE\u5F55");
  }
  let pkg = null;
  if (hasPackage) {
    try {
      pkg = JSON.parse(await readFile(join(real, "package.json"), "utf8"));
    } catch {
      pkg = null;
    }
  }
  const kind = pkg && pkg.dsh ? "dsh-plugin" : pkg ? "node-package" : "directory";
  const name2 = pkg && pkg.name ? String(pkg.name) : basename(real);
  const version = pkg && pkg.version ? String(pkg.version) : "";
  const locale = await readLocaleTitle(real);
  return {
    root: real,
    requested: raw,
    source,
    kind,
    name: name2,
    version,
    description: pkg && pkg.description ? String(pkg.description) : "",
    title: installed && installed.title || locale.title || name2,
    packageJson: pkg
  };
}
function targetError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}
function isSkippedFile(name2) {
  return SKIP_FILES.some((pattern) => pattern.test(name2));
}
function classify(relPath) {
  const posix = toPosix(relPath).toLowerCase();
  const base = basename(posix);
  if (posix === "package.json") return "manifest";
  if (posix === "cordis.patch.yml" || posix === "cordis.yml") return "patch";
  if (/^locale\/[^/]+\.json$/.test(posix)) return "locale";
  if (base === "readme.md" || base === "readme.en.md" || base === "changelog.md" || posix.startsWith("docs/")) return "docs";
  if (posix.startsWith("test/") || posix.startsWith("tests/") || posix.startsWith("smoke/") || /\.(test|spec)\.[cm]?[jt]sx?$/.test(posix)) return "test";
  if (base.endsWith(".css") || base.endsWith(".scss") || base.endsWith(".less")) return "style";
  if (base === "client.js" || base === "client.ts" || base === "client.tsx" || posix.includes("/client/") || base.startsWith("client.")) return "client";
  if (base === "index.js" || base === "index.ts" || posix.startsWith("src/") || posix.startsWith("lib/")) return "host";
  if (base.endsWith(".svg")) return "asset";
  return "other";
}
var ROLE_PRIORITY = {
  manifest: 0,
  patch: 1,
  host: 2,
  client: 3,
  locale: 4,
  style: 5,
  docs: 6,
  test: 7,
  asset: 8,
  other: 9
};
function looksGenerated(text) {
  return text.includes("//# sourceMappingURL=") || text.includes("/*# sourceMappingURL=");
}
async function readTextFile(absPath, relPath, options, budget, meta) {
  let info;
  try {
    info = await lstat(absPath);
  } catch {
    budget.skipped.push({ path: relPath, reason: "not-readable" });
    return null;
  }
  if (info.isSymbolicLink()) {
    budget.skipped.push({ path: relPath, reason: "symlink" });
    return null;
  }
  if (!info.isFile()) return null;
  if (isSkippedFile(basename(relPath))) {
    budget.skipped.push({ path: relPath, reason: "sensitive-or-generated" });
    return null;
  }
  const ext = extname(absPath).toLowerCase();
  if (!TEXT_EXTENSIONS.has(ext)) {
    budget.skipped.push({ path: relPath, reason: "unsupported-extension" });
    return null;
  }
  if (info.size > options.maxFileBytes) {
    const role2 = classify(relPath);
    if (role2 === "client" || role2 === "generated") {
      budget.largeFiles.push({ path: toPosix(relPath), bytes: info.size, role: role2 });
      budget.partial = true;
      budget.reason.push("large-client-skipped");
    }
    budget.skipped.push({ path: relPath, reason: `too-large:${info.size}` });
    return null;
  }
  if (budget.totalBytes + info.size > options.maxTotalBytes) {
    budget.partial = true;
    budget.skipped.push({ path: relPath, reason: "total-budget" });
    return null;
  }
  let buffer;
  try {
    buffer = await readFile(absPath);
  } catch {
    budget.skipped.push({ path: relPath, reason: "read-failed" });
    return null;
  }
  if (buffer.subarray(0, 4096).includes(0)) {
    budget.skipped.push({ path: relPath, reason: "binary" });
    return null;
  }
  const text = buffer.toString("utf8");
  budget.totalBytes += info.size;
  const role = classify(relPath);
  const file = {
    path: toPosix(relPath),
    absPath,
    role,
    ext,
    bytes: info.size,
    text,
    lines: text.split("\n"),
    lineCount: text.length === 0 ? 0 : text.split("\n").length,
    generated: looksGenerated(text)
  };
  if (file.generated) file.role = "generated";
  meta.maxLine = Math.max(meta.maxLine, ...file.lines.map((line) => line.length));
  meta.largestFile = !meta.largestFile || file.bytes > meta.largestFile.bytes ? { path: file.path, bytes: file.bytes } : meta.largestFile;
  return file;
}
async function walkPlugin(root, options = {}) {
  const limits = { ...DEFAULT_LIMITS, ...options };
  const deadline = Date.now() + (typeof limits.deadlineMs === "number" ? limits.deadlineMs : limits.deadlineMs.standard);
  const budget = {
    totalBytes: 0,
    skipped: [],
    largeFiles: [],
    partial: false,
    reason: []
  };
  const files = [];
  const meta = { maxLine: 0, largestFile: null };
  const seenDirs = /* @__PURE__ */ new Set();
  async function visit(dir, depth) {
    if (depth > limits.maxDepth) {
      budget.partial = true;
      budget.skipped.push({ path: toPosix(relative(root, dir)), reason: "max-depth" });
      return;
    }
    if (Date.now() > deadline) {
      budget.partial = true;
      budget.reason.push("deadline");
      return;
    }
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      budget.skipped.push({ path: toPosix(relative(root, dir) || "."), reason: "dir-read-failed" });
      return;
    }
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (Date.now() > deadline) {
        budget.partial = true;
        budget.reason.push("deadline");
        return;
      }
      const absPath = join(dir, entry.name);
      const relPath = toPosix(relative(root, absPath));
      if (entry.isSymbolicLink()) {
        budget.skipped.push({ path: relPath, reason: "symlink" });
        continue;
      }
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name.toLowerCase())) {
          budget.skipped.push({ path: relPath, reason: "skipped-dir" });
          continue;
        }
        if (depth + 1 > limits.maxDepth) {
          budget.partial = true;
          budget.skipped.push({ path: relPath, reason: "max-depth" });
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
        budget.skipped.push({ path: relPath, reason: "max-files" });
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
  const hasHostSource = files.some((f) => f.path === "src/index.ts" || f.path === "src/index.tsx");
  for (const file of files) {
    if (file.role === "client" && hasClientSource && /__ModuleLoader__\.load/.test(file.text)) {
      file.generated = true;
      file.sourceRole = "client";
      file.role = "generated";
      file.skipReason = "generated-bundle-has-source";
    }
    if (file.generated && hasClientSource) file.skipReason = "generated-bundle-has-source";
  }
  if (hasClientSource) {
    for (const large of budget.largeFiles) {
      if (large.role === "client" || large.role === "generated") large.generated = true;
    }
  }
  const manifestFile = files.find((f) => f.role === "manifest");
  const patchFile = files.find((f) => f.role === "patch");
  let packageJson = null;
  if (manifestFile) {
    try {
      packageJson = JSON.parse(manifestFile.text);
    } catch {
      packageJson = null;
    }
  }
  if (hasHostSource && packageJson && typeof packageJson.main === "string") {
    const mainPath = toPosix(packageJson.main).replace(/^\.\//, "");
    for (const file of files) {
      if (file.role === "host" && file.path === mainPath && mainPath.startsWith("lib/")) {
        file.generated = true;
        file.sourceRole = "host";
        file.role = "generated";
        file.skipReason = "generated-host-bundle-has-source";
      }
    }
  }
  const localeFiles = files.filter((f) => f.role === "locale");
  const readmeFile = files.find((f) => f.role === "docs" && /^readme/i.test(basename(f.path)));
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
    limits
  };
}
function filesOf(inventory, roles, { includeGenerated = false } = {}) {
  const wanted = new Set(Array.isArray(roles) ? roles : [roles]);
  return inventory.files.filter((file) => wanted.has(file.role) && (includeGenerated || !file.generated));
}

// src/analyze.ts
function issue(checkId, file, text, index, detail) {
  const before = text.slice(0, Math.max(0, index));
  const line = before.split("\n").length;
  const start = text.lastIndexOf("\n", Math.max(0, index - 1)) + 1;
  let end = text.indexOf("\n", index);
  if (end === -1) end = text.length;
  return {
    checkId,
    path: file ? file.path : "",
    line,
    snippet: text.slice(start, Math.min(end, start + 500)).replace(/\r/g, ""),
    detail: detail || ""
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
  return lstat2(join2(inventory.root, relPath)).then(() => true).catch(() => false);
}
function iconInfo(inventory, pkg) {
  const candidates = [];
  if (pkg && typeof pkg.icon === "string") candidates.push(pkg.icon.replace(/^\.\//, ""));
  candidates.push("icon.svg", "icon.png", "icon.webp", "icon.jpg", "icon.jpeg");
  for (const candidate of candidates) {
    const file = inventory.byPath.get(candidate.toLowerCase());
    if (!file) continue;
    const ext = extname2(file.path).toLowerCase();
    const valid = [".svg", ".png", ".jpg", ".jpeg", ".webp"].includes(ext);
    const signature = file.text.slice(0, 200).trim();
    const svgOk = ext !== ".svg" || signature.startsWith("<svg") || signature.startsWith("<?xml");
    return {
      path: file.path,
      bytes: file.bytes,
      valid: valid && svgOk && file.bytes <= 256 * 1024,
      reason: !valid ? "unsupported-format" : !svgOk ? "bad-svg-signature" : file.bytes > 256 * 1024 ? "too-large" : ""
    };
  }
  return { path: "", bytes: 0, valid: false, reason: "missing" };
}
async function iconInfoChecked(inventory, pkg) {
  const icon = iconInfo(inventory, pkg);
  if (icon.valid || icon.reason !== "missing") return icon;
  const declared = pkg && typeof pkg.icon === "string" ? pkg.icon.replace(/^\.\//, "") : "";
  if (declared && await existsOnDisk(inventory, declared)) {
    return { path: declared, bytes: 0, valid: true, reason: "", note: "skipped-by-budget" };
  }
  return icon;
}
async function analyzeInventory(inventory, target) {
  const issues = [];
  const pkg = inventory.packageJson;
  const manifestFile = inventory.manifestFile;
  const patchFile = inventory.patchFile;
  if (!pkg) {
    if (manifestFile) issues.push(issue("meta.manifest-mismatch", manifestFile, manifestFile.text, 0, "package.json \u89E3\u6790\u5931\u8D25"));
    else issues.push({ checkId: "meta.manifest-mismatch", path: "package.json", line: 1, snippet: "", detail: "\u7F3A\u5C11 package.json" });
  }
  if (pkg && patchFile) {
    const { names, ids } = patchNames(patchFile.text);
    const packageName = String(pkg.name || "");
    if (packageName && names.length > 0 && !names.includes(packageName)) {
      const hostComposed = names.every((name2) => name2.startsWith("@deepseek-ai/"));
      if (!hostComposed) {
        issues.push(issue("meta.manifest-mismatch", patchFile, patchFile.text, patchFile.text.indexOf("name"), `cordis.patch.yml \u7684 name=${names.join(", ")} \u4E0E package.name=${packageName} \u4E0D\u4E00\u81F4`));
      }
    }
    if (ids.length === 0) {
      issues.push(issue("meta.manifest-mismatch", patchFile, patchFile.text, 0, "cordis.patch.yml \u6CA1\u6709 insert.id"));
    }
  } else if (pkg && pkg.dsh && pkg.dsh.bundle && !patchFile) {
    issues.push(issue("meta.manifest-mismatch", manifestFile, manifestFile.text, 0, "package.json \u58F0\u660E\u4E86 dsh.bundle.patch\uFF0C\u4F46\u76EE\u5F55\u91CC\u6CA1\u6709 cordis.patch.yml"));
  }
  if (pkg && pkg.dsh && pkg.dsh.client) {
    const exportsMap = pkg.exports && typeof pkg.exports === "object" ? pkg.exports : {};
    const clientExport = exportsMap["./client"];
    const clientPath = typeof clientExport === "string" ? clientExport : clientExport && clientExport.default;
    if (!clientPath) {
      issues.push(issue("meta.manifest-mismatch", manifestFile, manifestFile.text, 0, "dsh.client \u5B58\u5728\uFF0C\u4F46 exports \u6CA1\u6709 ./client"));
    } else {
      const rel = String(clientPath).replace(/^\.\//, "");
      if (!await existsOnDisk(inventory, rel)) {
        issues.push(issue("meta.manifest-mismatch", manifestFile, manifestFile.text, 0, `exports["./client"] \u6307\u5411\u7684 ${rel} \u4E0D\u5B58\u5728`));
      }
    }
  }
  const icon = await iconInfoChecked(inventory, pkg);
  if (!icon.valid) {
    const declared = pkg && typeof pkg.icon === "string" ? pkg.icon.trim() : "";
    const where = manifestFile || patchFile;
    issues.push({
      checkId: "meta.icon",
      path: where ? where.path : declared || "icon.svg",
      line: 1,
      snippet: "",
      detail: declared ? `package.json \u58F0\u660E\u7684\u56FE\u6807 ${declared} \u7F3A\u5931\u6216\u65E0\u6548\uFF08${icon.reason || "unknown"}\uFF09` : "\u6CA1\u6709\u63D2\u4EF6\u56FE\u6807\uFF08\u5BBF\u4E3B schema \u91CC icon \u53EF\u9009\uFF0CPlugin Manager \u663E\u793A\u4E3A\u65E0\u56FE\u6807\u7684\u884C\uFF09",
      // A manifest that points at a file which is not there is a real (if minor)
      // inconsistency; shipping no icon at all is optional by contract.
      severity: declared ? "P2" : "P3"
    });
  }
  const localeByLang = /* @__PURE__ */ new Map();
  for (const file of inventory.localeFiles) {
    const lang = basename2(file.path, ".json").toLowerCase();
    if (!["zh", "en"].includes(lang)) continue;
    try {
      localeByLang.set(lang, { file, data: JSON.parse(file.text) });
    } catch {
      issues.push(issue("meta.locale-mismatch", file, file.text, 0, `${file.path} \u4E0D\u662F\u5408\u6CD5 JSON`));
    }
  }
  if (localeByLang.size === 0) {
    issues.push({ checkId: "meta.locale-mismatch", path: "locale/", line: 1, snippet: "", detail: "\u6CA1\u6709 locale/zh.json \u6216 locale/en.json\uFF0CPlugin Manager \u53EA\u80FD\u56DE\u9000\u5230\u5305\u540D/\u63CF\u8FF0" });
  } else {
    const zh = localeByLang.get("zh");
    const en = localeByLang.get("en");
    for (const entry of [zh, en]) {
      if (!entry) continue;
      if (!entry.data || !entry.data.meta || typeof entry.data.meta.title !== "string" || !entry.data.meta.title.trim()) {
        issues.push(issue("meta.locale-mismatch", entry.file, entry.file.text, 0, `${entry.file.path} \u7F3A meta.title`));
      }
      if (!entry.data || !entry.data.meta || typeof entry.data.meta.description !== "string" || !entry.data.meta.description.trim()) {
        issues.push(issue("meta.locale-mismatch", entry.file, entry.file.text, 0, `${entry.file.path} \u7F3A meta.description`));
      }
    }
    if (zh && en) {
      const zhKeys = new Set(flattenKeys(zh.data));
      const enKeys = new Set(flattenKeys(en.data));
      const missingEn = [...zhKeys].filter((key) => !enKeys.has(key));
      const missingZh = [...enKeys].filter((key) => !zhKeys.has(key));
      if (missingEn.length || missingZh.length) {
        const detail = `zh/en key \u4E0D\u914D\u5BF9\uFF1Azh \u591A ${missingEn.slice(0, 5).join(", ") || "\u65E0"}\uFF1Ben \u591A ${missingZh.slice(0, 5).join(", ") || "\u65E0"}`;
        issues.push(issue("meta.locale-mismatch", zh.file, zh.file.text, 0, detail));
      }
    }
  }
  return { issues, icon, localeByLang };
}
function computeBudget(inventory) {
  const clientCandidates = inventory.files.filter((f) => f.role === "client" || f.role === "generated" && f.sourceRole === "client");
  const hasClientArtifact = clientCandidates.some((f) => f.generated);
  const clientFiles = hasClientArtifact ? clientCandidates.filter((f) => f.generated) : clientCandidates;
  const largeClientFiles = (inventory.largeFiles || []).filter((f) => f.role === "client" || f.role === "generated" && f.sourceRole === "client");
  const clientBytes = clientFiles.reduce((sum, file) => sum + file.bytes, 0) + largeClientFiles.reduce((sum, file) => sum + file.bytes, 0);
  const clientArtifact = [
    ...clientFiles.map((file) => ({ path: file.path, bytes: file.bytes, generated: file.generated })),
    ...largeClientFiles.map((file) => ({ path: file.path, bytes: file.bytes, generated: file.generated === true || file.role === "generated" }))
  ].sort((a, b) => b.bytes - a.bytes)[0] || null;
  let inlineAssetBytes = 0;
  const inlineOccurrences = [];
  for (const file of inventory.files) {
    if (!["client", "generated", "style", "host"].includes(file.role)) continue;
    const re = /data:(?:image|font)\/[^;]+;base64,([A-Za-z0-9+/=\s]{1000,})/g;
    let match;
    while ((match = re.exec(file.text)) !== null) {
      const bytes = Math.floor(match[1].replace(/\s/g, "").length * 3 / 4);
      inlineAssetBytes += bytes;
      if (inlineOccurrences.length < 5) {
        const before = file.text.slice(0, match.index);
        inlineOccurrences.push({ path: file.path, line: before.split("\n").length, bytes });
      }
    }
  }
  const hostFiles = filesOf(inventory, ["host"]);
  const syncIoCalls = [];
  const pollingIntervals = [];
  const serialAwaitLoops = [];
  for (const file of hostFiles) {
    const lines = file.lines;
    lines.forEach((line, index) => {
      if (/\b(?:readFileSync|writeFileSync)\s*\(/.test(line) && !/^\s*import\b/.test(line) && !/^\s*(\/\/|\*)/.test(line)) {
        const window = lines.slice(Math.max(0, index - 30), index + 1).join("\n");
        const hotPath = /fetch:|execute\s*[:(]|requestBody|onRequest/.test(window);
        syncIoCalls.push({ path: file.path, line: index + 1, code: line.trim().slice(0, 160), hotPath });
      }
    });
    const pollRe = /setInterval\s*\([^,]*,\s*(\d+)\s*\)/g;
    let match;
    while ((match = pollRe.exec(file.text)) !== null) {
      const ms = Number(match[1]);
      if (Number.isFinite(ms) && ms < BUDGETS.pollingMinMs) {
        pollingIntervals.push({ path: file.path, line: file.text.slice(0, match.index).split("\n").length, ms });
      }
    }
    const forRe = /\bfor\s*[({\s]/g;
    let forMatch;
    while ((forMatch = forRe.exec(file.text)) !== null) {
      const lineStart = file.text.lastIndexOf("\n", Math.max(0, forMatch.index - 1)) + 1;
      let lineEnd = file.text.indexOf("\n", forMatch.index);
      if (lineEnd === -1) lineEnd = file.text.length;
      const lineText = file.text.slice(lineStart, lineEnd);
      if (!/^\s*(?:await\s+)?for\b/.test(lineText)) continue;
      if (/^\s*(?:\/\/|\*)/.test(lineText) || /['"`]/.test(lineText)) continue;
      if (/^\s*(?:const|let|var)\s+\w+\s*=\s*\//.test(lineText) || /new\s+RegExp/.test(lineText)) continue;
      const brace = file.text.indexOf("{", forMatch.index);
      if (brace === -1 || brace > lineEnd + 4e3) continue;
      const body = balancedBlock(file.text, brace, "{", "}");
      if (!body) continue;
      forRe.lastIndex = Math.max(forRe.lastIndex, body.end + 1);
      const inner = body.text;
      if (!/\bawait\b/.test(inner)) continue;
      if (/\bPromise\.all\b|\bPromise\.allSettled\b/.test(inner)) continue;
      if (/\bbreak\b|\bcatch\b|\bthrow\b|\breturn\b/.test(inner)) continue;
      serialAwaitLoops.push({ path: file.path, line: file.text.slice(0, forMatch.index).split("\n").length });
    }
  }
  let fetchWithoutAbort = 0;
  const fetchOccurrences = [];
  const clientFilesForEffects = filesOf(inventory, ["client"]);
  for (const file of clientFilesForEffects) {
    for (const block of callBlocks(file.text, "useEffect")) {
      if (!/\bfetch\s*\(/.test(block.text)) continue;
      if (/AbortController|AbortSignal|signal\s*:/.test(block.text)) continue;
      fetchWithoutAbort += 1;
      if (fetchOccurrences.length < 5) {
        fetchOccurrences.push({ path: file.path, line: file.text.slice(0, block.start).split("\n").length });
      }
    }
  }
  let layoutAnimationRules = 0;
  const layoutOccurrences = [];
  for (const file of filesOf(inventory, ["client", "style"])) {
    const re = /(?:transition(?:-property)?|animation)\s*:[^;{}]*\b(width|height|top|left|right|bottom|margin|padding)\b/gi;
    let match;
    while ((match = re.exec(file.text)) !== null) {
      layoutAnimationRules += 1;
      if (layoutOccurrences.length < 5) {
        layoutOccurrences.push({ path: file.path, line: file.text.slice(0, match.index).split("\n").length, property: match[1] });
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
      layoutAnimationRules
    },
    details: {
      clientArtifact: clientArtifact ? { path: clientArtifact.path, bytes: clientArtifact.bytes, generated: clientArtifact.generated } : null,
      inlineOccurrences,
      syncIoCalls,
      pollingIntervals,
      serialAwaitLoops,
      fetchWithoutAbort: fetchOccurrences,
      layoutAnimationRules: layoutOccurrences
    },
    budgets: {
      clientBytesWarn: BUDGETS.clientBytesWarn,
      clientBytesBad: BUDGETS.clientBytesBad,
      inlineAssetBytes: BUDGETS.inlineAssetBytes,
      pollingMinMs: BUDGETS.pollingMinMs
    }
  };
}
function cssRules(text) {
  const rules = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    const selector = match[1].trim().replace(/\s+/g, " ");
    if (!selector || selector.startsWith("@")) continue;
    rules.push({ selector, body: match[2], index: match.index });
  }
  return rules;
}
function inlineColorPairs(text) {
  const pairs = [];
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
  const objectRe = /\{[^{}]{0,800}?color\s*:\s*['"]([^'"]+)['"][^{}]{0,800}?backgroundColor\s*:\s*['"]([^'"]+)['"][^{}]{0,300}?\}/g;
  let match;
  while ((match = objectRe.exec(text)) !== null) {
    const ratio = contrastRatio(match[1], match[2]);
    if (ratio !== null) pairs.push({ index: match.index, selector: "inline-style", fg: match[1], bg: match[2], ratio });
  }
  return pairs;
}

// src/knowledge.ts
var READ_AT = "2026-10-26";
var CITATIONS = {
  "dsh-host": {
    id: "dsh-host",
    kind: "doc",
    title: "DSH plugin development \u2014 Host plugin export forms",
    url: "",
    status: "read",
    httpStatus: null,
    locator: "cordis-plugin-development/references/host-plugin.md \xB7 Host plugin export forms",
    quote: "Register every resource inside `apply` with `ctx.effect` or `ctx.on` and return its cleanup.",
    readAt: READ_AT,
    supportsRules: ["host.unmanaged-lifecycle", "meta.manifest-mismatch"]
  },
  "dsh-ui": {
    id: "dsh-ui",
    kind: "doc",
    title: "DSH plugin development \u2014 Client module",
    url: "",
    status: "read",
    httpStatus: null,
    locator: "cordis-plugin-development/references/ui-plugin.md \xB7 Client module",
    quote: "Route visible UI text through the Client locale service.",
    readAt: READ_AT,
    supportsRules: ["client.hardcoded-text", "client.body-dom", "client.iframe-panel", "client.duplicate-react", "meta.locale-mismatch"]
  },
  "dsh-practices": {
    id: "dsh-practices",
    kind: "doc",
    title: "DSH plugin development \u2014 Harness plugin practices (UI)",
    url: "",
    status: "read",
    httpStatus: null,
    locator: "cordis-plugin-development/references/practices.md \xB7 UI",
    quote: "Do not write DOM outside your component or append to `document.body`.",
    readAt: READ_AT,
    supportsRules: ["client.body-dom", "client.iframe-panel"]
  },
  "react-effects": {
    id: "react-effects",
    kind: "doc",
    title: "React \u2014 Synchronizing with Effects",
    url: "https://react.dev/learn/synchronizing-with-effects",
    status: "read",
    httpStatus: 200,
    locator: "Step 3: Add cleanup if needed",
    quote: 'Some Effects need to specify how to stop, undo, or clean up whatever they were doing. For example, "connect" needs "disconnect", "subscribe" needs "unsubscribe", and "fetch" needs either "cancel" or "ignore".',
    readAt: READ_AT,
    supportsRules: ["client.effect-cleanup", "perf.no-abort"]
  },
  "wcag-use-of-color": {
    id: "wcag-use-of-color",
    kind: "standard",
    title: "WCAG 2.2 Understanding \u2014 SC 1.4.1 Use of Color",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html",
    status: "read",
    httpStatus: 200,
    locator: "SC 1.4.1",
    quote: "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.",
    readAt: READ_AT,
    supportsRules: ["ui.color-only-status"]
  },
  "wcag-contrast": {
    id: "wcag-contrast",
    kind: "standard",
    title: "WCAG 2.2 Understanding \u2014 SC 1.4.3 Contrast (Minimum)",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
    status: "read",
    httpStatus: 200,
    locator: "SC 1.4.3",
    quote: "The visual presentation of text and images of text has a contrast ratio of at least 4.5:1 ... Large-scale text and images of large-scale text have a contrast ratio of at least 3:1.",
    readAt: READ_AT,
    supportsRules: ["ui.contrast-literal", "ui.state-color-text"]
  },
  "wcag-keyboard": {
    id: "wcag-keyboard",
    kind: "standard",
    title: "WCAG 2.2 Understanding \u2014 SC 2.1.1 Keyboard",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html",
    status: "read",
    httpStatus: 200,
    locator: "SC 2.1.1",
    quote: "All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes.",
    readAt: READ_AT,
    supportsRules: ["client.inaccessible-control", "ux.keyboard-only-mouse"]
  },
  "wcag-motion": {
    id: "wcag-motion",
    kind: "standard",
    title: "WCAG 2.2 Understanding \u2014 SC 2.3.3 Animation from Interactions",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html",
    status: "read",
    httpStatus: 200,
    locator: "SC 2.3.3",
    quote: "Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed.",
    readAt: READ_AT,
    supportsRules: ["ui.reduced-motion"]
  },
  "wcag-focus": {
    id: "wcag-focus",
    kind: "standard",
    title: "WCAG 2.2 Understanding \u2014 SC 2.4.7 Focus Visible",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html",
    status: "read",
    httpStatus: 200,
    locator: "SC 2.4.7",
    quote: "Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.",
    readAt: READ_AT,
    supportsRules: ["ui.focus-visible"]
  },
  "wcag-dragging": {
    id: "wcag-dragging",
    kind: "standard",
    title: "WCAG 2.2 Understanding \u2014 SC 2.5.7 Dragging Movements",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html",
    status: "read",
    httpStatus: 200,
    locator: "SC 2.5.7",
    quote: "All functionality that uses a dragging movement for operation can be achieved by a single pointer without dragging, unless dragging is essential.",
    readAt: READ_AT,
    supportsRules: ["ux.keyboard-only-mouse"]
  },
  "wcag-target": {
    id: "wcag-target",
    kind: "standard",
    title: "WCAG 2.2 Understanding \u2014 SC 2.5.8 Target Size (Minimum)",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html",
    status: "read",
    httpStatus: 200,
    locator: "SC 2.5.8",
    quote: "The size of the target for pointer inputs is at least 24 by 24 CSS pixels.",
    readAt: READ_AT,
    supportsRules: ["ui.touch-target"]
  },
  "wcag-error": {
    id: "wcag-error",
    kind: "standard",
    title: "WCAG 2.2 Understanding \u2014 SC 3.3.1 Error Identification",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html",
    status: "read",
    httpStatus: 200,
    locator: "SC 3.3.1",
    quote: "If an input error is automatically detected, the item that is in error is identified and the error is described to the user in text.",
    readAt: READ_AT,
    supportsRules: ["ux.raw-error"]
  },
  "owasp-command": {
    id: "owasp-command",
    kind: "github",
    title: "OWASP OS Command Injection Defense Cheat Sheet",
    url: "https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.md",
    status: "read",
    httpStatus: 200,
    locator: "Primary Defenses > Defense Option 1",
    quote: "The primary defense is to avoid calling OS commands directly. Built-in library functions are a very good alternative to OS Commands.",
    readAt: READ_AT,
    supportsRules: ["host.command-injection"]
  },
  "owasp-secrets": {
    id: "owasp-secrets",
    kind: "github",
    title: "OWASP Secrets Management Cheat Sheet",
    url: "https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/cheatsheets/Secrets_Management_Cheat_Sheet.md",
    status: "read",
    httpStatus: 200,
    locator: "1 Introduction",
    quote: "Many organizations have them hardcoded within the source code in plaintext, littered throughout configuration files and configuration management tools.",
    readAt: READ_AT,
    supportsRules: ["host.hardcoded-secret"]
  },
  "owasp-input": {
    id: "owasp-input",
    kind: "github",
    title: "OWASP Input Validation Cheat Sheet",
    url: "https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/cheatsheets/Input_Validation_Cheat_Sheet.md",
    status: "read",
    httpStatus: 200,
    locator: "Implementing Input Validation > Parse Safely, Then Validate",
    quote: "Apply request size limits before buffering or parsing input, and configure parser limits such as maximum nesting depth.",
    readAt: READ_AT,
    supportsRules: []
  },
  greshake: {
    id: "greshake",
    kind: "paper",
    title: "Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection",
    url: "https://arxiv.org/abs/2302.12173",
    status: "read",
    httpStatus: 200,
    locator: "Abstract",
    quote: "We reveal new attack vectors, using Indirect Prompt Injection, that enable adversaries to remotely ... exploit LLM-integrated applications by strategically injecting prompts into data likely to be retrieved.",
    readAt: READ_AT,
    supportsRules: ["ai.untrusted-content"]
  }
};

// src/checks.ts
function copy(zhTitle, enTitle, zhSummary, enSummary, zhWhy, enWhy, zhFix, enFix) {
  return {
    title: { zh: zhTitle, en: enTitle },
    summary: { zh: zhSummary, en: enSummary },
    why: { zh: zhWhy, en: enWhy },
    fix: { zh: zhFix, en: enFix }
  };
}
function citationsFor(id) {
  return Object.values(CITATIONS).filter((citation) => citation.status === "read" && citation.supportsRules.includes(id)).map((citation) => citation.id);
}
function check(id, dimension, tier, severity, confidence, basis, texts, detect) {
  return { id, dimension, tier, severity, confidence, basis, citations: citationsFor(id), ...texts, detect };
}
function occ(file, index, detail = "") {
  return makeOccurrence(file, file.text, index, detail ? { detail } : {});
}
function collect(files, pattern, { skipComments = true, limit = 5, detail = "" } = {}) {
  const out = [];
  for (const file of files) {
    const re = pattern instanceof RegExp ? new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g") : null;
    if (!re) continue;
    let match;
    while ((match = re.exec(file.text)) !== null) {
      if (skipComments) {
        const start = file.text.lastIndexOf("\n", Math.max(0, match.index - 1)) + 1;
        let end = file.text.indexOf("\n", match.index);
        if (end === -1) end = file.text.length;
        const lineText = file.text.slice(start, end);
        if (/^\s*(\/\/|\*|<!--)/.test(lineText)) continue;
      }
      out.push(occ(file, match.index, typeof detail === "function" ? detail(match, file) : detail));
      if (out.length >= limit) return out;
    }
  }
  return out;
}
function findBlockRange(file, block, needle = "") {
  return file.text.slice(0, block.start).split("\n").length;
}
function localeBlockRanges(file) {
  const ranges = [];
  const text = file.text;
  for (const name2 of ["DICTIONARY", "ZH", "EN", "zh", "en"]) {
    const re = new RegExp(`(?:var|let|const)\\s+${name2}(?:\\s*:\\s*[^=]+)?\\s*=\\s*\\{`, "g");
    let match;
    while ((match = re.exec(text)) !== null) {
      const brace = text.indexOf("{", match.index);
      const block = balancedBlock(text, brace, "{", "}");
      if (block) ranges.push([block.start, block.end]);
    }
  }
  for (const block of callBlocks(text, "register")) {
    if (/locale\s*\.\s*register|ctx\.locale\.register/.test(block.text)) ranges.push([block.start, block.end]);
  }
  return ranges;
}
function inRanges(index, ranges) {
  return ranges.some(([start, end]) => index >= start && index <= end);
}
function issueOccurrences(ctx, checkId) {
  return (ctx.analysis.issues || []).filter((issue2) => issue2.checkId === checkId).slice(0, 8).map((issue2) => ({
    path: issue2.path,
    line: issue2.line,
    snippet: issue2.snippet,
    detail: issue2.detail,
    // An analysis issue may grade itself: a declared-but-missing icon is a
    // smaller deal than a structural manifest mismatch. The review keeps the
    // worst occurrence, so leaving this undefined falls back to the check.
    ...issue2.severity ? { severity: issue2.severity } : {}
  }));
}
var HOST = (ctx) => filesOf(ctx.inventory, ["host"]);
var CLIENT = (ctx) => filesOf(ctx.inventory, ["client"]);
var STYLE = (ctx) => filesOf(ctx.inventory, ["style"]);
var SOURCE = (ctx) => filesOf(ctx.inventory, ["host", "client"]);
var CHECKS = [
  // ------------------------------------------------------------------ backend
  check(
    "host.empty-catch",
    "backend",
    "core",
    "P1",
    "high",
    "experience",
    copy(
      "\u9519\u8BEF\u88AB catch \u9759\u9ED8\u541E\u6389",
      "Errors are swallowed by an empty catch",
      "\u7A7A catch \u6216\u53EA\u6253\u65E5\u5FD7\u7684 catch \u4F1A\u8BA9\u5931\u8D25\u770B\u8D77\u6765\u50CF\u6210\u529F\u3002",
      "An empty catch (or a log-only catch) makes a failure look like success.",
      "\u8C03\u7528\u65B9\u62FF\u5230\u7684\u662F\u6B63\u5E38\u8FD4\u56DE\uFF0C\u7528\u6237\u770B\u5230\u7684\u662F\u201C\u5DF2\u4FDD\u5B58\u201D\uFF0C\u5B9E\u9645\u4EC0\u4E48\u90FD\u6CA1\u53D1\u751F\uFF1B\u8FD9\u662F\u6700\u4F24\u4FE1\u4EFB\u7684\u4E00\u79CD\u5931\u8D25\u3002",
      "The caller gets a normal return and the user sees \u201Csaved\u201D when nothing happened. This is the most trust-damaging kind of failure.",
      "\u4FDD\u7559\u9519\u8BEF\u5BF9\u8C61\u5E76\u5411\u4E0A\u8FD4\u56DE\uFF0C\u6216\u8FD4\u56DE\u5E26 code \u7684\u53EF\u7406\u89E3\u9519\u8BEF\uFF1BUI \u7ED9\u53EF\u91CD\u8BD5\u7684\u63D0\u793A\uFF0C\u4E0D\u8981\u53EA console\u3002",
      "Keep the error, rethrow or return a typed error, and give the UI a retryable message instead of a bare console line."
    ),
    (ctx) => {
      const out = [];
      for (const file of HOST(ctx)) {
        const patterns = [
          /catch\s*(?:\([^)]*\))?\s*\{\s*\}/g,
          /\.catch\(\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*\{\s*\}\s*\)/g
        ];
        for (const pattern of patterns) {
          let match;
          while ((match = pattern.exec(file.text)) !== null) {
            out.push(occ(file, match.index));
            if (out.length >= 6) return out;
          }
        }
      }
      return out;
    }
  ),
  check(
    "host.unmanaged-lifecycle",
    "backend",
    "core",
    "P1",
    "medium",
    "read",
    copy(
      "\u526F\u4F5C\u7528\u6CA1\u6709\u4E3B\u4EBA",
      "Side effects have no owner",
      "apply \u91CC\u8D77\u4E86 timer/listener/route\uFF0C\u5374\u6CA1\u6709 ctx.effect / ctx.on \u6216\u8FD4\u56DE\u6E05\u7406\u51FD\u6570\u3002",
      "A timer, listener or route is created without ctx.effect / ctx.on or a returned cleanup.",
      "\u63D2\u4EF6\u5378\u8F7D\u3001\u70ED\u91CD\u8F7D\u6216 profile \u5207\u6362\u540E\uFF0C\u56DE\u8C03\u8FD8\u5728\u8DD1\uFF1B\u8F7B\u5219\u91CD\u590D\u6CE8\u518C\uFF0C\u91CD\u5219\u5173\u4E0D\u6389\u3001\u6CC4\u6F0F\u8D44\u6E90\u3002",
      "After unload, HMR or a profile switch the callback still runs: duplicate registrations at best, leaked or unclosable resources at worst.",
      "\u628A\u6BCF\u4E2A\u8D44\u6E90\u6CE8\u518C\u5305\u8FDB ctx.effect \u5E76\u8FD4\u56DE disposer\uFF1Blistener \u7528 ctx.on\uFF1B\u8DEF\u7531\u548C\u5DE5\u5177\u8BA9\u6846\u67B6\u6301\u6709\u751F\u547D\u5468\u671F\u3002",
      "Wrap each registration in ctx.effect and return its disposer; use ctx.on for listeners; let the framework own routes and tools."
    ),
    (ctx) => {
      const out = [];
      for (const file of HOST(ctx)) {
        if (/ctx\.effect|ctx\.on|return\s*(?:\(\)|function)\s*=>?/.test(file.text)) continue;
        const re = /\b(setInterval|setTimeout|addEventListener|process\.on)\s*\(|\.register\s*\(/g;
        let match;
        while ((match = re.exec(file.text)) !== null) {
          out.push(occ(file, match.index, "\u6587\u4EF6\u91CC\u6CA1\u6709\u770B\u5230 ctx.effect / ctx.on / \u6E05\u7406\u51FD\u6570"));
          break;
        }
        if (out.length >= 4) break;
      }
      return out;
    }
  ),
  check(
    "host.command-injection",
    "backend",
    "core",
    "P0",
    "high",
    "read",
    copy(
      "\u5916\u90E8\u8F93\u5165\u88AB\u62FC\u8FDB\u7CFB\u7EDF\u547D\u4EE4",
      "External input is interpolated into a shell command",
      "exec/execSync/spawn \u91CC\u51FA\u73B0\u53D8\u91CF\u62FC\u63A5\u6216 shell:true\u3002",
      "exec/execSync/spawn uses string interpolation or shell:true.",
      "\u53EA\u8981\u8F93\u5165\u91CC\u6709\u4E00\u4E2A &\u3001| \u6216\u53CD\u5F15\u53F7\uFF0C\u653B\u51FB\u8005\u5C31\u80FD\u6267\u884C\u81EA\u5DF1\u7684\u547D\u4EE4\uFF1B\u53C2\u6570\u6CE8\u5165\u4E5F\u80FD\u6539\u5199\u539F\u672C\u7684\u610F\u56FE\u3002",
      "One &, | or backtick in the input lets an attacker run their own command; argument injection can also change the intended operation.",
      "\u4F18\u5148\u7528\u5185\u7F6E API\uFF1B\u5FC5\u987B\u8D77\u8FDB\u7A0B\u65F6\u7528\u53C2\u6570\u6570\u7EC4\u3001\u56FA\u5B9A\u53EF\u6267\u884C\u6587\u4EF6\u3001allowlist \u6821\u9A8C\u53C2\u6570\uFF0C\u5E76\u5173\u6389 shell\u3002",
      "Prefer built-in APIs. If a process is unavoidable, use an argument array, a fixed executable, allowlist validation, and disable the shell."
    ),
    (ctx) => {
      const out = [];
      for (const file of HOST(ctx)) {
        const re = /\b(exec|execSync|spawn|spawnSync)\s*\(/g;
        let match;
        while ((match = re.exec(file.text)) !== null) {
          const lineStart = file.text.lastIndexOf("\n", Math.max(0, match.index - 1)) + 1;
          let lineEnd = file.text.indexOf("\n", match.index);
          if (lineEnd === -1) lineEnd = file.text.length;
          const lineText = file.text.slice(lineStart, lineEnd);
          if (/^\s*(?:const|let|var)\s+\w+\s*=\s*\//.test(lineText) || /new\s+RegExp/.test(lineText)) continue;
          const tail = file.text.slice(match.index, match.index + 400);
          if (/shell\s*:\s*true|\$\{|['"]\s*\+|\+\s*['"]/.test(tail)) {
            out.push(occ(file, match.index, tail.includes("shell: true") ? "shell:true" : "\u62FC\u63A5\u4E86\u53D8\u91CF"));
            if (out.length >= 5) return out;
          }
        }
      }
      return out;
    }
  ),
  check(
    "host.hardcoded-secret",
    "backend",
    "core",
    "P0",
    "high",
    "read",
    copy(
      "\u6E90\u7801\u91CC\u8EBA\u7740\u5BC6\u94A5",
      "A secret is hardcoded in source",
      "token/apiKey/secret/password \u4EE5\u5B57\u9762\u91CF\u51FA\u73B0\u3002",
      "A token/apiKey/secret/password appears as a literal.",
      "\u6E90\u7801\u4F1A\u88AB\u590D\u5236\u3001\u6253\u5305\u3001\u622A\u56FE\u3001\u4E0A\u4F20\uFF1B\u5BC6\u94A5\u4E00\u65E6\u8FDB git \u5386\u53F2\uFF0C\u8F6E\u6362\u4E4B\u524D\u90FD\u7B97\u6CC4\u6F0F\u3002",
      "Source gets copied, bundled, screenshotted and pushed. Once a key enters git history it is leaked until rotated.",
      "\u6539\u4ECE\u73AF\u5883\u53D8\u91CF\u6216\u51ED\u636E\u670D\u52A1\u8BFB\u53D6\uFF1B\u7ACB\u523B\u8F6E\u6362\u5DF2\u63D0\u4EA4\u7684\u5BC6\u94A5\uFF1B\u65E5\u5FD7\u4E0E\u9519\u8BEF\u91CC\u4E0D\u8981\u56DE\u663E\u3002",
      "Read it from env or a credential service; rotate anything already committed; never echo it in logs or errors."
    ),
    (ctx) => {
      const out = [];
      for (const file of HOST(ctx)) {
        const patterns = [
          /(?:apiKey|api_key|token|secret|password|passwd|authorization)\s*[:=]\s*['"]([^'"]{8,})['"]/gi,
          /\b(sk-[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{10,})\b/g
        ];
        for (const pattern of patterns) {
          let match;
          while ((match = pattern.exec(file.text)) !== null) {
            const value = match[1] || match[0];
            if (/process\.env|your[_-]?|example|placeholder|xxxx|\$\{|<[^>]+>|test[_-]?/i.test(value)) continue;
            const lineStart = file.text.lastIndexOf("\n", Math.max(0, match.index - 1)) + 1;
            let lineEnd = file.text.indexOf("\n", match.index);
            if (lineEnd === -1) lineEnd = file.text.length;
            const rawLine = file.text.slice(lineStart, lineEnd);
            const masked = rawLine.replaceAll(value, maskSecret(value));
            out.push({
              path: file.path,
              line: file.text.slice(0, match.index).split("\n").length,
              snippet: masked,
              detail: "\u5DF2\u63A9\u7801\uFF1B\u8BF7\u8F6E\u6362\u5BC6\u94A5"
            });
            if (out.length >= 5) return out;
          }
        }
      }
      return out;
    }
  ),
  check(
    "host.absolute-path",
    "backend",
    "deep",
    "P2",
    "medium",
    "experience",
    copy(
      "\u8DEF\u5F84\u5199\u6B7B\u5728\u67D0\u4E00\u53F0\u673A\u5668\u4E0A",
      "A path only exists on one machine",
      "\u6E90\u7801\u91CC\u51FA\u73B0 C:\\\u3001/Users/\u3001/home/ \u8FD9\u7C7B\u7EDD\u5BF9\u8DEF\u5F84\u3002",
      "Source contains an absolute path such as C:\\, /Users/ or /home/.",
      "\u6362\u4E00\u53F0\u673A\u5668\u3001\u6362\u4E00\u4E2A\u7528\u6237\u540D\u5C31\u627E\u4E0D\u5230\uFF1BCI \u548C\u540C\u4E8B\u7684\u673A\u5668\u4F1A\u5148\u574F\u3002",
      "Another machine or username will not find it; CI and teammates break first.",
      "\u7528 path.join(os.homedir(), \u2026)\u3001\u73AF\u5883\u53D8\u91CF\u6216\u76F8\u5BF9\u5305\u8DEF\u5F84\uFF1B\u628A\u5DEE\u5F02\u653E\u8FDB\u914D\u7F6E\u3002",
      "Use path.join(os.homedir(), \u2026), env vars or package-relative paths; keep differences in configuration."
    ),
    (ctx) => collect(SOURCE(ctx), /['"](?:[A-Za-z]:\\|\/Users\/|\/home\/)/g, { limit: 5, detail: "\u786C\u7F16\u7801\u7EDD\u5BF9\u8DEF\u5F84" })
  ),
  // ----------------------------------------------------------------- frontend
  check(
    "client.unsafe-html",
    "frontend",
    "core",
    "P0",
    "high",
    "experience",
    copy(
      "\u628A\u672A\u5904\u7406\u7684 HTML \u585E\u8FDB\u9875\u9762",
      "Untrusted HTML is written into the page",
      "dangerouslySetInnerHTML\u3001innerHTML\u3001insertAdjacentHTML\u3001eval \u6216 new Function\u3002",
      "dangerouslySetInnerHTML, innerHTML, insertAdjacentHTML, eval or new Function.",
      "\u4E00\u65E6\u5185\u5BB9\u6765\u81EA\u7528\u6237\u3001\u63D2\u4EF6\u6216\u6A21\u578B\uFF0C\u811A\u672C\u5C31\u80FD\u5728\u5BBF\u4E3B\u9875\u9762\u91CC\u6267\u884C\uFF1B\u8FD9\u662F\u6700\u76F4\u63A5\u7684 XSS \u9762\u3002",
      "Once the content comes from a user, another plugin or a model, script can execute inside the host page \u2014 a direct XSS surface.",
      "\u7528\u6587\u672C\u8282\u70B9\u6216\u767D\u540D\u5355 sanitizer\uFF1B\u4E0D\u8981 eval \u52A8\u6001\u4EE3\u7801\uFF1B\u628A\u201C\u6E32\u67D3\u5B57\u7B26\u4E32\u201D\u6539\u6210\u201C\u6E32\u67D3\u6570\u636E\u201D\u3002",
      "Use text nodes or an allowlisted sanitizer; never eval dynamic code; render data instead of HTML strings."
    ),
    (ctx) => collect(CLIENT(ctx), /dangerouslySetInnerHTML|\.innerHTML\s*=|insertAdjacentHTML|\beval\s*\(|new\s+Function\s*\(/g, { limit: 6 })
  ),
  check(
    "client.effect-cleanup",
    "frontend",
    "core",
    "P1",
    "medium",
    "read",
    copy(
      "\u526F\u4F5C\u7528\u6CA1\u6709\u6536\u5C3E",
      "An effect has no cleanup",
      "useEffect \u91CC\u8BA2\u9605\u3001\u8D77 timer \u6216 fetch\uFF0C\u5374\u6CA1\u6709\u8FD4\u56DE cleanup\u3002",
      "A useEffect subscribes, starts a timer or fetches without returning a cleanup.",
      "\u7EC4\u4EF6\u5378\u8F7D\u6216\u4F9D\u8D56\u53D8\u5316\u540E\uFF0C\u65E7\u56DE\u8C03\u8FD8\u5728\u66F4\u65B0\u5DF2\u7ECF\u4E0D\u5B58\u5728\u7684\u4E1C\u897F\uFF1B\u5F00\u53D1\u6001\u4F1A\u91CD\u590D\u6267\u884C\uFF0C\u7EBF\u4E0A\u4F1A\u6CC4\u6F0F\u3002",
      "After unmount or a dependency change the old callback still updates something that is gone; dev double-runs and production leaks follow.",
      "\u8FD4\u56DE cleanup\uFF1A\u53D6\u6D88\u8BA2\u9605\u3001clearTimeout\u3001AbortController.abort\uFF1Bfetch \u8981 cancel \u6216 ignore\u3002",
      "Return a cleanup: unsubscribe, clearTimeout, AbortController.abort; cancel or ignore the fetch."
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        for (const block of callBlocks(file.text, "useEffect")) {
          const body = block.text;
          if (!/(addEventListener|setInterval|setTimeout|subscribe\s*\(|fetch\s*\()/.test(body)) continue;
          if (/return\s*(?:\(\)|function)\s*=>?|AbortController|AbortSignal|\.abort\s*\(/.test(body)) continue;
          out.push({
            path: file.path,
            line: findBlockRange(file, block),
            snippet: file.text.slice(block.start, Math.min(block.end + 1, block.start + 400)),
            detail: "\u6709\u8BA2\u9605/timer/fetch\uFF0C\u4F46\u6CA1\u6709 cleanup"
          });
          if (out.length >= 5) return out;
        }
      }
      return out;
    }
  ),
  check(
    "client.body-dom",
    "frontend",
    "core",
    "P1",
    "high",
    "read",
    copy(
      "\u628A DOM \u5199\u5230\u7EC4\u4EF6\u5916\u9762",
      "DOM is written outside the component",
      "document.body/head.appendChild \u6216\u8DE8\u63D2\u4EF6\u8BFB DOM\u3002",
      "document.body/head.appendChild or reading another plugin\u2019s DOM.",
      "\u5BBF\u4E3B\u548C\u5176\u4ED6\u63D2\u4EF6\u5171\u4EAB\u540C\u4E00\u68F5 DOM\uFF1B\u5199\u5916\u9762\u4F1A\u7834\u574F\u5E03\u5C40\u3001\u88AB\u522B\u7684\u63D2\u4EF6\u6E05\u6389\uFF0C\u5378\u8F7D\u65F6\u4E5F\u6536\u4E0D\u56DE\u6765\u3002",
      "The host and other plugins share one DOM; writing outside breaks layout, gets wiped by another plugin, and cannot be cleaned up on unmount.",
      "\u5728\u7EC4\u4EF6\u5185\u6E32\u67D3\uFF1B\u6837\u5F0F\u7528\u7EC4\u4EF6\u91CC\u7684 <style> \u6216 CSS module\uFF1B\u4E0D\u8981 append \u5230 body/head\u3002",
      "Render inside the component; use a component-scoped <style> or CSS module; never append to body/head."
    ),
    (ctx) => collect(CLIENT(ctx), /document\.(?:body|head)\.(?:appendChild|append|prepend|insertBefore)\s*\(/g, { limit: 5 })
  ),
  check(
    "client.hardcoded-text",
    "frontend",
    "core",
    "P2",
    "medium",
    "read",
    copy(
      "\u754C\u9762\u6587\u6848\u5199\u6B7B\u5728\u5BA2\u6237\u7AEF",
      "Visible copy is hardcoded in the client",
      "\u5BA2\u6237\u7AEF\u6E90\u7801\u91CC\u51FA\u73B0 CJK \u6587\u6848\uFF0C\u5374\u6CA1\u6709\u8D70 locale \u5B57\u5178\u3002",
      "CJK copy appears in client source without going through the locale dictionary.",
      "\u5BBF\u4E3B\u5207\u82F1\u6587\u65F6\u8FD9\u884C\u5B57\u4E0D\u4F1A\u53D8\uFF1B\u7528\u6237\u770B\u5230\u534A\u4E2D\u534A\u82F1\uFF0C\u63D2\u4EF6\u50CF\u6CA1\u505A\u5B8C\u3002",
      "When the host switches to English this line does not change; users see half-Chinese, half-English and the plugin looks unfinished.",
      "\u628A\u6587\u6848\u653E\u8FDB locale \u5B57\u5178\uFF0C\u7528 t()/ctx.locale.bind \u8BFB\u53D6\uFF1B\u52A8\u6001\u5185\u5BB9\u4E5F\u8981\u8D70\u540C\u4E00\u5957\u3002",
      "Move copy into the locale dictionary and read it through t()/ctx.locale.bind; dynamic copy goes through the same path."
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        if (/\/locale\.tsx?$|\/locale\//.test(file.path)) continue;
        const ranges = localeBlockRanges(file);
        const re = /['"`]([^'"`]*[\u4e00-\u9fff][^'"`]*)['"`]/g;
        let match;
        while ((match = re.exec(file.text)) !== null) {
          if (inRanges(match.index, ranges)) continue;
          const lineStart = file.text.lastIndexOf("\n", Math.max(0, match.index - 1)) + 1;
          let lineEnd = file.text.indexOf("\n", match.index);
          if (lineEnd === -1) lineEnd = file.text.length;
          const lineText = file.text.slice(lineStart, lineEnd);
          if (/^\s*(\/\/|\*|<!--)/.test(lineText)) continue;
          if (/\bt\(|\btextFor\(|locale\./.test(lineText)) continue;
          out.push(occ(file, match.index, "CJK \u6587\u6848\u4E0D\u5728 locale \u5B57\u5178\u91CC"));
          if (out.length >= 5) return out;
        }
      }
      return out;
    }
  ),
  check(
    "client.inaccessible-control",
    "frontend",
    "core",
    "P1",
    "medium",
    "read",
    copy(
      "\u53EF\u70B9\u51FB\u7684 div \u952E\u76D8\u6309\u4E0D\u5230",
      "A clickable div is unreachable by keyboard",
      "div/span \u4E0A\u6302\u4E86 onClick\uFF0C\u5374\u6CA1\u6709 role/tabIndex/\u952E\u76D8\u5904\u7406\u3002",
      "A div/span has onClick but no role, tabIndex or keyboard handler.",
      "\u952E\u76D8\u7528\u6237\u548C\u8BFB\u5C4F\u7528\u6237\u4E0D\u77E5\u9053\u5B83\u80FD\u70B9\uFF0C\u4E5F\u6309\u4E0D\u5230\uFF1B\u8FD9\u8FDD\u53CD 2.1.1\u3002",
      "Keyboard and screen-reader users do not know it is actionable and cannot reach it; this violates 2.1.1.",
      '\u7528 <button>\uFF1B\u5FC5\u987B\u7528 div \u65F6\u8865 role="button"\u3001tabIndex={0}\u3001Enter/Space \u5904\u7406\u3002',
      'Use <button>. If a div is unavoidable, add role="button", tabIndex={0} and Enter/Space handling.'
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        const createRe = /createElement\s*\(\s*['"](div|span)['"]\s*,\s*\{/g;
        let match;
        while ((match = createRe.exec(file.text)) !== null) {
          const brace = file.text.indexOf("{", match.index);
          const attrs = balancedBlock(file.text, brace, "{", "}");
          if (!attrs) continue;
          if (!/onClick/.test(attrs.text)) continue;
          if (/role\s*:|tabIndex|onKeyDown|onKeyUp|onKeyPress/.test(attrs.text)) continue;
          out.push({
            path: file.path,
            line: file.text.slice(0, match.index).split("\n").length,
            snippet: file.text.slice(match.index, Math.min(attrs.end + 1, match.index + 300)),
            detail: "div/span onClick \u65E0 role/tabIndex/\u952E\u76D8\u5904\u7406"
          });
          if (out.length >= 5) return out;
        }
        const jsxRe = /<(div|span)\b[^>]*\bonClick\b[^>]*>/g;
        while ((match = jsxRe.exec(file.text)) !== null) {
          const tag = match[0];
          if (/role=|tabIndex|onKeyDown|onKeyUp|onKeyPress/.test(tag)) continue;
          out.push(occ(file, match.index, "JSX div/span onClick \u65E0 role/tabIndex/\u952E\u76D8\u5904\u7406"));
          if (out.length >= 5) return out;
        }
      }
      return out;
    }
  ),
  check(
    "client.iframe-panel",
    "frontend",
    "core",
    "P2",
    "high",
    "read",
    copy(
      "\u7528 iframe \u627F\u8F7D\u9762\u677F",
      "The panel is hosted in an iframe",
      '\u5BA2\u6237\u7AEF\u7528 <iframe> \u6216 createElement("iframe") \u6E32\u67D3\u4E3B\u4F53\u754C\u9762\u3002',
      'Client renders the main UI with <iframe> or createElement("iframe").',
      "iframe \u6587\u6863\u62FF\u4E0D\u5230\u5BBF\u4E3B\u7684 theme token\u3001\u4EAE\u6697\u5207\u6362\u548C ctx.locale\uFF1B\u770B\u8D77\u6765\u50CF\u53E6\u4E00\u4E2A\u5E94\u7528\u3002",
      "An iframe document misses the host theme tokens, light/dark switching and ctx.locale; it looks like a different app.",
      "\u7528 slot \u91CC\u7684 React \u7EC4\u4EF6\u76F4\u63A5\u6E32\u67D3\uFF1B\u5FC5\u987B\u9694\u79BB\u6837\u5F0F\u65F6\u7528\u524D\u7F00\u548C component-scoped CSS\u3002",
      "Render a React component in the slot; for style isolation use prefixes and component-scoped CSS."
    ),
    (ctx) => collect(CLIENT(ctx), /<iframe\b|createElement\(\s*['"]iframe['"]/g, { limit: 3 })
  ),
  check(
    "client.duplicate-react",
    "frontend",
    "deep",
    "P1",
    "high",
    "read",
    copy(
      "\u81EA\u5DF1\u53C8\u52A0\u8F7D\u4E86\u4E00\u4EFD React",
      "A second React copy is loaded",
      "\u4ECE CDN/UMD \u53D6 React\uFF0C\u800C\u4E0D\u662F\u7528\u5BBF\u4E3B\u6A21\u5757\u8868\u3002",
      "React comes from a CDN/UMD instead of the host module table.",
      "\u4E24\u4EFD React \u4F1A\u8BA9 hooks \u62A5\u9519\u3001context \u65AD\u94FE\uFF0C\u8FD8\u4F1A\u628A\u5305\u4F53\u6491\u5927\u3002",
      "Two React copies break hooks and context, and inflate the bundle.",
      '\u7528 factory(require) \u91CC\u7684 require("react")\uFF1B\u4E0D\u8981\u5728\u5BA2\u6237\u7AEF bundle \u91CC\u518D\u88C5\u4E00\u4EFD\u3002',
      'Use require("react") from factory(require); never bundle a second copy.'
    ),
    (ctx) => collect(CLIENT(ctx), /unpkg\.com\/react|cdn\.jsdelivr\.net\/npm\/react|window\.React\b|ReactDOM\.render/g, { limit: 3 })
  ),
  // ----------------------------------------------------------------------- UI
  check(
    "ui.state-color-text",
    "ui",
    "core",
    "P1",
    "high",
    "read",
    copy(
      "\u72B6\u6001\u8272\u88AB\u62FF\u6765\u5F53\u6B63\u6587\u989C\u8272",
      "A state color is used as body text color",
      "color: var(--dsw-alias-state-*) \u76F4\u63A5\u7528\u4E8E\u6B63\u6587\u3002",
      "color: var(--dsw-alias-state-*) is used for body text.",
      "\u72B6\u6001\u8272\u662F\u4E3A\u5706\u70B9/\u8FB9\u6846\u8BBE\u8BA1\u7684\uFF0C\u5F53\u6587\u5B57\u901A\u5E38\u8FBE\u4E0D\u5230 4.5:1\uFF1B\u767D\u5E95\u4E0A\u5C24\u5176\u660E\u663E\u3002",
      "State colors are designed for dots and borders; as text they usually miss 4.5:1, especially on light backgrounds.",
      "\u72B6\u6001\u8272\u53EA\u7559\u5728\u5706\u70B9/\u8FB9\u6846\uFF1B\u6587\u5B57\u7528 label-primary/secondary\u3002",
      "Keep state colors on dots and borders; use label-primary/secondary for text."
    ),
    (ctx) => collect([...SOURCE(ctx), ...STYLE(ctx)], /(?:^|[;\s])color\s*:\s*var\(--dsw-alias-state-[^)]+\)/g, { limit: 5 })
  ),
  check(
    "ui.contrast-literal",
    "ui",
    "core",
    "P1",
    "high",
    "read",
    copy(
      "\u5B57\u8272\u548C\u80CC\u666F\u7684\u5BF9\u6BD4\u5EA6\u4E0D\u591F",
      "Text and background do not have enough contrast",
      "\u540C\u4E00\u89C4\u5219\u5757\u5185\u5B57\u8272/\u80CC\u666F\u90FD\u662F\u5B57\u9762\u91CF\uFF0C\u6B63\u6587\u4F4E\u4E8E 4.5:1 \u6216\u5927\u5B57\u4F4E\u4E8E 3:1\u3002",
      "Both text and background are literals and the ratio is below 4.5:1 for body text or 3:1 for large text.",
      "\u4F4E\u5BF9\u6BD4\u5EA6\u5BF9\u4F4E\u89C6\u529B\u3001\u8001\u5E74\u7528\u6237\u548C\u5F3A\u5149\u73AF\u5883\u662F\u76F4\u63A5\u4E0D\u53EF\u8BFB\uFF0C\u4E0D\u662F\u5BA1\u7F8E\u95EE\u9898\u3002",
      "Low contrast is directly unreadable for low vision, older users and bright environments \u2014 not a taste issue.",
      "\u6539\u7528 theme token\uFF1B\u5FC5\u987B\u81EA\u5B9A\u4E49\u65F6\u6309 WCAG \u516C\u5F0F\u7B97\u5230 4.5:1\uFF08\u5927\u5B57 3:1\uFF09\u3002",
      "Use theme tokens; if custom colors are required, compute WCAG 4.5:1 (3:1 for large text)."
    ),
    (ctx) => {
      const out = [];
      for (const file of STYLE(ctx)) {
        for (const pair of inlineColorPairs(file.text)) {
          const big = /font-size\s*:\s*(\d+(?:\.\d+)?)px/i.exec(pair.selector + " " + file.text.slice(pair.index, pair.index + 600));
          const large = big && Number(big[1]) >= 24;
          const threshold = large ? 3 : 4.5;
          if (pair.ratio + 1e-3 >= threshold) continue;
          out.push({
            path: file.path,
            line: file.text.slice(0, pair.index).split("\n").length,
            snippet: file.text.slice(pair.index, pair.index + 300),
            detail: `\u5BF9\u6BD4\u5EA6 ${pair.ratio.toFixed(2)}:1\uFF0C\u4F4E\u4E8E ${threshold}:1`
          });
          if (out.length >= 5) return out;
        }
      }
      return out;
    }
  ),
  check(
    "ui.focus-visible",
    "ui",
    "core",
    "P1",
    "high",
    "read",
    copy(
      "\u7126\u70B9\u73AF\u88AB\u5173\u6389\u4E86",
      "The focus ring is removed",
      "CSS \u91CC outline:none/0\uFF0C\u4E14\u6CA1\u6709 :focus-visible \u66FF\u4EE3\u3002",
      "CSS sets outline:none/0 without a :focus-visible replacement.",
      "\u952E\u76D8\u7528\u6237\u770B\u4E0D\u5230\u5F53\u524D\u7126\u70B9\uFF0C\u7B49\u4E8E\u5728\u9ED1\u6697\u91CC\u6309 Tab\u3002",
      "Keyboard users cannot see where focus is; tabbing becomes guesswork.",
      "\u4FDD\u7559 outline\uFF0C\u6216\u7ED9 :focus-visible \u4E00\u4E2A 2px brand \u8272\u5916\u6846\uFF1B\u4E0D\u8981\u53EA\u5220\u4E0D\u8865\u3002",
      "Keep the outline, or give :focus-visible a 2px brand ring; never remove without a replacement."
    ),
    (ctx) => {
      const out = [];
      for (const file of STYLE(ctx)) {
        if (!/outline\s*:\s*(?:none|0)/.test(file.text)) continue;
        if (/:focus-visible/.test(file.text)) continue;
        const match = /outline\s*:\s*(?:none|0)/.exec(file.text);
        out.push(occ(file, match.index, "outline \u88AB\u79FB\u9664\u4E14\u6CA1\u6709 :focus-visible \u66FF\u4EE3"));
        if (out.length >= 3) break;
      }
      return out;
    }
  ),
  check(
    "ui.touch-target",
    "ui",
    "core",
    "P2",
    "medium",
    "read",
    copy(
      "\u70B9\u51FB\u76EE\u6807\u592A\u5C0F",
      "Click targets are too small",
      "\u6309\u94AE/\u56FE\u6807\u76EE\u6807\u5C0F\u4E8E 24\xD724 CSS px\u3002",
      "Button or icon targets are smaller than 24\xD724 CSS px.",
      "\u624B\u6296\u3001\u89E6\u5C4F\u3001\u89E6\u63A7\u677F\u7528\u6237\u4F1A\u70B9\u9519\uFF1B24\xD724 \u662F WCAG 2.5.8 \u7684\u6700\u4F4E\u7EBF\u3002",
      "Users with tremors, touchscreens or trackpads mis-click; 24\xD724 is the WCAG 2.5.8 minimum.",
      "\u7ED9\u6309\u94AE\u81F3\u5C11 24\xD724 \u7684\u53EF\u70B9\u51FB\u533A\u57DF\uFF1B\u56FE\u6807\u5C0F\u53EF\u4EE5\uFF0C\u70ED\u533A\u4E0D\u80FD\u5C0F\u3002",
      "Give every button at least a 24\xD724 hit area; the glyph can stay small, the target cannot."
    ),
    (ctx) => {
      const out = [];
      for (const file of STYLE(ctx)) {
        for (const rule of cssRules(file.text)) {
          if (!/(?:button|btn|icon|close|toggle|chip)/i.test(rule.selector)) continue;
          const width = /(?:^|[;\s])(?:width|min-width)\s*:\s*(\d+(?:\.\d+)?)px/i.exec(rule.body);
          const height = /(?:^|[;\s])(?:height|min-height)\s*:\s*(\d+(?:\.\d+)?)px/i.exec(rule.body);
          const w = width ? Number(width[1]) : null;
          const h = height ? Number(height[1]) : null;
          if (w !== null && w < 24 || h !== null && h < 24) {
            out.push({
              path: file.path,
              line: file.text.slice(0, rule.index).split("\n").length,
              snippet: `${rule.selector} { ${rule.body.trim().slice(0, 180)} }`,
              detail: `\u76EE\u6807\u5C3A\u5BF8 ${w ?? "?"}\xD7${h ?? "?"}px\uFF0C\u4F4E\u4E8E 24\xD724`
            });
            if (out.length >= 5) return out;
          }
        }
      }
      return out;
    }
  ),
  check(
    "ui.reduced-motion",
    "ui",
    "core",
    "P2",
    "high",
    "read",
    copy(
      "\u52A8\u6548\u6CA1\u6709\u5C0A\u91CD\u51CF\u5C11\u52A8\u6001\u504F\u597D",
      "Motion ignores reduced-motion",
      "\u6709 animation/transition\uFF0C\u4F46\u6CA1\u6709 prefers-reduced-motion\u3002",
      "Animation or transition exists without a prefers-reduced-motion branch.",
      "\u524D\u5EAD\u969C\u788D\u7528\u6237\u4F1A\u88AB\u975E\u5FC5\u8981\u52A8\u6548\u5F04\u6655\uFF1B\u8FD9\u662F\u53EF\u5173\u95ED\u7684\u504F\u597D\uFF0C\u4E0D\u662F\u88C5\u9970\u81EA\u7531\u3002",
      "Vestibular users get dizzy from non-essential motion; it is a preference that must be respected.",
      "\u52A0 @media (prefers-reduced-motion: reduce)\uFF0C\u628A\u975E\u5FC5\u8981 animation/transition \u5173\u6389\u6216\u7F29\u77ED\u3002",
      "Add @media (prefers-reduced-motion: reduce) and disable or shorten non-essential motion."
    ),
    (ctx) => {
      const out = [];
      for (const file of STYLE(ctx)) {
        if (!/(?:animation|transition)\s*:/.test(file.text)) continue;
        if (/prefers-reduced-motion/.test(file.text)) continue;
        const match = /(?:animation|transition)\s*:/.exec(file.text);
        out.push(occ(file, match.index, "\u7F3A\u5C11 prefers-reduced-motion \u5206\u652F"));
        if (out.length >= 3) break;
      }
      return out;
    }
  ),
  check(
    "ui.tiny-type",
    "ui",
    "core",
    "P2",
    "medium",
    "experience",
    copy(
      "\u6B63\u6587\u592A\u5C0F\u6216\u884C\u9AD8\u592A\u6324",
      "Body text is too small or too tight",
      "font-size <12px\uFF0C\u6216 line-height <1.3\u3002",
      "font-size is below 12px, or line-height is below 1.3.",
      "\u957F\u65F6\u95F4\u8BFB\u4F1A\u7D2F\uFF1B\u4E2D\u6587\u5C24\u5176\u9700\u8981\u66F4\u5927\u7684\u5B57\u53F7\u548C\u884C\u8DDD\u3002",
      "Long reading sessions hurt; CJK text needs more size and leading, not less.",
      "\u6B63\u6587\u81F3\u5C11 12px\uFF0C\u63A8\u8350 13\u201314px\uFF1B\u884C\u9AD8\u81F3\u5C11 1.4\u3002",
      "Body text at least 12px, ideally 13\u201314px; line-height at least 1.4."
    ),
    (ctx) => {
      const out = [];
      for (const file of STYLE(ctx)) {
        for (const rule of cssRules(file.text)) {
          const font = /(?:^|[;\s])font-size\s*:\s*(\d+(?:\.\d+)?)px/i.exec(rule.body);
          const lh = /(?:^|[;\s])line-height\s*:\s*(\d+(?:\.\d+)?)(?!px|%|em|rem)/i.exec(rule.body);
          if (font && Number(font[1]) < 12) {
            out.push({ path: file.path, line: file.text.slice(0, rule.index).split("\n").length, snippet: `${rule.selector} { ${rule.body.trim().slice(0, 160)} }`, detail: `font-size ${font[1]}px` });
          } else if (lh && Number(lh[1]) < 1.3) {
            out.push({ path: file.path, line: file.text.slice(0, rule.index).split("\n").length, snippet: `${rule.selector} { ${rule.body.trim().slice(0, 160)} }`, detail: `line-height ${lh[1]}` });
          }
          if (out.length >= 5) return out;
        }
      }
      return out;
    }
  ),
  check(
    "ui.layout-shift",
    "ui",
    "core",
    "P2",
    "medium",
    "experience",
    copy(
      "\u56FE\u7247/\u5F02\u6B65\u5185\u5BB9\u6CA1\u6709\u9884\u7559\u4F4D\u7F6E",
      "Images or async content reserve no space",
      "img \u6CA1\u6709 width/height/aspect-ratio\uFF0C\u5F02\u6B65\u5185\u5BB9\u63D2\u5165\u4E0D\u5360\u4F4D\u3002",
      "An img has no width/height/aspect-ratio, or async content inserts without reserved space.",
      "\u5185\u5BB9\u52A0\u8F7D\u65F6\u9875\u9762\u4F1A\u8DF3\uFF0C\u7528\u6237\u70B9\u9519\u3001\u8BFB\u4E22\u884C\uFF1B\u8FD9\u662F CLS \u7684\u5178\u578B\u6765\u6E90\u3002",
      "The page jumps while content loads; users mis-click and lose their place \u2014 a classic CLS source.",
      "\u7ED9\u56FE\u7247\u5199 width/height \u6216 aspect-ratio\uFF1B\u5F02\u6B65\u533A\u57DF\u5148\u5360\u4F4D\u518D\u66FF\u6362\u3002",
      "Set width/height or aspect-ratio on images; reserve space before replacing async content."
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        const re = /<img\b[^>]*>/g;
        let match;
        while ((match = re.exec(file.text)) !== null) {
          const tag = match[0];
          if (/\bwidth=|\bheight=|aspect-ratio|aspectRatio/.test(tag)) continue;
          out.push(occ(file, match.index, "img \u6CA1\u6709\u5C3A\u5BF8/\u6BD4\u4F8B"));
          if (out.length >= 5) return out;
        }
        const createRe = /createElement\(\s*['"]img['"]\s*,\s*\{([^}]*)\}/g;
        while ((match = createRe.exec(file.text)) !== null) {
          if (/\bwidth\s*:|\bheight\s*:|aspectRatio/.test(match[1])) continue;
          out.push(occ(file, match.index, "img \u6CA1\u6709\u5C3A\u5BF8/\u6BD4\u4F8B"));
          if (out.length >= 5) return out;
        }
      }
      return out;
    }
  ),
  check(
    "ui.double-scroll",
    "ui",
    "deep",
    "P2",
    "medium",
    "experience",
    copy(
      "\u9762\u677F\u91CC\u51FA\u73B0\u53CC\u6EDA\u52A8",
      "The panel has nested scrolling",
      "height:100vh \u6216\u591A\u5C42 overflow:auto\u3002",
      "height:100vh or multiple overflow:auto containers.",
      "\u9762\u677F\u672C\u8EAB\u5DF2\u7ECF\u88AB\u5BBF\u4E3B\u7BA1\u6EDA\u52A8\uFF1B\u518D\u5957\u4E00\u5C42\u4F1A\u8BA9\u6EDA\u8F6E\u5361\u4F4F\u3001\u6EDA\u52A8\u6761\u6253\u67B6\u3002",
      "The host already scrolls the panel; another layer makes the wheel stick and scrollbars fight.",
      "\u9762\u677F\u9AD8\u5EA6\u7528 100%/min-height:0\uFF0C\u53EA\u7559\u4E00\u4E2A\u6EDA\u52A8\u5BB9\u5668\u3002",
      "Use 100%/min-height:0 for panel height and keep one scroll container."
    ),
    (ctx) => {
      const out = [];
      for (const file of STYLE(ctx)) {
        if (/height\s*:\s*100vh/.test(file.text)) {
          const match = /height\s*:\s*100vh/.exec(file.text);
          out.push(occ(file, match.index, "\u9762\u677F\u5185 height:100vh"));
        }
        const overflowCount = (file.text.match(/overflow(?:-y)?\s*:\s*auto/g) || []).length;
        if (overflowCount >= 2) {
          const match = /overflow(?:-y)?\s*:\s*auto/.exec(file.text);
          out.push(occ(file, match.index, `${overflowCount} \u5C42 overflow:auto`));
        }
        if (out.length >= 3) return out;
      }
      return out;
    }
  ),
  check(
    "ui.color-only-status",
    "ui",
    "deep",
    "P2",
    "medium",
    "read",
    copy(
      "\u72B6\u6001\u53EA\u9760\u989C\u8272\u8868\u8FBE",
      "Status is conveyed by color alone",
      "\u72B6\u6001\u70B9\u6CA1\u6709\u6587\u5B57/\u56FE\u6807/aria-label\u3002",
      "A status dot has no text, icon or aria-label.",
      "\u8272\u89C9\u5DEE\u5F02\u7528\u6237\u770B\u4E0D\u51FA\u7EFF/\u7EA2/\u9EC4\uFF1B\u72B6\u6001\u5FC5\u987B\u8FD8\u6709\u7B2C\u4E8C\u79CD\u8868\u8FBE\u3002",
      "Color-vision-deficient users cannot tell green/red/amber apart; status needs a second channel.",
      "\u5728\u5706\u70B9\u65C1\u52A0\u6587\u5B57\uFF08\u8FD0\u884C\u4E2D/\u5931\u8D25/\u672A\u77E5\uFF09\u6216 aria-label\uFF1B\u4E0D\u8981\u53EA\u6362\u989C\u8272\u3002",
      "Add text (running/failed/unknown) or an aria-label next to the dot; do not just change the color."
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        if (/aria-label|ariaLabel/.test(file.text)) continue;
        const re = /(?:StatusDot|status[-_]?dot|statusDot)/g;
        let match;
        while ((match = re.exec(file.text)) !== null) {
          const windowText = file.text.slice(Math.max(0, match.index - 400), Math.min(file.text.length, match.index + 800));
          if (/aria-label|title\s*:|children|>\s*\{[^}]*label|运行中|失败|未知/.test(windowText)) continue;
          out.push(occ(file, match.index, "\u72B6\u6001\u70B9\u9644\u8FD1\u6CA1\u6709\u6587\u5B57/aria-label"));
          if (out.length >= 4) return out;
        }
      }
      return out;
    }
  ),
  // ---------------------------------------------------------------------- UX
  check(
    "ux.destructive-no-confirm",
    "ux",
    "core",
    "P1",
    "medium",
    "experience",
    copy(
      "\u7834\u574F\u6027\u64CD\u4F5C\u6CA1\u6709\u786E\u8BA4\u6216\u64A4\u9500",
      "A destructive action has no confirmation or undo",
      "\u5220\u9664/\u6E05\u7A7A/\u8986\u76D6/\u5378\u8F7D\u6309\u94AE\u76F4\u63A5\u6267\u884C\u3002",
      "Delete/clear/overwrite/uninstall runs immediately.",
      "\u4E00\u6B21\u8BEF\u70B9\u5C31\u6C38\u4E45\u4E22\u6570\u636E\uFF1B\u786E\u8BA4\u6846\u70E6\u4EBA\uFF0C\u4F46\u4E0D\u53EF\u9006\u64CD\u4F5C\u81F3\u5C11\u8981\u6709\u786E\u8BA4\u6216\u64A4\u9500\u3002",
      "One mis-click loses data for good; a confirmation is annoying, but an irreversible action needs confirm or undo.",
      "\u4F18\u5148\u7ED9\u64A4\u9500\uFF1B\u4E0D\u80FD\u64A4\u9500\u65F6\u4E8C\u6B21\u786E\u8BA4\uFF0C\u5E76\u628A\u6309\u94AE\u4ECE\u9ED8\u8BA4\u7126\u70B9\u79FB\u5F00\u3002",
      "Prefer undo; when impossible, ask for confirmation and keep the button out of the default focus."
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        const re = /['"`]([^'"`]*(?:删除|清空|移除|卸载|Delete|Remove|Clear|Uninstall)[^'"`]*)['"`]/g;
        let match;
        while ((match = re.exec(file.text)) !== null) {
          if (/confirm\s*\(|undo|撤销|确认|risky/i.test(file.text)) continue;
          out.push(occ(file, match.index, "\u7834\u574F\u6027\u6587\u6848\u9644\u8FD1\u6CA1\u6709 confirm/undo"));
          if (out.length >= 5) return out;
        }
      }
      return out;
    }
  ),
  check(
    "ux.raw-error",
    "ux",
    "core",
    "P2",
    "medium",
    "read",
    copy(
      "\u628A\u539F\u59CB\u5F02\u5E38\u76F4\u63A5\u7529\u7ED9\u7528\u6237",
      "The raw exception is shown to the user",
      "String(error)\u3001\u5F02\u5E38 JSON \u6216\u5806\u6808\u76F4\u63A5\u8FDB UI\u3002",
      "String(error), error JSON or a stack trace is rendered in the UI.",
      "\u7528\u6237\u770B\u4E0D\u61C2\u5185\u90E8\u8BCA\u65AD\uFF0C\u8FD8\u4F1A\u66B4\u9732\u8DEF\u5F84\u3001token \u548C\u5B9E\u73B0\u7EC6\u8282\uFF1B\u9519\u8BEF\u4FE1\u606F\u5E94\u8BE5\u662F\u53EF\u884C\u52A8\u7684\u8BDD\u3002",
      "Users cannot act on internal diagnostics, and it leaks paths, tokens and implementation details; an error should say what to do next.",
      "\u7ED9\u7528\u6237\u53EF\u7406\u89E3\u7684\u4E00\u53E5\u8BDD + \u91CD\u8BD5\uFF1B\u539F\u59CB\u9519\u8BEF\u8FDB\u65E5\u5FD7/\u8BCA\u65AD\uFF0C\u4E0D\u8FDB\u6B63\u6587\u3002",
      "Show one understandable sentence plus retry; keep the raw error in logs/diagnostics, not in the body."
    ),
    (ctx) => collect(CLIENT(ctx), /String\(\s*(?:error|err|e)\s*\)|JSON\.stringify\(\s*(?:error|err|e)\s*\)|(?<![.\w])(?:error|err)\.message\b/g, { limit: 5 })
  ),
  check(
    "ux.no-states",
    "ux",
    "core",
    "P2",
    "low",
    "experience",
    copy(
      "\u6CA1\u6709 loading / empty / error \u72B6\u6001",
      "No loading / empty / error states",
      "\u5927\u9762\u677F\u53EA\u6709\u6210\u529F\u8DEF\u5F84\uFF0C\u6CA1\u6709\u52A0\u8F7D\u3001\u7A7A\u548C\u5931\u8D25\u6587\u6848\u3002",
      "A large panel only has the happy path; no loading, empty or failure copy.",
      "\u7528\u6237\u4E0D\u77E5\u9053\u662F\u5728\u52A0\u8F7D\u3001\u6CA1\u6570\u636E\u8FD8\u662F\u574F\u4E86\uFF1B\u53EA\u80FD\u53CD\u590D\u70B9\u3002",
      "Users cannot tell loading from empty from broken; they just click again.",
      "\u8865\u4E0A\u4E09\u79CD\u72B6\u6001\u6587\u6848\u548C\u5BF9\u5E94\u52A8\u4F5C\uFF1B\u7A7A\u72B6\u6001\u544A\u8BC9\u7528\u6237\u4E0B\u4E00\u6B65\u3002",
      "Add the three states and their actions; the empty state should say what to do next."
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        if (file.lineCount < 400) continue;
        if (/loading|empty|error|加载|空|重试|出错/i.test(file.text)) continue;
        out.push({ path: file.path, line: 1, snippet: "", detail: "\u5927\u9762\u677F\u6CA1\u6709 loading/empty/error \u6587\u6848" });
        if (out.length >= 2) return out;
      }
      return out;
    }
  ),
  check(
    "ux.keyboard-only-mouse",
    "ux",
    "core",
    "P2",
    "medium",
    "read",
    copy(
      "\u62D6\u62FD/\u6307\u9488\u64CD\u4F5C\u6CA1\u6709\u952E\u76D8\u66FF\u4EE3",
      "Drag/pointer interaction has no keyboard path",
      "onPointerDown/onMouseDown/onDragStart \u5B58\u5728\uFF0C\u4F46\u6CA1\u6709\u952E\u76D8\u5904\u7406\u3002",
      "onPointerDown/onMouseDown/onDragStart exists without a keyboard handler.",
      "\u952E\u76D8\u7528\u6237\u548C\u90E8\u5206\u8FD0\u52A8\u969C\u788D\u7528\u6237\u65E0\u6CD5\u5B8C\u6210\u540C\u4E00\u4EF6\u4E8B\uFF1B2.5.7 \u8981\u6C42\u5355\u6307\u9488\u66FF\u4EE3\uFF0C2.1.1 \u8981\u6C42\u952E\u76D8\u53EF\u8FBE\u3002",
      "Keyboard users and some mobility users cannot do the same thing; 2.5.7 needs a single-pointer alternative and 2.1.1 needs keyboard access.",
      "\u7ED9\u4E0A\u4E0B/\u5DE6\u53F3\u6309\u94AE\u3001\u8F93\u5165\u6846\u6216\u201C\u9009\u62E9\u540E\u79FB\u52A8\u201D\u7684\u66FF\u4EE3\u8DEF\u5F84\u3002",
      "Provide up/down/left/right buttons, a text input, or a select-then-move alternative."
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        if (!/onPointerDown|onMouseDown|onDragStart|\bdraggable\b/.test(file.text)) continue;
        if (/onKeyDown|onKeyUp|onKeyPress|tabIndex/.test(file.text)) continue;
        const match = /onPointerDown|onMouseDown|onDragStart|\bdraggable\b/.exec(file.text);
        out.push(occ(file, match.index, "\u6709\u62D6\u62FD/\u6307\u9488\u64CD\u4F5C\uFF0C\u6CA1\u6709\u952E\u76D8\u5904\u7406"));
        if (out.length >= 3) break;
      }
      return out;
    }
  ),
  check(
    "ux.no-escape",
    "ux",
    "core",
    "P2",
    "medium",
    "experience",
    copy(
      "\u5F39\u5C42\u5173\u4E0D\u6389",
      "An overlay cannot be dismissed",
      "dialog/overlay/popover \u6CA1\u6709 Esc \u6216\u70B9\u5916\u5173\u95ED\u3002",
      "A dialog/overlay/popover has no Escape or outside-click close.",
      "\u7528\u6237\u88AB\u56F0\u5728\u5F39\u5C42\u91CC\uFF0C\u53EA\u80FD\u5237\u65B0\u9875\u9762\uFF1B\u8FD9\u662F\u6700\u5E38\u89C1\u7684\u201C\u770B\u8D77\u6765\u80FD\u7528\u3001\u5B9E\u9645\u5361\u6B7B\u201D\u3002",
      "Users get trapped and have to refresh; the classic \u201Clooks usable, actually stuck\u201D case.",
      "\u76D1\u542C Escape \u548C\u70B9\u5916\u5173\u95ED\uFF0C\u5173\u95ED\u540E\u628A\u7126\u70B9\u8FD8\u7ED9\u89E6\u53D1\u6309\u94AE\u3002",
      "Handle Escape and outside click, and return focus to the trigger after closing."
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        if (!/role\s*:\s*['"]dialog|role="dialog"|(?:overlay|modal|popover)/i.test(file.text)) continue;
        if (/Escape|keydown|onKeyDown/.test(file.text)) continue;
        const match = /role\s*:\s*['"]dialog|role="dialog"|(?:overlay|modal|popover)/i.exec(file.text);
        out.push(occ(file, match.index, "\u5F39\u5C42\u6CA1\u6709 Escape \u5904\u7406"));
        if (out.length >= 3) break;
      }
      return out;
    }
  ),
  check(
    "ux.no-retry",
    "ux",
    "core",
    "P2",
    "low",
    "experience",
    copy(
      "\u5931\u8D25\u540E\u6CA1\u6709\u91CD\u8BD5\u5165\u53E3",
      "A failure has no retry path",
      "\u9519\u8BEF\u6587\u6848\u5B58\u5728\uFF0C\u4F46\u6CA1\u6709\u91CD\u8BD5/\u6062\u590D\u52A8\u4F5C\u3002",
      "Error copy exists, but there is no retry or recovery action.",
      "\u7528\u6237\u53EA\u80FD\u91CD\u65B0\u6253\u5F00\u63D2\u4EF6\uFF1B\u5C0F\u5931\u8D25\u88AB\u653E\u5927\u6210\u6D41\u7A0B\u4E2D\u65AD\u3002",
      "Users have to reopen the plugin; a small failure becomes a broken flow.",
      "\u5728\u9519\u8BEF\u6001\u7ED9\u201C\u91CD\u8BD5\u201D\u548C\u201C\u8FD4\u56DE\u201D\uFF1B\u4FDD\u7559\u4E0A\u6B21\u8F93\u5165\u3002",
      "Add Retry and Back in the error state; keep the previous input."
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        if (!/setError|catch\s*\(|error\s*[:=]|失败|出错/i.test(file.text)) continue;
        if (/retry|重试|再试|tryAgain/.test(file.text)) continue;
        const match = /setError|catch\s*\(|失败|出错/i.exec(file.text);
        out.push(occ(file, match.index, "\u9519\u8BEF\u8DEF\u5F84\u6CA1\u6709 retry"));
        if (out.length >= 3) break;
      }
      return out;
    }
  ),
  check(
    "ux.no-copy-save-feedback",
    "ux",
    "deep",
    "P3",
    "low",
    "experience",
    copy(
      "\u590D\u5236/\u4FDD\u5B58\u6CA1\u6709\u53CD\u9988",
      "Copy/save gives no feedback",
      "clipboard.writeText \u6216 save \u8C03\u7528\u540E\u6CA1\u6709\u6210\u529F/\u5931\u8D25\u63D0\u793A\u3002",
      "clipboard.writeText or save runs without a success/failure message.",
      "\u7528\u6237\u4E0D\u77E5\u9053\u5230\u5E95\u6210\u6CA1\u6210\uFF0C\u53EA\u80FD\u518D\u70B9\u4E00\u6B21\uFF1B\u91CD\u590D\u4FDD\u5B58\u4E5F\u53EF\u80FD\u9020\u6210\u91CD\u590D\u6570\u636E\u3002",
      "Users cannot tell whether it worked and click again; repeated saves can duplicate data.",
      "\u7ED9\u77ED\u63D0\u793A\uFF08\u5DF2\u590D\u5236/\u4FDD\u5B58\u5931\u8D25\uFF09\u6216\u7528\u6309\u94AE\u72B6\u6001\u53D8\u5316\u8868\u8FBE\uFF1B\u5931\u8D25\u8981\u53EF\u91CD\u8BD5\u3002",
      "Show a short \u201Ccopied\u201D/\u201Csave failed\u201D state or change the button state; failures must be retryable."
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        if (!/clipboard\.writeText|navigator\.clipboard|saveWorkspace|save\(/i.test(file.text)) continue;
        if (/copied|saved|已复制|已保存|复制成功|保存成功|保存失败/i.test(file.text)) continue;
        const match = /clipboard\.writeText|navigator\.clipboard|saveWorkspace|save\(/i.exec(file.text);
        out.push(occ(file, match.index, "\u590D\u5236/\u4FDD\u5B58\u6CA1\u6709\u53CD\u9988"));
        if (out.length >= 3) break;
      }
      return out;
    }
  ),
  check(
    "ux.no-progress-cancel",
    "ux",
    "deep",
    "P2",
    "low",
    "experience",
    copy(
      "\u957F\u4EFB\u52A1\u6CA1\u6709\u8FDB\u5EA6\u6216\u53D6\u6D88",
      "A long task has no progress or cancel",
      "\u626B\u63CF/\u5BFC\u5165/\u5BFC\u51FA/\u4E0A\u4F20\u53EA\u6709\u8F6C\u5708\uFF0C\u6CA1\u6709\u8FDB\u5EA6\u6216\u53D6\u6D88\u3002",
      "Scan/import/export/upload only spins, with no progress or cancel.",
      "\u7528\u6237\u4E0D\u77E5\u9053\u8FD8\u8981\u591A\u4E45\uFF0C\u4E5F\u65E0\u6CD5\u505C\u4E0B\uFF1B\u6162\u7684\u65F6\u5019\u4F1A\u4EE5\u4E3A\u5361\u6B7B\u3002",
      "Users do not know how long it will take and cannot stop it; a slow task looks hung.",
      "\u7ED9\u9636\u6BB5\u6587\u6848/\u8FDB\u5EA6\u548C\u53D6\u6D88\uFF1B\u53D6\u6D88\u540E\u6E05\u7406\u4E34\u65F6\u8D44\u6E90\u3002",
      "Show stage/progress and a cancel action; clean up temporary resources on cancel."
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        if (file.lineCount < 250) continue;
        if (!/(?:scan|import|export|upload|generate)\w*\s*\(|保存|扫描|导入|导出|上传/i.test(file.text)) continue;
        if (/progress|cancel|取消|进度/i.test(file.text)) continue;
        const match = /(?:scan|import|export|upload|generate)\w*\s*\(|保存|扫描|导入|导出|上传/i.exec(file.text);
        out.push(occ(file, match.index, "\u957F\u4EFB\u52A1\u6CA1\u6709\u8FDB\u5EA6/\u53D6\u6D88"));
        if (out.length >= 3) break;
      }
      return out;
    }
  ),
  check(
    "ux.unsaved-guard",
    "ux",
    "deep",
    "P2",
    "low",
    "experience",
    copy(
      "\u5173\u95ED\u65F6\u6CA1\u6709\u672A\u4FDD\u5B58\u63D0\u9192",
      "No unsaved-changes guard",
      "\u53EF\u7F16\u8F91\u5185\u5BB9\u5173\u95ED/\u5207\u8D70\u65F6\u6CA1\u6709 dirty \u68C0\u67E5\u3002",
      "Editable content closes or navigates away without a dirty check.",
      "\u7528\u6237\u5199\u4E86\u4E00\u5C4F\u5B57\uFF0C\u4E00\u6B21\u8BEF\u5173\u5C31\u6CA1\u4E86\uFF1B\u81EA\u52A8\u4FDD\u5B58\u4E5F\u8981\u6709\u5931\u8D25\u63D0\u793A\u3002",
      "A screen of writing disappears on one mis-close; even autosave needs a failure signal.",
      "\u6709\u672A\u4FDD\u5B58\u6539\u52A8\u65F6\u62E6\u622A\u5173\u95ED/\u5207\u6362\uFF0C\u7ED9\u201C\u4FDD\u5B58/\u4E22\u5F03/\u53D6\u6D88\u201D\u3002",
      "Intercept close/navigation when dirty and offer Save / Discard / Cancel."
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        if (!/(?:textarea|contentEditable|\bdirty\b|\bunsaved\b|beforeunload)/i.test(file.text)) continue;
        if (/beforeunload|useBlocker|未保存|unsaved|dirty/i.test(file.text)) continue;
        const match = /textarea|contentEditable|useState/i.exec(file.text);
        out.push(occ(file, match.index, "\u53EF\u7F16\u8F91\u5185\u5BB9\u6CA1\u6709\u672A\u4FDD\u5B58\u63D0\u9192"));
        if (out.length >= 2) break;
      }
      return out;
    }
  ),
  // --------------------------------------------------------------- performance
  check(
    "perf.bundle-size",
    "performance",
    "core",
    "P2",
    "high",
    "experience",
    copy(
      "\u5BA2\u6237\u7AEF\u5305\u4F53\u504F\u5927",
      "The client bundle is large",
      "\u624B\u5199\u5BA2\u6237\u7AEF\u4EA7\u7269\u8D85\u8FC7 500KB\uFF081MB \u4EE5\u4E0A\u66F4\u4E25\u91CD\uFF09\u3002",
      "The authored client artifact is over 500KB (worse above 1MB).",
      "\u6BCF\u6B21\u6253\u5F00\u9762\u677F\u90FD\u8981\u4E0B\u8F7D\u3001\u89E3\u6790\u3001\u6267\u884C\uFF1B\u5305\u4F53\u662F\u7528\u6237\u6BCF\u6B21\u90FD\u8981\u4ED8\u7684\u7A0E\u3002",
      "Every panel open downloads, parses and executes it; bundle size is a tax users pay every time.",
      "\u62C6\u5305/\u61D2\u52A0\u8F7D/\u628A\u5927\u8D44\u6E90\u79FB\u51FA\u5BA2\u6237\u7AEF\uFF1B\u6784\u5EFA\u4EA7\u7269\u8981\u4FDD\u7559\u6E90\u7801\uFF0C\u522B\u53EA\u63D0\u4EA4 bundle\u3002",
      "Split/lazy-load or move large assets out of the client; keep the source for generated artifacts."
    ),
    (ctx) => {
      const artifact = ctx.budget.details.clientArtifact;
      if (!artifact) return [];
      if (artifact.generated && ctx.inventory.hasClientSource) return [];
      if (artifact.bytes <= BUDGETS.clientBytesWarn) return [];
      return [{
        path: artifact.path,
        line: 1,
        snippet: "",
        detail: `${(artifact.bytes / 1024).toFixed(0)}KB${artifact.bytes > BUDGETS.clientBytesBad ? "\uFF0C\u8D85\u8FC7 1MB" : ""}`,
        severity: artifact.bytes > BUDGETS.clientBytesBad ? "P1" : "P2"
      }];
    }
  ),
  check(
    "perf.inline-asset",
    "performance",
    "core",
    "P2",
    "high",
    "experience",
    copy(
      "\u5927\u8D44\u6E90\u88AB base64 \u5185\u8054\u8FDB JS/CSS",
      "A large asset is inlined as base64",
      "\u5355\u5757 base64 \u56FE\u7247/\u5B57\u4F53\u8D85\u8FC7 100KB\u3002",
      "A single base64 image/font block is over 100KB.",
      "base64 \u6BD4\u4E8C\u8FDB\u5236\u591A\u7EA6 33%\uFF0C\u8FD8\u4F1A\u963B\u585E\u89E3\u6790\uFF1B\u5B83\u8BA9\u9996\u5C4F\u53D8\u6162\uFF0C\u4E14\u65E0\u6CD5\u5355\u72EC\u7F13\u5B58\u3002",
      "Base64 is about 33% larger than binary and blocks parsing; it slows first paint and cannot be cached separately.",
      "\u628A\u8D44\u6E90\u653E\u72EC\u7ACB\u6587\u4EF6\uFF0C\u7528 URL/\u8DEF\u7531\u52A0\u8F7D\uFF1B\u9700\u8981\u5185\u8054\u65F6\u8BBE\u4E0A\u9650\u3002",
      "Ship the asset as a file and load it by URL/route; cap any inline payload."
    ),
    (ctx) => {
      const out = [];
      for (const item of ctx.budget.details.inlineOccurrences) {
        if (item.bytes < BUDGETS.inlineAssetBytes) continue;
        out.push({ path: item.path, line: item.line, snippet: "", detail: `\u5185\u8054\u7EA6 ${(item.bytes / 1024).toFixed(0)}KB` });
        if (out.length >= 3) return out;
      }
      return out;
    }
  ),
  check(
    "perf.sync-io",
    "performance",
    "core",
    "P1",
    "high",
    "experience",
    copy(
      "\u8BF7\u6C42/\u5DE5\u5177\u70ED\u8DEF\u5F84\u91CC\u505A\u540C\u6B65 IO",
      "Synchronous IO in a request/tool hot path",
      "\u8DEF\u7531\u3001tool execute \u6216 apply \u91CC\u51FA\u73B0 readFileSync/writeFileSync\u3002",
      "readFileSync/writeFileSync appears in a route, tool execute or apply.",
      "\u540C\u6B65 IO \u4F1A\u5361\u4F4F\u6574\u4E2A Host \u4E8B\u4EF6\u5FAA\u73AF\uFF1B\u4E00\u4E2A\u6162\u76D8\u5C31\u80FD\u8BA9\u6240\u6709\u4F1A\u8BDD\u4E00\u8D77\u5361\u3002",
      "Sync IO blocks the whole Host event loop; one slow disk stalls every session.",
      "\u6539 await fs.promises.readFile/writeFile\uFF1B\u7F13\u5B58\u53EF\u590D\u7528\u7ED3\u679C\uFF1B\u5927\u6587\u4EF6\u6D41\u5F0F\u5904\u7406\u3002",
      "Use await fs.promises.readFile/writeFile; cache reusable results; stream large files."
    ),
    (ctx) => ctx.budget.details.syncIoCalls.slice(0, 5).map((item) => ({
      path: item.path,
      line: item.line,
      snippet: item.code,
      detail: item.hotPath ? "\u540C\u6B65 IO \u5728\u8BF7\u6C42/\u5DE5\u5177\u70ED\u8DEF\u5F84" : "\u540C\u6B65 IO \u5728\u542F\u52A8/\u4E00\u6B21\u6027\u8DEF\u5F84\uFF08\u964D\u4E3A\u5EFA\u8BAE\uFF09",
      severity: item.hotPath ? "P1" : "P2"
    }))
  ),
  check(
    "perf.polling",
    "performance",
    "core",
    "P2",
    "high",
    "experience",
    copy(
      "\u8F6E\u8BE2\u592A\u9891\u7E41",
      "Polling is too frequent",
      "setInterval \u5C0F\u4E8E 1000ms \u8F6E\u8BE2\u72B6\u6001\u3002",
      "setInterval polls status faster than 1000ms.",
      "\u7A7A\u95F2\u65F6\u4E5F\u4E00\u76F4\u5524\u9192 CPU/\u7F51\u7EDC\uFF1B\u591A\u4E2A\u63D2\u4EF6\u53E0\u52A0\u4F1A\u628A\u5BBF\u4E3B\u62D6\u6162\u3002",
      "It wakes CPU/network while idle; several plugins stack into a slow host.",
      "\u5148\u8BA2\u9605\u4E8B\u4EF6\uFF1B\u5FC5\u987B\u8F6E\u8BE2\u65F6 \u22651s\uFF0C\u5E76\u5728\u4E0D\u53EF\u89C1\u65F6\u6682\u505C\u3002",
      "Subscribe to events first; if polling is unavoidable, use \u22651s and pause when hidden."
    ),
    (ctx) => ctx.budget.details.pollingIntervals.slice(0, 5).map((item) => ({
      path: item.path,
      line: item.line,
      snippet: "",
      detail: `setInterval ${item.ms}ms`
    }))
  ),
  check(
    "perf.no-abort",
    "performance",
    "core",
    "P1",
    "high",
    "read",
    copy(
      "fetch \u6CA1\u6709\u53D6\u6D88",
      "A fetch is never cancelled",
      "useEffect \u91CC fetch\uFF0C\u6CA1\u6709 AbortController/signal\u3002",
      "fetch runs in useEffect without AbortController/signal.",
      "\u7EC4\u4EF6\u5378\u8F7D\u6216\u4F9D\u8D56\u53D8\u5316\u540E\u8BF7\u6C42\u8FD8\u5728\u8DD1\uFF0C\u56DE\u6765\u65F6\u66F4\u65B0\u5DF2\u5378\u8F7D\u7EC4\u4EF6\uFF1B\u6162\u7F51\u4E0B\u4F1A\u5806\u79EF\u3002",
      "The request keeps running after unmount/dependency change and updates a gone component; slow networks pile them up.",
      "\u5728 effect \u91CC\u521B\u5EFA AbortController\uFF0Ccleanup \u8C03 abort\uFF1Bfetch \u4F20 signal\u3002",
      "Create an AbortController in the effect, call abort in cleanup, and pass signal to fetch."
    ),
    (ctx) => ctx.budget.details.fetchWithoutAbort.slice(0, 5).map((item) => ({
      path: item.path,
      line: item.line,
      snippet: "",
      detail: "useEffect fetch \u6CA1\u6709 AbortController"
    }))
  ),
  check(
    "perf.serial-await",
    "performance",
    "core",
    "P2",
    "medium",
    "experience",
    copy(
      "\u4E32\u884C await \u53EF\u4EE5\u5E76\u884C",
      "Serial awaits could run in parallel",
      "\u5FAA\u73AF\u91CC\u5BF9\u4E92\u76F8\u72EC\u7ACB\u7684\u9879\u9010\u4E2A await\u3002",
      "A loop awaits independent items one by one.",
      "N \u4E2A 200ms \u8BF7\u6C42\u4E32\u8D77\u6765\u5C31\u662F N\xD7200ms\uFF1B\u7528\u6237\u770B\u5230\u7684\u662F\u201C\u600E\u4E48\u8FD9\u4E48\u6162\u201D\u3002",
      "N independent 200ms calls become N\xD7200ms; users feel it as \u201Cwhy is this slow\u201D.",
      "\u7528 Promise.all \u5E76\u53D1\uFF1B\u6709\u4F9D\u8D56\u518D\u4E32\u884C\uFF1B\u9650\u5236\u5E76\u53D1\u6570\u907F\u514D\u6253\u7206\u4E0B\u6E38\u3002",
      "Use Promise.all for independent work; keep serial only for real dependencies; cap concurrency."
    ),
    (ctx) => ctx.budget.details.serialAwaitLoops.slice(0, 5).map((item) => ({
      path: item.path,
      line: item.line,
      snippet: "",
      detail: "\u5FAA\u73AF\u5185\u4E32\u884C await"
    }))
  ),
  check(
    "perf.layout-animation",
    "performance",
    "deep",
    "P2",
    "medium",
    "experience",
    copy(
      "\u52A8\u753B\u5728\u6539\u5E03\u5C40\u5C5E\u6027",
      "Animation changes layout properties",
      "transition/animation \u52A8 width/height/top/left/margin/padding\u3002",
      "transition/animation animates width/height/top/left/margin/padding.",
      "\u5E03\u5C40\u52A8\u753B\u6BCF\u5E27\u90FD\u89E6\u53D1\u5E03\u5C40/\u7ED8\u5236\uFF0C\u4F4E\u7AEF\u673A\u548C\u957F\u5217\u8868\u4F1A\u6389\u5E27\u3002",
      "Layout animation forces layout/paint every frame; low-end machines and long lists drop frames.",
      "\u6539 transform/opacity\uFF1B\u5FC5\u987B\u6539\u5C3A\u5BF8\u65F6\u7528 FLIP \u6216\u51CF\u5C11\u5143\u7D20\u6570\u91CF\u3002",
      "Animate transform/opacity; if size must change, use FLIP or reduce the element count."
    ),
    (ctx) => ctx.budget.details.layoutAnimationRules.slice(0, 5).map((item) => ({
      path: item.path,
      line: item.line,
      snippet: "",
      detail: `\u52A8\u753B\u5C5E\u6027 ${item.property}`
    }))
  ),
  check(
    "perf.font-display",
    "performance",
    "deep",
    "P3",
    "medium",
    "experience",
    copy(
      "@font-face \u6CA1\u6709 font-display",
      "@font-face lacks font-display",
      "\u81EA\u5B9A\u4E49\u5B57\u4F53\u6CA1\u6709 font-display: swap/optional\u3002",
      "A custom font has no font-display: swap/optional.",
      "\u5B57\u4F53\u6CA1\u5230\u4E4B\u524D\u6587\u5B57\u53EF\u80FD\u4E0D\u53EF\u89C1\uFF0C\u9996\u5C4F\u50CF\u7A7A\u767D\uFF1B\u6162\u7F51\u4E0B\u5C24\u5176\u660E\u663E\u3002",
      "Text may stay invisible until the font arrives; slow networks make the first paint look blank.",
      "\u52A0 font-display: swap\uFF1B\u6216\u5148\u7CFB\u7EDF\u5B57\u4F53\uFF0C\u5B57\u4F53\u5230\u4E86\u518D\u6362\u3002",
      "Add font-display: swap, or start with a system font and swap when ready."
    ),
    (ctx) => {
      const out = [];
      for (const file of STYLE(ctx)) {
        const re = /@font-face\s*\{([\s\S]*?)\}/g;
        let match;
        while ((match = re.exec(file.text)) !== null) {
          if (/font-display\s*:/.test(match[1])) continue;
          out.push(occ(file, match.index, "@font-face \u6CA1\u6709 font-display"));
          if (out.length >= 3) return out;
        }
      }
      return out;
    }
  ),
  check(
    "perf.virtualization",
    "performance",
    "deep",
    "P3",
    "low",
    "experience",
    copy(
      "\u957F\u5217\u8868\u4E00\u6B21\u6027\u6E32\u67D3",
      "A long list renders all at once",
      "\u5BF9\u65E0\u4E0A\u9650\u6570\u7EC4\u76F4\u63A5 .map \u6E32\u67D3\uFF0C\u6CA1\u6709\u7A97\u53E3\u5316/\u5206\u9875\u3002",
      "An unbounded array is rendered with .map and no windowing/pagination.",
      "\u5217\u8868\u4E00\u957F\uFF0C\u9996\u6B21\u6E32\u67D3\u548C\u6EDA\u52A8\u90FD\u4F1A\u5361\uFF1B\u7528\u6237\u8D8A\u591A\u8D8A\u660E\u663E\u3002",
      "Long lists make first render and scrolling janky; it gets worse with more data.",
      "\u7A97\u53E3\u5316/\u5206\u9875/\u9650\u5236\u8FD4\u56DE\u6761\u6570\uFF1B\u5148\u6E32\u67D3\u9996\u5C4F\uFF0C\u6EDA\u52A8\u518D\u53D6\u3002",
      "Window, paginate or cap the result count; render the first screen and fetch on scroll."
    ),
    (ctx) => {
      const out = [];
      for (const file of CLIENT(ctx)) {
        if (file.lineCount < 300) continue;
        const re = /(?:items|list|rows|data)\.map\s*\(/g;
        let match;
        while ((match = re.exec(file.text)) !== null) {
          if (/slice\s*\(|virtual|window\.|pagination|分页/.test(file.text.slice(Math.max(0, match.index - 600), match.index + 600))) continue;
          out.push(occ(file, match.index, "\u65E0\u4E0A\u9650\u5217\u8868\u76F4\u63A5 .map"));
          if (out.length >= 3) return out;
        }
      }
      return out;
    }
  ),
  // ---------------------------------------------------------------------- AI
  check(
    "ai.tool-description",
    "ai",
    "core",
    "P1",
    "medium",
    "experience",
    copy(
      "\u5DE5\u5177\u63CF\u8FF0\u592A\u8584",
      "The tool description is too thin",
      "\u5DE5\u5177 description \u5C11\u4E8E 40 \u5B57\uFF0C\u6216\u53C2\u6570\u6CA1\u6709 description\u3002",
      "Tool description is under 40 characters, or parameters have no description.",
      "Agent \u53EA\u80FD\u9760\u63CF\u8FF0\u51B3\u5B9A\u4F55\u65F6\u8C03\u7528\u3001\u600E\u4E48\u4F20\u53C2\uFF1B\u63CF\u8FF0\u592A\u8584\u5C31\u4F1A\u8BEF\u7528\u6216\u4E0D\u6562\u7528\u3002",
      "The agent decides when and how to call from the description alone; thin descriptions cause misuse or avoidance.",
      "\u5199\u6E05\u7528\u9014\u3001\u8FB9\u754C\u3001\u8FD4\u56DE\u4EC0\u4E48\u3001\u4EC0\u4E48\u65F6\u5019\u4E0D\u8981\u7528\uFF1B\u6BCF\u4E2A\u53C2\u6570\u90FD\u5199 description\u3002",
      "State purpose, boundaries, return shape and when not to use it; describe every parameter."
    ),
    (ctx) => {
      const out = [];
      for (const file of HOST(ctx)) {
        for (const block of toolRegisterBlocks(file.text)) {
          const description = /description\s*:\s*(['"`])([\s\S]*?)\1/.exec(block.text);
          if (description && description[2].trim().length >= 40) continue;
          const params = /parameters\s*:\s*\{([\s\S]*)\}/.exec(block.text);
          if (description && description[2].trim().length >= 20 && params && /description\s*:/.test(params[1])) continue;
          out.push({
            path: file.path,
            line: file.text.slice(0, block.start).split("\n").length,
            snippet: block.text.slice(0, 300),
            detail: description ? `description \u53EA\u6709 ${description[2].trim().length} \u5B57` : "\u7F3A\u5C11 description"
          });
          if (out.length >= 3) return out;
        }
      }
      return out;
    }
  ),
  check(
    "ai.destructive-tool",
    "ai",
    "core",
    "P0",
    "medium",
    "experience",
    copy(
      "\u7834\u574F\u6027\u5DE5\u5177\u6CA1\u6709\u786E\u8BA4",
      "A destructive tool has no confirmation",
      "tool execute \u91CC\u5199/\u5220/\u6267\u884C\uFF0C\u4F46\u6CA1\u6709\u786E\u8BA4\u6216\u5BA1\u6279\u3002",
      "A tool execute writes/deletes/executes without confirmation or approval.",
      "Agent \u4E00\u6B21\u8BEF\u8C03\u7528\u5C31\u80FD\u5220\u6570\u636E\u6216\u8DD1\u547D\u4EE4\uFF1B\u4EBA\u7C7B\u6CA1\u6709\u673A\u4F1A\u5728\u526F\u4F5C\u7528\u524D\u8E29\u5239\u8F66\u3002",
      "One wrong agent call can delete data or run a command; humans get no chance to brake before the side effect.",
      "\u7834\u574F\u6027\u5DE5\u5177\u5148\u8D70 userQuestions/approval\uFF1B\u6216\u62C6\u6210\u201C\u9884\u89C8 + \u786E\u8BA4\u6267\u884C\u201D\u4E24\u6B65\u3002",
      "Route destructive tools through userQuestions/approval, or split into preview + confirmed execute."
    ),
    (ctx) => {
      const out = [];
      for (const file of HOST(ctx)) {
        for (const block of toolRegisterBlocks(file.text)) {
          const executeIndex = block.text.search(/execute\s*[:(]/);
          if (executeIndex === -1) continue;
          const body = block.text.slice(executeIndex);
          if (!/(writeFile|rm\s*\(|unlink|rename\s*\(|exec\s*\(|spawn\s*\()/.test(body)) continue;
          if (/userQuestions|ask\(|confirm|approval|preview/.test(block.text)) continue;
          out.push({
            path: file.path,
            line: file.text.slice(0, block.start).split("\n").length,
            snippet: block.text.slice(0, 400),
            detail: "\u5DE5\u5177\u4F1A\u5199/\u5220/\u6267\u884C\uFF0C\u4F46\u6CA1\u6709\u786E\u8BA4/\u5BA1\u6279"
          });
          if (out.length >= 3) return out;
        }
      }
      return out;
    }
  ),
  check(
    "ai.no-fallback",
    "ai",
    "core",
    "P2",
    "medium",
    "experience",
    copy(
      "\u6A21\u578B\u8C03\u7528\u6CA1\u6709\u5931\u8D25\u8DEF\u5F84",
      "A model call has no failure path",
      "\u8C03\u7528 llm/stream/prepareCall\uFF0C\u4F46\u6CA1\u6709 try/catch \u6216\u964D\u7EA7\u3002",
      "Calls llm/stream/prepareCall without try/catch or a degraded path.",
      "\u6A21\u578B\u4F1A\u8D85\u65F6\u3001\u9650\u6D41\u3001\u8FD4\u56DE\u7A7A\uFF1B\u6CA1\u6709\u964D\u7EA7\u65F6\u7528\u6237\u53EA\u770B\u5230\u8F6C\u5708\u6216\u5D29\u6E83\u3002",
      "Models time out, rate-limit and return empty; without a fallback users see a spinner or a crash.",
      "\u7ED9\u8D85\u65F6\u3001\u91CD\u8BD5\u3001\u53EF\u7406\u89E3\u7684\u9519\u8BEF\u548C\u79BB\u7EBF/\u4FDD\u5B88\u6A21\u5F0F\uFF1B\u628A\u5931\u8D25\u5199\u8FDB UI\u3002",
      "Add timeout, retry, an understandable error and an offline/conservative mode; surface the failure in the UI."
    ),
    (ctx) => {
      const out = [];
      for (const file of HOST(ctx)) {
        const index = file.text.search(/ctx\.llm|prepareCall\s*\(|\.stream\s*\(\s*\{|generate\s*\(/);
        if (index === -1) continue;
        const windowText = file.text.slice(Math.max(0, index - 700), Math.min(file.text.length, index + 1600));
        if (/try\s*\{|catch\s*\(|fallback|degraded/.test(windowText)) continue;
        out.push(occ(file, index, "\u6A21\u578B\u8C03\u7528\u9644\u8FD1\u6CA1\u6709 try/catch/\u964D\u7EA7"));
        if (out.length >= 3) break;
      }
      return out;
    }
  ),
  check(
    "ai.context-bloat",
    "ai",
    "core",
    "P2",
    "medium",
    "experience",
    copy(
      "\u4E0A\u4E0B\u6587\u88AB\u6574\u5757\u585E\u6EE1",
      "Context is stuffed with whole blocks",
      "systemPrompt/inject \u585E\u6574\u6587\u4EF6\u6216\u8D85\u957F\u6587\u672C\u3002",
      "systemPrompt/inject carries whole files or very long text.",
      "\u4E0A\u4E0B\u6587\u8D8A\u957F\uFF0C\u4E2D\u95F4\u4FE1\u606F\u8D8A\u5BB9\u6613\u88AB\u5FFD\u7565\uFF0C\u6210\u672C\u548C\u5EF6\u8FDF\u4E5F\u4E00\u8D77\u4E0A\u53BB\u3002",
      "Longer context makes middle information easier to miss and raises cost and latency.",
      "\u53EA\u7ED9\u9700\u8981\u7684\u7247\u6BB5\u548C\u7D22\u5F15\uFF1B\u957F\u5185\u5BB9\u6309\u9700\u8BFB\u53D6\uFF1B\u5DE5\u5177\u8F93\u51FA\u8BBE\u4E0A\u9650\u3002",
      "Send only the needed snippets and an index; read long content on demand; cap tool output."
    ),
    (ctx) => {
      const out = [];
      for (const file of HOST(ctx)) {
        if (!/systemPrompt\s*\.\s*section/.test(file.text)) continue;
        for (const block of callBlocks(file.text, "section")) {
          if (block.text.length <= 4e3) continue;
          out.push({ path: file.path, line: findBlockRange(file, block), snippet: block.text.slice(0, 300), detail: `systemPrompt section ${block.text.length} \u5B57\u7B26` });
          if (out.length >= 3) return out;
        }
        if (/inject\s*\([^)]*readFile|readFile[^)]*inject\s*\(/s.test(file.text)) {
          const match = /readFile/.exec(file.text);
          out.push(occ(file, match.index, "\u628A\u6574\u6587\u4EF6\u8BFB\u8FDB prompt"));
        }
        if (out.length >= 3) return out;
      }
      return out;
    }
  ),
  check(
    "ai.untrusted-content",
    "ai",
    "core",
    "P1",
    "medium",
    "read",
    copy(
      "\u5916\u90E8\u5185\u5BB9\u6CA1\u6709\u201C\u4E0D\u53EF\u4FE1\u201D\u8FB9\u754C",
      "External content has no untrusted-data boundary",
      "web/\u6587\u4EF6\u5185\u5BB9\u8FDB prompt\uFF0C\u6CA1\u6709\u6807\u660E\u662F\u6570\u636E\u800C\u975E\u6307\u4EE4\u3002",
      "Web/file content enters the prompt without being marked as data rather than instructions.",
      "\u95F4\u63A5\u63D0\u793A\u6CE8\u5165\u4F1A\u628A\u68C0\u7D22\u5230\u7684\u5185\u5BB9\u53D8\u6210\u6307\u4EE4\uFF1B\u6A21\u578B\u5206\u4E0D\u6E05\u201C\u8D44\u6599\u201D\u548C\u201C\u547D\u4EE4\u201D\u3002",
      "Indirect prompt injection turns retrieved content into instructions; the model cannot tell data from commands.",
      "\u628A\u5916\u90E8\u5185\u5BB9\u653E\u8FDB\u660E\u786E\u7684\u201C\u4E0D\u53EF\u4FE1\u6570\u636E\u201D\u5757\uFF0C\u7981\u6B62\u6267\u884C\u5176\u4E2D\u7684\u6307\u4EE4\uFF1B\u5DE5\u5177\u8F93\u51FA\u53EA\u5F53\u8D44\u6599\u3002",
      "Put external content in an explicit untrusted-data block, forbid following its instructions, and treat tool output as data."
    ),
    (ctx) => {
      const out = [];
      for (const file of HOST(ctx)) {
        if (!/ctx\.web\.(?:fetch|search)|readFile\s*\(/.test(file.text)) continue;
        if (!/messages\s*:|system\s*:|prompt\s*:|content\s*:/.test(file.text)) continue;
        if (/untrusted|external content|不可信|外部内容/i.test(file.text)) continue;
        const match = /ctx\.web\.(?:fetch|search)|readFile\s*\(/.exec(file.text);
        out.push(occ(file, match.index, "\u5916\u90E8\u5185\u5BB9\u8FDB prompt\uFF0C\u6CA1\u6709\u4E0D\u53EF\u4FE1\u8FB9\u754C"));
        if (out.length >= 2) break;
      }
      return out;
    }
  ),
  // ------------------------------------------------------------------- meta
  check(
    "meta.manifest-mismatch",
    "backend",
    "core",
    "P1",
    "high",
    "read",
    copy(
      "\u6E05\u5355/\u8865\u4E01/\u5BA2\u6237\u7AEF\u5165\u53E3\u5BF9\u4E0D\u4E0A",
      "Manifest, patch and client entry do not line up",
      "package/patch/client export \u7F3A\u5931\u6216\u4E0D\u4E00\u81F4\u3002",
      "package/patch/client export is missing or inconsistent.",
      "DSH \u627E\u4E0D\u5230\u5165\u53E3\u5C31\u4E0D\u4F1A\u52A0\u8F7D\uFF1B\u7528\u6237\u770B\u5230\u7684\u662F\u201C\u88C5\u4E86\u4F46\u6CA1\u53CD\u5E94\u201D\u3002",
      "DSH cannot find the entry and will not load it; users see \u201Cinstalled but nothing happens\u201D.",
      '\u8BA9 package.name\u3001cordis.patch.yml \u7684 name\u3001exports["./client"] \u4E92\u76F8\u5BF9\u9F50\u3002',
      'Align package.name, the patch name and exports["./client"].'
    ),
    (ctx) => issueOccurrences(ctx, "meta.manifest-mismatch")
  ),
  check(
    "meta.icon",
    "backend",
    "core",
    "P3",
    "high",
    "experience",
    copy(
      "\u6CA1\u6709\u53EF\u6E32\u67D3\u7684\u63D2\u4EF6\u56FE\u6807",
      "No renderable plugin icon",
      "package.json \u6CA1\u58F0\u660E icon\uFF0C\u6216\u58F0\u660E\u7684\u56FE\u6807\u7F3A\u5931/\u65E0\u6548\u3002",
      "No `icon` in package.json, or the declared icon is missing or invalid.",
      "\u5BBF\u4E3B\u628A icon \u5F53\u53EF\u9009\u5B57\u6BB5\uFF1A\u7F3A\u4E86\u7167\u6837\u52A0\u8F7D\uFF0C\u53EA\u662F Plugin Manager \u548C\u63D2\u4EF6\u5E02\u573A\u91CC\u8FD9\u4E00\u884C\u6CA1\u6709\u56FE\uFF0C\u53EA\u80FD\u9760\u6807\u9898\u8BA4\u4EBA\uFF1B\u58F0\u660E\u7684\u8DEF\u5F84\u5199\u9519\u5219\u8FDE\u8FD9\u4E2A\u56DE\u9000\u90FD\u6CA1\u6709\u3002",
      "The host treats `icon` as optional: the plugin still loads, but its row in Plugin Manager and the market has no image, so people recognise it by title alone \u2014 and a wrong declared path silently yields nothing.",
      '\u653E\u4E00\u4E2A\u5C0F icon.svg\uFF0C\u5E76\u5728 package.json \u91CC\u540C\u65F6\u5199 icon \u4E0E exports["./icon"]\uFF1B\u522B\u628A\u5927\u56FE\u585E\u6210 base64\u3002',
      'Ship a small icon.svg and declare both `icon` and `exports["./icon"]` in package.json; do not inline a large base64 image.'
    ),
    (ctx) => issueOccurrences(ctx, "meta.icon")
  ),
  check(
    "meta.locale-mismatch",
    "backend",
    "core",
    "P2",
    "high",
    "read",
    copy(
      "\u4E2D\u82F1\u5B57\u5178\u4E0D\u914D\u5BF9",
      "The zh/en dictionaries are not paired",
      "zh/en key \u96C6\u4E0D\u540C\uFF0C\u6216\u7F3A meta.title/description\u3002",
      "zh/en key sets differ, or meta.title/description is missing.",
      "\u5207\u8BED\u8A00\u65F6\u4F1A\u51FA\u73B0 key \u672C\u8EAB\u6216\u7A7A\u767D\uFF1BPlugin Manager \u4E5F\u62FF\u4E0D\u5230\u6807\u9898\u3002",
      "Switching language can show raw keys or blanks; Plugin Manager cannot read the title either.",
      "\u4E24\u79CD\u8BED\u8A00\u7684 key \u4E25\u683C\u914D\u5BF9\uFF1Bmeta.title/description \u90FD\u8981\u6709\u3002",
      "Keep both locales key-for-key identical, including meta.title/description."
    ),
    (ctx) => issueOccurrences(ctx, "meta.locale-mismatch")
  )
];
function toolRegisterBlocks(text) {
  const blocks = [];
  const re = /\.register\s*\(/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    const paren = text.indexOf("(", match.index);
    const block = balancedBlock(text, paren, "(", ")");
    if (!block) continue;
    if (!/\bname\s*:/.test(block.text)) continue;
    if (!/\bdescription\s*:/.test(block.text)) continue;
    blocks.push(block);
    re.lastIndex = block.end + 1;
  }
  return blocks;
}
function checksFor({ depth = "standard", focus = [] } = {}) {
  const wantedDimensions = focus.length ? new Set(focus) : null;
  return CHECKS.filter((item) => {
    if (depth === "quick" && !(item.tier === "core" && (item.severity === "P0" || item.severity === "P1"))) return false;
    if (depth === "standard" && item.tier !== "core") return false;
    if (wantedDimensions && !wantedDimensions.has(item.dimension)) return false;
    return true;
  });
}
var CHECK_BY_ID = new Map(CHECKS.map((item) => [item.id, item]));

// src/compose.ts
var LABELS = {
  zh: {
    title: "\u7231 \xB7 \u5BA1\u67E5\u62A5\u544A",
    date: "\u5BA1\u67E5\u65E5\u671F",
    depth: "\u6DF1\u5EA6",
    target: "\u76EE\u6807",
    readOnly: "\u53EA\u8BFB\u5BA1\u67E5\uFF1A\u6CA1\u6709\u6267\u884C\u76EE\u6807\u4EE3\u7801\uFF0C\u6CA1\u6709\u8054\u7F51\u3002",
    strengths: "\u6211\u8BA4\u771F\u770B\u8FC7\u7684",
    score: "\u603B\u5206",
    verdict: "\u4E00\u53E5\u8BDD",
    dimensions: "\u516D\u4E2A\u7EF4\u5EA6",
    topFixes: "\u5982\u679C\u53EA\u6539\u4E09\u4EF6\u4E8B",
    findings: "\u6309\u7EF4\u5EA6\u770B",
    budget: "\u6027\u80FD\u9884\u7B97",
    manual: "\u9700\u8981\u4F60\u4EB2\u773C\u770B\u4E00\u773C",
    coverage: "\u8FD9\u6B21\u770B\u5230\u54EA\u91CC\u3001\u6CA1\u770B\u5230\u54EA\u91CC",
    citations: "\u5F15\u7528\u8BF4\u660E",
    questions: "\u503C\u5F97\u518D\u95EE\u81EA\u5DF1\u7684\u56DB\u4E2A\u95EE\u9898",
    noFindings: "\u8FD9\u4E00\u7EF4\u5EA6\u6CA1\u6709\u627E\u5230\u786C\u4F24\u3002\u4E0D\u7B49\u4E8E\u5B8C\u7F8E\uFF0C\u53EA\u8BF4\u660E\u9759\u6001\u89C4\u5219\u6CA1\u6293\u5230\u3002",
    noStrengths: "\u8FD9\u7248\u8FD8\u6CA1\u6709\u7ED3\u6784\u6027\u7684\u4EAE\u70B9\uFF1B\u4F46\u4F60\u628A\u5B83\u4EA4\u51FA\u6765\u88AB\u770B\uFF0C\u8FD9\u4E00\u6B65\u672C\u8EAB\u503C\u5F97\u80AF\u5B9A\u3002",
    confidence: "\u7F6E\u4FE1\u5EA6",
    occurrence: "\u5904",
    basisRead: "\u5DF2\u8BFB\u4F9D\u636E",
    basisExperience: "\u5DE5\u7A0B\u5224\u65AD\uFF0C\u65E0\u5916\u90E8\u5F15\u7528",
    reviewedFiles: "\u5BA1\u4E86",
    files: "\u4E2A\u6587\u4EF6",
    lines: "\u884C",
    skipped: "\u8DF3\u8FC7",
    partial: "\u7ED3\u679C\u4E0D\u5B8C\u6574",
    budgetWithin: "\u5728\u9884\u7B97\u5185",
    budgetOver: "\u8D85\u9884\u7B97",
    notRun: "\u9759\u6001\u5BA1\u67E5\u6CA1\u6709\u505A\uFF1A\u8FD0\u884C\u65F6\u6027\u80FD\u3001Lighthouse\u3001\u771F\u5B9E\u7F51\u7EDC\u8BA1\u65F6\u3001\u5185\u5B58\u3002",
    footer: "\u628A\u523A\u7559\u5728\u4EE3\u7801\u4E0A\uFF0C\u4E0D\u7559\u5728\u4EBA\u8EAB\u4E0A\u3002",
    severity: { P0: "\u4F1A\u4F24\u4EBA", P1: "\u8BE5\u4FEE", P2: "\u5EFA\u8BAE", P3: "\u987A\u624B" },
    dimensionsLabel: { backend: "\u540E\u7AEF", frontend: "\u524D\u7AEF", ui: "UI", ux: "UX", performance: "\u6027\u80FD", ai: "AI \u65F6\u4EE3" },
    tier: { core: "\u6807\u51C6", deep: "\u6DF1\u5EA6" },
    quote: "\u6458\u5F55",
    locator: "\u5B9A\u4F4D",
    scoreLine: (n) => `${n} / 100`,
    questionsList: [
      "\u5F31\u7F51\u3001\u6A21\u578B\u8D85\u65F6\u6216\u9650\u6D41\u65F6\uFF0C\u8FD9\u7248\u4F1A\u600E\u4E48\u8868\u73B0\uFF1F\u7528\u6237\u770B\u5F97\u5230\u201C\u6B63\u5728\u91CD\u8BD5\u201D\u8FD8\u662F\u53EA\u770B\u5230\u8F6C\u5708\uFF1F",
      "\u7528\u6237\u7B2C\u4E00\u6B21\u6253\u5F00\u65F6\uFF0C\u77E5\u9053\u4E0B\u4E00\u6B65\u8BE5\u70B9\u54EA\u91CC\u5417\uFF1F\u7A7A\u72B6\u6001\u6709\u6CA1\u6709\u544A\u8BC9\u4ED6\uFF1F",
      "\u5220\u9664\u3001\u8986\u76D6\u3001\u5378\u8F7D\u8FD9\u7C7B\u64CD\u4F5C\uFF0C\u8BEF\u70B9\u4E4B\u540E\u8FD8\u80FD\u56DE\u6765\u5417\uFF1F\u64A4\u9500\u6BD4\u786E\u8BA4\u66F4\u4E0D\u6253\u6270\u3002",
      "\u54EA\u4E9B\u6570\u636E\u4F1A\u79BB\u5F00\u8FD9\u53F0\u673A\u5668\uFF1F\u6A21\u578B\u3001\u65E5\u5FD7\u3001\u5D29\u6E83\u4E0A\u62A5\u5206\u522B\u62FF\u5230\u4E86\u4EC0\u4E48\uFF1F"
    ]
  },
  en: {
    title: "Love \xB7 Review",
    date: "Reviewed",
    depth: "Depth",
    target: "Target",
    readOnly: "Read-only: the target code was not executed and nothing was fetched.",
    strengths: "What I genuinely liked",
    score: "Score",
    verdict: "In one line",
    dimensions: "Six dimensions",
    topFixes: "If you only fix three things",
    findings: "By dimension",
    budget: "Performance budgets",
    manual: "Please look at these yourself",
    coverage: "What I saw, and what I did not",
    citations: "About the references",
    questions: "Four questions worth asking yourself",
    noFindings: "No hard findings in this dimension. That is not perfection; it only means the static rules missed it.",
    noStrengths: "No structural highlight yet. But handing it over to be looked at is itself worth something.",
    confidence: "Confidence",
    occurrence: "occurrence(s)",
    basisRead: "Read source",
    basisExperience: "Engineering judgment, no external citation",
    reviewedFiles: "Reviewed",
    files: "files",
    lines: "lines",
    skipped: "Skipped",
    partial: "Partial result",
    budgetWithin: "Within budget",
    budgetOver: "Over budget",
    notRun: "Static review does not include runtime performance, Lighthouse, real network timing or memory.",
    footer: "Keep the thorn in the code, not in the person.",
    severity: { P0: "blocks users", P1: "should fix", P2: "suggested", P3: "nit" },
    dimensionsLabel: { backend: "Backend", frontend: "Frontend", ui: "UI", ux: "UX", performance: "Performance", ai: "AI era" },
    tier: { core: "core", deep: "deep" },
    quote: "Quote",
    locator: "Locator",
    scoreLine: (n) => `${n} / 100`,
    questionsList: [
      "What happens on a slow network, a model timeout or a rate limit? Does the user see a retry, or just a spinner?",
      "On first open, does the user know what to click next? Does the empty state tell them?",
      "If a delete, overwrite or uninstall is mis-clicked, can they come back? Undo is kinder than a confirmation.",
      "Which data leaves this machine? What do the model, logs and crash reporting each receive?"
    ]
  }
};
function localize(value, lang) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value[lang] !== void 0 ? value[lang] : value.zh !== void 0 ? value.zh : "";
  }
  return value == null ? "" : String(value);
}
function citationView(id, lang) {
  const citation = CITATIONS[id];
  if (!citation || citation.status !== "read") return null;
  return {
    id: citation.id,
    kind: citation.kind,
    title: citation.title,
    url: citation.url || "",
    locator: citation.locator,
    quote: citation.quote,
    status: citation.status
  };
}
function localizeFindings(rawFindings, lang) {
  return rawFindings.map((raw) => {
    const check2 = raw.check || CHECK_BY_ID.get(raw.checkId);
    if (!check2) return null;
    const severity = raw.severity || check2.severity;
    const citations = check2.citations.map((id) => citationView(id, lang)).filter(Boolean);
    return {
      id: raw.id,
      checkId: check2.id,
      dimension: check2.dimension,
      tier: check2.tier,
      severity,
      confidence: raw.confidence || check2.confidence,
      basis: citations.length ? "read" : "experience",
      title: localize(check2.title, lang),
      summary: localize(check2.summary, lang),
      why: localize(check2.why, lang),
      fix: localize(check2.fix, lang),
      occurrences: raw.occurrences,
      evidence: raw.occurrences[0] || { path: "", line: 0, snippet: "" },
      citations
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
    { id: "clientBytes", label: lang === "zh" ? "\u5BA2\u6237\u7AEF\u5305\u4F53" : "Client bundle", value: `${(values.clientBytes / 1024).toFixed(0)}KB`, limit: `\u2264 ${(limits.clientBytesWarn / 1024).toFixed(0)}KB`, over: values.clientBytes > limits.clientBytesWarn },
    { id: "inlineAssetBytes", label: lang === "zh" ? "\u5185\u8054\u8D44\u6E90" : "Inline assets", value: `${(values.inlineAssetBytes / 1024).toFixed(0)}KB`, limit: `\u2264 ${(limits.inlineAssetBytes / 1024).toFixed(0)}KB`, over: values.inlineAssetBytes > limits.inlineAssetBytes },
    { id: "syncIoCalls", label: lang === "zh" ? "\u540C\u6B65 IO" : "Sync IO", value: String(values.syncIoCalls), limit: "0", over: values.syncIoCalls > 0 },
    { id: "pollingIntervals", label: lang === "zh" ? "\u8F6E\u8BE2\u95F4\u9694" : "Polling", value: values.pollingIntervals.length ? values.pollingIntervals.map((ms) => `${ms}ms`).join(", ") : "\u2014", limit: `\u2265 ${limits.pollingMinMs}ms`, over: values.pollingIntervals.some((ms) => ms < limits.pollingMinMs) },
    { id: "fetchWithoutAbort", label: lang === "zh" ? "\u672A\u53D6\u6D88 fetch" : "Fetch without abort", value: String(values.fetchWithoutAbort), limit: "0", over: values.fetchWithoutAbort > 0 },
    { id: "serialAwaitLoops", label: lang === "zh" ? "\u4E32\u884C await \u5FAA\u73AF" : "Serial await loops", value: String(values.serialAwaitLoops), limit: "0", over: values.serialAwaitLoops > 0 },
    { id: "layoutAnimationRules", label: lang === "zh" ? "\u5E03\u5C40\u5C5E\u6027\u52A8\u753B" : "Layout animation rules", value: String(values.layoutAnimationRules), limit: "0", over: values.layoutAnimationRules > 0 }
  ];
  return rows;
}
function composeMarkdown(review) {
  const lang = review.lang === "en" ? "en" : "zh";
  const L = LABELS[lang];
  const lines = [];
  lines.push(`# ${L.title} \xB7 ${review.target.title || review.target.name}${review.target.version ? ` v${review.target.version}` : ""}`);
  lines.push("");
  lines.push(`> ${L.date}: ${review.createdAt} \uFF5C ${L.depth}: ${L.tier[review.depth] || review.depth} \uFF5C ${L.target}: \`${redactPath(review.target.path, review.homeDir)}\``);
  lines.push(`> ${L.readOnly}`);
  lines.push("");
  lines.push(`## ${L.score}: ${L.scoreLine(review.score.total)}`);
  lines.push("");
  lines.push(`**${L.verdict}**: ${review.score.verdict.text}`);
  lines.push("");
  lines.push("| " + (lang === "zh" ? "\u7EF4\u5EA6" : "Dimension") + " | " + (lang === "zh" ? "\u5206\u6570" : "Score") + " |");
  lines.push("|---|---|");
  for (const dim of DIMENSIONS) {
    if (review.score.dimensions[dim.id] === void 0) continue;
    lines.push(`| ${dimensionLabel(dim.id, lang)} | ${review.score.dimensions[dim.id]} |`);
  }
  lines.push("");
  lines.push(`## ${L.strengths}`);
  lines.push("");
  if (review.strengths.length === 0) lines.push(L.noStrengths);
  for (const strength of review.strengths) {
    lines.push(`- ${strength.title}${strength.evidence ? `\uFF08\`${strength.evidence}\`\uFF09` : ""}`);
  }
  lines.push("");
  lines.push(`## ${L.topFixes}`);
  lines.push("");
  const byId = new Map(review.findings.map((f) => [f.id, f]));
  const top = review.topFixes.map((id) => byId.get(id)).filter(Boolean);
  if (top.length === 0) lines.push(lang === "zh" ? "\u6CA1\u6709\u9700\u8981\u5148\u4FEE\u7684\u786C\u4F24\u3002" : "Nothing needs a first fix.");
  top.forEach((finding, index) => {
    lines.push(`### ${index + 1}. ${finding.title} \xB7 ${severityLabel(finding.severity, lang)}`);
    lines.push("");
    lines.push(`\`${finding.evidence.path}:${finding.evidence.line}\`${finding.occurrences.length > 1 ? ` \xB7 ${finding.occurrences.length} ${L.occurrence}` : ""}`);
    lines.push("");
    if (finding.evidence.snippet) {
      const fence = fenceFor(finding.evidence.snippet);
      lines.push(`${fence}${finding.evidence.path.endsWith(".css") ? "css" : "js"}`);
      lines.push(truncate(finding.evidence.snippet, 1600));
      lines.push(fence);
      lines.push("");
    }
    lines.push(`**${lang === "zh" ? "\u4E3A\u4EC0\u4E48" : "Why"}**: ${finding.why}`);
    lines.push("");
    lines.push(`**${lang === "zh" ? "\u600E\u4E48\u6539" : "Fix"}**: ${finding.fix}`);
    lines.push("");
    lines.push(`**${finding.basis === "read" ? L.basisRead : L.basisExperience}**`);
    for (const citation of finding.citations) {
      lines.push(`- [${citation.title}](${citation.url || "#"}) \xB7 ${citation.locator}`);
      if (citation.quote) lines.push(`  > ${citation.quote}`);
    }
    lines.push("");
  });
  lines.push(`## ${L.findings}`);
  for (const dim of DIMENSIONS) {
    const items = review.findings.filter((f) => f.dimension === dim.id);
    if (items.length === 0) {
      if (review.score.dimensions[dim.id] !== void 0) {
        lines.push(`### ${dimensionLabel(dim.id, lang)} \xB7 ${review.score.dimensions[dim.id]}`);
        lines.push("");
        lines.push(L.noFindings);
        lines.push("");
      }
      continue;
    }
    lines.push(`### ${dimensionLabel(dim.id, lang)} \xB7 ${review.score.dimensions[dim.id]}`);
    lines.push("");
    for (const finding of items) {
      lines.push(`#### [${finding.severity}] ${finding.title}`);
      lines.push("");
      lines.push(`\`${finding.evidence.path}:${finding.evidence.line}\` \xB7 ${L.confidence}: ${finding.confidence}${finding.tier === "deep" ? ` \xB7 ${L.tier.deep}` : ""}`);
      lines.push("");
      if (finding.evidence.snippet) {
        const fence = fenceFor(finding.evidence.snippet);
        lines.push(`${fence}`);
        lines.push(truncate(finding.evidence.snippet, 1200));
        lines.push(fence);
        lines.push("");
      }
      lines.push(`- **${lang === "zh" ? "\u4E3A\u4EC0\u4E48" : "Why"}**: ${finding.why}`);
      lines.push(`- **${lang === "zh" ? "\u600E\u4E48\u6539" : "Fix"}**: ${finding.fix}`);
      lines.push(`- **${finding.basis === "read" ? L.basisRead : L.basisExperience}**`);
      for (const citation of finding.citations) {
        lines.push(`  - [${citation.title}](${citation.url || "#"}) \xB7 ${citation.locator}`);
      }
      if (finding.occurrences.length > 1) {
        lines.push(`- ${lang === "zh" ? "\u8FD8\u6709" : "Also"} ${finding.occurrences.length - 1} ${L.occurrence}: ${finding.occurrences.slice(1, 6).map((o) => `\`${o.path}:${o.line}\``).join(", ")}`);
      }
      lines.push("");
    }
  }
  lines.push(`## ${L.budget}`);
  lines.push("");
  lines.push("| " + (lang === "zh" ? "\u9879" : "Item") + " | " + (lang === "zh" ? "\u5B9E\u6D4B" : "Measured") + " | " + (lang === "zh" ? "\u9884\u7B97" : "Budget") + " | " + (lang === "zh" ? "\u72B6\u6001" : "Status") + " |");
  lines.push("|---|---|---|---|");
  for (const row of budgetRows(review.budget, lang)) {
    lines.push(`| ${row.label} | ${row.value} | ${row.limit} | ${row.over ? L.budgetOver : L.budgetWithin} |`);
  }
  lines.push("");
  lines.push(`> ${L.notRun}`);
  lines.push("");
  lines.push(`## ${L.manual}`);
  lines.push("");
  for (const item of review.manualChecks) {
    lines.push(`- ${item.question}`);
  }
  lines.push("");
  lines.push(`## ${L.questions}`);
  lines.push("");
  L.questionsList.forEach((question) => lines.push(`- ${question}`));
  lines.push("");
  lines.push(`## ${L.coverage}`);
  lines.push("");
  lines.push(`- ${L.reviewedFiles} ${review.coverage.reviewedFiles} ${L.files} / ${review.coverage.totalLines} ${L.lines}${review.coverage.partial ? ` \xB7 \u26A0 ${L.partial}` : ""}`);
  if (review.coverage.skipped.length) {
    lines.push(`- ${L.skipped}: ${review.coverage.skipped.slice(0, 8).map((s) => `\`${s.path}\` (${s.reason})`).join(", ")}`);
  }
  lines.push(`- ${L.notRun}`);
  lines.push("");
  lines.push(`## ${L.citations}`);
  lines.push("");
  lines.push(lang === "zh" ? "\u53EA\u6709 `status: read` \u7684\u6BB5\u843D\u4F1A\u6302\u5728\u53D1\u73B0\u4E0A\uFF0C\u5E76\u9644\u9010\u5B57\u6458\u5F55\u4E0E\u5B9A\u4F4D\uFF1B\u53EA\u6838\u9A8C\u4E86\u4E66\u76EE\u7684\u6765\u6E90\u4E0D\u4F1A\u51FA\u73B0\u5728\u53D1\u73B0\u91CC\uFF1B\u6027\u80FD\u9608\u503C\u662F\u4EA7\u54C1\u9884\u7B97\uFF0C\u4E0D\u662F\u8BBA\u6587\u7ED3\u8BBA\u3002" : "Only `status: read` passages are attached to findings, with a verbatim quote and locator. Bibliographic-only sources never appear as evidence. Performance thresholds are product budgets, not research claims.");
  lines.push("");
  lines.push(`> ${L.footer}`);
  return lines.join("\n");
}
function composeReview(scan, lang = "zh") {
  const L = LABELS[lang] || LABELS.zh;
  const findings = localizeFindings(scan.rawFindings, lang);
  const byId = new Map(findings.map((f) => [f.id, f]));
  const dimensions = {};
  for (const dim of DIMENSIONS) {
    if (scan.score.dimensions[dim.id] !== void 0) dimensions[dim.id] = scan.score.dimensions[dim.id];
  }
  const review = {
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
      verdict: { key: scan.score.verdict.key, text: localize(scan.score.verdict, lang) }
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
      notRun: scan.coverage.notRun
    },
    persisted: scan.persisted !== false
  };
  review.markdown = composeMarkdown(review);
  return review;
}

// src/score.ts
var DIMENSION_IMPACT = {
  backend: 5,
  frontend: 4,
  ui: 4.5,
  ux: 4.5,
  performance: 4,
  ai: 4
};
function scoreFindings(findings, includedDimensions) {
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
    weights: Object.fromEntries(dimensionsToScore.map((id) => [id, (DIMENSION_WEIGHT_BY_ID[id] || 0) / totalWeight]))
  };
}
function topFixes(findings, limit = 3) {
  const sorted = findings.slice().sort((a, b) => {
    const sev = SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
    if (sev !== 0) return sev;
    const impact = (DIMENSION_IMPACT[b.dimension] || 0) - (DIMENSION_IMPACT[a.dimension] || 0);
    if (impact !== 0) return impact;
    return a.id.localeCompare(b.id);
  });
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const finding of sorted) {
    if (seen.has(finding.checkId)) continue;
    seen.add(finding.checkId);
    out.push(finding.id);
    if (out.length >= limit) break;
  }
  return out;
}
function buildStrengths(inventory, analysis, findings, budget) {
  const strengths = [];
  const host = inventory.files.filter((f) => f.role === "host" && !f.generated);
  const client = inventory.files.filter((f) => f.role === "client" && !f.generated);
  const styles = inventory.files.filter((f) => f.role === "style");
  if (host.some((f) => /ctx\.effect|ctx\.on/.test(f.text))) {
    strengths.push({
      id: "owned-lifecycle",
      zh: "\u526F\u4F5C\u7528\u6709\u4E3B\u4EBA\uFF1A\u8D44\u6E90\u6CE8\u518C\u6536\u5728 ctx.effect/ctx.on \u91CC\uFF0C\u5378\u8F7D\u65F6\u80FD\u6536\u56DE\u6765\u3002",
      en: "Side effects have an owner: resources are registered inside ctx.effect/ctx.on and can be cleaned up.",
      evidence: host.find((f) => /ctx\.effect|ctx\.on/.test(f.text)).path
    });
  }
  if (client.some((f) => /return\s*(?:\(\)|function)[\s\S]{0,120}(?:abort|clear|remove|unsubscribe)/.test(f.text))) {
    strengths.push({
      id: "cleanup",
      zh: "\u5BA2\u6237\u7AEF\u526F\u4F5C\u7528\u5199\u4E86 cleanup\uFF0C\u7EC4\u4EF6\u8D70\u4E86\u4F1A\u6536\u5C3E\u3002",
      en: "The client effect returns a cleanup, so unmounting leaves no tail.",
      evidence: client.find((f) => /return\s*(?:\(\)|function)/.test(f.text)).path
    });
  }
  const zh = analysis.localeByLang && analysis.localeByLang.get("zh");
  const en = analysis.localeByLang && analysis.localeByLang.get("en");
  if (zh && en) {
    strengths.push({
      id: "paired-locales",
      zh: "\u4E2D\u82F1\u5B57\u5178\u90FD\u5728\uFF0CPlugin Manager \u80FD\u62FF\u5230\u6807\u9898\u548C\u63CF\u8FF0\u3002",
      en: "Both zh/en dictionaries exist; Plugin Manager can read the title and description.",
      evidence: zh.file.path
    });
  }
  if (analysis.icon && analysis.icon.valid) {
    strengths.push({
      id: "icon",
      zh: "\u6709\u53EF\u6E32\u67D3\u7684\u63D2\u4EF6\u56FE\u6807\uFF0C\u4E0D\u662F\u9ED8\u8BA4\u5360\u4F4D\u56FE\u3002",
      en: "A renderable plugin icon is present, not the default placeholder.",
      evidence: analysis.icon.path
    });
  }
  if ([...styles, ...client].some((f) => /--dsw-alias-/.test(f.text))) {
    strengths.push({
      id: "theme-tokens",
      zh: "\u7528\u4E86\u5BBF\u4E3B theme token\uFF0C\u4EAE\u6697\u5207\u6362\u65F6\u5927\u8272\u5757\u4F1A\u8DDF\u7740\u8D70\u3002",
      en: "Host theme tokens are used, so large surfaces follow light/dark switching.",
      evidence: [...styles, ...client].find((f) => /--dsw-alias-/.test(f.text)).path
    });
  }
  if (inventory.files.some((f) => f.role === "test") || inventory.files.some((f) => /\.github\/workflows\//.test(f.path))) {
    strengths.push({
      id: "tests",
      zh: "\u5E26\u4E86\u6D4B\u8BD5\u6216 CI\uFF0C\u6539\u5B8C\u6709\u4E1C\u897F\u80FD\u66FF\u4F60\u5B88\u95E8\u3002",
      en: "Tests or CI exist, so a future change has a gate.",
      evidence: inventory.files.find((f) => f.role === "test")?.path || ".github/workflows"
    });
  }
  if (inventory.readmeFile && /(?:^|\n)##\s*(?:安装|Install)/i.test(inventory.readmeFile.text)) {
    strengths.push({
      id: "readme-install",
      zh: "README \u6709\u5B89\u88C5\u6BB5\uFF0C\u7B2C\u4E00\u6B21\u7528\u7684\u4EBA\u77E5\u9053\u4ECE\u54EA\u5F00\u59CB\u3002",
      en: "The README has an install section; a first-time user knows where to start.",
      evidence: inventory.readmeFile.path
    });
  }
  if (client.some((f) => /confirm\s*\(|undo|撤销|确认/.test(f.text)) && !findings.some((f) => f.checkId === "ux.destructive-no-confirm")) {
    strengths.push({
      id: "confirm",
      zh: "\u7834\u574F\u6027\u64CD\u4F5C\u6709\u786E\u8BA4\u6216\u64A4\u9500\uFF0C\u7528\u6237\u4E0D\u4F1A\u88AB\u4E00\u6B21\u8BEF\u70B9\u9001\u8D70\u3002",
      en: "Destructive actions have confirmation or undo, so one mis-click does not end the story.",
      evidence: client.find((f) => /confirm\s*\(|undo|撤销|确认/.test(f.text)).path
    });
  }
  const withinBudget = budget && budget.values && budget.values.clientBytes <= budget.budgets.clientBytesWarn && budget.values.inlineAssetBytes <= budget.budgets.inlineAssetBytes && budget.values.syncIoCalls === 0 && budget.values.fetchWithoutAbort === 0;
  if (withinBudget) {
    strengths.push({
      id: "budget",
      zh: "\u6027\u80FD\u9884\u7B97\u6CA1\u8D85\u7EBF\uFF1A\u5305\u4F53\u3001\u5185\u8054\u8D44\u6E90\u3001\u540C\u6B65 IO \u548C fetch \u53D6\u6D88\u90FD\u8FD8\u5728\u8303\u56F4\u5185\u3002",
      en: "Performance budgets are respected: bundle, inline assets, sync IO and fetch cancellation are within range.",
      evidence: budget.details.clientArtifact ? budget.details.clientArtifact.path : "budget"
    });
  }
  if (!findings.some((f) => f.severity === "P0")) {
    strengths.push({
      id: "no-p0",
      zh: "\u6CA1\u6709 P0\uFF1A\u8FD9\u7248\u6CA1\u6709\u201C\u4F1A\u76F4\u63A5\u4F24\u5230\u7528\u6237\u6216\u6570\u636E\u201D\u7684\u786C\u4F24\u3002",
      en: "No P0: nothing here directly hurts users or data.",
      evidence: "score"
    });
  }
  return strengths.slice(0, 6);
}
function manualChecks(inventory, findings) {
  const items = [
    {
      id: "ui.contrast-token-bg",
      zh: "token \u80CC\u666F\u4E0A\u7684\u6587\u5B57\u5BF9\u6BD4\u5EA6\uFF1A\u9759\u6001\u53EA\u80FD\u7B97\u5B57\u9762\u91CF\uFF0Ctoken \u7684\u5B9E\u9645\u503C\u8981\u770B\u6E32\u67D3\u3002",
      en: "Contrast on token backgrounds: static analysis only computes literals; the rendered token value needs a human look.",
      evidence: inventory.files.find((f) => f.role === "style")?.path || "client"
    },
    {
      id: "ui.focus-trap",
      zh: "\u7126\u70B9\u9677\u9631\uFF1A\u6253\u5F00\u5F39\u5C42\u540E Tab \u662F\u5426\u88AB\u56F0\u5728\u5F39\u5C42\u91CC\uFF0C\u5173\u95ED\u540E\u662F\u5426\u56DE\u5230\u89E6\u53D1\u6309\u94AE\u3002",
      en: "Focus trap: does Tab stay inside the dialog, and does focus return to the trigger after close?",
      evidence: inventory.files.find((f) => f.role === "client")?.path || "client"
    },
    {
      id: "ui.hierarchy",
      zh: "\u89C6\u89C9\u5C42\u7EA7\uFF1A\u6807\u9898\u3001\u6B63\u6587\u3001\u6B21\u8981\u4FE1\u606F\u5728\u771F\u5B9E\u6570\u636E\u91CF\u4E0B\u662F\u5426\u8FD8\u5206\u5F97\u6E05\u3002",
      en: "Visual hierarchy: with real data, are title, body and secondary information still distinguishable?",
      evidence: inventory.files.find((f) => f.role === "style")?.path || "client"
    },
    {
      id: "ui.motion-comfort",
      zh: "\u52A8\u6548\u8212\u9002\u5EA6\uFF1A\u8FDE\u7EED\u64CD\u4F5C 10 \u79D2\uFF0C\u52A8\u6548\u662F\u5E2E\u52A9\u5B9A\u4F4D\u8FD8\u662F\u8BA9\u4EBA\u6655\u3002",
      en: "Motion comfort: after ten seconds of use, does motion help orientation or cause discomfort?",
      evidence: "manual"
    },
    {
      id: "ui.narrow",
      zh: "\u771F\u5B9E\u7A84\u5C4F\uFF1A\u62D6\u5230 320px\uFF0C\u957F\u63D2\u4EF6\u540D\u3001\u957F\u8DEF\u5F84\u3001\u957F\u9519\u8BEF\u6587\u6848\u4F1A\u4E0D\u4F1A\u628A\u5E03\u5C40\u6491\u574F\u3002",
      en: "Real narrow width: at 320px, do long plugin names, paths and errors break the layout?",
      evidence: "manual"
    },
    {
      id: "perf.runtime",
      zh: "\u8FD0\u884C\u65F6\u6027\u80FD\uFF1A\u9759\u6001\u6CA1\u6709 Lighthouse/\u5185\u5B58/\u771F\u5B9E\u7F51\u7EDC\u8BA1\u65F6\uFF1B\u9996\u5C4F\u548C\u6EDA\u52A8\u8981\u5728\u771F\u5B9E\u73AF\u5883\u770B\u3002",
      en: "Runtime performance: static analysis has no Lighthouse, memory or real network timing; first paint and scroll need a real environment.",
      evidence: "manual"
    }
  ];
  if (findings.some((f) => f.checkId === "ui.contrast-literal")) {
    return items.filter((item) => item.id !== "ui.contrast-token-bg" || true);
  }
  return items;
}

// src/store.ts
import { mkdir, readFile as readFile3, readdir as readdir2, rename, rm, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { join as join3 } from "node:path";
function reviewHome() {
  return join3(dshHome(), "love");
}
function reviewsDir() {
  return join3(reviewHome(), "reviews");
}
function slug(value) {
  const text = String(value || "plugin").toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return (text || "plugin").slice(0, 48);
}
function newReviewId(target) {
  const now = /* @__PURE__ */ new Date();
  const stamp = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
    "-",
    String(now.getUTCHours()).padStart(2, "0"),
    String(now.getUTCMinutes()).padStart(2, "0"),
    String(now.getUTCSeconds()).padStart(2, "0")
  ].join("");
  const suffix = randomBytes(3).toString("hex");
  return `${stamp}-${slug(target.name)}-${suffix}`;
}
async function saveReview(scan) {
  const dir = reviewsDir();
  await mkdir(dir, { recursive: true });
  const file = join3(dir, `${scan.id}.json`);
  const temp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temp, JSON.stringify(scan, null, 2), "utf8");
  await rename(temp, file);
  await prune(dir).catch((error) => {
    console.warn("love: prune failed:", error && error.message ? error.message : error);
  });
  return file;
}
async function prune(dir) {
  let entries = [];
  try {
    entries = await readdir2(dir, { withFileTypes: true });
  } catch {
    return;
  }
  const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".json")).map((entry) => entry.name);
  if (files.length <= DEFAULT_LIMITS.historyLimit) return;
  const withStats = await Promise.all(files.map(async (name2) => {
    try {
      const file = join3(dir, name2);
      const text = await readFile3(file, "utf8");
      const parsed = JSON.parse(text);
      return { name: name2, file, createdAt: parsed.createdAt || "" };
    } catch {
      return { name: name2, file: join3(dir, name2), createdAt: "" };
    }
  }));
  withStats.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  const remove = withStats.slice(0, Math.max(0, withStats.length - DEFAULT_LIMITS.historyLimit));
  await Promise.all(remove.map((item) => rm(item.file, { force: true }).catch((error) => {
    console.warn("love: prune file failed:", item.file, error && error.message ? error.message : error);
  })));
}
function validateReviewId(id) {
  return typeof id === "string" && /^[A-Za-z0-9._-]{6,120}$/.test(id);
}
async function loadRawReview(id) {
  if (!validateReviewId(id)) {
    const error = new Error("review id \u4E0D\u5408\u6CD5");
    error.code = "INVALID_ID";
    throw error;
  }
  const file = join3(reviewsDir(), `${id}.json`);
  const text = await readFile3(file, "utf8");
  return JSON.parse(text);
}
async function loadReview(id, lang = "zh") {
  const raw = await loadRawReview(id);
  if (raw.format !== REVIEW_FORMAT) {
    const error = new Error("\u5BA1\u67E5\u8BB0\u5F55\u683C\u5F0F\u4E0D\u517C\u5BB9");
    error.code = "FORMAT_MISMATCH";
    throw error;
  }
  return composeReview(raw, lang);
}
async function listReviews(lang = "zh", limit = 20) {
  const dir = reviewsDir();
  let entries = [];
  try {
    entries = await readdir2(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".json")).map((entry) => entry.name);
  const rows = (await Promise.all(files.map(async (name2) => {
    try {
      const raw = JSON.parse(await readFile3(join3(dir, name2), "utf8"));
      if (!raw || raw.format !== REVIEW_FORMAT) return null;
      return {
        id: raw.id,
        target: raw.target ? { name: raw.target.name, title: raw.target.title, version: raw.target.version } : null,
        score: raw.score ? raw.score.total : null,
        counts: raw.score ? raw.score.counts : null,
        depth: raw.depth || "standard",
        createdAt: raw.createdAt || "",
        rulesVersion: raw.rulesVersion || 0
      };
    } catch {
      return null;
    }
  }))).filter(Boolean);
  rows.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return rows.slice(0, limit);
}

// src/review.ts
var VALID_DIMENSIONS = new Set(DIMENSION_IDS);
var VALID_DEPTHS = /* @__PURE__ */ new Set(["quick", "standard", "deep"]);
function normalizeOptions(options = {}) {
  const depth = VALID_DEPTHS.has(options.depth) ? options.depth : "standard";
  const lang = options.lang === "en" ? "en" : "zh";
  const focus = Array.isArray(options.focus) ? [...new Set(options.focus.filter((item) => VALID_DIMENSIONS.has(item)))] : [];
  return { depth, lang, focus };
}
function highestSeverity(values) {
  let best = "P3";
  for (const value of values) {
    if (SEVERITY_ORDER.indexOf(value) < SEVERITY_ORDER.indexOf(best)) best = value;
  }
  return best;
}
function targetView(target) {
  return {
    name: target.name,
    version: target.version,
    description: target.description,
    title: target.title,
    path: target.root,
    kind: target.kind,
    source: target.source
  };
}
async function reviewTarget(input, options = {}) {
  const { depth, lang, focus } = normalizeOptions(options);
  const config = options.config && typeof options.config === "object" ? options.config : {};
  const limits = {
    ...DEFAULT_LIMITS,
    ...config,
    deadlineMs: config.deadlineMs && config.deadlineMs[depth] || DEFAULT_LIMITS.deadlineMs[depth]
  };
  const target = await resolveTarget(input, {});
  const inventory = await walkPlugin(target.root, limits);
  const analysis = await analyzeInventory(inventory, target);
  const budget = computeBudget(inventory);
  const ctx = { inventory, target, analysis, budget };
  const findings = [];
  const detectorErrors = [];
  for (const check2 of checksFor({ depth, focus })) {
    let occurrences = [];
    try {
      occurrences = check2.detect(ctx) || [];
    } catch (error) {
      detectorErrors.push({ checkId: check2.id, message: error && error.message ? error.message : String(error) });
      continue;
    }
    occurrences = uniqueBy(
      occurrences.filter((item) => item && item.path),
      (item) => `${item.path}:${item.line}:${item.detail || ""}`
    );
    if (occurrences.length === 0) continue;
    findings.push({
      id: check2.id,
      checkId: check2.id,
      dimension: check2.dimension,
      tier: check2.tier,
      severity: highestSeverity(occurrences.map((item) => item.severity || check2.severity)),
      confidence: check2.confidence,
      occurrences: occurrences.slice(0, 10),
      totalOccurrences: occurrences.length
    });
  }
  findings.sort((a, b) => {
    const sev = SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
    if (sev !== 0) return sev;
    return a.checkId.localeCompare(b.checkId);
  });
  const limitedFindings = findings.slice(0, limits.maxFindings || DEFAULT_LIMITS.maxFindings);
  const includedDimensions = focus.length ? focus : DIMENSION_IDS;
  const score = scoreFindings(limitedFindings, includedDimensions);
  const strengths = buildStrengths(inventory, analysis, limitedFindings, budget);
  const top = topFixes(limitedFindings);
  const manual = manualChecks(inventory, limitedFindings);
  const generatedSkipped = inventory.files.filter((file) => file.generated).map((file) => ({ path: file.path, reason: file.skipReason || "generated-bundle" }));
  const skipped = [...inventory.skipped, ...generatedSkipped].slice(0, 40);
  const reviewedFiles = inventory.files.filter((file) => !file.generated).length;
  const coverage = {
    reviewedFiles,
    totalLines: inventory.files.filter((file) => !file.generated).reduce((sum, file) => sum + file.lineCount, 0),
    skipped,
    partial: inventory.partial,
    confidence: reviewedFiles === 0 ? "low" : inventory.partial ? "medium" : "high",
    notRun: ["runtime profiling", "Lighthouse", "real network timing", "memory"],
    detectorErrors
  };
  const scan = {
    format: REVIEW_FORMAT,
    rulesVersion: RULES_VERSION,
    id: newReviewId(target),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    depth,
    homeDir: dshHome(),
    target: targetView(target),
    rawFindings: limitedFindings.map((finding) => ({
      id: finding.id,
      checkId: finding.checkId,
      dimension: finding.dimension,
      tier: finding.tier,
      severity: finding.severity,
      confidence: finding.confidence,
      occurrences: finding.occurrences
    })),
    score,
    strengths,
    topFixes: top,
    manualChecks: manual,
    budget,
    coverage,
    persisted: true
  };
  if (options.persist !== false) {
    try {
      await saveReview(scan);
    } catch (error) {
      scan.persisted = false;
      scan.persistError = error && error.message ? error.message : String(error);
    }
  } else {
    scan.persisted = false;
  }
  const review = composeReview(scan, lang);
  review.persisted = scan.persisted;
  if (scan.persistError) review.persistError = scan.persistError;
  return review;
}

// src/index.ts
var name = "dsh-plugin-love";
var inject = ["tools"];
var TOOL_NAME = "love_review";
var ROUTE_STATE = "/api/love/state";
var ROUTE_REVIEW = "/api/love/review";
var MAX_BODY_BYTES = DEFAULT_LIMITS.bodyBytes;
function json(value, status = 200) {
  return Response.json(value, {
    status,
    headers: { "cache-control": "no-store" }
  });
}
function errorStatus(code) {
  switch (code) {
    case "EMPTY_TARGET":
    case "TARGET_TOO_LONG":
    case "NOT_ABSOLUTE":
    case "INVALID_LANG":
    case "INVALID_DEPTH":
    case "INVALID_FOCUS":
    case "INVALID_ID":
      return 400;
    case "NOT_FOUND":
    case "NOT_A_PLUGIN":
    case "NOT_DIRECTORY":
      return 404;
    case "UNSAFE_TARGET":
      return 403;
    case "BODY_TOO_LARGE":
      return 413;
    default:
      return 500;
  }
}
function fail(code, message) {
  return json({ ok: false, error: { code, message } }, errorStatus(code));
}
function parseLang(value) {
  if (value === void 0 || value === null || value === "") return "zh";
  if (value === "zh" || value === "en") return value;
  return null;
}
function parseDepth(value) {
  if (value === void 0 || value === null || value === "") return "standard";
  if (value === "quick" || value === "standard" || value === "deep") return value;
  return null;
}
function parseFocus(value) {
  if (value === void 0 || value === null) return [];
  if (!Array.isArray(value)) return null;
  const allowed = /* @__PURE__ */ new Set(["backend", "frontend", "ui", "ux", "performance", "ai"]);
  const list = [...new Set(value.filter((item) => typeof item === "string"))];
  if (list.some((item) => !allowed.has(item))) return null;
  return list;
}
async function readBody(request) {
  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > MAX_BODY_BYTES) {
    const error = new Error("\u8BF7\u6C42\u4F53\u8FC7\u5927");
    error.code = "BODY_TOO_LARGE";
    throw error;
  }
  if (!text.trim()) return {};
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("body must be an object");
    return parsed;
  } catch {
    const error = new Error("\u8BF7\u6C42\u4F53\u4E0D\u662F\u5408\u6CD5 JSON \u5BF9\u8C61");
    error.code = "BAD_BODY";
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
    persisted: value.persisted !== false
  };
}
function applyTool(ctx, config) {
  ctx.effect(() => ctx.tools.register({
    name: TOOL_NAME,
    description: "Review a DSH or Node plugin from source with evidence-based, constructive criticism: backend, frontend, UI, UX, performance and AI-era readiness. Read-only; never executes the target. Returns a structured verdict plus a Markdown love letter. Use it when the user asks to review, critique, roast (kindly), audit, or improve someone else\u2019s plugin. Read the evidence, then write the final answer in the user\u2019s language; do not invent findings or citations.",
    parameters: {
      type: "object",
      properties: {
        target: {
          type: "string",
          description: "Absolute path to the plugin directory, or an installed package name from the current DSH profile."
        },
        lang: {
          type: "string",
          enum: ["zh", "en"],
          description: "Language of the review text. Defaults to zh."
        },
        focus: {
          type: "array",
          items: { type: "string", enum: ["backend", "frontend", "ui", "ux", "performance", "ai"] },
          description: "Optional subset of dimensions. Defaults to all six."
        },
        depth: {
          type: "string",
          enum: ["quick", "standard", "deep"],
          description: "quick: P0/P1 core checks; standard: 37 core checks; deep: all 47 checks including UI/UX/performance deep checks. Defaults to standard."
        }
      },
      required: ["target"],
      additionalProperties: false
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          target: { type: "string" },
          total: { type: "integer" },
          verdict: { type: "string" },
          summary: { type: "string" },
          markdown: { type: "string" }
        },
        required: ["target", "total", "verdict", "summary", "markdown"]
      },
      render: (_args, value) => [{ type: "text", text: value.markdown }],
      presentationMeta: (_args, value) => ({ target: value.target, total: value.total, verdict: value.verdict })
    },
    timeoutMs: 3e4,
    isConcurrencySafe: () => true,
    presentCall: (args) => ({
      card: "generic",
      title: `Love \xB7 ${args && args.target ? String(args.target) : "plugin"}`,
      kind: "read",
      rawInput: args
    }),
    async execute(rawArgs) {
      const args = rawArgs && typeof rawArgs === "object" ? rawArgs : {};
      const target = typeof args.target === "string" ? args.target.trim() : "";
      if (!target) {
        const error = new Error("target \u5FC5\u586B\uFF1A\u7EDD\u5BF9\u76EE\u5F55\u6216\u5DF2\u5B89\u88C5\u5305\u540D");
        error.code = "EMPTY_TARGET";
        throw error;
      }
      if (target.length > 1024) {
        const error = new Error("target \u592A\u957F");
        error.code = "TARGET_TOO_LONG";
        throw error;
      }
      const lang = parseLang(args.lang);
      if (!lang) {
        const error = new Error("lang \u53EA\u80FD\u662F zh \u6216 en");
        error.code = "INVALID_LANG";
        throw error;
      }
      const depth = parseDepth(args.depth);
      if (!depth) {
        const error = new Error("depth \u53EA\u80FD\u662F quick/standard/deep");
        error.code = "INVALID_DEPTH";
        throw error;
      }
      const focus = parseFocus(args.focus);
      if (!focus) {
        const error = new Error("focus \u53EA\u80FD\u5305\u542B backend/frontend/ui/ux/performance/ai");
        error.code = "INVALID_FOCUS";
        throw error;
      }
      const review = await reviewTarget(target, { lang, depth, focus, config });
      return {
        target: review.target.title || review.target.name,
        total: review.score.total,
        verdict: review.score.verdict.text,
        summary: review.score.verdict.text,
        markdown: review.markdown
      };
    }
  }), "love: love_review tool");
}
function applyRoutes(ctx, config) {
  ctx.inject(["connection"], (scope) => {
    const fetch = scope.connection && scope.connection.fetch;
    if (!fetch || typeof fetch.register !== "function") {
      console.warn("love: connection.fetch unavailable; panel routes disabled");
      return;
    }
    scope.effect(() => fetch.register({
      path: ROUTE_STATE,
      methods: ["GET"],
      requestBody: "buffered",
      fetch: async (request) => {
        try {
          const url = new URL(request.url);
          const lang = parseLang(url.searchParams.get("lang"));
          if (!lang) return fail("INVALID_LANG", "lang \u53EA\u80FD\u662F zh \u6216 en");
          const [targets, reviews] = await Promise.all([listInstalledTargets(), listReviews(lang, 20)]);
          return json({
            ok: true,
            version: PLUGIN_VERSION,
            targets,
            reviews,
            limits: {
              maxFiles: config && config.maxFiles ? config.maxFiles : DEFAULT_LIMITS.maxFiles,
              historyLimit: config && config.historyLimit ? config.historyLimit : DEFAULT_LIMITS.historyLimit
            }
          });
        } catch (error) {
          console.warn("love: state route failed:", error && error.message ? error.message : error);
          return fail("INTERNAL", "\u8BFB\u53D6\u5BA1\u67E5\u72B6\u6001\u5931\u8D25");
        }
      }
    }), "love: state route");
    scope.effect(() => fetch.register({
      path: ROUTE_REVIEW,
      methods: ["GET", "POST"],
      requestBody: "buffered",
      fetch: async (request) => {
        try {
          const url = new URL(request.url);
          if (request.method === "GET") {
            const lang2 = parseLang(url.searchParams.get("lang"));
            if (!lang2) return fail("INVALID_LANG", "lang \u53EA\u80FD\u662F zh \u6216 en");
            const id = url.searchParams.get("id") || "";
            const review2 = await loadReview(id, lang2);
            return json({ ok: true, review: reviewForPanel(review2, lang2) });
          }
          const body = await readBody(request);
          const target = typeof body.target === "string" ? body.target.trim() : "";
          if (!target) return fail("EMPTY_TARGET", "target \u5FC5\u586B\uFF1A\u7EDD\u5BF9\u76EE\u5F55\u6216\u5DF2\u5B89\u88C5\u5305\u540D");
          if (target.length > 1024) return fail("TARGET_TOO_LONG", "target \u592A\u957F");
          const lang = parseLang(body.lang);
          if (!lang) return fail("INVALID_LANG", "lang \u53EA\u80FD\u662F zh \u6216 en");
          const depth = parseDepth(body.depth);
          if (!depth) return fail("INVALID_DEPTH", "depth \u53EA\u80FD\u662F quick/standard/deep");
          const focus = parseFocus(body.focus);
          if (!focus) return fail("INVALID_FOCUS", "focus \u53EA\u80FD\u5305\u542B backend/frontend/ui/ux/performance/ai");
          const review = await reviewTarget(target, { lang, depth, focus, config });
          return json({ ok: true, review: reviewForPanel(review, lang) });
        } catch (error) {
          const code = error && error.code && errorStatus(error.code) !== 500 ? error.code : "INTERNAL";
          if (code === "INTERNAL") {
            console.warn("love: review route failed:", error && error.message ? error.message : error);
          }
          return fail(code, code === "INTERNAL" ? "\u5BA1\u67E5\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u76EE\u6807\u662F\u5426\u53EF\u8BFB" : error.message);
        }
      }
    }), "love: review route");
  });
}
function apply(ctx, config) {
  applyTool(ctx, config);
  applyRoutes(ctx, config);
}
export {
  apply,
  inject,
  name
};
