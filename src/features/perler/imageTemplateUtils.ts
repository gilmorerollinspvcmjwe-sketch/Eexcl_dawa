import type { ImportedPerlerSource, PerlerTemplate, PerlerThemeStyle, PerlerVividness } from './perlerTypes';
import { convertImageSourceToPattern } from './pixelPatternParser.ts';
export { reduceImagePalette } from './pixelPatternParser.ts';

// 将导入图片包装成拼豆模板对象，内部使用真正的图纸解析器。
export function convertImageSourceToTemplate(
  source: ImportedPerlerSource,
  paletteSize: number,
  style: PerlerThemeStyle,
  vividness: PerlerVividness = 'vivid',
): PerlerTemplate {
  const pattern = convertImageSourceToPattern(source, paletteSize, style, vividness);

  return {
    id: `imported-${source.title.toLowerCase().replace(/\s+/g, '-')}`,
    title: source.title,
    category: 'abstract',
    tags: ['导入', '自定义', style],
    width: source.width,
    height: source.height,
    difficulty: source.width >= 32 ? 'hard' : source.width >= 24 ? 'medium' : 'easy',
    pixels: pattern.previewPixels,
    pattern,
  };
}
