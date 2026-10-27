import { build } from 'esbuild';
import { mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

await rm(join(root, 'lib'), { recursive: true, force: true });
await mkdir(join(root, 'lib'), { recursive: true });

await build({
  entryPoints: [join(root, 'src', 'index.ts')],
  outfile: join(root, 'lib', 'index.js'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  packages: 'external',
  sourcemap: false,
  logLevel: 'info',
});

await build({
  entryPoints: [join(root, 'src', 'client', 'index.tsx')],
  outfile: join(root, 'client.js'),
  bundle: true,
  platform: 'browser',
  format: 'iife',
  target: 'es2022',
  jsx: 'transform',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  sourcemap: false,
  logLevel: 'info',
});
