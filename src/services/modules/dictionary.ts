/**
 * 字典管理相关API
 */
import request from '@/services/ant-design-pro/apiRequest';
import type { DictItem, Department, ApiResponse } from '@/types';
import { STORAGE_KEYS } from '@/constants';

export const dictionaryAPI = {
  /**
   * 获取所有字典
   */
  async getAllDictionaries() {
    const response = await request.get('/sms/share/getDict') as ApiResponse<DictItem[]>;
    
    if (response.status === 'success') {
      // 缓存到本地
      localStorage.setItem(STORAGE_KEYS.DICTIONARIES, JSON.stringify(response.data));
    }
    
    return response;
  },

  /**
   * 获取部门和用户
   */
  async getDepartmentAndUser() {
    const response = await request.get('/sms/share/getDepartmentAndUser') as ApiResponse<Department[]>;
    
    if (response.status === 'success') {
      // 缓存到本地
      localStorage.setItem(STORAGE_KEYS.DEPARTMENT, JSON.stringify(response.data));
    }
    
    return response;
  },

  /**
   * 获取部门列表
   */
  async getDepartment() {
    const response = await request.get('/sms/share/getDepartment') as ApiResponse<Department[]>;
    
    if (response.status === 'success') {
      // 缓存到本地
      localStorage.setItem('Depart', JSON.stringify(response.data));
    }
    
    return response;
  },

  /**
   * 根据code获取字典项
   */
  getDictByCode(code: string): DictItem[] {
    const dictList = JSON.parse(localStorage.getItem(STORAGE_KEYS.DICTIONARIES) || '[]');
    return dictList.filter((item: DictItem) => item.code === code);
  },

  /**
   * 根据code和value获取字典名称
   */
  getDictName(code: string, value: string | number): string {
    const dictList = this.getDictByCode(code);
    if (dictList.length === 0) return '字典缺失';
    
    const dict = dictList[0];
    const item = dict.children?.find(child => child.value == value);
    return item?.name || '';
  },

  /**
   * 刷新字典缓存
   */
  async refreshCache() {
    await this.getAllDictionaries();
    await this.getDepartmentAndUser();
    await this.getDepartment();
  }
};