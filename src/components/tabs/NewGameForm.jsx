import React, { useState, useEffect, useMemo } from 'react';
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
    
    // 交易临时状态
    const [buyInBuyer, setBuyInBuyer] = useState('');
    const [buyInAmount, setBuyInAmount] = useState('');
    const [buyInSeller, setBuyInSeller] = useState('Official');

    // 🔒 安全锁：防止组件刚加载时，空数据覆盖了本地缓存
    const [hasLoaded, setHasLoaded] = useState(false);

    // ==========================================
    // 💾 功能 1: 自动保存/恢复草稿 (修复版)
    // ==========================================
    
    // 1. 初始化加载 (只执行一次)
    useEffect(() => {
        // 如果是编辑历史比赛模式，优先加载传入的比赛数据
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
            // 标记加载完成
            setHasLoaded(true);
        } 
        // 否则，是新游戏模式，尝试读取草稿
        else {
            const savedDraft = localStorage.getItem('match_draft');
            if (savedDraft) {
                try {
                    const draft = JSON.parse(savedDraft);
                    if (draft.gameDate) setGameDate(draft.gameDate);
                    // 只有当草稿里真的有数据时才覆盖默认值
                    if (draft.roster && draft.roster.length > 0) setRoster(draft.roster);
                    if (draft.transactions) setTransactions(draft.transactions);
                    if (draft.finalStacks) setFinalStacks(draft.finalStacks);
                    if (draft.votedMvp) setVotedMvp(draft.votedMvp);
                    if (draft.luckyPlayer) setLuckyPlayer(draft.luckyPlayer);
                    console.log("✅ 草稿已恢复");
                } catch (e) {
                    console.error("❌ 草稿读取失败", e);
                }
            }
            // 无论有没有草稿，都标记加载完成，允许后续的保存操作
            setHasLoaded(true);
        }
    }, [editingMatch]); // 依赖 editingMatch，确保模式切换时重置

    // 2. 自动保存 (加了锁)
    useEffect(() => {
        // 🛑 如果还没加载完 (hasLoaded 为 false)，绝对不要保存！
        // 🛑 如果正在编辑历史比赛，也不要覆盖“新比赛”的草稿
        if (!hasLoaded || editingMatch) return;

        const draftData = {
            gameDate,
            roster,
            transactions,
            finalStacks,
            votedMvp,
            luckyPlayer
        };
        
        // 只有当有一些数据的时候才保存，全是空就不存了（可选优化）
        localStorage.setItem('match_draft', JSON.stringify(draftData));
        // console.log("💾 草稿已自动保存");

    }, [gameDate, roster, transactions, finalStacks, votedMvp, luckyPlayer, hasLoaded, editingMatch]);


    // ==========================================
    // 🧠 功能 2: 智能名字解析 (实名 -> 网名)
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

    const addPlayerToRoster = () => { 
        const resolvedName = resolvePlayerName(newPlayerName);
        if (resolvedName) {
            if (!roster.includes(resolvedName)) { 
                setRoster([...roster, resolvedName]); 
                setNewPlayerName(''); 
            } else {
                alert(`"${resolvedName}" 已经在列表里了`);
                setNewPlayerName('');
            }
        }
    };
    
    const removePlayerFromRoster = (name) => { 
        if (transactions.some(t => t.buyer === name || t.seller === name)) { 
            alert("该玩家已有交易记录，无法移除。请先删除相关交易。"); 
            return; 
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
            alert(`⚠️ 账目不平！\n\n当前净盈亏总和: ${totalNet.toFixed(2)}\n必须等于 0 才能保存。`);
            return;
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
            date: gameDate, 
            totalPlayers: sorted.length, 
            results, 
            votedMvp, 
            luckyPlayer, 
            roster, 
            transactions, 
            finalStacks 
        };
        
        localStorage.removeItem('match_draft'); // ✅ 保存成功后，清除草稿
        onSave(matchData);
        
        // 重置本地状态
        setRoster([]);
        setTransactions([]);
        setFinalStacks({});
        setVotedMvp('');
        setLuckyPlayer('');
    };

    if (!isAdmin) {
        return (
            <div className="glass-panel p-6 rounded-2xl max-w-4xl mx-auto shadow-lg border border-slate-200 dark:border-slate-700/50 text-center py-10">
                <Icon name="lock" className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4"/>
                <p className="text-slate-500 dark:text-slate-400 mb-4">需要管理员权限</p>
            </div>
        );
    }

    return (
        <div className="glass-panel p-6 rounded-2xl max-w-4xl mx-auto shadow-lg border border-slate-200 dark:border-slate-700/50">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><Icon name="edit-3" className="w-5 h-5 text-emerald-500"/> 比赛管理台</h2>
                {editingMatch && <button onClick={onCancelEdit} className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300">取消编辑</button>}
            </div>

            <div className="space-y-8">
                {/* 顶部输入 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">比赛日期</label>
                        <input type="date" value={gameDate} onChange={e=>setGameDate(e.target.value)} className="input-pro w-full p-2.5 rounded-lg bg-white dark:bg-slate-900" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">添加玩家</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                list="player-suggestions" 
                                placeholder="输入网名或实名..." 
                                value={newPlayerName} 
                                onChange={e=>setNewPlayerName(e.target.value)} 
                                onKeyDown={e=>e.key==='Enter'&&addPlayerToRoster()} 
                                className="input-pro flex-1 p-2.5 rounded-lg bg-white dark:bg-slate-900" 
                            />
                            <datalist id="player-suggestions">
                                {allPlayerNames.map(name => {
                                    const realName = playerProfiles && playerProfiles[name]?.realName;
                                    const displayLabel = realName ? `${name} (${realName})` : name;
                                    return <option key={name} value={name} label={displayLabel} />;
                                })}
                            </datalist>
                            <button onClick={addPlayerToRoster} className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white px-4 rounded-lg"><Icon name="plus" className="w-5 h-5"/></button>
                        </div>
                    </div>
                </div>

                {roster.length > 0 && (
                    <>
                        <hr className="border-slate-200 dark:border-slate-700/50" />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* 左侧：买入记录 */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Icon name="shopping-cart" className="w-4 h-4"/> 买入/交易记录</h3>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 flex flex-wrap gap-2 items-end">
                                    <div className="flex-1 min-w-[100px]">
                                        <span className="text-[10px] text-slate-400 block mb-1">买家</span>
                                        <select value={buyInBuyer} onChange={e=>setBuyInBuyer(e.target.value)} className="input-pro w-full p-2 rounded text-sm bg-white dark:bg-slate-900"><option value="">选择玩家</option>{roster.map(p=><option key={p} value={p}>{p}</option>)}</select>
                                    </div>
                                    <div className="w-24">
                                        <span className="text-[10px] text-slate-400 block mb-1">金额</span>
                                        <input type="number" value={buyInAmount} onChange={e=>setBuyInAmount(e.target.value)} className="input-pro w-full p-2 rounded text-sm bg-white dark:bg-slate-900" placeholder="0" />
                                    </div>
                                    <div className="flex-1 min-w-[100px]">
                                        <span className="text-[10px] text-slate-400 block mb-1">卖家</span>
                                        <select value={buyInSeller} onChange={e=>setBuyInSeller(e.target.value)} className="input-pro w-full p-2 rounded text-sm bg-white dark:bg-slate-900"><option value="Official">🏛️ 官方</option>{roster.filter(p=>p!==buyInBuyer).map(p=><option key={p} value={p}>👤 {p}</option>)}</select>
                                    </div>
                                    <button onClick={addTransaction} className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded w-10 h-[38px] flex items-center justify-center"><Icon name="check" className="w-5 h-5"/></button>
                                </div>
                                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                                    {transactions.map(t => (
                                        <div key={t.id} className="flex justify-between items-center text-xs bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800 animate-slide-up">
                                            <div className="flex items-center gap-2"><span className="text-slate-400 font-mono">{t.time}</span><span className="font-bold text-slate-700 dark:text-slate-200">{t.buyer}</span><span className="text-slate-400">买入</span><span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{t.amount}</span><span className="text-slate-400">来自</span><span className={t.seller==='Official'?'text-blue-500':'text-slate-700 dark:text-slate-200'}>{t.seller==='Official'?'官方':t.seller}</span></div>
                                            <button onClick={()=>deleteTransaction(t.id)} className="text-slate-400 hover:text-red-500"><Icon name="trash-2" className="w-3 h-3"/></button>
                                        </div>
                                    ))}
                                    {transactions.length===0 && <div className="text-center text-slate-400 text-xs py-4">暂无交易记录</div>}
                                </div>
                            </div>

                            {/* 右侧：离场计算 */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Icon name="calculator" className="w-4 h-4"/> 离场清算 (自动计算净胜)</h3>
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    <table className="w-full text-xs">
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
                        <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl grid grid-cols-2 gap-4 border border-slate-200 dark:border-slate-700/50">
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