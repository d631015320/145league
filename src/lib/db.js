// src/lib/db.js
/**
 * 数据库抽象层
 * 根据环境变量切换 Firebase 或 Supabase
 */

// 获取数据库提供商配置
export const DB_PROVIDER = import.meta.env.VITE_DB_PROVIDER || 'firebase'

/**
 * 判断是否使用 Supabase
 */
export function isSupabase() {
  return DB_PROVIDER === 'supabase'
}

/**
 * 判断是否使用 Firebase
 */
export function isFirebase() {
  return DB_PROVIDER === 'firebase'
}
