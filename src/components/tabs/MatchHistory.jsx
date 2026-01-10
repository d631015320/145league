import { memo } from 'react';
import Icon from '../common/Icon';

const MatchHistory = ({ 
    matches, 
    matchSeasons, 
    isAdmin, 
    highlightMatchId, 
    onEdit, 
    onDelete, 
    onSettle 
}) => {
    return (
        <div className="space-y-4" role="list" aria-label="比赛历史记录">
            {matches.map((m) => (
                <div 
                    id={`match-${m.id}`}
                    key={m.id} 
                    role="listitem"
                    aria-label={`${m.date} 比赛，${m.totalPlayers}人参赛`}
                    className={`glass-panel rounded-xl overflow-hidden group border border-slate-200 dark:border-slate-700/50 ${highlightMatchId === m.id ? 'animate-pulse-highlight ring-2 ring-emerald-500 dark:ring-emerald-400' : ''}`}
                >
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3 px-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm font-bold">{m.date}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold">{matchSeasons[m.id]}</span>
                            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">{m.totalPlayers} 人参赛</span>
                        </div>
                        
                        {isAdmin && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2" role="toolbar" aria-label="比赛操作">
                                <button 
                                    onClick={() => onSettle(m)} 
                                    aria-label={`查看 ${m.date} 比赛结算单`}
                                    className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                                >
                                    <Icon name="banknote" className="w-3.5 h-3.5" aria-hidden="true"/> 结算
                                </button>
                                <button 
                                    onClick={() => onEdit(m)} 
                                    aria-label={`编辑 ${m.date} 比赛记录`}
                                    className="text-blue-500 hover:text-blue-600"
                                >
                                    <Icon name="edit-2" className="w-4 h-4" aria-hidden="true"/>
                                </button>
                                <button 
                                    onClick={() => onDelete(m.id)} 
                                    aria-label={`删除 ${m.date} 比赛记录`}
                                    className="text-red-500 hover:text-red-600"
                                >
                                    <Icon name="trash" className="w-4 h-4" aria-hidden="true"/>
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                        {m.results.map((r) => (
                            <div key={r.name} className={`relative p-2 rounded border flex flex-col items-center justify-center text-center transition-colors ${r.rank===1 ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-500/10 dark:border-yellow-500/30' : 'bg-white dark:bg-slate-800/30 border-slate-100 dark:border-slate-700/30'}`}>
                                <span className={`text-[10px] font-bold absolute top-1 left-2 ${r.rank===1?'text-yellow-600 dark:text-yellow-500':'text-slate-400'}`} aria-hidden="true">#{r.rank}</span>
                                <div className="font-bold text-sm text-slate-700 dark:text-slate-200 mt-1 mb-1">{r.name}</div>
                                <div className="flex gap-2 text-[10px] font-mono">
                                    <span className={r.chips>=0?'text-red-500 dark:text-red-300':'text-emerald-600 dark:text-emerald-300'}>{r.chips}</span>
                                    <span className="text-slate-300 dark:text-slate-500" aria-hidden="true">|</span>
                                    <span className="text-slate-600 dark:text-white">+{r.score}</span>
                                </div>
                                <span className="sr-only">排名第{r.rank}，筹码{r.chips}，积分{r.score}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default memo(MatchHistory);