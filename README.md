<p align="center">
  <img src="public/favicon.png" alt="145 League Logo" width="120" height="120">
</p>

<h1 align="center">🎴 145 联赛</h1>

<p align="center">
  <strong>专业级扑克联赛数据管理与分析平台</strong>
  <br />
  <sub>实时数据同步 · 智能统计分析 · 跨平台支持</sub>
</p>

<p align="center">
  <a href="#-功能特性">功能特性</a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-系统架构">系统架构</a> •
  <a href="#-开发指南">开发指南</a> •
  <a href="#-贡献指南">贡献指南</a> •
  <a href="#-常见问题">FAQ</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Vite-7.2.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Firebase-12.7.0-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase">
  <img src="https://img.shields.io/badge/Electron-39.2.7-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome">
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node">
  <img src="https://img.shields.io/badge/Platform-Web%20%7C%20Desktop-blue?style=flat-square" alt="Platform">
</p>

---

## 📋 概述

《145联赛》是一款现代化的扑克联赛数据管理平台，提供完整的比赛记录、玩家统计分析、实时排行榜和数据可视化功能。系统采用 React 19 + Firebase 技术栈构建，支持 Web 和 Electron 桌面端双平台部署。

> 💡 **为什么选择 145 联赛？**
> - 🚀 开箱即用的联赛管理解决方案
> - 📊 专业级数据分析和可视化
> - 🔄 实时数据同步，多端协作
> - 🎨 精心设计的用户界面


---

## ✨ 功能特性

<table>
<tr>
<td width="50%">

### 📊 数据仪表盘
- 实时联赛概览
- 关键指标监控
- 趋势分析图表
- 快速数据洞察

</td>
<td width="50%">

### 🏆 智能排行榜
- 多维度排序算法
- 战力值计算系统
- 玩家对比分析
- 历史排名追踪

</td>
</tr>
<tr>
<td width="50%">

### 📝 比赛历史
- 完整比赛记录
- 详情查看功能
- 数据导出支持
- 高级筛选过滤

</td>
<td width="50%">

### ➕ 快速录入
- 一键录入结果
- 智能数据校验
- 批量操作支持
- 撤销/重做功能

</td>
</tr>
<tr>
<td width="50%">

### 👤 玩家档案
- 个人数据统计
- 生涯曲线图表
- 能力雷达分析
- 成就徽章系统

</td>
<td width="50%">

### ⚙️ 系统设置
- 深色/浅色主题
- 数据备份恢复
- 权限管理控制
- 个性化配置

</td>
</tr>
</table>

### 🎯 核心亮点

| 特性 | 描述 |
|:-----|:-----|
| ⚡ **极致性能** | Vite 构建，首屏加载 < 1s，流畅的用户体验 |
| 🔄 **实时同步** | 基于 Firebase Realtime 的毫秒级数据更新 |
| 📈 **专业图表** | Recharts 驱动的交互式数据可视化 |
| 🌓 **主题切换** | 自适应系统偏好的深色/浅色主题 |
| 📱 **响应式** | 完美适配桌面、平板、移动设备 |
| 🖥️ **跨平台** | Web + Electron 双端部署支持 |

---

## 🛠️ 技术栈

<table>
<tr>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=react" width="48" height="48" alt="React" />
<br>React 19
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=vite" width="48" height="48" alt="Vite" />
<br>Vite 7
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="Tailwind" />
<br>Tailwind
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=firebase" width="48" height="48" alt="Firebase" />
<br>Firebase
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=electron" width="48" height="48" alt="Electron" />
<br>Electron
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=vitest" width="48" height="48" alt="Vitest" />
<br>Vitest
</td>
</tr>
</table>

### 技术架构详情

| 层级 | 技术 | 版本 | 说明 |
|:-----|:-----|:-----|:-----|
| **前端框架** | React | 19.2.0 | 函数式组件 + Hooks |
| **构建工具** | Vite | 7.2.4 | 极速 HMR 开发体验 |
| **样式方案** | Tailwind CSS | 3.4.17 | 原子化 CSS 框架 |
| **数据库** | Firebase Firestore | 12.7.0 | 实时 NoSQL 数据库 |
| **桌面端** | Electron | 39.2.7 | 跨平台桌面应用 |
| **图表库** | Chart.js | 4.5.1 | 交互式数据可视化 |
| **图标库** | Lucide React | 0.562.0 | 精美 SVG 图标 |
| **单元测试** | Vitest | 4.0.16 | 快速单元测试框架 |
| **组件测试** | Testing Library | 16.3.1 | React 组件测试 |
| **属性测试** | fast-check | 4.5.3 | 属性基础测试 |


---

## 🚀 快速开始

### 📋 环境要求

| 依赖 | 最低版本 | 推荐版本 |
|:-----|:---------|:---------|
| Node.js | 18.0.0 | 20.x LTS |
| npm | 9.0.0 | 10.x |
| yarn | 1.22.0 | 4.x |

### 📥 安装步骤

```bash
# 1️⃣ 克隆仓库
git clone https://github.com/your-org/league-app.git
cd league-app

# 2️⃣ 安装依赖
npm install

# 3️⃣ 配置环境变量
cp .env.example .env.local
```

### 🔥 Firebase 配置

<details>
<summary>点击展开详细配置步骤</summary>

1. 访问 [Firebase Console](https://console.firebase.google.com/) 创建新项目
2. 在项目设置中启用以下服务：
   - ✅ **Firestore Database** - 实时数据存储
   - ✅ **Authentication** - 用户认证（可选）
3. 获取项目配置信息
4. 创建 `src/lib/firebase.js` 文件：

```javascript
// src/lib/firebase.js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
```

</details>

### ▶️ 启动应用

```bash
# 🌐 Web 开发模式
npm run web

# 🖥️ Electron 桌面模式
npm run dev

# 📦 生产构建
npm run build

# 👀 预览生产版本
npm run preview
```

### 🧪 运行测试

```bash
# 运行所有测试
npm test

# 监听模式（开发时使用）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# 代码规范检查
npm run lint
```

---

## 🏗️ 系统架构

### 整体架构图

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
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                      Custom Hooks                            │    │
│  │  useStatsCalculator │ useLeagueStats │ useFirebaseData      │    │
│  └─────────────────────────────┬───────────────────────────────┘    │
└────────────────────────────────┼────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          💾 Data Layer                               │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              Firebase Service Layer                          │    │
│  │         (Firestore CRUD + Realtime Sync)                    │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```


### 📁 目录结构

```
league-app/
├── 📂 electron/                 # Electron 主进程
│   ├── main.cjs                 # 主进程入口
│   └── preload.cjs              # 预加载脚本
│
├── 📂 public/                   # 静态资源
│   └── favicon.png              # 应用图标
│
├── 📂 src/                      # 源代码目录
│   ├── main.jsx                 # 应用入口
│   ├── App.jsx                  # 根组件
│   ├── index.css                # 全局样式
│   │
│   ├── 📂 components/           # 组件目录
│   │   ├── 📂 common/           # 通用组件
│   │   │   ├── Avatar.jsx       # 头像组件
│   │   │   ├── Icon.jsx         # 图标组件
│   │   │   ├── Clock.jsx        # 时钟组件
│   │   │   └── ErrorBoundary.jsx
│   │   │
│   │   ├── 📂 layout/           # 布局组件
│   │   │   ├── Header.jsx       # 顶部导航
│   │   │   └── BottomNav.jsx    # 底部导航
│   │   │
│   │   ├── 📂 modals/           # 弹窗组件
│   │   │   ├── PlayerProfileModal.jsx
│   │   │   ├── HeadToHead.jsx
│   │   │   ├── SecurityModal.jsx
│   │   │   └── SettlementModal.jsx
│   │   │
│   │   └── 📂 tabs/             # 页面组件
│   │       ├── Dashboard.jsx    # 仪表盘
│   │       ├── Leaderboard.jsx  # 排行榜
│   │       ├── MatchHistory.jsx # 比赛历史
│   │       ├── NewGameForm.jsx  # 新建比赛
│   │       └── Settings.jsx     # 设置页面
│   │
│   ├── 📂 charts/               # 图表组件
│   │   ├── CareerChart.jsx      # 生涯曲线图
│   │   ├── ProRadarChart.jsx    # 能力雷达图
│   │   └── Sparkline.jsx        # 迷你趋势图
│   │
│   ├── 📂 hooks/                # 自定义 Hooks
│   │   ├── useStatsCalculator.js
│   │   ├── useLeagueStats.js
│   │   ├── useFirebaseData.js
│   │   └── useTheme.js
│   │
│   ├── 📂 services/             # 服务层
│   │   └── firebase.service.js  # Firebase 服务
│   │
│   ├── 📂 lib/                  # 工具库
│   │   ├── firebase.js          # Firebase 配置
│   │   └── utils.js             # 工具函数
│   │
│   ├── 📂 constants/            # 常量定义
│   │   └── index.js
│   │
│   ├── 📂 types/                # 类型定义
│   │   └── index.js
│   │
│   └── 📂 __tests__/            # 测试文件
│       ├── 📂 components/       # 组件测试
│       ├── 📂 hooks/            # Hook 测试
│       └── 📂 utils/            # 工具测试
│
├── 📄 package.json              # 项目配置
├── 📄 vite.config.js            # Vite 配置
├── 📄 tailwind.config.js        # Tailwind 配置
├── 📄 vitest.config.js          # Vitest 配置
└── 📄 eslint.config.js          # ESLint 配置
```

---

## 📚 开发指南

### Custom Hooks 说明

| Hook | 职责 | 输入 | 输出 |
|:-----|:-----|:-----|:-----|
| `useStatsCalculator` | 玩家统计计算 | 比赛记录数组 | 场均分、胜率、战力值等 |
| `useLeagueStats` | 联盟极值计算 | 玩家列表 | 最高/最低各项指标 |
| `useFirebaseData` | 实时数据订阅 | 集合路径 | 实时数据流 |
| `useTheme` | 主题状态管理 | - | 主题状态、切换方法 |

### 数据模型

```javascript
/**
 * 玩家数据结构
 * @typedef {Object} Player
 */
const Player = {
  id: 'string',           // 唯一标识
  name: 'string',         // 玩家名称
  avatar: 'string',       // 头像 URL
  stats: {
    totalGames: 0,        // 总场次
    totalScore: 0,        // 总积分
    avgScore: 0,          // 场均积分
    winRate: 0,           // 胜率
    powerRating: 0        // 战力值
  }
}

/**
 * 比赛数据结构
 * @typedef {Object} Match
 */
const Match = {
  id: 'string',           // 唯一标识
  date: 'timestamp',      // 比赛时间
  players: [],            // 参赛玩家
  scores: [],             // 各玩家得分
  winner: 'string'        // 获胜者 ID
}
```


### 🧪 测试策略

```
                    ┌─────────────────┐
                    │    E2E Tests    │  ← Playwright (计划中)
                    │   端到端测试     │
                    ├─────────────────┤
                    │ Integration     │  ← Vitest + Testing Library
                    │   集成测试       │
                    ├─────────────────┤
                    │   Unit Tests    │  ← Vitest + fast-check
                    │   单元测试       │
                    └─────────────────┘
```

| 测试类型 | 工具 | 覆盖范围 |
|:---------|:-----|:---------|
| **单元测试** | Vitest | 工具函数、Hooks、纯组件 |
| **属性测试** | fast-check | 核心算法（统计计算、排序逻辑） |
| **组件测试** | Testing Library | UI 组件渲染、交互行为 |
| **快照测试** | Vitest | 组件结构稳定性 |

---

## ❓ 常见问题

<details>
<summary><b>Q: 如何配置 Firebase？</b></summary>

1. 创建 Firebase 项目
2. 启用 Firestore 和 Authentication
3. 复制配置到 `src/lib/firebase.js`
4. 确保 `.env.local` 中的环境变量正确

</details>

<details>
<summary><b>Q: Electron 打包后无法运行？</b></summary>

确保：
- Node.js 版本 >= 18
- 所有依赖已正确安装
- Firebase 配置正确
- 运行 `npm run build` 后再打包

</details>

<details>
<summary><b>Q: 如何添加新的图表类型？</b></summary>

1. 在 `src/charts/` 目录创建新组件
2. 使用 Chart.js 或 Recharts 实现图表
3. 在需要的页面中导入使用
4. 添加相应的测试用例

</details>

<details>
<summary><b>Q: 如何贡献代码？</b></summary>

1. Fork 本仓库
2. 创建功能分支
3. 提交代码并推送
4. 创建 Pull Request
5. 等待代码审查

</details>

---

## 👥 贡献指南

### 开发流程

```bash
# 1. Fork 并克隆仓库
git clone https://github.com/YOUR_USERNAME/league-app.git

# 2. 创建功能分支
git checkout -b feature/amazing-feature

# 3. 开发并提交
git commit -m 'feat: add amazing feature'

# 4. 推送到远程
git push origin feature/amazing-feature

# 5. 创建 Pull Request
```

### 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

| 类型 | 说明 | 示例 |
|:-----|:-----|:-----|
| `feat` | 新功能 | `feat: add player comparison` |
| `fix` | Bug 修复 | `fix: correct score calculation` |
| `docs` | 文档更新 | `docs: update README` |
| `style` | 代码格式 | `style: format with prettier` |
| `refactor` | 代码重构 | `refactor: extract hook` |
| `test` | 测试相关 | `test: add unit tests` |
| `chore` | 构建/工具 | `chore: update deps` |

### 代码规范

- ✅ 通过 ESLint 检查：`npm run lint`
- ✅ 组件命名：PascalCase
- ✅ 函数命名：camelCase
- ✅ 常量命名：SCREAMING_SNAKE_CASE
- ✅ 添加 JSDoc 注释


---

## ⚠️ 免责声明

### 项目性质

本项目是一个**纯技术学习和代码研究项目**，旨在：

- 📚 学习和实践 React、Firebase、Electron 等现代 Web 技术
- 📊 研究数据可视化和统计分析算法
- 🏗️ 探索前端工程化和架构设计

### 重要声明

| 声明 | 说明 |
|:-----|:-----|
| 🚫 **非商业用途** | 本项目完全免费开源，不涉及任何商业行为 |
| 💻 **纯代码研究** | 仓库仅包含程序源代码，不包含用户数据 |
| 🎮 **技术演示** | "积分"、"分数"等概念仅为技术演示用的虚拟数值 |
| 📖 **学习目的** | 仅供个人学习、技术交流和代码研究使用 |

### 使用限制

- ⚖️ 使用者应遵守所在地区的法律法规
- 🚫 本项目不鼓励、不支持任何形式的违法活动
- 📋 作者不对使用者如何使用本代码承担任何责任

### 责任限制

> 本软件按"原样"提供，不提供任何明示或暗示的保证。在任何情况下，作者均不对因使用本软件而产生的任何直接、间接、偶然、特殊或后果性损害承担责任。

---

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

```
MIT License

Copyright (c) 2025 d631015320

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## 📬 联系方式

<p align="center">
  <a href="mailto:dcy0728@foxmail.com">
    <img src="https://img.shields.io/badge/Email-dcy0728%40foxmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email">
  </a>
</p>

如有问题或建议，欢迎通过邮件联系！

---

## 💖 致谢

<p align="center">
  <b>特别鸣谢 Trigger 女士</b>
  <br /><br />
  🌟 本项目首席情感支持官<br />
  👑 世界上最好看的大美女<br />
  🎨 本项目 Logo 的提供者<br /><br />
  <i>感谢不懂代码的你也愿意在无数个夜晚默默陪着我</i><br />
  <b>爱你 (´∀｀)♡</b>
</p>

---

<p align="center">
  <sub>Built with ❤️ by <a href="https://github.com/d631015320">d631015320</a></sub>
</p>

<p align="center">
  <sub>⭐ 如果这个项目对你有帮助，请给一个 Star！</sub>
</p>