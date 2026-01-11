// src/components/modals/MatchHistoryTable.jsx
// 战绩表格组件

import { useState, useCallback } from 'react'
import { formatDate } from '../../lib/utils'
import Icon from '../common/Icon'

/**
 * 分页控件组件
 */
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-center gap-2 py-3 border-t border-slate-100 dark:border-slate-700/50">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500"
        aria-label="上一页"
      >
        <Icon name="chevron-left" className="w-4 h-4" />
      </button>
      
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-7 h-7 text-xs rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            page === currentPage
              ? 'bg-emerald-500 text-white font-bold'
              : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
          }`}
          aria-label={`第 ${page} 页`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500"
        aria-label="下一页"
      >
        <Icon name="chevron-right" className="w-4 h-4" />
      </button>
    </div>
  )
}

/**
 * 战绩表格行组件
 */
function MatchRow({ match, onNavigate }) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onNavigate(match.id)
    }
  }, [match.id, onNavigate])

  return (
    <tr
      onClick={() => onNavigate(match.id)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`查看 ${formatDate(match.date)} 的比赛详情`}
      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer focus:outline-none focus:bg-emerald-50 dark:focus:bg-emerald-900/20"
    >
      {/* 日期 */}
      <td className="px-4 py-2 text-slate-600 dark:text-slate-300 font-mono text-xs">
        {formatDate(match.date)}
      </td>
      {/* 排名 */}
      <td className="px-4 py-2 text-center">
        <span className={`inline-block w-6 h-6 leading-6 rounded-full text-xs font-bold ${
          match.result.rank === 1 
            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' 
            : match.result.rank <= 3 
              ? 'bg-slate-200 text-slate-700 dark:bg-slate-600/50 dark:text-white' 
              : 'text-slate-400'
        }`}>
          {match.result.rank}
        </span>
      </td>
      {/* 积分 */}
      <td className="px-4 py-2 text-right font-bold text-slate-700 dark:text-white">
        +{match.result.score}
      </td>
      {/* 筹码 */}
      <td className={`px-4 py-2 text-right font-mono ${
        match.result.chips >= 0 
          ? 'text-teal-500 dark:text-teal-400' 
          : 'text-slate-500 dark:text-slate-400'
      }`}>
        {match.result.chips > 0 ? '+' : ''}{match.result.chips}
      </td>
      {/* 评分进度条 */}
      <td className="px-4 py-2 text-right">
        <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full ml-auto overflow-hidden">
          <div 
            className="h-full bg-emerald-500" 
            style={{ width: `${Math.min((match.result.score / 25) * 100, 100)}%` }}
          />
        </div>
      </td>
    </tr>
  )
}

/**
 * 战绩表格组件
 * 
 * @param {Object} props
 * @param {Array} props.matches - 比赛记录（含 result）
 * @param {Function} props.onNavigateToMatch - 导航到比赛详情
 * @param {number} props.pageSize - 每页显示数量，默认 10
 */
function MatchHistoryTable({ matches, onNavigateToMatch, pageSize = 10 }) {
  const [currentPage, setCurrentPage] = useState(1)

  // 按时间倒序显示（最新的在前）
  const displayedMatches = [...matches].reverse()
  
  // 计算分页
  const totalPages = Math.ceil(displayedMatches.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentMatches = displayedMatches.slice(startIndex, endIndex)

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page)
  }, [])

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/50 shadow-sm">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-transparent">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          近期战绩 (点击查看详情)
        </h3>
        <span className="text-xs text-slate-400">
          共 {matches.length} 场
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">
            玩家近期战绩表格，包含日期、排名、积分、筹码和评分信息
          </caption>
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th scope="col" className="px-4 py-2 text-left">日期</th>
              <th scope="col" className="px-4 py-2 text-center">排名</th>
              <th scope="col" className="px-4 py-2 text-right">积分</th>
              <th scope="col" className="px-4 py-2 text-right">筹码</th>
              <th scope="col" className="px-4 py-2 text-right">评分</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {currentMatches.map(m => (
              <MatchRow 
                key={m.id} 
                match={m} 
                onNavigate={onNavigateToMatch} 
              />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

export default MatchHistoryTable
