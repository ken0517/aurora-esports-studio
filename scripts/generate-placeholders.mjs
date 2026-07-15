import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const crcTable = Array.from({ length: 256 }, (_, index) => {
  let c = index;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);

  length.writeUInt32BE(data.length, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function writePng(filePath, width, height, pixels) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rawOffset = y * (width * 4 + 1);
    raw[rawOffset] = 0;
    pixels.copy(raw, rawOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(
    filePath,
    Buffer.concat([signature, chunk("IHDR", header), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]),
  );
}

function hex(color, alpha = 255) {
  const clean = color.replace("#", "");
  return [
    Number.parseInt(clean.slice(0, 2), 16),
    Number.parseInt(clean.slice(2, 4), 16),
    Number.parseInt(clean.slice(4, 6), 16),
    alpha,
  ];
}

function blendPixel(pixels, width, x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= pixels.length / (width * 4)) return;

  const index = (y * width + x) * 4;
  const alpha = color[3] / 255;
  const inv = 1 - alpha;
  pixels[index] = Math.round(color[0] * alpha + pixels[index] * inv);
  pixels[index + 1] = Math.round(color[1] * alpha + pixels[index + 1] * inv);
  pixels[index + 2] = Math.round(color[2] * alpha + pixels[index + 2] * inv);
  pixels[index + 3] = 255;
}

function createCanvas(width, height) {
  const pixels = Buffer.alloc(width * height * 4);

  const api = {
    pixels,
    width,
    height,
    gradient(top, bottom) {
      for (let y = 0; y < height; y += 1) {
        const t = y / Math.max(height - 1, 1);
        for (let x = 0; x < width; x += 1) {
          const index = (y * width + x) * 4;
          pixels[index] = Math.round(top[0] * (1 - t) + bottom[0] * t);
          pixels[index + 1] = Math.round(top[1] * (1 - t) + bottom[1] * t);
          pixels[index + 2] = Math.round(top[2] * (1 - t) + bottom[2] * t);
          pixels[index + 3] = 255;
        }
      }
    },
    rect(x, y, w, h, color) {
      const left = Math.max(0, Math.floor(x));
      const top = Math.max(0, Math.floor(y));
      const right = Math.min(width, Math.ceil(x + w));
      const bottom = Math.min(height, Math.ceil(y + h));
      for (let yy = top; yy < bottom; yy += 1) {
        for (let xx = left; xx < right; xx += 1) {
          blendPixel(pixels, width, xx, yy, color);
        }
      }
    },
    roundRect(x, y, w, h, radius, color) {
      const left = Math.max(0, Math.floor(x));
      const top = Math.max(0, Math.floor(y));
      const right = Math.min(width, Math.ceil(x + w));
      const bottom = Math.min(height, Math.ceil(y + h));
      for (let yy = top; yy < bottom; yy += 1) {
        for (let xx = left; xx < right; xx += 1) {
          const dx = Math.max(x + radius - xx, 0, xx - (x + w - radius));
          const dy = Math.max(y + radius - yy, 0, yy - (y + h - radius));
          if (dx * dx + dy * dy <= radius * radius) {
            blendPixel(pixels, width, xx, yy, color);
          }
        }
      }
    },
    circle(cx, cy, radius, color) {
      const left = Math.max(0, Math.floor(cx - radius));
      const top = Math.max(0, Math.floor(cy - radius));
      const right = Math.min(width, Math.ceil(cx + radius));
      const bottom = Math.min(height, Math.ceil(cy + radius));
      for (let yy = top; yy < bottom; yy += 1) {
        for (let xx = left; xx < right; xx += 1) {
          const dx = xx - cx;
          const dy = yy - cy;
          if (dx * dx + dy * dy <= radius * radius) {
            blendPixel(pixels, width, xx, yy, color);
          }
        }
      }
    },
    line(x1, y1, x2, y2, color, thickness = 2) {
      const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
      for (let step = 0; step <= steps; step += 1) {
        const t = step / Math.max(steps, 1);
        const x = Math.round(x1 * (1 - t) + x2 * t);
        const y = Math.round(y1 * (1 - t) + y2 * t);
        api.circle(x, y, thickness / 2, color);
      }
    },
  };

  return api;
}

function addGrid(canvas, spacing = 56) {
  for (let x = 0; x < canvas.width; x += spacing) {
    canvas.rect(x, 0, 1, canvas.height, hex("#93c5fd", 18));
  }
  for (let y = 0; y < canvas.height; y += spacing) {
    canvas.rect(0, y, canvas.width, 1, hex("#93c5fd", 14));
  }
}

function addBadge(canvas, cx, cy, scale = 1) {
  canvas.circle(cx, cy, 88 * scale, hex("#38bdf8", 42));
  canvas.circle(cx, cy, 58 * scale, hex("#0f172a", 235));
  canvas.circle(cx, cy, 44 * scale, hex("#60a5fa", 82));
  canvas.rect(cx - 32 * scale, cy - 8 * scale, 64 * scale, 16 * scale, hex("#e0f2fe", 210));
  canvas.rect(cx - 20 * scale, cy - 34 * scale, 40 * scale, 16 * scale, hex("#93c5fd", 190));
  canvas.rect(cx - 12 * scale, cy + 18 * scale, 24 * scale, 24 * scale, hex("#bae6fd", 180));
}

function addBars(canvas, x, y, count, maxWidth, accent = "#60a5fa") {
  for (let i = 0; i < count; i += 1) {
    const width = maxWidth * (0.42 + ((i * 31) % 52) / 100);
    canvas.roundRect(x, y + i * 34, maxWidth, 12, 6, hex("#1e293b", 210));
    canvas.roundRect(x, y + i * 34, width, 12, 6, hex(accent, 150));
  }
}

function createHeroDashboard() {
  const canvas = createCanvas(1200, 900);
  canvas.gradient(hex("#05070a"), hex("#0b1220"));
  addGrid(canvas, 72);
  canvas.circle(930, 140, 260, hex("#2563eb", 34));
  canvas.circle(250, 650, 320, hex("#38bdf8", 24));
  canvas.roundRect(90, 84, 1020, 730, 38, hex("#020617", 150));
  canvas.roundRect(128, 126, 944, 96, 28, hex("#0f172a", 210));
  canvas.roundRect(168, 160, 280, 18, 9, hex("#e0f2fe", 140));
  canvas.roundRect(820, 154, 190, 28, 14, hex("#38bdf8", 95));
  canvas.roundRect(132, 270, 410, 470, 30, hex("#0f172a", 225));
  canvas.roundRect(590, 270, 350, 214, 30, hex("#0f172a", 215));
  canvas.roundRect(590, 526, 350, 214, 30, hex("#0f172a", 215));
  addBadge(canvas, 336, 438, 1.35);
  addBars(canvas, 635, 336, 4, 248);
  addBars(canvas, 635, 592, 4, 248, "#22d3ee");
  canvas.roundRect(188, 622, 296, 26, 13, hex("#38bdf8", 120));
  canvas.roundRect(228, 674, 216, 16, 8, hex("#f8fafc", 105));
  canvas.line(704, 458, 844, 348, hex("#38bdf8", 130), 5);
  canvas.line(704, 714, 846, 626, hex("#60a5fa", 135), 5);
  return canvas;
}

function createResult(index) {
  const canvas = createCanvas(900, 675);
  canvas.gradient(hex("#05070a"), hex(index % 2 ? "#111827" : "#07111f"));
  addGrid(canvas, 60);
  canvas.circle(720, 120, 210, hex(index % 2 ? "#0ea5e9" : "#2563eb", 32));
  canvas.roundRect(58, 62, 784, 548, 30, hex("#020617", 155));
  canvas.roundRect(96, 104, 708, 78, 22, hex("#0f172a", 230));
  canvas.roundRect(124, 132, 260, 16, 8, hex("#e0f2fe", 135));
  canvas.roundRect(612, 126, 148, 28, 14, hex("#38bdf8", 90));
  addBadge(canvas, 224, 350, 1.08);
  addBars(canvas, 420, 266, 6, 285, index % 2 ? "#22d3ee" : "#60a5fa");
  for (let i = 0; i < 5; i += 1) {
    canvas.roundRect(122 + i * 58, 506, 42, 42, 12, hex(i < 4 ? "#38bdf8" : "#1e293b", i < 4 ? 118 : 210));
  }
  return canvas;
}

function createReview(index) {
  const canvas = createCanvas(720, 960);
  canvas.gradient(hex("#05070a"), hex(index === 1 ? "#102033" : "#111827"));
  canvas.circle(590, 110, 180, hex("#38bdf8", 28));
  canvas.roundRect(92, 74, 536, 812, 42, hex("#020617", 190));
  canvas.roundRect(128, 128, 464, 64, 24, hex("#0f172a", 232));
  canvas.circle(168, 160, 20, hex("#38bdf8", 120));
  canvas.roundRect(210, 150, 220, 14, 7, hex("#e0f2fe", 105));

  const bubbles = [
    [134, 252, 326, 82, "#1e293b"],
    [246, 378, 340, 92, "#075985"],
    [134, 520, 386, 104, "#1e293b"],
    [280, 674, 302, 88, "#075985"],
  ];

  bubbles.forEach(([x, y, w, h, color], bubbleIndex) => {
    canvas.roundRect(x, y, w, h, 24, hex(color, color === "#075985" ? 205 : 232));
    canvas.roundRect(x + 28, y + 26, w * 0.68, 12, 6, hex("#e0f2fe", bubbleIndex % 2 ? 120 : 82));
    canvas.roundRect(x + 28, y + 52, w * 0.5, 10, 5, hex("#93c5fd", bubbleIndex % 2 ? 100 : 70));
  });

  canvas.roundRect(178, 814, 364, 28, 14, hex("#38bdf8", 80));
  return canvas;
}

const outputs = [
  ["public/assets/brand/aurora-dashboard.png", createHeroDashboard()],
  ["public/assets/results/result-01.png", createResult(0)],
  ["public/assets/results/result-02.png", createResult(1)],
  ["public/assets/results/result-03.png", createResult(2)],
  ["public/assets/results/result-04.png", createResult(3)],
  ["public/assets/reviews/review-01.png", createReview(0)],
  ["public/assets/reviews/review-02.png", createReview(1)],
  ["public/assets/reviews/review-03.png", createReview(2)],
];

for (const [relativePath, canvas] of outputs) {
  writePng(path.join(rootDir, relativePath), canvas.width, canvas.height, canvas.pixels);
}

console.log(`Generated ${outputs.length} placeholder assets.`);
