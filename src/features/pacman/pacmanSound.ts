/* 吃豆人音效系统。负责吃豆、能量豆、吃鬼、水果、死亡、预警、结算等音效。 */

let audioContext: AudioContext | null = null;
let consecutivePelletCount = 0;
let lastPelletTime = 0;

const PELLET_TIMEOUT_MS = 500;

export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

export function resetAudioContext(): void {
  if (audioContext) {
    audioContext.close().catch(() => {
      return;
    });
    audioContext = null;
  }
  consecutivePelletCount = 0;
  lastPelletTime = 0;
}

export function playPelletSound(soundEnabled: boolean): void {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();
    const now = Date.now();

    if (now - lastPelletTime > PELLET_TIMEOUT_MS) {
      consecutivePelletCount = 0;
    }
    consecutivePelletCount++;
    lastPelletTime = now;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const baseFreq = 400;
    const pitchMultiplier = Math.min(1 + (consecutivePelletCount % 10) * 0.05, 1.5);
    oscillator.frequency.setValueAtTime(baseFreq * pitchMultiplier, ctx.currentTime);
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  } catch {
    return;
  }
}

export function playEnergizerSound(soundEnabled: boolean): void {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();

    const oscillator1 = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator1.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator1.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2);
    oscillator1.type = 'sine';

    oscillator2.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator2.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.2);
    oscillator2.type = 'sine';

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator1.start(ctx.currentTime);
    oscillator2.start(ctx.currentTime);
    oscillator1.stop(ctx.currentTime + 0.3);
    oscillator2.stop(ctx.currentTime + 0.3);
  } catch {
    return;
  }
}

export function playGhostEatSound(soundEnabled: boolean, ghostsEatenCount: number): void {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const baseFreq = 500;
    const pitchMultiplier = 1 + ghostsEatenCount * 0.2;
    oscillator.frequency.setValueAtTime(baseFreq * pitchMultiplier, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(baseFreq * pitchMultiplier * 1.5, ctx.currentTime + 0.1);
    oscillator.type = 'triangle';

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch {
    return;
  }
}

export function playFruitSound(soundEnabled: boolean): void {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    oscillator.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.2);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.25);
  } catch {
    return;
  }
}

export function playDeathSound(soundEnabled: boolean): void {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(500, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  } catch {
    return;
  }
}

export function playFrightenedWarningSound(soundEnabled: boolean): void {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(300, ctx.currentTime);
    oscillator.frequency.setValueAtTime(400, ctx.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(300, ctx.currentTime + 0.2);
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch {
    return;
  }
}

export function playVictorySound(soundEnabled: boolean): void {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();

    const notes = [523, 659, 784, 1047];
    const duration = 0.15;

    notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + index * duration);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.15, ctx.currentTime + index * duration);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * duration + duration);

      oscillator.start(ctx.currentTime + index * duration);
      oscillator.stop(ctx.currentTime + index * duration + duration);
    });
  } catch {
    return;
  }
}

export function playDefeatSound(soundEnabled: boolean): void {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();

    const notes = [400, 350, 300, 200];
    const duration = 0.2;

    notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + index * duration);
      oscillator.type = 'sawtooth';

      gainNode.gain.setValueAtTime(0.15, ctx.currentTime + index * duration);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * duration + duration);

      oscillator.start(ctx.currentTime + index * duration);
      oscillator.stop(ctx.currentTime + index * duration + duration);
    });
  } catch {
    return;
  }
}

export function playStartSound(soundEnabled: boolean): void {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(440, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  } catch {
    return;
  }
}