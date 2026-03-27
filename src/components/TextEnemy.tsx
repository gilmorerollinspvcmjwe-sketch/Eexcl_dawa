import React from 'react';
import type { PartType, TextEnemyShape, PartPosition } from '../types';
import { PART_COLORS, PART_TEXTS, FULL_ENEMY_SHAPE } from '../types';

interface TextEnemyProps {
  /** 敌人锚点位置（左上角） */
  anchorRow: number;
  anchorCol: number;
  /** 敌人形状，默认使用完整形状 */
  shape?: TextEnemyShape;
  /** 目标大小 */
  targetSize?: number;
  /** 是否显示部分敌人（随机缺失某些部位） */
  partial?: boolean;
  /** 缺失的部位 */
  missingParts?: PartType[];
  /** 点击回调 */
  onPartClick?: (partType: PartType, row: number, col: number) => void;
  /** 移动动画 */
  isMoving?: boolean;
  /** 已命中的部位 */
  hitParts?: PartType[];
}

/**
 * 多格文字敌人组件
 * 一个完整敌人由 5 个格子组成：
 *     [头]          ← 第1行
 * [左手][身体][右手] ← 第2行
 *     [身体]        ← 第3行
 *     [脚]          ← 第4行
 */
export const TextEnemy: React.FC<TextEnemyProps> = ({
  anchorRow,
  anchorCol,
  shape = FULL_ENEMY_SHAPE,
  targetSize: _targetSize = 20,
  partial: _partial = false,
  missingParts = [],
  onPartClick,
  isMoving = false,
  hitParts = [],
}) => {
  // 检查部位是否被击中
  const isPartHit = (partType: PartType) => hitParts.includes(partType);
  
  // 检查部位是否缺失
  const isPartMissing = (partType: PartType) => missingParts.includes(partType);

  // 获取实际的形状对象
  const actualShape = typeof shape === 'string' ? FULL_ENEMY_SHAPE : shape;

  // 渲染单个部位格子
  const renderPartCell = (
    partType: PartType,
    relativeRow: number,
    relativeCol: number
  ) => {
    if (isPartMissing(partType)) return null;
    
    const actualRow = anchorRow + relativeRow;
    const actualCol = anchorCol + relativeCol;
    const color = PART_COLORS[partType];
    const text = PART_TEXTS[partType];
    const isHit = isPartHit(partType);
    
    return (
      <div
        key={partType}
        className={`text-enemy-part ${isMoving ? 'moving' : ''} ${isHit ? 'hit' : ''}`}
        style={{
          position: 'absolute',
          left: `calc(${relativeCol} * var(--excel-cell-width))`,
          top: `calc(${relativeRow} * var(--excel-cell-height))`,
          width: 'var(--excel-cell-width)',
          height: 'var(--excel-cell-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isHit ? 'rgba(128, 128, 128, 0.3)' : `${color}20`,
          border: `2px solid ${isHit ? '#888' : color}`,
          borderRadius: partType === 'head' ? '50%' : '4px',
          cursor: isHit ? 'default' : 'crosshair',
          fontSize: '10px',
          fontFamily: 'Calibri, "微软雅黑", sans-serif',
          fontWeight: 'bold',
          color: isHit ? '#888' : color,
          transition: 'all 0.1s ease',
          boxSizing: 'border-box',
          opacity: isHit ? 0.5 : 1,
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (!isHit && onPartClick) {
            onPartClick(partType, actualRow, actualCol);
          }
        }}
      >
        {text}
      </div>
    );
  };

  return (
    <div
      className="text-enemy-container"
      style={{
        position: 'absolute',
        left: `calc(${anchorCol - 1} * var(--excel-cell-width) + var(--excel-row-header-width))`,
        top: `calc(${anchorRow - 1} * var(--excel-cell-height))`,
        width: 'calc(3 * var(--excel-cell-width))',
        height: 'calc(4 * var(--excel-cell-height))',
        pointerEvents: 'none',
      }}
    >
      {/* 头部 */}
      {actualShape.head && renderPartCell('head', actualShape.head.row, actualShape.head.col)}
      
      {/* 身体 */}
      {actualShape.body.map((pos: PartPosition, idx: number) => (
        <React.Fragment key={`body-${idx}`}>
          {renderPartCell('body', pos.row, pos.col)}
        </React.Fragment>
      ))}
      
      {/* 左手 */}
      {actualShape.leftHand && renderPartCell('leftHand', actualShape.leftHand.row, actualShape.leftHand.col)}
      
      {/* 右手 */}
      {actualShape.rightHand && renderPartCell('rightHand', actualShape.rightHand.row, actualShape.rightHand.col)}
      
      {/* 脚 */}
      {actualShape.foot && renderPartCell('foot', actualShape.foot.row, actualShape.foot.col)}
    </div>
  );
};

/**
 * 单个文字部位格子组件（用于单独显示）
 */
export const TextPartCell: React.FC<{
  partType: PartType;
  row?: number;
  col?: number;
  targetSize?: number;
  onClick?: () => void;
  isHit?: boolean;
  isMoving?: boolean;
}> = ({ partType, targetSize = 20, onClick, isHit = false, isMoving = false }) => {
  const color = PART_COLORS[partType];
  const text = PART_TEXTS[partType];
  
  return (
    <div
      className={`text-part-cell ${isMoving ? 'moving' : ''} ${isHit ? 'hit' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: targetSize + 10,
        height: targetSize + 10,
        background: isHit ? 'rgba(128, 128, 128, 0.3)' : `${color}22`,
        borderRadius: partType === 'head' ? '50%' : partType === 'foot' ? '8px' : '4px',
        color: isHit ? '#888' : color,
        fontSize: Math.max(10, targetSize - 6),
        fontFamily: 'Calibri, "微软雅黑", sans-serif',
        fontWeight: 'bold',
        boxShadow: `0 2px 8px ${color}40`,
        cursor: isHit ? 'default' : 'crosshair',
        transition: 'all 0.15s ease',
        border: `2px solid ${isHit ? '#888' : color}`,
        opacity: isHit ? 0.5 : 1,
      }}
      onClick={onClick}
    >
      {text}
    </div>
  );
};

export default TextEnemy;