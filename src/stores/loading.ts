/**
 * 全局Loading状态管理
 */
import { create } from 'zustand';

interface LoadingState {
  // loading计数器，支持多个loading同时存在
  loadingCount: number;
  // loading提示文本
  loadingText: string;
  // 显示loading
  showLoading: (text?: string) => void;
  // 隐藏loading
  hideLoading: () => void;
  // 重置loading
  resetLoading: () => void;
}

const useLoadingStore = create<LoadingState>((set) => ({
  loadingCount: 0,
  loadingText: '加载中...',
  
  showLoading: (text = '加载中...') => {
    set((state) => ({
      loadingCount: state.loadingCount + 1,
      loadingText: text,
    }));
  },
  
  hideLoading: () => {
    set((state) => ({
      loadingCount: Math.max(0, state.loadingCount - 1),
    }));
  },
  
  resetLoading: () => {
    set({
      loadingCount: 0,
      loadingText: '加载中...',
    });
  },
}));

export default useLoadingStore;