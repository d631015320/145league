// src/services/league.service.js
/**
 * 联赛管理服务
 * 提供联赛 CRUD、成员管理等功能
 */
import { supabase } from '../lib/supabase'

/**
 * 获取当前用户加入的所有联赛（含角色信息）
 * @returns {Promise<Array>} 联赛列表
 */
export async function getMyLeagues() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('league_members')
        .select(`
      role,
      league:leagues (
        id, name, slug, description, created_by, created_at, settings
      )
    `)
        .eq('user_id', user.id)

    if (error) throw new Error(`获取联赛列表失败: ${error.message}`)

    return (data || []).map(row => ({
        ...row.league,
        role: row.role
    }))
}

/**
 * 获取所有公开联赛（未登录用户也可查看）
 * @returns {Promise<Array>} 联赛列表
 */
export async function getAllLeagues() {
    const { data, error } = await supabase
        .from('leagues')
        .select('id, name, slug, description, created_at')
        .order('created_at', { ascending: true })

    if (error) throw new Error(`获取联赛列表失败: ${error.message}`)
    return data || []
}

/**
 * 创建联赛（使用原子化 RPC 函数，避免 RLS 递归）
 * @param {string} name - 联赛名称
 * @param {string} slug - URL标识
 * @returns {Promise<Object>} 新联赛
 */
export async function createLeague(name, slug) {
    const { data, error } = await supabase
        .rpc('create_league_with_owner', {
            league_name: name,
            league_slug: slug
        })

    if (error) throw new Error(`创建联赛失败: ${error.message}`)
    return data
}

/**
 * 获取联赛成员列表
 * @param {string} leagueId - 联赛ID
 * @returns {Promise<Array>} 成员列表
 */
export async function getLeagueMembers(leagueId) {
    const { data, error } = await supabase
        .from('league_members')
        .select('id, user_id, role, joined_at')
        .eq('league_id', leagueId)
        .order('joined_at', { ascending: true })

    if (error) throw new Error(`获取成员列表失败: ${error.message}`)
    return data || []
}

/**
 * 邀请成员加入联赛
 * @param {string} leagueId - 联赛ID
 * @param {string} userId - 用户ID
 * @param {string} [role='viewer'] - 角色
 */
export async function inviteMember(leagueId, userId, role = 'viewer') {
    const { error } = await supabase
        .from('league_members')
        .insert({
            league_id: leagueId,
            user_id: userId,
            role
        })

    if (error) {
        if (error.code === '23505') throw new Error('该用户已是联赛成员')
        throw new Error(`邀请成员失败: ${error.message}`)
    }
}

/**
 * 按邮箱邀请成员（先查 user_id，再插入）
 * @param {string} leagueId - 联赛ID
 * @param {string} email - 用户邮箱
 * @param {string} [role='admin'] - 角色
 */
export async function inviteMemberByEmail(leagueId, email, role = 'admin') {
    // 通过 SECURITY DEFINER 函数查找用户
    const { data, error: lookupError } = await supabase
        .rpc('find_user_by_email', { target_email: email })

    if (lookupError) throw new Error(`查找用户失败: ${lookupError.message}`)
    if (!data || data.length === 0) throw new Error(`未找到邮箱为 ${email} 的注册用户`)

    const userId = data[0].user_id
    await inviteMember(leagueId, userId, role)
    return { userId, email }
}

/**
 * 获取联赛成员列表（含邮箱信息）
 * @param {string} leagueId - 联赛ID
 * @returns {Promise<Array>} 成员列表（含 email 字段）
 */
export async function getLeagueMembersWithEmail(leagueId) {
    const { data: members, error } = await supabase
        .from('league_members')
        .select('id, user_id, role, joined_at')
        .eq('league_id', leagueId)
        .order('joined_at', { ascending: true })

    if (error) throw new Error(`获取成员列表失败: ${error.message}`)
    if (!members || members.length === 0) return []

    // 批量查邮箱
    const userIds = members.map(m => m.user_id)
    const { data: emails } = await supabase
        .rpc('get_user_emails', { user_ids: userIds })

    const emailMap = {}
        ; (emails || []).forEach(e => { emailMap[e.user_id] = e.email })

    return members.map(m => ({
        ...m,
        email: emailMap[m.user_id] || '未知'
    }))
}

/**
 * 移除联赛成员
 * @param {string} leagueId - 联赛ID
 * @param {string} userId - 用户ID
 */
export async function removeMember(leagueId, userId) {
    const { error } = await supabase
        .from('league_members')
        .delete()
        .eq('league_id', leagueId)
        .eq('user_id', userId)

    if (error) throw new Error(`移除成员失败: ${error.message}`)
}

/**
 * 更新成员角色
 * @param {string} leagueId - 联赛ID
 * @param {string} userId - 用户ID
 * @param {string} newRole - 新角色
 */
export async function updateMemberRole(leagueId, userId, newRole) {
    const { error } = await supabase
        .from('league_members')
        .update({ role: newRole })
        .eq('league_id', leagueId)
        .eq('user_id', userId)

    if (error) throw new Error(`更新角色失败: ${error.message}`)
}

/**
 * 更新联赛设置
 * @param {string} leagueId - 联赛ID
 * @param {Object} settings - 设置对象
 */
export async function updateLeagueSettings(leagueId, settings) {
    const { error } = await supabase
        .from('leagues')
        .update({ settings })
        .eq('id', leagueId)

    if (error) throw new Error(`更新联赛设置失败: ${error.message}`)
}

/**
 * 获取当前用户在指定联赛中的角色
 * @param {string} leagueId - 联赛ID
 * @returns {Promise<string|null>} 角色或 null
 */
export async function getMyRole(leagueId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('league_members')
        .select('role')
        .eq('league_id', leagueId)
        .eq('user_id', user.id)
        .single()

    if (error) return null
    return data?.role ?? null
}

/**
 * 删除联赛（仅超管可用，原子删除联赛及所有关联数据）
 * @param {string} leagueId - 联赛ID
 */
export async function deleteLeague(leagueId) {
    const { error } = await supabase
        .rpc('delete_league', { target_league_id: leagueId })

    if (error) throw new Error(`删除联赛失败: ${error.message}`)
}
