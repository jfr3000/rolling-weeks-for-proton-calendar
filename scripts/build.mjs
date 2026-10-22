// Builds dist/chrome and dist/firefox from src/ and static/.
import { build } from 'esbuild';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const base = JSON.parse(await readFile(path.join(root, 'static/manifest.base.json'), 'utf8'));

const manifests = {
  chrome: { ...base, background: { service_worker: 'background.js' } },
  firefox: {
    ...base,
    background: { scripts: ['background.js'] },
    browser_specific_settings: {
      gecko: {
        id: '{7c813213-3f4d-49f5-882a-99b9c1fcc33a}',
        strict_min_version: '128.0',
        data_collection_permissions: { required: ['none'] },
      },
    },
  },
};

await rm(dist, { recursive: true, force: true });
for (const [name, manifest] of Object.entries(manifests)) {
  const out = path.join(dist, name);
  await mkdir(out, { recursive: true });
  await build({
    entryPoints: {
      content: path.join(root, 'src/content.js'),
      background: path.join(root, 'src/background.js'),
      options: path.join(root, 'src/options.js'),
    },
    outdir: out,
    bundle: true,
    format: 'iife',
    target: ['chrome120', 'firefox128'],
    legalComments: 'none',
  });
  await cp(path.join(root, 'static/options.html'), path.join(out, 'options.html'));
  await cp(path.join(root, 'static/icons'), path.join(out, 'icons'), { recursive: true });
  await writeFile(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`built dist/${name}`);
}
