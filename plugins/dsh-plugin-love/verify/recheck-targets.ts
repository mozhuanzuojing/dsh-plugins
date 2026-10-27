// Re-run the review engine against the installed third-party plugins.
// Used to calibrate false positives against real targets — fixtures cannot
// reproduce shapes like "host-only plugin without an icon" or a bundle whose
// patch inserts host modules. See verify/REPORT.md §4 and §3.4.
//
// usage: node verify/recheck-targets.ts [target...]
//
// Targets are package names resolved from the active profile, or paths. The
// self-review entry is resolved relative to this file, so the default list works
// from any checkout location.
import { reviewTarget } from '../src/review.ts';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const selfDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const list = process.argv.slice(2);
const targets = list.length ? list : [
  'dsh-plugin-control-your-capture',
  'dsh-plugin-control-your-schedule',
  'dsh-remote-wsl',
  'dsh-kit',
  selfDir,
];

for (const target of targets) {
  try {
    const review = await reviewTarget(target, { lang: 'zh', depth: 'standard', persist: false });
    console.log(`\n=== ${target} => ${review.score.total} · ${review.score.verdict.text}`);
    for (const finding of review.findings) {
      const first = finding.occurrences[0];
      console.log(`  ${finding.severity}  ${finding.checkId}  ${first ? String(first.detail || '').slice(0, 70) : ''}`);
    }
  } catch (error: any) {
    console.log(`\n=== ${target} => ERROR ${error && error.code ? error.code : ''} ${error && error.message}`);
  }
}
