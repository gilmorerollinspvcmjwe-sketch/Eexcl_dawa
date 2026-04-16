import React, { useEffect, useMemo, useState } from 'react';
import { FANTASY_LANE_HEROES, FANTASY_LANE_TACTICAL_SKILLS, FANTASY_LANE_UNITS } from '../../features/fantasy_lane/fantasyLaneUnitRegistry.ts';
import '../../styles/fantasy-lane.css';
import type { FantasyLaneCombatRole, FantasyLaneUnitDefinition } from '../../features/fantasy_lane/fantasyLaneTypes.ts';
import { FantasyLaneUnitSprite } from './FantasyLaneUnitSprite';
import { formatCooldownMs, getUnitSpriteScale } from './fantasyLaneUiMeta.ts';
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

type LayerFilter = 'all' | 'ground' | 'air';
type UnlockFilter = 'all' | 'unlocked' | 'locked';
type RangeFilter = 'all' | 'melee' | 'ranged';
type ProfileFilter = 'all' | 'single' | 'aoe';
type TargetFilter = 'all' | 'ground_only' | 'air_only' | 'both';
type RoleFilter = 'all' | FantasyLaneCombatRole;

interface FantasyLaneRosterSheetProps {
  onFormulaChange?: (text: string) => void;
}

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
  { value: 'all', label: '全部射程' },
  { value: 'melee', label: '近战' },
  { value: 'ranged', label: '远程' },
];

const PROFILE_FILTERS: Array<{ value: ProfileFilter; label: string }> = [
  { value: 'all', label: '全部形态' },
  { value: 'single', label: '单体' },
  { value: 'aoe', label: 'AOE' },
];

const TARGET_FILTERS: Array<{ value: TargetFilter; label: string }> = [
  { value: 'all', label: '全部目标' },
  { value: 'ground_only', label: '对地' },
  { value: 'air_only', label: '对空' },
  { value: 'both', label: '空地' },
];

const ROLE_FILTERS: Array<{ value: RoleFilter; label: string }> = [
  { value: 'all', label: '全部定位' },
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

function getUnlockText(unit: FantasyLaneUnitDefinition) {
  if (!unit.unlockCondition) return '默认';

  switch (unit.unlockCondition.type) {
    case 'level_clear':
      return unit.unlockCondition.levelId ? `通关 ${unit.unlockCondition.levelId}` : '通关解锁';
    case 'boss_clear':
      return unit.unlockCondition.levelId ? `Boss ${unit.unlockCondition.levelId}` : 'Boss 解锁';
    case 'star_reward':
      return unit.unlockCondition.stars ? `${unit.unlockCondition.stars} 星奖励` : '星级奖励';
    case 'fragment_synthesis':
      return unit.unlockCondition.fragmentCount ? `${unit.unlockCondition.fragmentCount} 碎片合成` : '碎片合成';
    default:
      return '待解锁';
  }
}

function formatNumber(value: number, digits = 1) {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(digits);
}

export const FantasyLaneRosterSheet: React.FC<FantasyLaneRosterSheetProps> = ({ onFormulaChange }) => {
  const [layerFilter, setLayerFilter] = useState<LayerFilter>('all');
  const [unlockFilter, setUnlockFilter] = useState<UnlockFilter>('all');
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>('all');
  const [profileFilter, setProfileFilter] = useState<ProfileFilter>('all');
  const [targetFilter, setTargetFilter] = useState<TargetFilter>('all');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [progress, setProgress] = useState(() => loadFantasyLaneProgress());

  const collection = getFantasyLaneCollectionSummary(progress);

  useEffect(() => {
    onFormulaChange?.(`= 兵种与英雄总览 | 兵种 ${FANTASY_LANE_UNITS.length} | 英雄 ${FANTASY_LANE_HEROES.length} | 战术 ${FANTASY_LANE_TACTICAL_SKILLS.length}`);
  }, [onFormulaChange]);

  const filteredUnits = useMemo(() => {
    return FANTASY_LANE_UNITS.filter((unit) => {
      const unlocked = isUnitUnlocked(progress, unit.id);
      if (layerFilter !== 'all' && unit.layer !== layerFilter) return false;
      if (unlockFilter === 'unlocked' && !unlocked) return false;
      if (unlockFilter === 'locked' && unlocked) return false;
      if (rangeFilter !== 'all' && unit.rangeBand !== rangeFilter) return false;
      if (profileFilter !== 'all' && unit.damageProfile !== profileFilter) return false;
      if (targetFilter !== 'all' && unit.targetRule !== targetFilter) return false;
      if (roleFilter !== 'all' && unit.role !== roleFilter) return false;
      return true;
    });
  }, [layerFilter, unlockFilter, rangeFilter, profileFilter, targetFilter, roleFilter, progress]);

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
      <div key={unit.id} className={`fantasy-lane-unit-card fantasy-lane-roster-unit-card${index % 2 === 0 ? '' : ' is-alt'}${!unlocked ? ' fantasy-lane-unit--locked' : ''}`}>
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
              <span className="fantasy-lane-unit-card-icon-text">{unlocked ? unit.icon : ''}</span>
            </div>
            <div className="fantasy-lane-unit-card-tags">
              <span className={`fantasy-lane-tag fantasy-lane-tag--primary fantasy-lane-tag--role-${unit.role}`}>
                {ROLE_LABELS[unit.role]}
              </span>
              <span className="fantasy-lane-tag fantasy-lane-tag--secondary">{FOOTPRINT_LABELS[unit.footprint]}</span>
              <span className="fantasy-lane-tag fantasy-lane-tag--secondary">{getAttackLabel(unit)}</span>
              <span className="fantasy-lane-tag fantasy-lane-tag--target">{TARGET_RULE_LABELS[unit.targetRule]}</span>
              <span className="fantasy-lane-tag fantasy-lane-tag--feature">{unit.layer === 'air' ? '空中' : '地面'}</span>
            </div>
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
              <span className="fantasy-lane-roster-filter-label">层级</span>
              <div className="fantasy-lane-roster-filter-scroll">
                <button type="button" className={`fantasy-lane-roster-filter${layerFilter === 'all' ? ' is-active' : ''}`} onClick={() => setLayerFilter('all')}>全部</button>
                <button type="button" className={`fantasy-lane-roster-filter fantasy-lane-roster-filter--ground${layerFilter === 'ground' ? ' is-active' : ''}`} onClick={() => setLayerFilter('ground')}>地面</button>
                <button type="button" className={`fantasy-lane-roster-filter fantasy-lane-roster-filter--air${layerFilter === 'air' ? ' is-active' : ''}`} onClick={() => setLayerFilter('air')}>空中</button>
              </div>
            </div>

            <div className="fantasy-lane-roster-filter-group">
              <span className="fantasy-lane-roster-filter-label">解锁</span>
              <div className="fantasy-lane-roster-filter-scroll">
                <button type="button" className={`fantasy-lane-roster-unlock-filter${unlockFilter === 'all' ? ' is-active' : ''}`} onClick={() => setUnlockFilter('all')}>全部</button>
                <button type="button" className={`fantasy-lane-roster-unlock-filter${unlockFilter === 'unlocked' ? ' is-active' : ''}`} onClick={() => setUnlockFilter('unlocked')}>已解锁</button>
                <button type="button" className={`fantasy-lane-roster-unlock-filter${unlockFilter === 'locked' ? ' is-active' : ''}`} onClick={() => setUnlockFilter('locked')}>未解锁</button>
              </div>
            </div>

            <div className="fantasy-lane-roster-filter-group">
              <span className="fantasy-lane-roster-filter-label">射程</span>
              <div className="fantasy-lane-roster-filter-scroll">
                {RANGE_FILTERS.map((item) => (
                  <button key={item.value} type="button" className={`fantasy-lane-roster-filter${rangeFilter === item.value ? ' is-active' : ''}`} onClick={() => setRangeFilter(item.value)}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="fantasy-lane-roster-filter-group">
              <span className="fantasy-lane-roster-filter-label">形态</span>
              <div className="fantasy-lane-roster-filter-scroll">
                {PROFILE_FILTERS.map((item) => (
                  <button key={item.value} type="button" className={`fantasy-lane-roster-filter${profileFilter === item.value ? ' is-active' : ''}`} onClick={() => setProfileFilter(item.value)}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="fantasy-lane-roster-filter-group">
              <span className="fantasy-lane-roster-filter-label">目标</span>
              <div className="fantasy-lane-roster-filter-scroll">
                {TARGET_FILTERS.map((item) => (
                  <button key={item.value} type="button" className={`fantasy-lane-roster-filter${targetFilter === item.value ? ' is-active' : ''}`} onClick={() => setTargetFilter(item.value)}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="fantasy-lane-roster-filter-group">
              <span className="fantasy-lane-roster-filter-label">定位</span>
              <div className="fantasy-lane-roster-filter-scroll">
                {ROLE_FILTERS.map((item) => (
                  <button key={item.value} type="button" className={`fantasy-lane-roster-filter${roleFilter === item.value ? ' is-active' : ''}`} onClick={() => setRoleFilter(item.value)}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
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
