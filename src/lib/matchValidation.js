// src/lib/matchValidation.js
/**
 * 比赛数据校验模块
 * 在保存比赛前验证数据的完整性和一致性
 */

/**
 * 校验比赛数据
 * @param {Object} matchData - 比赛数据
 * @returns {{ valid: boolean, errors: string[] }} 校验结果
 */
export function validateMatchData(matchData) {
    const errors = []

    // 日期校验
    if (!matchData.date) {
        errors.push('缺少比赛日期')
    } else {
        const dateObj = new Date(matchData.date)
        if (isNaN(dateObj.getTime())) {
            errors.push('比赛日期格式无效')
        }
    }

    // 参赛者校验
    if (!matchData.results || !Array.isArray(matchData.results)) {
        errors.push('缺少参赛者数据')
        return { valid: false, errors }
    }

    if (matchData.results.length < 2) {
        errors.push('至少需要 2 名参赛者')
    }

    // 重复玩家检测
    const names = matchData.results.map(r => r.name).filter(Boolean)
    const uniqueNames = new Set(names)
    if (uniqueNames.size !== names.length) {
        const duplicates = names.filter((n, i) => names.indexOf(n) !== i)
        errors.push(`存在重复的参赛者: ${[...new Set(duplicates)].join(', ')}`)
    }

    // 玩家名称不能为空
    if (names.length !== matchData.results.length) {
        errors.push('存在未填写名称的参赛者')
    }

    // 筹码总和校验（允许 ±1 的浮点误差）
    const totalChips = matchData.results.reduce(
        (sum, r) => sum + (parseFloat(r.chips) || 0), 0
    )
    if (Math.abs(totalChips) > 1) {
        errors.push(`筹码总和不为零（差额: ${totalChips.toFixed(1)}）`)
    }

    // 排名校验
    const ranks = matchData.results.map(r => r.rank).sort((a, b) => a - b)
    const expectedRanks = Array.from(
        { length: matchData.results.length },
        (_, i) => i + 1
    )
    if (JSON.stringify(ranks) !== JSON.stringify(expectedRanks)) {
        errors.push('排名不连续或有缺失')
    }

    // 积分校验（必须为非负数）
    const invalidScores = matchData.results.filter(
        r => r.score === undefined || r.score === null || r.score < 0
    )
    if (invalidScores.length > 0) {
        errors.push('存在无效的积分数据')
    }

    return { valid: errors.length === 0, errors }
}
