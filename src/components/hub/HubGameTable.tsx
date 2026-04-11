import React from 'react';
import type { ArcadeGameId, HubGameRow } from '../../features/hub/hubData';

interface HubGameTableProps {
  games: HubGameRow[];
  selectedGame: ArcadeGameId;
  onSelect: (gameId: ArcadeGameId) => void;
  onLaunch: (gameId: ArcadeGameId) => void;
}

const AVAILABLE_GAMES = new Set<ArcadeGameId>(['aim', 'perler']);

export const HubGameTable: React.FC<HubGameTableProps> = ({ games, selectedGame, onSelect, onLaunch }) => {
  return (
    <table className="hub-game-table">
      <thead>
        <tr>
          <th>游戏</th>
          <th>当前状态</th>
          <th>最佳记录</th>
          <th>今日次数</th>
          <th>启动</th>
        </tr>
      </thead>
      <tbody>
        {games.map((game) => {
          const available = AVAILABLE_GAMES.has(game.id);
          return (
            <tr
              key={game.id}
              className={selectedGame === game.id ? 'selected' : ''}
              onClick={() => onSelect(game.id)}
              onDoubleClick={() => available && onLaunch(game.id)}
            >
              <td>
                <span className="hub-game-chip" style={{ backgroundColor: `${game.accent}18`, color: game.accent }}>
                  {game.title}
                </span>
              </td>
              <td>{game.status}</td>
              <td>{game.bestRecord}</td>
              <td>{game.todayCount}</td>
              <td>
                <button
                  className="hub-inline-btn"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (available) onLaunch(game.id);
                  }}
                  disabled={!available}
                >
                  {available ? game.actionLabel : '筹备中'}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

