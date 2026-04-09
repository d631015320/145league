// scripts/get_user_id.mjs
// 获取 Supabase 中的 auth.users 列表
// 用法: node scripts/get_user_id.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zjeehemuxrgeryoghoib.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZWVoZW11eHJnZXJ5b2dob2liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMjEwMTksImV4cCI6MjA4MzY5NzAxOX0.Iw9Ve4PtQorTMnxuX84SfxlM8tMnPbsNR23JrZsxrqg'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 尝试从 matches 表的 RLS 信息或其他方式推断
// anon key 无法直接查 auth.users，但我们可以从备份数据中查看
import { readFileSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const backupDir = resolve(__dirname, '..', 'data', 'backups')
const files = readdirSync(backupDir).filter(f => f.endsWith('.json'))
const latestBackup = files.sort().pop()

if (latestBackup) {
    const data = JSON.parse(readFileSync(resolve(backupDir, latestBackup), 'utf-8'))
    console.log('📋 最近备份文件:', latestBackup)
    console.log('📊 比赛数:', data.matches.length)

    // 检查是否有 user_id 相关字段
    if (data.matches.length > 0) {
        const sample = data.matches[0]
        console.log('\n🔍 比赛记录样例字段:', Object.keys(sample))
        if (sample.user_id) console.log('✅ user_id:', sample.user_id)
        if (sample.created_by) console.log('✅ created_by:', sample.created_by)
    }
}

console.log('\n⚠️  如果上面没有找到 user_id，请在 Supabase Dashboard > Authentication > Users 中查看')
console.log('   或者登录后从 session 中获取')
