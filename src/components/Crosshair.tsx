import React, { memo } from 'react';
import type { CrosshairStyle } from '../types';

interface CrosshairProps {
  x: number;
  y: number;
  style: CrosshairStyle;
  color: string;
  size: number;
  visible: boolean;
}

// Individual crosshair renderers
const DotCrosshair: React.FC<{ color: string; size: number }> = memo(({ color, size }) => (
  <circle cx="12" cy="12" r={size / 3} fill={color} />
));

const CrossCrosshair: React.FC<{ color: string; size: number }> = memo(({ color, size }) => (
  <>
    <line x1="12" y1={12 - size / 2} x2="12" y2={12 + size / 2} stroke={color} strokeWidth={2} strokeLinecap="round" />
    <line x1={12 - size / 2} y1="12" x2={12 + size / 2} y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </>
));

const CircleCrosshair: React.FC<{ color: string; size: number }> = memo(({ color, size }) => (
  <circle cx="12" cy="12" r={size / 2} stroke={color} strokeWidth={2} fill="none" />
));

const TShapeCrosshair: React.FC<{ color: string; size: number }> = memo(({ color, size }) => (
  <>
    <line x1={12 - size/2} y1={12 - size/3} x2={12 + size/2} y2={12 - size/3} stroke={color} strokeWidth={2} strokeLinecap="round" />
    <line x1="12" y1={12 - size/3} x2="12" y2={12 + size/2} stroke={color} strokeWidth={2} strokeLinecap="round" />
  </>
));

const ValorantCrosshair: React.FC<{ color: string; size: number }> = memo(({ color, size }) => (
  <>
    <line x1="12" y1={12 - size/1.5} x2="12" y2={12 - size/4} stroke={color} strokeWidth={2} strokeLinecap="round" />
    <line x1="12" y1={12 + size/4} x2="12" y2={12 + size/1.5} stroke={color} strokeWidth={2} strokeLinecap="round" />
    <line x1={12 - size/1.5} y1="12" x2={12 - size/4} y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <line x1={12 + size/4} y1="12" x2={12 + size/1.5} y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <circle cx="12" cy="12" r="1.5" fill={color} />
  </>
));

const CS2Crosshair: React.FC<{ color: string; size: number }> = memo(({ color, size }) => (
  <>
    <line x1="12" y1={12 - size/1.3} x2="12" y2={12 - size/4} stroke={color} strokeWidth={2} strokeLinecap="round" />
    <line x1="12" y1={12 + size/4} x2="12" y2={12 + size/1.3} stroke={color} strokeWidth={2} strokeLinecap="round" />
    <line x1={12 - size/1.3} y1="12" x2={12 - size/4} y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <line x1={12 + size/4} y1="12" x2={12 + size/1.3} y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <circle cx="12" cy="12" r="2" fill={color} opacity="0.5" />
  </>
));

const CFCrosshair: React.FC<{ color: string; size: number }> = memo(({ color, size }) => (
  <>
    <line x1="12" y1={12 - size/1.5} x2="12" y2={12 - size/5} stroke={color} strokeWidth={3} strokeLinecap="round" />
    <line x1="12" y1={12 + size/5} x2="12" y2={12 + size/1.5} stroke={color} strokeWidth={3} strokeLinecap="round" />
    <line x1={12 - size/1.5} y1="12" x2={12 - size/5} y2="12" stroke={color} strokeWidth={3} strokeLinecap="round" />
    <line x1={12 + size/5} y1="12" x2={12 + size/1.5} y2="12" stroke={color} strokeWidth={3} strokeLinecap="round" />
  </>
));

// Main Crosshair component
export const Crosshair: React.FC<CrosshairProps> = memo(({ 
  x, 
  y, 
  style, 
  color, 
  size, 
  visible 
}) => {
  if (!visible) return null;

  const renderCrosshair = () => {
    switch (style) {
      case 'dot':
        return <DotCrosshair color={color} size={size} />;
      case 'circle':
        return <CircleCrosshair color={color} size={size} />;
      case 't-shape':
        return <TShapeCrosshair color={color} size={size} />;
      case 'valorant':
        return <ValorantCrosshair color={color} size={size} />;
      case 'cs2':
        return <CS2Crosshair color={color} size={size} />;
      case 'cf':
        return <CFCrosshair color={color} size={size} />;
      case 'cross':
      default:
        return <CrossCrosshair color={color} size={size} />;
    }
  };

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className="game-crosshair"
      style={{
        position: 'fixed',
        left: x - 12,
        top: y - 12,
        zIndex: 99999,
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
    >
      {renderCrosshair()}
    </svg>
  );
});

Crosshair.displayName = 'Crosshair';
DotCrosshair.displayName = 'DotCrosshair';
CrossCrosshair.displayName = 'CrossCrosshair';
CircleCrosshair.displayName = 'CircleCrosshair';
TShapeCrosshair.displayName = 'TShapeCrosshair';
ValorantCrosshair.displayName = 'ValorantCrosshair';
CS2Crosshair.displayName = 'CS2Crosshair';
CFCrosshair.displayName = 'CFCrosshair';