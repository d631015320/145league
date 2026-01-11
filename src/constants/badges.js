// src/constants/badges.js
// 徽章定义配置 - 声明式徽章系统

import { BADGE_CONFIG, GAMES_PER_SEASON } from './index'

/**
 * 徽章定义
 * 每个徽章包含：id、name、icon、colorKey、description、condition 函数
 * condition 函数接收 context 对象，返回 { earned, count?, detail? }
 */
export const BADGE_DEFINITIONS = [
  // === 赛季徽章（动态生成） ===
  {
    id: 'season-attendance',
    name: '全勤王',
    icon: 'calendar-check',
    colorKey: 'blue',
    description: '赛季保持全勤',
    // 特殊标记：需要按赛季动态生成
    isSeasonBadge: true,
    condition: (context, seasonKey, matches) => {
      const myMatchesInSeason = matches.filter(m => 
        m.results.some(r => r.name === context.player.name)
      ).length
      const totalMatchesInSeason = matches.length
      if (totalMatchesInSeason > 0 && myMatchesInSeason === totalMatchesInSeason) {
        return {
          earned: true,
          detail: `${seasonKey} 赛季保持全勤 (${myMatchesInSeason}/${totalMatchesInSeason})`
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

  // === 生涯徽章 ===
  {
    id: 'ruler',
    name: '统治者',
    icon: 'crown',
    colorKey: 'gold',
    description: `生涯胜率超过 ${BADGE_CONFIG.RULER_WIN_RATE * 100}%`,
    condition: (context) => {
      const { totalGames, winRate } = context
      if (totalGames >= 5 && winRate >= BADGE_CONFIG.RULER_WIN_RATE) {
        return {
          earned: true,
          detail: `生涯胜率 ${(winRate * 100).toFixed(1)}%`
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
    condition: (context) => {
      const count = context.playerMatches.filter(m => 
        m.result.chips <= -BADGE_CONFIG.CHARITY_THRESHOLD
      ).length
      if (count > 0) {
        return {
          earned: true,
          count,
          detail: `累计 ${count} 次单场"贡献"超过 ${BADGE_CONFIG.CHARITY_THRESHOLD} 筹码`
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
    condition: (context) => {
      const count = context.playerMatches.filter(m => 
        m.result.chips >= BADGE_CONFIG.NERVE_KNIFE_LIMIT
      ).length
      if (count > 0) {
        return {
          earned: true,
          count,
          detail: `累计 ${count} 次单场狂揽 ${BADGE_CONFIG.NERVE_KNIFE_LIMIT}+ 筹码`
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
    description: '获得运气王次数全联盟第一',
    condition: (context) => {
      const { player, history } = context
      const luckyCounts = {}
      history.forEach(m => {
        if (m.luckyPlayer) {
          luckyCounts[m.luckyPlayer] = (luckyCounts[m.luckyPlayer] || 0) + 1
        }
      })
      const maxLucky = Math.max(0, ...Object.values(luckyCounts))
      if (player.luckyCount > 0 && player.luckyCount >= maxLucky) {
        return {
          earned: true,
          detail: `获得运气王 ${player.luckyCount} 次，全联盟第一`
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
    description: `参赛场次达到 ${BADGE_CONFIG.VETERAN_GAMES} 场以上`,
    condition: (context) => {
      if (context.totalGames >= BADGE_CONFIG.VETERAN_GAMES) {
        return {
          earned: true,
          detail: `已参赛 ${context.totalGames} 场`
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
    description: `累计获得 ${BADGE_CONFIG.SECOND_PLACE_COUNT} 次亚军`,
    condition: (context) => {
      const count = context.playerMatches.filter(m => m.result.rank === 2).length
      if (count >= BADGE_CONFIG.SECOND_PLACE_COUNT) {
        return {
          earned: true,
          count,
          detail: `累计获得 ${count} 次亚军`
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
    condition: (context) => {
      const count = context.playerMatches.filter(m => {
        if (!m.transactions) return false
        const myBuyIn = m.transactions
          .filter(t => t.buyer === context.player.name)
          .reduce((sum, t) => sum + parseFloat(t.amount), 0)
        return myBuyIn >= BADGE_CONFIG.COMEBACK_BUYIN_THRESHOLD && m.result.chips > 0
      }).length
      if (count > 0) {
        return {
          earned: true,
          count,
          detail: `累计 ${count} 次单场买入超 ${BADGE_CONFIG.COMEBACK_BUYIN_THRESHOLD} 仍盈利`
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
  const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date))
  const seasonsMap = {}
  sortedHistory.forEach((match, index) => {
    const seasonNum = Math.ceil((index + 1) / GAMES_PER_SEASON)
    const seasonKey = `S${seasonNum}`
    if (!seasonsMap[seasonKey]) seasonsMap[seasonKey] = []
    seasonsMap[seasonKey].push(match)
  })
  return seasonsMap
}
