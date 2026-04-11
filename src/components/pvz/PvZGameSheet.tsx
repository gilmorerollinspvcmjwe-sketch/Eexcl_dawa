import React, { useEffect, useState } from 'react';
import { createPvZBoardState, placePlant, tickPvZBoard } from '../../features/pvz/pvzBoardState';
import type { PvZBoardState, PvZPlantId } from '../../features/pvz/pvzTypes';
import { PvZHud } from './PvZHud';
import { PvZCardTray } from './PvZCardTray';
import { PvZBoard } from './PvZBoard';
import '../../styles/pvz.css';

interface PvZGameSheetProps {
  onFormulaChange?: (text: string) => void;
}

export const PvZGameSheet: React.FC<PvZGameSheetProps> = ({ onFormulaChange }) => {
  const [state, setState] = useState<PvZBoardState>(() => createPvZBoardState());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setState((current) => tickPvZBoard(current, 200));
    }, 200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    onFormulaChange?.(
      state.status === 'playing'
        ? `=防线 ${Math.round(state.waveProgress * 100)}% | 阳光 ${state.sun} | 僵尸 ${state.zombies.length}`
        : state.status === 'won'
          ? '=防线守住了，点击卡槽可继续复盘'
          : '=防线失守，建议补向日葵和坚果墙',
    );
  }, [state, onFormulaChange]);

  return (
    <div className="pvz-sheet">
      <PvZHud state={state} />
      <PvZCardTray
        state={state}
        onSelect={(plantId) => setState((current) => ({ ...current, selectedPlantId: plantId }))}
      />
      <PvZBoard
        state={state}
        onCellClick={(row, col) => {
          if (!state.selectedPlantId) return;
          setState((current) => placePlant(current, current.selectedPlantId as PvZPlantId, row, col));
        }}
      />
    </div>
  );
};

