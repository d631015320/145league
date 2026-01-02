import React from 'react';
import Icon from './Icon';
import Avatar from './Avatar';
import { calculateSettlements, CHIP_EXCHANGE_RATE } from '../lib/utils';

const SettlementModal = ({ data, profiles, onClose }) => {
    // 重新计算转账列表
    const transactions = calculateSettlements(data.results);
    const totalFlow = transactions.reduce((acc, t) => acc + t.amount, 0);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-modal" onClick={onClose}>
            {/* 这里的 onClick stopPropagation 防止点击弹窗内部关闭 */}
            <div className="w-full max-w-md relative" onClick={e => e.stopPropagation()}>
                
                {/* 关闭按钮 (悬浮在右上角) */}
                <button 
                    onClick={onClose} 
                    className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
                >
                    <Icon name="x" className="w-6 h-6"/>
                </button>

                {/* === 票据主体 === */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    
                    {/* 1. 顶部 Header (渐变背景) */}
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Icon name="banknote" className="w-32 h-32 rotate-12"/>
                        </div>
                        <div className="relative z-10 text-center">
                            <div className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">OFFICIAL SETTLEMENT</div>
                            <h2 className="text-2xl font-black tracking-tight">本场结算单</h2>
                            <div className="mt-2 text-emerald-100/80 font-mono text-sm">{data.date}</div>
                        </div>
                    </div>

                    {/* 2. 统计概览 */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 flex justify-between items-center border-b border-dashed border-slate-300 dark:border-slate-700">
                        <div className="text-center flex-1 border-r border-slate-200 dark:border-slate-700 last:border-0">
                            <div className="text-[12px] text-slate-400 uppercase font-bold">总筹码流水</div>
                            <div className="text-lg font-black text-slate-700 dark:text-slate-200">{totalFlow} <span className="text-xs font-normal text-slate-400"></span></div>
                        </div>
                        <div className="text-center flex-1">
                            <div className="text-[12px] text-slate-400 uppercase font-bold">转账笔数</div>
                            <div className="text-lg font-black text-slate-700 dark:text-slate-200">{transactions.length}</div>
                        </div>
                    </div>

                    {/* 3. 转账列表区域 */}
                    <div className="max-h-[55vh] overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-[#0b0e14]/50">
                        {transactions.length === 0 ? (
                            <div className="text-center py-10 opacity-50">
                                <Icon name="check-circle" className="w-12 h-12 mx-auto mb-2 text-emerald-500"/>
                                <p className="text-slate-500 font-bold">和平收场，无需转账</p>
                            </div>
                        ) : (
                            transactions.map((t, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between relative overflow-hidden group">
                                    
                                    {/* 输家 (左) */}
                                    <div className="flex flex-col items-center gap-2 w-20 z-10">
                                        <div className="relative">
                                            <Avatar name={t.from} src={profiles[t.from]?.avatar} size="md" className="border-2 border-red-100 dark:border-red-900/30" />
                                            <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[9px] px-1 rounded-sm font-bold">付</div>
                                        </div>
                                        <div className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate w-full text-center">
                                            {profiles[t.from]?.realName || t.from}
                                        </div>
                                    </div>

                                    {/* 中间：金额与箭头 */}
                                    <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-2">
                                        {/* 箭头动画背景 */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-10 text-emerald-500">
                                            <Icon name="chevrons-right" className="w-full h-8 animate-pulse"/>
                                        </div>
                                        
                                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                                            <span className="text-base mr-0.5">¥</span>
                                            {(t.amount / CHIP_EXCHANGE_RATE).toFixed(2)}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-full mt-1">
                                            {t.amount} 筹码
                                        </div>
                                    </div>

                                    {/* 赢家 (右) */}
                                    <div className="flex flex-col items-center gap-2 w-20 z-10">
                                        <div className="relative">
                                            <Avatar name={t.to} src={profiles[t.to]?.avatar} size="md" className="border-2 border-emerald-100 dark:border-emerald-900/30" />
                                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[9px] px-1 rounded-sm font-bold">收</div>
                                        </div>
                                        <div className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate w-full text-center">
                                            {profiles[t.to]?.realName || t.to}
                                        </div>
                                    </div>

                                </div>
                            ))
                        )}
                    </div>

                    {/* 4. 底部 Footer */}
                    <div className="p-3 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 text-center">
                        <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                            <Icon name="shield-check" className="w-3 h-3"/>
                            由系统自动生成，如有疑问请联系管理员。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettlementModal;