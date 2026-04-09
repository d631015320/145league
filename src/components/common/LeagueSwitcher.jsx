// src/components/common/LeagueSwitcher.jsx
/**
 * 联赛切换 & 创建组件
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import Icon from './Icon'
import { useLeagueContext } from '../../hooks/useLeagueContext'
import { createLeague, deleteLeague } from '../../services/league.service'

const LeagueSwitcher = () => {
    const { leagues, currentLeague, switchLeague, role, isLoggedIn, isSuperAdmin, refreshLeagues } = useLeagueContext()
    const [isOpen, setIsOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [newName, setNewName] = useState('')
    const [newSlug, setNewSlug] = useState('')
    const [creating, setCreating] = useState(false)
    const dropdownRef = useRef(null)

    // 点击外部关闭
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false)
                setIsCreating(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // 自动生成 slug
    const handleNameChange = useCallback((name) => {
        setNewName(name)
        // 简单的 slug 生成：小写 + 空格转横杠
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u4e00-\u9fff-]/g, '')
        setNewSlug(slug)
    }, [])

    // 创建联赛
    const handleCreate = useCallback(async () => {
        if (!newName.trim() || !newSlug.trim()) return
        setCreating(true)
        try {
            const league = await createLeague(newName.trim(), newSlug.trim())
            await refreshLeagues()
            switchLeague({ ...league, role: 'admin' })
            setIsCreating(false)
            setIsOpen(false)
            setNewName('')
            setNewSlug('')
        } catch (e) {
            alert(`创建联赛失败: ${e.message}`)
        } finally {
            setCreating(false)
        }
    }, [newName, newSlug, refreshLeagues, switchLeague])

    // 没有联赛且未登录
    if (!currentLeague && !isLoggedIn) return null

    return (
        <div className="relative" ref={dropdownRef}>
            {/* 触发按钮 — 始终可点击 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                aria-label="联赛菜单"
            >
                <Icon name="shield" className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 max-w-[100px] truncate">
                    {currentLeague?.name || '选择联赛'}
                </span>
                {role && <RoleBadge role={role} />}
                <Icon
                    name="chevron-down"
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* 下拉菜单 */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-slide-up">
                    {/* 联赛列表 */}
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">我的联赛</p>
                    </div>
                    <div className="max-h-48 overflow-y-auto py-1">
                        {leagues.map(league => (
                            <div
                                key={league.id}
                                className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${league.id === currentLeague?.id
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                    }`}
                            >
                                <button
                                    onClick={() => {
                                        switchLeague(league)
                                        setIsOpen(false)
                                    }}
                                    className="flex-1 flex items-center gap-3 text-left min-w-0"
                                >
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${league.id === currentLeague?.id
                                        ? 'bg-emerald-500'
                                        : 'bg-slate-300 dark:bg-slate-600'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                                            {league.name}
                                        </div>
                                    </div>
                                    {league.role && <RoleBadge role={league.role} />}
                                </button>
                                {isSuperAdmin && league.id !== currentLeague?.id && (
                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation()
                                            if (!confirm(`确定要删除「${league.name}」吗？\n⚠️ 该联赛的所有比赛数据将被永久删除！`)) return
                                            try {
                                                await deleteLeague(league.id)
                                                await refreshLeagues()
                                            } catch (err) {
                                                alert('删除失败: ' + err.message)
                                            }
                                        }}
                                        className="p-1 text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors"
                                        title="删除联赛"
                                    >
                                        <Icon name="trash-2" className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        ))}

                        {leagues.length === 0 && (
                            <p className="text-center text-xs text-slate-400 py-3">暂无联赛</p>
                        )}
                    </div>

                    {/* 创建联赛区域 — 仅超管可见 */}
                    {isSuperAdmin && (
                        <div className="border-t border-slate-100 dark:border-slate-700">
                            {!isCreating ? (
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    <Icon name="plus-circle" className="w-4 h-4 text-emerald-500" />
                                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">创建新联赛</span>
                                </button>
                            ) : (
                                <div className="p-3 space-y-2">
                                    <input
                                        type="text"
                                        placeholder="联赛名称（如：周末大乱斗）"
                                        value={newName}
                                        onChange={e => handleNameChange(e.target.value)}
                                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                                        autoFocus
                                    />
                                    <input
                                        type="text"
                                        placeholder="标识符（自动生成）"
                                        value={newSlug}
                                        onChange={e => setNewSlug(e.target.value)}
                                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-[11px]"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCreate}
                                            disabled={creating || !newName.trim()}
                                            className="flex-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg disabled:opacity-50 transition-colors"
                                        >
                                            {creating ? '创建中...' : '确认创建'}
                                        </button>
                                        <button
                                            onClick={() => { setIsCreating(false); setNewName(''); setNewSlug('') }}
                                            className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            取消
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

/**
 * 角色标签
 */
const RoleBadge = ({ role }) => {
    const config = {
        owner: { label: '超管', color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30' },
        admin: { label: '管理', color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' },
        viewer: { label: '只读', color: 'text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-700' }
    }

    const c = config[role] || config.viewer

    return (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${c.color}`}>
            {c.label}
        </span>
    )
}

export default LeagueSwitcher
