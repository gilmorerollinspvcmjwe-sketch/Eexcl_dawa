import { formatSnakeChainText, getCurrentSnakeTarget, getSnakeTargetProgressLabel } from './snakeTextChain.ts';
import type { SnakeBoardState, SnakeDeathReason } from './snakeTypes.ts';

export function getSnakeModeLabel(mode: SnakeBoardState['mode']): string {
  switch (mode) {
    case 'classic':
      return '经典';
    case 'timed':
      return '限时';
    case 'challenge':
      return '障碍';
    default:
      return mode;
  }
}

export function getSnakeDifficultyLabel(difficulty: SnakeBoardState['difficulty']): string {
  switch (difficulty) {
    case 'easy':
      return '简单';
    case 'normal':
      return '标准';
    case 'hard':
      return '困难';
    default:
      return difficulty;
  }
}

export function getSnakeMapSizeLabel(size: 'small' | 'medium' | 'large'): string {
  switch (size) {
    case 'small':
      return '小图';
    case 'medium':
      return '中图';
    case 'large':
      return '大图';
    default:
      return '中图';
  }
}

export function getSnakeDeathReasonText(reason: SnakeDeathReason | undefined): string {
  if (!reason) return '';
  switch (reason) {
    case 'wall':
      return '#REF! 超出表格边界。';
    case 'self':
      return '检测到循环引用。';
    case 'obstacle':
      return '撞上受保护单元格。';
    case 'timeout':
      return '时间已到。';
    default:
      return '本局已中断。';
  }
}

export function getSnakeFormulaText(state: SnakeBoardState): string {
  if (state.status === 'idle') return '=数据流待命，按方向键开始。';
  if (state.status === 'paused') return '=数据流已暂停。';
  if (state.status === 'dead') return `=${getSnakeDeathReasonText(state.deathReason)}`;
  if (state.status === 'finished') {
    return getCurrentSnakeTarget(state) === null && state.targetPlan.length > 0 ? '=词组任务已完成。' : '=当前回合完成。';
  }

  const timerText =
    state.remainingMs === null
      ? `时间 ${Math.floor(state.elapsedMs / 1000)}秒`
      : `剩余 ${Math.ceil(state.remainingMs / 1000)}秒`;

  const targetText = state.targetPlan.length > 0 ? ` | 目标 ${getSnakeTargetProgressLabel(state)}` : '';
  const chainText = ` | 链条 ${formatSnakeChainText(state.chainTokens, 10)}`;

  return `=贪吃蛇 ${getSnakeModeLabel(state.mode)} | 得分 ${state.score} | 长度 ${state.length}${targetText}${chainText} | ${timerText}`;
}

export function getSnakePrimaryStatusText(state: SnakeBoardState): string {
  if (state.status === 'playing') return '游玩中';
  if (state.status === 'paused') return '已暂停';
  if (state.status === 'dead') return '本局失败';
  if (state.status === 'finished') return '本局完成';
  return '就绪';
}
