import React from 'react';
import type { HubTaskRow } from '../../features/hub/hubData';

export const HubTasksPanel: React.FC<{ tasks: HubTaskRow[] }> = ({ tasks }) => {
  return (
    <div className="hub-side-panel">
      <div className="hub-side-title">今日任务</div>
      <table className="hub-mini-table">
        <thead>
          <tr>
            <th>任务</th>
            <th>进度</th>
            <th>奖励</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className={`state-${task.state}`}>
              <td>{task.label}</td>
              <td>{task.progress}</td>
              <td>{task.reward}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

