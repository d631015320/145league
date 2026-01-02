import React from 'react';
import Icon from '../Icon';
import Avatar from '../Avatar';

const Dashboard = ({ 
    statsData, 
    selectedSeason, 
    availableSeasons, 
    onSeasonChange, 
    onPlayerClick, 
    onNavigateToHistory,
    GAMES_PER_SEASON 
}) => {
    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Icon name="layout-dashboard" className="w-6 h-6 text-emerald-500"/> 概览
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">赛季:</span>
                    <select 
                        value={selectedSeason} 
                        onChange={e => onSeasonChange(e.target.value)} 
                        className="input-pro py-1 px-3 rounded-lg text-sm bg-white dark:bg-slate-800 border-none font-mono"
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

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                {/* 榜首卡片 */}
                <div 
                    onClick={() => statsData.topPower && onPlayerClick(statsData.topPower)}
                    className="lg:col-span-2 glass-panel rounded-2xl p-6 relative overflow-hidden group border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-lg transition-all"
                >
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="relative">
                            <Avatar name={statsData.topPower?.name} src={statsData.topPower?.avatar?.avatar || statsData.topPower?.avatar} size="xl" className="border-4 border-slate-100 dark:border-slate-800 shadow-xl" />
                            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-lg border border-yellow-200">NO.1</div>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-1">{selectedSeason === 'all' ? '总榜领跑者 (League Leader)' : `S${selectedSeason.slice(1)} 赛季领跑者`}</div>
                            <div className="text-3xl font-black text-slate-800 dark:text-white mb-1">{statsData.topPower?.name || '暂无数据'}</div>
                            <div className="flex gap-3 text-sm">
                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">战力 {Math.round(statsData.topPower?.powerScore || 0)}</span>
                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">胜率 {statsData.topPower?.gamesPlayed ? Math.round((statsData.topPower.wins/statsData.topPower.gamesPlayed)*100) : 0}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 统计小卡片 */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                    {[
                        { l: '本赛季场次', v: statsData.seasonStats.totalGames + (selectedSeason === 'all' ? '' : ` / ${GAMES_PER_SEASON}`), i: 'hash', c: 'text-blue-500' },
                        { l: '赛季总奖池', v: statsData.seasonStats.totalPot.toLocaleString(), i: 'database', c: 'text-emerald-500' },
                        { l: '活跃玩家', v: statsData.seasonStats.activePlayers, i: 'users', c: 'text-orange-500' },
                        { l: '单场最高分', v: `${statsData.highestSingle.score > -Infinity ? statsData.highestSingle.score : '-'} (${statsData.highestSingle.name})`, i: 'zap', c: 'text-yellow-500' }
                    ].map((item, idx) => (
                        <div key={idx} className="glass-panel rounded-xl p-4 flex flex-col justify-center border border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1"><Icon name={item.i} className="w-3 h-3"/> {item.l}</div>
                            <div className={`text-lg font-black ${item.c} font-mono truncate`}>{item.v}</div>
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
                                {statsData.latestMatch.date}
                                <span className="text-sm font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{statsData.latestMatch.totalPlayers} 人参赛</span>
                            </div>
                        </div>
                        <button onClick={onNavigateToHistory} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-bold uppercase flex items-center gap-1 transition-colors">
                            全部记录 <Icon name="arrow-right" className="w-3 h-3"/>
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

export default Dashboard;