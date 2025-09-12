/**
 * 订单管理相关API
 */
import request from '@/services/ant-design-pro/apiRequest';
import type { Order, PageResponse, ApiResponse } from '@/types';

export const orderAPI = {
  /**
   * 获取订单列表
   */
  getList(params: any) {
    return request.get('/sms/business/bizOrder', params) as Promise<ApiResponse<PageResponse<Order>>>;
  },

  /**
   * 创建订单
   */
  create(data: Partial<Order>) {
    return request.post('/sms/business/bizOrder', data) as Promise<ApiResponse<Order>>;
  },

  /**
   * 更新订单
   */
  update(id: number, data: Partial<Order>) {
    return request.post('/sms/business/bizOrder', { 
      ...data, 
      id 
    }) as Promise<ApiResponse<Order>>;
  },

  /**
   * 删除订单
   */
  delete(id: number) {
    return request.delete('/sms/business/bizOrder', { id }) as Promise<ApiResponse>;
  },

  /**
   * 获取订单详情
   */
  getDetail(id: number) {
    return request.get('/sms/business/bizOrder/detail', { id }) as Promise<ApiResponse<Order>>;
  },

  /**
   * 审核订单
   */
  audit(id: number, auditType: number, description?: string) {
    return request.post('/sms/business/bizOrder/audit', {
      id,
      auditType,
      description
    }) as Promise<ApiResponse>;
  },

  /**
   * 获取新订单
   */
  getNewOrders(params: any) {
    return request.get('/sms/business/bizOrder/newOrder', params) as Promise<ApiResponse<PageResponse<Order>>>;
  },

  /**
   * 获取订单统计
   */
  getStatistics(params: any) {
    return request.get('/sms/business/bizOrder/statistics', params) as Promise<ApiResponse>;
  },

  /**
   * 获取个人新订单
   */
  getPersonNewOrder(params: any) {
    return request.get('/sms/business/bizCharge/getPersonNewOrder', params) as Promise<ApiResponse>;
  }
};