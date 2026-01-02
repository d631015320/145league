// src/lib/utils.js

// ================= 常量定义 =================
export const BASE_SCORES = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
export const GAMES_PER_SEASON = 10;
export const CHIP_EXCHANGE_RATE = 100;
export const BADGE_THRESHOLD = 1600;

// ================= 工具函数 =================

/**
 * 获取 ISO 周数
 */
export const getISOWeek = (dateString) => {
    const date = new Date(dateString);
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
    return `${d.getUTCFullYear()}-W${weekNo}`;
};

/**
 * 图片压缩
 */
export const compressImage = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const size = 150; 
                canvas.width = size;
                canvas.height = size;
                ctx.drawImage(img, 0, 0, size, size);
                resolve(canvas.toDataURL('image/jpeg', 0.85));
            };
        };
    });
};

/**
 * 核心算法：计算最小转账路径 (智能结算)
 * @param {Array} results - 比赛结果数组 [{name, chips, ...}]
 */
export const calculateSettlements = (results) => {
    let debtors = [];
    let creditors = [];
    
    // 1. 分离赢家和输家
    results.forEach(r => {
        const chips = parseFloat(r.chips);
        if (chips < 0) debtors.push({ name: r.name, amount: -chips }); // 输家欠的钱（转正数）
        else if (chips > 0) creditors.push({ name: r.name, amount: chips }); // 赢家该得的钱
    });

    // 2. 排序：欠得多的和赢得多的先结算，效率最高
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const transactions = [];
    let i = 0; 
    let j = 0;

    // 3. 双指针抵消算法
    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        
        // 取两者最小值作为转账额
        const amount = Math.min(debtor.amount, creditor.amount);
        
        if (amount > 0) {
            transactions.push({ 
                from: debtor.name, 
                to: creditor.name, 
                amount: parseFloat(amount.toFixed(2)) 
            });
        }

        // 更新剩余金额
        debtor.amount -= amount;
        creditor.amount -= amount;

        // 如果一方结清了，指针后移
        if (debtor.amount < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }
    
    return transactions;
};