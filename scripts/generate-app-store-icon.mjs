import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { deflateSync } from "node:zlib";

const size = 1024;
const bytesPerPixel = 3;
const pixels = new Uint8Array(size * size * bytesPerPixel);

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function setPixel(x, y, color) {
  if (x < 0 || y < 0 || x >= size || y >= size) return;
  const index = (y * size + x) * bytesPerPixel;
  pixels[index] = color.r;
  pixels[index + 1] = color.g;
  pixels[index + 2] = color.b;
}

function fill(color) {
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      setPixel(x, y, color);
    }
  }
}

function fillRoundedRect(x, y, width, height, radius, color) {
  const right = x + width;
  const bottom = y + height;
  for (let py = y; py < bottom; py += 1) {
    for (let px = x; px < right; px += 1) {
      const nearestX = Math.max(x + radius, Math.min(px, right - radius - 1));
      const nearestY = Math.max(y + radius, Math.min(py, bottom - radius - 1));
      const dx = px - nearestX;
      const dy = py - nearestY;
      if (dx * dx + dy * dy <= radius * radius) setPixel(px, py, color);
    }
  }
}

function fillCircle(cx, cy, radius, color) {
  const r2 = radius * radius;
  for (let y = cy - radius; y <= cy + radius; y += 1) {
    for (let x = cx - radius; x <= cx + radius; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) setPixel(x, y, color);
    }
  }
}

function drawThickLine(x1, y1, x2, y2, width, color) {
  const half = width / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;
  const minX = Math.floor(Math.min(x1, x2) - half);
  const maxX = Math.ceil(Math.max(x1, x2) + half);
  const minY = Math.floor(Math.min(y1, y2) - half);
  const maxY = Math.ceil(Math.max(y1, y2) + half);

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / lengthSquared));
      const projectionX = x1 + t * dx;
      const projectionY = y1 + t * dy;
      const distanceX = x - projectionX;
      const distanceY = y - projectionY;
      if (distanceX * distanceX + distanceY * distanceY <= half * half) setPixel(x, y, color);
    }
  }
  fillCircle(x1, y1, Math.round(half), color);
  fillCircle(x2, y2, Math.round(half), color);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function encodePng() {
  const raw = Buffer.alloc((size * bytesPerPixel + 1) * size);
  for (let y = 0; y < size; y += 1) {
    const rowStart = y * (size * bytesPerPixel + 1);
    raw[rowStart] = 0;
    raw.set(pixels.subarray(y * size * bytesPerPixel, (y + 1) * size * bytesPerPixel), rowStart + 1);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 2;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  return Buffer.concat([
    Buffer.from("89504e470d0a1a0a", "hex"),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const navy = hexToRgb("#0A1A2F");
const white = hexToRgb("#F8FAFC");
const teal = hexToRgb("#0F766E");
const aqua = hexToRgb("#DFF3F5");
const mint = hexToRgb("#2DD4BF");

fill(navy);
fillRoundedRect(136, 256, 752, 448, 96, white);
drawThickLine(260, 464, 328, 348, 56, teal);
drawThickLine(328, 348, 404, 304, 56, teal);
drawThickLine(404, 304, 620, 304, 56, teal);
drawThickLine(620, 304, 696, 348, 56, teal);
drawThickLine(696, 348, 764, 464, 56, teal);
fillRoundedRect(160, 464, 704, 190, 78, aqua);
drawThickLine(184, 464, 840, 464, 48, teal);
drawThickLine(160, 544, 160, 616, 48, teal);
drawThickLine(864, 544, 864, 616, 48, teal);
drawThickLine(184, 654, 840, 654, 48, teal);
fillCircle(304, 656, 64, navy);
fillCircle(720, 656, 64, navy);
fillCircle(304, 656, 28, white);
fillCircle(720, 656, 28, white);
drawThickLine(386, 542, 638, 542, 44, navy);
drawThickLine(512, 210, 512, 138, 42, mint);
drawThickLine(430, 212, 388, 154, 42, mint);
drawThickLine(594, 212, 636, 154, 42, mint);
drawThickLine(352, 792, 672, 792, 46, mint);
drawThickLine(424, 864, 600, 864, 34, white);

const output = join(process.cwd(), "public", "app-store-icon-1024.png");
writeFileSync(output, encodePng());
console.log(`App Store 1024x1024 opak PNG ikon hazirlandi: ${output}`);
