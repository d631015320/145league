// src/hooks/useData.js
/**
 * 统一数据 Hook
 * 根据配置自动选择 Firebase 或 Supabase，支持联赛过滤
 */
import { DB_PROVIDER } from '../lib/db'
import useFirebaseData from './useFirebaseData'
import useSupabaseData from './useSupabaseData'

// 根据环境变量选择 hook
const useDataHook = DB_PROVIDER === 'supabase' ? useSupabaseData : useFirebaseData

/**
 * @param {string|null} leagueId - 联赛ID（Supabase 专用）
 */
function useData(leagueId = null) {
  return useDataHook(leagueId)
}

export default useData
