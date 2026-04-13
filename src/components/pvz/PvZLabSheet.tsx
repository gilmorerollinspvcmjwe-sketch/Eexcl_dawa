/* Sheet9 解锁树与进度面板。展示 100 关主线解锁状态、进度统计和推荐卡组。 */
import React, { useEffect, useMemo, useState } from 'react';
import { getPvZAdventureChapterTitle, getPvZAdventureScenariosByChapterIndex, getPvZScenariosByMode } from '../../features/pvz/pvzScenarioCatalog';
import {
  loadProgress,
  getLevelStatus,
  getChapterProgress,
  getPlantUnlockInfo,
  getZombieUnlockInfo,
  getPreviousLevelId,
} from '../../features/pvz/pvzProgressStorage';
import type { PvZScenarioId } from '../../features/pvz/pvzTypes';
import { PVZ_PLANT_MAP } from '../../features/pvz/pvzPlantRegistry';
import { emitPvZScenarioSelection, subscribePvZScenarioSelection } from './pvzScenarioBridge';

interface PvZLabSheetProps {
  onFormulaChange?: (text: string) => void;
}

export const PvZLabSheet: React.FC<PvZLabSheetProps> = ({ onFormulaChange }) => {
  const [chapterIndex, setChapterIndex] = useState(1);
  const [selectedScenarioId, setSelectedScenarioId] = useState<PvZScenarioId>('1-01');
  const [progress, setProgress] = useState(() => loadProgress());

  const currentChapterLevels = useMemo(() => getPvZAdventureScenariosByChapterIndex(chapterIndex), [chapterIndex]);
  const labScenarios = useMemo(() => getPvZScenariosByMode('lab'), []);
  const survivalScenarios = useMemo(() => getPvZScenariosByMode('survival'), []);

  const chapterProgress = useMemo(() => getChapterProgress(progress, chapterIndex), [progress, chapterIndex]);
  const plantInfo = useMemo(() => getPlantUnlockInfo(progress), [progress]);
  const zombieInfo = useMemo(() => getZombieUnlockInfo(progress), [progress]);

  useEffect(() => {
    onFormulaChange?.(`=Sheet9 解锁树 | ${getPvZAdventureChapterTitle(chapterIndex)} | 进度 ${chapterProgress.completed}/${chapterProgress.total}`);
  }, [chapterIndex, chapterProgress, onFormulaChange]);

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

  const handleResetProgress = () => {
    if (window.confirm('确定要重置所有 PvZ 进度吗？此操作不可撤销。')) {
      const fresh = loadProgress();
      setProgress(fresh);
    }
  };

  return (
    <div className="pvz-sheet pvz-info-sheet">
      <section className="pvz-info-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>进度总览</h3>
          <button type="button" className="pvz-small-btn" onClick={handleResetProgress} style={{ fontSize: 11, padding: '2px 8px' }}>
            重置进度
          </button>
        </div>
        <div className="pvz-progress-stats">
          <div className="pvz-stat-item">
            <span className="pvz-stat-label">已通关</span>
            <span className="pvz-stat-value">{progress.totalCompleted} / 100</span>
          </div>
          <div className="pvz-stat-item">
            <span className="pvz-stat-label">解锁植物</span>
            <span className="pvz-stat-value">{plantInfo.unlocked} / {plantInfo.total}</span>
          </div>
          <div className="pvz-stat-item">
            <span className="pvz-stat-label">解锁僵尸</span>
            <span className="pvz-stat-value">{zombieInfo.unlocked} / {zombieInfo.total}</span>
          </div>
        </div>
      </section>

      <section className="pvz-info-panel">
        <h3>主线章节包</h3>
        <div className="pvz-adventure-pack-grid">
          {Array.from({ length: 10 }, (_, index) => {
            const packIndex = index + 1;
            const cp = getChapterProgress(progress, packIndex);
            return (
              <button
                key={packIndex}
                type="button"
                className={`pvz-mode-tab${chapterIndex === packIndex ? ' active' : ''}`}
                onClick={() => setChapterIndex(packIndex)}
              >
                <span>{getPvZAdventureChapterTitle(packIndex)}</span>
                <small>{cp.completed}/{cp.total}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="pvz-info-panel">
        <h3>{getPvZAdventureChapterTitle(chapterIndex)} · 关卡清单</h3>
        <div className="pvz-scenario-grid">
          {currentChapterLevels.map((scenario) => {
            const status = getLevelStatus(progress, scenario.id);
            const prevId = getPreviousLevelId(scenario.id);
            const prevLevel = prevId ? currentChapterLevels.find((l) => l.id === prevId) : null;
            return (
              <button
                key={scenario.id}
                type="button"
                className={`pvz-scenario-card pvz-scenario-card--${status}${selectedScenarioId === scenario.id ? ' active' : ''}`}
                onClick={() => status !== 'locked' && handleSelect(scenario.id)}
                disabled={status === 'locked'}
              >
                <div className="pvz-card-header">
                  <strong>{scenario.id} {scenario.title}</strong>
                  <span className={`pvz-status-badge pvz-status-badge--${status}`}>
                    {status === 'completed' ? '✅' : status === 'unlocked' ? '🔓' : '🔒'}
                  </span>
                </div>
                <span>{scenario.summary}</span>
                <small>强度 {scenario.intensity} · 阳光 {scenario.baseSun}</small>
                {status === 'locked' && prevLevel && (
                  <small className="pvz-lock-hint">需通过 {prevLevel.id} {prevLevel.title}</small>
                )}
                {status === 'completed' && progress.levelRecords[scenario.id] && (
                  <small className="pvz-completed-hint">
                    卡组: {progress.levelRecords[scenario.id].usedCards.map((id) => PVZ_PLANT_MAP[id as keyof typeof PVZ_PLANT_MAP]?.shortName ?? id).join(' ')}
                  </small>
                )}
                <div className="pvz-recommended-cards">
                  <small>推荐: </small>
                  {(scenario.recommendedCards ?? []).slice(0, 4).map((cardId) => (
                    <span key={cardId} className="pvz-card-tag" title={PVZ_PLANT_MAP[cardId]?.name ?? cardId}>
                      {PVZ_PLANT_MAP[cardId]?.shortName ?? cardId}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
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
