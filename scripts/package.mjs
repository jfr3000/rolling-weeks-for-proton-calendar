// Zips dist/<browser> into dist/rolling-weeks-<browser>-<version>.zip (needs the `zip` CLI),
// plus a source zip of the last commit for AMO.
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { version } = JSON.parse(await readFile(path.join(root, 'static/manifest.base.json'), 'utf8'));

for (const browser of ['chrome', 'firefox']) {
  const zip = path.join(root, 'dist', `rolling-weeks-${browser}-${version}.zip`);
  execFileSync('zip', ['-r', '-X', '-q', zip, '.'], { cwd: path.join(root, 'dist', browser) });
  console.log(`wrote ${path.relative(root, zip)}`);
}

// Source archive of the last commit, for AMO review (bundled code needs reviewable source).
const sourceZip = path.join(root, 'dist', `rolling-weeks-source-${version}.zip`);
execFileSync('git', ['archive', '--format=zip', '-o', sourceZip, 'HEAD'], { cwd: root });
console.log(`wrote ${path.relative(root, sourceZip)}`);
