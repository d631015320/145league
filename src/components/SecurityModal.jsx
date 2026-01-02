import React, { useState, useEffect } from 'react';
import Icon from './Icon';

const SecurityModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    const [password, setPassword] = useState('');
    
    useEffect(() => { 
        if (isOpen) document.body.classList.add('modal-open'); 
        else document.body.classList.remove('modal-open'); 
        return () => document.body.classList.remove('modal-open'); 
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-modal" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4 text-red-500">
                    <Icon name="shield-alert" className="w-8 h-8" />
                    <h2 className="text-xl font-bold">{title}</h2>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">{message}</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">确认管理员密码</label>
                        <input 
                            type="password" 
                            autoFocus
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className="input-pro w-full p-3 rounded-lg" 
                            placeholder="请输入登录密码..." 
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">取消</button>
                        <button 
                            onClick={() => onConfirm(password)} 
                            className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors shadow-lg"
                        >
                            确认执行
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityModal;