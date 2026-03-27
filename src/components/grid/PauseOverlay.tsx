// 暂停覆盖层组件

import React from 'react';

interface PauseOverlayProps {
  onResume: () => void;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({ onResume }) => {
  return (
    <div 
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div 
        style={{
          background: 'white',
          padding: '24px 48px',
          borderRadius: 8,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#107c41', marginBottom: 8 }}>
          ⏸️ 游戏暂停
        </div>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
          按 P 键或点击下方按钮继续
        </div>
        <button
          onClick={onResume}
          style={{
            background: '#107c41',
            color: 'white',
            border: 'none',
            padding: '8px 24px',
            borderRadius: 4,
            fontSize: 14,
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          继续游戏
        </button>
      </div>
    </div>
  );
};