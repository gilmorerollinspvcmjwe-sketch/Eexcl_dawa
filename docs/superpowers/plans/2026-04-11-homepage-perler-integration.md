# Homepage + Perler Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the hub into the new Excel-style arcade homepage and add a first playable template-first perler-bead module without changing existing aim-training gameplay behavior.

**Architecture:** Keep the current Excel shell and aim-training hooks intact, then add a new app-level active-game switch for `aim` vs `perler`. Build homepage and perler around small pure data helpers so we can test the new behavior with Node's built-in test runner before wiring React components.

**Tech Stack:** React 19, TypeScript, Vite, Node 24 built-in test runner with `--experimental-strip-types`

---

### Task 1: Add test harness and pure hub/perler helpers

**Files:**
- Modify: `package.json`
- Create: `tests/hubData.test.ts`
- Create: `tests/perlerData.test.ts`
- Create: `src/features/hub/hubData.ts`
- Create: `src/features/perler/perlerData.ts`

- [ ] **Step 1: Add a built-in test script**

Update `package.json` scripts to include:

```json
"test": "node --experimental-strip-types --test tests/**/*.test.ts"
```

- [ ] **Step 2: Write the failing hub data test**

Create `tests/hubData.test.ts`:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHubSnapshot } from '../src/features/hub/hubData.ts';

test('buildHubSnapshot prefers unfinished perler work for quick resume', () => {
  const snapshot = buildHubSnapshot({
    perlerProgress: { templateId: 'tpl-1', completion: 62, title: '咖波表情' },
    stats: { totalGames: 3, totalScore: 12840 },
  });

  assert.equal(snapshot.quickResume.kind, 'perler');
  assert.match(snapshot.quickResume.label, /62%/);
});
```

- [ ] **Step 3: Run the hub test to verify RED**

Run:

```bash
npm test -- --test-name-pattern="prefers unfinished perler work"
```

Expected: FAIL because `buildHubSnapshot` does not exist yet.

- [ ] **Step 4: Write the failing perler data test**

Create `tests/perlerData.test.ts`:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { filterPerlerTemplates, perlerTemplates } from '../src/features/perler/perlerData.ts';

test('filterPerlerTemplates returns game-role templates for keyword search', () => {
  const result = filterPerlerTemplates(perlerTemplates, {
    query: '游戏',
    category: 'all',
    size: 'all',
    difficulty: 'all',
  });

  assert.ok(result.some((item) => item.title.includes('曜')));
});
```

- [ ] **Step 5: Run the perler test to verify RED**

Run:

```bash
npm test -- --test-name-pattern="returns game-role templates"
```

Expected: FAIL because `filterPerlerTemplates` does not exist yet.

- [ ] **Step 6: Write minimal hub and perler data helpers**

Create `src/features/hub/hubData.ts` with a pure builder for:

- quick resume
- game table rows
- activity log
- task summary

Create `src/features/perler/perlerData.ts` with:

- built-in template catalog
- category/type definitions
- basic filter function

- [ ] **Step 7: Run tests to verify GREEN**

Run:

```bash
npm test
```

Expected: PASS for both new tests.

---

### Task 2: Build the perler workspace state and image-template conversion helpers

**Files:**
- Create: `tests/perlerWorkspace.test.ts`
- Create: `src/features/perler/perlerTypes.ts`
- Create: `src/features/perler/perlerWorkspaceState.ts`
- Create: `src/features/perler/imageTemplateUtils.ts`

- [ ] **Step 1: Write the failing workspace test**

Create `tests/perlerWorkspace.test.ts`:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { createPerlerWorkspace, applyColorToCell } from '../src/features/perler/perlerWorkspaceState.ts';

test('applyColorToCell updates completion progress for matching template cells', () => {
  const workspace = createPerlerWorkspace({
    id: 'tpl-demo',
    title: '演示模板',
    width: 2,
    height: 2,
    pixels: ['#111111', '#222222', '#333333', '#444444'],
  });

  const next = applyColorToCell(workspace, 0, 0, '#111111');

  assert.equal(next.filledCount, 1);
  assert.equal(next.completion, 25);
});
```

- [ ] **Step 2: Run the workspace test to verify RED**

Run:

```bash
npm test -- --test-name-pattern="updates completion progress"
```

Expected: FAIL because the workspace helpers do not exist yet.

- [ ] **Step 3: Implement the minimal workspace state**

Create `src/features/perler/perlerWorkspaceState.ts` with pure helpers for:

- create workspace from template
- fill cell
- erase cell
- compute completion
- compute color usage

- [ ] **Step 4: Implement image-template utilities**

Create `src/features/perler/imageTemplateUtils.ts` with pure helpers for:

- target size presets
- palette reduction
- converting `ImageData` pixels into a perler template record

- [ ] **Step 5: Run all tests to verify GREEN**

Run:

```bash
npm test
```

Expected: PASS.

---

### Task 3: Implement the new homepage while preserving existing aim launch flows

**Files:**
- Modify: `src/components/GameHub.tsx`
- Modify: `src/styles/gamehub.css`
- Create: `src/components/hub/HubQuickResumeRow.tsx`
- Create: `src/components/hub/HubGameTable.tsx`
- Create: `src/components/hub/HubTasksPanel.tsx`
- Create: `src/components/hub/HubProgressPanel.tsx`
- Create: `src/components/hub/HubActivityLog.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write a failing hub structure test**

Append to `tests/hubData.test.ts`:

```ts
test('buildHubSnapshot returns five game rows with perler included', () => {
  const snapshot = buildHubSnapshot({
    perlerProgress: null,
    stats: { totalGames: 0, totalScore: 0 },
  });

  assert.equal(snapshot.games.length, 5);
  assert.ok(snapshot.games.some((item) => item.id === 'perler'));
});
```

- [ ] **Step 2: Run the new test to verify RED**

Run:

```bash
npm test -- --test-name-pattern="returns five game rows"
```

Expected: FAIL until hub rows include all five game modules.

- [ ] **Step 3: Expand `buildHubSnapshot` and wire the new hub components**

Implementation requirements:

- Keep the Excel grid shell
- Add the strong quick-resume row at the top
- Replace the old mode-picker-first layout with the approved game table + side panels
- Preserve all existing aim start handlers
- Add a `onStartPerler` prop for the new module

- [ ] **Step 4: Keep aim-training behavior untouched**

In `src/App.tsx`, only change hub wiring and game-sheet rendering boundaries. Existing aim logic must keep using:

- `startGame`
- `startGameWithMode`
- `ExcelGrid`
- `useGameLogic`

- [ ] **Step 5: Run tests and build**

Run:

```bash
npm test
npm run build
```

Expected: PASS and successful production build.

---

### Task 4: Add the first playable perler mode to the game sheet

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/SheetTabs.tsx`
- Create: `src/components/perler/PerlerHub.tsx`
- Create: `src/components/perler/PerlerTemplateTable.tsx`
- Create: `src/components/perler/PerlerWorkspace.tsx`
- Create: `src/components/perler/PerlerPalettePanel.tsx`
- Create: `src/components/perler/PerlerImportWizard.tsx`
- Create: `src/components/perler/PerlerFinalizeFlow.tsx`
- Create: `src/styles/perler.css`

- [ ] **Step 1: Write a failing test for perler template defaults**

Append to `tests/perlerData.test.ts`:

```ts
test('template catalog exposes multiple top-level theme groups', () => {
  const categories = new Set(perlerTemplates.map((item) => item.category));
  assert.ok(categories.has('office'));
  assert.ok(categories.has('games'));
  assert.ok(categories.has('abstract'));
});
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```bash
npm test -- --test-name-pattern="multiple top-level theme groups"
```

Expected: FAIL until the catalog includes those categories.

- [ ] **Step 3: Implement the first playable perler module**

Requirements:

- Template-first entry
- Search + category + size + difficulty filters
- Open a template into a workspace
- Fill cells with selected color
- Show completion, palette, and template info
- Finish a template and enter a lightweight finalize flow
- Support image upload + conversion into a custom template

- [ ] **Step 4: Integrate app-level active module switching**

Add app-level active game selection with safe boundaries:

- `aim`
- `perler`
- `null`

Rules:

- Starting any aim mode sets active game to `aim`
- Starting perler sets active game to `perler`
- Existing aim game flow remains intact
- Exiting from either module returns to `hub`

- [ ] **Step 5: Run full verification**

Run:

```bash
npm test
npm run build
```

Expected: PASS.

---

### Task 5: Final cleanup and verification

**Files:**
- Modify: any touched files only if needed for naming/consistency

- [ ] **Step 1: Re-read touched UI copy**

Check that hub and perler copy stays Excel-native, utility-first, and not card-launcher flavored.

- [ ] **Step 2: Run lint/build/tests**

Run:

```bash
npm test
npm run build
```

If lint is already configured and passes within current code quality constraints, also run:

```bash
npm run lint
```

- [ ] **Step 3: Verify manual behavior**

Manual checklist:

- Hub opens with new quick-resume row
- Five game rows are visible
- Existing aim modes still launch and play as before
- Perler opens from hub
- Template filters work
- Workspace can fill cells
- Finalize flow appears at 100%
- Returning to hub does not break aim mode state

