// src/components/modals/PlayerBadges.jsx
// 玩家徽章展示组件

import { useState } from 'react'
import Icon from '../common/Icon'

/**
 * 徽章 Tooltip 组件
 */
function BadgeTooltip({ badge, isVisible, position: _position }) {
  if (!isVisible) return null

  return (
    <div
      className="absolute z-50 px-3 py-2 text-xs bg-slate-900 dark:bg-slate-700 text-white rounded-lg shadow-lg whitespace-nowrap"
      style={{
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: '8px',
        minWidth: '120px'
      }}
      role="tooltip"
    >
      <div className="font-bold mb-1">{badge.name}</div>
      <div className="text-slate-300 whitespace-normal" style={{ maxWidth: '200px' }}>{badge.desc}</div>
      {/* 箭头 */}
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
 * 单个徽章组件
 */
function Badge({ badge }) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
    >
      <button
        type="button"
        className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold border ${badge.color} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500 transition-all`}
        aria-describedby={`badge-tooltip-${badge.id}`}
      >
        <Icon name={badge.icon} className="w-3 h-3" aria-hidden="true" />
        {badge.name}
      </button>
      <BadgeTooltip
        badge={badge}
        isVisible={showTooltip}
      />
    </div>
  )
}

/**
 * 玩家徽章列表组件
 * 
 * @param {Object} props
 * @param {Array} props.badges - 徽章数组
 */
function PlayerBadges({ badges }) {
  if (!badges || badges.length === 0) return null

  return (
    <div 
      className="flex flex-wrap gap-2 my-3 animate-slide-up"
      role="list"
      aria-label="玩家徽章"
    >
      {badges.map((badge, idx) => (
        <div key={badge.id || idx} role="listitem">
          <Badge badge={badge} />
        </div>
      ))}
    </div>
  )
}

export default PlayerBadges
