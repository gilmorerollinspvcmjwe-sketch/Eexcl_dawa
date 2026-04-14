# Tasks

## Phase 1: 类型定义和存储逻辑
- [ ] Task 1.1: 定义存档类型
  - 创建 SaveSlot 接口
  - 创建 SaveData 接口
  - 文件：`src/types/save.ts`

- [ ] Task 1.2: 实现存档存储逻辑
  - 创建 saveToStorage 函数
  - 创建 loadFromStorage 函数
  - 创建 deleteFromStorage 函数
  - 创建 listSaves 函数
  - 文件：`src/utils/saveStorage.ts`

## Phase 2: 存档管理组件
- [ ] Task 2.1: 创建存档管理 UI
  - 创建 SaveManager 组件
  - 实现新建、保存、加载、删除功能
  - 文件：`src/components/SaveManager.tsx`

- [ ] Task 2.2: 添加存档管理样式
  - 创建 save.css 样式文件
  - 文件：`src/styles/save.css`

## Phase 3: 游戏选择界面
- [ ] Task 3.1: 创建游戏选择 UI
  - 创建 GameSelector 组件
  - 显示游戏列表（PvZ、其他游戏）
  - 文件：`src/components/GameSelector.tsx`

## Phase 4: 主应用路由
- [ ] Task 4.1: 修改 App 组件
  - 添加存档菜单位置（左上角）
  - 添加游戏选择界面路由
  - 实现界面切换逻辑
  - 文件：`src/components/App.tsx`

## Phase 5: 中文化
- [ ] Task 5.1: 界面文本中文化
  - 所有按钮、提示、标签改为中文
  - 文件：所有组件文件

## Phase 6: 测试验证
- [ ] Task 6.1: 编写存档管理测试
  - 测试创建、保存、加载、删除
  - 文件：`tests/saveManager.test.ts`

- [ ] Task 6.2: 验证构建
  - 运行 npm run build
  - 运行 npm test

---

# Task Dependencies
- Task 2.1 depends on Task 1.1, Task 1.2
- Task 3.1 depends on Task 1.1
- Task 4.1 depends on Task 2.1, Task 3.1
- Task 5.1 depends on Task 4.1
- Task 6.1 depends on Task 1.2, Task 2.1
- Task 6.2 depends on Task 5.1

---

# Parallel Execution Plan

## Batch 1: 类型定义和存储逻辑（2 个 agent 并行）
- Agent A: Task 1.1 (存档类型)
- Agent B: Task 1.2 (存储逻辑)

## Batch 2: 存档管理和游戏选择（2 个 agent 并行）
- Agent A: Task 2.1, 2.2 (存档管理 UI + 样式)
- Agent B: Task 3.1 (游戏选择 UI)

## Batch 3: 主应用路由和中文化（2 个 agent 并行）
- Agent A: Task 4.1 (App 路由)
- Agent B: Task 5.1 (中文化)

## Batch 4: 测试验证（1 个 agent）
- Agent A: Task 6.1, 6.2 (测试 + 构建验证)