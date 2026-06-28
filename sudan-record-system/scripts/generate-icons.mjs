/**
 * Dependency-free PWA icon generator.
 *
 * Renders branded PNG icons (blue rounded tile + white "folder/record" glyph)
 * at the sizes the manifest needs, using only Node's built-in `zlib`. This keeps
 * the project free of native image deps (sharp/canvas) while still shipping real
 * raster icons. Re-run with: `node scripts/generate-icons.mjs`.
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

// ---- CRC32 (for PNG chunks) -------------------------------------------------
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

/** Encode an RGBA pixel buffer (size*size*4) into a PNG Buffer. */
function encodePng(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // Add filter byte (0) at the start of each scanline.
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }

  const idat = deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---- Simple drawing helpers -------------------------------------------------
function makeCanvas(size) {
  return { size, data: Buffer.alloc(size * size * 4) };
}

function setPx(c, x, y, [r, g, b, a]) {
  if (x < 0 || y < 0 || x >= c.size || y >= c.size) return;
  const i = (y * c.size + x) * 4;
  // alpha-over compositing onto existing pixel
  const sa = a / 255;
  const da = c.data[i + 3] / 255;
  const outA = sa + da * (1 - sa);
  for (let k = 0; k < 3; k++) {
    const src = [r, g, b][k];
    const dst = c.data[i + k];
    c.data[i + k] = outA === 0 ? 0 : Math.round((src * sa + dst * da * (1 - sa)) / outA);
  }
  c.data[i + 3] = Math.round(outA * 255);
}

function fillRoundedRect(c, x0, y0, w, h, radius, color) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      // corner rounding
      const dx = Math.min(x - x0, x0 + w - 1 - x);
      const dy = Math.min(y - y0, y0 + h - 1 - y);
      if (dx < radius && dy < radius) {
        const cx = x0 + (dx === x - x0 ? radius : w - radius - 1);
        const cy = y0 + (dy === y - y0 ? radius : h - radius - 1);
        if ((x - cx) ** 2 + (y - cy) ** 2 > radius ** 2) continue;
      }
      setPx(c, x, y, color);
    }
  }
}

function renderIcon(size, { maskable }) {
  const c = makeCanvas(size);
  const blue = [37, 99, 235, 255];
  const white = [255, 255, 255, 255];
  const lightBlue = [96, 165, 250, 255];

  // Background: full-bleed for maskable, rounded tile otherwise.
  const radius = maskable ? 0 : Math.round(size * 0.22);
  fillRoundedRect(c, 0, 0, size, size, radius, blue);

  // Folder glyph centered, scaled within a safe area.
  const scale = maskable ? 0.55 : 0.62;
  const fw = Math.round(size * scale);
  const fh = Math.round(fw * 0.74);
  const fx = Math.round((size - fw) / 2);
  const fy = Math.round((size - fh) / 2 + size * 0.03);
  const r = Math.max(2, Math.round(fw * 0.08));

  // folder tab
  const tabW = Math.round(fw * 0.4);
  const tabH = Math.round(fh * 0.18);
  fillRoundedRect(c, fx, fy - tabH + r, tabW, tabH, Math.round(r / 2), white);
  // folder body
  fillRoundedRect(c, fx, fy, fw, fh, r, white);

  // record "lines"
  const lineX = fx + Math.round(fw * 0.16);
  const lineW1 = Math.round(fw * 0.6);
  const lineW2 = Math.round(fw * 0.42);
  const lineH = Math.max(2, Math.round(fh * 0.1));
  const gap = Math.round(fh * 0.18);
  const startY = fy + Math.round(fh * 0.28);
  fillRoundedRect(c, lineX, startY, lineW1, lineH, Math.round(lineH / 2), blue);
  fillRoundedRect(c, lineX, startY + gap, lineW2, lineH, Math.round(lineH / 2), lightBlue);

  return encodePng(size, c.data);
}

const targets = [
  { name: 'icon-192.png', size: 192, maskable: false },
  { name: 'icon-512.png', size: 512, maskable: false },
  { name: 'icon-512-maskable.png', size: 512, maskable: true },
  { name: 'apple-touch-icon.png', size: 180, maskable: false },
];

for (const t of targets) {
  const png = renderIcon(t.size, { maskable: t.maskable });
  writeFileSync(join(outDir, t.name), png);
  console.log(`generated ${t.name} (${t.size}x${t.size}, ${png.length} bytes)`);
}
