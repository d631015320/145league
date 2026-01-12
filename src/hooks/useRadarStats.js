// src/hooks/useRadarStats.js
// 雷达图数据计算 Hook

import { useMemo, useCallback } from 'react'
import { BASE_SCORES, ATTENDANCE_TIERS } from '../constants'

/**
 * 根据出勤率获取活跃度等级信息
 * @param {number} attendanceRate - 出勤率 (0-1)
 * @returns {Object} 等级信息 { coeff, name, icon, colorKey, description }
 */
export function getAttendanceTier(attendanceRate) {
  for (const tier of ATTENDANCE_TIERS) {
    if (attendanceRate >= tier.minRate) {
      return tier
    }
  }
  // 兜底返回最后一档
  return ATTENDANCE_TIERS[ATTENDANCE_TIERS.length - 1]
}

/**
 * 雷达图维度标签
 * 顺序：统治 → 效率 → 掠夺 → 胜场 → 击败 → MVP → 稳定
 */
export const RADAR_LABELS = [
  {
    zh: '统治',
    en: 'RULE',
    key: 'domination',
    description: '拿第1的能力（大吉大利😋今晚吃鸡）'
  },
  {
    zh: '效率',
    en: 'EFF',
    key: 'efficiency',
    description: '得分能力（得分老多了🏀詹姆斯都摇头）'
  },
  {
    zh: '掠夺',
    en: 'Plunder',
    key: 'plunder',
    description: '抢筹码能力（得分多，赢码也多，交出你的米🔫）'
  },
  {
    zh: '胜场',
    en: 'WIN',
    key: 'chipWin',
    description: '赢码能力（明天的早饭钱省咯🍚）'
  },
  {
    zh: '击败',
    en: 'KO',
    key: 'knockout',
    description: '击败对手的能力（嘿嘿~进决赛圈不算输🐎）'
  },
  {
    zh: 'MVP',
    en: 'MVP',
    key: 'mvp',
    description: '公认实力（大家都说你厉害，那你就是厉害👍）'
  },
  {
    zh: '稳定',
    en: 'STABLE',
    key: 'stability',
    description: '发挥稳定性（发挥老稳定了，稳定排在最后😭）'
  }
]

/**
 * 战力权重配置
 * 稳定性不计入战力（只打1场的玩家标准差为0，会得100分）
 * 统治21% + 效率21% + 掠夺19% + 击败16% + 胜场13% + MVP10% = 100%
 */
export const POWER_WEIGHTS = {
  domination: 0.21,  // 统治 21%
  efficiency: 0.21,  // 效率 21%
  plunder: 0.19,     // 掠夺 19%
  knockout: 0.16,    // 击败 16%
  chipWin: 0.13,     // 胜场 13%
  mvp: 0.10,         // MVP 10%
  stability: 0       // 稳定 0%（不计入战力）
}

/**
 * 计算动态先验场次
 * 公式：√举办场次 × 3
 * 
 * @param {number} seasonTotalGames - 赛季举办场次
 * @returns {number} 先验场次
 */
export function calculatePriorGames(seasonTotalGames) {
  return Math.sqrt(seasonTotalGames) * 3
}

/**
 * 计算动态先验得分
 * 基于赛季平均参赛人数，中等水平玩家排名为 x/2
 * 
 * @param {number} avgPlayers - 平均参赛人数
 * @param {number} priorGames - 先验场次
 * @returns {number} 先验得分（priorGames场的总分）
 */
export function calculatePriorScore(avgPlayers, priorGames = 3) {
  // 中等排名 = 平均参赛人数 / 2，向下取整后作为数组索引
  const medianRank = Math.floor(avgPlayers / 2)
  // 确保索引在有效范围内 (0-9)
  const rankIndex = Math.max(0, Math.min(medianRank - 1, BASE_SCORES.length - 1))
  // 基础分 × 人数折算
  const priorScorePerGame = BASE_SCORES[rankIndex] * (avgPlayers / 10)
  // 先验场次动态计算
  return priorScorePerGame * priorGames
}

/**
 * 纯函数版本：计算玩家战力（用于排行榜）
 * 动态先验：√举办场次 × 2
 * 
 * @param {Object} playerData - 玩家数据
 * @param {Object} leagueStats - 联盟统计极值
 * @param {number} activeCoeff - 活跃度系数（默认1.0，不打折）
 * @param {number} seasonTotalGames - 赛季举办场次（用于动态先验）
 * @returns {number} 战力值 0-100
 */
export function calculatePowerScore(playerData, leagueStats, activeCoeff = 1.0, seasonTotalGames = 10) {
  const {
    gamesPlayed,
    totalScore,
    totalChips,
    wins,
    sumBeatRate,
    chipWins,
    mvpCount,
    sumPlayers,
    ranks,
    chipsList = []  // 每场筹码数组（用于计算筹码标准差）
  } = playerData

  if (gamesPlayed < 1) return 0

  // 动态先验场次：max(3, √举办场次 × 2)
  const priorGames = calculatePriorGames(seasonTotalGames)

  // 归一化辅助函数
  const normalize = (value, min, max) => {
    const range = max - min
    if (range <= 0) return 50
    return Math.max(0, Math.min(100, ((value - min) / range) * 100))
  }

  // 1. 稳定性原始值（基于筹码标准差，贝叶斯修正）
  let rawChipStdDev = 0
  if (gamesPlayed >= 2 && chipsList.length >= 2) {
    const avgChipForStd = chipsList.reduce((a, b) => a + b, 0) / chipsList.length
    const variance = chipsList.reduce((a, b) => a + Math.pow(b - avgChipForStd, 2), 0) / chipsList.length
    rawChipStdDev = Math.sqrt(variance)
  }
  // 贝叶斯修正：场次少的人向联盟平均靠拢
  const leagueAvgChipStdDev = leagueStats?.leagueAvgChipStdDev || 800
  const adjustedChipStdDev = (rawChipStdDev * gamesPlayed + leagueAvgChipStdDev * priorGames) / (gamesPlayed + priorGames)
  // 稳定性得分：标准差越小得分越高（反向归一化）
  const rawStability = Math.max(0, Math.min(100, (1 - adjustedChipStdDev / 1500) * 100))

  // 2. 效率原始值（贝叶斯修正后的场均得分）
  const avgPlayers = sumPlayers / gamesPlayed
  const priorScore = calculatePriorScore(avgPlayers || 7, priorGames)
  const adjustedAvgScore = (totalScore + priorScore) / (gamesPlayed + priorGames)

  // 3. 掠夺原始值（贝叶斯修正后的场均筹码）
  const avgChips = totalChips / gamesPlayed
  const leagueAvgChips = leagueStats?.leagueAvgChips || 0
  const adjustedPlunder = (avgChips * gamesPlayed + leagueAvgChips * priorGames) / (gamesPlayed + priorGames)

  // 4. 击败原始值（贝叶斯修正后的击败率）
  const avgBeatRate = sumBeatRate / gamesPlayed
  const leagueAvgBeatRate = leagueStats?.leagueAvgBeatRate || 0.5
  const adjustedBeatRate = (avgBeatRate * gamesPlayed + leagueAvgBeatRate * priorGames) / (gamesPlayed + priorGames)

  // 5. 胜场原始值（贝叶斯修正后的赢码率）
  const leagueAvgChipWinRate = leagueStats?.leagueAvgChipWinRate || 0.33
  const priorChipWins = priorGames * leagueAvgChipWinRate
  const adjustedChipWinRate = (chipWins + priorChipWins) / (gamesPlayed + priorGames)

  // 6. 统治原始值（贝叶斯修正后的胜率）
  const leagueAvgWinRate = leagueStats?.leagueAvgWinRate || 0.1
  const priorWins = priorGames * leagueAvgWinRate
  const adjustedWinRate = (wins + priorWins) / (gamesPlayed + priorGames)

  // 7. MVP原始值（贝叶斯修正后的MVP率）
  const leagueAvgMvpRate = leagueStats?.leagueAvgMvpRate || 0.1
  const priorMvps = priorGames * leagueAvgMvpRate
  const adjustedMvpRate = (mvpCount + priorMvps) / (gamesPlayed + priorGames)

  // ========== 原始值 → 贝叶斯修正 → 打折 → 归一化 → 最终分数 ==========
  
  // 贝叶斯修正后打折
  const discountedEfficiency = adjustedAvgScore * activeCoeff
  const discountedPlunder = adjustedPlunder * activeCoeff
  const discountedBeatRate = adjustedBeatRate * activeCoeff
  const discountedChipWinRate = adjustedChipWinRate * activeCoeff
  const discountedWinRate = adjustedWinRate * activeCoeff
  const discountedMvpRate = adjustedMvpRate * activeCoeff

  // 归一化（使用打折后的联盟极值）
  const efficiencyScore = normalize(
    discountedEfficiency,
    leagueStats?.minDiscountedEfficiency || 0,
    leagueStats?.maxDiscountedEfficiency || discountedEfficiency
  )
  const plunderScore = normalize(
    discountedPlunder,
    leagueStats?.minDiscountedPlunder || 0,
    leagueStats?.maxDiscountedPlunder || discountedPlunder
  )
  const defeatScore = normalize(
    discountedBeatRate,
    leagueStats?.minDiscountedBeatRate || 0,
    leagueStats?.maxDiscountedBeatRate || discountedBeatRate
  )
  const chipWinScore = normalize(
    discountedChipWinRate,
    leagueStats?.minDiscountedChipWinRate || 0,
    leagueStats?.maxDiscountedChipWinRate || discountedChipWinRate
  )
  const dominationScore = normalize(
    discountedWinRate,
    leagueStats?.minDiscountedWinRate || 0,
    leagueStats?.maxDiscountedWinRate || discountedWinRate
  )
  const mvpScore = normalize(
    discountedMvpRate,
    leagueStats?.minDiscountedMvpRate || 0,
    leagueStats?.maxDiscountedMvpRate || discountedMvpRate
  )

  // 稳定性不打折
  const stabilityScore = normalize(
    rawStability,
    leagueStats?.minStability || 0,
    leagueStats?.maxStability || rawStability
  )

  // 计算综合战力（归一化后的维度加权求和）
  return (
    dominationScore * POWER_WEIGHTS.domination +
    defeatScore * POWER_WEIGHTS.knockout +
    efficiencyScore * POWER_WEIGHTS.efficiency +
    chipWinScore * POWER_WEIGHTS.chipWin +
    plunderScore * POWER_WEIGHTS.plunder +
    stabilityScore * POWER_WEIGHTS.stability +
    mvpScore * POWER_WEIGHTS.mvp
  )
}

/**
 * 计算雷达图数据
 * 
 * @param {Object} leagueStats - 联盟统计极值
 * @param {number} seasonTotalGames - 赛季举办场次（用于动态先验）
 * @returns {Object} 雷达图计算函数和当前玩家数据
 */
function useRadarStats(leagueStats, seasonTotalGames = 10) {
  /**
   * 为指定玩家计算雷达图数据
   */
  const calculateForPlayer = useCallback((targetMatches, targetTotalGames, targetTotalChips) => {
    if (targetTotalGames < 1) return []

    // 动态先验场次：√举办场次 × 2
    const priorGames = calculatePriorGames(seasonTotalGames)

    // 1. 稳定性 (Stability) - 基于筹码标准差，贝叶斯修正，值域 0-100
    // 筹码标准差越小 = 越稳定
    const chipsList = targetMatches.map(m => parseFloat(m.result?.chips) || 0)
    const avgChipForStd = chipsList.reduce((a, b) => a + b, 0) / chipsList.length
    let rawChipStdDev = 0
    if (targetTotalGames >= 2) {
      const variance = chipsList.reduce((a, b) => a + Math.pow(b - avgChipForStd, 2), 0) / chipsList.length
      rawChipStdDev = Math.sqrt(variance)
    }
    // 贝叶斯修正：场次少的人向联盟平均靠拢
    const leagueAvgChipStdDev = leagueStats?.leagueAvgChipStdDev || 800
    const adjustedChipStdDev = (rawChipStdDev * targetTotalGames + leagueAvgChipStdDev * priorGames) / (targetTotalGames + priorGames)
    // 稳定性得分：标准差越小得分越高（反向归一化）
    // 使用 1500 作为标准差上限参考值
    const stabilityScore = Math.max(0, Math.min(100, (1 - adjustedChipStdDev / 1500) * 100))

    // 2. 效率 (Efficiency) - 贝叶斯修正后的场均得分，相对排名归一化，值域 0-100
    const totalScore = targetMatches.reduce((a, b) => a + b.result.score, 0)
    // 计算平均参赛人数
    const avgPlayers = targetMatches.reduce((a, b) => a + b.totalPlayers, 0) / targetTotalGames
    // 动态先验得分（基于平均参赛人数和动态先验场次）
    const priorScore = calculatePriorScore(avgPlayers || 7, priorGames)
    // 贝叶斯修正后的场均得分
    const adjustedAvgScore = (totalScore + priorScore) / (targetTotalGames + priorGames)
    // 相对排名归一化：最高者100，最低者0
    const maxAdj = leagueStats?.maxAdjustedAvgScore || adjustedAvgScore
    const minAdj = leagueStats?.minAdjustedAvgScore || 0
    const adjRange = maxAdj - minAdj
    const normScore = adjRange > 0 ? (adjustedAvgScore - minAdj) / adjRange : 0.5
    const efficiencyScore = Math.max(0, Math.min(100, normScore * 100))

    // 3. 掠夺 (Plunder) - 动态贝叶斯修正后的场均筹码，相对排名归一化，值域 0-100
    const avgChips = targetTotalChips / targetTotalGames
    // 动态贝叶斯修正：先验筹码 = 赛季平均场均筹码
    const leagueAvgChips = leagueStats?.leagueAvgChips || 0
    const adjustedPlunder = (avgChips * targetTotalGames + leagueAvgChips * priorGames) / (targetTotalGames + priorGames)
    // 相对排名归一化
    const maxPlunder = leagueStats?.maxAdjustedPlunder || adjustedPlunder
    const minPlunder = leagueStats?.minAdjustedPlunder || 0
    const plunderRange = maxPlunder - minPlunder
    const normPlunder = plunderRange > 0 ? (adjustedPlunder - minPlunder) / plunderRange : 0.5
    const plunderScore = Math.max(0, Math.min(100, normPlunder * 100))

    // 4. 击败 (K.O.) - 动态贝叶斯修正后的平均击败率，相对排名归一化，值域 0-100
    const beatRates = targetMatches.map(m => {
      if (m.totalPlayers <= 1) return 0
      return (m.totalPlayers - m.result.rank) / (m.totalPlayers - 1)
    })
    const avgBeatRate = beatRates.reduce((a, b) => a + b, 0) / beatRates.length
    // 动态贝叶斯修正：先验击败率 = 赛季平均击败率
    const leagueAvgBeatRate = leagueStats?.leagueAvgBeatRate || 0.5
    const adjustedBeatRate = (avgBeatRate * targetTotalGames + leagueAvgBeatRate * priorGames) / (targetTotalGames + priorGames)
    // 相对排名归一化
    const maxBeatRate = leagueStats?.maxAdjustedBeatRate || adjustedBeatRate
    const minBeatRate = leagueStats?.minAdjustedBeatRate || 0
    const beatRateRange = maxBeatRate - minBeatRate
    const normBeatRate = beatRateRange > 0 ? (adjustedBeatRate - minBeatRate) / beatRateRange : 0.5
    const defeatScore = Math.max(0, Math.min(100, normBeatRate * 100))

    // 5. 胜场 (ChipWin) - 动态贝叶斯修正后的筹码盈利场次比例，相对排名归一化，值域 0-100
    const chipWins = targetMatches.filter(m => (parseFloat(m.result?.chips) || 0) > 0).length
    // 动态贝叶斯修正：先验赢场数 = priorGames × 赛季平均赢码率
    const leagueAvgChipWinRate = leagueStats?.leagueAvgChipWinRate || 0.33
    const priorChipWins = priorGames * leagueAvgChipWinRate
    const adjustedChipWinRate = (chipWins + priorChipWins) / (targetTotalGames + priorGames)
    // 相对排名归一化
    const maxChipRate = leagueStats?.maxAdjustedChipWinRate || adjustedChipWinRate
    const minChipRate = leagueStats?.minAdjustedChipWinRate || 0
    const chipRateRange = maxChipRate - minChipRate
    const normChipRate = chipRateRange > 0 ? (adjustedChipWinRate - minChipRate) / chipRateRange : 0.5
    const chipWinScore = Math.max(0, Math.min(100, normChipRate * 100))

    // 6. 统治 (Domination) - 动态贝叶斯修正后的第1名比例，相对排名归一化，值域 0-100
    const wins = targetMatches.filter(m => m.result?.rank === 1).length
    // 动态贝叶斯修正：先验胜场数 = priorGames × 赛季平均胜率
    const leagueAvgWinRate = leagueStats?.leagueAvgWinRate || 0.1
    const priorWins = priorGames * leagueAvgWinRate
    const adjustedWinRate = (wins + priorWins) / (targetTotalGames + priorGames)
    // 相对排名归一化
    const maxWinRate = leagueStats?.maxAdjWinRate || adjustedWinRate
    const minWinRate = leagueStats?.minAdjWinRate || 0
    const winRateRange = maxWinRate - minWinRate
    const normWinRate = winRateRange > 0 ? (adjustedWinRate - minWinRate) / winRateRange : 0.5
    const dominationScore = Math.max(0, Math.min(100, normWinRate * 100))

    // 7. MVP - 动态贝叶斯修正后的MVP率，相对排名归一化，值域 0-100
    // 注意：MVP 存储在 match.votedMvp（玩家名字），需要和当前玩家名字比较
    const mvpCount = targetMatches.filter(m => m.votedMvp === m.result?.name).length
    // 动态贝叶斯修正：先验MVP数 = priorGames × 赛季平均MVP率
    const leagueAvgMvpRate = leagueStats?.leagueAvgMvpRate || 0.1
    const priorMvps = priorGames * leagueAvgMvpRate
    const adjustedMvpRate = (mvpCount + priorMvps) / (targetTotalGames + priorGames)
    // 相对排名归一化
    const maxMvpRate = leagueStats?.maxAdjustedMvpRate || 0.5
    const minMvpRate = leagueStats?.minAdjustedMvpRate || 0
    const mvpRateRange = maxMvpRate - minMvpRate
    const normMvpRate = mvpRateRange > 0 ? (adjustedMvpRate - minMvpRate) / mvpRateRange : 0.5
    const mvpScore = Math.max(0, Math.min(100, normMvpRate * 100))

    // 计算战力（加权平均）
    const powerScore = 
      dominationScore * POWER_WEIGHTS.domination +
      defeatScore * POWER_WEIGHTS.knockout +
      efficiencyScore * POWER_WEIGHTS.efficiency +
      chipWinScore * POWER_WEIGHTS.chipWin +
      plunderScore * POWER_WEIGHTS.plunder +
      stabilityScore * POWER_WEIGHTS.stability +
      mvpScore * POWER_WEIGHTS.mvp

    // 返回雷达图数据，顺序：统治 → 效率 → 掠夺 → 胜场 → 击败 → MVP → 稳定
    // 同时返回战力值
    return {
      stats: [
        {
          label: '统治',
          value: dominationScore,
          raw: `${wins}/${targetTotalGames}胜`,
          description: RADAR_LABELS[0].description,
          zh: RADAR_LABELS[0].zh
        },
        {
          label: '效率',
          value: efficiencyScore,
          raw: `Avg:${adjustedAvgScore.toFixed(1)}`,
          description: RADAR_LABELS[1].description,
          zh: RADAR_LABELS[1].zh
        },
        {
          label: '掠夺',
          value: plunderScore,
          raw: `Avg:${Math.round(avgChips)}`,
          description: RADAR_LABELS[2].description,
          zh: RADAR_LABELS[2].zh
        },
        {
          label: '胜场',
          value: chipWinScore,
          raw: `${chipWins}/${targetTotalGames}场`,
          description: RADAR_LABELS[3].description,
          zh: RADAR_LABELS[3].zh
        },
        {
          label: '击败',
          value: defeatScore,
          raw: `Rate:${(avgBeatRate * 100).toFixed(0)}%`,
          description: RADAR_LABELS[4].description,
          zh: RADAR_LABELS[4].zh
        },
        {
          label: 'MVP',
          value: mvpScore,
          raw: `${mvpCount}/${targetTotalGames}次`,
          description: RADAR_LABELS[5].description,
          zh: RADAR_LABELS[5].zh
        },
        {
          label: '稳定',
          value: stabilityScore,
          raw: `σ=${Math.round(adjustedChipStdDev)}`,
          description: RADAR_LABELS[6].description,
          zh: RADAR_LABELS[6].zh
        }
      ],
      powerScore
    }
  }, [leagueStats, seasonTotalGames])

  return { calculateForPlayer }
}

/**
 * 计算玩家雷达图数据的便捷 Hook
 * 动态先验：√举办场次 × 2
 * 
 * @param {Object} player - 玩家数据
 * @param {Array} playerMatches - 玩家比赛记录
 * @param {number} totalGames - 玩家参赛场次
 * @param {Object} leagueStats - 联盟统计极值
 * @param {number} seasonTotalGames - 赛季举办场次（用于计算活跃度系数和动态先验）
 */
export function usePlayerRadarStats(player, playerMatches, totalGames, leagueStats, seasonTotalGames = 0) {
  const { radarStats, powerScore } = useMemo(() => {
    if (!player || totalGames < 1) return { radarStats: [], powerScore: 0 }

    // 计算活跃度系数（8档阶梯）
    const currentSeasonTotal = Math.max(1, seasonTotalGames || totalGames)
    const attendanceRate = totalGames / currentSeasonTotal
    const attendanceTier = getAttendanceTier(attendanceRate)
    const activeCoeff = attendanceTier.coeff

    // 动态先验场次：√举办场次 × 2
    const priorGames = calculatePriorGames(currentSeasonTotal)

    // ========== 计算各维度原始值 ==========
    
    // 1. 稳定性 - 基于筹码标准差，贝叶斯修正
    const chipsList = playerMatches.map(m => parseFloat(m.result?.chips) || 0)
    const avgChipForStd = chipsList.reduce((a, b) => a + b, 0) / chipsList.length
    let rawChipStdDev = 0
    if (totalGames >= 2) {
      const variance = chipsList.reduce((a, b) => a + Math.pow(b - avgChipForStd, 2), 0) / chipsList.length
      rawChipStdDev = Math.sqrt(variance)
    }
    // 贝叶斯修正：场次少的人向联盟平均靠拢
    const leagueAvgChipStdDev = leagueStats?.leagueAvgChipStdDev || 800
    const adjustedChipStdDev = (rawChipStdDev * totalGames + leagueAvgChipStdDev * priorGames) / (totalGames + priorGames)
    // 稳定性得分：标准差越小得分越高（反向归一化）
    const rawStability = Math.max(0, Math.min(100, (1 - adjustedChipStdDev / 1500) * 100))

    // 2. 效率 - 贝叶斯修正后的场均得分
    const totalScore = playerMatches.reduce((a, b) => a + b.result.score, 0)
    const avgPlayers = playerMatches.reduce((a, b) => a + b.totalPlayers, 0) / totalGames
    const priorScore = calculatePriorScore(avgPlayers || 7, priorGames)
    const adjustedAvgScore = (totalScore + priorScore) / (totalGames + priorGames)

    // 3. 掠夺 - 贝叶斯修正后的场均筹码
    const avgChips = player.totalChips / totalGames
    const leagueAvgChips = leagueStats?.leagueAvgChips || 0
    const adjustedPlunder = (avgChips * totalGames + leagueAvgChips * priorGames) / (totalGames + priorGames)

    // 4. 击败 - 贝叶斯修正后的击败率
    const beatRates = playerMatches.map(m => {
      if (m.totalPlayers <= 1) return 0
      return (m.totalPlayers - m.result.rank) / (m.totalPlayers - 1)
    })
    const avgBeatRate = beatRates.reduce((a, b) => a + b, 0) / beatRates.length
    const leagueAvgBeatRate = leagueStats?.leagueAvgBeatRate || 0.5
    const adjustedBeatRate = (avgBeatRate * totalGames + leagueAvgBeatRate * priorGames) / (totalGames + priorGames)

    // 5. 胜场 - 贝叶斯修正后的赢码率
    const chipWins = playerMatches.filter(m => (parseFloat(m.result?.chips) || 0) > 0).length
    const leagueAvgChipWinRate = leagueStats?.leagueAvgChipWinRate || 0.33
    const priorChipWins = priorGames * leagueAvgChipWinRate
    const adjustedChipWinRate = (chipWins + priorChipWins) / (totalGames + priorGames)

    // 6. 统治 - 贝叶斯修正后的胜率
    const wins = playerMatches.filter(m => m.result?.rank === 1).length
    const leagueAvgWinRate = leagueStats?.leagueAvgWinRate || 0.1
    const priorWins = priorGames * leagueAvgWinRate
    const adjustedWinRate = (wins + priorWins) / (totalGames + priorGames)

    // 7. MVP - 贝叶斯修正后的MVP率
    const mvpCount = playerMatches.filter(m => m.votedMvp === m.result?.name).length
    const leagueAvgMvpRate = leagueStats?.leagueAvgMvpRate || 0.1
    const priorMvps = priorGames * leagueAvgMvpRate
    const adjustedMvpRate = (mvpCount + priorMvps) / (totalGames + priorGames)

    // ========== 原始值 → 贝叶斯修正 → 打折 → 归一化 → 最终分数 ==========
    
    const normalize = (value, min, max) => {
      const range = max - min
      if (range <= 0) return 50
      return Math.max(0, Math.min(100, ((value - min) / range) * 100))
    }

    // 贝叶斯修正后打折
    const discountedEfficiency = adjustedAvgScore * activeCoeff
    const discountedPlunder = adjustedPlunder * activeCoeff
    const discountedBeatRate = adjustedBeatRate * activeCoeff
    const discountedChipWinRate = adjustedChipWinRate * activeCoeff
    const discountedWinRate = adjustedWinRate * activeCoeff
    const discountedMvpRate = adjustedMvpRate * activeCoeff

    // 归一化（使用打折后的联盟极值）
    const efficiencyScore = normalize(
      discountedEfficiency,
      leagueStats?.minDiscountedEfficiency || 0,
      leagueStats?.maxDiscountedEfficiency || discountedEfficiency
    )
    const plunderScore = normalize(
      discountedPlunder,
      leagueStats?.minDiscountedPlunder || 0,
      leagueStats?.maxDiscountedPlunder || discountedPlunder
    )
    const defeatScore = normalize(
      discountedBeatRate,
      leagueStats?.minDiscountedBeatRate || 0,
      leagueStats?.maxDiscountedBeatRate || discountedBeatRate
    )
    const chipWinScore = normalize(
      discountedChipWinRate,
      leagueStats?.minDiscountedChipWinRate || 0,
      leagueStats?.maxDiscountedChipWinRate || discountedChipWinRate
    )
    const dominationScore = normalize(
      discountedWinRate,
      leagueStats?.minDiscountedWinRate || 0,
      leagueStats?.maxDiscountedWinRate || discountedWinRate
    )
    const mvpScore = normalize(
      discountedMvpRate,
      leagueStats?.minDiscountedMvpRate || 0,
      leagueStats?.maxDiscountedMvpRate || discountedMvpRate
    )

    // 稳定性不打折，但也需要归一化
    const stabilityScore = normalize(
      rawStability,
      leagueStats?.minStability || 0,
      leagueStats?.maxStability || rawStability
    )

    // 计算综合战力（归一化后的维度加权求和）
    const finalPowerScore = 
      dominationScore * POWER_WEIGHTS.domination +
      defeatScore * POWER_WEIGHTS.knockout +
      efficiencyScore * POWER_WEIGHTS.efficiency +
      chipWinScore * POWER_WEIGHTS.chipWin +
      plunderScore * POWER_WEIGHTS.plunder +
      stabilityScore * POWER_WEIGHTS.stability +
      mvpScore * POWER_WEIGHTS.mvp

    // 构建雷达图数据，顺序：统治 → 效率 → 掠夺 → 胜场 → 击败 → MVP → 稳定
    // value: 打折后归一化的值（用于进度条和雷达图）
    // raw: 贝叶斯修正后的值（用于右上角显示）
    const stats = [
      {
        label: '统治',
        value: dominationScore,
        raw: `${(adjustedWinRate * 100).toFixed(0)}%`,
        description: RADAR_LABELS[0].description,
        zh: RADAR_LABELS[0].zh
      },
      {
        label: '效率',
        value: efficiencyScore,
        raw: `${adjustedAvgScore.toFixed(1)}`,
        description: RADAR_LABELS[1].description,
        zh: RADAR_LABELS[1].zh
      },
      {
        label: '掠夺',
        value: plunderScore,
        raw: `${Math.round(adjustedPlunder)}`,
        description: RADAR_LABELS[2].description,
        zh: RADAR_LABELS[2].zh
      },
      {
        label: '胜场',
        value: chipWinScore,
        raw: `${(adjustedChipWinRate * 100).toFixed(0)}%`,
        description: RADAR_LABELS[3].description,
        zh: RADAR_LABELS[3].zh
      },
      {
        label: '击败',
        value: defeatScore,
        raw: `${(adjustedBeatRate * 100).toFixed(0)}%`,
        description: RADAR_LABELS[4].description,
        zh: RADAR_LABELS[4].zh
      },
      {
        label: 'MVP',
        value: mvpScore,
        raw: `${(adjustedMvpRate * 100).toFixed(0)}%`,
        description: RADAR_LABELS[5].description,
        zh: RADAR_LABELS[5].zh
      },
      {
        label: '稳定',
        value: stabilityScore,
        raw: `σ=${Math.round(adjustedChipStdDev)}`,
        description: RADAR_LABELS[6].description,
        zh: RADAR_LABELS[6].zh
      }
    ]

    return { radarStats: stats, powerScore: finalPowerScore }
  }, [player, playerMatches, totalGames, leagueStats, seasonTotalGames])

  return { radarStats, powerScore }
}

export default useRadarStats
