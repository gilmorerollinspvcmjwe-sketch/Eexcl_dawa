# Match-3 UI Feedback and Level Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve Match-3 in-game UI feedback and add headless level testing/design tooling for solvability and balance checks.

**Architecture:** Split work into two independent lanes. UI feedback stays in `src/components/match3` and `src/styles/match3.css`; level tooling stays in `src/features/match3` plus tests so it can run without UI. Build the level tester around existing pure board-state functions instead of adding a new gameplay path.

**Tech Stack:** React 19, TypeScript, Node test runner, Canvas/CSS animations, ESLint, Vite

---

## File Map

- Modify: `src/components/match3/Match3Board.tsx`
- Modify: `src/components/match3/Match3Hud.tsx`
- Modify: `src/components/match3/Match3ResultPanel.tsx`
- Modify: `src/components/match3/Match3Sheet.tsx`
- Modify: `src/styles/match3.css`
- Create: `src/features/match3/match3LevelTester.ts`
- Create: `src/features/match3/match3LevelDesigner.ts`
- Modify: `src/features/match3/index` (only if needed; otherwise skip)
- Modify: `tests/match3BoardState.test.ts`
- Create: `tests/match3LevelTester.test.ts`
- Create: `tests/match3LevelDesigner.test.ts`
- Modify: `CONTEXT.md`

## Task A: UI feedback lane (subagent-owned)

**Files:**
- Modify: `src/components/match3/Match3Board.tsx`
- Modify: `src/components/match3/Match3Hud.tsx`
- Modify: `src/components/match3/Match3ResultPanel.tsx`
- Modify: `src/components/match3/Match3Sheet.tsx`
- Modify: `src/styles/match3.css`

- [ ] Strengthen swap / invalid swap / match / drop feedback without changing core rules
- [ ] Reduce noisy always-on tile effects and make high-value moments clearer
- [ ] Rebalance HUD hierarchy so goals and moves/time lead
- [ ] Tighten result panel emphasis and setup density
- [ ] Run `npm run build` and report changed files

## Task B: Level tester lane (main owner)

**Files:**
- Create: `src/features/match3/match3LevelTester.ts`
- Create: `tests/match3LevelTester.test.ts`
- Modify: `tests/match3BoardState.test.ts`

- [ ] **Step 1: Write failing tests for headless tester**
- [ ] **Step 2: Verify tests fail**
- [ ] **Step 3: Implement a level tester around existing board-state functions**
- [ ] **Step 4: Verify tester tests pass**

Expected tester scope:
- static validation (bounds, exits, valid opening move)
- seeded simulation runner
- simple strategy bots (`random`, `goalGreedy`, `comboGreedy`)
- aggregate metrics (win rate, failure reasons, reshuffle count)

## Task C: Level designer lane (main owner)

**Files:**
- Create: `src/features/match3/match3LevelDesigner.ts`
- Create: `tests/match3LevelDesigner.test.ts`

- [ ] **Step 1: Write failing tests for template-based level variants**
- [ ] **Step 2: Verify tests fail**
- [ ] **Step 3: Implement minimal template-driven level variant builder**
- [ ] **Step 4: Verify designer tests pass**

Expected designer scope:
- clone a base level script
- override safe fields only (`palette`, `colorWeights`, `goals`, `maxMoves`, `obstacles`, `portals`, `prebuiltSpecials`, `spreaderConfig`)
- keep ids/names deterministic from a provided suffix
- leave unsupported runtime-only generation rules out for now

## Task D: Final verification and project note

**Files:**
- Modify: `CONTEXT.md`

- [ ] Add one short CONTEXT entry noting Match-3 now has headless验关工具 and template-level designer helper
- [ ] Run:
  - `npm run lint`
  - `npm run build`
  - `npm test`
- [ ] Summarize changed files and remaining risks

## Self-Review

- Spec coverage: covers user-requested agent UI fixes plus main-line level tester/designer work
- Placeholder scan: no TODO/TBD placeholders
- Type consistency: keeps gameplay logic in existing board-state functions and limits new designer scope to supported script fields
