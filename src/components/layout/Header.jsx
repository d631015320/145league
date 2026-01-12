// src/components/layout/Header.jsx
import Icon from '../common/Icon';
import Clock from '../common/Clock';
import { TAB_CONFIG } from '../../constants';

/**
 * 顶部导航栏组件
 * @param {{activeTab: string, onTabChange: (tab: string) => void, theme: string, onToggleTheme: () => void}} props
 */
const Header = ({ activeTab, onTabChange, theme, onToggleTheme }) => {
  return (
    <nav className="glass-header sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo - 经典徽章风 (Classic Emblem Style) */}
        <div className="flex items-center gap-3">
          {/* 盾牌徽章 */}
          <div className="relative group">
            {/* 盾牌底座 - 渐变绿色背景 + 金色边框 */}
            <div className="relative w-10 h-12 flex items-center justify-center">
              {/* 盾牌形状 SVG */}
              <svg viewBox="0 0 40 48" className="absolute inset-0 w-full h-full drop-shadow-lg">
                {/* 金色边框 */}
                <path
                  d="M20 2 L38 8 L38 24 C38 36 20 46 20 46 C20 46 2 36 2 24 L2 8 Z"
                  fill="url(#shieldGradient)"
                  stroke="url(#goldGradient)"
                  strokeWidth="2"
                />
                <defs>
                  {/* 盾牌渐变 - 翠绿主调 */}
                  <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                  {/* 金色边框渐变 */}
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fcd34d" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
              </svg>
              {/* 黑桃图标 - 居中偏上 */}
              <div className="relative z-10 text-white text-lg font-black drop-shadow-sm" style={{ marginTop: '-2px' }}>
                ♠
              </div>
            </div>
            {/* 悬停时的光晕效果 */}
            <div className="absolute inset-0 bg-amber-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
          </div>

          {/* Logo 文字区域 - 单行布局 */}
          <div className="hidden sm:flex items-center gap-3">
            {/* 主标题 */}
            <span className="text-xl font-black tracking-tight leading-none">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">145</span>
              <span className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent ml-0.5">联赛</span>
            </span>
            {/* Slogan + 可替换 Logo */}
            <div className="flex items-center gap-2 opacity-80">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold pt-0.5">Powered by</span>
              <img
                src="/favicon.png"
                alt="Logo"
                className="w-6 h-6 object-contain"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            </div>
          </div>
        </div>

        {/* 桌面端 Tab */}
        <div className="hidden md:flex items-center bg-slate-100/50 dark:bg-slate-800/50 rounded-full p-1 border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm mx-4">
          {TAB_CONFIG.map(t => (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              aria-label={t.label}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${activeTab === t.id
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
            >
              <Icon name={t.icon} className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {/* 右侧工具栏 */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:block text-right">
            <Clock />
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden lg:block"></div>
          <button
            onClick={onToggleTheme}
            aria-label={theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'light' ? (
              <Icon name="sun" className="w-5 h-5" />
            ) : (
              <Icon name="moon" className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
