import type { ImportedPerlerSource, PerlerTemplate, PerlerThemeStyle } from './perlerTypes';

const STYLE_FACTORS: Record<PerlerThemeStyle, number> = {
  standard: 1,
  contrast: 1.25,
  soft: 0.85,
  retro: 1.1,
};

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function toHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b
    .toString(16)
    .padStart(2, '0')}`.toUpperCase();
}

export function reduceImagePalette(
  pixels: Uint8ClampedArray,
  paletteSize: number,
  style: PerlerThemeStyle,
): string[] {
  const stride = Math.max(1, Math.floor(pixels.length / 4 / Math.max(1, paletteSize)));
  const factor = STYLE_FACTORS[style];
  const palette: string[] = [];

  for (let pixelIndex = 0; pixelIndex < pixels.length && palette.length < paletteSize; pixelIndex += stride * 4) {
    const r = clamp(pixels[pixelIndex] * factor);
    const g = clamp(pixels[pixelIndex + 1] * factor);
    const b = clamp(pixels[pixelIndex + 2] * factor);
    const hex = toHex(r, g, b);
    if (!palette.includes(hex)) {
      palette.push(hex);
    }
  }

  return palette.length > 0 ? palette : ['#000000'];
}

export function convertImageSourceToTemplate(
  source: ImportedPerlerSource,
  paletteSize: number,
  style: PerlerThemeStyle,
): PerlerTemplate {
  const palette = reduceImagePalette(source.pixels, paletteSize, style);
  const pixels = Array.from({ length: source.width * source.height }, (_, index) => palette[index % palette.length]);

  return {
    id: `imported-${source.title.toLowerCase().replace(/\s+/g, '-')}`,
    title: source.title,
    category: 'abstract',
    tags: ['导入', '自定义', style],
    width: source.width,
    height: source.height,
    difficulty: source.width >= 32 ? 'hard' : source.width >= 24 ? 'medium' : 'easy',
    pixels,
  };
}

