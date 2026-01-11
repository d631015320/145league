// src/hooks/usePlayerMatches.js
// 玩家比赛数据 Hook

import { useMemo } from 'react'

/**
 * 计算单个玩家的绝对赢码指数（贝叶斯修正）
 * 先验参数：3场中赢1场（33%基准）
 * 
 * @param {Array} playerMatches - 玩家的比赛记录
 * @returns {number} 绝对赢码指数（0-1之间）
 */
export function calculateRawChipWinRate(playerMatches) {
  if (!playerMatches || playerMatches.length === 0) return 0
  
  // 筹码为正的场次
  const chipWins = playerMatches.filter(m => m.result?.chips > 0).length
  const totalGames = playerMatches.length
  
  // 贝叶斯修正：先验 3场赢1场
  const priorWins = 1
  const priorGames = 3
  
  return (chipWins + priorWins) / (totalGames + priorGames)
}

// 每赛季场次
const GAMES_PER_SEASON = 10

/**
 * 从历史记录中筛选玩家的比赛数据并计算统计信息
 * 
 * @param {Object} player - 玩家对象
 * @param {Array} history - 比赛历史（按 created_at 降序）
 * @param {string} selectedSeason - 选中的赛季 ('all' 或 'S1', 'S2', ...)
 * @returns {Object} 玩家比赛数据和统计信息
 */
function usePlayerMatches(player, history, selectedSeason = 'all') {
  // 按赛季筛选比赛历史
  const filteredHistory = useMemo(() => {
    if (selectedSeason === 'all') return history
    
    // 按时间正序排列
    const sortedAsc = [...history].sort((a, b) => new Date(a.date) - new Date(b.date))
    const seasonIndex = parseInt(selectedSeason.slice(1)) - 1
    const start = seasonIndex * GAMES_PER_SEASON
    const end = start + GAMES_PER_SEASON
    const seasonMatches = sortedAsc.slice(start, end)
    
    // 返回降序（与原始 history 格式一致）
    return seasonMatches.reverse()
  }, [history, selectedSeason])

  // 筛选玩家参与的比赛，并附加该玩家的结果
  const playerMatches = useMemo(() => {
    if (!player) return []
    return filteredHistory
      .filter(m => m.results.some(r => r.name === player.name))
      .map(m => {
        const res = m.results.find(r => r.name === player.name)
        return { ...m, result: res }
      })
      .reverse() // history 是降序，反转为升序（用于图表）
  }, [player, filteredHistory])

  // 计算统计数据
  const stats = useMemo(() => {
    const totalGames = playerMatches.length
    const wins = playerMatches.filter(m => m.result?.rank === 1).length
    const winRate = totalGames > 0 ? wins / totalGames : 0
    
    // 调整后的胜率（考虑样本量）
    const careerK = Math.max(2, filteredHistory.length / 4)
    const adjWinRate = wins / (totalGames + careerK)
    
    // 绝对赢码指数（贝叶斯修正）
    const rawChipWinRate = calculateRawChipWinRate(playerMatches)

    return {
      totalGames,
      wins,
      winRate,
      adjWinRate,
      rawChipWinRate
    }
  }, [playerMatches, filteredHistory.length])

  return {
    playerMatches,
    ...stats
  }
}

export default usePlayerMatches
