# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-01-11

### Added

#### 基础设施
- 创建 `src/constants/index.js`，集中管理常量配置（BADGE_CONFIG、GAMES_PER_SEASON、CHIP_EXCHANGE_RATE、BASE_SCORES）
- 创建 `src/types/index.js`，添加 JSDoc 类型定义（Match、PlayerResult、Transaction、PlayerStats、LeagueStats）
- 创建 `src/services/firebase.service.js`，封装 Firebase CRUD 操作
- 创建 `src/components/common/ErrorBoundary.jsx`，实现错误边界和 fallback UI

#### Custom Hooks
- 创建 `src/hooks/useLeagueStats.js`，提取联盟极值计算逻辑
- 创建 `src/hooks/useStatsCalculator.js`，提取玩家统计数据计算逻辑
- 创建 `src/hooks/useFirebaseData.js`，封装 Firebase 数据订阅
- 创建 `src/hooks/useTheme.js`，提取主题管理逻辑

#### 布局组件
- 创建 `src/components/layout/Header.jsx`，提取顶部导航栏
- 创建 `src/components/layout/BottomNav.jsx`，提取移动端底部导航

#### 测试框架
- 配置 Vitest 和 React Testing Library
- 添加 fast-check 属性测试库
- 创建 `src/__tests__/utils/utils.test.js`，工具函数单元测试
- 创建 `src/__tests__/utils/utils.property.test.js`，Settlement 计算属性测试
- 创建 `src/__tests__/hooks/useStatsCalculator.property.test.js`，统计计算属性测试
- 创建 `src/__tests__/components/Avatar.test.jsx`，Avatar 组件快照测试
- 创建 `src/__tests__/components/Icon.test.jsx`，Icon 组件快照测试

#### 文档
- 更新 README.md，添加项目概述、架构图、安装说明和贡献指南
- 创建 CHANGELOG.md，记录版本变更历史

### Changed

#### 代码结构重构
- 重构 `App.jsx`，从 500+ 行精简到 ~150 行
- 移动 `Avatar.jsx` 到 `src/components/common/`
- 移动 `Icon.jsx` 到 `src/components/common/`
- 移动 `Clock.jsx` 到 `src/components/common/`
- 移动 `PlayerProfileModal.jsx` 到 `src/components/modals/`
- 移动 `SecurityModal.jsx` 到 `src/components/modals/`
- 移动 `SettlementModal.jsx` 到 `src/components/modals/`
- 移动 `HeadToHead.jsx` 到 `src/components/modals/`

#### 代码质量优化
- 移除组件中未使用的 React 导入
- 更新 ESLint 配置，添加 import 排序和未使用变量检测规则

#### 性能优化
- 为 Tab 组件添加 React.memo 优化
- 为事件处理器添加 useCallback
- 使用 React.lazy 和 Suspense 实现代码分割
- 为 Leaderboard 添加虚拟滚动支持

#### 可访问性改进
- 为所有交互元素添加 ARIA 标签
- 实现键盘导航支持
- 为模态框添加焦点陷阱和 Escape 键关闭

### Fixed

- 修复组件中未使用的 React 导入警告
- 改进错误处理，显示用户友好的错误消息

### Security

- 添加 ErrorBoundary 防止 React 渲染错误导致应用崩溃
- 改进 Firebase 操作的错误处理

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2025-01-11 | 项目重构完成 |
