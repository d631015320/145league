# 项目结构文档

> League App - 扑克联赛管理应用

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 19 + Vite 7 |
| 样式 | Tailwind CSS 3 |
| 图表 | Chart.js 4 |
| 数据库 | Firebase / Supabase |
| 桌面端 | Electron 39 |
| 测试 | Vitest 4 + Testing Library |
| 图标 | Lucide React |

---

## 根目录文件

| 文件 | 作用 |
|------|------|
| `package.json` | 项目依赖和脚本配置 |
| `package-lock.json` | 依赖版本锁定文件 |
| `vite.config.js` | Vite 构建配置 |
| `vitest.config.js` | Vitest 测试配置 |
| `tailwind.config.js` | Tailwind CSS 配置 |
| `postcss.config.js` | PostCSS 配置 |
| `eslint.config.js` | ESLint 代码规范配置 |
| `index.html` | 应用入口 HTML |
| `.env.local` | 本地环境变量（Firebase/Supabase 密钥） |
| `.gitignore` | Git 忽略规则 |
| `README.md` | 项目说明文档 |
| `CHANGELOG.md` | 版本更新日志 |
| `LICENSE` | 开源许可证 |
| `backup.json` | 数据备份文件 |
| `wrangler.json` | Cloudflare Workers 配置 |
| `scan_project.cjs` | 项目扫描脚本 |
| `full_project_context.txt` | 项目完整上下文（AI 辅助用） |

---

## 目录结构

```
league-app/
├── src/                    # 源代码目录
├── electron/               # Electron 桌面端
├── public/                 # 静态资源
├── dist/                   # 构建输出
├── docs/                   # 项目文档
├── .kiro/                  # Kiro AI 配置
├── .antifgravity/          # 项目规范文档
├── .vscode/                # VS Code 配置
└── node_modules/           # 依赖包
```

---

## src/ 源代码目录

### 入口文件

| 文件 | 作用 |
|------|------|
| `main.jsx` | 应用入口，挂载 React 根组件 |
| `App.jsx` | 主应用组件，管理全局状态和路由 |
| `App.css` | 应用全局样式 |
| `index.css` | Tailwind 基础样式和自定义 CSS |

### src/components/ 组件目录

#### src/components/common/ 通用组件

| 文件 | 作用 |
|------|------|
| `AnimatedNumber.jsx` | 数字动画组件，用于统计数据展示 |
| `Avatar.jsx` | 玩家头像组件，支持上传和默认头像 |
| `Clock.jsx` | 实时时钟组件 |
| `ErrorBoundary.jsx` | React 错误边界，捕获子组件错误 |
| `Icon.jsx` | 图标组件，封装 Lucide 图标 |
| `PowerBadge.jsx` | 战力徽章组件，显示玩家等级 |

#### src/components/layout/ 布局组件

| 文件 | 作用 |
|------|------|
| `Header.jsx` | 顶部导航栏，包含 Tab 切换和主题切换 |
| `BottomNav.jsx` | 移动端底部导航栏 |

#### src/components/modals/ 弹窗组件

| 文件 | 作用 |
|------|------|
| `PlayerProfileModal.jsx` | 玩家详情弹窗，展示完整统计数据 |
| `SecurityModal.jsx` | 安全验证弹窗，敏感操作需密码确认 |
| `SettlementModal.jsx` | 结算弹窗，显示比赛结算详情 |
| `HeadToHead.jsx` | 对战记录组件，显示两玩家历史对战 |
| `MatchHistoryTable.jsx` | 比赛历史表格组件 |
| `PlayerBadges.jsx` | 玩家徽章展示组件 |
| `PlayerRadarSection.jsx` | 玩家雷达图区域组件 |

#### src/components/tabs/ 页面标签组件

| 文件 | 作用 |
|------|------|
| `Dashboard.jsx` | 仪表盘页面，展示联赛概览和统计 |
| `Leaderboard.jsx` | 排行榜页面，玩家排名和筛选 |
| `MatchHistory.jsx` | 比赛历史页面，所有比赛记录 |
| `NewGameForm.jsx` | 新建比赛表单，录入比赛数据 |
| `Settings.jsx` | 设置页面，数据管理和导入导出 |

### src/charts/ 图表组件

| 文件 | 作用 |
|------|------|
| `CareerChart.jsx` | 生涯走势图，展示玩家历史表现 |
| `ProRadarChart.jsx` | 雷达图组件，多维度能力展示 |
| `Sparkline.jsx` | 迷你折线图，用于趋势展示 |

### src/hooks/ 自定义 Hooks

| 文件 | 作用 |
|------|------|
| `useData.js` | 数据获取 Hook，统一管理数据源切换 |
| `useFirebaseData.js` | Firebase 数据 Hook |
| `useSupabaseData.js` | Supabase 数据 Hook |
| `useLeagueStats.js` | 联赛统计 Hook，计算全局统计数据 |
| `useStatsCalculator.js` | 统计计算 Hook，处理排行榜数据 |
| `useRadarStats.js` | 雷达图数据 Hook，计算玩家多维指标 |
| `useBadges.js` | 徽章计算 Hook，根据表现授予徽章 |
| `usePlayerMatches.js` | 玩家比赛 Hook，获取特定玩家比赛记录 |
| `useTheme.js` | 主题 Hook，管理深色/浅色模式 |
| `useMediaQuery.js` | 媒体查询 Hook，响应式布局 |
| `useCountUp.js` | 数字递增动画 Hook |

### src/services/ 服务层

| 文件 | 作用 |
|------|------|
| `db.service.js` | 数据库服务统一接口 |
| `firebase.service.js` | Firebase 服务实现 |
| `supabase.service.js` | Supabase 服务实现 |

### src/lib/ 工具库

| 文件 | 作用 |
|------|------|
| `db.js` | 数据库配置和初始化 |
| `firebase.js` | Firebase 客户端配置 |
| `firebase.example.js` | Firebase 配置示例文件 |
| `supabase.js` | Supabase 客户端配置 |
| `utils.js` | 通用工具函数 |
| `powerColor.js` | 战力颜色计算工具 |

### src/constants/ 常量定义

| 文件 | 作用 |
|------|------|
| `index.js` | 主常量导出（赛季配置、Tab 配置等） |
| `badges.js` | 徽章配置（类型、条件、图标） |
| `colors.js` | 颜色常量定义 |

### src/types/ 类型定义

| 文件 | 作用 |
|------|------|
| `index.js` | JSDoc 类型定义 |

### src/assets/ 静态资源

| 文件 | 作用 |
|------|------|
| `react.svg` | React Logo |

### src/__tests__/ 测试目录

| 文件/目录 | 作用 |
|------|------|
| `setup.js` | 测试环境配置 |
| `useBadges.test.js` | 徽章 Hook 单元测试 |
| `MatchHistoryTable.test.jsx` | 比赛历史表格测试 |
| `components/` | 组件测试目录 |
| `components/Avatar.test.jsx` | 头像组件测试 |
| `components/Icon.test.jsx` | 图标组件测试 |
| `components/NewGameForm.test.jsx` | 新建比赛表单测试 |
| `hooks/` | Hook 测试目录 |
| `hooks/useStatsCalculator.property.test.js` | 统计计算属性测试 |
| `utils/` | 工具函数测试目录 |
| `utils/utils.test.js` | 工具函数单元测试 |
| `utils/utils.property.test.js` | 工具函数属性测试 |

---

## electron/ Electron 桌面端

| 文件 | 作用 |
|------|------|
| `main.cjs` | Electron 主进程，创建窗口和系统集成 |
| `preload.cjs` | 预加载脚本，安全暴露 Node API |

---

## public/ 静态资源

| 文件 | 作用 |
|------|------|
| `favicon.png` | 网站图标 |

---

## docs/ 项目文档

| 文件 | 作用 |
|------|------|
| `ARCHITECTURE.md` | 架构设计文档 |
| `DEVELOPMENT.md` | 开发指南文档 |
| `PROJECT_STRUCTURE.md` | 项目结构文档（本文件） |

---

## .kiro/ Kiro AI 配置

| 目录/文件 | 作用 |
|------|------|
| `settings/` | Kiro 设置（MCP 配置等） |
| `specs/` | 功能规格文档目录 |
| `steering/` | AI 引导规则文档 |
| `hooks/` | Kiro 自动化钩子 |

---

## .antifgravity/ 项目规范

| 文件 | 作用 |
|------|------|
| `code-quality.md` | 代码质量规范 |
| `language-preferences.md` | 语言偏好设置（中文） |
| `project-conventions.md` | 项目约定 |
| `ui-ux-pro-max.md` | UI/UX 设计规范 |
| `workflow-preferences.md` | 工作流偏好 |

---

## .vscode/ VS Code 配置

| 文件 | 作用 |
|------|------|
| `settings.json` | 编辑器设置 |

---

## dist/ 构建输出

| 文件/目录 | 作用 |
|------|------|
| `index.html` | 构建后的 HTML |
| `favicon.png` | 复制的图标 |
| `assets/` | 构建后的 JS/CSS 资源 |

---

## NPM 脚本

```bash
npm run dev      # 启动开发服务器 + Electron
npm run web      # 仅启动 Web 开发服务器
npm run build    # 生产构建
npm run preview  # 预览构建结果
npm run lint     # ESLint 代码检查
npm test         # 运行测试（单次）
npm run test:watch    # 测试监听模式
npm run test:coverage # 测试覆盖率报告
```
