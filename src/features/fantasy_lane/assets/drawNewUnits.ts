/* 新兵种绘制：15个新增兵种（10地面 + 5空中） */

// HP 条绘制工具函数
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

// === 地面兵种 ===

export function drawHolyKnight(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  const now = Date.now();
  const walkBob = Math.sin(now / 180) * 2;
  const attackSwing = isAttacking ? Math.sin(now / 60) * 15 : 0;

  // 金色铠甲身体
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.25, size * 0.3 + walkBob);
  ctx.lineTo(size * 0.25, size * 0.3 + walkBob);
  ctx.lineTo(size * 0.2, -size * 0.1 + walkBob);
  ctx.lineTo(-size * 0.2, -size * 0.1 + walkBob);
  ctx.fill();

  // 十字纹章
  ctx.fillStyle = weaponColor;
  ctx.fillRect(-size * 0.03, -size * 0.05 + walkBob, size * 0.06, size * 0.2);
  ctx.fillRect(-size * 0.1, size * 0.02 + walkBob, size * 0.2, size * 0.06);

  // 头盔
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.arc(0, -size * 0.35 + walkBob, size * 0.18, Math.PI, 0);
  ctx.fill();

  // 十字光效
  ctx.fillStyle = weaponColor;
  ctx.fillRect(-size * 0.02, -size * 0.45 + walkBob, size * 0.04, size * 0.15);
  ctx.fillRect(-size * 0.08, -size * 0.4 + walkBob, size * 0.16, size * 0.04);

  // 眼睛
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-size * 0.06, -size * 0.35 + walkBob, size * 0.04, 0, Math.PI * 2);
  ctx.arc(size * 0.06, -size * 0.35 + walkBob, size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // 金色盾牌
  ctx.fillStyle = weaponColor;
  ctx.beginPath();
  ctx.arc(-size * 0.3, size * 0.05 + walkBob, size * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(-size * 0.3, size * 0.05 + walkBob, size * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // 圣剑
  ctx.save();
  ctx.translate(size * 0.2, size * 0.1 + walkBob);
  ctx.rotate((attackSwing * Math.PI / 180));
  ctx.strokeStyle = weaponColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.05, -size * 0.4);
  ctx.stroke();
  ctx.restore();

  // 披风
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.15, -size * 0.1 + walkBob);
  ctx.quadraticCurveTo(-size * 0.25, size * 0.2 + walkBob, -size * 0.1, size * 0.35 + walkBob);
  ctx.lineTo(size * 0.1, size * 0.35 + walkBob);
  ctx.quadraticCurveTo(size * 0.15, size * 0.2 + walkBob, size * 0.15, -size * 0.1 + walkBob);
  ctx.fill();

  // 腿
  ctx.fillStyle = detailColor;
  ctx.fillRect(-size * 0.15, size * 0.25 + walkBob, size * 0.1, size * 0.15);
  ctx.fillRect(size * 0.05, size * 0.25 + walkBob, size * 0.1, size * 0.15);

  drawHpBar(ctx, size * 0.5, hpPercent, -size * 0.55 + walkBob);
}

export function drawDruid(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  const now = Date.now();
  const walkBob = Math.sin(now / 160) * 2;
  const attackSwing = isAttacking ? Math.sin(now / 70) * 12 : 0;

  // 绿色长袍
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, size * 0.3 + walkBob);
  ctx.lineTo(size * 0.2, size * 0.3 + walkBob);
  ctx.lineTo(size * 0.15, -size * 0.1 + walkBob);
  ctx.lineTo(-size * 0.15, -size * 0.1 + walkBob);
  ctx.fill();

  // 树叶装饰
  ctx.fillStyle = detailColor;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(-size * 0.1 + i * size * 0.1, size * 0.05 + walkBob, size * 0.04, size * 0.06, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // 头部
  ctx.fillStyle = '#DEB887';
  ctx.beginPath();
  ctx.arc(0, -size * 0.3 + walkBob, size * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // 树叶头冠
  ctx.fillStyle = detailColor;
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI * 0.8 + (i / 4) * Math.PI * 0.6;
    ctx.beginPath();
    ctx.ellipse(Math.cos(angle) * size * 0.15, -size * 0.35 + Math.sin(angle) * size * 0.1 + walkBob, size * 0.04, size * 0.06, angle, 0, Math.PI * 2);
    ctx.fill();
  }

  // 眼睛
  ctx.fillStyle = '#228B22';
  ctx.beginPath();
  ctx.arc(-size * 0.05, -size * 0.32 + walkBob, size * 0.03, 0, Math.PI * 2);
  ctx.arc(size * 0.05, -size * 0.32 + walkBob, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // 法杖
  ctx.save();
  ctx.translate(size * 0.15, size * 0.1 + walkBob);
  ctx.rotate((attackSwing * Math.PI / 180));
  ctx.strokeStyle = weaponColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.05, -size * 0.45);
  ctx.stroke();
  // 法杖顶端绿色光球
  ctx.fillStyle = '#32CD32';
  ctx.beginPath();
  ctx.arc(size * 0.05, -size * 0.48, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 披风
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.12, -size * 0.1 + walkBob);
  ctx.quadraticCurveTo(-size * 0.2, size * 0.15 + walkBob, -size * 0.08, size * 0.32 + walkBob);
  ctx.lineTo(size * 0.08, size * 0.32 + walkBob);
  ctx.quadraticCurveTo(size * 0.12, size * 0.15 + walkBob, size * 0.12, -size * 0.1 + walkBob);
  ctx.fill();

  drawHpBar(ctx, size * 0.4, hpPercent, -size * 0.5 + walkBob);
}

export function drawSiegeRam(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, _detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  void _detailColor;
  const now = Date.now();
  const walkBob = Math.sin(now / 250) * 1;
  const attackSwing = isAttacking ? Math.sin(now / 90) * 8 : 0;

  // 木质车身
  ctx.fillStyle = bodyColor;
  ctx.fillRect(-size * 0.4, -size * 0.15 + walkBob, size * 0.8, size * 0.35);

  // 铁甲包裹
  ctx.fillStyle = weaponColor;
  ctx.fillRect(-size * 0.35, -size * 0.1 + walkBob, size * 0.7, size * 0.05);
  ctx.fillRect(-size * 0.35, size * 0.1 + walkBob, size * 0.7, size * 0.05);

  // 撞锤头
  ctx.save();
  ctx.translate(-size * 0.45, size * 0.05 + walkBob);
  ctx.translate((attackSwing * Math.PI / 180) * size * 0.1, 0);
  ctx.fillStyle = '#666666';
  ctx.beginPath();
  ctx.moveTo(-size * 0.15, -size * 0.1);
  ctx.lineTo(size * 0.05, 0);
  ctx.lineTo(-size * 0.15, size * 0.1);
  ctx.fill();
  ctx.restore();

  // 轮子
  ctx.fillStyle = '#4A4A4A';
  ctx.beginPath();
  ctx.arc(-size * 0.25, size * 0.25 + walkBob, size * 0.12, 0, Math.PI * 2);
  ctx.arc(size * 0.25, size * 0.25 + walkBob, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#888888';
  ctx.beginPath();
  ctx.arc(-size * 0.25, size * 0.25 + walkBob, size * 0.04, 0, Math.PI * 2);
  ctx.arc(size * 0.25, size * 0.25 + walkBob, size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // 木屑飞溅效果
  if (isAttacking) {
    ctx.fillStyle = '#DEB887';
    for (let i = 0; i < 4; i++) {
      const x = -size * 0.5 + Math.sin(now / 50 + i) * size * 0.1;
      const y = size * 0.05 + Math.cos(now / 60 + i) * size * 0.08;
      ctx.fillRect(x, y, size * 0.02, size * 0.02);
    }
  }

  drawHpBar(ctx, size * 0.7, hpPercent, -size * 0.35 + walkBob);
}

export function drawShadowHunter(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  const now = Date.now();
  const walkBob = Math.sin(now / 100) * 3;
  const attackSwing = isAttacking ? Math.sin(now / 40) * 20 : 0;

  // 黑色斗篷身体
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.15, size * 0.3 + walkBob);
  ctx.lineTo(size * 0.15, size * 0.3 + walkBob);
  ctx.lineTo(size * 0.12, -size * 0.1 + walkBob);
  ctx.lineTo(-size * 0.12, -size * 0.1 + walkBob);
  ctx.fill();

  // 头部
  ctx.fillStyle = '#DEB887';
  ctx.beginPath();
  ctx.arc(0, -size * 0.3 + walkBob, size * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // 兜帽
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.arc(0, -size * 0.32 + walkBob, size * 0.15, Math.PI * 0.8, Math.PI * 0.2, true);
  ctx.fill();

  // 发光眼睛
  ctx.fillStyle = '#FF4500';
  ctx.beginPath();
  ctx.arc(-size * 0.04, -size * 0.32 + walkBob, size * 0.025, 0, Math.PI * 2);
  ctx.arc(size * 0.04, -size * 0.32 + walkBob, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // 双匕首
  ctx.save();
  ctx.translate(size * 0.12, size * 0.05 + walkBob);
  ctx.rotate((attackSwing * Math.PI / 180));
  ctx.strokeStyle = weaponColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.05, -size * 0.25);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(-size * 0.12, size * 0.05 + walkBob);
  ctx.rotate((-attackSwing * Math.PI / 180));
  ctx.strokeStyle = weaponColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 0.05, -size * 0.25);
  ctx.stroke();
  ctx.restore();

  // 残影效果
  if (isAttacking) {
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(-size * 0.2, size * 0.3 + walkBob);
    ctx.lineTo(size * 0.2, size * 0.3 + walkBob);
    ctx.lineTo(size * 0.15, -size * 0.1 + walkBob);
    ctx.lineTo(-size * 0.15, -size * 0.1 + walkBob);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // 披风飘动
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, -size * 0.1 + walkBob);
  ctx.quadraticCurveTo(-size * 0.25, size * 0.1 + walkBob, -size * 0.15, size * 0.35 + walkBob);
  ctx.lineTo(size * 0.05, size * 0.35 + walkBob);
  ctx.quadraticCurveTo(size * 0.1, size * 0.1 + walkBob, size * 0.1, -size * 0.1 + walkBob);
  ctx.fill();

  drawHpBar(ctx, size * 0.4, hpPercent, -size * 0.5 + walkBob);
}

export function drawElementalist(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  const now = Date.now();
  const walkBob = Math.sin(now / 170) * 2;
  const attackSwing = isAttacking ? Math.sin(now / 65) * 14 : 0;

  // 紫色长袍
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.22, size * 0.3 + walkBob);
  ctx.lineTo(size * 0.22, size * 0.3 + walkBob);
  ctx.lineTo(size * 0.18, -size * 0.1 + walkBob);
  ctx.lineTo(-size * 0.18, -size * 0.1 + walkBob);
  ctx.fill();

  // 元素符文
  ctx.fillStyle = weaponColor;
  ctx.beginPath();
  ctx.arc(0, size * 0.05 + walkBob, size * 0.06, 0, Math.PI * 2);
  ctx.fill();

  // 头部
  ctx.fillStyle = '#DEB887';
  ctx.beginPath();
  ctx.arc(0, -size * 0.3 + walkBob, size * 0.14, 0, Math.PI * 2);
  ctx.fill();

  // 兜帽
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.arc(0, -size * 0.33 + walkBob, size * 0.16, Math.PI * 0.9, Math.PI * 0.1, true);
  ctx.fill();

  // 眼睛（元素色）
  ctx.fillStyle = weaponColor;
  ctx.beginPath();
  ctx.arc(-size * 0.05, -size * 0.32 + walkBob, size * 0.03, 0, Math.PI * 2);
  ctx.arc(size * 0.05, -size * 0.32 + walkBob, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // 三色法球环绕
  const colors = ['#FF6347', '#4169E1', '#32CD32'];
  for (let i = 0; i < 3; i++) {
    const angle = (now / 500) + (i / 3) * Math.PI * 2;
    const x = Math.cos(angle) * size * 0.25;
    const y = -size * 0.15 + Math.sin(angle) * size * 0.15 + walkBob;
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.arc(x, y, size * 0.04, 0, Math.PI * 2);
    ctx.fill();
  }

  // 法杖
  ctx.save();
  ctx.translate(size * 0.15, size * 0.1 + walkBob);
  ctx.rotate((attackSwing * Math.PI / 180));
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.05, -size * 0.45);
  ctx.stroke();
  ctx.restore();

  // 披风
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.14, -size * 0.1 + walkBob);
  ctx.quadraticCurveTo(-size * 0.22, size * 0.15 + walkBob, -size * 0.1, size * 0.32 + walkBob);
  ctx.lineTo(size * 0.1, size * 0.32 + walkBob);
  ctx.quadraticCurveTo(size * 0.14, size * 0.15 + walkBob, size * 0.14, -size * 0.1 + walkBob);
  ctx.fill();

  drawHpBar(ctx, size * 0.45, hpPercent, -size * 0.5 + walkBob);
}

export function drawHeavyCrossbow(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  const now = Date.now();
  const walkBob = Math.sin(now / 160) * 2;
  const attackSwing = isAttacking ? Math.sin(now / 60) * 10 : 0;

  // 铁甲身体
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, size * 0.3 + walkBob);
  ctx.lineTo(size * 0.2, size * 0.3 + walkBob);
  ctx.lineTo(size * 0.15, -size * 0.1 + walkBob);
  ctx.lineTo(-size * 0.15, -size * 0.1 + walkBob);
  ctx.fill();

  // 铁甲纹理
  ctx.strokeStyle = detailColor;
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.12, (-size * 0.05 + i * size * 0.1) + walkBob);
    ctx.lineTo(size * 0.12, (-size * 0.05 + i * size * 0.1) + walkBob);
    ctx.stroke();
  }

  // 头盔
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.arc(0, -size * 0.35 + walkBob, size * 0.16, Math.PI, 0);
  ctx.fill();

  // 眼睛
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(-size * 0.05, -size * 0.35 + walkBob, size * 0.03, 0, Math.PI * 2);
  ctx.arc(size * 0.05, -size * 0.35 + walkBob, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // 重型弩车
  ctx.save();
  ctx.translate(size * 0.1, size * 0.05 + walkBob);
  ctx.rotate((attackSwing * Math.PI / 180));
  ctx.strokeStyle = weaponColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.05, -size * 0.35);
  ctx.stroke();
  // 弩臂
  ctx.strokeStyle = '#8B7355';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-size * 0.15, -size * 0.3);
  ctx.lineTo(size * 0.05, -size * 0.35);
  ctx.lineTo(size * 0.15, -size * 0.3);
  ctx.stroke();
  ctx.restore();

  drawHpBar(ctx, size * 0.45, hpPercent, -size * 0.55 + walkBob);
}

export function drawFieldMedic(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, _weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  void _weaponColor;
  const now = Date.now();
  const walkBob = Math.sin(now / 140) * 2;
  const attackSwing = isAttacking ? Math.sin(now / 55) * 12 : 0;

  // 白色医疗服
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.18, size * 0.3 + walkBob);
  ctx.lineTo(size * 0.18, size * 0.3 + walkBob);
  ctx.lineTo(size * 0.14, -size * 0.1 + walkBob);
  ctx.lineTo(-size * 0.14, -size * 0.1 + walkBob);
  ctx.fill();

  // 红十字
  ctx.fillStyle = detailColor;
  ctx.fillRect(-size * 0.02, -size * 0.05 + walkBob, size * 0.04, size * 0.15);
  ctx.fillRect(-size * 0.08, size * 0.02 + walkBob, size * 0.16, size * 0.04);

  // 头部
  ctx.fillStyle = '#DEB887';
  ctx.beginPath();
  ctx.arc(0, -size * 0.3 + walkBob, size * 0.13, 0, Math.PI * 2);
  ctx.fill();

  // 医疗帽
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(0, -size * 0.35 + walkBob, size * 0.14, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = detailColor;
  ctx.fillRect(-size * 0.02, -size * 0.42 + walkBob, size * 0.04, size * 0.08);
  ctx.fillRect(-size * 0.06, -size * 0.38 + walkBob, size * 0.12, size * 0.03);

  // 眼睛
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(-size * 0.04, -size * 0.32 + walkBob, size * 0.025, 0, Math.PI * 2);
  ctx.arc(size * 0.04, -size * 0.32 + walkBob, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // 医疗包
  ctx.save();
  ctx.translate(size * 0.12, size * 0.1 + walkBob);
  ctx.rotate((attackSwing * Math.PI / 180));
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-size * 0.06, -size * 0.06, size * 0.12, size * 0.12);
  ctx.fillStyle = detailColor;
  ctx.fillRect(-size * 0.01, -size * 0.04, size * 0.02, size * 0.08);
  ctx.fillRect(-size * 0.04, -size * 0.01, size * 0.08, size * 0.02);
  ctx.restore();

  // 治疗光球效果
  if (isAttacking) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(size * 0.2, -size * 0.1 + walkBob, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHpBar(ctx, size * 0.4, hpPercent, -size * 0.5 + walkBob);
}

export function drawMammoth(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  const now = Date.now();
  const walkBob = Math.sin(now / 220) * 2;
  void isAttacking;

  // 巨型身体
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.05 + walkBob, size * 0.4, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // 象牙装甲
  ctx.fillStyle = weaponColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.35, -size * 0.1 + walkBob);
  ctx.quadraticCurveTo(-size * 0.5, -size * 0.2 + walkBob, -size * 0.45, -size * 0.35 + walkBob);
  ctx.lineTo(-size * 0.35, -size * 0.3 + walkBob);
  ctx.quadraticCurveTo(-size * 0.4, -size * 0.15 + walkBob, -size * 0.25, -size * 0.05 + walkBob);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(size * 0.35, -size * 0.1 + walkBob);
  ctx.quadraticCurveTo(size * 0.5, -size * 0.2 + walkBob, size * 0.45, -size * 0.35 + walkBob);
  ctx.lineTo(size * 0.35, -size * 0.3 + walkBob);
  ctx.quadraticCurveTo(size * 0.4, -size * 0.15 + walkBob, size * 0.25, -size * 0.05 + walkBob);
  ctx.fill();

  // 头部
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.25 + walkBob, size * 0.2, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // 眼睛
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(-size * 0.08, -size * 0.28 + walkBob, size * 0.04, 0, Math.PI * 2);
  ctx.arc(size * 0.08, -size * 0.28 + walkBob, size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // 象鼻
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, -size * 0.15 + walkBob);
  ctx.quadraticCurveTo(-size * 0.1, size * 0.05 + walkBob, -size * 0.05, size * 0.15 + walkBob);
  ctx.lineTo(size * 0.05, size * 0.15 + walkBob);
  ctx.quadraticCurveTo(size * 0.1, size * 0.05 + walkBob, size * 0.05, -size * 0.15 + walkBob);
  ctx.fill();

  // 粗腿
  ctx.fillStyle = detailColor;
  ctx.fillRect(-size * 0.3, size * 0.25 + walkBob, size * 0.15, size * 0.2);
  ctx.fillRect(size * 0.15, size * 0.25 + walkBob, size * 0.15, size * 0.2);

  // 地面震动效果
  if (isAttacking) {
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, size * 0.45 + walkBob, size * 0.1 + i * size * 0.08, 0, Math.PI);
      ctx.stroke();
    }
  }

  drawHpBar(ctx, size * 0.7, hpPercent, -size * 0.5 + walkBob);
}

export function drawDemolitionist(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, _detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  void _detailColor;
  const now = Date.now();
  const walkBob = Math.sin(now / 150) * 2;
  const attackSwing = isAttacking ? Math.sin(now / 50) * 18 : 0;

  // 棕色工装
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.18, size * 0.3 + walkBob);
  ctx.lineTo(size * 0.18, size * 0.3 + walkBob);
  ctx.lineTo(size * 0.14, -size * 0.1 + walkBob);
  ctx.lineTo(-size * 0.14, -size * 0.1 + walkBob);
  ctx.fill();

  // 炸药包
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(-size * 0.1, size * 0.05 + walkBob, size * 0.2, size * 0.12);
  ctx.fillStyle = weaponColor;
  ctx.fillRect(-size * 0.08, size * 0.07 + walkBob, size * 0.16, size * 0.08);

  // 引信
  ctx.strokeStyle = '#FF4500';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(size * 0.05, size * 0.05 + walkBob);
  ctx.quadraticCurveTo(size * 0.1, -size * 0.05 + walkBob, size * 0.08, -size * 0.1 + walkBob);
  ctx.stroke();

  // 头部
  ctx.fillStyle = '#DEB887';
  ctx.beginPath();
  ctx.arc(0, -size * 0.3 + walkBob, size * 0.13, 0, Math.PI * 2);
  ctx.fill();

  // 护目镜
  ctx.fillStyle = '#333333';
  ctx.beginPath();
  ctx.arc(-size * 0.05, -size * 0.32 + walkBob, size * 0.04, 0, Math.PI * 2);
  ctx.arc(size * 0.05, -size * 0.32 + walkBob, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#87CEEB';
  ctx.beginPath();
  ctx.arc(-size * 0.05, -size * 0.32 + walkBob, size * 0.025, 0, Math.PI * 2);
  ctx.arc(size * 0.05, -size * 0.32 + walkBob, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // 投掷动作
  ctx.save();
  ctx.translate(size * 0.15, size * 0.05 + walkBob);
  ctx.rotate((attackSwing * Math.PI / 180));
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.arc(0, -size * 0.15, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 爆炸效果
  if (isAttacking) {
    ctx.fillStyle = 'rgba(255, 69, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(size * 0.3, -size * 0.2 + walkBob, size * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHpBar(ctx, size * 0.4, hpPercent, -size * 0.5 + walkBob);
}

export function drawBladeMaster(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  const now = Date.now();
  const walkBob = Math.sin(now / 110) * 3;
  const attackSwing = isAttacking ? Math.sin(now / 35) * 25 : 0;

  // 银色铠甲
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, size * 0.3 + walkBob);
  ctx.lineTo(size * 0.2, size * 0.3 + walkBob);
  ctx.lineTo(size * 0.15, -size * 0.1 + walkBob);
  ctx.lineTo(-size * 0.15, -size * 0.1 + walkBob);
  ctx.fill();

  // 头部
  ctx.fillStyle = '#DEB887';
  ctx.beginPath();
  ctx.arc(0, -size * 0.3 + walkBob, size * 0.13, 0, Math.PI * 2);
  ctx.fill();

  // 头带
  ctx.fillStyle = detailColor;
  ctx.fillRect(-size * 0.13, -size * 0.35 + walkBob, size * 0.26, size * 0.04);

  // 眼睛（锐利）
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, -size * 0.32 + walkBob);
  ctx.lineTo(-size * 0.04, -size * 0.31 + walkBob);
  ctx.lineTo(-size * 0.06, -size * 0.3 + walkBob);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.06, -size * 0.32 + walkBob);
  ctx.lineTo(size * 0.04, -size * 0.31 + walkBob);
  ctx.lineTo(size * 0.06, -size * 0.3 + walkBob);
  ctx.fill();

  // 双刀
  ctx.save();
  ctx.translate(size * 0.15, size * 0.05 + walkBob);
  ctx.rotate((attackSwing * Math.PI / 180));
  ctx.strokeStyle = weaponColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.05, -size * 0.35);
  ctx.stroke();
  // 刀光轨迹
  if (isAttacking) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -size * 0.2, size * 0.15, -Math.PI * 0.3, Math.PI * 0.3);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.translate(-size * 0.15, size * 0.05 + walkBob);
  ctx.rotate((-attackSwing * Math.PI / 180));
  ctx.strokeStyle = weaponColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 0.05, -size * 0.35);
  ctx.stroke();
  ctx.restore();

  // 披风
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.12, -size * 0.1 + walkBob);
  ctx.quadraticCurveTo(-size * 0.2, size * 0.15 + walkBob, -size * 0.1, size * 0.35 + walkBob);
  ctx.lineTo(size * 0.05, size * 0.35 + walkBob);
  ctx.quadraticCurveTo(size * 0.1, size * 0.15 + walkBob, size * 0.12, -size * 0.1 + walkBob);
  ctx.fill();

  drawHpBar(ctx, size * 0.45, hpPercent, -size * 0.5 + walkBob);
}

// === 空中兵种 ===

export function drawWindSpirit(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, _detailColor: string, weaponColor: string, hpPercent: number, _isAttacking: boolean): void {
  void _detailColor;
  void _isAttacking;
  const now = Date.now();
  const walkBob = Math.sin(now / 80) * 4;

  // 半透明身体
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, walkBob, size * 0.15, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // 气流轨迹
  ctx.strokeStyle = weaponColor;
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.2 + i * size * 0.1, size * 0.15 + walkBob);
    ctx.quadraticCurveTo(-size * 0.15 + i * size * 0.1, size * 0.3 + walkBob, -size * 0.1 + i * size * 0.1, size * 0.4 + walkBob);
    ctx.stroke();
  }

  // 头部
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(0, -size * 0.25 + walkBob, size * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // 眼睛
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-size * 0.04, -size * 0.27 + walkBob, size * 0.03, 0, Math.PI * 2);
  ctx.arc(size * 0.04, -size * 0.27 + walkBob, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // 翅膀（半透明）
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = weaponColor;
  ctx.beginPath();
  ctx.ellipse(-size * 0.2, -size * 0.1 + walkBob, size * 0.15, size * 0.08, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.2, -size * 0.1 + walkBob, size * 0.15, size * 0.08, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  drawHpBar(ctx, size * 0.35, hpPercent, -size * 0.45 + walkBob);
}

export function drawGargoyle(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, _weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  void _weaponColor;
  const now = Date.now();
  const walkBob = Math.sin(now / 140) * 2;

  // 石质身体
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, size * 0.25 + walkBob);
  ctx.lineTo(size * 0.2, size * 0.25 + walkBob);
  ctx.lineTo(size * 0.15, -size * 0.1 + walkBob);
  ctx.lineTo(-size * 0.15, -size * 0.1 + walkBob);
  ctx.fill();

  // 岩石皮肤纹理
  ctx.strokeStyle = detailColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, 0 + walkBob);
  ctx.lineTo(size * 0.05, size * 0.05 + walkBob);
  ctx.lineTo(size * 0.15, -size * 0.05 + walkBob);
  ctx.stroke();

  // 头部
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(0, -size * 0.3 + walkBob, size * 0.14, 0, Math.PI * 2);
  ctx.fill();

  // 角
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, -size * 0.35 + walkBob);
  ctx.lineTo(-size * 0.15, -size * 0.5 + walkBob);
  ctx.lineTo(-size * 0.05, -size * 0.35 + walkBob);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.1, -size * 0.35 + walkBob);
  ctx.lineTo(size * 0.15, -size * 0.5 + walkBob);
  ctx.lineTo(size * 0.05, -size * 0.35 + walkBob);
  ctx.fill();

  // 眼睛
  ctx.fillStyle = '#FF4500';
  ctx.beginPath();
  ctx.arc(-size * 0.05, -size * 0.32 + walkBob, size * 0.03, 0, Math.PI * 2);
  ctx.arc(size * 0.05, -size * 0.32 + walkBob, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // 石质翅膀
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.15, -size * 0.1 + walkBob);
  ctx.quadraticCurveTo(-size * 0.35, -size * 0.2 + walkBob, -size * 0.4, -size * 0.05 + walkBob);
  ctx.lineTo(-size * 0.35, size * 0.05 + walkBob);
  ctx.lineTo(-size * 0.15, size * 0.05 + walkBob);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.15, -size * 0.1 + walkBob);
  ctx.quadraticCurveTo(size * 0.35, -size * 0.2 + walkBob, size * 0.4, -size * 0.05 + walkBob);
  ctx.lineTo(size * 0.35, size * 0.05 + walkBob);
  ctx.lineTo(size * 0.15, size * 0.05 + walkBob);
  ctx.fill();

  // 碎石飞溅
  if (isAttacking) {
    ctx.fillStyle = detailColor;
    for (let i = 0; i < 4; i++) {
      const x = size * 0.2 + Math.sin(now / 40 + i) * size * 0.08;
      const y = -size * 0.1 + Math.cos(now / 50 + i) * size * 0.06;
      ctx.fillRect(x, y, size * 0.02, size * 0.02);
    }
  }

  drawHpBar(ctx, size * 0.45, hpPercent, -size * 0.55 + walkBob);
}

export function drawPhoenix(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, _detailColor: string, weaponColor: string, hpPercent: number, _isAttacking: boolean): void {
  void _detailColor;
  void _isAttacking;
  const now = Date.now();
  const walkBob = Math.sin(now / 120) * 3;

  // 火焰身体
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, walkBob, size * 0.18, size * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  // 尾焰
  ctx.fillStyle = weaponColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, size * 0.2 + walkBob);
  ctx.quadraticCurveTo(-size * 0.15, size * 0.4 + walkBob, 0, size * 0.45 + walkBob);
  ctx.quadraticCurveTo(size * 0.15, size * 0.4 + walkBob, size * 0.1, size * 0.2 + walkBob);
  ctx.fill();

  // 头部
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(0, -size * 0.3 + walkBob, size * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // 眼睛
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(-size * 0.04, -size * 0.32 + walkBob, size * 0.03, 0, Math.PI * 2);
  ctx.arc(size * 0.04, -size * 0.32 + walkBob, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // 火焰翅膀
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.15, -size * 0.1 + walkBob);
  ctx.quadraticCurveTo(-size * 0.35, -size * 0.25 + walkBob, -size * 0.4, -size * 0.1 + walkBob);
  ctx.quadraticCurveTo(-size * 0.35, 0 + walkBob, -size * 0.15, size * 0.05 + walkBob);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.15, -size * 0.1 + walkBob);
  ctx.quadraticCurveTo(size * 0.35, -size * 0.25 + walkBob, size * 0.4, -size * 0.1 + walkBob);
  ctx.quadraticCurveTo(size * 0.35, 0 + walkBob, size * 0.15, size * 0.05 + walkBob);
  ctx.fill();

  // 火焰光晕
  ctx.fillStyle = 'rgba(255, 99, 71, 0.3)';
  ctx.beginPath();
  ctx.arc(0, walkBob, size * 0.3, 0, Math.PI * 2);
  ctx.fill();

  drawHpBar(ctx, size * 0.5, hpPercent, -size * 0.5 + walkBob);
}

export function drawThunderEagle(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  void isAttacking;
  const now = Date.now();
  const walkBob = Math.sin(now / 130) * 3;

  // 身体
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, walkBob, size * 0.16, size * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // 头部
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(0, -size * 0.28 + walkBob, size * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // 喙
  ctx.fillStyle = weaponColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, -size * 0.25 + walkBob);
  ctx.lineTo(size * 0.08, -size * 0.22 + walkBob);
  ctx.lineTo(-size * 0.03, -size * 0.19 + walkBob);
  ctx.fill();

  // 眼睛
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(-size * 0.04, -size * 0.3 + walkBob, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // 翅膀
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.14, -size * 0.08 + walkBob);
  ctx.quadraticCurveTo(-size * 0.35, -size * 0.2 + walkBob, -size * 0.4, -size * 0.05 + walkBob);
  ctx.quadraticCurveTo(-size * 0.35, size * 0.08 + walkBob, -size * 0.14, size * 0.05 + walkBob);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.14, -size * 0.08 + walkBob);
  ctx.quadraticCurveTo(size * 0.35, -size * 0.2 + walkBob, size * 0.4, -size * 0.05 + walkBob);
  ctx.quadraticCurveTo(size * 0.35, size * 0.08 + walkBob, size * 0.14, size * 0.05 + walkBob);
  ctx.fill();

  // 雷电环绕
  ctx.strokeStyle = weaponColor;
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const angle = (now / 300) + (i / 3) * Math.PI * 2;
    const x = Math.cos(angle) * size * 0.25;
    const y = Math.sin(angle) * size * 0.15 + walkBob;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.03, y);
    ctx.lineTo(x + size * 0.03, y - size * 0.05);
    ctx.lineTo(x - size * 0.02, y + size * 0.03);
    ctx.stroke();
  }

  // 闪电箭
  if (isAttacking) {
    ctx.strokeStyle = weaponColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(size * 0.2, -size * 0.1 + walkBob);
    ctx.lineTo(size * 0.35, -size * 0.2 + walkBob);
    ctx.lineTo(size * 0.3, -size * 0.15 + walkBob);
    ctx.lineTo(size * 0.45, -size * 0.25 + walkBob);
    ctx.stroke();
  }

  drawHpBar(ctx, size * 0.45, hpPercent, -size * 0.5 + walkBob);
}

export function drawAngel(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, _weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  void _weaponColor;
  const now = Date.now();
  const walkBob = Math.sin(now / 140) * 2;

  // 白色长袍
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, size * 0.3 + walkBob);
  ctx.lineTo(size * 0.2, size * 0.3 + walkBob);
  ctx.lineTo(size * 0.15, -size * 0.1 + walkBob);
  ctx.lineTo(-size * 0.15, -size * 0.1 + walkBob);
  ctx.fill();

  // 金色装饰
  ctx.fillStyle = detailColor;
  ctx.fillRect(-size * 0.02, -size * 0.05 + walkBob, size * 0.04, size * 0.2);
  ctx.fillRect(-size * 0.08, size * 0.02 + walkBob, size * 0.16, size * 0.04);

  // 头部
  ctx.fillStyle = '#DEB887';
  ctx.beginPath();
  ctx.arc(0, -size * 0.3 + walkBob, size * 0.13, 0, Math.PI * 2);
  ctx.fill();

  // 光环
  ctx.strokeStyle = detailColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.42 + walkBob, size * 0.15, size * 0.05, 0, 0, Math.PI * 2);
  ctx.stroke();

  // 眼睛
  ctx.fillStyle = '#4169E1';
  ctx.beginPath();
  ctx.arc(-size * 0.04, -size * 0.32 + walkBob, size * 0.03, 0, Math.PI * 2);
  ctx.arc(size * 0.04, -size * 0.32 + walkBob, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // 白色羽翼
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.15, -size * 0.1 + walkBob);
  ctx.quadraticCurveTo(-size * 0.35, -size * 0.25 + walkBob, -size * 0.4, -size * 0.1 + walkBob);
  ctx.quadraticCurveTo(-size * 0.35, size * 0.05 + walkBob, -size * 0.15, size * 0.05 + walkBob);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.15, -size * 0.1 + walkBob);
  ctx.quadraticCurveTo(size * 0.35, -size * 0.25 + walkBob, size * 0.4, -size * 0.1 + walkBob);
  ctx.quadraticCurveTo(size * 0.35, size * 0.05 + walkBob, size * 0.15, size * 0.05 + walkBob);
  ctx.fill();

  // 治疗光束
  if (isAttacking) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.ellipse(size * 0.2, size * 0.1 + walkBob, size * 0.06, size * 0.15, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHpBar(ctx, size * 0.45, hpPercent, -size * 0.5 + walkBob);
}
