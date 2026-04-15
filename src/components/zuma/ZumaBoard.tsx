/* 祖玛棋盘渲染组件。负责轨道、球链、炮台、飞行球、视觉效果的Canvas渲染。 */

import React, { useRef, useEffect, useCallback } from 'react';
import type { ZumaBoardState, ZumaBallColor, ZumaPowerupType, ZumaVisualEffect } from '../../features/zuma/zumaTypes';
import { ZUMA_BALL_RADIUS, ZUMA_POWERUP_TYPES } from '../../features/zuma/zumaTypes';
import { sampleTrackAtDistance, getTrackTangentAtDistance } from '../../features/zuma/zumaBoardState';

interface ZumaBoardProps {
  state: ZumaBoardState;
  onCanvasClick?: (x: number, y: number) => void;
  onCanvasMouseMove?: (x: number, y: number) => void;
}

const BALL_COLORS: Record<ZumaBallColor, string> = {
  red: '#e74c3c',
  blue: '#3498db',
  green: '#27ae60',
  yellow: '#f1c40f',
  purple: '#9b59b6',
  orange: '#e67e22',
};

const POWERUP_COLORS: Record<ZumaPowerupType, string> = {
  burst: '#ff6b6b',
  lightning: '#ffd93d',
  slow: '#6bcb77',
  rewind: '#4d96ff',
  wild: '#c9b1ff',
};

function getBallColor(color: ZumaBallColor | 'wild' | ZumaPowerupType): string {
  if (color === 'wild') return '#c9b1ff';
  if (ZUMA_POWERUP_TYPES.includes(color as ZumaPowerupType)) {
    return POWERUP_COLORS[color as ZumaPowerupType] || '#888';
  }
  return BALL_COLORS[color as ZumaBallColor] || '#888';
}

function resolveEffectColor(color?: string): string {
  if (!color) return '#fff';
  if (color === 'wild') return getBallColor('wild');
  if ((Object.keys(BALL_COLORS) as ZumaBallColor[]).includes(color as ZumaBallColor)) {
    return getBallColor(color as ZumaBallColor);
  }
  if ((Object.keys(POWERUP_COLORS) as ZumaPowerupType[]).includes(color as ZumaPowerupType)) {
    return getBallColor(color as ZumaPowerupType);
  }
  return color;
}

function drawBallCore(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  radius: number,
): void {
  const gradient = ctx.createRadialGradient(
    x - radius * 0.35,
    y - radius * 0.35,
    radius * 0.2,
    x,
    y,
    radius,
  );
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.18, color);
  gradient.addColorStop(1, 'rgba(10, 15, 28, 0.9)');

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x - radius * 0.3, y - radius * 0.35, radius * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

export const ZumaBoard: React.FC<ZumaBoardProps> = ({ state, onCanvasClick, onCanvasMouseMove }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const drawTrack = useCallback((ctx: CanvasRenderingContext2D, track: typeof state.trackDefinition) => {
    ctx.beginPath();
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 3;

    const points = track.points;
    if (points.length < 2) return;

    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    const finishPoint = sampleTrackAtDistance(track, track.finishLineDistance);

    if (state.dangerLevel === 'critical') {
      const pulseAlpha = 0.5 + state.dangerPulsePhase * 0.5;
      const pulseSize = 20 + state.dangerPulsePhase * 10;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(231, 76, 60, ${pulseAlpha})`;
      ctx.lineWidth = 4;
      ctx.moveTo(finishPoint.x - pulseSize, finishPoint.y - pulseSize);
      ctx.lineTo(finishPoint.x + pulseSize, finishPoint.y + pulseSize);
      ctx.moveTo(finishPoint.x - pulseSize, finishPoint.y + pulseSize);
      ctx.lineTo(finishPoint.x + pulseSize, finishPoint.y - pulseSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(finishPoint.x, finishPoint.y, pulseSize * 1.5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(231, 76, 60, ${pulseAlpha * 0.3})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (state.dangerLevel === 'warning') {
      const pulseAlpha = 0.3 + state.dangerPulsePhase * 0.3;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(243, 156, 18, ${pulseAlpha})`;
      ctx.lineWidth = 4;
      ctx.moveTo(finishPoint.x - 20, finishPoint.y - 20);
      ctx.lineTo(finishPoint.x + 20, finishPoint.y + 20);
      ctx.moveTo(finishPoint.x - 20, finishPoint.y + 20);
      ctx.lineTo(finishPoint.x + 20, finishPoint.y - 20);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.strokeStyle = '#f39c12';
      ctx.lineWidth = 4;
      ctx.moveTo(finishPoint.x - 20, finishPoint.y - 20);
      ctx.lineTo(finishPoint.x + 20, finishPoint.y + 20);
      ctx.moveTo(finishPoint.x - 20, finishPoint.y + 20);
      ctx.lineTo(finishPoint.x + 20, finishPoint.y - 20);
      ctx.stroke();
    }
  }, [state]);

  const drawChain = useCallback((ctx: CanvasRenderingContext2D, chain: typeof state.chains[0]) => {
    const track = state.trackDefinition;
    for (const ball of chain.balls) {
      const pos = sampleTrackAtDistance(track, ball.distanceAlongTrack);
      const color = getBallColor(ball.color);
      ctx.save();
      if (chain.temporarySpeedMultiplier < 1) {
        ctx.shadowColor = 'rgba(107, 203, 119, 0.65)';
        ctx.shadowBlur = 10;
      } else if (chain.isRewinding) {
        ctx.shadowColor = 'rgba(77, 150, 255, 0.65)';
        ctx.shadowBlur = 10;
      } else {
        ctx.shadowColor = `${color}88`;
        ctx.shadowBlur = 6;
      }
      drawBallCore(ctx, pos.x, pos.y, color, ZUMA_BALL_RADIUS);
      ctx.restore();

      if (ball.state === 'powerup' && ball.powerupType) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, ZUMA_BALL_RADIUS * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }
    }
  }, [state]);

  const drawCannon = useCallback((ctx: CanvasRenderingContext2D, cannon: typeof state.cannon) => {
    const cannonRadius = 30;
    const barrelLength = 40;

    ctx.beginPath();
    ctx.arc(cannon.x, cannon.y, cannonRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#2ecc71';
    ctx.fill();
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = 3;
    ctx.stroke();

    const tangent = getTrackTangentAtDistance(state.trackDefinition, 0);
    const defaultAngle = Math.atan2(tangent.dy, tangent.dx);
    const displayAngle = cannon.angle || defaultAngle;

    ctx.beginPath();
    ctx.moveTo(cannon.x, cannon.y);
    ctx.lineTo(
      cannon.x + Math.cos(displayAngle) * barrelLength,
      cannon.y + Math.sin(displayAngle) * barrelLength
    );
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = 8;
    ctx.stroke();

    const currentBallColor = getBallColor(cannon.currentBall);
    ctx.beginPath();
    ctx.arc(
      cannon.x + Math.cos(displayAngle) * (barrelLength - 10),
      cannon.y + Math.sin(displayAngle) * (barrelLength - 10),
      ZUMA_BALL_RADIUS,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = currentBallColor;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();

    const nextBallColor = getBallColor(cannon.nextBall);
    ctx.beginPath();
    ctx.arc(cannon.x, cannon.y, ZUMA_BALL_RADIUS * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = nextBallColor;
    ctx.fill();
  }, [state]);

  const drawFlyingBalls = useCallback((ctx: CanvasRenderingContext2D, balls: typeof state.flyingBalls) => {
    for (const ball of balls) {
      const color = getBallColor(ball.color);
      const velocityLength = Math.hypot(ball.velocityX, ball.velocityY) || 1;
      const dirX = ball.velocityX / velocityLength;
      const dirY = ball.velocityY / velocityLength;
      const trailLength = Math.min(64, 22 + velocityLength * 0.03);
      const tailX = ball.currentX - dirX * trailLength;
      const tailY = ball.currentY - dirY * trailLength;

      ctx.save();
      const trailGradient = ctx.createLinearGradient(ball.currentX, ball.currentY, tailX, tailY);
      trailGradient.addColorStop(0, `${color}ee`);
      trailGradient.addColorStop(0.45, `${color}88`);
      trailGradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = trailGradient;
      ctx.lineWidth = ZUMA_BALL_RADIUS * 1.05;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ball.currentX, ball.currentY);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(ball.currentX, ball.currentY, ZUMA_BALL_RADIUS * 1.55, 0, Math.PI * 2);
      ctx.fillStyle = `${color}2f`;
      ctx.fill();

      ctx.shadowColor = `${color}bb`;
      ctx.shadowBlur = 14;
      drawBallCore(ctx, ball.currentX, ball.currentY, color, ZUMA_BALL_RADIUS);
      ctx.restore();
    }
  }, [state]);

  const drawVisualEffects = useCallback((ctx: CanvasRenderingContext2D, effects: ZumaVisualEffect[], elapsedMs: number) => {
    for (const effect of effects) {
      const progress = Math.min(1, (elapsedMs - effect.startTimeMs) / effect.durationMs);

      switch (effect.effectType) {
        case 'insert': {
          const radius = ZUMA_BALL_RADIUS * (1 + progress * 0.85);
          const alpha = 1 - progress;
          const effectColor = resolveEffectColor(effect.color);

          ctx.beginPath();
          ctx.arc(effect.x, effect.y, radius * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${alpha * 0.18})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();

          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6;
            const inner = radius * 0.55;
            const outer = radius * (1.2 + progress * 0.35);
            ctx.beginPath();
            ctx.moveTo(effect.x + Math.cos(angle) * inner, effect.y + Math.sin(angle) * inner);
            ctx.lineTo(effect.x + Math.cos(angle) * outer, effect.y + Math.sin(angle) * outer);
            ctx.strokeStyle = `${effectColor}${Math.round(alpha * 220).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
          break;
        }

        case 'clear': {
          const radius = ZUMA_BALL_RADIUS * Math.max(effect.intensity, 1) * (0.95 + progress * 1.9);
          const alpha = 1 - progress;
          const effectColor = resolveEffectColor(effect.color);

          ctx.beginPath();
          ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `${effectColor}${Math.round(alpha * 60).toString(16).padStart(2, '0')}`;
          ctx.fill();
          ctx.strokeStyle = `${effectColor}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(effect.x, effect.y, radius * 0.38, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${alpha * 0.45})`;
          ctx.fill();

          const particleCount = Math.min(8, 3 + Math.max(effect.intensity, 1));
          for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + progress * 0.7;
            const particleDistance = radius * (0.55 + progress * 0.55);
            const px = effect.x + Math.cos(angle) * particleDistance;
            const py = effect.y + Math.sin(angle) * particleDistance;
            ctx.beginPath();
            ctx.arc(px, py, Math.max(1.5, ZUMA_BALL_RADIUS * 0.18 * (1 - progress * 0.4)), 0, Math.PI * 2);
            ctx.fillStyle = `${effectColor}${Math.round(alpha * 230).toString(16).padStart(2, '0')}`;
            ctx.fill();
          }
          break;
        }

        case 'chainCombo': {
          const radius = ZUMA_BALL_RADIUS * 2 * (1 + progress * 3);
          const alpha = 1 - progress;
          const hue = 30 + effect.intensity * 20;
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha * 0.4})`;
          ctx.fill();
          ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${alpha})`;
          ctx.lineWidth = 4;
          ctx.stroke();

          ctx.save();
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx.fillText(`x${effect.intensity}`, effect.x, effect.y - radius * 0.15);
          ctx.restore();
          break;
        }

        case 'powerup': {
          const radius = ZUMA_BALL_RADIUS * 3 * (1 + progress * 2);
          const alpha = 1 - progress;
          const powerupColor = effect.powerupType ? POWERUP_COLORS[effect.powerupType] : '#fff';
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `${powerupColor}${Math.round(alpha * 80).toString(16).padStart(2, '0')}`;
          ctx.fill();

          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + progress * Math.PI;
            const rayX = effect.x + Math.cos(angle) * radius * 0.8;
            const rayY = effect.y + Math.sin(angle) * radius * 0.8;
            ctx.beginPath();
            ctx.moveTo(effect.x, effect.y);
            ctx.lineTo(rayX, rayY);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          break;
        }

        case 'scorePopup': {
          const offsetY = -20 - progress * 30;
          const alpha = 1 - progress;
          const scale = 1 + progress * 0.2;
          ctx.save();
          ctx.translate(effect.x, effect.y + offsetY);
          ctx.scale(scale, scale);
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
          ctx.fillText(effect.text || '', 0, 0);
          ctx.restore();
          break;
        }

        case 'danger': {
          break;
        }
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawTrack(ctx, state.trackDefinition);

    for (const chain of state.chains) {
      drawChain(ctx, chain);
    }

    drawCannon(ctx, state.cannon);
    drawFlyingBalls(ctx, state.flyingBalls);
    drawVisualEffects(ctx, state.visualEffects, state.elapsedMs);

    if (state.isPaused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('已暂停', canvas.width / 2, canvas.height / 2);
    }
  }, [drawCannon, drawChain, drawFlyingBalls, drawTrack, drawVisualEffects, state]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (state.isPaused) return;
    if (state.phase !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    onCanvasClick?.(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (state.isPaused) return;
    if (state.phase !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    onCanvasMouseMove?.(x, y);
  };

  return (
    <div ref={containerRef} className="zuma-board-container">
      <canvas
        ref={canvasRef}
        className="zuma-board-canvas"
        width={900}
        height={400}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        aria-label="祖玛游戏棋盘"
      />
    </div>
  );
};
