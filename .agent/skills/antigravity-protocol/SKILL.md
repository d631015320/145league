---
name: Antigravity Protocol
description: 【强制中文】本项目的开发、编辑和沟通标准主指南。所有 AI 输出必须使用中文。
---

> [!CAUTION]
> ## 🚨 强制性语言约束 🚨
> **本项目的所有 AI 输出（包括回复、Artifacts、代码注释、Git Commit）必须 100% 使用中文。**
> **违反此规则的任何英文输出都是严重错误，必须立即自行修正。**
> **如果你正在阅读这段话，说明你必须遵守中文输出规范。立即检查你的回复语言。**

# Antigravity Protocol (项目规范)

本技能文件整合了所有项目指导方针、代码标准和工作流偏好。**在处理本项目时，你必须严格遵守这些规则。**

## 1. 语言与沟通规范

### 🔴 核心法则
**所有输出必须使用中文。**

### 详细要求
- **回复语言**: 所有的回答、解释、总结、错误分析必须使用 **中文 (中文)**。
- **Artifacts**: 下列所有 Agent 生成的文件必须完全使用 **中文** 编写：
    - `task.md` (任务清单)
    - `implementation_plan.md` (实施计划)
    - `walkthrough.md` (验证报告)
- **代码注释**: 所有代码注释、文档字符串 (Docstrings)、Git Commit 信息必须使用 **中文**。
- **用户界面**: 所有面向用户的文本、错误提示、Logs 必须使用 **中文**。
- **Spec 文档**: `requirements.md`, `design.md` 等必须使用 **中文**。

### 例外 (保持英文)
- 变量名、函数名、类名 (遵循代码规范)。
- 第三方库名称。
- 系统错误堆栈 (Stack Traces)。
- HTTP 状态码文本 (如 "OK", "Not Found")。

---

## 2. 工作流偏好 (Workflow Preferences)

### 任务执行
- **单任务原则**: 一次只执行一个主要任务，完成后等待确认。
- **确认原则**: 大改动前先说明方案 (`implementation_plan.md`)，获得确认后再执行。
- **理解优先**: 修改代码前必须先读取现有代码 (`read_file` / `view_file`)，严禁盲改。

### 文件操作
- **安全删除**: 删除文件前确认没有其他地方引用。
- **一致性**: 移动文件后更新所有 import 路径。
- **创建文件**: 遵循现有的目录结构 (`src/components`, `src/hooks` 等)。

### 沟通风格
- **简洁直接**: 不要是冗长的废话。
- **结果导向**: 完成任务后简短总结。
- **主动提问**: 遇到不明确的需求，先问清楚再动手。

---

## 3. 编辑策略 (Editing Strategy)

### 核心原则
- **Fail Fast**: 如果一种方法 (`replace_file_content`) 连续失败 2 次，立即切换到另一种方法 (`write_to_file`)。
- **Read First**: 编辑前确保了解文件当前状态，包括缩进和上下文。
- **Verify**: 编辑后必须运行检查工具。

### 工具选择指南
1.  **`replace_file_content` (首选，<20行修改)**
    *   **适用**: 修复 Bug、调整逻辑、修改导入。
    *   **要点**: 
        *   `oldStr` 必须与文件内容**从字面上完全一致** (包括空格)。
        *   必须包含 2-3 行上下文。
2.  **`fsWrite` / `write_to_file` (重写模式)**
    *   **适用**: 创建新文件、大范围重构 (>50%)、`replace` 失败后。
    *   **要点**: 写入前必须完全理解文件结构，保留未修改部分的逻辑。

### 编辑后验证清单
1.  **语法检查**: `npm run lint` (如果可用) 或 IDE 诊断。
2.  **启动检查**: `npm run dev` 确保并在浏览器中无报错。
3.  **测试运行**: `npm test` 确保单元测试通过。

---

## 4. 项目架构与规范 (Architecture & Conventions)

### 技术栈 (Tech Stack)
| Tier | Technology | Version |
|------|------------|---------|
| **Core** | Electron + Vite | Latest |
| **Frontend** | React | 19.x |
| **Styling** | Tailwind CSS | v3.x |
| **Icons** | Lucide React | - |
| **Charts** | Chart.js / Recharts | - |
| **Testing** | Vitest | - |

### 目录结构参考 (Directory Structure)
```
root/
├── electron/                    # Electron 主进程代码
│   ├── main.cjs                 # Main entry
│   └── preload.cjs              # Preload scripts
│
├── src/                         # React 前端代码 (Renderer)
│   ├── components/              # UI 组件
│   │   ├── common/              # 通用组件 (Avatar, Button)
│   │   ├── layout/              # 布局组件 (Navbar, Sidebar)
│   │   └── ...
│   ├── hooks/                   # 自定义 Hooks
│   ├── services/                # API 服务 & 业务逻辑
│   ├── types/                   # TypeScript 类型定义 (如有)
│   ├── utils/                   # 工具函数
│   ├── App.jsx                  # 根组件
│   └── main.jsx                 # 入口文件
│
└── package.json
```

### 命名规范 (Naming Conventions)
- **组件文件**: `PascalCase` (e.g., `PlayerProfile.jsx`)
- **函数/变量**: `camelCase` (e.g., `calculateScore`)
- **常量**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`)
- **CSS 类**: `kebab-case` 或 Tailwind Utility Classes

---

## 6. Git 提交规范 (Git Commit Convention)

### 🔴 必须遵守 (MANDATORY)
**所有 Git Commit Message 必须使用中文。**

### 格式标准
```
<type>: <description>
```

### Type 对照表
| Type | 含义 (中文) | 示例 |
|------|------------|------|
| **feat** | 新功能 | `feat: 增加用户登录页面` |
| **fix** | 修复 Bug | `fix: 修复积分计算逻辑错误` |
| **docs** | 文档变更 | `docs: 更新 README 安装指南` |
| **style** | 格式/样式 | `style: 修改首页按钮颜色` (不影响逻辑) |
| **refactor** | 代码重构 | `refactor: 优化数据获取 Hook` |
| **perf** | 性能优化 | `perf: 减少首页加载体积` |
| **test** | 测试代码 | `test: 增加用户组件单元测试` |
| **chore** | 杂务/构建 | `chore: 更新 package.json 依赖` |

### 示例
- ✅ `feat: 完成排行榜功能开发`
- ✅ `fix: 解决 Electron 启动白屏问题`
- ❌ `add login` (未使用标准 Type，使用了英文)
- ❌ `修复 Bug` (缺少 Type 前缀)

---

## 5. 代码质量与风格 (Code Quality & Style)

### React 最佳实践
- **Files**: 使用 `.jsx` (JS) 或 `.tsx` (TS)。
- **Hooks**: 复杂逻辑必须抽取到自定义 Hooks。
- **State**: 优先使用本地 State，全局状态 (Zustand/Context) 仅用于跨组件共享。
- **Components**: 保持组件“原子化”，避免 500行+ 的巨型组件。
- **Performance**: 合理使用 `useMemo`, `useCallback`。
- **Validation**: API 调用必须包含 `try-catch` 和错误 UI 反馈。
- **No Console Logs**: 提交前删除 `console.log`，使用日志库代替。

### 样式规范 (Styling)
- **Tailwind First**: 严禁手写 CSS 文件，除非处理 Tailwind 无法覆盖的动画。
- **Consistency**: 使用语义化的颜色 (如 `bg-primary`, `text-error`) 而非硬编码。
