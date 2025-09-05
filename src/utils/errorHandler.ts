/**
 * 全局错误处理工具
 */
import { message, notification } from 'antd';
import { history } from 'umi';
import { ROUTES, API_STATUS } from '@/constants';

interface ErrorInfo {
  message: string;
  code?: string | number;
  status?: string;
  details?: any;
}

class ErrorHandler {
  // 错误日志队列
  private errorQueue: ErrorInfo[] = [];
  private maxQueueSize = 50;

  /**
   * 处理API错误
   */
  handleApiError(error: any) {
    const errorInfo: ErrorInfo = {
      message: error.msg || error.message || '请求失败',
      code: error.code,
      status: error.status,
      details: error,
    };

    this.logError(errorInfo);

    // 根据错误类型处理
    switch (error.status) {
      case API_STATUS.LOGIN_ERROR:
        this.handleLoginError();
        break;
      case API_STATUS.SERIOUS_ERROR:
        this.handleSeriousError(errorInfo);
        break;
      default:
        this.handleGeneralError(errorInfo);
    }
  }

  /**
   * 处理登录错误
   */
  private handleLoginError() {
    message.error('登录已过期，请重新登录');
    // 清除本地存储
    sessionStorage.clear();
    localStorage.removeItem('dictionariesList');
    localStorage.removeItem('Department');
    // 跳转到登录页
    history.push(ROUTES.LOGIN);
  }

  /**
   * 处理严重错误
   */
  private handleSeriousError(errorInfo: ErrorInfo) {
    notification.error({
      message: '系统错误',
      description: errorInfo.message + '，错误信息已发送给管理员',
      duration: 0,
    });
    
    // 上报错误到监控系统
    this.reportError(errorInfo);
  }

  /**
   * 处理一般错误
   */
  private handleGeneralError(errorInfo: ErrorInfo) {
    message.error(errorInfo.message);
  }

  /**
   * 处理网络错误
   */
  handleNetworkError(error: any) {
    const errorInfo: ErrorInfo = {
      message: '网络连接失败，请检查网络设置',
      details: error,
    };

    this.logError(errorInfo);
    message.error(errorInfo.message);
  }

  /**
   * 处理运行时错误
   */
  handleRuntimeError(error: Error, errorInfo?: any) {
    const info: ErrorInfo = {
      message: error.message,
      details: {
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
      },
    };

    this.logError(info);

    if (process.env.NODE_ENV === 'development') {
      console.error('运行时错误:', error, errorInfo);
    } else {
      this.reportError(info);
    }
  }

  /**
   * 记录错误日志
   */
  private logError(errorInfo: ErrorInfo) {
    // 添加时间戳
    const logEntry = {
      ...errorInfo,
      timestamp: new Date().toISOString(),
    };

    // 维护错误队列
    this.errorQueue.push(logEntry);
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // 开发环境打印错误
    if (process.env.NODE_ENV === 'development') {
      console.error('错误日志:', logEntry);
    }
  }

  /**
   * 上报错误到监控系统
   */
  private reportError(errorInfo: ErrorInfo) {
    // TODO: 集成错误监控服务（如Sentry）
    // 这里可以将错误信息发送到后端或第三方监控服务
    console.log('上报错误:', errorInfo);
  }

  /**
   * 获取错误日志
   */
  getErrorLogs() {
    return [...this.errorQueue];
  }

  /**
   * 清空错误日志
   */
  clearErrorLogs() {
    this.errorQueue = [];
  }
}

export default new ErrorHandler();