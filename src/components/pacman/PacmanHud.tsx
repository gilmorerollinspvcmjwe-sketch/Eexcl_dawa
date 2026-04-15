/* 吃豆人HUD信息栏。显示分数、关卡、生命、模式、豆子、水果、Frightened时间。 */

import React from 'react';
import type { PacmanBoardState } from '../../features/pacman/pacmanTypes';
import { getMazeDefinition } from '../../features/pacman/pacmanBoardState';
import { getModeText, getFrightenedRemainingTime } from '../../features/pacman/pacmanLevelTuning';
import { getFruitStatusText } from '../../features/pacman/pacmanFruit';
import { getElroyPhase } from '../../features/pacman/pacmanAi';

interface PacmanHudProps {
  state: PacmanBoardState;
  onStart: () => void;
  onPauseToggle: () => void;
  onRestart: () => void;
  onExit?: () => void;
  objective?: string;
  startHint?: string;
}

export const PacmanHud: React.FC<PacmanHudProps> = ({
  state,
  onStart,
  onPauseToggle,
  onRestart,
  onExit,
  objective,
  startHint,
}) => {
  const maze = getMazeDefinition(state.mazeId);
  const totalPellets = maze.totalPellets;
  const pelletsCollected = totalPellets - state.pelletsRemaining;
  const pelletPercentage = Math.round((pelletsCollected / totalPellets) * 100);

  const elapsedSeconds = Math.floor(state.elapsedMs / 1000);
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const elapsedDisplay = elapsedMinutes > 0
    ? `${elapsedMinutes}:${(elapsedSeconds % 60).toString().padStart(2, '0')}`
    : `${elapsedSeconds}秒`;

  const modeText = getModeText(state);
  const fruitStatus = getFruitStatusText(state);
  const frightenedRemaining = getFrightenedRemainingTime(state);
  const frightenedSeconds = Math.ceil(frightenedRemaining / 1000);
  const elroyPhase = getElroyPhase(state);
  const elroyText = elroyPhase === 'elroy2' ? '红鬼加压 Lv2' : elroyPhase === 'elroy1' ? '红鬼加压 Lv1' : '红鬼待机';

  const livesDisplay = Array.from({ length: state.lives }, (_, i) => (
    <span key={i} className="pacman-life-icon">●</span>
  ));

  return (
    <div className="pacman-hud">
      <div className="pacman-hud-stats">
        <div className="pacman-hud-item">
          <span>得分</span>
          <strong>{state.score}</strong>
        </div>
        <div className="pacman-hud-item">
          <span>关卡</span>
          <strong>第 {state.level} 关</strong>
        </div>
        <div className="pacman-hud-item">
          <span>生命</span>
          <strong className="pacman-lives-row">{livesDisplay}</strong>
        </div>
        <div className="pacman-hud-item">
          <span>用时</span>
          <strong>{elapsedDisplay}</strong>
        </div>
        <div className="pacman-hud-item">
          <span>模式</span>
          <strong className={state.globalMode.currentMode === 'frightened' ? 'success' : ''}>
            {modeText}
          </strong>
        </div>
        <div className="pacman-hud-item">
          <span>豆子</span>
          <strong>{pelletsCollected}/{totalPellets} ({pelletPercentage}%)</strong>
        </div>
        <div className="pacman-hud-item">
          <span>水果</span>
          <strong>{fruitStatus}</strong>
        </div>
        <div className="pacman-hud-item">
          <span>吃鬼</span>
          <strong>{state.totalGhostsEaten}</strong>
        </div>
        <div className={`pacman-hud-item wide${elroyPhase === 'inactive' ? '' : ' warning'}`}>
          <span>Elroy</span>
          <strong>{elroyText}</strong>
        </div>
        {state.globalMode.currentMode === 'frightened' && (
          <div className="pacman-hud-item wide success">
            <span>惊吓剩余</span>
            <strong>{frightenedSeconds}秒</strong>
          </div>
        )}
        <div className="pacman-hud-item wide">
          <span>能量豆</span>
          <strong>{state.energizersRemaining} / 4</strong>
        </div>
      </div>

      <div className="pacman-hud-note">
        <p>{objective || '先看"豆子"进度，再盯"模式"切换时机；惊吓模式下优先吃鬼。'}</p>
        <p>{startHint || '能量豆在四角，吃掉后鬼变蓝，可反吃得分递增。'}</p>
        {state.extraLifeAwarded && <p>本局已拿到 10000 分奖励命，后面可以更保守。</p>}
      </div>

      <div className="pacman-hud-actions">
        <button className="pacman-btn" onClick={onStart} disabled={state.status !== 'idle' && state.status !== 'paused'}>
          {state.status === 'paused' ? '继续' : '开始'}
        </button>
        <button
          className="pacman-btn"
          onClick={onPauseToggle}
          disabled={state.status !== 'playing' && state.status !== 'paused'}
        >
          {state.status === 'paused' ? '恢复' : '暂停'}
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
  );
};
