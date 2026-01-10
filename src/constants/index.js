// src/constants/index.js
// 应用常量配置中心

/**
 * 勋章与游戏规则配置
 */
export const BADGE_CONFIG = {
  /** 神经刀：单场狂揽多少筹码 */
  NERVE_KNIFE_LIMIT: 2000,
  /** 慈善家：单场输掉多少筹码算慈善（正数，逻辑里会自动取负） */
  CHARITY_THRESHOLD: 2000,
  /** 逆风翻盘：买入超过多少，最后还能赢钱 */
  COMEBACK_BUYIN_THRESHOLD: 2400,
  /** 统治者：胜率门槛 (0.3 代表 30%) */
  RULER_WIN_RATE: 0.3,
  /** 老兵：至少打多少场 */
  VETERAN_GAMES: 10,
  /** 意难平：拿多少次第二名 */
  SECOND_PLACE_COUNT: 3
};

/** 一个赛季的比赛场数 */
export const GAMES_PER_SEASON = 10;

/** 筹码汇率 */
export const CHIP_EXCHANGE_RATE = 100;

/** 排名基础分数 (1-10名) */
export const BASE_SCORES = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

/**
 * Tab 配置
 */
export const TAB_CONFIG = [
  { id: 'dashboard', label: '总览', icon: 'layout-dashboard' },
  { id: 'leaderboard', label: '排行', icon: 'trophy' },
  { id: 'history', label: '历史', icon: 'history' },
  { id: 'newGame', label: '录入', icon: 'plus-circle' },
  { id: 'settings', label: '设置', icon: 'settings' }
];

/**
 * 错误消息映射
 */
export const ERROR_MESSAGES = {
  'permission-denied': '权限不足，请联系管理员',
  'unavailable': '服务暂时不可用，请稍后重试',
  'network-request-failed': '网络连接失败，请检查网络',
  'invalid-argument': '数据格式错误，请检查输入',
  'not-found': '数据不存在',
  'already-exists': '数据已存在',
  'default': '操作失败，请重试'
};

/**
 * 网络超时时间 (毫秒)
 */
export const NETWORK_TIMEOUT = 5000;
