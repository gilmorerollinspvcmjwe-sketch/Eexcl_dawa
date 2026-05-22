# 架构说明

## 总体结构

- `src/App.tsx`：统一切换各个 Sheet，并把公式栏、状态栏、游戏快照和保存入口串起来。
- `src/features/workbook/`：维护工作簿里的 Sheet 注册、工作区可见范围和游戏模块注册。
- `src/features/save/`：统一处理存档槽、工作簿快照和模块初始载荷。
- `src/components/`：每个游戏的页面壳层组件。
- `src/features/<game>/`：每个游戏的状态层、规则、目录和存档逻辑。

## 2048 模块

- `src/features/game2048/game2048BoardState.ts`：2048 的核心规则，负责建盘、滑动、合并、生成新块、胜负判断和继续挑战。
- `src/features/game2048/game2048Storage.ts`：2048 的轻存档，记录最高分、最高块和当前局快照。
- `src/components/game2048/Game2048Sheet.tsx`：2048 的单 Sheet 页面，负责棋盘、按钮、键盘控制和结果层展示。
- `src/styles/game2048.css`：2048 的样式文件，保持和当前 Excel 壳一致。

## 调用关系

- `App.tsx` 通过 `workbookRegistry.ts` 和 `workspaceRegistry.ts` 知道 2048 属于 `Sheet23`。
- `App.tsx` 渲染 `Game2048Sheet.tsx`，并把公式栏、状态栏和快照回调传进去。
- `Game2048Sheet.tsx` 调用 `game2048BoardState.ts` 推进局面，并用 `game2048Storage.ts` 维护最高分与当前局。
- Hub 和保存系统通过 `hubData.ts`、`saveAdapters.ts` 把 2048 作为独立模块接进现有入口。

## 关键决定

- 2048 先做成 **一个单 Sheet 的经典模式**，不先上多模式和多棋盘尺寸。
- 规则尽量贴近经典原版：**4×4、无撤销、达成 2048 后可继续**。
- UI 保持当前项目统一的 Excel 外壳，不单独起多页菜单体系。
