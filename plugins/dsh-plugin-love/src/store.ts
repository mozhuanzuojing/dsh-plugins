import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { DEFAULT_LIMITS, REVIEW_FORMAT, RULES_VERSION } from './constants.ts';
import { dshHome } from './scan.ts';
import { composeReview } from './compose.ts';

export function reviewHome() {
  return join(dshHome(), 'love');
}

function reviewsDir() {
  return join(reviewHome(), 'reviews');
}

function slug(value) {
  const text = String(value || 'plugin').toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  return (text || 'plugin').slice(0, 48);
}

export function newReviewId(target) {
  const now = new Date();
  const stamp = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, '0'),
    String(now.getUTCDate()).padStart(2, '0'),
    '-',
    String(now.getUTCHours()).padStart(2, '0'),
    String(now.getUTCMinutes()).padStart(2, '0'),
    String(now.getUTCSeconds()).padStart(2, '0'),
  ].join('');
  const suffix = randomBytes(3).toString('hex');
  return `${stamp}-${slug(target.name)}-${suffix}`;
}

export async function saveReview(scan) {
  const dir = reviewsDir();
  await mkdir(dir, { recursive: true });
  const file = join(dir, `${scan.id}.json`);
  const temp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temp, JSON.stringify(scan, null, 2), 'utf8');
  await rename(temp, file);
  await prune(dir).catch((error) => {
    console.warn('love: prune failed:', error && error.message ? error.message : error);
  });
  return file;
}

async function prune(dir) {
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.json')).map((entry) => entry.name);
  if (files.length <= DEFAULT_LIMITS.historyLimit) return;
  const withStats = await Promise.all(files.map(async (name) => {
    try {
      const file = join(dir, name);
      const text = await readFile(file, 'utf8');
      const parsed = JSON.parse(text);
      return { name, file, createdAt: parsed.createdAt || '' };
    } catch {
      return { name, file: join(dir, name), createdAt: '' };
    }
  }));
  withStats.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  const remove = withStats.slice(0, Math.max(0, withStats.length - DEFAULT_LIMITS.historyLimit));
  await Promise.all(remove.map((item) => rm(item.file, { force: true }).catch((error) => {
    console.warn('love: prune file failed:', item.file, error && error.message ? error.message : error);
  })));
}

export function validateReviewId(id) {
  return typeof id === 'string' && /^[A-Za-z0-9._-]{6,120}$/.test(id);
}

export async function loadRawReview(id) {
  if (!validateReviewId(id)) {
    const error = new Error('review id 不合法');
    (error as any).code = 'INVALID_ID';
    throw error;
  }
  const file = join(reviewsDir(), `${id}.json`);
  const text = await readFile(file, 'utf8');
  return JSON.parse(text);
}

export async function loadReview(id, lang = 'zh') {
  const raw = await loadRawReview(id);
  if (raw.format !== REVIEW_FORMAT) {
    const error = new Error('审查记录格式不兼容');
    (error as any).code = 'FORMAT_MISMATCH';
    throw error;
  }
  return composeReview(raw, lang);
}

export async function listReviews(lang = 'zh', limit = 20) {
  const dir = reviewsDir();
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.json')).map((entry) => entry.name);
  const rows = (await Promise.all(files.map(async (name) => {
    try {
      const raw = JSON.parse(await readFile(join(dir, name), 'utf8'));
      if (!raw || raw.format !== REVIEW_FORMAT) return null;
      return {
        id: raw.id,
        target: raw.target ? { name: raw.target.name, title: raw.target.title, version: raw.target.version } : null,
        score: raw.score ? raw.score.total : null,
        counts: raw.score ? raw.score.counts : null,
        depth: raw.depth || 'standard',
        createdAt: raw.createdAt || '',
        rulesVersion: raw.rulesVersion || 0,
      };
    } catch {
      // A corrupt history file must not take the whole list down.
      return null;
    }
  }))).filter(Boolean);
  rows.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return rows.slice(0, limit);
}

export function reviewVersion() {
  return `${REVIEW_FORMAT}+rules.${RULES_VERSION}`;
}
