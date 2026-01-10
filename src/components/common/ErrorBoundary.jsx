// src/components/common/ErrorBoundary.jsx
import { Component } from 'react';
import Icon from './Icon';

/**
 * 错误回退 UI 组件
 * @param {{error: Error, onRetry: () => void}} props
 */
function ErrorFallback({ error, onRetry }) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
        <Icon name="alert-triangle" className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
        出错了
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-4 max-w-md">
        页面遇到了一些问题，请尝试刷新或重试。
      </p>
      {error?.message && (
        <details className="mb-4 text-left w-full max-w-md">
          <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">
            查看错误详情
          </summary>
          <pre className="mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded text-xs text-red-600 dark:text-red-400 overflow-auto">
            {error.message}
          </pre>
        </details>
      )}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
        >
          <Icon name="refresh-cw" className="w-4 h-4" />
          重试
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-lg transition-colors"
        >
          刷新页面
        </button>
      </div>
    </div>
  );
}

/**
 * React 错误边界组件
 * 捕获子组件树中的 JavaScript 错误，显示回退 UI
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义 fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
export { ErrorFallback };
