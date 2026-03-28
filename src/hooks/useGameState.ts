// 游戏状态管理 Hook

import { useState, useCallback } from 'react';
import type { GameState, GameMode, TimedDuration } from '../types';

interface UseGameStateReturn {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  resetGameState: (mode: GameMode, duration?: TimedDuration, headshotLineRow?: number) => void;
  updateScore: (points: number) => void;
  incrementCombo: () => void;
  resetCombo: () => void;
  incrementMisses: () => void;
  incrementClicks: () => void;
  incrementHits: (isHead: boolean) => void;
  incrementHeadAppearances: () => void;
}

export function useGameState(initialHeadshotLineRow: number = 10): UseGameStateReturn {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    mode: 'timed',
    timedDuration: 60,
    timeRemaining: 60,
    score: 0,
    combo: 0,
    maxCombo: 0,
    misses: 0,
    totalClicks: 0,
    hits: 0,
    headHits: 0,
    headAppearances: 0,
    headshotLineRow: initialHeadshotLineRow,
    missStreak: 0,
    headshotStreak: 0,
  });

  const resetGameState = useCallback((mode: GameMode, duration?: TimedDuration, headshotLineRow?: number) => {
    setGameState({
      isPlaying: true,
      isPaused: false,
      mode,
      timedDuration: duration || 60,
      timeRemaining: duration || 60,
      score: 0,
      combo: 0,
      maxCombo: 0,
      misses: 0,
      totalClicks: 0,
      hits: 0,
      headHits: 0,
      headAppearances: 0,
      headshotLineRow: headshotLineRow || 10,
      missStreak: 0,
      headshotStreak: 0,
    });
  }, []);

  const updateScore = useCallback((points: number) => {
    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
    }));
  }, []);

  const incrementCombo = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      combo: prev.combo + 1,
      maxCombo: Math.max(prev.maxCombo, prev.combo + 1),
    }));
  }, []);

  const resetCombo = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      combo: 0,
    }));
  }, []);

  const incrementMisses = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      misses: prev.misses + 1,
      missStreak: prev.missStreak + 1,
      headshotStreak: 0,
    }));
  }, []);

  const incrementClicks = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      totalClicks: prev.totalClicks + 1,
    }));
  }, []);

  const incrementHits = useCallback((isHead: boolean) => {
    setGameState(prev => ({
      ...prev,
      hits: prev.hits + 1,
      headHits: isHead ? prev.headHits + 1 : prev.headHits,
      missStreak: 0,
      headshotStreak: isHead ? prev.headshotStreak + 1 : 0,
    }));
  }, []);

  const incrementHeadAppearances = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      headAppearances: prev.headAppearances + 1,
    }));
  }, []);

  return {
    gameState,
    setGameState,
    resetGameState,
    updateScore,
    incrementCombo,
    resetCombo,
    incrementMisses,
    incrementClicks,
    incrementHits,
    incrementHeadAppearances,
  };
}