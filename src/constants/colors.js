// src/constants/colors.js
// 颜色方案配置 - 统一管理徽章和 UI 元素的颜色

/**
 * 徽章颜色方案
 * 每个方案包含 text、bg、border 的 Tailwind 类名
 * 同时支持 light 和 dark 模式
 */
export const BADGE_COLORS = {
  gold: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-400',
  silver: 'text-slate-500 bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300',
  bronze: 'text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-400',
  emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  blue: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400',
  pink: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
  cyan: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
  orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  slate: 'text-slate-500 bg-slate-500/10 border-slate-500/20'
}

/**
 * 获取徽章颜色类名
 * @param {string} colorKey - 颜色方案 key
 * @returns {string} Tailwind 类名
 */
export function getBadgeColor(colorKey) {
  return BADGE_COLORS[colorKey] || BADGE_COLORS.slate
}
