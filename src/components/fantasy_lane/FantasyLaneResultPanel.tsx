import React from 'react';
import { getFantasyLaneLevelById } from '../../features/fantasy_lane/fantasyLaneLevelCatalog.ts';
import {
  getFantasyLaneCollectionSummary,
  getFantasyLaneChapterProgress,
  loadFantasyLaneProgress,
} from '../../features/fantasy_lane/fantasyLaneProgressStorage.ts';
import type { FantasyLaneRuntimeState } from '../../features/fantasy_lane/fantasyLaneTypes.ts';
import { FANTASY_LANE_HEROES, FANTASY_LANE_TACTICAL_SKILLS, FANTASY_LANE_UNIT_MAP } from '../../features/fantasy_lane/fantasyLaneUnitRegistry.ts';
import { getBossPhaseVisualState, getReachedBossPhaseCount } from './fantasyLaneUiMeta.ts';
import { FantasyLaneUnitSprite } from './FantasyLaneUnitSprite';

interface FantasyLaneResultPanelProps {
  state: FantasyLaneRuntimeState;
  onRetry: () => void;
  onBackToSetup: () => void;
}

function renderStars(stars: number) {
  return `${'★'.repeat(stars)}${'☆'.repeat(Math.max(0, 3 - stars))}`;
}

function formatMsToClock(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatPercent(value: number, max: number) {
  return `${Math.round((value / Math.max(1, max)) * 100)}%`;
}

export const FantasyLaneResultPanel: React.FC<FantasyLaneResultPanelProps> = ({ state, onRetry, onBackToSetup }) => {
  if (state.phase !== 'won' && state.phase !== 'lost') return null;

  const currentLevel = getFantasyLaneLevelById(state.selectedLevelId);
  const currentHero = FANTASY_LANE_HEROES.find((hero) => hero.id === state.selectedHeroId);
  const currentTactical = FANTASY_LANE_TACTICAL_SKILLS.find((skill) => skill.id === state.selectedTacticalId);
  const progress = loadFantasyLaneProgress();
  const chapterProgress = getFantasyLaneChapterProgress(progress, currentLevel.chapterId);
  const chapterRecord = progress.chapterRecords[currentLevel.chapterId];
  const collection = getFantasyLaneCollectionSummary(progress);
  const reachedBossPhaseCount = getReachedBossPhaseCount(currentLevel, state);
  const averageEngageTimeMs =
    state.stats.engagedUnits > 0 ? Math.round(state.stats.totalEngageDelayMs / state.stats.engagedUnits) : 0;
  const actualRewards = state.result?.rewards;

  const statCards = [
    ['击败', state.stats.defeated],
    ['我方出兵', state.stats.summoned],
    ['敌方出兵', state.stats.enemySummoned],
    ['英雄技', state.stats.heroSkillCast],
    ['战术技', state.stats.tacticalSkillCast],
    ['前排投放', state.stats.frontlineSummons],
    ['对空投放', state.stats.antiAirSummons],
    ['AOE 投放', state.stats.aoeSummons],
    ['队列阻塞', state.stats.queueBlocked],
    ['金币消耗', Math.round(state.stats.goldSpent)],
    ['金币满仓', `${Math.round(state.stats.goldCappedMs / 100) / 10}s`],
    ['弹道数', state.stats.projectilesFired],
    ['AOE 命中', state.stats.aoeHits],
    ['接敌单位', state.stats.engagedUnits],
    ['平均接敌', averageEngageTimeMs > 0 ? `${averageEngageTimeMs}ms` : '0ms'],
    ['拥堵时长', `${Math.round(state.stats.congestionMs / 100) / 10}s`],
    ['关卡阶段', state.stats.levelPhasesEntered],
    ['Boss 阶段', state.stats.bossPhasesEntered],
    ['Boss 技能', state.stats.bossSkillActivations],
    ['Boss 召唤', state.stats.bossPhaseSummons],
    ['脚本效果', state.stats.scriptedModifiersApplied],
  ] satisfies Array<[string, string | number]>;

  return (
    <div className="fantasy-lane-result-overlay">
      <div className={`fantasy-lane-result-card fantasy-lane-result-card--${state.phase}`}>
        <div className="fantasy-lane-result-header">
          <div className="fantasy-lane-result-headline">
            <span className={`fantasy-lane-result-badge fantasy-lane-result-badge--${state.phase}`}>
              {state.phase === 'won' ? '胜利' : '失败'}
            </span>
            <div className="fantasy-lane-result-context">
              <strong>{currentLevel.chapterName} / {currentLevel.id} {currentLevel.name}</strong>
              <span>得分 {state.result?.score ?? 0}</span>
            </div>
          </div>
          <div className="fantasy-lane-result-scoreboard">
            <div className="fantasy-lane-result-stars">{renderStars(state.result?.stars ?? 1)}</div>
            <strong>{state.result?.score ?? 0}</strong>
          </div>
        </div>

        <div className="fantasy-lane-result-identity-grid">
          <div className="fantasy-lane-result-identity-card">
            <span>我方基地</span>
            <strong>{state.playerBaseHp}/{state.playerBaseHpMax}</strong>
            <small>{formatPercent(state.playerBaseHp, state.playerBaseHpMax)}</small>
          </div>
          <div className="fantasy-lane-result-identity-card">
            <span>敌方基地</span>
            <strong>{state.enemyBaseHp}/{state.enemyBaseHpMax}</strong>
            <small>{formatPercent(state.enemyBaseHp, state.enemyBaseHpMax)}</small>
          </div>
          <div className="fantasy-lane-result-identity-card">
            <span>战斗时长</span>
            <strong>{formatMsToClock(state.elapsedMs)}</strong>
            <small>时限 {formatMsToClock(currentLevel.battleTimeLimitMs)}</small>
          </div>
          <div className="fantasy-lane-result-identity-card">
            <span>英雄 / 战术</span>
            <strong>{currentHero?.name ?? '-'}</strong>
            <small>{currentTactical?.name ?? '-'}</small>
          </div>
        </div>

        <div className="fantasy-lane-result-meta-grid">
          <span>章节进度 {chapterProgress.completed}/{chapterProgress.total}</span>
          <span>章节星级 {chapterRecord?.stars ?? 0}/{chapterRecord?.maxStars ?? chapterProgress.maxStars}</span>
          <span>收藏 {collection.unlocked}/{collection.total}</span>
          <span>人口 {state.activePop}/{state.popLimit}</span>
          <span>队列 {state.queue.length}/{state.queueLimit}</span>
          <span>金币 {Math.round(state.gold)}</span>
          <span>前线 {Math.round(state.frontline)}</span>
          <span>空优 {Math.round(state.airControl)}</span>
        </div>

        <section className="fantasy-lane-result-section">
          <h3>战斗数据</h3>
          <div className="fantasy-lane-result-stats-grid">
            {statCards.map(([label, value]) => (
              <div key={label} className="fantasy-lane-result-stat-card">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </section>

        {currentLevel.boss ? (
          <section className="fantasy-lane-result-section">
            <h3>Boss 阶段</h3>
            <div className="fantasy-lane-result-meta-grid">
              <span>已触发 {reachedBossPhaseCount}/{currentLevel.boss.phases.length}</span>
            </div>
            <div className="fantasy-lane-result-boss-strip" aria-label="Boss 阶段回顾">
              {currentLevel.boss.phases.map((phase, index) => (
                <span
                  key={phase.id}
                  className={`fantasy-lane-boss-phase-pill is-${getBossPhaseVisualState(currentLevel, state, phase.id)}`}
                >
                  P{index + 1} / {Math.round(phase.hpThreshold)}%
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <section className="fantasy-lane-result-section">
          <h3>关卡数据</h3>
          <div className="fantasy-lane-result-detail-grid">
            <div className="fantasy-lane-result-detail-card"><span>开局金币</span><strong>{currentLevel.startingGold}</strong></div>
            <div className="fantasy-lane-result-detail-card"><span>关卡压力</span><strong>{currentLevel.enemyPressure}</strong></div>
            <div className="fantasy-lane-result-detail-card"><span>玩家基地初始</span><strong>{currentLevel.playerBaseHp}</strong></div>
            <div className="fantasy-lane-result-detail-card"><span>敌方基地初始</span><strong>{currentLevel.enemyBaseHp}</strong></div>
            <div className="fantasy-lane-result-detail-card"><span>推荐英雄位 1</span><strong>{currentLevel.suggestedHeroes[0] ?? '-'}</strong></div>
            <div className="fantasy-lane-result-detail-card"><span>推荐英雄位 2</span><strong>{currentLevel.suggestedHeroes[1] ?? '-'}</strong></div>
          </div>
        </section>

        <section className="fantasy-lane-result-section">
          <h3>本局奖励</h3>
          <div className="fantasy-lane-result-reward-table">
            {actualRewards?.unlockedUnits.map((unitId) => {
              const unit = FANTASY_LANE_UNIT_MAP[unitId];
              if (!unit) return null;
              return (
                <div key={`unlock-${unitId}`} className="fantasy-lane-result-reward-row">
                  <span className="fantasy-lane-result-reward-type">解锁单位</span>
                  <div className="fantasy-lane-result-reward-unit">
                    <FantasyLaneUnitSprite
                      unitId={unitId}
                      side="player"
                      hpPercent={1}
                      isAttacking={false}
                      animated={false}
                      scale={0.72}
                    />
                    <strong>{unit.name}</strong>
                  </div>
                  <span className="fantasy-lane-result-reward-count">x1</span>
                </div>
              );
            })}
            {Object.entries(actualRewards?.fragments ?? {}).map(([unitId, count]) => {
              const unit = FANTASY_LANE_UNIT_MAP[unitId];
              if (!unit) return null;
              return (
                <div key={`fragment-${unitId}`} className="fantasy-lane-result-reward-row">
                  <span className="fantasy-lane-result-reward-type">单位碎片</span>
                  <div className="fantasy-lane-result-reward-unit">
                    <FantasyLaneUnitSprite
                      unitId={unitId}
                      side="player"
                      hpPercent={1}
                      isAttacking={false}
                      animated={false}
                      scale={0.72}
                    />
                    <strong>{unit.name}</strong>
                  </div>
                  <span className="fantasy-lane-result-reward-count">x{count}</span>
                </div>
              );
            })}
            {!actualRewards || (actualRewards.unlockedUnits.length === 0 && Object.keys(actualRewards.fragments).length === 0) ? (
              <div className="fantasy-lane-result-reward-row fantasy-lane-result-reward-row--empty">
                <span className="fantasy-lane-result-reward-type">本局奖励</span>
                <strong>0</strong>
              </div>
            ) : null}
          </div>
        </section>

        <section className="fantasy-lane-result-section">
          <h3>关卡奖励表</h3>
          <div className="fantasy-lane-result-reward-table">
            {(currentLevel.unlockRewards ?? []).map((unitId) => {
              const unit = FANTASY_LANE_UNIT_MAP[unitId];
              return unit ? (
                <div key={`level-unlock-${unitId}`} className="fantasy-lane-result-reward-row">
                  <span className="fantasy-lane-result-reward-type">通关解锁</span>
                  <div className="fantasy-lane-result-reward-unit">
                    <FantasyLaneUnitSprite
                      unitId={unitId}
                      side="player"
                      hpPercent={1}
                      isAttacking={false}
                      animated={false}
                      scale={0.72}
                    />
                    <strong>{unit.name}</strong>
                  </div>
                  <span className="fantasy-lane-result-reward-count">x1</span>
                </div>
              ) : null;
            })}
            {Object.entries(currentLevel.fragmentRewards ?? {}).map(([unitId, count]) => {
              const unit = FANTASY_LANE_UNIT_MAP[unitId];
              return unit ? (
                <div key={`level-fragment-${unitId}`} className="fantasy-lane-result-reward-row">
                  <span className="fantasy-lane-result-reward-type">关卡碎片</span>
                  <div className="fantasy-lane-result-reward-unit">
                    <FantasyLaneUnitSprite
                      unitId={unitId}
                      side="player"
                      hpPercent={1}
                      isAttacking={false}
                      animated={false}
                      scale={0.72}
                    />
                    <strong>{unit.name}</strong>
                  </div>
                  <span className="fantasy-lane-result-reward-count">x{count}</span>
                </div>
              ) : null;
            })}
            {Object.entries(currentLevel.starRewards ?? {}).flatMap(([star, unitIds]) =>
              unitIds.map((unitId) => {
                const unit = FANTASY_LANE_UNIT_MAP[unitId];
                return unit ? (
                  <div key={`star-${star}-${unitId}`} className="fantasy-lane-result-reward-row">
                    <span className="fantasy-lane-result-reward-type">{star} 星奖励</span>
                    <div className="fantasy-lane-result-reward-unit">
                      <FantasyLaneUnitSprite
                        unitId={unitId}
                        side="player"
                        hpPercent={1}
                        isAttacking={false}
                        animated={false}
                        scale={0.72}
                      />
                      <strong>{unit.name}</strong>
                    </div>
                    <span className="fantasy-lane-result-reward-count">x1</span>
                  </div>
                ) : null;
              }),
            )}
            {!(currentLevel.unlockRewards?.length || Object.keys(currentLevel.fragmentRewards ?? {}).length || Object.keys(currentLevel.starRewards ?? {}).length) ? (
              <div className="fantasy-lane-result-reward-row fantasy-lane-result-reward-row--empty">
                <span className="fantasy-lane-result-reward-type">关卡奖励表</span>
                <strong>0</strong>
              </div>
            ) : null}
          </div>
        </section>

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
