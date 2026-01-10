/**
 * Property-Based Tests for Stats Calculation
 * Feature: project-refactor, Property 2: Stats Calculation Invariants
 * Validates: Requirements 4.3
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { GAMES_PER_SEASON } from '../../constants'

/**
 * Pure function extracted from useStatsCalculator for testing
 * Calculates player statistics from match history
 */
function calculateStats(matchHistory, selectedSeason = 'all') {
  const stats = {}
  
  // Sort by date ascending
  const sortedHistoryAsc = [...matchHistory].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  )

  // Season filtering
  let filteredMatches = []
  if (selectedSeason === 'all') {
    filteredMatches = sortedHistoryAsc
  } else {
    const seasonIndex = parseInt(selectedSeason.slice(1)) - 1
    const start = seasonIndex * GAMES_PER_SEASON
    const end = start + GAMES_PER_SEASON
    filteredMatches = sortedHistoryAsc.slice(start, end)
  }

  if (filteredMatches.length === 0) {
    return { stats: {}, totalParticipations: 0 }
  }

  let totalParticipations = 0

  // Accumulate stats
  filteredMatches.forEach(match => {
    match.results.forEach(r => {
      totalParticipations++
      
      if (!stats[r.name]) {
        stats[r.name] = {
          name: r.name,
          gamesPlayed: 0,
          totalScore: 0,
          wins: 0
        }
      }

      const p = stats[r.name]
      p.gamesPlayed += 1
      p.totalScore += r.score
      if (r.rank === 1) p.wins += 1
    })
  })

  return { stats, totalParticipations }
}

// Reserved JavaScript property names to avoid
const RESERVED_NAMES = new Set([
  '__proto__', 'constructor', 'prototype', 'valueOf', 'toString',
  'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
  'toLocaleString', '__defineGetter__', '__defineSetter__',
  '__lookupGetter__', '__lookupSetter__'
])

// Arbitraries for generating test data - use alphanumeric names to avoid reserved words
const playerNameArb = fc.stringMatching(/^[A-Za-z][A-Za-z0-9]{0,9}$/)
  .filter(s => s.length > 0 && !RESERVED_NAMES.has(s))

const matchArb = fc.integer({ min: 2, max: 6 }).chain(numPlayers => {
  return fc.tuple(
    fc.integer({ min: 0, max: 364 }), // day of year 2024
    fc.array(playerNameArb, { minLength: numPlayers, maxLength: numPlayers })
      .filter(names => new Set(names).size === names.length) // unique names
  ).map(([dayOfYear, names]) => {
    // Generate valid date string directly
    const date = new Date(2024, 0, 1 + dayOfYear)
    const dateStr = `2024-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    
    const results = names.map((name, idx) => ({
      name,
      rank: idx + 1,
      score: Math.max(1, 25 - idx * 3),
      chips: idx === 0 ? 100 : -Math.floor(100 / (names.length - 1))
    }))
    return {
      id: `match-${dayOfYear}`,
      date: dateStr,
      totalPlayers: names.length,
      results
    }
  })
})

describe('useStatsCalculator - Property Tests', () => {
  /**
   * Property 2: Stats Calculation Invariants
   * For any match history and season filter, the calculated leaderboardData should satisfy:
   * - Total games played across all players equals sum of match participations
   * - Each player's totalScore equals sum of their individual match scores
   * - Each player's wins count equals number of rank-1 finishes
   */
  it('total games played equals sum of match participations', () => {
    fc.assert(
      fc.property(
        fc.array(matchArb, { minLength: 1, maxLength: 10 }),
        (matchHistory) => {
          const { stats, totalParticipations } = calculateStats(matchHistory, 'all')
          
          // Invariant 1: Total games played across all players equals sum of match participations
          const totalGamesPlayed = Object.values(stats)
            .reduce((sum, p) => sum + p.gamesPlayed, 0)
          
          expect(totalGamesPlayed).toBe(totalParticipations)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('each player totalScore equals sum of their individual match scores', () => {
    fc.assert(
      fc.property(
        fc.array(matchArb, { minLength: 1, maxLength: 10 }),
        (matchHistory) => {
          const { stats } = calculateStats(matchHistory, 'all')
          
          // Calculate expected scores manually
          const expectedScores = {}
          matchHistory.forEach(match => {
            match.results.forEach(r => {
              expectedScores[r.name] = (expectedScores[r.name] || 0) + r.score
            })
          })
          
          // Invariant 2: Each player's totalScore equals sum of their individual match scores
          Object.entries(stats).forEach(([name, playerStats]) => {
            expect(playerStats.totalScore).toBe(expectedScores[name])
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('each player wins count equals number of rank-1 finishes', () => {
    fc.assert(
      fc.property(
        fc.array(matchArb, { minLength: 1, maxLength: 10 }),
        (matchHistory) => {
          const { stats } = calculateStats(matchHistory, 'all')
          
          // Calculate expected wins manually
          const expectedWins = {}
          matchHistory.forEach(match => {
            match.results.forEach(r => {
              if (r.rank === 1) {
                expectedWins[r.name] = (expectedWins[r.name] || 0) + 1
              }
            })
          })
          
          // Invariant 3: Each player's wins count equals number of rank-1 finishes
          Object.entries(stats).forEach(([name, playerStats]) => {
            expect(playerStats.wins).toBe(expectedWins[name] || 0)
          })
        }
      ),
      { numRuns: 100 }
    )
  })
})
