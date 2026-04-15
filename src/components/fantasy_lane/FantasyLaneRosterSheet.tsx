import React, { useEffect } from 'react';
import { FANTASY_LANE_HEROES, FANTASY_LANE_TACTICAL_SKILLS, FANTASY_LANE_UNITS } from '../../features/fantasy_lane/fantasyLaneUnitRegistry.ts';
import '../../styles/fantasy-lane.css';
import { FantasyLaneUnitSprite } from './FantasyLaneUnitSprite';
import {
  ARMOR_CLASS_LABELS,
  FOOTPRINT_LABELS,
  LAYER_LABELS,
  PROFILE_LABELS,
  RANGE_LABELS,
  ROLE_LABELS,
  TARGET_RULE_LABELS,
  formatCooldownMs,
  getUnitSpriteScale,
} from './fantasyLaneUiMeta.ts';

interface FantasyLaneRosterSheetProps {
  onFormulaChange?: (text: string) => void;
  onOpenBattle?: () => void;
}

export const FantasyLaneRosterSheet: React.FC<FantasyLaneRosterSheetProps> = ({ onFormulaChange, onOpenBattle }) => {
  useEffect(() => {
    onFormulaChange?.(`=Sheet19 兵种与英雄 | 兵种 ${FANTASY_LANE_UNITS.length} | 英雄 ${FANTASY_LANE_HEROES.length} | 战术 ${FANTASY_LANE_TACTICAL_SKILLS.length}`);
  }, [onFormulaChange]);

  return (
    <div className="fantasy-lane-info-sheet">
      <section className="fantasy-lane-info-panel fantasy-lane-info-panel--header">
        <div>
          <span className="fantasy-lane-kicker">Sheet19</span>
          <h2>兵种与英雄总览</h2>
          <p>这里是阵容词典。优先看空地层级、射程和体型，再决定回到 Sheet18 如何编组。</p>
        </div>
        {onOpenBattle && (
          <button type="button" className="fantasy-lane-btn fantasy-lane-btn--primary" onClick={onOpenBattle}>
            返回 Sheet18
          </button>
        )}
      </section>

      <section className="fantasy-lane-info-panel">
        <h3>兵种名册</h3>
        <div className="fantasy-lane-roster-grid">
          {FANTASY_LANE_UNITS.map((unit) => (
            <article key={unit.id} className="fantasy-lane-roster-card">
              <div className="fantasy-lane-roster-card-preview">
                <FantasyLaneUnitSprite
                  unitId={unit.id}
                  side="player"
                  hpPercent={1}
                  isAttacking={false}
                  animated={false}
                  scale={getUnitSpriteScale(unit.footprint)}
                />
              </div>
              <div className="fantasy-lane-roster-card-head">
                <strong>{unit.name}</strong>
                <span>{ROLE_LABELS[unit.role]} / 人口 {unit.pop}</span>
              </div>
              <p>{unit.summary}</p>
              <div className="fantasy-lane-unit-flags">
                <span>{LAYER_LABELS[unit.layer]}</span>
                <span>{RANGE_LABELS[unit.rangeBand]}</span>
                <span>{FOOTPRINT_LABELS[unit.footprint]}</span>
                <span>{PROFILE_LABELS[unit.damageProfile]}</span>
              </div>
              <div className="fantasy-lane-roster-meta">
                <span>费用 {unit.cost}</span>
                <span>冷却 {formatCooldownMs(unit.cooldownMs)}</span>
                <span>护甲类型 {ARMOR_CLASS_LABELS[unit.armorClass]}</span>
                <span>{TARGET_RULE_LABELS[unit.targetRule]}</span>
              </div>
              <small>{unit.signature}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="fantasy-lane-info-panel">
        <h3>英雄</h3>
        <div className="fantasy-lane-card-grid">
          {FANTASY_LANE_HEROES.map((hero) => (
            <article key={hero.id} className="fantasy-lane-mini-card is-static">
              <strong>{hero.name}</strong>
              <span>{hero.summary}</span>
              <small>{hero.passiveSummary}</small>
              <small>冷却 {formatCooldownMs(hero.cooldownMs)}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="fantasy-lane-info-panel">
        <h3>战术技能</h3>
        <div className="fantasy-lane-card-grid">
          {FANTASY_LANE_TACTICAL_SKILLS.map((skill) => (
            <article key={skill.id} className="fantasy-lane-mini-card is-static">
              <strong>{skill.name}</strong>
              <span>{skill.summary}</span>
              <small>冷却 {formatCooldownMs(skill.cooldownMs)}</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
