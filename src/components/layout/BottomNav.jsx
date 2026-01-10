// src/components/layout/BottomNav.jsx
import Icon from '../common/Icon';
import { TAB_CONFIG } from '../../constants';

/**
 * 移动端底部导航栏组件
 * @param {{activeTab: string, onTabChange: (tab: string) => void}} props
 */
const BottomNav = ({ activeTab, onTabChange }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#0b0e14]/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 p-2 z-50 flex justify-around safe-area-bottom">
      {TAB_CONFIG.map(t => (
        <button
          key={t.id}
          onClick={() => onTabChange(t.id)}
          aria-label={t.label}
          className={`p-3 rounded-xl flex flex-col items-center gap-1 ${
            activeTab === t.id
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10'
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <Icon name={t.icon} className="w-6 h-6" />
        </button>
      ))}
    </div>
  );
};

export default BottomNav;
