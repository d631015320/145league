// src/lib/powerColor.js
// 战力颜色工具函数 - 共享给 PowerBadge 和 Leaderboard

/**
 * 7 档颜色配置（由低到高）
 * 灰→绿→蓝→紫→金→橙→红金
 */
export const POWER_TIERS = [
    { name: '王者', min: 90, text: 'text-red-500', bg: 'bg-red-50/60 dark:bg-red-900/20', gradient: 'from-red-500 via-orange-500 to-amber-400', glow: 'rgba(239, 68, 68, 0.6)', pulse: true },
    { name: '宗师', min: 80, text: 'text-orange-500', bg: 'bg-orange-50/60 dark:bg-orange-900/20', gradient: 'from-orange-500 to-amber-500', glow: 'rgba(249, 115, 22, 0.5)', pulse: false },
    { name: '钻石', min: 70, text: 'text-amber-500', bg: 'bg-amber-50/60 dark:bg-amber-900/20', gradient: 'from-amber-400 to-yellow-500', glow: 'rgba(251, 191, 36, 0.5)', pulse: false },
    { name: '翡翠', min: 55, text: 'text-purple-500', bg: 'bg-purple-50/60 dark:bg-purple-900/20', gradient: 'from-purple-500 to-violet-600', glow: 'rgba(168, 85, 247, 0.4)', pulse: false },
    { name: '铂金', min: 40, text: 'text-blue-500', bg: 'bg-blue-50/60 dark:bg-blue-900/20', gradient: 'from-blue-500 to-cyan-500', glow: 'rgba(59, 130, 246, 0.4)', pulse: false },
    { name: '黄金', min: 25, text: 'text-emerald-500', bg: 'bg-emerald-50/60 dark:bg-emerald-900/20', gradient: 'from-emerald-500 to-green-500', glow: 'rgba(34, 197, 94, 0.4)', pulse: false },
    { name: '白银', min: 0, text: 'text-slate-400', bg: 'bg-slate-50/60 dark:bg-slate-800/20', gradient: 'from-slate-400 to-gray-500', glow: 'rgba(148, 163, 184, 0.3)', pulse: false }
]

/**
 * 根据战力值获取段位配置
 * @param {number} score - 战力值 0-100
 * @returns {Object} 段位配置
 */
export function getPowerTier(score) {
    for (const tier of POWER_TIERS) {
        if (score >= tier.min) return tier
    }
    return POWER_TIERS[POWER_TIERS.length - 1]
}

/**
 * 获取战力值对应的文本颜色类
 * @param {number} score - 战力值 0-100
 * @returns {string} Tailwind 文本颜色类
 */
export function getPowerTextColor(score) {
    return getPowerTier(score).text
}

/**
 * 获取战力值对应的背景颜色类
 * @param {number} score - 战力值 0-100
 * @returns {string} Tailwind 背景颜色类
 */
export function getPowerBgColor(score) {
    return getPowerTier(score).bg
}
