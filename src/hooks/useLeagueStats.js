// src/hooks/useLeagueStats.js
import { useMemo } from 'react';

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

    // 临时统计每个玩家的数据
    const tempStats = {};

    matchHistory.forEach(match => {
      match.results.forEach(res => {
        if (!tempStats[res.name]) {
          tempStats[res.name] = {
            score: 0,
            chips: 0,
            games: 0,
            sumBeatRate: 0
          };
        }

        const player = tempStats[res.name];
        player.score += res.score;
        player.chips += parseFloat(res.chips) || 0;
        player.games += 1;

        // 计算击败率
        const beatRate = match.totalPlayers > 1
          ? (match.totalPlayers - res.rank) / (match.totalPlayers - 1)
          : 0;
        player.sumBeatRate += beatRate;
      });
    });

    // 计算极值
    Object.values(tempStats).forEach(p => {
      if (p.games < 1) return;

      const avgScore = p.score / p.games;
      const goldContent = p.score > 0 ? p.chips / p.score : 0;
      const avgChips = p.chips / p.games;
      const avgBeatRate = p.sumBeatRate / p.games;

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
    });

    // 处理边界情况
    if (minAvgChips === Infinity) {
      minAvgChips = 0;
    }

    return {
      maxAvgScore,
      maxGoldContent,
      maxAvgChips,
      minAvgChips,
      maxAvgBeatRate
    };
  }, [matchHistory]);
}

export default useLeagueStats;
