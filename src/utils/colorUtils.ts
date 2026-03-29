import type { HSVColorConfig, ColorHarmonyMode, ColorConfig } from '../types/visual';
import { PRESET_COLORS } from '../types/visual';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSV {
  h: number;
  s: number;
  v: number;
}

export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

export function rgbToHsv(rgb: RGB): HSV {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  const s = max === 0 ? 0 : diff / max;
  const v = max;

  if (diff !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / diff + 2) / 6;
        break;
      case b:
        h = ((r - g) / diff + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

export function hsvToRgb(hsv: HSV): RGB {
  const h = hsv.h / 360;
  const s = hsv.s / 100;
  const v = hsv.v / 100;

  let r = 0, g = 0, b = 0;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v; g = t; b = p;
      break;
    case 1:
      r = q; g = v; b = p;
      break;
    case 2:
      r = p; g = v; b = t;
      break;
    case 3:
      r = p; g = q; b = v;
      break;
    case 4:
      r = t; g = p; b = v;
      break;
    case 5:
      r = v; g = p; b = q;
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function generateRandomInRange(range: [number, number]): number {
  return Math.random() * (range[1] - range[0]) + range[0];
}

export function generateHSVFromConfig(config: HSVColorConfig): HSV {
  const h = config.h.mode === 'fixed' 
    ? (config.h.value ?? 0)
    : config.h.mode === 'random'
      ? Math.random() * 360
      : generateRandomInRange(config.h.range ?? [0, 360]);

  const s = config.s.mode === 'fixed'
    ? (config.s.value ?? 80)
    : config.s.mode === 'random'
      ? Math.random() * 100
      : generateRandomInRange(config.s.range ?? [0, 100]);

  const v = config.v.mode === 'fixed'
    ? (config.v.value ?? 90)
    : config.v.mode === 'random'
      ? Math.random() * 100
      : generateRandomInRange(config.v.range ?? [0, 100]);

  return { h, s, v };
}

export function getHarmonyColors(baseH: number, mode: ColorHarmonyMode): number[] {
  switch (mode) {
    case 'complementary':
      return [baseH, (baseH + 180) % 360];
    case 'analogous':
      return [baseH, (baseH + 30) % 360, (baseH + 330) % 360];
    case 'triadic':
      return [baseH, (baseH + 120) % 360, (baseH + 240) % 360];
    case 'split-complementary':
      return [baseH, (baseH + 150) % 360, (baseH + 210) % 360];
    case 'none':
    default:
      return [baseH];
  }
}

export function generateHarmonyColorSet(
  baseConfig: HSVColorConfig,
  harmonyMode: ColorHarmonyMode
): HSV[] {
  const baseHSV = generateHSVFromConfig(baseConfig);
  const harmonyHues = getHarmonyColors(baseHSV.h, harmonyMode);
  
  return harmonyHues.map(h => ({
    ...baseHSV,
    h,
  }));
}

export function resolveColorConfig(config: ColorConfig): string {
  if (config.mode === 'preset' && config.preset) {
    const preset = PRESET_COLORS.find(p => p.id === config.preset);
    return preset?.value ?? '#dc2626';
  }
  
  if (config.mode === 'custom' && config.custom) {
    const { r, g, b, a } = config.custom;
    if (a !== undefined && a < 1) {
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    return rgbToHex({ r, g, b });
  }
  
  return '#dc2626';
}

export function generatePartColors(
  baseConfig: HSVColorConfig,
  variations: Record<string, Partial<HSVColorConfig>>,
  harmonyMode: ColorHarmonyMode
): Record<string, string> {
  const baseHSV = generateHSVFromConfig(baseConfig);
  const harmonyHues = getHarmonyColors(baseHSV.h, harmonyMode);
  
  const partTypes = ['head', 'body', 'leftHand', 'rightHand', 'foot'];
  const colors: Record<string, string> = {};
  
  partTypes.forEach((partType, index) => {
    const variation = variations[partType] || variations.hands || {};
    
    const partConfig: HSVColorConfig = {
      h: variation.h ?? { mode: 'fixed', value: harmonyHues[index % harmonyHues.length] },
      s: variation.s ?? { mode: 'fixed', value: baseHSV.s },
      v: variation.v ?? { mode: 'fixed', value: baseHSV.v },
    };
    
    const partHSV = generateHSVFromConfig(partConfig);
    const partRGB = hsvToRgb(partHSV);
    colors[partType] = rgbToHex(partRGB);
  });
  
  return colors;
}

export function interpolateColor(color1: string, color2: string, factor: number): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);
  
  return rgbToHex({ r, g, b });
}

export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  const factor = percent / 100;
  
  return rgbToHex({
    r: Math.round(rgb.r + (255 - rgb.r) * factor),
    g: Math.round(rgb.g + (255 - rgb.g) * factor),
    b: Math.round(rgb.b + (255 - rgb.b) * factor),
  });
}

export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  const factor = 1 - percent / 100;
  
  return rgbToHex({
    r: Math.round(rgb.r * factor),
    g: Math.round(rgb.g * factor),
    b: Math.round(rgb.b * factor),
  });
}
