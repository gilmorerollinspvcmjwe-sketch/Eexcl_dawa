import React, { useEffect, useRef } from 'react';
import {
  GOLD_MINER_BOARD_HEIGHT,
  GOLD_MINER_BOARD_WIDTH,
  type GoldMinerBoardState,
  type GoldMinerItem,
} from '../../features/gold_miner/goldMinerTypes.ts';
import {
  getGoldMinerItemById,
  getHookTipPosition,
  shouldHighlightGoldMinerItem,
} from '../../features/gold_miner/goldMinerBoardState.ts';

export interface GoldMinerBoardProps {
  state: GoldMinerBoardState;
  reducedMotion?: boolean;
  onLaunch?: () => void;
}

function itemFill(item: GoldMinerItem): string {
  switch (item.kind) {
    case 'gold_small':
    case 'gold_medium':
    case 'gold_large':
      return '#f5c542';
    case 'diamond':
      return '#5eead4';
    case 'money_bag':
      return '#22c55e';
    case 'mystery_bag':
      return '#8b5cf6';
    case 'rock_small':
    case 'rock_large':
      return '#94a3b8';
    case 'mole':
      return '#92400e';
    case 'bat':
      return '#334155';
    default:
      return '#cbd5e1';
  }
}

function itemLabel(item: GoldMinerItem): string {
  switch (item.kind) {
    case 'gold_small':
      return '金';
    case 'gold_medium':
      return '金';
    case 'gold_large':
      return '金';
    case 'diamond':
      return '钻';
    case 'money_bag':
      return '$';
    case 'mystery_bag':
      return '?';
    case 'rock_small':
    case 'rock_large':
      return '石';
    case 'mole':
      return '鼠';
    case 'bat':
      return '蝠';
    default:
      return '';
  }
}

export const GoldMinerBoard: React.FC<GoldMinerBoardProps> = ({ state, reducedMotion = false, onLaunch }) => {
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

    for (const item of state.items) {
      if (item.isCollected) continue;
      context.save();
      if (state.levelId >= 11 && state.mode === 'adventure' && !shouldHighlightGoldMinerItem(state, item)) {
        context.globalAlpha = 0.4;
      }
      context.beginPath();
      context.fillStyle = itemFill(item);
      context.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
      context.fill();
      context.lineWidth = shouldHighlightGoldMinerItem(state, item) ? 4 : 2;
      context.strokeStyle = shouldHighlightGoldMinerItem(state, item) ? '#ef4444' : '#1e293b';
      context.stroke();
      context.fillStyle = '#0f172a';
      context.font = `${Math.max(12, item.radius - 2)}px Segoe UI`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(itemLabel(item), item.x, item.y);
      context.restore();
    }

    const hookTip = getHookTipPosition(state);
    const grabbedItem = getGoldMinerItemById(state, state.hook.grabbedItemId);

    context.save();
    context.strokeStyle = '#334155';
    context.setLineDash([8, 4]);
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(state.hookOrigin.x, state.hookOrigin.y);
    context.lineTo(hookTip.x, hookTip.y);
    context.stroke();
    context.restore();

    context.save();
    context.translate(hookTip.x, hookTip.y);
    if (!reducedMotion) {
      context.rotate((state.hook.angleDeg * Math.PI) / 180);
    }
    context.fillStyle = '#475569';
    context.beginPath();
    context.moveTo(-10, -4);
    context.lineTo(0, 15);
    context.lineTo(10, -4);
    context.closePath();
    context.fill();
    context.restore();

    if (grabbedItem) {
      context.beginPath();
      context.fillStyle = itemFill(grabbedItem);
      context.arc(grabbedItem.x, grabbedItem.y, grabbedItem.radius, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = '#0f172a';
      context.lineWidth = 2;
      context.stroke();
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
    />
  );
};

