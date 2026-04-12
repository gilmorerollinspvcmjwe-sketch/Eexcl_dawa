import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { GamePreset, GameSettings } from '../types';
import { GAME_PRESETS } from '../types';

const SETTINGS_STORAGE_KEY = 'excel-aim-settings-v3';
const LEGACY_SETTINGS_STORAGE_KEY = 'excel-aim-settings-v2';

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
  enemyMoveSpeed: 1.0,
  enemyMovePattern: 'linear',
  enemyRenderMode: 'text',
  colorlessMode: false,
  unlockedLevels: [1],
  credits: 0,
  colorHarmonyMode: 'none',
  spawnAnimation: 'popIn',
  enemyFontSize: 14,
  enemyFontWeight: 'bold',
  cellSettings: {
    cellWidth: 64,
    cellHeight: 20,
    colorMode: 'default',
    colorIntensity: 50,
    enableAnimation: false,
    animationSpeed: 'normal',
    colorShift: false,
  },
  global: {
    reducedMotion: false,
    showFirstTimeHints: true,
    highContrast: false,
  },
  snake: {
    defaultMode: 'classic',
    defaultDifficulty: 'normal',
    showHints: true,
    showDirectionIndicator: true,
    enableScreenShake: true,
    highContrastBoard: false,
  },
  tetris: {
    defaultMode: 'marathon',
    showGhostPiece: true,
    showNextQueue: true,
    showHoldPanel: true,
    enableScreenShake: true,
    highContrastBoard: false,
  },
  perler: {
    showReferenceImage: true,
    focusModeDefault: false,
  },
  pvz: {
    showLaneHints: true,
    autoCollectSun: false,
  },
};

interface SettingsContextType {
  settings: GameSettings;
  updateSetting: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  applyPreset: (preset: GamePreset) => void;
  resetSettings: () => void;
  unlockLevel: (level: number) => void;
  addCredits: (amount: number) => void;
  isLevelUnlocked: (level: number) => boolean;
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

function loadSettings(): GameSettings {
  const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (saved) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  const legacySaved = localStorage.getItem(LEGACY_SETTINGS_STORAGE_KEY);
  if (legacySaved) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(legacySaved) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  return DEFAULT_SETTINGS;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [tempSettings, setTempSettings] = useState<GameSettings>(settings);

  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const applyPreset = useCallback((preset: GamePreset) => {
    const config = GAME_PRESETS[preset];
    setSettings((prev) => ({
      ...prev,
      gamePreset: preset,
      sensitivityX: config.sensitivityX,
      sensitivityY: config.sensitivityY,
    }));
  }, []);

  const resetSettings = useCallback(() => {
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    localStorage.removeItem(LEGACY_SETTINGS_STORAGE_KEY);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const unlockLevel = useCallback((level: number) => {
    setSettings((prev) => {
      const currentLevels = prev.unlockedLevels ?? [1];
      if (currentLevels.includes(level)) return prev;
      return {
        ...prev,
        unlockedLevels: [...currentLevels, level].sort((a, b) => a - b),
      };
    });
  }, []);

  const addCredits = useCallback((amount: number) => {
    setSettings((prev) => ({
      ...prev,
      credits: (prev.credits ?? 0) + amount,
    }));
  }, []);

  const isLevelUnlocked = useCallback((level: number) => {
    return (settings.unlockedLevels ?? [1]).includes(level);
  }, [settings.unlockedLevels]);

  const updateTempSetting = useCallback(<K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    setTempSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateTempSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setTempSettings((prev) => ({ ...prev, ...newSettings }));
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
    <SettingsContext.Provider
      value={{
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
      }}
    >
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
