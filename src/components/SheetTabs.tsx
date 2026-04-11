import React from 'react';
import { SHEET_REGISTRY, type AppSheetId } from '../features/sheets/sheetRegistry';

interface SheetTabsProps {
  currentSheet: AppSheetId;
  onSwitch: (sheet: AppSheetId) => void;
  isHidden: boolean;
}

export const SheetTabs: React.FC<SheetTabsProps> = ({ currentSheet, onSwitch, isHidden }) => {
  return (
    <div className="excel-sheet-bar">
      <div className="excel-sheet-tabs">
        {SHEET_REGISTRY.map((sheet) => (
          <div
            key={sheet.id}
            className={`excel-sheet-tab ${currentSheet === sheet.id ? 'active' : ''}`}
            onClick={() => onSwitch(sheet.id)}
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
