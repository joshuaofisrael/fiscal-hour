import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const WIDTH = 192;
const HEIGHT = 192;
const RADIUS = 16;
const NAVY = [14, 26, 43, 255];
const COPPER = [232, 201, 154, 255];

const RECTS = [
  [36, 36, 96, 19],
  [36, 36, 19, 120],
  [36, 84, 78, 19],
  [109, 36, 19, 120],
  [157, 36, 19, 120],
  [109, 84, 67, 19],
];

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
}

const CRC_TABLE = makeCrcTable();

function crc32(buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function inRoundRect(x, y) {
  if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return false;
  if (x >= RADIUS && x < WIDTH - RADIUS) return true;
  if (y >= RADIUS && y < HEIGHT - RADIUS) return true;
  const cx = x < RADIUS ? RADIUS : WIDTH - RADIUS - 1;
  const cy = y < RADIUS ? RADIUS : HEIGHT - RADIUS - 1;
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= RADIUS * RADIUS;
}

function inMark(x, y) {
  return RECTS.some(([rx, ry, rw, rh]) => x >= rx && x < rx + rw && y >= ry && y < ry + rh);
}

function sample(x, y) {
  if (!inRoundRect(x, y)) return 0;
  return inMark(x, y) ? 2 : 1;
}

const raw = Buffer.alloc((WIDTH * 4 + 1) * HEIGHT);
for (let y = 0; y < HEIGHT; y += 1) {
  const row = y * (WIDTH * 4 + 1);
  raw[row] = 0;
  for (let x = 0; x < WIDTH; x += 1) {
    let background = 0;
    let mark = 0;
    for (const dx of [0.25, 0.75]) {
      for (const dy of [0.25, 0.75]) {
        const hit = sample(x + dx, y + dy);
        if (hit === 2) mark += 1;
        else if (hit === 1) background += 1;
      }
    }
    const covered = background + mark;
    const offset = row + 1 + x * 4;
    if (!covered) {
      raw[offset] = 0;
      raw[offset + 1] = 0;
      raw[offset + 2] = 0;
      raw[offset + 3] = 0;
      continue;
    }
    const markShare = mark / covered;
    raw[offset] = Math.round(NAVY[0] * (1 - markShare) + COPPER[0] * markShare);
    raw[offset + 1] = Math.round(NAVY[1] * (1 - markShare) + COPPER[1] * markShare);
    raw[offset + 2] = Math.round(NAVY[2] * (1 - markShare) + COPPER[2] * markShare);
    raw[offset + 3] = Math.round(255 * (covered / 4));
  }
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(WIDTH, 0);
ihdr.writeUInt32BE(HEIGHT, 4);
ihdr[8] = 8;
ihdr[9] = 6;
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", ihdr),
  chunk("IDAT", zlib.deflateSync(raw)),
  chunk("IEND", Buffer.alloc(0)),
]);

const destination = path.resolve("src/assets/logo.png");
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, png);
console.log(`Wrote ${destination} (${png.length} bytes)`);
