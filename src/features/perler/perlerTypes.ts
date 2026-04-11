export type PerlerCategory = 'all' | 'basics' | 'office' | 'games' | 'abstract' | 'hidden';
export type PerlerDifficulty = 'all' | 'easy' | 'medium' | 'hard';
export type PerlerSizeFilter = 'all' | '16' | '24' | '32' | '48';
export type PerlerThemeStyle = 'standard' | 'contrast' | 'soft' | 'retro';

export interface PerlerTemplate {
  id: string;
  title: string;
  category: Exclude<PerlerCategory, 'all'>;
  tags: string[];
  width: number;
  height: number;
  difficulty: Exclude<PerlerDifficulty, 'all'>;
  pixels: string[];
}

export interface PerlerFilterState {
  query: string;
  category: PerlerCategory;
  size: PerlerSizeFilter;
  difficulty: PerlerDifficulty;
}

export interface PerlerWorkspace {
  id: string;
  title: string;
  width: number;
  height: number;
  pixels: string[];
  userPixels: (string | null)[];
  filledCount: number;
  completion: number;
}

export interface ImportedPerlerSource {
  title: string;
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
}

