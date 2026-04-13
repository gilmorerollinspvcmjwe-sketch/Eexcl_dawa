import React from 'react';
import { getPvZChapterGuidance } from '../../features/pvz/pvzChapterGuidance';
import type { PvZBoardState } from '../../features/pvz/pvzTypes';

interface PvZHudProps {
  state: PvZBoardState;
  onTogglePause?: () => void;
  onToggleSpeed?: () => void;
  onToggleShovel?: () => void;
}

export const PvZHud: React.FC<PvZHudProps> = ({ state, onTogglePause, onToggleSpeed, onToggleShovel }) => {
  const guidance = getPvZChapterGuidance(state.chapterId);
  const modeLabel = state.mode === 'adventure' ? '章节征途' : state.mode === 'lab' ? '洞察试验' : '长线生存';
  const levelLabel = state.levelNumber ? `${state.levelId} ${state.levelTitle}` : state.chapterTitle;

  const currentWave = state.waves[state.currentWaveIndex];
  const isLargeWave = currentWave?.waveType === 'large';
  const isFinalWave = currentWave?.waveType === 'final';
  const showWaveAlert = state.waveState === 'interval' && (isLargeWave || isFinalWave);

  return (
    <div className="pvz-hud">
      <div className="pvz-hud-item pvz-hud-mode">
        <span className="pvz-hud-label">模式</span>
        <strong>{modeLabel}</strong>
      </div>
      <div className="pvz-hud-item">{levelLabel}</div>
      <div className="pvz-hud-item">强度：{state.scenarioIntensity}</div>
      <div className="pvz-hud-item">目标：{state.scenarioObjective}</div>
      <div className="pvz-hud-item">威胁：{guidance.majorThreats.join('、')}</div>
      <div className="pvz-hud-item">规则：{state.scenarioRules.join(' / ')}</div>
      <div className="pvz-hud-item">段时：{Math.round(state.scenarioSegmentDurationMs / 1000)} 秒</div>
      {state.scenarioSunDrainPerSecond > 0 && (
        <div className="pvz-hud-item">阳光漏：{state.scenarioSunDrainPerSecond.toFixed(2)} /秒</div>
      )}
      <div className="pvz-hud-item">可用卡池：{state.availablePlants.length}</div>
      <div className="pvz-hud-item">阳光：{state.sun}</div>
      <div className="pvz-hud-item">进度：{Math.round(state.waveProgress * 100)}%</div>
      {state.mode === 'survival' && (
        <div className="pvz-hud-item">
          段数：{state.scenarioSegmentIndex}/{state.scenarioSegmentsTotal}
        </div>
      )}
      {(state.latestUnlockPlants.length > 0 || state.latestUnlockZombies.length > 0) && (
        <div className="pvz-hud-item">
          解锁：
          {state.latestUnlockPlants.length > 0 ? `植物 ${state.latestUnlockPlants.length}` : ''}
          {state.latestUnlockPlants.length > 0 && state.latestUnlockZombies.length > 0 ? ' / ' : ''}
          {state.latestUnlockZombies.length > 0 ? `僵尸 ${state.latestUnlockZombies.length}` : ''}
        </div>
      )}
      <div className="pvz-hud-item">割草机：{state.lawnMowers.filter(Boolean).length}</div>
      <div className="pvz-hud-item">卡组：{state.selectedCards.length}/6</div>
      <div className={`pvz-hud-item status-${state.status}`}>
        {state.status === 'playing' ? '进行中' : state.status === 'won' ? '胜利' : '失败'}
      </div>

      {onToggleShovel && (
        <button
          className={`pvz-hud-btn pvz-shovel-btn ${state.shovelMode ? 'pvz-shovel-btn--active' : ''}`}
          onClick={onToggleShovel}
          title="铲子：移除植物"
        >
          🗑️ {state.shovelMode ? '铲子模式' : '铲子'}
        </button>
      )}

      {onTogglePause && (
        <button
          className="pvz-hud-btn pvz-pause-btn"
          onClick={onTogglePause}
          title={state.isPaused ? '恢复游戏' : '暂停游戏'}
        >
          {state.isPaused ? '▶️ 恢复' : '⏸️ 暂停'}
        </button>
      )}

      {onToggleSpeed && (
        <button
          className={`pvz-hud-btn pvz-speed-btn ${state.gameSpeed === 2 ? 'pvz-speed-btn--fast' : ''}`}
          onClick={onToggleSpeed}
          title={state.gameSpeed === 1 ? '加速游戏' : '正常速度'}
        >
          {state.gameSpeed === 1 ? '⏩ 加速' : '⏩ 2x'}
        </button>
      )}

      {showWaveAlert && (
        <div className={`pvz-wave-alert ${isFinalWave ? 'pvz-wave-alert--final' : 'pvz-wave-alert--large'}`}>
          {isFinalWave ? '⚠️ 最终波！' : '⚠️ 大波僵尸来袭！'}
        </div>
      )}
    </div>
  );
};
