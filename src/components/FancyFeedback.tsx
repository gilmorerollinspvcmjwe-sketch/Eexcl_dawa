import React from 'react';
import type { FeedbackMessage } from '../utils/feedbackMessages';

interface FancyFeedbackProps {
  feedback: FeedbackMessage | null;
}

export const FancyFeedback: React.FC<FancyFeedbackProps> = ({ feedback }) => {
  if (!feedback) return null;

  const getAnimationClass = (type: string) => {
    switch (type) {
      case 'combo':
        return 'fancy-feedback-combo';
      case 'headshot':
        return 'fancy-feedback-headshot';
      case 'miss':
        return 'fancy-feedback-miss';
      case 'achievement':
        return 'fancy-feedback-achievement';
      default:
        return 'fancy-feedback-default';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'combo':
        return '🔥';
      case 'headshot':
        return '💥';
      case 'miss':
        return '💨';
      case 'achievement':
        return '🏆';
      case 'encouragement':
        return '💪';
      default:
        return '✨';
    }
  };

  return (
    <div className={`fancy-feedback-container ${getAnimationClass(feedback.type)}`}>
      <div className="fancy-feedback-icon">{getIcon(feedback.type)}</div>
      <div className="fancy-feedback-text">{feedback.text}</div>
      {feedback.type === 'combo' && (
        <div className="fancy-feedback-particles">
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i} 
              className="fancy-particle"
              style={{
                animationDelay: `${i * 0.05}s`,
                transform: `rotate(${i * 45}deg)`,
              }}
            />
          ))}
        </div>
      )}
      {feedback.type === 'headshot' && (
        <div className="fancy-feedback-glow" />
      )}
      {feedback.type === 'achievement' && (
        <div className="fancy-feedback-confetti">
          {Array.from({ length: 12 }).map((_, i) => (
            <div 
              key={i} 
              className="fancy-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: ['#22c55e', '#f59e0b', '#8b5cf6', '#3b82f6', '#ef4444'][i % 5],
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FancyFeedback;
