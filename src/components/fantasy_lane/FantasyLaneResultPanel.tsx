import React from 'react';
import { getFantasyLaneLevelById } from '../../features/fantasy_lane/fantasyLaneLevelCatalog.ts';
import {
  getFantasyLaneCollectionSummary,
  getFantasyLaneChapterProgress,
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

interface ResultCellData {
  value: string;
  subValue: string;
  percent: number;
  tone: 'red' | 'blue' | 'gold' | 'green';
}

interface ResultRowData {
  key: string;
  label: string;
  subLabel: string;
  mainValue: string;
  mainSubValue: string;
  cells: [ResultCellData, ResultCellData, ResultCellData];
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

function makeCell(value: string, subValue: string, percent: number, tone: ResultCellData['tone']): ResultCellData {
  return {
    value,
    subValue,
    percent: clampPercent(percent),
    tone,
  };
}

export const FantasyLaneResultPanel: React.FC<FantasyLaneResultPanelProps> = ({ state, onRetry, onBackToSetup }) => {
  if (state.phase !== 'won' && state.phase !== 'lost') return null;

  const currentLevel = getFantasyLaneLevelById(state.selectedLevelId);
  const currentHero = FANTASY_LANE_HEROES.find((hero) => hero.id === state.selectedHeroId);
  const currentTactical = FANTASY_LANE_TACTICAL_SKILLS.find((skill) => skill.id === state.selectedTacticalId);
  const progress = loadFantasyLaneProgress();
  const chapterProgress = getFantasyLaneChapterProgress(progress, currentLevel.chapterId);
  const collection = getFantasyLaneCollectionSummary(progress);
  const rewardCount = getRewardCount(state);
  const totalSkillCast = state.stats.heroSkillCast + state.stats.tacticalSkillCast;
  const averageEngageTimeMs =
    state.stats.engagedUnits > 0 ? Math.round(state.stats.totalEngageDelayMs / state.stats.engagedUnits) : 0;
  const enemyBaseBreakPercent = clampPercent(((state.enemyBaseHpMax - state.enemyBaseHp) / Math.max(1, state.enemyBaseHpMax)) * 100);
  const playerBaseRemainPercent = clampPercent((state.playerBaseHp / Math.max(1, state.playerBaseHpMax)) * 100);
  const battleEconomyPercent = clampPercent((state.stats.goldSpent / Math.max(1, state.stats.goldSpent + state.gold)) * 100);
  const bossPhaseTotal = currentLevel.boss?.phases.length ?? 0;
  const bossPhaseReached = state.stats.bossPhasesEntered;
  const rewardUnits = state.result?.rewards?.unlockedUnits ?? [];
  const rewardFragments = Object.entries(state.result?.rewards?.fragments ?? {});

  const rows: ResultRowData[] = [
    {
      key: 'overall',
      label: state.phase === 'won' ? 'MVP' : '战报',
      subLabel: currentHero?.name ?? '当前英雄',
      mainValue: `${(state.result?.score ?? 0) / 1000}`.replace(/\.0$/, ''),
      mainSubValue: `得分 ${(state.result?.score ?? 0).toLocaleString()} / ${renderStars(state.result?.stars ?? 1)}`,
      cells: [
        makeCell(
          `${state.stats.defeated.toLocaleString()}`,
          `敌方出兵 ${state.stats.enemySummoned.toLocaleString()}`,
          (state.stats.defeated / Math.max(1, state.stats.enemySummoned)) * 100,
          'red',
        ),
        makeCell(
          `${Math.round(state.stats.goldSpent).toLocaleString()}`,
          `剩余 ${Math.round(state.gold).toLocaleString()}`,
          battleEconomyPercent,
          'gold',
        ),
        makeCell(
          `${formatMsToClock(state.elapsedMs)}`,
          `时限 ${formatMsToClock(currentLevel.battleTimeLimitMs)}`,
          (state.elapsedMs / Math.max(1, currentLevel.battleTimeLimitMs)) * 100,
          'green',
        ),
      ],
    },
    {
      key: 'bases',
      label: '基地',
      subLabel: `${currentLevel.id} ${currentLevel.name}`,
      mainValue: `${playerBaseRemainPercent}%`,
      mainSubValue: `我方 ${state.playerBaseHp}/${state.playerBaseHpMax}`,
      cells: [
        makeCell(
          `${enemyBaseBreakPercent}%`,
          `敌方 ${state.enemyBaseHp}/${state.enemyBaseHpMax}`,
          enemyBaseBreakPercent,
          'red',
        ),
        makeCell(
          `${state.activePop}/${state.popLimit}`,
          `队列 ${state.queue.length}/${state.queueLimit}`,
          (state.activePop / Math.max(1, state.popLimit)) * 100,
          'blue',
        ),
        makeCell(
          `${state.stats.levelPhasesEntered}`,
          bossPhaseTotal > 0 ? `Boss ${bossPhaseReached}/${bossPhaseTotal}` : 'Boss 0/0',
          ((state.stats.levelPhasesEntered + bossPhaseReached) / Math.max(1, currentLevel.phases.length + bossPhaseTotal)) * 100,
          'green',
        ),
      ],
    },
    {
      key: 'deployment',
      label: '编组',
      subLabel: `${currentTactical?.name ?? '战术'} / 当前编组`,
      mainValue: `${state.stats.summoned}`,
      mainSubValue: `我方出兵 / 对空 ${state.stats.antiAirSummons}`,
      cells: [
        makeCell(
          `${state.stats.frontlineSummons}`,
          `前排人口`,
          (state.stats.frontlineSummons / Math.max(1, state.stats.summoned)) * 100,
          'red',
        ),
        makeCell(
          `${state.stats.aoeSummons}`,
          `AOE 人口`,
          (state.stats.aoeSummons / Math.max(1, state.stats.summoned)) * 100,
          'blue',
        ),
        makeCell(
          `${state.stats.engagedUnits}`,
          averageEngageTimeMs > 0 ? `平均 ${averageEngageTimeMs}ms` : '平均 0ms',
          (state.stats.engagedUnits / Math.max(1, state.stats.summoned)) * 100,
          'green',
        ),
      ],
    },
    {
      key: 'skills',
      label: '技能',
      subLabel: `${currentHero?.name ?? '-'} / ${currentTactical?.name ?? '-'}`,
      mainValue: `${totalSkillCast}`,
      mainSubValue: `英雄 ${state.stats.heroSkillCast} / 战术 ${state.stats.tacticalSkillCast}`,
      cells: [
        makeCell(
          `${state.stats.heroSkillCast}`,
          '英雄技次数',
          (state.stats.heroSkillCast / Math.max(1, totalSkillCast)) * 100,
          'red',
        ),
        makeCell(
          `${state.stats.tacticalSkillCast}`,
          '战术技次数',
          (state.stats.tacticalSkillCast / Math.max(1, totalSkillCast)) * 100,
          'blue',
        ),
        makeCell(
          `${state.stats.queueBlocked}`,
          `拥堵 ${formatSeconds(state.stats.congestionMs)}`,
          (state.stats.queueBlocked / Math.max(1, state.stats.summoned)) * 100,
          'green',
        ),
      ],
    },
    {
      key: 'pressure',
      label: '压制',
      subLabel: '弹道 / 范围 / 收口',
      mainValue: `${state.stats.projectilesFired}`,
      mainSubValue: `弹道总数 / AOE ${state.stats.aoeHits}`,
      cells: [
        makeCell(
          `${state.stats.aoeHits}`,
          '范围命中',
          (state.stats.aoeHits / Math.max(1, state.stats.projectilesFired)) * 100,
          'red',
        ),
        makeCell(
          `${Math.round(state.frontline)}`,
          `空优 ${Math.round(state.airControl)}`,
          ((Math.abs(state.frontline) + Math.abs(state.airControl)) / 20) * 100,
          'blue',
        ),
        makeCell(
          `${rewardCount}`,
          `章节 ${chapterProgress.completed}/${chapterProgress.total}`,
          (chapterProgress.completed / Math.max(1, chapterProgress.total)) * 100,
          'green',
        ),
      ],
    },
  ];

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

        <div className="fantasy-lane-result-table">
          <div className="fantasy-lane-result-table-header">
            <span className="fantasy-lane-result-col-player">项目</span>
            <span className="fantasy-lane-result-col-score">主值</span>
            <span className="fantasy-lane-result-col-metric">战斗</span>
            <span className="fantasy-lane-result-col-metric">经济 / 投入</span>
            <span className="fantasy-lane-result-col-metric">推进 / 阶段</span>
          </div>

          {rows.map((row, index) => (
            <div
              key={row.key}
              className={`fantasy-lane-result-table-row${index === 0 ? ' is-highlight' : ''}${index % 2 === 0 ? '' : ' is-alt'}`}
            >
              <div className="fantasy-lane-result-player-cell">
                <div className={`fantasy-lane-result-avatar fantasy-lane-result-avatar--${index === 0 ? 'highlight' : 'normal'}`}>
                  {index === 0 ? '★' : row.label.slice(0, 1)}
                </div>
                <div className="fantasy-lane-result-player-meta">
                  <strong>{row.label}</strong>
                  <span>{row.subLabel}</span>
                </div>
              </div>

              <div className="fantasy-lane-result-main-cell">
                <strong>{row.mainValue}</strong>
                <span>{row.mainSubValue}</span>
              </div>

              {row.cells.map((cell, cellIndex) => (
                <div key={`${row.key}-${cellIndex}`} className="fantasy-lane-result-metric-cell">
                  <div className="fantasy-lane-result-metric-head">
                    <strong>{cell.value}</strong>
                    <span>{cell.subValue}</span>
                  </div>
                  <div className="fantasy-lane-result-metric-bar">
                    <span
                      className={`fantasy-lane-result-metric-fill fantasy-lane-result-metric-fill--${cell.tone}`}
                      style={{ width: `${cell.percent}%` }}
                    />
                    <small>{cell.percent}%</small>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

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
