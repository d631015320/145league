// src/services/supabase.service.js
/**
 * Supabase CRUD 操作封装
 */
import { supabase } from '../lib/supabase'
import { validateMatchData } from '../lib/matchValidation'

/**
 * 保存比赛记录
 * @param {Object} matchData - 比赛数据
 * @param {string} [matchId] - 编辑时的比赛ID
 * @returns {Promise<string>} 比赛ID
 */
export async function saveMatch(matchData, matchId = null) {
  try {
    // 数据校验
    const { valid, errors } = validateMatchData(matchData)
    if (!valid) {
      console.error('数据校验失败:', errors)
      throw new Error(`数据校验失败:\n${errors.join('\n')}`)
    }

    // 转换字段名（驼峰 → 下划线）
    const dbData = {
      date: matchData.date,
      results: matchData.results || [],
      roster: matchData.roster || [],
      transactions: matchData.transactions || [],
      final_stacks: matchData.finalStacks || {},
      voted_mvp: matchData.votedMvp,
      lucky_player: matchData.luckyPlayer
    }

    console.log('准备保存的数据:', { matchId, dbData })

    if (matchId) {
      // 编辑模式：更新现有记录
      const { error } = await supabase
        .from('matches')
        .update(dbData)
        .eq('id', matchId)
      
      if (error) {
        console.error('Supabase 更新错误:', error)
        throw new Error(`保存比赛失败: ${error.message}`)
      }
      return matchId
    } else {
      const { data, error } = await supabase
        .from('matches')
        .insert(dbData)
        .select('id')
        .single()
      
      if (error) {
        console.error('Supabase 插入错误:', error)
        throw new Error(`保存比赛失败: ${error.message}`)
      }
      return data.id
    }
  } catch (error) {
    console.error('saveMatch 完整错误:', error)
    throw error
  }
}

/**
 * 删除比赛记录
 * @param {string} matchId - 比赛ID
 */
export async function deleteMatch(matchId) {
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', matchId)
  if (error) throw new Error(`删除比赛失败: ${error.message}`)
}

/**
 * 更新玩家档案
 * @param {string} playerName - 玩家名
 * @param {Object} data - 档案数据
 */
export async function updatePlayerProfile(playerName, data) {
  const dbData = {
    name: playerName,
    avatar: data.avatar,
    real_name: data.realName
  }

  const { error } = await supabase
    .from('profiles')
    .upsert(dbData, { onConflict: 'name' })
  if (error) throw new Error(`更新档案失败: ${error.message}`)
}

/**
 * 上传玩家头像
 * @param {string} playerName - 玩家名
 * @param {string} base64Avatar - Base64 编码的头像
 */
export async function uploadAvatar(playerName, base64Avatar) {
  return updatePlayerProfile(playerName, { avatar: base64Avatar })
}

/**
 * 更新玩家真名
 * @param {string} playerName - 玩家网名
 * @param {string} realName - 真名
 */
export async function updateRealName(playerName, realName) {
  return updatePlayerProfile(playerName, { realName })
}

/**
 * 批量更名玩家
 * @param {string} oldName - 原名
 * @param {string} newName - 新名
 * @param {Array} matchHistory - 比赛历史
 * @returns {Promise<number>} 更新的比赛数量
 */
export async function renamePlayer(oldName, newName, matchHistory) {
  let updatedCount = 0

  for (const m of matchHistory) {
    let updated = false
    const updates = {}

    // 更新 results
    const newResults = m.results.map(r => {
      if (r.name === oldName) {
        updated = true
        return { ...r, name: newName }
      }
      return r
    })
    if (updated) updates.results = newResults

    // 更新 roster
    if (m.roster?.includes(oldName)) {
      updates.roster = m.roster.map(n => n === oldName ? newName : n)
      updated = true
    }

    // 更新 transactions
    let txUpdated = false
    const newTransactions = (m.transactions || []).map(t => {
      const tMod = { ...t }
      if (t.buyer === oldName) { tMod.buyer = newName; txUpdated = true }
      if (t.seller === oldName) { tMod.seller = newName; txUpdated = true }
      return tMod
    })
    if (txUpdated) { updates.transactions = newTransactions; updated = true }

    // 更新 finalStacks
    if (m.finalStacks?.[oldName] !== undefined) {
      const newStacks = { ...m.finalStacks }
      newStacks[newName] = newStacks[oldName]
      delete newStacks[oldName]
      updates.final_stacks = newStacks
      updated = true
    }

    // 更新 MVP 和运气王
    if (m.votedMvp === oldName) { updates.voted_mvp = newName; updated = true }
    if (m.luckyPlayer === oldName) { updates.lucky_player = newName; updated = true }

    if (updated) {
      const { error } = await supabase
        .from('matches')
        .update(updates)
        .eq('id', m.id)
      if (error) throw new Error(`更名失败: ${error.message}`)
      updatedCount++
    }
  }

  // 迁移 Profile
  const { data: oldProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('name', oldName)
    .single()

  if (oldProfile) {
    await supabase
      .from('profiles')
      .upsert({
        name: newName,
        avatar: oldProfile.avatar,
        real_name: oldProfile.real_name
      })
    await supabase.from('profiles').delete().eq('name', oldName)
  }

  return updatedCount
}

/**
 * 登录
 * @param {string} email - 邮箱
 * @param {string} password - 密码
 */
export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`登录失败: ${error.message}`)
}

/**
 * 登出
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(`登出失败: ${error.message}`)
}
