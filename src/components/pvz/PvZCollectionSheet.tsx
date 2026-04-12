import React, { useEffect } from 'react';
import { PVZ_PLANTS } from '../../features/pvz/pvzPlantRegistry';
import { PVZ_ZOMBIES } from '../../features/pvz/pvzZombieRegistry';
import {
  getPvZPlantBaseHp,
  getPvZPlantCadenceLabels,
  getPvZPlantRoleLabel,
  getPvZPlantToneClass,
  getPvZPlantTraitLabel,
  getPvZZombieArmorHp,
  getPvZZombieCadenceLabels,
  getPvZZombieThreatLabel,
  getPvZZombieToneClass,
} from '../../features/pvz/pvzPresentation';

interface PvZCollectionSheetProps {
  onFormulaChange?: (text: string) => void;
}

export const PvZCollectionSheet: React.FC<PvZCollectionSheetProps> = ({ onFormulaChange }) => {
  useEffect(() => {
    onFormulaChange?.(`=PvZ 图鉴 | 植物 ${PVZ_PLANTS.length} · 僵尸 ${PVZ_ZOMBIES.length}`);
  }, [onFormulaChange]);

  return (
    <div className="pvz-sheet pvz-info-sheet">
      <section className="pvz-info-panel">
        <h3>植物图鉴（{PVZ_PLANTS.length}）</h3>
        <table className="pvz-info-table">
          <thead>
            <tr>
              <th>植物</th>
              <th>定位</th>
              <th>本体血</th>
              <th>费用</th>
              <th>节奏</th>
              <th>解锁</th>
            </tr>
          </thead>
          <tbody>
            {PVZ_PLANTS.map((plant) => (
              <tr key={plant.id}>
                <td>
                  <span className={`pvz-inline-badge ${getPvZPlantToneClass(plant)}`}>
                    <span className="pvz-inline-short">{plant.shortName}</span>
                    <span>{plant.name}</span>
                  </span>
                </td>
                <td>{getPvZPlantRoleLabel(plant)} / {getPvZPlantTraitLabel(plant)}</td>
                <td>{getPvZPlantBaseHp(plant)}</td>
                <td>{plant.cost}</td>
                <td>{getPvZPlantCadenceLabels(plant).join(' / ')}</td>
                <td>{plant.unlockLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="pvz-info-panel">
        <h3>僵尸图鉴（{PVZ_ZOMBIES.length}）</h3>
        <table className="pvz-info-table">
          <thead>
            <tr>
              <th>僵尸</th>
              <th>威胁</th>
              <th>本体血</th>
              <th>护甲血</th>
              <th>节奏</th>
              <th>解锁</th>
            </tr>
          </thead>
          <tbody>
            {PVZ_ZOMBIES.map((zombie) => (
              <tr key={zombie.id}>
                <td>
                  <span className={`pvz-inline-badge ${getPvZZombieToneClass(zombie)}`}>
                    <span className="pvz-inline-short">{zombie.shortName}</span>
                    <span>{zombie.name}</span>
                  </span>
                </td>
                <td>{getPvZZombieThreatLabel(zombie)}</td>
                <td>{zombie.maxHp - getPvZZombieArmorHp(zombie)}</td>
                <td>{getPvZZombieArmorHp(zombie)}</td>
                <td>{getPvZZombieCadenceLabels(zombie).join(' / ')}</td>
                <td>{zombie.unlockLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};
