// 音效工具模块 - 单例模式管理 AudioContext

import {
  HIT_SOUND_FREQUENCY,
  HEADSHOT_SOUND_FREQUENCY,
  COMBO_SOUND_FREQUENCY,
  MISS_SOUND_FREQUENCY,
  SOUND_GAIN,
  MISS_SOUND_GAIN,
} from '../constants';

// 单例 AudioContext
let audioContext: AudioContext | null = null;

/**
 * 获取或创建 AudioContext 实例
 */
export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * 播放命中音效
 * @param isHeadshot 是否为爆头
 * @param combo 当前连击数
 * @param soundEnabled 是否启用音效
 */
export function playHitSound(isHeadshot: boolean, combo: number, soundEnabled: boolean): void {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // 不同命中类型不同音效
    if (isHeadshot) {
      oscillator.frequency.setValueAtTime(HEADSHOT_SOUND_FREQUENCY, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(HEADSHOT_SOUND_FREQUENCY * 2, ctx.currentTime + 0.1);
    } else if (combo >= 10) {
      oscillator.frequency.setValueAtTime(COMBO_SOUND_FREQUENCY, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(COMBO_SOUND_FREQUENCY * 2, ctx.currentTime + 0.08);
    } else {
      oscillator.frequency.setValueAtTime(HIT_SOUND_FREQUENCY, ctx.currentTime);
    }

    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(SOUND_GAIN, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  } catch {
    // 音频播放失败，静默处理
  }
}

/**
 * 播放未命中音效
 * @param soundEnabled 是否启用音效
 */
export function playMissSound(soundEnabled: boolean): void {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(MISS_SOUND_FREQUENCY, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(MISS_SOUND_FREQUENCY / 2, ctx.currentTime + 0.1);
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(MISS_SOUND_GAIN, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  } catch {
    // 静默处理
  }
}

/**
 * 重置 AudioContext（用于清理）
 */
export function resetAudioContext(): void {
  if (audioContext) {
    audioContext.close().catch(() => {});
    audioContext = null;
  }
}