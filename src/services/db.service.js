// src/services/db.service.js
/**
 * 统一数据库服务
 * 根据配置自动选择 Firebase 或 Supabase 的服务实现
 */
import { DB_PROVIDER } from '../lib/db'
import * as firebaseService from './firebase.service'
import * as supabaseService from './supabase.service'

const service = DB_PROVIDER === 'supabase' ? supabaseService : firebaseService

// 导出统一接口（支持 leagueId 参数）
export const saveMatch = service.saveMatch
export const deleteMatch = service.deleteMatch
export const updatePlayerProfile = service.updatePlayerProfile
export const uploadAvatar = service.uploadAvatar
export const updateRealName = service.updateRealName
export const renamePlayer = service.renamePlayer

// 认证相关（Supabase 专用，Firebase 在组件中直接调用）
export const signIn = service.signIn
export const signOut = service.signOut

// 导出备份功能（两者通用）
export { exportDataToJSON, downloadBackup } from './firebase.service'

// 联赛管理服务（Supabase 专用）
export {
    getMyLeagues,
    getAllLeagues,
    createLeague,
    getLeagueMembers,
    inviteMember,
    removeMember,
    updateMemberRole,
    updateLeagueSettings,
    getMyRole
} from './league.service'
