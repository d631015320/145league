// src/types/index.js
// JSDoc 类型定义

/**
 * 比赛记录
 * @typedef {Object} Match
 * @property {string} id - 比赛ID
 * @property {string} date - 比赛日期 (YYYY-MM-DD)
 * @property {number} totalPlayers - 参赛人数
 * @property {PlayerResult[]} results - 比赛结果
 * @property {Transaction[]} [transactions] - 交易记录
 * @property {Object.<string, number>} [finalStacks] - 最终筹码 {玩家名: 筹码数}
 * @property {string[]} [roster] - 参赛名单
 * @property {string} [votedMvp] - MVP
 * @property {string} [luckyPlayer] - 运气王
 */

/**
 * 玩家单场比赛结果
 * @typedef {Object} PlayerResult
 * @property {string} name - 玩家名
 * @property {number} rank - 排名
 * @property {number} score - 积分
 * @property {number} chips - 筹码盈亏
 */

/**
 * 交易记录
 * @typedef {Object} Transaction
 * @property {number} id - 交易ID (时间戳)
 * @property {string} buyer - 买家
 * @property {string} seller - 卖家 ('Official' 表示官方)
 * @property {number} amount - 金额
 * @property {string} time - 时间 (HH:mm)
 */

/**
 * 玩家统计数据
 * @typedef {Object} PlayerStats
 * @property {string} name - 玩家名
 * @property {number} gamesPlayed - 参赛场次
 * @property {number} totalScore - 总积分
 * @property {number} totalChips - 总筹码
 * @property {number} wins - 胜场数
 * @property {number} powerScore - 战力值
 * @property {number} avgScoreNum - 场均分(数值)
 * @property {string} avgScore - 场均分(字符串，保留2位小数)
 * @property {number} avgChips - 场均筹码
 * @property {string} goldContent - 含金量(字符串，保留1位小数)
 * @property {number} votedMvpCount - MVP次数
 * @property {number} luckyCount - 运气王次数
 * @property {number[]} recentTrend - 近期趋势(最近5场得分)
 * @property {number} sumPercentile - 累计击败率
 * @property {ScoreRecord[]} recentScores - 近期得分记录
 * @property {string} [avatar] - 头像URL或Base64
 */

/**
 * 得分记录
 * @typedef {Object} ScoreRecord
 * @property {string} date - 日期
 * @property {number} score - 得分
 * @property {number} rank - 排名
 */

/**
 * 联盟统计极值
 * @typedef {Object} LeagueStats
 * @property {number} maxAvgScore - 最高场均分
 * @property {number} maxGoldContent - 最高含金量
 * @property {number} maxAvgChips - 最高场均筹码
 * @property {number} minAvgChips - 最低场均筹码
 * @property {number} maxAvgBeatRate - 最高平均击败率
 */

/**
 * 排序配置
 * @typedef {Object} SortConfig
 * @property {string} key - 排序字段
 * @property {'asc'|'desc'} direction - 排序方向
 */

/**
 * 赛季统计
 * @typedef {Object} SeasonStats
 * @property {number} totalGames - 总场次
 * @property {number} totalPot - 总奖池
 * @property {number} activePlayers - 活跃玩家数
 */

/**
 * 统计数据汇总
 * @typedef {Object} StatsData
 * @property {PlayerStats[]} leaderboardData - 排行榜数据
 * @property {number} maxGames - 最大参赛场次
 * @property {SeasonStats} seasonStats - 赛季统计
 * @property {PlayerStats[]} topPower - 战力榜前5
 * @property {PlayerStats[]} topAvgScore - 场均分前3
 * @property {{name: string, score: number, date?: string}} highestSingle - 单场最高分
 * @property {Match|null} latestMatch - 最新比赛
 * @property {{loser: string, winner: string, amount: number}|null} biggestRivalry - 最大宿敌
 */

/**
 * 玩家档案
 * @typedef {Object} PlayerProfile
 * @property {string} [avatar] - 头像 (Base64 或 URL)
 * @property {string} [realName] - 真名
 */

/**
 * 结算交易
 * @typedef {Object} Settlement
 * @property {string} from - 付款方
 * @property {string} to - 收款方
 * @property {number} amount - 金额
 */

/**
 * 勋章
 * @typedef {Object} Badge
 * @property {string} icon - 图标名称
 * @property {string} name - 勋章名称
 * @property {string} color - 颜色类名
 * @property {string} desc - 描述
 */

// 导出空对象以便其他文件可以导入类型
export {};
