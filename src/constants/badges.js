// src/constants/badges.js
// 徽章定义配置 - 声明式徽章系统

import { BADGE_CONFIG, GAMES_PER_SEASON, ATTENDANCE_TIERS } from './index'
import { compareByEntryOrder } from '../lib/utils'

/**
 * 徽章定义
 * 每个徽章包含：id、name、icon、colorKey、description、condition 函数
 * condition 函数接收 context 对象，返回 { earned, count?, detail? }
 */
export const BADGE_DEFINITIONS = [
  // === 赛季出勤勋章（统一处理所有出勤等级） ===
  {
    id: 'season-attendance',
    name: '出勤勋章',
    icon: 'calendar',
    colorKey: 'blue',
    description: '根据赛季出勤率获得的称号',
    isSeasonBadge: true,
    condition: (context, seasonKey, matches) => {
      // 计算该赛季的出勤率
      const myMatchesInSeason = matches.filter(m =>
        m.results.some(r => r.name === context.player.name)
      ).length
      const totalMatchesInSeason = matches.length

      if (totalMatchesInSeason === 0 || myMatchesInSeason === 0) return { earned: false }

      const attendanceRate = myMatchesInSeason / totalMatchesInSeason

      // 找到对应的出勤等级
      let tier = ATTENDANCE_TIERS[ATTENDANCE_TIERS.length - 1]
      for (const t of ATTENDANCE_TIERS) {
        if (attendanceRate >= t.minRate) {
          tier = t
          break
        }
      }

      // 只有达到"常客"及以上才显示勋章（出勤率≥55%）
      if (attendanceRate >= 0.55) {
        return {
          earned: true,
          detail: `${seasonKey} ${tier.name} (${myMatchesInSeason}/${totalMatchesInSeason}场，${(attendanceRate * 100).toFixed(0)}%出勤)`,
          // 动态覆盖徽章属性，名称不带赛季前缀（useBadges会自动加）
          overrideName: tier.name,
          overrideIcon: tier.icon,
          overrideColorKey: tier.colorKey
        }
      }
      return { earned: false }
    }
  },
  {
    id: 'season-gold',
    name: '金筹码',
    icon: 'trophy',
    colorKey: 'gold',
    description: '赛季总筹码冠军',
    isSeasonBadge: true,
    condition: (context, seasonKey, matches) => {
      const seasonChipsMap = {}
      matches.forEach(m => {
        m.results.forEach(r => {
          if (!seasonChipsMap[r.name]) seasonChipsMap[r.name] = 0
          seasonChipsMap[r.name] += parseFloat(r.chips)
        })
      })
      const sorted = Object.entries(seasonChipsMap).sort(([, a], [, b]) => b - a)
      const myRank = sorted.findIndex(([name]) => name === context.player.name)
      if (myRank === 0) {
        return { earned: true, detail: `${seasonKey} 赛季总筹码冠军` }
      }
      return { earned: false }
    }
  },
  {
    id: 'season-silver',
    name: '银筹码',
    icon: 'medal',
    colorKey: 'silver',
    description: '赛季总筹码亚军',
    isSeasonBadge: true,
    condition: (context, seasonKey, matches) => {
      const seasonChipsMap = {}
      matches.forEach(m => {
        m.results.forEach(r => {
          if (!seasonChipsMap[r.name]) seasonChipsMap[r.name] = 0
          seasonChipsMap[r.name] += parseFloat(r.chips)
        })
      })
      const sorted = Object.entries(seasonChipsMap).sort(([, a], [, b]) => b - a)
      const myRank = sorted.findIndex(([name]) => name === context.player.name)
      if (myRank === 1) {
        return { earned: true, detail: `${seasonKey} 赛季总筹码亚军` }
      }
      return { earned: false }
    }
  },
  {
    id: 'season-bronze',
    name: '铜筹码',
    icon: 'medal',
    colorKey: 'bronze',
    description: '赛季总筹码季军',
    isSeasonBadge: true,
    condition: (context, seasonKey, matches) => {
      const seasonChipsMap = {}
      matches.forEach(m => {
        m.results.forEach(r => {
          if (!seasonChipsMap[r.name]) seasonChipsMap[r.name] = 0
          seasonChipsMap[r.name] += parseFloat(r.chips)
        })
      })
      const sorted = Object.entries(seasonChipsMap).sort(([, a], [, b]) => b - a)
      const myRank = sorted.findIndex(([name]) => name === context.player.name)
      if (myRank === 2) {
        return { earned: true, detail: `${seasonKey} 赛季总筹码季军` }
      }
      return { earned: false }
    }
  },

  // === 赛季勋章（原生涯勋章，现按赛季计算） ===
  {
    id: 'ruler',
    name: '统治者',
    icon: 'crown',
    colorKey: 'gold',
    description: `赛季胜率超过 ${BADGE_CONFIG.RULER_WIN_RATE * 100}%`,
    isSeasonBadge: true,
    condition: (context, seasonKey, matches) => {
      // 计算该赛季的胜率
      const myMatches = matches.filter(m =>
        m.results.some(r => r.name === context.player.name)
      )
      if (myMatches.length < 3) return { earned: false }

      const wins = myMatches.filter(m => {
        const result = m.results.find(r => r.name === context.player.name)
        return result && result.rank === 1
      }).length
      const winRate = wins / myMatches.length

      if (winRate >= BADGE_CONFIG.RULER_WIN_RATE) {
        return {
          earned: true,
          detail: `${seasonKey} 胜率 ${(winRate * 100).toFixed(1)}% (${wins}/${myMatches.length}场)`
        }
      }
      return { earned: false }
    }
  },
  {
    id: 'charity',
    name: '慈善家',
    icon: 'heart-handshake',
    colorKey: 'emerald',
    description: `单场"贡献"超过 ${BADGE_CONFIG.CHARITY_THRESHOLD} 筹码`,
    isSeasonBadge: true,
    condition: (context, seasonKey, matches) => {
      const count = matches.filter(m => {
        const result = m.results.find(r => r.name === context.player.name)
        return result && parseFloat(result.chips) <= -BADGE_CONFIG.CHARITY_THRESHOLD
      }).length
      if (count > 0) {
        return {
          earned: true,
          count,
          detail: `${seasonKey} ${count} 次单场"贡献"超过 ${BADGE_CONFIG.CHARITY_THRESHOLD} 筹码`
        }
      }
      return { earned: false }
    }
  },
  {
    id: 'nerve-knife',
    name: '神经刀',
    icon: 'zap',
    colorKey: 'orange',
    description: `单场狂揽 ${BADGE_CONFIG.NERVE_KNIFE_LIMIT}+ 筹码`,
    isSeasonBadge: true,
    condition: (context, seasonKey, matches) => {
      const count = matches.filter(m => {
        const result = m.results.find(r => r.name === context.player.name)
        return result && parseFloat(result.chips) >= BADGE_CONFIG.NERVE_KNIFE_LIMIT
      }).length
      if (count > 0) {
        return {
          earned: true,
          count,
          detail: `${seasonKey} ${count} 次单场狂揽 ${BADGE_CONFIG.NERVE_KNIFE_LIMIT}+ 筹码`
        }
      }
      return { earned: false }
    }
  },
  {
    id: 'lucky-star',
    name: '天选之子',
    icon: 'clover',
    colorKey: 'pink',
    description: '赛季运气王次数第一',
    isSeasonBadge: true,
    condition: (context, seasonKey, matches) => {
      // 计算该赛季各玩家的运气王次数
      const luckyCounts = {}
      matches.forEach(m => {
        if (m.luckyPlayer) {
          luckyCounts[m.luckyPlayer] = (luckyCounts[m.luckyPlayer] || 0) + 1
        }
      })
      const myLuckyCount = luckyCounts[context.player.name] || 0
      const maxLucky = Math.max(0, ...Object.values(luckyCounts))

      if (myLuckyCount > 0 && myLuckyCount >= maxLucky) {
        return {
          earned: true,
          detail: `${seasonKey} 运气王 ${myLuckyCount} 次，赛季第一`
        }
      }
      return { earned: false }
    }
  },
  {
    id: 'veteran',
    name: '老兵',
    icon: 'shield',
    colorKey: 'blue',
    description: `赛季参赛场次达到 ${BADGE_CONFIG.VETERAN_GAMES} 场以上`,
    isSeasonBadge: true,
    condition: (context, seasonKey, matches) => {
      const myMatches = matches.filter(m =>
        m.results.some(r => r.name === context.player.name)
      ).length
      if (myMatches >= BADGE_CONFIG.VETERAN_GAMES) {
        return {
          earned: true,
          detail: `${seasonKey} 参赛 ${myMatches} 场`
        }
      }
      return { earned: false }
    }
  },
  {
    id: 'second-place',
    name: '意难平',
    icon: 'divide',
    colorKey: 'slate',
    description: `赛季累计获得 ${BADGE_CONFIG.SECOND_PLACE_COUNT} 次亚军`,
    isSeasonBadge: true,
    condition: (context, seasonKey, matches) => {
      const count = matches.filter(m => {
        const result = m.results.find(r => r.name === context.player.name)
        return result && result.rank === 2
      }).length
      if (count >= BADGE_CONFIG.SECOND_PLACE_COUNT) {
        return {
          earned: true,
          count,
          detail: `${seasonKey} ${count} 次亚军`
        }
      }
      return { earned: false }
    }
  },
  {
    id: 'comeback',
    name: '逆风翻盘',
    icon: 'trending-up',
    colorKey: 'cyan',
    description: `单场买入超 ${BADGE_CONFIG.COMEBACK_BUYIN_THRESHOLD} 仍盈利`,
    isSeasonBadge: true,
    condition: (context, seasonKey, matches) => {
      const count = matches.filter(m => {
        const result = m.results.find(r => r.name === context.player.name)
        if (!result || !m.transactions) return false
        const myBuyIn = m.transactions
          .filter(t => t.buyer === context.player.name)
          .reduce((sum, t) => sum + parseFloat(t.amount), 0)
        return myBuyIn >= BADGE_CONFIG.COMEBACK_BUYIN_THRESHOLD && parseFloat(result.chips) > 0
      }).length
      if (count > 0) {
        return {
          earned: true,
          count,
          detail: `${seasonKey} ${count} 次买入超 ${BADGE_CONFIG.COMEBACK_BUYIN_THRESHOLD} 仍盈利`
        }
      }
      return { earned: false }
    }
  }
]

/**
 * 构建赛季映射
 * @param {Array} history - 比赛历史
 * @returns {Object} 赛季映射 { S1: [...matches], S2: [...matches] }
 */
export function buildSeasonsMap(history) {
  const sortedHistory = [...history].sort(compareByEntryOrder)
  const seasonsMap = {}
  sortedHistory.forEach((match, index) => {
    const seasonNum = Math.ceil((index + 1) / GAMES_PER_SEASON)
    const seasonKey = `S${seasonNum}`
    if (!seasonsMap[seasonKey]) seasonsMap[seasonKey] = []
    seasonsMap[seasonKey].push(match)
  })
  return seasonsMap
}
