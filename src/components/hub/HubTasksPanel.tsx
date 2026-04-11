import React from 'react';
import type { HubTaskRow } from '../../features/hub/hubData';

export const HubTasksPanel: React.FC<{ tasks: HubTaskRow[] }> = ({ tasks }) => {
  return (
    <div className="hub-side-panel compact-panel">
      <div className="hub-side-title">今日</div>
      <table className="hub-mini-table compact">
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className={`state-${task.state}`}>
              <td>{task.label}</td>
              <td>{task.progress}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
