/**
 * 业务相关的类型定义
 */

// 学员信息
export interface Student {
  id: number;
  name: string;
  mobile: string;
  sex?: number;
  idCard?: string;
  weChat?: string;
  email?: string;
  project?: string;
  type: number;
  source?: string;
  studentSource?: string;
  isFormal: boolean;
  isVisit?: boolean;
  isPeer?: boolean;
  userId?: number;
  userName?: string;
  ownerName?: string;
  providerName?: string;
  percent?: number;
  description?: string;
  createTime?: string;
  updateTime?: string;
  visitTime?: string;
  dealDate?: string;
  lastDealTime?: string;
  consultationTime?: string;
  circulationTime?: string;
  presentationTime?: string;
  enable?: boolean;
}

// 订单信息
export interface Order {
  id: number;
  orderNumber: string;
  studentId: number;
  studentName: string;
  amount: number;
  receivable: number;
  paid: number;
  status: number;
  project: string;
  userId: number;
  userName: string;
  auditType: number;
  auditTime?: string;
  chargeTime?: string;
  createTime: string;
  updateTime?: string;
  description?: string;
  parentId?: number;
}

// 部门信息
export interface Department {
  id: number;
  name: string;
  departmentName: string;
  parentId: number;
  userId?: number;
  userName?: string;
  children?: Department[];
}

// 用户信息
export interface User {
  id: number;
  userid: number;
  name: string;
  userName: string;
  mobile?: string;
  email?: string;
  avatar?: string;
  departmentId: number;
  departmentName?: string;
  roleId?: number;
  roleName?: string;
  router?: any[];
  isReset?: boolean;
  targetAmount?: number;
  access?: string;
}

// 字典项
export interface DictItem {
  code: string;
  name: string;
  value: string | number;
  children?: DictItem[];
  parentCode?: string;
  sort?: number;
}

// 缴费信息
export interface Charge {
  id: number;
  orderId: number;
  studentId: number;
  amount: number;
  type: number;
  status: number;
  auditTime?: string;
  chargeTime?: string;
  createTime: string;
  createBy: number;
  confirm?: boolean;
  isSubmit?: boolean;
  enable?: boolean;
  description?: string;
}