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
}

export const PvZBoard: React.FC<PvZBoardProps> = ({ state, onCellClick }) => {
  return (
    <div className="pvz-board-shell">
      <div className="pvz-board">
        {Array.from({ length: state.rows }, (_, row) => (
          <div key={`row-${row}`} className="pvz-row">
            {Array.from({ length: state.cols }, (_, col) => {
              const plant = state.plants.find((item) => item.row === row && item.col === col);
              const plantDefinition = plant ? PVZ_PLANT_MAP[plant.plantId] : null;
              const plantSegments = plant && plantDefinition ? getPvZPlantHealthSegments(plant, plantDefinition) : null;
              const plantCharge = plant && plantDefinition ? getPvZPlantChargeState(plant, plantDefinition) : null;
              return (
                <button key={`cell-${row}-${col}`} className="pvz-cell" onClick={() => onCellClick(row, col)}>
                  {plant && plantDefinition ? (
                    <div
                      className={`pvz-plant ${getPvZPlantToneClass(plant.plantId)} ${getPvZPlantFrameClass(plantDefinition)}`.trim()}
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
                .map((projectile) => (
                  <div
                    key={projectile.projectileId}
                    className={`pvz-projectile ${getPvZProjectileToneClass(projectile.kind)}`}
                    style={{ left: `${(projectile.x / state.cols) * 100}%` }}
                    title={getPvZProjectileLabel(projectile.kind)}
                  />
                ))}
              {state.zombies
                .filter((zombie) => zombie.row === row)
                .map((zombie) => {
                  const zombieDefinition = PVZ_ZOMBIE_MAP[zombie.zombieId];
                  const zombieSegments = getPvZZombieHealthSegments(zombie, zombieDefinition);
                  return (
                  <div
                    key={zombie.instanceId}
                    className={`pvz-zombie ${getPvZZombieToneClass(zombie.zombieId)} ${getPvZZombieFrameClass(zombieDefinition)}`.trim()}
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
        ))}
      </div>
    </div>
  );
};
