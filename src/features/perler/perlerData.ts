import type { PerlerFilterState, PerlerTemplate } from './perlerTypes';

function fillPixels(width: number, height: number, palette: string[]): string[] {
  return Array.from({ length: width * height }, (_, index) => palette[index % palette.length]);
}

export const perlerTemplates: PerlerTemplate[] = [
  {
    id: 'yao-32',
    title: '曜',
    category: 'games',
    tags: ['游戏', '角色', '王者风格', '战士'],
    width: 32,
    height: 32,
    difficulty: 'hard',
    pixels: fillPixels(32, 32, ['#223A6A', '#D3B277', '#F2E8C9', '#4F76D3']),
  },
  {
    id: 'office-coffee-16',
    title: '办公咖啡杯',
    category: 'office',
    tags: ['办公室', '咖啡', '工位'],
    width: 16,
    height: 16,
    difficulty: 'easy',
    pixels: fillPixels(16, 16, ['#654321', '#F3E2C7', '#FFFFFF', '#D97706']),
  },
  {
    id: 'abstract-cat-16',
    title: '咖波表情',
    category: 'abstract',
    tags: ['抽象', '表情', '网梗', '可爱'],
    width: 16,
    height: 16,
    difficulty: 'easy',
    pixels: fillPixels(16, 16, ['#7DD3FC', '#FFFFFF', '#0F172A', '#F9A8D4']),
  },
  {
    id: 'target-icon-24',
    title: '靶心图标',
    category: 'basics',
    tags: ['基础', '练枪', '靶子'],
    width: 24,
    height: 24,
    difficulty: 'medium',
    pixels: fillPixels(24, 24, ['#FFFFFF', '#DC2626', '#111827']),
  },
  {
    id: 'sheet-x-24',
    title: 'SheetX 警报',
    category: 'hidden',
    tags: ['隐藏', '工作表', '警报', '故障'],
    width: 24,
    height: 24,
    difficulty: 'medium',
    pixels: fillPixels(24, 24, ['#10B981', '#0F172A', '#FDE047']),
  },
];

export function filterPerlerTemplates(
  templates: PerlerTemplate[],
  filter: PerlerFilterState,
): PerlerTemplate[] {
  const query = filter.query.trim().toLowerCase();

  return templates.filter((template) => {
    const matchesQuery =
      !query ||
      template.title.toLowerCase().includes(query) ||
      template.tags.some((tag) => tag.toLowerCase().includes(query));

    const matchesCategory = filter.category === 'all' || template.category === filter.category;
    const matchesSize = filter.size === 'all' || String(template.width) === filter.size;
    const matchesDifficulty = filter.difficulty === 'all' || template.difficulty === filter.difficulty;

    return matchesQuery && matchesCategory && matchesSize && matchesDifficulty;
  });
}

