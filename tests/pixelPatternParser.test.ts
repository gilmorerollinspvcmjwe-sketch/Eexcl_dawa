import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPixelPatternFromPixels, convertImageSourceToPattern, materializePatternPixels } from '../src/features/perler/pixelPatternParser.ts';

test('buildPixelPatternFromPixels creates palette entries and indexed cells', () => {
  const pattern = buildPixelPatternFromPixels({
    title: 'demo',
    width: 2,
    height: 2,
    pixels: ['#FF0000', '#00FF00', '#0000FF', '#FF0000'],
  });

  assert.equal(pattern.palette.length, 3);
  assert.deepEqual(pattern.cells, [0, 1, 2, 0]);
  assert.equal(pattern.palette[0]?.count, 2);
});

test('materializePatternPixels restores the original pixel layout from cell indexes', () => {
  const pattern = buildPixelPatternFromPixels({
    title: 'demo',
    width: 2,
    height: 2,
    pixels: ['#FF0000', '#00FF00', '#0000FF', '#FF0000'],
  });

  assert.deepEqual(materializePatternPixels(pattern), ['#FF0000', '#00FF00', '#0000FF', '#FF0000']);
});

test('convertImageSourceToPattern returns a fixed grid pattern for imported images', () => {
  const pixels = new Uint8ClampedArray([
    255, 0, 0, 255,
    0, 255, 0, 255,
    0, 0, 255, 255,
    255, 255, 0, 255,
  ]);

  const pattern = convertImageSourceToPattern(
    {
      title: 'demo',
      width: 2,
      height: 2,
      pixels,
    },
    4,
    'standard',
  );

  assert.equal(pattern.cells.length, 4);
  assert.equal(pattern.palette.length, 4);
  assert.notEqual(pattern.cells[0], pattern.cells[1]);
  assert.notEqual(pattern.cells[1], pattern.cells[2]);
});

test('convertImageSourceToPattern preserves major color groups instead of collapsing to grayscale', () => {
  const width = 70;
  const height = 70;
  const pixels = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const color =
        y < 20
          ? [40, 40, 40]
          : x < 23
            ? [220, 40, 40]
            : x < 46
              ? [40, 220, 40]
              : [40, 40, 220];

      pixels[offset] = color[0];
      pixels[offset + 1] = color[1];
      pixels[offset + 2] = color[2];
      pixels[offset + 3] = 255;
    }
  }

  const pattern = convertImageSourceToPattern(
    { title: 'hero', width, height, pixels },
    6,
    'standard',
  );

  const palette = pattern.palette.map((entry) => entry.color);
  assert.ok(palette.some((color) => color.startsWith('#D')));
  assert.ok(palette.some((color) => color.includes('DC') || color.endsWith('DC')));
  assert.ok(palette.some((color) => color[3] === 'D' || color[5] === 'D'));
});
