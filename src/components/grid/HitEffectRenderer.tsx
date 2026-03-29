import React from 'react';
import type { HitEffect } from '../../types';

interface HitEffectRendererProps {
  effects: HitEffect[];
}

export const HitEffectRenderer: React.FC<HitEffectRendererProps> = ({ effects }) => {
  return (
    <>
      {effects.map(effect => {
        const combo = effect.combo || 0;
        const isHighCombo = combo >= 10;
        const isVeryHighCombo = combo >= 20;
        const isExtremeCombo = combo >= 30;

        return (
          <React.Fragment key={effect.id}>
            {/* Excel单元格选中效果 */}
            <div
              className={`hit-cell-effect ${effect.isHeadshot ? 'headshot' : ''} ${isHighCombo ? 'high-combo' : ''} ${isVeryHighCombo ? 'very-high-combo' : ''} ${isExtremeCombo ? 'extreme-combo' : ''}`}
              style={{
                position: 'absolute',
                left: `calc(${effect.col - 1} * var(--excel-cell-width) + var(--excel-row-header-width))`,
                top: `calc(${effect.row - 1} * var(--excel-cell-height) + var(--excel-col-header-height))`,
                width: 'var(--excel-cell-width)',
                height: 'var(--excel-cell-height)',
                pointerEvents: 'none',
              }}
            />

            {/* 得分弹出 */}
            <div
              className={`score-popup ${effect.isCombo ? 'combo' : ''} ${effect.isHeadshot ? 'headshot' : ''} ${isHighCombo ? 'high-combo' : ''} ${isVeryHighCombo ? 'very-high-combo' : ''}`}
              style={{
                position: 'absolute',
                left: `calc(${effect.col - 1} * var(--excel-cell-width) + var(--excel-row-header-width) + var(--excel-cell-width) / 2)`,
                top: `calc(${effect.row - 1} * var(--excel-cell-height) + var(--excel-col-header-height) + var(--excel-cell-height) / 2)`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              +{effect.score}
              {effect.isHeadshot && ' 💥'}
              {isExtremeCombo && <span className="combo-text"> 🔥{combo}</span>}
              {isVeryHighCombo && !isExtremeCombo && <span className="combo-text"> ⚡{combo}</span>}
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};
