// src/__tests__/MatchHistoryTable.test.jsx
// MatchHistoryTable 组件属性测试
// Feature: player-profile-optimization
// Property 4: 战绩表格分页
// Property 5: 键盘导航支持
// **验证: 需求 2.5, 4.6**

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import * as fc from 'fast-check'
import MatchHistoryTable from '../components/modals/MatchHistoryTable'

// 生成随机比赛记录
const matchArbitrary = fc.record({
  id: fc.uuid(),
  date: fc.integer({ min: 2020, max: 2025 }).chain(year =>
    fc.integer({ min: 1, max: 12 }).chain(month =>
      fc.integer({ min: 1, max: 28 }).map(day =>
        `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      )
    )
  ),
  result: fc.record({
    rank: fc.integer({ min: 1, max: 10 }),
    score: fc.integer({ min: 1, max: 25 }),
    chips: fc.integer({ min: -3000, max: 3000 })
  })
})

describe('MatchHistoryTable', () => {
  afterEach(() => {
    cleanup()
  })

  // Property 4: 战绩表格分页
  // *对于任意* 超过 pageSize 条的比赛记录，组件应该只渲染当前页的记录
  describe('Property 4: 战绩表格分页', () => {
    it('超过 pageSize 时只渲染当前页记录', () => {
      fc.assert(
        fc.property(
          fc.array(matchArbitrary, { minLength: 1, maxLength: 50 }),
          fc.integer({ min: 1, max: 20 }),
          (matches, pageSize) => {
            cleanup()
            const onNavigate = vi.fn()
            
            const { container } = render(
              <MatchHistoryTable
                matches={matches}
                onNavigateToMatch={onNavigate}
                pageSize={pageSize}
              />
            )

            // 获取表格行数（不包括表头）
            const rows = container.querySelectorAll('tbody tr')
            const expectedRows = Math.min(matches.length, pageSize)
            
            expect(rows.length).toBe(expectedRows)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('分页控件在超过一页时显示', () => {
      fc.assert(
        fc.property(
          fc.array(matchArbitrary, { minLength: 11, maxLength: 30 }),
          (matches) => {
            cleanup()
            const pageSize = 10
            const onNavigate = vi.fn()
            
            const { container } = render(
              <MatchHistoryTable
                matches={matches}
                onNavigateToMatch={onNavigate}
                pageSize={pageSize}
              />
            )

            // 应该有分页按钮
            const prevButtons = container.querySelectorAll('[aria-label="上一页"]')
            const nextButtons = container.querySelectorAll('[aria-label="下一页"]')
            
            expect(prevButtons.length).toBe(1)
            expect(nextButtons.length).toBe(1)
          }
        ),
        { numRuns: 50 }
      )
    })

    it('分页控件在只有一页时不显示', () => {
      fc.assert(
        fc.property(
          fc.array(matchArbitrary, { minLength: 1, maxLength: 10 }),
          (matches) => {
            cleanup()
            const pageSize = 10
            const onNavigate = vi.fn()
            
            const { container } = render(
              <MatchHistoryTable
                matches={matches}
                onNavigateToMatch={onNavigate}
                pageSize={pageSize}
              />
            )

            // 不应该有分页按钮
            const prevButtons = container.querySelectorAll('[aria-label="上一页"]')
            expect(prevButtons.length).toBe(0)
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  // Property 5: 键盘导航支持
  // *对于任意* 战绩表格行，按下 Enter 键应该触发导航
  describe('Property 5: 键盘导航支持', () => {
    it('Enter 键触发导航', () => {
      const matches = [
        {
          id: 'test-match-1',
          date: '2024-01-15',
          result: { rank: 1, score: 25, chips: 1500 }
        }
      ]
      const onNavigate = vi.fn()

      render(
        <MatchHistoryTable
          matches={matches}
          onNavigateToMatch={onNavigate}
          pageSize={10}
        />
      )

      // 找到表格行
      const row = screen.getByRole('button', { name: /查看.*比赛详情/ })
      
      // 模拟 Enter 键
      fireEvent.keyDown(row, { key: 'Enter' })
      
      expect(onNavigate).toHaveBeenCalledWith('test-match-1')
    })

    it('空格键触发导航', () => {
      const matches = [
        {
          id: 'test-match-2',
          date: '2024-01-16',
          result: { rank: 2, score: 18, chips: -500 }
        }
      ]
      const onNavigate = vi.fn()

      render(
        <MatchHistoryTable
          matches={matches}
          onNavigateToMatch={onNavigate}
          pageSize={10}
        />
      )

      const row = screen.getByRole('button', { name: /查看.*比赛详情/ })
      
      // 模拟空格键
      fireEvent.keyDown(row, { key: ' ' })
      
      expect(onNavigate).toHaveBeenCalledWith('test-match-2')
    })

    it('点击触发导航', () => {
      const matches = [
        {
          id: 'test-match-3',
          date: '2024-01-17',
          result: { rank: 3, score: 15, chips: 200 }
        }
      ]
      const onNavigate = vi.fn()

      render(
        <MatchHistoryTable
          matches={matches}
          onNavigateToMatch={onNavigate}
          pageSize={10}
        />
      )

      const row = screen.getByRole('button', { name: /查看.*比赛详情/ })
      
      fireEvent.click(row)
      
      expect(onNavigate).toHaveBeenCalledWith('test-match-3')
    })
  })

  // 单元测试：表格可访问性
  describe('表格可访问性', () => {
    it('表格包含 caption 元素', () => {
      const matches = [
        {
          id: 'test-1',
          date: '2024-01-01',
          result: { rank: 1, score: 25, chips: 1000 }
        }
      ]

      render(
        <MatchHistoryTable
          matches={matches}
          onNavigateToMatch={vi.fn()}
          pageSize={10}
        />
      )

      // caption 是 sr-only，但应该存在
      const caption = document.querySelector('caption')
      expect(caption).toBeInTheDocument()
      expect(caption.textContent).toContain('战绩')
    })

    it('列顺序为：日期、排名、积分、筹码、评分', () => {
      const matches = [
        {
          id: 'test-1',
          date: '2024-01-01',
          result: { rank: 1, score: 25, chips: 1000 }
        }
      ]

      render(
        <MatchHistoryTable
          matches={matches}
          onNavigateToMatch={vi.fn()}
          pageSize={10}
        />
      )

      const headers = screen.getAllByRole('columnheader')
      expect(headers[0].textContent).toBe('日期')
      expect(headers[1].textContent).toBe('排名')
      expect(headers[2].textContent).toBe('积分')
      expect(headers[3].textContent).toBe('筹码')
      expect(headers[4].textContent).toBe('评分')
    })
  })
})
