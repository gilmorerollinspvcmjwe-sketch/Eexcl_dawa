// 多格敌人渲染组件

import React from 'react';
import type { MultiGridEnemy, EnemyPart, PartType, Priority } from '../../types/enemy';
import { PART_COLORS, PART_TEXTS, PART_STATE_COLORS, PRIORITY_CONFIG } from '../../types/enemy';

interface MultiGridEnemyRendererProps {
  enemy: MultiGridEnemy;
  cellWidth: number;
  cellHeight: number;
  renderMode?: 'text' | 'icon';
  showPriority?: boolean;
  showHp?: boolean;
}

// 单个部位渲染
const PartCell: React.FC<{
  part: EnemyPart;
  style: React.CSSProperties;
  renderMode: 'text' | 'icon';
  showHp: boolean;
}> = ({ part, style, renderMode, showHp }) => {
  // 已销毁的部位不渲染
  if (part.state === 'destroyed') {
    return null;
  }

  const baseColor = PART_COLORS[part.type];
  const stateColor = PART_STATE_COLORS[part.state];
  const isDamaged = part.state === 'damaged' || part.state === 'critical';

  const cellStyle: React.CSSProperties = {
    ...style,
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: part.state === 'critical' 
      ? `linear-gradient(135deg, ${baseColor} 0%, #ef4444 100%)`
      : baseColor,
    border: `2px solid ${isDamaged ? stateColor : 'rgba(0,0,0,0.3)'}`,
    borderRadius: part.type === 'head' ? '50%' : '4px',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 11,
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
    transition: 'all 0.15s ease-out',
    boxShadow: isDamaged 
      ? `0 0 8px ${stateColor}, inset 0 0 4px rgba(255,255,255,0.3)`
      : 'none',
    animation: part.state === 'critical' ? 'pulse 0.5s ease-in-out infinite' : 'none',
  };

  // HP 显示
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
    <div style={cellStyle}>
      {renderMode === 'text' ? PART_TEXTS[part.type] : getPartIcon(part.type)}
      {hpDisplay}
    </div>
  );
};

// 获取部位图标
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

// 优先级标签
const PriorityLabel: React.FC<{ priority: Priority }> = ({ priority }) => {
  const config = PRIORITY_CONFIG[priority];
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

// 生命值条
const HealthBar: React.FC<{ enemy: MultiGridEnemy }> = ({ enemy }) => {
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

// 主渲染组件
export const MultiGridEnemyRenderer: React.FC<MultiGridEnemyRendererProps> = ({
  enemy,
  cellWidth,
  cellHeight,
  renderMode = 'text',
  showPriority = true,
  showHp = true,
}) => {
  if (!enemy.isAlive) return null;

  // 探头状态时隐藏
  if (enemy.peekState === 'hidden') return null;

  // 计算偏移（用于移动和探头动画）
  let offsetX = 0;
  let offsetY = 0;

  if (enemy.peekState === 'peeking' || enemy.peekState === 'returning') {
    const progress = enemy.peekProgress ?? 0;
    offsetX = (enemy.peekDirection === 'left' ? -1 : 1) * (1 - progress) * cellWidth * 3;
  }

  // 小数位置（用于平滑移动）
  const baseLeft = (enemy.anchorCol - 2) * cellWidth + offsetX;
  const baseTop = (enemy.anchorRow - 1) * cellHeight + offsetY;

  return (
    <div
      className="multi-grid-enemy"
      data-enemy-id={enemy.id}
      style={{
        position: 'absolute',
        left: baseLeft,
        top: baseTop,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {/* 优先级标签 */}
      {showPriority && enemy.priority && (
        <PriorityLabel priority={enemy.priority} />
      )}

      {/* 生命值条 */}
      <HealthBar enemy={enemy} />

      {/* 部位渲染 */}
      {enemy.parts.map((part, index) => {
        if (part.state === 'destroyed') return null;

        const left = part.relativeCol * cellWidth;
        const top = part.relativeRow * cellHeight;

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
            showHp={showHp}
          />
        );
      })}
    </div>
  );
};

// 批量渲染组件
interface MultiGridEnemiesProps {
  enemies: MultiGridEnemy[];
  cellWidth: number;
  cellHeight: number;
  renderMode?: 'text' | 'icon';
  showPriority?: boolean;
  showHp?: boolean;
}

export const MultiGridEnemies: React.FC<MultiGridEnemiesProps> = ({
  enemies,
  cellWidth,
  cellHeight,
  renderMode = 'text',
  showPriority = true,
  showHp = true,
}) => {
  return (
    <div className="multi-grid-enemies-container" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {enemies.map(enemy => (
        <MultiGridEnemyRenderer
          key={enemy.id}
          enemy={enemy}
          cellWidth={cellWidth}
          cellHeight={cellHeight}
          renderMode={renderMode}
          showPriority={showPriority}
          showHp={showHp}
        />
      ))}

      {/* CSS 动画样式 */}
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