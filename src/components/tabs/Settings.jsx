import { useState } from 'react'
import Icon from '../common/Icon'
import LeagueMembers from '../common/LeagueMembers'
import { signIn, signOut, updateRealName, renamePlayer } from '../../services/db.service'

const Settings = ({
    user,
    isAdmin,
    allPlayerNames,
    playerProfiles,
    matchHistory,
    onTriggerSecurity
}) => {
    // 本地状态
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPwd, setLoginPwd] = useState("");
    const [renameFrom, setRenameFrom] = useState('');
    const [renameTo, setRenameTo] = useState('');
    const [realNameTarget, setRealNameTarget] = useState('');
    const [realNameInput, setRealNameInput] = useState('');

    // --- 逻辑函数 ---

    const handleLogin = async (e) => {
        e.preventDefault()
        try {
            await signIn(loginEmail, loginPwd)
            setLoginEmail('')
            setLoginPwd('')
        } catch (err) {
            alert('登录失败: ' + err.message)
        }
    }

    const handleLogout = async () => {
        try {
            await signOut()
            alert('已安全退出')
        } catch (e) {
            alert('退出失败: ' + e.message)
        }
    }

    const handleUpdateRealName = async () => {
        if (!realNameTarget || !realNameInput) return alert('请填写完整')
        try {
            await updateRealName(realNameTarget, realNameInput)
            alert(`绑定成功！\n网名：${realNameTarget}\n真名：${realNameInput}`)
            setRealNameInput('')
        } catch (e) {
            alert('绑定失败: ' + e.message)
        }
    }

    const handleRenamePlayer = async () => {
        if (!renameFrom || !renameTo) return alert('请选择原名并输入新名')
        if (renameFrom === renameTo) return alert('新旧名字不能相同')
        if (!confirm(`⚠️ 高危操作警告！\n即将把 "${renameFrom}" 变更为 "${renameTo}"。\n数据将自动合并，确定吗？`)) return

        try {
            const count = await renamePlayer(renameFrom, renameTo, matchHistory)
            alert(`成功！已更新 ${count} 场比赛记录。`)
            setRenameFrom('')
            setRenameTo('')
        } catch (e) {
            alert('更名失败: ' + e.message)
        }
    }

    const exportCloudData = () => {
        const data = { history: matchHistory, profiles: playerProfiles };
        const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PokerData_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
    };

    // 触发安全弹窗
    const triggerClear = () => onTriggerSecurity({ type: 'clear' });
    const triggerImport = (e) => {
        if (e.target.files[0]) onTriggerSecurity({ type: 'import', file: e.target.files[0] });
        e.target.value = null;
    };

    // --- 渲染 ---

    return (
        <div className="glass-panel p-4 sm:p-6 rounded-2xl max-w-2xl mx-auto space-y-6 sm:space-y-8 shadow-lg border border-slate-200 dark:border-slate-700/50">
            {isAdmin ? (
                <div className="space-y-6 sm:space-y-8">
                    {/* 管理员状态 */}
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3" role="status" aria-label="管理员登录状态">
                        <div><h3 className="font-bold text-emerald-800 dark:text-emerald-400">管理员已登录</h3><p className="text-xs text-emerald-600 dark:text-emerald-500">{user?.email}</p></div>
                        <button
                            onClick={handleLogout}
                            aria-label="退出管理员登录"
                            className="px-4 py-2 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 text-sm font-bold rounded-lg shadow-sm border border-emerald-100 dark:border-emerald-900 min-h-[44px] touch-feedback w-full sm:w-auto"
                        >
                            退出
                        </button>
                    </div>

                    {/* 成员管理（仅超管可见） */}
                    <LeagueMembers />

                    {/* 实名认证 */}
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Icon name="user-check" className="w-5 h-5 text-emerald-500" aria-hidden="true" /> 实名备注管理</h2>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                <div>
                                    <label htmlFor="realname-target" className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">选择网名</label>
                                    <select
                                        id="realname-target"
                                        value={realNameTarget}
                                        onChange={e => setRealNameTarget(e.target.value)}
                                        aria-label="选择要绑定真名的玩家"
                                        className="input-pro w-full p-2.5 rounded-lg text-sm bg-white dark:bg-slate-900 min-h-[44px]"
                                    >
                                        <option value="">-- 请选择 --</option>
                                        {allPlayerNames.map(n => <option key={n} value={n}>{n} {playerProfiles[n]?.realName ? `✅` : ''}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="realname-input" className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">输入真名</label>
                                    <input
                                        id="realname-input"
                                        type="text"
                                        value={realNameInput}
                                        onChange={e => setRealNameInput(e.target.value)}
                                        aria-label="输入玩家真名"
                                        className="input-pro w-full p-2.5 rounded-lg text-sm bg-white dark:bg-slate-900 min-h-[44px]"
                                        placeholder="例如：张伟"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleUpdateRealName}
                                disabled={!realNameTarget || !realNameInput}
                                aria-label="保存真名备注"
                                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 min-h-[44px] touch-feedback"
                            >
                                <Icon name="save" className="w-4 h-4" aria-hidden="true" /> 保存备注
                            </button>
                        </div>
                    </div>

                    {/* 更名工具 */}
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Icon name="users" className="w-5 h-5 text-indigo-500" aria-hidden="true" /> 玩家更名/迁移工具</h2>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                <div>
                                    <label htmlFor="rename-from" className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">原名 (Old)</label>
                                    <select
                                        id="rename-from"
                                        value={renameFrom}
                                        onChange={e => setRenameFrom(e.target.value)}
                                        aria-label="选择要更名的玩家原名"
                                        className="input-pro w-full p-2.5 rounded-lg text-sm bg-white dark:bg-slate-900 min-h-[44px]"
                                    >
                                        <option value="">-- 请选择 --</option>
                                        {allPlayerNames.map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="rename-to" className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">新名 (New)</label>
                                    <input
                                        id="rename-to"
                                        type="text"
                                        value={renameTo}
                                        onChange={e => setRenameTo(e.target.value)}
                                        aria-label="输入玩家新名称"
                                        className="input-pro w-full p-2.5 rounded-lg text-sm bg-white dark:bg-slate-900 min-h-[44px]"
                                        placeholder="例如：AKKing"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleRenamePlayer}
                                disabled={!renameFrom || !renameTo}
                                aria-label="执行批量更名操作"
                                className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 min-h-[44px] touch-feedback"
                            >
                                <Icon name="refresh-cw" className="w-4 h-4" aria-hidden="true" /> 执行批量更名
                            </button>
                        </div>
                    </div>

                    {/* 备份恢复 */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/50">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Icon name="database" className="w-5 h-5 text-emerald-500" aria-hidden="true" /> 备份与恢复</h2>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <button
                                onClick={exportCloudData}
                                aria-label="导出云端数据备份"
                                className="bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-100 border border-blue-200 dark:border-blue-500/50 text-blue-600 dark:text-blue-400 p-4 rounded-xl flex flex-col items-center gap-2 min-h-[100px] touch-feedback"
                            >
                                <Icon name="download" className="w-6 sm:w-8 h-6 sm:h-8" aria-hidden="true" />
                                <span className="font-bold text-sm sm:text-base">导出备份</span>
                            </button>
                            <label className="bg-emerald-50 dark:bg-emerald-600/20 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-500/50 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl flex flex-col items-center gap-2 cursor-pointer min-h-[100px] touch-feedback">
                                <Icon name="upload" className="w-6 sm:w-8 h-6 sm:h-8" aria-hidden="true" />
                                <span className="font-bold text-sm sm:text-base">导入恢复</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={triggerImport}
                                    aria-label="选择要导入的备份文件"
                                    accept=".json"
                                />
                            </label>
                        </div>
                    </div>

                    {/* 危险区域 */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/50">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Icon name="alert-triangle" className="w-5 h-5 text-red-500" aria-hidden="true" /> 危险区域</h2>
                        <button
                            onClick={triggerClear}
                            aria-label="清空云端所有数据（危险操作）"
                            className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 p-3 rounded-lg font-bold flex items-center justify-center gap-2 w-full min-h-[48px] touch-feedback"
                        >
                            <Icon name="trash-2" className="w-4 h-4" aria-hidden="true" /> 清空云端数据
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Icon name="shield" className="w-5 h-5 text-purple-500" aria-hidden="true" /> 管理员登录</h2>
                    <form onSubmit={handleLogin} className="space-y-4 max-w-md" aria-label="管理员登录表单">
                        <div>
                            <label htmlFor="login-email" className="text-xs font-bold text-slate-500 uppercase mb-1 block">邮箱</label>
                            <input
                                id="login-email"
                                type="email"
                                required
                                value={loginEmail}
                                onChange={e => setLoginEmail(e.target.value)}
                                aria-label="输入管理员邮箱"
                                autoComplete="email"
                                className="input-pro w-full p-2.5 rounded-lg min-h-[44px]"
                            />
                        </div>
                        <div>
                            <label htmlFor="login-password" className="text-xs font-bold text-slate-500 uppercase mb-1 block">密码</label>
                            <input
                                id="login-password"
                                type="password"
                                required
                                value={loginPwd}
                                onChange={e => setLoginPwd(e.target.value)}
                                aria-label="输入管理员密码"
                                autoComplete="current-password"
                                className="input-pro w-full p-2.5 rounded-lg min-h-[44px]"
                            />
                        </div>
                        <button
                            type="submit"
                            aria-label="登录云端控制台"
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg min-h-[48px] touch-feedback"
                        >
                            登录云端控制台
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Settings;