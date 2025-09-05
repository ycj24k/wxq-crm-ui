/**
 * 通用的请求Hook，包含loading、error状态管理
 */
import { useState, useCallback } from 'react';
import { message } from 'antd';

interface UseRequestOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  showError?: boolean;
}

export function useRequest<T = any>(
  requestFn: (...args: any[]) => Promise<T>,
  options: UseRequestOptions = {}
) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const { onSuccess, onError, showError = true } = options;

  const execute = useCallback(
    async (...args: any[]) => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await requestFn(...args);
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err: any) {
        setError(err);
        if (showError) {
          message.error(err.message || '请求失败');
        }
        onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [requestFn, onSuccess, onError, showError]
  );

  return {
    loading,
    data,
    error,
    execute,
  };
}