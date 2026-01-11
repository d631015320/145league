// src/hooks/useData.js
/**
 * 统一数据 Hook
 * 根据配置自动选择 Firebase 或 Supabase
 */
import { DB_PROVIDER } from '../lib/db'
import useFirebaseData from './useFirebaseData'
import useSupabaseData from './useSupabaseData'

// 根据环境变量选择 hook（在模块级别决定，避免条件调用）
const useDataHook = DB_PROVIDER === 'supabase' ? useSupabaseData : useFirebaseData

function useData() {
  return useDataHook()
}

export default useData
