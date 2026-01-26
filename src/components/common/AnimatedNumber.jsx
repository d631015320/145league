// src/components/common/AnimatedNumber.jsx
// 带计数动画的数字显示组件

import useCountUp from '../../hooks/useCountUp'

/**
 * 带计数动画的数字显示组件
 * @param {number|string} value - 目标值（支持数字或带单位的字符串如 "19%"）
 * @param {number} decimals - 小数位数，默认自动检测
 * @param {string} suffix - 后缀（如 %）
 * @param {string} className - 样式类名
 * @param {number} duration - 动画时长，默认 800ms
 */
function AnimatedNumber({ value, decimals, suffix = '', className = '', duration = 800 }) {
    // 解析数值和后缀
    let numericValue = value
    let detectedSuffix = suffix

    if (typeof value === 'string') {
        const match = value.match(/^([\d.]+)(.*)$/)
        if (match) {
            numericValue = parseFloat(match[1])
            detectedSuffix = match[2] || suffix
        }
    }

    // 自动检测小数位数
    const autoDecimals = decimals !== undefined
        ? decimals
        : (String(numericValue).includes('.') ? String(numericValue).split('.')[1]?.length || 1 : 0)

    const animatedValue = useCountUp(numericValue, { duration, decimals: autoDecimals })

    if (typeof value === 'string' && !value.match(/^([\d.]+)(.*)$/)) {
        // 无法解析，直接显示原始值
        return <span className={className}>{value}</span>
    }

    return (
        <span className={className}>
            {animatedValue}{detectedSuffix}
        </span>
    )
}

export default AnimatedNumber
