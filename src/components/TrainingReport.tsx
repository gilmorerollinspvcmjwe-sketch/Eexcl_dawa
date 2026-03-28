// P1-5: FPS 训练报告组件 - 训练结束后显示详细报告

import React, { useMemo } from 'react';
import type { FPSTrainingScore } from '../hooks/useFPSTraining';

interface TrainingReportProps {
  score: FPSTrainingScore;
  mode: string;
  duration: number;
  onClose: () => void;
  onRestart: () => void;
}

// 评级配置
const GRADE_CONFIG = [
  { minAccuracy: 95, minAvgReaction: 180, grade: 'S', color: '#fbbf24', icon: '🏆' },
  { minAccuracy: 85, minAvgReaction: 220, grade: 'A', color: '#22c55e', icon: '🌟' },
  { minAccuracy: 75, minAvgReaction: 280, grade: 'B', color: '#3b82f6', icon: '✨' },
  { minAccuracy: 60, minAvgReaction: 350, grade: 'C', color: '#f97316', icon: '💪' },
  { minAccuracy: 40, minAvgReaction: 500, grade: 'D', color: '#ef4444', icon: '📈' },
];

// 计算评级
function calculateGrade(score: FPSTrainingScore): { grade: string; color: string; icon: string } {
  for (const config of GRADE_CONFIG) {
    if (score.accuracy >= config.minAccuracy && score.avgReactionTime <= config.minAvgReaction) {
      return { grade: config.grade, color: config.color, icon: config.icon };
    }
  }
  return { grade: 'D', color: '#ef4444', icon: '📈' };
}

// 生成改进建议
function generateSuggestions(score: FPSTrainingScore, mode: string): string[] {
  const suggestions: string[] = [];

  if (score.accuracy < 70) {
    suggestions.push('💡 建议降低游戏难度，先提高命中率再追求速度');
  }

  if (score.avgReactionTime > 300) {
    suggestions.push('⚡ 反应时间较长，建议多做"反应测试"专项训练');
  }

  if (mode === 'switch_track' && score.correctOrderHits !== undefined) {
    const correctRate = score.correctOrderHits / (score.hits || 1);
    if (correctRate < 0.7) {
      suggestions.push('🔄 目标切换顺序准确率较低，建议优先击杀红色优先级目标');
    }
  }

  if (mode === 'motion_track' && score.trackingSmoothness !== undefined) {
    if (score.trackingSmoothness < 0.7) {
      suggestions.push('🎯 跟枪平滑度不足，建议使用"移动射击"训练跟枪手感');
    }
  }

  if (suggestions.length === 0) {
    suggestions.push('🎉 表现优秀！继续挑战更高难度或尝试其他训练模式');
  }

  return suggestions;
}

export const TrainingReport: React.FC<TrainingReportProps> = ({
  score,
  mode,
  duration,
  onClose,
  onRestart,
}) => {
  const grade = useMemo(() => calculateGrade(score), [score]);
  const suggestions = useMemo(() => generateSuggestions(score, mode), [score, mode]);

  // 模式名称映射
  const modeNames: Record<string, string> = {
    motion_track: '移动射击',
    peek_shot: '拐角射击',
    switch_track: '目标切换',
    reaction: '反应测试',
    precision: '精准射击',
  };

  return (
    <div 
      className="training-report-overlay"
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
        className="training-report-modal"
        style={{
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: 16,
          padding: 32,
          maxWidth: 600,
          width: '90%',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          color: 'white',
          animation: 'fadeIn 0.3s ease-out',
        }}
      >
        {/* 标题 */}
        <div 
          style={{
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          <h1 
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 700,
              color: '#f1f5f9',
            }}
          >
            📊 训练报告
          </h1>
          <p 
            style={{
              margin: '8px 0 0 0',
              fontSize: 14,
              color: '#94a3b8',
            }}
          >
            {modeNames[mode] || mode} · {duration}秒
          </p>
        </div>

        {/* 评级展示 */}
        <div 
          style={{
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 32px',
              background: `linear-gradient(135deg, ${grade.color}33 0%, ${grade.color}11 100%)`,
              borderRadius: 12,
              border: `2px solid ${grade.color}`,
            }}
          >
            <span style={{ fontSize: 32 }}>{grade.icon}</span>
            <span 
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: grade.color,
              }}
            >
              {grade.grade}
            </span>
          </div>
        </div>

        {/* 统计数据 */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16,
            marginBottom: 24,
          }}
        >
          {/* 命中统计 */}
          <div 
            style={{
              padding: 16,
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>命中统计</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#22c55e' }}>
              {score.hits} / {score.hits + score.misses}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              命中率: {score.accuracy.toFixed(1)}%
            </div>
          </div>

          {/* 反应时间 */}
          <div 
            style={{
              padding: 16,
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>平均反应时间</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>
              {Math.round(score.avgReactionTime)}ms
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              最佳: {Math.round(score.bestReactionTime)}ms
            </div>
          </div>

          {/* Switch Track 专属统计 */}
          {mode === 'switch_track' && score.correctOrderHits !== undefined && (
            <div 
              style={{
                padding: 16,
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 8,
              }}
            >
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>正确顺序击中</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#8b5cf6' }}>
                {score.correctOrderHits} / {score.hits}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                错误顺序: {score.wrongOrderHits || 0}
              </div>
            </div>
          )}

          {/* Motion Track 专属统计 */}
          {mode === 'motion_track' && score.trackingSmoothness !== undefined && (
            <div 
              style={{
                padding: 16,
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 8,
              }}
            >
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>跟枪平滑度</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#ea580c' }}>
                {Math.round(score.trackingSmoothness * 100)}%
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                理想值: 90%+
              </div>
            </div>
          )}
        </div>

        {/* 改进建议 */}
        <div 
          style={{
            padding: 16,
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 8,
            marginBottom: 24,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 8 }}>
            📝 改进建议
          </div>
          <ul style={{ margin: 0, padding: '0 0 0 16px', color: '#94a3b8', fontSize: 13 }}>
            {suggestions.map((s, i) => (
              <li key={i} style={{ marginBottom: 4 }}>{s}</li>
            ))}
          </ul>
        </div>

        {/* 按钮区 */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: 8,
              color: '#94a3b8',
              fontSize: 14,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            关闭
          </button>
          <button
            onClick={onRestart}
            style={{
              padding: '12px 32px',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              border: 'none',
              borderRadius: 8,
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
            }}
          >
            🔄 再练一次
          </button>
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
    </div>
  );
};

export default TrainingReport;