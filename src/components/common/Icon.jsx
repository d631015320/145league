// src/components/common/Icon.jsx
import * as LucideIcons from 'lucide-react';

/**
 * 图标组件 - 封装 Lucide React 图标库
 * @param {{name: string, className?: string, onClick?: () => void}} props
 */
const Icon = ({ name, className = '', onClick }) => {
  // 如果没有名字，返回问号图标
  if (!name) return <LucideIcons.HelpCircle className={className} />;

  // 把 "layout-dashboard" 转成 "LayoutDashboard"
  const formatIconName = (str) => {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  };

  const iconName = formatIconName(name);

  // 从图标库取出对应组件
  const LucideIcon = LucideIcons[iconName];

  // 找不到就显示问号兜底
  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found, did you spell it right?`);
    return <LucideIcons.HelpCircle className={className} onClick={onClick} />;
  }

  return <LucideIcon className={className} onClick={onClick} />;
};

export default Icon;
