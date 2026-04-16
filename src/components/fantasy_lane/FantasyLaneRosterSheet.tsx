import React, { useEffect, useState } from 'react';
import { FANTASY_LANE_HEROES, FANTASY_LANE_TACTICAL_SKILLS, FANTASY_LANE_UNITS } from '../../features/fantasy_lane/fantasyLaneUnitRegistry.ts';
import '../../styles/fantasy-lane.css';
import { FantasyLaneUnitSprite } from './FantasyLaneUnitSprite';
import {
  formatCooldownMs,
  getUnitSpriteScale,
} from './fantasyLaneUiMeta.ts';
import {
  getUnitFragmentCount,
  isUnitUnlocked,
  loadFantasyLaneProgress,
} from '../../features/fantasy_lane/fantasyLaneProgressStorage.ts';

type RosterFilter = 'all' | 'ground' | 'air';
type RosterUnlockFilter = 'all' | 'unlocked' | 'locked';

interface FantasyLaneRosterSheetProps {
  onFormulaChange?: (text: string) => void;
}

// 角色标签映射
const ROLE_LABELS: Record<string, string> = {
  tank: '坦克',
  fighter: '战士',
  sniper: '射手',
  caster: '法师',
  siege: '攻城',
  air_sup: '空军',
  finisher: '终结者',
};

// 体型标签映射
const FOOTPRINT_LABELS: Record<string, string> = {
  small: '小体型',
  medium: '中体型',
  large: '大体型',
  giant: '巨型',
};

// 攻击方式标签
const getAttackLabel = (damageProfile: string, rangeBand: string) => {
  if (damageProfile === 'aoe') return '范围';
  return rangeBand === 'melee' ? '近战' : '远程';
};

// 目标规则标签
const getTargetLabel = (targetRule: string) => {
  if (targetRule === 'air_only') return '对空';
  if (targetRule === 'ground_only') return '对地';
  return '空地';
};

// 获取核心特性标签（最多2个）
const getCoreTags = (unit: typeof FANTASY_LANE_UNITS[0]): string[] => {
  const tags: string[] = [];
  
  // 优先特性
  const priorityTags = ['antiAir', 'heal', 'shield', 'burst', 'pierce', 'stealth', 'frontline'];
  for (const tag of priorityTags) {
    if (unit.tags.includes(tag)) {
      const tagLabels: Record<string, string> = {
        antiAir: '对空',
        heal: '治疗',
        shield: '护盾',
        burst: '爆发',
        pierce: '破甲',
        stealth: '潜行',
        frontline: '前排',
      };
      tags.push(tagLabels[tag]);
      if (tags.length >= 2) break;
    }
  }
  
  return tags;
};

export const FantasyLaneRosterSheet: React.FC<FantasyLaneRosterSheetProps> = ({ onFormulaChange }) => {
  const [filter, setFilter] = useState<RosterFilter>('all');
  const [unlockFilter, setUnlockFilter] = useState<RosterUnlockFilter>('all');
  const progress = loadFantasyLaneProgress();

  useEffect(() => {
    onFormulaChange?.(`= 兵种与英雄总览 | 兵种 ${FANTASY_LANE_UNITS.length} | 英雄 ${FANTASY_LANE_HEROES.length} | 战术 ${FANTASY_LANE_TACTICAL_SKILLS.length}`);
  }, [onFormulaChange]);

  // 根据解锁状态过滤单位
  const filteredUnits = FANTASY_LANE_UNITS.filter((unit) => {
    if (unlockFilter === 'unlocked' && !isUnitUnlocked(progress, unit.id)) return false;
    if (unlockFilter === 'locked' && isUnitUnlocked(progress, unit.id)) return false;
    return true;
  });

  const groundUnits = filteredUnits.filter((u) => u.layer === 'ground');
  const airUnits = filteredUnits.filter((u) => u.layer === 'air');
  const visibleGroundUnits = filter === 'all' || filter === 'ground' ? groundUnits : [];
  const visibleAirUnits = filter === 'all' || filter === 'air' ? airUnits : [];

  const renderUnitCard = (unit: typeof FANTASY_LANE_UNITS[0], index: number) => {
    const unlocked = isUnitUnlocked(progress, unit.id);
    const stars = progress.unitStars[unit.id] || 0;
    const fragments = getUnitFragmentCount(progress, unit.id);
    const coreTags = getCoreTags(unit);

    return (
      <div key={unit.id} className={`fantasy-lane-unit-card${index % 2 === 0 ? '' : ' is-alt'}${!unlocked ? ' fantasy-lane-unit--locked' : ''}`}>
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
              <span className="fantasy-lane-unit-card-icon-text">{unit.icon}</span>
            </div>
            {unlocked && (
              <div className="fantasy-lane-unit-card-tags">
                <span className={`fantasy-lane-tag fantasy-lane-tag--primary fantasy-lane-tag--role-${unit.role}`}>
                  {ROLE_LABELS[unit.role]}
                </span>
                <span className="fantasy-lane-tag fantasy-lane-tag--secondary">
                  {FOOTPRINT_LABELS[unit.footprint]} · {getAttackLabel(unit.damageProfile, unit.rangeBand)}
                </span>
                {coreTags.map((tag) => (
                  <span key={tag} className="fantasy-lane-tag fantasy-lane-tag--feature">
                    {tag}
                  </span>
                ))}
                <span className="fantasy-lane-tag fantasy-lane-tag--target">
                  {getTargetLabel(unit.targetRule)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {unlocked && (
          <>
            <div className="fantasy-lane-unit-card-desc">
              {unit.summary}
            </div>
            <div className="fantasy-lane-unit-card-stats">
              <span className="fantasy-lane-unit-stat">
                <strong>{unit.cost}</strong>金
              </span>
              <span className="fantasy-lane-unit-stat">
                <strong>{formatCooldownMs(unit.cooldownMs)}</strong>
              </span>
              <span className="fantasy-lane-unit-stat">
                人口<strong>{unit.pop}</strong>
              </span>
              {stars > 0 && (
                <span className="fantasy-lane-unit-stat fantasy-lane-unit-stars">
                  {'⭐'.repeat(stars)}
                </span>
              )}
              {fragments > 0 && (
                <span className="fantasy-lane-unit-stat fantasy-lane-unit-fragments">
                  碎片{fragments}/3
                </span>
              )}
            </div>
          </>
        )}
        
        {!unlocked && (
          <div className="fantasy-lane-unit-card-desc">
            <small className="fantasy-lane-unlock-hint">通关后解锁</small>
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
          <p>这里是阵容词典。优先看空地层级、射程和体型，再决定回到战斗页面如何编组。</p>
        </div>
      </section>

      <section className="fantasy-lane-info-panel">
        <div className="fantasy-lane-roster-toolbar">
          <h3>兵种名册</h3>
          <div className="fantasy-lane-roster-filters">
            <button type="button" className={`fantasy-lane-roster-filter${filter === 'all' ? ' is-active' : ''}`} onClick={() => setFilter('all')}>
              全部 ({FANTASY_LANE_UNITS.length})
            </button>
            <button type="button" className={`fantasy-lane-roster-filter fantasy-lane-roster-filter--ground${filter === 'ground' ? ' is-active' : ''}`} onClick={() => setFilter('ground')}>
              地面 ({groundUnits.length})
            </button>
            <button type="button" className={`fantasy-lane-roster-filter fantasy-lane-roster-filter--air${filter === 'air' ? ' is-active' : ''}`} onClick={() => setFilter('air')}>
              空中 ({airUnits.length})
            </button>
          </div>
          <div className="fantasy-lane-roster-unlock-filters">
            <span>解锁状态：</span>
            <button type="button" className={`fantasy-lane-roster-unlock-filter${unlockFilter === 'all' ? ' is-active' : ''}`} onClick={() => setUnlockFilter('all')}>
              全部
            </button>
            <button type="button" className={`fantasy-lane-roster-unlock-filter${unlockFilter === 'unlocked' ? ' is-active' : ''}`} onClick={() => setUnlockFilter('unlocked')}>
              已解锁
            </button>
            <button type="button" className={`fantasy-lane-roster-unlock-filter${unlockFilter === 'locked' ? ' is-active' : ''}`} onClick={() => setUnlockFilter('locked')}>
              未解锁
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
      </section>

      <section className="fantasy-lane-info-panel">
        <h3>英雄</h3>
        <div className="fantasy-lane-hero-table">
          <div className="fantasy-lane-hero-table-header">
            <span className="fantasy-lane-hero-col-name">英雄</span>
            <span className="fantasy-lane-hero-col-summary">技能</span>
            <span className="fantasy-lane-hero-col-passive">被动</span>
            <span className="fantasy-lane-hero-col-cd">冷却</span>
          </div>
          {FANTASY_LANE_HEROES.map((hero, index) => (
            <div key={hero.id} className={`fantasy-lane-hero-table-row${index % 2 === 0 ? '' : ' is-alt'}`}>
              <span className="fantasy-lane-hero-col-name">
                <strong>{hero.name}</strong>
              </span>
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
              <span className="fantasy-lane-tactical-col-name">
                <strong>{skill.name}</strong>
              </span>
              <span className="fantasy-lane-tactical-col-summary">{skill.summary}</span>
              <span className="fantasy-lane-tactical-col-cd">{formatCooldownMs(skill.cooldownMs)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
