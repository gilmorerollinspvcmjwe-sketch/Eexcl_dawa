import React, { memo, useEffect, useState } from 'react';

interface ComboProgressBarProps {
  combo: number;
  maxCombo: number;
}

const COMBO_THRESHOLDS = [
  { threshold: 50, label: '🔥 传说', color: '#dc2626', bgColor: 'rgba(220, 38, 38, 0.2)' },
  { threshold: 30, label: '⚡ 史诗', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.2)' },
  { threshold: 20, label: '💎 精英', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.2)' },
  { threshold: 10, label: '⭐ 优秀', color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.2)' },
  { threshold: 5, label: '✓ 连击', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.2)' },
  { threshold: 0, label: '开始', color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.2)' },
];

const getNextThreshold = (combo: number) => {
  for (let i = COMBO_THRESHOLDS.length - 1; i >= 0; i--) {
    if (combo >= COMBO_THRESHOLDS[i].threshold) {
      if (i === 0) return null;
      return COMBO_THRESHOLDS[i - 1];
    }
  }
  return COMBO_THRESHOLDS[COMBO_THRESHOLDS.length - 2];
};

const getCurrentLevel = (combo: number) => {
  for (const level of COMBO_THRESHOLDS) {
    if (combo >= level.threshold) {
      return level;
    }
  }
  return COMBO_THRESHOLDS[COMBO_THRESHOLDS.length - 1];
};

export const ComboProgressBar: React.FC<ComboProgressBarProps> = memo(({ combo, maxCombo }) => {
  const [displayCombo, setDisplayCombo] = useState(combo);
  const [pulseEffect, setPulseEffect] = useState(false);

  useEffect(() => {
    if (combo !== displayCombo) {
      setDisplayCombo(combo);
      setPulseEffect(true);
      const timer = setTimeout(() => setPulseEffect(false), 300);
      return () => clearTimeout(timer);
    }
  }, [combo, displayCombo]);

  const currentLevel = getCurrentLevel(displayCombo);
  const nextThreshold = getNextThreshold(displayCombo);

  const progressPercent = nextThreshold
    ? ((displayCombo - currentLevel.threshold) / (nextThreshold.threshold - currentLevel.threshold)) * 100
    : 100;

  const comboMultiplier = displayCombo >= 50 ? 3.0 :
    displayCombo >= 30 ? 2.5 :
    displayCombo >= 20 ? 2.0 :
    displayCombo >= 10 ? 1.5 :
    displayCombo >= 5 ? 1.2 : 1.0;

  return (
    <div className="combo-progress-container">
      <div className="combo-header">
        <span className="combo-label">连击</span>
        <span 
          className={`combo-value ${pulseEffect ? 'pulse' : ''}`}
          style={{ color: currentLevel.color }}
        >
          {displayCombo}
        </span>
        {comboMultiplier > 1.0 && (
          <span className="combo-multiplier" style={{ color: currentLevel.color }}>
            x{comboMultiplier.toFixed(1)}
          </span>
        )}
      </div>

      <div className="combo-progress-bar-wrapper">
        <div 
          className="combo-progress-bar-bg"
          style={{ backgroundColor: currentLevel.bgColor }}
        >
          <div 
            className="combo-progress-bar-fill"
            style={{ 
              width: `${progressPercent}%`,
              backgroundColor: currentLevel.color,
            }}
          />
          {nextThreshold && (
            <div 
              className="combo-progress-marker"
              style={{ left: '100%' }}
            >
              <span className="marker-label">{nextThreshold.threshold}</span>
            </div>
          )}
        </div>
      </div>

      <div className="combo-footer">
        <span className="combo-level-label" style={{ color: currentLevel.color }}>
          {currentLevel.label}
        </span>
        {nextThreshold && (
          <span className="combo-next-hint">
            下级: {nextThreshold.threshold}连击
          </span>
        )}
      </div>

      {maxCombo > 0 && (
        <div className="combo-max-record">
          最高: {maxCombo}
        </div>
      )}
    </div>
  );
});

ComboProgressBar.displayName = 'ComboProgressBar';
