// 游戏计时器 Hook

import { useEffect, useRef } from 'react';

interface UseGameTimerProps {
  isPlaying: boolean;
  isPaused: boolean;
  mode: string;
  onTick?: () => void;
  onEnd?: () => void;
}

interface UseGameTimerReturn {
  // 计时器通过 props 回调，无返回值
}

export function useGameTimer(props: UseGameTimerProps): UseGameTimerReturn {
  const { isPlaying, isPaused, mode, onTick, onEnd } = props;
  
  const gameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onEndRef = useRef(onEnd);
  
  // 保持 onEnd 最新
  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    if (!isPlaying || isPaused) {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
        gameTimerRef.current = null;
      }
      return;
    }

    if (mode === 'timed') {
      gameTimerRef.current = setInterval(() => {
        if (onTick) onTick();
        
        // 当时间剩余为1秒时，下一次tick会结束游戏
        // 这里通过 onEndRef 来避免闭包问题
      }, 1000);
    }

    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
        gameTimerRef.current = null;
      }
    };
  }, [isPlaying, isPaused, mode, onTick]);

  // 清理
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    };
  }, []);

  return {};
}