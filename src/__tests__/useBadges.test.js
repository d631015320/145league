// src/__tests__/useBadges.test.js
// useBadges Hook 属性测试
// Feature: player-profile-optimization, Property 3: 徽章计算容错性
// **验证: 需求 3.5**

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { evaluateBadge } from '../hooks/useBadges'
import { BADGE_DEFINITIONS } from '../constants/badges'
import { BADGE_COLORS } from '../constants/colors'

describe('useBadges', () => {
  // Property 1: 徽章定义完整性
  // *对于任意* 徽章定义，该定义必须包含必需字段
  describe('Property 1: 徽章定义完整性', () => {
    it('所有徽章定义都包含必需字段', () => {
      const requiredFields = ['id', 'name', 'icon', 'colorKey', 'description', 'condition']
      
      BADGE_DEFINITIONS.forEach(definition => {
        requiredFields.forEach(field => {
          expect(definition).toHaveProperty(field)
        })
        expect(typeof definition.condition).toBe('function')
      })
    })
  })

  // Property 2: 徽章颜色有效性
  // *对于任意* 徽章定义的 colorKey，该 key 必须存在于 BADGE_COLORS 中
  describe('Property 2: 徽章颜色有效性', () => {
    it('所有徽章的 colorKey 都在预定义方案中', () => {
      const validColorKeys = Object.keys(BADGE_COLORS)
      
      BADGE_DEFINITIONS.forEach(definition => {
        expect(validColorKeys).toContain(definition.colorKey)
      })
    })
  })

  // Property 3: 徽章计算容错性
  // *对于任意* 徽章条件函数抛出异常的情况，evaluateBadge 应该静默跳过
  describe('Property 3: 徽章计算容错性', () => {
    it('条件函数抛出异常时返回 null，不影响其他徽章', () => {
      fc.assert(
        fc.property(
          fc.string(), // 随机错误消息
          (errorMessage) => {
            // 创建一个会抛出异常的徽章定义
            const faultyDefinition = {
              id: 'faulty-badge',
              name: '错误徽章',
              icon: 'x',
              colorKey: 'slate',
              description: '测试用',
              condition: () => {
                throw new Error(errorMessage)
              }
            }

            const context = {
              player: { name: 'TestPlayer' },
              playerMatches: [],
              totalGames: 0,
              wins: 0,
              winRate: 0,
              history: []
            }

            // 应该返回 null 而不是抛出异常
            const result = evaluateBadge(faultyDefinition, context)
            expect(result).toBeNull()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('条件函数返回无效结果时返回 null', () => {
      const invalidResults = [
        undefined,
        null,
        {},
        { earned: undefined },
        { notEarned: true }
      ]

      invalidResults.forEach(invalidResult => {
        const definition = {
          id: 'invalid-badge',
          name: '无效徽章',
          icon: 'x',
          colorKey: 'slate',
          description: '测试用',
          condition: () => invalidResult
        }

        const context = {
          player: { name: 'TestPlayer' },
          playerMatches: [],
          totalGames: 0,
          wins: 0,
          winRate: 0,
          history: []
        }

        const result = evaluateBadge(definition, context)
        expect(result).toBeNull()
      })
    })
  })

  // 单元测试：验证正常徽章评估
  describe('徽章评估正常流程', () => {
    it('earned 为 true 时返回徽章对象', () => {
      const definition = {
        id: 'test-badge',
        name: '测试徽章',
        icon: 'star',
        colorKey: 'gold',
        description: '测试描述',
        condition: () => ({ earned: true, detail: '测试详情' })
      }

      const context = {
        player: { name: 'TestPlayer' },
        playerMatches: [],
        totalGames: 0,
        wins: 0,
        winRate: 0,
        history: []
      }

      const result = evaluateBadge(definition, context)
      expect(result).not.toBeNull()
      expect(result.id).toBe('test-badge')
      expect(result.name).toBe('测试徽章')
      expect(result.desc).toBe('测试详情')
    })

    it('earned 为 false 时返回 null', () => {
      const definition = {
        id: 'test-badge',
        name: '测试徽章',
        icon: 'star',
        colorKey: 'gold',
        description: '测试描述',
        condition: () => ({ earned: false })
      }

      const context = {
        player: { name: 'TestPlayer' },
        playerMatches: [],
        totalGames: 0,
        wins: 0,
        winRate: 0,
        history: []
      }

      const result = evaluateBadge(definition, context)
      expect(result).toBeNull()
    })

    it('可叠加徽章显示次数', () => {
      const definition = {
        id: 'stackable-badge',
        name: '可叠加徽章',
        icon: 'star',
        colorKey: 'gold',
        description: '测试描述',
        condition: () => ({ earned: true, count: 3 })
      }

      const context = {
        player: { name: 'TestPlayer' },
        playerMatches: [],
        totalGames: 0,
        wins: 0,
        winRate: 0,
        history: []
      }

      const result = evaluateBadge(definition, context)
      expect(result.name).toBe('可叠加徽章 x3')
    })
  })
})
