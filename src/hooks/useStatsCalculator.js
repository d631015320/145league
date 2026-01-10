// src/hooks/useStatsCalculator.js
import { useMemo } from 'react';
import { GAMES_PER_SEASON } from '../constants';

/**
 * 计算玩家统计数据
 * 支持赛季筛选、五维评分、动态活跃度
 * 
 * @param {import('../types').Match[]} matchHistory - 比赛历史
 * @param {string} selectedSeason - 选中的赛季 ('all' 或 'S1', 'S2', ...)
 * @param {import('../types').LeagueStats} leagueStats - 联盟极值
 * @param {Object.<string, import('../types').PlayerProfile>} playerProfiles - 玩家档案
 * @param {import('../types').SortConfig} sortConfig - 排序配置
 * @returns {import('../types').StatsData} 统计数据
 */
function useStatsCalculator(matchHistory, selectedSeason, leagueStats, playerProfiles, sortConfig) {
  return useMemo(() => {
    const stats = {};
    let maxG = 0;
    const seasonStats = { totalGames: 0, totalPot: 0, activePlayers: 0 };
    let highestSingle = { name: '', score: -Infinity };
    let latestMatch = null;

    // 预处理：按时间正序排列 (Old -> New)
    const sortedHistoryAsc = [...matchHistory].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // 赛季筛选逻辑
    let filteredMatches = [];
    if (selectedSeason === 'all') {
      filteredMatches = sortedHistoryAsc;
    } else {
      const seasonIndex = parseInt(selectedSeason.slice(1)) - 1;
      const start = seasonIndex * GAMES_PER_SEASON;
      const end = start + GAMES_PER_SEASON;
      filteredMatches = sortedHistoryAsc.slice(start, end);
    }

    // 统计基础数据
    seasonStats.totalGames = filteredMatches.length;
    if (seasonStats.totalGames === 0) {
      return {
        leaderboardData: [],
        maxGames: 0,
        seasonStats,
        topPower: [],
        topAvgScore: [],
        highestSingle: { score: 0 },
        latestMatch: null,
        biggestRivalry: null
      };
    }

    latestMatch = filteredMatches[filteredMatches.length - 1];
    const rivalries = {};

    // 遍历比赛累加
    filteredMatches.forEach(match => {
      seasonStats.totalPot += match.results.reduce(
        (sum, r) => sum + (r.score > 0 ? r.score : 0),
        0
      );

      match.results.forEach(r => {
        if (!stats[r.name]) {
          stats[r.name] = {
            name: r.name,
            gamesPlayed: 0,
            totalScore: 0,
            totalChips: 0,
            wins: 0,
            sumPercentile: 0,
            votedMvpCount: 0,
            recentScores: [],
            luckyCount: 0
          };
        }

        const p = stats[r.name];
        p.gamesPlayed += 1;
        p.totalScore += r.score;
        p.totalChips += parseFloat(r.chips);
        if (r.rank === 1) p.wins += 1;
        p.recentScores.push({ date: match.date, score: r.score, rank: r.rank });

        const percentile = match.totalPlayers > 1
          ? (match.totalPlayers - r.rank) / (match.totalPlayers - 1)
          : 0;
        p.sumPercentile += percentile;

        if (r.score > highestSingle.score) {
          highestSingle = { name: r.name, score: r.score, date: match.date };
        }
      });

      seasonStats.activePlayers = Object.keys(stats).length;

      if (match.votedMvp && stats[match.votedMvp]) {
        stats[match.votedMvp].votedMvpCount++;
      }
      if (match.luckyPlayer && stats[match.luckyPlayer]) {
        stats[match.luckyPlayer].luckyCount++;
      }

      // 宿敌统计
      if (match.transactions) {
        match.transactions.forEach(t => {
          if (t.seller === 'Official') return;
          const key = `${t.buyer}-${t.seller}`;
          if (!rivalries[key]) rivalries[key] = 0;
          rivalries[key] += t.amount;
        });
      }
    });

    // 计算战力 (五维 + 动态活跃度)
    const currentSeasonTotal = Math.max(1, filteredMatches.length);

    Object.values(stats).forEach(p => {
      if (p.gamesPlayed > maxG) maxG = p.gamesPlayed;

      const avg = p.gamesPlayed > 0 ? p.totalScore / p.gamesPlayed : 0;
      const avgChips = p.gamesPlayed > 0 ? p.totalChips / p.gamesPlayed : 0;
      const gc = avg > 0 ? avgChips / avg : 0;

      // 五维评分
      const safeMaxAvgScore = leagueStats.maxAvgScore || 1;
      const safeMaxGoldContent = leagueStats.maxGoldContent || 1;
      const normAvgScore = safeMaxAvgScore > 0 ? avg / safeMaxAvgScore : 0;
      const normGoldContent = safeMaxGoldContent > 0 ? gc / safeMaxGoldContent : 0;
      const scoreEfficiency = Math.max(0, Math.min(10, (normAvgScore * 0.6 + normGoldContent * 0.4) * 10));

      const rangeChips = leagueStats.maxAvgChips - leagueStats.minAvgChips;
      const normChips = rangeChips > 0 ? (avgChips - leagueStats.minAvgChips) / rangeChips : 0.5;
      const scorePlunder = Math.max(0, Math.min(10, normChips * 9 + 1));

      const beatRate = p.gamesPlayed > 0 ? p.sumPercentile / p.gamesPlayed : 0;
      const safeMaxBeat = leagueStats.maxAvgBeatRate || 1;
      const normBeat = safeMaxBeat > 0 ? beatRate / safeMaxBeat : 0;
      const scoreDefeat = normBeat * 10;

      let scoreStability = 5;
      if (p.recentScores.length > 1) {
        const meanScore = p.recentScores.reduce((acc, curr) => acc + curr.score, 0) / p.gamesPlayed;
        const variance = p.recentScores.reduce((acc, curr) => acc + Math.pow(curr.score - meanScore, 2), 0) / p.gamesPlayed;
        const stdDev = Math.sqrt(variance);
        scoreStability = Math.max(0, Math.min(10, 10 - stdDev / 2));
      }

      const baseSkill = scoreEfficiency * 3.5 + scorePlunder * 3.0 + scoreDefeat * 1.5 + scoreStability * 1.0;
      const mvpBonus = p.votedMvpCount * 5;
      const rawPower = baseSkill + mvpBonus;

      // 动态活跃度 (5级阶梯)
      let activeCoeff = 1.0;
      const attendanceRate = p.gamesPlayed / currentSeasonTotal;
      if (attendanceRate >= 0.9) activeCoeff = 1.05; // 铁人
      else if (attendanceRate >= 0.7) activeCoeff = 1.0; // 主力
      else if (attendanceRate >= 0.5) activeCoeff = 0.9; // 常客
      else if (attendanceRate >= 0.3) activeCoeff = 0.8; // 试水
      else activeCoeff = 0.5; // 游客

      p.powerScore = rawPower * activeCoeff;
      p.avgScoreNum = avg;
      p.avgScore = avg.toFixed(2);
      p.totalScore = parseFloat(p.totalScore.toFixed(2));
      p.avgChips = avgChips;
      p.goldContent = gc.toFixed(1);
      p.avatar = playerProfiles[p.name]?.avatar;
      p.recentTrend = p.recentScores.slice(-5).map(i => i.score);
    });

    // 排序
    const allData = Object.values(stats);
    const data = [...allData].sort((a, b) => {
      const key = sortConfig.key;
      const valA = key === 'avgScore' ? a.avgScoreNum : a[key];
      const valB = key === 'avgScore' ? b.avgScoreNum : b[key];
      if (sortConfig.direction === 'desc') {
        return valB - valA;
      } else {
        return valA - valB;
      }
    });

    const topPower = [...allData].sort((a, b) => b.powerScore - a.powerScore).slice(0, 5);
    const topAvgScore = [...allData].sort((a, b) => b.avgScoreNum - a.avgScoreNum).slice(0, 3);

    // 宿敌计算
    let biggestRivalry = { loser: '', winner: '', amount: 0 };
    Object.entries(rivalries).forEach(([key, amount]) => {
      if (amount > biggestRivalry.amount) {
        const [l, w] = key.split('-');
        biggestRivalry = { loser: l, winner: w, amount };
      }
    });

    return {
      leaderboardData: data,
      maxGames: maxG,
      seasonStats,
      topPower,
      topAvgScore,
      highestSingle,
      latestMatch,
      biggestRivalry
    };
  }, [matchHistory, selectedSeason, leagueStats, playerProfiles, sortConfig]);
}

export default useStatsCalculator;
