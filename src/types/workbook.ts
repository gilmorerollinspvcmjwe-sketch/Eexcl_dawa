export type WorkbookAlertTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface WorkbookStatusSummary {
  isPlaying: boolean;
  primaryText: string;
  score?: number;
  secondaryMetric?: string;
  tertiaryMetric?: string;
  mode?: string;
  alertTone?: WorkbookAlertTone;
}

export interface GlobalWorkbookSettings {
  reducedMotion: boolean;
  showFirstTimeHints: boolean;
  highContrast: boolean;
}

export interface SnakeSettings {
  defaultMode: 'classic' | 'timed' | 'challenge';
  defaultDifficulty: 'easy' | 'normal' | 'hard';
  showHints: boolean;
  showDirectionIndicator: boolean;
  enableScreenShake: boolean;
  highContrastBoard: boolean;
}

export interface TetrisSettings {
  defaultMode: 'marathon' | 'sprint' | 'ultra';
  showGhostPiece: boolean;
  showNextQueue: boolean;
  showHoldPanel: boolean;
  enableScreenShake: boolean;
  highContrastBoard: boolean;
}

export interface PerlerSettings {
  showReferenceImage: boolean;
  focusModeDefault: boolean;
}

export interface PvZSettings {
  showLaneHints: boolean;
  autoCollectSun: boolean;
}
