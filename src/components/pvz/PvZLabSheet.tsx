import React from 'react';
import { PVZ_CHAPTERS } from '../../features/pvz/pvzChapters';

export const PvZLabSheet: React.FC = () => {
  return (
    <div className="pvz-sheet pvz-info-sheet">
      <section className="pvz-info-panel">
        <h3>章节表</h3>
        <table className="pvz-info-table">
          <thead>
            <tr>
              <th>章节</th>
              <th>机制</th>
              <th>代表植物</th>
              <th>代表僵尸</th>
            </tr>
          </thead>
          <tbody>
            {PVZ_CHAPTERS.map((chapter) => (
              <tr key={chapter.id}>
                <td>{chapter.title}</td>
                <td>{chapter.summary}</td>
                <td>{chapter.plants.join('、')}</td>
                <td>{chapter.zombies.join('、')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="pvz-info-panel">
        <h3>战场规则</h3>
        <ul className="pvz-rule-list">
          <li>5 路 × 9 列</li>
          <li>阳光起始 150</li>
          <li>卡槽独立冷却</li>
          <li>任一路被突破即失败</li>
          <li>清空波次和场上僵尸即胜利</li>
        </ul>
      </section>
    </div>
  );
};

