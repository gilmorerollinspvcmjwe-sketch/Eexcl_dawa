import React from 'react';

interface ExcelHeaderProps {
  isHidden: boolean;
  onToggleHidden: () => void;
  selectedCell?: { row: number; col: number } | null;
}

export const ExcelHeader: React.FC<ExcelHeaderProps> = ({ 
  isHidden, 
  onToggleHidden,
  selectedCell,
}) => {
  if (isHidden) return null;

  // 生成列字母
  const getColLetter = (col: number): string => {
    let result = '';
    let n = col;
    while (n > 0) {
      n--;
      result = String.fromCharCode(65 + (n % 26)) + result;
      n = Math.floor(n / 26);
    }
    return result;
  };

  const cellAddress = selectedCell 
    ? `${getColLetter(selectedCell.col)}${selectedCell.row}`
    : '';

  return (
    <div className="flex flex-col">
      {/* 标题栏 */}
      <div className="excel-titlebar">
        <div className="excel-titlebar-left">
          <div className="excel-titlebar-logo">X</div>
          <span className="excel-titlebar-title">Microsoft Excel - 练枪数据.xlsx</span>
        </div>
        <div className="excel-titlebar-controls">
          <button className="excel-titlebar-btn">─</button>
          <button className="excel-titlebar-btn">□</button>
          <button 
            className="excel-titlebar-btn close"
            onClick={onToggleHidden}
            title="紧急隐藏 (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 菜单栏 */}
      <div className="excel-menubar">
        <div className="excel-menu-item">文件(F)</div>
        <div className="excel-menu-item active">开始</div>
        <div className="excel-menu-item">插入</div>
        <div className="excel-menu-item">页面布局</div>
        <div className="excel-menu-item">公式</div>
        <div className="excel-menu-item">数据</div>
        <div className="excel-menu-item">审阅</div>
        <div className="excel-menu-item">视图</div>
        <div className="excel-menu-item">帮助</div>
      </div>

      {/* Ribbon 工具栏 */}
      <div className="excel-ribbon">
        <div className="excel-ribbon-tabs">
          <div className="excel-ribbon-tab active">开始</div>
          <div className="excel-ribbon-tab">插入</div>
          <div className="excel-ribbon-tab">页面布局</div>
          <div className="excel-ribbon-tab">公式</div>
          <div className="excel-ribbon-tab">数据</div>
          <div className="excel-ribbon-tab">审阅</div>
          <div className="excel-ribbon-tab">视图</div>
        </div>
        <div className="excel-ribbon-content">
          {/* 剪贴板组 */}
          <div className="excel-ribbon-group">
            <div className="excel-ribbon-buttons">
              <div className="flex flex-col items-center">
                <button className="excel-ribbon-btn" style={{ width: 40, height: 40 }}>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-base">📋</span>
                    <span className="text-xs">粘贴</span>
                  </div>
                </button>
              </div>
              <div className="flex flex-col gap-1">
                <button className="excel-ribbon-btn excel-ribbon-btn-small">
                  <span>✂</span>
                  <span className="ml-1">剪切</span>
                </button>
                <button className="excel-ribbon-btn excel-ribbon-btn-small">
                  <span>📄</span>
                  <span className="ml-1">复制</span>
                </button>
              </div>
            </div>
            <div className="excel-ribbon-group-label">剪贴板</div>
          </div>

          {/* 字体组 */}
          <div className="excel-ribbon-group">
            <div className="excel-ribbon-buttons">
              <select className="excel-ribbon-btn" style={{ width: 100, height: 22, fontSize: 11 }}>
                <option>Calibri</option>
                <option>宋体</option>
                <option>黑体</option>
                <option>Arial</option>
              </select>
              <select className="excel-ribbon-btn" style={{ width: 45, height: 22, fontSize: 11 }}>
                <option>11</option>
                <option>12</option>
                <option>14</option>
                <option>16</option>
              </select>
            </div>
            <div className="excel-ribbon-buttons" style={{ marginTop: 2 }}>
              <button className="excel-ribbon-btn" style={{ width: 24, height: 22, fontWeight: 'bold' }}>B</button>
              <button className="excel-ribbon-btn" style={{ width: 24, height: 22, fontStyle: 'italic' }}>I</button>
              <button className="excel-ribbon-btn" style={{ width: 24, height: 22, textDecoration: 'underline' }}>U</button>
              <div style={{ width: 1, height: 16, background: '#d4d4d4', margin: '0 2px' }} />
              <button className="excel-ribbon-btn" style={{ width: 24, height: 22 }}>—</button>
              <button className="excel-ribbon-btn" style={{ width: 24, height: 22 }}> Borders</button>
            </div>
            <div className="excel-ribbon-group-label">字体</div>
          </div>

          {/* 对齐组 */}
          <div className="excel-ribbon-group">
            <div className="excel-ribbon-buttons">
              <button className="excel-ribbon-btn" style={{ width: 24, height: 22 }} title="顶端对齐">⤒</button>
              <button className="excel-ribbon-btn" style={{ width: 24, height: 22 }} title="垂直居中">≡</button>
              <button className="excel-ribbon-btn" style={{ width: 24, height: 22 }} title="底端对齐">⤓</button>
            </div>
            <div className="excel-ribbon-buttons" style={{ marginTop: 2 }}>
              <button className="excel-ribbon-btn" style={{ width: 24, height: 22 }} title="左对齐">⫷</button>
              <button className="excel-ribbon-btn" style={{ width: 24, height: 22 }} title="居中">☰</button>
              <button className="excel-ribbon-btn" style={{ width: 24, height: 22 }} title="右对齐">⫸</button>
            </div>
            <div className="excel-ribbon-group-label">对齐方式</div>
          </div>

          {/* 数字组 */}
          <div className="excel-ribbon-group">
            <div className="excel-ribbon-buttons">
              <select className="excel-ribbon-btn" style={{ width: 80, height: 22, fontSize: 11 }}>
                <option>常规</option>
                <option>数字</option>
                <option>货币</option>
                <option>百分比</option>
              </select>
            </div>
            <div className="excel-ribbon-buttons" style={{ marginTop: 2 }}>
              <button className="excel-ribbon-btn" style={{ width: 24, height: 22 }}>$</button>
              <button className="excel-ribbon-btn" style={{ width: 24, height: 22 }}>%</button>
              <button className="excel-ribbon-btn" style={{ width: 24, height: 22 }}>,00</button>
            </div>
            <div className="excel-ribbon-group-label">数字</div>
          </div>

          {/* 样式组 */}
          <div className="excel-ribbon-group">
            <div className="excel-ribbon-buttons">
              <button className="excel-ribbon-btn excel-ribbon-btn-small" style={{ width: 60 }}>条件格式</button>
              <button className="excel-ribbon-btn excel-ribbon-btn-small" style={{ width: 40 }}>套用...</button>
            </div>
            <div className="excel-ribbon-buttons" style={{ marginTop: 2 }}>
              <button className="excel-ribbon-btn excel-ribbon-btn-small" style={{ width: 50 }}>单元格...</button>
            </div>
            <div className="excel-ribbon-group-label">样式</div>
          </div>

          {/* 单元格组 */}
          <div className="excel-ribbon-group">
            <div className="excel-ribbon-buttons">
              <button className="excel-ribbon-btn excel-ribbon-btn-small" style={{ width: 40 }}>插入</button>
              <button className="excel-ribbon-btn excel-ribbon-btn-small" style={{ width: 40 }}>删除</button>
            </div>
            <div className="excel-ribbon-buttons" style={{ marginTop: 2 }}>
              <button className="excel-ribbon-btn excel-ribbon-btn-small" style={{ width: 50 }}>格式</button>
            </div>
            <div className="excel-ribbon-group-label">单元格</div>
          </div>

          {/* 编辑组 */}
          <div className="excel-ribbon-group">
            <div className="excel-ribbon-buttons">
              <button className="excel-ribbon-btn excel-ribbon-btn-small" style={{ width: 40 }}>求和</button>
              <button className="excel-ribbon-btn excel-ribbon-btn-small" style={{ width: 40 }}>填充</button>
            </div>
            <div className="excel-ribbon-buttons" style={{ marginTop: 2 }}>
              <button className="excel-ribbon-btn excel-ribbon-btn-small" style={{ width: 60 }}>查找和选择</button>
            </div>
            <div className="excel-ribbon-group-label">编辑</div>
          </div>
        </div>
      </div>

      {/* 公式栏 */}
      <div className="excel-formula-bar">
        <div className="excel-name-box">
          <span>{cellAddress || 'A1'}</span>
        </div>
        <div className="excel-formula-separator" />
        <div className="excel-function-btn" title="插入函数">fx</div>
        <div className="excel-formula-input">
          <span style={{ color: '#888' }}>=练习瞄准中...</span>
        </div>
      </div>
    </div>
  );
};