// src/hooks/usePlayerMatches.js
// 玩家比赛数据 Hook

import { useMemo } from 'react'

/**
 * 从历史记录中筛选玩家的比赛数据并计算统计信息
 * 
 * @param {Object} player - 玩家对象
 * @param {Array} history - 比赛历史（按 created_at 降序）
 * @returns {Object} 玩家比赛数据和统计信息
 */
function usePlayerMatches(player, history) {
  // 筛选玩家参与的比赛，并附加该玩家的结果
  const playerMatches = useMemo(() => {
    if (!player) return []
    return history
      .filter(m => m.results.some(r => r.name === player.name))
      .map(m => {
        const res = m.results.find(r => r.name === player.name)
        return { ...m, result: res }
      })
      .reverse() // history 是降序，反转为升序（用于图表）
  }, [player, history])

  // 计算统计数据
  const stats = useMemo(() => {
    const totalGames = playerMatches.length
    const wins = playerMatches.filter(m => m.result?.rank === 1).length
    const winRate = totalGames > 0 ? wins / totalGames : 0
    
    // 调整后的胜率（考虑样本量）
    const careerK = Math.max(2, history.length / 4)
    const adjWinRate = wins / (totalGames + careerK)

    return {
      totalGames,
      wins,
      winRate,
      adjWinRate
    }
  }, [playerMatches, history.length])

  return {
    playerMatches,
    ...stats
  }
}

export default usePlayerMatches
