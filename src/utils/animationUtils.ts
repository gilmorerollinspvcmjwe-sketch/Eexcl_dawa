import type { 
  SpawnAnimationConfig, 
  EasingType, 
  ActiveAnimation,
  BlinkEffect,
  WaveEffect,
  BounceEffect,
} from '../types/visual';

export type EasingFunction = (t: number) => number;

export const EASING_FUNCTIONS: Record<EasingType, EasingFunction> = {
  'linear': (t: number) => t,
  'ease-in': (t: number) => t * t,
  'ease-out': (t: number) => t * (2 - t),
  'ease-in-out': (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  'cubic-bezier': (t: number) => {
    // Simplified cubic-bezier with default values (0.25, 0.1, 0.25, 1)
    const p1 = 0.25;
    const p3 = 0.25;
    const cx = 3 * p1;
    const bx = 3 * (p3 - p1) - cx;
    const ax = 1 - cx - bx;
    
    const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t;
    const sampleCurveY = (t: number) => ((ax * t + bx) * t + cx) * t;
    
    let t2 = t;
    for (let i = 0; i < 8; i++) {
      const x = sampleCurveX(t2) - t;
      if (Math.abs(x) < 1e-6) break;
      const d = (3 * ax * t2 + 2 * bx) * t2 + cx;
      if (Math.abs(d) < 1e-6) break;
      t2 -= x / d;
    }
    return sampleCurveY(t2);
  },
};

export function getEasingFunction(config: SpawnAnimationConfig): EasingFunction {
  if (config.easing === 'cubic-bezier' && config.customEasing) {
    return (t: number) => {
      // Simplified implementation - just use the default cubic-bezier
      return EASING_FUNCTIONS['cubic-bezier'](t);
    };
  }
  return EASING_FUNCTIONS[config.easing];
}

export function calculateAnimationProgress(
  animation: ActiveAnimation,
  currentTime: number
): number {
  const elapsed = currentTime - animation.startTime;
  const rawProgress = Math.min(1, elapsed / animation.duration);
  
  const easingFn = getEasingFunction(animation.config);
  return easingFn(rawProgress);
}

export function generateSpawnAnimationStyle(
  config: SpawnAnimationConfig,
  progress: number
): React.CSSProperties {
  const easingFn = getEasingFunction(config);
  const easedProgress = easingFn(progress);
  
  const styles: React.CSSProperties = {};
  
  if (config.combine) {
    if (config.combine.fade) {
      styles.opacity = easedProgress;
    }
    
    if (config.combine.scale) {
      const { from, to } = config.combine.scale;
      const scale = from + (to - from) * easedProgress;
      styles.transform = `scale(${scale})`;
    }
    
    if (config.combine.translate) {
      const { x, y } = config.combine.translate;
      const translateX = x * (1 - easedProgress);
      const translateY = y * (1 - easedProgress);
      styles.transform = styles.transform 
        ? `${styles.transform} translate(${translateX}px, ${translateY}px)`
        : `translate(${translateX}px, ${translateY}px)`;
    }
    
    if (config.combine.rotate) {
      const { from, to } = config.combine.rotate;
      const rotate = from + (to - from) * easedProgress;
      styles.transform = styles.transform 
        ? `${styles.transform} rotate(${rotate}deg)`
        : `rotate(${rotate}deg)`;
    }
  } else {
    switch (config.type) {
      case 'fade':
        styles.opacity = easedProgress;
        break;
      case 'scale':
        styles.transform = `scale(${easedProgress})`;
        styles.opacity = easedProgress;
        break;
      case 'slide':
        styles.transform = `translateY(${(1 - easedProgress) * 30}px)`;
        styles.opacity = easedProgress;
        break;
      case 'bounce':
        const bounceProgress = easedProgress < 0.5
          ? 4 * easedProgress * easedProgress * easedProgress
          : 1 - Math.pow(-2 * easedProgress + 2, 3) / 2;
        styles.transform = `scale(${0.3 + 0.7 * bounceProgress})`;
        styles.opacity = bounceProgress;
        break;
      case 'flip':
        styles.transform = `rotateY(${(1 - easedProgress) * 90}deg)`;
        styles.opacity = easedProgress;
        break;
    }
  }
  
  return styles;
}

export function generateFlashStyle(
  config: SpawnAnimationConfig,
  currentTime: number,
  startTime: number
): { backgroundColor?: string; filter?: string } {
  if (!config.flash) return {};
  
  const elapsed = currentTime - startTime;
  const { count, interval, colors } = config.flash;
  const totalFlashDuration = count * interval;
  
  if (elapsed > totalFlashDuration) return {};
  
  const flashIndex = Math.floor(elapsed / interval);
  const colorIndex = flashIndex % colors.length;
  
  return {
    backgroundColor: colors[colorIndex],
    filter: 'brightness(1.3)',
  };
}

export function generateBlinkEffect(
  effect: BlinkEffect,
  currentTime: number
): { opacity: number; color?: string } {
  const period = 1000 / effect.frequency;
  const phase = (currentTime % period) / period;
  
  const opacity = effect.minOpacity + 
    (effect.maxOpacity - effect.minOpacity) * (Math.sin(phase * Math.PI * 2) * 0.5 + 0.5);
  
  const result: { opacity: number; color?: string } = { opacity };
  
  if (effect.colorShift) {
    const colorPhase = Math.sin(phase * Math.PI * 2) * 0.5 + 0.5;
    result.color = interpolateHexColors(
      effect.colorShift.fromColor,
      effect.colorShift.toColor,
      colorPhase
    );
  }
  
  return result;
}

export function generateWaveEffect(
  effect: WaveEffect,
  currentTime: number,
  charIndex: number,
  totalChars: number
): React.CSSProperties {
  const period = 1000 / effect.frequency;
  const phase = (currentTime % period) / period;
  
  const offset = charIndex / totalChars;
  const wavePhase = (phase + offset) * Math.PI * 2;
  
  const displacement = Math.sin(wavePhase) * effect.amplitude;
  
  if (effect.direction === 'vertical') {
    return { transform: `translateY(${displacement}px)` };
  } else {
    return { transform: `translateX(${displacement}px)` };
  }
}

export function generateBounceEffect(
  effect: BounceEffect,
  currentTime: number
): React.CSSProperties {
  const period = 1000 / effect.speed;
  const phase = (currentTime % period) / period;
  
  const bounce = Math.abs(Math.sin(phase * Math.PI));
  const displacement = bounce * effect.height;
  
  return { transform: `translateY(${-displacement}px)` };
}

function interpolateHexColors(color1: string, color2: string, factor: number): string {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);
  
  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);
  
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function generateCSSKeyframes(config: SpawnAnimationConfig): string {
  const keyframeName = `spawn-${config.type}-${Date.now()}`;
  
  switch (config.type) {
    case 'fade':
      return `
        @keyframes ${keyframeName} {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `;
    case 'scale':
      return `
        @keyframes ${keyframeName} {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `;
    case 'bounce':
      return `
        @keyframes ${keyframeName} {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.1); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
      `;
    default:
      return `
        @keyframes ${keyframeName} {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
      `;
  }
}

export function generateAnimationCSS(
  config: SpawnAnimationConfig
): { animationName: string; animationCSS: string } {
  const animationName = `enemy-spawn-${config.type}`;
  const duration = config.duration;
  const easing = config.easing === 'cubic-bezier' && config.customEasing
    ? `cubic-bezier(${config.customEasing.join(', ')})`
    : config.easing;
  
  switch (config.type) {
    case 'fade':
      break;
    case 'scale':
      break;
    case 'slide':
      break;
    case 'bounce':
      break;
    case 'flip':
      break;
    default:
      break;
  }
  
  const animationCSS = `${animationName} ${duration}ms ${easing} forwards`;
  
  return { animationName, animationCSS };
}

export function createActiveAnimation(
  config: SpawnAnimationConfig
): ActiveAnimation {
  return {
    id: `anim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: config.type,
    startTime: performance.now(),
    duration: config.duration,
    progress: 0,
    config,
  };
}

export function isAnimationComplete(animation: ActiveAnimation): boolean {
  return animation.progress >= 1;
}
