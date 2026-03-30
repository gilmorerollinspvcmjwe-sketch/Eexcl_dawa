// 多格敌人渲染组件

import React from 'react';
import type { MultiGridEnemy, EnemyPart, PartType, Priority } from '../../types/enemy';
import { PART_COLORS, PART_TEXTS, PART_STATE_COLORS, PRIORITY_CONFIG } from '../../types/enemy';

interface MultiGridEnemyRendererProps {
  enemy: MultiGridEnemy;
  cellWidth: number;
  cellHeight: number;
  rowHeaderWidth: number;
  colHeaderHeight: number;
  renderMode?: 'text' | 'icon';
  showPriority?: boolean;
  showHp?: boolean;
  onPartClick?: (enemyId: string, partType: PartType, row: number, col: number) => void;
  colorlessMode?: boolean;
  visualSettings?: {
    colorHarmonyMode?: 'none' | 'complementary' | 'analogous' | 'triadic' | 'split-complementary';
    spawnAnimation?: 'none' | 'fadeIn' | 'popIn' | 'slideUp' | 'bounceIn' | 'flashIn';
    enemyFontSize?: number;
    enemyFontWeight?: string;
  };
  isCurrentTarget?: boolean;
}

interface PartCellProps {
  part: EnemyPart;
  style: React.CSSProperties;
  renderMode: 'text' | 'icon';
  showHp: boolean;
  enemyId: string;
  absoluteRow: number;
  absoluteCol: number;
  onPartClick?: (enemyId: string, partType: PartType, row: number, col: number) => void;
  colorlessMode?: boolean;
  visualSettings?: {
    colorHarmonyMode?: 'none' | 'complementary' | 'analogous' | 'triadic' | 'split-complementary';
    enemyFontSize?: number;
    enemyFontWeight?: string;
  };
  partIndex?: number;
}

const PartCell: React.FC<PartCellProps> = ({
  part,
  style,
  renderMode,
  showHp,
  enemyId,
  absoluteRow,
  absoluteCol,
  onPartClick,
  colorlessMode = false,
  visualSettings,
  partIndex = 0,
}) => {
  if (part.state === 'destroyed') {
    return null;
  }

  const baseColor = PART_COLORS[part.type];
  const stateColor = PART_STATE_COLORS[part.state];
  const isDamaged = part.state === 'damaged' || part.state === 'critical';

  const getHarmonyColor = (baseHue: number, index: number): string => {
    const mode = visualSettings?.colorHarmonyMode || 'none';
    let hue = baseHue;
    
    switch (mode) {
      case 'complementary':
        hue = index === 0 ? baseHue : (baseHue + 180) % 360;
        break;
      case 'analogous':
        hue = (baseHue + index * 30) % 360;
        break;
      case 'triadic':
        hue = (baseHue + index * 120) % 360;
        break;
      case 'split-complementary':
        hue = index === 0 ? baseHue : (baseHue + 150 + (index - 1) * 60) % 360;
        break;
      default:
        return baseColor;
    }
    
    return `hsl(${hue}, 80%, 50%)`;
  };

  const partColor = visualSettings?.colorHarmonyMode && visualSettings.colorHarmonyMode !== 'none'
    ? getHarmonyColor(0, partIndex)
    : baseColor;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPartClick) {
      onPartClick(enemyId, part.type, absoluteRow, absoluteCol);
    }
  };

  if (colorlessMode) {
    const colorlessStyle: React.CSSProperties = {
      ...style,
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      border: 'none',
      color: '#000000',
      fontFamily: 'SimSun, 宋体, serif',
      fontSize: visualSettings?.enemyFontSize || 14,
      fontWeight: (visualSettings?.enemyFontWeight as any) || 'normal',
      cursor: 'crosshair',
      pointerEvents: 'auto',
    };

    return (
      <div 
        style={{
          ...colorlessStyle,
          cursor: 'crosshair',
          pointerEvents: 'auto',
        }}
        onClick={handleClick}
      >
        {PART_TEXTS[part.type]}
      </div>
    );
  }

  const cellStyle: React.CSSProperties = {
    ...style,
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: part.state === 'critical' 
      ? `linear-gradient(135deg, ${partColor} 0%, #ef4444 100%)`
      : partColor,
    border: `2px solid ${isDamaged ? stateColor : 'rgba(0,0,0,0.3)'}`,
    borderRadius: part.type === 'head' ? '50%' : '4px',
    color: 'white',
    fontWeight: (visualSettings?.enemyFontWeight as any) || 'bold',
    fontSize: visualSettings?.enemyFontSize || 11,
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
    transition: 'all 0.15s ease-out',
    boxShadow: isDamaged 
      ? `0 0 8px ${stateColor}, inset 0 0 4px rgba(255,255,255,0.3)`
      : 'none',
    animation: part.state === 'critical' ? 'pulse 0.5s ease-in-out infinite' : 'none',
    cursor: 'crosshair',
    pointerEvents: 'auto',
  };

  const hpDisplay = showHp && part.maxHp > 1 ? (
    <span style={{ 
      position: 'absolute', 
      bottom: -12, 
      fontSize: 9, 
      background: 'rgba(0,0,0,0.7)',
      padding: '1px 4px',
      borderRadius: 2,
    }}>
      {part.currentHp}/{part.maxHp}
    </span>
  ) : null;

  return (
    <div 
      style={{
        ...cellStyle,
        cursor: 'crosshair',
        pointerEvents: 'auto',
      }}
      onClick={handleClick}
    >
      {renderMode === 'text' ? PART_TEXTS[part.type] : getPartIcon(part.type)}
      {hpDisplay}
    </div>
  );
};

function getPartIcon(partType: PartType): string {
  switch (partType) {
    case 'head': return '●';
    case 'body': return '■';
    case 'leftHand':
    case 'rightHand': return '◆';
    case 'foot': return '▲';
    default: return '●';
  }
}

const PriorityLabel: React.FC<{ priority: Priority; colorlessMode?: boolean; isCurrentTarget?: boolean }> = ({ 
  priority, 
  colorlessMode = false,
  isCurrentTarget = false 
}) => {
  if (colorlessMode) return null;
  // Handle FPS mode priorities (A, B, C, D, E)
  if (['A', 'B', 'C', 'D', 'E'].includes(priority)) {
    return (
      <div style={{
        position: 'absolute',
        top: -24,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: isCurrentTarget ? 'rgba(255, 215, 0, 0.9)' : 'rgba(0,0,0,0.8)',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: isCurrentTarget ? 12 : 10,
        color: isCurrentTarget ? '#000' : '#fff',
        fontWeight: 'bold',
        boxShadow: isCurrentTarget ? '0 0 10px rgba(255, 215, 0, 0.8)' : 'none',
        animation: isCurrentTarget ? 'pulse 1s ease-in-out infinite' : 'none',
      }}>
        {priority}
        {isCurrentTarget && <span style={{ marginLeft: 2 }}>👈</span>}
      </div>
    );
  }
  const config = PRIORITY_CONFIG[priority as 'critical' | 'high' | 'medium' | 'low'];
  return (
    <div style={{
      position: 'absolute',
      top: -20,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      background: 'rgba(0,0,0,0.8)',
      padding: '2px 6px',
      borderRadius: 4,
      fontSize: 10,
      color: 'white',
      whiteSpace: 'nowrap',
    }}>
      <span>{config.icon}</span>
      <span style={{ color: config.color }}>P{['critical', 'high', 'medium', 'low'].indexOf(priority) + 1}</span>
    </div>
  );
};

const HealthBar: React.FC<{ enemy: MultiGridEnemy; colorlessMode?: boolean }> = ({ enemy, colorlessMode = false }) => {
  if (colorlessMode) return null;
  const totalHp = enemy.parts.reduce((sum, p) => sum + p.maxHp, 0);
  const currentHp = enemy.parts.reduce((sum, p) => sum + p.currentHp, 0);
  const percent = (currentHp / totalHp) * 100;

  return (
    <div style={{
      position: 'absolute',
      top: -8,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 60,
      height: 4,
      background: 'rgba(0,0,0,0.5)',
      borderRadius: 2,
      overflow: 'hidden',
    }}>
      <div style={{
        width: `${percent}%`,
        height: '100%',
        background: percent > 60 ? '#22c55e' : percent > 30 ? '#eab308' : '#ef4444',
        transition: 'width 0.2s ease-out',
      }} />
    </div>
  );
};

export const MultiGridEnemyRenderer: React.FC<MultiGridEnemyRendererProps> = ({
  enemy,
  cellWidth,
  cellHeight,
  rowHeaderWidth,
  colHeaderHeight,
  renderMode = 'text',
  showPriority = true,
  showHp = true,
  onPartClick,
  colorlessMode = false,
  visualSettings,
  isCurrentTarget = false,
}) => {
  if (enemy.peekState === 'hidden') return null;

  let offsetX = 0;
  let offsetY = 0;

  if (enemy.peekState === 'peeking' || enemy.peekState === 'returning') {
    const progress = enemy.peekProgress ?? 0;
    offsetX = (enemy.peekDirection === 'left' ? -1 : 1) * (1 - progress) * cellWidth * 3;
  }

  const baseLeft = rowHeaderWidth + (enemy.anchorCol - 1) * cellWidth + offsetX;
  const baseTop = colHeaderHeight + (enemy.anchorRow - 1) * cellHeight + offsetY;

  const isDying = enemy.state === 'dying' || !enemy.isAlive;

  return (
    <div
      className={`multi-grid-enemy ${isDying ? 'enemy-dying' : ''} ${isCurrentTarget ? 'current-target' : ''}`}
      data-enemy-id={enemy.id}
      style={{
        position: 'absolute',
        left: baseLeft,
        top: baseTop,
        pointerEvents: 'auto',
        zIndex: isCurrentTarget ? 200 : 100,
        opacity: isDying ? 0 : 1,
        transform: isDying ? 'scale(1.2)' : isCurrentTarget ? 'scale(1.1)' : 'scale(1)',
        transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
        boxShadow: isCurrentTarget ? '0 0 20px 5px rgba(255, 215, 0, 0.8), 0 0 40px 10px rgba(255, 215, 0, 0.4)' : 'none',
        borderRadius: 8,
      }}
    >
      {showPriority && enemy.priority && !isDying && !colorlessMode && (
        <PriorityLabel priority={enemy.priority} colorlessMode={colorlessMode} isCurrentTarget={isCurrentTarget} />
      )}

      {!isDying && !colorlessMode && <HealthBar enemy={enemy} colorlessMode={colorlessMode} />}

      {enemy.parts.map((part, index) => {
        if (part.state === 'destroyed') return null;

        const left = part.relativeCol * cellWidth;
        const top = part.relativeRow * cellHeight;
        
        const absoluteRow = Math.round(enemy.anchorRow + part.relativeRow);
        const absoluteCol = Math.round(enemy.anchorCol + part.relativeCol);

        return (
          <PartCell
            key={`${part.type}-${index}`}
            part={part}
            style={{
              left,
              top,
              width: cellWidth - 2,
              height: cellHeight - 2,
            }}
            renderMode={renderMode}
            showHp={showHp && !colorlessMode}
            enemyId={enemy.id}
            absoluteRow={absoluteRow}
            absoluteCol={absoluteCol}
            onPartClick={onPartClick}
            colorlessMode={colorlessMode}
            visualSettings={visualSettings}
            partIndex={index}
          />
        );
      })}
    </div>
  );
};

interface MultiGridEnemiesProps {
  enemies: MultiGridEnemy[];
  cellWidth: number;
  cellHeight: number;
  rowHeaderWidth: number;
  colHeaderHeight: number;
  renderMode?: 'text' | 'icon';
  showPriority?: boolean;
  showHp?: boolean;
  onPartClick?: (enemyId: string, partType: PartType, row: number, col: number) => void;
  colorlessMode?: boolean;
  visualSettings?: {
    colorHarmonyMode?: 'none' | 'complementary' | 'analogous' | 'triadic' | 'split-complementary';
    spawnAnimation?: 'none' | 'fadeIn' | 'popIn' | 'slideUp' | 'bounceIn' | 'flashIn';
    enemyFontSize?: number;
    enemyFontWeight?: string;
  };
  currentPriorityTarget?: Priority | null;
  fpsMode?: string | null;
}

export const MultiGridEnemies: React.FC<MultiGridEnemiesProps> = ({
  enemies,
  cellWidth,
  cellHeight,
  rowHeaderWidth,
  colHeaderHeight,
  renderMode = 'text',
  showPriority = true,
  showHp = true,
  onPartClick,
  colorlessMode = false,
  visualSettings,
  currentPriorityTarget,
  fpsMode,
}) => {
  return (
    <div className="multi-grid-enemies-container" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {enemies.map(enemy => {
        // switch_track 模式：检查是否是当前应该击中的目标
        const isCurrentTarget = fpsMode === 'switch_track' && 
          enemy.priority === currentPriorityTarget &&
          enemy.isAlive;
        
        return (
          <MultiGridEnemyRenderer
            key={enemy.id}
            enemy={enemy}
            cellWidth={cellWidth}
            cellHeight={cellHeight}
            rowHeaderWidth={rowHeaderWidth}
            colHeaderHeight={colHeaderHeight}
            renderMode={renderMode}
            showPriority={showPriority}
            showHp={showHp}
            onPartClick={onPartClick}
            colorlessMode={colorlessMode}
            visualSettings={visualSettings}
            isCurrentTarget={isCurrentTarget}
          />
        );
      })}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @keyframes flash {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.5); }
        }
        
        .multi-grid-enemy {
          will-change: transform;
        }
      `}</style>
    </div>
  );
};

export default MultiGridEnemyRenderer;
