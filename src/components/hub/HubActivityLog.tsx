import React from 'react';
import type { HubActivityItem } from '../../features/hub/hubData';

export const HubActivityLog: React.FC<{ items: HubActivityItem[] }> = ({ items }) => {
  return (
    <div className="hub-side-panel hub-activity-panel">
      <div className="hub-side-title">动态日志</div>
      <ul className="hub-activity-list">
        {items.map((item) => (
          <li key={item.id} className={`tone-${item.tone}`}>
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

