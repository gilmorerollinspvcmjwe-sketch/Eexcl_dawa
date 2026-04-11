import type { PerlerTemplate, PerlerWorkspace } from './perlerTypes';

export function createPerlerWorkspace(template: PerlerTemplate): PerlerWorkspace {
  return {
    id: template.id,
    title: template.title,
    width: template.width,
    height: template.height,
    pixels: [...template.pixels],
    userPixels: Array.from({ length: template.pixels.length }, () => null),
    filledCount: 0,
    completion: 0,
  };
}

function countCorrectCells(workspace: PerlerWorkspace): number {
  return workspace.userPixels.reduce((count, color, index) => {
    return count + (color === workspace.pixels[index] ? 1 : 0);
  }, 0);
}

function withProgress(workspace: PerlerWorkspace): PerlerWorkspace {
  const filledCount = countCorrectCells(workspace);
  return {
    ...workspace,
    filledCount,
    completion: Math.round((filledCount / workspace.pixels.length) * 100),
  };
}

export function applyColorToCell(
  workspace: PerlerWorkspace,
  row: number,
  col: number,
  color: string,
): PerlerWorkspace {
  const index = row * workspace.width + col;
  const nextUserPixels = [...workspace.userPixels];
  nextUserPixels[index] = color;
  return withProgress({ ...workspace, userPixels: nextUserPixels });
}

export function eraseColorFromCell(workspace: PerlerWorkspace, row: number, col: number): PerlerWorkspace {
  const index = row * workspace.width + col;
  const nextUserPixels = [...workspace.userPixels];
  nextUserPixels[index] = null;
  return withProgress({ ...workspace, userPixels: nextUserPixels });
}

export function getWorkspacePaletteUsage(workspace: PerlerWorkspace): Record<string, number> {
  return workspace.userPixels.reduce<Record<string, number>>((usage, color) => {
    if (!color) return usage;
    usage[color] = (usage[color] || 0) + 1;
    return usage;
  }, {});
}

