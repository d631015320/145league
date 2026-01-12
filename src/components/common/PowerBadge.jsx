// src/components/common/PowerBadge.jsx
// 战力徽章组件 - 使用共享颜色配置

import Icon from './Icon'
import { getPowerTier } from '../../lib/powerColor'

/**
 * 战力徽章组件
 */
function PowerBadge({ score, onClick }) {
    const tier = getPowerTier(score)

    return (
        <button
            onClick={onClick}
            className={`
        relative group
        bg-gradient-to-r ${tier.gradient}
        text-white text-xs font-bold
        px-3 py-1.5 rounded-full
        hover:scale-105 active:scale-95
        transition-all duration-300
        cursor-pointer
        flex items-center gap-1
        min-h-[32px]
        touch-feedback
        ${tier.pulse ? 'animate-power-pulse' : ''}
      `}
            style={{
                boxShadow: `0 0 20px ${tier.glow}, 0 4px 12px rgba(0, 0, 0, 0.15)`
            }}
            aria-label={`战力 ${Math.round(score)}，${tier.name}级`}
        >
            {/* 悬停光晕 */}
            <span
                className={`
          absolute inset-0 rounded-full
          bg-gradient-to-r ${tier.gradient}
          opacity-0 group-hover:opacity-60
          blur-lg scale-110
          transition-opacity duration-300
          -z-10
        `}
                aria-hidden="true"
            />

            {/* 内容 */}
            <span className="relative z-10 flex items-center gap-1">
                战力 {Math.round(score)}
                <Icon name="help-circle" className="w-3 h-3 opacity-70" />
            </span>
        </button>
    )
}

export default PowerBadge
