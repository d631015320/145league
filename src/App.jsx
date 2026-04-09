// src/App.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';

// --- 常量 ---
import { GAMES_PER_SEASON, TAB_CONFIG, NETWORK_TIMEOUT, DEFAULT_QUICK_AMOUNTS } from './constants';
import { compareByEntryOrder } from './lib/utils';

// --- 联赛上下文 ---
import { LeagueProvider, useLeagueContext } from './hooks/useLeagueContext';

// --- 自定义 Hooks ---
import useData from './hooks/useData'
import useLeagueStats from './hooks/useLeagueStats';
import useStatsCalculator from './hooks/useStatsCalculator';
import useTheme from './hooks/useTheme';

// --- 数据库服务 ---
import { saveMatch, deleteMatch, uploadAvatar, signIn } from './services/db.service'

// --- 公共组件 ---
import Icon from './components/common/Icon.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import Header from './components/layout/Header.jsx';

// --- 弹窗组件 ---
import SecurityModal from './components/modals/SecurityModal.jsx';
import SettlementModal from './components/modals/SettlementModal.jsx';
import PlayerProfileModal from './components/modals/PlayerProfileModal.jsx';

// --- Tab 页组件 ---
import DashboardTab from './components/tabs/Dashboard.jsx';
import LeaderboardTab from './components/tabs/Leaderboard.jsx';
import MatchHistoryTab from './components/tabs/MatchHistory.jsx';
import NewGameFormTab from './components/tabs/NewGameForm.jsx';
import SettingsTab from './components/tabs/Settings.jsx';

/**
 * 主应用内容（需在 LeagueProvider 内部使用）
 */
const AppContent = () => {
  // ===========================
  // A. 状态管理 (State)
  // ===========================

  // 联赛上下文
  const {
    currentLeagueId,
    currentLeague,
    user,
    isAdmin: leagueIsAdmin,
    canEdit,
    loading: leagueLoading
  } = useLeagueContext();

  // 使用自定义 Hooks（传入当前联赛ID实现数据隔离）
  const { matchHistory, playerProfiles, loading: dataLoading } = useData(currentLeagueId)
  const { theme, toggleTheme, isDark } = useTheme();

  // 综合 loading 状态
  const loading = leagueLoading || dataLoading

  // 权限判断（基于联赛角色）
  const isAdmin = leagueIsAdmin

  // UI 状态
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNetworkAlert, setShowNetworkAlert] = useState(false);

  // 筛选与排序状态
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'powerScore', direction: 'desc' });

  // 多选模式状态
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPlayerNames, setSelectedPlayerNames] = useState(new Set());
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  // 弹窗状态
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [settlementModalData, setSettlementModalData] = useState(null);
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [isSecModalOpen, setIsSecModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // ===========================
  // B. 计算数据 (Memo)
  // ===========================

  // 可用赛季列表
  const availableSeasons = useMemo(() => {
    if (matchHistory.length === 0) return ['S1'];
    const sorted = [...matchHistory].sort(compareByEntryOrder);
    const seasonsCount = Math.ceil(sorted.length / GAMES_PER_SEASON);
    return Array.from({ length: seasonsCount }, (_, i) => `S${i + 1}`);
  }, [matchHistory]);

  // 当前赛季筛选后的比赛数据（用于 leagueStats 计算）
  const seasonFilteredHistory = useMemo(() => {
    if (selectedSeason === 'all') return matchHistory;
    const sorted = [...matchHistory].sort(compareByEntryOrder);
    const seasonIndex = parseInt(selectedSeason.slice(1)) - 1;
    const start = seasonIndex * GAMES_PER_SEASON;
    const end = start + GAMES_PER_SEASON;
    return sorted.slice(start, end);
  }, [matchHistory, selectedSeason]);

  // 统计数据 — leagueStats 基于当前赛季数据计算，隔离各赛季
  const leagueStats = useLeagueStats(seasonFilteredHistory);

  const statsData = useStatsCalculator(
    matchHistory,
    selectedSeason,
    leagueStats,
    playerProfiles,
    sortConfig
  );

  // 所有玩家名单
  const allPlayerNames = useMemo(() => {
    const names = new Set();
    matchHistory.forEach(m => m.results.forEach(r => names.add(r.name)));
    Object.keys(playerProfiles).forEach(n => names.add(n));
    return Array.from(names).sort();
  }, [matchHistory, playerProfiles]);

  // 排序后的历史记录（按录入顺序：createdAt 升序）
  const sortedHistory = useMemo(() => {
    return [...matchHistory].sort(compareByEntryOrder);
  }, [matchHistory]);

  // 计算常用筹码金额（基于所有历史比赛）
  const frequentAmounts = useMemo(() => {
    const validMatches = sortedHistory.filter(m => m.transactions && m.transactions.length > 0);

    if (validMatches.length < 3) {
      return { list: DEFAULT_QUICK_AMOUNTS, hot: null };
    }

    const frequency = {};

    validMatches.forEach(match => {
      match.transactions.forEach(t => {
        const amt = t.amount;
        if (amt > 0) {
          frequency[amt] = (frequency[amt] || 0) + 1;
        }
      });
    });

    const topAmounts = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(entry => parseInt(entry[0]));

    if (topAmounts.length === 0) return { list: DEFAULT_QUICK_AMOUNTS, hot: null };

    if (topAmounts.length < 4) {
      DEFAULT_QUICK_AMOUNTS.forEach(d => {
        if (!topAmounts.includes(d)) topAmounts.push(d);
      });
    }

    const finalAmounts = topAmounts.slice(0, 4).sort((a, b) => a - b);
    const hottestAmount = topAmounts.length > 0 ? topAmounts[0] : null;

    return {
      list: finalAmounts,
      hot: hottestAmount
    };
  }, [sortedHistory]);

  // 赛季归属映射（基于录入顺序）
  const matchSeasons = useMemo(() => {
    const map = {};
    sortedHistory.forEach((match, index) => {
      const seasonNum = Math.ceil((index + 1) / GAMES_PER_SEASON);
      map[match.id] = `S${seasonNum}`;
    });
    return map;
  }, [sortedHistory]);

  // ===========================
  // C. 副作用 (Effects)
  // ===========================

  // 网络超时检测
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      if (loading) setShowNetworkAlert(true);
    }, NETWORK_TIMEOUT);
    return () => clearTimeout(timer);
  }, [loading]);

  // 切换联赛时重置赛季选择
  useEffect(() => {
    setSelectedSeason('all');
    setEditingMatchId(null);
  }, [currentLeagueId]);

  // ===========================
  // D. 事件处理 (Handlers)
  // ===========================

  const handleSaveGame = useCallback(async (matchData) => {
    try {
      console.log('App.jsx 收到保存请求:', { matchData, editingMatchId });
      // 传入当前联赛ID
      await saveMatch(matchData, editingMatchId, currentLeagueId);
      setEditingMatchId(null);
      setActiveTab('leaderboard');
    } catch (error) {
      console.error('保存比赛失败:', error);
      alert(`保存比赛失败: ${error.message}`);
    }
  }, [editingMatchId, currentLeagueId]);

  const handleDeleteMatch = useCallback(async (id) => {
    if (confirm('确认删除这场比赛记录吗?')) {
      try {
        await deleteMatch(id);
      } catch (e) {
        alert(e.message);
      }
    }
  }, []);

  const handleStartEdit = useCallback((match) => {
    setEditingMatchId(match.id);
    setActiveTab('newGame');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  }, []);

  const togglePlayerSelection = useCallback((n) => {
    setSelectedPlayerNames(prev => {
      const s = new Set(prev);
      if (s.has(n)) s.delete(n);
      else s.add(n);
      return s;
    });
  }, []);

  const handleUploadAvatar = useCallback(async (name, base64) => {
    if (!user) return alert('需要管理员权限');
    try {
      await uploadAvatar(name, base64);
    } catch (e) {
      alert(e.message);
    }
  }, [user]);

  const handleNavigateToMatch = useCallback((matchId) => {
    setSelectedPlayer(null);
    setActiveTab('history');
    setEditingMatchId(matchId);
    setTimeout(() => {
      const el = document.getElementById(`match-${matchId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, []);

  const handleTriggerSecurity = useCallback((action) => {
    setPendingAction(action);
    setIsSecModalOpen(true);
  }, []);

  const confirmSecurity = useCallback(async (password) => {
    if (!password) return alert('请输入密码')
    try {
      await signIn(user.email, password)
      setIsSecModalOpen(false)
      alert('验证成功！请再次点击按钮执行操作 (鉴权已通过)')
    } catch {
      alert('密码错误，验证失败')
    }
  }, [user])

  // ===========================
  // E. 渲染 (Render)
  // ===========================

  if (loading && !showNetworkAlert) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <div>正在同步云端数据...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 transition-colors duration-300">
      {/* 顶部导航 */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* 网络错误提示 */}
      {showNetworkAlert && loading && (
        <div
          className="bg-amber-500/10 border-l-4 border-amber-500 text-amber-700 dark:text-amber-400 p-4 mx-4 mt-4 rounded shadow-md flex justify-between items-start animate-slide-up"
          role="alert"
          aria-live="polite"
        >
          <div className="flex gap-3">
            <Icon name="wifi-off" className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-bold text-sm">数据同步超时</p>
              <p className="text-xs opacity-90 mt-1">请检查网络环境，或刷新重试。</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            aria-label="刷新页面重新加载数据"
            className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded hover:bg-amber-600"
          >
            刷新
          </button>
        </div>
      )}

      {/* 当前联赛信息条 */}
      {currentLeague && !loading && (
        <div className="max-w-7xl mx-auto px-4 mt-2">
          <div className="text-[11px] text-slate-400 dark:text-slate-500">
            当前联赛: <span className="font-medium text-slate-600 dark:text-slate-300">{currentLeague.name}</span>
            {currentLeague.description && (
              <span className="ml-2">{currentLeague.description}</span>
            )}
          </div>
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
            selectedSeason={selectedSeason}
            onSeasonChange={setSelectedSeason}
            availableSeasons={availableSeasons}
          />
        )}

        {activeTab === 'newGame' && (
          canEdit ? (
            <NewGameFormTab
              key={editingMatchId || 'new'}
              isAdmin={isAdmin}
              allPlayerNames={allPlayerNames}
              playerProfiles={playerProfiles}
              editingMatch={matchHistory.find(m => m.id === editingMatchId)}
              onSave={handleSaveGame}
              onCancelEdit={() => {
                localStorage.removeItem('match_draft')
                setEditingMatchId(null)
              }}
              quickAmounts={frequentAmounts}
            />
          ) : (
            <div className="text-center py-20">
              <Icon name="lock" className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">无录入权限</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">你在此联赛中为只读角色，无法录入比赛数据</p>
            </div>
          )
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            user={user}
            isAdmin={isAdmin}
            allPlayerNames={allPlayerNames}
            playerProfiles={playerProfiles}
            matchHistory={matchHistory}
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
          isDark={isDark}
          leagueStats={leagueStats}
          onNavigateToMatch={handleNavigateToMatch}
          allPlayerNames={allPlayerNames}
          playerProfiles={playerProfiles}
          leaderboardData={statsData.leaderboardData}
          seasonTotalGames={statsData.seasonStats.totalGames}
          selectedSeason={selectedSeason}
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
        message={
          pendingAction?.type === 'clear'
            ? '您正在尝试删除云端的所有数据。此操作不可逆！'
            : '导入本地数据将会合并或覆盖现有的云端数据。'
        }
      />

      {/* 移动端底部导航栏 */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#0b0e14]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-50 safe-area-bottom"
        role="navigation"
        aria-label="移动端主导航"
      >
        <div className="flex justify-around items-center h-16 px-1">
          {TAB_CONFIG.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              aria-label={`切换到${t.label}页面`}
              aria-current={activeTab === t.id ? 'page' : undefined}
              className={`nav-item flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-2 mx-0.5 rounded-xl transition-all touch-feedback ${activeTab === t.id
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                : 'text-slate-400 dark:text-slate-500 active:bg-slate-100 dark:active:bg-slate-800'
                }`}
            >
              <Icon name={t.icon} className="w-6 h-6" aria-hidden="true" />
              <span className={`text-[10px] font-medium mt-1 ${activeTab === t.id ? 'font-bold' : ''}`}>
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

/**
 * 根组件 — 用 LeagueProvider 包裹
 */
const App = () => {
  return (
    <ErrorBoundary>
      <LeagueProvider>
        <AppContent />
      </LeagueProvider>
    </ErrorBoundary>
  );
};

export default App;
