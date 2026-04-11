import React from 'react';
import { PVZ_PLANT_MAP } from '../../features/pvz/pvzPlantRegistry';
import { PVZ_ZOMBIE_MAP } from '../../features/pvz/pvzZombieRegistry';
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
              return (
                <button key={`cell-${row}-${col}`} className="pvz-cell" onClick={() => onCellClick(row, col)}>
                  {plant ? (
                    <div className="pvz-plant">
                      <span className="pvz-unit-short">{PVZ_PLANT_MAP[plant.plantId].shortName}</span>
                      <span className="pvz-unit-name">{PVZ_PLANT_MAP[plant.plantId].name}</span>
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
                    className={`pvz-projectile kind-${projectile.kind}`}
                    style={{ left: `${(projectile.x / state.cols) * 100}%` }}
                  />
                ))}
              {state.zombies
                .filter((zombie) => zombie.row === row)
                .map((zombie) => (
                  <div
                    key={zombie.instanceId}
                    className="pvz-zombie"
                    style={{ left: `${(zombie.x / state.cols) * 100}%` }}
                  >
                    <span className="pvz-unit-short">{PVZ_ZOMBIE_MAP[zombie.zombieId].shortName}</span>
                    <span className="pvz-unit-name">{PVZ_ZOMBIE_MAP[zombie.zombieId].name}</span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
