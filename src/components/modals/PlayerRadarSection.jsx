// src/components/modals/PlayerRadarSection.jsx
// 玩家能力雷达图区域组件

import { useState } from 'react'
import Icon from '../common/Icon'
import ProRadarChart from '../../charts/ProRadarChart'

/**
 * 维度固定颜色配置（进度条）
 */
const DIMENSION_COLORS = {
  '统治': 'bg-purple-500',
  '击败': 'bg-rose-500',
  '效率': 'bg-blue-500',
  '胜场': 'bg-amber-500',
  '掠夺': 'bg-emerald-500',
  '稳定': 'bg-cyan-500',
  'MVP': 'bg-indigo-500'
}

/**
 * 段位配置 - 参考英雄联盟段位系统
 * 包含：名称、颜色、图标、阈值
 */
const RANK_TIERS = [
  { 
    name: '王者', 
    min: 95, 
    color: 'text-red-500 dark:text-red-400',
    bgColor: 'bg-gradient-to-r from-red-500 to-amber-500',
    borderColor: 'border-red-500/50',
    icon: '👑'
  },
  { 
    name: '钻石', 
    min: 85, 
    color: 'text-cyan-400 dark:text-cyan-300',
    bgColor: 'bg-cyan-500',
    borderColor: 'border-cyan-500/50',
    icon: '💎'
  },
  { 
    name: '翡翠', 
    min: 75, 
    color: 'text-emerald-500 dark:text-emerald-400',
    bgColor: 'bg-emerald-500',
    borderColor: 'border-emerald-500/50',
    icon: '💚'
  },
  { 
    name: '铂金', 
    min: 60, 
    color: 'text-teal-400 dark:text-teal-300',
    bgColor: 'bg-teal-500',
    borderColor: 'border-teal-500/50',
    icon: '🔷'
  },
  { 
    name: '黄金', 
    min: 45, 
    color: 'text-amber-500 dark:text-amber-400',
    bgColor: 'bg-amber-500',
    borderColor: 'border-amber-500/50',
    icon: '🥇'
  },
  { 
    name: '白银', 
    min: 30, 
    color: 'text-slate-400 dark:text-slate-300',
    bgColor: 'bg-slate-400',
    borderColor: 'border-slate-400/50',
    icon: '🥈'
  },
  { 
    name: '青铜', 
    min: 15, 
    color: 'text-orange-700 dark:text-orange-500',
    bgColor: 'bg-orange-700',
    borderColor: 'border-orange-700/50',
    icon: '🥉'
  },
  { 
    name: '黑铁', 
    min: 0, 
    color: 'text-slate-600 dark:text-slate-500',
    bgColor: 'bg-slate-600',
    borderColor: 'border-slate-600/50',
    icon: '⚫'
  }
]

/**
 * 根据指数值获取段位信息
 * @param {number} value - 指数值 0-100
 * @returns {Object} 段位信息
 */
function getRankTier(value) {
  for (const tier of RANK_TIERS) {
    if (value >= tier.min) return tier
  }
  return RANK_TIERS[RANK_TIERS.length - 1]
}

/**
 * 维度 Tooltip 组件
 */
function DimensionTooltip({ stat, isVisible }) {
  if (!isVisible) return null

  return (
    <div
      className="absolute z-[200] px-3 py-2 text-xs bg-slate-800 text-white rounded-lg shadow-xl max-w-[200px] whitespace-normal pointer-events-none"
      style={{ bottom: 'calc(100% + 8px)', left: '0' }}
      role="tooltip"
    >
      <div className="font-bold mb-1 text-emerald-400">{stat.label}</div>
      <div className="text-slate-200 leading-relaxed">{stat.description}</div>
      <div
        className="absolute w-2 h-2 bg-slate-800 rotate-45"
        style={{ bottom: '-4px', left: '16px' }}
      />
    </div>
  )
}

/**
 * 单个维度条组件 - 支持 Hover Tooltip
 */
function DimensionBar({ stat, compareVal }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const diff = compareVal !== null ? stat.value - compareVal : 0
  
  // 获取维度固定颜色（进度条）
  const barColor = DIMENSION_COLORS[stat.label] || 'bg-emerald-500'
  // 获取段位信息
  const tier = getRankTier(stat.value)

  return (
    <div 
      className="flex flex-col gap-1 relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      <DimensionTooltip stat={stat} isVisible={showTooltip} />
      
      {/* 标签行 */}
      <div className="flex justify-between items-end text-xs">
        <button
          type="button"
          className="font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 focus:outline-none focus:underline transition-colors cursor-help"
          aria-label={`${stat.label}: ${stat.description}`}
        >
          {stat.label}
        </button>
        <div className="flex items-center gap-2">
          {compareVal !== null && (
            <span className={`text-[10px] font-mono ${diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
              {diff > 0 ? '+' : ''}{diff.toFixed(1)}
            </span>
          )}
          {/* 指数值（大字） */}
          <span className={`font-mono font-bold ${tier.color}`}>
            {stat.value.toFixed(1)}
          </span>
          {/* 段位徽章 */}
          <span 
            className={`text-[10px] px-1.5 py-0.5 rounded-full ${tier.color} border ${tier.borderColor} bg-slate-100/50 dark:bg-slate-800/50`}
            title={`${tier.name}段位`}
          >
            {tier.icon}{tier.name}
          </span>
        </div>
      </div>
      
      {/* 进度条 - 使用维度固定颜色 */}
      <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative">
        <div 
          className={`absolute h-full ${barColor} rounded-full transition-all duration-300`}
          style={{ width: `${stat.value}%`, zIndex: 10 }}
        />
        {compareVal !== null && (
          <div 
            className="absolute h-full bg-slate-400/50 rounded-full" 
            style={{ width: `${compareVal}%`, zIndex: 5 }}
          />
        )}
      </div>
    </div>
  )
}

/**
 * 玩家能力雷达图区域组件
 */
function PlayerRadarSection({
  radarStats,
  compareRadarStats,
  compareTarget,
  onCompareChange,
  allPlayerNames,
  playerName,
  isDark
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50 shadow-inner">
      {/* 标题和对比选择器 */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          能力雷达
        </h3>
        <div className="relative">
          <label htmlFor="compare-player-select" className="sr-only">选择对比玩家</label>
          <select
            id="compare-player-select"
            value={compareTarget}
            onChange={e => onCompareChange(e.target.value)}
            aria-label="选择要对比的玩家"
            className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded px-2 py-1 pr-6 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">⚔️ VS 对比</option>
            {allPlayerNames.filter(n => n !== playerName).map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-1 pointer-events-none text-slate-400" aria-hidden="true">
            <Icon name="chevron-down" className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* 雷达图 */}
      <div role="img" aria-label={`能力雷达图：${radarStats.map(s => `${s.label.split(' ')[0]} ${s.value.toFixed(1)}`).join('，')}`}>
        <ProRadarChart stats={radarStats} compareStats={compareRadarStats} compareName={compareTarget} isDark={isDark} />
      </div>

      {/* 维度详情 - 使用 DimensionBar 组件 */}
      <div className="mt-5 space-y-3">
        {radarStats.map((s, i) => (
          <DimensionBar 
            key={s.label} 
            stat={s} 
            compareVal={compareRadarStats ? compareRadarStats[i]?.value : null} 
          />
        ))}
      </div>
    </div>
  )
}

export default PlayerRadarSection
