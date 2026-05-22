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
  const progressLabel = `${Math.round(state.waveProgress * 100)}%`;
  const mowerCount = state.lawnMowers.filter(Boolean).length;
  const unlockLabel = [
    state.latestUnlockPlants.length > 0 ? `植物 ${state.latestUnlockPlants.length}` : '',
    state.latestUnlockZombies.length > 0 ? `僵尸 ${state.latestUnlockZombies.length}` : '',
  ].filter(Boolean).join(' / ');

  const currentWave = state.waves[state.currentWaveIndex];
  const isLargeWave = currentWave?.waveType === 'large';
  const isFinalWave = currentWave?.waveType === 'final';
  const showWaveAlert = state.waveState === 'interval' && (isLargeWave || isFinalWave);

  return (
    <div className="pvz-hud">
      <section className="pvz-hud-bar pvz-hud-bar--overview">
        <div className="pvz-hud-identity">
          <span className="pvz-hud-label">关卡概览</span>
          <strong className="pvz-hud-title">{levelLabel}</strong>
        </div>
        <div className="pvz-hud-chips">
          <span className="pvz-hud-chip">{modeLabel}</span>
          <span className="pvz-hud-chip">强度 {state.scenarioIntensity}</span>
          <span className={`pvz-hud-chip pvz-hud-chip--status status-${state.status}`}>
            {state.status === 'playing' ? '进行中' : state.status === 'won' ? '胜利' : '失败'}
          </span>
        </div>
        <div className="pvz-hud-summary">
          <span className="pvz-hud-summary-item"><strong>目标</strong>{state.scenarioObjective}</span>
          <span className="pvz-hud-summary-item"><strong>威胁</strong>{guidance.majorThreats.join('、')}</span>
          <span className="pvz-hud-summary-item"><strong>规则</strong>{state.scenarioRules.join(' / ')}</span>
        </div>
      </section>

      <section className="pvz-hud-bar pvz-hud-bar--controls">
        <div className="pvz-hud-controls-head">
          <span className="pvz-hud-label">操作区</span>
          <strong className="pvz-hud-title">战斗控制</strong>
        </div>
        <div className="pvz-hud-controls">
          {onToggleShovel && (
            <button
              type="button"
              className={`pvz-hud-btn pvz-shovel-btn ${state.shovelMode ? 'pvz-shovel-btn--active' : ''}`}
              onClick={onToggleShovel}
              aria-label={state.shovelMode ? '关闭铲子模式' : '开启铲子模式'}
              aria-pressed={state.shovelMode}
              title="铲子：移除植物"
            >
              🗑️ {state.shovelMode ? '铲子模式' : '铲子'}
            </button>
          )}

          {onTogglePause && (
            <button
              type="button"
              className="pvz-hud-btn pvz-pause-btn"
              onClick={onTogglePause}
              aria-label={state.isPaused ? '恢复游戏' : '暂停游戏'}
              aria-pressed={state.isPaused}
              title={state.isPaused ? '恢复游戏' : '暂停游戏'}
            >
              {state.isPaused ? '▶️ 恢复' : '⏸️ 暂停'}
            </button>
          )}

          {onToggleSpeed && (
            <button
              type="button"
              className={`pvz-hud-btn pvz-speed-btn ${state.gameSpeed === 2 ? 'pvz-speed-btn--fast' : ''}`}
              onClick={onToggleSpeed}
              aria-label={state.gameSpeed === 1 ? '切换到 2 倍速' : '切换到 1 倍速'}
              aria-pressed={state.gameSpeed === 2}
              title={state.gameSpeed === 1 ? '加速游戏' : '正常速度'}
            >
              {state.gameSpeed === 1 ? '⏩ 加速' : '⏩ 2x'}
            </button>
          )}
        </div>
        {showWaveAlert ? (
          <div className={`pvz-wave-alert ${isFinalWave ? 'pvz-wave-alert--final' : 'pvz-wave-alert--large'}`}>
            {isFinalWave ? '⚠️ 最终波！' : '⚠️ 大波僵尸来袭！'}
          </div>
        ) : null}
      </section>

      <section className="pvz-hud-bar pvz-hud-bar--metrics">
        <div className="pvz-hud-metrics">
          <span className="pvz-hud-metric"><strong>阳光</strong>{Math.round(state.sun)}</span>
          <span className="pvz-hud-metric"><strong>进度</strong>{progressLabel}</span>
          <span className="pvz-hud-metric"><strong>割草机</strong>{mowerCount}</span>
          <span className="pvz-hud-metric"><strong>卡组</strong>{state.selectedCards.length}/6</span>
          <span className="pvz-hud-metric"><strong>段时</strong>{Math.round(state.scenarioSegmentDurationMs / 1000)} 秒</span>
          <span className="pvz-hud-metric"><strong>卡池</strong>{state.availablePlants.length}</span>
          {state.mode === 'survival' ? (
            <span className="pvz-hud-metric"><strong>段数</strong>{state.scenarioSegmentIndex}/{state.scenarioSegmentsTotal}</span>
          ) : null}
          {state.scenarioSunDrainPerSecond > 0 ? (
            <span className="pvz-hud-metric"><strong>阳光漏</strong>{state.scenarioSunDrainPerSecond.toFixed(2)} /秒</span>
          ) : null}
          {unlockLabel ? <span className="pvz-hud-metric"><strong>解锁</strong>{unlockLabel}</span> : null}
        </div>
      </section>
    </div>
  );
};
