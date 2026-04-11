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
  totalGames,
  totalScore,
}) => {
  return (
    <div className="hub-side-panel">
      <div className="hub-side-title">成长概览</div>
      <table className="hub-mini-table hub-kpi-table">
        <tbody>
          <tr>
            <td>员工等级</td>
            <td>Lv.{level}</td>
          </tr>
          <tr>
            <td>当前称号</td>
            <td>{title}</td>
          </tr>
          <tr>
            <td>摸鱼币</td>
            <td>{credits}</td>
          </tr>
          <tr>
            <td>今日局数</td>
            <td>{totalGames}</td>
          </tr>
          <tr>
            <td>累计得分</td>
            <td>{totalScore.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

