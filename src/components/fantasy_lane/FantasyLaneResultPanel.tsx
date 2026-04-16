import React from 'react';
import { getFantasyLaneChapters, getFantasyLaneLevelById } from '../../features/fantasy_lane/fantasyLaneLevelCatalog.ts';
import type { FantasyLaneRuntimeState } from '../../features/fantasy_lane/fantasyLaneTypes.ts';
import { FANTASY_LANE_UNIT_MAP } from '../../features/fantasy_lane/fantasyLaneUnitRegistry.ts';
import { getBossPhaseVisualState, getCurrentBossPhase, getPhaseNarrativeTone, getReachedBossPhaseCount } from './fantasyLaneUiMeta.ts';
import { FantasyLaneUnitSprite } from './FantasyLaneUnitSprite';

interface FantasyLaneResultPanelProps {
  state: FantasyLaneRuntimeState;
  onRetry: () => void;
  onBackToSetup: () => void;
}

export const FantasyLaneResultPanel: React.FC<FantasyLaneResultPanelProps> = ({ state, onRetry, onBackToSetup }) => {
  if (state.phase !== 'won' && state.phase !== 'lost') return null;
  const currentLevel = getFantasyLaneLevelById(state.selectedLevelId);
  const currentChapter = getFantasyLaneChapters().find((chapter) => chapter.id === currentLevel.chapterId);
  const currentBossPhase = getCurrentBossPhase(currentLevel, state);
  const reachedBossPhaseCount = getReachedBossPhaseCount(currentLevel, state);
  const averageEngageTimeMs =
    state.stats.engagedUnits > 0 ? Math.round(state.stats.totalEngageDelayMs / state.stats.engagedUnits) : 0;
  const phaseTone = getPhaseNarrativeTone(state.pressureLabel);

  return (
    <div className="fantasy-lane-result-overlay">
      <div className={`fantasy-lane-result-card fantasy-lane-result-card--${phaseTone}`}>
        <span className={`fantasy-lane-result-badge fantasy-lane-result-badge--${state.phase}`}>{state.result?.title}</span>
        <div className="fantasy-lane-result-context">
          <strong>{currentLevel.chapterName} · {currentLevel.id} {currentLevel.name}</strong>
          <span>章节命题：{currentChapter?.theme ?? currentLevel.chapterName}</span>
          <span>章节焦点：{currentChapter?.focus ?? currentLevel.recommendedTags.join(' / ')}</span>
        </div>
        <h3>{state.result?.summary}</h3>
        <div className="fantasy-lane-result-stars">
          {'★'.repeat(state.result?.stars ?? 1)}
          {'☆'.repeat(3 - (state.result?.stars ?? 1))}
        </div>
        <div className="fantasy-lane-result-summary">
          <span>关卡提示：{currentLevel.hint}</span>
          {currentLevel.boss && (
            <span>
              Boss 转段：{reachedBossPhaseCount}/{currentLevel.boss.phases.length}
              {currentBossPhase ? ` · ${currentBossPhase.enterWarning}` : ''}
            </span>
          )}
        </div>
        <div className="fantasy-lane-result-grid">
          <div>
            <span>评分</span>
            <strong>{state.result?.score ?? 0}</strong>
          </div>
          <div>
            <span>击倒</span>
            <strong>{state.stats.defeated}</strong>
          </div>
          <div>
            <span>英雄技</span>
            <strong>{state.stats.heroSkillCast}</strong>
          </div>
          <div>
            <span>战术技</span>
            <strong>{state.stats.tacticalSkillCast}</strong>
          </div>
          <div>
            <span>前排投入</span>
            <strong>{state.stats.frontlineSummons}</strong>
          </div>
          <div>
            <span>对空投入</span>
            <strong>{state.stats.antiAirSummons}</strong>
          </div>
          <div>
            <span>队列受阻</span>
            <strong>{state.stats.queueBlocked}</strong>
          </div>
          <div>
            <span>平均接敌</span>
            <strong>{averageEngageTimeMs > 0 ? `${averageEngageTimeMs}ms` : '未成型'}</strong>
          </div>
        </div>
        {currentLevel.boss && (
          <div className="fantasy-lane-result-boss-strip" aria-label="Boss 阶段回顾">
            {currentLevel.boss.phases.map((phase, index) => (
              <span
                key={phase.id}
                className={`fantasy-lane-boss-phase-pill is-${getBossPhaseVisualState(currentLevel, state, phase.id)}`}
              >
                P{index + 1} · {Math.round(phase.hpThreshold)}%
              </span>
            ))}
          </div>
        )}
        <div className="fantasy-lane-result-insight">
          <span>金币消耗 {Math.round(state.stats.goldSpent)}</span>
          <span>投射物 {state.stats.projectilesFired}</span>
          <span>范围命中 {state.stats.aoeHits}</span>
          <span>拥堵累计 {Math.round(state.stats.congestionMs / 100) / 10}s</span>
          <span>接敌单位 {state.stats.engagedUnits}</span>
        </div>
        {state.result?.rewards && (state.result.rewards.unlockedUnits.length > 0 || Object.keys(state.result.rewards.fragments).length > 0) && (
          <div className="fantasy-lane-rewards">
            <div className="fantasy-lane-rewards-title">🎁 获得奖励</div>
            <div className="fantasy-lane-rewards-list">
              {state.result.rewards.unlockedUnits.map((unitId) => {
                const unit = FANTASY_LANE_UNIT_MAP[unitId];
                return unit ? (
                  <div key={unitId} className="fantasy-lane-reward-unit">
                    <FantasyLaneUnitSprite unitId={unitId} side="player" hpPercent={1} isAttacking={false} animated={false} scale={0.8} />
                    <div className="fantasy-lane-reward-unit-name">{unit.name}</div>
                    <div className="fantasy-lane-reward-unit-hint">首次通关</div>
                  </div>
                ) : null;
              })}
              {Object.entries(state.result.rewards.fragments).map(([unitId, count]) => {
                const unit = FANTASY_LANE_UNIT_MAP[unitId];
                return unit ? (
                  <div key={`frag-${unitId}`} className="fantasy-lane-reward-fragment">
                    <div className="fantasy-lane-reward-fragment-icon">🧪</div>
                    <div className="fantasy-lane-reward-fragment-name">{unit.name}</div>
                    <div className="fantasy-lane-reward-fragment-count">×{count}</div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}
        <div className="fantasy-lane-result-tips">
          {state.result?.tips.map((tip) => (
            <p key={tip}>{tip}</p>
          ))}
        </div>
        <div className="fantasy-lane-result-actions">
          <button type="button" className="fantasy-lane-btn" onClick={onRetry}>重开本局</button>
          <button type="button" className="fantasy-lane-btn fantasy-lane-btn--muted" onClick={onBackToSetup}>返回备战</button>
        </div>
      </div>
    </div>
  );
};
