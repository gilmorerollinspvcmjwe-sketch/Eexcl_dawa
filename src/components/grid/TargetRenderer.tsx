// 目标渲染组件

import React from 'react';
import type { Target } from '../../types';

interface TargetRendererProps {
  target: Target;
  targetSize: number;
  isHeadshotLine: boolean;
}

export const TargetRenderer: React.FC<TargetRendererProps> = ({
  target,
  targetSize,
  isHeadshotLine,
}) => {
  return (
    <div className="target">
      {target.type === 'head' && (
        <div 
          className={`target-head ${isHeadshotLine ? 'target-headshot-line' : ''}`}
          style={{ width: targetSize, height: targetSize }}
        >
          <span className="target-head-value">100</span>
        </div>
      )}
      {target.type === 'body' && (
        <div 
          className="target-body"
          style={{ width: targetSize + 2, height: targetSize + 2 }}
        >
          <span className="target-body-value">50</span>
        </div>
      )}
      {target.type === 'feet' && (
        <div 
          className="target-feet"
          style={{ 
            borderLeftWidth: (targetSize + 2) / 2,
            borderRightWidth: (targetSize + 2) / 2,
            borderBottomWidth: targetSize + 2,
          }}
        >
          <span className="target-feet-value">25</span>
        </div>
      )}
    </div>
  );
};