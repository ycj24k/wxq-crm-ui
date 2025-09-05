/**
 * 学员管理相关API
 */
import request from '@/services/ant-design-pro/apiRequest';
import { Student, PageResponse, ApiResponse } from '@/types';

export const studentAPI = {
  /**
   * 获取学员列表
   */
  getList(params: any, isFormal: boolean = false) {
    const url = isFormal 
      ? '/sms/business/bizStudentUser' 
      : '/sms/business/bizStudentUser/potentialStudent';
    return request.get(url, params) as Promise<ApiResponse<PageResponse<Student>>>;
  },

  /**
   * 创建学员
   */
  create(data: Partial<Student>) {
    return request.post('/sms/business/bizStudentUser', data) as Promise<ApiResponse<Student>>;
  },

  /**
   * 更新学员信息
   */
  update(id: number, data: Partial<Student>) {
    return request.post('/sms/business/bizStudentUser', { 
      ...data, 
      id 
    }) as Promise<ApiResponse<Student>>;
  },

  /**
   * 删除学员
   */
  delete(id: number) {
    return request.delete('/sms/business/bizStudentUser', { id }) as Promise<ApiResponse>;
  },

  /**
   * 获取学员详情
   */
  getDetail(id: number) {
    return request.get('/sms/business/bizStudentUser/detail', { id }) as Promise<ApiResponse<Student>>;
  },

  /**
   * 批量导入学员
   */
  batchImport(data: any[]) {
    return request.post('/sms/business/bizStudentUser/saveArray', data) as Promise<ApiResponse>;
  },

  /**
   * 学员转移
   */
  transfer(studentIds: number[], userId: number) {
    return request.post('/sms/business/bizStudentUser/presentation', {
      userId,
      studentUserIdList: studentIds.join(',')
    }) as Promise<ApiResponse>;
  },

  /**
   * 获取学员统计
   */
  getStatistics(params: any) {
    return request.get('/sms/business/bizStudentUser/statistics', params) as Promise<ApiResponse>;
  }
};