/* 吃豆人结算面板。实现胜利/失败结算、三个出口（重开本局、返回选关、进入练习）。 */

import React from 'react';
import type { PacmanBoardState, PacmanPracticeId } from '../../features/pacman/pacmanTypes';
import { DEFAULT_LIVES } from '../../features/pacman/pacmanTypes';
import type { PacmanLevelMeta, PacmanPackId } from '../../features/pacman/pacmanMapRegistry';
import { getMazeDefinition } from '../../features/pacman/pacmanBoardState';
import { getWinAnalysis, getDeathAnalysis } from '../../features/pacman/pacmanGameLogic';
import { getLevelDisplayName } from '../../features/pacman/pacmanMapRegistry';
import type { PacmanPracticeModule } from '../../features/pacman/pacmanPracticeCatalog';

interface PacmanOverlayProps {
  state: PacmanBoardState;
  onPauseToggle: () => void;
  onRestart: () => void;
  onNextLevel: () => void;
  onExit?: () => void;
  selectedPackId: PacmanPackId;
  levelMeta?: PacmanLevelMeta | null;
  activePractice?: PacmanPracticeModule | null;
  onOpenPractice?: (practiceId: PacmanPracticeId) => void;
  onReturnFromPractice?: () => void;
  practiceReturnLabel?: string;
}

export const PacmanOverlay: React.FC<PacmanOverlayProps> = ({
  state,
  onPauseToggle,
  onRestart,
  onNextLevel,
  onExit,
  selectedPackId,
  levelMeta,
  activePractice,
  onOpenPractice,
  onReturnFromPractice,
  practiceReturnLabel,
}) => {
  if (state.status === 'playing' || state.status === 'idle') return null;

  if (state.status === 'paused') {
    return (
      <div className="pacman-overlay">
        <div className="pacman-overlay-card">
          <h3>已暂停</h3>
          <p>当前回合已暂停。</p>
          <p className="pacman-overlay-hint">按 ESC 或点击"继续"按钮恢复游戏</p>
          <div className="pacman-overlay-actions">
            <button className="pacman-btn" onClick={onPauseToggle}>
              继续
            </button>
            <button className="pacman-btn" onClick={onRestart}>
              重开
            </button>
            {onExit && (
              <button className="pacman-btn ghost" onClick={onExit}>
                返回选关
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (state.status === 'dead') {
    return (
      <div className="pacman-overlay">
        <div className="pacman-overlay-card">
          <h3>死亡中...</h3>
          <p>正在播放死亡动画，稍后自动重生。</p>
          <p>剩余生命: {state.lives}</p>
        </div>
      </div>
    );
  }

  const maze = getMazeDefinition(state.mazeId);
  const totalPellets = maze.totalPellets;
  const pelletsCollected = totalPellets - state.pelletsRemaining;
  const pelletPercentage = Math.round((pelletsCollected / totalPellets) * 100);

  const elapsedSeconds = Math.floor(state.elapsedMs / 1000);
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const elapsedDisplay = elapsedMinutes > 0
    ? `${elapsedMinutes}分${elapsedSeconds % 60}秒`
    : `${elapsedSeconds}秒`;

  const levelName = getLevelDisplayName(selectedPackId, state.level);
  const recommendedPracticeId = activePractice?.id || levelMeta?.recommendedPracticeId;
  const failReasonHints = activePractice
    ? [activePractice.startHint]
    : levelMeta?.failReasonHints || [];

  if (state.status === 'won') {
    const analysis = getWinAnalysis(state);
    const isPerfect = state.lives === DEFAULT_LIVES;

    return (
      <div className="pacman-overlay">
        <div className="pacman-overlay-card">
          <h3>{state.mode === 'practice' ? '✅ 练习完成' : '🎉 通关成功！'}</h3>
          <p>{state.mode === 'practice' && activePractice ? `${activePractice.name} 已完成。` : `${levelName} 已完成！`}</p>

          <div className="pacman-overlay-stats">
            <div className="pacman-overlay-stat success">
              <span>得分</span>
              <strong>{state.score}</strong>
            </div>
            <div className="pacman-overlay-stat">
              <span>用时</span>
              <strong>{elapsedDisplay}</strong>
            </div>
            <div className="pacman-overlay-stat">
              <span>剩余生命</span>
              <strong className={isPerfect ? 'success' : ''}>
                {state.lives} {isPerfect ? '(无伤)' : ''}
              </strong>
            </div>
            <div className="pacman-overlay-stat">
              <span>豆子完成率</span>
              <strong>{pelletPercentage}%</strong>
            </div>
            <div className="pacman-overlay-stat">
              <span>水果收益</span>
              <strong>{state.fruitsCollected} 个</strong>
            </div>
            <div className="pacman-overlay-stat">
              <span>吃鬼次数</span>
              <strong>{state.totalGhostsEaten}</strong>
            </div>
          </div>

          {analysis.length > 0 && (
            <div className="pacman-overlay-analysis">
              <strong>表现分析：</strong>
              <ul>
                {analysis.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {state.extraLifeAwarded && (
            <div className="pacman-overlay-analysis">
              <strong>奖励命：</strong>
              <p>本局已在 10000 分拿到 1 条奖励命。</p>
            </div>
          )}

          <div className="pacman-overlay-actions">
            {state.mode === 'practice' && onReturnFromPractice ? (
              <button className="pacman-btn" onClick={onReturnFromPractice}>
                {practiceReturnLabel || '回到来源关卡'}
              </button>
            ) : (
              <button className="pacman-btn" onClick={onNextLevel}>
                进入下一关
              </button>
            )}
            <button className="pacman-btn" onClick={onRestart}>
              {state.mode === 'practice' ? '再练一次' : '重开本关'}
            </button>
            {state.mode !== 'practice' && recommendedPracticeId && onOpenPractice && (
              <button className="pacman-btn" onClick={() => onOpenPractice(recommendedPracticeId)}>
                进入对应练习
              </button>
            )}
            {onExit && (
              <button className="pacman-btn ghost" onClick={onExit}>
                返回选关
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (state.status === 'lost') {
    const analysis = getDeathAnalysis(state);
    const pacmanRow = Math.round(state.pacman.pixelY);
    const pacmanCol = Math.round(state.pacman.pixelX);

    const rowZone = pacmanRow < maze.rows / 3 ? '上方' :
      pacmanRow > maze.rows * 2 / 3 ? '下方' : '中部';
    const colZone = pacmanCol < maze.cols / 3 ? '左侧' :
      pacmanCol > maze.cols * 2 / 3 ? '右侧' : '中部';

    return (
      <div className="pacman-overlay">
        <div className="pacman-overlay-card">
          <h3>💀 游戏结束</h3>
          <p>生命耗尽，游戏结束。</p>

          <div className="pacman-overlay-stats">
            <div className="pacman-overlay-stat warning">
              <span>最终得分</span>
              <strong>{state.score}</strong>
            </div>
            <div className="pacman-overlay-stat">
              <span>到达关卡</span>
              <strong>第 {state.level} 关</strong>
            </div>
            <div className="pacman-overlay-stat">
              <span>存活时间</span>
              <strong>{elapsedDisplay}</strong>
            </div>
            <div className="pacman-overlay-stat">
              <span>豆子进度</span>
              <strong>{pelletPercentage}%</strong>
            </div>
            <div className="pacman-overlay-stat">
              <span>吃鬼次数</span>
              <strong>{state.totalGhostsEaten}</strong>
            </div>
            <div className="pacman-overlay-stat">
              <span>水果收集</span>
              <strong>{state.fruitsCollected}</strong>
            </div>
          </div>

          <div className="pacman-overlay-analysis">
            <strong>死亡位置热区：</strong>
            <p>死亡位置: {rowZone}{colZone}区域 (行{pacmanRow}, 列{pacmanCol})</p>
          </div>

          {analysis.length > 0 && (
            <div className="pacman-overlay-analysis">
              <strong>建议改进点：</strong>
              <ul>
                {analysis.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {failReasonHints.length > 0 && (
            <div className="pacman-overlay-analysis">
              <strong>失败提示：</strong>
              <ul>
                {failReasonHints.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="pacman-overlay-actions">
            <button className="pacman-btn" onClick={onRestart}>
              {state.mode === 'practice' ? '再练一次' : '重开本局'}
            </button>
            {state.mode !== 'practice' && recommendedPracticeId && onOpenPractice && (
              <button className="pacman-btn" onClick={() => onOpenPractice(recommendedPracticeId)}>
                进入对应练习
              </button>
            )}
            {state.mode === 'practice' && onReturnFromPractice && (
              <button className="pacman-btn" onClick={onReturnFromPractice}>
                {practiceReturnLabel || '回到来源关卡'}
              </button>
            )}
            {onExit && (
              <button className="pacman-btn ghost" onClick={onExit}>
                返回选关
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
