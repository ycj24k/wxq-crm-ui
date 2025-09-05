/**
 * 系统常量定义
 */

// 路由路径常量
export const ROUTES = {
  LOGIN: '/user/login',
  HOME: '/welcome',
  STUDENT_MANAGE: '/business/studentmanage',
  ORDER_LIST: '/business/businessorder',
  CHARGE_LIST: '/business/businesscharge/list',
} as const;

// 学员类型
export const STUDENT_TYPE = {
  POTENTIAL: 0,    // 潜在学员
  FORMAL: 1,       // 正式学员
  PENDING_PAY: 2,  // 待支付学员
} as const;

// 订单状态
export const ORDER_STATUS = {
  DRAFT: 0,        // 草稿
  PENDING: 1,      // 待审核
  APPROVED: 2,     // 已审核
  REJECTED: 3,     // 已驳回
  CANCELLED: 4,    // 已取消
} as const;

// 审核类型
export const AUDIT_TYPE = {
  PENDING: 0,      // 待审核
  APPROVED: 1,     // 通过
  REJECTED: 2,     // 驳回
} as const;

// 性别
export const GENDER = {
  UNKNOWN: 0,      // 未知
  MALE: 1,         // 男
  FEMALE: 2,       // 女
} as const;

// 分页默认值
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// LocalStorage Keys
export const STORAGE_KEYS = {
  TOKEN_NAME: 'tokenName',
  TOKEN_VALUE: 'tokenValue',
  USER_INFO: 'userInfo',
  DICTIONARIES: 'dictionariesList',
  DEPARTMENT: 'Department',
  VERSION: 'version',
  NOTICE: 'bizNotice',
} as const;

// WebSocket消息类型
export const WS_MESSAGE_TYPE = {
  DATA_UPDATED: 'dataUpdated',
  NEW_ORDER: 'newOrder',
  NOTICE_CREATE: 'noticeCreate',
  NOTICE_UPDATE: 'noticeUpdate',
} as const;

// API响应状态
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOGIN_ERROR: 'loginError',
  SERIOUS_ERROR: 'seriousError',
  REFRESH_DICT: 'pleaseRefreshDict',
  CONNECT_ERROR: 'connectError',
} as const;