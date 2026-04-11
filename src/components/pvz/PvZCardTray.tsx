import React from 'react';
import { PVZ_PLANTS } from '../../features/pvz/pvzPlantRegistry';
import type { PvZBoardState, PvZPlantId } from '../../features/pvz/pvzTypes';

interface PvZCardTrayProps {
  state: PvZBoardState;
  onSelect: (plantId: PvZPlantId) => void;
}

export const PvZCardTray: React.FC<PvZCardTrayProps> = ({ state, onSelect }) => {
  const availablePlants = PVZ_PLANTS.filter((plant) =>
    state.phase === 'setup' ? !state.selectedCards.includes(plant.id) || state.selectedCards.includes(plant.id) : state.selectedCards.includes(plant.id),
  );

  return (
    <div className="pvz-card-tray">
      {availablePlants.map((plant) => {
        const cooldown = state.cardCooldownsMs[plant.id] || 0;
        const disabled =
          state.phase === 'setup'
            ? state.selectedCards.includes(plant.id) || state.selectedCards.length >= 6
            : state.sun < plant.cost || cooldown > 0 || !state.selectedCards.includes(plant.id);
        return (
          <button
            key={plant.id}
            className={`pvz-card ${state.selectedPlantId === plant.id ? 'selected' : ''}`}
            disabled={disabled || state.status !== 'playing'}
            onClick={() => onSelect(plant.id)}
          >
            <span className="pvz-card-name">{plant.name}</span>
            <span className="pvz-card-meta">{state.phase === 'setup' ? plant.cost : plant.cost}</span>
            {state.phase === 'setup' ? (
              <span className="pvz-card-cooldown">{state.selectedCards.includes(plant.id) ? '已选' : '可选'}</span>
            ) : (
              cooldown > 0 && <span className="pvz-card-cooldown">{Math.ceil(cooldown / 1000)}s</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
