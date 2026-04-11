import type { PerlerTemplate, PerlerWorkspace } from './perlerTypes';

// 从模板创建拼豆工作区，玩家只能对照目标模板逐格完成。
export function createPerlerWorkspace(template: PerlerTemplate): PerlerWorkspace {
  return {
    id: template.id,
    title: template.title,
    width: template.width,
    height: template.height,
    pixels: [...template.pixels],
    pattern: template.pattern,
    userPixels: Array.from({ length: template.pixels.length }, () => null),
    filledCount: 0,
    completion: 0,
  };
}

// 统计当前已经正确完成的格子数量。
function countCorrectCells(workspace: PerlerWorkspace): number {
  return workspace.userPixels.reduce((count, color, index) => count + (color === workspace.pixels[index] ? 1 : 0), 0);
}

// 统计当前已经填了颜色但和模板不一致的格子数量。
export function getWorkspaceMismatchCount(workspace: PerlerWorkspace): number {
  return workspace.userPixels.reduce((count, color, index) => {
    if (!color) return count;
    return count + (color !== workspace.pixels[index] ? 1 : 0);
  }, 0);
}

// 更新工作区进度信息。
function withProgress(workspace: PerlerWorkspace): PerlerWorkspace {
  const filledCount = countCorrectCells(workspace);
  return {
    ...workspace,
    filledCount,
    completion: Math.round((filledCount / workspace.pixels.length) * 100),
  };
}

// 给指定格子填色。
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

// 清空指定格子。
export function eraseColorFromCell(workspace: PerlerWorkspace, row: number, col: number): PerlerWorkspace {
  const index = row * workspace.width + col;
  const nextUserPixels = [...workspace.userPixels];
  nextUserPixels[index] = null;
  return withProgress({ ...workspace, userPixels: nextUserPixels });
}

// 统计玩家已经实际使用的颜色数量。
export function getWorkspacePaletteUsage(workspace: PerlerWorkspace): Record<string, number> {
  return workspace.userPixels.reduce<Record<string, number>>((usage, color) => {
    if (!color) return usage;
    usage[color] = (usage[color] || 0) + 1;
    return usage;
  }, {});
}
