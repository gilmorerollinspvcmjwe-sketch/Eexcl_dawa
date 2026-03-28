# Sheet2 右侧空白问题 - 测试报告

## 问题定位

### 根本原因

**CSS 类名冲突导致样式覆盖**

`src/styles/gamehub.css` 中的 `.excel-cell` 样式覆盖了 `src/index.css` 中的同名样式：

| 文件 | 样式定义 | 加载顺序 |
|------|---------|---------|
| `index.css` | `.excel-cell { min-width: var(--excel-cell-width); }` (64px) | 先加载 |
| `gamehub.css` | `.excel-cell { min-width: 120px; }` | 后加载（覆盖） |

**CSS 加载顺序分析**：
1. `main.tsx` → `import './index.css'`
2. `GameHub.tsx` → `import '../styles/gamehub.css'`
3. 后者覆盖前者

### 浏览器实测数据

| 属性 | 预期值 | 实际值 |
|------|-------|-------|
| 列数 | 30 (A-AD) | 30 ✓ |
| 单元格宽度 | 64px | 120px ❌ |
| 表格总宽度 | 1920px (30×64) | 1707px ❌ |
| 行头宽度 | 24px | 40px ❌ |

**CSS 规则冲突证据**：
```javascript
// DevTools 检测到的两条规则
matchedRules: [
  { selector: ".excel-cell", minWidth: "var(--excel-cell-width)" }, // index.css (正确)
  { selector: ".excel-cell", minWidth: "120px" }                    // gamehub.css (覆盖)
]
```

### 影响范围

- [x] `src/styles/gamehub.css` - **根本原因所在**
- [ ] `src/utils/gridUtils.ts` - 无问题（注释有误但逻辑正确）
- [ ] `src/components/grid/GridTable.tsx` - 无问题
- [ ] `src/index.css` - 无问题
- [ ] `src/constants.ts` - 无问题（注释有误但值正确）

---

## 修复方案

### 方案 A：命名空间隔离（推荐）

将 `gamehub.css` 中的类名添加命名空间前缀，避免与全局样式冲突：

**修改文件**: `src/styles/gamehub.css`

```css
/* 将以下类名添加 .gamehub- 前缀 */

/* 行 42 修改 */
.gamehub-cell {
  /* ... */
}

/* 行 49 修改 */
.gamehub-row-header {
  /* ... */
}

/* 行 28 修改 */
.gamehub-col-header {
  /* ... */
}

/* 其他相关类名同理 */
```

**同步修改**: `src/components/GameHub.tsx`

```tsx
// 将所有 className="excel-cell" 改为 className="gamehub-cell"
<div className="gamehub-cell excel-title-cell">
  {/* ... */}
</div>
```

### 方案 B：CSS 作用域限定（更简单）

在 `gamehub.css` 中将所有样式限定在 `.excel-game-hub` 容器内：

**修改文件**: `src/styles/gamehub.css`

```css
/* 在文件开头添加容器限定 */

.excel-game-hub .excel-cell {
  min-width: 120px;  /* 只影响 GameHub 内的单元格 */
}

.excel-game-hub .excel-row-header {
  width: 40px;
}

.excel-game-hub .excel-col-header {
  min-width: 120px;
}

/* 其他样式同理 */
```

### 方案 C：提高 index.css 优先级（快速）

在 `index.css` 中为 GridTable 专用样式添加更高优先级的选择器：

**修改文件**: `src/index.css`

```css
/* 为 GridTable 添加表格限定 */

.excel-grid-wrapper .excel-cell {
  min-width: var(--excel-cell-width);
  width: var(--excel-cell-width);
}

.excel-grid-wrapper .excel-row-header {
  min-width: var(--excel-row-header-width);
  width: var(--excel-row-header-width);
}

.excel-grid-wrapper .excel-col-header {
  min-width: var(--excel-cell-width);
  width: var(--excel-cell-width);
}
```

---

## 验证步骤

1. [ ] 选择修复方案并修改代码
2. [ ] 重启开发服务器 (`npm run dev`)
3. [ ] 打开浏览器 DevTools
4. [ ] 切换到 Sheet2 训练场
5. [ ] 检查表格列数（应显示 A-AD 共 30 列）
6. [ ] 检查单元格宽度（应为 64px）
7. [ ] 检查表格总宽度（应为 ~1920px）
8. [ ] 横向滚动验证右侧列是否完整显示

---

## 预期效果

修复后应该看到：
- ✅ 30 列完整显示（A-AD）
- ✅ 每列宽度 64px
- ✅ 表格总宽度 ~1920px
- ✅ 可以横向滚动查看右侧列
- ✅ 右侧不再空白

---

## 附：代码注释修正建议

虽然不影响功能，但以下注释有误导性，建议修正：

### `src/utils/gridUtils.ts`

```typescript
// 错误注释：
// @param cols 列数（从 B 列开始计数）
// @returns 列字母数组，如 ['B', 'C', ..., 'AD']

// 应改为：
// @param cols 列数（从 A 列开始计数）
// @returns 列字母数组，如 ['A', 'B', 'C', ..., 'AD']
```

### `src/constants.ts`

```typescript
// 错误注释：
export const COLS = 30; // B to AD (30 columns)

// 应改为：
export const COLS = 30; // A to AD (30 columns)
```

---

## 测试环境

- 日期: 2026-03-28
- 测试者: AI Subagent
- 项目路径: `C:\Users\13609\.openclaw\workspace\excel-aim-trainer`
- 开发服务器: http://localhost:3461

---

## 修复实施记录

### 已应用的修复

**文件**: `src/index.css`

1. **添加作用域限定 CSS（防止 gamehub.css 覆盖）**:
```css
/* GridTable 作用域限定 - 防止被 gamehub.css 覆盖 */
.excel-grid-wrapper .excel-cell {
  min-width: var(--excel-cell-width) !important;
  width: var(--excel-cell-width) !important;
}

.excel-grid-wrapper .excel-row-header {
  min-width: var(--excel-row-header-width) !important;
  width: var(--excel-row-header-width) !important;
}

.excel-grid-wrapper .excel-col-header {
  min-width: var(--excel-cell-width) !important;
  width: var(--excel-cell-width) !important;
}

.excel-grid-wrapper .excel-corner-cell {
  min-width: var(--excel-row-header-width) !important;
  width: var(--excel-row-header-width) !important;
}
```

2. **设置表格固定宽度（允许横向滚动）**:
```css
/* GridTable 训练场表格 - 确保完整显示所有列 */
.excel-grid-wrapper .excel-table {
  /* 计算宽度: 行头(24px) + 30列 × 64px = 1944px */
  width: calc(var(--excel-row-header-width) + var(--excel-cell-width) * 30);
  min-width: calc(var(--excel-row-header-width) + var(--excel-cell-width) * 30);
}
```

### 修复后验证结果

| 属性 | 修复前 | 修复后 | 状态 |
|------|-------|-------|------|
| 表格宽度 | 1707px | 1944px | ✅ |
| 单元格宽度 | 120px | 64px | ✅ |
| 行头宽度 | 40px | 24px | ✅ |
| 列数 | 30 | 30 | ✅ |
| 可横向滚动 | 否 | 是 | ✅ |
| 右侧列可见 | 隐藏 | AA-AD 可见 | ✅ |

---

## 根本原因总结

1. **CSS 类名冲突**: `gamehub.css` 与 `index.css` 使用相同类名 `.excel-cell`
2. **CSS 加载顺序**: 后加载的 `gamehub.css` 覆盖了 `index.css` 的样式
3. **表格宽度约束**: `min-width: 100%` 导致表格无法超出容器宽度

---

## 测试环境

- 日期: 2026-03-28
- 测试者: AI Subagent
- 项目路径: `C:\Users\13609\.openclaw\workspace\excel-aim-trainer`
- 开发服务器: http://localhost:3461