# 更新日志

基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 格式。

## [1.0.0] - 2025-01-11

### 新增
- 常量配置集中管理 (`src/constants/index.js`)
- JSDoc 类型定义 (`src/types/index.js`)
- Firebase 服务层封装 (`src/services/firebase.service.js`)
- 错误边界组件 (`ErrorBoundary.jsx`)
- Custom Hooks: `useLeagueStats`, `useStatsCalculator`, `useFirebaseData`, `useTheme`
- 布局组件: `Header.jsx`, `BottomNav.jsx`
- Vitest 测试框架 + fast-check 属性测试

### 变更
- 重构 `App.jsx`（500+ 行 → ~150 行）
- 组件迁移到 `components/common/`、`components/modals/` 等目录
- 添加 React.memo、useCallback 性能优化
- 实现代码分割（React.lazy + Suspense）
- 改进可访问性（ARIA 标签、键盘导航）

### 修复
- 组件中未使用的 React 导入警告
- 错误处理改进，显示用户友好的错误消息
