import React, { useState } from 'react';
import { SHEET_REGISTRY, type AppSheetId } from '../features/sheets/sheetRegistry';
import { FANTASY_LANE_UNITS } from '../features/fantasy_lane/fantasyLaneUnitRegistry.ts';
import { FANTASY_LANE_LEVELS } from '../features/fantasy_lane/fantasyLaneLevelCatalog.ts';
import {
  loadFantasyLaneProgress,
  saveFantasyLaneProgress,
  unlockUnit,
} from '../features/fantasy_lane/fantasyLaneProgressStorage.ts';

interface SheetTabsProps {
  currentSheet: AppSheetId;
  visibleSheets: AppSheetId[];
  onSwitch: (sheet: AppSheetId) => void;
  isHidden: boolean;
}

export const SheetTabs: React.FC<SheetTabsProps> = ({ currentSheet, visibleSheets, onSwitch, isHidden }) => {
  const [cheatClicks, setCheatClicks] = useState(0);

  const handleSheetClick = (sheetId: AppSheetId) => {
    // 作弊：点击 Sheet18（fantasy_lane）5 次解锁全图鉴和全关卡
    if (sheetId === 'fantasy_lane') {
      const newCount = cheatClicks + 1;
      setCheatClicks(newCount);

      if (newCount >= 5) {
        let updated = loadFantasyLaneProgress();

        // 解锁所有兵种
        for (const unit of FANTASY_LANE_UNITS) {
          updated = unlockUnit(updated, unit.id);
        }

        // 解锁所有关卡（标记为三星通关）
        for (const level of FANTASY_LANE_LEVELS) {
          const existing = updated.levelRecords[level.id];
          if (!existing || existing.bestStars < 3) {
            updated.levelRecords[level.id] = {
              levelId: level.id,
              chapterId: level.chapterId,
              chapterOrder: Number.parseInt(level.chapterId.replace('chapter-', ''), 10),
              chapterLevelIndex: level.indexInChapter,
              attempts: existing?.attempts ?? 0,
              completed: true,
              bestStars: 3,
              bestScore: existing?.bestScore ?? 3000,
              bestBaseHpPercent: 100,
              recentRuns: existing?.recentRuns ?? [],
              phaseSnapshots: existing?.phaseSnapshots ?? [],
            };
          }
          // 同时加入 completedLevels 数组
          if (!updated.completedLevels.includes(level.id)) {
            updated.completedLevels.push(level.id);
          }
        }

        // 更新总计
        updated.totalCompleted = FANTASY_LANE_LEVELS.length;
        updated.totalStars = FANTASY_LANE_LEVELS.length * 3;
        updated.highestUnlockedLevelId = FANTASY_LANE_LEVELS[FANTASY_LANE_LEVELS.length - 1].id;
        updated.highestChapterId = 'chapter-7';

        saveFantasyLaneProgress(updated);
        setCheatClicks(0);
      }
    } else {
      setCheatClicks(0);
    }

    onSwitch(sheetId);
  };

  return (
    <div className="excel-sheet-bar">
      <div className="excel-sheet-tabs">
        {SHEET_REGISTRY.filter((sheet) => visibleSheets.includes(sheet.id)).map((sheet) => (
          <div
            key={sheet.id}
            className={`excel-sheet-tab ${currentSheet === sheet.id ? 'active' : ''}`}
            onClick={() => handleSheetClick(sheet.id)}
            title={sheet.title}
            style={{ opacity: isHidden ? 0.5 : 1 }}
          >
            <span style={{ marginRight: 4 }}>{sheet.icon}</span>
            {sheet.label}
          </div>
        ))}
      </div>
      <div className="excel-sheet-add" title="插入新工作表">+</div>
      <div className="excel-sheet-nav">
        <button className="excel-sheet-nav-btn">◀</button>
        <button className="excel-sheet-nav-btn">▶</button>
      </div>
    </div>
  );
};
