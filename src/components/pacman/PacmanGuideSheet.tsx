/* 吃豆人图鉴与练习组件。负责四鬼行为说明、水果价值表、迷宫标签、输入判定说明和练习模式入口。 */

import React, { useState } from 'react';
import {
  GHOST_NAMES,
  GHOST_COLORS,
  FRUIT_NAMES,
  FRUIT_SCORES,
  FRUIT_IDS,
  GHOST_EAT_SCORES,
  PELLET_SCORE,
  ENERGIZER_SCORE,
  type GhostId,
  type FruitId,
  type PacmanPracticeId,
} from '../../features/pacman/pacmanTypes';
import {
  SCATTER_TARGETS,
  PINKY_OFFSET_BUG_ENABLED,
} from '../../features/pacman/pacmanAi';
import {
  getLevelTuningByPack,
  getAllLevelSummaries,
} from '../../features/pacman/pacmanContent';
import {
  getPacmanPracticeModules,
  type PacmanPracticeModule,
} from '../../features/pacman/pacmanPracticeCatalog';
import {
  consumePendingPacmanGuideTab,
  setPendingPacmanLaunchIntent,
  type PacmanGuideTab,
  type PacmanLaunchIntent,
} from '../../features/pacman/pacmanLaunchIntent';
import {
  getPracticeRecord,
  loadStorage,
  getHubSummary,
  getProgressDisplay,
} from '../../features/pacman/pacmanStorage';
import '../../styles/pacman.css';

type GuideTab = PacmanGuideTab;

interface PacmanGuideSheetProps {
  onFormulaChange?: (text: string) => void;
  onSwitchToPlay?: (intent?: PacmanLaunchIntent) => void;
}

const GHOST_BEHAVIOR_GUIDE: Record<GhostId, { rule: string; counter: string; nickname: string }> = {
  blinky: {
    nickname: '红鬼·影子',
    rule: '直接追踪Pac-Man当前位置。无论你在哪，它都会直线逼近。后期豆子减少时进入Elroy状态，速度加快。',
    counter: '利用传送门快速拉开距离；在Scatter期它会回到右上角，趁机清那边的豆子；不要在长直道和它硬跑。',
  },
  pinky: {
    nickname: '粉鬼·伏击',
    rule: `瞄准Pac-Man前方4格（向上时因原版bug偏移到左前方）。试图截断你的前进路线，而不是直接追你。${PINKY_OFFSET_BUG_ENABLED ? '（当前启用原版bug行为）' : '（当前使用修正后行为）'}`,
    counter: '突然转向可以甩掉它的预判；向上移动时它实际会往左偏，可以利用这一点；在路口快速变向是最佳反制。',
  },
  inky: {
    nickname: '青鬼·变幻',
    rule: '以Blinky位置和Pac-Man前方2格为基准，构造向量目标。位置取决于红鬼，行为最难预测。',
    counter: '注意红鬼位置，青鬼的目标会随红鬼移动而变化；当红鬼远离时，青鬼目标可能在你身后；利用Scatter期它回到右下角。',
  },
  clyde: {
    nickname: '橙鬼·迟钝',
    rule: '距离Pac-Man超过8格时追击，距离小于8格时逃回左下角。来回切换，行为最不稳定。',
    counter: '靠近它时会自动逃跑，可以故意接近让它离开；它经常在左下角徘徊，那边豆子可以晚点清；不要被它的突然转向吓到。',
  },
};

const MAZE_TAGS = [
  { tag: '传送门', description: '迷宫左右两侧的通道，穿越后从另一侧出现。鬼魂在传送门内速度降低40%。', tip: '被追击时快速穿越可以拉开距离。' },
  { tag: '鬼屋', description: '中央区域，鬼魂从这里出发。开局时只有红鬼在外面，其他鬼按豆子计数和时间依次放出。', tip: '开局不要靠近鬼屋入口。' },
  { tag: '能量豆', description: '四个角落的大豆子，吃掉后鬼魂进入Frightened状态，可反吃得分。', tip: '被包围时吃能量豆是最佳逃生手段。' },
  { tag: '死角', description: '只有一条进出路的区域，进去后容易被堵死。主要集中在底部两侧通道。', tip: '追击期不要进入死角，Scatter期可以安全清理。' },
  { tag: 'T型路口', description: '三向通道，是转向练习的关键位置。正确预输入可以无缝转向。', tip: '提前按好方向键，到达路口瞬间转向。' },
  { tag: '长直道', description: '水平或垂直的长通道，容易被红鬼直线追上。', tip: '长直道尽量在Scatter期清理。' },
];

const INPUT_GUIDE = [
  { title: '转向缓存', description: '提前按下方向键，到达路口时自动转向。不需要精确时机，只要在到达路口前按下即可。', example: '向右移动时提前按上，到达T型路口自动向上转。' },
  { title: '反向禁止', description: '不能直接反向移动（如向右时按左）。必须先转向其他方向，再转回来。', example: '想回头时，先向上或下转，再向左转。' },
  { title: '碰撞优先级', description: 'Pac-Man和鬼魂在同一格时判定碰撞。Frightened状态下Pac-Man可以吃鬼。', example: '吃能量豆后，主动靠近鬼魂吃掉得分。' },
  { title: '传送门判定', description: '进入传送门一侧后立即从另一侧出现。位置重置，方向保持不变。', example: '从左侧传送门进入，从右侧出现时继续向左移动。' },
  { title: '吃豆判定', description: '经过豆子格时自动吃掉。不需要精确停在格子上，路过即可。', example: '快速穿过豆子区域，边跑边吃。' },
];

export const PacmanGuideSheet: React.FC<PacmanGuideSheetProps> = ({ onFormulaChange, onSwitchToPlay }) => {
  const [activeTab, setActiveTab] = useState<GuideTab>(() => consumePendingPacmanGuideTab() || 'ghosts');
  const [selectedGhost, setSelectedGhost] = useState<GhostId>('blinky');
  const [selectedFruit, setSelectedFruit] = useState<FruitId>('cherry');
  const [selectedPack, setSelectedPack] = useState<'arcade' | 'tutorial'>('arcade');
  const [selectedGuideLevel, setSelectedGuideLevel] = useState(1);
  const [queuedPracticeId, setQueuedPracticeId] = useState<PacmanPracticeId | null>(null);

  const storage = loadStorage();
  const hubSummary = getHubSummary(storage);
  const progressDisplay = getProgressDisplay(storage);
  const levelSummaries = getAllLevelSummaries(selectedPack);
  const practiceModules = getPacmanPracticeModules();
  const selectedGuideTuning = getLevelTuningByPack(selectedPack, selectedGuideLevel);

  React.useEffect(() => {
    const tabNames: Record<GuideTab, string> = {
      ghosts: '四鬼图鉴',
      fruits: '水果价值',
      maze: '迷宫标签',
      input: '输入判定',
      practice: '练习模式',
    };
    onFormulaChange?.(`=吃豆人图鉴：${tabNames[activeTab]}`);
  }, [activeTab, onFormulaChange]);

  React.useEffect(() => {
    const maxLevel = selectedPack === 'tutorial' ? 10 : 21;
    if (selectedGuideLevel > maxLevel) {
      setSelectedGuideLevel(maxLevel);
    }
  }, [selectedGuideLevel, selectedPack]);

  const launchPackEntry = (intent: PacmanLaunchIntent) => {
    if (!intent.practiceId) {
      setQueuedPracticeId(null);
    }
    setPendingPacmanLaunchIntent(intent);
    onSwitchToPlay?.(intent);
  };

  const launchPractice = (module: PacmanPracticeModule) => {
    setQueuedPracticeId(module.id);
    launchPackEntry({
      packId: module.packId,
      levelNumber: module.levelNumber,
      mode: 'practice',
      practiceId: module.id,
      returnTarget: module.returnTo,
      guideTab: 'practice',
    });
  };

  const renderGhostGuide = () => (
    <div className="pacman-guide-ghosts">
      <div className="pacman-ghost-selector">
        {(Object.keys(GHOST_NAMES) as GhostId[]).map((ghostId) => (
          <button
            key={ghostId}
            className={`pacman-ghost-btn${selectedGhost === ghostId ? ' active' : ''}`}
            onClick={() => setSelectedGhost(ghostId)}
            style={{ borderColor: GHOST_COLORS[ghostId] }}
          >
            <span className="pacman-ghost-icon" style={{ color: GHOST_COLORS[ghostId] }}>👻</span>
            <span>{GHOST_NAMES[ghostId]}</span>
          </button>
        ))}
      </div>

      <div className="pacman-ghost-detail">
        <h3 style={{ color: GHOST_COLORS[selectedGhost] }}>
          {GHOST_BEHAVIOR_GUIDE[selectedGhost].nickname}
        </h3>

        <div className="pacman-ghost-section">
          <h4>目标规则</h4>
          <p>{GHOST_BEHAVIOR_GUIDE[selectedGhost].rule}</p>
        </div>

        <div className="pacman-ghost-section">
          <h4>反制建议</h4>
          <p>{GHOST_BEHAVIOR_GUIDE[selectedGhost].counter}</p>
        </div>

        <div className="pacman-ghost-section">
          <h4>Scatter目标位置</h4>
          <p>行 {SCATTER_TARGETS[selectedGhost].row}, 列 {SCATTER_TARGETS[selectedGhost].col}</p>
          <small>Scatter期会回到这个角落徘徊。</small>
        </div>

        {selectedGhost === 'blinky' && (
          <div className="pacman-ghost-section">
            <h4>Elroy 阈值预览</h4>
            <div className="pacman-guide-level-picker">
              <button
                type="button"
                className={`pacman-pack-tab${selectedPack === 'arcade' ? ' active' : ''}`}
                onClick={() => setSelectedPack('arcade')}
              >
                经典街机包
              </button>
              <button
                type="button"
                className={`pacman-pack-tab${selectedPack === 'tutorial' ? ' active' : ''}`}
                onClick={() => setSelectedPack('tutorial')}
              >
                路线教学包
              </button>
              <select
                value={selectedGuideLevel}
                onChange={(event) => setSelectedGuideLevel(Number(event.target.value))}
              >
                {Array.from({ length: selectedPack === 'tutorial' ? 10 : 21 }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    第 {index + 1} 关
                  </option>
                ))}
              </select>
            </div>
            <p>
              {selectedPack === 'tutorial' ? '教学包' : '街机包'}第 {selectedGuideLevel} 关：
              剩 {selectedGuideTuning.elroy1Threshold} 豆进入 Lv1，
              剩 {selectedGuideTuning.elroy2Threshold} 豆进入 Lv2。
            </p>
          </div>
        )}

        <div className="pacman-ghost-stats">
          <div className="pacman-stat-item">
            <span className="pacman-stat-label">吃鬼得分</span>
            <span className="pacman-stat-value">{GHOST_EAT_SCORES.join(' → ')}分</span>
          </div>
          <div className="pacman-stat-item">
            <span className="pacman-stat-label">累计吃鬼</span>
            <span className="pacman-stat-value">{progressDisplay.totalGhostsEaten}次</span>
          </div>
        </div>
      </div>

      <div className="pacman-ghost-summary">
        <h4>四鬼协作模式</h4>
        <p>红鬼直接追击，粉鬼预判截断，青鬼配合红鬼制造包围，橙鬼在远处游荡。四鬼形成动态包围网，利用Scatter期（各自回角落）清理危险区域。</p>
      </div>
    </div>
  );

  const renderFruitGuide = () => (
    <div className="pacman-guide-fruits">
      <div className="pacman-fruit-selector">
        {FRUIT_IDS.map((fruitId) => (
          <button
            key={fruitId}
            className={`pacman-fruit-btn${selectedFruit === fruitId ? ' active' : ''}`}
            onClick={() => setSelectedFruit(fruitId)}
          >
            <span className="pacman-fruit-icon">{getFruitEmoji(fruitId)}</span>
            <span>{FRUIT_NAMES[fruitId]}</span>
            <span className="pacman-fruit-score">{FRUIT_SCORES[fruitId]}分</span>
          </button>
        ))}
      </div>

      <div className="pacman-fruit-detail">
        <h3>{FRUIT_NAMES[selectedFruit]} · {FRUIT_SCORES[selectedFruit]}分</h3>
        <p>水果在吃掉一定数量豆子后出现在迷宫中央下方。出现后限时9秒，错过会消失。</p>
      </div>

      <div className="pacman-fruit-trigger-table">
        <h4>水果触发阈值表</h4>
        <table className="pacman-fruit-table">
          <thead>
            <tr>
              <th>关卡</th>
              <th>第一次触发</th>
              <th>第二次触发</th>
              <th>水果类型</th>
              <th>限时</th>
            </tr>
          </thead>
          <tbody>
            {levelSummaries.slice(0, 10).map((summary) => {
              const tuning = getLevelTuningByPack(selectedPack, summary.level);
              return (
                <tr key={summary.level}>
                  <td>{summary.level}</td>
                  <td>{tuning.fruitSpawnThreshold1}豆</td>
                  <td>{tuning.fruitSpawnThreshold2}豆</td>
                  <td>{FRUIT_NAMES[FRUIT_IDS[tuning.fruitIndex]]}</td>
                  <td>{Math.floor(tuning.fruitLifetimeMs / 1000)}秒</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pacman-fruit-stats">
        <div className="pacman-stat-item">
          <span className="pacman-stat-label">累计水果</span>
          <span className="pacman-stat-value">{progressDisplay.totalFruitsCollected}个</span>
        </div>
      </div>
    </div>
  );

  const renderMazeGuide = () => (
    <div className="pacman-guide-maze">
      <div className="pacman-maze-tags">
        {MAZE_TAGS.map((tag, index) => (
          <div key={index} className="pacman-maze-tag-card">
            <h4>{tag.tag}</h4>
            <p>{tag.description}</p>
            <small className="pacman-maze-tip">{tag.tip}</small>
          </div>
        ))}
      </div>

      <div className="pacman-maze-stats">
        <h4>迷宫数据</h4>
        <div className="pacman-maze-stat-grid">
          <div className="pacman-stat-item">
            <span className="pacman-stat-label">总豆子</span>
            <span className="pacman-stat-value">244个</span>
          </div>
          <div className="pacman-stat-item">
            <span className="pacman-stat-label">能量豆</span>
            <span className="pacman-stat-value">4个</span>
          </div>
          <div className="pacman-stat-item">
            <span className="pacman-stat-label">传送门</span>
            <span className="pacman-stat-value">2个</span>
          </div>
          <div className="pacman-stat-item">
            <span className="pacman-stat-label">死角数</span>
            <span className="pacman-stat-value">约8处</span>
          </div>
        </div>
      </div>

      <div className="pacman-route-recommend">
        <h4>推荐路线类型</h4>
        <ul>
          <li><strong>开局路线</strong>：先清左下和右下角落，避开鬼屋入口。</li>
          <li><strong>Scatter期路线</strong>：清理四鬼各自回的角落区域（右上、左上、右下、左下）。</li>
          <li><strong>Chase期路线</strong>：利用传送门循环，避免进入死角。</li>
          <li><strong>能量豆路线</strong>：保留一个能量豆作为紧急逃生手段。</li>
        </ul>
      </div>
    </div>
  );

  const renderInputGuide = () => (
    <div className="pacman-guide-input">
      <div className="pacman-input-items">
        {INPUT_GUIDE.map((item, index) => (
          <div key={index} className="pacman-input-card">
            <h4>{item.title}</h4>
            <p>{item.description}</p>
            <div className="pacman-input-example">
              <strong>示例：</strong>{item.example}
            </div>
          </div>
        ))}
      </div>

      <div className="pacman-input-keys">
        <h4>按键说明</h4>
        <div className="pacman-key-grid">
          <div className="pacman-key-item">
            <kbd>↑</kbd> / <kbd>W</kbd>
            <span>向上</span>
          </div>
          <div className="pacman-key-item">
            <kbd>↓</kbd> / <kbd>S</kbd>
            <span>向下</span>
          </div>
          <div className="pacman-key-item">
            <kbd>←</kbd> / <kbd>A</kbd>
            <span>向左</span>
          </div>
          <div className="pacman-key-item">
            <kbd>→</kbd> / <kbd>D</kbd>
            <span>向右</span>
          </div>
          <div className="pacman-key-item">
            <kbd>P</kbd>
            <span>暂停</span>
          </div>
          <div className="pacman-key-item">
            <kbd>R</kbd>
            <span>重开</span>
          </div>
          <div className="pacman-key-item">
            <kbd>空格</kbd> / <kbd>回车</kbd>
            <span>开始</span>
          </div>
          <div className="pacman-key-item">
            <kbd>ESC</kbd>
            <span>返回</span>
          </div>
        </div>
      </div>

      <div className="pacman-score-table">
        <h4>得分表</h4>
        <div className="pacman-score-grid">
          <div className="pacman-score-item">
            <span className="pacman-score-label">小豆子</span>
            <span className="pacman-score-value">{PELLET_SCORE}分</span>
          </div>
          <div className="pacman-score-item">
            <span className="pacman-score-label">能量豆</span>
            <span className="pacman-score-value">{ENERGIZER_SCORE}分</span>
          </div>
          <div className="pacman-score-item">
            <span className="pacman-score-label">吃鬼1</span>
            <span className="pacman-score-value">{GHOST_EAT_SCORES[0]}分</span>
          </div>
          <div className="pacman-score-item">
            <span className="pacman-score-label">吃鬼2</span>
            <span className="pacman-score-value">{GHOST_EAT_SCORES[1]}分</span>
          </div>
          <div className="pacman-score-item">
            <span className="pacman-score-label">吃鬼3</span>
            <span className="pacman-score-value">{GHOST_EAT_SCORES[2]}分</span>
          </div>
          <div className="pacman-score-item">
            <span className="pacman-score-label">吃鬼4</span>
            <span className="pacman-score-value">{GHOST_EAT_SCORES[3]}分</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPracticeGuide = () => (
    <div className="pacman-guide-practice">
      <div className="pacman-practice-modules">
        {practiceModules.map((module) => {
          const record = getPracticeRecord(storage, module.id);

          return (
            <div key={module.id} className="pacman-practice-card">
              <h4>{module.name}</h4>
              <span className="pacman-practice-difficulty">{module.difficulty}</span>
              <p>{module.description}</p>
              <div className="pacman-practice-meta">
                <strong>目标：</strong>{module.objective}
              </div>
              <div className="pacman-practice-meta">
                <strong>起手提示：</strong>{module.startHint}
              </div>
              <div className="pacman-practice-meta pacman-practice-return">
                完成后默认返回图鉴练习页；从结算页进入时会回来源关卡。
              </div>
              <div className="pacman-practice-records">
                <span>尝试 {record?.attempts || 0}</span>
                <span>完成 {record?.completions || 0}</span>
                <span>最佳 {record?.bestClearTimeMs ? `${Math.floor(record.bestClearTimeMs / 1000)}秒` : '无记录'}</span>
              </div>
              <button
                className="pacman-practice-btn"
                onClick={() => launchPractice(module)}
              >
                进入练习
              </button>
            </div>
          );
        })}
      </div>

      <div className="pacman-practice-progress">
        <h4>练习进度</h4>
        <div className="pacman-practice-stats">
          <div className="pacman-stat-item">
            <span className="pacman-stat-label">最佳分数</span>
            <span className="pacman-stat-value">{hubSummary.bestScore}</span>
          </div>
          <div className="pacman-stat-item">
            <span className="pacman-stat-label">最高关卡</span>
            <span className="pacman-stat-value">{hubSummary.highestLevel}</span>
          </div>
          <div className="pacman-stat-item">
            <span className="pacman-stat-label">最快清图</span>
            <span className="pacman-stat-value">{hubSummary.bestClearTime}</span>
          </div>
          <div className="pacman-stat-item">
            <span className="pacman-stat-label">无伤记录</span>
            <span className="pacman-stat-value">{hubSummary.perfectRuns}次</span>
          </div>
        </div>
      </div>

      <div className="pacman-practice-pack-select">
        <h4>关卡包选择</h4>
        <div className="pacman-pack-tabs">
          <button
            className={`pacman-pack-tab${selectedPack === 'arcade' ? ' active' : ''}`}
            onClick={() => setSelectedPack('arcade')}
          >
            经典街机包（21关）
          </button>
          <button
            className={`pacman-pack-tab${selectedPack === 'tutorial' ? ' active' : ''}`}
            onClick={() => setSelectedPack('tutorial')}
          >
            路线教学包（10关）
          </button>
        </div>
      </div>

      <div className="pacman-guide-launch-note">
        {queuedPracticeId
          ? `已写入待开始练习：${practiceModules.find((module) => module.id === queuedPracticeId)?.name || queuedPracticeId}，完成后会优先回到图鉴练习页。`
          : '从这里点练习，会把对应预设写入主对局页。'}
      </div>
      <button
        className="pacman-play-btn"
        onClick={() => launchPackEntry({
          packId: selectedPack,
          levelNumber: 1,
          mode: 'classic',
        })}
      >
        打开当前关卡包
      </button>
    </div>
  );

  return (
    <div className="pacman-guide-sheet">
      <div className="pacman-guide-tabs">
        <button
          className={`pacman-guide-tab${activeTab === 'ghosts' ? ' active' : ''}`}
          onClick={() => setActiveTab('ghosts')}
        >
          四鬼图鉴
        </button>
        <button
          className={`pacman-guide-tab${activeTab === 'fruits' ? ' active' : ''}`}
          onClick={() => setActiveTab('fruits')}
        >
          水果价值
        </button>
        <button
          className={`pacman-guide-tab${activeTab === 'maze' ? ' active' : ''}`}
          onClick={() => setActiveTab('maze')}
        >
          迷宫标签
        </button>
        <button
          className={`pacman-guide-tab${activeTab === 'input' ? ' active' : ''}`}
          onClick={() => setActiveTab('input')}
        >
          输入判定
        </button>
        <button
          className={`pacman-guide-tab${activeTab === 'practice' ? ' active' : ''}`}
          onClick={() => setActiveTab('practice')}
        >
          练习模式
        </button>
      </div>

      <div className="pacman-guide-content">
        {activeTab === 'ghosts' && renderGhostGuide()}
        {activeTab === 'fruits' && renderFruitGuide()}
        {activeTab === 'maze' && renderMazeGuide()}
        {activeTab === 'input' && renderInputGuide()}
        {activeTab === 'practice' && renderPracticeGuide()}
      </div>
    </div>
  );
};

function getFruitEmoji(fruitId: FruitId): string {
  const emojis: Record<FruitId, string> = {
    cherry: '🍒',
    strawberry: '🍓',
    orange: '🍊',
    apple: '🍎',
    melon: '🍈',
    galaxian: '🚀',
    bell: '🔔',
    key: '🔑',
  };
  return emojis[fruitId] || '🍎';
}

export default PacmanGuideSheet;
