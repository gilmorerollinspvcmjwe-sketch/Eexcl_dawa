/* 空中/特殊兵种绘制：狮鹫骑士、蝙蝠群、幼龙（子agent详细设计版） */

/** 狮鹫骑士：鹰头狮身坐骑 + 骑士 + 展开翅膀 */
export function drawGriffinKnight(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  const t = Date.now() / 200;
  const wingFlap = Math.sin(t) * 0.15;
  const hoverY = Math.sin(Date.now() / 300) * 3;

  ctx.save();
  ctx.translate(0, hoverY);

  // 左翼
  ctx.save();
  ctx.rotate(wingFlap);
  ctx.fillStyle = '#F5DEB3';
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, -size * 0.15);
  ctx.quadraticCurveTo(-size * 0.5, -size * 0.55, -size * 0.65, -size * 0.25);
  ctx.quadraticCurveTo(-size * 0.55, -size * 0.15, -size * 0.45, -size * 0.05);
  ctx.quadraticCurveTo(-size * 0.3, 0, -size * 0.1, size * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#D2B48C';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.15 - i * 0.08 * size, -size * 0.1 + i * 0.03 * size);
    ctx.lineTo(-size * 0.35 - i * 0.06 * size, -size * 0.3 + i * 0.05 * size);
    ctx.stroke();
  }
  ctx.restore();

  // 右翼
  ctx.save();
  ctx.rotate(-wingFlap);
  ctx.fillStyle = '#F5DEB3';
  ctx.beginPath();
  ctx.moveTo(size * 0.1, -size * 0.15);
  ctx.quadraticCurveTo(size * 0.5, -size * 0.55, size * 0.65, -size * 0.25);
  ctx.quadraticCurveTo(size * 0.55, -size * 0.15, size * 0.45, -size * 0.05);
  ctx.quadraticCurveTo(size * 0.3, 0, size * 0.1, size * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#D2B48C';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(size * 0.15 + i * 0.08 * size, -size * 0.1 + i * 0.03 * size);
    ctx.lineTo(size * 0.35 + i * 0.06 * size, -size * 0.3 + i * 0.05 * size);
    ctx.stroke();
  }
  ctx.restore();

  // 狮鹫身体
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.1, size * 0.28, size * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.15, size * 0.18, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // 狮鹫后腿
  ctx.fillStyle = detailColor;
  const legAnim = Math.sin(Date.now() / 150) * 4;
  ctx.beginPath();
  ctx.ellipse(-size * 0.12, size * 0.35 + legAnim, size * 0.06, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.12, size * 0.35 - legAnim, size * 0.06, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8B7355';
  ctx.beginPath();
  ctx.arc(-size * 0.12, size * 0.45 + legAnim, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.12, size * 0.45 - legAnim, size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // 狮鹫鹰头
  ctx.fillStyle = '#F5DEB3';
  ctx.beginPath();
  ctx.arc(-size * 0.22, -size * 0.15, size * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#DAA520';
  ctx.beginPath();
  ctx.moveTo(-size * 0.34, -size * 0.15);
  ctx.lineTo(-size * 0.42, -size * 0.1);
  ctx.lineTo(-size * 0.34, -size * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(-size * 0.26, -size * 0.18, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(-size * 0.26, -size * 0.18, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // 骑士
  ctx.fillStyle = '#4A90D9';
  ctx.beginPath();
  ctx.ellipse(size * 0.05, -size * 0.15, size * 0.12, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#C0C0C0';
  ctx.beginPath();
  ctx.arc(size * 0.05, -size * 0.35, size * 0.1, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(size * 0.05, -size * 0.4, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(size * 0.02, -size * 0.34, size * 0.03, 0, Math.PI * 2);
  ctx.arc(size * 0.08, -size * 0.34, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(size * 0.02, -size * 0.34, size * 0.015, 0, Math.PI * 2);
  ctx.arc(size * 0.08, -size * 0.34, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // 骑士的剑
  const swordAngle = isAttacking ? Math.sin(Date.now() / 40) * 0.5 : 0;
  ctx.save();
  ctx.translate(size * 0.18, -size * 0.1);
  ctx.rotate(swordAngle - 0.3);
  ctx.strokeStyle = weaponColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.25, -size * 0.3);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#8B7355';
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, size * 0.02);
  ctx.lineTo(size * 0.03, size * 0.02);
  ctx.stroke();
  ctx.restore();

  // 狮鹫尾巴
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(size * 0.25, size * 0.1);
  ctx.quadraticCurveTo(size * 0.4, size * 0.2 + Math.sin(t * 1.5) * 5, size * 0.35, size * 0.35);
  ctx.stroke();

  ctx.restore();
  drawHpBar(ctx, size * 0.5, hpPercent, -size * 0.5 + hoverY);
}

/** 蝙蝠群：5只蝙蝠各自独立飞行动画 */
export function drawBatSwarm(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, _weaponColor: string, hpPercent: number, _isAttacking: boolean): void {
  void _isAttacking;
  const t = Date.now() / 100;

  const bats = [
    { dx: 0, dy: 0, phase: 0, scale: 1.0 },
    { dx: -size * 0.3, dy: -size * 0.15, phase: 1.2, scale: 0.85 },
    { dx: size * 0.35, dy: -size * 0.1, phase: 2.4, scale: 0.9 },
    { dx: -size * 0.15, dy: size * 0.2, phase: 0.8, scale: 0.75 },
    { dx: size * 0.2, dy: size * 0.25, phase: 3.0, scale: 0.8 },
  ];

  for (const bat of bats) {
    ctx.save();
    const bx = bat.dx + Math.sin(t + bat.phase) * 3;
    const by = bat.dy + Math.cos(t * 1.3 + bat.phase) * 2;
    ctx.translate(bx, by);
    ctx.scale(bat.scale, bat.scale);

    const wingAngle = Math.sin(t * 2 + bat.phase) * 0.4;

    // 蝙蝠身体
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.08, size * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // 左翅膀
    ctx.save();
    ctx.rotate(wingAngle);
    ctx.fillStyle = detailColor;
    ctx.beginPath();
    ctx.moveTo(-size * 0.05, -size * 0.02);
    ctx.quadraticCurveTo(-size * 0.2, -size * 0.15, -size * 0.25, -size * 0.05);
    ctx.quadraticCurveTo(-size * 0.18, 0, -size * 0.15, size * 0.02);
    ctx.quadraticCurveTo(-size * 0.1, size * 0.05, -size * 0.05, size * 0.02);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 右翅膀
    ctx.save();
    ctx.rotate(-wingAngle);
    ctx.fillStyle = detailColor;
    ctx.beginPath();
    ctx.moveTo(size * 0.05, -size * 0.02);
    ctx.quadraticCurveTo(size * 0.2, -size * 0.15, size * 0.25, -size * 0.05);
    ctx.quadraticCurveTo(size * 0.18, 0, size * 0.15, size * 0.02);
    ctx.quadraticCurveTo(size * 0.1, size * 0.05, size * 0.05, size * 0.02);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 蝙蝠眼睛
    ctx.fillStyle = '#FF4444';
    ctx.beginPath();
    ctx.arc(-size * 0.025, -size * 0.04, size * 0.015, 0, Math.PI * 2);
    ctx.arc(size * 0.025, -size * 0.04, size * 0.015, 0, Math.PI * 2);
    ctx.fill();

    // 蝙蝠耳朵
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(-size * 0.04, -size * 0.08);
    ctx.lineTo(-size * 0.06, -size * 0.14);
    ctx.lineTo(-size * 0.02, -size * 0.09);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(size * 0.04, -size * 0.08);
    ctx.lineTo(size * 0.06, -size * 0.14);
    ctx.lineTo(size * 0.02, -size * 0.09);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawHpBar(ctx, size * 0.4, hpPercent, -size * 0.35);
}

/** 幼龙：小型龙，翅膀+尾巴+小火苗 */
export function drawYoungDragon(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, _weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  const t = Date.now() / 200;
  const hoverY = Math.sin(Date.now() / 250) * 2;

  ctx.save();
  ctx.translate(0, hoverY);

  // 翅膀（较小，体现幼年）
  const wingFlap = Math.sin(t * 1.5) * 0.2;
  ctx.save();
  ctx.rotate(wingFlap);
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, -size * 0.1);
  ctx.quadraticCurveTo(-size * 0.35, -size * 0.35, -size * 0.4, -size * 0.15);
  ctx.quadraticCurveTo(-size * 0.3, -size * 0.05, -size * 0.15, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#AA0000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, -size * 0.08);
  ctx.lineTo(-size * 0.3, -size * 0.2);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.rotate(-wingFlap);
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.moveTo(size * 0.08, -size * 0.1);
  ctx.quadraticCurveTo(size * 0.35, -size * 0.35, size * 0.4, -size * 0.15);
  ctx.quadraticCurveTo(size * 0.3, -size * 0.05, size * 0.15, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#AA0000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(size * 0.1, -size * 0.08);
  ctx.lineTo(size * 0.3, -size * 0.2);
  ctx.stroke();
  ctx.restore();

  // 龙身体
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.05, size * 0.18, size * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FF8C69';
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.1, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // 龙尾巴
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  const tailWag = Math.sin(t * 2) * 8;
  ctx.beginPath();
  ctx.moveTo(size * 0.15, size * 0.15);
  ctx.quadraticCurveTo(size * 0.3, size * 0.25 + tailWag, size * 0.35, size * 0.35 + tailWag);
  ctx.stroke();
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.moveTo(size * 0.35, size * 0.35 + tailWag);
  ctx.lineTo(size * 0.42, size * 0.3 + tailWag);
  ctx.lineTo(size * 0.38, size * 0.42 + tailWag);
  ctx.closePath();
  ctx.fill();

  // 龙头
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.25, size * 0.15, size * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();

  // 龙角
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, -size * 0.35);
  ctx.lineTo(-size * 0.12, -size * 0.45);
  ctx.lineTo(-size * 0.04, -size * 0.36);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.08, -size * 0.35);
  ctx.lineTo(size * 0.12, -size * 0.45);
  ctx.lineTo(size * 0.04, -size * 0.36);
  ctx.closePath();
  ctx.fill();

  // 龙眼
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.ellipse(-size * 0.06, -size * 0.27, size * 0.04, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.06, -size * 0.27, size * 0.04, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(-size * 0.06, -size * 0.27, size * 0.015, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.06, -size * 0.27, size * 0.015, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();

  // 龙嘴
  ctx.fillStyle = '#8B0000';
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.18, size * 0.06, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();

  // 小火苗
  const fireIntensity = isAttacking ? 1.0 : Math.max(0, Math.sin(t * 0.7) * 0.5 + 0.3);
  if (fireIntensity > 0.2) {
    ctx.save();
    ctx.translate(0, -size * 0.15);
    ctx.fillStyle = `rgba(255, 100, 0, ${fireIntensity * 0.6})`;
    ctx.beginPath();
    ctx.moveTo(-size * 0.08, 0);
    ctx.quadraticCurveTo(-size * 0.15, -size * 0.1 * fireIntensity, -size * 0.05, -size * 0.18 * fireIntensity);
    ctx.quadraticCurveTo(0, -size * 0.22 * fireIntensity, size * 0.05, -size * 0.18 * fireIntensity);
    ctx.quadraticCurveTo(size * 0.15, -size * 0.1 * fireIntensity, size * 0.08, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(255, 220, 50, ${fireIntensity * 0.8})`;
    ctx.beginPath();
    ctx.moveTo(-size * 0.04, 0);
    ctx.quadraticCurveTo(-size * 0.06, -size * 0.06 * fireIntensity, 0, -size * 0.12 * fireIntensity);
    ctx.quadraticCurveTo(size * 0.06, -size * 0.06 * fireIntensity, size * 0.04, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 小龙腿
  ctx.fillStyle = detailColor;
  const legAnim = Math.sin(Date.now() / 120) * 3;
  ctx.beginPath();
  ctx.ellipse(-size * 0.08, size * 0.28 + legAnim, size * 0.05, size * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.08, size * 0.28 - legAnim, size * 0.05, size * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  drawHpBar(ctx, size * 0.4, hpPercent, -size * 0.45 + hoverY);
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
