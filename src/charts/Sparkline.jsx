import React from 'react';

/**
 * 迷你趋势折线图组件
 * 根据趋势方向自动选择颜色：上升绿色，下降红色，平稳灰色
 */
const Sparkline = ({ data, color, height = 24, width = 60 }) => {
    if (!data || data.length < 2) {
        return <div style={{ width, height }} className="opacity-20 flex items-center justify-center text-[10px]">-</div>;
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const step = width / (data.length - 1);

    // 计算趋势：比较最后一个值和第一个值
    const firstVal = data[0];
    const lastVal = data[data.length - 1];
    const trend = lastVal - firstVal;

    // 根据趋势方向选择颜色
    let strokeColor = color;
    if (!color) {
        if (trend > 0) {
            strokeColor = '#10b981'; // 绿色 - 上升
        } else if (trend < 0) {
            strokeColor = '#f43f5e'; // 红色 - 下降
        } else {
            strokeColor = '#94a3b8'; // 灰色 - 持平
        }
    }

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
                cx={(data.length - 1) * step}
                cy={height - ((data[data.length - 1] - min) / range) * height}
                r="2"
                fill={strokeColor}
            />
        </svg>
    );
};

export default Sparkline;