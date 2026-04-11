import Pixelizer from 'image-pixelizer';
import type { ImportedPerlerSource, PerlerThemeStyle, PerlerVividness, PixelPattern } from './perlerTypes';

const STYLE_FACTORS: Record<PerlerThemeStyle, number> = {
  standard: 1,
  contrast: 1.25,
  soft: 0.85,
  retro: 1.1,
};

const VIVIDNESS_FACTORS: Record<PerlerVividness, { saturation: number; saturationBoost: number; lightness: number; lightnessBoost: number }> = {
  standard: { saturation: 1.08, saturationBoost: 0.02, lightness: 1.01, lightnessBoost: 0.005 },
  vivid: { saturation: 1.28, saturationBoost: 0.06, lightness: 1.04, lightnessBoost: 0.015 },
  ultra: { saturation: 1.45, saturationBoost: 0.1, lightness: 1.07, lightnessBoost: 0.02 },
};

const STYLE_OPTIONS: Record<PerlerThemeStyle, { colorDistRatio: number; clusterThreshold: number; maxIteration: number }> = {
  standard: { colorDistRatio: 0.62, clusterThreshold: 0.01, maxIteration: 10 },
  contrast: { colorDistRatio: 0.78, clusterThreshold: 0.008, maxIteration: 12 },
  soft: { colorDistRatio: 0.52, clusterThreshold: 0.012, maxIteration: 8 },
  retro: { colorDistRatio: 0.68, clusterThreshold: 0.01, maxIteration: 10 },
};

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function toHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '');
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

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

function buildColorCode(index: number): string {
  return `C${String(index + 1).padStart(2, '0')}`;
}

function isDarkColor(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  return Math.max(r, g, b) < 70;
}

function isVividColor(hex: string): boolean {
  const hsl = rgbToHsl(hexToRgb(hex));
  return hsl.s >= 0.3 && hsl.l >= 0.18 && hsl.l <= 0.82;
}

export function capDarkPaletteEntries(colors: string[], paletteSize: number): string[] {
  const uniqueColors = Array.from(new Set(colors.map((color) => color.toUpperCase())));
  if (uniqueColors.length <= paletteSize) {
    return uniqueColors;
  }

  const darkColors = uniqueColors.filter(isDarkColor);
  const vividColors = uniqueColors.filter((color) => !isDarkColor(color) && isVividColor(color));
  const otherColors = uniqueColors.filter((color) => !darkColors.includes(color) && !vividColors.includes(color));

  const maxDark = Math.max(2, Math.floor(paletteSize * 0.35));
  const minVivid = Math.min(vividColors.length, Math.max(2, Math.ceil(paletteSize * 0.35)));

  const result: string[] = [];
  result.push(...vividColors.slice(0, minVivid));
  result.push(...otherColors.slice(0, Math.max(0, paletteSize - result.length - maxDark)));
  if (result.length < paletteSize - maxDark) {
    result.push(
      ...vividColors
        .slice(minVivid)
        .slice(0, Math.max(0, paletteSize - maxDark - result.length)),
    );
  }
  result.push(...darkColors.slice(0, Math.max(0, Math.min(maxDark, paletteSize - result.length))));
  if (result.length < paletteSize) {
    const currentDarkCount = result.filter(isDarkColor).length;
    const leftovers = uniqueColors.filter((color) => {
      if (result.includes(color)) return false;
      if (isDarkColor(color) && currentDarkCount >= maxDark) return false;
      return true;
    });
    result.push(...leftovers.slice(0, paletteSize - result.length));
  }

  return result.slice(0, paletteSize);
}

export function boostCharacterPalette(colors: string[], vividness: PerlerVividness = 'vivid'): string[] {
  const config = VIVIDNESS_FACTORS[vividness];
  return colors.map((hex) => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb);
    if (hsl.s < 0.08) return hex.toUpperCase();

    const boosted = {
      h: hsl.h,
      s: Math.min(1, hsl.s * config.saturation + config.saturationBoost),
      l: Math.min(0.82, hsl.l * config.lightness + config.lightnessBoost),
    };
    const vivid = hslToRgb(boosted);
    return toHex(vivid.r, vivid.g, vivid.b);
  });
}

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

export function materializePatternPixels(pattern: PixelPattern): string[] {
  return pattern.cells.map((paletteIndex) => pattern.palette[paletteIndex]?.color || '#000000');
}

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

export function convertImageSourceToPattern(
  source: ImportedPerlerSource,
  paletteSize: number,
  style: PerlerThemeStyle,
  vividness: PerlerVividness = 'vivid',
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

  if (directUniqueCount <= paletteSize && source.width * source.height <= 4096) {
    const directPalette = source.width >= 80 || source.height >= 80
      ? boostCharacterPalette(capDarkPaletteEntries(directPixels, paletteSize), vividness)
      : capDarkPaletteEntries(directPixels, paletteSize);
    const normalizedPixels = directPixels.map((color) => pickNearestPaletteColor(hexToRgb(color), directPalette));
    return buildPixelPatternFromPixels({
      title: source.title,
      width: source.width,
      height: source.height,
      pixels: normalizedPixels,
    });
  }

  const pixelized = pixelizeImportedBitmap(source, paletteSize, style);
  const palette = reduceImagePalette(Uint8ClampedArray.from(source.pixels), paletteSize, style);
  const cappedPalette = capDarkPaletteEntries(palette, paletteSize);
  const preferredPalette = source.width >= 80 || source.height >= 80
    ? boostCharacterPalette(cappedPalette, vividness)
    : cappedPalette;
  const normalizedPixels = pixelized.map((color) => pickNearestPaletteColor(hexToRgb(color), preferredPalette));

  return buildPixelPatternFromPixels({
    title: source.title,
    width: source.width,
    height: source.height,
    pixels: normalizedPixels,
  });
}
