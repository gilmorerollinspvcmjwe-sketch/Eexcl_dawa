import { useMemo, useCallback } from 'react';
import type { 
  VisualSystemConfig, 
  TextStyleConfig, 
  EnemyVisualConfig,
  SpawnAnimationConfig,
  ActiveAnimation,
} from '../types/visual';
import { DEFAULT_VISUAL_CONFIG, SPAWN_ANIMATION_PRESETS } from '../types/visual';
import { 
  resolveColorConfig, 
  generatePartColors, 
  generateHSVFromConfig,
} from '../utils/colorUtils';
import {
  generateSpawnAnimationStyle,
  createActiveAnimation,
  calculateAnimationProgress,
  generateAnimationCSS,
} from '../utils/animationUtils';

interface UseVisualSystemReturn {
  config: VisualSystemConfig;
  getTextStyle: (override?: Partial<TextStyleConfig>) => React.CSSProperties;
  getPartColor: (partType: string) => string;
  getSpawnAnimation: (preset?: string) => SpawnAnimationConfig;
  getSpawnAnimationStyle: (animation: ActiveAnimation) => React.CSSProperties;
  createSpawnAnimation: (preset?: string) => ActiveAnimation;
  getAnimationCSS: (config: SpawnAnimationConfig) => { animationName: string; animationCSS: string };
}

export function useVisualSystem(
  visualConfig?: VisualSystemConfig
): UseVisualSystemReturn {
  const config = visualConfig ?? DEFAULT_VISUAL_CONFIG;

  const getTextStyle = useCallback((override?: Partial<TextStyleConfig>): React.CSSProperties => {
    const mergedConfig: TextStyleConfig = {
      ...config.textStyles,
      ...override,
    };

    const style: React.CSSProperties = {
      color: resolveColorConfig(mergedConfig.color),
      fontWeight: mergedConfig.fontWeight,
      fontSize: mergedConfig.fontSize,
      fontStyle: mergedConfig.fontStyle,
      textDecoration: mergedConfig.textDecoration,
      textDecorationStyle: mergedConfig.textDecorationStyle,
      letterSpacing: mergedConfig.letterSpacing,
    };

    if (mergedConfig.textShadow) {
      style.textShadow = `${mergedConfig.textShadow.offsetX}px ${mergedConfig.textShadow.offsetY}px ${mergedConfig.textShadow.blur}px ${mergedConfig.textShadow.color}`;
    }

    return style;
  }, [config.textStyles]);

  const partColors = useMemo(() => {
    const { colorSystem } = config.enemyVisual;
    return generatePartColors(
      colorSystem.baseConfig,
      colorSystem.variations,
      colorSystem.harmonyMode
    );
  }, [config.enemyVisual]);

  const getPartColor = useCallback((partType: string): string => {
    return partColors[partType] ?? '#dc2626';
  }, [partColors]);

  const getSpawnAnimation = useCallback((preset?: string): SpawnAnimationConfig => {
    if (preset && SPAWN_ANIMATION_PRESETS[preset]) {
      return SPAWN_ANIMATION_PRESETS[preset];
    }
    return config.enemyVisual.spawnAnimation;
  }, [config.enemyVisual.spawnAnimation]);

  const getSpawnAnimationStyle = useCallback((animation: ActiveAnimation): React.CSSProperties => {
    const progress = calculateAnimationProgress(animation, performance.now());
    return generateSpawnAnimationStyle(animation.config, progress);
  }, []);

  const createSpawnAnimation = useCallback((preset?: string): ActiveAnimation => {
    const animationConfig = getSpawnAnimation(preset);
    return createActiveAnimation(animationConfig);
  }, [getSpawnAnimation]);

  const getAnimationCSS = useCallback((animationConfig: SpawnAnimationConfig) => {
    return generateAnimationCSS(animationConfig);
  }, []);

  return {
    config,
    getTextStyle,
    getPartColor,
    getSpawnAnimation,
    getSpawnAnimationStyle,
    createSpawnAnimation,
    getAnimationCSS,
  };
}

export function useEnemyVisual(
  enemyVisualConfig?: EnemyVisualConfig
) {
  const config = enemyVisualConfig ?? DEFAULT_VISUAL_CONFIG.enemyVisual;

  const colors = useMemo(() => {
    return generatePartColors(
      config.colorSystem.baseConfig,
      config.colorSystem.variations,
      config.colorSystem.harmonyMode
    );
  }, [config.colorSystem]);

  const getPartStyle = useCallback((partType: string): React.CSSProperties => {
    const partStyle = config.partStyles[partType as keyof typeof config.partStyles] ?? {};
    const baseStyle = config.baseStyle;
    
    const mergedStyle: TextStyleConfig = {
      ...baseStyle,
      ...partStyle,
    };

    const color = colors[partType] ?? resolveColorConfig(mergedStyle.color);

    return {
      color,
      fontWeight: mergedStyle.fontWeight,
      fontSize: mergedStyle.fontSize,
      fontStyle: mergedStyle.fontStyle,
      textDecoration: mergedStyle.textDecoration,
      letterSpacing: mergedStyle.letterSpacing,
    };
  }, [config, colors]);

  const spawnAnimationCSS = useMemo(() => {
    return generateAnimationCSS(config.spawnAnimation);
  }, [config.spawnAnimation]);

  return {
    config,
    colors,
    getPartStyle,
    spawnAnimationCSS,
  };
}

export function useRandomColorGenerator(
  baseConfig: Parameters<typeof generateHSVFromConfig>[0]
) {
  return useMemo(() => {
    const hsv = generateHSVFromConfig(baseConfig);
    return hsv;
  }, [baseConfig]);
}
