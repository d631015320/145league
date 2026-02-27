// src/components/modals/HeadToHead.jsx
import Icon from '../common/Icon';
import { formatDate, compareByEntryOrder } from '../../lib/utils';

/**
 * 宿敌对抗组件 - 显示两个玩家的交手记录
 * @param {{player: import('../../types').PlayerStats, opponent: string, history: import('../../types').Match[]}} props
 */
const HeadToHead = ({ player, opponent, history }) => {
  if (!opponent) return null;

  // 筛选两人共同参与的比赛
  const matchups = history
    .filter(m => {
      const p1 = m.results.find(r => r.name === player.name);
      const p2 = m.results.find(r => r.name === opponent);
      return p1 && p2;
    })
    .map(m => {
      const p1 = m.results.find(r => r.name === player.name);
      const p2 = m.results.find(r => r.name === opponent);
      return {
        date: m.date,
        p1Rank: p1.rank,
        p2Rank: p2.rank,
        p1Score: p1.score,
        p2Score: p2.score,
        winner: p1.rank < p2.rank ? player.name : opponent
      };
    })
    .sort((a, b) => compareByEntryOrder(b, a));

  const total = matchups.length;
  const p1Wins = matchups.filter(m => m.winner === player.name).length;
  const p2Wins = total - p1Wins;
  const winRate = total > 0 ? (p1Wins / total) * 100 : 0;

  return (
    <div className="mt-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50 animate-slide-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Icon name="swords" className="w-4 h-4" /> 宿敌对抗 (Head-to-Head)
        </h3>
      </div>

      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="text-center w-1/3">
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{p1Wins}</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase">胜场</div>
        </div>
        <div className="text-center w-1/3">
          <div className="text-xs font-bold text-slate-400 mb-1">同台竞技 {total} 场</div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
            <div className="h-full bg-emerald-500" style={{ width: `${winRate}%` }}></div>
            <div className="h-full bg-red-500" style={{ width: `${100 - winRate}%` }}></div>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {player.name} 胜率 {winRate.toFixed(0)}%
          </div>
        </div>
        <div className="text-center w-1/3">
          <div className="text-2xl font-black text-red-500 dark:text-red-400">{p2Wins}</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase">胜场</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[10px] text-slate-400 font-bold uppercase mb-2">最近 5 场交锋</div>
        {matchups.slice(0, 5).map((m, i) => (
          <div
            key={i}
            className="flex justify-between items-center text-xs p-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700"
          >
            <div className="font-mono text-slate-400">{formatDate(m.date)}</div>
            <div className="flex items-center gap-2">
              <span
                className={
                  m.p1Rank < m.p2Rank
                    ? 'font-bold text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500'
                }
              >
                #{m.p1Rank}
              </span>
              <span className="text-slate-300">vs</span>
              <span
                className={
                  m.p2Rank < m.p1Rank
                    ? 'font-bold text-red-500 dark:text-red-400'
                    : 'text-slate-500'
                }
              >
                #{m.p2Rank}
              </span>
            </div>
          </div>
        ))}
        {matchups.length === 0 && (
          <div className="text-center text-slate-400 text-xs py-2">暂无同台记录</div>
        )}
      </div>
    </div>
  );
};

export default HeadToHead;
