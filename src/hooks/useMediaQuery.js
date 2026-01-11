// src/hooks/useMediaQuery.js
// 响应式断点检测 Hook

import { useState, useEffect } from 'react'

/**
 * 通用媒体查询 Hook
 * @param {string} query - CSS 媒体查询字符串
 * @returns {boolean} - 是否匹配
 */
const useMediaQuery = (query) => {
  // SSR 或不支持 matchMedia 时返回 false
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false
    }
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    // 检查环境支持
    if (typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    const media = window.matchMedia(query)
    
    // 初始化状态
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    // 监听变化
    const listener = (e) => setMatches(e.matches)
    
    // 使用新 API，回退到旧 API
    if (media.addEventListener) {
      media.addEventListener('change', listener)
    } else {
      media.addListener(listener)
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener)
      } else {
        media.removeListener(listener)
      }
    }
  }, [query, matches])

  return matches
}

/**
 * 移动端检测 Hook (< 768px)
 * @returns {boolean} - 是否为移动端
 */
export const useIsMobile = () => useMediaQuery('(max-width: 767px)')

/**
 * 平板检测 Hook (768px - 1023px)
 * @returns {boolean} - 是否为平板
 */
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)')

/**
 * 桌面端检测 Hook (>= 1024px)
 * @returns {boolean} - 是否为桌面端
 */
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')

/**
 * 小屏幕检测 Hook (< 640px)
 * @returns {boolean} - 是否为小屏幕
 */
export const useIsSmallScreen = () => useMediaQuery('(max-width: 639px)')

/**
 * 触摸设备检测 Hook
 * @returns {boolean} - 是否为触摸设备
 */
export const useIsTouchDevice = () => {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      )
    }
    checkTouch()
  }, [])

  return isTouch
}

export default useMediaQuery
