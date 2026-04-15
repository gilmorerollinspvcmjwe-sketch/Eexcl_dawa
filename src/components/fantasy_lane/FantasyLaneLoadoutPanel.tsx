import React from 'react';
import { getFantasyLaneLevelById, getFantasyLaneLevelsByChapter } from '../../features/fantasy_lane/fantasyLaneLevelCatalog.ts';
import { FANTASY_LANE_HEROES, FANTASY_LANE_TACTICAL_SKILLS, FANTASY_LANE_UNITS } from '../../features/fantasy_lane/fantasyLaneUnitRegistry.ts';
import type { FantasyLaneChapterDefinition, FantasyLaneRuntimeState, FantasyLaneUnitDefinition } from '../../features/fantasy_lane/fantasyLaneTypes.ts';
import { FantasyLaneUnitSprite } from './FantasyLaneUnitSprite';
import {
  ARMOR_CLASS_LABELS,
  FOOTPRINT_LABELS,
  LAYER_LABELS,
  PROFILE_LABELS,
  RANGE_LABELS,
  ROLE_LABELS,
  TARGET_RULE_LABELS,
  formatCooldownMs,
  getUnitSpriteScale,
} from './fantasyLaneUiMeta.ts';

interface FantasyLaneLoadoutPanelProps {
  state: FantasyLaneRuntimeState;
  chapters: FantasyLaneChapterDefinition[];
  selectedTab: 'levels' | 'loadout';
  warnings: string[];
  canEditSetup: boolean;
  getLevelStatus: (levelId: string) => 'completed' | 'unlocked' | 'locked';
  onSelectedTabChange: (tab: 'levels' | 'loadout') => void;
  onLevelSelect: (levelId: string) => void;
  onHeroSelect: (heroId: FantasyLaneRuntimeState['selectedHeroId']) => void;
  onTacticalSelect: (skillId: FantasyLaneRuntimeState['selectedTacticalId']) => void;
  onToggleLoadout: (unitId: string) => void;
  onQueueUnit: (unitId: string) => void;
  onStart: () => void;
  onToggleCollapse: () => void;
  onOpenRoster?: () => void;
  onOpenChapters?: () => void;
  collapsed?: boolean;
}

function getStatusLabel(status: 'completed' | 'unlocked' | 'locked') {
  if (status === 'completed') return '已通关';
  if (status === 'unlocked') return '已解锁';
  return '未解锁';
}

function getUnitBadges(unit: FantasyLaneUnitDefinition) {
  return [
    LAYER_LABELS[unit.layer],
    RANGE_LABELS[unit.rangeBand],
    FOOTPRINT_LABELS[unit.footprint],
    PROFILE_LABELS[unit.damageProfile],
  ];
}

function getUnitDetails(unit: FantasyLaneUnitDefinition) {
  return [
    `${ROLE_LABELS[unit.role]} / ${ARMOR_CLASS_LABELS[unit.armorClass]}`,
    TARGET_RULE_LABELS[unit.targetRule],
    `${unit.cost} 金 / ${formatCooldownMs(unit.cooldownMs)} / 人口 ${unit.pop}`,
  ];
}

export const FantasyLaneLoadoutPanel: React.FC<FantasyLaneLoadoutPanelProps> = ({
  state,
  chapters,
  selectedTab,
  warnings,
  canEditSetup,
  getLevelStatus,
  onSelectedTabChange,
  onLevelSelect,
  onHeroSelect,
  onTacticalSelect,
  onToggleLoadout,
  onQueueUnit,
  onStart,
  onToggleCollapse,
  onOpenRoster,
  onOpenChapters,
  collapsed = false,
}) => {
  const visibleLevels = getFantasyLaneLevelsByChapter(state.selectedChapterId);
  const currentLevel = getFantasyLaneLevelById(state.selectedLevelId);

  return (
    <aside className={`fantasy-lane-sidebar${collapsed ? ' is-collapsed' : ''}`}>
      <div className="fantasy-lane-sidebar-toolbar">
        <div className="fantasy-lane-tabset">
          <button type="button" className={selectedTab === 'levels' ? 'is-active' : ''} onClick={() => onSelectedTabChange('levels')}>关卡</button>
          <button type="button" className={selectedTab === 'loadout' ? 'is-active' : ''} onClick={() => onSelectedTabChange('loadout')}>编组</button>
        </div>
        <button type="button" className="fantasy-lane-btn fantasy-lane-btn--muted" onClick={onToggleCollapse}>
          {collapsed ? '展开' : '收起'}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="fantasy-lane-link-row">
            {onOpenRoster && <button type="button" className="fantasy-lane-link-btn" onClick={onOpenRoster}>Sheet19 兵种与英雄</button>}
            {onOpenChapters && <button type="button" className="fantasy-lane-link-btn" onClick={onOpenChapters}>Sheet20 章节与关卡</button>}
          </div>

          <section className="fantasy-lane-pick-block fantasy-lane-level-summary">
            <div className="fantasy-lane-loadout-head">
              <h4>{currentLevel.id} {currentLevel.name}</h4>
              <strong>{currentLevel.chapterName}</strong>
            </div>
            <p>{currentLevel.description}</p>
            <div className="fantasy-lane-warning-list">
              {currentLevel.recommendedTags.map((tag) => (
                <span key={tag} className="fantasy-lane-warning-chip fantasy-lane-warning-chip--neutral">
                  {tag}
                </span>
              ))}
            </div>
          </section>

          {selectedTab === 'levels' ? (
            <>
              <div className="fantasy-lane-chapter-strip">
                {chapters.map((chapter) => {
                  const chapterEntryLevelId = `${chapter.order}-1`;
                  const status = getLevelStatus(chapterEntryLevelId);
                  const disabled = !canEditSetup || status === 'locked';

                  return (
                    <button
                      key={chapter.id}
                      type="button"
                      className={`fantasy-lane-chip${state.selectedChapterId === chapter.id ? ' is-active' : ''}`}
                      onClick={() => onLevelSelect(chapterEntryLevelId)}
                      disabled={disabled}
                      title={disabled ? '当前不可切换到该章节' : `${chapter.theme} / ${chapter.focus}`}
                    >
                      {chapter.order}. {chapter.name}
                    </button>
                  );
                })}
              </div>

              <div className="fantasy-lane-level-list">
                {visibleLevels.map((level) => {
                  const status = getLevelStatus(level.id);
                  const disabled = !canEditSetup || status === 'locked';

                  return (
                    <button
                      key={level.id}
                      type="button"
                      className={`fantasy-lane-level-card${state.selectedLevelId === level.id ? ' is-active' : ''}`}
                      onClick={() => onLevelSelect(level.id)}
                      disabled={disabled}
                    >
                      <strong>{level.id} {level.name}</strong>
                      <span>{level.description}</span>
                      <small>推荐：{level.recommendedTags.join(' / ')}</small>
                      <small>{getStatusLabel(status)}</small>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <section className="fantasy-lane-pick-block">
                <h4>英雄</h4>
                <div className="fantasy-lane-card-grid">
                  {FANTASY_LANE_HEROES.map((hero) => (
                    <button
                      key={hero.id}
                      type="button"
                      className={`fantasy-lane-mini-card${state.selectedHeroId === hero.id ? ' is-active' : ''}`}
                      onClick={() => onHeroSelect(hero.id)}
                      disabled={!canEditSetup}
                    >
                      <strong>{hero.name}</strong>
                      <span>{hero.summary}</span>
                      <small>{hero.passiveSummary}</small>
                    </button>
                  ))}
                </div>
              </section>

              <section className="fantasy-lane-pick-block">
                <h4>战术技能</h4>
                <div className="fantasy-lane-card-grid">
                  {FANTASY_LANE_TACTICAL_SKILLS.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      className={`fantasy-lane-mini-card${state.selectedTacticalId === skill.id ? ' is-active' : ''}`}
                      onClick={() => onTacticalSelect(skill.id)}
                      disabled={!canEditSetup}
                    >
                      <strong>{skill.name}</strong>
                      <span>{skill.summary}</span>
                      <small>冷却 {formatCooldownMs(skill.cooldownMs)}</small>
                    </button>
                  ))}
                </div>
              </section>

              <section className="fantasy-lane-pick-block">
                <div className="fantasy-lane-loadout-head">
                  <h4>本局编组</h4>
                  <strong>{state.loadoutUnitIds.length}/8</strong>
                </div>
                <div className="fantasy-lane-unit-grid">
                  {FANTASY_LANE_UNITS.map((unit) => {
                    const active = state.loadoutUnitIds.includes(unit.id);
                    return (
                      <button
                        key={unit.id}
                        type="button"
                        className={`fantasy-lane-unit-card${active ? ' is-active' : ''}`}
                        onClick={() => onToggleLoadout(unit.id)}
                        disabled={!canEditSetup}
                      >
                        <div className="fantasy-lane-unit-card-preview">
                          <FantasyLaneUnitSprite
                            unitId={unit.id}
                            side="player"
                            hpPercent={1}
                            isAttacking={false}
                            animated={false}
                            scale={getUnitSpriteScale(unit.footprint)}
                          />
                        </div>
                        <div className="fantasy-lane-unit-card-body">
                          <div className="fantasy-lane-unit-card-head">
                            <strong>{unit.name}</strong>
                            <small>{unit.shortName}</small>
                          </div>
                          <div className="fantasy-lane-unit-flags">
                            {getUnitBadges(unit).map((badge) => (
                              <span key={`${unit.id}-${badge}`}>{badge}</span>
                            ))}
                          </div>
                          <span>{unit.summary}</span>
                          <div className="fantasy-lane-unit-facts">
                            {getUnitDetails(unit).map((detail) => (
                              <small key={`${unit.id}-${detail}`}>{detail}</small>
                            ))}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="fantasy-lane-warning-list">
                <h4>阵容风险</h4>
                {warnings.length > 0
                  ? warnings.map((warning) => <span key={warning} className="fantasy-lane-warning-chip">{warning}</span>)
                  : <span className="fantasy-lane-warning-chip fantasy-lane-warning-chip--ok">结构完整</span>}
              </section>
            </>
          )}

          {state.phase === 'setup' ? (
            <button type="button" className="fantasy-lane-btn fantasy-lane-btn--primary fantasy-lane-start-btn" onClick={onStart}>
              开始战线推进
            </button>
          ) : (
            <section className="fantasy-lane-pick-block">
              <div className="fantasy-lane-loadout-head">
                <h4>出兵指令</h4>
                <strong>{state.queue.length}/{state.queueLimit}</strong>
              </div>
              <div className="fantasy-lane-queue-list">
                {state.queue.length > 0 ? (
                  state.queue.map((unitId, index) => (
                    <span key={`${unitId}-${index}`} className="fantasy-lane-warning-chip fantasy-lane-warning-chip--neutral">
                      {index + 1}. {FANTASY_LANE_UNITS.find((item) => item.id === unitId)?.shortName ?? unitId}
                    </span>
                  ))
                ) : (
                  <span className="fantasy-lane-warning-chip fantasy-lane-warning-chip--neutral">队列为空</span>
                )}
              </div>
              <div className="fantasy-lane-unit-grid fantasy-lane-unit-grid--compact">
                {state.loadoutUnitIds.map((unitId, index) => {
                  const unit = FANTASY_LANE_UNITS.find((item) => item.id === unitId);
                  if (!unit) return null;
                  const cooling = state.unitCooldowns[unitId] > 0;
                  const disabled = state.phase !== 'playing' || cooling || state.gold < unit.cost || state.queue.length >= state.queueLimit;

                  return (
                    <button
                      key={unit.id}
                      type="button"
                      className={`fantasy-lane-unit-card fantasy-lane-unit-card--compact${cooling ? ' is-cooling' : ''}`}
                      onClick={() => onQueueUnit(unit.id)}
                      disabled={disabled}
                    >
                      <div className="fantasy-lane-unit-card-preview fantasy-lane-unit-card-preview--compact">
                        <FantasyLaneUnitSprite
                          unitId={unit.id}
                          side="player"
                          hpPercent={1}
                          isAttacking={false}
                          animated={false}
                          scale={Math.max(0.72, getUnitSpriteScale(unit.footprint) * 0.9)}
                        />
                      </div>
                      <div className="fantasy-lane-unit-card-body">
                        <div className="fantasy-lane-unit-card-head">
                          <strong>{index + 1}. {unit.shortName}</strong>
                          <small>{unit.cost} 金</small>
                        </div>
                        <span>{ROLE_LABELS[unit.role]} / 人口 {unit.pop}</span>
                        <div className="fantasy-lane-unit-facts">
                          <small>{cooling ? `${Math.ceil(state.unitCooldowns[unitId] / 1000)}s 冷却` : '可下达'}</small>
                          <small>{unit.signature}</small>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </aside>
  );
};
