// src/hooks/useStatsCalculator.js
import { useMemo } from 'react';
import { GAMES_PER_SEASON } from '../constants';
import { calculatePowerScore, calculatePriorGames, getAttendanceTier } from './useRadarStats';

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
        dimensionTop3: {
          domination: [],
          knockout: [],
          efficiency: [],
          chipWin: [],
          plunder: [],
          stability: [],
          mvp: []
        },
        highestSingle: { score: 0 },
        latestMatch: null,
        biggestRivalry: null
      };
    }

    latestMatch = filteredMatches[filteredMatches.length - 1];
    // 新增：获取最近 2 场比赛
    const recentMatches = filteredMatches.slice(-2).reverse();  // 倒序，最新的在前
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
            luckyCount: 0,
            // 新增：战力计算需要的字段
            ranks: [],
            sumPlayers: 0,
            chipWins: 0,
            sumBeatRate: 0,
            chipsList: [],  // 每场筹码数组（用于计算筹码标准差）
            powerTrendSnapshots: []  // 战力快照历史
          };
        }

        const p = stats[r.name];
        p.gamesPlayed += 1;
        p.totalScore += r.score;
        p.totalChips += parseFloat(r.chips);
        p.chipsList.push(parseFloat(r.chips) || 0);  // 收集每场筹码
        if (r.rank === 1) p.wins += 1;
        p.recentScores.push({ date: match.date, score: r.score, rank: r.rank });

        // 新增：收集战力计算需要的数据
        p.ranks.push(r.rank);
        p.sumPlayers += match.totalPlayers;
        if (parseFloat(r.chips) > 0) p.chipWins += 1;
        // 计算击败率
        const beatRate = match.totalPlayers > 1
          ? (match.totalPlayers - r.rank) / (match.totalPlayers - 1)
          : 0;
        p.sumBeatRate += beatRate;

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

      // === 新增：为本场比赛的所有参与者计算战力快照 ===
      const matchesSoFar = filteredMatches.indexOf(match) + 1

      match.results.forEach(r => {
        const p = stats[r.name]
        if (!p) return

        // 计算截至本场的活跃度系数
        const attendanceRate = p.gamesPlayed / matchesSoFar
        const attendanceTier = getAttendanceTier(attendanceRate)
        const activeCoeff = attendanceTier.coeff

        // 计算截至本场的战力
        const snapshotPower = calculatePowerScore({
          gamesPlayed: p.gamesPlayed,
          totalScore: p.totalScore,
          totalChips: p.totalChips,
          wins: p.wins,
          sumBeatRate: p.sumBeatRate,
          chipWins: p.chipWins,
          mvpCount: p.votedMvpCount,
          sumPlayers: p.sumPlayers,
          ranks: p.ranks,
          chipsList: p.chipsList
        }, leagueStats, activeCoeff, matchesSoFar)

        p.powerTrendSnapshots.push(Math.round(snapshotPower))
      })
    });

    // 计算战力（使用新的统一计算函数 + 动态活跃度系数）
    const currentSeasonTotal = Math.max(1, filteredMatches.length)

    Object.values(stats).forEach(p => {
      if (p.gamesPlayed > maxG) maxG = p.gamesPlayed;

      const avg = p.gamesPlayed > 0 ? p.totalScore / p.gamesPlayed : 0;
      const avgChips = p.gamesPlayed > 0 ? p.totalChips / p.gamesPlayed : 0;
      const gc = avg > 0 ? avgChips / avg : 0;

      // 动态活跃度系数（8档阶梯）- 使用统一的 getAttendanceTier 函数
      const attendanceRate = p.gamesPlayed / currentSeasonTotal
      const attendanceTier = getAttendanceTier(attendanceRate)
      const activeCoeff = attendanceTier.coeff

      // 使用新的战力计算函数（传入活跃度系数和赛季举办场次）
      p.powerScore = calculatePowerScore({
        gamesPlayed: p.gamesPlayed,
        totalScore: p.totalScore,
        totalChips: p.totalChips,
        wins: p.wins,
        sumBeatRate: p.sumBeatRate,
        chipWins: p.chipWins,
        mvpCount: p.votedMvpCount,
        sumPlayers: p.sumPlayers,
        ranks: p.ranks,
        chipsList: p.chipsList  // 传入每场筹码数组
      }, leagueStats, activeCoeff, currentSeasonTotal)

      p.activeCoeff = activeCoeff  // 保存系数便于调试

      p.avgScoreNum = avg;
      p.avgScore = avg.toFixed(2);
      p.totalScore = parseFloat(p.totalScore.toFixed(2));
      p.avgChips = avgChips;
      p.goldContent = gc.toFixed(1);
      p.avatar = playerProfiles[p.name]?.avatar;
      p.recentTrend = p.recentScores.slice(-5).map(i => i.score);
      p.powerTrend = p.powerTrendSnapshots.slice(-5);  // 最近 5 场的战力快照
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

    // ========== 七维度前三名计算（贝叶斯修正 → 归一化 → 活跃系数打折） ==========

    // 动态先验场次：max(3, √举办场次 × 2)
    const priorGames = calculatePriorGames(currentSeasonTotal)

    // 归一化辅助函数：将值映射到 0-100 范围
    const normalize = (value, min, max) => {
      if (max === min) return 50  // 极值相等时返回中间值
      return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
    }

    // 1. 计算每个玩家的七维度贝叶斯修正值
    const playersWithDimensions = allData.map(p => {
      // 贝叶斯修正后的击败率
      const avgBeatRate = p.sumBeatRate / p.gamesPlayed || 0
      const leagueAvgBeatRate = leagueStats?.leagueAvgBeatRate || 0.5
      const adjBeatRate = (avgBeatRate * p.gamesPlayed + leagueAvgBeatRate * priorGames) / (p.gamesPlayed + priorGames)

      // 贝叶斯修正后的胜率
      const winRate = p.wins / p.gamesPlayed || 0
      const leagueAvgWinRate = leagueStats?.leagueAvgWinRate || 0.1
      const adjWinRate = (p.wins + leagueAvgWinRate * priorGames) / (p.gamesPlayed + priorGames)

      // 贝叶斯修正后的赢码率
      const chipWinRate = p.chipWins / p.gamesPlayed || 0
      const leagueAvgChipWinRate = leagueStats?.leagueAvgChipWinRate || 0.33
      const adjChipWinRate = (p.chipWins + leagueAvgChipWinRate * priorGames) / (p.gamesPlayed + priorGames)

      // 贝叶斯修正后的MVP率
      const mvpRate = p.votedMvpCount / p.gamesPlayed || 0
      const leagueAvgMvpRate = leagueStats?.leagueAvgMvpRate || 0.1
      const adjMvpRate = (p.votedMvpCount + leagueAvgMvpRate * priorGames) / (p.gamesPlayed + priorGames)

      // 贝叶斯修正后的场均筹码
      const avgChips = p.totalChips / p.gamesPlayed || 0
      const leagueAvgChips = leagueStats?.leagueAvgChips || 0
      const adjPlunder = (avgChips * p.gamesPlayed + leagueAvgChips * priorGames) / (p.gamesPlayed + priorGames)

      // 稳定性计算（场均筹码/标准差，类似夏普比率）
      let rawStabilityIndex = 0
      if (p.gamesPlayed >= 2) {
        const avgChipForStd = p.totalChips / p.gamesPlayed
        const variance = p.chipsList.reduce((sum, c) => sum + Math.pow(c - avgChipForStd, 2), 0) / p.gamesPlayed
        const stdDev = Math.sqrt(variance)
        // 稳定性指数 = 场均筹码 / max(标准差, 100)，避免除零
        rawStabilityIndex = avgChipForStd / Math.max(stdDev, 100)
      } else {
        // 只打1场，使用场均筹码 / 100 作为稳定性指数
        rawStabilityIndex = (p.totalChips / p.gamesPlayed) / 100
      }
      // 贝叶斯修正：场次少的人向联盟平均靠拢
      const leagueAvgStabilityIndex = leagueStats?.leagueAvgStabilityIndex || 0
      const adjustedStabilityIndex = (rawStabilityIndex * p.gamesPlayed + leagueAvgStabilityIndex * priorGames) / (p.gamesPlayed + priorGames)
      // 稳定性得分：将稳定性指数映射到 0-100
      const stability = Math.max(0, Math.min(100, (adjustedStabilityIndex + 5) * 10))

      return {
        ...p,
        // 七个维度贝叶斯修正后的值
        dimDomination: adjWinRate,      // 统治：修正后胜率
        dimKnockout: adjBeatRate,       // 击败：修正后击败率
        dimEfficiency: p.avgScoreNum,   // 效率：场均得分（已在其他地方修正）
        dimChipWin: adjChipWinRate,     // 胜场：修正后赢码率
        dimPlunder: adjPlunder,         // 掠夺：修正后场均筹码
        dimStability: stability,        // 稳定：稳定性分数
        dimMvp: adjMvpRate              // MVP：修正后MVP率
      }
    })

    // 2. 收集原始值极值
    const rawExtremes = {
      domination: {
        min: Math.min(...playersWithDimensions.map(p => p.dimDomination)),
        max: Math.max(...playersWithDimensions.map(p => p.dimDomination))
      },
      knockout: {
        min: Math.min(...playersWithDimensions.map(p => p.dimKnockout)),
        max: Math.max(...playersWithDimensions.map(p => p.dimKnockout))
      },
      efficiency: {
        min: Math.min(...playersWithDimensions.map(p => p.dimEfficiency)),
        max: Math.max(...playersWithDimensions.map(p => p.dimEfficiency))
      },
      chipWin: {
        min: Math.min(...playersWithDimensions.map(p => p.dimChipWin)),
        max: Math.max(...playersWithDimensions.map(p => p.dimChipWin))
      },
      plunder: {
        min: Math.min(...playersWithDimensions.map(p => p.dimPlunder)),
        max: Math.max(...playersWithDimensions.map(p => p.dimPlunder))
      },
      stability: {
        min: Math.min(...playersWithDimensions.map(p => p.dimStability)),
        max: Math.max(...playersWithDimensions.map(p => p.dimStability))
      },
      mvp: {
        min: Math.min(...playersWithDimensions.map(p => p.dimMvp)),
        max: Math.max(...playersWithDimensions.map(p => p.dimMvp))
      }
    }

    // 3. 第一次归一化 + 活跃系数打折
    const playersWithDiscounted = playersWithDimensions.map(p => {
      // 第一次归一化
      const norm = {
        domination: normalize(p.dimDomination, rawExtremes.domination.min, rawExtremes.domination.max),
        knockout: normalize(p.dimKnockout, rawExtremes.knockout.min, rawExtremes.knockout.max),
        efficiency: normalize(p.dimEfficiency, rawExtremes.efficiency.min, rawExtremes.efficiency.max),
        chipWin: normalize(p.dimChipWin, rawExtremes.chipWin.min, rawExtremes.chipWin.max),
        plunder: normalize(p.dimPlunder, rawExtremes.plunder.min, rawExtremes.plunder.max),
        stability: normalize(p.dimStability, rawExtremes.stability.min, rawExtremes.stability.max),
        mvp: normalize(p.dimMvp, rawExtremes.mvp.min, rawExtremes.mvp.max)
      }

      // 应用活跃系数打折（稳定性不打折）
      return {
        ...p,
        dimDominationDisc: norm.domination * p.activeCoeff,
        dimKnockoutDisc: norm.knockout * p.activeCoeff,
        dimEfficiencyDisc: norm.efficiency * p.activeCoeff,
        dimChipWinDisc: norm.chipWin * p.activeCoeff,
        dimPlunderDisc: norm.plunder * p.activeCoeff,
        dimStabilityDisc: norm.stability,  // 稳定性不打折
        dimMvpDisc: norm.mvp * p.activeCoeff
      }
    })

    // 4. 打折后的值直接作为最终分数（不做第二次归一化）
    const playersWithFinal = playersWithDiscounted.map(p => ({
      ...p,
      dimDominationFinal: p.dimDominationDisc,
      dimKnockoutFinal: p.dimKnockoutDisc,
      dimEfficiencyFinal: p.dimEfficiencyDisc,
      dimChipWinFinal: p.dimChipWinDisc,
      dimPlunderFinal: p.dimPlunderDisc,
      dimStabilityFinal: p.dimStabilityDisc,
      dimMvpFinal: p.dimMvpDisc
    }))

    // 5. 按最终值排序取前三名
    const dimensionTop3 = {
      domination: [...playersWithFinal].sort((a, b) => b.dimDominationFinal - a.dimDominationFinal).slice(0, 3),
      knockout: [...playersWithFinal].sort((a, b) => b.dimKnockoutFinal - a.dimKnockoutFinal).slice(0, 3),
      efficiency: [...playersWithFinal].sort((a, b) => b.dimEfficiencyFinal - a.dimEfficiencyFinal).slice(0, 3),
      chipWin: [...playersWithFinal].sort((a, b) => b.dimChipWinFinal - a.dimChipWinFinal).slice(0, 3),
      plunder: [...playersWithFinal].sort((a, b) => b.dimPlunderFinal - a.dimPlunderFinal).slice(0, 3),
      stability: [...playersWithFinal].sort((a, b) => b.dimStabilityFinal - a.dimStabilityFinal).slice(0, 3),
      mvp: [...playersWithFinal].sort((a, b) => b.dimMvpFinal - a.dimMvpFinal).slice(0, 3)
    }

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
      dimensionTop3,
      highestSingle,
      latestMatch,
      recentMatches,
      biggestRivalry
    };
  }, [matchHistory, selectedSeason, leagueStats, playerProfiles, sortConfig]);
}

export default useStatsCalculator;
