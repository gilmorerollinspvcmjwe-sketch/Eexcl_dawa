import React, { useEffect, useMemo, useState } from 'react';
import { getFantasyLaneChapters, getFantasyLaneLevelById, getFantasyLaneLevelsByChapter } from '../../features/fantasy_lane/fantasyLaneLevelCatalog.ts';
import {
  getFantasyLaneChapterProgress,
  getFantasyLaneLevelStatus,
  getFantasyLaneProgressSummary,
  loadFantasyLaneProgress,
} from '../../features/fantasy_lane/fantasyLaneProgressStorage.ts';
import { emitFantasyLaneLevelSelection, getLatestFantasyLaneLevelSelection, subscribeFantasyLaneLevelSelection } from '../../features/fantasy_lane/fantasyLaneSelectionBridge.ts';
import '../../styles/fantasy-lane.css';

interface FantasyLaneChapterSheetProps {
  onFormulaChange?: (text: string) => void;
  onOpenBattle?: () => void;
}

export const FantasyLaneChapterSheet: React.FC<FantasyLaneChapterSheetProps> = ({ onFormulaChange, onOpenBattle }) => {
  const chapters = useMemo(() => getFantasyLaneChapters(), []);
  const initialLevelId = getLatestFantasyLaneLevelSelection();
  const [selectedLevelId, setSelectedLevelId] = useState(initialLevelId);
  const [selectedChapterId, setSelectedChapterId] = useState(getFantasyLaneLevelById(initialLevelId).chapterId);
  const [progress, setProgress] = useState(() => loadFantasyLaneProgress());

  useEffect(() => {
    const unsubscribe = subscribeFantasyLaneLevelSelection((levelId) => {
      setSelectedLevelId(levelId);
      setSelectedChapterId(getFantasyLaneLevelById(levelId).chapterId);
      setProgress(loadFantasyLaneProgress());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const currentLevel = getFantasyLaneLevelById(selectedLevelId);
    const summary = getFantasyLaneProgressSummary(progress);
    onFormulaChange?.(`=Sheet20 章节与关卡 | ${currentLevel.chapterName} | ${currentLevel.id} ${currentLevel.name} | 进度 ${summary.completedLevels}/${summary.totalLevels}`);
  }, [onFormulaChange, progress, selectedLevelId]);

  const visibleLevels = useMemo(() => getFantasyLaneLevelsByChapter(selectedChapterId), [selectedChapterId]);
  const currentLevel = getFantasyLaneLevelById(selectedLevelId);
  const chapterProgress = getFantasyLaneChapterProgress(progress, selectedChapterId);
  const summary = getFantasyLaneProgressSummary(progress);

  return (
    <div className="fantasy-lane-info-sheet">
      <section className="fantasy-lane-info-panel fantasy-lane-info-panel--header">
        <div>
          <span className="fantasy-lane-kicker">Sheet20</span>
          <h2>章节与关卡目录</h2>
          <p>这里负责主线总览、章节推进和选关回流。战斗本体仍回到 Sheet18 处理。</p>
        </div>
        {onOpenBattle && (
          <button type="button" className="fantasy-lane-btn fantasy-lane-btn--primary" onClick={onOpenBattle}>
            前往 Sheet18
          </button>
        )}
      </section>

      <section className="fantasy-lane-info-panel">
        <h3>总进度</h3>
        <div className="fantasy-lane-roster-meta">
          <span>已通关 {summary.completedLevels}/{summary.totalLevels}</span>
          <span>星级 {summary.totalStars}/{summary.maxStars}</span>
          <span>最高分 {summary.bestScore}</span>
          <span>当前章节 {summary.currentChapterLabel}</span>
        </div>
      </section>

      <section className="fantasy-lane-info-panel">
        <h3>章节导航</h3>
        <div className="fantasy-lane-chapter-strip">
          {chapters.map((chapter) => {
            const currentChapterProgress = getFantasyLaneChapterProgress(progress, chapter.id);
            return (
              <button
                key={chapter.id}
                type="button"
                className={`fantasy-lane-chip${selectedChapterId === chapter.id ? ' is-active' : ''}`}
                onClick={() => setSelectedChapterId(chapter.id)}
              >
                {chapter.order}. {chapter.name} ({currentChapterProgress.completed}/{currentChapterProgress.total})
              </button>
            );
          })}
        </div>
      </section>

      <section className="fantasy-lane-info-panel">
        <h3>{chapters.find((chapter) => chapter.id === selectedChapterId)?.name}</h3>
        <p>章节进度：{chapterProgress.completed}/{chapterProgress.total}，章节星级 {chapterProgress.stars}/{chapterProgress.maxStars}</p>
        <div className="fantasy-lane-level-list">
          {visibleLevels.map((level) => {
            const status = getFantasyLaneLevelStatus(progress, level.id);
            const record = progress.levelRecords[level.id];
            return (
              <button
                key={level.id}
                type="button"
                className={`fantasy-lane-level-card${selectedLevelId === level.id ? ' is-active' : ''}`}
                onClick={() => {
                  if (status === 'locked') return;
                  setSelectedLevelId(level.id);
                  emitFantasyLaneLevelSelection(level.id);
                }}
                disabled={status === 'locked'}
              >
                <strong>{level.id} {level.name}</strong>
                <span>{level.description}</span>
                <small>推荐：{level.recommendedTags.join(' / ')}</small>
                <small>
                  {status === 'completed'
                    ? `已通关 | ${'★'.repeat(record?.bestStars ?? 0)}${'☆'.repeat(3 - (record?.bestStars ?? 0))} | ${record?.bestScore ?? 0}`
                    : status === 'unlocked'
                      ? '已解锁'
                      : '未解锁'}
                </small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="fantasy-lane-info-panel">
        <h3>当前关卡摘要</h3>
        <div className="fantasy-lane-roster-card">
          <div className="fantasy-lane-roster-card-head">
            <strong>{currentLevel.id} {currentLevel.name}</strong>
            <span>{currentLevel.chapterName}</span>
          </div>
          <p>{currentLevel.hint}</p>
          <div className="fantasy-lane-roster-meta">
            <span>时间 {Math.round(currentLevel.battleTimeLimitMs / 1000)}s</span>
            <span>我方主堡 {currentLevel.playerBaseHp}</span>
            <span>敌方主堡 {currentLevel.enemyBaseHp}</span>
            <span>压力 {currentLevel.enemyPressure}</span>
          </div>
          <small>建议英雄：{currentLevel.suggestedHeroes.join(' / ')} | 敌军池：{currentLevel.enemyPool.join(' / ')}</small>
        </div>
      </section>
    </div>
  );
};
