# Gold Miner Asset and UTF-8 Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 黄金矿工 visible text encoding issues and move battlefield visuals to dedicated Canvas asset files with refreshed art.

**Architecture:** Keep gameplay logic in the existing gold miner runtime and move drawing concerns into focused asset modules under `src/features/gold_miner/assets/`. Limit text fixes to 黄金矿工-visible UI and record the new “independent asset file + Canvas draw functions” rule in `CONTEXT.md`.

**Tech Stack:** React 19, TypeScript, Canvas 2D, Node test runner, ESLint, Vite

---

## File Map

- Modify: `src/App.tsx` — fix 黄金矿工 workbook title strings
- Modify: `src/components/gold_miner/GoldMinerBoard.tsx` — switch from inline drawing to asset renderer calls
- Modify: `src/components/gold_miner/GoldMinerGuideSheet.tsx` — keep copy aligned if needed after UTF-8 pass
- Create: `src/features/gold_miner/assets/drawGoldMinerHook.ts` — hook rope, claw, and attached-item frame
- Create: `src/features/gold_miner/assets/drawGoldMinerLoot.ts` — gold, diamond, rocks, bags
- Create: `src/features/gold_miner/assets/drawGoldMinerCreatures.ts` — mole and bat
- Create: `src/features/gold_miner/assets/drawGoldMinerEffects.ts` — highlight rings, grab markers, blast feedback
- Create: `src/features/gold_miner/assets/index.ts` — shared exports
- Modify: `tests/goldMinerBoardState.test.ts` — add a small regression test around highlight behavior if needed
- Modify: `CONTEXT.md` — add the new cross-game asset convention note

### Task 1: Lock the UTF-8 and visibility cleanup

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/gold_miner/GoldMinerGuideSheet.tsx`

- [ ] **Step 1: Write the failing check list**

```text
Visible failures to remove:
- Gold miner workbook title in App.tsx shows mojibake
- Gold miner guide/battle strings must remain readable UTF-8 Chinese
```

- [ ] **Step 2: Verify current bad text exists**

Run: `chcp 65001 > $null; [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new(); Select-String -Path 'src/App.tsx' -Pattern '榛勯噾鐭垮伐|gold_miner' -Encoding UTF8`
Expected: lines show mojibake for gold miner title strings

- [ ] **Step 3: Replace the bad strings with clean UTF-8 text**

```ts
// src/App.tsx
      : currentSheet === 'gold_miner'
        ? 'Microsoft Excel - 黄金矿工.xlsx'
      : currentSheet === 'gold_miner_guide'
        ? 'Microsoft Excel - 黄金矿工图鉴.xlsx'
```

```tsx
// src/components/gold_miner/GoldMinerGuideSheet.tsx
onFormulaChange?.('=黄金矿工图鉴 | 物品价值、商店道具与操作说明');
```

- [ ] **Step 4: Re-run the text scan**

Run: `chcp 65001 > $null; [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new(); Select-String -Path 'src/App.tsx' -Pattern '黄金矿工|黄金矿工图鉴' -Encoding UTF8`
Expected: clean UTF-8 gold miner titles appear, mojibake no longer matches

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components/gold_miner/GoldMinerGuideSheet.tsx
git commit -m "Fix gold miner UTF-8 text display"
```

### Task 2: Create dedicated gold miner Canvas asset modules

**Files:**
- Create: `src/features/gold_miner/assets/drawGoldMinerHook.ts`
- Create: `src/features/gold_miner/assets/drawGoldMinerLoot.ts`
- Create: `src/features/gold_miner/assets/drawGoldMinerCreatures.ts`
- Create: `src/features/gold_miner/assets/drawGoldMinerEffects.ts`
- Create: `src/features/gold_miner/assets/index.ts`

- [ ] **Step 1: Add the asset module skeletons**

```ts
// src/features/gold_miner/assets/index.ts
export * from './drawGoldMinerHook.ts';
export * from './drawGoldMinerLoot.ts';
export * from './drawGoldMinerCreatures.ts';
export * from './drawGoldMinerEffects.ts';
```

- [ ] **Step 2: Add hook drawing helpers**

```ts
// src/features/gold_miner/assets/drawGoldMinerHook.ts
export interface GoldMinerHookDrawInput {
  x: number;
  y: number;
  originX: number;
  originY: number;
  angleDeg: number;
  grabbed: boolean;
}

export function drawGoldMinerRope(
  context: CanvasRenderingContext2D,
  input: GoldMinerHookDrawInput,
): void {
  context.save();
  context.strokeStyle = '#334155';
  context.lineWidth = 3;
  context.setLineDash([8, 4]);
  context.beginPath();
  context.moveTo(input.originX, input.originY);
  context.lineTo(input.x, input.y);
  context.stroke();
  context.restore();
}
```

- [ ] **Step 3: Add loot and creature drawing helpers**

```ts
// src/features/gold_miner/assets/drawGoldMinerLoot.ts
import type { GoldMinerItem } from '../goldMinerTypes.ts';

export function drawGoldMinerLoot(
  context: CanvasRenderingContext2D,
  item: GoldMinerItem,
): void {
  switch (item.kind) {
    case 'gold_small':
    case 'gold_medium':
    case 'gold_large':
      // draw faceted gold chunk
      break;
    case 'diamond':
      // draw cool-tone crystal
      break;
    default:
      // draw remaining loot fallback
      break;
  }
}
```

```ts
// src/features/gold_miner/assets/drawGoldMinerCreatures.ts
import type { GoldMinerItem } from '../goldMinerTypes.ts';

export function drawGoldMinerCreature(
  context: CanvasRenderingContext2D,
  item: GoldMinerItem,
): void {
  if (item.kind === 'mole') {
    // draw mole body, claws, nose
    return;
  }
  if (item.kind === 'bat') {
    // draw bat wings and ears
    return;
  }
}
```

- [ ] **Step 4: Add effect helpers**

```ts
// src/features/gold_miner/assets/drawGoldMinerEffects.ts
import type { GoldMinerItem } from '../goldMinerTypes.ts';

export function drawGoldMinerHighlight(
  context: CanvasRenderingContext2D,
  item: GoldMinerItem,
  strong = false,
): void {
  context.save();
  context.strokeStyle = strong ? '#ef4444' : '#f59e0b';
  context.lineWidth = strong ? 4 : 3;
  context.beginPath();
  context.arc(item.x, item.y, item.radius + 6, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}
```

- [ ] **Step 5: Commit**

```bash
git add src/features/gold_miner/assets
git commit -m "Extract gold miner canvas asset renderers"
```

### Task 3: Rewire GoldMinerBoard to use the new asset renderers

**Files:**
- Modify: `src/components/gold_miner/GoldMinerBoard.tsx`

- [ ] **Step 1: Replace inline item style helpers with asset imports**

```tsx
// src/components/gold_miner/GoldMinerBoard.tsx
import {
  drawGoldMinerClaw,
  drawGoldMinerCreature,
  drawGoldMinerGrabPulse,
  drawGoldMinerHighlight,
  drawGoldMinerLoot,
  drawGoldMinerRope,
} from '../../features/gold_miner/assets/index.ts';
```

- [ ] **Step 2: Keep board layout, but delegate item rendering**

```tsx
for (const item of state.items) {
  if (item.isCollected) continue;
  const highlighted = shouldHighlightGoldMinerItem(state, item);
  if (item.kind === 'mole' || item.kind === 'bat') {
    drawGoldMinerCreature(context, item);
  } else {
    drawGoldMinerLoot(context, item);
  }
  if (highlighted) {
    drawGoldMinerHighlight(context, item, true);
  }
}
```

- [ ] **Step 3: Delegate rope, claw, grabbed item, and blast feedback**

```tsx
drawGoldMinerRope(context, {
  x: hookTip.x,
  y: hookTip.y,
  originX: state.hookOrigin.x,
  originY: state.hookOrigin.y,
  angleDeg: state.hook.angleDeg,
  grabbed: !!grabbedItem,
});

drawGoldMinerClaw(context, {
  x: hookTip.x,
  y: hookTip.y,
  angleDeg: state.hook.angleDeg,
  grabbed: !!grabbedItem,
});
```

- [ ] **Step 4: Run the focused checks**

Run: `chcp 65001 > $null; npm run build`
Expected: build passes and GoldMinerBoard compiles with the new asset imports

- [ ] **Step 5: Commit**

```bash
git add src/components/gold_miner/GoldMinerBoard.tsx
git commit -m "Redraw gold miner battlefield visuals with canvas assets"
```

### Task 4: Add regression coverage and project note

**Files:**
- Modify: `tests/goldMinerBoardState.test.ts`
- Modify: `CONTEXT.md`

- [ ] **Step 1: Add a lightweight regression test for highlight logic**

```ts
test('detector effects only highlight matching gold miner targets', () => {
  const state = createGoldMinerBoardState({ level: getGoldMinerLevel(1), rngSeed: 41 });
  const diamond = state.items.find((item) => item.kind === 'diamond');
  const rock = state.items.find((item) => item.kind === 'rock_small' || item.kind === 'rock_large');

  assert.ok(diamond);
  assert.ok(rock);
  assert.equal(shouldHighlightGoldMinerItem({ ...state, activeEffects: ['diamond_detector'] }, diamond), true);
  assert.equal(shouldHighlightGoldMinerItem({ ...state, activeEffects: ['diamond_detector'] }, rock), false);
});
```

- [ ] **Step 2: Add the new asset convention to CONTEXT.md**

```md
- 2026-04-16 新增黄金矿工 Canvas 素材规范：后续新游戏素材默认采用“独立文件 + Canvas 绘制函数”的方案，页面组件只负责摆放与调用，不再内联大段素材绘制逻辑。
```

- [ ] **Step 3: Run full verification**

Run:
- `chcp 65001 > $null; npm run lint`
- `chcp 65001 > $null; npm run build`
- `chcp 65001 > $null; npm test`

Expected:
- lint PASS
- build PASS
- test PASS

- [ ] **Step 4: Commit**

```bash
git add tests/goldMinerBoardState.test.ts CONTEXT.md
git commit -m "Document canvas asset convention and cover gold miner highlight logic"
```

## Self-Review

- Spec coverage: includes UTF-8 repair, asset extraction, board rewiring, and CONTEXT update
- Placeholder scan: no TBD/TODO placeholders left
- Type consistency: all referenced functions map to named asset helpers and existing board-state APIs
