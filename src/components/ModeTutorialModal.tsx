import React from 'react';

interface ModeTutorialModalProps {
  mode: string;
  modeName: string;
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

const MODE_TUTORIALS: Record<string, { title: string; description: string; tips: string[] }> = {
  timed: {
    title: '⏱️ 限时模式',
    description: '在限定时间内尽可能多地击中目标，连击可获得更高分数！',
    tips: ['保持节奏，不要慌乱', '连击可以获得额外分数', '优先击中头部获得更高分'],
  },
  endless: {
    title: '♾️ 无限模式',
    description: '没有时间和生命限制，适合放松练习。失误3次游戏结束。',
    tips: ['保持专注，避免连续失误', '适合练习跟枪和反应', '失误后不要急躁，调整呼吸'],
  },
  zen: {
    title: '🧘 禅模式',
    description: '无压力练习，没有时间限制，专注于精准度和肌肉记忆。',
    tips: ['放慢节奏，注重每一次射击的质量', '适合练习爆头精准度', '没有得分压力，放松心态'],
  },
  headshot: {
    title: '🎯 爆头线模式',
    description: '所有目标都在同一高度（爆头线），练习爆头肌肉记忆。',
    tips: ['保持准星在爆头线附近', '练习快速拉枪到固定高度', '适合养成爆头习惯'],
  },
  motion_track: {
    title: '🏃 移动射击',
    description: '目标会移动，需要预判位置进行射击。',
    tips: ['预判目标的移动方向', '准星放在目标前方', '根据速度调整提前量'],
  },
  peek_shot: {
    title: '👀 拐角射击',
    description: '目标会从边缘探头，抓住时机快速射击。',
    tips: ['保持注意力在边缘', '目标露头瞬间立即射击', '反应速度是关键'],
  },
  switch_track: {
    title: '🔄 目标切换',
    description: '多个目标同时出现，练习快速切换瞄准。',
    tips: ['按优先级顺序射击', '快速移动准星到下一个目标', '保持流畅的节奏'],
  },
  reaction: {
    title: '⚡ 反应测试',
    description: '测试你的反应速度，目标出现后尽快点击。',
    tips: ['保持注意力集中', '手指放在鼠标上准备', '不要预判，看到再点'],
  },
  precision: {
    title: '🎯 精准射击',
    description: '目标更小，移动更快，练习极致精准度。',
    tips: ['放慢速度，确保命中', '微调准星位置', '稳定鼠标控制'],
  },
  survival: {
    title: '❤️ 生存模式',
    description: '你有3点生命值，失误会扣血，血量为0时游戏结束。',
    tips: ['谨慎射击，避免失误', '优先保证命中率', '随着时间推移难度会增加'],
  },
  headshot_only: {
    title: '💀 仅头部模式',
    description: '只有击中头部算分！其他部位无效。',
    tips: ['只瞄准头部', '忽略身体部位', '练习极致精准度'],
  },
  practice: {
    title: '📚 练习模式',
    description: '无压力练习环境，熟悉各种操作。',
    tips: ['没有时间和生命限制', '可以反复练习', '适合新手入门'],
  },
};

export const ModeTutorialModal: React.FC<ModeTutorialModalModalProps> = ({
  mode,
  modeName,
  isOpen,
  onClose,
  onStart,
}) => {
  if (!isOpen) return null;

  const tutorial = MODE_TUTORIALS[mode] || {
    title: modeName,
    description: '开始游戏，挑战你的极限！',
    tips: ['保持专注', '享受游戏'],
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 8,
          padding: '28px 32px',
          maxWidth: 450,
          width: '90%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: '2px solid #107c41',
        }}
      >
        {/* 标题 */}
        <h2
          style={{
            fontSize: 22,
            fontWeight: 'bold',
            color: '#107c41',
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          {tutorial.title}
        </h2>

        {/* 描述 */}
        <p
          style={{
            fontSize: 15,
            color: '#374151',
            lineHeight: 1.6,
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          {tutorial.description}
        </p>

        {/* 提示 */}
        <div
          style={{
            background: '#f0fdf4',
            borderRadius: 6,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <h3
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#107c41',
              marginBottom: 8,
            }}
          >
            💡 游戏技巧
          </h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {tutorial.tips.map((tip, idx) => (
              <li
                key={idx}
                style={{
                  fontSize: 13,
                  color: '#4b5563',
                  marginBottom: 4,
                  lineHeight: 1.5,
                }}
              >
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* 按钮 */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#f3f4f6',
              color: '#6b7280',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            取消
          </button>
          <button
            onClick={onStart}
            style={{
              padding: '10px 28px',
              background: '#107c41',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            开始游戏
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeTutorialModal;
