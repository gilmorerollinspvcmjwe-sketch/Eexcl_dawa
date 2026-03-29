export interface ColorConfig {
  mode: 'preset' | 'custom';
  preset?: string;
  custom?: {
    r: number;
    g: number;
    b: number;
    a?: number;
  };
}

export interface TextShadowConfig {
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
}

export interface TextStyleConfig {
  color: ColorConfig;
  fontWeight: 'normal' | 'bold' | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  fontSize: number;
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  textDecorationStyle?: 'solid' | 'dashed' | 'dotted';
  letterSpacing: number;
  textShadow?: TextShadowConfig;
}

export interface BlinkEffect {
  type: 'blink';
  frequency: number;
  minOpacity: number;
  maxOpacity: number;
  colorShift?: {
    fromColor: string;
    toColor: string;
  };
}

export interface GradientColorStop {
  color: string;
  position: number;
}

export interface GradientEffect {
  type: 'gradient';
  gradientType: 'linear' | 'radial';
  colors: GradientColorStop[];
  angle?: number;
  animated?: boolean;
  animationSpeed?: number;
  animationDirection?: 'forward' | 'reverse' | 'alternate';
}

export interface TypewriterEffect {
  type: 'typewriter';
  speed: number;
  cursor?: {
    show: boolean;
    char: string;
    blinkSpeed: number;
  };
  onComplete?: 'hide' | 'stay' | 'loop';
  delay?: number;
}

export interface WaveEffect {
  type: 'wave';
  amplitude: number;
  frequency: number;
  direction: 'horizontal' | 'vertical';
}

export interface GlitchEffect {
  type: 'glitch';
  intensity: number;
  colorOffset: string;
  frequency: number;
}

export interface BounceEffect {
  type: 'bounce';
  height: number;
  speed: number;
}

export type TextEffect = BlinkEffect | GradientEffect | TypewriterEffect | WaveEffect | GlitchEffect | BounceEffect;

export interface TextEffectConfig {
  effects: TextEffect[];
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay';
  globalTiming?: 'sync' | 'stagger' | 'random';
}

export interface HSVColorConfig {
  h: {
    mode: 'fixed' | 'random' | 'range';
    value?: number;
    range?: [number, number];
  };
  s: {
    mode: 'fixed' | 'random' | 'range';
    value?: number;
    range?: [number, number];
  };
  v: {
    mode: 'fixed' | 'random' | 'range';
    value?: number;
    range?: [number, number];
  };
}

export type ColorHarmonyMode = 'complementary' | 'analogous' | 'triadic' | 'split-complementary' | 'none';

export interface RandomColorGenerator {
  baseConfig: HSVColorConfig;
  variations: {
    head: Partial<HSVColorConfig>;
    body: Partial<HSVColorConfig>;
    hands: Partial<HSVColorConfig>;
    foot: Partial<HSVColorConfig>;
  };
  harmonyMode: ColorHarmonyMode;
}

export type SpawnAnimationType = 'fade' | 'scale' | 'slide' | 'bounce' | 'flip' | 'custom';

export type EasingType = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier';

export interface SpawnAnimationConfig {
  type: SpawnAnimationType;
  duration: number;
  easing: EasingType;
  customEasing?: [number, number, number, number];
  combine?: {
    fade: boolean;
    scale: { from: number; to: number };
    translate?: { x: number; y: number };
    rotate?: { from: number; to: number };
  };
  flash?: {
    count: number;
    interval: number;
    colors: string[];
  };
}

export interface AnimationConfig {
  duration: number;
  easing: EasingType;
  properties: Record<string, { from: any; to: any }>;
}

export interface EnemyVisualConfig {
  baseStyle: TextStyleConfig;
  partStyles: {
    head: Partial<TextStyleConfig>;
    body: Partial<TextStyleConfig>;
    leftHand: Partial<TextStyleConfig>;
    rightHand: Partial<TextStyleConfig>;
    foot: Partial<TextStyleConfig>;
  };
  colorSystem: RandomColorGenerator;
  spawnAnimation: SpawnAnimationConfig;
  stateAnimations: {
    damaged: AnimationConfig;
    critical: AnimationConfig;
    dying: AnimationConfig;
  };
  idleEffects: TextEffectConfig;
}

export interface VisualSystemConfig {
  textStyles: TextStyleConfig;
  effects: TextEffectConfig;
  enemyVisual: EnemyVisualConfig;
}

export interface ActiveAnimation {
  id: string;
  type: string;
  startTime: number;
  duration: number;
  progress: number;
  config: SpawnAnimationConfig;
}

export const PRESET_COLORS = [
  { id: 'red', name: '红色', value: '#dc2626' },
  { id: 'orange', name: '橙色', value: '#f97316' },
  { id: 'yellow', name: '黄色', value: '#eab308' },
  { id: 'green', name: '绿色', value: '#22c55e' },
  { id: 'cyan', name: '青色', value: '#06b6d4' },
  { id: 'blue', name: '蓝色', value: '#3b82f6' },
  { id: 'purple', name: '紫色', value: '#8b5cf6' },
  { id: 'pink', name: '粉色', value: '#ec4899' },
  { id: 'white', name: '白色', value: '#ffffff' },
  { id: 'black', name: '黑色', value: '#000000' },
] as const;

export const SPAWN_ANIMATION_PRESETS: Record<string, SpawnAnimationConfig> = {
  none: {
    type: 'fade',
    duration: 0,
    easing: 'linear',
  },
  fadeIn: {
    type: 'fade',
    duration: 300,
    easing: 'ease-out',
  },
  popIn: {
    type: 'scale',
    duration: 250,
    easing: 'cubic-bezier',
    customEasing: [0.175, 0.885, 0.32, 1.275],
    combine: { fade: true, scale: { from: 0, to: 1 } },
  },
  slideUp: {
    type: 'slide',
    duration: 400,
    easing: 'ease-out',
    combine: { 
      fade: true, 
      scale: { from: 1, to: 1 },
      translate: { x: 0, y: 30 } 
    },
  },
  bounceIn: {
    type: 'bounce',
    duration: 600,
    easing: 'ease-out',
    combine: { fade: true, scale: { from: 0.3, to: 1 } },
  },
  flashIn: {
    type: 'fade',
    duration: 500,
    easing: 'ease-out',
    flash: { count: 3, interval: 80, colors: ['#fff', '#dc2626', '#f97316'] },
  },
};

export const DEFAULT_TEXT_STYLE: TextStyleConfig = {
  color: { mode: 'preset', preset: 'red' },
  fontWeight: 'bold',
  fontSize: 14,
  fontStyle: 'normal',
  textDecoration: 'none',
  letterSpacing: 0,
};

export const DEFAULT_HSV_CONFIG: HSVColorConfig = {
  h: { mode: 'fixed', value: 0 },
  s: { mode: 'fixed', value: 80 },
  v: { mode: 'fixed', value: 90 },
};

export const DEFAULT_COLOR_GENERATOR: RandomColorGenerator = {
  baseConfig: DEFAULT_HSV_CONFIG,
  variations: {
    head: {},
    body: {},
    hands: {},
    foot: {},
  },
  harmonyMode: 'none',
};

export const DEFAULT_VISUAL_CONFIG: VisualSystemConfig = {
  textStyles: DEFAULT_TEXT_STYLE,
  effects: { effects: [] },
  enemyVisual: {
    baseStyle: DEFAULT_TEXT_STYLE,
    partStyles: {
      head: {},
      body: {},
      leftHand: {},
      rightHand: {},
      foot: {},
    },
    colorSystem: DEFAULT_COLOR_GENERATOR,
    spawnAnimation: SPAWN_ANIMATION_PRESETS.popIn,
    stateAnimations: {
      damaged: { duration: 200, easing: 'ease-out', properties: { opacity: { from: 0.5, to: 1 } } },
      critical: { duration: 300, easing: 'ease-in-out', properties: { scale: { from: 1.05, to: 1 } } },
      dying: { duration: 400, easing: 'ease-out', properties: { opacity: { from: 1, to: 0 }, scale: { from: 1, to: 1.2 } } },
    },
    idleEffects: { effects: [] },
  },
};
