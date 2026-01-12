import { useEffect, useRef } from 'react';
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
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#10b981',
            pointHoverRadius: 8,
            pointHoverBorderWidth: 3,
            borderWidth: 2,
            pointRadius: 4
        }];

        // 数据集 2: 对比选手 (如果有)
        if (compareStats && compareStats.length > 0) {
            datasets.push({
                label: compareName || '对比选手',
                data: compareStats.map(s => s.value),
                backgroundColor: 'rgba(244, 63, 94, 0.2)', // Rose
                borderColor: '#f43f5e',
                pointBackgroundColor: '#f43f5e',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#f43f5e',
                pointHoverRadius: 8,
                pointHoverBorderWidth: 3,
                borderWidth: 2,
                pointRadius: 4
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
                            font: { size: 11, family: 'Inter', weight: 'bold' },
                            padding: 10
                        },
                        suggestedMin: 0,
                        suggestedMax: 100,
                        min: 0,
                        max: 100,
                        ticks: {
                            stepSize: 20,
                            display: false,
                            backdropColor: 'transparent'
                        }
                    }
                },
                plugins: {
                    legend: { display: !!compareStats },
                    tooltip: {
                        enabled: true,
                        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        titleColor: isDark ? '#f1f5f9' : '#0f172a',
                        bodyColor: isDark ? '#94a3b8' : '#64748b',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 12,
                        titleFont: { size: 13, weight: 'bold' },
                        bodyFont: { size: 12 },
                        displayColors: true,
                        callbacks: {
                            title: (items) => {
                                if (!items.length) return '';
                                const index = items[0].dataIndex;
                                return stats[index]?.label || '';
                            },
                            label: (item) => {
                                const value = item.raw.toFixed(1);
                                // 计算排名百分位（值本身就是百分位）
                                let rank = '';
                                if (item.raw >= 95) rank = '👑 王者级';
                                else if (item.raw >= 85) rank = '💎 钻石级';
                                else if (item.raw >= 75) rank = '💚 翡翠级';
                                else if (item.raw >= 60) rank = '🔷 铂金级';
                                else if (item.raw >= 45) rank = '🥇 黄金级';
                                else if (item.raw >= 30) rank = '🥈 白银级';
                                else rank = '🥉 青铜级';

                                return `${item.dataset.label}: ${value} (${rank})`;
                            },
                            afterBody: (items) => {
                                if (!items.length) return '';
                                const index = items[0].dataIndex;
                                const stat = stats[index];
                                if (stat?.description) {
                                    return '\n📊 ' + stat.description;
                                }
                                return '';
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                hover: {
                    mode: 'index',
                    intersect: false
                },
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

    return (
        <div className="h-64 w-full cursor-crosshair">
            <canvas ref={canvasRef} />
        </div>
    );
};

export default ProRadarChart;