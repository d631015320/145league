import React from 'react';
import Icon from '../Icon';
import Avatar from '../Avatar';
import Sparkline from '../../charts/Sparkline';

const Leaderboard = ({ 
    data, 
    sortConfig, 
    onSort, 
    onPlayerClick, 
    isSelectionMode, 
    toggleSelectionMode,
    selectedPlayerNames,
    togglePlayerSelection,
    showSelectedOnly,
    setShowSelectedOnly,
    onClearSelection,
    searchTerm,
    onSearchChange,
    selectedSeason,
    onSeasonChange,
    availableSeasons,
    GAMES_PER_SEASON
}) => {
    const isSorted = (k) => sortConfig.key === k;

    return (
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700/50">
            {/* 顶部工具栏 */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 flex flex-col xl:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                    <div className="relative min-w-[180px]">
                        <select 
                            value={selectedSeason} 
                            onChange={e => onSeasonChange(e.target.value)} 
                            className="input-pro w-full pl-3 pr-8 py-2 rounded-lg text-sm bg-white dark:bg-slate-800/50 font-bold appearance-none cursor-pointer"
                        >
                            <option value="all">🏆 全赛季总榜</option>
                            {availableSeasons.map(s => {
                                const sNum = s.slice(1);
                                const start = (sNum - 1) * GAMES_PER_SEASON + 1;
                                const end = sNum * GAMES_PER_SEASON;
                                return <option key={s} value={s}>🏁 第 {sNum} 赛季 (G{start}-{end})</option>;
                            })}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500"><Icon name="chevron-down" className="w-4 h-4"/></div>
                    </div>
                    
                    <div className="relative w-full sm:w-64 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon name="search" className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors"/></div>
                        <input type="text" placeholder="搜索 玩家 / 数据..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="input-pro w-full pl-10 pr-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800/50" />
                    </div>
                </div>
                
                {/* 排序按钮组 */}
                <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                    {[{k:'powerScore',l:'战力',c:'purple'}, {k:'avgScore',l:'场均得分',c:'blue'}, {k:'avgChips',l:'场均筹码',c:'teal'}, {k:'totalScore',l:'总得分',c:'emerald'}, {k:'totalChips',l:'总筹码',c:'red'}, {k:'wins',l:'吃鸡数',c:'yellow'}, {k:'goldContent',l:'含金量',c:'orange'}, {k:'votedMvpCount',l:'MVP',c:'indigo'}, {k:'luckyCount',l:'运气王',c:'pink'}].map(item => (
                        <button key={item.k} onClick={() => onSort(item.k)} className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider border whitespace-nowrap transition-all ${isSorted(item.k) ? `bg-${item.c}-50 dark:bg-${item.c}-500/10 border-${item.c}-500 text-${item.c}-600 dark:text-${item.c}-400` : 'bg-white dark:bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400 dark:hover:border-slate-500'}`}>
                            {item.l} {isSorted(item.k) ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                        </button>
                    ))}
                    <button onClick={toggleSelectionMode} className={`p-1.5 rounded border bg-white dark:bg-transparent transition-colors ${isSelectionMode ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}><Icon name="list-checks" className="w-5 h-5"/></button>
                </div>
            </div>

            {/* 选择模式工具条 */}
            {isSelectionMode && (<div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 flex justify-between items-center text-xs text-indigo-600 dark:text-indigo-300 border-b border-indigo-100 dark:border-indigo-500/20"><span className="font-bold">已选: {selectedPlayerNames.size}</span><div className="flex gap-3"><button onClick={() => setShowSelectedOnly(!showSelectedOnly)} className="hover:underline">{showSelectedOnly ? '显示全部' : '仅看已选'}</button><button onClick={onClearSelection} className="hover:underline">清空</button></div></div>)}

            {/* 核心表格 */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-[#0f141a] text-slate-500 text-[10px] uppercase font-bold tracking-widest sticky top-0 z-20">
                        <tr>
                            <th className="p-4 w-12 text-center sticky-col border-b border-slate-200 dark:border-slate-800 shadow-[1px_0_0_0_rgba(0,0,0,0.05)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.05)]">#</th>
                            <th className="p-4 w-48 sticky-col left-12 border-b border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">玩家</th>
                            <th className={`p-4 text-right cursor-pointer hover:text-slate-800 dark:hover:text-white border-b border-slate-200 dark:border-slate-800 ${isSorted('powerScore') ? 'text-purple-600 dark:text-purple-400 bg-slate-50 dark:bg-slate-800/30' : ''}`} onClick={() => onSort('powerScore')}>综合评分</th>
                            <th className="p-4 w-24 text-center border-b border-slate-200 dark:border-slate-800">近期状态</th>
                            <th className={`p-4 text-right cursor-pointer hover:text-slate-800 dark:hover:text-white border-b border-slate-200 dark:border-slate-800 ${isSorted('avgScore') ? 'text-blue-600 dark:text-blue-400 bg-slate-50 dark:bg-slate-800/30' : ''}`} onClick={() => onSort('avgScore')}>场均分</th>
                            <th className={`p-4 text-right hidden md:table-cell cursor-pointer hover:text-slate-800 dark:hover:text-white border-b border-slate-200 dark:border-slate-800 ${isSorted('avgChips') ? 'text-teal-600 dark:text-teal-400 bg-slate-50 dark:bg-slate-800/30' : ''}`} onClick={() => onSort('avgChips')}>场均筹码</th>
                            <th className={`p-4 text-right cursor-pointer hover:text-slate-800 dark:hover:text-white border-b border-slate-200 dark:border-slate-800 ${isSorted('totalScore') ? 'text-emerald-600 dark:text-emerald-400 bg-slate-50 dark:bg-slate-800/30' : ''}`} onClick={() => onSort('totalScore')}>总积分</th>
                            <th className={`p-4 text-right cursor-pointer hover:text-slate-800 dark:hover:text-white border-b border-slate-200 dark:border-slate-800 ${isSorted('totalChips') ? 'text-red-600 dark:text-red-400 bg-slate-50 dark:bg-slate-800/30' : ''}`} onClick={() => onSort('totalChips')}>总筹码</th>
                            <th className={`p-4 text-center cursor-pointer hover:text-slate-800 dark:hover:text-white border-b border-slate-200 dark:border-slate-800 ${isSorted('wins') ? 'text-yellow-600 dark:text-yellow-400 bg-slate-50 dark:bg-slate-800/30' : ''}`} onClick={() => onSort('wins')}>吃鸡数</th>
                            <th className={`p-4 text-right hidden md:table-cell cursor-pointer hover:text-slate-800 dark:hover:text-white border-b border-slate-200 dark:border-slate-800 ${isSorted('goldContent') ? 'text-orange-600 dark:text-orange-400 bg-slate-50 dark:bg-slate-800/30' : ''}`} onClick={() => onSort('goldContent')}>含金量</th>
                            <th className={`p-4 text-center hidden sm:table-cell ${isSorted('votedMvpCount') ? 'bg-slate-50 dark:bg-slate-800/30' : ''}`} onClick={() => onSort('votedMvpCount')}>MVP</th>
                            <th className={`p-4 text-center hidden sm:table-cell ${isSorted('luckyCount') ? 'bg-slate-50 dark:bg-slate-800/30' : ''}`} onClick={() => onSort('luckyCount')}>运气王</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium">
                        {data.map((p, idx) => (
                            <tr key={p.name} onClick={() => isSelectionMode ? togglePlayerSelection(p.name) : onPlayerClick(p)} className={`table-row-hover transition-colors cursor-pointer group ${selectedPlayerNames.has(p.name) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                                <td className="p-4 text-center font-mono text-slate-400 sticky-col group-hover:bg-slate-50 dark:group-hover:bg-[#161b22] transition-colors border-b border-slate-50 dark:border-slate-800/50">{isSelectionMode ? <input type="checkbox" checked={selectedPlayerNames.has(p.name)} onChange={()=>{}} className="mx-auto accent-indigo-500" /> : (idx < 3 ? <span className={`inline-block w-6 h-6 leading-6 rounded text-[10px] font-bold ${idx===0?'rank-badge-1':idx===1?'rank-badge-2':'rank-badge-3'}`}>{idx+1}</span> : idx+1)}</td>
                                <td className="p-4 sticky-col left-12 group-hover:bg-slate-50 dark:group-hover:bg-[#161b22] transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-b border-slate-50 dark:border-slate-800/50"><div className="flex items-center gap-3"><Avatar name={p.name} src={p.avatar?.avatar || p.avatar} size="md" bordered={false} className="shadow-sm" /><span className="font-bold text-slate-700 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{p.name}</span></div></td>
                                <td className={`p-4 text-right font-mono font-bold text-lg text-purple-600 dark:text-purple-400 ${isSorted('powerScore') ? 'sorted-cell-highlight' : ''}`}>{Math.round(p.powerScore)}</td>
                                <td className="p-4"><Sparkline data={p.recentTrend} color={p.recentTrend[p.recentTrend.length-1] >= 10 ? '#059669' : '#94a3b8'} /></td>
                                <td className={`p-4 text-right hidden sm:table-cell text-blue-600 dark:text-blue-400 ${isSorted('avgScore') ? 'sorted-cell-highlight' : ''}`}>{p.avgScore}</td>
                                <td className={`p-4 text-right hidden md:table-cell text-teal-600 dark:text-teal-400 ${isSorted('avgChips') ? 'sorted-cell-highlight' : ''}`}>{Math.round(p.avgChips)}</td>
                                <td className={`p-4 text-right font-mono text-emerald-600 dark:text-emerald-400 ${isSorted('totalScore') ? 'sorted-cell-highlight' : ''}`}>{p.totalScore}</td>
                                <td className={`p-4 text-right font-mono ${p.totalChips >= 0 ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'} ${isSorted('totalChips') ? 'sorted-cell-highlight' : ''}`}>{p.totalChips > 0 ? '+' : ''}{p.totalChips}</td>
                                <td className={`p-4 text-center text-yellow-600 dark:text-yellow-400 font-bold ${isSorted('wins') ? 'sorted-cell-highlight' : ''}`}>{p.wins > 0 ? p.wins : <span className="text-slate-300 dark:text-slate-700 font-normal">-</span>}</td>
                                <td className={`p-4 text-right hidden md:table-cell text-orange-500 dark:text-orange-400 ${isSorted('goldContent') ? 'sorted-cell-highlight' : ''}`}>{p.goldContent}</td>
                                <td className={`p-4 text-center hidden sm:table-cell ${isSorted('votedMvpCount') ? 'sorted-cell-highlight' : ''}`}>{p.votedMvpCount > 0 && <span className="bg-indigo-100 text-indigo-700 dark:bg-purple-900/30 dark:text-purple-400 text-[10px] px-1.5 py-0.5 rounded border border-indigo-200 dark:border-purple-500/20">{p.votedMvpCount}</span>}</td>
                                <td className={`p-4 text-center hidden sm:table-cell ${isSorted('luckyCount') ? 'sorted-cell-highlight' : ''}`}>{p.luckyCount > 0 && <span className="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 text-[10px] px-1.5 py-0.5 rounded border border-pink-200 dark:border-pink-500/20">{p.luckyCount}</span>}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leaderboard;