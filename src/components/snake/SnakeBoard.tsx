import React from 'react';
import type { Direction, SnakeBoardState } from '../../features/snake/snakeTypes';

interface SnakeBoardProps {
  state: SnakeBoardState;
}

const DIRECTION_ARROW: Record<Direction, string> = {
  up: '^',
  down: 'v',
  left: '<',
  right: '>',
};

function toCellKey(row: number, col: number): string {
  return `${row}:${col}`;
}

export const SnakeBoard: React.FC<SnakeBoardProps> = ({ state }) => {
  const snakeCells = new Map(state.snake.segments.map((segment) => [toCellKey(segment.row, segment.col), segment] as const));
  const foodCells = new Map(state.foods.map((food) => [toCellKey(food.row, food.col), food] as const));
  const obstacleCells = new Map(state.obstacles.map((obstacle) => [toCellKey(obstacle.row, obstacle.col), obstacle] as const));

  return (
    <div className="snake-board-shell">
      <div className="snake-board-grid" style={{ gridTemplateColumns: `repeat(${state.cols}, 1fr)` }}>
        {Array.from({ length: state.rows }, (_, row) =>
          Array.from({ length: state.cols }, (_, col) => {
            const key = toCellKey(row, col);
            const segment = snakeCells.get(key);
            const food = foodCells.get(key);
            const obstacle = obstacleCells.get(key);

            let className = 'snake-board-cell';
            let content = '';
            if (obstacle) {
              className += ` obstacle ${obstacle.kind}`;
              content = 'X';
            } else if (food) {
              className += ` food ${food.kind}`;
              if (food.isTarget) {
                className += ' target';
              }
              content = food.label;
            } else if (segment) {
              className += ` snake ${segment.segmentType}`;
              content = segment.segmentType === 'head' ? DIRECTION_ARROW[state.snake.direction] : segment.token ?? '·';
            }

            return (
              <div key={key} className={className}>
                <span>{content}</span>
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
};
