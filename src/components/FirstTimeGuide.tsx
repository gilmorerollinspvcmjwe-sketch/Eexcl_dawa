// 新手引导组件 - P0-3 首次进入显示 Quick Start 弹窗

import React, { useState, useEffect } from 'react';

interface FirstTimeGuideProps {
  onComplete: () => void;
}

const GUIDE_STEPS = [
  {
    title: '欢迎来到 Excel Aim Trainer!',
    content: '一个伪装成 Excel 表格的瞄准训练工具，让你在办公室也能偷偷练枪！',
    icon: '🎮',
  },
  {
    title: '基本操作',
    content: '点击格子中出现的红色目标来得分。不同部位有不同分数：头部最高（150分），身体次之（100分），手脚较低。',
    icon: '🎯',
  },
  {
    title: '连击系统',
    content: '连续命中目标可以获得连击倍率加成！连击越高，倍率越大。最高可达 4.0 倍！',
    icon: '🔥',
  },
  {
    title: '快捷键',
    content: '• Esc = 紧急隐藏（切换到"Excel工作表"模式）\n• F5 = 恢复游戏\n• P = 暂停/继续\n• 左上角悬停 3 秒 = 快速隐藏',
    icon: '⌨️',
  },
  {
    title: '训练模式',
    content: '我们提供多种 FPS 专项训练模式：\n• 移动射击 - 训练跟枪能力\n• 拐角射击 - 训练预瞄反应\n• 目标切换 - 训练多目标处理\n• 反应测试 - 测量纯反应时间\n• 精准射击 - 训练微小目标精准度',
    icon: '📊',
  },
  {
    title: '准备好了吗？',
    content: '点击下方"开始练习"按钮，开始你的瞄准训练之旅！\n祝你早日成为爆头大师！',
    icon: '🚀',
  },
];

export const FirstTimeGuide: React.FC<FirstTimeGuideProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // 检查是否首次进入
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('excel-aim-first-time-seen');
    if (hasSeenGuide === 'true') {
      setIsVisible(false);
      onComplete();
    }
  }, [onComplete]);

  const handleNext = () => {
    if (currentStep < GUIDE_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStart = () => {
    // 标记已看过引导
    localStorage.setItem('excel-aim-first-time-seen', 'true');
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem('excel-aim-first-time-seen', 'true');
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  const step = GUIDE_STEPS[currentStep];

  return (
    <div 
      className="first-time-guide-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div 
        className="first-time-guide-modal"
        style={{
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: 16,
          padding: 32,
          maxWidth: 500,
          width: '90%',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          color: 'white',
          animation: 'fadeIn 0.3s ease-out',
        }}
      >
        {/* 进度指示器 */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 24,
          }}
        >
          {GUIDE_STEPS.map((_, i) => (
            <div 
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: i === currentStep ? '#3b82f6' : i < currentStep ? '#60a5fa' : '#374151',
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>

        {/* 图标 */}
        <div 
          style={{
            textAlign: 'center',
            fontSize: 48,
            marginBottom: 16,
          }}
        >
          {step.icon}
        </div>

        {/* 标题 */}
        <h2 
          style={{
            textAlign: 'center',
            margin: '0 0 16px 0',
            fontSize: 22,
            fontWeight: 700,
            color: '#f1f5f9',
          }}
        >
          {step.title}
        </h2>

        {/* 内容 */}
        <div 
          style={{
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: 14,
            lineHeight: 1.8,
            marginBottom: 24,
            whiteSpace: 'pre-line',
          }}
        >
          {step.content}
        </div>

        {/* 按钮区 */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          {/* 上一步 */}
          {currentStep > 0 ? (
            <button
              onClick={handlePrev}
              style={{
                padding: '12px 20px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: 8,
                color: '#94a3b8',
                fontSize: 14,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              ← 上一步
            </button>
          ) : (
            <button
              onClick={handleSkip}
              style={{
                padding: '12px 20px',
                background: 'transparent',
                border: 'none',
                color: '#6b7280',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              跳过引导
            </button>
          )}

          {/* 下一步 / 开始练习 */}
          {currentStep < GUIDE_STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                border: 'none',
                borderRadius: 8,
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.1s',
              }}
            >
              下一步 →
            </button>
          ) : (
            <button
              onClick={handleStart}
              style={{
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                border: 'none',
                borderRadius: 8,
                color: 'white',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
              }}
            >
              🎯 开始练习
            </button>
          )}
        </div>

        {/* 提示 */}
        <div 
          style={{
            textAlign: 'center',
            marginTop: 16,
            fontSize: 11,
            color: '#4b5563',
          }}
        >
          按 Esc 或点击"跳过引导"可跳过此教程
        </div>
      </div>

      {/* CSS 动画 */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default FirstTimeGuide;