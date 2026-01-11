<p align="center">
  <img src="public/favicon.png" alt="145 League Logo" width="140" height="140">
</p>

<h1 align="center">🎴 145 联赛</h1>

<p align="center">
  <strong>专业级扑克联赛数据管理与分析平台</strong>
</p>

<p align="center">
  <sub>✨ 实时数据同步 · 📊 智能统计分析 · 🖥️ 跨平台支持</sub>
</p>

<p align="center">
  <a href="#-功能特性">功能特性</a> •
  <a href="#-技术栈">技术栈</a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-系统架构">系统架构</a> •
  <a href="#-开发指南">开发指南</a> •
  <a href="#-常见问题">FAQ</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Vite-7.2.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Supabase-3.x-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/Firebase-12.x-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase">
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

《145联赛》是一款现代化的扑克联赛数据管理平台，提供完整的比赛记录、玩家统计分析、实时排行榜和数据可视化功能。系统采用 React 19 技术栈构建，支持 Supabase / Firebase 双数据库，可部署到 Cloudflare Pages / Netlify / Vercel 等平台，同时支持 Electron 桌面端。

> 💡 **为什么选择 145 联赛？**
> - 🚀 开箱即用的联赛管理解决方案
> - 📊 专业级数据分析和可视化
> - 🔄 实时数据同步，多端协作
> - 🎨 精心设计的用户界面

---

## ✨ 功能特性

<table>
  <tr>
    <td align="center" width="33%">
      <img width="60" src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Bar%20Chart.png" alt="Dashboard"/>
      <br><b>数据仪表盘</b>
      <br><sub>实时联赛概览<br>关键指标监控<br>趋势分析图表</sub>
    </td>
    <td align="center" width="33%">
      <img width="60" src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Trophy.png" alt="Leaderboard"/>
      <br><b>智能排行榜</b>
      <br><sub>多维度排序算法<br>战力值计算系统<br>历史排名追踪</sub>
    </td>
    <td align="center" width="33%">
      <img width="60" src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Memo.png" alt="History"/>
      <br><b>比赛历史</b>
      <br><sub>完整比赛记录<br>数据导出支持<br>高级筛选过滤</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="33%">
      <img width="60" src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Bust%20in%20Silhouette.png" alt="Profile"/>
      <br><b>玩家档案</b>
      <br><sub>个人数据统计<br>生涯曲线图表<br>能力雷达分析</sub>
    </td>
    <td align="center" width="33%">
      <img width="60" src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/1st%20Place%20Medal.png" alt="Badge"/>
      <br><b>成就徽章</b>
      <br><sub>里程碑解锁<br>荣誉展示<br>成就系统</sub>
    </td>
    <td align="center" width="33%">
      <img width="60" src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Gear.png" alt="Settings"/>
      <br><b>系统设置</b>
      <br><sub>深色/浅色主题<br>数据备份恢复<br>权限管理控制</sub>
    </td>
  </tr>
</table>

### 🎯 核心亮点

| 特性 | 描述 |
|:-----|:-----|
| ⚡ **极致性能** | Vite 构建，首屏加载 < 1s，流畅的用户体验 |
| 🔄 **实时同步** | 基于 Supabase / Firebase 的毫秒级数据更新 |
| 📈 **专业图表** | Recharts 驱动的交互式数据可视化 |
| 🌓 **主题切换** | 自适应系统偏好的深色/浅色主题 |
| 📱 **响应式** | 完美适配桌面、平板、移动设备 |
| 🖥️ **跨平台** | Web + Electron 双端部署支持 |
| 🔀 **双数据库** | 支持 Supabase 和 Firebase，环境变量一键切换 |
| 🚀 **多平台部署** | Cloudflare Pages / Netlify / Vercel 任选 |

---

## 🛠️ 技术栈

<table>
  <tr>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=react" width="48" height="48" alt="React" />
      <br><sub><b>React 19</b></sub>
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=vite" width="48" height="48" alt="Vite" />
      <br><sub><b>Vite 7</b></sub>
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="Tailwind" />
      <br><sub><b>Tailwind</b></sub>
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=supabase" width="48" height="48" alt="Supabase" />
      <br><sub><b>Supabase</b></sub>
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=firebase" width="48" height="48" alt="Firebase" />
      <br><sub><b>Firebase</b></sub>
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=electron" width="48" height="48" alt="Electron" />
      <br><sub><b>Electron</b></sub>
    </td>
  </tr>
</table>

### 技术架构详情

| 层级 | 技术 | 版本 | 说明 |
|:-----|:-----|:-----|:-----|
| **前端框架** | React | 19.2.0 | 函数式组件 + Hooks |
| **构建工具** | Vite | 7.2.4 | 极速 HMR 开发体验 |
| **样式方案** | Tailwind CSS | 3.4.17 | 原子化 CSS 框架 |
| **数据库** | Supabase | 3.x | PostgreSQL + 实时订阅（推荐） |
| **数据库** | Firebase | 12.x | NoSQL + 实时同步（备选） |
| **桌面端** | Electron | 39.2.7 | 跨平台桌面应用 |
| **图表库** | Recharts | - | 交互式数据可视化 |
| **单元测试** | Vitest | 4.0.16 | 快速单元测试框架 |
| **部署平台** | Cloudflare / Netlify / Vercel | - | 任选其一 |


---

## 🚀 快速开始

### 📋 环境要求

| 依赖 | 最低版本 | 推荐版本 |
|:-----|:---------|:---------|
| Node.js | 18.0.0 | 20.x LTS |
| npm | 9.0.0 | 10.x |

### 📥 安装步骤

```bash
# 1️⃣ 克隆仓库
git clone https://github.com/d631015320/league-app.git
cd league-app

# 2️⃣ 安装依赖
npm install

# 3️⃣ 配置环境变量
cp .env.example .env.local
```

### 🔥 数据库配置

项目支持 **Supabase** 和 **Firebase** 两种数据库，通过环境变量 `VITE_DB_PROVIDER` 切换。

<details>
<summary>📖 Supabase 配置（推荐，国内可访问）</summary>

1. 访问 [Supabase](https://supabase.com/) 创建新项目
2. 在 SQL Editor 中创建表：

```sql
-- 比赛记录表
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  results JSONB DEFAULT '[]',
  roster JSONB DEFAULT '[]',
  transactions JSONB DEFAULT '[]',
  final_stacks JSONB DEFAULT '{}',
  voted_mvp TEXT,
  lucky_player TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 玩家档案表
CREATE TABLE profiles (
  name TEXT PRIMARY KEY,
  avatar TEXT,
  real_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

3. 在 Project Settings → API 获取 URL 和 anon key
4. 配置 `.env.local`：

```bash
VITE_DB_PROVIDER=supabase
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

</details>

<details>
<summary>📖 Firebase 配置</summary>

1. 访问 [Firebase Console](https://console.firebase.google.com/) 创建新项目
2. 启用 Firestore Database 和 Authentication
3. 获取项目配置信息，配置 `.env.local`：

```bash
VITE_DB_PROVIDER=firebase
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

</details>

### 🚀 部署平台

项目支持多种部署平台，构建设置相同：
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **环境变量**: 添加数据库相关的 `VITE_*` 变量

| 平台 | 特点 | 国内访问 |
|:-----|:-----|:---------|
| **Cloudflare Pages** | 免费额度大，全球 CDN | ✅ 可访问 |
| **Netlify** | 易用，自动 HTTPS | ⚠️ 部分地区受限 |
| **Vercel** | 与 Next.js 集成好 | ❌ 需翻墙 |

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
npm test              # 运行所有测试
npm run test:watch    # 监听模式
npm run test:coverage # 覆盖率报告
npm run lint          # 代码规范检查
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
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                      Custom Hooks                               ││
│  │  useStatsCalculator │ useLeagueStats │ useData                  ││
│  └─────────────────────────────┬───────────────────────────────────┘│
└────────────────────────────────┼────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          💾 Data Layer                               │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │              Database Service Layer                             ││
│  │         (Supabase / Firebase + Realtime Sync)                   ││
│  └─────────────────────────────────────────────────────────────────┘│
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
│
├── 📂 src/                      # 源代码目录
│   ├── 📂 components/           # 组件目录
│   │   ├── 📂 common/           # 通用组件 (Avatar, Icon, Clock...)
│   │   ├── 📂 layout/           # 布局组件 (Header, BottomNav)
│   │   ├── 📂 modals/           # 弹窗组件
│   │   └── 📂 tabs/             # 页面组件
│   │
│   ├── 📂 charts/               # 图表组件
│   ├── 📂 hooks/                # 自定义 Hooks
│   ├── 📂 services/             # 服务层
│   ├── 📂 lib/                  # 工具库
│   ├── 📂 constants/            # 常量定义
│   ├── 📂 types/                # 类型定义
│   └── 📂 __tests__/            # 测试文件
│
├── 📂 docs/                     # 项目文档
└── ...配置文件
```

> 📚 更多架构细节请参考 [系统架构文档](docs/ARCHITECTURE.md)


---

## 📚 开发指南

### Custom Hooks 说明

| Hook | 职责 | 输入 | 输出 |
|:-----|:-----|:-----|:-----|
| `useStatsCalculator` | 玩家统计计算 | 比赛记录数组 | 场均分、胜率、战力值等 |
| `useLeagueStats` | 联盟极值计算 | 玩家列表 | 最高/最低各项指标 |
| `useData` | 统一数据接口 | - | 自动切换 Firebase/Supabase |
| `useSupabaseData` | Supabase 订阅 | - | 实时数据流 |
| `useFirebaseData` | Firebase 订阅 | - | 实时数据流 |
| `useTheme` | 主题状态管理 | - | 主题状态、切换方法 |

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

> 📚 更多开发细节请参考 [开发指南文档](docs/DEVELOPMENT.md)

---

## ❓ 常见问题

<details>
<summary><b>🔥 Q: 如何切换数据库？</b></summary>

修改 `.env.local` 中的 `VITE_DB_PROVIDER`：
- `supabase` - 使用 Supabase（推荐，国内可访问）
- `firebase` - 使用 Firebase

重启开发服务器即可生效。

</details>

<details>
<summary><b>🚀 Q: 如何部署？</b></summary>

1. 选择平台：Cloudflare Pages（推荐）/ Netlify / Vercel
2. 连接 GitHub 仓库
3. 构建设置：Build command = `npm run build`，Output = `dist`
4. 添加环境变量（VITE_DB_PROVIDER 和对应数据库配置）
5. 部署

</details>

<details>
<summary><b>🖥️ Q: Electron 打包后无法运行？</b></summary>

确保：
- Node.js 版本 >= 18
- 所有依赖已正确安装
- 数据库配置正确（Supabase 或 Firebase）
- 运行 `npm run build` 后再打包

</details>

<details>
<summary><b>📊 Q: 如何添加新的图表类型？</b></summary>

1. 在 `src/charts/` 目录创建新组件
2. 使用 Recharts 实现图表
3. 在需要的页面中导入使用
4. 添加相应的测试用例

</details>

<details>
<summary><b>🤝 Q: 如何贡献代码？</b></summary>

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

<table>
  <tr>
    <td>
      <h3>📋 项目性质</h3>
      <p>本项目是一个<b>纯技术学习和代码研究项目</b>，旨在：</p>
      <ul>
        <li>📚 学习和实践 React、Firebase、Electron 等现代 Web 技术</li>
        <li>📊 研究数据可视化和统计分析算法</li>
        <li>🏗️ 探索前端工程化和架构设计</li>
        <li>🏗️ 利用本项目DIY相关联赛</li>
      </ul>
    </td>
  </tr>
</table>

| 声明 | 说明 |
|:-----|:-----|
| 🚫 **非商业用途** | 本项目完全免费开源，不涉及任何商业行为 |
| 💻 **纯代码研究** | 仓库仅包含程序源代码，不包含用户数据 |
| 🎮 **技术演示** | "积分"、"分数"等概念仅为技术演示用的虚拟数值 |
| 📖 **学习目的** | 仅供个人学习、技术交流和代码研究使用 |

> ⚖️ 使用者应遵守所在地区的法律法规。本项目不鼓励、不支持任何形式的违法活动。

---

## 📄 许可证

<p>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License">
  </a>
</p>

```
MIT License © 2025 d631015320
```

---

## 📬 联系方式

<p align="center">
  <a href="mailto:dcy0728@foxmail.com">
    <img src="https://img.shields.io/badge/Email-dcy0728%40foxmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email">
  </a>
</p>

---

<p align="center">
  <img width="40" src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Sparkling%20Heart.png" alt="Heart"/>
</p>

<h3 align="center">💖 致谢</h3>

<p align="center">
  <b>特别鸣谢 Trigger 女士</b>
  <br><br>
  🌟 本项目首席情感支持官<br>
  👑 世界上最好看的大美女<br>
  🎨 本项目 Logo 的提供者
  <br><br>
  <i>感谢不懂代码的你也愿意在无数个夜晚默默陪着我</i>
  <br>
  <b>爱你 (´∀｀)♡</b>
</p>

---

<p align="center">
  <sub>Built with ❤️ by <a href="https://github.com/d631015320">d631015320</a></sub>
</p>

<p align="center">
  <a href="https://github.com/d631015320/league-app">
    <img src="https://img.shields.io/badge/⭐_如果有帮助请给个_Star-yellow?style=for-the-badge" alt="Star">
  </a>
</p>
