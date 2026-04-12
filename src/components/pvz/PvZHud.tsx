import React from 'react';
import { getPvZChapterGuidance } from '../../features/pvz/pvzChapterGuidance';
import type { PvZBoardState } from '../../features/pvz/pvzTypes';

export const PvZHud: React.FC<{ state: PvZBoardState }> = ({ state }) => {
  const guidance = getPvZChapterGuidance(state.chapterId);
  const modeLabel = state.mode === 'adventure' ? '章节征途' : state.mode === 'lab' ? '洞察试验' : '长线生存';
  const levelLabel = state.levelNumber ? `${state.levelId} ${state.levelTitle}` : state.chapterTitle;
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
    </div>
  );
};
