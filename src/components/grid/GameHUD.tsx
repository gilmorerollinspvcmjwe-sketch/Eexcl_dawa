// 游戏 HUD 组件

import React from 'react';

interface GameHUDProps {
  score: number;
  combo: number;
  timeRemaining: number;
  mode: string;
  misses: number;
  headshotLineRow: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  combo,
  timeRemaining,
  mode,
  misses,
  headshotLineRow,
}) => {
  return (
    <div className="game-hud">
      <div className="game-hud-left">
        <div className="game-stat">
          <span className="game-stat-label">分数</span>
          <span className="game-stat-value score">{score.toLocaleString()}</span>
        </div>
        {combo > 1 && (
          <div className="game-stat combo-pop">
            <span className="game-stat-label">连击</span>
            <span className="game-stat-value combo">{combo}x</span>
          </div>
        )}
      </div>
      <div className="game-hud-right">
        {mode === 'timed' && (
          <div className="game-stat">
            <span className={`game-stat-value time ${timeRemaining <= 10 ? 'warning' : ''}`}>
              {timeRemaining}s
            </span>
          </div>
        )}
        {mode === 'endless' && (
          <div className="game-stat">
            <span className="game-stat-label">剩余</span>
            <span className="game-stat-value" style={{ color: misses >= 2 ? '#fca5a5' : 'white' }}>
              {3 - misses} 条命
            </span>
          </div>
        )}
        {mode === 'headshot' && (
          <div className="game-stat">
            <span className="game-stat-label">爆头线</span>
            <span className="game-stat-value">第 {headshotLineRow} 行</span>
          </div>
        )}
      </div>
    </div>
  );
};