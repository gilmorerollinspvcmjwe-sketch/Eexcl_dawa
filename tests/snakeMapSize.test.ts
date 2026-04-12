import test from 'node:test';
import assert from 'node:assert/strict';
import { getSnakeMapSizeOption, isSnakeMapSizePreset, SNAKE_MAP_SIZE_OPTIONS } from '../src/features/snake/snakeMapSize.ts';

test('snake map size registry exposes at least three presets', () => {
  assert.ok(SNAKE_MAP_SIZE_OPTIONS.length >= 3);
  assert.deepEqual(
    SNAKE_MAP_SIZE_OPTIONS.map((item) => item.preset),
    ['small', 'medium', 'large'],
  );
});

test('isSnakeMapSizePreset validates known and unknown values', () => {
  assert.equal(isSnakeMapSizePreset('small'), true);
  assert.equal(isSnakeMapSizePreset('medium'), true);
  assert.equal(isSnakeMapSizePreset('large'), true);
  assert.equal(isSnakeMapSizePreset('x-large'), false);
  assert.equal(isSnakeMapSizePreset(123), false);
});

test('getSnakeMapSizeOption resolves dimensions for each preset', () => {
  assert.deepEqual(
    getSnakeMapSizeOption('small'),
    { preset: 'small', label: '小', rows: 12, cols: 16 },
  );
  assert.deepEqual(
    getSnakeMapSizeOption('medium'),
    { preset: 'medium', label: '中', rows: 15, cols: 20 },
  );
  assert.deepEqual(
    getSnakeMapSizeOption('large'),
    { preset: 'large', label: '大', rows: 18, cols: 24 },
  );
});
