import type { RotationDirection, RotationState } from './tetrisTypes.ts';

export function rotateState(rotation: RotationState, direction: RotationDirection): RotationState {
  if (direction === 'cw') {
    return ((rotation + 1) % 4) as RotationState;
  }
  return ((rotation + 3) % 4) as RotationState;
}

export function getSimpleWallKickOffsets(): ReadonlyArray<number> {
  return [0, 1, -1, 2, -2];
}
