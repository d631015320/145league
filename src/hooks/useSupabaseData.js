// src/hooks/useSupabaseData.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * 订阅 Supabase 数据
 * 封装 matchHistory、playerProfiles、user 的实时订阅
 */
function useSupabaseData() {
  const [matchHistory, setMatchHistory] = useState([])
  const [playerProfiles, setPlayerProfiles] = useState({})
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // 1. 获取当前用户状态
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsAdmin(!!session?.user)
    })

    // 监听认证状态变化
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setIsAdmin(!!session?.user)
      }
    )

    // 2. 初始加载比赛数据
    const fetchMatches = async () => {
      const { data, error: fetchError } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Match fetch error:', fetchError)
        setError(fetchError)
      } else {
        // 转换字段名（数据库用下划线，前端用驼峰）
        const matches = (data || []).map(transformMatchFromDB)
        setMatchHistory(matches)
      }
      setLoading(false)
    }

    // 3. 初始加载玩家档案
    const fetchProfiles = async () => {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')

      if (fetchError) {
        console.error('Profile fetch error:', fetchError)
      } else {
        const profiles = {}
          ; (data || []).forEach(row => {
            profiles[row.name] = {
              avatar: row.avatar,
              realName: row.real_name || ''
            }
          })
        setPlayerProfiles(profiles)
      }
    }

    fetchMatches()
    fetchProfiles()

    // 4. 实时订阅比赛数据变化
    const matchesChannel = supabase
      .channel('matches-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMatch = transformMatchFromDB(payload.new)
            // 新比赛插入到最前面
            setMatchHistory(prev => [newMatch, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            const updatedMatch = transformMatchFromDB(payload.new)
            setMatchHistory(prev => prev.map(m =>
              m.id === updatedMatch.id ? updatedMatch : m
            ))
          } else if (payload.eventType === 'DELETE') {
            setMatchHistory(prev => prev.filter(m => m.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    // 5. 实时订阅玩家档案变化
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const row = payload.new
            setPlayerProfiles(prev => ({
              ...prev,
              [row.name]: {
                avatar: row.avatar,
                realName: row.real_name || ''
              }
            }))
          } else if (payload.eventType === 'DELETE') {
            setPlayerProfiles(prev => {
              const newProfiles = { ...prev }
              delete newProfiles[payload.old.name]
              return newProfiles
            })
          }
        }
      )
      .subscribe()

    // 清理订阅
    return () => {
      authSubscription.unsubscribe()
      supabase.removeChannel(matchesChannel)
      supabase.removeChannel(profilesChannel)
    }
  }, [])

  return {
    matchHistory,
    playerProfiles,
    user,
    isAdmin,
    loading,
    error
  }
}

/**
 * 将数据库格式转换为前端格式（下划线 → 驼峰）
 */
function transformMatchFromDB(row) {
  const results = row.results || []
  return {
    id: row.id,
    date: row.date,
    createdAt: row.created_at,
    results,
    roster: row.roster || [],
    transactions: row.transactions || [],
    finalStacks: row.final_stacks || {},
    votedMvp: row.voted_mvp,
    luckyPlayer: row.lucky_player,
    totalPlayers: results.length
  }
}

export default useSupabaseData
