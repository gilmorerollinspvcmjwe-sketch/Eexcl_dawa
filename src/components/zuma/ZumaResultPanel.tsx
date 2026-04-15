/* 祖玛结算面板组件。显示胜利/失败结算信息，提供重开、返回选关、进入练习三个出口。 */

import React, { useEffect, useState } from 'react';
import type { ZumaBoardState } from '../../features/zuma/zumaTypes';
import { recordZumaGameResult, loadZumaProgress } from '../../features/zuma/zumaProgressStorage';
import { getLevelDefinition } from '../../features/zuma/zumaLevelCatalog';
import { getZumaObjectiveProgress } from '../../features/zuma/zumaBoardState.ts';
import { getZumaPracticeConfig, resolveZumaPracticeId } from '../../features/zuma/zumaPracticeConfigs.ts';

interface ZumaResultPanelProps {
  state: ZumaBoardState;
  onRetry: () => void;
  onBackToSetup: () => void;
  onEnterPractice?: (practiceId: string) => void;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function calculateStars(state: ZumaBoardState): number {
  if (state.phase !== 'won') return 0;

  let stars = 1;

  const accuracy = state.score.accuracy;
  if (accuracy >= 0.9) stars++;
  if (accuracy >= 0.95) stars++;

  const maxChain = state.score.maxChainComboLevel;
  if (maxChain >= 3) stars++;
  if (maxChain >= 5) stars++;

  return Math.min(5, stars);
}

function getPracticeRecommendations(state: ZumaBoardState): string[] {
  const recommendations: string[] = [];
  const level = getLevelDefinition(state.levelId);

  if (level?.recommendedPracticeTags) {
    recommendations.push(...level.recommendedPracticeTags);
  }

  if (state.score.accuracy < 0.7) {
    recommendations.push('basic-aim');
  }

  if (state.score.maxChainComboLevel < 2) {
    recommendations.push('chain-basic');
  }

  if (state.dangerLevel === 'critical' && state.phase === 'lost') {
    recommendations.push('danger-awareness');
  }

  return recommendations.slice(0, 3);
}

function getLossReasonText(state: ZumaBoardState): string {
  switch (state.endReason) {
    case 'shotsExhausted':
      return '失守原因：限定发射数已用尽';
    case 'timeExpired':
      return '失守原因：倒计时结束前未完成目标';
    case 'reachedFinish':
    default:
      return '失守原因：球链触及终点线';
  }
}

const PRACTICE_TAG_LABELS: Record<string, string> = {
  'basic-aim': '基础瞄准练习',
  'curve-aim': '弯道命中练习',
  'color-matching': '颜色匹配练习',
  'chain-basic': '连锁入门练习',
  'chain-advanced': '连锁进阶练习',
  'chain-master': '连锁大师练习',
  'powerup-basic': '道具球基础练习',
  'powerup-advanced': '道具球进阶练习',
  'powerup-chain': '道具球连锁练习',
  'rewind-timing': '回缩时机练习',
  'danger-awareness': '危险线抢救练习',
  'timed-survival': '限时生存练习',
};

export const ZumaResultPanel: React.FC<ZumaResultPanelProps> = ({
  state,
  onRetry,
  onBackToSetup,
  onEnterPractice,
}) => {
  const [settledLevelId, setSettledLevelId] = useState<string | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);

  useEffect(() => {
    if (state.phase === 'won' && state.levelId && settledLevelId !== state.levelId) {
      const progress = loadZumaProgress();
      const previousBest = progress.levelRecords[state.levelId]?.bestScore || 0;

      const result = {
        levelId: state.levelId,
        mode: state.mode,
        won: true,
        score: state.score.totalScore,
        chainLevel: state.score.maxChainComboLevel,
        accuracy: state.score.accuracy,
        elapsedMs: state.elapsedMs,
        endReason: state.endReason,
        waveReached: state.currentWave,
      };

      recordZumaGameResult(result);

      setIsNewRecord(state.score.totalScore > previousBest);
      setSettledLevelId(state.levelId);
    } else if (state.phase === 'lost' && state.levelId && settledLevelId !== state.levelId) {
      const result = {
        levelId: state.levelId,
        mode: state.mode,
        won: false,
        score: state.score.totalScore,
        chainLevel: state.score.maxChainComboLevel,
        accuracy: state.score.accuracy,
        elapsedMs: state.elapsedMs,
        endReason: state.endReason,
        waveReached: state.currentWave,
      };

      recordZumaGameResult(result);
      setSettledLevelId(state.levelId);
      setIsNewRecord(false);
    } else if (state.phase !== 'won' && state.phase !== 'lost') {
      setSettledLevelId(null);
      setIsNewRecord(false);
    }
  }, [state.phase, state.levelId, state.score, state.mode, state.elapsedMs, settledLevelId]);

  if (state.phase !== 'won' && state.phase !== 'lost') return null;

  const title = state.phase === 'won' ? '关卡通关' : '关卡失败';
  const subtitle =
    state.phase === 'won'
      ? '成功清除所有彩球，继续保持！'
      : state.mode === 'endless'
        ? `本次无尽推进到第 ${state.currentWave} 波。`
        : '球链触及终点线，需要加强练习。';

  const stars = calculateStars(state);
  const starDisplay = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);

  const practiceRecommendations = getPracticeRecommendations(state);
  const objectiveProgress = getZumaObjectiveProgress(state);
  const recommendedPracticeId = practiceRecommendations
    .map((tag) => resolveZumaPracticeId(tag))
    .find((practiceId): practiceId is string => Boolean(practiceId));
  const recommendedPracticeLabel = recommendedPracticeId
    ? getZumaPracticeConfig(recommendedPracticeId)?.name ?? PRACTICE_TAG_LABELS[recommendedPracticeId] ?? '推荐练习'
    : null;

  return (
    <div className="zuma-result-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`zuma-result-panel zuma-result-panel--${state.phase}`}>
        <div className="zuma-result-copy">
          <strong className="zuma-result-title">{title} · 关卡 {state.levelNumber}</strong>
          <span className="zuma-result-subtitle">{subtitle}</span>

          {state.phase === 'won' && (
            <div className="zuma-result-stars">
              <span className="zuma-result-stars-label">评级</span>
              <span className="zuma-result-stars-display">{starDisplay}</span>
              {isNewRecord && <span className="zuma-result-new-record">🎉 新纪录！</span>}
            </div>
          )}

          <div className="zuma-result-stats">
            <span className="zuma-result-stat">
              <strong>用时</strong>
              {formatDuration(state.elapsedMs)}
            </span>
            <span className="zuma-result-stat">
              <strong>命中率</strong>
              {Math.round(state.score.accuracy * 100)}%
            </span>
            <span className="zuma-result-stat">
              <strong>最高连锁</strong>
              {state.score.maxChainComboLevel} 层
            </span>
            <span className="zuma-result-stat">
              <strong>分数</strong>
              {state.score.totalScore}
            </span>
            {state.score.powerupsUsed > 0 && (
              <span className="zuma-result-stat">
                <strong>道具效率</strong>
                {Math.round(state.score.powerupEfficiency)}
              </span>
            )}
          </div>

          <div className="zuma-result-objectives">
            <strong>目标结算</strong>
            {objectiveProgress.map((objective) => (
              <span
                key={`${objective.type}-${objective.targetValue}`}
                className={`zuma-result-objective${objective.completed ? ' is-complete' : ' is-pending'}${objective.failed ? ' is-failed' : ''}`}
              >
                {objective.text}
              </span>
            ))}
          </div>

          {state.phase === 'won' && (
            <div className="zuma-result-summary">
              <span>发射 {state.score.shotsFired} 次，命中 {state.score.shotsHit} 次，空枪 {state.score.shotsMissed} 次</span>
              <span>触发连锁 {state.score.chainComboCount} 次，使用道具 {state.score.powerupsUsed} 次</span>
            </div>
          )}

          {state.phase === 'lost' && (
            <div className="zuma-result-failure-details">
              <span className="zuma-result-failure-reason">{getLossReasonText(state)}</span>
              {state.mode === 'endless' && (
                <span className="zuma-result-failure-stats">本次最高波段：第 {state.currentWave} 波</span>
              )}
              <span className="zuma-result-failure-stats">
                剩余球数：{state.chains.reduce((sum, chain) => sum + chain.balls.length, 0)}
              </span>
              {practiceRecommendations.length > 0 && (
                <div className="zuma-result-practice-recommendations">
                  <strong>推荐训练项：</strong>
                  {practiceRecommendations.map((tag) => (
                    <span key={tag} className="zuma-result-practice-tag">
                      {PRACTICE_TAG_LABELS[tag] || tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="zuma-result-actions">
          <button type="button" className="zuma-result-btn zuma-result-btn--primary" onClick={onRetry}>
            重开本局
          </button>
          <button type="button" className="zuma-result-btn zuma-result-btn--secondary" onClick={onBackToSetup}>
            返回选关
          </button>
          {onEnterPractice && recommendedPracticeId && (
            <button
              type="button"
              className="zuma-result-btn zuma-result-btn--tertiary"
              onClick={() => onEnterPractice(recommendedPracticeId)}
            >
              进入练习：{recommendedPracticeLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
