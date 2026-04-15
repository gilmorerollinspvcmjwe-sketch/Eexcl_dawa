# 存档管理系统 Spec

## Why
当前应用缺少存档管理功能，玩家无法保存和加载游戏进度。同时，游戏选择界面与游戏主界面混杂，需要清晰的界面切换逻辑。

## What Changes
- 新增存档管理系统：创建、保存、加载、删除存档
- 复用现有"文件(F)"按钮：添加下拉菜单显示存档管理选项
- 复用现有"开始"按钮：添加下拉菜单引导用户进入新游戏选择界面
- 重构界面切换逻辑：选择游戏后只显示该游戏的核心界面
- **BREAKING**：移除 GameSelector 组件，改用文件/开始菜单导航

## Impact
- Affected specs: 新增 save-management-system
- Affected code:
  - `src/components/ExcelHeader.tsx` - 添加文件/开始菜单
  - `src/components/SaveManager.tsx` - 存档管理组件
  - `src/utils/saveStorage.ts` - 存档存储逻辑
  - `src/types/save.ts` - 存档类型定义
  - `src/App.tsx` - 界面切换逻辑重构
  - `src/styles/save.css` - 存档管理样式

---

## ADDED Requirements

### Requirement: 存档管理系统
系统应提供完整的存档管理功能，支持创建、保存、加载和删除操作。

#### Scenario: 创建新存档
- **WHEN** 用户点击"文件" → "新建存档"
- **THEN** 系统创建新存档，显示存档名称输入框

#### Scenario: 保存存档
- **WHEN** 用户点击"文件" → "保存"
- **THEN** 系统保存当前游戏进度到当前存档

#### Scenario: 加载存档
- **WHEN** 用户点击"文件" → "加载存档" → 选择存档
- **THEN** 系统加载选中存档的游戏进度

#### Scenario: 删除存档
- **WHEN** 用户点击"文件" → "删除存档" → 选择存档 → 确认
- **THEN** 系统删除选中存档

---

### Requirement: 文件菜单
左上角应显示"文件(F)"按钮，点击后显示下拉菜单。

#### Scenario: 文件菜单显示
- **WHEN** 用户点击"文件(F)"
- **THEN** 显示下拉菜单，包含：新建存档、保存、加载存档、删除存档

#### Scenario: 快捷键支持
- **WHEN** 用户按下 Alt+F
- **THEN** 打开文件菜单

---

### Requirement: 开始菜单
"开始"按钮应引导用户进入新游戏选择界面。

#### Scenario: 开始菜单显示
- **WHEN** 用户点击"开始"
- **THEN** 显示游戏选择界面，提供多种游戏类型

#### Scenario: 游戏选择
- **WHEN** 用户选择某一游戏
- **THEN** 系统切换到该游戏的核心界面（游戏主页面 + 游戏配置页面）

---

### Requirement: 界面切换逻辑
选择游戏后，系统应只显示该游戏的核心界面。

#### Scenario: 游戏主界面
- **WHEN** 用户选择游戏后
- **THEN** 显示游戏主页面和游戏配置页面，隐藏其他无关内容

#### Scenario: 返回主菜单
- **WHEN** 用户点击"文件" → "返回主菜单"
- **THEN** 系统返回游戏选择界面

---

### Requirement: 中文界面
所有界面元素、文本提示及交互反馈均应使用中文显示。

#### Scenario: 菜单文本
- **WHEN** 显示菜单
- **THEN** 所有菜单项使用中文（文件、开始、新建存档、保存等）

#### Scenario: 提示信息
- **WHEN** 显示提示
- **THEN** 所有提示信息使用中文

---

## MODIFIED Requirements

### Requirement: ExcelHeader 组件
ExcelHeader 组件应包含文件菜单和开始菜单。

**原结构**：
```typescript
interface ExcelHeaderProps {
  isHidden: boolean;
  onToggleHide: () => void;
}
```

**新结构**：
```typescript
interface ExcelHeaderProps {
  isHidden: boolean;
  onToggleHide: () => void;
  onNewGame: () => void;
  onSave: () => void;
  onLoad: () => void;
  onDelete: () => void;
}
```

---

## REMOVED Requirements

### Requirement: GameSelector 组件
**Reason**：改用文件/开始菜单导航，GameSelector 组件不再需要。
**Migration**：游戏选择逻辑迁移到"开始"菜单。