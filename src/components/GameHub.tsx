import React, { useEffect, useMemo, useState } from 'react';
import { buildHubSnapshot, type ArcadeGameId, type PerlerProgressSummary } from '../features/hub/hubData';
import type { AppSheetId } from '../features/sheets/sheetRegistry';
import { HubQuickResumeRow } from './hub/HubQuickResumeRow';
import { HubGameTable } from './hub/HubGameTable';
import { HubTasksPanel } from './hub/HubTasksPanel';
import { HubProgressPanel } from './hub/HubProgressPanel';
import '../styles/gamehub.css';

export type GameModeType = 'timed' | 'endless' | 'zen' | 'headshot' | 'survival' | 'headshot_only';
export type DifficultyLevel = 'very_easy' | 'easy' | 'normal' | 'medium' | 'hard' | 'expert';

interface GameHubProps {
  onStartGame: (mode: GameModeType | 'part_training' | 'peek_shot' | 'moving_target', duration?: 30 | 60 | 120, level?: number, difficulty?: DifficultyLevel) => void;
  onStartPerler: (entryMode?: 'library' | 'resume') => void;
  onStartPvZ: () => void;
  onSwitchSheet: (sheet: AppSheetId) => void;
  trainingDuration?: 30 | 60 | 120;
  difficulty?: DifficultyLevel;
  totalGames: number;
  totalScore: number;
  perlerProgress: PerlerProgressSummary | null;
  onFormulaChange?: (text: string) => void;
}

const GAME_DESCRIPTIONS: Record<ArcadeGameId, string> = {
  aim: '=练枪 / 热手 / 立即开。',
  snake: '=贪吃蛇 / 筹备中。',
  tetris: '=俄罗斯方块 / 筹备中。',
  perler: '=拼豆 / Sheet6。',
  pvz: '=植物大战僵尸 / Sheet7。',
};

export const GameHub: React.FC<GameHubProps> = ({
  onStartGame,
  onStartPerler,
  onStartPvZ,
  onSwitchSheet,
  trainingDuration = 60,
  difficulty = 'normal',
  totalGames,
  totalScore,
  perlerProgress,
  onFormulaChange,
}) => {
  const snapshot = useMemo(
    () => buildHubSnapshot({ perlerProgress, stats: { totalGames, totalScore } }),
    [perlerProgress, totalGames, totalScore],
  );

  const [selectedGame, setSelectedGame] = useState<ArcadeGameId>(perlerProgress ? 'perler' : 'aim');

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

    if (gameId === 'pvz') {
      onStartPvZ();
      return;
    }

    setSelectedGame(gameId);
  };

  const handleQuickResume = () => {
    if (snapshot.quickResume.kind === 'perler') {
      onStartPerler('resume');
      return;
    }
    onStartGame('timed', trainingDuration, undefined, difficulty);
  };

  const handleRecommendation = () => {
    onSwitchSheet('config');
  };

  const handleRandom = () => {
    const next = Math.random() > 0.5 ? 'aim' : 'perler';
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHub;
