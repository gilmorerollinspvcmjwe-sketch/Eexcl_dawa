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
    </div>
  );
};

export default FancyFeedback;
