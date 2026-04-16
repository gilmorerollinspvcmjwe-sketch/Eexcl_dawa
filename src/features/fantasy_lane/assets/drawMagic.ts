/* 法术/范围兵种绘制：火焰术士、冰霜女巫、瘟疫投手、雷电法师（子agent详细设计版） */

/** 火焰术士 - 红色长袍，火焰法杖，兜帽遮脸，火焰环绕 */
export function drawFlameWarlock(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, _weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  const t = Date.now() / 200;

  // 红色长袍
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.25, -size * 0.2);
  ctx.lineTo(-size * 0.3, size * 0.5);
  ctx.quadraticCurveTo(0, size * 0.55, size * 0.3, size * 0.5);
  ctx.lineTo(size * 0.25, -size * 0.2);
  ctx.closePath();
  ctx.fill();

  // 火焰纹饰
  ctx.strokeStyle = '#FF4500';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    const yy = size * 0.05 + i * size * 0.12;
    ctx.beginPath();
    ctx.moveTo(-size * 0.15, yy);
    ctx.quadraticCurveTo(0, yy - 5, size * 0.15, yy);
    ctx.stroke();
  }

  // 兜帽
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.22, -size * 0.2);
  ctx.quadraticCurveTo(-size * 0.25, -size * 0.55, 0, -size * 0.65);
  ctx.quadraticCurveTo(size * 0.25, -size * 0.55, size * 0.22, -size * 0.2);
  ctx.closePath();
  ctx.fill();

  // 兜帽内阴影
  ctx.fillStyle = '#1A0A00';
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.35, size * 0.12, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // 发光眼睛
  ctx.fillStyle = '#FF4500';
  ctx.beginPath();
  ctx.arc(-size * 0.05, -size * 0.35, size * 0.03, 0, Math.PI * 2);
  ctx.arc(size * 0.05, -size * 0.35, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // 火焰法杖
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(size * 0.3, -size * 0.5);
  ctx.lineTo(size * 0.3, size * 0.4);
  ctx.stroke();

  // 法杖顶部火焰
  const fireIntensity = isAttacking ? 1.0 : Math.max(0, Math.sin(t * 0.8) * 0.4 + 0.5);
  ctx.save();
  ctx.translate(size * 0.3, -size * 0.55);
  ctx.fillStyle = `rgba(255, 69, 0, ${fireIntensity * 0.8})`;
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, 0);
  ctx.quadraticCurveTo(-size * 0.12, -size * 0.12 * fireIntensity, -size * 0.04, -size * 0.2 * fireIntensity);
  ctx.quadraticCurveTo(0, -size * 0.25 * fireIntensity, size * 0.04, -size * 0.2 * fireIntensity);
  ctx.quadraticCurveTo(size * 0.12, -size * 0.12 * fireIntensity, size * 0.08, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = `rgba(255, 200, 50, ${fireIntensity})`;
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, 0);
  ctx.quadraticCurveTo(-size * 0.05, -size * 0.06 * fireIntensity, 0, -size * 0.12 * fireIntensity);
  ctx.quadraticCurveTo(size * 0.05, -size * 0.06 * fireIntensity, size * 0.04, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 火焰粒子
  for (let i = 0; i < 5; i++) {
    const px = Math.sin(t * 2 + i * 1.5) * size * 0.2;
    const py = Math.cos(t * 1.5 + i * 2) * size * 0.15 - size * 0.1;
    const pAlpha = Math.max(0, Math.sin(t * 3 + i * 2.5) * 0.5 + 0.3);
    ctx.fillStyle = `rgba(255, 100, 0, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHpBar(ctx, size * 0.4, hpPercent, -size * 0.7);
}

/** 冰霜女巫 - 冰蓝色长裙，冰晶法杖，冰冠，雪花环绕 */
export function drawIceWitch(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, _detailColor: string, _weaponColor: string, hpPercent: number, _isAttacking: boolean): void {
  void _isAttacking;
  const t = Date.now() / 200;

  // 冰蓝色长裙
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.2);
  ctx.quadraticCurveTo(-size * 0.25, size * 0.2, -size * 0.35, size * 0.5);
  ctx.lineTo(size * 0.35, size * 0.5);
  ctx.quadraticCurveTo(size * 0.25, size * 0.2, size * 0.2, -size * 0.2);
  ctx.closePath();
  ctx.fill();

  // 裙摆冰晶纹
  ctx.strokeStyle = '#E0FFFF';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const xx = -size * 0.2 + i * size * 0.13;
    ctx.beginPath();
    ctx.moveTo(xx, size * 0.35);
    ctx.lineTo(xx + size * 0.05, size * 0.45);
    ctx.lineTo(xx - size * 0.05, size * 0.45);
    ctx.closePath();
    ctx.stroke();
  }

  // 头
  ctx.fillStyle = '#F0F8FF';
  ctx.beginPath();
  ctx.arc(0, -size * 0.35, size * 0.16, 0, Math.PI * 2);
  ctx.fill();

  // 冰蓝色长发
  ctx.fillStyle = '#87CEEB';
  ctx.beginPath();
  ctx.arc(0, -size * 0.4, size * 0.18, Math.PI * 0.9, Math.PI * 0.1, true);
  ctx.fill();
  ctx.fillRect(-size * 0.18, -size * 0.35, size * 0.06, size * 0.35);
  ctx.fillRect(size * 0.12, -size * 0.35, size * 0.06, size * 0.35);

  // 冰冠
  ctx.fillStyle = '#E0FFFF';
  ctx.beginPath();
  ctx.moveTo(-size * 0.12, -size * 0.5);
  ctx.lineTo(-size * 0.08, -size * 0.65);
  ctx.lineTo(-size * 0.04, -size * 0.52);
  ctx.lineTo(0, -size * 0.68);
  ctx.lineTo(size * 0.04, -size * 0.52);
  ctx.lineTo(size * 0.08, -size * 0.65);
  ctx.lineTo(size * 0.12, -size * 0.5);
  ctx.closePath();
  ctx.fill();

  // 冰蓝眼睛
  ctx.fillStyle = '#00BFFF';
  ctx.beginPath();
  ctx.ellipse(-size * 0.05, -size * 0.35, size * 0.04, size * 0.05, 0, 0, Math.PI * 2);
  ctx.ellipse(size * 0.05, -size * 0.35, size * 0.04, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000080';
  ctx.beginPath();
  ctx.arc(-size * 0.05, -size * 0.35, size * 0.02, 0, Math.PI * 2);
  ctx.arc(size * 0.05, -size * 0.35, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // 冰晶法杖
  ctx.strokeStyle = '#B0E0E6';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-size * 0.3, -size * 0.5);
  ctx.lineTo(-size * 0.3, size * 0.4);
  ctx.stroke();

  // 法杖顶部冰晶
  ctx.fillStyle = '#E0FFFF';
  ctx.beginPath();
  ctx.moveTo(-size * 0.3, -size * 0.55);
  ctx.lineTo(-size * 0.38, -size * 0.65);
  ctx.lineTo(-size * 0.3, -size * 0.75);
  ctx.lineTo(-size * 0.22, -size * 0.65);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#87CEEB';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size * 0.3, -size * 0.55);
  ctx.lineTo(-size * 0.3, -size * 0.75);
  ctx.moveTo(-size * 0.38, -size * 0.65);
  ctx.lineTo(-size * 0.22, -size * 0.65);
  ctx.stroke();

  // 雪花粒子
  for (let i = 0; i < 6; i++) {
    const sx = Math.sin(t * 1.5 + i * 1.2) * size * 0.25;
    const sy = Math.cos(t * 1.2 + i * 1.8) * size * 0.2 - size * 0.1;
    const sAlpha = Math.max(0, Math.sin(t * 2 + i * 2) * 0.4 + 0.5);
    ctx.fillStyle = `rgba(224, 255, 255, ${sAlpha})`;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(t + i);
    for (let j = 0; j < 6; j++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -size * 0.03);
      ctx.stroke();
      ctx.rotate(Math.PI / 3);
    }
    ctx.restore();
  }

  drawHpBar(ctx, size * 0.4, hpPercent, -size * 0.8);
}

/** 瘟疫投手 - 绿色破烂斗篷，投石索，毒气罐，防毒面具 */
export function drawPlagueThrower(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  const t = Date.now() / 200;
  const walk = Math.sin(Date.now() / 120) * 2;

  // 破烂身体
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.25, -size * 0.2);
  ctx.lineTo(-size * 0.28, size * 0.45);
  ctx.lineTo(size * 0.28, size * 0.45);
  ctx.lineTo(size * 0.25, -size * 0.2);
  ctx.closePath();
  ctx.fill();

  // 破洞
  ctx.fillStyle = '#2F4F2F';
  ctx.beginPath();
  ctx.ellipse(-size * 0.1, size * 0.1, size * 0.06, size * 0.08, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.12, size * 0.25, size * 0.05, size * 0.06, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // 头
  ctx.fillStyle = '#8FBC8F';
  ctx.beginPath();
  ctx.arc(0, -size * 0.35, size * 0.17, 0, Math.PI * 2);
  ctx.fill();

  // 防毒面具
  ctx.fillStyle = '#556B2F';
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.3, size * 0.14, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#333333';
  ctx.beginPath();
  ctx.arc(-size * 0.06, -size * 0.35, size * 0.05, 0, Math.PI * 2);
  ctx.arc(size * 0.06, -size * 0.35, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#90EE90';
  ctx.beginPath();
  ctx.arc(-size * 0.06, -size * 0.35, size * 0.025, 0, Math.PI * 2);
  ctx.arc(size * 0.06, -size * 0.35, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#444444';
  ctx.beginPath();
  ctx.arc(0, -size * 0.22, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(0, -size * 0.22, size * 0.02 + i * size * 0.015, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 投石索
  const slingAngle = isAttacking ? Math.sin(Date.now() / 30) * 0.8 : Math.sin(t * 0.5) * 0.2;
  ctx.save();
  ctx.translate(size * 0.3, -size * 0.1);
  ctx.rotate(slingAngle);
  ctx.strokeStyle = '#8B7355';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.15, -size * 0.1, size * 0.25, -size * 0.05);
  ctx.stroke();
  ctx.fillStyle = weaponColor;
  ctx.beginPath();
  ctx.arc(size * 0.25, -size * 0.05, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(size * 0.25, -size * 0.11);
  ctx.lineTo(size * 0.25, size * 0.01);
  ctx.moveTo(size * 0.19, -size * 0.05);
  ctx.lineTo(size * 0.31, -size * 0.05);
  ctx.stroke();
  ctx.restore();

  // 毒气罐
  ctx.fillStyle = '#556B2F';
  ctx.fillRect(-size * 0.35, size * 0.05, size * 0.12, size * 0.18);
  ctx.fillStyle = '#9ACD32';
  ctx.fillRect(-size * 0.33, size * 0.07, size * 0.08, size * 0.06);
  ctx.fillStyle = '#333333';
  ctx.beginPath();
  ctx.arc(-size * 0.29, size * 0.03, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // 毒雾粒子
  for (let i = 0; i < 5; i++) {
    const px = Math.sin(t * 1.2 + i * 1.5) * size * 0.2;
    const py = Math.cos(t * 0.8 + i * 2) * size * 0.15 + size * 0.1;
    const pAlpha = Math.max(0, Math.sin(t * 2 + i * 2.5) * 0.3 + 0.4);
    ctx.fillStyle = `rgba(100, 200, 50, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.04, 0, Math.PI * 2);
    ctx.fill();
  }

  // 腿
  ctx.fillStyle = detailColor;
  ctx.fillRect(-size * 0.12, size * 0.4 + walk, size * 0.08, size * 0.15);
  ctx.fillRect(size * 0.04, size * 0.4 - walk, size * 0.08, size * 0.15);

  drawHpBar(ctx, size * 0.4, hpPercent, -size * 0.6 + walk);
}

/** 雷电法师 - 紫色长袍，闪电法杖，尖顶帽，电弧环绕 */
export function drawThunderMage(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, _weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  const t = Date.now() / 200;

  // 紫色长袍
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.22, -size * 0.2);
  ctx.lineTo(-size * 0.28, size * 0.5);
  ctx.lineTo(size * 0.28, size * 0.5);
  ctx.lineTo(size * 0.22, -size * 0.2);
  ctx.closePath();
  ctx.fill();

  // 闪电纹饰
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, -size * 0.1);
  ctx.lineTo(size * 0.05, size * 0.05);
  ctx.lineTo(-size * 0.02, size * 0.05);
  ctx.lineTo(size * 0.08, size * 0.2);
  ctx.stroke();

  // 头
  ctx.fillStyle = '#D2B48C';
  ctx.beginPath();
  ctx.arc(0, -size * 0.35, size * 0.16, 0, Math.PI * 2);
  ctx.fill();

  // 尖顶帽
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.4);
  ctx.lineTo(-size * 0.05, -size * 0.7);
  ctx.lineTo(size * 0.05, -size * 0.7);
  ctx.lineTo(size * 0.2, -size * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.moveTo(-size * 0.22, -size * 0.4);
  ctx.lineTo(size * 0.22, -size * 0.4);
  ctx.lineTo(size * 0.2, -size * 0.35);
  ctx.lineTo(-size * 0.2, -size * 0.35);
  ctx.closePath();
  ctx.fill();

  // 眼睛
  ctx.fillStyle = '#9370DB';
  ctx.beginPath();
  ctx.arc(-size * 0.05, -size * 0.35, size * 0.03, 0, Math.PI * 2);
  ctx.arc(size * 0.05, -size * 0.35, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(-size * 0.05, -size * 0.35, size * 0.015, 0, Math.PI * 2);
  ctx.arc(size * 0.05, -size * 0.35, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // 闪电法杖
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(size * 0.3, -size * 0.5);
  ctx.lineTo(size * 0.3, size * 0.4);
  ctx.stroke();

  // 法杖顶部闪电球
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(size * 0.3, -size * 0.55, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFF00';
  ctx.beginPath();
  ctx.arc(size * 0.3, -size * 0.55, size * 0.05, 0, Math.PI * 2);
  ctx.fill();

  // 电弧
  const arcIntensity = isAttacking ? 1.0 : Math.max(0, Math.sin(t * 1.5) * 0.5 + 0.3);
  if (arcIntensity > 0.2) {
    ctx.strokeStyle = `rgba(255, 255, 0, ${arcIntensity})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + t;
      const r1 = size * 0.1;
      const r2 = size * 0.18;
      ctx.beginPath();
      ctx.moveTo(size * 0.3 + Math.cos(angle) * r1, -size * 0.55 + Math.sin(angle) * r1);
      ctx.lineTo(size * 0.3 + Math.cos(angle + 0.3) * r2, -size * 0.55 + Math.sin(angle + 0.3) * r2);
      ctx.stroke();
    }
  }

  // 闪电粒子
  for (let i = 0; i < 4; i++) {
    const px = Math.sin(t * 2 + i * 1.8) * size * 0.25;
    const py = Math.cos(t * 1.5 + i * 2.2) * size * 0.2 - size * 0.1;
    const pAlpha = Math.max(0, Math.sin(t * 3 + i * 2.8) * 0.4 + 0.5);
    ctx.fillStyle = `rgba(255, 255, 0, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHpBar(ctx, size * 0.4, hpPercent, -size * 0.75);
}

function drawHpBar(ctx: CanvasRenderingContext2D, width: number, hpPercent: number, y: number): void {
  ctx.fillStyle = '#333333';
  ctx.fillRect(-width / 2, y, width, 4);
  const hpColor = hpPercent > 0.6 ? '#4CAF50' : hpPercent > 0.3 ? '#FF9800' : '#F44336';
  ctx.fillStyle = hpColor;
  ctx.fillRect(-width / 2, y, width * hpPercent, 4);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.strokeRect(-width / 2, y, width, 4);
}
