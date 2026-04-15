/* 近战冲锋兵种绘制：狼骑兵、狂战士、地穴爬兽、暗影刺客 */

export function drawWolfRider(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  void weaponColor;
  const now = Date.now();
  const runBob = Math.sin(now / 100) * 3;
  const attackThrust = isAttacking ? Math.sin(now / 50) * 12 : 0;

  // 狼身体（流线型）
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.15 + runBob, size * 0.4, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // 狼毛纹理
  ctx.strokeStyle = detailColor;
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.3 + i * size * 0.15, size * 0.1 + runBob);
    ctx.lineTo(-size * 0.25 + i * size * 0.15, size * 0.2 + runBob);
    ctx.stroke();
  }

  // 狼头
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(size * 0.35, size * 0.05 + runBob, size * 0.15, size * 0.1, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // 狼耳朵
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.moveTo(size * 0.3, -size * 0.05 + runBob);
  ctx.lineTo(size * 0.35, -size * 0.15 + runBob);
  ctx.lineTo(size * 0.4, -size * 0.05 + runBob);
  ctx.fill();

  // 狼眼睛
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(size * 0.4, size * 0.03 + runBob, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // 狼尾巴
  const tailWag = Math.sin(now / 150) * 0.3;
  ctx.save();
  ctx.translate(-size * 0.35, size * 0.1 + runBob);
  ctx.rotate(tailWag);
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.15, -size * 0.1, -size * 0.2, 0);
  ctx.fill();
  ctx.restore();

  // 狼腿（奔跑动画）
  ctx.fillStyle = detailColor;
  const legPhase = Math.sin(now / 80);
  ctx.fillRect(-size * 0.2, size * 0.3 + runBob, size * 0.08, size * 0.15 + legPhase * 5);
  ctx.fillRect(-size * 0.05, size * 0.3 + runBob, size * 0.08, size * 0.15 - legPhase * 5);
  ctx.fillRect(size * 0.1, size * 0.3 + runBob, size * 0.08, size * 0.15 - legPhase * 5);
  ctx.fillRect(size * 0.25, size * 0.3 + runBob, size * 0.08, size * 0.15 + legPhase * 5);

  // 骑手
  ctx.fillStyle = '#8B7355';
  ctx.beginPath();
  ctx.ellipse(size * 0.05, -size * 0.15 + runBob, size * 0.15, size * 0.2, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // 兽皮披肩
  ctx.fillStyle = '#A0522D';
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, -size * 0.25 + runBob);
  ctx.quadraticCurveTo(size * 0.1, -size * 0.1 + runBob, size * 0.15, size * 0.05 + runBob);
  ctx.lineTo(size * 0.05, size * 0.05 + runBob);
  ctx.quadraticCurveTo(0, -size * 0.1 + runBob, -size * 0.1, -size * 0.25 + runBob);
  ctx.fill();

  // 兽皮帽带羽毛
  ctx.fillStyle = '#654321';
  ctx.beginPath();
  ctx.arc(size * 0.05, -size * 0.35 + runBob, size * 0.1, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#FF0000';
  ctx.beginPath();
  ctx.moveTo(size * 0.1, -size * 0.4 + runBob);
  ctx.quadraticCurveTo(size * 0.2, -size * 0.5 + runBob, size * 0.15, -size * 0.35 + runBob);
  ctx.fill();

  // 长矛
  ctx.save();
  ctx.translate(size * 0.2, -size * 0.1 + runBob);
  ctx.rotate((attackThrust * Math.PI / 180));
  ctx.strokeStyle = '#8B7355';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.2);
  ctx.lineTo(size * 0.1, -size * 0.5);
  ctx.stroke();
  ctx.fillStyle = '#C0C0C0';
  ctx.beginPath();
  ctx.moveTo(size * 0.1, -size * 0.5);
  ctx.lineTo(size * 0.13, -size * 0.6);
  ctx.lineTo(size * 0.07, -size * 0.6);
  ctx.fill();
  ctx.restore();

  drawHpBar(ctx, size * 0.6, hpPercent, -size * 0.5 + runBob);
}

export function drawBerserker(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  void weaponColor;
  const now = Date.now();
  const walkBob = Math.sin(now / 100) * 3;
  const rageShake = Math.sin(now / 50) * 1;
  const attackSwing = isAttacking ? Math.sin(now / 40) * 25 : 0;

  // 倒三角肌肉身体
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.3, size * 0.3 + walkBob);
  ctx.lineTo(size * 0.3, size * 0.3 + walkBob);
  ctx.lineTo(size * 0.2, -size * 0.1 + walkBob);
  ctx.lineTo(-size * 0.2, -size * 0.1 + walkBob);
  ctx.fill();

  // 胸肌腹肌线条
  ctx.strokeStyle = detailColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.05 + walkBob);
  ctx.lineTo(0, size * 0.2 + walkBob);
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.15, (size * 0.05 + i * size * 0.08) + walkBob);
    ctx.quadraticCurveTo(0, (size * 0.08 + i * size * 0.08) + walkBob, size * 0.15, (size * 0.05 + i * size * 0.08) + walkBob);
    ctx.stroke();
  }

  // 伤疤
  ctx.strokeStyle = '#CC8888';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, size * 0.05 + walkBob);
  ctx.lineTo(size * 0.05, size * 0.15 + walkBob);
  ctx.stroke();

  // 狂野乱发
  ctx.fillStyle = '#8B4513';
  for (let i = 0; i < 7; i++) {
    const angle = -Math.PI + (i / 6) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * size * 0.15, -size * 0.35 + walkBob + Math.sin(angle) * size * 0.1);
    ctx.lineTo(Math.cos(angle) * size * 0.25, -size * 0.45 + walkBob + Math.sin(angle) * size * 0.15);
    ctx.lineTo(Math.cos(angle + 0.2) * size * 0.15, -size * 0.35 + walkBob + Math.sin(angle + 0.2) * size * 0.1);
    ctx.fill();
  }

  // 头部
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(rageShake, -size * 0.35 + walkBob, size * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // 愤怒眼睛
  ctx.fillStyle = '#FF0000';
  ctx.beginPath();
  ctx.arc(-size * 0.05 + rageShake, -size * 0.37 + walkBob, size * 0.04, 0, Math.PI * 2);
  ctx.arc(size * 0.05 + rageShake, -size * 0.37 + walkBob, size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // 怒吼嘴
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(rageShake, -size * 0.28 + walkBob, size * 0.06, 0, Math.PI);
  ctx.fill();

  // 双持弯刀
  ctx.save();
  ctx.translate(-size * 0.25, -size * 0.05 + walkBob);
  ctx.rotate((-attackSwing * Math.PI / 180));
  ctx.strokeStyle = weaponColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.1, -size * 0.2, -size * 0.05, -size * 0.35);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(size * 0.25, -size * 0.05 + walkBob);
  ctx.rotate((attackSwing * Math.PI / 180));
  ctx.strokeStyle = weaponColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.1, -size * 0.2, size * 0.05, -size * 0.35);
  ctx.stroke();
  ctx.restore();

  // 愤怒气场
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const angle = (now / 200 + i * 2) % (Math.PI * 2);
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.4 + Math.sin(angle) * 5, angle - 0.3, angle + 0.3);
    ctx.stroke();
  }

  // 腿
  ctx.fillStyle = detailColor;
  ctx.fillRect(-size * 0.15, size * 0.25 + walkBob, size * 0.1, size * 0.2);
  ctx.fillRect(size * 0.05, size * 0.25 + walkBob, size * 0.1, size * 0.2);

  drawHpBar(ctx, size * 0.5, hpPercent, -size * 0.55 + walkBob);
}

export function drawCryptCrawler(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  const now = Date.now();
  const crawlBob = Math.sin(now / 150) * 1;
  const attackLunge = isAttacking ? Math.sin(now / 60) * 8 : 0;

  // 椭圆形甲壳身体（贴地）
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(attackLunge, size * 0.1 + crawlBob, size * 0.35, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // 甲壳节肢纹理
  ctx.strokeStyle = detailColor;
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(attackLunge, size * 0.1 + crawlBob, size * 0.1 + i * size * 0.06, -0.5, 0.5);
    ctx.stroke();
  }

  // 头部
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(size * 0.3 + attackLunge, size * 0.05 + crawlBob, size * 0.12, size * 0.1, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // 多眼设计（3对）
  ctx.fillStyle = '#FF0000';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(size * 0.35 + attackLunge, (-size * 0.02 + i * size * 0.04) + crawlBob, size * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }

  // 前肢利爪
  ctx.strokeStyle = weaponColor;
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.translate(size * 0.35 + attackLunge, (size * 0.15 + i * size * 0.05) + crawlBob);
    ctx.rotate(0.3 + (isAttacking ? Math.sin(now / 50 + i) * 0.3 : 0));
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.15, size * 0.05);
    ctx.stroke();
    ctx.restore();
  }

  // 6条腿
  ctx.fillStyle = detailColor;
  for (let i = 0; i < 6; i++) {
    const legPhase = Math.sin(now / 100 + i * Math.PI / 3) * 5;
    ctx.fillRect(-size * 0.2 + i * size * 0.1 + attackLunge, size * 0.25 + crawlBob, size * 0.06, size * 0.12 + legPhase);
  }

  drawHpBar(ctx, size * 0.5, hpPercent, -size * 0.15 + crawlBob);
}

export function drawShadowAssassin(ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean): void {
  const now = Date.now();
  const floatBob = Math.sin(now / 200) * 2;
  const attackSlash = isAttacking ? Math.sin(now / 40) * 20 : 0;

  // 半透明
  ctx.globalAlpha = 0.7;

  // 瘦长菱形身体
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.4 + floatBob);
  ctx.lineTo(size * 0.15, size * 0.1 + floatBob);
  ctx.lineTo(0, size * 0.35 + floatBob);
  ctx.lineTo(-size * 0.15, size * 0.1 + floatBob);
  ctx.fill();

  // 黑色飘动披风
  ctx.fillStyle = detailColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.15, -size * 0.2 + floatBob);
  for (let i = 0; i < 5; i++) {
    const wave = Math.sin(now / 150 + i * 0.5) * 5;
    ctx.quadraticCurveTo(-size * 0.25 + wave, (-size * 0.1 + i * size * 0.1) + floatBob, -size * 0.15, (-size * 0.05 + i * size * 0.1) + floatBob);
  }
  ctx.lineTo(0, size * 0.35 + floatBob);
  ctx.fill();

  // 兜帽
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.moveTo(-size * 0.12, -size * 0.3 + floatBob);
  ctx.quadraticCurveTo(0, -size * 0.5 + floatBob, size * 0.12, -size * 0.3 + floatBob);
  ctx.lineTo(size * 0.08, -size * 0.2 + floatBob);
  ctx.lineTo(-size * 0.08, -size * 0.2 + floatBob);
  ctx.fill();

  // 发光眼睛
  ctx.fillStyle = '#00FF00';
  ctx.shadowColor = '#00FF00';
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.arc(-size * 0.04, -size * 0.32 + floatBob, size * 0.025, 0, Math.PI * 2);
  ctx.arc(size * 0.04, -size * 0.32 + floatBob, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // 双匕首
  ctx.save();
  ctx.translate(-size * 0.15, size * 0.05 + floatBob);
  ctx.rotate((-attackSlash * Math.PI / 180) - 0.5);
  ctx.strokeStyle = weaponColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 0.05, -size * 0.25);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(size * 0.15, size * 0.05 + floatBob);
  ctx.rotate((attackSlash * Math.PI / 180) + 0.5);
  ctx.strokeStyle = weaponColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.05, -size * 0.25);
  ctx.stroke();
  ctx.restore();

  // 拖影
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, -size * 0.35 + floatBob);
  ctx.lineTo(size * 0.1, -size * 0.35 + floatBob);
  ctx.lineTo(size * 0.05, size * 0.3 + floatBob);
  ctx.lineTo(-size * 0.05, size * 0.3 + floatBob);
  ctx.fill();

  ctx.globalAlpha = 1.0;

  drawHpBar(ctx, size * 0.4, hpPercent, -size * 0.5 + floatBob);
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
