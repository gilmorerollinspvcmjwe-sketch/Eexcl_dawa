import React, { useMemo } from 'react';
import type { GameStats } from '../types';

interface StatsPanelProps {
  stats: GameStats;
  onReset: () => void;
  onExit?: () => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, onReset, onExit }) => {
  // 生成趋势图数据
  const trendData = useMemo(() => {
    const recent = stats.gamesHistory.slice(-10);
    if (recent.length === 0) return [];
    
    const maxScore = Math.max(...recent.map(g => g.score), 1);
    return recent.map((game, i) => ({
      ...game,
      index: i + 1,
      height: (game.score / maxScore) * 100,
    }));
  }, [stats.gamesHistory]);

  // 模式统计柱状图数据
  const modeData = useMemo(() => [
    { mode: '限时' as const, stat: stats.modeStats.timed, color: '#107c41' },
    { mode: '无限' as const, stat: stats.modeStats.endless, color: '#2563eb' },
    { mode: '禅' as const, stat: stats.modeStats.zen, color: '#7c3aed' },
    { mode: '爆头' as const, stat: stats.modeStats.headshot, color: '#dc2626' },
  ].filter(m => m.stat.gamesPlayed > 0), [stats.modeStats]);

  const maxModeScore = Math.max(...modeData.map(m => m.stat.bestScore || 1), 1);

  // 列字母
  const colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  return (
    <div className="excel-grid-container stats-panel-container">
      <div className="excel-grid-wrapper stats-panel-wrapper" style={{ padding: 0 }}>
        <table className="excel-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th className="excel-corner-cell" />
              {colLetters.map(letter => (
                <th key={letter} className="excel-col-header">{letter}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* 标题行 */}
            <tr>
              <td className="excel-row-header">1</td>
              <td 
                className="excel-cell" 
                colSpan={11} 
                style={{ 
                  textAlign: 'center', 
                  fontWeight: 'bold', 
                  fontSize: 14, 
                  color: '#107c41',
                  background: 'linear-gradient(180deg, #e6f4ea 0%, #d4edda 100%)',
                  borderBottom: '2px solid #107c41',
                }}
              >
                练枪数据分析表
              </td>
            </tr>

            {/* 总览统计 */}
            <tr>
              <td className="excel-row-header">2</td>
              <td className="excel-cell" colSpan={11} style={{ background: '#107c41', color: 'white', fontWeight: 'bold', paddingLeft: 8 }}>
                📊 总览统计
              </td>
            </tr>

            <tr>
              <td className="excel-row-header">3</td>
              <td className="excel-cell" style={{ fontWeight: 500, background: '#f8f9fa' }}>总场次</td>
              <td className="excel-cell" style={{ textAlign: 'center', fontWeight: 'bold', color: '#107c41', fontSize: 16 }}>
                {stats.totalGames}
              </td>
              <td className="excel-cell" style={{ fontWeight: 500, background: '#f8f9fa' }}>总得分</td>
              <td className="excel-cell" style={{ textAlign: 'center', fontWeight: 'bold', color: '#107c41', fontSize: 16 }}>
                {stats.totalScore.toLocaleString()}
              </td>
              <td className="excel-cell" style={{ fontWeight: 500, background: '#f8f9fa' }}>最高连击</td>
              <td className="excel-cell" style={{ textAlign: 'center', fontWeight: 'bold', color: '#f97316', fontSize: 16 }}>
                {stats.maxCombo}x
              </td>
              <td className="excel-cell" style={{ fontWeight: 500, background: '#f8f9fa' }}>平均分</td>
              <td className="excel-cell" style={{ textAlign: 'center', fontWeight: 'bold', color: '#2563eb', fontSize: 16 }}>
                {Math.round(stats.avgScore).toLocaleString()}
              </td>
              <td className="excel-cell" />
              <td className="excel-cell" />
              <td className="excel-cell" />
              <td className="excel-cell" />
            </tr>

            {/* 命中率 */}
            <tr>
              <td className="excel-row-header">4</td>
              <td className="excel-cell" style={{ fontWeight: 500, background: '#f8f9fa' }}>总命中率</td>
              <td className="excel-cell" colSpan={2}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 8, background: '#e5e7eb', borderRadius: 4 }}>
                    <div 
                      style={{ 
                        width: `${Math.min(100, stats.accuracy)}%`, 
                        height: '100%', 
                        background: '#107c41', 
                        borderRadius: 4,
                        transition: 'width 0.3s',
                      }} 
                    />
                  </div>
                  <span style={{ fontWeight: 'bold', color: '#107c41' }}>{stats.accuracy.toFixed(1)}%</span>
                </div>
              </td>
              <td className="excel-cell" style={{ fontWeight: 500, background: '#f8f9fa' }}>爆头率</td>
              <td className="excel-cell" colSpan={2}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 8, background: '#e5e7eb', borderRadius: 4 }}>
                    <div 
                      style={{ 
                        width: `${Math.min(100, stats.headAccuracy)}%`, 
                        height: '100%', 
                        background: '#dc2626', 
                        borderRadius: 4,
                        transition: 'width 0.3s',
                      }} 
                    />
                  </div>
                  <span style={{ fontWeight: 'bold', color: '#dc2626' }}>{stats.headAccuracy.toFixed(1)}%</span>
                </div>
              </td>
              <td className="excel-cell" />
              <td className="excel-cell" />
              <td className="excel-cell" />
              <td className="excel-cell" />
              <td className="excel-cell" />
            </tr>

            {/* 空行 */}
            <tr>
              <td className="excel-row-header">5</td>
              {Array.from({ length: 11 }).map((_, i) => (
                <td key={i} className="excel-cell" />
              ))}
            </tr>

            {/* 得分趋势图 */}
            <tr>
              <td className="excel-row-header">6</td>
              <td className="excel-cell" colSpan={11} style={{ background: '#2563eb', color: 'white', fontWeight: 'bold', paddingLeft: 8 }}>
                📈 得分趋势 (最近10场)
              </td>
            </tr>

            <tr>
              <td className="excel-row-header">7</td>
              <td className="excel-cell" colSpan={11} style={{ height: 120, verticalAlign: 'bottom', padding: '8px 16px' }}>
                {trendData.length > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: '100%', paddingBottom: 20 }}>
                    {trendData.map((game, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                        <div 
                          style={{ 
                            width: '100%', 
                            height: `${game.height}%`, 
                            background: 'linear-gradient(180deg, #21a366 0%, #107c41 100%)',
                            borderRadius: '2px 2px 0 0',
                            minHeight: 4,
                            position: 'relative',
                          }}
                        >
                          <span style={{
                            position: 'absolute',
                            top: -18,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: 10,
                            fontWeight: 'bold',
                            color: '#333',
                            whiteSpace: 'nowrap',
                          }}>
                            {game.score}
                          </span>
                        </div>
                        <span style={{ fontSize: 9, color: '#666', marginTop: 4 }}>
                          #{game.index}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
                    暂无数据，开始游戏后显示
                  </div>
                )}
              </td>
            </tr>

            {/* 空行 */}
            <tr>
              <td className="excel-row-header">8</td>
              {Array.from({ length: 11 }).map((_, i) => (
                <td key={i} className="excel-cell" />
              ))}
            </tr>

            {/* 模式对比 */}
            <tr>
              <td className="excel-row-header">9</td>
              <td className="excel-cell" colSpan={11} style={{ background: '#7c3aed', color: 'white', fontWeight: 'bold', paddingLeft: 8 }}>
                🎮 各模式表现对比
              </td>
            </tr>

            <tr>
              <td className="excel-row-header">10</td>
              <td className="excel-cell" style={{ fontWeight: 500, background: '#f8f9fa' }}>模式</td>
              <td className="excel-cell" style={{ fontWeight: 500, background: '#f8f9fa' }}>场次</td>
              <td className="excel-cell" style={{ fontWeight: 500, background: '#f8f9fa' }}>平均分</td>
              <td className="excel-cell" style={{ fontWeight: 500, background: '#f8f9fa' }}>最高分</td>
              <td className="excel-cell" style={{ fontWeight: 500, background: '#f8f9fa' }}>命中率</td>
              <td className="excel-cell" colSpan={6} style={{ fontWeight: 500, background: '#f8f9fa' }}>最高分柱状图</td>
            </tr>

            {modeData.length > 0 ? modeData.map((m, i) => (
              <tr key={i}>
                <td className="excel-row-header">{11 + i}</td>
                <td className="excel-cell" style={{ fontWeight: 500, color: m.color }}>{m.mode}模式</td>
                <td className="excel-cell" style={{ textAlign: 'center' }}>{m.stat.gamesPlayed}</td>
                <td className="excel-cell" style={{ textAlign: 'center' }}>{Math.round(m.stat.avgScore)}</td>
                <td className="excel-cell" style={{ textAlign: 'center', fontWeight: 'bold', color: m.color }}>
                  {m.stat.bestScore.toLocaleString()}
                </td>
                <td className="excel-cell" style={{ textAlign: 'center' }}>
                  {m.stat.avgAccuracy.toFixed(1)}%
                </td>
                <td className="excel-cell" colSpan={6}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 12, background: '#e5e7eb', borderRadius: 2 }}>
                      <div 
                        style={{ 
                          width: `${(m.stat.bestScore / maxModeScore) * 100}%`, 
                          height: '100%', 
                          background: m.color, 
                          borderRadius: 2,
                        }} 
                      />
                    </div>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td className="excel-row-header">11</td>
                <td className="excel-cell" colSpan={11} style={{ textAlign: 'center', color: '#9ca3af' }}>
                  暂无模式数据
                </td>
              </tr>
            )}

            {/* 空行 */}
            <tr>
              <td className="excel-row-header">15</td>
              {Array.from({ length: 11 }).map((_, i) => (
                <td key={i} className="excel-cell" />
              ))}
            </tr>

            {/* 历史记录 */}
            <tr>
              <td className="excel-row-header">16</td>
              <td className="excel-cell" colSpan={10} style={{ background: '#f97316', color: 'white', fontWeight: 'bold', paddingLeft: 8 }}>
                📋 最近游戏记录
              </td>
              <td className="excel-cell" style={{ background: '#f97316', textAlign: 'center' }}>
                <button
                  onClick={onReset}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    padding: '2px 8px',
                    borderRadius: 2,
                    cursor: 'pointer',
                    fontSize: 10,
                  }}
                >
                  重置
                </button>
              </td>
            </tr>

            <tr>
              <td className="excel-row-header">17</td>
              <td className="excel-cell" style={{ fontWeight: 500, background: '#f8f9fa' }}>序号</td>
              <td className="excel-cell" style={{ fontWeight: 500, background: '#f8f9fa' }}>日期</td>
              <td className="excel-cell" style={{ fontWeight: 500, background: '#f8f9fa' }}>模式</td>
              <td className="excel-cell" style={{ fontWeight: 500, background: '#f8f9fa' }}>得分</td>
              <td className="excel-cell" style={{ fontWeight: 500, background: '#f8f9fa' }}>命中</td>
              <td className="excel-cell" style={{ fontWeight: 500, background: '#f8f9fa' }}>爆头</td>
              <td className="excel-cell" style={{ fontWeight: 500, background: '#f8f9fa' }}>连击</td>
              <td className="excel-cell" style={{ fontWeight: 500, background: '#f8f9fa' }}>时长</td>
              <td className="excel-cell" />
              <td className="excel-cell" />
              <td className="excel-cell" />
            </tr>

            {stats.gamesHistory.length > 0 ? stats.gamesHistory.slice(-8).reverse().map((game, i) => (
              <tr key={i}>
                <td className="excel-row-header">{18 + i}</td>
                <td className="excel-cell" style={{ textAlign: 'center' }}>{i + 1}</td>
                <td className="excel-cell">{game.date}</td>
                <td className="excel-cell">{game.mode === 'timed' ? '限时' : game.mode === 'endless' ? '无限' : game.mode === 'zen' ? '禅' : '爆头'}</td>
                <td className="excel-cell" style={{ textAlign: 'right', fontWeight: 'bold', color: '#107c41' }}>{game.score}</td>
                <td className="excel-cell" style={{ textAlign: 'center' }}>{game.accuracy.toFixed(1)}%</td>
                <td className="excel-cell" style={{ textAlign: 'center', color: '#dc2626' }}>{game.headAccuracy.toFixed(1)}%</td>
                <td className="excel-cell" style={{ textAlign: 'center', color: '#f97316' }}>{game.maxCombo}x</td>
                <td className="excel-cell" style={{ textAlign: 'center' }}>{game.duration}s</td>
                <td className="excel-cell" />
                <td className="excel-cell" />
                <td className="excel-cell" />
              </tr>
            )) : (
              <tr>
                <td className="excel-row-header">18</td>
                <td className="excel-cell" colSpan={11} style={{ textAlign: 'center', color: '#9ca3af' }}>
                  暂无游戏记录
                </td>
              </tr>
            )}

            {/* 成就区 */}
            <tr>
              <td className="excel-row-header">27</td>
              {Array.from({ length: 11 }).map((_, i) => (
                <td key={i} className="excel-cell" />
              ))}
            </tr>

            <tr>
              <td className="excel-row-header">28</td>
              <td className="excel-cell" colSpan={11} style={{ background: '#fbbf24', color: '#78350f', fontWeight: 'bold', paddingLeft: 8 }}>
                🏆 成就
              </td>
            </tr>

            <tr>
              <td className="excel-row-header">29</td>
              <td className="excel-cell" colSpan={11}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: '8px 0' }}>
                  {stats.totalGames >= 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 16 }}>🎯</span>
                      <span style={{ fontSize: 11 }}>初学者 - 完成第1局</span>
                    </div>
                  )}
                  {stats.maxCombo >= 10 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 16 }}>🔥</span>
                      <span style={{ fontSize: 11 }}>连击达人 - 10连击</span>
                    </div>
                  )}
                  {stats.maxCombo >= 30 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 16 }}>⚡</span>
                      <span style={{ fontSize: 11 }}>连击大师 - 30连击</span>
                    </div>
                  )}
                  {stats.headAccuracy >= 80 && stats.totalGames >= 5 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 16 }}>💥</span>
                      <span style={{ fontSize: 11 }}>爆头专家 - 80%+爆头率</span>
                    </div>
                  )}
                  {stats.totalGames >= 50 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 16 }}>🐟</span>
                      <span style={{ fontSize: 11 }}>摸鱼老手 - 50+局</span>
                    </div>
                  )}
                  {stats.accuracy >= 90 && stats.totalGames >= 10 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 16 }}>🎖️</span>
                      <span style={{ fontSize: 11 }}>神枪手 - 90%+命中率</span>
                    </div>
                  )}
                  {stats.totalScore >= 100000 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 16 }}>💎</span>
                      <span style={{ fontSize: 11 }}>得分王 - 10万总分</span>
                    </div>
                  )}
                </div>
              </td>
            </tr>

            <tr>
              <td className="excel-row-header">30</td>
              {Array.from({ length: 11 }).map((_, i) => (
                <td key={i} className="excel-cell" />
              ))}
            </tr>

            <tr>
              <td className="excel-row-header">31</td>
              <td className="excel-cell" colSpan={11}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <ShareButton stats={stats} />
                  {onExit && (
                    <button
                      onClick={onExit}
                      style={{
                        background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      🏠 返回主页
                    </button>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ShareButton: React.FC<{ stats: GameStats }> = ({ stats }) => {
  const [copied, setCopied] = React.useState(false);

  const handleShare = async () => {
    const shareText = generateShareText({
      score: stats.gamesHistory.length > 0 ? stats.gamesHistory[stats.gamesHistory.length - 1].score : 0,
      accuracy: stats.accuracy,
      headshotRate: stats.headAccuracy,
      maxCombo: stats.maxCombo,
      duration: stats.gamesHistory.length > 0 ? stats.gamesHistory[stats.gamesHistory.length - 1].duration : 60,
      bestScore: stats.totalScore,
      bestAccuracy: stats.accuracy,
      bestCombo: stats.maxCombo,
    });

    const success = await copyToClipboard(shareText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <button
        onClick={handleShare}
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        📤 {copied ? '已复制！' : '分享成绩'}
      </button>
      <span style={{ color: '#888', fontSize: 10 }}>
        复制训练报告到剪贴板
      </span>
    </div>
  );
};

function generateShareText(data: {
  score: number;
  accuracy: number;
  headshotRate: number;
  maxCombo: number;
  duration: number;
  bestScore: number;
  bestAccuracy: number;
  bestCombo: number;
}): string {
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

function getEvaluation(data: { accuracy: number; maxCombo: number; headshotRate: number }): string {
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

async function copyToClipboard(text: string): Promise<boolean> {
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