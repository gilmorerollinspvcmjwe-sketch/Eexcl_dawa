import type { FPSTrainingMode } from '../../components/TrainingModeSelector';
import type { GameModeType } from '../../components/GameHub';

export type LegacyDifficultyLevel = 'very_easy' | 'easy' | 'normal' | 'medium' | 'hard' | 'expert';
export type LegacyFPSConfigMap = Record<string, string | number | boolean | undefined>;

export const LEGACY_CLASSIC_MODES: Array<{ id: GameModeType; icon: string; name: string; desc: string }> = [
  { id: 'timed', icon: '⏱️', name: '限时', desc: '「与时间赛跑，分秒必争」' },
  { id: 'endless', icon: '♾️', name: '无限', desc: '「没有尽头，只有突破」' },
  { id: 'zen', icon: '🧘', name: '禅', desc: '「心无旁骛，万物皆空」' },
  { id: 'headshot', icon: '🎯', name: '爆头线', desc: '「一击必杀，瞄准即正义」' },
  { id: 'survival', icon: '❤️', name: '生存', desc: '「三条命，失误即出局」' },
  { id: 'headshot_only', icon: '💀', name: '仅头部', desc: '「非头即失，极致精准」' },
];

export const LEGACY_FPS_MODES: Array<{ id: FPSTrainingMode; icon: string; name: string; desc: string }> = [
  { id: 'motion_track', icon: '🏃', name: '移动射击', desc: '「追猎移动目标，预判即命中」' },
  { id: 'peek_shot', icon: '👀', name: '拐角射击', desc: '「转角遇到爱，探头即暴击」' },
  { id: 'switch_track', icon: '🔄', name: '目标切换', desc: '「眼观六路，快速切换」' },
  { id: 'reaction', icon: '⚡', name: '反应测试', desc: '「神经反射，极限挑战」' },
  { id: 'precision', icon: '🎯', name: '精准射击', desc: '「毫厘之间，胜负已分」' },
];

export const LEGACY_FPS_MODE_CONFIGS: Record<FPSTrainingMode, LegacyFPSConfigMap> = {
  motion_track: { speed: 'normal', pattern: 'linear', duration: 60 },
  peek_shot: { duration: 'normal', interval: 1500 },
  switch_track: { targetCount: 3, showPriority: true },
  reaction: {},
  precision: { targetScale: 0.5, targetCount: 3 },
};

export const LEGACY_CHALLENGE_GROUPS = [
  { icon: '🌱', title: '新手组', levels: [1, 2, 3, 4], className: 'beginner' },
  { icon: '📈', title: '进阶组', levels: [5, 6, 7, 8], className: 'intermediate' },
  { icon: '🏅', title: '专家组', levels: [9, 10, 11, 12], className: 'expert' },
] as const;

