import React, { useMemo } from 'react';
import { FANTASY_LANE_UNIT_MAP } from '../../features/fantasy_lane/fantasyLaneUnitRegistry.ts';
import type { FantasyLaneImpactEffect, FantasyLaneProjectile, FantasyLaneRuntimeState, FantasyLaneUnitInstance } from '../../features/fantasy_lane/fantasyLaneTypes.ts';
import { FantasyLaneUnitSprite } from './FantasyLaneUnitSprite';
import {
  RANGE_LABELS,
  getClashZoneLabel,
  getPhaseNarrativeTone,
  getUnitCombatAccent,
  getUnitSpriteScale,
} from './fantasyLaneUiMeta.ts';

interface FantasyLaneBoardProps {
  state: FantasyLaneRuntimeState;
}

function getUnitTitle(unit: FantasyLaneUnitInstance) {
  const definition = FANTASY_LANE_UNIT_MAP[unit.templateId];
  if (!definition) return unit.templateId;
  return [
    definition.name,
    `${definition.layer === 'air' ? '空中' : '地面'} ${RANGE_LABELS[definition.rangeBand]}`,
    `HP ${Math.round(unit.hp)} / 护甲 ${Math.round(unit.armorHp)}`,
  ].join(' | ');
}

function getProjectileClass(projectile: FantasyLaneProjectile) {
  const definition = FANTASY_LANE_UNIT_MAP[projectile.sourceUnitId];
  const projectileKind =
    projectile.sourceUnitId === 'archer' || projectile.sourceUnitId === 'elf_shooter'
      ? 'arrow'
      : projectile.sourceUnitId === 'ballista' || projectile.sourceUnitId === 'heavy_crossbow'
        ? 'bolt'
        : projectile.sourceUnitId === 'musketeer'
          ? 'shot'
          : projectile.sourceUnitId === 'ice_witch'
            ? 'shard'
            : projectile.sourceUnitId === 'plague_thrower'
              ? 'glob'
          : projectile.sourceUnitId === 'thunder_mage' || projectile.sourceUnitId === 'thunder_eagle'
            ? 'spark'
            : projectile.sourceUnitId === 'flame_warlock' || projectile.sourceUnitId === 'fire_dragon' || projectile.sourceUnitId === 'young_dragon' || projectile.sourceUnitId === 'phoenix'
              ? 'fireball'
              : projectile.sourceUnitId === 'holy_knight' || projectile.sourceUnitId === 'angel'
                ? 'holy_bolt'
                : projectile.sourceUnitId === 'druid'
                  ? 'leaf'
                  : projectile.sourceUnitId === 'elementalist'
                    ? 'element_orb'
                    : projectile.sourceUnitId === 'field_medic'
                      ? 'heal_beam'
                      : projectile.sourceUnitId === 'demolitionist'
                        ? 'bomb'
                        : projectile.sourceUnitId === 'blade_master'
                          ? 'slash'
                          : projectile.sourceUnitId === 'wind_spirit'
                            ? 'gust'
                            : projectile.sourceUnitId === 'gargoyle'
                              ? 'stone'
                              : definition?.damageType === 'antiAir'
                                ? 'javelin'
                                : definition?.damageType === 'magic'
                                  ? 'orb'
                                  : 'orb';
  return [
    'fantasy-lane-projectile',
    `fantasy-lane-projectile--${projectile.side}`,
    `fantasy-lane-projectile--${projectileKind}`,
    projectile.layer === 'air' ? 'is-air' : 'is-ground',
  ].join(' ');
}

function getProjectileStyle(projectile: FantasyLaneProjectile) {
  const angle = Math.atan2((projectile.toY - projectile.fromY) * 100, projectile.toX - projectile.fromX) * (180 / Math.PI);
  return {
    left: `${projectile.x}%`,
    top: `${projectile.y * 100}%`,
    backgroundColor: projectile.color,
    color: projectile.color,
    transform: `translate(-50%, -50%) rotate(${angle}deg)`,
  };
}

function getImpactClass(impact: FantasyLaneImpactEffect) {
  return [
    'fantasy-lane-impact',
    impact.layer === 'air' ? 'is-air' : 'is-ground',
    `fantasy-lane-impact--${impact.kind}`,
  ].join(' ');
}

export const FantasyLaneBoard: React.FC<FantasyLaneBoardProps> = ({ state }) => {
  const phaseTone = useMemo(() => getPhaseNarrativeTone(state.pressureLabel), [state.pressureLabel]);
  const clashZoneLabel = useMemo(() => getClashZoneLabel(state.frontline, state.airControl), [state.frontline, state.airControl]);

  return (
    <div className="fantasy-lane-board-shell">
      {state.activeWarning && (
        <div className="fantasy-lane-warning-banner">
          <strong>{state.activeWarning.text.includes('技能') ? '技能预警' : '战场提示'}</strong>
          <span>{state.activeWarning.text}</span>
        </div>
      )}

      <div
          className={`fantasy-lane-battlefield fantasy-lane-battlefield--${phaseTone}${state.activeWarning ? ' is-alert' : ''}`}
          role="img"
          aria-label="奇幻战线主战场"
        >
          <div className="fantasy-lane-battlefield-stage-banner">
            <strong>{state.phaseLabel}</strong>
          </div>

          <div className="fantasy-lane-battlefield-zone fantasy-lane-battlefield-zone--player" />
        <div className="fantasy-lane-battlefield-zone fantasy-lane-battlefield-zone--enemy" />
          <div
            className="fantasy-lane-battlefield-clash-zone"
            style={{ left: `${Math.max(12, state.clashX - 9)}%`, width: '18%' }}
          >
            <span className="fantasy-lane-clash-zone-label">{clashZoneLabel}</span>
          </div>

          <div className="fantasy-lane-battlefield-base fantasy-lane-battlefield-base--player">
          <strong>我方主堡</strong>
          <small>{Math.round(state.playerBaseHp)}</small>
        </div>
        <div className="fantasy-lane-battlefield-base fantasy-lane-battlefield-base--enemy">
          <strong>敌方主堡</strong>
          <small>{Math.round(state.enemyBaseHp)}</small>
        </div>

        <div className="fantasy-lane-clash-line" style={{ left: `${state.clashX}%` }} />

        {state.projectiles.map((projectile) => (
          <div
            key={projectile.id}
            className={getProjectileClass(projectile)}
            style={getProjectileStyle(projectile)}
          >
            <span className="fantasy-lane-projectile-trail" />
            <span className="fantasy-lane-projectile-glow" />
            <span className="fantasy-lane-projectile-core" />
          </div>
        ))}

        {state.impacts.map((impact) => (
          <div
            key={impact.id}
            className={getImpactClass(impact)}
            style={{
              left: `${impact.x}%`,
              top: `${impact.y * 100}%`,
              color: impact.color,
              borderColor: impact.color,
              boxShadow: `0 0 0 1px ${impact.color} inset, 0 0 22px ${impact.color}`,
            }}
          />
        ))}

        {state.units.map((unit) => {
          const definition = FANTASY_LANE_UNIT_MAP[unit.templateId];
          if (!definition) return null;
          const hpPercent = Math.max(0, unit.hp / definition.maxHp);
          const classes = [
            'fantasy-lane-unit',
            `fantasy-lane-unit--${unit.side}`,
            unit.layer === 'air' ? 'is-air' : 'is-ground',
            state.bossUnitInstanceId === unit.instanceId ? 'is-boss' : '',
            unit.attackAnimMs > 0 ? 'is-attacking' : '',
            unit.hitFlashMs > 0 ? 'is-hit' : '',
            unit.blockedMs > 340 ? 'is-blocked' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div
              key={unit.instanceId}
              className={classes}
              style={{
                left: `${unit.x}%`,
                top: `${unit.y * 100}%`,
                zIndex: unit.layer === 'air' ? 7 : 5,
                ['--fantasy-unit-accent' as string]: getUnitCombatAccent({
                  hitFlashMs: unit.hitFlashMs,
                  attackAnimMs: unit.attackAnimMs,
                  blockedMs: unit.blockedMs,
                  side: unit.side,
                }),
              }}
              title={getUnitTitle(unit)}
            >
              <div className="fantasy-lane-unit-body">
                <FantasyLaneUnitSprite
                  unitId={unit.templateId}
                  side={unit.side}
                  hpPercent={hpPercent}
                  isAttacking={unit.attackAnimMs > 0}
                  animated={state.phase === 'playing'}
                  scale={getUnitSpriteScale(definition.footprint)}
                />
              </div>
              <div className="fantasy-lane-unit-health">
                <span
                  className="fantasy-lane-unit-health-fill"
                  style={{ width: `${Math.max(7, Math.round(hpPercent * 100))}%` }}
                />
              </div>
              <small className="fantasy-lane-unit-caption">{definition.shortName}</small>
            </div>
          );
        })}
      </div>
    </div>
  );
};
