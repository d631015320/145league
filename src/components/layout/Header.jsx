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
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Icon name="spade" className="w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-black tracking-tight hidden sm:block">
            145 <span className="text-emerald-500">联赛</span>
          </span>
        </div>

        {/* 桌面端 Tab */}
        <div className="hidden md:flex items-center bg-slate-100/50 dark:bg-slate-800/50 rounded-full p-1 border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm mx-4">
          {TAB_CONFIG.map(t => (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              aria-label={t.label}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                activeTab === t.id
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
