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

const TShapeCrosshair: React.FC<{ color: string }> = memo(({ color }) => (
  <>
    <line x1="4" y1="6" x2="20" y2="6" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <line x1="12" y1="6" x2="12" y2="18" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </>
));

const ValorantCrosshair: React.FC<{ color: string }> = memo(({ color }) => (
  <>
    <line x1="12" y1="4" x2="12" y2="9" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <line x1="12" y1="15" x2="12" y2="20" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <line x1="4" y1="12" x2="9" y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <line x1="15" y1="12" x2="20" y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <circle cx="12" cy="12" r="1.5" fill={color} />
  </>
));

const CS2Crosshair: React.FC<{ color: string }> = memo(({ color }) => (
  <>
    <line x1="12" y1="3" x2="12" y2="8" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <line x1="12" y1="16" x2="12" y2="21" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <line x1="3" y1="12" x2="8" y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <line x1="16" y1="12" x2="21" y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <circle cx="12" cy="12" r="2" fill={color} opacity="0.5" />
  </>
));

const CFCrosshair: React.FC<{ color: string }> = memo(({ color }) => (
  <>
    <line x1="12" y1="5" x2="12" y2="10" stroke={color} strokeWidth={3} strokeLinecap="round" />
    <line x1="12" y1="14" x2="12" y2="19" stroke={color} strokeWidth={3} strokeLinecap="round" />
    <line x1="5" y1="12" x2="10" y2="12" stroke={color} strokeWidth={3} strokeLinecap="round" />
    <line x1="14" y1="12" x2="19" y2="12" stroke={color} strokeWidth={3} strokeLinecap="round" />
  </>
));

const ApexCrosshair: React.FC<{ color: string }> = memo(({ color }) => (
  <>
    <line x1="12" y1="2" x2="12" y2="8" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <line x1="12" y1="16" x2="12" y2="22" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <line x1="2" y1="12" x2="8" y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <line x1="16" y1="12" x2="22" y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.5} fill="none" />
  </>
));

const OverwatchCrosshair: React.FC<{ color: string }> = memo(({ color }) => (
  <>
    <circle cx="12" cy="12" r="4" stroke={color} strokeWidth={2} fill="none" />
    <line x1="12" y1="4" x2="12" y2="7" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <line x1="12" y1="17" x2="12" y2="20" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <line x1="4" y1="12" x2="7" y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <line x1="17" y1="12" x2="20" y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </>
));

const SplitCrosshair: React.FC<{ color: string }> = memo(({ color }) => (
  <>
    <line x1="12" y1="2" x2="12" y2="9" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <line x1="12" y1="15" x2="12" y2="22" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <line x1="2" y1="12" x2="9" y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <line x1="15" y1="12" x2="22" y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <circle cx="12" cy="12" r="1" fill={color} />
  </>
));

const SquircleCrosshair: React.FC<{ color: string }> = memo(({ color }) => (
  <>
    <rect x="6" y="6" width="12" height="12" rx="3" stroke={color} strokeWidth={2} fill="none" />
    <circle cx="12" cy="12" r="1.5" fill={color} />
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
        return <TShapeCrosshair color={color} />;
      case 'valorant':
        return <ValorantCrosshair color={color} />;
      case 'cs2':
        return <CS2Crosshair color={color} />;
      case 'cf':
        return <CFCrosshair color={color} />;
      case 'apex':
        return <ApexCrosshair color={color} />;
      case 'overwatch':
        return <OverwatchCrosshair color={color} />;
      case 'split':
        return <SplitCrosshair color={color} />;
      case 'squircle':
        return <SquircleCrosshair color={color} />;
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
      style={{
        position: 'fixed',
        left: x - 12,
        top: y - 12,
        pointerEvents: 'none',
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
ApexCrosshair.displayName = 'ApexCrosshair';
OverwatchCrosshair.displayName = 'OverwatchCrosshair';
SplitCrosshair.displayName = 'SplitCrosshair';
SquircleCrosshair.displayName = 'SquircleCrosshair';