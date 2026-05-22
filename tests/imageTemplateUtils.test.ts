import test from 'node:test';
import assert from 'node:assert/strict';
import { convertImageSourceToTemplate } from '../src/features/perler/imageTemplateUtils.ts';

test('convertImageSourceToTemplate preserves the pixel layout of imported content', () => {
  const pixels = new Uint8ClampedArray([
    255, 0, 0, 255,
    0, 255, 0, 255,
    0, 0, 255, 255,
    255, 255, 0, 255,
  ]);

  const template = convertImageSourceToTemplate(
    {
      title: 'demo',
      width: 2,
      height: 2,
      pixels,
    },
    4,
    'standard',
  );

  assert.equal(template.pixels.length, 4);
  assert.notEqual(template.pixels[0], template.pixels[1]);
  assert.notEqual(template.pixels[0], template.pixels[2]);
  assert.notEqual(template.pixels[2], template.pixels[3]);
});
