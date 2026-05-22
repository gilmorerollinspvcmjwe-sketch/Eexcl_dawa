/* 黄金矿工战利品素材：负责绘制金块、钻石、石头、钱袋和神秘袋。 */

import type { GoldMinerItem } from '../goldMinerTypes.ts';

function drawShadow(context: CanvasRenderingContext2D, item: GoldMinerItem): void {
  context.save();
  context.fillStyle = 'rgba(15, 23, 42, 0.16)';
  context.beginPath();
  context.ellipse(item.x, item.y + item.radius * 0.78, item.radius * 0.9, item.radius * 0.34, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawGoldChunk(
  context: CanvasRenderingContext2D,
  item: GoldMinerItem,
  baseColor: string,
  edgeColor: string,
): void {
  drawShadow(context, item);
  context.save();
  context.translate(item.x, item.y);
  context.scale(item.radius / 22, item.radius / 22);

  context.fillStyle = baseColor;
  context.strokeStyle = edgeColor;
  context.lineWidth = 2.4;
  context.beginPath();
  context.moveTo(-16, -8);
  context.lineTo(-8, -17);
  context.lineTo(9, -15);
  context.lineTo(18, -2);
  context.lineTo(13, 14);
  context.lineTo(-7, 18);
  context.lineTo(-18, 5);
  context.closePath();
  context.fill();
  context.stroke();

  context.fillStyle = 'rgba(255,255,255,0.34)';
  context.beginPath();
  context.moveTo(-8, -13);
  context.lineTo(4, -11);
  context.lineTo(8, -4);
  context.lineTo(-4, -2);
  context.closePath();
  context.fill();
  context.restore();
}

function drawDiamond(context: CanvasRenderingContext2D, item: GoldMinerItem): void {
  drawShadow(context, item);
  context.save();
  context.translate(item.x, item.y);

  const crystal = context.createLinearGradient(-item.radius, -item.radius, item.radius, item.radius);
  crystal.addColorStop(0, '#d5fbff');
  crystal.addColorStop(0.45, '#7dd3fc');
  crystal.addColorStop(1, '#0f766e');

  context.fillStyle = crystal;
  context.strokeStyle = '#155e75';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(0, -item.radius);
  context.lineTo(item.radius * 0.85, -item.radius * 0.12);
  context.lineTo(0, item.radius);
  context.lineTo(-item.radius * 0.85, -item.radius * 0.12);
  context.closePath();
  context.fill();
  context.stroke();

  context.strokeStyle = 'rgba(255,255,255,0.55)';
  context.lineWidth = 1.2;
  context.beginPath();
  context.moveTo(0, -item.radius);
  context.lineTo(0, item.radius);
  context.moveTo(-item.radius * 0.46, -item.radius * 0.08);
  context.lineTo(item.radius * 0.46, -item.radius * 0.08);
  context.stroke();
  context.restore();
}

function drawRock(context: CanvasRenderingContext2D, item: GoldMinerItem, dark = false): void {
  drawShadow(context, item);
  context.save();
  context.translate(item.x, item.y);
  context.fillStyle = dark ? '#64748b' : '#94a3b8';
  context.strokeStyle = '#334155';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(-item.radius * 0.92, item.radius * 0.05);
  context.lineTo(-item.radius * 0.55, -item.radius * 0.82);
  context.lineTo(item.radius * 0.2, -item.radius * 0.95);
  context.lineTo(item.radius * 0.88, -item.radius * 0.24);
  context.lineTo(item.radius * 0.72, item.radius * 0.84);
  context.lineTo(-item.radius * 0.15, item.radius * 0.98);
  context.closePath();
  context.fill();
  context.stroke();

  context.strokeStyle = 'rgba(255,255,255,0.24)';
  context.beginPath();
  context.moveTo(-item.radius * 0.34, -item.radius * 0.35);
  context.lineTo(item.radius * 0.2, -item.radius * 0.14);
  context.lineTo(item.radius * 0.44, item.radius * 0.34);
  context.stroke();
  context.restore();
}

function drawBag(
  context: CanvasRenderingContext2D,
  item: GoldMinerItem,
  bodyColor: string,
  label: string,
  labelColor: string,
): void {
  drawShadow(context, item);
  context.save();
  context.translate(item.x, item.y);

  context.fillStyle = bodyColor;
  context.strokeStyle = '#422006';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(-item.radius * 0.62, -item.radius * 0.18);
  context.quadraticCurveTo(-item.radius * 0.72, item.radius * 0.62, 0, item.radius * 0.92);
  context.quadraticCurveTo(item.radius * 0.72, item.radius * 0.62, item.radius * 0.62, -item.radius * 0.18);
  context.quadraticCurveTo(item.radius * 0.18, -item.radius * 0.92, 0, -item.radius * 0.72);
  context.quadraticCurveTo(-item.radius * 0.18, -item.radius * 0.92, -item.radius * 0.62, -item.radius * 0.18);
  context.closePath();
  context.fill();
  context.stroke();

  context.strokeStyle = '#7c2d12';
  context.beginPath();
  context.moveTo(-item.radius * 0.46, -item.radius * 0.22);
  context.lineTo(item.radius * 0.46, -item.radius * 0.22);
  context.stroke();

  context.fillStyle = labelColor;
  context.font = `${Math.max(11, item.radius)}px Segoe UI`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(label, 0, item.radius * 0.18);
  context.restore();
}

// 根据战利品种类绘制更接近游戏物件的素材。
export function drawGoldMinerLoot(
  context: CanvasRenderingContext2D,
  item: GoldMinerItem,
): void {
  switch (item.kind) {
    case 'gold_small':
      drawGoldChunk(context, item, '#facc15', '#a16207');
      return;
    case 'gold_medium':
      drawGoldChunk(context, item, '#fbbf24', '#92400e');
      return;
    case 'gold_large':
      drawGoldChunk(context, item, '#f59e0b', '#78350f');
      return;
    case 'diamond':
      drawDiamond(context, item);
      return;
    case 'rock_small':
      drawRock(context, item, false);
      return;
    case 'rock_large':
      drawRock(context, item, true);
      return;
    case 'money_bag':
      drawBag(context, item, '#65a30d', '$', '#fef3c7');
      return;
    case 'mystery_bag':
      drawBag(context, item, '#7c3aed', '?', '#ffffff');
      return;
    default:
      drawRock(context, item, false);
  }
}
