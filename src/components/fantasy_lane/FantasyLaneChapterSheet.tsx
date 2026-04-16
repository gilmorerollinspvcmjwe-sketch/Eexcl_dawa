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
}

export const FantasyLaneChapterSheet: React.FC<FantasyLaneChapterSheetProps> = ({ onFormulaChange }) => {
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
    onFormulaChange?.(`= 章节与关卡目录 | ${currentLevel.chapterName} | ${currentLevel.id} ${currentLevel.name} | 进度 ${summary.completedLevels}/${summary.totalLevels}`);
  }, [onFormulaChange, progress, selectedLevelId]);

  const visibleLevels = useMemo(() => getFantasyLaneLevelsByChapter(selectedChapterId), [selectedChapterId]);
  const currentLevel = getFantasyLaneLevelById(selectedLevelId);
  const chapterProgress = getFantasyLaneChapterProgress(progress, selectedChapterId);
  const summary = getFantasyLaneProgressSummary(progress);

  return (
    <div className="fantasy-lane-info-sheet">
      <section className="fantasy-lane-info-panel fantasy-lane-info-panel--header">
        <div>
          <h2>章节与关卡目录</h2>
          <p>这里负责主线总览、章节推进和选关回流。战斗页面进行对战。</p>
        </div>
      </section>

      <section className="fantasy-lane-info-panel">
        <h3>总进度</h3>
        <div className="fantasy-lane-progress-overview">
          <div className="fantasy-lane-progress-stat">
            <span className="fantasy-lane-progress-label">已通关</span>
            <strong>{summary.completedLevels}/{summary.totalLevels}</strong>
          </div>
          <div className="fantasy-lane-progress-stat">
            <span className="fantasy-lane-progress-label">星级</span>
            <strong>{summary.totalStars}/{summary.maxStars}</strong>
          </div>
          <div className="fantasy-lane-progress-stat">
            <span className="fantasy-lane-progress-label">最高分</span>
            <strong>{summary.bestScore}</strong>
          </div>
          <div className="fantasy-lane-progress-stat">
            <span className="fantasy-lane-progress-label">当前章节</span>
            <strong>{summary.currentChapterLabel}</strong>
          </div>
        </div>
      </section>

      <section className="fantasy-lane-info-panel">
        <h3>章节导航</h3>
        <div className="fantasy-lane-chapter-table">
          <div className="fantasy-lane-chapter-table-header">
            <span className="fantasy-lane-chapter-col-order">章节</span>
            <span className="fantasy-lane-chapter-col-name">名称</span>
            <span className="fantasy-lane-chapter-col-progress">进度</span>
            <span className="fantasy-lane-chapter-col-bar">进度条</span>
          </div>
          {chapters.map((chapter, index) => {
            const currentChapterProgress = getFantasyLaneChapterProgress(progress, chapter.id);
            const percent = currentChapterProgress.total > 0 ? Math.round((currentChapterProgress.completed / currentChapterProgress.total) * 100) : 0;
            const isComplete = currentChapterProgress.completed === currentChapterProgress.total;
            return (
              <button
                key={chapter.id}
                type="button"
                className={`fantasy-lane-chapter-table-row${index % 2 === 0 ? '' : ' is-alt'}${selectedChapterId === chapter.id ? ' is-active' : ''}`}
                onClick={() => setSelectedChapterId(chapter.id)}
              >
                <span className="fantasy-lane-chapter-col-order">
                  <span className={`fantasy-lane-tag fantasy-lane-tag--chapter-${chapter.order % 5}`}>{chapter.order}</span>
                </span>
                <span className="fantasy-lane-chapter-col-name">
                  <strong>{chapter.name}</strong>
                  <small>{chapter.theme}</small>
                </span>
                <span className="fantasy-lane-chapter-col-progress">
                  {currentChapterProgress.completed}/{currentChapterProgress.total}
                </span>
                <span className="fantasy-lane-chapter-col-bar">
                  <div className="fantasy-lane-progress-bar">
                    <div
                      className={`fantasy-lane-progress-bar-fill${isComplete ? ' is-complete' : ''}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <small>{percent}%</small>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="fantasy-lane-info-panel">
        <h3>{chapters.find((chapter) => chapter.id === selectedChapterId)?.name}</h3>
        <div className="fantasy-lane-chapter-progress-detail">
          <span>章节进度：{chapterProgress.completed}/{chapterProgress.total}</span>
          <span>章节星级：{chapterProgress.stars}/{chapterProgress.maxStars}</span>
        </div>
        <div className="fantasy-lane-level-table">
          <div className="fantasy-lane-level-table-header">
            <span className="fantasy-lane-level-col-id">关卡</span>
            <span className="fantasy-lane-level-col-name">名称</span>
            <span className="fantasy-lane-level-col-status">状态</span>
            <span className="fantasy-lane-level-col-stars">星级</span>
            <span className="fantasy-lane-level-col-score">最高分</span>
          </div>
          {visibleLevels.map((level, index) => {
            const status = getFantasyLaneLevelStatus(progress, level.id);
            const record = progress.levelRecords[level.id];
            return (
              <button
                key={level.id}
                type="button"
                className={`fantasy-lane-level-table-row${index % 2 === 0 ? '' : ' is-alt'}${selectedLevelId === level.id ? ' is-active' : ''}`}
                onClick={() => {
                  if (status === 'locked') return;
                  setSelectedLevelId(level.id);
                  emitFantasyLaneLevelSelection(level.id);
                }}
                disabled={status === 'locked'}
              >
                <span className="fantasy-lane-level-col-id">
                  <strong>{level.id}</strong>
                </span>
                <span className="fantasy-lane-level-col-name">
                  <strong>{level.name}</strong>
                  <small>{level.description}</small>
                </span>
                <span className="fantasy-lane-level-col-status">
                  <span className={`fantasy-lane-tag fantasy-lane-tag--status-${status}`}>
                    {status === 'completed' ? '已通关' : status === 'unlocked' ? '已解锁' : '未解锁'}
                  </span>
                </span>
                <span className="fantasy-lane-level-col-stars">
                  {status === 'completed' ? '★'.repeat(record?.bestStars ?? 0) + '☆'.repeat(3 - (record?.bestStars ?? 0)) : '-'}
                </span>
                <span className="fantasy-lane-level-col-score">
                  {status === 'completed' ? record?.bestScore ?? 0 : '-'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="fantasy-lane-info-panel">
        <h3>当前关卡摘要</h3>
        <div className="fantasy-lane-level-detail-table">
          <div className="fantasy-lane-level-detail-row">
            <span className="fantasy-lane-level-detail-label">关卡</span>
            <span className="fantasy-lane-level-detail-value"><strong>{currentLevel.id} {currentLevel.name}</strong></span>
          </div>
          <div className="fantasy-lane-level-detail-row">
            <span className="fantasy-lane-level-detail-label">章节</span>
            <span className="fantasy-lane-level-detail-value">{currentLevel.chapterName}</span>
          </div>
          <div className="fantasy-lane-level-detail-row">
            <span className="fantasy-lane-level-detail-label">时间限制</span>
            <span className="fantasy-lane-level-detail-value">{Math.round(currentLevel.battleTimeLimitMs / 1000)}s</span>
          </div>
          <div className="fantasy-lane-level-detail-row">
            <span className="fantasy-lane-level-detail-label">我方主堡</span>
            <span className="fantasy-lane-level-detail-value">{currentLevel.playerBaseHp}</span>
          </div>
          <div className="fantasy-lane-level-detail-row">
            <span className="fantasy-lane-level-detail-label">敌方主堡</span>
            <span className="fantasy-lane-level-detail-value">{currentLevel.enemyBaseHp}</span>
          </div>
          <div className="fantasy-lane-level-detail-row">
            <span className="fantasy-lane-level-detail-label">压力等级</span>
            <span className="fantasy-lane-level-detail-value">{currentLevel.enemyPressure}</span>
          </div>
          <div className="fantasy-lane-level-detail-row">
            <span className="fantasy-lane-level-detail-label">建议英雄</span>
            <span className="fantasy-lane-level-detail-value">{currentLevel.suggestedHeroes.join(' / ') || '-'}</span>
          </div>
          <div className="fantasy-lane-level-detail-row">
            <span className="fantasy-lane-level-detail-label">敌军池</span>
            <span className="fantasy-lane-level-detail-value">{currentLevel.enemyPool.join(' / ')}</span>
          </div>
          <div className="fantasy-lane-level-detail-row">
            <span className="fantasy-lane-level-detail-label">提示</span>
            <span className="fantasy-lane-level-detail-value">{currentLevel.hint}</span>
          </div>
        </div>
      </section>
    </div>
  );
};
