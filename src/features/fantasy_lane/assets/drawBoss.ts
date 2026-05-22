/* 高费终结兵种绘制：树人古卫、食人魔领主、火龙（子agent详细设计版） */

/** 树人古卫：巨大树人，树枝手臂，树根腿，苔藓 */
export function drawTreeAncient(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  const t = Date.now() / 300;
  const sway = Math.sin(t) * 2;

  // 树根腿
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.15, size * 0.3);
  ctx.quadraticCurveTo(-size * 0.25, size * 0.4, -size * 0.3, size * 0.45);
  ctx.quadraticCurveTo(-size * 0.2, size * 0.42, -size * 0.1, size * 0.38);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.15, size * 0.3);
  ctx.quadraticCurveTo(size * 0.25, size * 0.4, size * 0.3, size * 0.45);
  ctx.quadraticCurveTo(size * 0.2, size * 0.42, size * 0.1, size * 0.38);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = detailColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, size * 0.35);
  ctx.quadraticCurveTo(-size * 0.18, size * 0.42, -size * 0.22, size * 0.48);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.1, size * 0.35);
  ctx.quadraticCurveTo(size * 0.18, size * 0.42, size * 0.22, size * 0.48);
  ctx.stroke();

  // 树干身体
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, size * 0.35);
  ctx.quadraticCurveTo(-size * 0.25, 0, -size * 0.18, -size * 0.2);
  ctx.quadraticCurveTo(0, -size * 0.28, size * 0.18, -size * 0.2);
  ctx.quadraticCurveTo(size * 0.25, 0, size * 0.2, size * 0.35);
  ctx.closePath();
  ctx.fill();

  // 树皮纹理
  ctx.strokeStyle = detailColor;
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const yy = -size * 0.15 + i * size * 0.1;
    ctx.beginPath();
    ctx.moveTo(-size * 0.12, yy);
    ctx.quadraticCurveTo(0, yy + 3, size * 0.12, yy);
    ctx.stroke();
  }

  // 苔藓
  ctx.fillStyle = '#228B22';
  ctx.beginPath();
  ctx.ellipse(-size * 0.12, size * 0.05, size * 0.08, size * 0.06, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.1, size * 0.15, size * 0.06, size * 0.05, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-size * 0.05, size * 0.25, size * 0.07, size * 0.04, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#32CD32';
  ctx.beginPath();
  ctx.ellipse(size * 0.15, -size * 0.05, size * 0.05, size * 0.04, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // 树枝手臂
  const armSwing = isAttacking ? Math.sin(Date.now() / 60) * 0.4 : Math.sin(t * 0.8) * 0.1;
  ctx.save();
  ctx.translate(-size * 0.18, -size * 0.05);
  ctx.rotate(-0.3 + armSwing);
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.15, -size * 0.1, -size * 0.25, -size * 0.05);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-size * 0.15, -size * 0.08);
  ctx.lineTo(-size * 0.2, -size * 0.18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.06);
  ctx.lineTo(-size * 0.28, -size * 0.12);
  ctx.stroke();
  ctx.fillStyle = weaponColor;
  ctx.beginPath();
  ctx.ellipse(-size * 0.2, -size * 0.18, size * 0.04, size * 0.02, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-size * 0.28, -size * 0.12, size * 0.03, size * 0.02, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(size * 0.18, -size * 0.05);
  ctx.rotate(0.3 - armSwing);
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.15, -size * 0.1, size * 0.25, -size * 0.05);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(size * 0.15, -size * 0.08);
  ctx.lineTo(size * 0.2, -size * 0.18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.2, -size * 0.06);
  ctx.lineTo(size * 0.28, -size * 0.12);
  ctx.stroke();
  ctx.fillStyle = weaponColor;
  ctx.beginPath();
  ctx.ellipse(size * 0.2, -size * 0.18, size * 0.04, size * 0.02, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.28, -size * 0.12, size * 0.03, size * 0.02, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 树冠头部
  ctx.save();
  ctx.translate(sway, 0);
  ctx.fillStyle = '#228B22';
  ctx.beginPath();
  ctx.arc(0, -size * 0.3, size * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2E8B57';
  ctx.beginPath();
  ctx.arc(-size * 0.08, -size * 0.35, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.1, -size * 0.28, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#32CD32';
  ctx.beginPath();
  ctx.arc(size * 0.05, -size * 0.38, size * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // 树脸
  ctx.fillStyle = '#3B2F2F';
  ctx.beginPath();
  ctx.ellipse(-size * 0.06, -size * 0.3, size * 0.035, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.06, -size * 0.3, size * 0.035, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#90EE90';
  ctx.beginPath();
  ctx.arc(-size * 0.06, -size * 0.3, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.06, -size * 0.3, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3B2F2F';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -size * 0.22, size * 0.06, 0.1, Math.PI - 0.1);
  ctx.stroke();
  ctx.restore();

  drawHpBar(ctx, size * 0.5, hpPercent, -size * 0.55);
}

/** 食人魔领主：超大体型，双头，巨大骨棒，兽皮+骨头护甲 */
export function drawOgreLord(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, _weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  const t = Date.now() / 200;
  const stomp = Math.sin(Date.now() / 150) * 3;

  // 粗壮双腿
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.ellipse(-size * 0.15, size * 0.35 + stomp, size * 0.12, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.15, size * 0.35 - stomp, size * 0.12, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#654321';
  ctx.beginPath();
  ctx.ellipse(-size * 0.18, size * 0.48 + stomp, size * 0.1, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.18, size * 0.48 - stomp, size * 0.1, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();

  // 巨大身体
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.05, size * 0.28, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // 兽皮护甲
  ctx.fillStyle = '#A0522D';
  ctx.beginPath();
  ctx.moveTo(-size * 0.22, -size * 0.05);
  ctx.quadraticCurveTo(-size * 0.25, size * 0.15, -size * 0.18, size * 0.25);
  ctx.lineTo(size * 0.18, size * 0.25);
  ctx.quadraticCurveTo(size * 0.25, size * 0.15, size * 0.22, -size * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#8B6914';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.15, size * 0.02 + i * size * 0.08);
    ctx.lineTo(size * 0.15, size * 0.02 + i * size * 0.08);
    ctx.stroke();
  }

  // 骨头护甲
  ctx.fillStyle = '#F5F5DC';
  ctx.beginPath();
  ctx.moveTo(-size * 0.25, -size * 0.1);
  ctx.quadraticCurveTo(-size * 0.35, -size * 0.15, -size * 0.3, -size * 0.02);
  ctx.quadraticCurveTo(-size * 0.28, size * 0.05, -size * 0.22, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#D2B48C';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size * 0.28, -size * 0.08);
  ctx.lineTo(-size * 0.24, size * 0.02);
  ctx.stroke();
  ctx.fillStyle = '#F5F5DC';
  ctx.beginPath();
  ctx.moveTo(size * 0.25, -size * 0.1);
  ctx.quadraticCurveTo(size * 0.35, -size * 0.15, size * 0.3, -size * 0.02);
  ctx.quadraticCurveTo(size * 0.28, size * 0.05, size * 0.22, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#D2B48C';
  ctx.beginPath();
  ctx.moveTo(size * 0.28, -size * 0.08);
  ctx.lineTo(size * 0.24, size * 0.02);
  ctx.stroke();

  // 左头（主头）
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(-size * 0.1, -size * 0.3, size * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(-size * 0.1, -size * 0.32, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FF0000';
  ctx.beginPath();
  ctx.arc(-size * 0.1, -size * 0.32, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8B0000';
  ctx.beginPath();
  ctx.ellipse(-size * 0.1, -size * 0.22, size * 0.06, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFF0';
  ctx.beginPath();
  ctx.moveTo(-size * 0.14, -size * 0.22);
  ctx.lineTo(-size * 0.13, -size * 0.17);
  ctx.lineTo(-size * 0.12, -size * 0.22);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, -size * 0.22);
  ctx.lineTo(-size * 0.07, -size * 0.17);
  ctx.lineTo(-size * 0.08, -size * 0.22);
  ctx.closePath();
  ctx.fill();

  // 右头（副头）
  ctx.fillStyle = '#7A3B10';
  ctx.beginPath();
  ctx.arc(size * 0.12, -size * 0.28, size * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(size * 0.12, -size * 0.3, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FF0000';
  ctx.beginPath();
  ctx.arc(size * 0.12, -size * 0.3, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8B0000';
  ctx.beginPath();
  ctx.ellipse(size * 0.12, -size * 0.22, size * 0.05, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFF0';
  ctx.beginPath();
  ctx.moveTo(size * 0.09, -size * 0.22);
  ctx.lineTo(size * 0.085, -size * 0.18);
  ctx.lineTo(size * 0.095, -size * 0.22);
  ctx.closePath();
  ctx.fill();

  // 粗壮手臂
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(-size * 0.3, size * 0.05, size * 0.08, size * 0.18, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.3, size * 0.05, size * 0.08, size * 0.18, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // 巨大骨棒
  const clubSwing = isAttacking ? Math.sin(Date.now() / 50) * 0.5 : Math.sin(t * 0.5) * 0.1;
  ctx.save();
  ctx.translate(size * 0.35, size * 0.05);
  ctx.rotate(clubSwing - 0.4);
  ctx.strokeStyle = '#D2B48C';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.05, -size * 0.4);
  ctx.stroke();
  ctx.fillStyle = '#F5F5DC';
  ctx.beginPath();
  ctx.ellipse(size * 0.05, -size * 0.45, size * 0.1, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.05 - size * 0.1, -size * 0.45, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.05 + size * 0.1, -size * 0.45, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8B0000';
  ctx.beginPath();
  ctx.arc(size * 0.08, -size * 0.42, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  drawHpBar(ctx, size * 0.6, hpPercent, -size * 0.5);
}

/** 火龙：巨型龙，大翅膀，长尾巴，口中喷火 */
export function drawFireDragon(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, _weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  const t = Date.now() / 200;
  const hoverY = Math.sin(Date.now() / 300) * 4;

  ctx.save();
  ctx.translate(0, hoverY);

  // 巨大翅膀
  const wingFlap = Math.sin(t) * 0.12;
  ctx.save();
  ctx.rotate(wingFlap);
  ctx.strokeStyle = detailColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, -size * 0.1);
  ctx.quadraticCurveTo(-size * 0.3, -size * 0.5, -size * 0.55, -size * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, -size * 0.05);
  ctx.quadraticCurveTo(-size * 0.25, -size * 0.35, -size * 0.5, -size * 0.15);
  ctx.stroke();
  ctx.fillStyle = 'rgba(139, 0, 0, 0.7)';
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, -size * 0.1);
  ctx.quadraticCurveTo(-size * 0.3, -size * 0.5, -size * 0.55, -size * 0.3);
  ctx.quadraticCurveTo(-size * 0.45, -size * 0.15, -size * 0.35, -size * 0.05);
  ctx.quadraticCurveTo(-size * 0.2, 0, -size * 0.08, size * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(204, 55, 0, 0.5)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.1, -size * 0.08);
    ctx.lineTo(-size * 0.2 - i * 0.1 * size, -size * 0.2 - i * 0.08 * size);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.rotate(-wingFlap);
  ctx.strokeStyle = detailColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(size * 0.08, -size * 0.1);
  ctx.quadraticCurveTo(size * 0.3, -size * 0.5, size * 0.55, -size * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.08, -size * 0.05);
  ctx.quadraticCurveTo(size * 0.25, -size * 0.35, size * 0.5, -size * 0.15);
  ctx.stroke();
  ctx.fillStyle = 'rgba(139, 0, 0, 0.7)';
  ctx.beginPath();
  ctx.moveTo(size * 0.08, -size * 0.1);
  ctx.quadraticCurveTo(size * 0.3, -size * 0.5, size * 0.55, -size * 0.3);
  ctx.quadraticCurveTo(size * 0.45, -size * 0.15, size * 0.35, -size * 0.05);
  ctx.quadraticCurveTo(size * 0.2, 0, size * 0.08, size * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(204, 55, 0, 0.5)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(size * 0.1, -size * 0.08);
    ctx.lineTo(size * 0.2 + i * 0.1 * size, -size * 0.2 - i * 0.08 * size);
    ctx.stroke();
  }
  ctx.restore();

  // 龙身体
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.05, size * 0.22, size * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FF6347';
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.12, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = detailColor;
  ctx.lineWidth = 1;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      const sx = -size * 0.08 + col * size * 0.08;
      const sy = -size * 0.05 + row * size * 0.1;
      ctx.beginPath();
      ctx.arc(sx, sy, size * 0.03, 0, Math.PI, true);
      ctx.stroke();
    }
  }

  // 长尾巴
  const tailWag = Math.sin(t * 1.5) * 12;
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(size * 0.18, size * 0.2);
  ctx.quadraticCurveTo(size * 0.35, size * 0.3 + tailWag, size * 0.45, size * 0.45 + tailWag);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(size * 0.45, size * 0.45 + tailWag);
  ctx.quadraticCurveTo(size * 0.5, size * 0.5 + tailWag, size * 0.55, size * 0.55 + tailWag);
  ctx.stroke();
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.moveTo(size * 0.55, size * 0.55 + tailWag);
  ctx.lineTo(size * 0.62, size * 0.48 + tailWag);
  ctx.lineTo(size * 0.58, size * 0.6 + tailWag);
  ctx.closePath();
  ctx.fill();

  // 龙头
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.3, size * 0.18, size * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  // 龙角
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, -size * 0.42);
  ctx.quadraticCurveTo(-size * 0.18, -size * 0.55, -size * 0.12, -size * 0.58);
  ctx.quadraticCurveTo(-size * 0.08, -size * 0.52, -size * 0.06, -size * 0.44);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.1, -size * 0.42);
  ctx.quadraticCurveTo(size * 0.18, -size * 0.55, size * 0.12, -size * 0.58);
  ctx.quadraticCurveTo(size * 0.08, -size * 0.52, size * 0.06, -size * 0.44);
  ctx.closePath();
  ctx.fill();

  // 龙眼
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.ellipse(-size * 0.07, -size * 0.33, size * 0.05, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.07, -size * 0.33, size * 0.05, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(-size * 0.07, -size * 0.33, size * 0.02, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.07, -size * 0.33, size * 0.02, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();

  // 龙嘴
  ctx.fillStyle = '#8B0000';
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.2, size * 0.08, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFF0';
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, -size * 0.18);
  ctx.lineTo(-size * 0.05, -size * 0.13);
  ctx.lineTo(-size * 0.04, -size * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.06, -size * 0.18);
  ctx.lineTo(size * 0.05, -size * 0.13);
  ctx.lineTo(size * 0.04, -size * 0.18);
  ctx.closePath();
  ctx.fill();

  // 喷火效果
  const fireIntensity = isAttacking ? 1.0 : Math.max(0, Math.sin(t * 0.5) * 0.4 + 0.3);
  if (fireIntensity > 0.2) {
    ctx.save();
    ctx.translate(0, -size * 0.18);
    ctx.fillStyle = `rgba(255, 69, 0, ${fireIntensity * 0.7})`;
    ctx.beginPath();
    ctx.moveTo(-size * 0.12, 0);
    ctx.quadraticCurveTo(-size * 0.2, -size * 0.15 * fireIntensity, -size * 0.08, -size * 0.25 * fireIntensity);
    ctx.quadraticCurveTo(0, -size * 0.3 * fireIntensity, size * 0.08, -size * 0.25 * fireIntensity);
    ctx.quadraticCurveTo(size * 0.2, -size * 0.15 * fireIntensity, size * 0.12, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(255, 140, 0, ${fireIntensity * 0.8})`;
    ctx.beginPath();
    ctx.moveTo(-size * 0.08, 0);
    ctx.quadraticCurveTo(-size * 0.12, -size * 0.1 * fireIntensity, -size * 0.04, -size * 0.18 * fireIntensity);
    ctx.quadraticCurveTo(0, -size * 0.22 * fireIntensity, size * 0.04, -size * 0.18 * fireIntensity);
    ctx.quadraticCurveTo(size * 0.12, -size * 0.1 * fireIntensity, size * 0.08, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(255, 255, 100, ${fireIntensity})`;
    ctx.beginPath();
    ctx.moveTo(-size * 0.04, 0);
    ctx.quadraticCurveTo(-size * 0.05, -size * 0.05 * fireIntensity, 0, -size * 0.1 * fireIntensity);
    ctx.quadraticCurveTo(size * 0.05, -size * 0.05 * fireIntensity, size * 0.04, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 龙腿
  ctx.fillStyle = detailColor;
  const legAnim = Math.sin(Date.now() / 150) * 4;
  ctx.beginPath();
  ctx.ellipse(-size * 0.1, size * 0.35 + legAnim, size * 0.07, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.1, size * 0.35 - legAnim, size * 0.07, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFD700';
  for (let side = -1; side <= 1; side += 2) {
    for (let c = 0; c < 3; c++) {
      ctx.beginPath();
      ctx.arc(side * (size * 0.1 + c * 0.02 * size - size * 0.02), size * 0.45 + (side < 0 ? legAnim : -legAnim), size * 0.02, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
  drawHpBar(ctx, size * 0.6, hpPercent, -size * 0.5 + hoverY);
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
