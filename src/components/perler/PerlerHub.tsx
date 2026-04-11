import React, { useEffect, useMemo, useState } from 'react';
import { perlerTemplates, filterPerlerTemplates } from '../../features/perler/perlerData';
import type { PerlerFilterState, PerlerTemplate, PerlerWorkspace as PerlerWorkspaceState } from '../../features/perler/perlerTypes';
import { applyColorToCell, createPerlerWorkspace, eraseColorFromCell, getWorkspacePaletteUsage } from '../../features/perler/perlerWorkspaceState';
import type { PerlerProgressSummary } from '../../features/hub/hubData';
import { PerlerTemplateTable } from './PerlerTemplateTable';
import { PerlerPalettePanel } from './PerlerPalettePanel';
import { PerlerWorkspace } from './PerlerWorkspace';
import { PerlerImportWizard } from './PerlerImportWizard';
import { PerlerFinalizeFlow } from './PerlerFinalizeFlow';
import '../../styles/perler.css';

type EntryMode = 'library' | 'resume';

interface PerlerHubProps {
  entryMode: EntryMode;
  onExit: () => void;
  onFormulaChange?: (text: string) => void;
  onSelectedCellChange?: (cell: { row: number; col: number } | null) => void;
  onProgressChange?: (progress: PerlerProgressSummary | null) => void;
}

interface PersistedPerlerState {
  workspace: PerlerWorkspaceState | null;
  importedTemplates: PerlerTemplate[];
  completedTemplateIds: string[];
  currentColor: string;
}

const STORAGE_KEY = 'excel-aim-perler-state-v1';

function loadPersistedPerlerState(): PersistedPerlerState {
  if (typeof window === 'undefined') {
    return { workspace: null, importedTemplates: [], completedTemplateIds: [], currentColor: '#223A6A' };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error('empty');
    return JSON.parse(raw) as PersistedPerlerState;
  } catch {
    return { workspace: null, importedTemplates: [], completedTemplateIds: [], currentColor: '#223A6A' };
  }
}

function persistPerlerState(state: PersistedPerlerState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const PerlerHub: React.FC<PerlerHubProps> = ({
  entryMode,
  onExit,
  onFormulaChange,
  onSelectedCellChange,
  onProgressChange,
}) => {
  const persisted = useMemo(() => loadPersistedPerlerState(), []);
  const [workspace, setWorkspace] = useState<PerlerWorkspaceState | null>(
    entryMode === 'resume' ? persisted.workspace : null,
  );
  const [importedTemplates, setImportedTemplates] = useState<PerlerTemplate[]>(persisted.importedTemplates);
  const [completedTemplateIds, setCompletedTemplateIds] = useState<string[]>(persisted.completedTemplateIds);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(persisted.workspace?.id || perlerTemplates[0]?.id || null);
  const [selectedColor, setSelectedColor] = useState<string>(persisted.currentColor || '#223A6A');
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [showFinalize, setShowFinalize] = useState(false);
  const [filters, setFilters] = useState<PerlerFilterState>({
    query: '',
    category: 'all',
    size: 'all',
    difficulty: 'all',
  });

  const templates = useMemo(() => [...perlerTemplates, ...importedTemplates], [importedTemplates]);
  const filteredTemplates = useMemo(() => filterPerlerTemplates(templates, filters), [templates, filters]);
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) || null;
  const palette = useMemo(
    () => Array.from(new Set((workspace?.pixels || selectedTemplate?.pixels || []).filter(Boolean))),
    [workspace?.pixels, selectedTemplate?.pixels],
  );
  const effectiveSelectedColor = palette.includes(selectedColor) ? selectedColor : palette[0] || '#223A6A';

  useEffect(() => {
    persistPerlerState({
      workspace,
      importedTemplates,
      completedTemplateIds,
      currentColor: selectedColor,
    });
  }, [workspace, importedTemplates, completedTemplateIds, selectedColor]);

  useEffect(() => {
    onSelectedCellChange?.(activeCell);
  }, [activeCell, onSelectedCellChange]);

  useEffect(() => {
    if (workspace && workspace.completion < 100) {
      onProgressChange?.({
        templateId: workspace.id,
        title: workspace.title,
        completion: workspace.completion,
      });
    } else {
      onProgressChange?.(null);
    }
  }, [workspace, onProgressChange]);

  useEffect(() => {
    if (workspace) {
      onFormulaChange?.(`=模板：${workspace.title} | 完成度 ${workspace.completion}% | 当前颜色 ${effectiveSelectedColor}`);
      return;
    }

    onFormulaChange?.('=拼豆模板库已就绪，可筛选、搜索或导入图片生成模板');
  }, [workspace, effectiveSelectedColor, onFormulaChange]);

  const usage = useMemo(() => (workspace ? getWorkspacePaletteUsage(workspace) : {}), [workspace]);

  const commitWorkspace = (nextWorkspace: PerlerWorkspaceState | null) => {
    setWorkspace(nextWorkspace);
    if (nextWorkspace?.completion === 100) {
      setShowFinalize(true);
      setCompletedTemplateIds((prev) => (prev.includes(nextWorkspace.id) ? prev : [...prev, nextWorkspace.id]));
    }
  };

  const openTemplate = (template: PerlerTemplate) => {
    commitWorkspace(createPerlerWorkspace(template));
    setSelectedTemplateId(template.id);
    setActiveCell(null);
    setShowFinalize(false);
  };

  return (
    <div className="perler-shell">
      <div className="perler-topbar">
        <div className="perler-topbar-copy">
          <strong>拼豆模板库</strong>
          <span>模板优先 / 导入图片转模板 / 右键擦除当前单元格</span>
        </div>
        <div className="perler-topbar-actions">
          <button className="perler-inline-btn" onClick={() => setShowImportWizard(true)}>导入图片</button>
          <button className="perler-inline-btn" onClick={onExit}>返回首页</button>
        </div>
      </div>

      <div className="perler-layout">
        <aside className="perler-left-panel">
          <div className="perler-panel-title">模板筛选</div>
          <div className="perler-filter-stack">
            <input
              className="perler-filter-input"
              value={filters.query}
              onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
              placeholder="搜索模板 / 标签"
            />
            <select value={filters.category} onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value as PerlerFilterState['category'] }))}>
              <option value="all">全部分类</option>
              <option value="basics">基础</option>
              <option value="office">办公室</option>
              <option value="games">游戏</option>
              <option value="abstract">抽象</option>
              <option value="hidden">隐藏</option>
            </select>
            <select value={filters.size} onChange={(event) => setFilters((prev) => ({ ...prev, size: event.target.value as PerlerFilterState['size'] }))}>
              <option value="all">全部尺寸</option>
              <option value="16">16×16</option>
              <option value="24">24×24</option>
              <option value="32">32×32</option>
              <option value="48">48×48</option>
            </select>
            <select value={filters.difficulty} onChange={(event) => setFilters((prev) => ({ ...prev, difficulty: event.target.value as PerlerFilterState['difficulty'] }))}>
              <option value="all">全部难度</option>
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
          </div>

          {workspace ? (
            <PerlerPalettePanel
              palette={palette}
              selectedColor={effectiveSelectedColor}
              completion={workspace.completion}
              templateTitle={workspace.title}
              onSelectColor={setSelectedColor}
              onImportClick={() => setShowImportWizard(true)}
              onBackToLibrary={() => {
                setWorkspace(null);
                setActiveCell(null);
                setShowFinalize(false);
              }}
            />
          ) : (
            <div className="perler-side-panel">
              <div className="perler-panel-title">最近状态</div>
              <div className="perler-meta-block">
                <div>模板总数：{templates.length}</div>
                <div>已完成：{completedTemplateIds.length}</div>
                <div>导入模板：{importedTemplates.length}</div>
              </div>
            </div>
          )}
        </aside>

        <main className="perler-main-panel">
          {workspace ? (
            <PerlerWorkspace
              workspace={workspace}
              selectedColor={effectiveSelectedColor}
              activeCell={activeCell}
              onPaint={(row, col) => {
                commitWorkspace(workspace ? applyColorToCell(workspace, row, col, effectiveSelectedColor) : workspace);
                setActiveCell({ row, col });
              }}
              onErase={(row, col) => {
                commitWorkspace(workspace ? eraseColorFromCell(workspace, row, col) : workspace);
                setActiveCell({ row, col });
              }}
              onSelectCell={setActiveCell}
            />
          ) : (
            <PerlerTemplateTable
              templates={filteredTemplates}
              selectedTemplateId={selectedTemplateId}
              completedTemplateIds={completedTemplateIds}
              onSelect={setSelectedTemplateId}
              onOpen={openTemplate}
            />
          )}
        </main>

        <aside className="perler-right-panel">
          <div className="perler-panel-title">模板信息</div>
          <div className="perler-meta-block">
            <div><strong>{workspace?.title || selectedTemplate?.title || '未选择模板'}</strong></div>
            <div>分类：{workspace ? templates.find((item) => item.id === workspace.id)?.category : selectedTemplate?.category || '-'}</div>
            <div>尺寸：{workspace ? `${workspace.width}×${workspace.height}` : selectedTemplate ? `${selectedTemplate.width}×${selectedTemplate.height}` : '-'}</div>
            <div>完成度：{workspace ? `${workspace.completion}%` : '—'}</div>
          </div>

          {workspace && (
            <>
              <div className="perler-panel-title">颜色使用</div>
              <div className="perler-usage-list">
                {Object.entries(usage).map(([color, count]) => (
                  <div key={color} className="perler-usage-row">
                    <span className="perler-usage-chip" style={{ background: color }} />
                    <span>{color}</span>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
            </>
          )}
        </aside>
      </div>

      <PerlerImportWizard
        isOpen={showImportWizard}
        onClose={() => setShowImportWizard(false)}
        onImportTemplate={(template) => {
          setImportedTemplates((prev) => [template, ...prev]);
          setSelectedTemplateId(template.id);
          setShowImportWizard(false);
          openTemplate(template);
        }}
      />

      <PerlerFinalizeFlow
        isOpen={showFinalize}
        title={workspace?.title || '已完成作品'}
        onClose={() => setShowFinalize(false)}
        onBackToLibrary={() => {
          setShowFinalize(false);
          setWorkspace(null);
          setActiveCell(null);
        }}
      />
    </div>
  );
};
