/* 奇幻战线兵种绘制模块入口。统一导出6个职责分类的绘制文件。 */

// 前排肉盾
export { drawGoblinShield, drawOrcHeavy, drawStoneGuard, drawDwarfIronwall } from './drawTanks';

// 近战冲锋
export { drawWolfRider, drawBerserker, drawCryptCrawler, drawShadowAssassin } from './drawMelee';

// 远程持续输出
export { drawArcher, drawElfShooter, drawMusketeer, drawBallista } from './drawRanged';

// 法术/范围兵
export { drawFlameWarlock, drawIceWitch, drawPlagueThrower, drawThunderMage } from './drawMagic';

// 空中/特殊兵
export { drawGriffinKnight, drawBatSwarm, drawYoungDragon } from './drawAir';

// 高费终结兵
export { drawTreeAncient, drawOgreLord, drawFireDragon } from './drawBoss';

// 兵种配置
export { UNIT_CONFIGS } from './unitConfigs';
export type { UnitRenderConfig, UnitRole, UnitFaction } from './unitConfigs';

// 便捷绘制函数
import { UNIT_CONFIGS } from './unitConfigs';
import * as drawFns from './drawTanks';
import * as drawMelee from './drawMelee';
import * as drawRanged from './drawRanged';
import * as drawMagic from './drawMagic';
import * as drawAir from './drawAir';
import * as drawBoss from './drawBoss';

// 兵种ID到绘制函数的映射
const DRAW_FN_MAP: Record<string, (ctx: CanvasRenderingContext2D, size: number, bodyColor: string, detailColor: string, weaponColor: string, hpPercent: number, isAttacking: boolean) => void> = {
  // 前排肉盾
  goblin_shield: drawFns.drawGoblinShield,
  orc_heavy: drawFns.drawOrcHeavy,
  stone_guard: drawFns.drawStoneGuard,
  dwarf_ironwall: drawFns.drawDwarfIronwall,
  // 近战冲锋
  wolf_rider: drawMelee.drawWolfRider,
  berserker: drawMelee.drawBerserker,
  crypt_crawler: drawMelee.drawCryptCrawler,
  shadow_assassin: drawMelee.drawShadowAssassin,
  // 远程输出
  archer: drawRanged.drawArcher,
  elf_shooter: drawRanged.drawElfShooter,
  musketeer: drawRanged.drawMusketeer,
  ballista: drawRanged.drawBallista,
  // 法术/范围
  flame_warlock: drawMagic.drawFlameWarlock,
  ice_witch: drawMagic.drawIceWitch,
  plague_thrower: drawMagic.drawPlagueThrower,
  thunder_mage: drawMagic.drawThunderMage,
  // 空中/特殊
  griffin_knight: drawAir.drawGriffinKnight,
  bat_swarm: drawAir.drawBatSwarm,
  young_dragon: drawAir.drawYoungDragon,
  // 高费终结
  tree_ancient: drawBoss.drawTreeAncient,
  ogre_lord: drawBoss.drawOgreLord,
  fire_dragon: drawBoss.drawFireDragon,
};

/** 在Canvas上绘制指定兵种 */
export function drawUnitOnCanvas(
  ctx: CanvasRenderingContext2D,
  unitId: string,
  x: number,
  y: number,
  hpPercent: number,
  isAttacking: boolean = false
): void {
  const config = UNIT_CONFIGS[unitId];
  if (!config) return;

  const drawFn = DRAW_FN_MAP[unitId];
  if (!drawFn) return;

  ctx.save();
  ctx.translate(x, y);
  drawFn(ctx, config.size, config.bodyColor, config.detailColor, config.weaponColor, hpPercent, isAttacking);
  ctx.restore();
}

/** 获取所有兵种ID列表 */
export function getAllUnitIds(): string[] {
  return Object.keys(UNIT_CONFIGS);
}

/** 按角色获取兵种列表 */
export function getUnitsByRole(role: string): string[] {
  return Object.values(UNIT_CONFIGS)
    .filter(u => u.role === role)
    .map(u => u.id);
}

/** 在指定Canvas上绘制所有兵种预览 */
export function renderUnitPreview(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const units = getAllUnitIds();
  const cols = 6;
  const rows = Math.ceil(units.length / cols);
  const cellWidth = canvas.width / cols;
  const cellHeight = canvas.height / rows;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#F5F5F5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  units.forEach((unitId, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = col * cellWidth + cellWidth / 2;
    const y = row * cellHeight + cellHeight / 2;

    drawUnitOnCanvas(ctx, unitId, x, y - 10, 1.0, false);

    ctx.fillStyle = '#333333';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(UNIT_CONFIGS[unitId].name, x, y + cellHeight / 2 - 5);
  });
}
