import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto'; // 引入我们刚安装的库

const ProRadarChart = ({ stats, compareStats, compareName, isDark }) => {
    const canvasRef = useRef(null);
    const chartInstance = useRef(null); // 用来存图表实例，不污染全局

    useEffect(() => {
        if (!canvasRef.current) return;
        
        // 1. 销毁旧图表 (防止重影)
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = canvasRef.current.getContext('2d');
        
        // 样式配置
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
        const textColor = isDark ? '#94a3b8' : '#64748b';
        
        // 数据集 1: 当前选手
        const datasets = [{
            label: '当前选手',
            data: stats.map(s => s.value),
            backgroundColor: 'rgba(16, 185, 129, 0.2)', // Emerald
            borderColor: '#10b981',
            pointBackgroundColor: '#10b981',
            borderWidth: 2,
            pointRadius: 2
        }];

        // 数据集 2: 对比选手 (如果有)
        if (compareStats && compareStats.length > 0) {
            datasets.push({
                label: compareName || '对比选手',
                data: compareStats.map(s => s.value),
                backgroundColor: 'rgba(244, 63, 94, 0.2)', // Rose
                borderColor: '#f43f5e',
                pointBackgroundColor: '#f43f5e',
                borderWidth: 2,
                pointRadius: 2
            });
        }

        // 2. 创建新图表
        chartInstance.current = new Chart(ctx, {
            type: 'radar',
            data: { 
                labels: stats.map(s => s.label), 
                datasets: datasets 
            },
            options: { 
                layout: { padding: 20 },
                scales: { 
                    r: { 
                        angleLines: { color: gridColor }, 
                        grid: { color: gridColor }, 
                        pointLabels: { 
                            color: textColor, 
                            font: { size: 11, family: 'Inter', weight: 'bold' } 
                        }, 
                        suggestedMin: 0,
                        suggestedMax: 10,
                        min: 0,
                        max: 10,
                        ticks: { 
                            stepSize: 2,
                            display: false, 
                            backdropColor: 'transparent'
                        } 
                    } 
                }, 
                plugins: { legend: { display: !!compareStats } },
                maintainAspectRatio: false 
            }
        });

        // 组件卸载时清理
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [stats, compareStats, compareName, isDark]);

    return <div className="h-64 w-full"><canvas ref={canvasRef} /></div>;
};

export default ProRadarChart;