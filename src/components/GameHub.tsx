import React, { useEffect, useMemo, useState } from 'react';
import type { FPSTrainingMode } from './TrainingModeSelector';
import { buildHubSnapshot, type ArcadeGameId, type PerlerProgressSummary } from '../features/hub/hubData';
import { HubQuickResumeRow } from './hub/HubQuickResumeRow';
import { HubGameTable } from './hub/HubGameTable';
import { HubTasksPanel } from './hub/HubTasksPanel';
import { HubProgressPanel } from './hub/HubProgressPanel';
import { HubActivityLog } from './hub/HubActivityLog';
import '../styles/gamehub.css';

export type GameModeType = 'timed' | 'endless' | 'zen' | 'headshot' | 'survival' | 'headshot_only';
export type DifficultyLevel = 'very_easy' | 'easy' | 'normal' | 'medium' | 'hard' | 'expert';
type FPSConfigMap = Record<string, string | number | boolean | undefined>;

interface GameHubProps {
  onStartGame: (
    mode: GameModeType | 'part_training' | 'peek_shot' | 'moving_target',
    duration?: 30 | 60 | 120,
    level?: number,
    difficulty?: DifficultyLevel,
  ) => void;
  onStartFPSTraining: (mode: FPSTrainingMode, config?: FPSConfigMap) => void;
  onStartPerler: (entryMode?: 'library' | 'resume') => void;
  onSwitchSheet: (sheet: 'game' | 'stats' | 'settings') => void;
  trainingDuration?: 30 | 60 | 120;
  difficulty?: DifficultyLevel;
  totalGames: number;
  totalScore: number;
  perlerProgress: PerlerProgressSummary | null;
  onFormulaChange?: (text: string) => void;
}

const GAME_DESCRIPTIONS: Record<ArcadeGameId, string> = {
  aim: '=练枪：最快进入状态的短局模块，适合热手。',
  snake: '=贪吃蛇：数据流通畅，但项目仍在筹备中。',
  tetris: '=俄罗斯方块：整理混乱的心流模块，正在排期。',
  perler: '=拼豆：模板优先的像素工位创作台。',
  pvz: '=植物大战僵尸：网格防线模块，后续接入。',
};

export const GameHub: React.FC<GameHubProps> = ({
  onStartGame,
  onStartFPSTraining,
  onStartPerler,
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
  const [trainingCategory, setTrainingCategory] = useState<'classic' | 'fps'>('classic');
  const [selectedClassicMode, setSelectedClassicMode] = useState<GameModeType>('timed');
  const [selectedFPSModeLocal, setSelectedFPSModeLocal] = useState<FPSTrainingMode>('motion_track');
  const [fpsConfig, setFpsConfig] = useState<FPSConfigMap>({ speed: 'normal', pattern: 'linear', duration: 60 });

  useEffect(() => {
    onFormulaChange?.(GAME_DESCRIPTIONS[selectedGame]);
  }, [selectedGame, onFormulaChange]);

  const fpsModeConfigs: Record<FPSTrainingMode, FPSConfigMap> = {
    motion_track: { speed: 'normal', pattern: 'linear', duration: trainingDuration },
    peek_shot: { duration: 'normal', interval: 1500 },
    switch_track: { targetCount: 3, showPriority: true },
    reaction: { rounds: 20, interval: 2 },
    precision: { targetScale: 0.5, targetCount: 3 },
  };

  const handleLaunch = (gameId: ArcadeGameId) => {
    if (gameId === 'aim') {
      if (trainingCategory === 'classic') {
        onStartGame(selectedClassicMode, trainingDuration, undefined, difficulty);
      } else {
        const config = { ...fpsModeConfigs[selectedFPSModeLocal], ...fpsConfig };
        onStartFPSTraining(selectedFPSModeLocal, config);
      }
      return;
    }

    if (gameId === 'perler') {
      onStartPerler('library');
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
    if (snapshot.quickResume.kind === 'perler') {
      onStartGame('timed', trainingDuration, undefined, difficulty);
      return;
    }
    onStartPerler('library');
  };

  const handleRandom = () => {
    const next = Math.random() > 0.5 ? 'aim' : 'perler';
    handleLaunch(next);
  };

  const selectedRow = snapshot.games.find((game) => game.id === selectedGame);

  return (
    <div className="excel-game-hub arcade-hub-layout">
      <div className="excel-sheet-wrapper arcade-sheet-wrapper">
        <div className="excel-col-headers-row">
          <div className="excel-corner-cell"></div>
          <div className="excel-col-header">A</div>
          <div className="excel-col-header">B</div>
          <div className="excel-col-header">C</div>
          <div className="excel-col-header">D</div>
        </div>

        <div className="excel-row">
          <div className="excel-row-header">1</div>
          <div className="excel-cell excel-title-cell">
            <span className="excel-title-icon">🎮</span>
            <span className="excel-title-text">工位娱乐中心.xlsx</span>
          </div>
        </div>

        <div className="excel-row">
          <div className="excel-row-header">2</div>
          <div className="excel-cell hub-subtitle-cell">
            <span>Office Arcade / 继续工作前，先保持一点手感与心情。</span>
          </div>
        </div>

        <div className="excel-row hub-quick-row-wrap">
          <div className="excel-row-header">3</div>
          <div className="excel-cell hub-wide-cell">
            <HubQuickResumeRow
              quickResume={snapshot.quickResume}
              recommendation={snapshot.recommendation}
              onResume={handleQuickResume}
              onRecommended={handleRecommendation}
              onRandom={handleRandom}
            />
          </div>
        </div>

        <div className="excel-row">
          <div className="excel-row-header">4</div>
          <div className="excel-cell excel-empty-cell"></div>
        </div>

        <div className="excel-row hub-main-row">
          <div className="excel-row-header">5</div>
          <div className="excel-cell hub-main-cell">
            <div className="hub-main-grid">
              <section className="hub-primary-panel">
                <div className="excel-section-header">
                  <span className="section-icon">🧾</span>
                  <span>游戏目录总表</span>
                </div>
                <HubGameTable
                  games={snapshot.games}
                  selectedGame={selectedGame}
                  onSelect={setSelectedGame}
                  onLaunch={handleLaunch}
                />
              </section>

              <aside className="hub-secondary-column">
                <HubTasksPanel tasks={snapshot.tasks} />
                <HubProgressPanel
                  level={12}
                  title="单元格清道夫"
                  credits={2480}
                  totalGames={totalGames}
                  totalScore={totalScore}
                />
                <HubActivityLog items={snapshot.activity} />
              </aside>
            </div>
          </div>
        </div>

        <div className="excel-row">
          <div className="excel-row-header">6</div>
          <div className="excel-cell excel-empty-cell"></div>
        </div>

        <div className="excel-row">
          <div className="excel-row-header">7</div>
          <div className="excel-cell excel-section-header">
            <span className="section-icon">🛠</span>
            <span>工作台快速操作</span>
          </div>
        </div>

        <div className="excel-row hub-workbench-row">
          <div className="excel-row-header">8</div>
          <div className="excel-cell hub-workbench-cell">
            {selectedGame === 'aim' ? (
              <div className="hub-workbench-grid">
                <div className="excel-inline-control">
                  <span className="excel-label">训练类别：</span>
                  <select
                    className="excel-select"
                    value={trainingCategory}
                    onChange={(e) => setTrainingCategory(e.target.value as 'classic' | 'fps')}
                  >
                    <option value="classic">经典训练</option>
                    <option value="fps">FPS 专项</option>
                  </select>
                </div>

                {trainingCategory === 'classic' ? (
                  <div className="hub-mode-row">
                    {[
                      { id: 'timed', label: '限时' },
                      { id: 'endless', label: '无尽' },
                      { id: 'zen', label: '禅' },
                      { id: 'headshot', label: '爆头' },
                      { id: 'survival', label: '生存' },
                      { id: 'headshot_only', label: '仅爆头' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        className={`excel-mini-btn ${selectedClassicMode === mode.id ? 'selected' : ''}`}
                        onClick={() => setSelectedClassicMode(mode.id as GameModeType)}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="hub-mode-row">
                      {[
                        { id: 'motion_track', label: '移动射击' },
                        { id: 'peek_shot', label: '掩体枪' },
                        { id: 'switch_track', label: '目标切换' },
                        { id: 'reaction', label: '反应' },
                        { id: 'precision', label: '精准' },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          className={`excel-mini-btn ${selectedFPSModeLocal === mode.id ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedFPSModeLocal(mode.id as FPSTrainingMode);
                            setFpsConfig(fpsModeConfigs[mode.id as FPSTrainingMode]);
                          }}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                    <FPSConfigInline mode={selectedFPSModeLocal} config={fpsConfig} onChange={setFpsConfig} />
                  </>
                )}

                <div className="hub-workbench-actions">
                  <button className="excel-main-start-btn compact" onClick={() => handleLaunch('aim')}>
                    <span className="main-btn-icon">▶</span>
                    <span className="main-btn-text">启动练枪</span>
                  </button>
                </div>
              </div>
            ) : selectedGame === 'perler' ? (
              <div className="hub-perler-callout">
                <div>
                  <strong>模板优先工位创作台</strong>
                  <p>内置模板库 + 图片导入转模板。当前优先支持继续未完成作品与模板创作。</p>
                  {perlerProgress && <p>最近进度：{perlerProgress.title}（{perlerProgress.completion}%）</p>}
                </div>
                <button className="excel-main-start-btn compact perler" onClick={() => onStartPerler('library')}>
                  <span className="main-btn-icon">🧩</span>
                  <span className="main-btn-text">进入拼豆</span>
                </button>
              </div>
            ) : (
              <div className="hub-coming-soon">
                <strong>{selectedRow?.title || '模块'} 正在筹备中</strong>
                <p>本轮先实现首页与拼豆，当前练枪玩法保持原样，其他模块后续接入。</p>
                <div className="excel-nav-buttons">
                  <button className="excel-nav-btn" onClick={() => setSelectedGame('aim')}>切回练枪</button>
                  <button className="excel-nav-btn" onClick={() => setSelectedGame('perler')}>查看拼豆</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="excel-row">
          <div className="excel-row-header">9</div>
          <div className="excel-cell hub-footer-nav-cell">
            <span className="nav-hint">更多工作表：</span>
            <div className="excel-nav-buttons">
              <button className="excel-nav-btn" onClick={() => onSwitchSheet('stats')}>📊 统计</button>
              <button className="excel-nav-btn" onClick={() => onSwitchSheet('settings')}>⚙ 设置</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FPSConfigInline: React.FC<{
  mode: FPSTrainingMode;
  config: FPSConfigMap;
  onChange: (config: FPSConfigMap) => void;
}> = ({ mode, config, onChange }) => {
  switch (mode) {
    case 'motion_track':
      return (
        <div className="excel-inline-config">
          <span className="config-label">速度：</span>
          <div className="excel-button-group">
            {['slow', 'normal', 'fast', 'extreme'].map((speed) => (
              <button
                key={speed}
                className={`excel-mini-btn ${config.speed === speed ? 'selected' : ''}`}
                onClick={() => onChange({ ...config, speed })}
              >
                {speed}
              </button>
            ))}
          </div>
          <span className="config-label config-label-right">轨迹：</span>
          <div className="excel-button-group">
            {['linear', 'sine', 'bounce'].map((pattern) => (
              <button
                key={pattern}
                className={`excel-mini-btn ${config.pattern === pattern ? 'selected' : ''}`}
                onClick={() => onChange({ ...config, pattern })}
              >
                {pattern}
              </button>
            ))}
          </div>
        </div>
      );

    case 'peek_shot':
      return (
        <div className="excel-inline-config">
          <span className="config-label">露头时长：</span>
          <div className="excel-button-group">
            {['long', 'normal', 'short', 'blink'].map((duration) => (
              <button
                key={duration}
                className={`excel-mini-btn ${config.duration === duration ? 'selected' : ''}`}
                onClick={() => onChange({ ...config, duration })}
              >
                {duration}
              </button>
            ))}
          </div>
        </div>
      );

    case 'switch_track':
      return (
        <div className="excel-inline-config">
          <span className="config-label">目标数：</span>
          <div className="excel-button-group">
            {[2, 3, 4, 5].map((count) => (
              <button
                key={count}
                className={`excel-mini-btn ${config.targetCount === count ? 'selected' : ''}`}
                onClick={() => onChange({ ...config, targetCount: count })}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      );

    case 'reaction':
      return (
        <div className="excel-inline-config">
          <span className="config-label">轮数：</span>
          <div className="excel-button-group">
            {[10, 20, 30].map((rounds) => (
              <button
                key={rounds}
                className={`excel-mini-btn ${config.rounds === rounds ? 'selected' : ''}`}
                onClick={() => onChange({ ...config, rounds })}
              >
                {rounds}
              </button>
            ))}
          </div>
        </div>
      );

    case 'precision':
      return (
        <div className="excel-inline-config">
          <span className="config-label">缩放：</span>
          <div className="excel-button-group">
            {[0.25, 0.5, 0.75].map((scale) => (
              <button
                key={scale}
                className={`excel-mini-btn ${config.targetScale === scale ? 'selected' : ''}`}
                onClick={() => onChange({ ...config, targetScale: scale })}
              >
                {scale * 100}%
              </button>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default GameHub;

