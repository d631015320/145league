# 系统架构

## 整体架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                         🎨 Presentation Layer                        │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐            │
│  │   📑 Tabs     │  │   💬 Modals   │  │   📊 Charts   │            │
│  │  Components   │  │  Components   │  │  Components   │            │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘            │
└──────────┼──────────────────┼──────────────────┼────────────────────┘
           │                  │                  │
           ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        🧠 Business Logic Layer                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                      Custom Hooks                               ││
│  │  useStatsCalculator │ useLeagueStats │ useFirebaseData          ││
│  └─────────────────────────────┬───────────────────────────────────┘│
└────────────────────────────────┼────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          💾 Data Layer                               │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │              Firebase Service Layer                             ││
│  │         (Firestore CRUD + Realtime Sync)                        ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

## 目录结构

```
league-app/
├── electron/                    # Electron 主进程
│   ├── main.cjs                 # 主进程入口
│   └── preload.cjs              # 预加载脚本
│
├── public/                      # 静态资源
│   └── favicon.png              # 应用图标
│
├── src/                         # 源代码目录
│   ├── main.jsx                 # 应用入口
│   ├── App.jsx                  # 根组件
│   ├── index.css                # 全局样式
│   │
│   ├── components/              # 组件目录
│   │   ├── common/              # 通用组件 (Avatar, Icon, Clock, ErrorBoundary)
│   │   ├── layout/              # 布局组件 (Header, BottomNav)
│   │   ├── modals/              # 弹窗组件
│   │   └── tabs/                # 页面组件
│   │
│   ├── charts/                  # 图表组件
│   ├── hooks/                   # 自定义 Hooks
│   ├── services/                # 服务层
│   ├── lib/                     # 工具库
│   ├── constants/               # 常量定义
│   ├── types/                   # 类型定义
│   └── __tests__/               # 测试文件
│
├── docs/                        # 项目文档
└── ...配置文件
```

## Custom Hooks

| Hook | 职责 | 输入 | 输出 |
|:-----|:-----|:-----|:-----|
| `useStatsCalculator` | 玩家统计计算 | 比赛记录数组 | 场均分、胜率、战力值等 |
| `useLeagueStats` | 联盟极值计算 | 玩家列表 | 最高/最低各项指标 |
| `useFirebaseData` | 实时数据订阅 | 集合路径 | 实时数据流 |
| `useTheme` | 主题状态管理 | - | 主题状态、切换方法 |

## 数据模型 (Ref: src/types/index.js)
```javascript
// 玩家统计数据 (PlayerStats)
const PlayerStats = {
  name: 'string',         // 玩家网名
  gamesPlayed: 0,         // 参赛场次
  totalScore: 0,          // 总积分
  totalChips: 0,          // 总盈亏
  wins: 0,                // 胜场数(第一名)
  powerScore: 0,          // 综合战力值
  avgScore: 'string',     // 场均分 (格式化)
  goldContent: 'string',  // 含金量
  votedMvpCount: 0,       // MVP 次数
  luckyCount: 0,          // 运气王次数
  recentTrend: [],        // 得分走势
  avatar: 'string'        // 头像
}

// 比赛记录 (Match)
const Match = {
  id: 'string',           // 唯一ID
  date: 'string',         // 日期 (YYYY-MM-DD)
  totalPlayers: 0,        // 总人数
  results: [],            // PlayerResult[] (排名、分数、净盈亏)
  transactions: [],       // Transaction[] (买入流水)
  finalStacks: {},        // {name: amount} 离场筹码
  votedMvp: 'string',     // MVP玩家
  luckyPlayer: 'string'   // 运气王玩家
}
```
