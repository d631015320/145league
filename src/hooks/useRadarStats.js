// src/hooks/useRadarStats.js
// 雷达图数据计算 Hook

import { useMemo, useCallback } from 'react'

/**
 * 雷达图维度标签（电竞风格）
 */
export const RADAR_LABELS = [
  { 
    zh: '稳定', 
    en: 'STABLE', 
    key: 'stability',
    description: '排名波动的稳定性，标准差越小越稳定'
  },
  { 
    zh: '效率', 
    en: 'EFF', 
    key: 'efficiency',
    description: '得分效率，场均得分与含金量的综合评估'
  },
  { 
    zh: '掠夺', 
    en: 'Plunder', 
    key: 'plunder',
    description: '筹码掠夺能力，场均筹码收益'
  },
  { 
    zh: '击败', 
    en: 'K.O.', 
    key: 'knockout',
    description: '击败对手的能力，平均击败率'
  }
]

/**
 * 计算雷达图数据
 * 
 * @param {Object} leagueStats - 联盟统计极值
 * @returns {Object} 雷达图计算函数和当前玩家数据
 */
function useRadarStats(leagueStats) {
  /**
   * 为指定玩家计算雷达图数据
   */
  const calculateForPlayer = useCallback((targetMatches, targetTotalGames, targetTotalChips) => {
    if (targetTotalGames < 1) return []

    // 1. 稳定性 (Stability) - 基于排名标准差
    const ranks = targetMatches.map(m => m.result.rank)
    const avgRank = ranks.reduce((a, b) => a + b, 0) / ranks.length
    const variance = ranks.reduce((a, b) => a + Math.pow(b - avgRank, 2), 0) / ranks.length
    const stdDev = Math.sqrt(variance)
    const stabilityScore = Math.max(1, Math.min(10, 10 - stdDev))

    // 2. 效率 (Efficiency) - 基于场均得分和含金量
    const totalScore = targetMatches.reduce((a, b) => a + b.result.score, 0)
    const avgScore = totalScore / targetTotalGames
    const safeMaxAvgScore = leagueStats?.maxAvgScore || 1
    const safeMaxGoldContent = leagueStats?.maxGoldContent || 1
    const goldContent = totalScore > 0 ? targetTotalChips / totalScore : 0
    const normAvgScore = safeMaxAvgScore > 0 ? avgScore / safeMaxAvgScore : 0
    const normGoldContent = safeMaxGoldContent > 0 ? goldContent / safeMaxGoldContent : 0
    const efficiencyScore = Math.max(1, Math.min(10, (normAvgScore * 0.6 + normGoldContent * 0.4) * 10))

    // 3. 掠夺 (Plunder) - 基于场均筹码
    const avgChips = targetTotalChips / targetTotalGames
    const safeMinChips = leagueStats?.minAvgChips || 0
    const safeMaxChips = leagueStats?.maxAvgChips || 1
    const range = safeMaxChips - safeMinChips
    const normChips = range > 0 ? (avgChips - safeMinChips) / range : 0.5
    const plunderScore = Math.max(1, Math.min(10, normChips * 9 + 1))

    // 4. 击败 (K.O.) - 基于平均击败率
    const beatRates = targetMatches.map(m => {
      if (m.totalPlayers <= 1) return 0
      return (m.totalPlayers - m.result.rank) / (m.totalPlayers - 1)
    })
    const avgBeatRate = beatRates.reduce((a, b) => a + b, 0) / beatRates.length
    const safeMaxBeatRate = leagueStats?.maxAvgBeatRate || 1
    const normBeatRate = safeMaxBeatRate > 0 ? avgBeatRate / safeMaxBeatRate : 0
    
    let defeatScore = 0
    if (normBeatRate >= 0.9) defeatScore = 9 + (normBeatRate - 0.9) * 10
    else if (normBeatRate >= 0.7) defeatScore = 7 + (normBeatRate - 0.7) * 10
    else if (normBeatRate >= 0.4) defeatScore = 4 + (normBeatRate - 0.4) * 10
    else defeatScore = 1 + normBeatRate * 7.5
    defeatScore = Math.max(1, Math.min(10, defeatScore))

    return [
      { 
        label: `${RADAR_LABELS[0].zh} (${RADAR_LABELS[0].en})`, 
        value: stabilityScore, 
        raw: `σ=${stdDev.toFixed(1)}`,
        description: RADAR_LABELS[0].description
      },
      { 
        label: `${RADAR_LABELS[1].zh} (${RADAR_LABELS[1].en})`, 
        value: efficiencyScore, 
        raw: `Score:${avgScore.toFixed(1)}`,
        description: RADAR_LABELS[1].description
      },
      { 
        label: `${RADAR_LABELS[2].zh} (${RADAR_LABELS[2].en})`, 
        value: plunderScore, 
        raw: `Avg:${Math.round(avgChips)}`,
        description: RADAR_LABELS[2].description
      },
      { 
        label: `${RADAR_LABELS[3].zh} (${RADAR_LABELS[3].en})`, 
        value: defeatScore, 
        raw: `Rate:${(avgBeatRate * 100).toFixed(0)}%`,
        description: RADAR_LABELS[3].description
      }
    ]
  }, [leagueStats])

  return { calculateForPlayer }
}

/**
 * 计算玩家雷达图数据的便捷 Hook
 */
export function usePlayerRadarStats(player, playerMatches, totalGames, leagueStats) {
  const { calculateForPlayer } = useRadarStats(leagueStats)

  const radarStats = useMemo(() => {
    if (!player || totalGames < 1) return []
    return calculateForPlayer(playerMatches, totalGames, player.totalChips)
  }, [player, playerMatches, totalGames, calculateForPlayer])

  return { radarStats, calculateForPlayer }
}

export default useRadarStats
