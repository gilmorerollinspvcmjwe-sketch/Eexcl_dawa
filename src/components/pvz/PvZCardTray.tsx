import React from 'react';
import { PVZ_PLANTS } from '../../features/pvz/pvzPlantRegistry';
import type { PvZBoardState, PvZPlantId } from '../../features/pvz/pvzTypes';

interface PvZCardTrayProps {
  state: PvZBoardState;
  onSelect: (plantId: PvZPlantId) => void;
}

export const PvZCardTray: React.FC<PvZCardTrayProps> = ({ state, onSelect }) => {
  return (
    <div className="pvz-card-tray">
      {PVZ_PLANTS.map((plant) => {
        const cooldown = state.cardCooldownsMs[plant.id] || 0;
        const disabled = state.sun < plant.cost || cooldown > 0;
        return (
          <button
            key={plant.id}
            className={`pvz-card ${state.selectedPlantId === plant.id ? 'selected' : ''}`}
            disabled={disabled || state.status !== 'playing'}
            onClick={() => onSelect(plant.id)}
          >
            <span className="pvz-card-name">{plant.name}</span>
            <span className="pvz-card-meta">{plant.cost}</span>
            {cooldown > 0 && <span className="pvz-card-cooldown">{Math.ceil(cooldown / 1000)}s</span>}
          </button>
        );
      })}
    </div>
  );
};

