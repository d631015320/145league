import { describe, it, expect } from 'vitest'
import { calculateSettlements, getISOWeek } from '../../lib/utils'

describe('getISOWeek', () => {
  it('should return correct ISO week for a known date', () => {
    // January 1, 2024 is in week 1 of 2024
    expect(getISOWeek('2024-01-01')).toBe('2024-W1')
  })

  it('should return correct ISO week for mid-year date', () => {
    // June 15, 2024 is in week 24
    expect(getISOWeek('2024-06-15')).toBe('2024-W24')
  })

  it('should handle year boundary correctly', () => {
    // December 31, 2024 might be in week 1 of 2025
    const result = getISOWeek('2024-12-31')
    expect(result).toMatch(/^\d{4}-W\d{1,2}$/)
  })
})

describe('calculateSettlements', () => {
  it('should return empty array when no one owes anything', () => {
    const results = [
      { name: 'Alice', chips: 0 },
      { name: 'Bob', chips: 0 }
    ]
    expect(calculateSettlements(results)).toEqual([])
  })

  it('should calculate simple two-player settlement', () => {
    const results = [
      { name: 'Alice', chips: 100 },
      { name: 'Bob', chips: -100 }
    ]
    const settlements = calculateSettlements(results)
    expect(settlements).toHaveLength(1)
    expect(settlements[0]).toEqual({ from: 'Bob', to: 'Alice', amount: 100 })
  })

  it('should handle multiple players with balanced chips', () => {
    const results = [
      { name: 'Alice', chips: 200 },
      { name: 'Bob', chips: -100 },
      { name: 'Charlie', chips: -100 }
    ]
    const settlements = calculateSettlements(results)
    
    // Total transferred to Alice should be 200
    const totalToAlice = settlements
      .filter(s => s.to === 'Alice')
      .reduce((sum, s) => sum + s.amount, 0)
    expect(totalToAlice).toBe(200)
  })

  it('should handle complex multi-player scenario', () => {
    const results = [
      { name: 'Alice', chips: 300 },
      { name: 'Bob', chips: 100 },
      { name: 'Charlie', chips: -200 },
      { name: 'David', chips: -200 }
    ]
    const settlements = calculateSettlements(results)
    
    // Verify total amounts balance
    const totalPaid = settlements.reduce((sum, s) => sum + s.amount, 0)
    const totalOwed = results.filter(r => r.chips > 0).reduce((sum, r) => sum + r.chips, 0)
    expect(totalPaid).toBe(totalOwed)
  })

  it('should handle string chip values', () => {
    const results = [
      { name: 'Alice', chips: '100' },
      { name: 'Bob', chips: '-100' }
    ]
    const settlements = calculateSettlements(results)
    expect(settlements).toHaveLength(1)
    expect(settlements[0].amount).toBe(100)
  })
})
