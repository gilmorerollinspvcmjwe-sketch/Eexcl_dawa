import React from 'react';
import { PVZ_PLANT_MAP } from '../../features/pvz/pvzPlantRegistry';
import { PVZ_ZOMBIE_MAP } from '../../features/pvz/pvzZombieRegistry';
import {
  getPvZPlantChargeState,
  getPvZPlantCompactLabel,
  getPvZPlantFrameClass,
  getPvZPlantHealthSegments,
  getPvZPlantTraitClass,
  getPvZPlantToneClass,
  getPvZProjectileLabel,
  getPvZProjectileToneClass,
  getPvZZombieFrameClass,
  getPvZZombieHealthSegments,
  getPvZZombieThreatLabel,
  getPvZZombieToneClass,
} from '../../features/pvz/pvzPresentation';
import type { PvZBoardState } from '../../features/pvz/pvzTypes';

interface PvZBoardProps {
  state: PvZBoardState;
  onCellClick: (row: number, col: number) => void;
  onSunDropClick?: (dropId: string) => void;
}

export const PvZBoard: React.FC<PvZBoardProps> = ({ state, onCellClick, onSunDropClick }) => {
  const hasFog = state.environment === 'fog';

  const getCellAriaLabel = (row: number, col: number, hasPlant: boolean, plantName?: string, isFogged?: boolean) => {
    const location = `第 ${row + 1} 行第 ${col + 1} 列`;
    if (isFogged) return `${location}，被迷雾遮挡`;
    if (hasPlant && plantName) {
      return state.shovelMode ? `${location}，${plantName}，点击可铲除` : `${location}，已种植 ${plantName}`;
    }
    return state.shovelMode ? `${location}，空地` : `${location}，空地，可种植当前选中植物`;
  };

  return (
    <div className="pvz-board-shell">
      <div className="pvz-board">
        {state.skyDrops.length > 0 && (
          <div className="pvz-sky-drops">
            {state.skyDrops.map((drop) => (
              <button
                key={drop.dropId}
                type="button"
                className="pvz-sun-drop"
                style={{ left: `${(drop.x / state.cols) * 100}%`, top: `${drop.y}px` }}
                onClick={() => onSunDropClick?.(drop.dropId)}
                aria-label={`收集 ${drop.amount} 阳光`}
                title={`点击收集 ${drop.amount} 阳光`}
              >
                ☀️ {drop.amount}
              </button>
            ))}
          </div>
        )}

        {Array.from({ length: state.rows }, (_, row) => {
          const lawnMowerState = state.lawnMowerStates[row];
          const showLawnMower = lawnMowerState?.active && !lawnMowerState.triggered;
          const triggeredLawnMower = lawnMowerState?.triggered;

          return (
            <div key={`row-${row}`} className="pvz-row">
              {showLawnMower && (
                <div
                  className="pvz-lawn-mower"
                  style={{ left: `${(lawnMowerState.x / state.cols) * 100}%` }}
                  title="割草机：僵尸到达时自动触发"
                >
                  🚜
                </div>
              )}

              {triggeredLawnMower && (
                <div
                  className="pvz-lawn-mower pvz-lawn-mower--triggered"
                  style={{ left: `${(lawnMowerState.x / state.cols) * 100}%` }}
                >
                  🚜💥
                </div>
              )}

              {Array.from({ length: state.cols }, (_, col) => {
                const plant = state.plants.find((item) => item.row === row && item.col === col);
                const plantDefinition = plant ? PVZ_PLANT_MAP[plant.plantId] : null;
                const plantSegments = plant && plantDefinition ? getPvZPlantHealthSegments(plant, plantDefinition) : null;
                const plantCharge = plant && plantDefinition ? getPvZPlantChargeState(plant, plantDefinition) : null;
                const plantAttackClass = plant?.isAttacking ? 'pvz-plant--attacking' : '';
                const plantSplashClass = plant && (plant.plantId === 'melonPult' || plant.plantId === 'winterMelon' || plant.plantId === 'gloomShroom' || plant.plantId === 'frostMelonVine') && plant.isAttacking ? 'pvz-plant--splash-attack' : '';
                const plantRangeClass = plant && (plant.plantId === 'starfruit' || plant.plantId === 'threepeater' || plant.plantId === 'laserBean' || plant.plantId === 'magnetBurstShroom') && plant.isAttacking ? 'pvz-plant--range-attack' : '';
                const plantHitClass = plant?.isBeingAttacked ? 'pvz-plant--hit' : '';

                const isFogged = hasFog && state.fogMask[row]?.[col];
                const cellAriaLabel = getCellAriaLabel(row, col, Boolean(plant), plantDefinition?.name, isFogged);

                return (
                  <button
                    key={`cell-${row}-${col}`}
                    type="button"
                    className={`pvz-cell ${isFogged ? 'pvz-cell--fogged' : ''}`}
                    onClick={() => onCellClick(row, col)}
                    aria-label={cellAriaLabel}
                    aria-pressed={state.shovelMode && Boolean(plant)}
                    title={cellAriaLabel}
                  >
                    {plant && plantDefinition ? (
                      <div
                        className={`pvz-plant ${getPvZPlantToneClass(plant.plantId)} ${getPvZPlantFrameClass(plantDefinition)} ${plantAttackClass} ${plantSplashClass} ${plantRangeClass} ${plantHitClass}`.trim()}
                      >
                        <div className={`pvz-health-bar${plantSegments?.hasArmor ? ' pvz-health-bar--armored' : ''}`}>
                          <span className="pvz-health-fill pvz-health-fill--body" style={{ width: `${plantSegments?.basePercent ?? 0}%` }} />
                          {plantSegments?.hasArmor ? (
                            <span className="pvz-health-fill pvz-health-fill--armor" style={{ width: `${plantSegments.armorPercent}%` }} />
                          ) : null}
                        </div>
                        <span
                          className={`pvz-unit-short-shell${plantCharge ? ` ${plantCharge.toneClass}` : ''}`}
                          style={plantCharge ? ({ ['--pvz-charge-progress' as string]: `${plantCharge.progress}` } as React.CSSProperties) : undefined}
                        >
                          <span className="pvz-unit-short">{plantDefinition.shortName}</span>
                          {plantCharge ? <span className="pvz-unit-short-badge">{plantCharge.label}</span> : null}
                        </span>
                        <span className="pvz-unit-name">{plantDefinition.name}</span>
                        <div className="pvz-unit-meta-row">
                          <span className={`pvz-unit-meta ${getPvZPlantTraitClass(plantDefinition)}`}>
                            {getPvZPlantCompactLabel(plantDefinition)}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </button>
                );
              })}

            <div className="pvz-zombie-lane">
                {state.projectiles
                  .filter((projectile) => projectile.row === row)
                  .map((projectile) => {
                    const projectileEffectClass = projectile.slowEffect ? 'pvz-projectile--snow-pea' : projectile.kind === 'shock' ? 'pvz-projectile--shock' : '';
                    return (
                      <div
                        key={projectile.projectileId}
                        className={`pvz-projectile ${getPvZProjectileToneClass(projectile.kind)} ${projectileEffectClass}`.trim()}
                        style={{ left: `${(projectile.x / state.cols) * 100}%` }}
                        title={getPvZProjectileLabel(projectile.kind)}
                      />
                    );
                  })}
                {state.zombies
                  .filter((zombie) => zombie.row === row)
                  .map((zombie) => {
                    const zombieDefinition = PVZ_ZOMBIE_MAP[zombie.zombieId];
                    const zombieSegments = getPvZZombieHealthSegments(zombie, zombieDefinition);
                    const zombieStealthClass = zombie.isStealth ? 'pvz-zombie--stealth' : '';
                    const zombieAirborneClass = zombie.isAirborne ? 'pvz-zombie--airborne' : '';
                    const zombieSummoningClass = zombie.isSummoning ? 'pvz-zombie--summoning' : '';
                    const zombieBossClass = zombieDefinition.archetype === 'boss' ? 'pvz-zombie--boss' : '';
                    return (
                      <div
                        key={zombie.instanceId}
                        className={`pvz-zombie ${getPvZZombieToneClass(zombie.zombieId)} ${getPvZZombieFrameClass(zombieDefinition)} ${zombieStealthClass} ${zombieAirborneClass} ${zombieSummoningClass} ${zombieBossClass}`.trim()}
                        style={{ left: `${(zombie.x / state.cols) * 100}%` }}
                      >
                        <div className={`pvz-health-bar${zombieSegments.hasArmor ? ' pvz-health-bar--armored' : ''}`}>
                          <span className="pvz-health-fill pvz-health-fill--body" style={{ width: `${zombieSegments.basePercent}%` }} />
                          {zombieSegments.hasArmor ? (
                            <span className="pvz-health-fill pvz-health-fill--armor" style={{ width: `${zombieSegments.armorPercent}%` }} />
                          ) : null}
                        </div>
                        <span className="pvz-unit-short">{zombieDefinition.shortName}</span>
                        <span className="pvz-unit-name">{zombieDefinition.name}</span>
                        <div className="pvz-unit-meta-row">
                          <span className="pvz-unit-meta">{getPvZZombieThreatLabel(zombieDefinition)}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
