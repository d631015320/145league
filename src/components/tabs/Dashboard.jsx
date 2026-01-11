import { memo } from 'react'
import Icon from '../common/Icon'
import Avatar from '../common/Avatar'
import { formatDate } from '../../lib/utils'

const Dashboard = ({
    statsData,
    selectedSeason,
    availableSeasons,
    onSeasonChange,
    onPlayerClick,
    onNavigateToHistory,
    GAMES_PER_SEASON
}) => {
    // 提取前三名 - 始终使用战力榜前三 (topPower)，不受排行榜排序影响
    const top3 = statsData.topPower.slice(0, 3);
    const first = top3[0];
    const second = top3[1];
    const third = top3[2];

    // 计算更有意义的指标：平均参赛人数
    const avgPlayers = statsData.seasonStats.totalGames > 0
        ? (statsData.leaderboardData.reduce((acc, p) => acc + p.gamesPlayed, 0) / statsData.seasonStats.totalGames).toFixed(1)
        : 0;

    return (
        <>
            {/* 顶部控制栏 */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Icon name="layout-dashboard" className="w-6 h-6 text-emerald-500" aria-hidden="true" /> 概览
                </h2>
                <div className="flex items-center gap-2">
                    <label htmlFor="season-select-dashboard" className="text-xs font-bold text-slate-500 uppercase">赛季:</label>
                    <select
                        id="season-select-dashboard"
                        value={selectedSeason}
                        onChange={e => onSeasonChange(e.target.value)}
                        aria-label="选择赛季"
                        className="input-pro py-1 px-3 rounded-lg text-sm bg-white dark:bg-slate-800 border-none font-mono cursor-pointer"
                    >
                        <option value="all">🏆 全赛季 (All-Time)</option>
                        {availableSeasons.map(s => {
                            const sNum = s.slice(1);
                            const start = (sNum - 1) * GAMES_PER_SEASON + 1;
                            const end = sNum * GAMES_PER_SEASON;
                            return <option key={s} value={s}>🏁 第 {sNum} 赛季 (G{start}-{end})</option>;
                        })}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

                {/* === 核心升级：荣耀领奖台 (占 5 列) === */}
                <div className="lg:col-span-5 glass-panel rounded-2xl p-6 relative overflow-hidden border border-slate-200 dark:border-slate-700/50 flex flex-col justify-end min-h-[280px]">
                    {/* 背景光效 */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>

                    <div className="text-center mb-auto">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Current Leaderboard</h3>
                        <div className="text-sm font-bold text-slate-600 dark:text-slate-300 mt-1">
                            {selectedSeason === 'all' ? '战力榜前三' : `S${selectedSeason.slice(1)} 赛季三巨头`}
                        </div>
                    </div>

                    <div className="flex justify-center items-end gap-2 sm:gap-4 mt-4 pb-2">

                        {/* 🥈 第二名 (左侧) */}
                        {second && (
                            <div
                                className="flex flex-col items-center group cursor-pointer"
                                onClick={() => onPlayerClick(second)}
                                role="button"
                                tabIndex={0}
                                aria-label={`查看第二名 ${second.name} 的详细信息，战力值 ${Math.round(second.powerScore)}`}
                                onKeyDown={(e) => e.key === 'Enter' && onPlayerClick(second)}
                            >
                                <div className="relative mb-3 transition-transform group-hover:-translate-y-1">
                                    <Avatar name={second.name} src={second.avatar} size="lg" className="border-4 border-slate-300 shadow-lg" />
                                    <div className="absolute -bottom-2 -right-1 bg-slate-300 text-slate-700 text-[10px] font-black px-1.5 rounded shadow-sm" aria-hidden="true">2</div>
                                </div>
                                <div className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">{second.name}</div>
                                <div className="text-xs font-mono text-slate-400">
                                    {Math.round(second.powerScore)} <span className="text-[10px] opacity-70">pts</span>
                                </div>
                                {/* 领奖台柱子 */}
                                <div className="w-14 sm:w-16 h-20 bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-t-lg mt-2 shadow-inner border-t border-slate-300 dark:border-slate-600" aria-hidden="true"></div>
                            </div>
                        )}

                        {/* 🥇 第一名 (中间，最高) */}
                        {first && (
                            <div
                                className="flex flex-col items-center z-10 -mx-2 sm:mx-0 group cursor-pointer"
                                onClick={() => onPlayerClick(first)}
                                role="button"
                                tabIndex={0}
                                aria-label={`查看第一名 ${first.name} 的详细信息，战力值 ${Math.round(first.powerScore)}`}
                                onKeyDown={(e) => e.key === 'Enter' && onPlayerClick(first)}
                            >
                                <div className="relative mb-3 transition-transform group-hover:-translate-y-2">
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce" aria-hidden="true"><Icon name="crown" className="w-6 h-6 fill-current" /></div>
                                    <Avatar name={first.name} src={first.avatar} size="xl" className="border-4 border-yellow-400 shadow-xl shadow-yellow-400/20" />
                                    <div className="absolute -bottom-3 -right-2 bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-0.5 rounded shadow-sm" aria-hidden="true">1</div>
                                </div>
                                <div className="text-base font-black text-slate-800 dark:text-white mb-1">{first.name}</div>
                                <div className="text-sm font-mono font-bold text-yellow-600 dark:text-yellow-400">
                                    {Math.round(first.powerScore)} <span className="text-[10px] opacity-70">pts</span>
                                </div>
                                {/* 领奖台柱子 */}
                                <div className="w-16 sm:w-20 h-28 bg-gradient-to-t from-yellow-100 to-white dark:from-yellow-900/30 dark:to-slate-700 rounded-t-lg mt-2 shadow-lg border-t border-yellow-200 dark:border-yellow-700/50 relative overflow-hidden" aria-hidden="true">
                                    <div className="absolute inset-0 bg-yellow-400/10"></div>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-yellow-600/20 dark:text-yellow-400/20 font-black text-4xl">1</div>
                                </div>
                            </div>
                        )}

                        {/* 🥉 第三名 (右侧) */}
                        {third && (
                            <div
                                className="flex flex-col items-center group cursor-pointer"
                                onClick={() => onPlayerClick(third)}
                                role="button"
                                tabIndex={0}
                                aria-label={`查看第三名 ${third.name} 的详细信息，战力值 ${Math.round(third.powerScore)}`}
                                onKeyDown={(e) => e.key === 'Enter' && onPlayerClick(third)}
                            >
                                <div className="relative mb-3 transition-transform group-hover:-translate-y-1">
                                    <Avatar name={third.name} src={third.avatar} size="lg" className="border-4 border-orange-300 shadow-lg" />
                                    <div className="absolute -bottom-2 -right-1 bg-orange-300 text-orange-800 text-[10px] font-black px-1.5 rounded shadow-sm" aria-hidden="true">3</div>
                                </div>
                                <div className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">{third.name}</div>
                                <div className="text-xs font-mono text-slate-400">
                                    {Math.round(third.powerScore)} <span className="text-[10px] opacity-70">pts</span>
                                </div>
                                {/* 领奖台柱子 */}
                                <div className="w-14 sm:w-16 h-14 bg-gradient-to-t from-orange-100 to-white dark:from-orange-900/30 dark:to-slate-700 rounded-t-lg mt-2 shadow-inner border-t border-orange-200 dark:border-orange-800/50" aria-hidden="true"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* === 联赛数据概览 (占 2 列) === */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {/* 举办场次 */}
                    <div className="glass-panel rounded-xl p-4 flex flex-col items-center justify-center flex-1 border border-slate-200 dark:border-slate-700/50 relative overflow-hidden group hover:scale-[1.02] transition-transform shadow-sm hover:shadow-md">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 z-10">举办场次</div>
                        <div className="flex items-baseline gap-1 z-10">
                            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-cyan-400 font-mono">{statsData.seasonStats.totalGames}</span>
                            <span className="text-xs font-bold text-slate-400">场</span>
                        </div>
                    </div>

                    {/* 场均人数 */}
                    <div className="glass-panel rounded-xl p-4 flex flex-col items-center justify-center flex-1 border border-slate-200 dark:border-slate-700/50 relative overflow-hidden group hover:scale-[1.02] transition-transform shadow-sm hover:shadow-md">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 z-10">场均人数</div>
                        <div className="flex items-baseline gap-1 z-10">
                            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-violet-500 to-fuchsia-400 font-mono">{avgPlayers}</span>
                            <span className="text-xs font-bold text-slate-400">人</span>
                        </div>
                    </div>

                    {/* 活跃玩家 */}
                    <div className="glass-panel rounded-xl p-4 flex flex-col items-center justify-center flex-1 border border-slate-200 dark:border-slate-700/50 relative overflow-hidden group hover:scale-[1.02] transition-transform shadow-sm hover:shadow-md">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 z-10">活跃玩家</div>
                        <div className="flex items-baseline gap-1 z-10">
                            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-amber-400 font-mono">{statsData.leaderboardData.length}</span>
                            <span className="text-xs font-bold text-slate-400">人</span>
                        </div>
                    </div>
                </div>
                {/* === 七维度前三名 (占 5 列) === */}
                <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50 flex flex-col">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Icon name="radar" className="w-4 h-4" /> 七维度之王
                    </h3>
                    <div className="flex-1 flex flex-col justify-between gap-2">
                        {[
                            { key: 'domination', label: '统治', icon: 'crown', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', format: (p) => `${(p.dimDomination * 100).toFixed(0)}%` },
                            { key: 'knockout', label: '击败', icon: 'swords', color: 'text-red-500', bgColor: 'bg-red-500/10', format: (p) => `${(p.dimKnockout * 100).toFixed(0)}%` },
                            { key: 'efficiency', label: '效率', icon: 'zap', color: 'text-blue-500', bgColor: 'bg-blue-500/10', format: (p) => `${p.dimEfficiency.toFixed(1)}` },
                            { key: 'chipWin', label: '胜场', icon: 'trophy', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', format: (p) => `${(p.dimChipWin * 100).toFixed(0)}%` },
                            { key: 'plunder', label: '掠夺', icon: 'coins', color: 'text-orange-500', bgColor: 'bg-orange-500/10', format: (p) => `${Math.round(p.dimPlunder)}` },
                            { key: 'stability', label: '稳定', icon: 'shield', color: 'text-purple-500', bgColor: 'bg-purple-500/10', format: (p) => `${p.dimStability.toFixed(0)}` },
                            { key: 'mvp', label: 'MVP', icon: 'star', color: 'text-pink-500', bgColor: 'bg-pink-500/10', format: (p) => `${(p.dimMvp * 100).toFixed(0)}%` }
                        ].map(dim => {
                            const dimTop3 = statsData.dimensionTop3?.[dim.key] || [];
                            const dimFirst = dimTop3[0];
                            if (!dimFirst) return null;
                            return (
                                <div key={dim.key} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
                                    {/* 维度图标和标签 */}
                                    <div className={`w-7 h-7 rounded-md ${dim.bgColor} flex items-center justify-center flex-shrink-0`}>
                                        <Icon name={dim.icon} className={`w-4 h-4 ${dim.color}`} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-8 flex-shrink-0">{dim.label}</span>

                                    {/* 前三名头像 */}
                                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                        {dimTop3.slice(0, 3).map((p, idx) => (
                                            <div
                                                key={p.name}
                                                className="relative cursor-pointer hover:z-10 transition-transform hover:scale-110"
                                                onClick={() => onPlayerClick(p)}
                                                title={`${idx + 1}. ${p.name}: ${dim.format(p)}`}
                                            >
                                                <Avatar
                                                    name={p.name}
                                                    src={p.avatar}
                                                    size="xs"
                                                    className={`border-2 border-white dark:border-slate-700 ${idx === 0 ? 'ring-1 ring-yellow-400 z-10' : 'z-0'}`}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* 第一名名字和数值 */}
                                    <div className="flex-1 min-w-0 flex items-center justify-end gap-2 ml-auto">
                                        <span
                                            className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate cursor-pointer hover:text-slate-900 dark:hover:text-white"
                                            onClick={() => onPlayerClick(dimFirst)}
                                        >
                                            {dimFirst.name}
                                        </span>
                                        <span className={`text-sm font-mono font-bold ${dim.color} flex-shrink-0 w-12 text-right`}>
                                            {dim.format(dimFirst)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 最新比赛 */}
            {statsData.latestMatch && (
                <div className="glass-panel rounded-2xl p-6 border-t-4 border-t-indigo-500 bg-white dark:bg-slate-800/60 mt-6 shadow-lg">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <div className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-2">
                                {selectedSeason === 'all' ? '最新比赛' : `S${selectedSeason.slice(1)} 赛季收官战`}
                            </div>
                            <div className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                {formatDate(statsData.latestMatch.date)}
                                <span className="text-sm font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{statsData.latestMatch.totalPlayers} 人参赛</span>
                            </div>
                        </div>
                        <button
                            onClick={onNavigateToHistory}
                            aria-label="查看全部比赛记录"
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-bold uppercase flex items-center gap-1 transition-colors"
                        >
                            全部记录 <Icon name="arrow-right" className="w-3 h-3" aria-hidden="true" />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                        {statsData.latestMatch.results.slice(0, 5).map((r, i) => (
                            <div key={i} className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-md transition-all">
                                {r.rank === 1 && <div className="absolute top-0 right-0 p-1"><Icon name="crown" className="w-3 h-3 text-yellow-500 fill-current" /></div>}
                                <div className="text-xs text-slate-400 font-bold mb-1">#{r.rank}</div>
                                <div className="font-bold text-slate-700 dark:text-white mb-1">{r.name}</div>
                                <div className="text-emerald-600 dark:text-emerald-400 font-mono text-sm font-bold">+{r.score}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default memo(Dashboard);