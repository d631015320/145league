# 项目约定

## 技术栈
- **前端框架**: React 18 + Vite
- **样式**: Tailwind CSS
- **图表**: Recharts
- **数据库**: Firebase Firestore
- **桌面端**: Electron
- **测试**: Vitest

## 目录结构
```
src/
├── components/
│   ├── common/      # 通用组件（Avatar, Icon, Clock 等）
│   ├── layout/      # 布局组件（Navbar, Sidebar 等）
│   ├── modals/      # 弹窗组件
│   └── tabs/        # 页面标签组件
├── charts/          # 图表组件
├── hooks/           # 自定义 Hooks
├── services/        # API 服务层
├── constants/       # 常量定义
├── lib/             # 工具函数
└── types/           # 类型定义
```

## 命名规范
- **组件文件**: PascalCase（如 `PlayerProfileModal.jsx`）
- **工具文件**: camelCase（如 `utils.js`）
- **常量**: UPPER_SNAKE_CASE（如 `BADGE_CONFIG`）
- **函数**: camelCase（如 `calculateScore`）
- **CSS 类**: kebab-case 或 Tailwind 类名

## 组件规范
- 使用函数式组件 + Hooks
- Props 解构在参数位置
- 复杂逻辑抽取到自定义 Hook
- 大组件拆分为小组件

## 导入顺序
1. React 相关
2. 第三方库
3. 本地组件
4. 工具函数/常量
5. 样式文件
