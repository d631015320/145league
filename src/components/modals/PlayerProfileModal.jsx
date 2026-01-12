// src/components/modals/PlayerProfileModal.jsx
// 玩家个人档案弹窗 - 容器组件 (v2 重构版)

import { useState, useEffect, useMemo, useRef } from 'react'
import Icon from '../common/Icon'
import Avatar from '../common/Avatar'
import PowerBadge from '../common/PowerBadge'
import AnimatedNumber from '../common/AnimatedNumber'
import CareerChart from '../../charts/CareerChart'
import HeadToHead from './HeadToHead'
import PlayerBadges from './PlayerBadges'
import PlayerRadarSection from './PlayerRadarSection'
import MatchHistoryTable from './MatchHistoryTable'
import { compressImage } from '../../lib/utils'
import usePlayerMatches from '../../hooks/usePlayerMatches'
import useBadges from '../../hooks/useBadges'
import { usePlayerRadarStats } from '../../hooks/useRadarStats'
import { useIsMobile } from '../../hooks/useMediaQuery'
import useCountUp from '../../hooks/useCountUp'

const PlayerProfileModal = ({
  player, history, onClose, onUploadAvatar, leagueStats,
  isDark, onNavigateToMatch, allPlayerNames, leaderboardData, seasonTotalGames,
  selectedSeason
}) => {
  const [compareTarget, setCompareTarget] = useState('')
  const [showPowerHelp, setShowPowerHelp] = useState(false)
  const modalRef = useRef(null)
  const closeButtonRef = useRef(null)

  // 响应式检测
  const isMobile = useIsMobile()

  // 使用自定义 Hooks（传入赛季筛选）
  const { playerMatches, totalGames, wins } = usePlayerMatches(player, history, selectedSeason)
  const badges = useBadges(player, playerMatches, totalGames, wins, wins / totalGames, history)
  const { radarStats, powerScore, calculateForPlayer } = usePlayerRadarStats(
    player, playerMatches, totalGames, leagueStats, seasonTotalGames
  )

  // 对比玩家雷达图数据
  const compareRadarStats = useMemo(() => {
    if (!compareTarget || !leaderboardData) return null
    const targetObj = leaderboardData.find(p => p.name === compareTarget)
    if (!targetObj) return null
    const targetMatches = history
      .filter(m => m.results.some(r => r.name === compareTarget))
      .map(m => ({ ...m, result: m.results.find(r => r.name === compareTarget) }))
    const result = calculateForPlayer(targetMatches, targetObj.gamesPlayed, targetObj.totalChips)
    return result?.stats || null
  }, [compareTarget, history, leaderboardData, calculateForPlayer])

  // 焦点管理
  useEffect(() => {
    if (!player) return
    document.body.classList.add('modal-open')
    closeButtonRef.current?.focus()
    return () => document.body.classList.remove('modal-open')
  }, [player])

  // 键盘导航
  useEffect(() => {
    if (!player) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const first = focusable[0], last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first?.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, player])

  // 头像上传
  const handleFileChange = async (e) => {
    if (e.target.files?.[0]) {
      const base64 = await compressImage(e.target.files[0])
      onUploadAvatar(player.name, base64)
    }
  }

  if (!player) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-end md:items-center justify-center md:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-modal`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-profile-title"
    >
      <div
        ref={modalRef}
        className={`glass-panel w-full overflow-y-auto shadow-2xl relative bg-white/90 dark:bg-slate-900/90 scroll-touch ${isMobile
          ? 'h-[95vh] rounded-t-2xl'
          : 'max-w-4xl max-h-[95vh] rounded-2xl'
          }`}
        onClick={e => e.stopPropagation()}
      >
        {/* 移动端拖拽指示器 */}
        {isMobile && (
          <div className="sticky top-0 z-20 flex justify-center py-3 bg-gradient-to-b from-white/90 dark:from-slate-900/90 to-transparent">
            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
          </div>
        )}

        {/* 顶部背景条 */}
        <div className={`bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-900 dark:to-slate-900 relative overflow-hidden ${isMobile ? 'h-24' : 'h-32'}`}>
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }} />
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="关闭玩家档案"
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-white/20 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-white min-w-[44px] min-h-[44px] flex items-center justify-center touch-feedback"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        <div className={`relative ${isMobile ? 'px-4 pb-6 -mt-12' : 'px-8 pb-8 -mt-16'}`}>
          {/* 头部信息区 - 移动端垂直布局 */}
          <div className={`flex gap-4 md:gap-6 ${isMobile ? 'flex-col items-center text-center' : 'flex-row items-start'}`}>
            {/* 头像 */}
            <div className="relative group cursor-pointer flex-shrink-0">
              <Avatar
                name={player.name}
                src={player.avatar?.avatar || player.avatar}
                size={isMobile ? 'xl' : 'xxl'}
                className={`border-4 border-white dark:border-[#0b0e14] shadow-2xl`}
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all backdrop-blur-sm">
                <Icon name="camera" className="text-white w-8 h-8" />
                <span className="sr-only">上传头像</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            {/* 玩家信息 */}
            <div className={`flex-1 ${isMobile ? 'pt-2' : 'pt-0 md:mt-16'}`}>
              <div className={`flex flex-wrap items-center gap-3 mb-1 ${isMobile ? 'justify-center' : ''}`}>
                <h2 id="player-profile-title" className={`font-black text-slate-800 dark:text-white tracking-tight ${isMobile ? 'text-2xl' : 'text-3xl'}`}>{player.name}</h2>
                <PowerBadge score={powerScore} onClick={() => setShowPowerHelp(true)} />
              </div>
              <PlayerBadges badges={badges} />
              <div className={`flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-400 ${isMobile ? 'justify-center' : ''}`}>
                {player.votedMvpCount > 0 && (
                  <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
                    <Icon name="star" className="w-3 h-3 fill-current" /> {player.votedMvpCount} MVP
                  </span>
                )}
                {player.luckyCount > 0 && (
                  <span className="flex items-center gap-1 text-pink-600 dark:text-pink-400 font-bold">
                    <Icon name="sparkles" className="w-3 h-3" /> {player.luckyCount} 运气王
                  </span>
                )}
                {(player.votedMvpCount > 0 || player.luckyCount > 0) && <span className="text-slate-300 dark:text-slate-600">|</span>}
                <span>参赛 {totalGames}/{leagueStats?.totalMatches || 10} 场</span>
              </div>
            </div>

            {/* 顶部数据统计 - 移动端隐藏，桌面端显示 */}
            {!isMobile && (
              <div className="hidden md:grid grid-cols-3 gap-x-6 gap-y-2 mt-20">
                {radarStats.map(stat => {
                  // 维度颜色映射（和进度条一致，light模式加深）
                  const colorMap = {
                    '统治': 'text-purple-600 dark:text-purple-400',
                    '击败': 'text-rose-600 dark:text-rose-400',
                    '效率': 'text-blue-600 dark:text-blue-400',
                    '胜场': 'text-amber-600 dark:text-amber-400',
                    '掠夺': 'text-emerald-600 dark:text-emerald-400',
                    '稳定': 'text-cyan-600 dark:text-cyan-400',
                    'MVP': 'text-indigo-600 dark:text-indigo-400'
                  }
                  // 标签直接使用
                  const shortLabel = stat.label
                  return (
                    <div key={stat.label} className="text-center">
                      <div className="text-xs text-slate-600 dark:text-slate-300 uppercase tracking-widest font-bold">{shortLabel}</div>
                      <AnimatedNumber
                        value={stat.raw}
                        className={`text-xl font-mono font-black ${colorMap[stat.label] || 'text-slate-700 dark:text-slate-200'}`}
                        duration={1000}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 主内容区 - 移动端单列，桌面端双列 */}
          <div className={`grid gap-6 mt-6 md:mt-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
            {/* 左侧：雷达图 + 对比 */}
            <div className="space-y-6">
              <PlayerRadarSection
                radarStats={radarStats}
                compareRadarStats={compareRadarStats}
                compareTarget={compareTarget}
                onCompareChange={setCompareTarget}
                allPlayerNames={allPlayerNames}
                playerName={player.name}
                isDark={isDark}
                isMobile={isMobile}
              />
              <HeadToHead player={player} history={history} leaderboardData={leaderboardData} />
            </div>

            {/* 右侧：走势图 + 战绩表 */}
            <div className="space-y-6">
              <CareerChart history={playerMatches} isDark={isDark} leagueStats={leagueStats} />
              <MatchHistoryTable matches={playerMatches} onNavigateToMatch={onNavigateToMatch} isMobile={isMobile} />
            </div>
          </div>
        </div>

        {/* 战力说明弹窗 */}
        {showPowerHelp && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPowerHelp(false)}
          >
            <div
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-modal"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowPowerHelp(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="关闭"
              >
                <Icon name="x" className="w-5 h-5 text-slate-500" />
              </button>

              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Icon name="zap" className="w-5 h-5 text-purple-500" />
                战力是怎么算的？
              </h3>

              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <p>战力是综合评估你实力的指标，不只看谁赢得多或筹码多。</p>

                <div className="space-y-2">
                  <p className="font-bold text-slate-700 dark:text-slate-200">我们看这几个方面：</p>
                  <ul className="space-y-1 pl-1">
                    <li className="flex items-center gap-2">
                      <span className="text-purple-500">🏆</span>
                      <span><strong>统治力</strong> (21%) - 拿第一的能力</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">📊</span>
                      <span><strong>效率</strong> (21%) - 得分能力</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">💰</span>
                      <span><strong>掠夺</strong> (19%) - 赢筹码的能力</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-rose-500">⚔️</span>
                      <span><strong>击败</strong> (16%) - 击败对手的比例</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-amber-500">🎯</span>
                      <span><strong>胜场</strong> (13%) - 赢码的场次比例</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-indigo-500">🌟</span>
                      <span><strong>MVP</strong> (10%) - 大家公认你厉害</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 space-y-2">
                  <p className="font-bold text-slate-700 dark:text-slate-200">💡 为什么新人不会一下冲到榜首？</p>
                  <p className="text-xs">打得少的玩家，我们会"保守估计"——假设你还没展示的那些场次是中等水平。打得越多，你的真实实力才越能体现出来。</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 space-y-2">
                  <p className="font-bold text-slate-700 dark:text-slate-200">📅 为什么出勤也很重要？</p>
                  <p className="text-xs">经常来打的玩家，战力会更准确反映实力；偶尔来的玩家，战力会稍微打个折扣。毕竟，真正的高手是经得起长期考验的。</p>
                </div>

                <p className="text-center font-bold text-purple-600 dark:text-purple-400 pt-2">
                  简单说：多打、打好、稳定发挥 = 高战力 💪
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PlayerProfileModal
