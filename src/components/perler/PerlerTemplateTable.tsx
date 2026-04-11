import React from 'react';
import type { PerlerTemplate } from '../../features/perler/perlerTypes';

interface PerlerTemplateTableProps {
  templates: PerlerTemplate[];
  selectedTemplateId: string | null;
  completedTemplateIds: string[];
  onSelect: (templateId: string) => void;
  onOpen: (template: PerlerTemplate) => void;
}

export const PerlerTemplateTable: React.FC<PerlerTemplateTableProps> = ({
  templates,
  selectedTemplateId,
  completedTemplateIds,
  onSelect,
  onOpen,
}) => {
  return (
    <table className="perler-template-table">
      <thead>
        <tr>
          <th>模板名</th>
          <th>分类</th>
          <th>尺寸</th>
          <th>难度</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {templates.map((template) => {
          const completed = completedTemplateIds.includes(template.id);
          return (
            <tr
              key={template.id}
              className={selectedTemplateId === template.id ? 'selected' : ''}
              onClick={() => onSelect(template.id)}
              onDoubleClick={() => onOpen(template)}
            >
              <td>{template.title}</td>
              <td>{template.category}</td>
              <td>{template.width}×{template.height}</td>
              <td>{template.difficulty}</td>
              <td>{completed ? '已完成' : '未完成'}</td>
              <td>
                <button
                  className="perler-inline-btn"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpen(template);
                  }}
                >
                  {completed ? '查看' : '开始'}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

