import React, { useEffect, useRef } from 'react';
import {
  GOLD_MINER_BOARD_HEIGHT,
  GOLD_MINER_BOARD_WIDTH,
  type GoldMinerBoardState,
  type GoldMinerItem,
} from '../../features/gold_miner/goldMinerTypes.ts';
import {
  drawGoldMinerBlastEffect,
  drawGoldMinerClaw,
  drawGoldMinerCreature,
  drawGoldMinerDynamiteIndicator,
  drawGoldMinerGrabPulse,
  drawGoldMinerHighlight,
  drawGoldMinerLoot,
  drawGoldMinerRope,
} from '../../features/gold_miner/assets/index.ts';
import {
  getGoldMinerItemById,
  getHookTipPosition,
  shouldHighlightGoldMinerItem,
} from '../../features/gold_miner/goldMinerBoardState.ts';

export interface GoldMinerBoardProps {
  state: GoldMinerBoardState;
  reducedMotion?: boolean;
  onLaunch?: () => void;
  onHotkey?: (key: string) => boolean;
}

// 根据物件类型分派到对应的素材绘制函数。
function drawBoardItem(context: CanvasRenderingContext2D, item: GoldMinerItem): void {
  if (item.kind === 'mole' || item.kind === 'bat') {
    drawGoldMinerCreature(context, item);
    return;
  }
  drawGoldMinerLoot(context, item);
}

export const GoldMinerBoard: React.FC<GoldMinerBoardProps> = ({ state, reducedMotion = false, onLaunch, onHotkey }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, GOLD_MINER_BOARD_WIDTH, GOLD_MINER_BOARD_HEIGHT);

    const gradient = context.createLinearGradient(0, 0, 0, GOLD_MINER_BOARD_HEIGHT);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(0.25, '#e2e8f0');
    gradient.addColorStop(1, '#d6b98d');
    context.fillStyle = gradient;
    context.fillRect(0, 0, GOLD_MINER_BOARD_WIDTH, GOLD_MINER_BOARD_HEIGHT);

    context.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    context.lineWidth = 1;
    for (let x = 0; x <= GOLD_MINER_BOARD_WIDTH; x += 46) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, GOLD_MINER_BOARD_HEIGHT);
      context.stroke();
    }
    for (let y = 0; y <= GOLD_MINER_BOARD_HEIGHT; y += 40) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(GOLD_MINER_BOARD_WIDTH, y);
      context.stroke();
    }

    context.fillStyle = '#64748b';
    context.fillRect(state.hookOrigin.x - 54, 18, 108, 30);
    context.fillStyle = '#0f172a';
    context.font = '600 14px Segoe UI';
    context.textAlign = 'center';
    context.fillText('数据抓取机', state.hookOrigin.x, 38);
    drawGoldMinerDynamiteIndicator(context, {
      x: GOLD_MINER_BOARD_WIDTH - 74,
      y: 34,
      count: state.dynamiteCount,
    });

    for (const item of state.items) {
      if (item.isCollected) continue;
      const highlighted = shouldHighlightGoldMinerItem(state, item);
      context.save();
      if (state.levelId >= 11 && state.mode === 'adventure' && !highlighted) {
        context.globalAlpha = 0.4;
      }
      drawBoardItem(context, item);
      if (highlighted) {
        drawGoldMinerHighlight(context, item, true);
      }
      context.restore();
    }

    const hookTip = getHookTipPosition(state);
    const grabbedItem = getGoldMinerItemById(state, state.hook.grabbedItemId);
    drawGoldMinerRope(context, {
      x: hookTip.x,
      y: hookTip.y,
      originX: state.hookOrigin.x,
      originY: state.hookOrigin.y,
      angleDeg: state.hook.angleDeg,
      grabbed: !!grabbedItem,
    });

    if (grabbedItem) {
      drawGoldMinerGrabPulse(context, { x: hookTip.x, y: hookTip.y });
      drawBoardItem(context, grabbedItem);
    }

    drawGoldMinerClaw(context, {
      x: hookTip.x,
      y: hookTip.y,
      angleDeg: reducedMotion ? 0 : state.hook.angleDeg,
      grabbed: !!grabbedItem,
    });

    if (state.resultTitle === '炸药已投掷') {
      drawGoldMinerBlastEffect(context, { x: hookTip.x, y: hookTip.y });
    }

    context.fillStyle = 'rgba(15, 23, 42, 0.72)';
    context.fillRect(0, GOLD_MINER_BOARD_HEIGHT - 42, GOLD_MINER_BOARD_WIDTH, 42);
    context.fillStyle = '#f8fafc';
    context.font = '14px Segoe UI';
    context.textAlign = 'left';
    context.fillText(state.resultTitle || '空闲中', 18, GOLD_MINER_BOARD_HEIGHT - 16);
    context.textAlign = 'right';
    context.fillText(state.resultMessage || '按 Space 或点击矿区发射钩爪。', GOLD_MINER_BOARD_WIDTH - 18, GOLD_MINER_BOARD_HEIGHT - 16);
  }, [reducedMotion, state]);

  return (
    <canvas
      ref={canvasRef}
      className="gold-miner-board"
      width={GOLD_MINER_BOARD_WIDTH}
      height={GOLD_MINER_BOARD_HEIGHT}
      onClick={onLaunch}
      tabIndex={0}
      role="application"
      aria-label="Gold Miner board"
      onPointerDown={(event) => {
        event.currentTarget.focus();
      }}
      onKeyDown={(event) => {
        if (onHotkey?.(event.key)) {
          event.preventDefault();
        }
      }}
    />
  );
};
