import React, { useState, useEffect, useMemo, useRef } from 'react';
import Icon from '../Icon';
import { BASE_SCORES, CHIP_EXCHANGE_RATE } from '../../lib/utils'; 

const NewGameForm = ({ isAdmin, allPlayerNames, playerProfiles, editingMatch, onSave, onCancelEdit }) => {
    // 内部状态
    const [gameDate, setGameDate] = useState(new Date().toISOString().slice(0, 10));
    const [roster, setRoster] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [finalStacks, setFinalStacks] = useState({});
    const [votedMvp, setVotedMvp] = useState('');
    const [luckyPlayer, setLuckyPlayer] = useState('');
    const [newPlayerName, setNewPlayerName] = useState('');
    
    // 🔥 新增：控制下拉菜单显示的状态
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionRef = useRef(null);

    // 交易临时状态
    const [buyInBuyer, setBuyInBuyer] = useState('');
    const [buyInAmount, setBuyInAmount] = useState('');
    const [buyInSeller, setBuyInSeller] = useState('Official');

    // 🔒 安全锁
    const [hasLoaded, setHasLoaded] = useState(false);

    // 点击外部关闭下拉菜单
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ... (中间的 useEffect 自动保存/恢复逻辑完全保持不变，此处省略，请保留原有的逻辑) ...
    // ⚠️ 请务必保留原代码中 "自动保存/恢复草稿" 的两个 useEffect 逻辑
    // 为了节省篇幅，这里假设你已经保留了它们
    // ...

    // ==========================================
    // 💾 功能 1: 自动保存/恢复草稿 (请确保保留了原代码的这部分)
    // ==========================================
    useEffect(() => {
        if (editingMatch) {
            setGameDate(editingMatch.date);
            setVotedMvp(editingMatch.votedMvp || '');
            setLuckyPlayer(editingMatch.luckyPlayer || '');
            if (editingMatch.roster) {
                setRoster(editingMatch.roster);
                setTransactions(editingMatch.transactions || []);
                setFinalStacks(editingMatch.finalStacks || {});
            } else {
                setRoster(editingMatch.results.map(r => r.name));
                setTransactions([]);
                const stacks = {};
                editingMatch.results.forEach(r => stacks[r.name] = r.chips);
                setFinalStacks(stacks);
                alert("注意：正在编辑旧版本数据，流水已重置，请手动补全。");
            }
            setHasLoaded(true);
        } else {
            const savedDraft = localStorage.getItem('match_draft');
            if (savedDraft) {
                try {
                    const draft = JSON.parse(savedDraft);
                    if (draft.gameDate) setGameDate(draft.gameDate);
                    if (draft.roster && draft.roster.length > 0) setRoster(draft.roster);
                    if (draft.transactions) setTransactions(draft.transactions);
                    if (draft.finalStacks) setFinalStacks(draft.finalStacks);
                    if (draft.votedMvp) setVotedMvp(draft.votedMvp);
                    if (draft.luckyPlayer) setLuckyPlayer(draft.luckyPlayer);
                } catch (e) { console.error(e); }
            }
            setHasLoaded(true);
        }
    }, [editingMatch]);

    useEffect(() => {
        if (!hasLoaded || editingMatch) return;
        const draftData = { gameDate, roster, transactions, finalStacks, votedMvp, luckyPlayer };
        localStorage.setItem('match_draft', JSON.stringify(draftData));
    }, [gameDate, roster, transactions, finalStacks, votedMvp, luckyPlayer, hasLoaded, editingMatch]);


    // ==========================================
    // 🧠 功能 2: 智能名字解析
    // ==========================================
    const resolvePlayerName = (input) => {
        const trimmedInput = input.trim();
        if (!trimmedInput) return null;
        const directMatch = allPlayerNames.find(n => n.toLowerCase() === trimmedInput.toLowerCase());
        if (directMatch) return directMatch;
        if (playerProfiles) {
            const foundEntry = Object.entries(playerProfiles).find(([nickname, profile]) => {
                return profile.realName && profile.realName.toLowerCase() === trimmedInput.toLowerCase();
            });
            if (foundEntry) return foundEntry[0]; 
        }
        return trimmedInput;
    };

    const addPlayerToRoster = (nameToAdd = null) => { 
        // 支持点击下拉项直接添加
        const targetName = nameToAdd || newPlayerName;
        const resolvedName = resolvePlayerName(targetName);

        if (resolvedName) {
            if (!roster.includes(resolvedName)) { 
                setRoster([...roster, resolvedName]); 
                setNewPlayerName(''); 
                setShowSuggestions(false); // 关闭下拉
            } else {
                alert(`"${resolvedName}" 已经在列表里了`);
                setNewPlayerName('');
            }
        }
    };
    
    // ... (removePlayerFromRoster, addTransaction, deleteTransaction, updateFinalStack, calculatedResults 逻辑保持不变) ...
    // 为了节省篇幅，请保留原有的这些函数
    const removePlayerFromRoster = (name) => { 
        if (transactions.some(t => t.buyer === name || t.seller === name)) { 
            alert("该玩家已有交易记录，无法移除。请先删除相关交易。"); return; 
        } 
        setRoster(roster.filter(n => n !== name)); 
        const newStacks = {...finalStacks}; 
        delete newStacks[name]; 
        setFinalStacks(newStacks); 
    };

    const addTransaction = () => { 
        if (!buyInBuyer || !buyInAmount) return; 
        const amount = parseFloat(buyInAmount); 
        if (isNaN(amount) || amount <= 0) return; 
        const newTx = { id: Date.now(), buyer: buyInBuyer, amount: amount, seller: buyInSeller, time: new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'}) }; 
        setTransactions([newTx, ...transactions]); 
        setBuyInAmount(''); 
    };

    const deleteTransaction = (id) => setTransactions(transactions.filter(t => t.id !== id));
    
    const updateFinalStack = (name, value) => { 
        setFinalStacks(prev => ({...prev, [name]: parseFloat(value) || 0})); 
    };

    const calculatedResults = useMemo(() => {
        const buyIns = {}; roster.forEach(p => buyIns[p] = 0);
        transactions.forEach(t => { 
            if (buyIns[t.buyer] !== undefined) buyIns[t.buyer] += t.amount; 
            if (t.seller !== 'Official' && buyIns[t.seller] !== undefined) { buyIns[t.seller] -= t.amount; } 
        });
        return roster.map(p => { 
            const totalBuyIn = buyIns[p] || 0; 
            const stack = finalStacks[p] || 0; 
            const net = stack - totalBuyIn; 
            return { name: p, totalBuyIn, finalStack: stack, net }; 
        });
    }, [roster, transactions, finalStacks]);

    const handleSaveGame = () => {
        if (roster.length < 2) return;
        const totalNet = calculatedResults.reduce((sum, p) => sum + p.net, 0);
        if (Math.abs(totalNet) > 0.01) { 
            alert(`⚠️ 账目不平！\n\n当前净盈亏总和: ${totalNet.toFixed(2)}\n必须等于 0 才能保存。`); return;
        }
        const sorted = [...calculatedResults].sort((a, b) => b.net - a.net);
        const factor = sorted.length / 10;
        const results = sorted.map((p, i) => ({ 
            name: p.name, 
            chips: p.net, 
            rank: i + 1, 
            score: Math.round((i < 10 ? BASE_SCORES[i] * factor : 0) * 100) / 100 
        }));
        const matchData = { 
            date: gameDate, totalPlayers: sorted.length, results, 
            votedMvp, luckyPlayer, roster, transactions, finalStacks 
        };
        localStorage.removeItem('match_draft');
        onSave(matchData);
        setRoster([]); setTransactions([]); setFinalStacks({}); setVotedMvp(''); setLuckyPlayer('');
    };

    // 🔥 过滤建议列表
    const filteredSuggestions = allPlayerNames.filter(name => {
        if (!newPlayerName) return true; // 如果没输入，显示所有
        const lowerInput = newPlayerName.toLowerCase();
        const realName = playerProfiles && playerProfiles[name]?.realName;
        return name.toLowerCase().includes(lowerInput) || (realName && realName.toLowerCase().includes(lowerInput));
    });

    if (!isAdmin) return <div className="glass-panel p-6 text-center text-slate-500">需要管理员权限</div>;

    return (
        <div className="glass-panel p-4 sm:p-6 rounded-2xl max-w-4xl mx-auto shadow-lg border border-slate-200 dark:border-slate-700/50">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><Icon name="edit-3" className="w-5 h-5 text-emerald-500"/> 比赛管理台</h2>
                {editingMatch && <button onClick={onCancelEdit} className="text-xs text-red-500">取消编辑</button>}
            </div>

            <div className="space-y-6">
                {/* 顶部输入：移动端改用 flex-col 堆叠 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="md:col-span-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">比赛日期</label>
                        <input type="date" value={gameDate} onChange={e=>setGameDate(e.target.value)} className="input-pro w-full p-2.5 rounded-lg bg-white dark:bg-slate-900" />
                    </div>
                    <div className="md:col-span-2 relative" ref={suggestionRef}>
                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">添加玩家 (点选或搜索)</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input 
                                    type="text" 
                                    placeholder="输入网名或实名..." 
                                    value={newPlayerName} 
                                    onFocus={() => setShowSuggestions(true)}
                                    onChange={e=>{ setNewPlayerName(e.target.value); setShowSuggestions(true); }} 
                                    onKeyDown={e=>e.key==='Enter'&&addPlayerToRoster()} 
                                    className="input-pro w-full p-2.5 rounded-lg bg-white dark:bg-slate-900" 
                                />
                                {/* 🔥🔥🔥 自定义下拉菜单 (完美适配手机) 🔥🔥🔥 */}
                                {showSuggestions && (
                                    <div className="absolute z-50 left-0 right-0 top-full mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl">
                                        {filteredSuggestions.length > 0 ? (
                                            filteredSuggestions.map(name => {
                                                const realName = playerProfiles && playerProfiles[name]?.realName;
                                                return (
                                                    <div 
                                                        key={name}
                                                        onClick={() => addPlayerToRoster(name)}
                                                        className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex justify-between items-center"
                                                    >
                                                        <span className="font-bold text-slate-700 dark:text-slate-200">{name}</span>
                                                        {realName && <span className="text-xs text-slate-400">({realName})</span>}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="p-3 text-xs text-slate-400 text-center">无匹配玩家</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button onClick={() => addPlayerToRoster()} className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white px-4 rounded-lg flex-shrink-0"><Icon name="plus" className="w-5 h-5"/></button>
                        </div>
                    </div>
                </div>

                {roster.length > 0 && (
                    <>
                        <hr className="border-slate-200 dark:border-slate-700/50" />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* 左侧：买入记录 - 手机端优化布局 */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Icon name="shopping-cart" className="w-4 h-4"/> 买入/交易记录</h3>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 flex flex-col sm:flex-row flex-wrap gap-2 sm:items-end">
                                    <div className="flex-1 min-w-[120px]">
                                        <span className="text-[10px] text-slate-400 block mb-1">买家</span>
                                        <select value={buyInBuyer} onChange={e=>setBuyInBuyer(e.target.value)} className="input-pro w-full p-2 rounded text-sm bg-white dark:bg-slate-900"><option value="">选择玩家</option>{roster.map(p=><option key={p} value={p}>{p}</option>)}</select>
                                    </div>
                                    <div className="w-full sm:w-24">
                                        <span className="text-[10px] text-slate-400 block mb-1">金额</span>
                                        <input type="number" value={buyInAmount} onChange={e=>setBuyInAmount(e.target.value)} className="input-pro w-full p-2 rounded text-sm bg-white dark:bg-slate-900" placeholder="0" />
                                    </div>
                                    <div className="flex-1 min-w-[120px]">
                                        <span className="text-[10px] text-slate-400 block mb-1">卖家</span>
                                        <select value={buyInSeller} onChange={e=>setBuyInSeller(e.target.value)} className="input-pro w-full p-2 rounded text-sm bg-white dark:bg-slate-900"><option value="Official">🏛️ 官方</option>{roster.filter(p=>p!==buyInBuyer).map(p=><option key={p} value={p}>👤 {p}</option>)}</select>
                                    </div>
                                    <button onClick={addTransaction} className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded w-full sm:w-10 h-[38px] flex items-center justify-center mt-2 sm:mt-0"><Icon name="check" className="w-5 h-5"/></button>
                                </div>
                                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                                    {transactions.map(t => (
                                        <div key={t.id} className="flex justify-between items-center text-xs bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800 animate-slide-up">
                                            <div className="flex items-center gap-2 flex-wrap"><span className="text-slate-400 font-mono">{t.time}</span><span className="font-bold text-slate-700 dark:text-slate-200">{t.buyer}</span><span className="text-slate-400">买入</span><span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{t.amount}</span><span className="text-slate-400">自</span><span className={t.seller==='Official'?'text-blue-500':'text-slate-700 dark:text-slate-200'}>{t.seller==='Official'?'官方':t.seller}</span></div>
                                            <button onClick={()=>deleteTransaction(t.id)} className="text-slate-400 hover:text-red-500 p-1"><Icon name="trash-2" className="w-4 h-4"/></button>
                                        </div>
                                    ))}
                                    {transactions.length===0 && <div className="text-center text-slate-400 text-xs py-4">暂无交易记录</div>}
                                </div>
                            </div>

                            {/* 右侧：离场计算 */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Icon name="calculator" className="w-4 h-4"/> 离场清算</h3>
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden overflow-x-auto">
                                    <table className="w-full text-xs min-w-[300px]">
                                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500">
                                            <tr><th className="p-3 text-left">玩家</th><th className="p-3 text-right">总投入</th><th className="p-3 text-right w-24">剩余筹码</th><th className="p-3 text-right">净盈亏</th><th className="p-3 w-8"></th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {calculatedResults.map((p) => (
                                                <tr key={p.name}>
                                                    <td className="p-3 font-medium text-slate-700 dark:text-slate-200">{p.name}</td>
                                                    <td className="p-3 text-right text-red-400 font-mono">-{p.totalBuyIn}</td>
                                                    <td className="p-2"><input type="number" placeholder="0" value={finalStacks[p.name] || ''} onChange={e=>updateFinalStack(p.name, e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-1 text-right font-mono focus:border-emerald-500 outline-none" /></td>
                                                    <td className={`p-3 text-right font-bold font-mono ${p.net >= 0 ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{p.net > 0 ? '+' : ''}{p.net}</td>
                                                    <td className="p-2 text-center"><button onClick={()=>removePlayerFromRoster(p.name)} className="text-slate-400 hover:text-red-500"><Icon name="x" className="w-3 h-3"/></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* 底部：MVP 和保存 */}
                        <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-200 dark:border-slate-700/50">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">MVP 票选</label>
                                <select value={votedMvp} onChange={e=>setVotedMvp(e.target.value)} className="input-pro w-full p-2 rounded bg-white dark:bg-slate-900"><option value="">- 无 -</option>{roster.map(p=><option key={p} value={p}>{p}</option>)}</select>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">运气王</label>
                                <select value={luckyPlayer} onChange={e=>setLuckyPlayer(e.target.value)} className="input-pro w-full p-2 rounded bg-white dark:bg-slate-900"><option value="">- 无 -</option>{roster.map(p=><option key={p} value={p}>{p}</option>)}</select>
                            </div>
                        </div>

                        <button onClick={handleSaveGame} disabled={roster.length < 2} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex justify-center items-center gap-2">
                            <Icon name="save" className="w-5 h-5"/> {editingMatch ? "更新比赛记录" : "结算并保存"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default NewGameForm;