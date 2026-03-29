import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { GameSettings, GamePreset } from '../types';
import { GAME_PRESETS } from '../types';

const DEFAULT_SETTINGS: GameSettings = {
  sensitivity: 1.0,
  sensitivityX: 1.0,
  sensitivityY: 1.0,
  customCursor: true,
  crosshairStyle: 'cross',
  crosshairColor: '#00ff00',
  crosshairSize: 12,
  spawnRate: 5,
  targetDuration: 5,
  targetSize: 20,
  soundEnabled: true,
  difficulty: 'normal',
  headshotLineEnabled: false,
  headshotLineRow: 10,
  gamePreset: 'custom',
  trainingDuration: 60,
  // P2: 移动速度配置
  enemyMoveSpeed: 1.0,
  enemyMovePattern: 'linear',
  // P2: 敌人渲染模式
  enemyRenderMode: 'text',
  // 无色模式
  colorlessMode: false,
  // P1: 关卡进度
  unlockedLevels: [1], // 初始解锁第1关
  credits: 0,
  // 视觉系统设置
  colorHarmonyMode: 'none',
  spawnAnimation: 'popIn',
  enemyFontSize: 14,
  enemyFontWeight: 'bold',
  // 单元格设置 (Sheet2 外观)
  cellSettings: {
    cellWidth: 64,
    cellHeight: 20,
    colorMode: 'default',
    colorIntensity: 50,
    enableAnimation: false,
    animationSpeed: 'normal',
    colorShift: false,
  },
};

interface SettingsContextType {
  settings: GameSettings;
  updateSetting: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  applyPreset: (preset: GamePreset) => void;
  resetSettings: () => void;
  // P1: 关卡进度管理
  unlockLevel: (level: number) => void;
  addCredits: (amount: number) => void;
  isLevelUnlocked: (level: number) => boolean;
  // 临时设置状态（用于设置面板）
  tempSettings: GameSettings;
  updateTempSetting: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  updateTempSettings: (newSettings: Partial<GameSettings>) => void;
  saveSettings: () => void;
  cancelSettings: () => void;
  resetTempSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('excel-aim-settings-v2');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  // 临时设置状态（用于设置面板编辑）
  const [tempSettings, setTempSettings] = useState<GameSettings>(settings);

  // 当 settings 变化时，同步更新 tempSettings
  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  // 持久化设置到 localStorage
  useEffect(() => {
    localStorage.setItem('excel-aim-settings-v2', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const applyPreset = useCallback((preset: GamePreset) => {
    const config = GAME_PRESETS[preset];
    setSettings(prev => ({
      ...prev,
      gamePreset: preset,
      sensitivityX: config.sensitivityX,
      sensitivityY: config.sensitivityY,
    }));
  }, []);

  const resetSettings = useCallback(() => {
    localStorage.removeItem('excel-aim-settings-v2');
    setSettings(DEFAULT_SETTINGS);
  }, []);

  // P1: 解锁关卡
  const unlockLevel = useCallback((level: number) => {
    setSettings(prev => {
      const currentLevels = prev.unlockedLevels ?? [1];
      if (currentLevels.includes(level)) return prev;
      return {
        ...prev,
        unlockedLevels: [...currentLevels, level].sort((a, b) => a - b),
      };
    });
  }, []);

  // P1: 添加积分
  const addCredits = useCallback((amount: number) => {
    setSettings(prev => ({
      ...prev,
      credits: (prev.credits ?? 0) + amount,
    }));
  }, []);

  // P1: 检查关卡是否解锁
  const isLevelUnlocked = useCallback((level: number) => {
    return (settings.unlockedLevels ?? [1]).includes(level);
  }, [settings.unlockedLevels]);

  // 临时设置操作
  const updateTempSetting = useCallback(<K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    setTempSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateTempSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setTempSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const saveSettings = useCallback(() => {
    setSettings(tempSettings);
  }, [tempSettings]);

  const cancelSettings = useCallback(() => {
    setTempSettings(settings);
  }, [settings]);

  const resetTempSettings = useCallback(() => {
    setTempSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSetting, 
      updateSettings, 
      applyPreset, 
      resetSettings,
      unlockLevel,
      addCredits,
      isLevelUnlocked,
      tempSettings,
      updateTempSetting,
      updateTempSettings,
      saveSettings,
      cancelSettings,
      resetTempSettings,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
