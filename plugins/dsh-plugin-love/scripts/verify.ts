import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const steps = [
  { label: 'typecheck', command: process.execPath, args: [join(root, 'node_modules', 'typescript', 'bin', 'tsc'), '--noEmit'] },
  { label: 'test', command: process.execPath, args: [join(root, 'node_modules', 'vitest', 'vitest.mjs'), 'run'] },
  { label: 'build', command: process.execPath, args: [join(root, 'scripts', 'build.ts')] },
];

for (const step of steps) {
  console.log(`\n== ${step.label} ==`);
  const code = await new Promise<number>((resolve) => {
    const child = spawn(step.command, step.args, { cwd: root, stdio: 'inherit' });
    child.on('exit', (value) => resolve(value == null ? 1 : value));
    child.on('error', () => resolve(1));
  });
  if (code !== 0) {
    console.error(`FAILED ${step.label} (exit ${code})`);
    process.exit(code);
  }
}
console.log('\nverify: PASS');
