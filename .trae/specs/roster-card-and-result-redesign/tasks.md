# Tasks
- [x] Task 1: 兵种卡片改为可展开/收起设计
  - [x] SubTask 1.1: 在 FantasyLaneRosterSheet 组件中添加 `expandedUnitIds` 状态（Set<string>），管理展开的卡片 ID
  - [x] SubTask 1.2: 修改 renderUnitCard 函数，添加点击事件处理，切换卡片展开/收起状态
  - [x] SubTask 1.3: 重构卡片布局：
    - 默认显示：头像、名称、标签、描述、核心数值（费用/人口/冷却/伤害/血量/护甲，6 项）
    - 展开显示：详细属性（伤害类型、护甲类型、护甲级别、索敌、最小射程、弹道、碰撞、AOE、签名，9 项）
    - 添加展开/收起指示器（▼/▶ 图标）
  - [x] SubTask 1.4: 添加 CSS 样式：
    - `.fantasy-lane-unit-card--expanded` 展开状态样式
    - `.fantasy-lane-unit-details` 详细属性区域样式（带过渡动画）
    - `.fantasy-lane-expand-indicator` 展开指示器样式

- [x] Task 2: 英雄表格增加图标展示
  - [x] SubTask 2.1: 在 FantasyLaneRosterSheet.tsx 中添加英雄图标映射常量
  - [x] SubTask 2.2: 修改英雄表格渲染（第 466 行），在名称前显示图标
  - [x] SubTask 2.3: 添加 CSS 样式

- [x] Task 3: 战术技能表格增加图标展示
  - [x] SubTask 3.1: 在 FantasyLaneRosterSheet.tsx 中添加战术技能图标映射常量
  - [x] SubTask 3.2: 修改战术表格渲染（第 486 行），在名称前显示图标
  - [x] SubTask 3.3: 添加 CSS 样式

- [x] Task 4: 战后战报重新设计
  - [x] SubTask 4.1: 重构 FantasyLaneResultPanel.tsx 数据结构
  - [x] SubTask 4.2: 实现核心数据区（替换原 overall 行）
  - [x] SubTask 4.3: 实现编组表现区（新增）
  - [x] SubTask 4.4: 实现经济分析区（替换原 bases 行）
  - [x] SubTask 4.5: 简化技能使用区（保留原 skills 行）
  - [x] SubTask 4.6: 优化奖励区视觉展示
  - [x] SubTask 4.7: 添加失败原因提示（仅失败时显示）
  - [x] SubTask 4.8: 更新 CSS 样式，支持新战报布局
  - [ ] SubTask 4.1: 重构 FantasyLaneResultPanel.tsx 数据结构：
    - 删除 `ResultRowData` 和 `ResultCellData` 接口（过于复杂）
    - 删除 `rows` 数组和 `makeCell` 函数
    - 删除"压制"行（196-222 行）
  - [ ] SubTask 4.2: 实现核心数据区（替换原 overall 行）：
    ```tsx
    <div className="fantasy-lane-result-core-stats">
      <div className="fantasy-lane-result-stat">
        <span className="fantasy-lane-result-stat-label">时间</span>
        <strong>{formatMsToClock(state.elapsedMs)}</strong>
        <span className="fantasy-lane-result-stat-sub">时限 {formatMsToClock(currentLevel.battleTimeLimitMs)}</span>
      </div>
      <div className="fantasy-lane-result-stat">
        <span className="fantasy-lane-result-stat-label">得分</span>
        <strong>{(state.result?.score ?? 0).toLocaleString()}</strong>
        <span className="fantasy-lane-result-stat-sub">星级 {renderStars(state.result?.stars ?? 1)}</span>
      </div>
      <div className="fantasy-lane-result-stat">
        <span className="fantasy-lane-result-stat-label">剩余 HP</span>
        <strong>{state.playerBaseHp}/{state.playerBaseHpMax}</strong>
        <span className="fantasy-lane-result-stat-sub">{playerBaseRemainPercent}%</span>
      </div>
    </div>
    ```
  - [ ] SubTask 4.3: 实现编组表现区（新增）：
    - 从 `state.loadoutUnitIds` 获取本局编组
    - 显示每个兵种的图标、名称、出兵次数（需要从 state.stats 获取，如果没有则显示"-"）
    - 使用网格布局，每个兵种一个卡片
  - [ ] SubTask 4.4: 实现经济分析区（替换原 bases 行）：
    ```tsx
    <div className="fantasy-lane-result-economy">
      <div className="fantasy-lane-result-economy-item">
        <span>金币花费</span>
        <strong>{Math.round(state.stats.goldSpent).toLocaleString()}</strong>
      </div>
      <div className="fantasy-lane-result-economy-item">
        <span>剩余金币</span>
        <strong>{Math.round(state.gold).toLocaleString()}</strong>
      </div>
      <div className="fantasy-lane-result-economy-item">
        <span>人口利用率</span>
        <strong>{Math.round((state.activePop / Math.max(1, state.popLimit)) * 100)}%</strong>
      </div>
    </div>
    ```
  - [ ] SubTask 4.5: 简化技能使用区（保留原 skills 行）：
    ```tsx
    <div className="fantasy-lane-result-skills">
      <div className="fantasy-lane-result-skill-item">
        <span>英雄技</span>
        <strong>{state.stats.heroSkillCast} 次</strong>
      </div>
      <div className="fantasy-lane-result-skill-item">
        <span>战术技</span>
        <strong>{state.stats.tacticalSkillCast} 次</strong>
      </div>
      <div className="fantasy-lane-result-skill-item">
        <span>拥堵时间</span>
        <strong>{formatSeconds(state.stats.congestionMs)}</strong>
      </div>
    </div>
    ```
  - [ ] SubTask 4.6: 优化奖励区视觉展示：
    - 保持原有结构（290-331 行）
    - 增加卡片样式，让通关解锁和本局掉落更清晰
    - 如果有新解锁兵种，添加"NEW"标签
  - [ ] SubTask 4.7: 添加失败原因提示（仅失败时显示）：
    ```tsx
    {state.phase === 'lost' && (
      <div className="fantasy-lane-result-failure-tips">
        <h4>失败原因</h4>
        <ul>
          {playerBaseHp < state.playerBaseHpMax * 0.3 && <li>基地血量过低，需要加强防守</li>}
          {state.stats.gold > state.stats.goldSpent * 0.5 && <li>金币剩余过多，建议增加出兵频率</li>}
          {state.stats.antiAirSummons === 0 && <li>没有对空单位，建议编组对空兵种</li>}
        </ul>
      </div>
    )}
    ```
  - [ ] SubTask 4.8: 更新 CSS 样式，支持新战报布局：
    - `.fantasy-lane-result-core-stats` 核心数据区样式（grid 布局，3 列）
    - `.fantasy-lane-result-stat` 单个数据项样式
    - `.fantasy-lane-result-economy` 经济分析区样式
    - `.fantasy-lane-result-skills` 技能使用区样式
    - `.fantasy-lane-result-deployment` 编组表现区样式
    - `.fantasy-lane-result-failure-tips` 失败提示样式

# Task Dependencies
- Task 2 和 Task 3 可以并行执行
- Task 4 可以独立执行，不依赖其他任务
