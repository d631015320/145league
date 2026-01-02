import React, { useState, useEffect, useMemo, useRef } from 'react';

// 1. 引入拆分出去的工具和配置
import { 
    db, auth, collection, onSnapshot, query, orderBy, 
    addDoc, updateDoc, doc, deleteDoc, setDoc, writeBatch,
    signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from './lib/firebase';

import { 
    getISOWeek, 
    compressImage, 
    calculateSettlements,
    BASE_SCORES, 
    GAMES_PER_SEASON, 
    CHIP_EXCHANGE_RATE 
} from './lib/utils';

// 2. 引入拆分出去的组件
import Icon from './components/Icon';
import Avatar from './components/Avatar';
import Sparkline from './charts/Sparkline';
import PlayerProfileModal from './components/PlayerProfileModal';

// --- 暂时保留在本地的小组件 (后续可以继续拆) ---

const Clock = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);
    return (
        <div className="flex flex-col items-end leading-tight select-none">
            <div className="text-xl font-bold font-clock tracking-widest text-slate-700 dark:text-slate-200">{time.toLocaleTimeString('zh-CN', { hour12: false })}</div>
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wide">{time.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' })}</div>
        </div>
    );
};

const SecurityModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    const [password, setPassword] = useState('');
    useEffect(() => { if (isOpen) { document.body.classList.add('modal-open'); } else { document.body.classList.remove('modal-open'); } return () => document.body.classList.remove('modal-open'); }, [isOpen]);
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-modal" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4 text-red-500">
                    <Icon name="shield-alert" className="w-8 h-8" />
                    <h2 className="text-xl font-bold">{title}</h2>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">{message}</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">确认管理员密码</label>
                        <input 
                            type="password" 
                            autoFocus
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className="input-pro w-full p-3 rounded-lg" 
                            placeholder="请输入登录密码..." 
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">取消</button>
                        <button 
                            onClick={() => onConfirm(password)} 
                            className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors shadow-lg"
                        >
                            确认执行
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 主应用逻辑 ---

const App = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [matchHistory, setMatchHistory] = useState([]);
    const [playerProfiles, setPlayerProfiles] = useState({}); 
    const [sortConfig, setSortConfig] = useState({ key: 'powerScore', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedPlayerNames, setSelectedPlayerNames] = useState(new Set());
    const [showSelectedOnly, setShowSelectedOnly] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null); 
    
    // Auth State
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false); 
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPwd, setLoginPwd] = useState("");
    const [loading, setLoading] = useState(true);

    const [showNetworkAlert, setShowNetworkAlert] = useState(false);
    const [settlementModalData, setSettlementModalData] = useState(null);

    // Security Modal State
    const [isSecModalOpen, setIsSecModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    const [highlightMatchId, setHighlightMatchId] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState('all');
    
    // 批量更名状态
    const [renameFrom, setRenameFrom] = useState('');
    const [renameTo, setRenameTo] = useState('');

    // 实名管理状态
    const [realNameTarget, setRealNameTarget] = useState(''); 
    const [realNameInput, setRealNameInput] = useState('');   

    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') { return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); }
        return 'dark';
    });

    // Editor States
    const [roster, setRoster] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [finalStacks, setFinalStacks] = useState({});
    const [gameDate, setGameDate] = useState(new Date().toISOString().slice(0, 10));
    const [votedMvp, setVotedMvp] = useState('');
    const [luckyPlayer, setLuckyPlayer] = useState('');
    const [editingMatchId, setEditingMatchId] = useState(null);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [buyInBuyer, setBuyInBuyer] = useState('');
    const [buyInAmount, setBuyInAmount] = useState('');
    const [buyInSeller, setBuyInSeller] = useState('Official');

    // 🔥 FIREBASE SYNC
    useEffect(() => {
        // Auth Listener
        const unsubAuth = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setIsAdmin(!!u); 
        });

        // Matches Listener
        const q = query(collection(db, "matches")); 
        const unsubMatches = onSnapshot(q, (snapshot) => {
            const matches = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            matches.sort((a, b) => new Date(b.date) - new Date(a.date)); 
            setMatchHistory(matches);
            setLoading(false);
        }, (err) => console.error("Sync Error:", err));

        // Profiles Listener
        const unsubProfiles = onSnapshot(collection(db, "profiles"), (snapshot) => {
            const profiles = {};
            snapshot.docs.forEach(doc => { 
                const rawData = doc.data();
                if (rawData.data && typeof rawData.data === 'string') {
                    profiles[doc.id] = { avatar: rawData.data, realName: rawData.realName || '' };
                } else if (rawData.avatar) {
                    profiles[doc.id] = rawData;
                } else {
                    profiles[doc.id] = { avatar: rawData.data || null, realName: rawData.realName || '' };
                }
            });
            setPlayerProfiles(profiles);
        });

        return () => { unsubAuth(); unsubMatches(); unsubProfiles(); };
    }, []);

    useEffect(() => {
        if (!loading) return; 
        const timer = setTimeout(() => {
            if (loading) {
                setShowNetworkAlert(true);
            }
        }, 5000); 
        return () => clearTimeout(timer);
    }, [loading]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') { root.classList.add('dark'); } else { root.classList.remove('dark'); }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    const allPlayerNames = useMemo(() => {
        const names = new Set();
        matchHistory.forEach(m => m.results.forEach(r => names.add(r.name)));
        Object.keys(playerProfiles).forEach(n => names.add(n));
        return Array.from(names).sort();
    }, [matchHistory, playerProfiles]);

    const sortedHistoryAsc = useMemo(() => {
        return [...matchHistory].sort((a, b) => {
            const dateA = new Date(a.date); const dateB = new Date(b.date);
            if (dateA < dateB) return -1; if (dateA > dateB) return 1; 
            return String(a.id).localeCompare(String(b.id)); 
        });
    }, [matchHistory]);

    const matchSeasons = useMemo(() => {
        const map = {};
        sortedHistoryAsc.forEach((match, index) => {
            const seasonNum = Math.ceil((index + 1) / GAMES_PER_SEASON);
            map[match.id] = `S${seasonNum}`; 
        });
        return map;
    }, [sortedHistoryAsc]);

    const availableSeasons = useMemo(() => {
        const seasons = new Set();
        Object.values(matchSeasons).forEach(s => seasons.add(s));
        return Array.from(seasons).sort((a, b) => {
            const numA = parseInt(a.slice(1));
            const numB = parseInt(b.slice(1));
            return numB - numA;
        });
    }, [matchSeasons]);

    const leagueStats = useMemo(() => {
        let maxAvgScore = 0;
        let maxGoldContent = 0;
        let maxAvgChips = 0;
        let minAvgChips = Infinity;
        let maxAvgBeatRate = 0;

        const tempStats = {};
        
        matchHistory.forEach(match => {
            match.results.forEach(res => {
                if (!tempStats[res.name]) tempStats[res.name] = { score: 0, chips: 0, games: 0, sumBeatRate: 0 };
                tempStats[res.name].score += res.score;
                tempStats[res.name].chips += (parseFloat(res.chips) || 0);
                tempStats[res.name].games += 1;
                
                const beatRate = match.totalPlayers > 1 
                    ? (match.totalPlayers - res.rank) / (match.totalPlayers - 1)
                    : 0;
                tempStats[res.name].sumBeatRate += beatRate;
            });
        });

        Object.values(tempStats).forEach(p => {
            if (p.games < 1) return;
            
            const avgScore = p.score / p.games;
            const goldContent = p.score > 0 ? p.chips / p.score : 0;
            const avgChips = p.chips / p.games;
            const avgBeatRate = p.sumBeatRate / p.games;

            if (avgScore > maxAvgScore) maxAvgScore = avgScore;
            if (avgScore > 3 && goldContent > maxGoldContent) maxGoldContent = goldContent;
            
            if (avgChips > maxAvgChips) maxAvgChips = avgChips;
            if (avgChips < minAvgChips) minAvgChips = avgChips;
            if (avgBeatRate > maxAvgBeatRate) maxAvgBeatRate = avgBeatRate;
        });

        if (minAvgChips === Infinity) minAvgChips = 0;

        return { maxAvgScore, maxGoldContent, maxAvgChips, minAvgChips, maxAvgBeatRate };
    }, [matchHistory]);

    const statsData = useMemo(() => {
        const stats = {};
        let maxG = 0; let seasonTotalChips = 0;
        
        const filteredMatches = selectedSeason === 'all' 
            ? matchHistory 
            : matchHistory.filter(m => matchSeasons[m.id] === selectedSeason);

        const currentK = Math.max(2, filteredMatches.length / 4);
        filteredMatches.forEach(match => {
            if (match.votedMvp) {
                if (!stats[match.votedMvp]) stats[match.votedMvp] = { name: match.votedMvp, totalScore: 0, totalChips: 0, gamesPlayed: 0, wins: 0, votedMvpCount: 0, luckyCount: 0, sumPercentile: 0, recentScores: [], singleMax: -Infinity };
                stats[match.votedMvp].votedMvpCount++;
            }
            if (match.luckyPlayer) {
                if (!stats[match.luckyPlayer]) stats[match.luckyPlayer] = { name: match.luckyPlayer, totalScore: 0, totalChips: 0, gamesPlayed: 0, wins: 0, votedMvpCount: 0, luckyCount: 0, sumPercentile: 0, recentScores: [], singleMax: -Infinity };
                stats[match.luckyPlayer].luckyCount++;
            }
            match.results.forEach(res => {
                if (!stats[res.name]) stats[res.name] = { name: res.name, totalScore: 0, totalChips: 0, gamesPlayed: 0, wins: 0, votedMvpCount: 0, luckyCount: 0, sumPercentile: 0, recentScores: [], singleMax: -Infinity };
                stats[res.name].totalScore += res.score;
                stats[res.name].totalChips += (parseFloat(res.chips) || 0);
                stats[res.name].gamesPlayed += 1;
                stats[res.name].recentScores.push({ date: match.date, score: res.score }); 
                if (res.score > stats[res.name].singleMax) stats[res.name].singleMax = res.score;
                if (res.rank === 1) stats[res.name].wins += 1;
                if (res.chips > 0) seasonTotalChips += res.chips;
                const denominator = Math.max(1, match.totalPlayers - 1);
                const percentile = (match.totalPlayers - res.rank) / denominator;
                stats[res.name].sumPercentile += percentile;
            });
        });
        Object.values(stats).forEach(p => {
            if (p.gamesPlayed > maxG) maxG = p.gamesPlayed;
            const avg = p.gamesPlayed > 0 ? p.totalScore / p.gamesPlayed : 0;
            const avgChips = p.gamesPlayed > 0 ? p.totalChips / p.gamesPlayed : 0;
            const gc = p.totalScore > 0 ? p.totalChips / p.totalScore : 0;
            const winRate = p.gamesPlayed > 0 ? p.wins / p.gamesPlayed : 0;
            const avgPercentile = p.gamesPlayed > 0 ? p.sumPercentile / p.gamesPlayed : 0; 
            const adjWinRateForScore = p.wins / (p.gamesPlayed + currentK);
            
            const power = (p.totalScore * 0.3) + (avg * 10) + (adjWinRateForScore * 50) + (p.votedMvpCount * 10) + (avgPercentile * 20);
            
            p.avgScoreNum = avg; p.avgScore = avg.toFixed(2); p.totalScore = parseFloat(p.totalScore.toFixed(2));
            p.goldContentVal = gc; p.goldContent = gc.toFixed(1); p.avgChips = avgChips; p.powerScore = power;
            p.avgPercentile = avgPercentile; p.avatar = playerProfiles[p.name]?.avatar;
            p.recentTrend = p.recentScores.sort((a,b) => new Date(a.date) - new Date(b.date)).slice(-5).map(i => i.score);
        });
        let data = Object.values(stats);
        const seasonStats = { totalGames: filteredMatches.length, totalPot: seasonTotalChips, activePlayers: data.length };
        const topPower = [...data].sort((a,b) => b.powerScore - a.powerScore)[0];
        const topAvgScore = [...data].filter(p => p.gamesPlayed > 0).sort((a,b) => b.avgScoreNum - a.avgScoreNum).slice(0, 3);
        let highestSingle = { name: '-', score: 0 };
        data.forEach(p => { if(p.singleMax > highestSingle.score) highestSingle = { name: p.name, score: p.singleMax }; });
        const sortedSeasonMatches = [...filteredMatches].sort((a, b) => {
            const dateA = new Date(a.date); const dateB = new Date(b.date);
            if (dateA > dateB) return -1; if (dateA < dateB) return 1; return b.id - a.id; 
        });
        const latestMatch = sortedSeasonMatches.length > 0 ? sortedSeasonMatches[0] : null;
        if (searchTerm) { const lowerTerm = searchTerm.toLowerCase(); data = data.filter(p => p.name.toLowerCase().includes(lowerTerm) || p.powerScore.toString().includes(lowerTerm)); }
        if (showSelectedOnly && selectedPlayerNames.size > 0) { data = data.filter(p => selectedPlayerNames.has(p.name)); }
        data.sort((a, b) => {
            let valA, valB;
            switch(sortConfig.key) {
                case 'powerScore': valA = a.powerScore; valB = b.powerScore; break;
                case 'avgScore': valA = a.avgScoreNum; valB = b.avgScoreNum; break;
                case 'avgChips': valA = a.avgChips; valB = b.avgChips; break;
                case 'totalScore': valA = a.totalScore; valB = b.totalScore; break;
                case 'totalChips': valA = a.totalChips; valB = b.totalChips; break;
                case 'wins': valA = a.wins; valB = b.wins; break;
                case 'goldContent': valA = a.goldContentVal; valB = b.goldContentVal; break;
                case 'votedMvpCount': valA = a.votedMvpCount; valB = b.votedMvpCount; break;
                case 'luckyCount': valA = a.luckyCount; valB = b.luckyCount; break;
                default: valA = a.totalScore; valB = b.totalScore;
            }
            return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        });
        return { leaderboardData: data, maxGames: maxG, seasonStats, topPower, topAvgScore, highestSingle, latestMatch }; 
    }, [matchHistory, sortConfig, playerProfiles, searchTerm, showSelectedOnly, selectedPlayerNames, selectedSeason, matchSeasons]); 

    const sortedHistory = useMemo(() => {
        return [...matchHistory].sort((a, b) => {
            const dateA = new Date(a.date); const dateB = new Date(b.date);
            if (dateA > dateB) return -1; if (dateA < dateB) return 1; 
            return String(b.id).localeCompare(String(a.id)); 
        });
    }, [matchHistory]);

    const handleRenamePlayer = async () => {
        if (!renameFrom || !renameTo) return alert("请选择原名并输入新名");
        if (renameFrom === renameTo) return alert("新旧名字不能相同");
        const confirmMsg = `⚠️ 高危操作警告！\n\n您即将执行批量更名：\n将所有历史记录中的 "${renameFrom}" 修改为 "${renameTo}"。\n\n这将会：\n1. 修改所有历史比赛的排名、买入、结算数据。\n2. 迁移头像数据。\n3. 如果 "${renameTo}" 已存在，数据将自动合并。\n\n此操作不可撤销！确定执行吗？`;
        if (!confirm(confirmMsg)) return;
        setLoading(true);
        try {
            const matchesToUpdate = [];
            matchHistory.forEach(m => {
                let updated = false;
                const newResults = m.results.map(r => { if (r.name === renameFrom) { updated = true; return { ...r, name: renameTo }; } return r; });
                let newRoster = m.roster || [];
                if (newRoster.includes(renameFrom)) { updated = true; newRoster = newRoster.map(n => n === renameFrom ? renameTo : n); }
                let newTransactions = m.transactions || [];
                let txUpdated = false;
                newTransactions = newTransactions.map(t => { let tMod = {...t}; if (t.buyer === renameFrom) { tMod.buyer = renameTo; txUpdated = true; } if (t.seller === renameFrom) { tMod.seller = renameTo; txUpdated = true; } return tMod; });
                if (txUpdated) updated = true;
                let newStacks = {...(m.finalStacks || {})};
                if (newStacks[renameFrom] !== undefined) { newStacks[renameTo] = newStacks[renameFrom]; delete newStacks[renameFrom]; updated = true; }
                let newMvp = m.votedMvp; if (newMvp === renameFrom) { newMvp = renameTo; updated = true; }
                let newLucky = m.luckyPlayer; if (newLucky === renameFrom) { newLucky = renameTo; updated = true; }
                if (updated) { matchesToUpdate.push({ ref: doc(db, "matches", m.id), data: { results: newResults, roster: newRoster, transactions: newTransactions, finalStacks: newStacks, votedMvp: newMvp, luckyPlayer: newLucky } }); }
            });
            await Promise.all(matchesToUpdate.map(item => updateDoc(item.ref, item.data)));
            const oldProfileRef = doc(db, "profiles", renameFrom);
            const newProfileRef = doc(db, "profiles", renameTo);
            const oldProfileSnap = await getDoc(oldProfileRef);
            if (oldProfileSnap.exists()) { await setDoc(newProfileRef, oldProfileSnap.data(), { merge: true }); await deleteDoc(oldProfileRef); }
            alert(`成功！已更新 ${matchesToUpdate.length} 场比赛记录，"${renameFrom}" 已变更为 "${renameTo}"。`);
            setRenameFrom(''); setRenameTo('');
        } catch (e) { console.error(e); alert("更名失败: " + e.message); } finally { setLoading(false); }
    };

    const handleUpdateRealName = async () => {
        if (!realNameTarget || !realNameInput) return alert("请填写完整");
        setLoading(true);
        try {
            await setDoc(doc(db, "profiles", realNameTarget), { realName: realNameInput }, { merge: true });
            alert(`绑定成功！\n\n网名：${realNameTarget}\n真名：${realNameInput}\n\n结算时将显示此真名。`);
            setRealNameInput('');
        } catch (e) { alert("绑定失败: " + e.message); } finally { setLoading(false); }
    };

    const handleRealLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, loginEmail, loginPwd);
            setLoginEmail(""); setLoginPwd("");
        } catch(err) { alert("登录失败: " + err.message); }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setIsAdmin(false);
            alert("已安全退出");
        } catch (e) {
            console.error("Logout failed:", e);
        }
    };

    const handleUploadAvatar = async (n, b) => {
        if(!user) return alert("需要管理员权限");
        try {
            await setDoc(doc(db, "profiles", n), { avatar: b }, { merge: true });
        } catch(e) { console.error(e); alert("上传失败"); }
    };
    
    const addPlayerToRoster = () => { if (newPlayerName && !roster.includes(newPlayerName)) { setRoster([...roster, newPlayerName]); setNewPlayerName(''); } };
    const removePlayerFromRoster = (name) => { if (transactions.some(t => t.buyer === name || t.seller === name)) { alert("该玩家已有交易记录，无法移除。请先删除相关交易。"); return; } setRoster(roster.filter(n => n !== name)); const newStacks = {...finalStacks}; delete newStacks[name]; setFinalStacks(newStacks); };
    const addTransaction = () => { if (!buyInBuyer || !buyInAmount) return; const amount = parseFloat(buyInAmount); if (isNaN(amount) || amount <= 0) return; const newTx = { id: Date.now(), buyer: buyInBuyer, amount: amount, seller: buyInSeller, time: new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'}) }; setTransactions([newTx, ...transactions]); setBuyInAmount(''); };
    const deleteTransaction = (id) => setTransactions(transactions.filter(t => t.id !== id));
    const updateFinalStack = (name, value) => { setFinalStacks(prev => ({...prev, [name]: parseFloat(value) || 0})); };

    const calculatedResults = useMemo(() => {
        const buyIns = {}; roster.forEach(p => buyIns[p] = 0);
        transactions.forEach(t => { if (buyIns[t.buyer] !== undefined) buyIns[t.buyer] += t.amount; if (t.seller !== 'Official' && buyIns[t.seller] !== undefined) { buyIns[t.seller] -= t.amount; } });
        return roster.map(p => { const totalBuyIn = buyIns[p] || 0; const stack = finalStacks[p] || 0; const net = stack - totalBuyIn; return { name: p, totalBuyIn, finalStack: stack, net }; });
    }, [roster, transactions, finalStacks]);

    const calculateGame = async () => { 
        if (roster.length < 2) return; 
        const totalNet = calculatedResults.reduce((sum, p) => sum + p.net, 0);
        if (Math.abs(totalNet) > 0.1) {
            alert(`⚠️ 账目不平！\n\n当前所有玩家净盈亏总和为: ${totalNet.toFixed(2)}\n它必须等于 0 才能保存。\n\n请检查买入记录和离场筹码是否录入正确。`);
            return;
        }
        const sorted = [...calculatedResults].sort((a, b) => b.net - a.net); 
        const factor = sorted.length / 10; 
        const results = sorted.map((p, i) => ({ name: p.name, chips: p.net, rank: i + 1, score: Math.round((i < 10 ? BASE_SCORES[i] * factor : 0) * 100) / 100 })); 
        const matchData = { date: gameDate, totalPlayers: sorted.length, results, votedMvp, luckyPlayer, roster, transactions, finalStacks }; 
        try {
            if (editingMatchId) {
                await updateDoc(doc(db, "matches", editingMatchId), matchData);
            } else {
                await addDoc(collection(db, "matches"), matchData);
            }
            cancelEditing(); 
            setActiveTab('leaderboard'); 
        } catch(e) { alert("保存失败: " + e.message); }
    };

    const startEditing = (m) => { 
        setEditingMatchId(m.id); 
        setGameDate(m.date); 
        setVotedMvp(m.votedMvp||''); 
        setLuckyPlayer(m.luckyPlayer||''); 
        
        if (m.transactions && m.finalStacks && m.roster) {
            setRoster(m.roster);
            setTransactions(m.transactions);
            setFinalStacks(m.finalStacks);
        } else {
            setRoster(m.results.map(r => r.name)); 
            setTransactions([]); 
            const stacks = {}; 
            m.results.forEach(r => stacks[r.name] = r.chips); 
            setFinalStacks(stacks); 
            alert("注意：正在编辑旧版本数据。\n\n由于旧数据未包含详细买入流水，系统已将'净胜筹码'直接视为'剩余筹码'，买入设为0。\n\n请手动补全流水以修复此记录。"); 
        }
        
        setActiveTab('newGame'); 
    };
    
    const cancelEditing = () => { setEditingMatchId(null); setRoster([]); setTransactions([]); setFinalStacks({}); setVotedMvp(''); setLuckyPlayer(''); };
    const deleteMatch = async (id) => { if(confirm("确认删除?")) await deleteDoc(doc(db, "matches", id)); };
    const togglePlayerSelection = (n) => { const s = new Set(selectedPlayerNames); if(s.has(n)) s.delete(n); else s.add(n); setSelectedPlayerNames(s); };
    const handleSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc' }));
    const isSorted = (k) => sortConfig.key === k;
    
    const exportCloudData = () => {
        const data = { history: matchHistory, profiles: playerProfiles };
        const blob = new Blob([JSON.stringify(data)], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PokerData_CloudBackup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
    };

    const triggerClear = () => {
        setPendingAction({ type: 'clear' });
        setIsSecModalOpen(true);
    };

    const triggerImport = (e) => {
        if(e.target.files[0]) {
            setPendingAction({ type: 'import', file: e.target.files[0] });
            setIsSecModalOpen(true);
        }
        e.target.value = null; 
    };

    const performClear = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "matches"));
            const snapshot = await getDocs(q);
            const batch = writeBatch(db);
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            alert("云端数据已清空");
        } catch(e) {
            alert("清空失败: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const performImport = async (file) => {
        setLoading(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target.result);
                const { history, profiles } = data;
                const batch = writeBatch(db);
                let count = 0;

                if (Array.isArray(history)) {
                    history.forEach(match => {
                        const docRef = doc(db, "matches", String(match.id));
                        batch.set(docRef, match);
                        count++;
                    });
                }

                if (profiles && typeof profiles === 'object') {
                    Object.entries(profiles).forEach(([name, avatarBase64]) => {
                        const docRef = doc(db, "profiles", name);
                        if (avatarBase64 && typeof avatarBase64 === 'string') {
                            batch.set(docRef, { avatar: avatarBase64 });
                        } else {
                            batch.set(docRef, avatarBase64);
                        }
                        count++;
                    });
                }

                await batch.commit();
                alert(`成功导入 ${count} 条数据！`);
            } catch (err) {
                console.error(err);
                alert("导入失败：文件格式错误或网络问题");
            } finally {
                setLoading(false);
            }
        };
        reader.readAsText(file);
    };

    const confirmSecurity = async (password) => {
        if (!password) return alert("请输入密码");
        try {
            await signInWithEmailAndPassword(auth, user.email, password);
            setIsSecModalOpen(false);
            if (pendingAction.type === 'clear') await performClear();
            else if (pendingAction.type === 'import') await performImport(pendingAction.file);
        } catch (e) { alert("密码错误，验证失败"); }
    };

    const handleNavigateToMatch = (matchId) => {
        setSelectedPlayer(null);
        setActiveTab('history');
        setHighlightMatchId(matchId);
        setTimeout(() => {
            const el = document.getElementById(`match-${matchId}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    if (loading && !showNetworkAlert) return <div className="loading-overlay"><div className="spinner"></div><div>正在同步云端数据...</div></div>;

    return (
        <div className="min-h-screen pb-20 transition-colors duration-300">
            <nav className="glass-header sticky top-0 z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3"><div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-500/20"><Icon name="spade" className="w-5 h-5 fill-current" /></div><span className="text-xl font-black tracking-tight hidden sm:block">145 <span className="text-emerald-500">联赛</span></span></div>
                    <div className="hidden md:flex items-center bg-slate-100/50 dark:bg-slate-800/50 rounded-full p-1 border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm mx-4">{[{ id: 'dashboard', l: '总览', i: 'layout-dashboard' }, { id: 'leaderboard', l: '排行', i: 'trophy' }, { id: 'history', l: '历史', i: 'history' }, { id: 'newGame', l: '录入', i: 'plus-circle' }, { id: 'settings', l: '设置', i: 'settings' }].map(t => (<button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${activeTab === t.id ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}><Icon name={t.i} className="w-3.5 h-3.5" /> {t.l}</button>))}</div>
                    <div className="flex items-center gap-4"><div className="hidden lg:block text-right"><Clock /></div><div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden lg:block"></div><button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="切换主题">{theme === 'light' ? <Icon key="sun" name="sun" className="w-5 h-5" /> : <Icon key="moon" name="moon" className="w-5 h-5" />}</button></div>
                </div>
            </nav>

            {showNetworkAlert && loading && (
                <div className="bg-amber-500/10 border-l-4 border-amber-500 text-amber-700 dark:text-amber-400 p-4 mx-4 mt-4 rounded shadow-md flex justify-between items-start animate-slide-up" role="alert">
                    <div className="flex gap-3">
                        <Icon name="wifi-off" className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-sm">数据同步超时</p>
                            <p className="text-xs opacity-90 mt-1">
                                当前网络无法连接至云端数据库（海外节点）。
                                <br/>
                                请检查您的网络环境，或尝试切换网络后刷新重试。
                            </p>
                        </div>
                    </div>
                    <button onClick={() => window.location.reload()} className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded hover:bg-amber-600 transition-colors">
                        刷新
                    </button>
                </div>
            )}

            {settlementModalData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-modal" onClick={() => setSettlementModalData(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="bg-emerald-600 p-4 text-white flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2"><Icon name="banknote" className="w-5 h-5"/> 智能结算方案</h3>
                            <button onClick={() => setSettlementModalData(null)}><Icon name="x" className="w-5 h-5"/></button>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">比赛日期</div>
                            <div className="font-bold text-slate-800 dark:text-white">{settlementModalData.date}</div>
                        </div>
                        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
                            {calculateSettlements(settlementModalData.results).length === 0 ? (
                                <div className="text-center text-slate-400 py-4">本局无需转账 (平局或数据为0)</div>
                            ) : (
                                calculateSettlements(settlementModalData.results).map((t, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                                        <div className="flex items-center gap-3 z-10">
                                            <Avatar name={t.from} src={playerProfiles[t.from]?.avatar} size="sm" bordered={false} />
                                            <div className="text-sm">
                                                <div className="font-bold text-slate-700 dark:text-slate-200">{t.from}</div>
                                                {playerProfiles[t.from]?.realName && <div className="text-[10px] text-slate-400">({playerProfiles[t.from].realName})</div>}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center z-10 px-2">
                                            <div className="text-[10px] text-slate-400 mb-1">支付给</div>
                                            <Icon name="arrow-right" className="w-4 h-4 text-slate-300"/>
                                        </div>
                                        <div className="flex items-center gap-3 z-10 flex-row-reverse">
                                            <Avatar name={t.to} src={playerProfiles[t.to]?.avatar} size="sm" bordered={false} />
                                            <div className="text-right text-sm">
                                                <div className="font-bold text-slate-700 dark:text-slate-200">{t.to}</div>
                                                {playerProfiles[t.to]?.realName && <div className="text-[10px] text-slate-400">({playerProfiles[t.to].realName})</div>}
                                                <div className="text-emerald-600 dark:text-emerald-400 font-mono font-black mt-0.5">
                                                    ¥{(t.amount / CHIP_EXCHANGE_RATE).toFixed(2)}
                                                </div>
                                                <div className="text-[9px] text-slate-400">{t.amount} 筹码</div>
                                            </div>
                                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 text-center">
                            <p className="text-[10px] text-slate-400">系统已自动计算最优转账路径，仅管理员可见</p>
                        </div>
                    </div>
                </div>
            )}

            <datalist id="player-suggestions">{allPlayerNames.map(name => <option key={name} value={name} />)}</datalist>
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#0b0e14]/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 p-2 z-50 flex justify-around safe-area-bottom">{[{ id: 'dashboard', i: 'layout-dashboard' }, { id: 'leaderboard', i: 'trophy' }, { id: 'history', i: 'history' }, { id: 'newGame', i: 'plus-circle' }, { id: 'settings', i: 'settings' }].map(t => (<button key={t.id} onClick={() => setActiveTab(t.id)} className={`p-3 rounded-xl flex flex-col items-center gap-1 ${activeTab === t.id ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10' : 'text-slate-400 dark:text-slate-500'}`}><Icon name={t.i} className="w-6 h-6" /></button>))}</div>

            <main className="max-w-7xl mx-auto mt-8 px-4 space-y-8 animate-slide-up">
                {activeTab === 'newGame' && (
                    <div className="glass-panel p-6 rounded-2xl max-w-4xl mx-auto shadow-lg border border-slate-200 dark:border-slate-700/50">
                        <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><Icon name="edit-3" className="w-5 h-5 text-emerald-500"/> 比赛管理台</h2>{editingMatchId && <button onClick={cancelEditing} className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300">取消编辑</button>}</div>
                        {!isAdmin ? (<div className="text-center py-10"><Icon name="lock" className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4"/><p className="text-slate-500 dark:text-slate-400 mb-4">需要管理员权限</p><button onClick={()=>setActiveTab('settings')} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-all">去登录</button></div>) : (<div className="space-y-8"><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="md:col-span-1"><label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">比赛日期</label><input type="date" value={gameDate} onChange={e=>setGameDate(e.target.value)} className="input-pro w-full p-2.5 rounded-lg bg-white dark:bg-slate-900" /></div><div className="md:col-span-2"><label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">添加玩家到本局</label><div className="flex gap-2"><input type="text" list="player-suggestions" placeholder="输入或选择玩家..." value={newPlayerName} onChange={e=>setNewPlayerName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addPlayerToRoster()} className="input-pro flex-1 p-2.5 rounded-lg bg-white dark:bg-slate-900" /><button onClick={addPlayerToRoster} className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white px-4 rounded-lg"><Icon name="plus" className="w-5 h-5"/></button></div></div></div>{roster.length > 0 && (<><hr className="border-slate-200 dark:border-slate-700/50" /><div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><div className="space-y-4"><h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Icon name="shopping-cart" className="w-4 h-4"/> 买入/交易记录</h3><div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 flex flex-wrap gap-2 items-end"><div className="flex-1 min-w-[100px]"><span className="text-[10px] text-slate-400 block mb-1">买家 (Buyer)</span><select value={buyInBuyer} onChange={e=>setBuyInBuyer(e.target.value)} className="input-pro w-full p-2 rounded text-sm bg-white dark:bg-slate-900"><option value="">选择玩家</option>{roster.map(p=><option key={p} value={p}>{p}</option>)}</select></div><div className="w-24"><span className="text-[10px] text-slate-400 block mb-1">金额</span><input type="number" value={buyInAmount} onChange={e=>setBuyInAmount(e.target.value)} className="input-pro w-full p-2 rounded text-sm bg-white dark:bg-slate-900" placeholder="0" /></div><div className="flex-1 min-w-[100px]"><span className="text-[10px] text-slate-400 block mb-1">卖家 (Seller)</span><select value={buyInSeller} onChange={e=>setBuyInSeller(e.target.value)} className="input-pro w-full p-2 rounded text-sm bg-white dark:bg-slate-900"><option value="Official">🏛️ 官方</option>{roster.filter(p=>p!==buyInBuyer).map(p=><option key={p} value={p}>👤 {p}</option>)}</select></div><button onClick={addTransaction} className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded w-10 h-[38px] flex items-center justify-center"><Icon name="check" className="w-5 h-5"/></button></div><div className="max-h-48 overflow-y-auto space-y-2 pr-2">{transactions.map(t => (<div key={t.id} className="flex justify-between items-center text-xs bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800 animate-slide-up"><div className="flex items-center gap-2"><span className="text-slate-400 font-mono">{t.time}</span><span className="font-bold text-slate-700 dark:text-slate-200">{t.buyer}</span><span className="text-slate-400">买入</span><span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{t.amount}</span><span className="text-slate-400">来自</span><span className={t.seller==='Official'?'text-blue-500':'text-slate-700 dark:text-slate-200'}>{t.seller==='Official'?'官方':t.seller}</span></div><button onClick={()=>deleteTransaction(t.id)} className="text-slate-400 hover:text-red-500"><Icon name="trash-2" className="w-3 h-3"/></button></div>))}{transactions.length===0 && <div className="text-center text-slate-400 text-xs py-4">暂无交易记录</div>}</div></div><div className="space-y-4"><h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Icon name="calculator" className="w-4 h-4"/> 离场清算 (自动计算净胜)</h3><div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"><table className="w-full text-xs"><thead className="bg-slate-50 dark:bg-slate-800 text-slate-500"><tr><th className="p-3 text-left">玩家</th><th className="p-3 text-right">总投入</th><th className="p-3 text-right w-24">剩余筹码</th><th className="p-3 text-right">净盈亏</th><th className="p-3 w-8"></th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{calculatedResults.map((p, i) => (<tr key={p.name}><td className="p-3 font-medium text-slate-700 dark:text-slate-200">{p.name}</td><td className="p-3 text-right text-red-400 font-mono">-{p.totalBuyIn}</td><td className="p-2"><input type="number" placeholder="0" value={finalStacks[p.name] || ''} onChange={e=>updateFinalStack(p.name, e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-1 text-right font-mono focus:border-emerald-500 outline-none" /></td><td className={`p-3 text-right font-bold font-mono ${p.net >= 0 ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{p.net > 0 ? '+' : ''}{p.net}</td><td className="p-2 text-center"><button onClick={()=>removePlayerFromRoster(p.name)} className="text-slate-400 hover:text-red-500"><Icon name="x" className="w-3 h-3"/></button></td></tr>))}</tbody></table></div></div></div><div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl grid grid-cols-2 gap-4 border border-slate-200 dark:border-slate-700/50"><div><label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">MVP 票选</label><select value={votedMvp} onChange={e=>setVotedMvp(e.target.value)} className="input-pro w-full p-2 rounded bg-white dark:bg-slate-900"><option value="">- 无 -</option>{roster.map(p=><option key={p} value={p}>{p}</option>)}</select></div><div><label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">运气王</label><select value={luckyPlayer} onChange={e=>setLuckyPlayer(e.target.value)} className="input-pro w-full p-2 rounded bg-white dark:bg-slate-900"><option value="">- 无 -</option>{roster.map(p=><option key={p} value={p}>{p}</option>)}</select></div></div><button onClick={calculateGame} disabled={roster.length < 2} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex justify-center items-center gap-2"><Icon name="save" className="w-5 h-5"/> {editingMatchId ? "更新比赛记录" : "结算并保存"}</button></>)}</div>)}
                    </div>
                )}

                {activeTab !== 'newGame' && (
                    <>
                        {activeTab === 'dashboard' && (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><Icon name="layout-dashboard" className="w-6 h-6 text-emerald-500"/> 概览</h2>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase">赛季:</span>
                                        <select 
                                            value={selectedSeason} 
                                            onChange={e => setSelectedSeason(e.target.value)} 
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
                                    <div 
                                        onClick={() => statsData.topPower && setSelectedPlayer(statsData.topPower)}
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

                                <div className="mb-8">
                                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Icon name="activity" className="w-4 h-4"/> 效率之王 (Efficiency Kings) - 场均前三
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {statsData.topAvgScore.map((p, idx) => (
                                            <div 
                                                key={p.name} 
                                                onClick={() => setSelectedPlayer(p)}
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
                                            <button onClick={() => setActiveTab('history')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-bold uppercase flex items-center gap-1 transition-colors">
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
                        )}

                        {activeTab === 'leaderboard' && (
                            <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700/50">
                                <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 flex flex-col xl:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
                                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                                        <div className="relative min-w-[180px]">
                                                <select 
                                                value={selectedSeason} 
                                                onChange={e => setSelectedSeason(e.target.value)} 
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
                                            <input type="text" placeholder="搜索 玩家 / 数据..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-pro w-full pl-10 pr-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800/50" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                                        {[{k:'powerScore',l:'战力',c:'purple'}, {k:'avgScore',l:'场均得分',c:'blue'}, {k:'avgChips',l:'场均筹码',c:'teal'}, {k:'totalScore',l:'总得分',c:'emerald'}, {k:'totalChips',l:'总筹码',c:'red'}, {k:'wins',l:'吃鸡',c:'yellow'}, {k:'goldContent',l:'含金量',c:'orange'}, {k:'votedMvpCount',l:'MVP',c:'indigo'}, {k:'luckyCount',l:'运气王',c:'pink'}].map(item => (
                                            <button key={item.k} onClick={() => handleSort(item.k)} className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider border whitespace-nowrap transition-all ${isSorted(item.k) ? `bg-${item.c}-50 dark:bg-${item.c}-500/10 border-${item.c}-500 text-${item.c}-600 dark:text-${item.c}-400` : 'bg-white dark:bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400 dark:hover:border-slate-500'}`}>
                                                {item.l} {isSorted(item.k) ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                                            </button>
                                        ))}
                                        <button onClick={() => setIsSelectionMode(!isSelectionMode)} className={`p-1.5 rounded border bg-white dark:bg-transparent transition-colors ${isSelectionMode ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}><Icon name="list-checks" className="w-5 h-5"/></button>
                                    </div>
                                </div>
                                {isSelectionMode && (<div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 flex justify-between items-center text-xs text-indigo-600 dark:text-indigo-300 border-b border-indigo-100 dark:border-indigo-500/20"><span className="font-bold">已选: {selectedPlayerNames.size}</span><div className="flex gap-3"><button onClick={() => setShowSelectedOnly(!showSelectedOnly)} className="hover:underline">{showSelectedOnly ? '显示全部' : '仅看已选'}</button><button onClick={() => setSelectedPlayerNames(new Set())} className="hover:underline">清空</button></div></div>)}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50 dark:bg-[#0f141a] text-slate-500 text-[10px] uppercase font-bold tracking-widest sticky top-0 z-20">
                                            <tr>
                                                <th className="p-4 w-12 text-center sticky-col border-b border-slate-200 dark:border-slate-800 shadow-[1px_0_0_0_rgba(0,0,0,0.05)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.05)]">#</th>
                                                <th className="p-4 w-48 sticky-col left-12 border-b border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">玩家</th>
                                                <th className={`p-4 text-right cursor-pointer hover:text-slate-800 dark:hover:text-white border-b border-slate-200 dark:border-slate-800 ${isSorted('powerScore') ? 'text-purple-600 dark:text-purple-400 bg-slate-50 dark:bg-slate-800/30' : ''}`} onClick={() => handleSort('powerScore')}>综合评分</th>
                                                <th className="p-4 w-24 text-center border-b border-slate-200 dark:border-slate-800">近期状态</th>
                                                <th className={`p-4 text-right cursor-pointer hover:text-slate-800 dark:hover:text-white border-b border-slate-200 dark:border-slate-800 ${isSorted('avgScore') ? 'text-blue-600 dark:text-blue-400 bg-slate-50 dark:bg-slate-800/30' : ''}`} onClick={() => handleSort('avgScore')}>场均分</th>
                                                <th className={`p-4 text-right hidden md:table-cell cursor-pointer hover:text-slate-800 dark:hover:text-white border-b border-slate-200 dark:border-slate-800 ${isSorted('avgChips') ? 'text-teal-600 dark:text-teal-400 bg-slate-50 dark:bg-slate-800/30' : ''}`} onClick={() => handleSort('avgChips')}>场均筹码</th>
                                                <th className={`p-4 text-right cursor-pointer hover:text-slate-800 dark:hover:text-white border-b border-slate-200 dark:border-slate-800 ${isSorted('totalScore') ? 'text-emerald-600 dark:text-emerald-400 bg-slate-50 dark:bg-slate-800/30' : ''}`} onClick={() => handleSort('totalScore')}>总积分</th>
                                                <th className={`p-4 text-right cursor-pointer hover:text-slate-800 dark:hover:text-white border-b border-slate-200 dark:border-slate-800 ${isSorted('totalChips') ? 'text-red-600 dark:text-red-400 bg-slate-50 dark:bg-slate-800/30' : ''}`} onClick={() => handleSort('totalChips')}>总筹码</th>
                                                <th className={`p-4 text-center cursor-pointer hover:text-slate-800 dark:hover:text-white border-b border-slate-200 dark:border-slate-800 ${isSorted('wins') ? 'text-yellow-600 dark:text-yellow-400 bg-slate-50 dark:bg-slate-800/30' : ''}`} onClick={() => handleSort('wins')}>吃鸡</th>
                                                <th className={`p-4 text-right hidden md:table-cell cursor-pointer hover:text-slate-800 dark:hover:text-white border-b border-slate-200 dark:border-slate-800 ${isSorted('goldContent') ? 'text-orange-600 dark:text-orange-400 bg-slate-50 dark:bg-slate-800/30' : ''}`} onClick={() => handleSort('goldContent')}>含金量</th>
                                                <th className={`p-4 text-center hidden sm:table-cell ${isSorted('votedMvpCount') ? 'bg-slate-50 dark:bg-slate-800/30' : ''}`} onClick={() => handleSort('votedMvpCount')}>MVP</th>
                                                <th className={`p-4 text-center hidden sm:table-cell ${isSorted('luckyCount') ? 'bg-slate-50 dark:bg-slate-800/30' : ''}`} onClick={() => handleSort('luckyCount')}>运气王</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium">
                                            {statsData.leaderboardData.map((p, idx) => (
                                                <tr key={p.name} onClick={() => isSelectionMode ? togglePlayerSelection(p.name) : setSelectedPlayer(p)} className={`table-row-hover transition-colors cursor-pointer group ${selectedPlayerNames.has(p.name) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                                                    <td className="p-4 text-center font-mono text-slate-400 sticky-col group-hover:bg-slate-50 dark:group-hover:bg-[#161b22] transition-colors border-b border-slate-50 dark:border-slate-800/50">{isSelectionMode ? <input type="checkbox" checked={selectedPlayerNames.has(p.name)} onChange={()=>{}} className="mx-auto accent-indigo-500" /> : (idx < 3 ? <span className={`inline-block w-6 h-6 leading-6 rounded text-[10px] font-bold ${idx===0?'rank-badge-1':idx===1?'rank-badge-2':'rank-badge-3'}`}>{idx+1}</span> : idx+1)}</td>
                                                    <td className="p-4 sticky-col left-12 group-hover:bg-slate-50 dark:group-hover:bg-[#161b22] transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-b border-slate-50 dark:border-slate-800/50"><div className="flex items-center gap-3"><Avatar name={p.name} src={p.avatar?.avatar || p.avatar} size="md" bordered={false} className="shadow-sm" /><span className="font-bold text-slate-700 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{p.name}</span></div></td>
                                                    <td className={`p-4 text-right font-mono font-bold text-lg text-purple-600 dark:text-purple-400 ${isSorted('powerScore') ? 'sorted-cell-highlight' : ''}`}>{Math.round(p.powerScore)}</td>
                                                    <td className="p-4"><Sparkline data={p.recentTrend} color={p.recentTrend[p.recentTrend.length-1] >= 10 ? (theme === 'dark' ? '#34d399' : '#059669') : (theme === 'dark' ? '#64748b' : '#94a3b8')} /></td>
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
                        )}

                        {activeTab === 'history' && (
                            <div className="space-y-4">
                                {sortedHistory.map((m) => (
                                    <div 
                                        id={`match-${m.id}`}
                                        key={m.id} 
                                        className={`glass-panel rounded-xl overflow-hidden group border border-slate-200 dark:border-slate-700/50 ${highlightMatchId === m.id ? 'animate-pulse-highlight ring-2 ring-emerald-500 dark:ring-emerald-400' : ''}`}
                                    >
                                        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 px-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700/50">
                                            <div className="flex items-center gap-3"><span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm font-bold">{m.date}</span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold">{matchSeasons[m.id]}</span>
                                            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">{m.totalPlayers} 人参赛</span></div>
                                            
                                            {isAdmin && (
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                    <button onClick={() => setSettlementModalData(m)} className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors">
                                                        <Icon name="banknote" className="w-3.5 h-3.5"/> 结算
                                                    </button>
                                                    <button onClick={()=>startEditing(m)} className="text-blue-500 hover:text-blue-600"><Icon name="edit-2" className="w-4 h-4"/></button>
                                                    <button onClick={()=>deleteMatch(m.id)} className="text-red-500 hover:text-red-600"><Icon name="trash" className="w-4 h-4"/></button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                                            {m.results.map((r) => (
                                                <div key={r.name} className={`relative p-2 rounded border flex flex-col items-center justify-center text-center transition-colors ${r.rank===1 ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-500/10 dark:border-yellow-500/30' : 'bg-white dark:bg-slate-800/30 border-slate-100 dark:border-slate-700/30'}`}><span className={`text-[10px] font-bold absolute top-1 left-2 ${r.rank===1?'text-yellow-600 dark:text-yellow-500':'text-slate-400'}`}>#{r.rank}</span><div className="font-bold text-sm text-slate-700 dark:text-slate-200 mt-1 mb-1">{r.name}</div><div className="flex gap-2 text-[10px] font-mono"><span className={r.chips>=0?'text-red-500 dark:text-red-300':'text-emerald-600 dark:text-emerald-300'}>{r.chips}</span><span className="text-slate-300 dark:text-slate-500">|</span><span className="text-slate-600 dark:text-white">+{r.score}</span></div></div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="glass-panel p-6 rounded-2xl max-w-2xl mx-auto space-y-8 shadow-lg border border-slate-200 dark:border-slate-700/50">
                                
                                {isAdmin ? (
                                    <div className="space-y-8">
                                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 flex justify-between items-center">
                                            <div><h3 className="font-bold text-emerald-800 dark:text-emerald-400">管理员已登录</h3><p className="text-xs text-emerald-600 dark:text-emerald-500">{user.email}</p></div>
                                            <button onClick={handleLogout} className="px-4 py-2 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 text-sm font-bold rounded-lg shadow-sm border border-emerald-100 dark:border-emerald-900">退出</button>
                                        </div>

                                        {/* 实名认证管理 */}
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Icon name="user-check" className="w-5 h-5 text-emerald-500"/> 实名备注管理 (仅管理员可见)</h2>
                                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">绑定真名后，结算单将同时显示“网名 (真名)”，方便转账。榜单上依然只显示网名。</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">选择网名</label>
                                                        <select 
                                                            value={realNameTarget} 
                                                            onChange={e => setRealNameTarget(e.target.value)} 
                                                            className="input-pro w-full p-2.5 rounded-lg text-sm bg-white dark:bg-slate-900"
                                                        >
                                                            <option value="">-- 请选择 --</option>
                                                            {allPlayerNames.map(n => <option key={n} value={n}>{n} {playerProfiles[n]?.realName ? `✅` : ''}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">输入真名</label>
                                                        <input 
                                                            type="text" 
                                                            value={realNameInput} 
                                                            onChange={e => setRealNameInput(e.target.value)} 
                                                            className="input-pro w-full p-2.5 rounded-lg text-sm bg-white dark:bg-slate-900"
                                                            placeholder="例如：张伟" 
                                                        />
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={handleUpdateRealName} 
                                                    disabled={!realNameTarget || !realNameInput}
                                                    className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    <Icon name="save" className="w-4 h-4"/> 保存备注
                                                </button>
                                            </div>
                                        </div>

                                        {/* 更名工具 */}
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Icon name="users" className="w-5 h-5 text-indigo-500"/> 玩家更名/迁移工具</h2>
                                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">此工具将批量修改所有历史比赛中的玩家名称。如果新名字已存在，数据将自动合并。此操作还会迁移头像数据。</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">选择原名 (Old Name)</label>
                                                        <select 
                                                            value={renameFrom} 
                                                            onChange={e => setRenameFrom(e.target.value)} 
                                                            className="input-pro w-full p-2.5 rounded-lg text-sm bg-white dark:bg-slate-900"
                                                        >
                                                            <option value="">-- 请选择 --</option>
                                                            {allPlayerNames.map(n => <option key={n} value={n}>{n}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">输入新名 (New Name)</label>
                                                        <input 
                                                            type="text" 
                                                            value={renameTo} 
                                                            onChange={e => setRenameTo(e.target.value)} 
                                                            className="input-pro w-full p-2.5 rounded-lg text-sm bg-white dark:bg-slate-900"
                                                            placeholder="例如：AKKing" 
                                                        />
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={handleRenamePlayer} 
                                                    disabled={!renameFrom || !renameTo || renameFrom === renameTo}
                                                    className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    <Icon name="refresh-cw" className="w-4 h-4"/> 执行批量更名
                                                </button>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700/50">
                                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Icon name="database" className="w-5 h-5 text-emerald-500"/> 本地备份与恢复</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <button onClick={exportCloudData} className="bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-100 dark:hover:bg-blue-600/30 border border-blue-200 dark:border-blue-500/50 text-blue-600 dark:text-blue-400 p-4 rounded-xl flex flex-col items-center gap-2 transition-all"><Icon name="download" className="w-8 h-8"/><span className="font-bold">导出云端数据 (备份)</span></button>
                                                <label className="bg-emerald-50 dark:bg-emerald-600/20 hover:bg-emerald-100 dark:hover:bg-emerald-600/30 border border-emerald-200 dark:border-emerald-500/50 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl flex flex-col items-center gap-2 cursor-pointer transition-all"><Icon name="upload" className="w-8 h-8"/><span className="font-bold">导入本地数据 (恢复)</span><input type="file" className="hidden" onChange={triggerImport} /></label>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-2 text-center">提示：定期导出备份，确保数据万无一失。</p>
                                        </div>

                                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700/50">
                                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Icon name="alert-triangle" className="w-5 h-5 text-red-500"/> 危险区域</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <button onClick={triggerClear} className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 p-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"><Icon name="trash-2" className="w-4 h-4"/> 清空云端数据</button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Icon name="shield" className="w-5 h-5 text-purple-500"/> 管理员登录</h2>
                                        <form onSubmit={handleRealLogin} className="space-y-4 max-w-md">
                                            <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">邮箱</label><input type="email" required value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} className="input-pro w-full p-2.5 rounded-lg" placeholder="" /></div>
                                            <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">密码</label><input type="password" required value={loginPwd} onChange={e=>setLoginPwd(e.target.value)} className="input-pro w-full p-2.5 rounded-lg" placeholder="" /></div>
                                            <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg">登录云端控制台</button>
                                        </form>
                                    </div>
                                )}
                                
                                <div className="text-center text-xs text-slate-400 mt-8">
                                    145 联赛数据中心 v10.5 (Re-Engineered)
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {selectedPlayer && (
                <PlayerProfileModal 
                    player={selectedPlayer} 
                    history={matchHistory} 
                    onClose={() => setSelectedPlayer(null)} 
                    onUploadAvatar={handleUploadAvatar} 
                    isDark={theme === 'dark'} 
                    leagueStats={leagueStats} 
                    onNavigateToMatch={handleNavigateToMatch} 
                    allPlayerNames={allPlayerNames} 
                    playerProfiles={playerProfiles} 
                    leaderboardData={statsData.leaderboardData} 
                />
            )}
            
            <SecurityModal 
                isOpen={isSecModalOpen} 
                onClose={() => setIsSecModalOpen(false)} 
                onConfirm={confirmSecurity} 
                title={pendingAction?.type === 'clear' ? '确认清空数据' : '确认导入数据'} 
                message={pendingAction?.type === 'clear' ? '您正在尝试删除云端的所有数据。此操作不可逆！' : '导入本地数据将会合并或覆盖现有的云端数据。'} 
            />
        </div>
    );
};

export default App;