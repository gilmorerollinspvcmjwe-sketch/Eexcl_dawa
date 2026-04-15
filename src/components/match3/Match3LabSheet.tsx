/* Sheet17 三消图鉴与练习组件。包含块类型图鉴、障碍图鉴、目标图鉴、组合手册和练习模式。 */
import React, { useCallback, useMemo, useState } from 'react';
import {
  MATCH3_COLORS,
  MATCH3_OBSTACLE_HP,
  MATCH3_SCORE_BASE,
  MATCH3_COMBO_MULTIPLIERS,
  type Match3Color,
  type Match3SpecialType,
  type Match3ObstacleType,
  type Match3GoalType,
} from '../../features/match3/match3Types';
import { getProgressSummary, getProgressStats } from '../../features/match3/match3ProgressStorage';
import { Match3PracticeModule, MATCH3_PRACTICE_MODULES, type PracticeType } from './Match3PracticeModule';
import '../../styles/match3.css';

interface Match3LabSheetProps {
  onFormulaChange?: (text: string) => void;
}

type LabTabId = 'blocks' | 'obstacles' | 'goals' | 'combos' | 'practice';

const TAB_LABELS: Record<LabTabId, string> = {
  blocks: '块类型图鉴',
  obstacles: '障碍图鉴',
  goals: '目标图鉴',
  combos: '组合手册',
  practice: '练习模式',
};

const BLOCK_TYPE_INFO: Record<Match3SpecialType, { name: string; description: string; trigger: string; effect: string }> = {
  'striped-h': {
    name: '横向条纹块',
    description: '四连消除生成，清除整行',
    trigger: '四个相同色块横向连成一线',
    effect: '激活后清除所在整行所有色块',
  },
  'striped-v': {
    name: '纵向条纹块',
    description: '四连消除生成，清除整列',
    trigger: '四个相同色块纵向连成一线',
    effect: '激活后清除所在整列所有色块',
  },
  'wrapped': {
    name: '包装块',
    description: 'T/L形五连生成，爆炸两次',
    trigger: '五个相同色块组成T形或L形',
    effect: '第一次爆炸清除周围3×3区域，第二次爆炸清除更大范围',
  },
  'colorBomb': {
    name: '彩球',
    description: '五连直线生成，清除同色',
    trigger: '五个相同色块连成直线',
    effect: '与任意色块交换后清除场上所有该颜色的色块',
  },
};

const OBSTACLE_TYPE_INFO: Record<Match3ObstacleType, { name: string; description: string; breakMethod: string; priority: string }> = {
  frost1: {
    name: '单层冰冻',
    description: '覆盖在色块上的冰冻层，需1次消除击破',
    breakMethod: '消除相邻色块即可击破',
    priority: '低优先级，可在正常消除时顺便处理',
  },
  frost2: {
    name: '双层冰冻',
    description: '双层冰冻覆盖，需2次消除击破',
    breakMethod: '需要两次相邻消除才能完全清除',
    priority: '中优先级，建议优先处理以避免浪费步数',
  },
  chain: {
    name: '锁链块',
    description: '锁链束缚的色块，需消除相邻解锁',
    breakMethod: '消除锁链块相邻的色块即可解锁',
    priority: '中优先级，解锁后色块可正常参与消除',
  },
  box: {
    name: '木箱',
    description: '阻挡色块的木箱，需相邻爆破击破',
    breakMethod: '在木箱相邻位置触发消除或特殊块效果',
    priority: '高优先级，木箱会阻挡色块移动',
  },
  stone: {
    name: '石块',
    description: '坚固的石块障碍，需2次相邻爆破击破',
    breakMethod: '需要两次相邻消除才能击破',
    priority: '高优先级，石块无法被交换',
  },
  portalIn: {
    name: '传送入口',
    description: '色块从入口传送至出口',
    breakMethod: '传送口本身无需击破，是通道机制',
    priority: '利用传送口可以清除远处障碍',
  },
  portalOut: {
    name: '传送出口',
    description: '色块从入口传送至此',
    breakMethod: '传送口本身无需击破，是通道机制',
    priority: '配合入口使用，注意出口位置的消除机会',
  },
  spreader: {
    name: '蔓延块',
    description: '每回合会向相邻空位扩散',
    breakMethod: '尽快消除蔓延块，阻止扩散',
    priority: '最高优先级，蔓延块会持续扩散威胁',
  },
};

const GOAL_TYPE_INFO: Record<Match3GoalType, { name: string; description: string; timing: string; counting: string }> = {
  score: {
    name: '分数达标',
    description: '达到指定分数即可通关',
    timing: '实时累计，消除即加分',
    counting: '基础分数 + 连锁倍率 + 特殊块加成',
  },
  collectColor: {
    name: '颜色收集',
    description: '收集指定颜色的色块',
    timing: '消除该颜色色块时计数',
    counting: '每次消除该颜色色块计入进度',
  },
  clearOverlay: {
    name: '清理覆盖层',
    description: '清除冰冻等覆盖层障碍',
    timing: '击破覆盖层时计数',
    counting: '每击破一个覆盖层计入进度',
  },
  dropCollect: {
    name: '掉落收集',
    description: '让特殊物品掉落到底部',
    timing: '物品到达底部行时计数',
    counting: '每个物品到达底部计入进度',
  },
  clearObstacle: {
    name: '障碍清除',
    description: '清除指定类型的障碍',
    timing: '完全击破障碍时计数',
    counting: '每完全击破一个障碍计入进度',
  },
  triggerCombo: {
    name: '组合触发',
    description: '在限定局面里触发指定特殊块组合',
    timing: '两块特殊块交换并完成对应组合时计数',
    counting: '每次命中脚本指定组合计入进度',
  },
};

const COMBO_INFO: Array<{ combo: string; result: string; range: string; tip: string }> = [
  { combo: '条纹块 + 条纹块', result: '十字清除', range: '清除触发位置的整行和整列', tip: '最常用的组合，适合清理大面积区域' },
  { combo: '条纹块 + 包装块', result: '三行三列清除', range: '清除触发位置所在行、列及相邻两行两列', tip: '威力强大，适合清理密集障碍区域' },
  { combo: '包装块 + 包装块', result: '大范围爆破', range: '清除触发位置周围5×5区域', tip: '最大范围的单次爆破效果' },
  { combo: '彩球 + 普通色块', result: '清屏该颜色', range: '清除场上所有该颜色的色块', tip: '快速完成颜色收集目标' },
  { combo: '彩球 + 特殊块', result: '全色转化', range: '将所有同色色块转化为该特殊块并触发', tip: '最强组合，可触发大量连锁' },
  { combo: '彩球 + 彩球', result: '全屏清除', range: '清除场上所有色块', tip: '终极组合，一步清屏' },
];

const COLOR_DISPLAY: Record<Match3Color, { bg: string; text: string; label: string }> = {
  red: { bg: 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)', text: '#b91c1c', label: '红' },
  orange: { bg: 'linear-gradient(135deg, #ffedd5 0%, #fdba74 100%)', text: '#c2410c', label: '橙' },
  yellow: { bg: 'linear-gradient(135deg, #fef9c3 0%, #fde047 100%)', text: '#a16207', label: '黄' },
  green: { bg: 'linear-gradient(135deg, #dcfce7 0%, #86efac 100%)', text: '#166534', label: '绿' },
  blue: { bg: 'linear-gradient(135deg, #dbeafe 0%, #60a5fa 100%)', text: '#1d4ed8', label: '蓝' },
  purple: { bg: 'linear-gradient(135deg, #f3e8ff 0%, #c084fc 100%)', text: '#7c3aed', label: '紫' },
};

export const Match3LabSheet: React.FC<Match3LabSheetProps> = ({ onFormulaChange }) => {
  const [activeTab, setActiveTab] = useState<LabTabId>('blocks');
  const [activePracticeId, setActivePracticeId] = useState<PracticeType | null>(null);
  const progressSummary = useMemo(() => getProgressSummary(), []);
  const progressStats = useMemo(() => getProgressStats(), []);

  const handleFormulaUpdate = useCallback((tab: LabTabId) => {
    const label = TAB_LABELS[tab];
    onFormulaChange?.(`=Sheet17 三消实验室 | ${label} | 已通关 ${progressSummary.completedLevels}/${progressSummary.totalLevels}`);
  }, [onFormulaChange, progressSummary.completedLevels, progressSummary.totalLevels]);

  React.useEffect(() => {
    if (activePracticeId) {
      const practice = MATCH3_PRACTICE_MODULES.find((module) => module.id === activePracticeId);
      onFormulaChange?.(`=Sheet17 三消实验室 | 练习模式 | ${practice?.name ?? '专项训练'}`);
      return;
    }
    handleFormulaUpdate(activeTab);
  }, [activeTab, activePracticeId, handleFormulaUpdate, onFormulaChange]);

  if (activePracticeId) {
    return (
      <div className="match3-lab-sheet">
        <Match3PracticeModule
          practiceId={activePracticeId}
          onFormulaChange={onFormulaChange}
          onExit={() => setActivePracticeId(null)}
        />
      </div>
    );
  }

  return (
    <div className="match3-lab-sheet">
      <div className="match3-lab-header">
        <div className="match3-lab-tabs" role="tablist" aria-label="三消实验室标签切换">
          {(Object.keys(TAB_LABELS) as LabTabId[]).map((tabId) => (
            <button
              key={tabId}
              type="button"
              role="tab"
              aria-selected={activeTab === tabId}
              aria-label={`切换到${TAB_LABELS[tabId]}`}
              className={`match3-lab-tab${activeTab === tabId ? ' active' : ''}`}
              onClick={() => setActiveTab(tabId)}
            >
              {TAB_LABELS[tabId]}
            </button>
          ))}
        </div>
        <div className="match3-lab-progress-summary">
          <span>已通关 {progressSummary.completedLevels}/{progressSummary.totalLevels}</span>
          <span>星级 {progressSummary.totalStars}/{progressSummary.maxStars}</span>
          <span>完美率 {progressStats.perfectRate}%</span>
        </div>
      </div>

      <div className="match3-lab-content" role="tabpanel" aria-label={TAB_LABELS[activeTab]}>
        {activeTab === 'blocks' && (
          <section className="match3-lab-section">
            <h3>普通色块</h3>
            <div className="match3-block-grid">
              {MATCH3_COLORS.map((color) => (
                <div key={color} className="match3-block-card">
                  <div
                    className="match3-block-preview"
                    style={{ background: COLOR_DISPLAY[color].bg, color: COLOR_DISPLAY[color].text }}
                  >
                    {COLOR_DISPLAY[color].label}
                  </div>
                  <div className="match3-block-info">
                    <strong>{COLOR_DISPLAY[color].label}色块</strong>
                    <span>基础消除单位</span>
                    <small>三连消除得分 {MATCH3_SCORE_BASE.match3}</small>
                  </div>
                </div>
              ))}
            </div>

            <h3>特殊块</h3>
            <div className="match3-block-grid">
              {(Object.keys(BLOCK_TYPE_INFO) as Match3SpecialType[]).map((type) => (
                <div key={type} className="match3-block-card match3-block-card--special">
                  <div className={`match3-block-preview match3-tile--${type}`}>
                    {type === 'colorBomb' ? '★' : type === 'wrapped' ? '◆' : type === 'striped-h' ? '━' : '┃'}
                  </div>
                  <div className="match3-block-info">
                    <strong>{BLOCK_TYPE_INFO[type].name}</strong>
                    <span>{BLOCK_TYPE_INFO[type].description}</span>
                    <small>触发条件：{BLOCK_TYPE_INFO[type].trigger}</small>
                    <small>效果：{BLOCK_TYPE_INFO[type].effect}</small>
                    <small>基础得分 {MATCH3_SCORE_BASE.striped}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'obstacles' && (
          <section className="match3-lab-section">
            <h3>障碍类型</h3>
            <div className="match3-obstacle-grid">
              {(Object.keys(OBSTACLE_TYPE_INFO) as Match3ObstacleType[]).filter((t) => t !== 'portalIn' && t !== 'portalOut').map((type) => (
                <div key={type} className="match3-obstacle-card">
                  <div className={`match3-obstacle-preview match3-obstacle--${type}`}>
                    {type === 'frost1' ? '❄' : type === 'frost2' ? '❄❄' : type === 'chain' ? '⛓' : type === 'box' ? '📦' : type === 'stone' ? '🪨' : '🦠'}
                  </div>
                  <div className="match3-obstacle-info">
                    <strong>{OBSTACLE_TYPE_INFO[type].name}</strong>
                    <span>{OBSTACLE_TYPE_INFO[type].description}</span>
                    <small>击破方式：{OBSTACLE_TYPE_INFO[type].breakMethod}</small>
                    <small>优先级建议：{OBSTACLE_TYPE_INFO[type].priority}</small>
                    <small>击破所需次数：{MATCH3_OBSTACLE_HP[type]}</small>
                  </div>
                </div>
              ))}
            </div>

            <h3>传送口机制</h3>
            <div className="match3-obstacle-grid">
              {(['portalIn', 'portalOut'] as Match3ObstacleType[]).map((type) => (
                <div key={type} className="match3-obstacle-card">
                  <div className={`match3-obstacle-preview match3-obstacle--${type}`}>
                    {type === 'portalIn' ? '⬇' : '⬆'}
                  </div>
                  <div className="match3-obstacle-info">
                    <strong>{OBSTACLE_TYPE_INFO[type].name}</strong>
                    <span>{OBSTACLE_TYPE_INFO[type].description}</span>
                    <small>{OBSTACLE_TYPE_INFO[type].breakMethod}</small>
                    <small>{OBSTACLE_TYPE_INFO[type].priority}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'goals' && (
          <section className="match3-lab-section">
            <h3>目标类型</h3>
            <div className="match3-goal-grid">
              {(Object.keys(GOAL_TYPE_INFO) as Match3GoalType[]).map((type) => (
                <div key={type} className="match3-goal-card">
                  <div className="match3-goal-icon">
                    {type === 'score' ? '📊' : type === 'collectColor' ? '🎨' : type === 'clearOverlay' ? '🧹' : type === 'dropCollect' ? '⬇' : type === 'triggerCombo' ? '🧩' : '💥'}
                  </div>
                  <div className="match3-goal-info">
                    <strong>{GOAL_TYPE_INFO[type].name}</strong>
                    <span>{GOAL_TYPE_INFO[type].description}</span>
                    <small>判定时机：{GOAL_TYPE_INFO[type].timing}</small>
                    <small>计数方式：{GOAL_TYPE_INFO[type].counting}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'combos' && (
          <section className="match3-lab-section">
            <h3>特殊块组合效果</h3>
            <div className="match3-combo-grid">
              {COMBO_INFO.map((info, index) => (
                <div key={index} className="match3-combo-card">
                  <div className="match3-combo-header">
                    <strong>{info.combo}</strong>
                    <span className="match3-combo-result">{info.result}</span>
                  </div>
                  <div className="match3-combo-range">
                    <span>范围：{info.range}</span>
                  </div>
                  <div className="match3-combo-tip">
                    <small>💡 {info.tip}</small>
                  </div>
                </div>
              ))}
            </div>

            <h3>连锁倍率</h3>
            <div className="match3-chain-grid">
              {MATCH3_COMBO_MULTIPLIERS.map((multiplier, level) => (
                <div key={level} className="match3-chain-card">
                  <div className="match3-chain-level">
                    {level + 1}段连锁
                  </div>
                  <div className="match3-chain-multiplier">
                    ×{multiplier.toFixed(2)}
                  </div>
                  <small>连续消除{level + 1}次触发</small>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'practice' && (
          <section className="match3-lab-section">
            <h3>练习模块</h3>
            <div className="match3-practice-stats">
              <div className="match3-practice-stat-item">
                <span className="match3-practice-stat-label">Adventure</span>
                <span className="match3-practice-stat-value">主线推进</span>
              </div>
              <div className="match3-practice-stat-item">
                <span className="match3-practice-stat-label">Blitz</span>
                <span className="match3-practice-stat-value">限时冲分</span>
              </div>
              <div className="match3-practice-stat-item">
                <span className="match3-practice-stat-label">Puzzle</span>
                <span className="match3-practice-stat-value">固定盘解题</span>
              </div>
              <div className="match3-practice-stat-item">
                <span className="match3-practice-stat-label">Sheet17</span>
                <span className="match3-practice-stat-value">专项训练入口</span>
              </div>
            </div>
            <div className="match3-practice-grid">
              {MATCH3_PRACTICE_MODULES.map((module) => (
                <button
                  key={module.id}
                  type="button"
                  className={`match3-practice-card match3-practice-card--${module.difficulty}`}
                  aria-label={`开始${module.name}练习`}
                  onClick={() => setActivePracticeId(module.id)}
                >
                  <div className="match3-practice-header">
                    <strong>{module.name}</strong>
                    <span className={`match3-practice-difficulty match3-practice-difficulty--${module.difficulty}`}>
                      {module.difficulty === 'easy' ? '简单' : module.difficulty === 'medium' ? '中等' : '困难'}
                    </span>
                  </div>
                  <span>{module.description}</span>
                  <small className="match3-practice-hint">点击开始练习</small>
                </button>
              ))}
            </div>

            <h3>练习统计</h3>
            <div className="match3-practice-stats">
              <div className="match3-practice-stat-item">
                <span className="match3-practice-stat-label">总尝试次数</span>
                <span className="match3-practice-stat-value">{progressSummary.totalAttempts}</span>
              </div>
              <div className="match3-practice-stat-item">
                <span className="match3-practice-stat-label">平均星级</span>
                <span className="match3-practice-stat-value">{progressStats.averageStars.toFixed(1)}</span>
              </div>
              <div className="match3-practice-stat-item">
                <span className="match3-practice-stat-label">平均分数</span>
                <span className="match3-practice-stat-value">{progressStats.averageScore}</span>
              </div>
              <div className="match3-practice-stat-item">
                <span className="match3-practice-stat-label">完成率</span>
                <span className="match3-practice-stat-value">{progressStats.completionRate}%</span>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
