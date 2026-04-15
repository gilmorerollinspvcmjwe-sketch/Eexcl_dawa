# Dynamic Workbook Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把当前项目从“为少数游戏硬编码 sheet 和菜单逻辑”升级成一个可持续扩展到几十个游戏的动态 Excel 工作簿游戏平台。

**Architecture:** 固定 `Sheet1` 作为总入口，所有游戏通过统一的 `ArcadeModuleRegistry` 和 `WorkbookWorkspaceRegistry` 注册自己的主页面、配置页面、附加页面与存档适配器。App 层不再按单个游戏写死切换逻辑，而是读取注册信息动态装载工作区、菜单和可见 sheet。

**Tech Stack:** React 19、TypeScript、Vite、现有 workbook shell、localStorage 持久化、现有各游戏 feature 模块

---

## 1. 架构目标

当前代码已经有：
- `ExcelHeader`
- `SaveManager`
- `GameSelector`
- `workbookRegistry`
- 各游戏独立 sheet

但还停留在“少量游戏人工拼接”的阶段。这个计划的目标是把它提升成真正的 **动态游戏平台内核**。

### 目标结果

1. `Sheet1` 永远是总入口
2. 左上角固定两个下拉：
   - 文件
   - 开始
3. “开始”永远进入 **游戏选择**
4. 选择游戏后，根据注册表动态切换工作区
5. 每个游戏只显示自己的：
   - 主页面
   - 配置页面
   - 以及它声明需要的附加页
6. 新增游戏时，主流程不改，只需要：
   - 注册模块
   - 注册工作区
   - 注册存档适配器

---

## 2. 文件结构与职责

### 新增文件

- `src/features/workbook/workspaceRegistry.ts`
  - 统一描述每个游戏工作区包含哪些 sheet、主页面和配置页面是什么

- `src/features/workbook/workspaceState.ts`
  - 提供“当前工作区可见哪些 sheet”的纯逻辑

- `src/features/save/saveAdapters.ts`
  - 统一定义：
    - 创建新存档
    - 导出当前状态
    - 从存档恢复

- `tests/workspaceRegistry.test.ts`
  - 验证动态工作区注册逻辑

- `tests/saveAdapters.test.ts`
  - 验证统一存档适配层

### 重点修改文件

- `src/features/workbook/workbookRegistry.ts`
  - 从“只有游戏概览”升级为“可挂动态工作区元数据的模块注册表”

- `src/components/ExcelHeader.tsx`
  - 文件/开始菜单固定保留
  - 只负责菜单交互，不写死业务分支

- `src/components/SheetTabs.tsx`
  - 只接受“当前工作区可见 sheet 列表”
  - 不再假设所有 sheet 永远都显示

- `src/components/SaveManager.tsx`
  - 只做统一存档面板
  - 根据工作区上下文显示当前游戏相关存档

- `src/components/GameSelector.tsx`
  - 读取注册表动态显示游戏，而不是手写静态列表

- `src/App.tsx`
  - 变成真正的工作簿调度器：
    - 当前工作区
    - 当前激活游戏
    - 当前存档槽
    - 当前可见 sheet

---

## 3. 注册层设计

### 3.1 ArcadeModuleRegistry

当前 registry 只够做首页入口摘要，下一步要扩成：

```ts
interface ArcadeModuleDefinition {
  id: ArcadeGameId;
  title: string;
  summary: string;
  accent: string;
  supportsResume: boolean;
  supportsSave: boolean;
  entrySheetId: AppSheetId;
  defaultConfigSheetId: AppSheetId;
}
```

### 3.2 WorkbookWorkspaceRegistry

每个游戏工作区都应明确声明：

```ts
interface WorkbookWorkspaceDefinition {
  gameId: ArcadeGameId;
  mainSheetId: AppSheetId;
  configSheetId: AppSheetId;
  extraSheetIds: AppSheetId[];
  visibleSheetIds: AppSheetId[];
}
```

例如：

```ts
{
  gameId: 'pvz',
  mainSheetId: 'pvz',
  configSheetId: 'pvz_lab',
  extraSheetIds: ['pvz_collection'],
  visibleSheetIds: ['hub', 'pvz', 'pvz_lab', 'pvz_collection'],
}
```

这层是后续支持几十个游戏的核心。

---

## 4. 存档层设计

### 4.1 统一 SaveData

`SaveData` 不能再只是临时对象，要扩成：

```ts
interface SaveData {
  gameType: ArcadeGameId;
  currentSheet: AppSheetId;
  workspaceId: ArcadeGameId;
  payload: Record<string, unknown>;
}
```

### 4.2 SaveAdapter

每个游戏必须走适配器注册，不许在 App 里散落 if/else：

```ts
interface SaveAdapter {
  gameId: ArcadeGameId;
  createNewSave(name: string): SaveSlot;
  serialize(state: unknown): SaveData;
  deserialize(data: SaveData): unknown;
}
```

至少第一轮完整接：
- `pvz`
- `perler`

其他游戏先接轻量版：
- `snake`
- `tetris`
- `pacman`
- `zuma`
- `match3`

---

## 5. 执行任务

### Task 1: 把工作区逻辑从手写 if/else 升级成动态注册

**Files:**
- Create: `src/features/workbook/workspaceRegistry.ts`
- Create: `src/features/workbook/workspaceState.ts`
- Create: `tests/workspaceRegistry.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { getWorkspaceByGame, getVisibleSheetsForWorkspace } from '../src/features/workbook/workspaceState.ts';

test('pvz workspace resolves from registry', () => {
  const workspace = getWorkspaceByGame('pvz');
  assert.equal(workspace.mainSheetId, 'pvz');
  assert.equal(workspace.configSheetId, 'pvz_lab');
});

test('perler workspace visibility is registry-driven', () => {
  assert.deepEqual(getVisibleSheetsForWorkspace('perler'), ['hub', 'perler', 'config']);
});
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```bash
npm test -- --test-name-pattern="workspace resolves from registry|visibility is registry-driven"
```

Expected: FAIL

- [ ] **Step 3: Implement minimal registry**

Create `workspaceRegistry.ts` with one definition per game:
- `aim`
- `perler`
- `pvz`
- `snake`
- `tetris`
- `pacman`
- `zuma`
- `match3`

Create `workspaceState.ts`:

```ts
import { WORKSPACE_REGISTRY } from './workspaceRegistry.ts';
import type { ArcadeGameId, AppSheetId } from './workbookRegistry.ts';

export function getWorkspaceByGame(gameId: ArcadeGameId) {
  return WORKSPACE_REGISTRY[gameId];
}

export function getVisibleSheetsForWorkspace(gameId: ArcadeGameId): AppSheetId[] {
  return WORKSPACE_REGISTRY[gameId].visibleSheetIds;
}
```

- [ ] **Step 4: Run tests**

Run:

```bash
npm test
```

Expected: PASS

---

### Task 2: 让游戏选择器真正动态读取注册表

**Files:**
- Modify: `src/components/GameSelector.tsx`
- Modify: `src/features/workbook/workbookRegistry.ts`

- [ ] **Step 1: Add a failing selector test**

Create a test asserting that `GameSelector` source data does not come from hardcoded local array, but from registry helpers.

- [ ] **Step 2: Replace static game list**

`GameSelector.tsx` should read:
- `ARCADE_MODULE_REGISTRY`

Display fields:
- 中文标题
- 中文说明
- 图标

Do not keep a separate hardcoded `GAMES` list.

- [ ] **Step 3: Run verification**

Run:

```bash
npm run build
```

Expected: PASS

---

### Task 3: 让 SheetTabs 只显示当前工作区需要的 sheet

**Files:**
- Modify: `src/components/SheetTabs.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add failing pure test**

Use `workspaceState.test.ts` or a new test to verify:
- selecting `pvz` shows only PvZ workspace sheets
- selecting `perler` shows only Perler workspace sheets

- [ ] **Step 2: Pass `visibleSheets` into tabs**

`SheetTabs` interface should become:

```ts
interface SheetTabsProps {
  currentSheet: AppSheetId;
  visibleSheets: AppSheetId[];
  onSwitch: (sheet: AppSheetId) => void;
  isHidden: boolean;
}
```

Implementation:
- filter `SHEET_REGISTRY` by `visibleSheets`

- [ ] **Step 3: App computes visible sheets dynamically**

App should derive:

```ts
const visibleSheets =
  workspaceGameId ? getVisibleSheetsForWorkspace(workspaceGameId) : ['hub'];
```

- [ ] **Step 4: Run verification**

Run:

```bash
npm test
npm run build
```

Expected: PASS

---

### Task 4: 把 App 层改成真正的工作区调度器

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add explicit workspace state**

App-level state:

```ts
const [workspaceGameId, setWorkspaceGameId] = useState<ArcadeGameId | null>(null);
const [currentSaveSlot, setCurrentSaveSlot] = useState<SaveSlot | null>(null);
```

- [ ] **Step 2: Route game entry through workspace registry**

Replace scattered direct-start logic with:

```ts
function enterGameWorkspace(gameId: ArcadeGameId) {
  const workspace = getWorkspaceByGame(gameId);
  setWorkspaceGameId(gameId);
  setActiveArcadeGame(gameId);
  switchSheet(workspace.mainSheetId);
}
```

- [ ] **Step 3: Route config page through workspace registry**

Provide helper:

```ts
function openWorkspaceConfig(gameId: ArcadeGameId) {
  const workspace = getWorkspaceByGame(gameId);
  switchSheet(workspace.configSheetId);
}
```

- [ ] **Step 4: Gate unrelated pages**

Only render non-hub pages when:
- they are in `visibleSheets`

If user tries to land on a sheet outside current workspace, bounce back to the workspace main sheet.

- [ ] **Step 5: Verify**

Run:

```bash
npm test
npm run build
```

Expected: PASS

---

### Task 5: 把文件菜单接到统一存档系统

**Files:**
- Modify: `src/types/save.ts`
- Modify: `src/utils/saveStorage.ts`
- Create: `src/features/save/saveAdapters.ts`
- Create: `tests/saveAdapters.test.ts`
- Modify: `src/components/SaveManager.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add the failing save adapter test**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkbookSaveData } from '../src/features/save/saveAdapters.ts';

test('save adapter stores workspace and game metadata', () => {
  const data = createWorkbookSaveData({
    gameType: 'pvz',
    currentSheet: 'pvz',
    workspaceId: 'pvz',
    payload: { chapterId: 'day', sun: 150 },
  });

  assert.equal(data.gameType, 'pvz');
  assert.equal(data.workspaceId, 'pvz');
  assert.equal(data.currentSheet, 'pvz');
});
```

- [ ] **Step 2: Extend SaveData**

Add:
- `workspaceId`
- `gameType`
- `currentSheet`
- `payload`

- [ ] **Step 3: Add `listSavesByGame` and overwrite-save support**

`saveStorage.ts` should support:
- `listSavesByGame(gameType)`
- `saveToStorage(slot, { overwrite?: boolean })`

- [ ] **Step 4: Add adapters**

At minimum:
- `pvz`
- `perler`

Light adapters:
- `snake`
- `tetris`
- `pacman`
- `zuma`
- `match3`

- [ ] **Step 5: SaveManager only shows current-game saves by default**

Requirements:
- 中文文案
- 当前游戏过滤
- 当前存档高亮
- 删除确认
- 新建存档名称输入

- [ ] **Step 6: App wires File menu**

Map:
- 新建存档
- 保存
- 加载存档
- 删除存档

through `currentSaveSlot` and current workspace adapter.

- [ ] **Step 7: Verify**

Run:

```bash
npm test
npm run build
```

Expected: PASS

---

### Task 6: 让“开始”统一进入动态游戏选择，而不是直达某个游戏

**Files:**
- Modify: `src/components/ExcelHeader.tsx`
- Modify: `src/components/GameSelector.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Header remains generic**

`ExcelHeader` should only emit:
- `onGameSelect`

Do not let it know any конкретные game ids.

- [ ] **Step 2: GameSelector returns selected registry game id**

The selector becomes:
- registry-driven
- Chinese-only
- workbook-platform neutral

- [ ] **Step 3: App owns transition**

When user picks a game:

```ts
enterGameWorkspace(gameId);
```

No direct sheet hardcoding inside the selector.

- [ ] **Step 4: Verify**

Run:

```bash
npm run build
```

Expected: PASS

---

### Task 7: 为几十个游戏的后续扩展留接口，不留死路

**Files:**
- Modify: `src/features/workbook/workbookRegistry.ts`
- Modify: `src/features/workbook/workspaceRegistry.ts`
- Modify: `src/features/save/saveAdapters.ts`

- [ ] **Step 1: Extend module metadata**

Each module should support:
- `entrySheetId`
- `defaultConfigSheetId`
- `supportsSave`
- `supportsResume`

- [ ] **Step 2: Add comments and docs**

At the top of each registry/adapters file, write Chinese comments explaining:
- how to add a new game
- where to register sheets
- where to register save adapter

- [ ] **Step 3: Keep new-game onboarding to 3 edits**

Adding a new game in the future should only require:
1. register module
2. register workspace
3. register save adapter

If implementation still requires touching many unrelated files, refactor before finishing.

---

### Task 8: Final verification

**Files:**
- Modify touched files only if needed

- [ ] **Step 1: Run verification**

Run:

```bash
npm test
npm run build
```

- [ ] **Step 2: Manual checklist**

确认：
- 左上角两个下拉仍然是 Excel 风格
- 文件菜单可管理存档
- 开始菜单进入游戏选择
- 选中一个游戏后，只显示这个游戏工作区的 sheet
- `Sheet1` 永远是总入口
- 增加新游戏时不需要在 App 里堆更多 if/else
- 所有用户可见文本为中文

