import React, { useEffect, useState } from 'react';
import { createPvZBoardState, placePlant, selectPvZCard, startPvZBattle, tickPvZBoard } from '../../features/pvz/pvzBoardState';
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
      state.phase === 'setup'
        ? `=选卡阶段 | 当前 ${state.selectedCards.length}/6`
        : state.status === 'playing'
          ? `=防线 ${Math.round(state.waveProgress * 100)}% | 阳光 ${state.sun} | 僵尸 ${state.zombies.length}`
        : state.status === 'won'
          ? '=防线守住了，点击卡槽可继续复盘'
          : '=防线失守，建议补向日葵和坚果墙',
    );
  }, [state, onFormulaChange]);

  return (
    <div className="pvz-sheet">
      <PvZHud state={state} />
      {state.phase === 'setup' && (
        <div className="pvz-setup-panel">
          <div className="pvz-setup-copy">
            <strong>选卡阶段</strong>
            <span>先确认卡组，再开始布防。当前卡组：{state.selectedCards.join('、')}</span>
          </div>
          <button className="pvz-start-btn" onClick={() => setState((current) => startPvZBattle(current))}>开始布防</button>
        </div>
      )}
      <PvZCardTray
        state={state}
        onSelect={(plantId) =>
          setState((current) =>
            current.phase === 'setup'
              ? selectPvZCard(current, plantId)
              : { ...current, selectedPlantId: plantId },
          )
        }
      />
      {state.phase === 'playing' ? (
        <PvZBoard
          state={state}
          onCellClick={(row, col) => {
            if (!state.selectedPlantId) return;
            setState((current) => placePlant(current, current.selectedPlantId as PvZPlantId, row, col));
          }}
        />
      ) : (
        <div className="pvz-setup-board-placeholder">确认卡组后进入战场</div>
      )}
    </div>
  );
};
