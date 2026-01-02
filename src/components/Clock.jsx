import React, { useState, useEffect } from 'react';

const Clock = () => {
    const [time, setTime] = useState(new Date());
    
    useEffect(() => { 
        const timer = setInterval(() => setTime(new Date()), 1000); 
        return () => clearInterval(timer); 
    }, []);

    return (
        <div className="flex flex-col items-end leading-tight select-none">
            <div className="text-xl font-bold font-clock tracking-widest text-slate-700 dark:text-slate-200">
                {time.toLocaleTimeString('zh-CN', { hour12: false })}
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wide">
                {time.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' })}
            </div>
        </div>
    );
};

export default Clock;