// src/hooks/useLeagueStats.js
import { useMemo } from 'react';
import { BASE_SCORES, ATTENDANCE_TIERS } from '../constants';

/**
 * 计算动态先验场次
 * 公式：√举办场次 × 3
 * 
 * @param {number} seasonTotalGames - 赛季举办场次
 * @returns {number} 先验场次
 */
function calculatePriorGames(seasonTotalGames) {
  return Math.sqrt(seasonTotalGames) * 3
}

/**
 * 计算动态先验得分（用于贝叶斯修正）
 * @param {number} avgPlayers - 平均参赛人数
 * @param {number} priorGames - 先验场次
 * @returns {number} 先验得分
 */
function calculatePriorScore(avgPlayers, priorGames) {
  const medianRank = Math.floor(avgPlayers / 2);
  const rankIndex = Math.max(0, Math.min(medianRank - 1, BASE_SCORES.length - 1));
  const priorScorePerGame = BASE_SCORES[rankIndex] * (avgPlayers / 10);
  return priorScorePerGame * priorGames;
}

/**
 * 根据出勤率获取活跃度系数（8档）
 * @param {number} attendanceRate - 出勤率 (0-1)
 * @returns {number} 活跃度系数
 */
function getActiveCoeff(attendanceRate) {
  for (const tier of ATTENDANCE_TIERS) {
    if (attendanceRate >= tier.minRate) {
      return tier.coeff
    }
  }
  return ATTENDANCE_TIERS[ATTENDANCE_TIERS.length - 1].coeff
}

/**
 * 计算联盟统计极值
 * 用于归一化玩家数据，计算五维评分
 * 
 * @param {import('../types').Match[]} matchHistory - 比赛历史
 * @returns {import('../types').LeagueStats} 联盟极值统计
 */
function useLeagueStats(matchHistory) {
  return useMemo(() => {
    let maxAvgScore = 0;
    let maxGoldContent = 0;
    let maxAvgChips = 0;
    let minAvgChips = Infinity;
    let maxAvgBeatRate = 0;
    // 贝叶斯修正后场均得分的极值
    let maxAdjustedAvgScore = 0;
    let minAdjustedAvgScore = Infinity;
    // 贝叶斯修正后赢码指数的极值
    let maxAdjustedChipWinRate = 0;
    let minAdjustedChipWinRate = Infinity;
    // 调整后胜率的极值（用于统治指数）
    let maxAdjWinRate = 0;
    let minAdjWinRate = Infinity;

    // 临时统计每个玩家的数据
    const tempStats = {};
    // 统计赛季总赢码场次和总场次（用于计算平均赢码率）
    let totalChipWins = 0;
    let totalGamesAll = 0;
    // 统计总胜场数（用于计算平均胜率）
    let totalWins = 0;
    // 统计总MVP次数（用于计算平均MVP率）
    let totalMvps = 0;

    matchHistory.forEach(match => {
      match.results.forEach(res => {
        if (!tempStats[res.name]) {
          tempStats[res.name] = {
            score: 0,
            chips: 0,
            games: 0,
            sumBeatRate: 0,
            sumPlayers: 0,  // 累计参赛人数，用于计算平均
            chipWins: 0,    // 筹码为正的场次
            wins: 0,        // 第1名次数（用于统治指数）
            mvps: 0,        // MVP次数
            ranks: [],      // 排名数组
            chipsList: []   // 每场筹码数组（用于计算筹码标准差）
          };
        }

        const player = tempStats[res.name];
        player.score += res.score;
        player.chips += parseFloat(res.chips) || 0;
        player.games += 1;
        player.sumPlayers += match.totalPlayers;
        totalGamesAll += 1;

        // 统计筹码为正的场次
        if ((parseFloat(res.chips) || 0) > 0) {
          player.chipWins += 1;
          totalChipWins += 1;
        }

        // 统计第1名次数
        if (res.rank === 1) {
          player.wins += 1;
          totalWins += 1;
        }

        // 统计MVP次数（MVP 存储在 match.votedMvp，是玩家名字）
        if (match.votedMvp === res.name) {
          player.mvps += 1;
          totalMvps += 1;
        }

        // 计算击败率
        const beatRate = match.totalPlayers > 1
          ? (match.totalPlayers - res.rank) / (match.totalPlayers - 1)
          : 0;
        player.sumBeatRate += beatRate;
        
        // 收集排名（用于计算稳定性）
        player.ranks.push(res.rank);
        // 收集每场筹码（用于计算筹码标准差）
        player.chipsList.push(parseFloat(res.chips) || 0);
      });
    });

    // 计算赛季平均赢码率（用于动态先验）
    const leagueAvgChipWinRate = totalGamesAll > 0 ? totalChipWins / totalGamesAll : 0.33;
    // 动态先验场次：√举办场次 × 2
    const priorGames = calculatePriorGames(matchHistory.length);
    const priorChipWins = priorGames * leagueAvgChipWinRate;

    // 计算赛季平均胜率（用于统治指数动态先验）
    const leagueAvgWinRate = totalGamesAll > 0 ? totalWins / totalGamesAll : 0.1;
    // 先验胜场数 = priorGames × 平均胜率
    const priorWins = priorGames * leagueAvgWinRate;

    // 计算赛季平均击败率（用于击败指数动态先验）
    let totalBeatRate = 0;
    Object.values(tempStats).forEach(p => {
      totalBeatRate += p.sumBeatRate;
    });
    const leagueAvgBeatRate = totalGamesAll > 0 ? totalBeatRate / totalGamesAll : 0.5;

    // 贝叶斯修正后击败率的极值
    let maxAdjustedBeatRate = 0;
    let minAdjustedBeatRate = Infinity;

    // 计算赛季平均MVP率（用于MVP指数动态先验）
    const leagueAvgMvpRate = totalGamesAll > 0 ? totalMvps / totalGamesAll : 0.1;

    // 计算赛季平均场均筹码（用于掠夺指数动态先验）
    const totalChips = Object.values(tempStats).reduce((sum, p) => sum + p.chips, 0);
    const leagueAvgChips = totalGamesAll > 0 ? totalChips / totalGamesAll : 0;

    // 计算联盟平均筹码标准差（用于稳定性贝叶斯修正）
    let totalChipStdDev = 0;
    let playerCountForStdDev = 0;
    Object.values(tempStats).forEach(p => {
      if (p.games >= 2) {  // 至少2场才能计算标准差
        const avgChip = p.chips / p.games;
        const variance = p.chipsList.reduce((sum, c) => sum + Math.pow(c - avgChip, 2), 0) / p.games;
        const stdDev = Math.sqrt(variance);
        totalChipStdDev += stdDev;
        playerCountForStdDev += 1;
      }
    });
    const leagueAvgChipStdDev = playerCountForStdDev > 0 ? totalChipStdDev / playerCountForStdDev : 800;

    // 贝叶斯修正后MVP率的极值
    let maxAdjustedMvpRate = 0;
    let minAdjustedMvpRate = Infinity;

    // 贝叶斯修正后打折的极值（用于归一化）
    let maxDiscountedEfficiency = -Infinity;
    let minDiscountedEfficiency = Infinity;
    let maxDiscountedPlunder = -Infinity;
    let minDiscountedPlunder = Infinity;
    let maxDiscountedBeatRate = -Infinity;
    let minDiscountedBeatRate = Infinity;
    let maxDiscountedChipWinRate = -Infinity;
    let minDiscountedChipWinRate = Infinity;
    let maxDiscountedWinRate = -Infinity;
    let minDiscountedWinRate = Infinity;
    let maxDiscountedMvpRate = -Infinity;
    let minDiscountedMvpRate = Infinity;
    // 稳定性不打折，使用原始极值
    let maxStability = 0;
    let minStability = Infinity;

    // 掠夺贝叶斯修正后的极值
    let maxAdjustedPlunder = 0;
    let minAdjustedPlunder = Infinity;

    // 赛季总场次（用于计算活跃度系数）
    const seasonTotalGames = matchHistory.length;

    // 计算极值
    Object.values(tempStats).forEach(p => {
      if (p.games < 1) return;

      const avgScore = p.score / p.games;
      const goldContent = p.score > 0 ? p.chips / p.score : 0;
      const avgChips = p.chips / p.games;
      const avgBeatRate = p.sumBeatRate / p.games;

      // 计算贝叶斯修正后的场均得分
      const avgPlayers = p.sumPlayers / p.games;
      const priorScore = calculatePriorScore(avgPlayers || 7, priorGames);
      const adjustedAvgScore = (p.score + priorScore) / (p.games + priorGames);

      // 计算动态贝叶斯修正后的赢码指数
      const adjustedChipWinRate = (p.chipWins + priorChipWins) / (p.games + priorGames);

      if (avgScore > maxAvgScore) {
        maxAvgScore = avgScore;
      }

      // 含金量只统计场均分 > 3 的玩家
      if (avgScore > 3 && goldContent > maxGoldContent) {
        maxGoldContent = goldContent;
      }

      if (avgChips > maxAvgChips) {
        maxAvgChips = avgChips;
      }

      if (avgChips < minAvgChips) {
        minAvgChips = avgChips;
      }

      if (avgBeatRate > maxAvgBeatRate) {
        maxAvgBeatRate = avgBeatRate;
      }

      // 贝叶斯修正后场均得分极值
      if (adjustedAvgScore > maxAdjustedAvgScore) {
        maxAdjustedAvgScore = adjustedAvgScore;
      }
      if (adjustedAvgScore < minAdjustedAvgScore) {
        minAdjustedAvgScore = adjustedAvgScore;
      }

      // 贝叶斯修正后赢码指数极值
      if (adjustedChipWinRate > maxAdjustedChipWinRate) {
        maxAdjustedChipWinRate = adjustedChipWinRate;
      }
      if (adjustedChipWinRate < minAdjustedChipWinRate) {
        minAdjustedChipWinRate = adjustedChipWinRate;
      }

      // 计算动态贝叶斯修正后的胜率（用于统治指数）
      const adjustedWinRate = (p.wins + priorWins) / (p.games + priorGames);
      if (adjustedWinRate > maxAdjWinRate) {
        maxAdjWinRate = adjustedWinRate;
      }
      if (adjustedWinRate < minAdjWinRate) {
        minAdjWinRate = adjustedWinRate;
      }

      // 计算动态贝叶斯修正后的击败率
      const avgBeatRatePlayer = p.sumBeatRate / p.games;
      const adjustedBeatRate = (avgBeatRatePlayer * p.games + leagueAvgBeatRate * priorGames) / (p.games + priorGames);
      if (adjustedBeatRate > maxAdjustedBeatRate) {
        maxAdjustedBeatRate = adjustedBeatRate;
      }
      if (adjustedBeatRate < minAdjustedBeatRate) {
        minAdjustedBeatRate = adjustedBeatRate;
      }

      // 计算动态贝叶斯修正后的MVP率
      const priorMvps = priorGames * leagueAvgMvpRate;
      const adjustedMvpRate = (p.mvps + priorMvps) / (p.games + priorGames);
      if (adjustedMvpRate > maxAdjustedMvpRate) {
        maxAdjustedMvpRate = adjustedMvpRate;
      }
      if (adjustedMvpRate < minAdjustedMvpRate) {
        minAdjustedMvpRate = adjustedMvpRate;
      }

      // 计算稳定性得分（基于筹码标准差，贝叶斯修正）
      // 筹码标准差越小 = 越稳定
      let rawChipStdDev = 0;
      if (p.games >= 2) {
        const avgChip = p.chips / p.games;
        const variance = p.chipsList.reduce((sum, c) => sum + Math.pow(c - avgChip, 2), 0) / p.games;
        rawChipStdDev = Math.sqrt(variance);
      }
      // 贝叶斯修正：场次少的人向联盟平均靠拢
      const adjustedChipStdDev = (rawChipStdDev * p.games + leagueAvgChipStdDev * priorGames) / (p.games + priorGames);
      // 稳定性得分：标准差越小得分越高（反向归一化）
      // 使用 1000 作为标准差上限参考值
      const stabilityScore = Math.max(0, Math.min(100, (1 - adjustedChipStdDev / 1500) * 100));

      // 计算掠夺的贝叶斯修正值（使用赛季平均场均筹码作为先验）
      const adjustedPlunder = (avgChips * p.games + leagueAvgChips * priorGames) / (p.games + priorGames);

      // 计算活跃度系数（8档）
      const attendanceRate = p.games / Math.max(1, seasonTotalGames);
      const activeCoeff = getActiveCoeff(attendanceRate);

      // 稳定性使用原始值（不打折）
      if (stabilityScore > maxStability) maxStability = stabilityScore;
      if (stabilityScore < minStability) minStability = stabilityScore;
      // 掠夺贝叶斯修正后的极值（用于先验计算参考）
      if (adjustedPlunder > maxAdjustedPlunder) maxAdjustedPlunder = adjustedPlunder;
      if (adjustedPlunder < minAdjustedPlunder) minAdjustedPlunder = adjustedPlunder;

      // 计算贝叶斯修正后打折的值（用于归一化极值）
      const discountedEfficiency = adjustedAvgScore * activeCoeff;
      const discountedPlunder = adjustedPlunder * activeCoeff;
      const discountedBeatRate = adjustedBeatRate * activeCoeff;
      const discountedChipWinRate = adjustedChipWinRate * activeCoeff;
      const discountedWinRate = adjustedWinRate * activeCoeff;
      const discountedMvpRate = adjustedMvpRate * activeCoeff;

      // 更新打折后的极值
      if (discountedEfficiency > maxDiscountedEfficiency) maxDiscountedEfficiency = discountedEfficiency;
      if (discountedEfficiency < minDiscountedEfficiency) minDiscountedEfficiency = discountedEfficiency;
      if (discountedPlunder > maxDiscountedPlunder) maxDiscountedPlunder = discountedPlunder;
      if (discountedPlunder < minDiscountedPlunder) minDiscountedPlunder = discountedPlunder;
      if (discountedBeatRate > maxDiscountedBeatRate) maxDiscountedBeatRate = discountedBeatRate;
      if (discountedBeatRate < minDiscountedBeatRate) minDiscountedBeatRate = discountedBeatRate;
      if (discountedChipWinRate > maxDiscountedChipWinRate) maxDiscountedChipWinRate = discountedChipWinRate;
      if (discountedChipWinRate < minDiscountedChipWinRate) minDiscountedChipWinRate = discountedChipWinRate;
      if (discountedWinRate > maxDiscountedWinRate) maxDiscountedWinRate = discountedWinRate;
      if (discountedWinRate < minDiscountedWinRate) minDiscountedWinRate = discountedWinRate;
      if (discountedMvpRate > maxDiscountedMvpRate) maxDiscountedMvpRate = discountedMvpRate;
      if (discountedMvpRate < minDiscountedMvpRate) minDiscountedMvpRate = discountedMvpRate;
    });

    // 处理边界情况
    if (minAvgChips === Infinity) {
      minAvgChips = 0;
    }
    if (minAdjustedAvgScore === Infinity) {
      minAdjustedAvgScore = 0;
    }
    if (minAdjustedChipWinRate === Infinity) {
      minAdjustedChipWinRate = 0;
    }
    if (minAdjWinRate === Infinity) {
      minAdjWinRate = 0;
    }
    if (minAdjustedBeatRate === Infinity) {
      minAdjustedBeatRate = 0;
    }
    if (minAdjustedMvpRate === Infinity) {
      minAdjustedMvpRate = 0;
    }

    // 稳定性极值边界处理
    if (minStability === Infinity) minStability = 0;
    // 掠夺贝叶斯修正极值边界处理
    if (minAdjustedPlunder === Infinity) minAdjustedPlunder = 0;

    // 打折后极值边界处理
    if (minDiscountedEfficiency === Infinity) minDiscountedEfficiency = 0;
    if (maxDiscountedEfficiency === -Infinity) maxDiscountedEfficiency = 0;
    if (minDiscountedPlunder === Infinity) minDiscountedPlunder = 0;
    if (maxDiscountedPlunder === -Infinity) maxDiscountedPlunder = 0;
    if (minDiscountedBeatRate === Infinity) minDiscountedBeatRate = 0;
    if (maxDiscountedBeatRate === -Infinity) maxDiscountedBeatRate = 0;
    if (minDiscountedChipWinRate === Infinity) minDiscountedChipWinRate = 0;
    if (maxDiscountedChipWinRate === -Infinity) maxDiscountedChipWinRate = 0;
    if (minDiscountedWinRate === Infinity) minDiscountedWinRate = 0;
    if (maxDiscountedWinRate === -Infinity) maxDiscountedWinRate = 0;
    if (minDiscountedMvpRate === Infinity) minDiscountedMvpRate = 0;
    if (maxDiscountedMvpRate === -Infinity) maxDiscountedMvpRate = 0;

    return {
      maxAvgScore,
      maxGoldContent,
      maxAvgChips,
      minAvgChips,
      maxAvgBeatRate,
      // 贝叶斯修正后场均得分极值（用于效率归一化）
      maxAdjustedAvgScore,
      minAdjustedAvgScore,
      // 贝叶斯修正后赢码指数极值（用于胜场归一化）
      maxAdjustedChipWinRate,
      minAdjustedChipWinRate,
      // 赛季平均赢码率（用于动态先验）
      leagueAvgChipWinRate,
      // 贝叶斯修正后胜率极值（用于统治指数归一化）
      maxAdjWinRate,
      minAdjWinRate,
      // 赛季平均胜率（用于动态先验）
      leagueAvgWinRate,
      // 贝叶斯修正后击败率极值（用于击败指数归一化）
      maxAdjustedBeatRate,
      minAdjustedBeatRate,
      // 赛季平均击败率（用于动态先验）
      leagueAvgBeatRate,
      // 贝叶斯修正后MVP率极值（用于MVP指数归一化）
      maxAdjustedMvpRate,
      minAdjustedMvpRate,
      // 赛季平均MVP率（用于动态先验）
      leagueAvgMvpRate,
      // 赛季平均场均筹码（用于掠夺动态先验）
      leagueAvgChips,
      // 联盟平均筹码标准差（用于稳定性贝叶斯修正）
      leagueAvgChipStdDev,
      // 赛季总场次
      totalMatches: matchHistory.length,
      // 贝叶斯修正后打折的极值（用于归一化）
      maxDiscountedEfficiency,
      minDiscountedEfficiency,
      maxDiscountedPlunder,
      minDiscountedPlunder,
      maxDiscountedBeatRate,
      minDiscountedBeatRate,
      maxDiscountedChipWinRate,
      minDiscountedChipWinRate,
      maxDiscountedWinRate,
      minDiscountedWinRate,
      maxDiscountedMvpRate,
      minDiscountedMvpRate,
      // 稳定性原始极值（不打折）
      maxStability,
      minStability,
      // 掠夺贝叶斯修正后的极值
      maxAdjustedPlunder,
      minAdjustedPlunder
    };
  }, [matchHistory]);
}

export default useLeagueStats;
