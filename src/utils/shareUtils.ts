export interface ShareData {
  score: number;
  accuracy: number;
  headshotRate: number;
  maxCombo: number;
  duration: number;
  bestScore: number;
  bestAccuracy: number;
  bestCombo: number;
}

export function generateShareText(data: ShareData): string {
  const evaluation = getEvaluation(data);
  
  return `🎯 Excel Aim Trainer 训练报告 🎯

━━━━━━━━━━━━━━━━━━
📊 本局成绩
━━━━━━━━━━━━━━━━━━
🏆 得分：${data.score.toLocaleString()}
🎯 命中率：${data.accuracy.toFixed(1)}%
💥 爆头率：${data.headshotRate.toFixed(1)}%
🔥 最高连击：${data.maxCombo}x
⏱️ 训练时长：${data.duration}秒

━━━━━━━━━━━━━━━━━━
📈 个人最佳
━━━━━━━━━━━━━━━━━━
🏅 最高分：${data.bestScore.toLocaleString()}
🎯 最高命中率：${data.bestAccuracy.toFixed(1)}%
🔥 最长连击：${data.bestCombo}x

━━━━━━━━━━━━━━━━━━
💬 评价
━━━━━━━━━━━━━━━━━━
"${evaluation}"

🎮 来挑战我吧！
#ExcelAimTrainer #摸鱼练枪`;
}

function getEvaluation(data: ShareData): string {
  if (data.accuracy >= 95 && data.maxCombo >= 20) {
    return '神级操作！你是职业选手吗？';
  }
  if (data.accuracy >= 90) {
    return '精准射手！命中率惊人！';
  }
  if (data.maxCombo >= 30) {
    return '连击大师！手速爆表！';
  }
  if (data.headshotRate >= 80) {
    return '爆头专家！头部猎人认证！';
  }
  if (data.accuracy >= 80) {
    return '稳定发挥，继续保持！';
  }
  if (data.accuracy >= 70) {
    return '不错的表现，还有提升空间！';
  }
  if (data.maxCombo >= 10) {
    return '连击起步，潜力无限！';
  }
  return '继续练习，你一定可以！';
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}

export function shareToTwitter(text: string): void {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

export function shareToWeibo(text: string): void {
  const url = `https://service.weibo.com/share/share.php?title=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

export function formatPlayTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}秒`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}小时${minutes}分${secs}秒`;
  }
  return `${minutes}分${secs}秒`;
}

export function calculateTrend(history: { score: number; date: string }[]): {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
} {
  if (history.length < 2) {
    return { direction: 'stable', percentage: 0 };
  }
  
  const recent = history.slice(-5);
  const older = history.slice(-10, -5);
  
  if (older.length === 0) {
    return { direction: 'stable', percentage: 0 };
  }
  
  const recentAvg = recent.reduce((sum, g) => sum + g.score, 0) / recent.length;
  const olderAvg = older.reduce((sum, g) => sum + g.score, 0) / older.length;
  
  if (olderAvg === 0) {
    return { direction: 'stable', percentage: 0 };
  }
  
  const percentage = ((recentAvg - olderAvg) / olderAvg) * 100;
  
  if (percentage > 5) {
    return { direction: 'up', percentage: Math.abs(percentage) };
  }
  if (percentage < -5) {
    return { direction: 'down', percentage: Math.abs(percentage) };
  }
  return { direction: 'stable', percentage: Math.abs(percentage) };
}
