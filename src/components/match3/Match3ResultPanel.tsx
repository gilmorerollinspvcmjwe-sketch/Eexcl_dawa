/* 三消结算面板组件。显示胜利/失败结算信息，包括星级、分数明细、连锁峰值、目标完成率，以及三个出口按钮。 */

import React, { useEffect, useState } from 'react';
import type { Match3BoardState, Match3ModeId, Match3Result } from '../../features/match3/match3Types';
import { generateResult } from '../../features/match3/match3BoardState';
import { recordLevelResult, getLevelRecord } from '../../features/match3/match3ProgressStorage';
import { getLevelById, getNextLevel } from '../../features/match3/match3LevelCatalog';
import { getModeLevelById } from '../../features/match3/match3ModeRuntime';

interface Match3ResultPanelProps {
  state: Match3BoardState;
  levelId?: string;
  levelName?: string;
  groupName?: string;
  modeId?: Match3ModeId;
  onRetry: () => void;
  onBackToSetup: () => void;
  onContinue?: () => void;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function renderStars(count: number): React.ReactNode {
  return (
    <div className="match3-stars">
      {[1, 2, 3].map((i) => (
        <span key={i} className={`match3-star ${i <= count ? 'match3-star--filled' : 'match3-star--empty'}`}>
          {i <= count ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  );
}

export const Match3ResultPanel: React.FC<Match3ResultPanelProps> = ({
  state,
  levelId,
  levelName,
  groupName,
  modeId = 'adventure',
  onRetry,
  onBackToSetup,
  onContinue,
}) => {
  const [result, setResult] = useState<Match3Result | null>(null);
  const [savedLevelId, setSavedLevelId] = useState<string | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);

  useEffect(() => {
    if ((state.phase === 'won' || state.phase === 'lost') && levelId && savedLevelId !== levelId) {
      const timer = window.setTimeout(() => {
        const generatedResult = generateResult(state);
        setResult(generatedResult);

        const previousRecord = modeId === 'adventure' ? getLevelRecord(levelId) : undefined;
        const isNewBestScore = generatedResult.score > (previousRecord?.bestScore ?? 0);
        const isNewBestStars = generatedResult.stars > (previousRecord?.bestStars ?? 0);
        setIsNewRecord(modeId === 'adventure' && (isNewBestScore || isNewBestStars));

        if (generatedResult.won && modeId === 'adventure') {
          recordLevelResult(levelId, generatedResult);
        }

        setSavedLevelId(levelId);
      }, 0);
      return () => window.clearTimeout(timer);
    } else if (state.phase !== 'won' && state.phase !== 'lost') {
      const timer = window.setTimeout(() => {
        setResult(null);
        setSavedLevelId(null);
        setIsNewRecord(false);
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [state.phase, levelId, savedLevelId, state, modeId]);

  if (state.phase !== 'won' && state.phase !== 'lost') return null;

  const adventureLevel = levelId ? getLevelById(levelId) : null;
  const modeLevel = levelId ? getModeLevelById(levelId) : null;
  const resolvedLevelName = levelName ?? adventureLevel?.name ?? modeLevel?.name ?? '三消关卡';
  const resolvedGroupName = groupName ?? adventureLevel?.packName ?? modeLevel?.chapterName ?? '章节';
  const resolvedDifficulty = adventureLevel?.difficulty ?? modeLevel?.difficulty ?? '普通';
  const nextLevel = modeId === 'adventure' && levelId ? getNextLevel(levelId) : null;

  const title = state.phase === 'won' ? '关卡通关' : '挑战失败';
  const subtitle =
    state.phase === 'won'
      ? '这一局的目标都完成了。'
      : (state.failureReason ?? '未能完成目标');

  const suggestion = state.phase === 'lost' ? (state.failureSuggestion ?? '尝试更高效地利用每一步') : null;
  const celebrationTitle = state.phase === 'won'
    ? (result?.stars === 3 ? '完美收官，节奏非常顺。' : result?.stars === 2 ? '稳稳通关，这一局控制得不错。' : '惊险过线，但还是把关卡拿下了。')
    : '这一局差一点，问题已经暴露出来了。';
  const celebrationCaption = state.phase === 'won'
    ? (isNewRecord ? '这次表现已经刷新了你的最好成绩。' : '把这一局的手感记住，下一关能更快进入状态。')
    : (suggestion ?? '先把主目标做干净，再去追额外分数。');
  const highlightLabel = state.maxMoves !== null ? '剩余步数' : '剩余时间';
  const highlightValue = state.maxMoves !== null ? `${state.moves}` : formatDuration(state.timeMs ?? 0);
  const goalProgress = state.goals.map((goal) => {
    const progress = Math.min(100, Math.round((goal.current / Math.max(goal.target, 1)) * 100));
    return {
      label: goal.type === 'collectColor' ? `${goal.colorTarget ?? '红'}色目标` : goal.type === 'dropCollect' ? '掉落目标' : goal.type === 'clearObstacle' ? '障碍目标' : goal.type === 'triggerCombo' ? '组合目标' : goal.type === 'clearOverlay' ? '覆盖目标' : '分数目标',
      detail: `${goal.current}/${goal.target}`,
      progress,
      completed: goal.current >= goal.target,
    };
  });

  return (
    <div className="match3-result-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`match3-result-panel match3-result-panel--${state.phase}`}>
        <div className="match3-result-copy">
          <div className="match3-result-hero">
            <span className={`match3-result-kicker match3-result-kicker--${state.phase}`}>{title}</span>
            <strong className="match3-result-title">{resolvedLevelName}</strong>
            <span className="match3-result-emotion">{celebrationTitle}</span>
            <span>{subtitle}</span>
            <span>{celebrationCaption}</span>
            <div className="match3-result-badges">
              <span className="match3-result-badge">模式：{modeId === 'blitz' ? 'Blitz' : modeId === 'puzzle' ? 'Puzzle' : 'Adventure'}</span>
              <span className="match3-result-badge">{resolvedGroupName}</span>
              <span className="match3-result-badge">难度：{resolvedDifficulty}</span>
              {isNewRecord && state.phase === 'won' && (
                <span className="match3-result-badge match3-result-badge--record">🎉 新纪录</span>
              )}
            </div>
            {state.phase === 'won' && result && renderStars(result.stars)}
          </div>

          {result && (
            <div className="match3-result-highlight-grid">
              <div className="match3-result-highlight-card match3-result-highlight-card--score">
                <span>总分</span>
                <strong>{result.breakdown.total}</strong>
                <small>基础 {result.breakdown.baseScore} · 连锁 +{result.breakdown.comboBonus}</small>
              </div>
              <div className="match3-result-highlight-card">
                <span>最高连锁</span>
                <strong>{result.maxCombo + 1}段</strong>
                <small>特殊块加成 +{result.breakdown.specialBonus}</small>
              </div>
              <div className="match3-result-highlight-card">
                <span>目标完成</span>
                <strong>{state.goals.filter((g) => g.current >= g.target).length}/{state.goals.length}</strong>
                <small>{state.phase === 'won' ? '这条目标线已经收干净' : '失败时优先补主目标'}</small>
              </div>
              <div className="match3-result-highlight-card">
                <span>{highlightLabel}</span>
                <strong>{highlightValue}</strong>
                <small>{result.timeMs > 0 ? `总用时 ${formatDuration(result.timeMs)}` : '本局没有额外计时压力'}</small>
              </div>
            </div>
          )}

          {result && (
            <div className="match3-score-breakdown">
              <div className="match3-score-row">
                <span className="match3-score-label">基础分数</span>
                <span className="match3-score-value">{result.breakdown.baseScore}</span>
              </div>
              <div className="match3-score-row">
                <span className="match3-score-label">连锁加成</span>
                <span className="match3-score-value">+{result.breakdown.comboBonus}</span>
              </div>
              <div className="match3-score-row">
                <span className="match3-score-label">特殊块加成</span>
                <span className="match3-score-value">+{result.breakdown.specialBonus}</span>
              </div>
              <div className="match3-score-row">
                <span className="match3-score-label">障碍清除加成</span>
                <span className="match3-score-value">+{result.breakdown.obstacleBonus}</span>
              </div>
              <div className="match3-score-row" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '4px', marginTop: '4px' }}>
                <span className="match3-score-label" style={{ fontWeight: 600 }}>总分</span>
                <span className="match3-score-value" style={{ fontWeight: 700, color: '#6366f1' }}>{result.breakdown.total}</span>
              </div>
            </div>
          )}

          <div className="match3-result-goals">
            {goalProgress.map((goal, index) => (
              <div key={`${goal.label}-${index}`} className={`match3-result-goal ${goal.completed ? 'is-complete' : ''}`}>
                <div className="match3-result-goal-copy">
                  <strong>{goal.label}</strong>
                  <span>{goal.detail}</span>
                </div>
                <div className="match3-result-goal-bar" aria-hidden="true">
                  <span style={{ width: `${goal.progress}%` }} />
                </div>
              </div>
            ))}
          </div>

          <span>使用步数：{result?.movesUsed ?? 0} · 最高连锁：{(result?.maxCombo ?? 0) + 1}段</span>
          {result && result.timeMs > 0 && <span>用时：{formatDuration(result.timeMs)}</span>}

          {suggestion && (
            <span className="match3-result-suggestion">💡 建议：{suggestion}</span>
          )}

          {nextLevel && state.phase === 'won' && (
            <span className="match3-result-next">下一关：{nextLevel.name}</span>
          )}
        </div>

        <div className="match3-result-actions">
          <button type="button" className="match3-start-btn" onClick={onRetry}>
            重开本局
          </button>
          <button type="button" className="match3-hud-btn" onClick={onBackToSetup}>
            返回选关
          </button>
          {onContinue && nextLevel && state.phase === 'won' && (
            <button type="button" className="match3-hud-btn match3-hud-btn--progress" onClick={onContinue}>
              乘胜追击
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
