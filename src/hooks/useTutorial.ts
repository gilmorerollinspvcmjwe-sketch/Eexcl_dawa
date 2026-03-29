import { useState, useEffect, useCallback } from 'react';

export interface TutorialState {
  hasCompletedTutorial: boolean;
  currentStep: number;
  isActive: boolean;
  seenModeTutorials: Record<string, boolean>;
}

const STORAGE_KEY = 'excel-aim-tutorial-v1';

export function useTutorial() {
  const [tutorialState, setTutorialState] = useState<TutorialState>({
    hasCompletedTutorial: false,
    currentStep: 0,
    isActive: false,
    seenModeTutorials: {},
  });

  // 从 localStorage 加载状态
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTutorialState(prev => ({
          ...prev,
          hasCompletedTutorial: parsed.hasCompletedTutorial || false,
          seenModeTutorials: parsed.seenModeTutorials || {},
        }));
      } catch {
        // 解析失败，使用默认值
      }
    }
  }, []);

  // 保存到 localStorage
  const saveState = useCallback((newState: Partial<TutorialState>) => {
    setTutorialState(prev => {
      const updated = { ...prev, ...newState };
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        hasCompletedTutorial: updated.hasCompletedTutorial,
        seenModeTutorials: updated.seenModeTutorials,
      }));
      return updated;
    });
  }, []);

  // 开始教程
  const startTutorial = useCallback(() => {
    setTutorialState(prev => ({
      ...prev,
      isActive: true,
      currentStep: 0,
    }));
  }, []);

  // 下一步
  const nextStep = useCallback(() => {
    setTutorialState(prev => {
      const nextStep = prev.currentStep + 1;
      if (nextStep >= 3) {
        // 教程完成
        const updated = {
          ...prev,
          currentStep: nextStep,
          hasCompletedTutorial: true,
          isActive: false,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          hasCompletedTutorial: true,
          seenModeTutorials: prev.seenModeTutorials,
        }));
        return updated;
      }
      return { ...prev, currentStep: nextStep };
    });
  }, []);

  // 跳过教程
  const skipTutorial = useCallback(() => {
    saveState({
      hasCompletedTutorial: true,
      isActive: false,
    });
  }, [saveState]);

  // 关闭教程
  const closeTutorial = useCallback(() => {
    setTutorialState(prev => ({ ...prev, isActive: false }));
  }, []);

  // 检查是否看过某个模式的教程
  const hasSeenModeTutorial = useCallback((mode: string): boolean => {
    return tutorialState.seenModeTutorials[mode] || false;
  }, [tutorialState.seenModeTutorials]);

  // 标记已看过某个模式的教程
  const markModeTutorialSeen = useCallback((mode: string) => {
    saveState({
      seenModeTutorials: {
        ...tutorialState.seenModeTutorials,
        [mode]: true,
      },
    });
  }, [saveState, tutorialState.seenModeTutorials]);

  // 重置教程状态（用于测试）
  const resetTutorial = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setTutorialState({
      hasCompletedTutorial: false,
      currentStep: 0,
      isActive: false,
      seenModeTutorials: {},
    });
  }, []);

  return {
    tutorialState,
    startTutorial,
    nextStep,
    skipTutorial,
    closeTutorial,
    hasSeenModeTutorial,
    markModeTutorialSeen,
    resetTutorial,
  };
}
