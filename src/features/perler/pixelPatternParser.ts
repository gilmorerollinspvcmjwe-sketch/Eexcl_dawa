import Pixelizer from 'image-pixelizer';
import type { ImportedPerlerSource, PerlerThemeStyle, PixelPattern } from './perlerTypes';

const STYLE_FACTORS: Record<PerlerThemeStyle, number> = {
  standard: 1,
  contrast: 1.25,
  soft: 0.85,
  retro: 1.1,
};

const STYLE_OPTIONS: Record<PerlerThemeStyle, { colorDistRatio: number; clusterThreshold: number; maxIteration: number }> = {
  standard: { colorDistRatio: 0.62, clusterThreshold: 0.01, maxIteration: 10 },
  contrast: { colorDistRatio: 0.78, clusterThreshold: 0.008, maxIteration: 12 },
  soft: { colorDistRatio: 0.52, clusterThreshold: 0.012, maxIteration: 8 },
  retro: { colorDistRatio: 0.68, clusterThreshold: 0.01, maxIteration: 10 },
};

// 限制颜色范围，避免样式增强后越界。
function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

// RGB 转十六进制颜色。
function toHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
}

// 十六进制颜色转 RGB，用于最近色匹配。
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '');
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

// 计算两个颜色的欧式距离。
function colorDistance(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }): number {
  return (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2;
}

function rgbToHsl(color: { r: number; g: number; b: number }) {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) {
    return { h: 0, s: 0, l: lightness };
  }

  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue = 0;

  switch (max) {
    case r:
      hue = (g - b) / delta + (g < b ? 6 : 0);
      break;
    case g:
      hue = (b - r) / delta + 2;
      break;
    default:
      hue = (r - g) / delta + 4;
      break;
  }

  return { h: hue / 6, s: saturation, l: lightness };
}

function hslToRgb(color: { h: number; s: number; l: number }) {
  const hueToRgb = (p: number, q: number, t: number) => {
    let next = t;
    if (next < 0) next += 1;
    if (next > 1) next -= 1;
    if (next < 1 / 6) return p + (q - p) * 6 * next;
    if (next < 1 / 2) return q;
    if (next < 2 / 3) return p + (q - p) * (2 / 3 - next) * 6;
    return p;
  };

  if (color.s === 0) {
    const gray = clamp(color.l * 255);
    return { r: gray, g: gray, b: gray };
  }

  const q = color.l < 0.5 ? color.l * (1 + color.s) : color.l + color.s - color.l * color.s;
  const p = 2 * color.l - q;

  return {
    r: clamp(hueToRgb(p, q, color.h + 1 / 3) * 255),
    g: clamp(hueToRgb(p, q, color.h) * 255),
    b: clamp(hueToRgb(p, q, color.h - 1 / 3) * 255),
  };
}

// 给图纸中的颜色生成简短色号，便于十字绣/拼豆式阅读。
function buildColorCode(index: number): string {
  return `C${String(index + 1).padStart(2, '0')}`;
}

// 角色图鲜艳优先：中性色基本不动，有色区域提饱和并略提亮。
export function boostCharacterPalette(colors: string[]): string[] {
  return colors.map((hex) => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb);
    if (hsl.s < 0.08) return hex.toUpperCase();

    const boosted = {
      h: hsl.h,
      s: Math.min(1, hsl.s * 1.28 + 0.06),
      l: Math.min(0.78, hsl.l * 1.04 + 0.015),
    };
    const vivid = hslToRgb(boosted);
    return toHex(vivid.r, vivid.g, vivid.b);
  });
}

// 从像素颜色列表构建完整图纸。
export function buildPixelPatternFromPixels(input: {
  title: string;
  width: number;
  height: number;
  pixels: string[];
}): PixelPattern {
  const palette: string[] = [];
  const colorToIndex = new Map<string, number>();
  const counts: number[] = [];

  const cells = input.pixels.map((color) => {
    const normalized = color.toUpperCase();
    if (!colorToIndex.has(normalized)) {
      colorToIndex.set(normalized, palette.length);
      palette.push(normalized);
      counts.push(0);
    }
    const index = colorToIndex.get(normalized)!;
    counts[index] += 1;
    return index;
  });

  return {
    title: input.title,
    width: input.width,
    height: input.height,
    cells,
    previewPixels: input.pixels.map((color) => color.toUpperCase()),
    palette: palette.map((color, index) => ({
      index,
      color,
      count: counts[index] || 0,
      code: buildColorCode(index),
    })),
  };
}

// 从图纸索引还原最终成品预览。
export function materializePatternPixels(pattern: PixelPattern): string[] {
  return pattern.cells.map((paletteIndex) => pattern.palette[paletteIndex]?.color || '#000000');
}

// 从图片里抽样出有限颜色。
export function reduceImagePalette(
  pixels: Uint8ClampedArray,
  paletteSize: number,
  style: PerlerThemeStyle,
): string[] {
  const factor = STYLE_FACTORS[style];
  const palette: string[] = [];
  const seen = new Set<string>();

  for (let pixelIndex = 0; pixelIndex < pixels.length && palette.length < paletteSize; pixelIndex += 4) {
    const r = clamp(pixels[pixelIndex] * factor);
    const g = clamp(pixels[pixelIndex + 1] * factor);
    const b = clamp(pixels[pixelIndex + 2] * factor);
    const hex = toHex(r, g, b);
    if (!seen.has(hex)) {
      seen.add(hex);
      palette.push(hex);
    }
  }

  return palette.length > 0 ? palette : ['#000000'];
}

// 在受限调色板中找到最接近的颜色。
function pickNearestPaletteColor(color: { r: number; g: number; b: number }, palette: string[]): string {
  let best = palette[0] || '#000000';
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of palette) {
    const distance = colorDistance(color, hexToRgb(candidate));
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }

  return best;
}

// 使用开源 pixelizer 先做像素化，再把结果整理成拼豆图纸。
function pixelizeImportedBitmap(
  source: ImportedPerlerSource,
  paletteSize: number,
  style: PerlerThemeStyle,
): string[] {
  const options = STYLE_OPTIONS[style];
  const inputBitmap = new Pixelizer.Bitmap(source.width, source.height, source.pixels);
  const outputBitmap = new Pixelizer(
    inputBitmap,
    new Pixelizer.Options()
      .setPixelSize(1)
      .setColorDistRatio(options.colorDistRatio)
      .setClusterThreshold(options.clusterThreshold)
      .setMaxIteration(options.maxIteration)
      .setNumberOfColors(paletteSize),
  ).pixelize();

  const pixels: string[] = [];
  for (let index = 0; index < outputBitmap.data.length; index += 4) {
    const r = clamp(Number(outputBitmap.data[index]) * STYLE_FACTORS[style]);
    const g = clamp(Number(outputBitmap.data[index + 1]) * STYLE_FACTORS[style]);
    const b = clamp(Number(outputBitmap.data[index + 2]) * STYLE_FACTORS[style]);
    pixels.push(toHex(r, g, b));
  }
  return pixels;
}

// 把导入图片先转成固定图纸，再供玩家照图拼。
export function convertImageSourceToPattern(
  source: ImportedPerlerSource,
  paletteSize: number,
  style: PerlerThemeStyle,
): PixelPattern {
  const directPixels = Array.from({ length: source.width * source.height }, (_, index) => {
    const offset = index * 4;
    return toHex(
      clamp(source.pixels[offset] * STYLE_FACTORS[style]),
      clamp(source.pixels[offset + 1] * STYLE_FACTORS[style]),
      clamp(source.pixels[offset + 2] * STYLE_FACTORS[style]),
    );
  });
  const directUniqueCount = new Set(directPixels).size;

  // 对于本身颜色数不多的小图，直接保留原始像素布局，避免过度聚类把图案压坏。
  if (directUniqueCount <= paletteSize && source.width * source.height <= 4096) {
    return buildPixelPatternFromPixels({
      title: source.title,
      width: source.width,
      height: source.height,
      pixels: directPixels,
    });
  }

  const pixelized = pixelizeImportedBitmap(source, paletteSize, style);
  const palette = reduceImagePalette(Uint8ClampedArray.from(source.pixels), paletteSize, style);
  const preferredPalette = source.width >= 80 || source.height >= 80 ? boostCharacterPalette(palette) : palette;
  const normalizedPixels = pixelized.map((color) => pickNearestPaletteColor(hexToRgb(color), preferredPalette));

  return buildPixelPatternFromPixels({
    title: source.title,
    width: source.width,
    height: source.height,
    pixels: normalizedPixels,
  });
}

