/**
 * 优化的表格组件 - 包含虚拟滚动、缓存等优化
 */
import React, { useMemo, useCallback, memo } from 'react';
import type { ProTableProps } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useRequest } from '@/hooks';
import VirtualTable from '../VirtualTable';

interface OptimizedTableProps<T> extends ProTableProps<T, any> {
  // 是否启用虚拟滚动
  virtual?: boolean;
  // 虚拟滚动的高度
  virtualHeight?: number;
  // 是否缓存请求结果
  cache?: boolean;
  // 缓存时间（毫秒）
  cacheTime?: number;
}

// 缓存存储
const requestCache = new Map<string, { data: any; timestamp: number }>();

function OptimizedTable<T extends Record<string, any>>({
  virtual = false,
  virtualHeight = 600,
  cache = false,
  cacheTime = 5 * 60 * 1000, // 默认5分钟
  request,
  columns,
  ...restProps
}: OptimizedTableProps<T>) {
  // 生成缓存key
  const getCacheKey = useCallback((params: any) => {
    return JSON.stringify(params);
  }, []);

  // 包装请求函数，添加缓存逻辑
  const wrappedRequest = useMemo(() => {
    if (!request || !cache) return request;

    return async (params: any, ...args: any[]) => {
      const cacheKey = getCacheKey(params);
      const cached = requestCache.get(cacheKey);

      // 检查缓存是否有效
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        return cached.data;
      }

      // 执行原始请求
      const result = await request(params, ...args);

      // 存入缓存
      requestCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      // 清理过期缓存
      requestCache.forEach((value, key) => {
        if (Date.now() - value.timestamp > cacheTime) {
          requestCache.delete(key);
        }
      });

      return result;
    };
  }, [request, cache, cacheTime, getCacheKey]);

  // 优化的列配置
  const optimizedColumns = useMemo(() => {
    return columns?.map(col => ({
      ...col,
      // 如果render函数存在，使用React.memo包装
      render: col.render ? memo(col.render) : col.render,
    }));
  }, [columns]);

  // 如果启用虚拟滚动且数据量大
  if (virtual) {
    return (
      <ProTable<T>
        {...restProps}
        columns={optimizedColumns}
        request={wrappedRequest}
        scroll={{ y: virtualHeight }}
        components={{
          body: VirtualTable,
        }}
        pagination={{
          ...restProps.pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />
    );
  }

  return (
    <ProTable<T>
      {...restProps}
      columns={optimizedColumns}
      request={wrappedRequest}
      pagination={{
        ...restProps.pagination,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
      }}
    />
  );
}

export default memo(OptimizedTable) as typeof OptimizedTable;