/* 黄金矿工生物素材：负责绘制鼹鼠和蝙蝠这类动态目标。 */

import type { GoldMinerItem } from '../goldMinerTypes.ts';

function drawShadow(context: CanvasRenderingContext2D, item: GoldMinerItem): void {
  context.save();
  context.fillStyle = 'rgba(15, 23, 42, 0.14)';
  context.beginPath();
  context.ellipse(item.x, item.y + item.radius * 0.76, item.radius * 0.86, item.radius * 0.3, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawMole(context: CanvasRenderingContext2D, item: GoldMinerItem): void {
  drawShadow(context, item);
  context.save();
  context.translate(item.x, item.y);

  context.fillStyle = '#8b5a2b';
  context.strokeStyle = '#5b3717';
  context.lineWidth = 2;
  context.beginPath();
  context.ellipse(0, 2, item.radius * 0.9, item.radius * 0.72, 0, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  context.fillStyle = '#d6a77a';
  context.beginPath();
  context.ellipse(0, item.radius * 0.14, item.radius * 0.44, item.radius * 0.34, 0, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = '#fecdd3';
  context.beginPath();
  context.arc(0, item.radius * 0.18, item.radius * 0.12, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = '#0f172a';
  context.beginPath();
  context.arc(-item.radius * 0.22, -item.radius * 0.05, item.radius * 0.08, 0, Math.PI * 2);
  context.arc(item.radius * 0.22, -item.radius * 0.05, item.radius * 0.08, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = '#fef08a';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(-item.radius * 0.54, item.radius * 0.52);
  context.lineTo(-item.radius * 0.3, item.radius * 0.3);
  context.moveTo(item.radius * 0.54, item.radius * 0.52);
  context.lineTo(item.radius * 0.3, item.radius * 0.3);
  context.stroke();
  context.restore();
}

function drawBat(context: CanvasRenderingContext2D, item: GoldMinerItem): void {
  drawShadow(context, item);
  context.save();
  context.translate(item.x, item.y);

  context.fillStyle = '#334155';
  context.strokeStyle = '#0f172a';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(-item.radius * 1.1, 0);
  context.quadraticCurveTo(-item.radius * 0.74, -item.radius * 0.84, -item.radius * 0.16, -item.radius * 0.14);
  context.quadraticCurveTo(0, item.radius * 0.2, item.radius * 0.16, -item.radius * 0.14);
  context.quadraticCurveTo(item.radius * 0.74, -item.radius * 0.84, item.radius * 1.1, 0);
  context.quadraticCurveTo(item.radius * 0.58, item.radius * 0.12, item.radius * 0.44, item.radius * 0.5);
  context.quadraticCurveTo(0, item.radius * 0.18, -item.radius * 0.44, item.radius * 0.5);
  context.quadraticCurveTo(-item.radius * 0.58, item.radius * 0.12, -item.radius * 1.1, 0);
  context.closePath();
  context.fill();
  context.stroke();

  context.fillStyle = '#1e293b';
  context.beginPath();
  context.ellipse(0, item.radius * 0.04, item.radius * 0.24, item.radius * 0.46, 0, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = '#f8fafc';
  context.beginPath();
  context.arc(-item.radius * 0.08, -item.radius * 0.08, item.radius * 0.05, 0, Math.PI * 2);
  context.arc(item.radius * 0.08, -item.radius * 0.08, item.radius * 0.05, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

// 根据生物类型绘制对应的动态目标。
export function drawGoldMinerCreature(
  context: CanvasRenderingContext2D,
  item: GoldMinerItem,
): void {
  if (item.kind === 'mole') {
    drawMole(context, item);
    return;
  }

  if (item.kind === 'bat') {
    drawBat(context, item);
  }
}
