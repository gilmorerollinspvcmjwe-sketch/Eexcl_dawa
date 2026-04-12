import test from 'node:test';
import assert from 'node:assert/strict';
import { createSnakeBoardState, startSnakeBoard } from '../src/features/snake/snakeBoardState.ts';
import { getSnakeDeathReasonText, getSnakeFormulaText, getSnakeMapSizeLabel, getSnakePrimaryStatusText } from '../src/features/snake/snakeSelectors.ts';

test('formula text reflects idle and playing states', () => {
  const idle = createSnakeBoardState();
  const playing = startSnakeBoard(idle);

  assert.match(getSnakeFormulaText(idle), /数据流待命/);
  assert.match(getSnakeFormulaText(playing), /贪吃蛇/);
});

test('death reason text maps known reasons', () => {
  assert.match(getSnakeDeathReasonText('wall'), /REF/);
  assert.match(getSnakeDeathReasonText('self'), /循环引用/);
  assert.match(getSnakeDeathReasonText('obstacle'), /受保护/);
  assert.match(getSnakeDeathReasonText('timeout'), /时间已到/);
});

test('primary status text maps state status', () => {
  const idle = createSnakeBoardState();
  const playing = startSnakeBoard(idle);
  const paused = { ...playing, status: 'paused' as const };
  const dead = { ...playing, status: 'dead' as const };

  assert.equal(getSnakePrimaryStatusText(idle), '就绪');
  assert.equal(getSnakePrimaryStatusText(playing), '游玩中');
  assert.equal(getSnakePrimaryStatusText(paused), '已暂停');
  assert.equal(getSnakePrimaryStatusText(dead), '本局失败');
});

test('map size label maps known presets', () => {
  assert.equal(getSnakeMapSizeLabel('small'), '小图');
  assert.equal(getSnakeMapSizeLabel('medium'), '中图');
  assert.equal(getSnakeMapSizeLabel('large'), '大图');
});
