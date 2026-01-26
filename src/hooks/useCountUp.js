// src/hooks/useCountUp.js
// 数字计数动画 Hook

import { useState, useEffect, useRef } from 'react'

/**
 * 缓动函数 - easeOutExpo
 * 开始快，结束慢，更自然
 */
function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

/**
 * 数字计数动画 Hook
 * @param {number} targetValue - 目标值
 * @param {Object} options - 配置项
 * @param {number} options.duration - 动画时长（毫秒），默认 800
 * @param {number} options.decimals - 小数位数，默认 0
 * @param {boolean} options.enabled - 是否启用动画，默认 true
 * @returns {string} 当前显示值（已格式化）
 */
function useCountUp(targetValue, options = {}) {
    const { duration = 800, decimals = 0, enabled = true } = options
    const [displayValue, setDisplayValue] = useState(enabled ? 0 : targetValue)
    const startTimeRef = useRef(null)
    const animationRef = useRef(null)
    const previousTargetRef = useRef(targetValue)
    const displayValueRef = useRef(displayValue)

    // 同步 Ref
    useEffect(() => {
        displayValueRef.current = displayValue
    }, [displayValue])

    useEffect(() => {
        // 如果禁用动画，直接显示目标值
        if (!enabled) {
            setDisplayValue(targetValue)
            return
        }

        // 如果目标值没变，不重新动画
        if (previousTargetRef.current === targetValue && displayValueRef.current === targetValue) {
            return
        }

        const startValue = previousTargetRef.current !== targetValue ? 0 : displayValueRef.current
        previousTargetRef.current = targetValue

        // 取消之前的动画
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
        }

        startTimeRef.current = null

        const animate = (timestamp) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp
            }

            const elapsed = timestamp - startTimeRef.current
            const progress = Math.min(elapsed / duration, 1)
            const easedProgress = easeOutExpo(progress)

            const currentValue = startValue + (targetValue - startValue) * easedProgress
            setDisplayValue(currentValue)

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate)
            }
        }

        animationRef.current = requestAnimationFrame(animate)

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [targetValue, duration, enabled])

    // 格式化输出
    if (typeof targetValue === 'number') {
        return displayValue.toFixed(decimals)
    }
    return String(displayValue)
}

export default useCountUp
