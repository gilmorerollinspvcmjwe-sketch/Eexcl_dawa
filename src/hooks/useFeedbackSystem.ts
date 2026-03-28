import { useState, useEffect, useCallback, useRef } from 'react';
import { getFeedbackMessage, type FeedbackMessage, type FeedbackConfig } from '../utils/feedbackMessages';

interface UseFeedbackSystemProps {
  combo: number;
  missStreak: number;
  headshotStreak: number;
  headshotRate: number;
  score: number;
  bestScore: number;
  isPlaying: boolean;
  feedbackMode: 'fancy' | 'excel';
}

interface UseFeedbackSystemReturn {
  currentFeedback: FeedbackMessage | null;
  triggerFeedback: (type: 'hit' | 'miss' | 'headshot' | 'start' | 'end') => void;
  clearFeedback: () => void;
}

export function useFeedbackSystem(props: UseFeedbackSystemProps): UseFeedbackSystemReturn {
  const { combo, missStreak, headshotStreak, headshotRate, score, bestScore, isPlaying, feedbackMode } = props;

  const [currentFeedback, setCurrentFeedback] = useState<FeedbackMessage | null>(null);
  const prevComboRef = useRef(0);
  const prevMissStreakRef = useRef(0);
  const prevHeadshotStreakRef = useRef(0);
  const prevIsPlayingRef = useRef(false);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFeedbackIdRef = useRef<string>('');

  const showFeedback = useCallback((feedback: FeedbackMessage) => {
    if (feedback.id === lastFeedbackIdRef.current) {
      return;
    }

    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    lastFeedbackIdRef.current = feedback.id;
    setCurrentFeedback(feedback);

    feedbackTimeoutRef.current = setTimeout(() => {
      setCurrentFeedback(null);
      lastFeedbackIdRef.current = '';
    }, feedback.duration);
  }, []);

  const clearFeedback = useCallback(() => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    setCurrentFeedback(null);
    lastFeedbackIdRef.current = '';
  }, []);

  const triggerFeedback = useCallback((type: 'hit' | 'miss' | 'headshot' | 'start' | 'end') => {
    const config: FeedbackConfig = {
      combo,
      missStreak,
      headshotStreak,
      headshotRate,
      score,
      bestScore,
      isPlaying,
      justStarted: type === 'start',
      justEnded: type === 'end',
    };

    const feedback = getFeedbackMessage(config);
    if (feedback) {
      showFeedback(feedback);
    }
  }, [combo, missStreak, headshotStreak, headshotRate, score, bestScore, isPlaying, showFeedback]);

  useEffect(() => {
    if (combo > prevComboRef.current && combo > 0 && missStreak === 0) {
      const config: FeedbackConfig = {
        combo,
        missStreak: 0,
        headshotStreak,
        headshotRate,
        score,
        bestScore,
        isPlaying,
        justStarted: false,
        justEnded: false,
      };
      const feedback = getFeedbackMessage(config);
      if (feedback) {
        showFeedback(feedback);
      }
    }
    prevComboRef.current = combo;
  }, [combo, headshotStreak, headshotRate, score, bestScore, isPlaying, showFeedback]);

  useEffect(() => {
    if (missStreak > prevMissStreakRef.current && missStreak > 0) {
      const config: FeedbackConfig = {
        combo,
        missStreak,
        headshotStreak,
        headshotRate,
        score,
        bestScore,
        isPlaying,
        justStarted: false,
        justEnded: false,
      };
      const feedback = getFeedbackMessage(config);
      if (feedback) {
        showFeedback(feedback);
      }
    }
    prevMissStreakRef.current = missStreak;
  }, [missStreak, combo, headshotStreak, headshotRate, score, bestScore, isPlaying, showFeedback]);

  useEffect(() => {
    if (headshotStreak > prevHeadshotStreakRef.current && headshotStreak > 0) {
      const config: FeedbackConfig = {
        combo,
        missStreak,
        headshotStreak,
        headshotRate,
        score,
        bestScore,
        isPlaying,
        justStarted: false,
        justEnded: false,
      };
      const feedback = getFeedbackMessage(config);
      if (feedback) {
        showFeedback(feedback);
      }
    }
    prevHeadshotStreakRef.current = headshotStreak;
  }, [headshotStreak, combo, missStreak, headshotRate, score, bestScore, isPlaying, showFeedback]);

  useEffect(() => {
    if (isPlaying && !prevIsPlayingRef.current) {
      triggerFeedback('start');
    } else if (!isPlaying && prevIsPlayingRef.current) {
      triggerFeedback('end');
    }
    prevIsPlayingRef.current = isPlaying;
  }, [isPlaying, triggerFeedback]);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  return {
    currentFeedback,
    triggerFeedback,
    clearFeedback,
  };
}
