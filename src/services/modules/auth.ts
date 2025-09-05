/**
 * 认证相关API
 */
import request from '@/services/ant-design-pro/apiRequest';
import { User, ApiResponse } from '@/types';
import { STORAGE_KEYS } from '@/constants';

export const authAPI = {
  /**
   * 用户登录
   */
  async login(userName: string, password: string) {
    const response = await request.get('/sms/public/login', {
      userName,
      password
    }) as ApiResponse<{
      tokenName: string;
      tokenValue: string;
    }>;

    if (response.status === 'success') {
      // 保存token
      sessionStorage.setItem(STORAGE_KEYS.TOKEN_NAME, response.data.tokenName);
      sessionStorage.setItem(STORAGE_KEYS.TOKEN_VALUE, response.data.tokenValue);
    }

    return response;
  },

  /**
   * 用户注册
   */
  register(userName: string, password: string, mobile: string) {
    return request.post('/sms/public/login', {
      userName,
      password,
      mobile
    }) as Promise<ApiResponse>;
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser() {
    return request.get('/sms/user') as Promise<ApiResponse<User>>;
  },

  /**
   * 修改密码
   */
  changePassword(oldPassword: string, newPassword: string) {
    return request.post('/sms/user/changePassword', {
      oldPassword,
      newPassword
    }) as Promise<ApiResponse>;
  },

  /**
   * 退出登录
   */
  logout() {
    // 清除本地存储
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN_NAME);
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN_VALUE);
    sessionStorage.removeItem(STORAGE_KEYS.USER_INFO);
    localStorage.removeItem(STORAGE_KEYS.DICTIONARIES);
    localStorage.removeItem(STORAGE_KEYS.DEPARTMENT);
    
    // 跳转到登录页
    window.location.href = '/user/login';
  },

  /**
   * 刷新Token
   */
  refreshToken() {
    return request.get('/sms/public/refreshToken') as Promise<ApiResponse>;
  }
};