import React from 'react';
import { getFantasyLaneLevelById } from '../../features/fantasy_lane/fantasyLaneLevelCatalog.ts';
import {
  getFantasyLaneCollectionSummary,
  loadFantasyLaneProgress,
} from '../../features/fantasy_lane/fantasyLaneProgressStorage.ts';
import type { FantasyLaneRuntimeState } from '../../features/fantasy_lane/fantasyLaneTypes.ts';
import { FANTASY_LANE_HEROES, FANTASY_LANE_TACTICAL_SKILLS, FANTASY_LANE_UNIT_MAP } from '../../features/fantasy_lane/fantasyLaneUnitRegistry.ts';
import { FantasyLaneUnitSprite } from './FantasyLaneUnitSprite';

interface FantasyLaneResultPanelProps {
  state: FantasyLaneRuntimeState;
  onRetry: () => void;
  onBackToSetup: () => void;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatMsToClock(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatSeconds(ms: number) {
  return `${(Math.round(ms / 100) / 10).toFixed(1)}s`;
}

function renderStars(stars: number) {
  return `${'★'.repeat(stars)}${'☆'.repeat(Math.max(0, 3 - stars))}`;
}

function getRewardCount(state: FantasyLaneRuntimeState) {
  return (state.result?.rewards?.unlockedUnits.length ?? 0) + Object.keys(state.result?.rewards?.fragments ?? {}).length;
}

export const FantasyLaneResultPanel: React.FC<FantasyLaneResultPanelProps> = ({ state, onRetry, onBackToSetup }) => {
  if (state.phase !== 'won' && state.phase !== 'lost') return null;

  const currentLevel = getFantasyLaneLevelById(state.selectedLevelId);
  const currentHero = FANTASY_LANE_HEROES.find((hero) => hero.id === state.selectedHeroId);
  const currentTactical = FANTASY_LANE_TACTICAL_SKILLS.find((skill) => skill.id === state.selectedTacticalId);
  const progress = loadFantasyLaneProgress();
  const collection = getFantasyLaneCollectionSummary(progress);
  const rewardCount = getRewardCount(state);
  const playerBaseRemainPercent = clampPercent((state.playerBaseHp / Math.max(1, state.playerBaseHpMax)) * 100);
  const battleEconomyPercent = clampPercent((state.stats.goldSpent / Math.max(1, state.stats.goldSpent + state.gold)) * 100);
  const rewardUnits = state.result?.rewards?.unlockedUnits ?? [];
  const rewardFragments = Object.entries(state.result?.rewards?.fragments ?? {});
  const loadoutUnits = state.loadoutUnitIds.map((id) => FANTASY_LANE_UNIT_MAP[id]).filter(Boolean);

  return (
    <div className="fantasy-lane-result-overlay">
      <div className={`fantasy-lane-result-card fantasy-lane-result-card--${state.phase}`}>
        <div className="fantasy-lane-result-summarybar">
          <div className="fantasy-lane-result-summarybar-main">
            <span className={`fantasy-lane-result-badge fantasy-lane-result-badge--${state.phase}`}>
              {state.phase === 'won' ? '胜利' : '失败'}
            </span>
            <strong>{currentLevel.chapterName} / {currentLevel.id} {currentLevel.name}</strong>
          </div>
          <div className="fantasy-lane-result-summarybar-meta">
            <span>星级 {renderStars(state.result?.stars ?? 1)}</span>
            <span>收藏 {collection.unlocked}/{collection.total}</span>
            <span>奖励 {rewardCount}</span>
          </div>
        </div>

        <div className="fantasy-lane-result-core-stats">
          <div className="fantasy-lane-result-stat">
            <span className="fantasy-lane-result-stat-label">时间</span>
            <strong>{formatMsToClock(state.elapsedMs)}</strong>
            <span className="fantasy-lane-result-stat-sub">时限 {formatMsToClock(currentLevel.battleTimeLimitMs)}</span>
          </div>
          <div className="fantasy-lane-result-stat">
            <span className="fantasy-lane-result-stat-label">得分</span>
            <strong>{(state.result?.score ?? 0).toLocaleString()}</strong>
            <span className="fantasy-lane-result-stat-sub">星级 {renderStars(state.result?.stars ?? 1)}</span>
          </div>
          <div className="fantasy-lane-result-stat">
            <span className="fantasy-lane-result-stat-label">剩余 HP</span>
            <strong>{state.playerBaseHp}/{state.playerBaseHpMax}</strong>
            <span className="fantasy-lane-result-stat-sub">{playerBaseRemainPercent}%</span>
          </div>
        </div>

        <div className="fantasy-lane-result-deployment">
          <h4>编组表现</h4>
          <div className="fantasy-lane-result-deployment-grid">
            {loadoutUnits.map((unit) => (
              <div key={unit.id} className="fantasy-lane-result-deployment-card">
                <FantasyLaneUnitSprite unitId={unit.id} side="player" hpPercent={1} isAttacking={false} animated={false} scale={0.56} />
                <strong>{unit.name}</strong>
                <span>出兵 {state.stats.summoned} 次</span>
              </div>
            ))}
          </div>
        </div>

        <div className="fantasy-lane-result-economy">
          <h4>经济分析</h4>
          <div className="fantasy-lane-result-economy-items">
            <div className="fantasy-lane-result-economy-item">
              <span>金币花费</span>
              <strong>{Math.round(state.stats.goldSpent).toLocaleString()}</strong>
            </div>
            <div className="fantasy-lane-result-economy-item">
              <span>剩余金币</span>
              <strong>{Math.round(state.gold).toLocaleString()}</strong>
            </div>
            <div className="fantasy-lane-result-economy-item">
              <span>人口利用率</span>
              <strong>{Math.round((state.activePop / Math.max(1, state.popLimit)) * 100)}%</strong>
            </div>
            <div className="fantasy-lane-result-economy-item">
              <span>经济效率</span>
              <strong>{battleEconomyPercent}%</strong>
            </div>
          </div>
        </div>

        <div className="fantasy-lane-result-skills">
          <h4>技能使用</h4>
          <div className="fantasy-lane-result-skill-items">
            <div className="fantasy-lane-result-skill-item">
              <span>英雄技 ({currentHero?.name})</span>
              <strong>{state.stats.heroSkillCast} 次</strong>
            </div>
            <div className="fantasy-lane-result-skill-item">
              <span>战术技 ({currentTactical?.name})</span>
              <strong>{state.stats.tacticalSkillCast} 次</strong>
            </div>
            <div className="fantasy-lane-result-skill-item">
              <span>拥堵时间</span>
              <strong>{formatSeconds(state.stats.congestionMs)}</strong>
            </div>
          </div>
        </div>

        {state.phase === 'lost' && (
          <div className="fantasy-lane-result-failure-tips">
            <h4>失败原因</h4>
            <ul>
              {playerBaseRemainPercent < 30 && <li>基地血量过低，需要加强防守</li>}
              {state.gold > state.stats.goldSpent * 0.5 && <li>金币剩余过多，建议增加出兵频率</li>}
              {state.stats.antiAirSummons === 0 && <li>没有对空单位，建议编组对空兵种</li>}
              {state.stats.summoned < 10 && <li>出兵次数过少，建议加快出兵节奏</li>}
            </ul>
          </div>
        )}

        <div className="fantasy-lane-result-footbar">
          <div className="fantasy-lane-result-footbar-group">
            <span>通关解锁</span>
            <div className="fantasy-lane-result-footbar-items">
              {(currentLevel.unlockRewards ?? []).map((unitId) => {
                const unit = FANTASY_LANE_UNIT_MAP[unitId];
                return unit ? (
                  <div key={`unlock-${unitId}`} className="fantasy-lane-result-chip">
                    <FantasyLaneUnitSprite unitId={unitId} side="player" hpPercent={1} isAttacking={false} animated={false} scale={0.56} />
                    <strong>{unit.name}</strong>
                  </div>
                ) : null;
              })}
              {!(currentLevel.unlockRewards ?? []).length ? <span className="fantasy-lane-result-footbar-empty">0</span> : null}
            </div>
          </div>

          <div className="fantasy-lane-result-footbar-group">
            <span>本局掉落</span>
            <div className="fantasy-lane-result-footbar-items">
              {rewardUnits.map((unitId) => {
                const unit = FANTASY_LANE_UNIT_MAP[unitId];
                return unit ? (
                  <div key={`reward-unit-${unitId}`} className="fantasy-lane-result-chip">
                    <FantasyLaneUnitSprite unitId={unitId} side="player" hpPercent={1} isAttacking={false} animated={false} scale={0.56} />
                    <strong>{unit.name}</strong>
                  </div>
                ) : null;
              })}
              {rewardFragments.map(([unitId, count]) => {
                const unit = FANTASY_LANE_UNIT_MAP[unitId];
                return unit ? (
                  <div key={`reward-fragment-${unitId}`} className="fantasy-lane-result-chip">
                    <FantasyLaneUnitSprite unitId={unitId} side="player" hpPercent={1} isAttacking={false} animated={false} scale={0.56} />
                    <strong>{unit.name} x{count}</strong>
                  </div>
                ) : null;
              })}
              {rewardUnits.length === 0 && rewardFragments.length === 0 ? <span className="fantasy-lane-result-footbar-empty">0</span> : null}
            </div>
          </div>
        </div>

        <div className="fantasy-lane-result-actions">
          <button type="button" className="fantasy-lane-btn" onClick={onRetry}>
            重开本局
          </button>
          <button type="button" className="fantasy-lane-btn fantasy-lane-btn--muted" onClick={onBackToSetup}>
            返回备战
          </button>
        </div>
      </div>
    </div>
  );
};
