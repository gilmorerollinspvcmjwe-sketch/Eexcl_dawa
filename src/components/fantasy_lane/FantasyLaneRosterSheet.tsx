import React, { useEffect, useMemo, useState } from 'react';
import { FANTASY_LANE_LEVELS } from '../../features/fantasy_lane/fantasyLaneLevelCatalog.ts';
import { FANTASY_LANE_HEROES, FANTASY_LANE_TACTICAL_SKILLS, FANTASY_LANE_UNITS } from '../../features/fantasy_lane/fantasyLaneUnitRegistry.ts';
import type { FantasyLaneCombatRole, FantasyLaneUnitDefinition, FantasyLaneUnitUnlockCondition } from '../../features/fantasy_lane/fantasyLaneTypes.ts';
import {
  canUpgradeFantasyLaneUnit,
  getFantasyLaneCollectionSummary,
  getFantasyLaneUnitBattleBonus,
  getFantasyLaneUnitUpgradeCost,
  getUnitFragmentCount,
  isUnitUnlocked,
  loadFantasyLaneProgress,
  upgradeFantasyLaneUnitWithFragments,
} from '../../features/fantasy_lane/fantasyLaneProgressStorage.ts';
import { FantasyLaneUnitSprite } from './FantasyLaneUnitSprite';
import { formatCooldownMs, getUnitSpriteScale } from './fantasyLaneUiMeta.ts';
import '../../styles/fantasy-lane.css';

type LayerFilter = 'all' | 'ground' | 'air';
type UnlockFilter = 'all' | 'unlocked' | 'locked';
type RangeFilter = 'all' | 'melee' | 'ranged';
type ProfileFilter = 'all' | 'single' | 'aoe';
type TargetFilter = 'all' | 'ground_only' | 'air_only' | 'both';
type RoleFilter = 'all' | FantasyLaneCombatRole;

type RosterFilters = {
  layer: LayerFilter;
  unlock: UnlockFilter;
  range: RangeFilter;
  profile: ProfileFilter;
  target: TargetFilter;
  role: RoleFilter;
};

interface FantasyLaneRosterSheetProps {
  onFormulaChange?: (text: string) => void;
}

const DEFAULT_FILTERS: RosterFilters = {
  layer: 'all',
  unlock: 'all',
  range: 'all',
  profile: 'all',
  target: 'all',
  role: 'all',
};

const LAYER_FILTERS: Array<{ value: LayerFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'ground', label: '地面' },
  { value: 'air', label: '空中' },
];

const UNLOCK_FILTERS: Array<{ value: UnlockFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'unlocked', label: '已解锁' },
  { value: 'locked', label: '未解锁' },
];

const ROLE_LABELS: Record<FantasyLaneCombatRole, string> = {
  tank: '前排',
  fighter: '战士',
  sniper: '射手',
  caster: '法师',
  siege: '攻城',
  air_sup: '空优',
  finisher: '终结',
};

const FOOTPRINT_LABELS: Record<FantasyLaneUnitDefinition['footprint'], string> = {
  small: '小型',
  medium: '中型',
  large: '大型',
  giant: '巨型',
};

const DAMAGE_TYPE_LABELS: Record<FantasyLaneUnitDefinition['damageType'], string> = {
  physical: '物理',
  pierce: '穿刺',
  blast: '爆破',
  magic: '魔法',
  siege: '攻城',
  antiAir: '对空',
};

const TARGET_RULE_LABELS: Record<FantasyLaneUnitDefinition['targetRule'], string> = {
  ground_only: '对地',
  air_only: '对空',
  both: '空地',
};

const ARMOR_TYPE_LABELS: Record<FantasyLaneUnitDefinition['armorType'], string> = {
  light: '轻甲',
  heavy: '重甲',
  swarm: '群体',
  structure: '建筑',
  air: '空甲',
};

const RANGE_FILTERS: Array<{ value: RangeFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'melee', label: '近战' },
  { value: 'ranged', label: '远程' },
];

const PROFILE_FILTERS: Array<{ value: ProfileFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'single', label: '单体' },
  { value: 'aoe', label: 'AOE' },
];

const TARGET_FILTERS: Array<{ value: TargetFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'ground_only', label: '对地' },
  { value: 'air_only', label: '对空' },
  { value: 'both', label: '空地' },
];

const ROLE_FILTERS: Array<{ value: RoleFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'tank', label: '前排' },
  { value: 'fighter', label: '战士' },
  { value: 'sniper', label: '射手' },
  { value: 'caster', label: '法师' },
  { value: 'siege', label: '攻城' },
  { value: 'air_sup', label: '空优' },
  { value: 'finisher', label: '终结' },
];

function getAttackLabel(unit: FantasyLaneUnitDefinition) {
  if (unit.damageProfile === 'aoe') return unit.rangeBand === 'melee' ? '近战AOE' : '远程AOE';
  return unit.rangeBand === 'melee' ? '近战单体' : '远程单体';
}

function resolveDisplayUnlockCondition(unit: FantasyLaneUnitDefinition): FantasyLaneUnitUnlockCondition | undefined {
  if (unit.unlockCondition) return unit.unlockCondition;

  for (const level of FANTASY_LANE_LEVELS) {
    if (level.unlockRewards?.includes(unit.id)) {
      return {
        type: 'level_clear',
        levelId: level.id,
      };
    }

    if (level.starRewards) {
      for (const [starsText, rewardedUnits] of Object.entries(level.starRewards)) {
        if (!rewardedUnits.includes(unit.id)) continue;
        return {
          type: 'star_reward',
          levelId: level.id,
          stars: Number(starsText),
        };
      }
    }
  }

  return undefined;
}

function getUnlockText(unit: FantasyLaneUnitDefinition) {
  const unlockCondition = resolveDisplayUnlockCondition(unit);
  if (!unlockCondition) return '默认开放';

  switch (unlockCondition.type) {
    case 'level_clear':
      return unlockCondition.levelId ? `通关 ${unlockCondition.levelId}` : '通关解锁';
    case 'boss_clear':
      return unlockCondition.levelId ? `击败 ${unlockCondition.levelId}` : 'Boss 解锁';
    case 'star_reward':
      return unlockCondition.levelId && unlockCondition.stars
        ? `${unlockCondition.levelId} ${unlockCondition.stars} 星`
        : '星级解锁';
    case 'fragment_synthesis':
      return unlockCondition.fragmentCount ? `${unlockCondition.fragmentCount} 碎片合成` : '碎片合成';
    default:
      return '待解锁';
  }
}

function formatNumber(value: number, digits = 1) {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(digits);
}

function applyRosterFilters(
  unit: FantasyLaneUnitDefinition,
  filters: RosterFilters,
  unlocked: boolean,
) {
  if (filters.layer !== 'all' && unit.layer !== filters.layer) return false;
  if (filters.unlock === 'unlocked' && !unlocked) return false;
  if (filters.unlock === 'locked' && unlocked) return false;
  if (filters.range !== 'all' && unit.rangeBand !== filters.range) return false;
  if (filters.profile !== 'all' && unit.damageProfile !== filters.profile) return false;
  if (filters.target !== 'all' && unit.targetRule !== filters.target) return false;
  if (filters.role !== 'all' && unit.role !== filters.role) return false;
  return true;
}

export const FantasyLaneRosterSheet: React.FC<FantasyLaneRosterSheetProps> = ({ onFormulaChange }) => {
  const [draftFilters, setDraftFilters] = useState<RosterFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<RosterFilters>(DEFAULT_FILTERS);
  const [progress, setProgress] = useState(() => loadFantasyLaneProgress());

  const collection = getFantasyLaneCollectionSummary(progress);

  useEffect(() => {
    onFormulaChange?.(`= 兵种与英雄总览 | 兵种 ${FANTASY_LANE_UNITS.length} | 英雄 ${FANTASY_LANE_HEROES.length} | 战术 ${FANTASY_LANE_TACTICAL_SKILLS.length}`);
  }, [onFormulaChange]);

  const filteredUnits = useMemo(() => {
    return FANTASY_LANE_UNITS.filter((unit) => applyRosterFilters(unit, appliedFilters, isUnitUnlocked(progress, unit.id)));
  }, [appliedFilters, progress]);

  const visibleGroundUnits = filteredUnits.filter((unit) => unit.layer === 'ground');
  const visibleAirUnits = filteredUnits.filter((unit) => unit.layer === 'air');

  const renderUnitCard = (unit: FantasyLaneUnitDefinition, index: number) => {
    const unlocked = isUnitUnlocked(progress, unit.id);
    const stars = progress.unitStars[unit.id] || 0;
    const fragments = getUnitFragmentCount(progress, unit.id);
    const canUpgrade = canUpgradeFantasyLaneUnit(progress, unit.id);
    const upgradeCost = getFantasyLaneUnitUpgradeCost(stars);
    const battleBonus = getFantasyLaneUnitBattleBonus(stars);

    return (
      <div
        key={unit.id}
        className={`fantasy-lane-unit-card fantasy-lane-roster-unit-card${index % 2 === 0 ? '' : ' is-alt'}${!unlocked ? ' fantasy-lane-unit--locked' : ''}`}
      >
        <div className="fantasy-lane-unit-card-header">
          <div className="fantasy-lane-unit-card-icon">
            {unlocked ? (
              <FantasyLaneUnitSprite
                unitId={unit.id}
                side="player"
                hpPercent={1}
                isAttacking={false}
                animated={false}
                scale={getUnitSpriteScale(unit.footprint) * 0.8}
              />
            ) : (
              <span className="fantasy-lane-locked-icon">?</span>
            )}
          </div>
          <div className="fantasy-lane-unit-card-title">
            <div className="fantasy-lane-unit-card-name-row">
              <strong>{unlocked ? unit.name : '???'}</strong>
              <span className="fantasy-lane-unit-card-icon-text">{unlocked ? unit.icon : '?'}</span>
            </div>
            {unlocked ? (
              <div className="fantasy-lane-unit-card-tags">
                <span className={`fantasy-lane-tag fantasy-lane-tag--primary fantasy-lane-tag--role-${unit.role}`}>
                  {ROLE_LABELS[unit.role]}
                </span>
                <span className="fantasy-lane-tag fantasy-lane-tag--secondary">{FOOTPRINT_LABELS[unit.footprint]}</span>
                <span className="fantasy-lane-tag fantasy-lane-tag--secondary">{getAttackLabel(unit)}</span>
                <span className="fantasy-lane-tag fantasy-lane-tag--target">{TARGET_RULE_LABELS[unit.targetRule]}</span>
                <span className="fantasy-lane-tag fantasy-lane-tag--feature">{unit.layer === 'air' ? '空中' : '地面'}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="fantasy-lane-roster-unit-meta">
          <span className="fantasy-lane-roster-unit-meta-item">{unlocked ? '已解锁' : '未解锁'}</span>
          <span className="fantasy-lane-roster-unit-meta-item">星级 {stars}/3</span>
          <span className="fantasy-lane-roster-unit-meta-item">碎片 {fragments}/{upgradeCost || 0}</span>
          <span className="fantasy-lane-roster-unit-meta-item">解锁 {getUnlockText(unit)}</span>
        </div>

        {unlocked ? (
          <>
            <div className="fantasy-lane-unit-card-desc">{unit.summary}</div>

            <div className="fantasy-lane-roster-unit-metrics">
              <div className="fantasy-lane-roster-unit-metric"><span>费用</span><strong>{unit.cost}</strong></div>
              <div className="fantasy-lane-roster-unit-metric"><span>人口</span><strong>{unit.pop}</strong></div>
              <div className="fantasy-lane-roster-unit-metric"><span>冷却</span><strong>{formatCooldownMs(unit.cooldownMs)}</strong></div>
              <div className="fantasy-lane-roster-unit-metric"><span>伤害</span><strong>{unit.damage}</strong></div>
              <div className="fantasy-lane-roster-unit-metric"><span>血量</span><strong>{unit.maxHp}</strong></div>
              <div className="fantasy-lane-roster-unit-metric"><span>护甲</span><strong>{unit.armorHp}</strong></div>
              <div className="fantasy-lane-roster-unit-metric"><span>速度</span><strong>{formatNumber(unit.moveSpeed)}</strong></div>
              <div className="fantasy-lane-roster-unit-metric"><span>射程</span><strong>{formatNumber(unit.preferredRange)}</strong></div>
              <div className="fantasy-lane-roster-unit-metric"><span>攻速</span><strong>{formatCooldownMs(unit.attackIntervalMs)}</strong></div>
            </div>

            <div className="fantasy-lane-roster-unit-facts">
              <span>伤害类型 {DAMAGE_TYPE_LABELS[unit.damageType]}</span>
              <span>护甲类型 {ARMOR_TYPE_LABELS[unit.armorType]}</span>
              <span>护甲级别 {ARMOR_TYPE_LABELS[unit.armorClass]}</span>
              <span>索敌 {formatNumber(unit.acquireRange)}</span>
              <span>最小射程 {formatNumber(unit.minimumRange)}</span>
              <span>弹道 {formatNumber(unit.projectileSpeed)}</span>
              <span>碰撞 {formatNumber(unit.collisionRadius)}</span>
              <span>AOE {formatNumber(unit.splashRadius)}</span>
              <span>签名 {unit.signature}</span>
            </div>

            <div className="fantasy-lane-unit-actions">
              <span className="fantasy-lane-unit-bonus">
                战斗增益 攻 +{Math.round((battleBonus.damageMultiplier - 1) * 100)}% / 血 +{Math.round((battleBonus.healthMultiplier - 1) * 100)}%
              </span>
              <button
                type="button"
                className="fantasy-lane-btn fantasy-lane-btn--small"
                disabled={!canUpgrade}
                onClick={() => setProgress((current) => upgradeFantasyLaneUnitWithFragments(unit.id, current))}
              >
                {stars >= 3 ? '已满星' : `升星 ${upgradeCost} 碎片`}
              </button>
            </div>
          </>
        ) : (
          <div className="fantasy-lane-unit-card-desc">
            <small className="fantasy-lane-unlock-hint">解锁条件：{getUnlockText(unit)}</small>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fantasy-lane-info-sheet">
      <section className="fantasy-lane-info-panel fantasy-lane-info-panel--header">
        <div>
          <h2>兵种与英雄总览</h2>
          <div className="fantasy-lane-roster-progress">
            <span className="fantasy-lane-warning-chip--neutral">收藏 {collection.unlocked}/{collection.total}</span>
            <span className="fantasy-lane-warning-chip--neutral">地面 {collection.groundUnlocked}/{collection.groundTotal}</span>
            <span className="fantasy-lane-warning-chip--neutral">空中 {collection.airUnlocked}/{collection.airTotal}</span>
            <span className="fantasy-lane-warning-chip--neutral">章节 {collection.chapterCleared}/{collection.chapterTotal}</span>
          </div>
        </div>
      </section>

      <section className="fantasy-lane-info-panel">
        <div className="fantasy-lane-roster-toolbar fantasy-lane-roster-toolbar--expanded">
          <div className="fantasy-lane-roster-toolbar-main">
            <h3>兵种名册</h3>
            <span className="fantasy-lane-roster-count">当前 {filteredUnits.length}</span>
          </div>
          <div className="fantasy-lane-roster-filter-grid">
            <div className="fantasy-lane-roster-filter-group">
              <label className="fantasy-lane-roster-filter-label" htmlFor="fantasy-lane-roster-filter-layer">层级</label>
              <select
                id="fantasy-lane-roster-filter-layer"
                className="fantasy-lane-roster-filter-select"
                value={draftFilters.layer}
                onChange={(event) => setDraftFilters((current) => ({ ...current, layer: event.target.value as LayerFilter }))}
              >
                {LAYER_FILTERS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
            <div className="fantasy-lane-roster-filter-group">
              <label className="fantasy-lane-roster-filter-label" htmlFor="fantasy-lane-roster-filter-unlock">解锁</label>
              <select
                id="fantasy-lane-roster-filter-unlock"
                className="fantasy-lane-roster-filter-select"
                value={draftFilters.unlock}
                onChange={(event) => setDraftFilters((current) => ({ ...current, unlock: event.target.value as UnlockFilter }))}
              >
                {UNLOCK_FILTERS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
            <div className="fantasy-lane-roster-filter-group">
              <label className="fantasy-lane-roster-filter-label" htmlFor="fantasy-lane-roster-filter-range">射程</label>
              <select
                id="fantasy-lane-roster-filter-range"
                className="fantasy-lane-roster-filter-select"
                value={draftFilters.range}
                onChange={(event) => setDraftFilters((current) => ({ ...current, range: event.target.value as RangeFilter }))}
              >
                {RANGE_FILTERS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
            <div className="fantasy-lane-roster-filter-group">
              <label className="fantasy-lane-roster-filter-label" htmlFor="fantasy-lane-roster-filter-profile">形态</label>
              <select
                id="fantasy-lane-roster-filter-profile"
                className="fantasy-lane-roster-filter-select"
                value={draftFilters.profile}
                onChange={(event) => setDraftFilters((current) => ({ ...current, profile: event.target.value as ProfileFilter }))}
              >
                {PROFILE_FILTERS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
            <div className="fantasy-lane-roster-filter-group">
              <label className="fantasy-lane-roster-filter-label" htmlFor="fantasy-lane-roster-filter-target">目标</label>
              <select
                id="fantasy-lane-roster-filter-target"
                className="fantasy-lane-roster-filter-select"
                value={draftFilters.target}
                onChange={(event) => setDraftFilters((current) => ({ ...current, target: event.target.value as TargetFilter }))}
              >
                {TARGET_FILTERS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
            <div className="fantasy-lane-roster-filter-group">
              <label className="fantasy-lane-roster-filter-label" htmlFor="fantasy-lane-roster-filter-role">定位</label>
              <select
                id="fantasy-lane-roster-filter-role"
                className="fantasy-lane-roster-filter-select"
                value={draftFilters.role}
                onChange={(event) => setDraftFilters((current) => ({ ...current, role: event.target.value as RoleFilter }))}
              >
                {ROLE_FILTERS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
            <button type="button" className="fantasy-lane-btn fantasy-lane-btn--small fantasy-lane-roster-filter-apply" onClick={() => setAppliedFilters(draftFilters)}>
              确定
            </button>
          </div>
        </div>

        {visibleGroundUnits.length > 0 && (
          <div className="fantasy-lane-roster-section">
            <div className="fantasy-lane-roster-section-header fantasy-lane-roster-section-header--ground">
              <span>地面兵种</span>
            </div>
            <div className="fantasy-lane-unit-grid">
              {visibleGroundUnits.map((unit, index) => renderUnitCard(unit, index))}
            </div>
          </div>
        )}

        {visibleAirUnits.length > 0 && (
          <div className="fantasy-lane-roster-section">
            <div className="fantasy-lane-roster-section-header fantasy-lane-roster-section-header--air">
              <span>空中兵种</span>
            </div>
            <div className="fantasy-lane-unit-grid">
              {visibleAirUnits.map((unit, index) => renderUnitCard(unit, index))}
            </div>
          </div>
        )}

        {filteredUnits.length === 0 ? <div className="fantasy-lane-empty-hint">没有符合当前筛选条件的兵种。</div> : null}
      </section>

      <section className="fantasy-lane-info-panel">
        <h3>英雄</h3>
        <div className="fantasy-lane-hero-table">
          <div className="fantasy-lane-hero-table-header fantasy-lane-hero-table-header--wide">
            <span className="fantasy-lane-hero-col-name">英雄</span>
            <span className="fantasy-lane-hero-col-skillid">技能 ID</span>
            <span className="fantasy-lane-hero-col-summary">技能</span>
            <span className="fantasy-lane-hero-col-passive">被动</span>
            <span className="fantasy-lane-hero-col-cd">冷却</span>
          </div>
          {FANTASY_LANE_HEROES.map((hero, index) => (
            <div key={hero.id} className={`fantasy-lane-hero-table-row fantasy-lane-hero-table-row--wide${index % 2 === 0 ? '' : ' is-alt'}`}>
              <span className="fantasy-lane-hero-col-name"><strong>{hero.name}</strong></span>
              <span className="fantasy-lane-hero-col-skillid">{hero.skillId}</span>
              <span className="fantasy-lane-hero-col-summary">{hero.summary}</span>
              <span className="fantasy-lane-hero-col-passive">{hero.passiveSummary}</span>
              <span className="fantasy-lane-hero-col-cd">{formatCooldownMs(hero.cooldownMs)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="fantasy-lane-info-panel">
        <h3>战术技能</h3>
        <div className="fantasy-lane-tactical-table">
          <div className="fantasy-lane-tactical-table-header">
            <span className="fantasy-lane-tactical-col-name">技能</span>
            <span className="fantasy-lane-tactical-col-summary">效果</span>
            <span className="fantasy-lane-tactical-col-cd">冷却</span>
          </div>
          {FANTASY_LANE_TACTICAL_SKILLS.map((skill, index) => (
            <div key={skill.id} className={`fantasy-lane-tactical-table-row${index % 2 === 0 ? '' : ' is-alt'}`}>
              <span className="fantasy-lane-tactical-col-name"><strong>{skill.name}</strong></span>
              <span className="fantasy-lane-tactical-col-summary">{skill.summary}</span>
              <span className="fantasy-lane-tactical-col-cd">{formatCooldownMs(skill.cooldownMs)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
