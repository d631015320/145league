# Implementation Plan: Project Refactor

## Overview

本实施计划将 145 联赛管理应用从单体架构重构为分层架构，分阶段进行：基础设施 → 核心逻辑提取 → 性能优化 → 测试 → 文档。

## Tasks

- [x] 1. 基础设施搭建
  - [x] 1.1 创建目录结构和类型定义
    - 创建 `src/constants/index.js`，从 `utils.js` 提取 BADGE_CONFIG、GAMES_PER_SEASON、CHIP_EXCHANGE_RATE、BASE_SCORES
    - 创建 `src/types/index.js`，添加 Match、PlayerResult、Transaction、PlayerStats、LeagueStats 的 JSDoc 类型定义
    - _Requirements: 1.3, 1.5_
  
  - [x] 1.2 创建 Firebase Service 层
    - 创建 `src/services/firebase.service.js`
    - 实现 saveMatch、deleteMatch、updatePlayerProfile、renamePlayer 函数
    - 添加错误处理和用户友好的错误消息映射
    - _Requirements: 1.4, 6.1_

  - [x] 1.3 创建 ErrorBoundary 组件
    - 创建 `src/components/common/ErrorBoundary.jsx`
    - 实现错误捕获、fallback UI 和重试功能
    - _Requirements: 6.2, 6.5_

- [x] 2. 核心逻辑提取
  - [x] 2.1 创建 useLeagueStats Hook
    - 创建 `src/hooks/useLeagueStats.js`
    - 从 App.jsx 提取 leagueStats 计算逻辑（约 30 行）
    - 添加 JSDoc 注释
    - _Requirements: 1.2, 5.2_

  - [x] 2.2 创建 useStatsCalculator Hook
    - 创建 `src/hooks/useStatsCalculator.js`
    - 从 App.jsx 提取 statsData 计算逻辑（约 150 行）
    - 添加 JSDoc 注释
    - _Requirements: 1.1, 5.2_

  - [x] 2.3 创建 useFirebaseData Hook
    - 创建 `src/hooks/useFirebaseData.js`
    - 封装 Firebase 数据订阅逻辑（matchHistory、playerProfiles、user）
    - 添加 loading 和 error 状态管理
    - _Requirements: 1.1, 6.1_

  - [x] 2.4 创建 useTheme Hook
    - 创建 `src/hooks/useTheme.js`
    - 提取主题管理逻辑（localStorage、系统偏好检测、切换）
    - _Requirements: 1.1_

  - [x] 2.5 重构 App.jsx
    - 使用新创建的 Hooks 替换内联逻辑
    - 用 ErrorBoundary 包裹主内容
    - 移除未使用的 React 导入
    - 目标：将 App.jsx 从 500+ 行精简到 ~150 行
    - _Requirements: 1.1, 2.1_

- [x] 3. 代码质量优化与组件重组
  - [x] 3.1 修复组件中未使用的 React 导入
    - 更新 Dashboard.jsx、MatchHistory.jsx、NewGameForm.jsx、Settings.jsx、PlayerProfileModal.jsx
    - 移除 `import React from 'react'` 或改为按需导入
    - _Requirements: 2.1_

  - [x] 3.2 重组公共组件目录
    - 移动 `src/components/Avatar.jsx` → `src/components/common/Avatar.jsx`
    - 移动 `src/components/Icon.jsx` → `src/components/common/Icon.jsx`
    - 移动 `src/components/Clock.jsx` → `src/components/common/Clock.jsx`
    - 更新所有引用这些组件的 import 路径
    - _Requirements: 1.1_

  - [x] 3.3 重组弹窗组件目录
    - 移动 `src/components/PlayerProfileModal.jsx` → `src/components/modals/PlayerProfileModal.jsx`
    - 移动 `src/components/SecurityModal.jsx` → `src/components/modals/SecurityModal.jsx`
    - 移动 `src/components/SettlementModal.jsx` → `src/components/modals/SettlementModal.jsx`
    - 移动 `src/components/HeadToHead.jsx` → `src/components/modals/HeadToHead.jsx`
    - 更新所有引用这些组件的 import 路径
    - _Requirements: 1.1_

  - [x] 3.4 提取布局组件
    - 创建 `src/components/layout/Header.jsx`，提取顶部导航栏代码
    - 创建 `src/components/layout/BottomNav.jsx`，提取移动端底部导航代码
    - 更新 App.jsx 使用新的布局组件
    - _Requirements: 1.1_

  - [x] 3.5 更新 ESLint 配置
    - 添加 import 排序规则
    - 添加未使用变量检测规则
    - _Requirements: 2.4_

- [x] 4. 性能优化
  - [x] 4.1 实现组件 Memo 优化
    - 为 Tab 组件添加 React.memo
    - 为传递给子组件的事件处理器添加 useCallback
    - _Requirements: 3.1, 3.2_

  - [x] 4.2 实现代码分割
    - 使用 React.lazy 和 Suspense 懒加载 Tab 组件
    - 添加加载状态 fallback
    - _Requirements: 3.4_

  - [x] 4.3 实现列表虚拟化
    - 为 Leaderboard 添加虚拟滚动（当列表超过 50 项时）
    - 使用 @tanstack/react-virtual
    - _Requirements: 3.3_

- [x] 5. 测试框架搭建
  - [x] 5.1 配置 Vitest 和 React Testing Library
    - 安装 vitest、@testing-library/react、@testing-library/jest-dom、fast-check
    - 创建 vitest.config.js
    - 添加 test 脚本到 package.json
    - _Requirements: 4.1_

  - [x] 5.2 编写工具函数单元测试
    - 创建 `src/__tests__/utils/utils.test.js`
    - 测试 calculateSettlements、getISOWeek 函数
    - _Requirements: 4.2_

  - [x] 5.3 编写属性测试 - Settlement Calculation
    - 创建 `src/__tests__/utils/utils.property.test.js`
    - **Property 1: Settlement Calculation Round-Trip**
    - **Validates: Requirements 4.2**

  - [x] 5.4 编写属性测试 - Stats Calculation
    - 创建 `src/__tests__/hooks/useStatsCalculator.property.test.js`
    - **Property 2: Stats Calculation Invariants**
    - **Validates: Requirements 4.3**

  - [x] 5.5 编写组件快照测试
    - 创建 `src/__tests__/components/Avatar.test.jsx`
    - 创建 `src/__tests__/components/Icon.test.jsx`
    - _Requirements: 4.4_

- [x] 6. 可访问性改进
  - [x] 6.1 添加 ARIA 标签
    - 为所有按钮、链接添加 aria-label
    - 为表单输入添加关联的 label
    - _Requirements: 7.1, 7.4_

  - [x] 6.2 实现键盘导航
    - 确保所有交互元素可通过 Tab 键聚焦
    - 为模态框添加焦点陷阱和 Escape 键关闭
    - _Requirements: 7.2, 7.5_

- [x] 7. 文档完善
  - [x] 7.1 更新 README.md
    - 添加项目概述、功能特性
    - 添加安装和运行说明
    - 添加架构图（使用 Mermaid）
    - 添加贡献指南
    - _Requirements: 5.1_

  - [x] 7.2 创建 CHANGELOG.md
    - 记录本次重构的所有变更
    - 使用 Keep a Changelog 格式
    - _Requirements: 5.4_

  - [x] 7.3 添加 JSDoc 注释
    - 为 utils.js 中所有函数添加 JSDoc
    - 为 firebase.service.js 添加 JSDoc
    - _Requirements: 5.2, 5.3_

- [x] 8. 最终验证与清理
  - [x] 8.1 功能验证
    - 运行所有测试确保通过
    - 运行 ESLint 检查确保无错误
    - 手动测试所有核心功能（Dashboard、Leaderboard、MatchHistory、NewGameForm、Settings）
    - 验证所有弹窗正常工作
    - _Requirements: 4.5_

  - [x] 8.2 删除旧文件和冗余代码
    - 删除 `src/components/Avatar.jsx`（已移动到 common/）
    - 删除 `src/components/Icon.jsx`（已移动到 common/）
    - 删除 `src/components/Clock.jsx`（已移动到 common/）
    - 删除 `src/components/PlayerProfileModal.jsx`（已移动到 modals/）
    - 删除 `src/components/SecurityModal.jsx`（已移动到 modals/）
    - 删除 `src/components/SettlementModal.jsx`（已移动到 modals/）
    - 删除 `src/components/HeadToHead.jsx`（已移动到 modals/）
    - 清理 `src/lib/utils.js` 中已提取到 constants 的常量
    - _Requirements: 1.1_

  - [x] 8.3 最终检查点
    - 再次运行所有测试确保删除后功能正常
    - 确认无未使用的 import 或死代码
    - 询问用户是否有问题

## Notes

- 所有任务均为必需任务
- 每个任务都引用了具体的需求以便追溯
- 检查点任务用于确保增量验证
- 属性测试验证通用正确性属性
- 单元测试验证具体示例和边界情况
