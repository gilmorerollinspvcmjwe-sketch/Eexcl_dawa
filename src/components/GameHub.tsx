import React, { useEffect, useMemo, useState } from 'react';
import {
  buildHubSnapshot,
  type ArcadeGameId,
  type FantasyLaneHubSummary,
  type GoldMinerHubSummary,
  type PerlerProgressSummary,
} from '../features/hub/hubData';
import type { AppSheetId } from '../features/sheets/sheetRegistry';
import { ARCADE_MODULE_MAP } from '../features/workbook/workbookRegistry';
import { HubQuickResumeRow } from './hub/HubQuickResumeRow';
import { HubGameTable } from './hub/HubGameTable';
import { HubProgressPanel } from './hub/HubProgressPanel';
import { HubTasksPanel } from './hub/HubTasksPanel';
import { getProgressSummary } from '../features/match3/match3ProgressStorage';
import '../styles/gamehub.css';

export type GameModeType = 'timed' | 'endless' | 'zen' | 'headshot' | 'survival' | 'headshot_only';
export type DifficultyLevel = 'very_easy' | 'easy' | 'normal' | 'medium' | 'hard' | 'expert';

interface GameHubProps {
  onStartGame: (mode: GameModeType | 'part_training' | 'peek_shot' | 'moving_target', duration?: 30 | 60 | 120, level?: number, difficulty?: DifficultyLevel) => void;
  onStartPerler: (entryMode?: 'library' | 'resume') => void;
  onStartSnake?: () => void;
  onStartTetris?: () => void;
  onStartPvZ: () => void;
  onStartPacman?: () => void;
  onStartZuma?: () => void;
  onStartMatch3?: () => void;
  onStartFantasyLane?: () => void;
  onStartGoldMiner?: () => void;
  onSwitchSheet: (sheet: AppSheetId) => void;
  trainingDuration?: 30 | 60 | 120;
  difficulty?: DifficultyLevel;
  totalGames: number;
  totalScore: number;
  perlerProgress: PerlerProgressSummary | null;
  fantasyLaneProgress?: FantasyLaneHubSummary | null;
  goldMinerProgress?: GoldMinerHubSummary | null;
  onFormulaChange?: (text: string) => void;
}

const GAME_DESCRIPTIONS: Record<ArcadeGameId, string> = Object.fromEntries(
  Object.values(ARCADE_MODULE_MAP).map((module) => [module.id, module.summary]),
) as Record<ArcadeGameId, string>;

export const GameHub: React.FC<GameHubProps> = ({
  onStartGame,
  onStartPerler,
  onStartSnake,
  onStartTetris,
  onStartPvZ,
  onStartPacman,
  onStartZuma,
  onStartMatch3,
  onStartFantasyLane,
  onStartGoldMiner,
  onSwitchSheet,
  trainingDuration = 60,
  difficulty = 'normal',
  totalGames,
  totalScore,
  perlerProgress,
  fantasyLaneProgress,
  goldMinerProgress,
  onFormulaChange,
}) => {
  const match3Progress = useMemo(() => getProgressSummary(), []);
  const snapshot = useMemo(
    () => buildHubSnapshot({ perlerProgress, fantasyLaneProgress, goldMinerProgress, stats: { totalGames, totalScore } }),
    [fantasyLaneProgress, goldMinerProgress, perlerProgress, totalGames, totalScore],
  );
  const [selectedGame, setSelectedGame] = useState<ArcadeGameId>(
    perlerProgress ? 'perler' : fantasyLaneProgress?.hasStarted ? 'fantasy_lane' : goldMinerProgress?.hasStarted ? 'gold_miner' : 'aim',
  );

  const availableGames = useMemo(() => {
    const enabled = new Set<ArcadeGameId>(['aim', 'perler', 'pvz']);
    if (onStartSnake) enabled.add('snake');
    if (onStartTetris) enabled.add('tetris');
    if (onStartPacman) enabled.add('pacman');
    if (onStartZuma) enabled.add('zuma');
    if (onStartMatch3) enabled.add('match3');
    if (onStartFantasyLane) enabled.add('fantasy_lane');
    if (onStartGoldMiner) enabled.add('gold_miner');
    return enabled;
  }, [onStartFantasyLane, onStartGoldMiner, onStartMatch3, onStartPacman, onStartSnake, onStartTetris, onStartZuma]);

  useEffect(() => {
    onFormulaChange?.(GAME_DESCRIPTIONS[selectedGame]);
  }, [selectedGame, onFormulaChange]);

  const handleLaunch = (gameId: ArcadeGameId) => {
    if (gameId === 'aim') {
      onStartGame('timed', trainingDuration, undefined, difficulty);
      return;
    }
    if (gameId === 'perler') {
      onStartPerler('library');
      return;
    }
    if (gameId === 'snake' && onStartSnake) {
      onStartSnake();
      return;
    }
    if (gameId === 'tetris' && onStartTetris) {
      onStartTetris();
      return;
    }
    if (gameId === 'pvz') {
      onStartPvZ();
      return;
    }
    if (gameId === 'match3' && onStartMatch3) {
      onStartMatch3();
      return;
    }
    if (gameId === 'pacman' && onStartPacman) {
      onStartPacman();
      return;
    }
    if (gameId === 'zuma' && onStartZuma) {
      onStartZuma();
      return;
    }
    if (gameId === 'fantasy_lane' && onStartFantasyLane) {
      onStartFantasyLane();
      return;
    }
    if (gameId === 'gold_miner' && onStartGoldMiner) {
      onStartGoldMiner();
      return;
    }
    setSelectedGame(gameId);
  };

  const handleQuickResume = () => {
    if (snapshot.quickResume.kind === 'perler') {
      onStartPerler('resume');
      return;
    }
    if (snapshot.quickResume.kind === 'fantasy_lane' && onStartFantasyLane) {
      onStartFantasyLane();
      return;
    }
    if (snapshot.quickResume.kind === 'gold_miner' && onStartGoldMiner) {
      onStartGoldMiner();
      return;
    }
    onStartGame('timed', trainingDuration, undefined, difficulty);
  };

  const handleRecommendation = () => {
    onSwitchSheet('config');
  };

  const handleRandom = () => {
    const enabledGames = Array.from(availableGames);
    const next = enabledGames[Math.floor(Math.random() * enabledGames.length)];
    handleLaunch(next);
  };

  return (
    <div className="excel-game-hub arcade-hub-layout compact-hub-layout">
      <div className="excel-sheet-wrapper arcade-sheet-wrapper compact-sheet-wrapper">
        <div className="excel-col-headers-row">
          <div className="excel-corner-cell"></div>
          <div className="excel-col-header">A</div>
          <div className="excel-col-header">B</div>
          <div className="excel-col-header">C</div>
          <div className="excel-col-header">D</div>
        </div>

        <div className="excel-row compact-title-row">
          <div className="excel-row-header">1</div>
          <div className="excel-cell excel-title-cell compact-title-cell">
            <span className="excel-title-icon">🎮</span>
            <span className="excel-title-text">工位娱乐中心.xlsx</span>
          </div>
        </div>

        <div className="excel-row compact-quick-row-wrap">
          <div className="excel-row-header">2</div>
          <div className="excel-cell hub-wide-cell compact-quick-cell">
            <HubQuickResumeRow
              quickResume={snapshot.quickResume}
              recommendation={snapshot.recommendation}
              onResume={handleQuickResume}
              onRecommended={handleRecommendation}
              onRandom={handleRandom}
            />
          </div>
        </div>

        <div className="excel-row compact-main-row">
          <div className="excel-row-header">3</div>
          <div className="excel-cell hub-main-cell compact-main-cell">
            <div className="hub-main-grid compact-main-grid">
              <section className="hub-primary-panel compact-primary-panel">
                <HubGameTable
                  games={snapshot.games}
                  selectedGame={selectedGame}
                  onSelect={setSelectedGame}
                  onLaunch={handleLaunch}
                  availableGames={availableGames}
                />
              </section>

              <aside className="hub-secondary-column compact-secondary-column">
                <HubTasksPanel tasks={snapshot.tasks} />
                <HubProgressPanel
                  level={12}
                  title="清道夫"
                  credits={2480}
                  totalGames={totalGames}
                  totalScore={totalScore}
                />
              </aside>
            </div>
          </div>
        </div>

        <div className="excel-row">
          <div className="excel-row-header">4</div>
          <div className="excel-cell excel-empty-cell"></div>
        </div>

        <div className="excel-row compact-nav-row">
          <div className="excel-row-header">5</div>
          <div className="excel-cell hub-footer-nav-cell compact-footer-nav-cell">
            <div className="excel-nav-buttons">
              <button className="excel-nav-btn" onClick={() => onSwitchSheet('stats')}>统计</button>
              <button className="excel-nav-btn" onClick={() => onSwitchSheet('settings')}>设置</button>
              <button className="excel-nav-btn" onClick={() => onSwitchSheet('config')}>配置</button>
              <button className="excel-nav-btn" onClick={() => onSwitchSheet('perler')}>拼豆</button>
              <button className="excel-nav-btn" onClick={() => onSwitchSheet('pvz')}>PvZ</button>
              <button className="excel-nav-btn" onClick={() => onSwitchSheet('match3')}>
                三消
                {match3Progress.completedLevels > 0 && (
                  <span className="hub-nav-badge">{match3Progress.completedLevels}/{match3Progress.totalLevels}</span>
                )}
              </button>
              <button className="excel-nav-btn excel-nav-btn--sub" onClick={() => onSwitchSheet('match3_lab')}>图鉴</button>
              {onStartFantasyLane ? (
                <button className="excel-nav-btn" onClick={() => onSwitchSheet('fantasy_lane')}>奇幻战线</button>
              ) : null}
              {onStartGoldMiner ? (
                <button className="excel-nav-btn" onClick={() => onSwitchSheet('gold_miner')}>黄金矿工</button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHub;
