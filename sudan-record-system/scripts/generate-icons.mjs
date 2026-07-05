/**
 * Generate PWA icons from public/icons/source-icon.png.
 * Re-run after replacing the source: `node scripts/generate-icons.mjs`
 */
import sharp from 'sharp';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'public', 'icons');
const publicDir = join(__dirname, '..', 'public');
const source = join(iconsDir, 'source-icon.png');

if (!existsSync(source)) {
  console.error('Missing source icon:', source);
  process.exit(1);
}

mkdirSync(iconsDir, { recursive: true });

const targets = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-512-maskable.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon.png', size: 32 },
];

for (const { name, size } of targets) {
  const outPath = name === 'favicon.png' ? join(publicDir, name) : join(iconsDir, name);
  const buffer = await sharp(source)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .png()
    .toBuffer();
  writeFileSync(outPath, buffer);
  console.log(`generated ${name} (${size}x${size})`);
}
