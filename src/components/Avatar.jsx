import React from 'react';

const Avatar = ({ name, src, size = "md", className = "", bordered = true }) => {
    // 尺寸配置字典
    const sizeClasses = { 
        sm: "w-8 h-8 text-xs", 
        md: "w-10 h-10 text-xs", 
        lg: "w-16 h-16 text-lg", 
        xl: "w-24 h-24 text-2xl", 
        xxl: "w-32 h-32 text-4xl" 
    };

    const borderClass = bordered ? "border-2 border-slate-200 dark:border-slate-700" : "";
    
    return (
        <div className={`${sizeClasses[size]} rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-800 ${borderClass} ${className} relative shadow-sm`}>
            {src ? (
                <img src={src} alt={name} className="w-full h-full object-cover" />
            ) : (
                <span className="font-bold text-slate-400 select-none">
                    {name ? name[0].toUpperCase() : '?'}
                </span>
            )}
        </div>
    );
};

export default Avatar;