// src/components/modals/PlayerRadarSection.jsx
// 玩家能力雷达图区域组件

import { useState } from 'react'
import Icon from '../common/Icon'
import ProRadarChart from '../../charts/ProRadarChart'

/**
 * 维度 Tooltip 组件
 */
function DimensionTooltip({ stat, isVisible }) {
  if (!isVisible) return null

  return (
    <div
      className="absolute z-50 px-3 py-2 text-xs bg-slate-900 dark:bg-slate-700 text-white rounded-lg shadow-lg max-w-xs whitespace-normal"
      style={{
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: '8px'
      }}
      role="tooltip"
    >
      <div className="font-bold mb-1">{stat.label.split(' ')[0]}</div>
      <div className="text-slate-300">{stat.description}</div>
      <div
        className="absolute w-2 h-2 bg-slate-900 dark:bg-slate-700 rotate-45"
        style={{
          bottom: '-4px',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      />
    </div>
  )
}

/**
 * 单个维度条组件
 */
function DimensionBar({ stat, compareVal, index: _index }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const diff = compareVal !== null ? stat.value - compareVal : 0

  return (
    <div 
      className="flex flex-col gap-1 relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <DimensionTooltip stat={stat} isVisible={showTooltip} />
      <div className="flex justify-between items-end text-xs">
        <button
          type="button"
          className="font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 focus:outline-none focus:underline transition-colors cursor-help"
          aria-label={`${stat.label.split(' ')[0]}: ${stat.description}`}
        >
          {stat.label.split(' ')[0]}
        </button>
        <div className="flex items-center gap-2">
          {compareVal !== null && (
            <span className={`text-[10px] font-mono ${diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
              {diff > 0 ? '+' : ''}{diff.toFixed(1)}
            </span>
          )}
          <span className="font-mono font-bold text-slate-800 dark:text-white">
            {stat.value.toFixed(1)}
          </span>
        </div>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative">
        <div 
          className="absolute h-full bg-emerald-500 rounded-full transition-all duration-300" 
          style={{ width: `${stat.value * 10}%`, zIndex: 10 }}
        />
        {compareVal !== null && (
          <div 
            className="absolute h-full bg-rose-500/50 rounded-full" 
            style={{ width: `${compareVal * 10}%`, zIndex: 20, mixBlendMode: 'multiply' }}
          />
        )}
      </div>
      <div className="text-[9px] text-slate-400 text-right scale-90 origin-right">
        {stat.raw}
      </div>
    </div>
  )
}

/**
 * 玩家能力雷达图区域组件
 * 
 * @param {Object} props
 * @param {Array} props.radarStats - 雷达图数据
 * @param {Array|null} props.compareRadarStats - 对比玩家雷达图数据
 * @param {string} props.compareTarget - 对比玩家名称
 * @param {Function} props.onCompareChange - 对比玩家变更回调
 * @param {Array} props.allPlayerNames - 所有玩家名称
 * @param {string} props.playerName - 当前玩家名称
 * @param {boolean} props.isDark - 是否暗色模式
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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center flex-1">
          能力雷达 (v10.4 Pro)
        </h3>
        <div className="relative">
          <label htmlFor="compare-player-select" className="sr-only">
            选择对比玩家
          </label>
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
          <div 
            className="absolute inset-y-0 right-0 flex items-center px-1 pointer-events-none text-slate-400" 
            aria-hidden="true"
          >
            <Icon name="chevron-down" className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* 雷达图 */}
      <div role="img" aria-label={`能力雷达图：${radarStats.map(s => `${s.label.split(' ')[0]} ${s.value.toFixed(1)}`).join('，')}`}>
        <ProRadarChart 
          stats={radarStats} 
          compareStats={compareRadarStats} 
          compareName={compareTarget} 
          isDark={isDark} 
        />
      </div>

      {/* 维度详情 */}
      <div className="mt-5 space-y-3">
        {radarStats.map((s, i) => {
          const compareVal = compareRadarStats ? compareRadarStats[i]?.value : null
          return (
            <DimensionBar 
              key={i} 
              stat={s} 
              compareVal={compareVal} 
              index={i} 
            />
          )
        })}
      </div>
    </div>
  )
}

export default PlayerRadarSection
