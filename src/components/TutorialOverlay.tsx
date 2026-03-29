import React from 'react';
import type { TutorialState } from '../hooks/useTutorial';

interface TutorialOverlayProps {
  tutorialState: TutorialState;
  onNext: () => void;
  onSkip: () => void;
  onClose: () => void;
}

const TUTORIAL_STEPS = [
  {
    title: '👋 欢迎来到 Excel Aim Trainer',
    content: '这是一个伪装成Excel表格的练枪游戏。让我们花1分钟了解基本操作。',
    highlight: null,
  },
  {
    title: '🎯 第一步：点击目标',
    content: '移动鼠标瞄准，点击鼠标左键射击目标。击中目标可以得分！',
    highlight: 'target',
  },
  {
    title: '⌨️ 第二步：紧急隐藏',
    content: '按 Esc 键或点击标题栏的 ─ 按钮，可以快速隐藏游戏。再按 Esc 恢复。',
    highlight: 'hide',
  },
  {
    title: '🎮 准备开始！',
    content: '教程完成！现在你可以选择游戏模式开始训练了。',
    highlight: null,
  },
];

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  tutorialState,
  onNext,
  onSkip,
  onClose,
}) => {
  const { currentStep, isActive } = tutorialState;

  if (!isActive) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 高亮区域 */}
      {step.highlight === 'target' && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 100,
            height: 100,
            borderRadius: '50%',
            boxShadow: '0 0 0 4px #22c55e, 0 0 0 8px rgba(34, 197, 94, 0.3), 0 0 50px rgba(34, 197, 94, 0.5)',
            animation: 'tutorialPulse 1.5s ease-in-out infinite',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            头
          </div>
        </div>
      )}

      {step.highlight === 'hide' && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 60,
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 4,
            boxShadow: '0 0 0 4px #3b82f6, 0 0 0 8px rgba(59, 130, 246, 0.3)',
            animation: 'tutorialPulse 1.5s ease-in-out infinite',
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 500 }}>─ 隐藏</span>
        </div>
      )}

      {/* 教程卡片 */}
      <div
        style={{
          background: 'white',
          borderRadius: 8,
          padding: '24px 32px',
          maxWidth: 400,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: '2px solid #107c41',
        }}
      >
        {/* 步骤指示器 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'center' }}>
          {TUTORIAL_STEPS.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: idx === currentStep ? '#107c41' : '#d1d5db',
              }}
            />
          ))}
        </div>

        {/* 标题 */}
        <h2
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#107c41',
            marginBottom: 12,
            textAlign: 'center',
          }}
        >
          {step.title}
        </h2>

        {/* 内容 */}
        <p
          style={{
            fontSize: 14,
            color: '#4b5563',
            lineHeight: 1.6,
            marginBottom: 24,
            textAlign: 'center',
          }}
        >
          {step.content}
        </p>

        {/* 按钮 */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          {!isLastStep && (
            <button
              onClick={onSkip}
              style={{
                padding: '8px 16px',
                background: '#f3f4f6',
                color: '#6b7280',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              跳过教程
            </button>
          )}
          <button
            onClick={isLastStep ? onClose : onNext}
            style={{
              padding: '8px 24px',
              background: '#107c41',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {isLastStep ? '开始游戏' : '下一步'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes tutorialPulse {
          0%, 100% {
            transform: ${step.highlight === 'target' ? 'translate(-50%, -50%) scale(1)' : 'scale(1)'};
            opacity: 1;
          }
          50% {
            transform: ${step.highlight === 'target' ? 'translate(-50%, -50%) scale(1.05)' : 'scale(1.05)'};
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
};

export default TutorialOverlay;
