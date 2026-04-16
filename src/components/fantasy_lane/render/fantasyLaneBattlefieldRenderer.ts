import { drawUnitOnCanvas } from '../../../features/fantasy_lane/assets/index.ts';
import { FANTASY_LANE_UNIT_MAP } from '../../../features/fantasy_lane/fantasyLaneUnitRegistry.ts';
import type {
  FantasyLaneImpactEffect,
  FantasyLaneProjectile,
  FantasyLaneRuntimeState,
  FantasyLaneUnitInstance,
} from '../../../features/fantasy_lane/fantasyLaneTypes.ts';

interface FantasyLaneCanvasViewport {
  width: number;
  height: number;
  pixelRatio: number;
}

interface FantasyLaneRendererOptions {
  debug?: boolean;
}

type ProjectileShapeKind =
  | 'arrow'
  | 'bolt'
  | 'shot'
  | 'shard'
  | 'glob'
  | 'spark'
  | 'fireball'
  | 'holy_bolt'
  | 'leaf'
  | 'element_orb'
  | 'heal_beam'
  | 'bomb'
  | 'slash'
  | 'gust'
  | 'stone'
  | 'javelin'
  | 'orb';

function asArray<T>(value: T[] | undefined | null) {
  return Array.isArray(value) ? value : [];
}

const FOOTPRINT_SCALE = {
  small: 0.72,
  medium: 0.86,
  large: 1,
  giant: 1.18,
} as const;

const IMPACT_LIFETIME_MS = {
  hit: 320,
  aoe: 500,
  skill: 420,
} as const;

const AIR_Y_OFFSET = -18;
const GROUND_Y_OFFSET = 6;
const DENSITY_BUCKETS = 14;
const MAX_DEBUG_TARGET_LINES = 28;

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function toCanvasX(width: number, percentX: number) {
  return (percentX / 100) * width;
}

function toCanvasY(height: number, normalizedY: number) {
  return normalizedY * height;
}

function getUnitScale(unit: FantasyLaneUnitInstance) {
  const definition = FANTASY_LANE_UNIT_MAP[unit.templateId];
  if (!definition) return 1;
  const baseScale = FOOTPRINT_SCALE[definition.footprint] ?? 1;
  return baseScale * (unit.layer === 'air' ? 1.05 : 1);
}

function getProjectileKind(projectile: FantasyLaneProjectile): ProjectileShapeKind {
  const definition = FANTASY_LANE_UNIT_MAP[projectile.sourceUnitId];
  if (projectile.sourceUnitId === 'archer' || projectile.sourceUnitId === 'elf_shooter') return 'arrow';
  if (projectile.sourceUnitId === 'ballista' || projectile.sourceUnitId === 'heavy_crossbow') return 'bolt';
  if (projectile.sourceUnitId === 'musketeer') return 'shot';
  if (projectile.sourceUnitId === 'ice_witch') return 'shard';
  if (projectile.sourceUnitId === 'plague_thrower') return 'glob';
  if (projectile.sourceUnitId === 'thunder_mage' || projectile.sourceUnitId === 'thunder_eagle') return 'spark';
  if (
    projectile.sourceUnitId === 'flame_warlock' ||
    projectile.sourceUnitId === 'fire_dragon' ||
    projectile.sourceUnitId === 'young_dragon' ||
    projectile.sourceUnitId === 'phoenix'
  ) {
    return 'fireball';
  }
  if (projectile.sourceUnitId === 'holy_knight' || projectile.sourceUnitId === 'angel') return 'holy_bolt';
  if (projectile.sourceUnitId === 'druid') return 'leaf';
  if (projectile.sourceUnitId === 'elementalist') return 'element_orb';
  if (projectile.sourceUnitId === 'field_medic') return 'heal_beam';
  if (projectile.sourceUnitId === 'demolitionist') return 'bomb';
  if (projectile.sourceUnitId === 'blade_master') return 'slash';
  if (projectile.sourceUnitId === 'wind_spirit') return 'gust';
  if (projectile.sourceUnitId === 'gargoyle') return 'stone';
  if (definition?.damageType === 'antiAir') return 'javelin';
  if (definition?.damageType === 'magic') return 'orb';
  return 'orb';
}

function drawProjectileCore(ctx: CanvasRenderingContext2D, kind: ProjectileShapeKind) {
  switch (kind) {
    case 'arrow':
      ctx.beginPath();
      ctx.moveTo(-11, 0);
      ctx.lineTo(-4, -2.3);
      ctx.lineTo(6, -2.3);
      ctx.lineTo(11, 0);
      ctx.lineTo(6, 2.3);
      ctx.lineTo(-4, 2.3);
      ctx.closePath();
      ctx.fill();
      break;
    case 'bolt':
      ctx.beginPath();
      ctx.moveTo(-13, 0);
      ctx.lineTo(-4, -2.6);
      ctx.lineTo(9, -2.6);
      ctx.lineTo(13, 0);
      ctx.lineTo(9, 2.6);
      ctx.lineTo(-4, 2.6);
      ctx.closePath();
      ctx.fill();
      break;
    case 'shot':
      ctx.beginPath();
      ctx.arc(0, 0, 3.6, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'shard':
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(2, -3);
      ctx.lineTo(10, 0);
      ctx.lineTo(2, 3);
      ctx.closePath();
      ctx.fill();
      break;
    case 'spark':
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(-2, -2.5);
      ctx.lineTo(2, -0.5);
      ctx.lineTo(8, -4);
      ctx.lineTo(4, 0);
      ctx.lineTo(10, 2);
      ctx.lineTo(2, 2.5);
      ctx.lineTo(-2, 4);
      ctx.closePath();
      ctx.fill();
      break;
    case 'fireball':
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha *= 0.5;
      ctx.beginPath();
      ctx.arc(-6, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'holy_bolt':
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha *= 0.45;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'leaf':
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 4.4, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'element_orb':
      ctx.beginPath();
      ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha *= 0.45;
      ctx.beginPath();
      ctx.arc(0, 0, 9.5, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'heal_beam':
      ctx.fillRect(-2.5, -8, 5, 16);
      break;
    case 'bomb':
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha *= 0.5;
      ctx.fillRect(2, -8, 2, 3);
      break;
    case 'slash':
      ctx.beginPath();
      ctx.moveTo(-13, 1);
      ctx.lineTo(-3, -3);
      ctx.lineTo(10, -1.8);
      ctx.lineTo(13, 1);
      ctx.lineTo(0, 3.3);
      ctx.closePath();
      ctx.fill();
      break;
    case 'gust':
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 3.4, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'stone':
      ctx.beginPath();
      ctx.moveTo(-3, -5);
      ctx.lineTo(3, -5);
      ctx.lineTo(5, -3);
      ctx.lineTo(5, 3);
      ctx.lineTo(3, 5);
      ctx.lineTo(-3, 5);
      ctx.lineTo(-5, 3);
      ctx.lineTo(-5, -3);
      ctx.closePath();
      ctx.fill();
      break;
    case 'javelin':
      ctx.beginPath();
      ctx.moveTo(-11, 0);
      ctx.lineTo(-4, -1.8);
      ctx.lineTo(9, -1.8);
      ctx.lineTo(12, 0);
      ctx.lineTo(9, 1.8);
      ctx.lineTo(-4, 1.8);
      ctx.closePath();
      ctx.fill();
      break;
    case 'glob':
    case 'orb':
    default:
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
}

function drawProjectile(ctx: CanvasRenderingContext2D, projectile: FantasyLaneProjectile, width: number, height: number) {
  const x = toCanvasX(width, projectile.x);
  const y = toCanvasY(height, projectile.y);
  const angle = Math.atan2(
    toCanvasY(height, projectile.toY - projectile.fromY),
    toCanvasX(width, projectile.toX - projectile.fromX),
  );
  const kind = getProjectileKind(projectile);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = projectile.color;
  ctx.strokeStyle = projectile.color;
  ctx.globalAlpha = projectile.layer === 'air' ? 0.95 : 0.88;

  ctx.lineWidth = projectile.layer === 'air' ? 2.4 : 2;
  ctx.globalAlpha *= 0.35;
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.lineTo(0, 0);
  ctx.stroke();

  ctx.globalAlpha *= 0.85;
  drawProjectileCore(ctx, kind);
  ctx.restore();
}

function drawImpact(ctx: CanvasRenderingContext2D, impact: FantasyLaneImpactEffect, width: number, height: number) {
  const x = toCanvasX(width, impact.x);
  const y = toCanvasY(height, impact.y);
  const maxLifetime = IMPACT_LIFETIME_MS[impact.kind];
  const life = clamp(impact.remainingMs / maxLifetime);
  const radiusBase = impact.kind === 'hit' ? 10 : impact.kind === 'aoe' ? 20 : 24;
  const radius = radiusBase + (1 - life) * 14;

  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = impact.color;
  ctx.fillStyle = impact.color;
  ctx.globalAlpha = 0.2 + life * 0.6;

  ctx.lineWidth = impact.kind === 'hit' ? 2 : 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  if (impact.kind !== 'hit') {
    ctx.globalAlpha *= 0.66;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }

  if (impact.kind === 'skill') {
    ctx.globalAlpha *= 0.9;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}

function drawHealthBar(ctx: CanvasRenderingContext2D, x: number, y: number, hpPercent: number, side: 'player' | 'enemy', scale: number) {
  const width = Math.max(20, 30 * scale);
  const height = 3.5;
  const barX = x - width / 2;
  const barY = y - (22 + 10 * scale);
  const fillWidth = Math.max(2, Math.round(width * clamp(hpPercent)));

  ctx.save();
  ctx.globalAlpha = 0.82;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.42)';
  ctx.fillRect(barX, barY, width, height);
  ctx.fillStyle = side === 'player' ? '#22c55e' : '#ef4444';
  ctx.fillRect(barX, barY, fillWidth, height);
  ctx.restore();
}

function drawUnit(ctx: CanvasRenderingContext2D, unit: FantasyLaneUnitInstance, state: FantasyLaneRuntimeState, width: number, height: number) {
  const definition = FANTASY_LANE_UNIT_MAP[unit.templateId];
  if (!definition) return;

  const x = toCanvasX(width, unit.x);
  const y = toCanvasY(height, unit.y) + (unit.layer === 'air' ? AIR_Y_OFFSET : GROUND_Y_OFFSET);
  const hpPercent = clamp(unit.hp / definition.maxHp);
  const isBoss = state.bossUnitInstanceId === unit.instanceId;
  const scale = getUnitScale(unit) * (isBoss ? 1.12 : 1);
  const isAttacking = unit.attackAnimMs > 0;

  if (unit.hitFlashMs > 0 || isBoss) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = unit.hitFlashMs > 0 ? 0.4 : 0.25;
    ctx.strokeStyle = unit.side === 'player' ? '#2563eb' : '#dc2626';
    ctx.lineWidth = isBoss ? 2.2 : 1.3;
    ctx.beginPath();
    ctx.arc(0, 0, 18 * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawUnitOnCanvas(ctx, unit.templateId, x, y, hpPercent, isAttacking, {
    side: unit.side,
    mirror: unit.side === 'enemy',
    scale,
  });

  if (isBoss || hpPercent < 0.98) {
    drawHealthBar(ctx, x, y, hpPercent, unit.side, scale);
  }
}

function drawDebugTargetLines(ctx: CanvasRenderingContext2D, state: FantasyLaneRuntimeState, width: number, height: number) {
  const unitMap = new Map(state.units.map((unit) => [unit.instanceId, unit]));
  let rendered = 0;

  for (const unit of state.units) {
    if (rendered >= MAX_DEBUG_TARGET_LINES) break;
    const targetId = unit.combatState?.currentTargetId ?? unit.lastTargetId;
    if (!targetId) continue;
    const target = unitMap.get(targetId);
    if (!target) continue;

    const definition = FANTASY_LANE_UNIT_MAP[unit.templateId];
    if (!definition) continue;

    const sourceX = toCanvasX(width, unit.x);
    const sourceY = toCanvasY(height, unit.y) + (unit.layer === 'air' ? AIR_Y_OFFSET : GROUND_Y_OFFSET);
    const targetX = toCanvasX(width, target.x);
    const targetY = toCanvasY(height, target.y) + (target.layer === 'air' ? AIR_Y_OFFSET : GROUND_Y_OFFSET);
    const dx = Math.abs(unit.x - target.x);
    const dy = Math.abs(unit.y - target.y) * 100;
    const inRange = Math.sqrt(dx * dx + dy * dy) <= definition.attackRange;

    ctx.save();
    ctx.strokeStyle = inRange ? 'rgba(34, 197, 94, 0.56)' : 'rgba(245, 158, 11, 0.52)';
    ctx.lineWidth = inRange ? 1.8 : 1.2;
    ctx.setLineDash(inRange ? [3, 4] : [6, 6]);
    ctx.beginPath();
    ctx.moveTo(sourceX, sourceY);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();
    ctx.restore();
    rendered += 1;
  }
}

function drawDebugDensity(ctx: CanvasRenderingContext2D, state: FantasyLaneRuntimeState, width: number, height: number) {
  const playerCounts = new Array<number>(DENSITY_BUCKETS).fill(0);
  const enemyCounts = new Array<number>(DENSITY_BUCKETS).fill(0);
  const bucketSize = 100 / DENSITY_BUCKETS;

  for (const unit of state.units) {
    const bucketIndex = Math.max(0, Math.min(DENSITY_BUCKETS - 1, Math.floor(unit.x / bucketSize)));
    if (unit.side === 'player') {
      playerCounts[bucketIndex] += 1;
    } else {
      enemyCounts[bucketIndex] += 1;
    }
  }

  const maxCount = Math.max(1, ...playerCounts, ...enemyCounts);
  const chartHeight = Math.min(52, Math.max(34, Math.round(height * 0.12)));
  const baseline = height - 6;
  const bucketWidthPx = width / DENSITY_BUCKETS;

  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
  ctx.fillRect(0, height - chartHeight - 10, width, chartHeight + 10);

  for (let index = 0; index < DENSITY_BUCKETS; index += 1) {
    const left = index * bucketWidthPx + 1;
    const usableWidth = Math.max(2, bucketWidthPx - 2);
    const playerHeight = (playerCounts[index] / maxCount) * chartHeight;
    const enemyHeight = (enemyCounts[index] / maxCount) * chartHeight;

    ctx.fillStyle = 'rgba(59, 130, 246, 0.68)';
    ctx.fillRect(left, baseline - playerHeight, usableWidth * 0.48, playerHeight);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.68)';
    ctx.fillRect(left + usableWidth * 0.52, baseline - enemyHeight, usableWidth * 0.48, enemyHeight);
  }

  ctx.fillStyle = 'rgba(241, 245, 249, 0.84)';
  ctx.font = '10px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('DENS', 8, height - chartHeight - 14);
  ctx.restore();
}

function drawDebugOverlay(ctx: CanvasRenderingContext2D, state: FantasyLaneRuntimeState, width: number, height: number) {
  drawDebugTargetLines(ctx, state, width, height);
  drawDebugDensity(ctx, state, width, height);
}

export function drawFantasyLaneBattlefieldCanvas(
  ctx: CanvasRenderingContext2D,
  state: FantasyLaneRuntimeState,
  viewport: FantasyLaneCanvasViewport,
  options: FantasyLaneRendererOptions = {},
) {
  const { width, height, pixelRatio } = viewport;
  if (width <= 0 || height <= 0) return;
  const units = asArray(state.units);
  const projectiles = asArray(state.projectiles);
  const impacts = asArray(state.impacts);
  const renderState: FantasyLaneRuntimeState = {
    ...state,
    units,
    projectiles,
    impacts,
  };

  ctx.save();
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.clearRect(0, 0, width, height);

  for (const projectile of projectiles) {
    drawProjectile(ctx, projectile, width, height);
  }

  for (const impact of impacts) {
    drawImpact(ctx, impact, width, height);
  }

  const sortedUnits = units
    .slice()
    .sort((left, right) => {
      if (left.layer !== right.layer) return left.layer === 'ground' ? -1 : 1;
      return left.y - right.y;
    });

  for (const unit of sortedUnits) {
    drawUnit(ctx, unit, renderState, width, height);
  }

  if (options.debug) {
    drawDebugOverlay(ctx, renderState, width, height);
  }

  ctx.restore();
}
