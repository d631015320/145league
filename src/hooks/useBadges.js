// src/hooks/useBadges.js
// 徽章计算 Hook

import { useMemo } from 'react'
import { BADGE_DEFINITIONS, buildSeasonsMap } from '../constants/badges'
import { getBadgeColor } from '../constants/colors'

/**
 * 评估单个徽章条件
 * @param {Object} definition - 徽章定义
 * @param {Object} context - 评估上下文
 * @param {string} seasonKey - 赛季 key（仅赛季徽章使用）
 * @param {Array} seasonMatches - 赛季比赛（仅赛季徽章使用）
 * @returns {Object|null} 徽章对象或 null
 */
function evaluateBadge(definition, context, seasonKey = null, seasonMatches = null) {
  try {
    const result = definition.isSeasonBadge
      ? definition.condition(context, seasonKey, seasonMatches)
      : definition.condition(context)

    if (result.earned) {
      // 构建徽章名称（赛季徽章加前缀，可叠加徽章加次数）
      let name = definition.name
      if (seasonKey) {
        name = `${seasonKey} ${definition.name}`
      } else if (result.count > 1) {
        name = `${definition.name} x${result.count}`
      }

      return {
        id: seasonKey ? `${definition.id}-${seasonKey}` : definition.id,
        name,
        icon: definition.icon,
        color: getBadgeColor(definition.colorKey),
        desc: result.detail || definition.description
      }
    }
    return null
  } catch (error) {
    // 静默跳过，开发环境记录警告
    if (import.meta.env.DEV) {
      console.warn(`徽章 "${definition.id}" 计算失败:`, error)
    }
    return null
  }
}

/**
 * 计算玩家徽章
 * 
 * @param {Object} player - 玩家对象
 * @param {Array} playerMatches - 玩家比赛记录（含 result）
 * @param {number} totalGames - 总比赛场数
 * @param {number} wins - 胜场数
 * @param {number} winRate - 胜率
 * @param {Array} history - 完整比赛历史
 * @returns {Array} 徽章数组
 */
function useBadges(player, playerMatches, totalGames, wins, winRate, history) {
  return useMemo(() => {
    if (!player) return []

    const badges = []
    
    // 构建评估上下文
    const context = {
      player,
      playerMatches,
      totalGames,
      wins,
      winRate,
      history
    }

    // 构建赛季映射
    const seasonsMap = buildSeasonsMap(history)

    // 评估赛季徽章
    const seasonBadges = BADGE_DEFINITIONS.filter(d => d.isSeasonBadge)
    Object.entries(seasonsMap).forEach(([seasonKey, matches]) => {
      seasonBadges.forEach(definition => {
        const badge = evaluateBadge(definition, context, seasonKey, matches)
        if (badge) badges.push(badge)
      })
    })

    // 评估生涯徽章
    const careerBadges = BADGE_DEFINITIONS.filter(d => !d.isSeasonBadge)
    careerBadges.forEach(definition => {
      const badge = evaluateBadge(definition, context)
      if (badge) badges.push(badge)
    })

    return badges
  }, [player, playerMatches, totalGames, wins, winRate, history])
}

export default useBadges

// 导出评估函数供测试使用
export { evaluateBadge }
