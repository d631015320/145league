import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const CareerChart = ({ history, isDark }) => {
    const canvasRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = canvasRef.current.getContext('2d');
        
        // 计算累计积分
        let cumulativeScore = 0;
        const dataPoints = history.map(h => { 
            cumulativeScore += h.score; 
            return cumulativeScore; 
        });

        const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        const textColor = isDark ? '#64748b' : '#94a3b8';

        chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: { 
                labels: history.map((_, i) => `R${i+1}`), 
                datasets: [{ 
                    label: '总积分累计', 
                    data: dataPoints, 
                    borderColor: '#3b82f6', 
                    // 渐变填充效果
                    backgroundColor: (context) => { 
                        const ctx = context.chart.ctx; 
                        const gradient = ctx.createLinearGradient(0, 0, 0, 200); 
                        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)'); 
                        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)'); 
                        return gradient; 
                    }, 
                    fill: true, 
                    tension: 0.4, 
                    borderWidth: 2, 
                    pointRadius: 0 
                }] 
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } }, 
                scales: { 
                    x: { 
                        grid: { display: false }, 
                        ticks: { color: textColor, maxTicksLimit: 6 } 
                    }, 
                    y: { 
                        grid: { color: gridColor }, 
                        ticks: { color: textColor } 
                    } 
                } 
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [history, isDark]);

    return <div className="h-48 w-full"><canvas ref={canvasRef} /></div>;
};

export default CareerChart;