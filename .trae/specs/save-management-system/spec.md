# 存档管理系统 Spec

## Why
当前应用缺少统一的存档管理功能，玩家无法在不同游戏之间切换或保存进度。需要实现一个完整的存档管理系统，支持多游戏类型的存档创建、保存、加载和删除，并提供清晰的游戏选择和界面切换流程。

## What Changes
- 新增存档管理模块：支持创建、保存、加载、删除存档
- 新增游戏选择界面：展示多种游戏类型供选择
- 修改主界面布局：左上角添加文件菜单管理存档
- 修改界面切换逻辑：选择游戏后仅显示该游戏的核心界面
- 所有界面文本和提示改为中文

## Impact
- Affected specs: 新增存档管理、游戏选择、界面路由
- Affected code:
  - `src/types/save.ts` - 存档类型定义
  - `src/utils/saveStorage.ts` - 存档存储逻辑
  - `src/components/SaveManager.tsx` - 存档管理组件
  - `src/components/GameSelector.tsx` - 游戏选择界面
  - `src/components/App.tsx` - 主应用路由
  - `src/styles/save.css` - 存档管理样式

---

## ADDED Requirements

### Requirement: 存档管理
系统应提供存档的创建、保存、加载和删除功能。

#### Scenario: 创建新存档
- **WHEN** 用户点击"新建存档"
- **THEN** 系统创建新存档，显示存档列表

#### Scenario: 保存存档
- **WHEN** 用户点击"保存"
- **THEN** 系统保存当前游戏进度到当前存档

#### Scenario: 加载存档
- **WHEN** 用户选择存档并点击"加载"
- **THEN** 系统加载该存档的游戏进度

#### Scenario: 删除存档
- **WHEN** 用户选择存档并点击"删除"
- **THEN** 系统删除该存档，显示确认提示

---

### Requirement: 游戏选择界面
系统应提供游戏选择界面，展示多种游戏类型。

#### Scenario: 显示游戏列表
- **WHEN** 用户点击"开始"按钮
- **THEN** 系统显示游戏选择界面，列出所有可用游戏

#### Scenario: 选择游戏
- **WHEN** 用户点击某一游戏
- **THEN** 系统进入该游戏的核心界面

---

### Requirement: 界面切换逻辑
选择游戏后，系统应仅显示该游戏的核心界面。

#### Scenario: 进入游戏
- **WHEN** 用户选择游戏
- **THEN** 系统显示游戏主页和配置页面，隐藏其他无关内容

#### Scenario: 返回主菜单
- **WHEN** 用户点击"返回"
- **THEN** 系统返回游戏选择界面

---

### Requirement: 中文界面
所有界面元素、文本提示及交互反馈均应使用中文。

#### Scenario: 界面文本
- **WHEN** 用户查看任何界面
- **THEN** 所有文本均为中文

---

## MODIFIED Requirements

### Requirement: 主界面布局
主界面左上角应添加文件菜单，用于管理存档。

**原布局**：
- 顶部显示游戏标题

**新布局**：
- 左上角显示文件菜单（新建、保存、加载、删除）
- 顶部显示游戏标题
- 中央显示"开始"按钮

---

## REMOVED Requirements

### Requirement: 无
无移除需求。