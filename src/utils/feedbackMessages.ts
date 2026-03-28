export interface FeedbackMessage {
  id: string;
  text: string;
  type: 'combo' | 'miss' | 'headshot' | 'achievement' | 'encouragement' | 'game';
  priority: number;
  duration: number;
}

export interface FeedbackConfig {
  combo: number;
  missStreak: number;
  headshotStreak: number;
  headshotRate: number;
  score: number;
  bestScore: number;
  isPlaying: boolean;
  justStarted: boolean;
  justEnded: boolean;
}

export const COMBO_MESSAGES: { threshold: number; message: string }[] = [
  { threshold: 30, message: '「30连击！神级操作！」' },
  { threshold: 20, message: '「20连击！你是机器吗？」' },
  { threshold: 10, message: '「10连击！手速惊人！」' },
  { threshold: 5, message: '「连击中...继续保持！」' },
];

export const MISS_MESSAGES: { threshold: number; message: string }[] = [
  { threshold: 8, message: '「...需要休息一下吗？」' },
  { threshold: 5, message: '「调整呼吸，重新瞄准」' },
  { threshold: 3, message: '「稳住，别慌！」' },
];

export const HEADSHOT_MESSAGES: { threshold: number; message: string }[] = [
  { threshold: 5, message: '「五连爆头！死神降临！」' },
  { threshold: 3, message: '「爆头三连！头部猎人！」' },
];

export const HEADSHOT_RATE_MESSAGES: { threshold: number; message: string }[] = [
  { threshold: 90, message: '「爆头大师认证！命中率超90%！」' },
  { threshold: 80, message: '「爆头专家！头部瞄准已入化境！」' },
];

export const GAME_MESSAGES = {
  start: '「准备好了吗？开始！」',
  end: '「训练结束，查看成绩」',
  newRecord: '「新纪录！继续加油！」',
};

export const ENCOURAGEMENT_MESSAGES = [
  '「加油，你可以的！」',
  '「专注，瞄准，射击！」',
  '「每一次点击都是进步！」',
  '「保持节奏，稳定输出！」',
];

export function getFeedbackMessage(config: FeedbackConfig): FeedbackMessage | null {
  const { combo, missStreak, headshotStreak, headshotRate, score, bestScore, isPlaying, justStarted, justEnded } = config;

  if (justStarted && isPlaying) {
    return {
      id: 'game-start',
      text: GAME_MESSAGES.start,
      type: 'game',
      priority: 10,
      duration: 2000,
    };
  }

  if (justEnded) {
    if (score > bestScore && bestScore > 0) {
      return {
        id: 'new-record',
        text: GAME_MESSAGES.newRecord,
        type: 'achievement',
        priority: 100,
        duration: 3000,
      };
    }
    return {
      id: 'game-end',
      text: GAME_MESSAGES.end,
      type: 'game',
      priority: 10,
      duration: 2000,
    };
  }

  for (const { threshold, message } of COMBO_MESSAGES) {
    if (combo >= threshold && combo % threshold === 0) {
      return {
        id: `combo-${threshold}`,
        text: message,
        type: 'combo',
        priority: 50 + threshold,
        duration: 1500,
      };
    }
  }

  for (const { threshold, message } of HEADSHOT_MESSAGES) {
    if (headshotStreak >= threshold && headshotStreak % threshold === 0) {
      return {
        id: `headshot-${threshold}`,
        text: message,
        type: 'headshot',
        priority: 60 + threshold,
        duration: 1500,
      };
    }
  }

  for (const { threshold, message } of HEADSHOT_RATE_MESSAGES) {
    if (headshotRate >= threshold) {
      return {
        id: `headshot-rate-${threshold}`,
        text: message,
        type: 'achievement',
        priority: 70,
        duration: 2000,
      };
    }
  }

  for (const { threshold, message } of MISS_MESSAGES) {
    if (missStreak >= threshold && missStreak % threshold === 0) {
      return {
        id: `miss-${threshold}`,
        text: message,
        type: 'miss',
        priority: 40,
        duration: 1500,
      };
    }
  }

  return null;
}

export function getRandomEncouragement(): FeedbackMessage {
  const index = Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length);
  return {
    id: `encouragement-${Date.now()}`,
    text: ENCOURAGEMENT_MESSAGES[index],
    type: 'encouragement',
    priority: 5,
    duration: 1500,
  };
}
