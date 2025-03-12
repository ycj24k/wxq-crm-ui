// @ts-ignore
/* eslint-disable */

declare namespace API {
  type CurrentUser = {
    name?: string;
    avatar?: string;
    userid?: number;
    departmentId?: number;
    sex?: any;
    userid?: string;
    email?: string;
    signature?: string;
    departmentName?: string;
    title?: string;
    idCard?: string;
    group?: string;
    tags?: { key?: string; label?: string }[];
    notifyCount?: number;
    unreadCount?: number;
    country?: string;
    access?: string;
    geographic?: {
      province?: { label?: string; key?: string };
      city?: { label?: string; key?: string };
    };
    address?: string;
    phone?: string;
    router?: any;
    isReset?: boolean;
  };
  type Invoice = {
    account: string;
    hasChild: boolean;
    isOver: boolean;
    address: string;
    time: string;
    amount: number;
    auditRemark: string;
    auditTime: string;
    auditor: string;
    bank: string;
    cautions: string;
    chargeIds: number;
    id: number;
    confirm: string;
    createTime: string;
    mobile: string;
    productType: string;
    remark: string;
    taxCode: string;
    title: string;
    type: string;
    auditConfirm: any;
  };
  type GithubIssueItem = {
    userId: any;
    file: any;
    time: string;
    userName: string;
    filingNum: any;
    kind: string;
    post: string;
    entryTime: string;
    interviewer: number;
    studentName: string;
    degree: string;
    chargeIds: string;
    num: string;
    viewUrl: string;
    refundType: string;
    auditTime: string;
    chargeTime: string;
    oldStudentName: string;
    studentSource: string;
    paymentTime: string;
    mobile: string;
    updateTime: string;
    consultationTime: string;
    name: string;
    departmentId: number;
    createBy: number;
    sex: number;
    id: number;
    url: string;
    enable: boolean;
    dealTime: any;
    visitTime: boolean;
    confirm: boolean;
    isCalculation: boolean;
    source: string;
    oldProject: string;
    type: string | number;
    auditType: any;
    auditNum: any;
    isFormal: boolean;
    auditConfirm: boolean;
    hasInvoice: boolean;
    isSubmit: boolean;
    status: string | number;
    method: string;
    classType: string;
    classYear: string;
    examType: string;
    project: string | any;
    studentId: number;
    count: number;
    dealCount: number;
    orderId: number;
    studentUserId: number;
    isPeer: number;
    createTime: any;
    isSend: any;
    isSendOver: any;
    charge: any;
    files: string;
    ownerName: string;
    percent: number;
    performanceAmount: number;
    remark: string;
  };
  type LoginResult = {
    status?: string;
    type?: string;
    currentAuthority?: string;
    tokenName?: any;
    tokenValue?: any;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    username?: string;
    password?: string;
    autoLogin?: boolean;
    type?: string;
    mobile?: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };
}
