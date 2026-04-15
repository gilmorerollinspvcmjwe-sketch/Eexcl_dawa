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

  return (
    <div className="match3-result-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`match3-result-panel match3-result-panel--${state.phase}`}>
        <div className="match3-result-copy">
          <strong className="match3-result-title">{title} · {resolvedLevelName}</strong>
          {state.phase === 'won' && result && renderStars(result.stars)}
          <span>{subtitle}</span>
          {isNewRecord && state.phase === 'won' && (
            <span style={{ color: '#6366f1', fontWeight: 600 }}>🎉 新纪录！</span>
          )}
          <span>模式：{modeId === 'blitz' ? 'Blitz' : modeId === 'puzzle' ? 'Puzzle' : 'Adventure'} · {resolvedGroupName} · 难度：{resolvedDifficulty}</span>

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

          <span>目标完成：{state.goals.filter((g) => g.current >= g.target).length}/{state.goals.length}</span>
          <span>使用步数：{result?.movesUsed ?? 0} · 最高连锁：{(result?.maxCombo ?? 0) + 1}段</span>
          {result && result.timeMs > 0 && <span>用时：{formatDuration(result.timeMs)}</span>}

          {suggestion && (
            <span style={{ color: '#b91c1c', fontWeight: 500 }}>💡 建议：{suggestion}</span>
          )}

          {nextLevel && state.phase === 'won' && (
            <span style={{ color: '#166534' }}>下一关：{nextLevel.name}</span>
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
            <button type="button" className="match3-hud-btn" onClick={onContinue}>
              下一关
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
