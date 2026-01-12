import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { calculatePowerScore, getAttendanceTier } from '../hooks/useRadarStats';

const CareerChart = ({ history, isDark, leagueStats }) => {
    const canvasRef = useRef(null);
    const chartInstance = useRef(null);
    const [metric, setMetric] = useState('powerScore'); // 'powerScore' | 'avgScore' | 'goldContent'

    // 少于2场时显示提示
    if (!history || history.length < 2) {
        return (
            <div className="w-full">
                <div className="flex justify-end mb-2">
                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex text-xs font-bold">
                        <button className="px-3 py-1 rounded-md bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm">
                            场均得分
                        </button>
                        <button className="px-3 py-1 rounded-md text-slate-400">
                            含金量
                        </button>
                    </div>
                </div>
                <div className="h-48 w-full flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                    <div className="text-center text-slate-400 dark:text-slate-500">
                        <div className="text-2xl mb-2">📈</div>
                        <div className="text-sm">至少需要2场比赛才能显示走势</div>
                    </div>
                </div>
            </div>
        );
    }

    useEffect(() => {
        if (!canvasRef.current) return;

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = canvasRef.current.getContext('2d');

        // 计算数据点
        const dataPoints = history.map((_, i) => {
            const gamesPlayed = i + 1;
            const slice = history.slice(0, gamesPlayed);

            if (metric === 'powerScore') {
                // 计算截至该场的战力
                const totalScore = slice.reduce((sum, h) => sum + (h.result?.score || 0), 0);
                const totalChips = slice.reduce((sum, h) => sum + parseFloat(h.result?.chips || 0), 0);
                const wins = slice.filter(h => h.result?.rank === 1).length;
                const chipWins = slice.filter(h => parseFloat(h.result?.chips || 0) > 0).length;
                const sumPlayers = slice.reduce((sum, h) => sum + (h.totalPlayers || 8), 0);
                const ranks = slice.map(h => h.result?.rank || 4);
                const chipsList = slice.map(h => parseFloat(h.result?.chips || 0));
                const sumBeatRate = slice.reduce((sum, h) => {
                    const tp = h.totalPlayers || 8;
                    return sum + (tp > 1 ? (tp - (h.result?.rank || 4)) / (tp - 1) : 0);
                }, 0);

                const attendanceRate = gamesPlayed / history.length;
                const attendanceTier = getAttendanceTier(attendanceRate);
                const activeCoeff = attendanceTier.coeff;

                return calculatePowerScore({
                    gamesPlayed,
                    totalScore,
                    totalChips,
                    wins,
                    sumBeatRate,
                    chipWins,
                    mvpCount: 0,
                    sumPlayers,
                    ranks,
                    chipsList
                }, leagueStats, activeCoeff, history.length);
            } else if (metric === 'avgScore') {
                const totalScore = slice.reduce((sum, h) => sum + (h.result?.score || 0), 0);
                return totalScore / gamesPlayed;
            } else {
                // 含金量 = 总筹码 / 总积分
                const totalScore = slice.reduce((sum, h) => sum + (h.result?.score || 0), 0);
                const totalChips = slice.reduce((sum, h) => sum + parseFloat(h.result?.chips || 0), 0);
                return totalScore !== 0 ? totalChips / totalScore : 0;
            }
        });

        const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        const textColor = isDark ? '#64748b' : '#94a3b8';

        // 颜色配置
        const colorConfig = metric === 'powerScore'
            ? { border: '#10b981', bgStart: 'rgba(16, 185, 129, 0.4)', bgEnd: 'rgba(16, 185, 129, 0)' }
            : metric === 'avgScore'
                ? { border: '#3b82f6', bgStart: 'rgba(59, 130, 246, 0.4)', bgEnd: 'rgba(59, 130, 246, 0)' }
                : { border: '#eab308', bgStart: 'rgba(234, 179, 8, 0.4)', bgEnd: 'rgba(234, 179, 8, 0)' };

        chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: history.map((_, i) => `R${i + 1}`),
                datasets: [{
                    label: metric === 'powerScore' ? '战力' : metric === 'avgScore' ? '场均得分' : '含金量',
                    data: dataPoints,
                    borderColor: colorConfig.border,
                    backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                        gradient.addColorStop(0, colorConfig.bgStart);
                        gradient.addColorStop(1, colorConfig.bgEnd);
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
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor, maxTicksLimit: 6 }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textColor },
                        // 动态计算Y轴范围，留出适当边距（含金量可能为负）
                        min: (() => {
                            const minVal = Math.min(...dataPoints)
                            // 负数时向下扩展，正数时从0开始或稍低
                            return minVal < 0 ? Math.floor(minVal * 1.1) : Math.max(0, Math.floor(minVal * 0.9))
                        })(),
                        suggestedMax: Math.ceil(Math.max(...dataPoints) * 1.1)
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [history, isDark, metric]);

    return (
        <div className="w-full">
            <div className="flex justify-end mb-2">
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex text-xs font-bold">
                    <button
                        onClick={() => setMetric('powerScore')}
                        className={`px-3 py-1 rounded-md transition-all ${metric === 'powerScore'
                            ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                    >
                        战力
                    </button>
                    <button
                        onClick={() => setMetric('avgScore')}
                        className={`px-3 py-1 rounded-md transition-all ${metric === 'avgScore'
                            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                    >
                        场均得分
                    </button>
                    <button
                        onClick={() => setMetric('goldContent')}
                        className={`px-3 py-1 rounded-md transition-all ${metric === 'goldContent'
                            ? 'bg-white dark:bg-slate-700 text-yellow-600 dark:text-yellow-400 shadow-sm'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                    >
                        含金量
                    </button>
                </div>
            </div>
            <div className="h-48 w-full">
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
};

export default CareerChart;