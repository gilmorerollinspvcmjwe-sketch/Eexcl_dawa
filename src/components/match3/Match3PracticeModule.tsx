/* 三消练习模块组件。提供特殊块训练、组合训练、障碍训练等功能。 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  type Match3Tile,
  type Match3Color,
  createEmptyTile,
} from '../../features/match3/match3Types';
import {
  findAllMatches,
} from '../../features/match3/match3BoardState';
import '../../styles/match3.css';

export type PracticeType = 'striped-4' | 'colorbomb-5' | 'wrapped-tl' | 'combo-cross' | 'combo-blast' | 'obstacle-single' | 'obstacle-complex';

interface PracticeConfig {
  id: PracticeType;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  targetMoves: number;
  boardSetup: (rows: number, cols: number) => Match3Tile[][];
  successCondition: (_board: Match3Tile[][], _moves: number, triggeredSpecials: Set<string>) => boolean;
  tips: string[];
}

export const MATCH3_PRACTICE_MODULES: Array<{ id: PracticeType; name: string; description: string; difficulty: 'easy' | 'medium' | 'hard' }> = [
  { id: 'striped-4', name: '四连条纹训练', description: '固定盘面练习制造四连条纹块', difficulty: 'easy' },
  { id: 'colorbomb-5', name: '五连彩球训练', description: '固定盘面练习制造五连彩球', difficulty: 'medium' },
  { id: 'wrapped-tl', name: 'T/L形包装训练', description: '固定盘面练习制造T/L形包装块', difficulty: 'medium' },
  { id: 'combo-cross', name: '彩球+条纹训练', description: '指定步数内触发彩球与条纹的高阶组合', difficulty: 'hard' },
  { id: 'combo-blast', name: '包装双爆训练', description: '指定步数内触发包装+包装组合', difficulty: 'hard' },
  { id: 'obstacle-single', name: '单障碍拆解', description: '练习拆除单条出口上的箱子或石块', difficulty: 'easy' },
  { id: 'obstacle-complex', name: '复合障碍拆解', description: '练习同时处理多条路径上的复合障碍', difficulty: 'hard' },
];

const PRACTICE_CONFIGS: PracticeConfig[] = [
  {
    id: 'striped-4',
    name: '四连条纹训练',
    description: '在固定盘面上制造一个条纹块',
    difficulty: 'easy',
    targetMoves: 3,
    boardSetup: (rows, cols) => {
      const board: Match3Tile[][] = [];
      for (let r = 0; r < rows; r++) {
        const row: Match3Tile[] = [];
        for (let c = 0; c < cols; c++) {
          const tile = createEmptyTile(r, c);
          if (r === 3 && c >= 2 && c <= 5) {
            tile.color = 'blue';
          } else if (r === 4 && c === 3) {
            tile.color = 'blue';
          } else if (r === 4 && c === 4) {
            tile.color = 'green';
          } else if (r === 4 && c === 5) {
            tile.color = 'blue';
          } else {
            const colors: Match3Color[] = ['red', 'orange', 'yellow', 'green', 'purple'];
            tile.color = colors[Math.floor(Math.random() * colors.length)];
          }
          row.push(tile);
        }
        board.push(row);
      }
      return board;
    },
    successCondition: (_board, _moves, triggeredSpecials) => {
      return triggeredSpecials.has('striped-h') || triggeredSpecials.has('striped-v');
    },
    tips: ['观察蓝色块的位置', '尝试将绿色块移开', '四连直线即可生成条纹块'],
  },
  {
    id: 'colorbomb-5',
    name: '五连彩球训练',
    description: '在固定盘面上制造一个彩球',
    difficulty: 'medium',
    targetMoves: 4,
    boardSetup: (rows, cols) => {
      const board: Match3Tile[][] = [];
      for (let r = 0; r < rows; r++) {
        const row: Match3Tile[] = [];
        for (let c = 0; c < cols; c++) {
          const tile = createEmptyTile(r, c);
          if (r === 2 && c >= 2 && c <= 6) {
            tile.color = 'purple';
          } else if (r === 3 && c === 3) {
            tile.color = 'purple';
          } else if (r === 3 && c === 4) {
            tile.color = 'yellow';
          } else if (r === 3 && c === 5) {
            tile.color = 'purple';
          } else {
            const colors: Match3Color[] = ['red', 'orange', 'blue', 'green'];
            tile.color = colors[Math.floor(Math.random() * colors.length)];
          }
          row.push(tile);
        }
        board.push(row);
      }
      return board;
    },
    successCondition: (_board, _moves, triggeredSpecials) => {
      return triggeredSpecials.has('colorBomb');
    },
    tips: ['紫色块已经接近五连', '移开黄色块即可', '五连直线生成彩球'],
  },
  {
    id: 'wrapped-tl',
    name: 'T/L形包装训练',
    description: '在固定盘面上制造一个包装块',
    difficulty: 'medium',
    targetMoves: 3,
    boardSetup: (rows, cols) => {
      const board: Match3Tile[][] = [];
      for (let r = 0; r < rows; r++) {
        const row: Match3Tile[] = [];
        for (let c = 0; c < cols; c++) {
          const tile = createEmptyTile(r, c);
          if ((r === 2 && c === 3) || (r === 3 && c >= 2 && c <= 4)) {
            tile.color = 'orange';
          } else if (r === 2 && c === 2) {
            tile.color = 'green';
          } else if (r === 2 && c === 4) {
            tile.color = 'blue';
          } else {
            const colors: Match3Color[] = ['red', 'yellow', 'purple', 'blue'];
            tile.color = colors[Math.floor(Math.random() * colors.length)];
          }
          row.push(tile);
        }
        board.push(row);
      }
      return board;
    },
    successCondition: (_board, _moves, triggeredSpecials) => {
      return triggeredSpecials.has('wrapped');
    },
    tips: ['橙色块形成T形', '移开绿色或蓝色块', 'T形或L形生成包装块'],
  },
  {
    id: 'combo-cross',
    name: '条纹+彩球组合',
    description: '触发条纹块与彩球的组合效果',
    difficulty: 'hard',
    targetMoves: 2,
    boardSetup: (rows, cols) => {
      const board: Match3Tile[][] = [];
      for (let r = 0; r < rows; r++) {
        const row: Match3Tile[] = [];
        for (let c = 0; c < cols; c++) {
          const tile = createEmptyTile(r, c);
          if (r === 3 && c === 3) {
            tile.color = 'purple';
            tile.special = 'striped-h';
          } else if (r === 3 && c === 4) {
            tile.color = 'purple';
            tile.special = 'colorBomb';
          } else {
            const colors: Match3Color[] = ['red', 'blue', 'green', 'yellow', 'purple'];
            tile.color = colors[Math.floor(Math.random() * colors.length)];
          }
          row.push(tile);
        }
        board.push(row);
      }
      return board;
    },
    successCondition: (_board, _moves, triggeredSpecials) => {
      return triggeredSpecials.has('combo-striped-colorbomb');
    },
    tips: ['条纹块与彩球相邻', '交换它们触发组合', '组合效果清除整行同色块'],
  },
  {
    id: 'combo-blast',
    name: '包装+包装组合',
    description: '触发两个包装块的组合效果',
    difficulty: 'hard',
    targetMoves: 2,
    boardSetup: (rows, cols) => {
      const board: Match3Tile[][] = [];
      for (let r = 0; r < rows; r++) {
        const row: Match3Tile[] = [];
        for (let c = 0; c < cols; c++) {
          const tile = createEmptyTile(r, c);
          if (r === 4 && c === 3) {
            tile.color = 'purple';
            tile.special = 'wrapped';
          } else if (r === 4 && c === 4) {
            tile.color = 'purple';
            tile.special = 'wrapped';
          } else {
            const colors: Match3Color[] = ['red', 'blue', 'green', 'yellow', 'purple'];
            tile.color = colors[Math.floor(Math.random() * colors.length)];
          }
          row.push(tile);
        }
        board.push(row);
      }
      return board;
    },
    successCondition: (_board, _moves, triggeredSpecials) => {
      return triggeredSpecials.has('combo-wrapped-wrapped');
    },
    tips: ['两个包装块相邻', '交换它们触发组合', '组合效果清除大范围'],
  },
  {
    id: 'obstacle-single',
    name: '单障碍拆解',
    description: '清掉一条路径上的单障碍，练习先拆路再下压。',
    difficulty: 'easy',
    targetMoves: 3,
    boardSetup: (rows, cols) => {
      const board: Match3Tile[][] = [];
      for (let r = 0; r < rows; r++) {
        const row: Match3Tile[] = [];
        for (let c = 0; c < cols; c++) {
          const tile = createEmptyTile(r, c);
          tile.color = (['red', 'orange', 'yellow', 'green', 'blue', 'purple'] as Match3Color[])[(r + c) % 6];
          row.push(tile);
        }
        board.push(row);
      }
      board[3][3].obstacle = 'box';
      board[3][3].obstacleHp = 1;
      return board;
    },
    successCondition: (board) => {
      return !board.flat().some((tile) => tile.obstacle === 'box');
    },
    tips: ['先围绕木箱附近做消除', '单障碍关先拆出口，比凑大连锁更重要'],
  },
  {
    id: 'obstacle-complex',
    name: '复合障碍拆解',
    description: '同时处理石块和锁链，练习优先级判断。',
    difficulty: 'hard',
    targetMoves: 4,
    boardSetup: (rows, cols) => {
      const board: Match3Tile[][] = [];
      for (let r = 0; r < rows; r++) {
        const row: Match3Tile[] = [];
        for (let c = 0; c < cols; c++) {
          const tile = createEmptyTile(r, c);
          tile.color = (['purple', 'blue', 'green', 'yellow', 'orange', 'red'] as Match3Color[])[(r * 2 + c) % 6];
          row.push(tile);
        }
        board.push(row);
      }
      board[3][2].obstacle = 'chain';
      board[3][2].obstacleHp = 1;
      board[3][4].obstacle = 'stone';
      board[3][4].obstacleHp = 1;
      return board;
    },
    successCondition: (board) => {
      return !board.flat().some((tile) => tile.obstacle === 'chain' || tile.obstacle === 'stone');
    },
    tips: ['先给锁链松绑，再把石块周围做成可连续补刀的形状', '高压关优先处理最挡路的障碍'],
  },
];

interface Match3PracticeModuleProps {
  practiceId: PracticeType;
  onFormulaChange?: (text: string) => void;
  onExit?: () => void;
  onComplete?: (result: { success: boolean; moves: number; score: number }) => void;
}

export const Match3PracticeModule: React.FC<Match3PracticeModuleProps> = ({
  practiceId,
  onFormulaChange,
  onExit,
  onComplete,
}) => {
  const config = PRACTICE_CONFIGS.find((c) => c.id === practiceId);
  const [board, setBoard] = useState<Match3Tile[][]>(() => 
    config ? config.boardSetup(8, 8) : []
  );
  const [moves, setMoves] = useState(0);
  const [triggeredSpecials, setTriggeredSpecials] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<'intro' | 'playing' | 'result'>('intro');
  const [selectedTile, setSelectedTile] = useState<{ row: number; col: number } | null>(null);

  useEffect(() => {
    if (phase === 'intro') {
      onFormulaChange?.(`=练习: ${config?.name || '未知'} - 点击开始`);
    } else if (phase === 'playing') {
      onFormulaChange?.(`=练习: ${config?.name || '未知'} | 步数: ${moves}/${config?.targetMoves || 0}`);
    } else if (phase === 'result') {
      const success = config?.successCondition(board, moves, triggeredSpecials) || false;
      onFormulaChange?.(`=练习完成: ${success ? '成功' : '失败'} | 步数: ${moves}`);
    }
  }, [onFormulaChange, phase, config, moves, board, triggeredSpecials]);

  const handleStart = useCallback(() => {
    if (config) {
      setBoard(config.boardSetup(8, 8));
      setMoves(0);
      setTriggeredSpecials(new Set());
      setPhase('playing');
    }
  }, [config]);

  const handleTileClick = useCallback((row: number, col: number) => {
    if (phase !== 'playing') return;
    if (!selectedTile) {
      setSelectedTile({ row, col });
    } else {
      const isAdjacent = 
        (Math.abs(selectedTile.row - row) === 1 && selectedTile.col === col) ||
        (Math.abs(selectedTile.col - col) === 1 && selectedTile.row === row);
      if (isAdjacent) {
        const newBoard = [...board.map((r) => [...r])];
        const temp = newBoard[selectedTile.row][selectedTile.col];
        newBoard[selectedTile.row][selectedTile.col] = newBoard[row][col];
        newBoard[row][col] = temp;
        setBoard(newBoard);
        setMoves((m) => m + 1);

        const leftTile = newBoard[selectedTile.row][selectedTile.col];
        const rightTile = newBoard[row][col];
        if ((leftTile.special === 'striped-h' || leftTile.special === 'striped-v' || rightTile.special === 'striped-h' || rightTile.special === 'striped-v')
          && (leftTile.special === 'colorBomb' || rightTile.special === 'colorBomb')) {
          setTriggeredSpecials((s) => new Set([...s, 'combo-striped-colorbomb']));
        }
        if (leftTile.special === 'wrapped' && rightTile.special === 'wrapped') {
          setTriggeredSpecials((s) => new Set([...s, 'combo-wrapped-wrapped']));
        }

        const matches = findAllMatches(newBoard);
        if (matches.length > 0) {
          const matchedPositions = new Set<string>();
          matches.forEach((match) => {
            match.tiles.forEach((pos) => {
              matchedPositions.add(`${pos.row}-${pos.col}`);
            });
            if (match.length >= 4) {
              setTriggeredSpecials((s) => new Set([...s, match.length >= 5 ? 'colorBomb' : match.shape === 'line' ? 'striped-h' : 'wrapped']));
            }
          });

          const touchedObstacleKeys = new Set<string>();
          for (const match of matches) {
            for (const pos of match.tiles) {
              const directions = [
                [0, 0],
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1],
              ];
              for (const [dr, dc] of directions) {
                const nr = pos.row + dr;
                const nc = pos.col + dc;
                const tile = newBoard[nr]?.[nc];
                if (!tile?.obstacle) continue;
                const key = `${nr}-${nc}`;
                if (touchedObstacleKeys.has(key)) continue;
                touchedObstacleKeys.add(key);
                const nextHp = Math.max(0, (tile.obstacleHp ?? 1) - 1);
                tile.obstacleHp = nextHp;
                if (nextHp === 0) {
                  tile.obstacle = undefined;
                  tile.obstacleHp = undefined;
                }
              }
            }
          }

          for (const key of matchedPositions) {
            const [matchRow, matchCol] = key.split('-').map(Number);
            newBoard[matchRow][matchCol] = createEmptyTile(matchRow, matchCol);
          }

          setBoard(newBoard);
        }
      }
      setSelectedTile(null);
    }
  }, [phase, selectedTile, board]);

  const handleCheckResult = useCallback(() => {
    setPhase('result');
    const success = config?.successCondition(board, moves, triggeredSpecials) || false;
    onComplete?.({ success, moves, score: success ? 100 : 0 });
  }, [config, board, moves, triggeredSpecials, onComplete]);

  const handleRestart = useCallback(() => {
    setPhase('intro');
    setSelectedTile(null);
  }, []);

  const handleExit = useCallback(() => {
    onExit?.();
  }, [onExit]);

  if (!config) {
    return (
      <div className="match3-practice-error">
        <h3>练习不存在</h3>
        <p>未找到练习配置: {practiceId}</p>
        <button type="button" onClick={handleExit}>返回</button>
      </div>
    );
  }

  return (
    <div className="match3-practice-module">
      {phase === 'intro' && (
        <div className="match3-practice-intro">
          <h2>{config.name}</h2>
          <p>{config.description}</p>
          <div className="match3-practice-info">
            <span>难度: {config.difficulty}</span>
            <span>目标步数: {config.targetMoves}</span>
          </div>
          <div className="match3-practice-tips">
            {config.tips.map((tip, i) => <p key={i}>{tip}</p>)}
          </div>
          <button type="button" className="match3-practice-start-btn" onClick={handleStart}>
            开始练习
          </button>
          <button type="button" className="match3-practice-exit-btn" onClick={handleExit}>
            返回
          </button>
        </div>
      )}

      {phase === 'playing' && (
        <div className="match3-practice-playing">
          <div className="match3-practice-header">
            <span>步数: {moves}/{config.targetMoves}</span>
          </div>
          <div className="match3-practice-board">
            {board.map((row, r) => (
              <div key={r} className="match3-practice-row">
                {row.map((tile, c) => (
                  <button
                    key={c}
                    type="button"
                    className={`match3-practice-tile ${selectedTile?.row === r && selectedTile?.col === c ? 'selected' : ''}`}
                    onClick={() => handleTileClick(r, c)}
                    style={{ backgroundColor: tile.special ? '#fff' : tile.color ? `var(--match3-color-${tile.color})` : 'transparent' }}
                  >
                    {tile.special && <span className="match3-special-icon">{tile.special}</span>}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <button type="button" className="match3-practice-check-btn" onClick={handleCheckResult}>
            检查结果
          </button>
          <button type="button" className="match3-practice-restart-btn" onClick={handleRestart}>
            重新开始
          </button>
        </div>
      )}

      {phase === 'result' && (
        <div className="match3-practice-result">
          <h2>{config.successCondition(board, moves, triggeredSpecials) ? '练习成功' : '练习失败'}</h2>
          <p>使用步数: {moves}</p>
          <p>目标步数: {config.targetMoves}</p>
          <div className="match3-practice-triggered">
            <span>触发特效: {triggeredSpecials.size > 0 ? Array.from(triggeredSpecials).join(', ') : '无'}</span>
          </div>
          <button type="button" className="match3-practice-retry-btn" onClick={handleRestart}>
            再次练习
          </button>
          <button type="button" className="match3-practice-exit-btn" onClick={handleExit}>
            返回
          </button>
        </div>
      )}
    </div>
  );
};
