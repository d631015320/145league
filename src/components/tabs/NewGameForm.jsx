import { useState, useEffect, useMemo, useRef } from 'react';
import Icon from '../common/Icon';
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
            const foundEntry = Object.entries(playerProfiles).find(([_nickname, profile]) => {
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
        const newStacks = { ...finalStacks };
        delete newStacks[name];
        setFinalStacks(newStacks);
    };

    const addTransaction = () => {
        if (!buyInBuyer || !buyInAmount) return;
        const amount = parseFloat(buyInAmount);
        if (isNaN(amount) || amount <= 0) return;
        const newTx = { id: Date.now(), buyer: buyInBuyer, amount: amount, seller: buyInSeller, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) };
        setTransactions([newTx, ...transactions]);
        setBuyInAmount('');
    };

    // 🔥 新增：批量买入
    const batchBuyIn = () => {
        const amountStr = prompt(`请输入每位玩家的买入金额 (当前共 ${roster.length} 人):`, "100");
        if (!amountStr) return;
        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) return;

        const newTxs = roster.map((player, idx) => ({
            id: Date.now() + idx,
            buyer: player,
            amount: amount,
            seller: 'Official',
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }));
        setTransactions([...newTxs, ...transactions]);
    };

    const deleteTransaction = (id) => setTransactions(transactions.filter(t => t.id !== id));

    const updateFinalStack = (name, value) => {
        setFinalStacks(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
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
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><Icon name="edit-3" className="w-5 h-5 text-emerald-500" /> 比赛管理台</h2>
                {editingMatch && <button onClick={onCancelEdit} className="text-xs text-red-500 min-h-[36px] px-3 touch-feedback">取消编辑</button>}
            </div>

            <div className="space-y-6">
                {/* 顶部输入：移动端堆叠布局 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="md:col-span-1">
                        <label htmlFor="game-date" className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">比赛日期</label>
                        <input
                            id="game-date"
                            type="date"
                            value={gameDate}
                            onChange={e => setGameDate(e.target.value)}
                            aria-label="选择比赛日期"
                            className="input-pro w-full p-2.5 rounded-lg bg-white dark:bg-slate-900 min-h-[44px]"
                        />
                    </div>
                    <div className="md:col-span-2 relative" ref={suggestionRef}>
                        <label htmlFor="add-player-input" className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">添加玩家 (点选或搜索)</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    id="add-player-input"
                                    type="text"
                                    placeholder="输入网名或实名..."
                                    value={newPlayerName}
                                    onFocus={() => setShowSuggestions(true)}
                                    onChange={e => { setNewPlayerName(e.target.value); setShowSuggestions(true); }}
                                    onKeyDown={e => e.key === 'Enter' && addPlayerToRoster()}
                                    aria-label="输入玩家名称"
                                    aria-autocomplete="list"
                                    aria-expanded={showSuggestions}
                                    aria-controls="player-suggestions"
                                    className="input-pro w-full p-2.5 rounded-lg bg-white dark:bg-slate-900 min-h-[44px]"
                                />
                                {/* 自定义下拉菜单 - 移动端优化触摸目标 */}
                                {showSuggestions && (
                                    <div
                                        id="player-suggestions"
                                        role="listbox"
                                        aria-label="玩家建议列表"
                                        className="absolute z-50 left-0 right-0 top-full mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl scroll-touch"
                                    >
                                        {filteredSuggestions.length > 0 ? (
                                            filteredSuggestions.map(name => {
                                                const realName = playerProfiles && playerProfiles[name]?.realName;
                                                return (
                                                    <div
                                                        key={name}
                                                        role="option"
                                                        aria-selected={false}
                                                        onClick={() => addPlayerToRoster(name)}
                                                        className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex justify-between items-center min-h-[48px] touch-feedback"
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
                            <button
                                onClick={() => addPlayerToRoster()}
                                aria-label="添加玩家到名单"
                                className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white px-4 rounded-lg flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center touch-feedback"
                            >
                                <Icon name="plus" className="w-5 h-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>

                {roster.length > 0 && (
                    <>
                        <hr className="border-slate-200 dark:border-slate-700/50" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* 左侧：买入记录 - 手机端优化布局 */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Icon name="shopping-cart" className="w-4 h-4" /> 买入/交易记录</h3>
                                    <button
                                        onClick={batchBuyIn}
                                        className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 px-2 py-1 rounded transition-colors"
                                    >
                                        ⚡ 批量买入
                                    </button>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 flex flex-col gap-3">
                                    {/* 移动端：垂直堆叠布局 */}
                                    <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:items-end">
                                        <div className="flex-1 min-w-[100px]">
                                            <label htmlFor="buyin-buyer" className="text-[10px] text-slate-400 block mb-1">买家</label>
                                            <select
                                                id="buyin-buyer"
                                                value={buyInBuyer}
                                                onChange={e => setBuyInBuyer(e.target.value)}
                                                aria-label="选择买入玩家"
                                                className="input-pro w-full p-2 rounded text-sm bg-white dark:bg-slate-900 min-h-[44px]"
                                            >
                                                <option value="">选择玩家</option>
                                                {roster.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex-1 min-w-[100px]">
                                            <label htmlFor="buyin-seller" className="text-[10px] text-slate-400 block mb-1">卖家</label>
                                            <select
                                                id="buyin-seller"
                                                value={buyInSeller}
                                                onChange={e => setBuyInSeller(e.target.value)}
                                                aria-label="选择卖出玩家"
                                                className="input-pro w-full p-2 rounded text-sm bg-white dark:bg-slate-900 min-h-[44px]"
                                            >
                                                <option value="Official">🏛️ 官方</option>
                                                {roster.filter(p => p !== buyInBuyer).map(p => <option key={p} value={p}>👤 {p}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <label htmlFor="buyin-amount" className="text-[10px] text-slate-400 block mb-1">金额</label>
                                            <input
                                                id="buyin-amount"
                                                type="number"
                                                value={buyInAmount}
                                                onChange={e => setBuyInAmount(e.target.value)}
                                                aria-label="输入买入金额"
                                                className="input-pro w-full p-2 rounded text-sm bg-white dark:bg-slate-900 min-h-[44px]"
                                                placeholder="0"
                                            />
                                        </div>
                                        <button
                                            onClick={addTransaction}
                                            aria-label="确认添加交易记录"
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded min-w-[44px] min-h-[44px] flex items-center justify-center touch-feedback"
                                        >
                                            <Icon name="check" className="w-5 h-5" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                                <div className="max-h-64 overflow-y-auto pr-2 scroll-touch relative" role="list" aria-label="交易记录列表">
                                    {transactions.length > 0 && (
                                        <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                                    )}
                                    <div className="space-y-3 pl-6">
                                        {transactions.map(t => (
                                            <div key={t.id} role="listitem" className="relative text-xs bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm animate-slide-up flex justify-between items-center group hover:border-emerald-500/30 transition-colors">
                                                {/* 时间轴圆点 */}
                                                <div className="absolute -left-[21px] top-3 w-3 h-3 rounded-full bg-emerald-100 dark:bg-emerald-900 border-2 border-white dark:border-slate-900 z-10"></div>

                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-[10px] text-slate-400 font-mono bg-slate-50 dark:bg-slate-800 px-1 rounded">{t.time}</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-bold text-slate-700 dark:text-slate-200">{t.buyer}</span>
                                                        <span className="text-slate-400 transform scale-75">◀</span>
                                                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-1.5 rounded">{t.amount}</span>
                                                        <span className="text-slate-400 transform scale-75">◀</span>
                                                        <span className={`text-[10px] px-1.5 rounded-full ${t.seller === 'Official' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>{t.seller === 'Official' ? '官方' : t.seller}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => deleteTransaction(t.id)}
                                                    aria-label="删除记录"
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 p-1"
                                                >
                                                    <Icon name="x" className="w-3.5 h-3.5" aria-hidden="true" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    {transactions.length === 0 && <div className="text-center text-slate-400 text-xs py-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">暂无交易记录</div>}
                                </div>
                            </div>

                            {/* 右侧：离场计算 */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Icon name="calculator" className="w-4 h-4" /> 离场清算</h3>
                                    {/* 实时平账指示器 */}
                                    {(() => {
                                        const totalNet = calculatedResults.reduce((sum, p) => sum + p.net, 0);
                                        const isBalanced = Math.abs(totalNet) < 0.01;
                                        return (
                                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${isBalanced ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                {isBalanced ? (
                                                    <><Icon name="check" className="w-3 h-3" /> 账目平衡</>
                                                ) : (
                                                    <><Icon name="alert-circle" className="w-3 h-3" /> 差额: {totalNet > 0 ? '+' : ''}{totalNet.toFixed(1)}</>
                                                )}
                                            </div>
                                        )
                                    })()}
                                </div>
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden overflow-x-auto">
                                    <table className="w-full text-xs min-w-[300px]">
                                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-medium">
                                            <tr><th className="p-3 text-left pl-4">玩家</th><th className="p-3 text-right">总投入</th><th className="p-3 text-right w-28">剩余筹码</th><th className="p-3 text-right pr-4">净盈亏</th><th className="p-3 w-8"></th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {calculatedResults.map((p) => (
                                                <tr key={p.name} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                                    <td className="p-3 pl-4 font-bold text-slate-700 dark:text-slate-200">{p.name}</td>
                                                    <td className="p-3 text-right text-slate-400 font-mono tracking-tight">-{p.totalBuyIn}</td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            placeholder="0"
                                                            value={finalStacks[p.name] || ''}
                                                            onChange={e => updateFinalStack(p.name, e.target.value)}
                                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-2 text-right font-mono text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-slate-300"
                                                        />
                                                    </td>
                                                    <td className="p-3 pr-4 text-right">
                                                        <span className={`inline-block min-w-[3rem] px-2 py-0.5 rounded text-center font-mono font-bold ${p.net > 0
                                                                ? 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400'
                                                                : p.net < 0
                                                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                                    : 'text-slate-300'
                                                            }`}>
                                                            {p.net > 0 ? '+' : ''}{p.net}
                                                        </span>
                                                    </td>
                                                    <td className="p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => removePlayerFromRoster(p.name)} className="text-slate-300 hover:text-red-500 p-1"><Icon name="x" className="w-3.5 h-3.5" /></button>
                                                    </td>
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
                                <label htmlFor="mvp-select" className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">MVP 票选</label>
                                <select
                                    id="mvp-select"
                                    value={votedMvp}
                                    onChange={e => setVotedMvp(e.target.value)}
                                    aria-label="选择本场MVP"
                                    className="input-pro w-full p-2 rounded bg-white dark:bg-slate-900"
                                >
                                    <option value="">- 无 -</option>
                                    {roster.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="lucky-select" className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">运气王</label>
                                <select
                                    id="lucky-select"
                                    value={luckyPlayer}
                                    onChange={e => setLuckyPlayer(e.target.value)}
                                    aria-label="选择本场运气王"
                                    className="input-pro w-full p-2 rounded bg-white dark:bg-slate-900"
                                >
                                    <option value="">- 无 -</option>
                                    {roster.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveGame}
                            disabled={roster.length < 2}
                            aria-label={editingMatch ? "更新比赛记录" : "结算并保存比赛"}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex justify-center items-center gap-2"
                        >
                            <Icon name="save" className="w-5 h-5" aria-hidden="true" /> {editingMatch ? "更新比赛记录" : "结算并保存"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default NewGameForm;