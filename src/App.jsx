// src/App.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';

// --- 常量 ---
import { GAMES_PER_SEASON, TAB_CONFIG, NETWORK_TIMEOUT } from './constants';

// --- 自定义 Hooks ---
import useData from './hooks/useData'
import useLeagueStats from './hooks/useLeagueStats';
import useStatsCalculator from './hooks/useStatsCalculator';
import useTheme from './hooks/useTheme';

// --- 数据库服务 ---
import { saveMatch, deleteMatch, uploadAvatar, signIn } from './services/db.service'

// --- 公共组件 ---
import Icon from './components/common/Icon.jsx';
import Clock from './components/common/Clock.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';

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

const App = () => {
  // ===========================
  // A. 状态管理 (State)
  // ===========================

  // 使用自定义 Hooks
  const { matchHistory, playerProfiles, user, isAdmin, loading } = useData()
  const { theme, toggleTheme, isDark } = useTheme();
  const leagueStats = useLeagueStats(matchHistory);

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
    const seasonsCount = Math.ceil(matchHistory.length / GAMES_PER_SEASON);
    return Array.from({ length: seasonsCount }, (_, i) => `S${i + 1}`);
  }, [matchHistory]);

  // 统计数据
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

  // 排序后的历史记录
  const sortedHistory = useMemo(() => {
    return [...matchHistory].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA < dateB) return 1;
      if (dateA > dateB) return -1;
      return String(b.id).localeCompare(String(a.id));
    });
  }, [matchHistory]);

  // 赛季归属映射
  const matchSeasons = useMemo(() => {
    const map = {};
    const ascHistory = [...matchHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
    ascHistory.forEach((match, index) => {
      const seasonNum = Math.ceil((index + 1) / GAMES_PER_SEASON);
      map[match.id] = `S${seasonNum}`;
    });
    return map;
  }, [matchHistory]);

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

  // ===========================
  // D. 事件处理 (Handlers)
  // ===========================

  const handleSaveGame = useCallback(async (matchData) => {
    try {
      await saveMatch(matchData, editingMatchId);
      setEditingMatchId(null);
      setActiveTab('leaderboard');
    } catch (error) {
      alert(error.message);
    }
  }, [editingMatchId]);

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
    <ErrorBoundary>
      <div className="min-h-screen pb-20 transition-colors duration-300">
        {/* 顶部导航 */}
        <nav className="glass-header sticky top-0 z-50 transition-all duration-300" role="navigation" aria-label="主导航">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Icon name="spade" className="w-5 h-5 fill-current" aria-hidden="true" />
              </div>
              <span className="text-xl font-black tracking-tight hidden sm:block">
                145 <span className="text-emerald-500">联赛</span>
              </span>
            </div>

            {/* 桌面端 Tab */}
            <div className="hidden md:flex items-center bg-slate-100/50 dark:bg-slate-800/50 rounded-full p-1 border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm mx-4" role="tablist" aria-label="页面导航">
              {TAB_CONFIG.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  role="tab"
                  aria-selected={activeTab === t.id}
                  aria-controls={`${t.id}-panel`}
                  aria-label={`${t.label}页面`}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                    activeTab === t.id
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon name={t.icon} className="w-3.5 h-3.5" aria-hidden="true" /> {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden lg:block text-right">
                <Clock />
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden lg:block" aria-hidden="true"></div>
              <button
                onClick={toggleTheme}
                aria-label={theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'light' ? (
                  <Icon name="sun" className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Icon name="moon" className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </nav>

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

        {/* 移动端底部 Tab */}
        <nav 
          className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#0b0e14]/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 p-2 z-50 flex justify-around safe-area-bottom"
          role="navigation"
          aria-label="移动端主导航"
        >
          {TAB_CONFIG.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              aria-label={`切换到${t.label}页面`}
              aria-current={activeTab === t.id ? 'page' : undefined}
              className={`p-3 rounded-xl flex flex-col items-center gap-1 ${
                activeTab === t.id
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <Icon name={t.icon} className="w-6 h-6" aria-hidden="true" />
              <span className="sr-only">{t.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </ErrorBoundary>
  );
};

export default App;
