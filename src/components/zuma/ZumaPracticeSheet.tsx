/* 祖玛练习模式Sheet组件。包含弯道命中、回缩连锁、危险线抢救、道具球专项练习模块和结果统计。 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import '../../styles/zuma.css';
import {
  startZumaGame,
  resetZumaGame,
  toggleZumaPause,
  rotateCannonToTarget,
  fireCannon,
  swapCannonBalls,
  tickZumaBoard,
  getZumaFormulaBarText,
} from '../../features/zuma/zumaBoardState';
import { createZumaPracticeBoardState, getZumaPracticeConfig } from '../../features/zuma/zumaPracticeConfigs.ts';
import { getTrackDefinition } from '../../features/zuma/zumaLevelCatalog';
import { recordPracticeSession } from '../../features/zuma/zumaProgressStorage';
import type { ZumaBoardState, ZumaClearEvent } from '../../features/zuma/zumaTypes';
import type { ZumaPracticeConfig } from '../../features/zuma/zumaPracticeConfigs.ts';
import { ZumaBoard } from './ZumaBoard';
import { ZumaHud } from './ZumaHud';
import {
  playZumaShootSound,
  playZumaMissSound,
  playZumaClearSound,
  playZumaChainComboSound,
  playZumaSwapSound,
  playZumaPowerupSound,
  playZumaDangerSound,
  playZumaWinSound,
  playZumaLoseSound,
} from '../../utils/zumaSoundUtils';

interface PracticeResult {
  practiceId: string;
  score: number;
  accuracy: number;
  chainCount: number;
  maxChainLevel: number;
  shotsFired: number;
  shotsHit: number;
  shotsMissed: number;
  powerupsUsed: number;
  elapsedMs: number;
  completed: boolean;
  objectives: {
    id: string;
    name: string;
    target: number;
    actual: number;
    achieved: boolean;
  }[];
}

interface ZumaPracticeSheetProps {
  practiceId: string;
  onFormulaChange?: (text: string) => void;
  onExit?: () => void;
  onComplete?: (result: PracticeResult) => void;
  exitLabel?: string;
}

export const ZumaPracticeSheet: React.FC<ZumaPracticeSheetProps> = ({
  practiceId,
  onFormulaChange,
  onExit,
  onComplete,
  exitLabel = '返回图鉴',
}) => {
  const config = getZumaPracticeConfig(practiceId);
  const [state, setState] = useState<ZumaBoardState>(() => {
    return createZumaPracticeBoardState(practiceId);
  });
  const [phase, setPhase] = useState<'intro' | 'playing' | 'result'>('intro');
  const [result, setResult] = useState<PracticeResult | null>(null);

  const prevEventsLengthRef = useRef(0);
  const prevDangerLevelRef = useRef(state.dangerLevel);
  const prevPhaseRef = useRef(state.phase);
  const prevShotsMissedRef = useRef(0);

  useEffect(() => {
    if (phase === 'playing') {
      const timer = window.setInterval(() => {
        setState((current) => {
          const newState = tickZumaBoard(current, 16);

          if (newState.events.length > prevEventsLengthRef.current) {
            const newEvents = newState.events.slice(prevEventsLengthRef.current);
            for (const event of newEvents) {
              switch (event.eventType) {
                case 'SHOT_FIRED':
                  playZumaShootSound();
                  break;
                case 'MATCH_CLEARED':
                  if (event.data && typeof event.data === 'object' && 'chainComboLevel' in event.data) {
                    const clearEvent = event.data as ZumaClearEvent;
                    playZumaClearSound(clearEvent.chainComboLevel);
                    if (clearEvent.chainComboLevel > 1) {
                      playZumaChainComboSound(clearEvent.chainComboLevel);
                    }
                  }
                  break;
                case 'POWERUP_TRIGGERED':
                  playZumaPowerupSound('burst');
                  break;
              }
            }
            prevEventsLengthRef.current = newState.events.length;
          }

          if (newState.dangerLevel !== prevDangerLevelRef.current) {
            if (newState.dangerLevel === 'warning' || newState.dangerLevel === 'critical') {
              playZumaDangerSound(newState.dangerLevel);
            }
            prevDangerLevelRef.current = newState.dangerLevel;
          }

          if (newState.phase !== prevPhaseRef.current) {
            if (newState.phase === 'won') {
              playZumaWinSound();
            } else if (newState.phase === 'lost') {
              playZumaLoseSound();
            }
            prevPhaseRef.current = newState.phase;
          }

          if (newState.score.shotsMissed > prevShotsMissedRef.current) {
            playZumaMissSound();
            prevShotsMissedRef.current = newState.score.shotsMissed;
          }

          if (config && newState.elapsedMs >= config.durationMs) {
            const practiceResult = calculatePracticeResult(practiceId, newState, config);
            setResult(practiceResult);
            setPhase('result');
            recordPracticeSession(practiceId, practiceResult.score);
            onComplete?.(practiceResult);
            return newState;
          }

          return newState;
        });
      }, 16);
      return () => window.clearInterval(timer);
    }
  }, [phase, practiceId, config, onComplete]);

  useEffect(() => {
    if (phase === 'intro') {
      onFormulaChange?.(`=练习: ${config?.name || '未知练习'} - 点击开始`);
    } else if (phase === 'playing') {
      onFormulaChange?.(getZumaFormulaBarText(state));
    } else if (phase === 'result') {
      onFormulaChange?.(`=练习完成: ${result?.score || 0}分 | 命中率 ${Math.round((result?.accuracy || 0) * 100)}%`);
    }
  }, [onFormulaChange, phase, state, result, config]);

  const calculatePracticeResult = (
    id: string,
    boardState: ZumaBoardState,
    practiceConfig: ZumaPracticeConfig,
  ): PracticeResult => {
    const objectives: PracticeResult['objectives'] = [];

    if (practiceConfig.targetAccuracy !== undefined) {
        objectives.push({
          id: 'accuracy',
          name: '命中率',
          target: practiceConfig.targetAccuracy * 100,
          actual: Math.round(boardState.score.accuracy * 100),
          achieved: boardState.score.accuracy >= practiceConfig.targetAccuracy,
        });
      }
      if (practiceConfig.targetHits !== undefined) {
        objectives.push({
          id: 'hits',
          name: '命中次数',
          target: practiceConfig.targetHits,
          actual: boardState.score.shotsHit,
          achieved: boardState.score.shotsHit >= practiceConfig.targetHits,
        });
      }
      if (practiceConfig.targetChainCount !== undefined) {
        objectives.push({
          id: 'chains',
          name: '连锁次数',
          target: practiceConfig.targetChainCount,
          actual: boardState.score.chainComboCount,
          achieved: boardState.score.chainComboCount >= practiceConfig.targetChainCount,
        });
      }
      if (practiceConfig.targetRescues !== undefined) {
        const rescueCount = boardState.events.filter(
          (e) => e.eventType === 'DANGER_LEVEL_CHANGED' && e.data === 'safe'
        ).length;
        objectives.push({
          id: 'rescues',
          name: '抢救次数',
          target: practiceConfig.targetRescues,
          actual: rescueCount,
          achieved: rescueCount >= practiceConfig.targetRescues,
        });
      }
      if (practiceConfig.targetPowerupHits !== undefined) {
        objectives.push({
          id: 'powerups',
          name: '道具球使用',
          target: practiceConfig.targetPowerupHits,
          actual: boardState.score.powerupsUsed,
          achieved: boardState.score.powerupsUsed >= practiceConfig.targetPowerupHits,
        });
      }

    const completed = objectives.every((o) => o.achieved);
    const score = boardState.score.totalScore + (completed ? 100 : 0);

    return {
      practiceId: id,
      score,
      accuracy: boardState.score.accuracy,
      chainCount: boardState.score.chainComboCount,
      maxChainLevel: boardState.score.maxChainComboLevel,
      shotsFired: boardState.score.shotsFired,
      shotsHit: boardState.score.shotsHit,
      shotsMissed: boardState.score.shotsMissed,
      powerupsUsed: boardState.score.powerupsUsed,
      elapsedMs: boardState.score.elapsedMs,
      completed,
      objectives,
    };
  };

  const handleStartPractice = useCallback(() => {
    prevEventsLengthRef.current = 0;
    prevDangerLevelRef.current = 'safe';
    prevPhaseRef.current = 'setup';
    prevShotsMissedRef.current = 0;
    setState((current) => startZumaGame(current));
    setPhase('playing');
  }, []);

  const handleRestart = useCallback(() => {
    prevEventsLengthRef.current = 0;
    prevDangerLevelRef.current = 'safe';
    prevPhaseRef.current = 'setup';
    prevShotsMissedRef.current = 0;
    setResult(null);
    setState((current) => resetZumaGame(current));
    setPhase('intro');
  }, []);

  const handleTogglePause = useCallback(() => {
    setState((current) => toggleZumaPause(current));
  }, []);

  const handleCanvasClick = useCallback((x: number, y: number) => {
    if (phase !== 'playing') return;
    if (!state.cannon.isReady) return;
    setState((current) => {
      const rotated = rotateCannonToTarget(current, x, y);
      return fireCannon(rotated);
    });
  }, [phase, state.cannon.isReady]);

  const handleCanvasMouseMove = useCallback((x: number, y: number) => {
    if (phase !== 'playing') return;
    setState((current) => rotateCannonToTarget(current, x, y));
  }, [phase]);

  const handleSwapBalls = useCallback(() => {
    if (!state.cannon.isReady) return;
    playZumaSwapSound();
    setState((current) => swapCannonBalls(current));
  }, [state.cannon.isReady]);

  const handleExit = useCallback(() => {
    onExit?.();
  }, [onExit]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.isPaused) {
        if (e.key === 'Escape' || e.key === ' ' || e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          handleTogglePause();
        }
        return;
      }
      switch (e.key) {
        case 'Tab':
          e.preventDefault();
          handleSwapBalls();
          break;
        case 'Escape':
        case ' ':
        case 'p':
        case 'P':
          e.preventDefault();
          handleTogglePause();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, state.isPaused, handleSwapBalls, handleTogglePause]);

  if (!config) {
    return (
      <div className="zuma-practice-sheet">
        <div className="zuma-practice-error">
          <h3>练习不存在</h3>
          <p>未找到练习配置: {practiceId}</p>
          <button type="button" onClick={handleExit}>返回</button>
        </div>
      </div>
    );
  }

  return (
    <div className="zuma-practice-sheet">
      {phase === 'intro' && (
        <div className="zuma-practice-intro">
          <div className="zuma-practice-intro-header">
            <h2>{config.name}</h2>
            <span className="zuma-practice-duration">时长: {Math.round(config.durationMs / 1000)}秒</span>
          </div>
          <p className="zuma-practice-description">{config.description}</p>
          <div className="zuma-practice-objective">
            <strong>目标</strong>
            <span>{config.objective}</span>
          </div>
          <div className="zuma-practice-config">
            <span>轨道: {getTrackDefinition(config.trackId)?.name || config.trackId}</span>
            <span>颜色: {config.colorPool.join('、')}</span>
            <span>初始球数: {config.initialBalls}</span>
          </div>
          <div className="zuma-practice-actions">
            <button type="button" className="zuma-practice-start-btn" onClick={handleStartPractice}>
              开始练习
            </button>
            <button type="button" className="zuma-practice-exit-btn" onClick={handleExit}>
              {exitLabel}
            </button>
          </div>
        </div>
      )}

      {phase === 'playing' && (
        <>
          <ZumaHud
            state={state}
            onTogglePause={handleTogglePause}
            onToggleSpeed={() => {}}
            onRestart={handleRestart}
          />
          <ZumaBoard
            state={state}
            onCanvasClick={handleCanvasClick}
            onCanvasMouseMove={handleCanvasMouseMove}
          />
          <div className="zuma-practice-controls">
            <button type="button" className="zuma-control-btn" onClick={handleSwapBalls}>
              切换球
            </button>
            <button type="button" className="zuma-control-btn" onClick={handleTogglePause}>
              {state.isPaused ? '继续' : '暂停'}
            </button>
          </div>
          <div className="zuma-practice-timer">
            剩余时间: {Math.max(0, Math.round((config.durationMs - state.elapsedMs) / 1000))}秒
          </div>
        </>
      )}

      {phase === 'result' && result && (
        <div className="zuma-practice-result">
          <div className="zuma-practice-result-header">
            <h2>{result.completed ? '练习完成' : '练习结束'}</h2>
            <span className={`zuma-result-badge ${result.completed ? 'completed' : 'partial'}`}>
              {result.completed ? '达标' : '未达标'}
            </span>
          </div>
          <div className="zuma-practice-score">
            <strong>得分</strong>
            <span className="zuma-score-value">{result.score}</span>
          </div>
          <div className="zuma-practice-objectives">
            <h3>目标达成情况</h3>
            {result.objectives.map((objective) => (
              <div key={objective.id} className={`zuma-objective-item ${objective.achieved ? 'achieved' : 'missed'}`}>
                <span className="zuma-objective-name">{objective.name}</span>
                <span className="zuma-objective-value">
                  {objective.actual} / {objective.target}
                </span>
                <span className="zuma-objective-status">
                  {objective.achieved ? '✓' : '✗'}
                </span>
              </div>
            ))}
          </div>
          <div className="zuma-practice-stats">
            <h3>详细统计</h3>
            <div className="zuma-stats-grid">
              <div className="zuma-stat-item">
                <span>命中率</span>
                <strong>{Math.round(result.accuracy * 100)}%</strong>
              </div>
              <div className="zuma-stat-item">
                <span>发射次数</span>
                <strong>{result.shotsFired}</strong>
              </div>
              <div className="zuma-stat-item">
                <span>命中次数</span>
                <strong>{result.shotsHit}</strong>
              </div>
              <div className="zuma-stat-item">
                <span>空枪次数</span>
                <strong>{result.shotsMissed}</strong>
              </div>
              <div className="zuma-stat-item">
                <span>连锁次数</span>
                <strong>{result.chainCount}</strong>
              </div>
              <div className="zuma-stat-item">
                <span>最高连锁</span>
                <strong>{result.maxChainLevel}层</strong>
              </div>
              <div className="zuma-stat-item">
                <span>道具球使用</span>
                <strong>{result.powerupsUsed}</strong>
              </div>
              <div className="zuma-stat-item">
                <span>用时</span>
                <strong>{Math.round(result.elapsedMs / 1000)}秒</strong>
              </div>
            </div>
          </div>
          <div className="zuma-practice-actions">
            <button type="button" className="zuma-practice-retry-btn" onClick={handleRestart}>
              再次练习
            </button>
            <button type="button" className="zuma-practice-exit-btn" onClick={handleExit}>
              {exitLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
