/**
 * 改进的API请求封装
 */
import { request } from 'umi';
import { message } from 'antd';
import { history } from 'umi';
import { STORAGE_KEYS, API_STATUS, ROUTES } from '@/constants';
import { ApiResponse, PageParams } from '@/types';
import moment, { isMoment } from 'moment';

class HttpRequest {
  private request = request;

  /**
   * 处理时间参数
   */
  private processTimeParams(params: any) {
    const timeFields = [
      'createTime', 'auditTime', 'servedTime', 'chargeTime',
      'receiveTime', 'dealTime', 'dateTime', 'paymentTime',
      'circulationTime', 'consultationTime', 'certStartDate',
      'certEndDate', 'time', 'date', 'startDate', 'endDate'
    ];

    const processed = { ...params };

    Object.keys(processed).forEach(key => {
      if (timeFields.includes(key) && processed[key]) {
        if (Array.isArray(processed[key]) && processed[key].length === 2) {
          const [start, end] = processed[key];
          
          if (isMoment(start)) {
            processed[`${key}-start`] = moment(start).format('YYYY-MM-DD') + ' 00:00:00';
            processed[`${key}-end`] = moment(end).format('YYYY-MM-DD') + ' 23:59:59';
          } else {
            processed[`${key}-start`] = start.length === 10 ? start + ' 00:00:00' : start;
            processed[`${key}-end`] = end.length === 10 ? end + ' 23:59:59' : end;
          }
          
          delete processed[key];
        }
      }
    });

    return processed;
  }

  /**
   * 处理分页参数
   */
  private processPageParams(params: PageParams) {
    const processed = { ...params };
    
    if (processed.current !== undefined) {
      processed._page = processed.current - 1;
      delete processed.current;
    }
    
    if (processed.pageSize !== undefined) {
      processed._size = processed.pageSize;
      delete processed.pageSize;
    }
    
    return processed;
  }

  /**
   * 构建URL参数
   */
  private buildUrlParams(params: any): string {
    const entries = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    
    return entries.length > 0 ? '?' + entries.join('&') : '';
  }

  /**
   * 基础请求方法
   */
  private async baseRequest<T = any>(
    url: string,
    options: RequestInit & { params?: any; data?: any }
  ): Promise<ApiResponse<T>> {
    const tokenName = sessionStorage.getItem(STORAGE_KEYS.TOKEN_NAME);
    const tokenValue = sessionStorage.getItem(STORAGE_KEYS.TOKEN_VALUE);

    const headers: HeadersInit = {
      'Content-Type': options.data ? 'application/json' : 'application/x-www-form-urlencoded',
      ...options.headers
    };

    if (tokenName && tokenValue) {
      headers[tokenName] = tokenValue;
    }

    try {
      const response = await this.request(url, {
        ...options,
        headers
      });

      // 处理响应
      if (response.status === API_STATUS.SUCCESS || response.status === API_STATUS.REFRESH_DICT) {
        return response;
      }

      if (response.status === API_STATUS.LOGIN_ERROR) {
        message.error('登录已过期，请重新登录');
        history.push(ROUTES.LOGIN);
        throw new Error('登录已过期');
      }

      if (response.status === API_STATUS.SERIOUS_ERROR) {
        message.error(response.msg + '，已发送错误信息给管理员');
        throw new Error(response.msg);
      }

      // 其他错误
      message.error(response.msg || '请求失败');
      throw new Error(response.msg);
    } catch (error: any) {
      if (!error.message?.includes('登录已过期')) {
        message.error('网络请求失败，请稍后重试');
      }
      throw error;
    }
  }

  /**
   * GET请求
   */
  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    let processedParams = params ? { ...params } : {};
    
    // 处理时间参数
    processedParams = this.processTimeParams(processedParams);
    
    // 处理分页参数
    processedParams = this.processPageParams(processedParams);
    
    // 构建URL
    const fullUrl = url + this.buildUrlParams(processedParams);
    
    return this.baseRequest<T>(fullUrl, {
      method: 'GET'
    });
  }

  /**
   * POST请求
   */
  async post<T = any>(url: string, data?: any, params?: any): Promise<ApiResponse<T>> {
    const fullUrl = params ? url + this.buildUrlParams(params) : url;
    
    return this.baseRequest<T>(fullUrl, {
      method: 'POST',
      data: data || {},
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * PUT请求
   */
  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.baseRequest<T>(url, {
      method: 'PUT',
      data: data || {},
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * DELETE请求
   */
  async delete<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    const fullUrl = params ? url + this.buildUrlParams(params) : url;
    
    return this.baseRequest<T>(fullUrl, {
      method: 'DELETE'
    });
  }

  /**
   * 上传文件
   */
  async upload<T = any>(url: string, file: File, params?: any): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }
    
    return this.baseRequest<T>(url, {
      method: 'POST',
      data: formData,
      headers: {} // 让浏览器自动设置Content-Type
    });
  }
}

export default new HttpRequest();