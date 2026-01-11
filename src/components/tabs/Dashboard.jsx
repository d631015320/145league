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
                    <Icon name="layout-dashboard" className="w-6 h-6 text-emerald-500" aria-hidden="true"/> 概览
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
                
                {/* === 核心升级：荣耀领奖台 (占 7 列) === */}
                <div className="lg:col-span-7 glass-panel rounded-2xl p-6 relative overflow-hidden border border-slate-200 dark:border-slate-700/50 flex flex-col justify-end min-h-[280px]">
                    {/* 背景光效 */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
                    
                    <div className="text-center mb-auto">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Current Leaderboard</h3>
                        <div className="text-sm font-bold text-slate-600 dark:text-slate-300 mt-1">
                            {selectedSeason === 'all' ? '战力榜前三' : `S${selectedSeason.slice(1)} 赛季三巨头`}
                        </div>
                    </div>

                    <div className="flex justify-center items-end gap-2 sm:gap-6 mt-4 pb-2">
                        
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
                                <div className="w-16 sm:w-20 h-24 bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-t-lg mt-2 shadow-inner border-t border-slate-300 dark:border-slate-600" aria-hidden="true"></div>
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
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce" aria-hidden="true"><Icon name="crown" className="w-6 h-6 fill-current"/></div>
                                    <Avatar name={first.name} src={first.avatar} size="xl" className="border-4 border-yellow-400 shadow-xl shadow-yellow-400/20" />
                                    <div className="absolute -bottom-3 -right-2 bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-0.5 rounded shadow-sm" aria-hidden="true">1</div>
                                </div>
                                <div className="text-base font-black text-slate-800 dark:text-white mb-1">{first.name}</div>
                                <div className="text-sm font-mono font-bold text-yellow-600 dark:text-yellow-400">
                                    {Math.round(first.powerScore)} <span className="text-[10px] opacity-70">pts</span>
                                </div>
                                {/* 领奖台柱子 */}
                                <div className="w-20 sm:w-24 h-32 bg-gradient-to-t from-yellow-100 to-white dark:from-yellow-900/30 dark:to-slate-700 rounded-t-lg mt-2 shadow-lg border-t border-yellow-200 dark:border-yellow-700/50 relative overflow-hidden" aria-hidden="true">
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
                                <div className="w-16 sm:w-20 h-16 bg-gradient-to-t from-orange-100 to-white dark:from-orange-900/30 dark:to-slate-700 rounded-t-lg mt-2 shadow-inner border-t border-orange-200 dark:border-orange-800/50" aria-hidden="true"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* === 数据卡片区 (占 5 列) === */}
                <div className="lg:col-span-5 grid grid-cols-2 gap-4 content-start">
                    {[
                        { 
                            l: '总场次', 
                            v: statsData.seasonStats.totalGames + (selectedSeason === 'all' ? '' : ` / ${GAMES_PER_SEASON}`), 
                            i: 'hash', 
                            c: 'text-blue-500',
                            bg: 'bg-blue-50 dark:bg-blue-900/10' 
                        },
                        { 
                            // ✅ 替换了之前的 "总奖池"
                            l: '平均参赛人数', 
                            v: avgPlayers, 
                            i: 'users', 
                            c: 'text-emerald-500',
                            bg: 'bg-emerald-50 dark:bg-emerald-900/10',
                            sub: '人/场' 
                        },
                        { 
                            l: '活跃玩家', 
                            v: statsData.seasonStats.activePlayers, 
                            i: 'activity', 
                            c: 'text-orange-500',
                            bg: 'bg-orange-50 dark:bg-orange-900/10' 
                        },
                        { 
                            l: '单场最高分', 
                            v: statsData.highestSingle.score > -Infinity ? statsData.highestSingle.score : '-',
                            sub: statsData.highestSingle.name,
                            i: 'zap', 
                            c: 'text-yellow-500',
                            bg: 'bg-yellow-50 dark:bg-yellow-900/10' 
                        }
                    ].map((item, idx) => (
                        <div key={idx} className={`rounded-xl p-4 flex flex-col justify-center border border-slate-100 dark:border-slate-800 ${item.bg} hover:scale-[1.02] transition-transform`}>
                            <div className="text-[10px] uppercase font-bold text-slate-500/70 mb-1 flex items-center gap-1">
                                <Icon name={item.i} className="w-3.5 h-3.5"/> {item.l}
                            </div>
                            <div className={`text-2xl font-black ${item.c} font-mono truncate tracking-tight`}>
                                {item.v} <span className="text-xs text-slate-400 font-normal ml-1">{item.sub}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 效率之王 */}
            <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Icon name="activity" className="w-4 h-4"/> 效率之王 (Efficiency Kings) - 场均前三
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {statsData.topAvgScore.map((p, idx) => (
                        <div 
                            key={p.name} 
                            onClick={() => onPlayerClick(p)}
                            className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 flex items-center gap-4 relative overflow-hidden cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            <div className="absolute right-0 top-0 p-2 opacity-10 font-black text-4xl italic text-slate-500">#{idx+1}</div>
                            <Avatar name={p.name} src={p.avatar?.avatar || p.avatar} size="md" className={`border-2 ${idx===0 ? 'border-yellow-500' : idx===1 ? 'border-slate-400' : 'border-orange-600'}`} />
                            <div>
                                <div className="font-bold text-slate-700 dark:text-slate-200">{p.name}</div>
                                <div className="text-xs text-slate-400">场均 <span className="text-blue-500 font-bold font-mono text-sm">{p.avgScore}</span> 分</div>
                            </div>
                        </div>
                    ))}
                    {statsData.topAvgScore.length === 0 && <div className="col-span-3 text-center text-slate-400 text-sm py-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">暂无数据</div>}
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
                            全部记录 <Icon name="arrow-right" className="w-3 h-3" aria-hidden="true"/>
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                        {statsData.latestMatch.results.slice(0, 5).map((r, i) => (
                            <div key={i} className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-md transition-all">
                                {r.rank === 1 && <div className="absolute top-0 right-0 p-1"><Icon name="crown" className="w-3 h-3 text-yellow-500 fill-current"/></div>}
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