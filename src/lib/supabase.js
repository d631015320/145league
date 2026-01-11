// src/lib/supabase.js
/**
 * Supabase 客户端配置
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 配置缺失，请检查环境变量')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
