// Generates simple original icons (three stacked week bars) as PNGs, no dependencies.
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const outDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../static/icons');
mkdirSync(outDir, { recursive: true });

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const sum = Buffer.alloc(4); sum.writeUInt32BE(crc(body));
  return Buffer.concat([len, body, sum]);
};

function png(size) {
  const px = Buffer.alloc(size * size * 4);
  const radius = size * 0.2;
  const bars = [0.2, 0.42, 0.64].map((t) => [t * size, (t + 0.16) * size]);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = Math.max(radius - x - 0.5, x + 0.5 - (size - radius), 0);
      const dy = Math.max(radius - y - 0.5, y + 0.5 - (size - radius), 0);
      if (Math.hypot(dx, dy) > radius) continue; // outside rounded square: transparent
      const inBar = bars.some(([a, b]) => y >= a && y < b && x >= size * 0.18 && x < size * 0.82);
      const [r, g, bl] = inBar ? [255, 255, 255] : [91, 78, 220];
      px.set([r, g, bl, 255], (y * size + x) * 4);
    }
  }
  const rows = Buffer.concat(
    Array.from({ length: size }, (_, y) => Buffer.concat([Buffer.from([0]), px.subarray(y * size * 4, (y + 1) * size * 4)]))
  );
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(rows)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const size of [16, 32, 48, 128]) writeFileSync(path.join(outDir, `${size}.png`), png(size));
console.log('icons written');
