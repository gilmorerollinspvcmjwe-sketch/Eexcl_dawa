/* 三消模块音效工具。使用 Web Audio API 生成合成音效。 */

import { getAudioContext } from './soundUtils';

const SOUND_GAIN = 0.15;
const SWAP_VALID_FREQ = 520;
const SWAP_INVALID_FREQ = 180;
const MATCH_BASE_FREQ = 440;
const CHAIN_FREQ_STEP = 80;
const SPECIAL_TRIGGER_FREQ = 660;
const OBSTACLE_BREAK_FREQ = 300;
const WIN_FREQ = 880;
const LOSE_FREQ = 220;

export function playMatch3SwapSound(isValid: boolean, soundEnabled: boolean): void {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const freq = isValid ? SWAP_VALID_FREQ : SWAP_INVALID_FREQ;
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

    if (isValid) {
      oscillator.frequency.exponentialRampToValueAtTime(freq * 1.2, ctx.currentTime + 0.08);
      oscillator.type = 'sine';
    } else {
      oscillator.frequency.exponentialRampToValueAtTime(freq * 0.8, ctx.currentTime + 0.1);
      oscillator.type = 'square';
    }

    gainNode.gain.setValueAtTime(SOUND_GAIN, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.12);
  } catch {
    // 忽略浏览器音频上下文不可用的情况
  }
}

export function playMatch3MatchSound(matchLength: number, soundEnabled: boolean): void {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const freqMultiplier = matchLength >= 5 ? 1.5 : matchLength === 4 ? 1.25 : 1;
    oscillator.frequency.setValueAtTime(MATCH_BASE_FREQ * freqMultiplier, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(MATCH_BASE_FREQ * freqMultiplier * 1.3, ctx.currentTime + 0.1);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(SOUND_GAIN, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  } catch {
    // 忽略浏览器音频上下文不可用的情况
  }
}

export function playMatch3ChainSound(chainLevel: number, soundEnabled: boolean): void {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const baseFreq = MATCH_BASE_FREQ + CHAIN_FREQ_STEP * chainLevel;
    oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, ctx.currentTime + 0.08);
    oscillator.type = 'triangle';

    const gainValue = SOUND_GAIN * (1 + chainLevel * 0.1);
    gainNode.gain.setValueAtTime(Math.min(gainValue, 0.25), ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.18);
  } catch {
    // 忽略浏览器音频上下文不可用的情况
  }
}

export function playMatch3SpecialTriggerSound(specialType: string, soundEnabled: boolean): void {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    let freq = SPECIAL_TRIGGER_FREQ;
    let duration = 0.2;
    let type: OscillatorType = 'sine';

    if (specialType === 'striped-h' || specialType === 'striped-v') {
      freq = 580;
      duration = 0.18;
      type = 'triangle';
    } else if (specialType === 'wrapped') {
      freq = 620;
      duration = 0.25;
      type = 'sine';
    } else if (specialType === 'colorBomb') {
      freq = 720;
      duration = 0.35;
      type = 'sine';
    }

    oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(freq * 2, ctx.currentTime + duration * 0.5);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(SOUND_GAIN * 1.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // 忽略浏览器音频上下文不可用的情况
  }
}

export function playMatch3ObstacleBreakSound(obstacleType: string, soundEnabled: boolean): void {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    let freq = OBSTACLE_BREAK_FREQ;
    let duration = 0.15;
    let type: OscillatorType = 'square';

    if (obstacleType === 'frost1' || obstacleType === 'frost2') {
      freq = 400;
      duration = 0.12;
      type = 'sine';
    } else if (obstacleType === 'chain') {
      freq = 350;
      duration = 0.18;
      type = 'triangle';
    } else if (obstacleType === 'box') {
      freq = 280;
      duration = 0.2;
      type = 'square';
    } else if (obstacleType === 'stone') {
      freq = 200;
      duration = 0.25;
      type = 'sawtooth';
    }

    oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + duration);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(SOUND_GAIN * 0.8, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // 忽略浏览器音频上下文不可用的情况
  }
}

export function playMatch3WinSound(soundEnabled: boolean): void {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();

    const notes = [WIN_FREQ, WIN_FREQ * 1.25, WIN_FREQ * 1.5];
    const durations = [0.15, 0.15, 0.25];

    let startTime = ctx.currentTime;
    for (let i = 0; i < notes.length; i++) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(notes[i], startTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(SOUND_GAIN * 1.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + durations[i]);

      oscillator.start(startTime);
      oscillator.stop(startTime + durations[i]);

      startTime += durations[i];
    }
  } catch {
    // 忽略浏览器音频上下文不可用的情况
  }
}

export function playMatch3LoseSound(soundEnabled: boolean): void {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();

    const notes = [LOSE_FREQ * 1.5, LOSE_FREQ, LOSE_FREQ * 0.8];
    const durations = [0.2, 0.25, 0.35];

    let startTime = ctx.currentTime;
    for (let i = 0; i < notes.length; i++) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(notes[i], startTime);
      oscillator.frequency.exponentialRampToValueAtTime(notes[i] * 0.7, startTime + durations[i]);
      oscillator.type = 'sawtooth';

      gainNode.gain.setValueAtTime(SOUND_GAIN * 0.9, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + durations[i]);

      oscillator.start(startTime);
      oscillator.stop(startTime + durations[i]);

      startTime += durations[i];
    }
  } catch {
    // 忽略浏览器音频上下文不可用的情况
  }
}

export function playMatch3ComboSound(comboLevel: number, soundEnabled: boolean): void {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const freq = MATCH_BASE_FREQ + CHAIN_FREQ_STEP * (comboLevel + 1);
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(freq * 1.6, ctx.currentTime + 0.1);
    oscillator.type = 'triangle';

    const gainValue = SOUND_GAIN * (1.2 + comboLevel * 0.15);
    gainNode.gain.setValueAtTime(Math.min(gainValue, 0.3), ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  } catch {
    // 忽略浏览器音频上下文不可用的情况
  }
}
