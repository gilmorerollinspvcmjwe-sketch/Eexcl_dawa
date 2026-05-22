/* 黄金矿工效果素材：负责绘制探测高亮、抓取脉冲、炸药提示和炸点反馈。 */

import type { GoldMinerItem } from '../goldMinerTypes.ts';

export interface GoldMinerMarkerInput {
  x: number;
  y: number;
  count?: number;
}

// 绘制被探测器锁定后的高亮描边。
export function drawGoldMinerHighlight(
  context: CanvasRenderingContext2D,
  item: GoldMinerItem,
  strong = false,
): void {
  context.save();
  context.strokeStyle = strong ? '#ef4444' : '#f59e0b';
  context.lineWidth = strong ? 4 : 3;
  context.setLineDash(strong ? [] : [6, 5]);
  context.beginPath();
  context.arc(item.x, item.y, item.radius + 7, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

// 绘制抓取中的脉冲，让钩爪命中更显眼。
export function drawGoldMinerGrabPulse(
  context: CanvasRenderingContext2D,
  input: GoldMinerMarkerInput,
): void {
  context.save();
  const pulse = context.createRadialGradient(input.x, input.y, 0, input.x, input.y, 22);
  pulse.addColorStop(0, 'rgba(250, 204, 21, 0.55)');
  pulse.addColorStop(1, 'rgba(250, 204, 21, 0)');
  context.fillStyle = pulse;
  context.beginPath();
  context.arc(input.x, input.y, 22, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

// 绘制炸药图标和剩余数量，作为矿区里的辅助状态提示。
export function drawGoldMinerDynamiteIndicator(
  context: CanvasRenderingContext2D,
  input: Required<GoldMinerMarkerInput>,
): void {
  context.save();
  context.translate(input.x, input.y);

  context.fillStyle = 'rgba(15, 23, 42, 0.78)';
  context.beginPath();
  context.roundRect(-38, -19, 76, 38, 12);
  context.fill();

  context.fillStyle = '#dc2626';
  for (let index = 0; index < 3; index += 1) {
    const offsetX = -21 + index * 9;
    context.fillRect(offsetX, -9, 7, 18);
    context.fillStyle = '#fde68a';
    context.fillRect(offsetX + 2, -13, 3, 6);
    context.fillStyle = '#dc2626';
  }

  context.fillStyle = '#f8fafc';
  context.font = '600 13px Segoe UI';
  context.textAlign = 'left';
  context.textBaseline = 'middle';
  context.fillText(`x${input.count}`, 5, 0);
  context.restore();
}

// 绘制炸药炸毁后的爆点反馈。
export function drawGoldMinerBlastEffect(
  context: CanvasRenderingContext2D,
  input: GoldMinerMarkerInput,
): void {
  context.save();
  const burst = context.createRadialGradient(input.x, input.y, 0, input.x, input.y, 30);
  burst.addColorStop(0, 'rgba(251, 191, 36, 0.9)');
  burst.addColorStop(0.45, 'rgba(249, 115, 22, 0.62)');
  burst.addColorStop(1, 'rgba(239, 68, 68, 0)');
  context.fillStyle = burst;
  context.beginPath();
  context.arc(input.x, input.y, 30, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  context.lineWidth = 2;
  for (let index = 0; index < 6; index += 1) {
    const angle = (Math.PI * 2 * index) / 6;
    context.beginPath();
    context.moveTo(input.x + Math.cos(angle) * 8, input.y + Math.sin(angle) * 8);
    context.lineTo(input.x + Math.cos(angle) * 24, input.y + Math.sin(angle) * 24);
    context.stroke();
  }
  context.restore();
}
