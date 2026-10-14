// Writes public/images/email-logo.png: a 96x96 BRAND_MARK circle on transparent.
// Run: node kc/brand/make-email-logo.ts
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { BRAND_MARK } from "../brand.ts";

const SIZE = 96;

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

export function makeEmailLogo(): Buffer {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(BRAND_MARK.slice(i, i + 2), 16));
  const radius = (SIZE * 12) / 32;
  const centre = SIZE / 2;
  const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1));
  for (let y = 0; y < SIZE; y++) {
    const row = y * (SIZE * 4 + 1);
    for (let x = 0; x < SIZE; x++) {
      // 4x4 supersampling for a smooth edge.
      let hits = 0;
      for (let sy = 0; sy < 4; sy++) {
        for (let sx = 0; sx < 4; sx++) {
          const dx = x + (sx + 0.5) / 4 - centre;
          const dy = y + (sy + 0.5) / 4 - centre;
          if (dx * dx + dy * dy <= radius * radius) hits++;
        }
      }
      const p = row + 1 + x * 4;
      raw[p] = r;
      raw[p + 1] = g;
      raw[p + 2] = b;
      raw[p + 3] = Math.round((hits / 16) * 255);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(SIZE, 0);
  ihdr.writeUInt32BE(SIZE, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

if (import.meta.main) {
  writeFileSync(new URL("../../public/images/email-logo.png", import.meta.url), makeEmailLogo());
}
