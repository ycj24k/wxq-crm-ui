/**
 * 缴费管理相关API
 */
import request from '@/services/ant-design-pro/apiRequest';
import type { Charge, PageResponse, ApiResponse } from '@/types';

export const chargeAPI = {
  /**
   * 获取缴费列表
   */
  getList(params: any) {
    return request.get('/sms/business/bizCharge', params) as Promise<ApiResponse<PageResponse<Charge>>>;
  },

  /**
   * 创建缴费记录
   */
  create(data: Partial<Charge>) {
    return request.post('/sms/business/bizCharge', data) as Promise<ApiResponse<Charge>>;
  },

  /**
   * 更新缴费记录
   */
  update(id: number, data: Partial<Charge>) {
    return request.post('/sms/business/bizCharge', { 
      ...data, 
      id 
    }) as Promise<ApiResponse<Charge>>;
  },

  /**
   * 删除缴费记录
   */
  delete(id: number) {
    return request.delete('/sms/business/bizCharge', { id }) as Promise<ApiResponse>;
  },

  /**
   * 审核缴费
   */
  audit(id: number, auditType: number, description?: string) {
    return request.post('/sms/business/bizCharge/audit', {
      id,
      auditType,
      description
    }) as Promise<ApiResponse>;
  },

  /**
   * 确认缴费
   */
  confirm(id: number) {
    return request.post('/sms/business/bizCharge/confirm', { id }) as Promise<ApiResponse>;
  },

  /**
   * 获取个人业绩
   */
  getPersonPerformance(params: any) {
    return request.get('/sms/business/bizCharge/getPersonNewOrder', params) as Promise<ApiResponse>;
  },

  /**
   * 获取缴费统计
   */
  getStatistics(params: any) {
    return request.get('/sms/business/bizCharge/statistics', params) as Promise<ApiResponse>;
  },

  /**
   * 导出缴费记录
   */
  export(params: any) {
    return request.get('/sms/business/bizCharge/export', params) as Promise<Blob>;
  }
};