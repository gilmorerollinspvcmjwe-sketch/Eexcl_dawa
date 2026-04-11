import React, { useState } from 'react';
import { convertImageSourceToTemplate } from '../../features/perler/imageTemplateUtils';
import type { PerlerTemplate, PerlerThemeStyle } from '../../features/perler/perlerTypes';

interface PerlerImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTemplate: (template: PerlerTemplate) => void;
}

// 读取图片并先缩放成模板尺寸，再输出可照着拼的模板。
async function loadImageToTemplate(file: File, size: number, paletteSize: number, style: PerlerThemeStyle) {
  const imageUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imageUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法读取图片上下文');

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, 0, 0, size, size);
    const imageData = ctx.getImageData(0, 0, size, size);

    return convertImageSourceToTemplate(
      {
        title: file.name.replace(/\.[^.]+$/, ''),
        width: size,
        height: size,
        pixels: imageData.data,
      },
      paletteSize,
      style,
    );
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export const PerlerImportWizard: React.FC<PerlerImportWizardProps> = ({ isOpen, onClose, onImportTemplate }) => {
  const [file, setFile] = useState<File | null>(null);
  const [size, setSize] = useState(32);
  const [paletteSize, setPaletteSize] = useState(16);
  const [style, setStyle] = useState<PerlerThemeStyle>('standard');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="perler-modal-backdrop">
      <div className="perler-modal">
        <div className="perler-panel-title">导入图片转模板</div>
        <div className="perler-import-form">
          <label>
            选择图片
            <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          </label>
          <label>
            模板尺寸
            <select value={size} onChange={(event) => setSize(Number(event.target.value))}>
              {[16, 24, 32, 48].map((value) => (
                <option key={value} value={value}>{value}×{value}</option>
              ))}
            </select>
          </label>
          <label>
            色数
            <select value={paletteSize} onChange={(event) => setPaletteSize(Number(event.target.value))}>
              {[8, 16, 24, 32].map((value) => (
                <option key={value} value={value}>{value} 色</option>
              ))}
            </select>
          </label>
          <label>
            风格
            <select value={style} onChange={(event) => setStyle(event.target.value as PerlerThemeStyle)}>
              <option value="standard">标准像素化</option>
              <option value="contrast">高对比</option>
              <option value="soft">柔和拼豆风</option>
              <option value="retro">复古游戏机风</option>
            </select>
          </label>
          <div className="perler-import-note">生成结果会先变成模板，再让玩家对照模板逐格完成。</div>
        </div>
        <div className="perler-side-actions">
          <button className="perler-inline-btn" onClick={onClose}>取消</button>
          <button
            className="perler-inline-btn primary"
            disabled={!file || isLoading}
            onClick={async () => {
              if (!file) return;
              setIsLoading(true);
              try {
                const template = await loadImageToTemplate(file, size, paletteSize, style);
                onImportTemplate(template);
              } finally {
                setIsLoading(false);
              }
            }}
          >
            {isLoading ? '生成中...' : '生成模板'}
          </button>
        </div>
      </div>
    </div>
  );
};
