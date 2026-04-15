/* 祖玛模块音效工具。包含发射、命中、消除、连锁、换弹、危险预警、胜利/失败等音效。 */

let audioContext: AudioContext | null = null;

export function getZumaAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

export function resetZumaAudioContext(): void {
  if (audioContext) {
    audioContext.close().catch(() => {
      // 忽略关闭已失效音频上下文时的异常
    });
    audioContext = null;
  }
}

export function playZumaShootSound(): void {
  try {
    const ctx = getZumaAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch {
    // 忽略浏览器音频上下文不可用的情况
  }
}

export function playZumaHitSound(): void {
  try {
    const ctx = getZumaAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // 忽略浏览器音频上下文不可用的情况
  }
}

export function playZumaMissSound(): void {
  try {
    const ctx = getZumaAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
    osc.type = 'sawtooth';

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // 忽略浏览器音频上下文不可用的情况
  }
}

export function playZumaClearSound(chainComboLevel: number): void {
  try {
    const ctx = getZumaAudioContext();
    const baseFreq = 600 + chainComboLevel * 100;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.1);
    osc.type = 'sine';

    const volume = 0.15 + chainComboLevel * 0.02;
    gain.gain.setValueAtTime(Math.min(volume, 0.3), ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // 忽略浏览器音频上下文不可用的情况
  }
}

export function playZumaChainComboSound(level: number): void {
  try {
    const ctx = getZumaAudioContext();
    const baseFreq = 800 + level * 150;

    for (let i = 0; i < Math.min(level, 3); i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const freq = baseFreq + i * 100;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);
      osc.type = 'triangle';

      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.05 + 0.1);

      osc.start(ctx.currentTime + i * 0.05);
      osc.stop(ctx.currentTime + i * 0.05 + 0.1);
    }
  } catch {
    // 忽略浏览器音频上下文不可用的情况
  }
}

export function playZumaSwapSound(): void {
  try {
    const ctx = getZumaAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.setValueAtTime(400, ctx.currentTime + 0.05);
    osc.type = 'square';

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch {
    // 忽略浏览器音频上下文不可用的情况
  }
}

export function playZumaPowerupSound(powerupType: string): void {
  try {
    const ctx = getZumaAudioContext();

    const freqMap: Record<string, number> = {
      burst: 700,
      lightning: 900,
      slow: 500,
      rewind: 600,
      wild: 800,
    };

    const baseFreq = freqMap[powerupType] || 600;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 2, ctx.currentTime + 0.15);
    osc1.type = 'sine';

    osc2.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 3, ctx.currentTime + 0.15);
    osc2.type = 'triangle';

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.2);
    osc2.stop(ctx.currentTime + 0.2);
  } catch {
    // 忽略浏览器音频上下文不可用的情况
  }
}

export function playZumaDangerSound(level: 'warning' | 'critical'): void {
  try {
    const ctx = getZumaAudioContext();
    const baseFreq = level === 'critical' ? 150 : 250;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.type = 'sawtooth';

    gain.gain.setValueAtTime(level === 'critical' ? 0.15 : 0.1, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(level === 'critical' ? 0.15 : 0.1, ctx.currentTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // 忽略浏览器音频上下文不可用的情况
  }
}

export function playZumaWinSound(): void {
  try {
    const ctx = getZumaAudioContext();

    const notes = [523, 659, 784, 1047];

    for (let i = 0; i < notes.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(notes[i], ctx.currentTime + i * 0.15);
      osc.type = 'sine';

      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.2);

      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.2);
    }
  } catch {
    // 忽略浏览器音频上下文不可用的情况
  }
}

export function playZumaLoseSound(): void {
  try {
    const ctx = getZumaAudioContext();

    const notes = [400, 350, 300, 200];

    for (let i = 0; i < notes.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(notes[i], ctx.currentTime + i * 0.2);
      osc.type = 'sawtooth';

      gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.2 + 0.25);

      osc.start(ctx.currentTime + i * 0.2);
      osc.stop(ctx.currentTime + i * 0.2 + 0.25);
    }
  } catch {
    // 忽略浏览器音频上下文不可用的情况
  }
}
