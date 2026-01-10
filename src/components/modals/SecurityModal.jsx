// src/components/modals/SecurityModal.jsx
import { useState, useEffect, useRef } from 'react';
import Icon from '../common/Icon';

/**
 * 安全验证弹窗 - 用于敏感操作的二次确认
 * @param {{isOpen: boolean, onClose: () => void, onConfirm: (password: string) => void, title: string, message: string}} props
 */
const SecurityModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  const [password, setPassword] = useState('');
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      // 自动聚焦到密码输入框
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  // 处理 Escape 键关闭和焦点陷阱
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // 焦点陷阱
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-modal"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="security-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4 text-red-500">
          <Icon name="shield-alert" className="w-8 h-8" aria-hidden="true" />
          <h2 id="security-modal-title" className="text-xl font-bold">{title}</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">{message}</p>

        <div className="space-y-4">
          <div>
            <label htmlFor="security-password" className="text-xs font-bold text-slate-500 uppercase mb-1 block">
              确认管理员密码
            </label>
            <input
              ref={inputRef}
              id="security-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onConfirm(password)}
              className="input-pro w-full p-3 rounded-lg"
              placeholder="请输入登录密码..."
              autoComplete="current-password"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              aria-label="取消操作"
              className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              取消
            </button>
            <button
              onClick={() => onConfirm(password)}
              aria-label="确认执行操作"
              className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors shadow-lg"
            >
              确认执行
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityModal;
