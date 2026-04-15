/* 远程持续输出兵种绘制：弓箭手、精灵射手、火枪佣兵、弩炮车（子agent详细设计版） */

/** 弓箭手 - 标准体型，长弓，箭袋在背后，皮甲 */
export function drawArcher(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  const walk = Math.sin(Date.now() / 120) * 2;

  // 皮甲身体
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, walk * 0.3, size * 0.25, size * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  // 皮甲交叉绑带
  ctx.strokeStyle = detailColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-size * 0.15, -size * 0.15);
  ctx.lineTo(size * 0.15, size * 0.1);
  ctx.moveTo(size * 0.15, -size * 0.15);
  ctx.lineTo(-size * 0.15, size * 0.1);
  ctx.stroke();

  // 头
  ctx.fillStyle = '#D2B48C';
  ctx.beginPath();
  ctx.arc(0, -size * 0.5, size * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // 简易兜帽
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.arc(0, -size * 0.55, size * 0.2, Math.PI, 0);
  ctx.fill();

  // 眼睛
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(-size * 0.06, -size * 0.5, size * 0.03, 0, Math.PI * 2);
  ctx.arc(size * 0.06, -size * 0.5, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // 背后箭袋
  ctx.fillStyle = '#654321';
  ctx.fillRect(-size * 0.08, -size * 0.35, size * 0.16, size * 0.35);
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(-size * 0.06 + i * size * 0.06, -size * 0.42, size * 0.02, size * 0.08);
  }
  ctx.strokeStyle = '#8B7355';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.05 + i * size * 0.06, -size * 0.35);
    ctx.lineTo(-size * 0.05 + i * size * 0.06, -size * 0.15);
    ctx.stroke();
  }

  // 长弓
  const bowX = size * 0.35, bowY = -size * 0.15, bowLen = size * 0.5;
  ctx.strokeStyle = weaponColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(bowX, bowY, bowLen, -Math.PI * 0.4, Math.PI * 0.4);
  ctx.stroke();
  ctx.strokeStyle = '#CCCCCC';
  ctx.lineWidth = 1;
  const topX = bowX + bowLen * Math.cos(-Math.PI * 0.4);
  const topY = bowY + bowLen * Math.sin(-Math.PI * 0.4);
  const botX = bowX + bowLen * Math.cos(Math.PI * 0.4);
  const botY = bowY + bowLen * Math.sin(Math.PI * 0.4);
  ctx.beginPath();
  ctx.moveTo(topX, topY);
  ctx.lineTo(botX, botY);
  ctx.stroke();

  // 攻击时拉弓
  if (isAttacking) {
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(size * 0.15, bowY);
    ctx.lineTo(topX, topY);
    ctx.moveTo(size * 0.15, bowY);
    ctx.lineTo(botX, botY);
    ctx.stroke();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(size * 0.15, bowY);
    ctx.lineTo(size * 0.6, bowY);
    ctx.stroke();
  }

  // 腿和靴子
  ctx.fillStyle = detailColor;
  ctx.fillRect(-size * 0.12, size * 0.35 + walk, size * 0.08, size * 0.2);
  ctx.fillRect(size * 0.04, size * 0.35 - walk, size * 0.08, size * 0.2);
  ctx.fillStyle = '#5C4033';
  ctx.fillRect(-size * 0.14, size * 0.52 + walk, size * 0.12, size * 0.06);
  ctx.fillRect(size * 0.02, size * 0.52 - walk, size * 0.12, size * 0.06);

  drawHpBar(ctx, size * 0.4, hpPercent, -size * 0.75 + walk);
}

/** 精灵射手 - 修长优雅，长耳朵，精致短弓，绿色斗篷 */
export function drawElfShooter(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  const walk = Math.sin(Date.now() / 120) * 1.5;

  // 修长身体
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, walk * 0.2, size * 0.2, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 金色镶边
  ctx.strokeStyle = '#DAA520';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.3);
  ctx.lineTo(0, size * 0.2);
  ctx.stroke();

  // 头
  ctx.fillStyle = '#F5DEB3';
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.55, size * 0.16, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // 长耳朵
  ctx.fillStyle = '#F5DEB3';
  ctx.beginPath();
  ctx.moveTo(-size * 0.16, -size * 0.55);
  ctx.lineTo(-size * 0.35, -size * 0.7);
  ctx.lineTo(-size * 0.14, -size * 0.48);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.16, -size * 0.55);
  ctx.lineTo(size * 0.35, -size * 0.7);
  ctx.lineTo(size * 0.14, -size * 0.48);
  ctx.fill();

  // 精灵眼
  ctx.fillStyle = '#00CED1';
  ctx.beginPath();
  ctx.ellipse(-size * 0.06, -size * 0.55, size * 0.04, size * 0.05, 0, 0, Math.PI * 2);
  ctx.ellipse(size * 0.06, -size * 0.55, size * 0.04, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(-size * 0.06, -size * 0.55, size * 0.02, 0, Math.PI * 2);
  ctx.arc(size * 0.06, -size * 0.55, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // 金色长发
  ctx.fillStyle = '#DAA520';
  ctx.beginPath();
  ctx.arc(0, -size * 0.6, size * 0.18, Math.PI * 0.8, Math.PI * 0.2, true);
  ctx.fill();
  ctx.fillRect(-size * 0.18, -size * 0.55, size * 0.06, size * 0.3);
  ctx.fillRect(size * 0.12, -size * 0.55, size * 0.06, size * 0.3);

  // 绿色斗篷
  const capeWave = Math.sin(Date.now() / 150) * 3;
  ctx.fillStyle = detailColor;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.2);
  ctx.quadraticCurveTo(-size * 0.3 + capeWave, size * 0.2, -size * 0.15, size * 0.55);
  ctx.lineTo(size * 0.15, size * 0.55);
  ctx.quadraticCurveTo(size * 0.3 + capeWave, size * 0.2, size * 0.2, -size * 0.2);
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // 精致短弓
  const bowX = size * 0.3, bowY = -size * 0.1, bowLen = size * 0.35;
  ctx.strokeStyle = weaponColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(bowX, bowY, bowLen, -Math.PI * 0.35, Math.PI * 0.35);
  ctx.stroke();
  ctx.strokeStyle = '#E8E8E8';
  ctx.lineWidth = 1;
  const tX = bowX + bowLen * Math.cos(-Math.PI * 0.35);
  const tY = bowY + bowLen * Math.sin(-Math.PI * 0.35);
  const bX = bowX + bowLen * Math.cos(Math.PI * 0.35);
  const bY = bowY + bowLen * Math.sin(Math.PI * 0.35);
  ctx.beginPath();
  ctx.moveTo(tX, tY);
  ctx.lineTo(bX, bY);
  ctx.stroke();

  // 弓上精灵装饰
  ctx.fillStyle = '#00FF7F';
  ctx.beginPath();
  ctx.arc(bowX, bowY - bowLen, size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // 攻击时精灵箭
  if (isAttacking) {
    ctx.strokeStyle = '#00FF7F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(size * 0.1, bowY);
    ctx.lineTo(tX, tY);
    ctx.moveTo(size * 0.1, bowY);
    ctx.lineTo(bX, bY);
    ctx.stroke();
    ctx.strokeStyle = '#00FF7F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(size * 0.1, bowY);
    ctx.lineTo(size * 0.55, bowY);
    ctx.stroke();
  }

  // 修长腿和尖头靴
  ctx.fillStyle = detailColor;
  ctx.fillRect(-size * 0.1, size * 0.4 + walk, size * 0.06, size * 0.22);
  ctx.fillRect(size * 0.04, size * 0.4 - walk, size * 0.06, size * 0.22);
  ctx.fillStyle = '#2E8B57';
  ctx.beginPath();
  ctx.moveTo(-size * 0.12, size * 0.58 + walk);
  ctx.lineTo(-size * 0.02, size * 0.58 + walk);
  ctx.lineTo(-size * 0.16, size * 0.62 + walk);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.02, size * 0.58 - walk);
  ctx.lineTo(size * 0.12, size * 0.58 - walk);
  ctx.lineTo(size * 0.16, size * 0.62 - walk);
  ctx.fill();

  drawHpBar(ctx, size * 0.35, hpPercent, -size * 0.8 + walk);
}

/** 火枪佣兵 - 宽檐帽，火枪扛肩上，大衣，靴子 */
export function drawMusketeer(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  const walk = Math.sin(Date.now() / 120) * 2;

  // 大衣身体
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.28, -size * 0.2);
  ctx.lineTo(-size * 0.25, size * 0.45);
  ctx.lineTo(size * 0.25, size * 0.45);
  ctx.lineTo(size * 0.28, -size * 0.2);
  ctx.closePath();
  ctx.fill();

  // 大衣翻领
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.15, -size * 0.2);
  ctx.lineTo(0, size * 0.05);
  ctx.lineTo(size * 0.15, -size * 0.2);
  ctx.fill();

  // 腰带和扣
  ctx.fillStyle = '#4A3728';
  ctx.fillRect(-size * 0.22, size * 0.05, size * 0.44, size * 0.06);
  ctx.fillStyle = '#DAA520';
  ctx.fillRect(-size * 0.04, size * 0.04, size * 0.08, size * 0.08);

  // 头
  ctx.fillStyle = '#D2B48C';
  ctx.beginPath();
  ctx.arc(0, -size * 0.35, size * 0.17, 0, Math.PI * 2);
  ctx.fill();

  // 宽檐帽
  ctx.fillStyle = '#3B2F2F';
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.45, size * 0.32, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-size * 0.15, -size * 0.45);
  ctx.lineTo(-size * 0.12, -size * 0.65);
  ctx.quadraticCurveTo(0, -size * 0.72, size * 0.12, -size * 0.65);
  ctx.lineTo(size * 0.15, -size * 0.45);
  ctx.fill();
  ctx.fillStyle = '#8B0000';
  ctx.fillRect(-size * 0.14, -size * 0.5, size * 0.28, size * 0.04);

  // 眼睛和胡子
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(-size * 0.05, -size * 0.35, size * 0.025, 0, Math.PI * 2);
  ctx.arc(size * 0.05, -size * 0.35, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4A3728';
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, -size * 0.28);
  ctx.quadraticCurveTo(0, -size * 0.22, size * 0.08, -size * 0.28);
  ctx.fill();

  // 火枪扛肩
  const gunAngle = isAttacking ? -0.3 : 0.15;
  ctx.save();
  ctx.translate(size * 0.15, -size * 0.25);
  ctx.rotate(gunAngle);
  ctx.fillStyle = weaponColor;
  ctx.fillRect(-size * 0.04, -size * 0.6, size * 0.08, size * 0.5);
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(-size * 0.06, -size * 0.12, size * 0.12, size * 0.2);
  ctx.fillStyle = '#333333';
  ctx.beginPath();
  ctx.arc(0, -size * 0.62, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 攻击时枪口火焰
  if (isAttacking) {
    ctx.save();
    ctx.translate(size * 0.15, -size * 0.25);
    ctx.rotate(gunAngle);
    const grad = ctx.createRadialGradient(0, -size * 0.65, 0, 0, -size * 0.65, size * 0.15);
    grad.addColorStop(0, 'rgba(255, 200, 50, 0.9)');
    grad.addColorStop(0.5, 'rgba(255, 100, 20, 0.6)');
    grad.addColorStop(1, 'rgba(255, 50, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, -size * 0.65, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 靴子
  ctx.fillStyle = '#3B2F2F';
  ctx.fillRect(-size * 0.18, size * 0.4 + walk, size * 0.14, size * 0.15);
  ctx.fillRect(size * 0.04, size * 0.4 - walk, size * 0.14, size * 0.15);
  ctx.fillStyle = '#2F1F1F';
  ctx.fillRect(-size * 0.2, size * 0.35 + walk, size * 0.18, size * 0.08);
  ctx.fillRect(size * 0.02, size * 0.35 - walk, size * 0.18, size * 0.08);

  drawHpBar(ctx, size * 0.4, hpPercent, -size * 0.75 + walk);
}

/** 弩炮车 - 非人形机械装置，带轮子，大型弩箭 */
export function drawBallista(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  const bounce = Math.abs(Math.sin(Date.now() / 100)) * 2;

  // 底盘框架
  ctx.fillStyle = bodyColor;
  ctx.fillRect(-size * 0.4, -size * 0.1, size * 0.8, size * 0.25);
  ctx.strokeStyle = detailColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(-size * 0.38, -size * 0.08, size * 0.76, size * 0.21);

  // 金属铆钉
  ctx.fillStyle = '#AAAAAA';
  [[-size * 0.35, -size * 0.05], [size * 0.35, -size * 0.05], [-size * 0.35, size * 0.12], [size * 0.35, size * 0.12]].forEach(([rx, ry]) => {
    ctx.beginPath();
    ctx.arc(rx, ry, size * 0.03, 0, Math.PI * 2);
    ctx.fill();
  });

  // 轮子
  const wheelY = size * 0.2 + bounce;
  [-size * 0.25, size * 0.25].forEach(wx => {
    ctx.fillStyle = '#5C4033';
    ctx.beginPath();
    ctx.arc(wx, wheelY, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(wx, wheelY, size * 0.15, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Date.now() / 500;
      ctx.beginPath();
      ctx.moveTo(wx, wheelY);
      ctx.lineTo(wx + Math.cos(angle) * size * 0.13, wheelY + Math.sin(angle) * size * 0.13);
      ctx.stroke();
    }
    ctx.fillStyle = '#888888';
    ctx.beginPath();
    ctx.arc(wx, wheelY, size * 0.04, 0, Math.PI * 2);
    ctx.fill();
  });

  // 弩臂支架
  ctx.fillStyle = detailColor;
  ctx.fillRect(-size * 0.06, -size * 0.5, size * 0.12, size * 0.45);

  // 弩臂横梁
  ctx.fillStyle = weaponColor;
  ctx.fillRect(-size * 0.35, -size * 0.45, size * 0.7, size * 0.08);

  // 弩弦
  ctx.strokeStyle = '#CCCCCC';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-size * 0.35, -size * 0.41);
  ctx.lineTo(size * 0.35, -size * 0.41);
  ctx.stroke();

  // 大型弩箭
  ctx.fillStyle = '#8B7355';
  ctx.fillRect(-size * 0.02, -size * 0.48, size * 0.04, size * 0.35);
  ctx.fillStyle = '#666666';
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.55);
  ctx.lineTo(-size * 0.06, -size * 0.42);
  ctx.lineTo(size * 0.06, -size * 0.42);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#CC0000';
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, -size * 0.18);
  ctx.lineTo(-size * 0.08, -size * 0.13);
  ctx.lineTo(-size * 0.02, -size * 0.13);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.02, -size * 0.18);
  ctx.lineTo(size * 0.08, -size * 0.13);
  ctx.lineTo(size * 0.02, -size * 0.13);
  ctx.fill();

  // 攻击时弩箭发射
  if (isAttacking) {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-size * 0.35, -size * 0.41);
    ctx.quadraticCurveTo(0, -size * 0.2, size * 0.35, -size * 0.41);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 200, 50, 0.6)';
    ctx.lineWidth = 4;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(size * 0.35, -size * 0.41);
    ctx.lineTo(size * 0.7, -size * 0.41);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 绞盘装置
  ctx.fillStyle = '#666666';
  ctx.beginPath();
  ctx.arc(-size * 0.3, -size * 0.02, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#888888';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(-size * 0.3, -size * 0.02, size * 0.06, 0, Math.PI * 2);
  ctx.stroke();

  drawHpBar(ctx, size * 0.5, hpPercent, -size * 0.6 + bounce);
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
