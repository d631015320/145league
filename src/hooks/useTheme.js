// src/hooks/useTheme.js
import { useState, useEffect, useCallback } from 'react';

/**
 * 主题管理 Hook
 * 支持 localStorage 持久化和系统偏好检测
 * 
 * @returns {{
 *   theme: 'light' | 'dark',
 *   toggleTheme: () => void,
 *   setTheme: (theme: 'light' | 'dark') => void,
 *   isDark: boolean
 * }}
 */
function useTheme() {
  const [theme, setThemeState] = useState(() => {
    // 优先读取 localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
      // 否则检测系统偏好
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'dark'; // 默认暗色
  });

  // 同步到 DOM 和 localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // 只有在用户没有手动设置过主题时才跟随系统
      const saved = localStorage.getItem('theme');
      if (!saved) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setThemeState(newTheme);
    }
  }, []);

  return {
    theme,
    toggleTheme,
    setTheme,
    isDark: theme === 'dark'
  };
}

export default useTheme;
