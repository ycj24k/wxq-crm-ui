/**
 * API相关的类型定义
 */

// 通用响应结构
export interface ApiResponse<T = any> {
  status: 'success' | 'error' | 'loginError' | 'seriousError' | 'pleaseRefreshDict';
  msg: string;
  data: T;
  code?: number;
}

// 分页响应
export interface PageResponse<T = any> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// 分页请求参数
export interface PageParams {
  current?: number;
  pageSize?: number;
  _page?: number;
  _size?: number;
  _orderBy?: string;
  _direction?: 'asc' | 'desc';
}