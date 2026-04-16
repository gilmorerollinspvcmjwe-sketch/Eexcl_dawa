import React, { useState } from 'react';
import { getFantasyLaneLevelById, getFantasyLaneLevelsByChapter } from '../../features/fantasy_lane/fantasyLaneLevelCatalog.ts';
import { FANTASY_LANE_HEROES, FANTASY_LANE_UNITS } from '../../features/fantasy_lane/fantasyLaneUnitRegistry.ts';
import type { FantasyLaneChapterDefinition, FantasyLaneRuntimeState, FantasyLaneUnitDefinition } from '../../features/fantasy_lane/fantasyLaneTypes.ts';
import { FantasyLaneUnitSprite } from './FantasyLaneUnitSprite';
import {
  formatCooldownMs,
  getUnitSpriteScale,
} from './fantasyLaneUiMeta.ts';

interface FantasyLaneLoadoutPanelProps {
  state: FantasyLaneRuntimeState;
  chapters: FantasyLaneChapterDefinition[];
  warnings: string[];
  canEditSetup: boolean;
  getLevelStatus: (levelId: string) => 'completed' | 'unlocked' | 'locked';
  onLevelSelect: (levelId: string) => void;
  onHeroSelect: (heroId: FantasyLaneRuntimeState['selectedHeroId']) => void;
  onToggleLoadout: (unitId: string) => void;
  onQueueUnit: (unitId: string) => void;
  onToggleCollapse: () => void;
  collapsed?: boolean;
}

// 角色标签映射（简化版）
const ROLE_LABELS_SIMPLE: Record<string, string> = {
  tank: '坦克',
  fighter: '战士',
  sniper: '射手',
  caster: '法师',
  siege: '攻城',
  air_sup: '空军',
  finisher: '终结者',
};

// 体型标签映射
const FOOTPRINT_LABELS_SIMPLE: Record<string, string> = {
  small: '小',
  medium: '中',
  large: '大',
  giant: '巨',
};

// 攻击方式标签
const getAttackLabel = (damageProfile: string, rangeBand: string) => {
  if (damageProfile === 'aoe') return '范围';
  return rangeBand === 'melee' ? '近战' : '远程';
};

// 目标规则标签
const getTargetLabel = (targetRule: string) => {
  if (targetRule === 'air_only') return '对空';
  if (targetRule === 'ground_only') return '对地';
  return '空地';
};

// 获取核心特性标签（最多2个）
const getCoreTags = (unit: FantasyLaneUnitDefinition): string[] => {
  const tags: string[] = [];
  const priorityTags = ['antiAir', 'heal', 'shield', 'burst', 'pierce', 'stealth', 'frontline'];
  const tagLabels: Record<string, string> = {
    antiAir: '对空',
    heal: '治疗',
    shield: '护盾',
    burst: '爆发',
    pierce: '破甲',
    stealth: '潜行',
    frontline: '前排',
  };
  
  for (const tag of priorityTags) {
    if (unit.tags.includes(tag)) {
      tags.push(tagLabels[tag]);
      if (tags.length >= 2) break;
    }
  }
  
  return tags;
};

function getUnitBadges(unit: FantasyLaneUnitDefinition) {
  const badges: string[] = [];
  badges.push(ROLE_LABELS_SIMPLE[unit.role]);
  badges.push(`${FOOTPRINT_LABELS_SIMPLE[unit.footprint]}·${getAttackLabel(unit.damageProfile, unit.rangeBand)}`);
  badges.push(...getCoreTags(unit));
  badges.push(getTargetLabel(unit.targetRule));
  return badges;
}

function getUnitDetails(unit: FantasyLaneUnitDefinition) {
  return [
    `${unit.cost}金`,
    `${formatCooldownMs(unit.cooldownMs)}`,
    `人口${unit.pop}`,
  ];
}

// 关卡选择弹窗组件
const LevelSelectModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  chapters: FantasyLaneChapterDefinition[];
  selectedChapterId: string;
  selectedLevelId: string;
  getLevelStatus: (levelId: string) => 'completed' | 'unlocked' | 'locked';
  canEditSetup: boolean;
  onLevelSelect: (levelId: string) => void;
}> = ({ isOpen, onClose, chapters, selectedChapterId, selectedLevelId, getLevelStatus, canEditSetup, onLevelSelect }) => {
  const [tempChapterId, setTempChapterId] = useState(selectedChapterId);
  const visibleLevels = getFantasyLaneLevelsByChapter(tempChapterId);

  if (!isOpen) return null;

  return (
    <div className="fantasy-lane-modal-overlay" onClick={onClose}>
      <div className="fantasy-lane-modal" onClick={(e) => e.stopPropagation()}>
        <div className="fantasy-lane-modal-header">
          <h4>选择关卡</h4>
          <button type="button" className="fantasy-lane-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="fantasy-lane-modal-body">
          <div className="fantasy-lane-chapter-strip">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                type="button"
                className={`fantasy-lane-chip${tempChapterId === chapter.id ? ' is-active' : ''}`}
                onClick={() => setTempChapterId(chapter.id)}
              >
                {chapter.order}. {chapter.name}
              </button>
            ))}
          </div>
          <div className="fantasy-lane-level-grid">
            {visibleLevels.map((level) => {
              const status = getLevelStatus(level.id);
              const disabled = !canEditSetup || status === 'locked';
              const isSelected = selectedLevelId === level.id;
              
              return (
                <button
                  key={level.id}
                  type="button"
                  className={`fantasy-lane-level-card${isSelected ? ' is-active' : ''}${status === 'completed' ? ' is-completed' : ''}`}
                  onClick={() => {
                    onLevelSelect(level.id);
                    onClose();
                  }}
                  disabled={disabled}
                >
                  <strong>{level.id}</strong>
                  <span>{level.name}</span>
                  {status === 'completed' && <small className="fantasy-lane-level-status">✓</small>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// 英雄选择弹窗组件
const HeroSelectModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedHeroId: string;
  canEditSetup: boolean;
  onHeroSelect: (heroId: FantasyLaneRuntimeState['selectedHeroId']) => void;
}> = ({ isOpen, onClose, selectedHeroId, canEditSetup, onHeroSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fantasy-lane-modal-overlay" onClick={onClose}>
      <div className="fantasy-lane-modal" onClick={(e) => e.stopPropagation()}>
        <div className="fantasy-lane-modal-header">
          <h4>选择英雄</h4>
          <button type="button" className="fantasy-lane-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="fantasy-lane-modal-body">
          <div className="fantasy-lane-card-grid">
            {FANTASY_LANE_HEROES.map((hero) => (
              <button
                key={hero.id}
                type="button"
                className={`fantasy-lane-mini-card${selectedHeroId === hero.id ? ' is-active' : ''}`}
                onClick={() => {
                  onHeroSelect(hero.id);
                  onClose();
                }}
                disabled={!canEditSetup}
              >
                <strong>{hero.name}</strong>
                <span>{hero.summary}</span>
                <small>{hero.passiveSummary}</small>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const FantasyLaneLoadoutPanel: React.FC<FantasyLaneLoadoutPanelProps> = ({
  state,
  chapters,
  warnings,
  canEditSetup,
  getLevelStatus,
  onLevelSelect,
  onHeroSelect,
  onToggleLoadout,
  onQueueUnit,
  onToggleCollapse,
  collapsed = false,
}) => {
  const currentLevel = getFantasyLaneLevelById(state.selectedLevelId);
  const currentHero = FANTASY_LANE_HEROES.find((h) => h.id === state.selectedHeroId);
  
  // 弹窗状态
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);

  return (
    <aside className={`fantasy-lane-sidebar${collapsed ? ' is-collapsed' : ''}`}>
      {collapsed ? (
        // 收起状态：窄条模式
        <div className="fantasy-lane-sidebar-compact">
          <button type="button" className="fantasy-lane-sidebar-expand-btn" onClick={onToggleCollapse} title="展开">
            ▶
          </button>
          <div className="fantasy-lane-sidebar-compact-info">
            <strong>{currentLevel.id}</strong>
            <span>{Math.floor(state.gold)}金</span>
            <span>{state.activePop}/{state.popLimit}人口</span>
          </div>
          {state.phase !== 'setup' && (
            <div className="fantasy-lane-sidebar-compact-units">
              {state.loadoutUnitIds.map((unitId, index) => {
                const unit = FANTASY_LANE_UNITS.find((u) => u.id === unitId);
                if (!unit) return null;
                const cooling = state.unitCooldowns[unitId] > 0;
                const disabled = state.phase !== 'playing' || cooling || state.gold < unit.cost || state.queue.length >= state.queueLimit;
                return (
                  <button
                    key={unit.id}
                    type="button"
                    className={`fantasy-lane-compact-unit${cooling ? ' is-cooling' : ''}`}
                    onClick={() => onQueueUnit(unit.id)}
                    disabled={disabled}
                    title={`${index + 1}. ${unit.name} ${unit.cost}金 ${unit.pop}人口`}
                  >
                    <div className="fantasy-lane-compact-unit-preview">
                      <FantasyLaneUnitSprite
                        unitId={unit.id}
                        side="player"
                        hpPercent={1}
                        isAttacking={false}
                        animated={false}
                        scale={0.6}
                      />
                    </div>
                    <div className="fantasy-lane-compact-unit-info">
                      <div className="fantasy-lane-compact-unit-row">
                        <span className="fantasy-lane-compact-unit-key">{index + 1}</span>
                        <strong className="fantasy-lane-compact-unit-name">{unit.shortName}</strong>
                      </div>
                      <div className="fantasy-lane-compact-unit-row">
                        <span className="fantasy-lane-compact-unit-tag">{unit.cost}金</span>
                        <span className="fantasy-lane-compact-unit-tag">{unit.pop}人口</span>
                        {cooling && <span className="fantasy-lane-compact-unit-cd">{Math.ceil(state.unitCooldowns[unitId] / 1000)}s</span>}
                      </div>
                      <div className="fantasy-lane-compact-unit-badges">
                        {getUnitBadges(unit).slice(0, 2).map((badge) => (
                          <span key={badge} className="fantasy-lane-compact-unit-badge">{badge}</span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // 展开状态：简化模式
        <>
          {/* 顶部工具栏 */}
          <div className="fantasy-lane-sidebar-toolbar">
            <button type="button" className="fantasy-lane-btn fantasy-lane-btn--muted" onClick={onToggleCollapse}>
              收起
            </button>
          </div>

          {/* 当前关卡和英雄 - 合并到一行 */}
          <section className="fantasy-lane-pick-block fantasy-lane-quick-picks">
            <div className="fantasy-lane-quick-pick-row">
              <div className="fantasy-lane-quick-pick-item">
                <span className="fantasy-lane-quick-pick-label">关卡</span>
                <span className="fantasy-lane-quick-pick-value">{currentLevel.id}</span>
                <button 
                  type="button" 
                  className="fantasy-lane-btn fantasy-lane-btn--small"
                  onClick={() => setIsLevelModalOpen(true)}
                  disabled={!canEditSetup}
                >
                  切换
                </button>
              </div>
              <div className="fantasy-lane-quick-pick-item">
                <span className="fantasy-lane-quick-pick-label">英雄</span>
                <span className="fantasy-lane-quick-pick-value">{currentHero?.name}</span>
                <button 
                  type="button" 
                  className="fantasy-lane-btn fantasy-lane-btn--small"
                  onClick={() => setIsHeroModalOpen(true)}
                  disabled={!canEditSetup}
                >
                  更换
                </button>
              </div>
            </div>
          </section>

          {/* 本局编组 */}
          <section className="fantasy-lane-pick-block fantasy-lane-loadout-section">
            <div className="fantasy-lane-loadout-head">
              <h4>本局编组</h4>
              <strong>{state.loadoutUnitIds.length}/8</strong>
            </div>
            <div className="fantasy-lane-unit-grid fantasy-lane-unit-grid--compact">
              {FANTASY_LANE_UNITS.map((unit) => {
                const active = state.loadoutUnitIds.includes(unit.id);
                const badges = getUnitBadges(unit);
                const details = getUnitDetails(unit);
                
                return (
                  <button
                    key={unit.id}
                    type="button"
                    className={`fantasy-lane-unit-card fantasy-lane-unit-card--compact${active ? ' is-active' : ''}`}
                    onClick={() => onToggleLoadout(unit.id)}
                    disabled={!canEditSetup}
                  >
                    <div className="fantasy-lane-unit-card-header">
                      <div className="fantasy-lane-unit-card-icon">
                        <FantasyLaneUnitSprite
                          unitId={unit.id}
                          side="player"
                          hpPercent={1}
                          isAttacking={false}
                          animated={false}
                          scale={getUnitSpriteScale(unit.footprint) * 0.7}
                        />
                      </div>
                      <div className="fantasy-lane-unit-card-title">
                        <div className="fantasy-lane-unit-card-name-row">
                          <strong>{unit.name}</strong>
                          <span className="fantasy-lane-unit-card-icon-text">{unit.icon}</span>
                        </div>
                        <div className="fantasy-lane-unit-card-tags">
                          <span className={`fantasy-lane-tag fantasy-lane-tag--primary fantasy-lane-tag--role-${unit.role}`}>
                            {badges[0]}
                          </span>
                          <span className="fantasy-lane-tag fantasy-lane-tag--secondary">
                            {badges[1]}
                          </span>
                          {badges.slice(2).map((badge) => (
                            <span key={`${unit.id}-${badge}`} className="fantasy-lane-tag fantasy-lane-tag--feature">
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="fantasy-lane-unit-card-stats">
                      {details.map((detail) => (
                        <span key={`${unit.id}-${detail}`} className="fantasy-lane-unit-stat">
                          <strong>{detail}</strong>
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 阵容风险 */}
          {warnings.length > 0 && (
            <section className="fantasy-lane-warning-list">
              <h4>阵容风险</h4>
              {warnings.map((warning) => <span key={warning} className="fantasy-lane-warning-chip">{warning}</span>)}
            </section>
          )}
        </>
      )}

      {/* 关卡选择弹窗 */}
      <LevelSelectModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        chapters={chapters}
        selectedChapterId={state.selectedChapterId}
        selectedLevelId={state.selectedLevelId}
        getLevelStatus={getLevelStatus}
        canEditSetup={canEditSetup}
        onLevelSelect={onLevelSelect}
      />

      {/* 英雄选择弹窗 */}
      <HeroSelectModal
        isOpen={isHeroModalOpen}
        onClose={() => setIsHeroModalOpen(false)}
        selectedHeroId={state.selectedHeroId}
        canEditSetup={canEditSetup}
        onHeroSelect={onHeroSelect}
      />
    </aside>
  );
};
