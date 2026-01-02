import React from 'react';
import Icon from './Icon';
import Avatar from './Avatar';
import { calculateSettlements, CHIP_EXCHANGE_RATE } from '../lib/utils'; // 注意路径 ../

const SettlementModal = ({ data, profiles, onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-modal" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="bg-emerald-600 p-4 text-white flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2"><Icon name="banknote" className="w-5 h-5"/> 智能结算方案</h3>
                    <button onClick={onClose}><Icon name="x" className="w-5 h-5"/></button>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">比赛日期</div>
                    <div className="font-bold text-slate-800 dark:text-white">{data.date}</div>
                </div>
                <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
                    {calculateSettlements(data.results).length === 0 ? (
                        <div className="text-center text-slate-400 py-4">本局无需转账 (平局或数据为0)</div>
                    ) : (
                        calculateSettlements(data.results).map((t, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                                <div className="flex items-center gap-3 z-10">
                                    <Avatar name={t.from} src={profiles[t.from]?.avatar} size="sm" bordered={false} />
                                    <div className="text-sm">
                                        <div className="font-bold text-slate-700 dark:text-slate-200">{t.from}</div>
                                        {profiles[t.from]?.realName && <div className="text-[10px] text-slate-400">({profiles[t.from].realName})</div>}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center z-10 px-2">
                                    <div className="text-[10px] text-slate-400 mb-1">支付给</div>
                                    <Icon name="arrow-right" className="w-4 h-4 text-slate-300"/>
                                </div>
                                <div className="flex items-center gap-3 z-10 flex-row-reverse">
                                    <Avatar name={t.to} src={profiles[t.to]?.avatar} size="sm" bordered={false} />
                                    <div className="text-right text-sm">
                                        <div className="font-bold text-slate-700 dark:text-slate-200">{t.to}</div>
                                        {profiles[t.to]?.realName && <div className="text-[10px] text-slate-400">({profiles[t.to].realName})</div>}
                                        <div className="text-emerald-600 dark:text-emerald-400 font-mono font-black mt-0.5">
                                            ¥{(t.amount / CHIP_EXCHANGE_RATE).toFixed(2)}
                                        </div>
                                        <div className="text-[9px] text-slate-400">{t.amount} 筹码</div>
                                    </div>
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-[10px] text-slate-400">系统已自动计算最优转账路径，仅管理员可见</p>
                </div>
            </div>
        </div>
    );
};

export default SettlementModal;