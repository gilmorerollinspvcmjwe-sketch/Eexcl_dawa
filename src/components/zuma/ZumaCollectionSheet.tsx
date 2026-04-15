/* 祖玛图鉴与练习Sheet15组件。包含球种图鉴、道具球说明、轨道地形、Boss机制和练习模式入口。 */

import React, { useState, useMemo } from 'react';
import '../../styles/zuma.css';
import {
  ZUMA_BALL_COLORS,
  ZUMA_POWERUP_TYPES,
  ZUMA_POWERUP_EFFECTS,
  type ZumaBallColor,
  type ZumaPowerupType,
} from '../../features/zuma/zumaTypes';
import { getAllTrackIds, getTrackDefinition } from '../../features/zuma/zumaLevelCatalog';
import { getPracticeStatsForDisplay, getZumaProgressSummary } from '../../features/zuma/zumaProgressStorage';
import { ZumaPracticeSheet } from './ZumaPracticeSheet';

const BALL_COLOR_INFO: Record<ZumaBallColor, { name: string; description: string; tip: string }> = {
  red: { name: '红球', description: '基础彩球，最常见的颜色', tip: '红色球链通常较长，优先消除红色可快速得分' },
  blue: { name: '蓝球', description: '基础彩球，常见颜色', tip: '蓝色球链在波浪轨道上更容易命中' },
  green: { name: '绿球', description: '基础彩球，常见颜色', tip: '绿色球链在螺旋轨道上需要预判位置' },
  yellow: { name: '黄球', description: '进阶彩球，四色关卡出现', tip: '黄色球链在锯齿轨道上需要快速反应' },
  purple: { name: '紫球', description: '高难度彩球，五色关卡出现', tip: '紫色球链在八字轨道上需要精准瞄准' },
  orange: { name: '橙球', description: '高难度彩球，五色关卡出现', tip: '橙色球链在圆形轨道上需要观察推进节奏' },
};

const POWERUP_INFO: Record<ZumaPowerupType, { name: string; icon: string; effect: string; strategy: string }> = {
  burst: {
    name: '爆裂球',
    icon: '💥',
    effect: ZUMA_POWERUP_EFFECTS.burst.description,
    strategy: '适合密集球链，命中后半径范围清除。建议在球链密集处使用，可一次清除多个球。',
  },
  lightning: {
    name: '闪电球',
    icon: '⚡',
    effect: ZUMA_POWERUP_EFFECTS.lightning.description,
    strategy: '适合长球链，沿轨道方向清除一段连续球。建议在球链较长时使用，可快速减少球数。',
  },
  slow: {
    name: '减速球',
    icon: '🐢',
    effect: ZUMA_POWERUP_EFFECTS.slow.description,
    strategy: '适合危险时刻，全链减速N秒。建议在球链接近终点线时使用，争取更多反应时间。',
  },
  rewind: {
    name: '倒退球',
    icon: '⏪',
    effect: ZUMA_POWERUP_EFFECTS.rewind.description,
    strategy: '适合紧急抢救，链头后退固定距离。建议在球链即将触及终点线时使用，可立即拉开距离。',
  },
  wild: {
    name: '万能球',
    icon: '🌟',
    effect: ZUMA_POWERUP_EFFECTS.wild.description,
    strategy: '适合颜色匹配困难时，可当任意颜色参与三消。建议在找不到合适颜色时使用，可触发连锁。',
  },
};

const TRACK_TERRAIN_INFO: Record<string, { name: string; difficulty: string; features: string; tip: string }> = {
  'track-simple-01': {
    name: '简单曲线',
    difficulty: 'S1',
    features: '单一路径，平滑曲线，适合入门练习',
    tip: '曲线轨道需要预判球链位置，瞄准时注意曲线角度变化',
  },
  'track-double-loop-01': {
    name: '双环轨道',
    difficulty: 'S3',
    features: '双环交叉，路径复杂，需要观察交叉点',
    tip: '双环轨道在交叉点需要快速判断球链方向',
  },
  'track-spiral-01': {
    name: '螺旋轨道',
    difficulty: 'S4',
    features: '螺旋路径，向心推进，终点在中心',
    tip: '螺旋轨道需要观察球链推进节奏，注意中心终点',
  },
  'track-zigzag-01': {
    name: '锯齿轨道',
    difficulty: 'S2',
    features: '锯齿路径，快速推进，需要快速反应',
    tip: '锯齿轨道推进更快，需要快速瞄准和发射',
  },
  'track-wave-01': {
    name: '波浪轨道',
    difficulty: 'S2',
    features: '波浪路径，起伏推进，适合弯道练习',
    tip: '波浪轨道在起伏处需要预判球链位置',
  },
  'track-circle-01': {
    name: '圆形轨道',
    difficulty: 'S3',
    features: '圆形路径，绕圈推进，终点在外侧',
    tip: '圆形轨道无起点终点概念，注意推进节奏',
  },
  'track-figure-eight-01': {
    name: '八字轨道',
    difficulty: 'S5',
    features: '八字路径，交叉推进，最高难度',
    tip: '八字轨道在交叉点需要精准瞄准',
  },
  'track-long-straight-01': {
    name: '长直轨道',
    difficulty: 'S1',
    features: '直线路径，简单推进，适合基础练习',
    tip: '长直轨道适合练习基础瞄准和发射',
  },
};

const BOSS_MECHANICS_INFO = [
  {
    phase: '第一阶段',
    name: '球链生成',
    description: 'Boss关卡开始时，球链从起点生成，持续推进',
    tip: '观察球链颜色分布，提前规划消除策略',
  },
  {
    phase: '第二阶段',
    name: '危险预警',
    description: '球链接近终点线时，危险等级升级',
    tip: '危险等级分为安全、警告、危险三级，注意预警提示',
  },
  {
    phase: '第三阶段',
    name: '连锁触发',
    description: '消除后球链回缩，可能触发连锁消除',
    tip: '连锁消除得分更高，尽量制造连锁机会',
  },
  {
    phase: '第四阶段',
    name: '道具球使用',
    description: '道具球随机出现，合理使用可扭转局势',
    tip: '道具球在关键时刻使用效果最佳',
  },
  {
    phase: '第五阶段',
    name: '终局判定',
    description: '清空球链胜利，触及终点线失败',
    tip: '终局时保持冷静，精准瞄准最后几个球',
  },
];

const PRACTICE_MODULES = [
  {
    id: 'curve-aim',
    name: '弯道命中练习',
    description: '在波浪轨道上练习弯道瞄准',
    objective: '提高弯道命中率',
    duration: '60秒',
    trackId: 'track-wave-01',
    colorPool: ['red', 'blue'],
    intensity: 'S2',
  },
  {
    id: 'chain-basic',
    name: '回缩连锁练习',
    description: '练习消除后球链回缩与连锁触发',
    objective: '触发至少3次连锁消除',
    duration: '90秒',
    trackId: 'track-simple-01',
    colorPool: ['red', 'blue', 'green'],
    intensity: 'S2',
  },
  {
    id: 'danger-rescue',
    name: '危险线抢救练习',
    description: '在球链接近终点线时练习抢救',
    objective: '在危险等级下成功抢救',
    duration: '60秒',
    trackId: 'track-zigzag-01',
    colorPool: ['red', 'blue', 'green'],
    intensity: 'S3',
  },
  {
    id: 'powerup-basic',
    name: '道具球专项练习',
    description: '练习各类道具球的使用时机',
    objective: '合理使用道具球扭转局势',
    duration: '90秒',
    trackId: 'track-circle-01',
    colorPool: ['red', 'blue', 'green', 'yellow'],
    intensity: 'S3',
  },
];

interface ZumaCollectionSheetProps {
  onFormulaChange?: (text: string) => void;
  onStartPractice?: (practiceId: string) => void;
}

type CollectionTab = 'balls' | 'powerups' | 'tracks' | 'boss' | 'practice';

export const ZumaCollectionSheet: React.FC<ZumaCollectionSheetProps> = ({
  onFormulaChange,
  onStartPractice,
}) => {
  const [activeTab, setActiveTab] = useState<CollectionTab>('balls');
  const [activePracticeId, setActivePracticeId] = useState<string | null>(null);
  const progressSummary = useMemo(() => getZumaProgressSummary(), []);
  const practiceStats = useMemo(() => getPracticeStatsForDisplay(), []);
  const trackIds = useMemo(() => getAllTrackIds(), []);

  React.useEffect(() => {
    if (activePracticeId) {
      return;
    }
    const tabLabels: Record<CollectionTab, string> = {
      balls: '球种图鉴',
      powerups: '道具球说明',
      tracks: '轨道地形',
      boss: 'Boss机制',
      practice: '练习模式',
    };
    onFormulaChange?.(`=祖玛图鉴: ${tabLabels[activeTab]}`);
  }, [onFormulaChange, activeTab, activePracticeId]);

  if (activePracticeId) {
    return (
      <ZumaPracticeSheet
        practiceId={activePracticeId}
        onFormulaChange={onFormulaChange}
        onExit={() => setActivePracticeId(null)}
        exitLabel="返回训练卡"
      />
    );
  }

  const renderBallGuide = () => (
    <div className="zuma-collection-section">
      <h3>普通彩球规则</h3>
      <p className="zuma-collection-intro">
        祖玛游戏中有6种普通彩球，每种颜色都有独特的消除规则。同色三球及以上连续排列时可触发消除。
      </p>
      <div className="zuma-ball-grid">
        {ZUMA_BALL_COLORS.map((color) => {
          const info = BALL_COLOR_INFO[color];
          return (
            <div key={color} className="zuma-ball-card">
              <div
                className="zuma-ball-preview"
                style={{
                  backgroundColor: color === 'red' ? '#ef4444'
                    : color === 'blue' ? '#3b82f6'
                    : color === 'green' ? '#22c55e'
                    : color === 'yellow' ? '#eab308'
                    : color === 'purple' ? '#a855f7'
                    : '#f97316',
                }}
              />
              <div className="zuma-ball-info">
                <strong>{info.name}</strong>
                <span>{info.description}</span>
                <small className="zuma-tip">{info.tip}</small>
              </div>
            </div>
          );
        })}
      </div>
      <div className="zuma-rule-box">
        <h4>消除规则</h4>
        <ul>
          <li>同色三球及以上连续排列时可消除</li>
          <li>消除后球链会回缩，可能触发连锁</li>
          <li>万能球可匹配任意颜色参与消除</li>
          <li>消除得分 = 球数 × 10 × 连锁倍率</li>
        </ul>
      </div>
    </div>
  );

  const renderPowerupGuide = () => (
    <div className="zuma-collection-section">
      <h3>道具球说明</h3>
      <p className="zuma-collection-intro">
        祖玛游戏中有5类道具球，每种道具球都有独特的效果和使用时机。道具球随机出现在炮台球池中。
      </p>
      <div className="zuma-powerup-grid">
        {ZUMA_POWERUP_TYPES.map((type) => {
          const info = POWERUP_INFO[type];
          return (
            <div key={type} className="zuma-powerup-card">
              <div className="zuma-powerup-icon">{info.icon}</div>
              <div className="zuma-powerup-info">
                <strong>{info.name}</strong>
                <span className="zuma-powerup-effect">{info.effect}</span>
                <div className="zuma-powerup-strategy">
                  <small>策略建议</small>
                  <p>{info.strategy}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="zuma-rule-box">
        <h4>道具球规则</h4>
        <ul>
          <li>道具球随机出现，出现概率由关卡决定</li>
          <li>道具球发射后立即触发效果</li>
          <li>道具球使用后得分额外加50分</li>
          <li>合理使用道具球可扭转局势</li>
        </ul>
      </div>
    </div>
  );

  const renderTrackGuide = () => (
    <div className="zuma-collection-section">
      <h3>轨道地形标签</h3>
      <p className="zuma-collection-intro">
        祖玛游戏中有多种轨道地形，每种轨道都有独特的路径特点和难度等级。了解轨道特性有助于制定消除策略。
      </p>
      <div className="zuma-track-grid">
        {trackIds.map((trackId) => {
          const track = getTrackDefinition(trackId);
          const info = TRACK_TERRAIN_INFO[trackId];
          if (!track || !info) return null;
          return (
            <div key={trackId} className="zuma-track-card">
              <div className="zuma-track-header">
                <strong>{info.name}</strong>
                <span className={`zuma-intensity-badge intensity-${info.difficulty}`}>{info.difficulty}</span>
              </div>
              <div className="zuma-track-details">
                <span>{info.features}</span>
                <span className="zuma-track-length">长度: {Math.round(track.totalLength)}px</span>
              </div>
              <small className="zuma-tip">{info.tip}</small>
            </div>
          );
        })}
      </div>
      <div className="zuma-rule-box">
        <h4>轨道规则</h4>
        <ul>
          <li>球链沿轨道路径持续推进</li>
          <li>终点线位于轨道85%位置</li>
          <li>球链触及终点线则失败</li>
          <li>不同轨道需要不同的瞄准策略</li>
        </ul>
      </div>
    </div>
  );

  const renderBossGuide = () => (
    <div className="zuma-collection-section">
      <h3>Boss阶段机制摘要</h3>
      <p className="zuma-collection-intro">
        祖玛Boss关卡分为多个阶段，每个阶段都有独特的机制和挑战。了解Boss机制有助于制定通关策略。
      </p>
      <div className="zuma-boss-grid">
        {BOSS_MECHANICS_INFO.map((mechanic, index) => (
          <div key={index} className="zuma-boss-card">
            <div className="zuma-boss-phase">{mechanic.phase}</div>
            <div className="zuma-boss-info">
              <strong>{mechanic.name}</strong>
              <span>{mechanic.description}</span>
              <small className="zuma-tip">{mechanic.tip}</small>
            </div>
          </div>
        ))}
      </div>
      <div className="zuma-rule-box">
        <h4>Boss规则</h4>
        <ul>
          <li>Boss关卡球链更长，推进更快</li>
          <li>Boss关卡道具球出现概率更高</li>
          <li>Boss关卡需要综合运用所有技能</li>
          <li>Boss关卡通关后解锁下一章节</li>
        </ul>
      </div>
    </div>
  );

  const renderPracticeMode = () => (
    <div className="zuma-collection-section">
      <h3>练习模式</h3>
      <p className="zuma-collection-intro">
        练习模式提供专项训练，帮助玩家掌握特定技能。每种练习都有明确的目标和时长。
      </p>
      <div className="zuma-practice-grid">
        {PRACTICE_MODULES.map((module) => {
          const stats = practiceStats[module.id];
          return (
            <div key={module.id} className="zuma-practice-card">
              <div className="zuma-practice-header">
                <strong>{module.name}</strong>
                <span className={`zuma-intensity-badge intensity-${module.intensity}`}>{module.intensity}</span>
              </div>
              <div className="zuma-practice-details">
                <span>{module.description}</span>
                <span>目标: {module.objective}</span>
                <span>时长: {module.duration}</span>
              </div>
              {stats && (
                <div className="zuma-practice-stats">
                  <small>练习次数: {stats.sessions}</small>
                  <small>最佳得分: {stats.bestScore}</small>
                </div>
              )}
              <button
                type="button"
                className="zuma-practice-start-btn"
                onClick={() => {
                  if (onStartPractice) {
                    onStartPractice(module.id);
                    return;
                  }
                  setActivePracticeId(module.id);
                }}
              >
                开始练习
              </button>
            </div>
          );
        })}
      </div>
      <div className="zuma-progress-summary">
        <h4>练习进度摘要</h4>
        <div className="zuma-progress-stats">
          <span>总练习次数: {Object.values(practiceStats).reduce((sum, s) => sum + s.sessions, 0)}</span>
          <span>最佳总分: {progressSummary.globalBestScore}</span>
          <span>最佳连锁: {progressSummary.globalBestChain}层</span>
          <span>神庙主线: {progressSummary.templeProgress}</span>
          <span>进阶段: {progressSummary.chainProgress}</span>
          <span>高压段: {progressSummary.pressureProgress}</span>
          <span>无尽最佳: 第{progressSummary.endlessBestWave}波</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="zuma-collection-sheet">
      <div className="zuma-collection-tabs" role="tablist">
        {(['balls', 'powerups', 'tracks', 'boss', 'practice'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={`zuma-collection-tab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'balls' ? '球种图鉴' : tab === 'powerups' ? '道具球' : tab === 'tracks' ? '轨道地形' : tab === 'boss' ? 'Boss机制' : '练习模式'}
          </button>
        ))}
      </div>

      <div className="zuma-collection-content">
        {activeTab === 'balls' && renderBallGuide()}
        {activeTab === 'powerups' && renderPowerupGuide()}
        {activeTab === 'tracks' && renderTrackGuide()}
        {activeTab === 'boss' && renderBossGuide()}
        {activeTab === 'practice' && renderPracticeMode()}
      </div>
    </div>
  );
};
