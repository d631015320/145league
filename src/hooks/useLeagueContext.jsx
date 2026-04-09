// src/hooks/useLeagueContext.js
/**
 * 联赛上下文 Hook
 * 提供当前联赛、联赛列表、用户角色等信息
 */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { getMyLeagues, getAllLeagues, getMyRole } from '../services/league.service'

// 本地存储键（记忆上次选择的联赛）
const LEAGUE_STORAGE_KEY = 'selected_league_id'

/**
 * 联赛 Context
 */
export const LeagueContext = createContext(null)

/**
 * 联赛 Context Provider
 */
export function LeagueProvider({ children }) {
    const [leagues, setLeagues] = useState([])
    const [currentLeague, setCurrentLeague] = useState(null)
    const [role, setRole] = useState(null)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // 加载联赛列表（所有联赛公开可见，登录后合并角色信息）
    const fetchLeagues = useCallback(async (currentUser) => {
        try {
            // 始终加载所有联赛
            let leagueList = await getAllLeagues()

            // 已登录：合并角色信息
            if (currentUser) {
                try {
                    const myLeagues = await getMyLeagues()
                    const roleMap = {}
                    myLeagues.forEach(l => { roleMap[l.id] = l.role })
                    leagueList = leagueList.map(l => ({
                        ...l,
                        role: roleMap[l.id] || null
                    }))
                } catch (e) {
                    console.warn('获取角色信息失败:', e)
                }
            }

            setLeagues(leagueList)

            // 恢复上次选择的联赛，或默认选第一个
            const savedId = localStorage.getItem(LEAGUE_STORAGE_KEY)
            const savedLeague = leagueList.find(l => l.id === savedId)
            const defaultLeague = savedLeague || leagueList[0] || null

            setCurrentLeague(defaultLeague)

            // 设置角色
            if (defaultLeague && currentUser) {
                const userRole = defaultLeague.role || await getMyRole(defaultLeague.id)
                setRole(userRole)
            } else {
                setRole(null)
            }
        } catch (err) {
            console.error('加载联赛列表失败:', err)
            setLeagues([])
        } finally {
            setLoading(false)
        }
    }, [])

    // 监听用户认证状态
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            const u = session?.user ?? null
            setUser(u)
            fetchLeagues(u)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                const u = session?.user ?? null
                setUser(u)
                fetchLeagues(u)
            }
        )

        return () => subscription.unsubscribe()
    }, [fetchLeagues])

    // 切换联赛
    const switchLeague = useCallback(async (league) => {
        setCurrentLeague(league)
        localStorage.setItem(LEAGUE_STORAGE_KEY, league.id)

        if (user) {
            const userRole = league.role || await getMyRole(league.id)
            setRole(userRole)
        } else {
            setRole(null)
        }
    }, [user])

    // 刷新联赛列表
    const refreshLeagues = useCallback(() => {
        return fetchLeagues(user)
    }, [user, fetchLeagues])

    // 便捷权限判断
    // isSuperAdmin: 在任意联赛中拥有 owner 角色（全局超管）
    const isSuperAdmin = useMemo(() => {
        return leagues.some(l => l.role === 'owner')
    }, [leagues])

    const permissions = useMemo(() => ({
        isOwner: role === 'owner' || isSuperAdmin,
        isSuperAdmin,
        isAdmin: role === 'admin' || role === 'owner' || isSuperAdmin,
        canEdit: role === 'admin' || role === 'owner' || isSuperAdmin,
        isViewer: role === 'viewer',
        isLoggedIn: !!user
    }), [role, user, isSuperAdmin])

    const value = useMemo(() => ({
        // 数据
        leagues,
        currentLeague,
        currentLeagueId: currentLeague?.id ?? null,
        role,
        user,
        loading,

        // 权限
        ...permissions,

        // 方法
        switchLeague,
        refreshLeagues
    }), [leagues, currentLeague, role, user, loading, permissions, switchLeague, refreshLeagues])

    return (
        <LeagueContext.Provider value={value}>
            {children}
        </LeagueContext.Provider>
    )
}

/**
 * 使用联赛上下文的 Hook
 * @returns {Object} 联赛上下文
 */
export function useLeagueContext() {
    const context = useContext(LeagueContext)
    if (!context) {
        throw new Error('useLeagueContext 必须在 LeagueProvider 内使用')
    }
    return context
}

export default useLeagueContext
