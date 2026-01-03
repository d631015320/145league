import React, { useState, useEffect, useMemo } from 'react';

// --- 1. 核心库与工具 ---
import { 
    db, auth, collection, onSnapshot, query, 
    addDoc, updateDoc, doc, deleteDoc, setDoc,
    signInWithEmailAndPassword, onAuthStateChanged 
} from './lib/firebase';

import { GAMES_PER_SEASON } from './lib/utils';

// --- 2. 引入公共组件 ---
import Icon from './components/Icon.jsx';
import Clock from './components/Clock.jsx';
import SecurityModal from './components/SecurityModal.jsx';
import SettlementModal from './components/SettlementModal.jsx';
import PlayerProfileModal from './components/PlayerProfileModal'; 

// --- 3. 引入刚才拆分的 Tab 页组件 ---
import DashboardTab from './components/tabs/Dashboard.jsx';
import LeaderboardTab from './components/tabs/Leaderboard.jsx';
import MatchHistoryTab from './components/tabs/MatchHistory.jsx';
import NewGameFormTab from './components/tabs/NewGameForm.jsx';
import SettingsTab from './components/tabs/Settings.jsx';

const App = () => {
    // ===========================
    // A. 状态管理 (State)
    // ===========================

    // 全局 UI 状态
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [showNetworkAlert, setShowNetworkAlert] = useState(false);
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') { return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); }
        return 'dark';
    });

    // 核心数据状态
    const [matchHistory, setMatchHistory] = useState([]);
    const [playerProfiles, setPlayerProfiles] = useState({});
    
    // 用户权限状态
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    // 筛选与排序状态
    const [selectedSeason, setSelectedSeason] = useState('all');
    // 修复：只保留这一个 availableSeasons 定义，且逻辑正确
    const availableSeasons = useMemo(() => {
        if (matchHistory.length === 0) return ['S1'];
        // 向上取整，比如 12 场比赛 = 2 个赛季
        const seasonsCount = Math.ceil(matchHistory.length / GAMES_PER_SEASON);
        // 生成 ['S1', 'S2', ...]
        return Array.from({ length: seasonsCount }, (_, i) => `S${i + 1}`);
    }, [matchHistory]);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'powerScore', direction: 'desc' });
    
    // 多选模式状态 (排行榜用)
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedPlayerNames, setSelectedPlayerNames] = useState(new Set());
    const [showSelectedOnly, setShowSelectedOnly] = useState(false);

    // 弹窗交互状态
    const [selectedPlayer, setSelectedPlayer] = useState(null); // 个人详情弹窗
    const [settlementModalData, setSettlementModalData] = useState(null); // 结算弹窗
    const [editingMatchId, setEditingMatchId] = useState(null); // 正在编辑的比赛ID
    
    // 安全验证弹窗状态 (用于敏感操作)
    const [isSecModalOpen, setIsSecModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    // ===========================
    // B. 副作用 (Effects)
    // ===========================

    // 1. Firebase 监听数据变化
    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setIsAdmin(!!u);
        });

        const q = query(collection(db, "matches"));
        const unsubMatches = onSnapshot(q, (snapshot) => {
            const matches = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            matches.sort((a, b) => new Date(b.date) - new Date(a.date));
            setMatchHistory(matches);
            setLoading(false);
        }, (err) => console.error("Sync Error:", err));

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

    // 2. 网络超时检测
    useEffect(() => {
        if (!loading) return;
        const timer = setTimeout(() => {
            if (loading) setShowNetworkAlert(true);
        }, 5000);
        return () => clearTimeout(timer);
    }, [loading]);

    // 3. 自动切换暗黑模式
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') { root.classList.add('dark'); } else { root.classList.remove('dark'); }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    // ===========================
    // C. 核心数据计算 (Memo)
    // ===========================
    
    // 1. 提取所有玩家名单
    const allPlayerNames = useMemo(() => {
        const names = new Set();
        matchHistory.forEach(m => m.results.forEach(r => names.add(r.name)));
        Object.keys(playerProfiles).forEach(n => names.add(n));
        return Array.from(names).sort();
    }, [matchHistory, playerProfiles]);

    // 2. 排序后的历史记录
    const sortedHistory = useMemo(() => {
        return [...matchHistory].sort((a, b) => {
            const dateA = new Date(a.date); const dateB = new Date(b.date);
            if (dateA < dateB) return 1; if (dateA > dateB) return -1;
            return String(b.id).localeCompare(String(a.id));
        });
    }, [matchHistory]);

    // 3. 计算赛季归属 (MatchSeasons)
    const matchSeasons = useMemo(() => {
        const map = {};
        const ascHistory = [...matchHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
        ascHistory.forEach((match, index) => {
            const seasonNum = Math.ceil((index + 1) / GAMES_PER_SEASON);
            map[match.id] = `S${seasonNum}`;
        });
        return map;
    }, [matchHistory]);

    // 4. 计算 Dashboard 用到的联盟极值 (Max/Min)
    const leagueStats = useMemo(() => {
        let maxAvgScore = 0; let maxGoldContent = 0; let maxAvgChips = 0;
        let minAvgChips = Infinity; let maxAvgBeatRate = 0;
        const tempStats = {};
        
        matchHistory.forEach(match => {
            match.results.forEach(res => {
                if (!tempStats[res.name]) tempStats[res.name] = { score: 0, chips: 0, games: 0, sumBeatRate: 0 };
                tempStats[res.name].score += res.score;
                tempStats[res.name].chips += (parseFloat(res.chips) || 0);
                tempStats[res.name].games += 1;
                const beatRate = match.totalPlayers > 1 ? (match.totalPlayers - res.rank) / (match.totalPlayers - 1) : 0;
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

    // 5. 📊 核心数据计算中心 (支持赛季筛选 + 五维评分 + 动态活跃度)
    const statsData = useMemo(() => {
        const stats = {};
        let maxG = 0;
        let seasonStats = { totalGames: 0, totalPot: 0, activePlayers: 0 };
        let highestSingle = { name: '', score: -Infinity };
        let latestMatch = null;

        // 预处理：按时间正序排列 (Old -> New)
        const sortedHistoryAsc = [...matchHistory].sort((a, b) => new Date(a.date) - new Date(b.date));

        // 赛季筛选逻辑
        let filteredMatches = [];
        if (selectedSeason === 'all') {
            filteredMatches = sortedHistoryAsc;
        } else {
            const seasonIndex = parseInt(selectedSeason.slice(1)) - 1; 
            const start = seasonIndex * GAMES_PER_SEASON;
            const end = start + GAMES_PER_SEASON;
            filteredMatches = sortedHistoryAsc.slice(start, end);
        }

        // 统计基础数据
        seasonStats.totalGames = filteredMatches.length;
        if (seasonStats.totalGames === 0) {
            return { 
                leaderboardData: [], maxGames: 0, seasonStats, 
                topPower: [], topAvgScore: [], highestSingle: { score: 0 }, 
                latestMatch: null, biggestRivalry: null 
            };
        }

        latestMatch = filteredMatches[filteredMatches.length - 1]; 
        const rivalries = {};

        // 遍历比赛累加
        filteredMatches.forEach(match => {
            seasonStats.totalPot += match.results.reduce((sum, r) => sum + (r.score > 0 ? r.score : 0), 0);
            const playerSet = new Set();
            match.results.forEach(r => {
                playerSet.add(r.name);
                if (!stats[r.name]) {
                    stats[r.name] = {
                        name: r.name, gamesPlayed: 0, totalScore: 0, totalChips: 0, wins: 0, 
                        sumPercentile: 0, votedMvpCount: 0, recentScores: [], luckyCount: 0
                    };
                }
                const p = stats[r.name];
                p.gamesPlayed += 1;
                p.totalScore += r.score;
                p.totalChips += parseFloat(r.chips);
                if (r.rank === 1) p.wins += 1;
                p.recentScores.push({ date: match.date, score: r.score, rank: r.rank });
                
                const percentile = match.totalPlayers > 1 
                    ? (match.totalPlayers - r.rank) / (match.totalPlayers - 1) : 0;
                p.sumPercentile += percentile;

                if (r.score > highestSingle.score) {
                    highestSingle = { name: r.name, score: r.score, date: match.date };
                }
            });
            seasonStats.activePlayers = Object.keys(stats).length;

            if (match.votedMvp && stats[match.votedMvp]) stats[match.votedMvp].votedMvpCount++;
            if (match.luckyPlayer && stats[match.luckyPlayer]) stats[match.luckyPlayer].luckyCount++;

            if (match.transactions) {
                match.transactions.forEach(t => {
                    if (t.seller === 'Official') return;
                    const key = `${t.buyer}-${t.seller}`;
                    if (!rivalries[key]) rivalries[key] = 0;
                    rivalries[key] += t.amount;
                });
            }
        });

        // 计算战力 (五维 + 动态活跃度)
        const currentSeasonTotal = Math.max(1, filteredMatches.length);

        Object.values(stats).forEach(p => {
            if (p.gamesPlayed > maxG) maxG = p.gamesPlayed;
            const avg = p.gamesPlayed > 0 ? p.totalScore / p.gamesPlayed : 0;
            const avgChips = p.gamesPlayed > 0 ? p.totalChips / p.gamesPlayed : 0;
            const gc = p.totalScore > 0 ? p.totalChips / p.totalScore : 0;
            
            // 五维评分
            const safeMaxAvgScore = leagueStats.maxAvgScore || 1;
            const safeMaxGoldContent = leagueStats.maxGoldContent || 1;
            const normAvgScore = safeMaxAvgScore > 0 ? avg / safeMaxAvgScore : 0;
            const normGoldContent = safeMaxGoldContent > 0 ? gc / safeMaxGoldContent : 0;
            const scoreEfficiency = Math.max(0, Math.min(10, (normAvgScore * 0.6 + normGoldContent * 0.4) * 10));

            const rangeChips = leagueStats.maxAvgChips - leagueStats.minAvgChips;
            const normChips = rangeChips > 0 ? (avgChips - leagueStats.minAvgChips) / rangeChips : 0.5;
            const scorePlunder = Math.max(0, Math.min(10, normChips * 9 + 1));

            const beatRate = p.gamesPlayed > 0 ? p.sumPercentile / p.gamesPlayed : 0;
            const safeMaxBeat = leagueStats.maxAvgBeatRate || 1;
            const normBeat = safeMaxBeat > 0 ? beatRate / safeMaxBeat : 0;
            const scoreDefeat = normBeat * 10; 

            let scoreStability = 5; 
            if (p.recentScores.length > 1) {
                const meanScore = p.recentScores.reduce((acc, curr) => acc + curr.score, 0) / p.gamesPlayed;
                const variance = p.recentScores.reduce((acc, curr) => acc + Math.pow(curr.score - meanScore, 2), 0) / p.gamesPlayed;
                const stdDev = Math.sqrt(variance);
                scoreStability = Math.max(0, Math.min(10, 10 - (stdDev / 2)));
            }

            const baseSkill = (scoreEfficiency * 3.5) + (scorePlunder * 3.0) + (scoreDefeat * 1.5) + (scoreStability * 1.0);
            const mvpBonus = p.votedMvpCount * 5;
            const rawPower = baseSkill + mvpBonus;

            // 动态活跃度 (5级阶梯)
            let activeCoeff = 1.0;
            const attendanceRate = p.gamesPlayed / currentSeasonTotal;
            if (attendanceRate >= 0.9) activeCoeff = 1.05; // 铁人
            else if (attendanceRate >= 0.7) activeCoeff = 1.0; // 主力
            else if (attendanceRate >= 0.5) activeCoeff = 0.9; // 常客
            else if (attendanceRate >= 0.3) activeCoeff = 0.8; // 试水
            else activeCoeff = 0.5; // 游客

            p.powerScore = rawPower * activeCoeff;

            p.avgScoreNum = avg; 
            p.avgScore = avg.toFixed(2); 
            p.totalScore = parseFloat(p.totalScore.toFixed(2));
            p.avgChips = avgChips;
            p.avatar = playerProfiles[p.name]?.avatar;
            p.recentTrend = p.recentScores.slice(-5).map(i => i.score);
        });

        // 排序
        const data = Object.values(stats).sort((a, b) => b.powerScore - a.powerScore);
        const topPower = [...data].slice(0, 5);
        const topAvgScore = [...data].sort((a, b) => b.avgScoreNum - a.avgScoreNum).slice(0, 3);

        // 宿敌计算
        let biggestRivalry = { loser: '', winner: '', amount: 0 };
        Object.entries(rivalries).forEach(([key, amount]) => {
            if (amount > biggestRivalry.amount) {
                const [l, w] = key.split('-');
                biggestRivalry = { loser: l, winner: w, amount };
            }
        });

        return { 
            leaderboardData: data, maxGames: maxG, seasonStats, 
            topPower, topAvgScore, highestSingle, latestMatch, biggestRivalry 
        };
    }, [matchHistory, selectedSeason, leagueStats, playerProfiles]);

    // ===========================
    // D. 事件处理 (Handlers)
    // ===========================

    const handleSaveGame = async (matchData) => {
        try {
            if (editingMatchId) {
                await updateDoc(doc(db, "matches", editingMatchId), matchData);
            } else {
                await addDoc(collection(db, "matches"), matchData);
            }
            setEditingMatchId(null);
            setActiveTab('leaderboard'); 
        } catch (e) {
            alert("保存失败: " + e.message);
            console.error(e);
        }
    };

    const handleDeleteMatch = async (id) => {
        if(confirm("确认删除这场比赛记录吗?")) {
            await deleteDoc(doc(db, "matches", id));
        }
    };

    const handleStartEdit = (match) => {
        setEditingMatchId(match.id);
        setActiveTab('newGame');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({ 
            key, direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc' 
        }));
    };

    const togglePlayerSelection = (n) => { 
        const s = new Set(selectedPlayerNames); 
        if(s.has(n)) s.delete(n); else s.add(n); 
        setSelectedPlayerNames(s); 
    };

    const handleUploadAvatar = async (name, base64) => {
        if(!user) return alert("需要管理员权限");
        try {
            await setDoc(doc(db, "profiles", name), { avatar: base64 }, { merge: true });
        } catch(e) { console.error(e); alert("上传失败"); }
    };

    const handleNavigateToMatch = (matchId) => {
        setSelectedPlayer(null);
        setActiveTab('history');
        setEditingMatchId(matchId); 
        setTimeout(() => {
            const el = document.getElementById(`match-${matchId}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const handleTriggerSecurity = (action) => {
        setPendingAction(action);
        setIsSecModalOpen(true);
    };

    const confirmSecurity = async (password) => {
        if (!password) return alert("请输入密码");
        try {
            await signInWithEmailAndPassword(auth, user.email, password);
            setIsSecModalOpen(false);
            alert("验证成功！请再次点击按钮执行操作 (鉴权已通过)");
        } catch (e) { alert("密码错误，验证失败"); }
    };

    // ===========================
    // E. 渲染 (Render)
    // ===========================

    if (loading && !showNetworkAlert) {
        return <div className="loading-overlay"><div className="spinner"></div><div>正在同步云端数据...</div></div>;
    }

    return (
        <div className="min-h-screen pb-20 transition-colors duration-300">
            {/* 顶部导航 */}
            <nav className="glass-header sticky top-0 z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <Icon name="spade" className="w-5 h-5 fill-current" />
                        </div>
                        <span className="text-xl font-black tracking-tight hidden sm:block">145 <span className="text-emerald-500">联赛</span></span>
                    </div>
                    
                    {/* 桌面端 Tab */}
                    <div className="hidden md:flex items-center bg-slate-100/50 dark:bg-slate-800/50 rounded-full p-1 border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm mx-4">
                        {[
                            { id: 'dashboard', l: '总览', i: 'layout-dashboard' }, 
                            { id: 'leaderboard', l: '排行', i: 'trophy' }, 
                            { id: 'history', l: '历史', i: 'history' }, 
                            { id: 'newGame', l: '录入', i: 'plus-circle' }, 
                            { id: 'settings', l: '设置', i: 'settings' }
                        ].map(t => (
                            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${activeTab === t.id ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                                <Icon name={t.i} className="w-3.5 h-3.5" /> {t.l}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:block text-right"><Clock /></div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden lg:block"></div>
                        <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            {theme === 'light' ? <Icon name="sun" className="w-5 h-5" /> : <Icon name="moon" className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* 网络错误提示 */}
            {showNetworkAlert && loading && (
                <div className="bg-amber-500/10 border-l-4 border-amber-500 text-amber-700 dark:text-amber-400 p-4 mx-4 mt-4 rounded shadow-md flex justify-between items-start animate-slide-up">
                    <div className="flex gap-3">
                        <Icon name="wifi-off" className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-sm">数据同步超时</p>
                            <p className="text-xs opacity-90 mt-1">请检查网络环境，或刷新重试。</p>
                        </div>
                    </div>
                    <button onClick={() => window.location.reload()} className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded hover:bg-amber-600">刷新</button>
                </div>
            )}

            {/* 主内容区域 */}
            <main className="max-w-7xl mx-auto mt-8 px-4 space-y-8 animate-slide-up">
                
                {activeTab === 'dashboard' && (
                    <DashboardTab 
                        statsData={statsData}
                        selectedSeason={selectedSeason}
                        availableSeasons={availableSeasons}
                        onSeasonChange={setSelectedSeason}
                        onPlayerClick={setSelectedPlayer}
                        onNavigateToHistory={() => setActiveTab('history')}
                        GAMES_PER_SEASON={GAMES_PER_SEASON}
                    />
                )}

                {activeTab === 'leaderboard' && (
                    <LeaderboardTab 
                        data={statsData.leaderboardData}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                        onPlayerClick={setSelectedPlayer}
                        isSelectionMode={isSelectionMode}
                        toggleSelectionMode={() => setIsSelectionMode(!isSelectionMode)}
                        selectedPlayerNames={selectedPlayerNames}
                        togglePlayerSelection={togglePlayerSelection}
                        showSelectedOnly={showSelectedOnly}
                        setShowSelectedOnly={setShowSelectedOnly}
                        onClearSelection={() => setSelectedPlayerNames(new Set())}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        selectedSeason={selectedSeason}
                        onSeasonChange={setSelectedSeason}
                        availableSeasons={availableSeasons}
                        GAMES_PER_SEASON={GAMES_PER_SEASON}
                    />
                )}

                {activeTab === 'history' && (
                    <MatchHistoryTab 
                        matches={sortedHistory}
                        matchSeasons={matchSeasons}
                        isAdmin={isAdmin}
                        highlightMatchId={editingMatchId}
                        onEdit={handleStartEdit}
                        onDelete={handleDeleteMatch}
                        onSettle={setSettlementModalData}
                    />
                )}

                {activeTab === 'newGame' && (
                    <NewGameFormTab 
                        isAdmin={isAdmin}
                        allPlayerNames={allPlayerNames}
                        playerProfiles={playerProfiles}
                        editingMatch={matchHistory.find(m => m.id === editingMatchId)}
                        onSave={handleSaveGame}
                        onCancelEdit={() => setEditingMatchId(null)}
                    />
                )}

                {activeTab === 'settings' && (
                    <SettingsTab 
                        user={user}
                        isAdmin={isAdmin}
                        allPlayerNames={allPlayerNames}
                        playerProfiles={playerProfiles}
                        matchHistory={matchHistory}
                        auth={auth}
                        db={db}
                        onTriggerSecurity={handleTriggerSecurity}
                    />
                )}

            </main>

            {/* 全局弹窗层 */}
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

            {settlementModalData && (
                <SettlementModal 
                    data={settlementModalData}
                    profiles={playerProfiles}
                    onClose={() => setSettlementModalData(null)}
                />
            )}

            <SecurityModal 
                isOpen={isSecModalOpen}
                onClose={() => setIsSecModalOpen(false)}
                onConfirm={confirmSecurity}
                title={pendingAction?.type === 'clear' ? '确认清空数据' : '确认导入数据'}
                message={pendingAction?.type === 'clear' ? '您正在尝试删除云端的所有数据。此操作不可逆！' : '导入本地数据将会合并或覆盖现有的云端数据。'} 
            />

            {/* 移动端底部 Tab */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#0b0e14]/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 p-2 z-50 flex justify-around safe-area-bottom">
                {[
                    { id: 'dashboard', i: 'layout-dashboard' }, 
                    { id: 'leaderboard', i: 'trophy' }, 
                    { id: 'history', i: 'history' }, 
                    { id: 'newGame', i: 'plus-circle' }, 
                    { id: 'settings', i: 'settings' }
                ].map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)} className={`p-3 rounded-xl flex flex-col items-center gap-1 ${activeTab === t.id ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10' : 'text-slate-400 dark:text-slate-500'}`}>
                        <Icon name={t.i} className="w-6 h-6" />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default App;