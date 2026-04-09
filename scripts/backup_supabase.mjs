// scripts/backup_supabase.mjs
// 备份 Supabase 数据到本地 JSON 文件
// 用法: node scripts/backup_supabase.mjs

import { createClient } from '@supabase/supabase-js'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Supabase 配置（从 .env.local 复制）
const SUPABASE_URL = 'https://zjeehemuxrgeryoghoib.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZWVoZW11eHJnZXJ5b2dob2liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMjEwMTksImV4cCI6MjA4MzY5NzAxOX0.Iw9Ve4PtQorTMnxuX84SfxlM8tMnPbsNR23JrZsxrqg'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function backup() {
    console.log('🔄 开始备份 Supabase 数据...\n')

    // 1. 拉取所有比赛记录
    const { data: matches, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false })

    if (matchError) {
        console.error('❌ 拉取比赛数据失败:', matchError.message)
        process.exit(1)
    }
    console.log(`✅ 比赛记录: ${matches.length} 条`)

    // 2. 拉取所有玩家档案
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')

    if (profileError) {
        console.error('❌ 拉取玩家档案失败:', profileError.message)
        process.exit(1)
    }
    console.log(`✅ 玩家档案: ${profiles.length} 条`)

    // 3. 组装备份数据
    const backupData = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        summary: {
            totalMatches: matches.length,
            totalProfiles: profiles.length
        },
        matches,
        profiles
    }

    // 4. 写入文件
    const backupDir = resolve(__dirname, '..', 'data', 'backups')
    if (!existsSync(backupDir)) {
        mkdirSync(backupDir, { recursive: true })
    }

    const dateStr = new Date().toISOString().slice(0, 10)
    const timeStr = new Date().toISOString().slice(11, 19).replace(/:/g, '')
    const filename = `supabase_backup_${dateStr}_${timeStr}.json`
    const filepath = resolve(backupDir, filename)

    writeFileSync(filepath, JSON.stringify(backupData, null, 2), 'utf-8')

    console.log(`\n🎉 备份完成！`)
    console.log(`📁 文件: ${filepath}`)
    console.log(`📊 共 ${matches.length} 场比赛，${profiles.length} 个玩家档案`)
}

backup().catch(err => {
    console.error('❌ 备份失败:', err)
    process.exit(1)
})
