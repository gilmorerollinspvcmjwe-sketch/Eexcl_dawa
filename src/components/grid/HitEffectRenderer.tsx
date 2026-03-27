// 命中特效渲染组件

import React from 'react';
import type { HitEffect } from '../../types';

interface HitEffectRendererProps {
  effects: HitEffect[];
}

export const HitEffectRenderer: React.FC<HitEffectRendererProps> = ({ effects }) => {
  return (
    <>
      {effects.map(effect => (
        <div
          key={effect.id}
          className={`score-popup ${effect.isCombo ? 'combo' : ''} ${effect.isHeadshot ? 'headshot' : ''}`}
          style={{
            position: 'absolute',
            left: `calc(${effect.col - 1} * var(--excel-cell-width) + var(--excel-row-header-width))`,
            top: `calc(${effect.row - 1} * var(--excel-cell-height))`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          +{effect.score}
          {effect.isHeadshot && ' 💥'}
        </div>
      ))}
    </>
  );
};