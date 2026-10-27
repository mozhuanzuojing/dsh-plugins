/** Small, dependency-free helpers shared by the scanner and checks. */

export function toPosix(value) {
  return String(value).replace(/\\/g, '/');
}

export function lineAt(text, index) {
  if (index <= 0) return 1;
  let line = 1;
  for (let i = 0; i < index && i < text.length; i += 1) {
    if (text.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

export function snippetAt(text, index, maxLines = 3) {
  const start = Math.max(0, text.lastIndexOf('\n', Math.max(0, index - 1)) + 1);
  let end = text.indexOf('\n', index);
  if (end === -1) end = text.length;
  for (let i = 1; i < maxLines; i += 1) {
    const next = text.indexOf('\n', end + 1);
    if (next === -1) { end = text.length; break; }
    end = next;
  }
  return text.slice(start, Math.min(end, start + 4000)).replace(/\r/g, '');
}

export function makeOccurrence(file, text, index, extra = {}) {
  const line = lineAt(text, index);
  return {
    path: file.path,
    line,
    snippet: snippetAt(text, index),
    ...extra,
  };
}

export function isCommentLine(lineText) {
  const t = lineText.trim();
  return t.startsWith('//') || t.startsWith('/*') || t.startsWith('*') || t.startsWith('<!--');
}

export function maskSecret(value) {
  const text = String(value);
  if (text.length <= 8) return '****';
  return text.slice(0, 4) + '…' + text.slice(-4);
}

export function redactPath(value, homeDir) {
  let text = String(value);
  if (homeDir) {
    const normalized = toPosix(text);
    const home = toPosix(homeDir).replace(/\/+$/, '');
    if (home && normalized.startsWith(home)) text = '~' + normalized.slice(home.length);
  }
  return text;
}

const NAMED = {
  transparent: [0, 0, 0, 0],
  black: [0, 0, 0, 1],
  white: [255, 255, 255, 1],
  red: [255, 0, 0, 1],
  green: [0, 128, 0, 1],
  blue: [0, 0, 255, 1],
  gray: [128, 128, 128, 1],
  grey: [128, 128, 128, 1],
};

/** Parse #rgb/#rgba/#rrggbb/#rrggbbaa/rgb()/rgba() into [r,g,b,a] or null. */
export function parseColor(input) {
  if (typeof input !== 'string') return null;
  const value = input.trim().toLowerCase();
  if (NAMED[value]) return NAMED[value].slice();
  if (value.startsWith('#')) {
    const hex = value.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      const parts = hex.split('').map((c) => parseInt(c + c, 16));
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
    const parts = match[1].split(',').map((p) => p.trim());
    if (parts.length < 3) return null;
    const nums = parts.slice(0, 3).map((p) => (p.endsWith('%') ? Math.round(parseFloat(p) * 2.55) : parseInt(p, 10)));
    if (nums.some((n) => Number.isNaN(n))) return null;
    const alpha = parts[3] === undefined ? 1 : (parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]));
    return [nums[0], nums[1], nums[2], Number.isFinite(alpha) ? alpha : 1];
  }
  return null;
}

function channel(value) {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(rgb) {
  return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
}

/** WCAG contrast ratio; returns null when either color is unparseable. */
export function contrastRatio(foreground, background) {
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

/** Find a balanced block starting at the first open char at/after `from`. */
export function balancedBlock(text, from, open = '(', close = ')') {
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
      if (ch === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (ch === '*' && next === '/') { blockComment = false; i += 1; }
      continue;
    }
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '/' && next === '/') { lineComment = true; i += 1; continue; }
    if (ch === '/' && next === '*') { blockComment = true; i += 1; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
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

/** Every `name(...)` call block in a text. */
export function callBlocks(text, name) {
  const blocks = [];
  const pattern = new RegExp(`(?:^|[^\\w$])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(`, 'g');
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const paren = text.indexOf('(', match.index);
    const block = balancedBlock(text, paren, '(', ')');
    if (block) {
      blocks.push(block);
      pattern.lastIndex = block.end + 1;
    }
  }
  return blocks;
}

/** Every object argument block of `name(` (first `{...}` inside the call). */
export function objectArgumentBlocks(text, name) {
  return callBlocks(text, name)
    .map((call) => {
      const objStart = call.text.indexOf('{');
      if (objStart === -1) return null;
      const block = balancedBlock(call.text, objStart, '{', '}');
      if (!block) return null;
      return {
        start: call.start + block.start,
        end: call.start + block.end,
        text: block.text,
      };
    })
    .filter(Boolean);
}

export function lineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i += 1) {
    if (text.charCodeAt(i) === 10) starts.push(i + 1);
  }
  return starts;
}

export function flattenKeys(value, prefix = '') {
  const keys = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return keys;
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object' && !Array.isArray(child)) keys.push(...flattenKeys(child, path));
    else keys.push(path);
  }
  return keys;
}

export function uniqueBy(items, key) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const value = typeof key === 'function' ? key(item) : item[key];
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(item);
  }
  return out;
}

export function truncate(value, max = 4000) {
  const text = String(value == null ? '' : value);
  return text.length > max ? text.slice(0, max) + '\n…（截断）' : text;
}

export function fenceFor(text) {
  const value = String(text == null ? '' : text);
  const max = Math.max(3, ...(value.match(/`+/g) || []).map((m) => m.length + 1));
  return '`'.repeat(max);
}

export function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
