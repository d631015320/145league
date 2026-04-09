// src/components/common/LeagueMembers.jsx
/**
 * 联赛成员管理组件
 * 支持查看成员列表、邀请新成员、修改角色、移除成员
 * 仅超管/owner 可见
 */
import { useState, useEffect, useCallback } from 'react'
import Icon from './Icon'
import { useLeagueContext } from '../../hooks/useLeagueContext'
import {
    getLeagueMembersWithEmail,
    inviteMemberByEmail,
    updateMemberRole,
    removeMember
} from '../../services/league.service'

const ROLE_OPTIONS = [
    { value: 'admin', label: '管理员', desc: '可录入和编辑比赛数据' },
    { value: 'viewer', label: '只读', desc: '仅可查看数据' }
]

const ROLE_LABELS = {
    owner: { label: '超管', color: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800/30' },
    admin: { label: '管理员', color: 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800/30' },
    viewer: { label: '只读', color: 'text-slate-500 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-700/50 dark:border-slate-600' }
}

const LeagueMembers = () => {
    const { currentLeague, currentLeagueId, isOwner, user } = useLeagueContext()
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState('admin')
    const [inviting, setInviting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // 加载成员列表
    const fetchMembers = useCallback(async () => {
        if (!currentLeagueId) return
        setLoading(true)
        try {
            const data = await getLeagueMembersWithEmail(currentLeagueId)
            setMembers(data)
        } catch (e) {
            console.error('加载成员失败:', e)
        } finally {
            setLoading(false)
        }
    }, [currentLeagueId])

    useEffect(() => {
        fetchMembers()
    }, [fetchMembers])

    // 邀请成员
    const handleInvite = async () => {
        if (!inviteEmail.trim()) return
        setInviting(true)
        setError('')
        setSuccess('')
        try {
            await inviteMemberByEmail(currentLeagueId, inviteEmail.trim(), inviteRole)
            setSuccess(`成功邀请 ${inviteEmail} 为 ${inviteRole === 'admin' ? '管理员' : '只读成员'}`)
            setInviteEmail('')
            fetchMembers()
        } catch (e) {
            setError(e.message)
        } finally {
            setInviting(false)
        }
    }

    // 修改角色
    const handleRoleChange = async (member, newRole) => {
        if (member.role === 'owner') return // owner 不可修改
        try {
            await updateMemberRole(currentLeagueId, member.user_id, newRole)
            setSuccess(`已将 ${member.email} 的角色更新为 ${newRole === 'admin' ? '管理员' : '只读'}`)
            fetchMembers()
        } catch (e) {
            setError(e.message)
        }
    }

    // 移除成员
    const handleRemove = async (member) => {
        if (member.role === 'owner') return
        if (!confirm(`确定要移除 ${member.email} 吗？`)) return
        try {
            await removeMember(currentLeagueId, member.user_id)
            setSuccess(`已移除 ${member.email}`)
            fetchMembers()
        } catch (e) {
            setError(e.message)
        }
    }

    if (!isOwner || !currentLeague) return null

    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
            {/* 标题 */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Icon name="users" className="w-5 h-5 text-emerald-500" />
                    成员管理 — {currentLeague.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">邀请成员加入联赛，管理他们的权限</p>
            </div>

            {/* 邀请区域 */}
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-700/50">
                <div className="flex gap-2 items-end">
                    <div className="flex-1">
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">邀请邮箱</label>
                        <input
                            type="email"
                            placeholder="输入对方注册的邮箱"
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleInvite()}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <div className="w-28">
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">角色</label>
                        <select
                            value={inviteRole}
                            onChange={e => setInviteRole(e.target.value)}
                            className="w-full px-2 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 outline-none"
                        >
                            {ROLE_OPTIONS.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleInvite}
                        disabled={inviting || !inviteEmail.trim()}
                        className="px-4 py-2 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg disabled:opacity-50 transition-colors whitespace-nowrap"
                    >
                        {inviting ? '邀请中...' : '邀请'}
                    </button>
                </div>

                {/* 提示信息 */}
                {error && (
                    <div className="mt-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg">
                        ⚠️ {error}
                    </div>
                )}
                {success && (
                    <div className="mt-2 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg">
                        ✅ {success}
                    </div>
                )}
            </div>

            {/* 成员列表 */}
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {loading ? (
                    <div className="px-6 py-8 text-center text-sm text-slate-400">加载中...</div>
                ) : members.length === 0 ? (
                    <div className="px-6 py-8 text-center text-sm text-slate-400">暂无成员</div>
                ) : (
                    members.map(member => {
                        const roleConfig = ROLE_LABELS[member.role] || ROLE_LABELS.viewer
                        const isCurrentUser = member.user_id === user?.id
                        const isProtectedOwner = member.role === 'owner'

                        return (
                            <div key={member.id} className="px-6 py-3 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                                {/* 头像 */}
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm flex-shrink-0">
                                    {member.email?.[0]?.toUpperCase() || '?'}
                                </div>

                                {/* 信息 */}
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                                        {member.email}
                                        {isCurrentUser && <span className="text-[10px] text-slate-400 ml-1">（你）</span>}
                                    </div>
                                    <div className="text-[11px] text-slate-400 mt-0.5">
                                        加入于 {new Date(member.joined_at).toLocaleDateString('zh-CN')}
                                    </div>
                                </div>

                                {/* 角色 */}
                                {isProtectedOwner ? (
                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${roleConfig.color}`}>
                                        {roleConfig.label}
                                    </span>
                                ) : (
                                    <select
                                        value={member.role}
                                        onChange={e => handleRoleChange(member, e.target.value)}
                                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border cursor-pointer outline-none ${roleConfig.color}`}
                                    >
                                        {ROLE_OPTIONS.map(r => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                )}

                                {/* 移除按钮 */}
                                {!isProtectedOwner && !isCurrentUser && (
                                    <button
                                        onClick={() => handleRemove(member)}
                                        className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors p-1"
                                        title="移除成员"
                                    >
                                        <Icon name="x" className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default LeagueMembers
