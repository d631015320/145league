// src/lib/utils.js
/**
 * @fileoverview 工具函数模块
 * @description 包含核心工具函数（常量已移至 constants/index.js）
 */

// 为了向后兼容，从 constants 重新导出常量
export { BADGE_CONFIG, GAMES_PER_SEASON, CHIP_EXCHANGE_RATE, BASE_SCORES } from '../constants';

// ================= 工具函数 =================

/**
 * 获取日期对应的 ISO 周数
 * @description 根据 ISO 8601 标准计算周数，周一为每周第一天
 * @param {string} dateString - 日期字符串，格式为 YYYY-MM-DD
 * @returns {string} ISO 周数字符串，格式为 "YYYY-WN"（如 "2025-W2"）
 * @example
 * getISOWeek('2025-01-11') // 返回 "2025-W2"
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
 * 压缩图片到指定尺寸
 * @description 将图片压缩为 150x150 像素的 JPEG 格式，质量为 85%
 * @param {File} file - 要压缩的图片文件对象
 * @returns {Promise<string>} 压缩后的 Base64 编码图片数据
 * @example
 * const input = document.querySelector('input[type="file"]');
 * const compressedImage = await compressImage(input.files[0]);
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
 * 计算最小转账路径（智能结算算法）
 * @description 使用双指针算法计算最优的转账路径，最小化转账次数
 * 
 * 算法原理：
 * 1. 将玩家分为输家（debtors）和赢家（creditors）
 * 2. 按金额从大到小排序
 * 3. 使用双指针依次匹配，每次取两者最小值进行转账
 * 4. 直到所有债务清零
 * 
 * @param {Array<{name: string, chips: number}>} results - 比赛结果数组
 * @param {string} results[].name - 玩家名称
 * @param {number} results[].chips - 筹码盈亏（正数为赢，负数为输）
 * @returns {Array<{from: string, to: string, amount: number}>} 转账记录数组
 * @returns {string} return[].from - 付款方（输家）
 * @returns {string} return[].to - 收款方（赢家）
 * @returns {number} return[].amount - 转账金额（正数）
 * 
 * @example
 * const results = [
 *   { name: 'Alice', chips: 500 },
 *   { name: 'Bob', chips: -300 },
 *   { name: 'Charlie', chips: -200 }
 * ];
 * const settlements = calculateSettlements(results);
 * // 返回: [
 * //   { from: 'Bob', to: 'Alice', amount: 300 },
 * //   { from: 'Charlie', to: 'Alice', amount: 200 }
 * // ]
 */
export const calculateSettlements = (results) => {
    const debtors = [];
    const creditors = [];
    
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
