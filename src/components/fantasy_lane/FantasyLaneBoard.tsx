import React, { useMemo } from 'react';
import { FANTASY_LANE_UNIT_MAP } from '../../features/fantasy_lane/fantasyLaneUnitRegistry.ts';
import type { FantasyLaneImpactEffect, FantasyLaneProjectile, FantasyLaneRuntimeState, FantasyLaneUnitInstance } from '../../features/fantasy_lane/fantasyLaneTypes.ts';
import { FantasyLaneUnitSprite } from './FantasyLaneUnitSprite';
import { FOOTPRINT_LABELS, RANGE_LABELS, getUnitSpriteScale } from './fantasyLaneUiMeta.ts';

interface FantasyLaneBoardProps {
  state: FantasyLaneRuntimeState;
}

function getUnitTitle(unit: FantasyLaneUnitInstance) {
  const definition = FANTASY_LANE_UNIT_MAP[unit.templateId];
  if (!definition) return unit.templateId;
  return [
    definition.name,
    `${definition.layer === 'air' ? '空中' : '地面'} ${RANGE_LABELS[definition.rangeBand]}`,
    `${FOOTPRINT_LABELS[definition.footprint]} / 人口 ${definition.pop}`,
    `HP ${Math.round(unit.hp)} / 护甲 ${Math.round(unit.armorHp)}`,
  ].join(' | ');
}

function getProjectileClass(projectile: FantasyLaneProjectile) {
  const definition = FANTASY_LANE_UNIT_MAP[projectile.sourceUnitId];
  const projectileKind =
    projectile.sourceUnitId === 'archer' || projectile.sourceUnitId === 'elf_shooter'
      ? 'arrow'
      : projectile.sourceUnitId === 'ballista'
        ? 'bolt'
        : projectile.sourceUnitId === 'musketeer'
          ? 'shot'
          : projectile.sourceUnitId === 'thunder_mage'
            ? 'spark'
            : projectile.sourceUnitId === 'flame_warlock' || projectile.sourceUnitId === 'fire_dragon'
              ? 'fireball'
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
  const boardStats = useMemo(() => {
    const playerGround = state.units.filter((unit) => unit.side === 'player' && unit.layer === 'ground').length;
    const enemyGround = state.units.filter((unit) => unit.side === 'enemy' && unit.layer === 'ground').length;
    const playerAir = state.units.filter((unit) => unit.side === 'player' && unit.layer === 'air').length;
    const enemyAir = state.units.filter((unit) => unit.side === 'enemy' && unit.layer === 'air').length;
    return { playerGround, enemyGround, playerAir, enemyAir };
  }, [state.units]);

  return (
    <div className="fantasy-lane-board-shell">
      {state.activeWarning && (
        <div className="fantasy-lane-warning-banner">
          <strong>战场提示</strong>
          <span>{state.activeWarning.text}</span>
        </div>
      )}

      <div className="fantasy-lane-board-metrics" aria-hidden="true">
        <span>地面 {boardStats.playerGround} : {boardStats.enemyGround}</span>
        <span>空中 {boardStats.playerAir} : {boardStats.enemyAir}</span>
        <span>投射物 {state.projectiles.length}</span>
        <span>冲突点 {state.clashX}%</span>
      </div>

      <div className="fantasy-lane-battlefield" role="img" aria-label="奇幻战线主战场">
        <div className="fantasy-lane-battlefield-band fantasy-lane-battlefield-band--air">
          <span>空域</span>
        </div>
        <div className="fantasy-lane-battlefield-band fantasy-lane-battlefield-band--ground">
          <span>地面战团</span>
        </div>

        <div className="fantasy-lane-battlefield-zone fantasy-lane-battlefield-zone--player" />
        <div className="fantasy-lane-battlefield-zone fantasy-lane-battlefield-zone--enemy" />

        <div className="fantasy-lane-battlefield-base fantasy-lane-battlefield-base--player">
          <strong>我方主堡</strong>
          <small>{Math.round(state.playerBaseHp)}</small>
        </div>
        <div className="fantasy-lane-battlefield-base fantasy-lane-battlefield-base--enemy">
          <strong>敌方主堡</strong>
          <small>{Math.round(state.enemyBaseHp)}</small>
        </div>

        <div className="fantasy-lane-clash-line" style={{ left: `${state.clashX}%` }}>
          <span>交战中心</span>
        </div>

        {state.projectiles.map((projectile) => (
          <div
            key={projectile.id}
            className={getProjectileClass(projectile)}
            style={getProjectileStyle(projectile)}
          >
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
              borderColor: impact.color,
              boxShadow: `0 0 0 1px ${impact.color} inset`,
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
                zIndex: unit.layer === 'air' ? 5 : 3,
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

      <div className="fantasy-lane-board-footnote">
        <span>地面挤压 {state.frontline > 0 ? '+' : ''}{state.frontline}</span>
        <span>空优差值 {state.airControl > 0 ? '+' : ''}{state.airControl}</span>
        <span>拥堵 {state.congestion}%</span>
        <span>待命队列 {state.queue.length}/{state.queueLimit}</span>
      </div>
    </div>
  );
};
