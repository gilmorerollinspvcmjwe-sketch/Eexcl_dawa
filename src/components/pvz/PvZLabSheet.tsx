import React, { useEffect, useMemo, useState } from 'react';
import { getPvZAdventureChapterTitle, getPvZAdventureScenariosByChapterIndex, getPvZScenariosByMode } from '../../features/pvz/pvzScenarioCatalog';
import type { PvZScenarioId } from '../../features/pvz/pvzTypes';
import { emitPvZScenarioSelection, subscribePvZScenarioSelection } from './pvzScenarioBridge';

interface PvZLabSheetProps {
  onFormulaChange?: (text: string) => void;
}

export const PvZLabSheet: React.FC<PvZLabSheetProps> = ({ onFormulaChange }) => {
  const [chapterIndex, setChapterIndex] = useState(1);
  const [selectedScenarioId, setSelectedScenarioId] = useState<PvZScenarioId>('1-01');
  const currentChapterLevels = useMemo(() => getPvZAdventureScenariosByChapterIndex(chapterIndex), [chapterIndex]);
  const labScenarios = useMemo(() => getPvZScenariosByMode('lab'), []);
  const survivalScenarios = useMemo(() => getPvZScenariosByMode('survival'), []);

  useEffect(() => {
    onFormulaChange?.(`=Sheet9 主线实验室 | ${getPvZAdventureChapterTitle(chapterIndex)} | ${currentChapterLevels.length} 关`);
  }, [chapterIndex, currentChapterLevels.length, onFormulaChange]);

  useEffect(() => {
    const unsubscribe = subscribePvZScenarioSelection((scenarioId) => {
      setSelectedScenarioId(scenarioId);
      const numericPrefix = Number.parseInt(scenarioId.split('-')[0] ?? '1', 10);
      if (numericPrefix >= 1 && numericPrefix <= 10) {
        setChapterIndex(numericPrefix);
      }
    });
    return unsubscribe;
  }, []);

  const handleSelect = (scenarioId: PvZScenarioId) => {
    setSelectedScenarioId(scenarioId);
    emitPvZScenarioSelection(scenarioId);
  };

  return (
    <div className="pvz-sheet pvz-info-sheet">
      <section className="pvz-info-panel">
        <h3>主线章节包</h3>
        <div className="pvz-adventure-pack-grid">
          {Array.from({ length: 10 }, (_, index) => {
            const packIndex = index + 1;
            return (
              <button
                key={packIndex}
                type="button"
                className={`pvz-mode-tab${chapterIndex === packIndex ? ' active' : ''}`}
                onClick={() => setChapterIndex(packIndex)}
              >
                {getPvZAdventureChapterTitle(packIndex)}
              </button>
            );
          })}
        </div>
      </section>

      <section className="pvz-info-panel">
        <h3>{getPvZAdventureChapterTitle(chapterIndex)} · 关卡清单</h3>
        <div className="pvz-scenario-grid">
          {currentChapterLevels.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              className={`pvz-scenario-card${selectedScenarioId === scenario.id ? ' active' : ''}`}
              onClick={() => handleSelect(scenario.id)}
            >
              <strong>{scenario.id} {scenario.title}</strong>
              <span>{scenario.summary}</span>
              <small>强度 {scenario.intensity} · 阳光 {scenario.baseSun}</small>
              <small>
                解锁 植物 {scenario.unlockPlants?.length ?? 0} / 僵尸 {scenario.unlockZombies?.length ?? 0}
              </small>
            </button>
          ))}
        </div>
      </section>

      <section className="pvz-info-panel">
        <h3>额外模式</h3>
        <div className="pvz-scenario-grid">
          {[...labScenarios, ...survivalScenarios].map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              className={`pvz-scenario-card${selectedScenarioId === scenario.id ? ' active' : ''}`}
              onClick={() => handleSelect(scenario.id)}
            >
              <strong>{scenario.title}</strong>
              <span>{scenario.summary}</span>
              <small>{scenario.objective}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
