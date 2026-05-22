import React from 'react';

interface HubProgressPanelProps {
  level: number;
  title: string;
  credits: number;
  totalGames: number;
  totalScore: number;
}

export const HubProgressPanel: React.FC<HubProgressPanelProps> = ({
  level,
  title,
  credits,
}) => {
  return (
    <div className="hub-side-panel compact-panel">
      <div className="hub-side-title">状态</div>
      <table className="hub-mini-table hub-kpi-table compact">
        <tbody>
          <tr>
            <td>等级</td>
            <td>{level}</td>
          </tr>
          <tr>
            <td>称号</td>
            <td>{title}</td>
          </tr>
          <tr>
            <td>币</td>
            <td>{credits}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
