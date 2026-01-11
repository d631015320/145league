# 开发指南

## 环境要求

| 依赖 | 最低版本 | 推荐版本 |
|:-----|:---------|:---------|
| Node.js | 18.0.0 | 20.x LTS |
| npm | 9.0.0 | 10.x |

## 安装步骤

```bash
# 克隆仓库
git clone https://github.com/your-org/league-app.git
cd league-app

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
```

## Firebase 配置

1. 访问 [Firebase Console](https://console.firebase.google.com/) 创建新项目
2. 启用 Firestore Database 和 Authentication（可选）
3. 获取项目配置信息，创建 `src/lib/firebase.js`：

```javascript
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

## 启动命令

```bash
npm run web      # Web 开发模式
npm run dev      # Electron 桌面模式
npm run build    # 生产构建
npm run preview  # 预览生产版本
```

## 测试

```bash
npm test              # 运行所有测试
npm run test:watch    # 监听模式
npm run test:coverage # 覆盖率报告
npm run lint          # 代码规范检查
```

### 测试策略

| 测试类型 | 工具 | 覆盖范围 |
|:---------|:-----|:---------|
| 单元测试 | Vitest | 工具函数、Hooks、纯组件 |
| 属性测试 | fast-check | 核心算法（统计计算、排序逻辑） |
| 组件测试 | Testing Library | UI 组件渲染、交互行为 |
| 快照测试 | Vitest | 组件结构稳定性 |

## 贡献流程

```bash
# 1. Fork 并克隆仓库
git clone https://github.com/YOUR_USERNAME/league-app.git

# 2. 创建功能分支
git checkout -b feature/amazing-feature

# 3. 开发并提交
git commit -m 'feat: add amazing feature'

# 4. 推送并创建 PR
git push origin feature/amazing-feature
```

### 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

| 类型 | 说明 | 示例 |
|:-----|:-----|:-----|
| `feat` | 新功能 | `feat: add player comparison` |
| `fix` | Bug 修复 | `fix: correct score calculation` |
| `docs` | 文档更新 | `docs: update README` |
| `refactor` | 代码重构 | `refactor: extract hook` |
| `test` | 测试相关 | `test: add unit tests` |
