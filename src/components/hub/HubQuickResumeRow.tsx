import React from 'react';
import type { HubQuickResume } from '../../features/hub/hubData';

interface HubQuickResumeRowProps {
  quickResume: HubQuickResume;
  recommendation: string;
  onResume: () => void;
  onRecommended: () => void;
  onRandom: () => void;
}

export const HubQuickResumeRow: React.FC<HubQuickResumeRowProps> = ({
  quickResume,
  recommendation,
  onResume,
  onRecommended,
  onRandom,
}) => {
  return (
    <div className="hub-quick-row">
      <button className="hub-quick-primary" onClick={onResume}>
        ▶ {quickResume.label}
      </button>
      <button className="hub-quick-secondary" onClick={onRecommended}>
        {recommendation}
      </button>
      <button className="hub-quick-secondary" onClick={onRandom}>
        随机摸鱼
      </button>
      <div className="hub-quick-note">{quickResume.description}</div>
    </div>
  );
};

