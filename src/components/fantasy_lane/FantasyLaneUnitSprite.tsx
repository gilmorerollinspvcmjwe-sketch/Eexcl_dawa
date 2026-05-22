import React, { useEffect, useRef } from 'react';
import { drawUnitOnCanvas } from '../../features/fantasy_lane/assets/index.ts';
import type { FantasyLaneSide } from '../../features/fantasy_lane/fantasyLaneTypes.ts';

interface FantasyLaneUnitSpriteProps {
  unitId: string;
  side: FantasyLaneSide;
  hpPercent: number;
  isAttacking: boolean;
  animated: boolean;
  scale?: number;
  className?: string;
}

const SPRITE_WIDTH = 64;
const SPRITE_HEIGHT = 58;
const TARGET_FPS = 12;

export const FantasyLaneUnitSprite: React.FC<FantasyLaneUnitSpriteProps> = ({
  unitId,
  side,
  hpPercent,
  isAttacking,
  animated,
  scale = 1,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const devicePixelRatio = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;

    const displayWidth = Math.round(SPRITE_WIDTH * scale);
    const displayHeight = Math.round(SPRITE_HEIGHT * scale);

    canvas.width = Math.round(displayWidth * devicePixelRatio);
    canvas.height = Math.round(displayHeight * devicePixelRatio);
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    let frameHandle = 0;
    let lastPaintTime = 0;

    const paint = () => {
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      context.clearRect(0, 0, displayWidth, displayHeight);
      drawUnitOnCanvas(
        context,
        unitId,
        displayWidth / 2,
        displayHeight * 0.62,
        hpPercent,
        isAttacking,
        {
          side,
          mirror: side === 'enemy',
          scale: 1.08 * scale,
        },
      );
    };

    paint();

    if (!animated || reducedMotion) {
      return () => window.cancelAnimationFrame(frameHandle);
    }

    const frameDuration = 1000 / TARGET_FPS;
    const loop = (timestamp: number) => {
      if (timestamp - lastPaintTime >= frameDuration) {
        lastPaintTime = timestamp;
        paint();
      }
      frameHandle = window.requestAnimationFrame(loop);
    };

    frameHandle = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frameHandle);
  }, [animated, hpPercent, isAttacking, scale, side, unitId]);

  return <canvas ref={canvasRef} className={className ?? 'fantasy-lane-unit-sprite'} aria-hidden="true" />;
};
