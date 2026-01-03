import React, { useState, useEffect, useMemo } from 'react';
import Icon from './Icon';
import Avatar from './Avatar';
import ProRadarChart from '../charts/ProRadarChart';
import CareerChart from '../charts/CareerChart';
import HeadToHead from './HeadToHead';
import { compressImage, GAMES_PER_SEASON, BADGE_CONFIG } from '../lib/utils'; // ✅ 引入 BADGE_CONFIG

const PlayerProfileModal = ({ 
    player, 
    history, 
    onClose, 
    onUploadAvatar, 
    leagueStats, 
    isDark, 
    onNavigateToMatch, 
    allPlayerNames, 
    leaderboardData 
}) => {
    const [compareTarget, setCompareTarget] = useState(''); 
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);

    if (!player) return null;

    // --- 数据准备 ---
    const playerMatches = history
        .filter(m => m.results.some(r => r.name === player.name))
        .map(m => { 
            const res = m.results.find(r => r.name === player.name); 
            return { ...m, result: res, dateObj: new Date(m.date) }; 
        })
        .sort((a, b) => a.dateObj - b.dateObj);
        
    const totalGames = playerMatches.length;
    const wins = playerMatches.filter(m => m.result.rank === 1).length;
    
    useEffect(() => { 
        document.body.classList.add('modal-open'); 
        return () => document.body.classList.remove('modal-open'); 
    }, []);

    const handleFileChange = async (e) => { 
        if (e.target.files && e.target.files[0]) { 
            const base64 = await compressImage(e.target.files[0]); 
            onUploadAvatar(player.name, base64); 
            setIsEditingAvatar(false);
        } 
    };

    const careerK = Math.max(2, history.length / 4);
    const adjWinRate = wins / (totalGames + careerK); 

    // 🔥 雷达图计算逻辑
    const calculateRadarForPlayer = (targetPlayerName, targetMatches, targetTotalGames, targetTotalChips) => {
        if (targetTotalGames < 1) return [];

        const ranks = targetMatches.map(m => m.result.rank);
        const avgRank = ranks.reduce((a,b)=>a+b,0) / ranks.length;
        const variance = ranks.reduce((a,b)=>a+Math.pow(b-avgRank,2),0) / ranks.length;
        const stdDev = Math.sqrt(variance);
        let stabilityScore = Math.max(1, Math.min(10, 10 - stdDev)); 

        const totalScore = targetMatches.reduce((a,b)=>a+b.result.score,0);
        const avgScore = totalScore / targetTotalGames;
        const safeMaxAvgScore = leagueStats?.maxAvgScore || 1;
        const safeMaxGoldContent = leagueStats?.maxGoldContent || 1;
        
        const goldContent = totalScore > 0 ? targetTotalChips / totalScore : 0;
        const normAvgScore = safeMaxAvgScore > 0 ? avgScore / safeMaxAvgScore : 0;
        const normGoldContent = safeMaxGoldContent > 0 ? goldContent / safeMaxGoldContent : 0;
        let efficiencyScore = Math.max(1, Math.min(10, (normAvgScore * 0.6 + normGoldContent * 0.4) * 10));

        const avgChips = targetTotalChips / targetTotalGames;
        const safeMinChips = leagueStats?.minAvgChips || 0;
        const safeMaxChips = leagueStats?.maxAvgChips || 1;
        const range = safeMaxChips - safeMinChips;
        const normChips = range > 0 ? (avgChips - safeMinChips) / range : 0.5;
        let plunderScore = Math.max(1, Math.min(10, normChips * 9 + 1));

        const beatRates = targetMatches.map(m => {
            if (m.totalPlayers <= 1) return 0;
            return (m.totalPlayers - m.result.rank) / (m.totalPlayers - 1);
        });
        const avgBeatRate = beatRates.reduce((a,b)=>a+b,0) / beatRates.length;
        const safeMaxBeatRate = leagueStats?.maxAvgBeatRate || 1;
        const normBeatRate = safeMaxBeatRate > 0 ? avgBeatRate / safeMaxBeatRate : 0;
        let defeatScore = 0;
        if (normBeatRate >= 0.9) defeatScore = 9 + (normBeatRate - 0.9) * 10;
        else if (normBeatRate >= 0.7) defeatScore = 7 + (normBeatRate - 0.7) * 10;
        else if (normBeatRate >= 0.4) defeatScore = 4 + (normBeatRate - 0.4) * 10;
        else defeatScore = 1 + normBeatRate * 7.5;
        defeatScore = Math.max(1, Math.min(10, defeatScore));

        return [
            { label: '稳定 (Stability)', value: stabilityScore, raw: `σ=${stdDev.toFixed(1)}` },
            { label: '效率 (Efficiency)', value: efficiencyScore, raw: `Score:${avgScore.toFixed(1)}` },
            { label: '掠夺 (Plunder)', value: plunderScore, raw: `Avg:${Math.round(avgChips)}` },
            { label: '击败 (Defeat)', value: defeatScore, raw: `Rate:${(avgBeatRate*100).toFixed(0)}%` }
        ];
    };

    const radarStats = useMemo(() => {
        return calculateRadarForPlayer(player.name, playerMatches, totalGames, player.totalChips);
    }, [player, totalGames, playerMatches, leagueStats]);

    const compareRadarStats = useMemo(() => {
        if (!compareTarget || !leaderboardData) return null;
        const targetObj = leaderboardData.find(p => p.name === compareTarget);
        if (!targetObj) return null;
        
        const targetMatches = history.filter(m => m.results.some(r => r.name === compareTarget)).map(m => { 
            const res = m.results.find(r => r.name === compareTarget); 
            return { ...m, result: res }; 
        });
        
        return calculateRadarForPlayer(compareTarget, targetMatches, targetObj.gamesPlayed, targetObj.totalChips);
    }, [compareTarget, history, leaderboardData, leagueStats]);

    // 🌟🌟🌟 核心修改：升级版勋章逻辑 🌟🌟🌟
    const badges = useMemo(() => {
        const b = [];
        
        // --- 1. 按赛季计算 (全勤奖 & 筹码排行) ---
        // 先将所有比赛按赛季分组
        const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
        const seasonsMap = {}; 
        
        sortedHistory.forEach((match, index) => {
            const seasonNum = Math.ceil((index + 1) / GAMES_PER_SEASON);
            const seasonKey = `S${seasonNum}`;
            if (!seasonsMap[seasonKey]) seasonsMap[seasonKey] = [];
            seasonsMap[seasonKey].push(match);
        });

        // 遍历每个赛季
        Object.entries(seasonsMap).forEach(([seasonKey, matches]) => {
            // A. 计算该玩家在本赛季的出勤
            const myMatchesInSeason = matches.filter(m => m.results.some(r => r.name === player.name)).length;
            const totalMatchesInSeason = matches.length;

            // ✅ 规则1: 赛季全勤奖 (只要参与数 = 举办数，且大于0)
            if (totalMatchesInSeason > 0 && myMatchesInSeason === totalMatchesInSeason) {
                b.push({ 
                    icon: 'calendar-check', 
                    name: `${seasonKey} 全勤王`, 
                    color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400', 
                    desc: `${seasonKey} 赛季保持全勤 (${myMatchesInSeason}/${totalMatchesInSeason})` 
                });
            }

            // B. 计算该赛季的筹码排名 (金银铜筹码)
            // 算出该赛季所有人的总筹码
            const seasonChipsMap = {};
            matches.forEach(m => {
                m.results.forEach(r => {
                    if (!seasonChipsMap[r.name]) seasonChipsMap[r.name] = 0;
                    seasonChipsMap[r.name] += parseFloat(r.chips);
                });
            });
            // 排序
            const sortedSeasonPlayers = Object.entries(seasonChipsMap).sort(([, chipsA], [, chipsB]) => chipsB - chipsA);
            const myRankIndex = sortedSeasonPlayers.findIndex(([name]) => name === player.name);

            // ✅ 规则2: 赛季金银铜筹码
            if (myRankIndex === 0) {
                b.push({ icon: 'trophy', name: `${seasonKey} 金筹码`, color: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-400', desc: `${seasonKey} 赛季总筹码冠军` });
            } else if (myRankIndex === 1) {
                b.push({ icon: 'medal', name: `${seasonKey} 银筹码`, color: 'text-slate-500 bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300', desc: `${seasonKey} 赛季总筹码亚军` });
            } else if (myRankIndex === 2) {
                b.push({ icon: 'medal', name: `${seasonKey} 铜筹码`, color: 'text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-400', desc: `${seasonKey} 赛季总筹码季军` });
            }
        });

             // --- 2. 生涯通用勋章 (使用配置变量) ---
        
        // 👑 统治者
        const winRate = totalGames > 0 ? wins / totalGames : 0;
        if (totalGames >= 5 && winRate >= BADGE_CONFIG.RULER_WIN_RATE) { 
            b.push({ icon: 'crown', name: '统治者', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', desc: `生涯胜率超过 ${BADGE_CONFIG.RULER_WIN_RATE * 100}%` }); 
        }
        
        // 🤝 慈善家 (现在有了独立的阈值: CHARITY_THRESHOLD)
        // 注意：这里用 -BADGE_CONFIG.CHARITY_THRESHOLD，因为筹码是负数
        const charityCount = playerMatches.filter(m => m.result.chips <= -BADGE_CONFIG.CHARITY_THRESHOLD).length;
        if (charityCount > 0) { 
            b.push({ icon: 'heart-handshake', name: `慈善家${charityCount > 1 ? ' x' + charityCount : ''}`, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', desc: `累计 ${charityCount} 次单场“贡献”超过 ${BADGE_CONFIG.CHARITY_THRESHOLD} 筹码` }); 
        }
        
        // ⚡️ 神经刀 (现在有了独立的阈值: NERVE_KNIFE_LIMIT)
        const nerveKnifeCount = playerMatches.filter(m => m.result.chips >= BADGE_CONFIG.NERVE_KNIFE_LIMIT).length;
        if (nerveKnifeCount > 0) { 
            b.push({ icon: 'zap', name: `神经刀${nerveKnifeCount > 1 ? ' x' + nerveKnifeCount : ''}`, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20', desc: `累计 ${nerveKnifeCount} 次单场狂揽 ${BADGE_CONFIG.NERVE_KNIFE_LIMIT}+ 筹码` }); 
        }
        
        // 🍀 天选之子 (逻辑不变)
        const luckyCounts = {}; history.forEach(m => { if(m.luckyPlayer) { luckyCounts[m.luckyPlayer] = (luckyCounts[m.luckyPlayer] || 0) + 1; } });
        const maxLucky = Math.max(0, ...Object.values(luckyCounts));
        if (player.luckyCount > 0 && player.luckyCount >= maxLucky) { 
            b.push({ icon: 'clover', name: '天选之子', color: 'text-pink-500 bg-pink-500/10 border-pink-500/20', desc: '获得运气王次数全联盟第一' }); 
        }
        
        // 🛡️ 老兵
        if (totalGames >= BADGE_CONFIG.VETERAN_GAMES) { 
            b.push({ icon: 'shield', name: '老兵', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', desc: `参赛场次达到 ${BADGE_CONFIG.VETERAN_GAMES} 场以上` }); 
        }
        
        // 💔 意难平
        const secondPlacesCount = playerMatches.filter(m => m.result.rank === 2).length;
        if (secondPlacesCount >= BADGE_CONFIG.SECOND_PLACE_COUNT) { 
            b.push({ icon: 'divide', name: `意难平 x${secondPlacesCount}`, color: 'text-slate-500 bg-slate-500/10 border-slate-500/20', desc: `累计获得 ${secondPlacesCount} 次亚军` }); 
        }
        
        // 📈 逆风翻盘 (现在有了独立的阈值: COMEBACK_BUYIN_THRESHOLD)
        const comebackCount = playerMatches.filter(m => { 
            if (!m.transactions) return false; 
            const myBuyIn = m.transactions.filter(t => t.buyer === player.name).reduce((sum, t) => sum + parseFloat(t.amount), 0); 
            // 判断条件：买入超过阈值 且 最后盈利 > 0
            return myBuyIn >= BADGE_CONFIG.COMEBACK_BUYIN_THRESHOLD && m.result.chips > 0; 
        }).length;
        
        if (comebackCount > 0) { 
            b.push({ icon: 'trending-up', name: `逆风翻盘${comebackCount > 1 ? ' x' + comebackCount : ''}`, color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20', desc: `累计 ${comebackCount} 次单场买入超 ${BADGE_CONFIG.COMEBACK_BUYIN_THRESHOLD} 仍不仅没输，反而盈利` }); 
        }
        
        return b;
    }, [player, totalGames, wins, playerMatches, history, adjWinRate]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-modal" onClick={onClose}>
            <div className="glass-panel w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl relative bg-white/90 dark:bg-slate-900/90" onClick={e => e.stopPropagation()}>
                
                {/* 头部背景 */}
                <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-900 dark:to-slate-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-white/20 transition-colors z-10"><Icon name="x" className="w-5 h-5" /></button>
                </div>
                
                <div className="px-8 pb-8 -mt-16 relative">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* 头像区域 */}
                        <div className="relative group cursor-pointer">
                            <Avatar name={player.name} src={player.avatar?.avatar || player.avatar} size="xxl" className="border-4 border-white dark:border-[#0b0e14] shadow-2xl" />
                            <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all backdrop-blur-sm">
                                <Icon name="camera" className="text-white w-8 h-8" />
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                        
                        <div className="flex-1 pt-16 md:pt-0 md:mt-16">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{player.name}</h2>
                                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded shadow-lg shadow-indigo-500/20">OVR {Math.round(player.powerScore)}</span>
                            </div>
                            
                            {/* 勋章列表 */}
                            {badges.length > 0 && (
                                <div className="flex flex-wrap gap-2 my-3 animate-slide-up">
                                    {badges.map((badge, idx) => (
                                        <div key={idx} className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold border ${badge.color} cursor-help`} title={badge.desc}>
                                            <Icon name={badge.icon} className="w-3 h-3" />
                                            {badge.name}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-400">
                                {player.votedMvpCount > 0 && <span className="flex items-center gap-1 text-indigo-600 dark:text-yellow-400"><Icon name="star" className="w-3 h-3 fill-current"/> {player.votedMvpCount} MVP</span>}
                                {player.wins > 0 && <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><Icon name="trophy" className="w-3 h-3"/> {player.wins} 胜</span>}
                                <span className="text-slate-300 dark:text-slate-600">|</span><span>{totalGames} 场比赛</span>
                            </div>
                        </div>

                        {/* 右侧核心数据 */}
                        <div className="hidden md:flex gap-8 mt-20">
                            <div className="text-center">
                                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">实战胜率 (Raw)</div>
                                <div className="text-2xl font-mono font-bold text-slate-700 dark:text-white">{totalGames ? ((wins/totalGames)*100).toFixed(1) : 0}%</div>
                            </div>
                            <div className="text-center">
                                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">统治力指数 (Adj.)</div>
                                <div className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400">{(adjWinRate * 100).toFixed(1)}%</div>
                            </div>
                            <div className="text-center">
                                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">场均得分</div>
                                <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{player.avgScore}</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                        {/* 左侧：雷达图与交手记录 */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50 shadow-inner">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center flex-1">能力雷达 (v10.4 Pro)</h3>
                                    <div className="relative">
                                        <select 
                                            value={compareTarget} 
                                            onChange={e => setCompareTarget(e.target.value)} 
                                            className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded px-2 py-1 pr-6 focus:outline-none focus:border-emerald-500"
                                        >
                                            <option value="">⚔️ VS 对比</option>
                                            {allPlayerNames.filter(n => n !== player.name).map(n => (
                                                <option key={n} value={n}>{n}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-1 pointer-events-none text-slate-400"><Icon name="chevron-down" className="w-3 h-3"/></div>
                                    </div>
                                </div>

                                <ProRadarChart stats={radarStats} compareStats={compareRadarStats} compareName={compareTarget} isDark={isDark} />
                                
                                <div className="mt-5 space-y-3">
                                    {radarStats.map((s, i) => {
                                        const compareVal = compareRadarStats ? compareRadarStats[i].value : null;
                                        const diff = compareVal !== null ? s.value - compareVal : 0;
                                        
                                        return (
                                            <div key={i} className="flex flex-col gap-1">
                                                <div className="flex justify-between items-end text-xs">
                                                    <span className="font-bold text-slate-600 dark:text-slate-300">{s.label.split(' ')[0]}</span>
                                                    <div className="flex items-center gap-2">
                                                        {compareVal !== null && (
                                                            <span className={`text-[10px] font-mono ${diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                                                                {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                                                            </span>
                                                        )}
                                                        <span className="font-mono font-bold text-slate-800 dark:text-white">{s.value.toFixed(1)}</span>
                                                    </div>
                                                </div>
                                                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative">
                                                    <div className="absolute h-full bg-emerald-500 rounded-full" style={{ width: `${s.value * 10}%`, zIndex: 10 }}></div>
                                                    {compareVal !== null && (
                                                        <div className="absolute h-full bg-rose-500/50 rounded-full" style={{ width: `${compareVal * 10}%`, zIndex: 20, mixBlendMode: 'multiply' }}></div>
                                                    )}
                                                </div>
                                                <div className="text-[9px] text-slate-400 text-right scale-90 origin-right">{s.raw}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            
                            <HeadToHead player={player} opponent={compareTarget} history={history} />
                        </div>

                        {/* 右侧：图表与列表 */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50 shadow-inner">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">赛季积分走势</h3>
                                <CareerChart history={playerMatches.map(m => ({ score: m.result.score }))} isDark={isDark} />
                            </div>
                            <div className="bg-white dark:bg-slate-800/50 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/50 shadow-sm">
                                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-transparent">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">近期战绩 (点击查看详情)</h3>
                                    <span className="text-xs text-slate-400">近 {playerMatches.length} 场</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase font-semibold">
                                            <tr><th className="px-4 py-2 text-left">日期</th><th className="px-4 py-2 text-center">排名</th><th className="px-4 py-2 text-right">筹码</th><th className="px-4 py-2 text-right">积分</th><th className="px-4 py-2 text-right">评分</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                            {playerMatches.reverse().map(m => (
                                                <tr key={m.id} onClick={() => onNavigateToMatch(m.id)} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer">
                                                    <td className="px-4 py-2 text-slate-600 dark:text-slate-300 font-mono text-xs">{m.date}</td>
                                                    <td className="px-4 py-2 text-center"><span className={`inline-block w-6 h-6 leading-6 rounded-full text-xs font-bold ${m.result.rank === 1 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' : m.result.rank <= 3 ? 'bg-slate-200 text-slate-700 dark:bg-slate-600/50 dark:text-white' : 'text-slate-400'}`}>{m.result.rank}</span></td>
                                                    <td className={`px-4 py-2 text-right font-mono ${m.result.chips >= 0 ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{m.result.chips > 0 ? '+' : ''}{m.result.chips}</td>
                                                    <td className="px-4 py-2 text-right font-bold text-slate-700 dark:text-white">+{m.result.score}</td>
                                                    <td className="px-4 py-2 text-right"><div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full ml-auto overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${(m.result.score / 25) * 100}%` }}></div></div></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerProfileModal;