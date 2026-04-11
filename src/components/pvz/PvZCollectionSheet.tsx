import React from 'react';
import { PVZ_PLANTS } from '../../features/pvz/pvzPlantRegistry';
import { PVZ_ZOMBIES } from '../../features/pvz/pvzZombieRegistry';

export const PvZCollectionSheet: React.FC = () => {
  return (
    <div className="pvz-sheet pvz-info-sheet">
      <section className="pvz-info-panel">
        <h3>植物图鉴</h3>
        <table className="pvz-info-table">
          <thead>
            <tr>
              <th>植物</th>
              <th>费用</th>
              <th>冷却</th>
              <th>定位</th>
            </tr>
          </thead>
          <tbody>
            {PVZ_PLANTS.map((plant) => (
              <tr key={plant.id}>
                <td>{plant.name}</td>
                <td>{plant.cost}</td>
                <td>{Math.ceil(plant.cooldownMs / 1000)}s</td>
                <td>{plant.producesSun ? '资源' : plant.laneBlocker ? '防御' : plant.explodeRadius ? '爆发' : '输出'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="pvz-info-panel">
        <h3>僵尸图鉴</h3>
        <table className="pvz-info-table">
          <thead>
            <tr>
              <th>僵尸</th>
              <th>生命</th>
              <th>速度</th>
            </tr>
          </thead>
          <tbody>
            {PVZ_ZOMBIES.map((zombie) => (
              <tr key={zombie.id}>
                <td>{zombie.name}</td>
                <td>{zombie.maxHp}</td>
                <td>{zombie.speed.toFixed(5)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

