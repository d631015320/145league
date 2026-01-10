/**
 * Property-Based Tests for Settlement Calculation
 * Feature: project-refactor, Property 1: Settlement Calculation Round-Trip
 * Validates: Requirements 4.2
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { calculateSettlements } from '../../lib/utils'

describe('calculateSettlements - Property Tests', () => {
  /**
   * Property 1: Settlement Calculation Round-Trip
   * For any set of player results where total chips sum to zero,
   * calculating settlements and then applying those settlements
   * should result in all players having zero balance.
   */
  it('should produce settlements that balance to zero', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
            chips: fc.integer({ min: -10000, max: 10000 })
          }),
          { minLength: 2, maxLength: 10 }
        ).filter(arr => {
          // Ensure unique names
          const names = arr.map(r => r.name)
          return new Set(names).size === names.length
        }),
        (results) => {
          // Normalize to sum to zero (zero-sum game)
          const total = results.reduce((sum, r) => sum + r.chips, 0)
          if (results.length > 0 && total !== 0) {
            results[0].chips -= total
          }

          const settlements = calculateSettlements(results)

          // Property 1: All settlement amounts should be positive
          settlements.forEach(s => {
            expect(s.amount).toBeGreaterThan(0)
          })

          // Property 2: No self-transfers
          settlements.forEach(s => {
            expect(s.from).not.toBe(s.to)
          })

          // Property 3: Total paid equals total owed
          const totalPaid = settlements.reduce((sum, s) => sum + s.amount, 0)
          const totalOwed = results
            .filter(r => r.chips > 0)
            .reduce((sum, r) => sum + r.chips, 0)
          expect(Math.abs(totalPaid - totalOwed)).toBeLessThan(0.1)

          // Property 4: After applying settlements, all balances should be ~0
          const balances = {}
          results.forEach(r => {
            balances[r.name] = r.chips
          })
          settlements.forEach(s => {
            balances[s.from] = (balances[s.from] || 0) + s.amount
            balances[s.to] = (balances[s.to] || 0) - s.amount
          })
          Object.values(balances).forEach(balance => {
            expect(Math.abs(balance)).toBeLessThan(0.1)
          })
        }
      ),
      { numRuns: 100 }
    )
  })
})
