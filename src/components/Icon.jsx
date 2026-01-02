import React from 'react';
import * as LucideIcons from 'lucide-react';

const Icon = ({ name, className = "", onClick }) => {
    //如果没有名字，或者名字不对，返回一个问号图标
    if (!name) return <LucideIcons.HelpCircle className={className} />;

    // 🌟 核心魔法：把 "layout-dashboard" 这种名字自动转成 "LayoutDashboard" 组件
    const formatIconName = (str) => {
        return str
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
    };

    const iconName = formatIconName(name);
    
    // 从图标库里取出对应的组件
    const LucideIcon = LucideIcons[iconName];

    // 如果找不到对应的图标，就显示个“问号”兜底，防止报错
    if (!LucideIcon) {
        console.warn(`Icon "${name}" not found, did you spell it right?`);
        return <LucideIcons.HelpCircle className={className} onClick={onClick} />;
    }

    return <LucideIcon className={className} onClick={onClick} />;
};

export default Icon;