# PvZ Grid Sheets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a playable grid-based PvZ module on Sheet7 plus companion collection/settings sheets on Sheet8 and Sheet9.

**Architecture:** Implement PvZ as a self-contained feature package with pure registries and board-state helpers first, then wire Sheet7/8/9 into the existing app shell. Keep current aim/perler flows intact and give PvZ its own lightweight app-level state and renderer.

**Tech Stack:** React 19, TypeScript, Vite, Node built-in test runner, existing Excel-shell UI

---

### Task 1: Add PvZ sheet registry and registry tests

**Files:**
- Modify: `src/features/sheets/sheetRegistry.ts`
- Create: `tests/pvzSheetRegistry.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/pvzSheetRegistry.test.ts` asserting:
- sheet count increases to 9
- `sheet7`, `sheet8`, `sheet9` equivalent ids exist as `pvz`, `pvz_collection`, `pvz_lab`
- labels map to `Sheet7`, `Sheet8`, `Sheet9`

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --test-name-pattern="pvz sheets are registered"`

Expected: FAIL because those sheets do not exist yet.

- [ ] **Step 3: Implement minimal registry changes**

Extend `AppSheetId` and `SHEET_REGISTRY` with:
- `pvz`
- `pvz_collection`
- `pvz_lab`

- [ ] **Step 4: Run tests**

Run: `npm test`

Expected: PASS including the new sheet registry test.

---

### Task 2: Add plant/zombie registries and board-state helpers

**Files:**
- Create: `src/features/pvz/pvzTypes.ts`
- Create: `src/features/pvz/pvzPlantRegistry.ts`
- Create: `src/features/pvz/pvzZombieRegistry.ts`
- Create: `src/features/pvz/pvzBoardState.ts`
- Create: `tests/pvzBoardState.test.ts`

- [ ] **Step 1: Write failing board-state tests**

Cover at least:
- placing a plant deducts sun
- cannot place when sun is insufficient
- zombies advance lane progress
- lane breach marks defeat
- wave progress advances spawn schedule

- [ ] **Step 2: Run test to verify RED**

Run: `npm test -- --test-name-pattern="placing a plant deducts sun|lane breach marks defeat"`

Expected: FAIL because PvZ helpers do not exist.

- [ ] **Step 3: Implement minimal pure state layer**

Create registries for a playable first roster:
- Sunflower
- Peashooter
- Wall-nut
- Cherry Bomb
- Potato Mine
- Repeater

Create zombie roster:
- Normal
- Conehead
- Buckethead
- Flag

Create pure board helpers for:
- board initialization
- place plant
- remove plant
- tick economy
- tick zombies
- spawn next zombie
- detect defeat/victory

- [ ] **Step 4: Run tests**

Run: `npm test`

Expected: PASS.

---

### Task 3: Build Sheet7 PvZ gameplay renderer

**Files:**
- Create: `src/components/pvz/PvZHud.tsx`
- Create: `src/components/pvz/PvZCardTray.tsx`
- Create: `src/components/pvz/PvZBoard.tsx`
- Create: `src/components/pvz/PvZGameSheet.tsx`
- Create: `src/styles/pvz.css`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write a failing sheet routing test**

Add a new test that verifies the sheet registry contains `pvz` and companion sheets.

- [ ] **Step 2: Wire Sheet7**

Add `Sheet7` routing in `App.tsx` to render `PvZGameSheet`.

Requirements:
- 5 lanes
- 9 columns
- sun counter
- card tray
- wave progress
- playable plant placement
- moving zombies in lanes

- [ ] **Step 3: Keep shell intact**

Do not disturb:
- aim gameplay on existing sheets
- perler sheets
- current Excel header/tabs/status bar contract

- [ ] **Step 4: Run tests and build**

Run:

```bash
npm test
npm run build
```

Expected: PASS.

---

### Task 4: Build Sheet8 and Sheet9 companion PvZ pages

**Files:**
- Create: `src/components/pvz/PvZCollectionSheet.tsx`
- Create: `src/components/pvz/PvZLabSheet.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Implement Sheet8 collection**

Display:
- plant roster table
- zombie roster table
- unlocked/known entries
- costs / cooldowns / roles

- [ ] **Step 2: Implement Sheet9 lab/settings**

Display:
- chapter list
- lane/board rules
- optional debug toggles or scenario presets
- PvZ-specific settings summary

- [ ] **Step 3: Run tests and build**

Run:

```bash
npm test
npm run build
```

Expected: PASS.

---

### Task 5: Final verification and cleanup

**Files:**
- Modify only touched files if needed

- [ ] **Step 1: Run verification**

Run:

```bash
npm test
npm run build
```

- [ ] **Step 2: Manual checklist**

Confirm:
- Sheet7 opens PvZ gameplay
- plants can be placed
- zombies move and defeat can occur
- Sheet8 shows PvZ collection data
- Sheet9 shows PvZ companion controls/data
- aim/perler flows still work

