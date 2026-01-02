import React from 'react';

const Sparkline = ({ data, color, height = 24, width = 60 }) => {
    if (!data || data.length < 2) {
        return <div style={{width, height}} className="opacity-20 flex items-center justify-center text-[10px]">-</div>;
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const step = width / (data.length - 1);
    
    // 如果没有传颜色，默认为灰色
    const strokeColor = color || '#94a3b8';
    
    // 计算 SVG 的折线点
    const points = data.map((d, i) => 
        `${i * step},${height - ((d - min) / range) * height}`
    ).join(' ');

    return (
        <svg width={width} height={height} className="overflow-visible">
            <polyline 
                points={points} 
                fill="none" 
                stroke={strokeColor} 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
            />
            {/* 最后一个点画一个小圆圈 */}
            <circle 
                cx={(data.length-1)*step} 
                cy={height - ((data[data.length-1] - min) / range) * height} 
                r="2" 
                fill={strokeColor} 
            />
        </svg>
    );
};

export default Sparkline;