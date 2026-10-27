import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { reviewTarget } from '../src/review.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const review = await reviewTarget(root, { lang: 'zh', depth: 'deep', persist: false });
console.log('score', review.score.total, JSON.stringify(review.score.dimensions));
console.log(review.findings.map((f: any) => `${f.severity} ${f.checkId} (${f.confidence}) ${f.evidence.path}:${f.evidence.line}`).join('\n') || '(no findings)');
console.log('budget', JSON.stringify(review.budget.values));
