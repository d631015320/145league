<p align="center">
  <img src="public/favicon.png" alt="145 League Logo" width="120" height="120">
</p>

<h1 align="center">145 联赛管理系统</h1>

<p align="center">
  <strong>专业级扑克联赛数据管理与分析平台</strong>
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#系统架构">系统架构</a> •
  <a href="#开发指南">开发指南</a> •
  <a href="#贡献指南">贡献指南</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Vite-7.2.4-646CFF?style=flat-square&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind">
  <img src="https://img.shields.io/badge/Firebase-12.7.0-FFCA28?style=flat-square&logo=firebase" alt="Firebase">
  <img src="https://img.shields.io/badge/Electron-39.2.7-47848F?style=flat-square&logo=electron" alt="Electron">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
</p>

---

## 📋 概述

145 联赛管理系统是一款现代化的扑克联赛数据管理平台，提供完整的比赛记录、玩家统计分析、实时排行榜和数据可视化功能。系统采用 React 19 + Firebase 技术栈构建，支持 Web 和 Electron 桌面端双平台部署。

## ✨ 功能特性

| 模块 | 功能描述 |
|:-----|:---------|
| 📊 **数据仪表盘** | 实时联赛概览、关键指标监控、趋势分析 |
| 🏆 **智能排行榜** | 多维度排序、战力值算法、玩家对比分析 |
| 📝 **比赛历史** | 完整比赛记录、详情查看、数据导出 |
| ➕ **快速录入** | 一键录入比赛结果、智能校验、批量操作 |
| 👤 **玩家档案** | 个人数据统计、生涯曲线、雷达图分析 |
| ⚙️ **系统设置** | 主题切换、数据管理、权限控制 |

### 核心亮点

- 🎯 **实时数据同步** - 基于 Firebase Realtime 的毫秒级数据更新
- 📈 **专业数据可视化** - Chart.js 驱动的交互式图表
- 🌓 **深色/浅色主题** - 自适应系统偏好的主题切换
- 📱 **响应式设计** - 完美适配桌面、平板、移动设备
- 🖥️ **跨平台支持** - Web + Electron 双端部署
- ⚡ **极致性能** - Vite 构建，首屏加载 < 1s

## 🛠️ 技术栈

### 前端框架
| 技术 | 版本 | 用途 |
|:-----|:-----|:-----|
| React | 19.2.0 | UI 框架 |
| Vite | 7.2.4 | 构建工具 |
| Tailwind CSS | 3.4.17 | 样式框架 |

### 后端服务
| 技术 | 版本 | 用途 |
|:-----|:-----|:-----|
| Firebase Firestore | 12.7.0 | 实时数据库 |
| Firebase Auth | 12.7.0 | 用户认证 |

### 桌面端
| 技术 | 版本 | 用途 |
|:-----|:-----|:-----|
| Electron | 39.2.7 | 桌面应用框架 |

### 测试框架
| 技术 | 版本 | 用途 |
|:-----|:-----|:-----|
| Vitest | 4.0.16 | 单元测试 |
| Testing Library | 16.3.1 | 组件测试 |
| fast-check | 4.5.3 | 属性测试 |

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 或 **yarn** >= 1.22.0

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/your-org/league-app.git
cd league-app

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入 Firebase 配置
```

### Firebase 配置

1. 访问 [Firebase Console](https://console.firebase.google.com/) 创建项目
2. 启用 **Firestore Database** 和 **Authentication**
3. 获取项目配置并更新 `src/lib/firebase.js`

```javascript
// src/lib/firebase.js
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
}
```

### 启动应用

```bash
# Web 开发模式
npm run web

# Electron 开发模式
npm run dev

# 生产构建
npm run build

# 预览生产版本
npm run preview
```

### 测试

```bash
# 运行所有测试
npm test

# 监听模式
npm run test:watch

# 覆盖率报告
npm run test:coverage

# 代码检查
npm run lint
```

## 🏗️ 系统架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Tabs      │  │   Modals    │  │   Charts    │              │
│  │  Components │  │  Components │  │  Components │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
┌─────────┼────────────────┼────────────────┼─────────────────────┐
│         ▼                ▼                ▼                      │
│                    Business Logic Layer                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Custom Hooks                          │    │
│  │  useStatsCalculator │ useLeagueStats │ useFirebaseData  │    │
│  └─────────────────────────────┬───────────────────────────┘    │
└────────────────────────────────┼────────────────────────────────┘
                                 │
┌────────────────────────────────┼────────────────────────────────┐
│                                ▼                                 │
│                         Data Layer                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Firebase Service Layer                      │    │
│  │         (Firestore CRUD + Realtime Sync)                │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 目录结构

```
league-app/
├── electron/                    # Electron 主进程
│   ├── main.cjs                 # 主进程入口
│   └── preload.cjs              # 预加载脚本
├── public/                      # 静态资源
├── src/
│   ├── main.jsx                 # 应用入口
│   ├── App.jsx                  # 根组件
│   ├── index.css                # 全局样式
│   ├── components/
│   │   ├── common/              # 通用组件
│   │   │   ├── Avatar.jsx       # 头像组件
│   │   │   ├── Icon.jsx         # 图标组件
│   │   │   ├── Clock.jsx        # 时钟组件
│   │   │   └── ErrorBoundary.jsx
│   │   ├── layout/              # 布局组件
│   │   │   ├── Header.jsx
│   │   │   └── BottomNav.jsx
│   │   ├── modals/              # 弹窗组件
│   │   │   ├── PlayerProfileModal.jsx
│   │   │   ├── HeadToHead.jsx
│   │   │   ├── SecurityModal.jsx
│   │   │   └── SettlementModal.jsx
│   │   └── tabs/                # 页面组件
│   │       ├── Dashboard.jsx
│   │       ├── Leaderboard.jsx
│   │       ├── MatchHistory.jsx
│   │       ├── NewGameForm.jsx
│   │       └── Settings.jsx
│   ├── charts/                  # 图表组件
│   │   ├── CareerChart.jsx      # 生涯曲线图
│   │   ├── ProRadarChart.jsx    # 能力雷达图
│   │   └── Sparkline.jsx        # 迷你趋势图
│   ├── hooks/                   # 自定义 Hooks
│   │   ├── useStatsCalculator.js
│   │   ├── useLeagueStats.js
│   │   ├── useFirebaseData.js
│   │   └── useTheme.js
│   ├── services/                # 服务层
│   │   └── firebase.service.js
│   ├── lib/                     # 工具库
│   │   ├── firebase.js          # Firebase 配置
│   │   └── utils.js             # 工具函数
│   ├── constants/               # 常量定义
│   │   └── index.js
│   ├── types/                   # 类型定义
│   │   └── index.js
│   └── __tests__/               # 测试文件
│       ├── components/
│       ├── hooks/
│       └── utils/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── vitest.config.js
└── eslint.config.js
```

## 📚 核心模块

### Custom Hooks

| Hook | 职责 | 输入 | 输出 |
|:-----|:-----|:-----|:-----|
| `useStatsCalculator` | 玩家统计计算 | 比赛记录 | 场均分、胜率、战力值 |
| `useLeagueStats` | 联盟极值计算 | 玩家列表 | 最高/最低各项指标 |
| `useFirebaseData` | 实时数据订阅 | 集合路径 | 实时数据流 |
| `useTheme` | 主题状态管理 | - | 主题状态、切换方法 |

### 数据模型

```javascript
// 玩家数据结构
Player {
  id: string
  name: string
  avatar: string
  stats: {
    totalGames: number
    totalScore: number
    avgScore: number
    winRate: number
    powerRating: number
  }
}

// 比赛数据结构
Match {
  id: string
  date: timestamp
  players: Player[]
  scores: number[]
  winner: string
}
```

## 🧪 测试策略

### 测试金字塔

```
        ┌───────────┐
        │   E2E     │  ← Playwright (计划中)
        ├───────────┤
        │Integration│  ← Vitest + Testing Library
        ├───────────┤
        │   Unit    │  ← Vitest + fast-check
        └───────────┘
```

### 测试覆盖

- **单元测试**: 工具函数、Hooks、纯组件
- **属性测试**: 核心算法（统计计算、排序逻辑）
- **组件测试**: UI 组件渲染、交互行为
- **快照测试**: 组件结构稳定性

## 👥 贡献指南

### 开发流程

1. **Fork** 本仓库
2. 创建功能分支: `git checkout -b feature/your-feature`
3. 提交更改: `git commit -m 'feat: add your feature'`
4. 推送分支: `git push origin feature/your-feature`
5. 创建 **Pull Request**

### 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

| 类型 | 描述 |
|:-----|:-----|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码格式 |
| `refactor` | 代码重构 |
| `test` | 测试相关 |
| `chore` | 构建/工具 |

### 代码规范

- ESLint 检查: `npm run lint`
- 组件命名: PascalCase
- 函数命名: camelCase
- 常量命名: SCREAMING_SNAKE_CASE
- 必须添加 JSDoc 注释

## ⚠️ 免责声明

### 项目性质

本项目是一个**纯技术学习和代码研究项目**，旨在：
- 学习和实践 React、Firebase、Electron 等现代 Web 技术
- 研究数据可视化和统计分析算法
- 探索前端工程化和架构设计

### 重要声明

1. **非商业用途**：本项目完全免费开源，不涉及任何商业行为，不收取任何费用
2. **纯代码研究**：本仓库仅包含程序源代码，不包含任何用户数据或真实业务数据
3. **技术演示**：项目中的"积分"、"分数"等概念仅为技术演示用的虚拟数值，用于展示数据统计和可视化功能
4. **学习目的**：本项目仅供个人学习、技术交流和代码研究使用

### 使用限制

- 使用者应遵守所在地区的法律法规
- 本项目不鼓励、不支持任何形式的违法活动
- 作者不对使用者如何使用本代码承担任何责任

### 责任限制

本软件按"原样"提供，不提供任何明示或暗示的保证。在任何情况下，作者均不对因使用本软件而产生的任何直接、间接、偶然、特殊或后果性损害承担责任。

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

## 📬 联系方式

如有问题或建议，欢迎联系：**dcy0728@foxmail.com**

## 💖 致谢
特别鸣谢 Trigger女士

本项目首席情感支持官

世界上最好看的大美女

本项目logo的提供者

感谢不懂代码的你也愿意在无数个夜晚默默陪着我

爱你(´∀｀)♡
---

<p align="center">
  <sub>Built with ❤️ by d631015320</sub>
</p>