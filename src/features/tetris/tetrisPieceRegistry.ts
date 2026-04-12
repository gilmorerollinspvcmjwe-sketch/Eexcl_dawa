import type { ActivePiece, PieceCell, RotationState, TetrominoKind } from './tetrisTypes.ts';

export const TETROMINO_ORDER: TetrominoKind[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

export interface TetrominoDefinition {
  id: TetrominoKind;
  label: string;
  colorClass: string;
  rotations: ReadonlyArray<ReadonlyArray<PieceCell>>;
}

export const TETROMINO_DEFINITIONS: Record<TetrominoKind, TetrominoDefinition> = {
  I: {
    id: 'I',
    label: 'I',
    colorClass: 'kind-I',
    rotations: [
      [
        { row: 1, col: 0 },
        { row: 1, col: 1 },
        { row: 1, col: 2 },
        { row: 1, col: 3 },
      ],
      [
        { row: 0, col: 2 },
        { row: 1, col: 2 },
        { row: 2, col: 2 },
        { row: 3, col: 2 },
      ],
      [
        { row: 2, col: 0 },
        { row: 2, col: 1 },
        { row: 2, col: 2 },
        { row: 2, col: 3 },
      ],
      [
        { row: 0, col: 1 },
        { row: 1, col: 1 },
        { row: 2, col: 1 },
        { row: 3, col: 1 },
      ],
    ],
  },
  O: {
    id: 'O',
    label: 'O',
    colorClass: 'kind-O',
    rotations: [
      [
        { row: 1, col: 1 },
        { row: 1, col: 2 },
        { row: 2, col: 1 },
        { row: 2, col: 2 },
      ],
      [
        { row: 1, col: 1 },
        { row: 1, col: 2 },
        { row: 2, col: 1 },
        { row: 2, col: 2 },
      ],
      [
        { row: 1, col: 1 },
        { row: 1, col: 2 },
        { row: 2, col: 1 },
        { row: 2, col: 2 },
      ],
      [
        { row: 1, col: 1 },
        { row: 1, col: 2 },
        { row: 2, col: 1 },
        { row: 2, col: 2 },
      ],
    ],
  },
  T: {
    id: 'T',
    label: 'T',
    colorClass: 'kind-T',
    rotations: [
      [
        { row: 1, col: 1 },
        { row: 2, col: 0 },
        { row: 2, col: 1 },
        { row: 2, col: 2 },
      ],
      [
        { row: 1, col: 1 },
        { row: 2, col: 1 },
        { row: 2, col: 2 },
        { row: 3, col: 1 },
      ],
      [
        { row: 2, col: 0 },
        { row: 2, col: 1 },
        { row: 2, col: 2 },
        { row: 3, col: 1 },
      ],
      [
        { row: 1, col: 1 },
        { row: 2, col: 0 },
        { row: 2, col: 1 },
        { row: 3, col: 1 },
      ],
    ],
  },
  S: {
    id: 'S',
    label: 'S',
    colorClass: 'kind-S',
    rotations: [
      [
        { row: 1, col: 1 },
        { row: 1, col: 2 },
        { row: 2, col: 0 },
        { row: 2, col: 1 },
      ],
      [
        { row: 1, col: 1 },
        { row: 2, col: 1 },
        { row: 2, col: 2 },
        { row: 3, col: 2 },
      ],
      [
        { row: 2, col: 1 },
        { row: 2, col: 2 },
        { row: 3, col: 0 },
        { row: 3, col: 1 },
      ],
      [
        { row: 1, col: 0 },
        { row: 2, col: 0 },
        { row: 2, col: 1 },
        { row: 3, col: 1 },
      ],
    ],
  },
  Z: {
    id: 'Z',
    label: 'Z',
    colorClass: 'kind-Z',
    rotations: [
      [
        { row: 1, col: 0 },
        { row: 1, col: 1 },
        { row: 2, col: 1 },
        { row: 2, col: 2 },
      ],
      [
        { row: 1, col: 2 },
        { row: 2, col: 1 },
        { row: 2, col: 2 },
        { row: 3, col: 1 },
      ],
      [
        { row: 2, col: 0 },
        { row: 2, col: 1 },
        { row: 3, col: 1 },
        { row: 3, col: 2 },
      ],
      [
        { row: 1, col: 1 },
        { row: 2, col: 0 },
        { row: 2, col: 1 },
        { row: 3, col: 0 },
      ],
    ],
  },
  J: {
    id: 'J',
    label: 'J',
    colorClass: 'kind-J',
    rotations: [
      [
        { row: 1, col: 0 },
        { row: 2, col: 0 },
        { row: 2, col: 1 },
        { row: 2, col: 2 },
      ],
      [
        { row: 1, col: 1 },
        { row: 1, col: 2 },
        { row: 2, col: 1 },
        { row: 3, col: 1 },
      ],
      [
        { row: 2, col: 0 },
        { row: 2, col: 1 },
        { row: 2, col: 2 },
        { row: 3, col: 2 },
      ],
      [
        { row: 1, col: 1 },
        { row: 2, col: 1 },
        { row: 3, col: 0 },
        { row: 3, col: 1 },
      ],
    ],
  },
  L: {
    id: 'L',
    label: 'L',
    colorClass: 'kind-L',
    rotations: [
      [
        { row: 1, col: 2 },
        { row: 2, col: 0 },
        { row: 2, col: 1 },
        { row: 2, col: 2 },
      ],
      [
        { row: 1, col: 1 },
        { row: 2, col: 1 },
        { row: 3, col: 1 },
        { row: 3, col: 2 },
      ],
      [
        { row: 2, col: 0 },
        { row: 2, col: 1 },
        { row: 2, col: 2 },
        { row: 3, col: 0 },
      ],
      [
        { row: 1, col: 0 },
        { row: 1, col: 1 },
        { row: 2, col: 1 },
        { row: 3, col: 1 },
      ],
    ],
  },
};

export function getPieceCells(kind: TetrominoKind, rotation: RotationState): ReadonlyArray<PieceCell> {
  return TETROMINO_DEFINITIONS[kind].rotations[rotation];
}

export function translatePieceCells(piece: ActivePiece): PieceCell[] {
  return getPieceCells(piece.kind, piece.rotation).map((cell) => ({
    row: piece.row + cell.row,
    col: piece.col + cell.col,
  }));
}
