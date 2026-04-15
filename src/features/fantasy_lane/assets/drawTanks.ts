/* 前排肉盾兵种绘制：哥布林盾兵、兽人重甲兵、石像卫士、铁壁矮人 */

export function drawGoblinShield(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  const now = Date.now();
  const walkBob = Math.sin(now / 150) * 2;
  const attackSwing = isAttacking ? Math.sin(now / 50) * 15 : 0;

  // 佝偻身体（梨形）
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, walkBob, size * 0.25, size * 0.35, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // 破旧皮甲
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.1 + walkBob, size * 0.2, size * 0.2, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // 头部（歪斜）
  ctx.fillStyle = bodyColor;
  ctx.save();
  ctx.rotate(0.15);
  ctx.beginPath();
  ctx.arc(0, -size * 0.35 + walkBob, size * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // 破旧头盔（带裂缝）
  ctx.fillStyle = '#666666';
  ctx.beginPath();
  ctx.arc(0, -size * 0.4 + walkBob, size * 0.2, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, -size * 0.45 + walkBob);
  ctx.lineTo(size * 0.05, -size * 0.35 + walkBob);
  ctx.stroke();

  // 眼睛（一大一小）
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(-size * 0.06, -size * 0.37 + walkBob, size * 0.04, 0, Math.PI * 2);
  ctx.arc(size * 0.08, -size * 0.37 + walkBob, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 大圆盾（遮住左半身）
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.arc(-size * 0.3, size * 0.05 + walkBob, size * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#DAA520';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-size * 0.3, -size * 0.15 + walkBob);
  ctx.lineTo(-size * 0.3, size * 0.25 + walkBob);
  ctx.moveTo(-size * 0.5, size * 0.05 + walkBob);
  ctx.lineTo(-size * 0.1, size * 0.05 + walkBob);
  ctx.stroke();

  // 短剑
  ctx.save();
  ctx.translate(size * 0.2, size * 0.1 + walkBob);
  ctx.rotate((attackSwing * Math.PI / 180));
  ctx.strokeStyle = weaponColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.15, -size * 0.25);
  ctx.stroke();
  ctx.restore();

  // 短腿
  ctx.fillStyle = detailColor;
  ctx.fillRect(-size * 0.12, size * 0.25 + walkBob, size * 0.08, size * 0.15);
  ctx.fillRect(size * 0.04, size * 0.25 + walkBob, size * 0.08, size * 0.15);

  // 血条
  drawHpBar(ctx, size * 0.5, hpPercent, -size * 0.55 + walkBob);
}

export function drawOrcHeavy(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  void weaponColor;
  const now = Date.now();
  const walkBob = Math.sin(now / 200) * 3;
  const attackSwing = isAttacking ? Math.sin(now / 60) * 20 : 0;
  void attackSwing;

  // 倒梯形板甲身体
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.35, size * 0.3 + walkBob);
  ctx.lineTo(size * 0.35, size * 0.3 + walkBob);
  ctx.lineTo(size * 0.25, -size * 0.1 + walkBob);
  ctx.lineTo(-size * 0.25, -size * 0.1 + walkBob);
  ctx.fill();

  // 板甲纹理
  ctx.strokeStyle = '#888888';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.2, (-size * 0.05 + i * size * 0.12) + walkBob);
    ctx.lineTo(size * 0.2, (-size * 0.05 + i * size * 0.12) + walkBob);
    ctx.stroke();
  }

  // 肩甲带尖刺
  ctx.fillStyle = '#555555';
  ctx.beginPath();
  ctx.arc(-size * 0.3, -size * 0.15 + walkBob, size * 0.12, 0, Math.PI * 2);
  ctx.arc(size * 0.3, -size * 0.15 + walkBob, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#888888';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.35 + i * size * 0.05, -size * 0.25 + walkBob);
    ctx.lineTo(-size * 0.3 + i * size * 0.05, -size * 0.35 + walkBob);
    ctx.lineTo(-size * 0.25 + i * size * 0.05, -size * 0.25 + walkBob);
    ctx.fill();
  }

  // 兽人头部（方形）
  ctx.fillStyle = bodyColor;
  ctx.fillRect(-size * 0.15, -size * 0.4 + walkBob, size * 0.3, size * 0.25);

  // 带角头盔
  ctx.fillStyle = '#444444';
  ctx.beginPath();
  ctx.arc(0, -size * 0.42 + walkBob, size * 0.18, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#666666';
  ctx.beginPath();
  ctx.moveTo(-size * 0.15, -size * 0.45 + walkBob);
  ctx.lineTo(-size * 0.2, -size * 0.6 + walkBob);
  ctx.lineTo(-size * 0.1, -size * 0.45 + walkBob);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.15, -size * 0.45 + walkBob);
  ctx.lineTo(size * 0.2, -size * 0.6 + walkBob);
  ctx.lineTo(size * 0.1, -size * 0.45 + walkBob);
  ctx.fill();

  // 凶恶眼睛
  ctx.fillStyle = '#FF0000';
  ctx.beginPath();
  ctx.arc(-size * 0.06, -size * 0.35 + walkBob, size * 0.04, 0, Math.PI * 2);
  ctx.arc(size * 0.06, -size * 0.35 + walkBob, size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // 獠牙
  ctx.fillStyle = '#FFFFCC';
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, -size * 0.25 + walkBob);
  ctx.lineTo(-size * 0.06, -size * 0.18 + walkBob);
  ctx.lineTo(-size * 0.04, -size * 0.25 + walkBob);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.04, -size * 0.25 + walkBob);
  ctx.lineTo(size * 0.06, -size * 0.18 + walkBob);
  ctx.lineTo(size * 0.08, -size * 0.25 + walkBob);
  ctx.fill();

  // 双手巨斧
  ctx.save();
  ctx.translate(size * 0.25, -size * 0.1 + walkBob);
  ctx.rotate((attackSwing * Math.PI / 180));
  ctx.strokeStyle = '#8B7355';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.1, -size * 0.5);
  ctx.stroke();
  ctx.fillStyle = '#888888';
  ctx.beginPath();
  ctx.moveTo(size * 0.1, -size * 0.5);
  ctx.quadraticCurveTo(size * 0.3, -size * 0.55, size * 0.1, -size * 0.6);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.1, -size * 0.5);
  ctx.quadraticCurveTo(-size * 0.1, -size * 0.55, size * 0.1, -size * 0.6);
  ctx.fill();
  ctx.restore();

  // 铁靴
  ctx.fillStyle = '#555555';
  ctx.fillRect(-size * 0.2, size * 0.25 + walkBob, size * 0.15, size * 0.15);
  ctx.fillRect(size * 0.05, size * 0.25 + walkBob, size * 0.15, size * 0.15);

  drawHpBar(ctx, size * 0.6, hpPercent, -size * 0.65 + walkBob);
}

export function drawStoneGuard(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  const now = Date.now();
  const walkBob = Math.sin(now / 300) * 1;
  const attackSwing = isAttacking ? Math.sin(now / 80) * 10 : 0;

  // 方块身体
  ctx.fillStyle = bodyColor;
  ctx.fillRect(-size * 0.3, -size * 0.1 + walkBob, size * 0.6, size * 0.45);

  // 石头裂纹
  ctx.strokeStyle = detailColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, 0 + walkBob);
  ctx.lineTo(size * 0.1, size * 0.1 + walkBob);
  ctx.lineTo(size * 0.25, -size * 0.05 + walkBob);
  ctx.stroke();

  // 石像鬼头部
  ctx.fillStyle = bodyColor;
  ctx.fillRect(-size * 0.2, -size * 0.4 + walkBob, size * 0.4, size * 0.3);

  // 角
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.15, -size * 0.4 + walkBob);
  ctx.lineTo(-size * 0.2, -size * 0.55 + walkBob);
  ctx.lineTo(-size * 0.05, -size * 0.4 + walkBob);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.15, -size * 0.4 + walkBob);
  ctx.lineTo(size * 0.2, -size * 0.55 + walkBob);
  ctx.lineTo(size * 0.05, -size * 0.4 + walkBob);
  ctx.fill();

  // 发光眼睛（脉冲）
  const glow = 0.5 + Math.sin(now / 500) * 0.5;
  ctx.fillStyle = `rgba(255, 255, 0, ${glow})`;
  ctx.beginPath();
  ctx.arc(-size * 0.08, -size * 0.3 + walkBob, size * 0.05, 0, Math.PI * 2);
  ctx.arc(size * 0.08, -size * 0.3 + walkBob, size * 0.05, 0, Math.PI * 2);
  ctx.fill();

  // 石柱腿
  ctx.fillStyle = detailColor;
  ctx.fillRect(-size * 0.2, size * 0.3 + walkBob, size * 0.15, size * 0.2);
  ctx.fillRect(size * 0.05, size * 0.3 + walkBob, size * 0.15, size * 0.2);

  // 石剑
  ctx.save();
  ctx.translate(size * 0.35, size * 0.1 + walkBob);
  ctx.rotate((attackSwing * Math.PI / 180));
  ctx.fillStyle = weaponColor;
  ctx.fillRect(-size * 0.05, -size * 0.4, size * 0.1, size * 0.5);
  ctx.restore();

  // 石盾
  ctx.fillStyle = bodyColor;
  ctx.fillRect(-size * 0.45, -size * 0.15 + walkBob, size * 0.15, size * 0.35);
  ctx.strokeStyle = detailColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(-size * 0.45, -size * 0.15 + walkBob, size * 0.15, size * 0.35);

  drawHpBar(ctx, size * 0.6, hpPercent, -size * 0.6 + walkBob);
}

export function drawDwarfIronwall(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  void weaponColor;
  const now = Date.now();
  const walkBob = Math.sin(now / 120) * 2;
  const attackSwing = isAttacking ? Math.sin(now / 50) * 18 : 0;
  void attackSwing;

  // 桶形身体
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.05 + walkBob, size * 0.3, size * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // 锁子甲纹理
  ctx.strokeStyle = detailColor;
  ctx.lineWidth = 1;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      ctx.beginPath();
      ctx.arc(-size * 0.2 + c * size * 0.1, -size * 0.1 + r * size * 0.1 + walkBob, size * 0.04, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // 圆脸
  ctx.fillStyle = '#DEB887';
  ctx.beginPath();
  ctx.arc(0, -size * 0.3 + walkBob, size * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // 头盔带护鼻
  ctx.fillStyle = '#888888';
  ctx.beginPath();
  ctx.arc(0, -size * 0.35 + walkBob, size * 0.2, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(-size * 0.03, -size * 0.35 + walkBob, size * 0.06, size * 0.15);

  // 大胡子
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.moveTo(-size * 0.15, -size * 0.25 + walkBob);
  ctx.quadraticCurveTo(-size * 0.2, size * 0.05 + walkBob, -size * 0.1, size * 0.1 + walkBob);
  ctx.lineTo(size * 0.1, size * 0.1 + walkBob);
  ctx.quadraticCurveTo(size * 0.2, size * 0.05 + walkBob, size * 0.15, -size * 0.25 + walkBob);
  ctx.fill();

  // 眼睛
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(-size * 0.06, -size * 0.32 + walkBob, size * 0.03, 0, Math.PI * 2);
  ctx.arc(size * 0.06, -size * 0.32 + walkBob, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // 塔盾
  ctx.fillStyle = '#666666';
  ctx.beginPath();
  ctx.moveTo(-size * 0.45, -size * 0.3 + walkBob);
  ctx.lineTo(-size * 0.35, -size * 0.3 + walkBob);
  ctx.lineTo(-size * 0.3, size * 0.2 + walkBob);
  ctx.lineTo(-size * 0.5, size * 0.2 + walkBob);
  ctx.fill();
  ctx.fillStyle = '#DAA520';
  ctx.fillRect(-size * 0.42, -size * 0.1 + walkBob, size * 0.1, size * 0.1);

  // 战锤
  ctx.save();
  ctx.translate(size * 0.3, size * 0.1 + walkBob);
  ctx.rotate((attackSwing * Math.PI / 180));
  ctx.strokeStyle = '#8B7355';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.05, -size * 0.35);
  ctx.stroke();
  ctx.fillStyle = '#888888';
  ctx.fillRect(-size * 0.08, -size * 0.4, size * 0.16, size * 0.1);
  ctx.restore();

  // 短粗腿
  ctx.fillStyle = detailColor;
  ctx.fillRect(-size * 0.15, size * 0.3 + walkBob, size * 0.1, size * 0.12);
  ctx.fillRect(size * 0.05, size * 0.3 + walkBob, size * 0.1, size * 0.12);

  drawHpBar(ctx, size * 0.5, hpPercent, -size * 0.55 + walkBob);
}

// 血条绘制工具函数
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
