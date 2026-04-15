# Tasks

## Phase 1: 类型定义和存储逻辑
- [x] Task 1.1: 定义存档类型
  - 创建 SaveSlot 接口（id, name, gameType, timestamp, data）
  - 创建 SaveData 接口（游戏状态数据）
  - 文件：`src/types/save.ts`

- [x] Task 1.2: 实现存档存储逻辑
  - 创建 saveToStorage 函数（保存到 localStorage）
  - 创建 loadFromStorage 函数（从 localStorage 加载）
  - 创建 deleteFromStorage 函数（删除存档）
  - 创建 listSaves 函数（列出所有存档）
  - 文件：`src/utils/saveStorage.ts`

## Phase 2: 存档管理组件
- [x] Task 2.1: 创建存档管理对话框
  - 显示存档列表
  - 支持新建、加载、删除操作
  - 文件：`src/components/SaveManager.tsx`

- [x] Task 2.2: 创建游戏选择界面
  - 显示可用游戏列表（PvZ、贪吃蛇、俄罗斯方块等）
  - 点击游戏后切换到对应界面
  - 文件：`src/components/GameSelector.tsx`

## Phase 3: ExcelHeader 菜单集成
- [x] Task 3.1: 添加文件菜单下拉功能
  - 复用现有"文件(F)"按钮
  - 点击后显示下拉菜单：新建存档、保存、加载存档、删除存档
  - 文件：`src/components/ExcelHeader.tsx`

- [x] Task 3.2: 添加开始菜单下拉功能
  - 复用现有"开始"按钮
  - 点击后显示下拉菜单：游戏选择界面
  - 文件：`src/components/ExcelHeader.tsx`

## Phase 4: App.tsx 界面切换逻辑
- [x] Task 4.1: 重构界面状态管理
  - 添加 currentGame 状态
  - 添加 showGameSelector 状态
  - 添加 saveManager 状态
  - 文件：`src/App.tsx`

- [x] Task 4.2: 实现界面切换
  - 选择游戏后只显示该游戏的核心界面
  - 隐藏无关内容
  - 文件：`src/App.tsx`

## Phase 5: 样式和中文本地化
- [x] Task 5.1: 添加存档管理样式
  - 存档列表样式
  - 对话框样式
  - 文件：`src/styles/save.css`

- [x] Task 5.2: 中文本地化
  - 所有菜单项使用中文
  - 所有提示信息使用中文
  - 文件：各组件文件

## Phase 6: 测试验证
- [ ] Task 6.1: 编写存档管理测试
  - 测试创建、保存、加载、删除
  - 文件：`tests/saveStorage.test.ts`

- [ ] Task 6.2: 验证构建和测试
  - npm run build 通过
  - npm test 通过

---

# Task Dependencies
- Task 2.1 depends on Task 1.1, Task 1.2
- Task 2.2 depends on Task 1.1
- Task 3.1 depends on Task 2.1
- Task 3.2 depends on Task 2.2
- Task 4.1 depends on Task 3.1, Task 3.2
- Task 4.2 depends on Task 4.1
- Task 5.1 depends on Task 2.1
- Task 5.2 depends on Task 3.1, Task 3.2
- Task 6.1 depends on Task 1.2
- Task 6.2 depends on Task 6.1

---

# Parallel Execution Plan

## Batch 1: 类型和存储（2 个 agent 并行）
- Agent A: Task 1.1 (存档类型)
- Agent B: Task 1.2 (存储逻辑)

## Batch 2: 组件开发（2 个 agent 并行）
- Agent A: Task 2.1 (存档管理对话框)
- Agent B: Task 2.2 (游戏选择界面)

## Batch 3: 菜单集成（2 个 agent 并行）
- Agent A: Task 3.1 (文件菜单)
- Agent B: Task 3.2 (开始菜单)

## Batch 4: 界面切换（2 个 agent 并行）
- Agent A: Task 4.1 (状态管理)
- Agent B: Task 4.2 (界面切换)

## Batch 5: 样式和本地化（2 个 agent 并行）
- Agent A: Task 5.1 (样式)
- Agent B: Task 5.2 (中文本地化)

## Batch 6: 测试验证（2 个 agent 并行）
- Agent A: Task 6.1 (存档测试)
- Agent B: Task 6.2 (构建验证)