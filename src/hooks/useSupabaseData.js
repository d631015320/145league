// src/hooks/useSupabaseData.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * 订阅 Supabase 数据（支持联赛过滤）
 * @param {string|null} leagueId - 当前联赛ID，传 null 则不过滤
 */
function useSupabaseData(leagueId = null) {
  const [matchHistory, setMatchHistory] = useState([])
  const [playerProfiles, setPlayerProfiles] = useState({})
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // 1. 获取当前用户状态
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // 监听认证状态变化
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => authSubscription.unsubscribe()
  }, [])

  // 数据获取 — 当 leagueId 变化时重新加载
  useEffect(() => {
    // 重置状态
    setLoading(true)
    setMatchHistory([])
    setPlayerProfiles({})

    // 2. 加载比赛数据
    const fetchMatches = async () => {
      let query = supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false })

      // 如果有联赛ID，按联赛过滤
      if (leagueId) {
        query = query.eq('league_id', leagueId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error('比赛数据加载失败:', fetchError)
        setError(fetchError)
      } else {
        const matches = (data || []).map(transformMatchFromDB)
        setMatchHistory(matches)
      }
      setLoading(false)
    }

    // 3. 加载玩家档案
    const fetchProfiles = async () => {
      let query = supabase
        .from('profiles')
        .select('*')

      if (leagueId) {
        query = query.eq('league_id', leagueId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error('玩家档案加载失败:', fetchError)
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

    // 4. 实时订阅比赛数据变化（带联赛过滤）
    const channelFilter = leagueId
      ? { event: '*', schema: 'public', table: 'matches', filter: `league_id=eq.${leagueId}` }
      : { event: '*', schema: 'public', table: 'matches' }

    const matchesChannel = supabase
      .channel(`matches-${leagueId || 'all'}`)
      .on('postgres_changes', channelFilter, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMatch = transformMatchFromDB(payload.new)
          setMatchHistory(prev => [newMatch, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          const updatedMatch = transformMatchFromDB(payload.new)
          setMatchHistory(prev => prev.map(m =>
            m.id === updatedMatch.id ? updatedMatch : m
          ))
        } else if (payload.eventType === 'DELETE') {
          setMatchHistory(prev => prev.filter(m => m.id !== payload.old.id))
        }
      })
      .subscribe()

    // 5. 实时订阅玩家档案变化（带联赛过滤）
    const profileFilter = leagueId
      ? { event: '*', schema: 'public', table: 'profiles', filter: `league_id=eq.${leagueId}` }
      : { event: '*', schema: 'public', table: 'profiles' }

    const profilesChannel = supabase
      .channel(`profiles-${leagueId || 'all'}`)
      .on('postgres_changes', profileFilter, (payload) => {
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
      })
      .subscribe()

    // 清理订阅
    return () => {
      supabase.removeChannel(matchesChannel)
      supabase.removeChannel(profilesChannel)
    }
  }, [leagueId])  // leagueId 变化时重新订阅

  return {
    matchHistory,
    playerProfiles,
    user,
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
    leagueId: row.league_id,
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
