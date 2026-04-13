import React from 'react';
import { PVZ_PLANTS } from '../../features/pvz/pvzPlantRegistry';
import {
  getPvZPlantCadenceLabels,
  getPvZPlantCompactLabel,
  getPvZPlantRoleLabel,
  getPvZPlantToneClass,
  getPvZPlantTraitClass,
} from '../../features/pvz/pvzPresentation';
import type { PvZBoardState, PvZPlantId } from '../../features/pvz/pvzTypes';

interface PvZCardTrayProps {
  state: PvZBoardState;
  onSelect: (plantId: PvZPlantId) => void;
  unlockedPlants?: string[];
}

export const PvZCardTray: React.FC<PvZCardTrayProps> = ({ state, onSelect, unlockedPlants }) => {
  const availablePlantIds = state.phase === 'setup' ? state.availablePlants : state.selectedCards;
  const availablePlants = PVZ_PLANTS
    .filter((plant) => availablePlantIds.includes(plant.id))
    .sort((left, right) => {
      const leftSelected = state.selectedCards.includes(left.id) ? 1 : 0;
      const rightSelected = state.selectedCards.includes(right.id) ? 1 : 0;
      if (leftSelected !== rightSelected) return rightSelected - leftSelected;

      const leftRecommended = state.recommendedCards.includes(left.id) ? 1 : 0;
      const rightRecommended = state.recommendedCards.includes(right.id) ? 1 : 0;
      if (leftRecommended !== rightRecommended) return rightRecommended - leftRecommended;

      return left.cost - right.cost;
    });

  return (
    <div className="pvz-card-tray-shell">
      {state.phase === 'setup' ? (
        <div className="pvz-card-tray-meta">
          <span>本关可用植物 {availablePlants.length} 张</span>
          <span>已编入 {state.selectedCards.length}/6</span>
          <span>推荐卡组 {state.recommendedCards.length > 0 ? '已高亮' : '按你的阵容自由调整'}</span>
        </div>
      ) : null}
      <div className="pvz-card-tray">
        {availablePlants.map((plant) => {
          const cooldown = state.cardCooldownsMs[plant.id] || 0;
          const cadenceLabels = getPvZPlantCadenceLabels(plant);
          const primaryCadence = cadenceLabels[0];
          const isSelectedInSetup = state.phase === 'setup' && state.selectedCards.includes(plant.id);
          const isSelectedInBattle = state.phase !== 'setup' && state.selectedPlantId === plant.id;
          const isRecommended = state.phase === 'setup' && state.recommendedCards.includes(plant.id);
          const isUnlocked = !unlockedPlants || unlockedPlants.includes(plant.id);
          const disabled =
            state.phase === 'setup'
              ? state.selectedCards.length >= 6 && !state.selectedCards.includes(plant.id)
              : state.sun < plant.cost || cooldown > 0 || !state.selectedCards.includes(plant.id);
          return (
            <button
              key={plant.id}
              className={`pvz-card ${getPvZPlantToneClass(plant.id)} ${isSelectedInSetup || isSelectedInBattle ? 'selected' : ''} ${isRecommended ? 'pvz-card--recommended' : ''} ${!isUnlocked ? 'pvz-card--locked' : ''}`.trim()}
              disabled={disabled || (state.phase !== 'setup' && state.status !== 'playing') || !isUnlocked}
              onClick={() => isUnlocked && onSelect(plant.id)}
            >
              <span className="pvz-card-topline">
                <span className="pvz-card-short">{plant.shortName}</span>
                <span className="pvz-card-role">{getPvZPlantRoleLabel(plant)}</span>
              </span>
              <span className="pvz-card-name">{plant.name}</span>
              <div className="pvz-card-stats">
                <span className={`pvz-card-stat ${getPvZPlantTraitClass(plant)}`}>{getPvZPlantCompactLabel(plant)}</span>
                {primaryCadence ? <span className="pvz-card-stat pvz-card-stat--timing">{primaryCadence}</span> : null}
                {isRecommended ? <span className="pvz-card-stat pvz-card-stat--recommend">推荐</span> : null}
              </div>
              <span className="pvz-card-meta">阳光 {plant.cost}</span>
              {!isUnlocked ? (
                <span className="pvz-card-cooldown pvz-card-cooldown--locked">🔒 未解锁</span>
              ) : state.phase === 'setup' ? (
                <span className="pvz-card-cooldown">
                  {state.selectedCards.includes(plant.id)
                    ? '已编入卡组'
                    : state.selectedCards.length >= 6
                      ? '卡组已满'
                      : '点击加入'}
                </span>
              ) : (
                cooldown > 0 && <span className="pvz-card-cooldown">{Math.ceil(cooldown / 1000)}秒</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
