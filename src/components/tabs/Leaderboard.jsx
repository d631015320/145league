import { memo } from 'react';
import Icon from '../common/Icon';
import Avatar from '../common/Avatar';
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
    const getSortIcon = (k) => {
        if (!isSorted(k)) return <Icon name="chevrons-up-down" className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />;
        return sortConfig.direction === 'desc' 
            ? <Icon name="chevron-down" className="w-3 h-3" />
            : <Icon name="chevron-up" className="w-3 h-3" />;
    };

    // 奖牌图标组件
    const MedalIcon = ({ rank }) => {
        if (rank === 0) return (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center shadow-md shadow-yellow-400/30">
                <Icon name="crown" className="w-4 h-4 text-yellow-900 fill-current" />
            </div>
        );
        if (rank === 1) return (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 flex items-center justify-center shadow-md shadow-slate-400/30">
                <span className="text-xs font-black text-slate-700">2</span>
            </div>
        );
        if (rank === 2) return (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center shadow-md shadow-orange-400/30">
                <span className="text-xs font-black text-orange-900">3</span>
            </div>
        );
        return null;
    };

    // 筛选数据
    const filteredData = data.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSelection = !showSelectedOnly || selectedPlayerNames.has(p.name);
        return matchesSearch && matchesSelection;
    });

    // 列高亮颜色配置 - 与数据颜色一致
    const columnHighlightConfig = {
        powerScore: { text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50/50 dark:bg-purple-900/10' },
        totalScore: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/50 dark:bg-emerald-900/10' },
        avgScore: { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50/50 dark:bg-blue-900/10' },
        totalChips: { text: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50/50 dark:bg-teal-900/10' },
        avgChips: { text: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50/50 dark:bg-teal-900/10' },
        goldContent: { text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50/50 dark:bg-orange-900/10' },
        wins: { text: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50/50 dark:bg-yellow-900/10' },
        votedMvpCount: { text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50/50 dark:bg-indigo-900/10' },
        luckyCount: { text: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50/50 dark:bg-pink-900/10' }
    };

    // 可排序表头样式 - 根据列类型使用不同的高亮颜色
    const getHeaderHighlightClass = (k) => {
        if (!isSorted(k)) return '';
        const config = columnHighlightConfig[k];
        return config ? `${config.text} ${config.bg}` : '';
    };

    // 获取数据单元格的高亮背景
    const getCellHighlightBg = (k) => {
        if (!isSorted(k)) return '';
        const config = columnHighlightConfig[k];
        return config ? config.bg : '';
    };

    const sortableHeaderClass = (k, align = 'right') => `
        px-4 py-3 ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}
        cursor-pointer select-none group transition-colors whitespace-nowrap
        hover:bg-slate-100 dark:hover:bg-slate-800/50
        border-b border-slate-200 dark:border-slate-800
        ${getHeaderHighlightClass(k)}
    `;

    return (
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700/50">
            {/* 精简工具栏 */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 flex flex-wrap justify-between items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex flex-wrap gap-3">
                    <div className="relative min-w-[160px]">
                        <label htmlFor="season-select-leaderboard" className="sr-only">选择赛季</label>
                        <select 
                            id="season-select-leaderboard"
                            value={selectedSeason} 
                            onChange={e => onSeasonChange(e.target.value)} 
                            aria-label="选择赛季筛选排行榜"
                            className="input-pro w-full pl-3 pr-8 py-2 rounded-lg text-sm bg-white dark:bg-slate-800/50 font-bold appearance-none cursor-pointer"
                        >
                            <option value="all">🏆 全赛季总榜</option>
                            {availableSeasons.map(s => {
                                const sNum = s.slice(1);
                                const start = (sNum - 1) * GAMES_PER_SEASON + 1;
                                const end = sNum * GAMES_PER_SEASON;
                                return <option key={s} value={s}>🏁 S{sNum} (G{start}-{end})</option>;
                            })}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500" aria-hidden="true">
                            <Icon name="chevron-down" className="w-4 h-4"/>
                        </div>
                    </div>
                    
                    <div className="relative w-56 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
                            <Icon name="search" className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors"/>
                        </div>
                        <label htmlFor="player-search" className="sr-only">搜索玩家</label>
                        <input 
                            id="player-search"
                            type="text" 
                            placeholder="搜索玩家..." 
                            value={searchTerm} 
                            onChange={(e) => onSearchChange(e.target.value)} 
                            aria-label="搜索玩家名称"
                            className="input-pro w-full pl-10 pr-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800/50" 
                        />
                    </div>
                </div>

                <button 
                    onClick={toggleSelectionMode} 
                    aria-label={isSelectionMode ? '退出多选模式' : '进入多选模式'}
                    aria-pressed={isSelectionMode}
                    className={`p-2 rounded-lg border transition-colors ${isSelectionMode 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                        : 'bg-white dark:bg-transparent border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-400'}`}
                    title="多选模式"
                >
                    <Icon name="list-checks" className="w-4 h-4" aria-hidden="true"/>
                </button>
            </div>

            {/* 选择模式工具条 */}
            {isSelectionMode && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 flex justify-between items-center text-xs text-indigo-600 dark:text-indigo-300 border-b border-indigo-100 dark:border-indigo-500/20" role="toolbar" aria-label="多选模式工具栏">
                    <span className="font-bold" aria-live="polite">已选: {selectedPlayerNames.size}</span>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowSelectedOnly(!showSelectedOnly)} 
                            aria-pressed={showSelectedOnly}
                            aria-label={showSelectedOnly ? '显示全部玩家' : '仅显示已选玩家'}
                            className="hover:underline"
                        >
                            {showSelectedOnly ? '显示全部' : '仅看已选'}
                        </button>
                        <button 
                            onClick={onClearSelection} 
                            aria-label="清空所有选择"
                            className="hover:underline"
                        >
                            清空
                        </button>
                    </div>
                </div>
            )}

            {/* 移动端卡片视图 */}
            <div className="block md:hidden bg-slate-50 dark:bg-[#0b0e14]">
                {filteredData.map((p, idx) => (
                    <div 
                        key={p.name} 
                        onClick={() => isSelectionMode ? togglePlayerSelection(p.name) : onPlayerClick(p)} 
                        className={`p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 active:bg-slate-100 dark:active:bg-slate-800/50 transition-colors ${selectedPlayerNames.has(p.name) ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''}`}
                    >
                        <div className="flex flex-col items-center gap-1 min-w-[3rem]">
                            {isSelectionMode ? 
                                <input type="checkbox" checked={selectedPlayerNames.has(p.name)} readOnly className="accent-indigo-500 w-5 h-5" /> : 
                                <span className={`inline-block w-6 h-6 leading-6 text-center rounded text-[10px] font-bold ${idx===0?'rank-badge-1':idx===1?'rank-badge-2':idx===2?'rank-badge-3':'text-slate-400 bg-slate-200 dark:bg-slate-700'}`}>{idx+1}</span>
                            }
                            <Avatar name={p.name} src={p.avatar?.avatar || p.avatar} size="md" bordered={false} className="shadow-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-slate-800 dark:text-white truncate">{p.name}</span>
                                <span className="font-mono font-bold text-purple-600 dark:text-purple-400 text-lg tabular-nums">{Math.round(p.powerScore)}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                    <div className="text-[10px] text-slate-400 uppercase">场均分</div>
                                    <div className="font-bold text-blue-600 dark:text-blue-400 tabular-nums">{p.avgScore}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-400 uppercase">总筹码</div>
                                    <div className={`font-bold font-mono tabular-nums ${p.totalChips>=0?'text-teal-500':'text-slate-400'}`}>{p.totalChips>0?'+':''}{p.totalChips}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-400 uppercase">吃鸡</div>
                                    <div className="font-bold text-yellow-600 dark:text-yellow-500">{p.wins > 0 ? `${p.wins}胜` : '-'}</div>
                                </div>
                            </div>
                        </div>
                        <Icon name="chevron-right" className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    </div>
                ))}
            </div>

            {/* 桌面端表格 - 优化版 */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse" style={{ fontVariantNumeric: 'tabular-nums', tableLayout: 'auto' }}>
                    <thead className="bg-slate-50 dark:bg-[#0f141a] text-slate-500 text-[11px] uppercase font-bold tracking-wider sticky top-0 z-20">
                        <tr>
                            <th className="px-4 py-3 w-14 text-center border-b border-slate-200 dark:border-slate-800">#</th>
                            <th className="px-4 py-3 text-left border-b border-slate-200 dark:border-slate-800 min-w-[160px]">玩家</th>
                            <th className={sortableHeaderClass('powerScore', 'center')} onClick={() => onSort('powerScore')}>
                                <span className="inline-flex items-center gap-1 justify-center">战力 {getSortIcon('powerScore')}</span>
                            </th>
                            <th className={sortableHeaderClass('totalScore', 'center')} onClick={() => onSort('totalScore')}>
                                <span className="inline-flex items-center gap-1 justify-center">总积分 {getSortIcon('totalScore')}</span>
                            </th>
                            <th className={sortableHeaderClass('avgScore', 'center')} onClick={() => onSort('avgScore')}>
                                <span className="inline-flex items-center gap-1 justify-center">场均得分 {getSortIcon('avgScore')}</span>
                            </th>
                            <th className="px-3 py-3 w-20 text-center border-b border-slate-200 dark:border-slate-800">趋势</th>
                            <th className={sortableHeaderClass('totalChips', 'center')} onClick={() => onSort('totalChips')}>
                                <span className="inline-flex items-center gap-1 justify-center">总筹码 {getSortIcon('totalChips')}</span>
                            </th>
                            <th className={sortableHeaderClass('avgChips', 'center')} onClick={() => onSort('avgChips')}>
                                <span className="inline-flex items-center gap-1 justify-center">场均筹码 {getSortIcon('avgChips')}</span>
                            </th>
                            <th className={sortableHeaderClass('goldContent', 'center')} onClick={() => onSort('goldContent')}>
                                <span className="inline-flex items-center gap-1 justify-center">含金量 {getSortIcon('goldContent')}</span>
                            </th>
                            <th className={sortableHeaderClass('wins', 'center')} onClick={() => onSort('wins')}>
                                <span className="inline-flex items-center gap-1 justify-center">吃鸡数 {getSortIcon('wins')}</span>
                            </th>
                            <th className={sortableHeaderClass('votedMvpCount', 'center')} onClick={() => onSort('votedMvpCount')}>
                                <span className="inline-flex items-center gap-1 justify-center">MVP {getSortIcon('votedMvpCount')}</span>
                            </th>
                            <th className={sortableHeaderClass('luckyCount', 'center')} onClick={() => onSort('luckyCount')}>
                                <span className="inline-flex items-center gap-1 justify-center">运气王 {getSortIcon('luckyCount')}</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="text-base">
                        {filteredData.map((p, idx) => (
                            <tr 
                                key={p.name} 
                                onClick={() => isSelectionMode ? togglePlayerSelection(p.name) : onPlayerClick(p)} 
                                className={`
                                    border-b border-slate-100 dark:border-slate-800/50 
                                    hover:bg-slate-50 dark:hover:bg-slate-800/30 
                                    transition-colors cursor-pointer 
                                    ${selectedPlayerNames.has(p.name) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}
                                    ${idx < 3 ? 'bg-gradient-to-r from-transparent via-slate-50/50 to-transparent dark:via-slate-800/30' : ''}
                                `}
                            >
                                <td className="px-4 py-4 text-center text-slate-400">
                                    {isSelectionMode 
                                        ? <input type="checkbox" checked={selectedPlayerNames.has(p.name)} onChange={()=>{}} className="accent-indigo-500" /> 
                                        : (idx < 3 
                                            ? <MedalIcon rank={idx} />
                                            : <span className="text-slate-400">{idx+1}</span>
                                        )
                                    }
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar name={p.name} src={p.avatar?.avatar || p.avatar} size={idx < 3 ? 'md' : 'sm'} bordered={false} className={idx < 3 ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ' + (idx === 0 ? 'ring-yellow-400' : idx === 1 ? 'ring-slate-300' : 'ring-orange-400') : ''} />
                                        <span className={`font-semibold text-slate-700 dark:text-white truncate max-w-[120px] ${idx < 3 ? 'text-base' : ''}`}>{p.name}</span>
                                    </div>
                                </td>
                                <td className={`px-5 py-4 text-center ${getCellHighlightBg('powerScore')}`}>
                                    <span className={`font-black text-purple-600 dark:text-purple-400 ${idx < 3 ? 'text-xl' : 'text-lg'}`}>
                                        {Math.round(p.powerScore)}
                                    </span>
                                </td>
                                <td className={`pl-5 pr-10 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400 ${getCellHighlightBg('totalScore')}`}>
                                    {p.totalScore}
                                </td>
                                <td className={`px-5 py-4 text-center font-bold text-blue-600 dark:text-blue-400 ${getCellHighlightBg('avgScore')}`}>
                                    {p.avgScore}
                                </td>
                                <td className="px-3 py-4 w-20">
                                    <Sparkline data={p.recentTrend} color={p.recentTrend[p.recentTrend.length-1] >= 10 ? '#059669' : '#94a3b8'} />
                                </td>
                                <td className={`pl-5 pr-10 py-4 text-right ${p.totalChips >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'} ${getCellHighlightBg('totalChips')}`}>
                                    {p.totalChips > 0 ? '+' : ''}{p.totalChips}
                                </td>
                                <td className={`pl-5 pr-10 py-4 text-right ${p.avgChips >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'} ${getCellHighlightBg('avgChips')}`}>
                                    {Math.round(p.avgChips)}
                                </td>
                                <td className={`px-5 py-4 text-center text-orange-500 dark:text-orange-400 ${getCellHighlightBg('goldContent')}`}>
                                    {p.goldContent !== undefined && p.goldContent !== null ? p.goldContent : <span className="text-slate-300 dark:text-slate-600">-</span>}
                                </td>
                                <td className={`px-5 py-4 text-center ${getCellHighlightBg('wins')}`}>
                                    {p.wins > 0 
                                        ? <span className="text-yellow-600 dark:text-yellow-400 font-bold">{p.wins}</span>
                                        : <span className="text-slate-300 dark:text-slate-600">-</span>
                                    }
                                </td>
                                <td className={`px-5 py-4 text-center ${getCellHighlightBg('votedMvpCount')}`}>
                                    {p.votedMvpCount > 0 
                                        ? <span className="text-indigo-600 dark:text-indigo-400 font-bold">{p.votedMvpCount}</span>
                                        : <span className="text-slate-300 dark:text-slate-600">-</span>
                                    }
                                </td>
                                <td className={`px-5 py-4 text-center ${getCellHighlightBg('luckyCount')}`}>
                                    {p.luckyCount > 0 
                                        ? <span className="text-pink-600 dark:text-pink-400 font-bold">{p.luckyCount}</span>
                                        : <span className="text-slate-300 dark:text-slate-600">-</span>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default memo(Leaderboard);
