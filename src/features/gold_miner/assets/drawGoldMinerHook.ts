/* 黄金矿工钩爪素材：负责绘制绳索、钩头和抓取状态，供 GoldMinerBoard 调用。 */

export interface GoldMinerHookDrawInput {
  x: number;
  y: number;
  originX: number;
  originY: number;
  angleDeg: number;
  grabbed: boolean;
}

// 绘制从抓取机延伸到钩头的绳索。
export function drawGoldMinerRope(
  context: CanvasRenderingContext2D,
  input: GoldMinerHookDrawInput,
): void {
  context.save();
  context.strokeStyle = '#475569';
  context.lineWidth = 4;
  context.setLineDash([8, 5]);
  context.beginPath();
  context.moveTo(input.originX, input.originY);
  context.lineTo(input.x, input.y);
  context.stroke();

  context.strokeStyle = 'rgba(255,255,255,0.45)';
  context.lineWidth = 1.4;
  context.beginPath();
  context.moveTo(input.originX + 1, input.originY + 1);
  context.lineTo(input.x + 1, input.y + 1);
  context.stroke();
  context.restore();
}

// 绘制机械抓爪，让钩头比旧版三角形更像真正工具。
export function drawGoldMinerClaw(
  context: CanvasRenderingContext2D,
  input: Pick<GoldMinerHookDrawInput, 'x' | 'y' | 'angleDeg' | 'grabbed'>,
): void {
  context.save();
  context.translate(input.x, input.y);
  context.rotate((input.angleDeg * Math.PI) / 180);

  const metal = context.createLinearGradient(-14, -14, 14, 14);
  metal.addColorStop(0, '#e2e8f0');
  metal.addColorStop(0.5, '#94a3b8');
  metal.addColorStop(1, '#475569');

  context.fillStyle = metal;
  context.beginPath();
  context.arc(0, 0, 8.5, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = '#334155';
  context.fillRect(-3.2, -17, 6.4, 16);

  const clawColor = input.grabbed ? '#f59e0b' : '#64748b';
  context.fillStyle = clawColor;
  context.strokeStyle = '#0f172a';
  context.lineWidth = 1.6;

  const drawProng = (direction: 1 | -1) => {
    context.beginPath();
    context.moveTo(direction * 2.5, 4);
    context.quadraticCurveTo(direction * 14, 9, direction * 11.5, 18);
    context.quadraticCurveTo(direction * 9, 11, direction * 2.5, 8);
    context.closePath();
    context.fill();
    context.stroke();
  };

  drawProng(-1);
  drawProng(1);

  context.fillStyle = '#f8fafc';
  context.beginPath();
  context.arc(-2.2, -2.2, 2.1, 0, Math.PI * 2);
  context.fill();

  context.restore();
}
