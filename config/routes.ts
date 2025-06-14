export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './user/Login',
          },
        ],
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/public',
    layout: false,
    routes: [
      {
        path: '/public',
        routes: [
          {
            name: 'charge',
            path: '/public/charge',
            component: './Public/Charge',
          },
        ],
      },
    ],
  },
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/finance',
    name: '财务管理',
    redirect: '/finance/financecharge',
  },
  {
    name: '财务审核',
    path: '/finance/financecharge',
    component: './Finance/FinanceCharge',
  },
  {
    path: '/admin',
    name: 'admin',
    icon: 'crown',
    access: 'canAdmin',
    component: './Admin',
    routes: [
      {
        path: '/admin/sub-page',
        name: 'sub-page',
        icon: 'smile',
        component: './Welcome',
      },
      {
        component: './404',
      },
    ],
  },
  {
    name: '学员管理',
    path: '/business',
    redirect: '/business/studentmanages',
  },
  {
    name: '资源库',
    path: '/business/resource/info',
    component: './Business/Resource/ResourceInfo',
  },
  {
    name: '资源库',
    path: '/business/resource/statistics',
    component: './Business/Resource/Statistics',
  },
  {
    name: '流转资源看板',
    icon: 'table',
    path: '/business/resource/transformation',
    component: './Business/Resource/transformation',
  },
  {
    name: '领取记录',
    path: '/business/receive',
    component: './Business/Receive',
  },
  {
    name: '潜在所属学员',
    path: '/business/studentmanages',
    component: './Business/StudentManages',
  },
  {
    name: '潜在所属学员',
    path: '/business/studentmanageswx',
    component: './Business/StudentManageWx',
  },
  {
    name: '潜在学员',
    path: '/business/studentmanage',
    component: './Business/StudentManage',
  },
  {
    name: '待支付学员',
    path: '/business/studentmanage2',
    component: './Business/StudentManage2',
  },
  {
    name: '正式学员',
    path: '/business/studentmanagetrue',
    component: './Business/StudentManageTrue',
  },
  {
    name: '信息提供人',
    path: '/business/provideuser',
    component: './Business/ProvideUser',
  },
  {
    name: '提供人学员',
    path: '/business/studentdeal',
    component: './Business/StudentDeal',
  },
  {
    name: '新媒体学员',
    path: '/business/provide/resource',
    component: './Business/ProvideUser/Resource',
  },
  {
    name: '推荐学员',
    path: '/business/recommend',
    component: './Business/Recommend',
  },
  {
    name: '报名学员',
    path: '/business/signupstudent',
    component: './Business/SignUpStudent',
  },
  {
    name: '发票信息',
    path: '/business/invoice',
    component: './Business/Invoice',
  },
  {
    name: '服务记录',
    path: '/business/servicerecord',
    component: './Business/Servicerecord',
  },
  {
    name: '班级管理',
    path: '/business/classlist',
    component: './Business/ClassList',
  },
  {
    name: '消息管理',
    path: '/business/message',
    component: './Business/Message',
  },
  {
    name: '学员黑名单',
    path: '/business/blackliststudent',
    component: './Business/BlacklistStudent',
  },
  {
    name: '潜在团组',
    path: '/business/companymanage',
    component: './Business/CompanyManage',
  },
  {
    name: '待支付团组',
    path: '/business/companymanage2',
    component: './Business/CompanyManage2',
  },
  {
    name: '正式团组',
    path: '/business/companymanagetrue',
    component: './Business/CompanyManageTrue',
  },
  {
    name: '订单列表',
    path: '/business/businessorder',
    component: './Business/BusinessOrder',
  },
  {
    name: '待支付订单',
    path: '/business/payingorder',
    component: './Business/PayingOrder',
  },
  {
    name: '财务查询',
    path: '/business/businessorder/search',
    component: './Business/BusinessOrder/searchFalg',
  },
  {
    name: '专属收款码未下单记录',
    path: '/business/chargeLog',
    component: './Business/ChargeLog',
  },
  {
    name: '银行流水',
    path: '/business/businessTransaction',
    component: './Business/BusinessTransaction',
  },
  {
    name: '反馈中心',
    path: '/business/feedback',
    component: './Business/Feedback',
  },
  {
    name: '缴费列表',
    path: '/business/businesscharge/list',
    component: './Business/BusinessCharge/List',
  },
  {
    name: '喜报列表',
    path: '/business/businesscharge/xibao',
    component: './Business/BusinessCharge/xibao',
  },
  {
    name: '缴费审核',
    path: '/business/businesscharge/audit',
    component: './Business/BusinessCharge/Audit',
  },
  {
    name: '付费申请列表',
    path: '/business/paymentapply/list',
    component: './Business/PaymentApply/List',
  },
  {
    name: '付费申请列表审核',
    path: '/business/paymentapply/audit',
    component: './Business/PaymentApply/Audit',
  },
  {
    name: '来源统计',
    path: '/business/statistics/source',
    component: './Business/Statistics/Source',
  },
  {
    name: '部门看板',
    path: '/business/statistics/departmentkanban',
    component: './Business/Statistics/DepartmentKanban',
  },
  {
    name: '招生老师业绩统计',
    path: '/business/statistics/performance',
    component: './Business/Statistics/Performance',
  },
  {
    name: '新媒体运营统计',
    path: '/business/statistics/operations',
    component: './Business/Statistics/Operations',
  },
  {
    name: '业绩统计',
    path: '/business/statistics/performances',
    component: './Business/Statistics/Performances',
  },
  {
    name: '退费列表',
    path: '/business/refundCharge/list',
    component: './Business/RefundCharge/List',
  },
  {
    name: '退费审核',
    path: '/business/refundCharge/audit',
    component: './Business/RefundCharge/Audit',
  },
  {
    name: '老系统的退费',
    path: '/business/oldcharge/refundcharge',
    component: './Business/OldCharge/RefundCharge',
  },
  {
    name: '老系统的缴费',
    path: '/business/oldcharge/charge',
    component: './Business/OldCharge/Charge',
  },
  {
    name: '老系统的缴费审核',
    path: '/business/oldcharge/charges/audit',
    component: './Business/OldCharge/Charge/Audit',
  },
  {
    name: '老系统的退费审核',
    path: '/business/oldcharge/refundCharges/audit',
    component: './Business/OldCharge/RefundCharge/Audit',
  },
  {
    name: '公共文件下载',
    path: '/business/documents',
    component: './Business/Documents',
  },
  {
    name: '二维码跳转',
    path: '/business/qrcode',
    component: './Business/QRCode',
  },
  {
    name: '专属收款二维码',
    path: '/business/exclusiveqrcode',
    component: './Business/ExclusiveQRCode',
  },
  {
    name: '个人中心',
    path: '/users/usercenter',
    component: './UserCenter',
  },
  {
    name: '个人中心',
    path: '/users',
    redirect: '/users/usercenter',
  },
  {
    name: '部门看板',
    path: '/department',
    redirect: '/department/user',
  },
  {
    name: '部门人员业绩',
    path: '/department/achievement',
    component: './Department/Achievement',
  },
  {
    name: '个人业绩',
    path: '/department/user',
    component: './Department/AchievementUser',
  },
  {
    name: 'EC统计',
    path: '/department/ec',
    component: './Department/ECCall',
  },
  {
    name: '招聘管理',
    path: '/foreground/recruit',
    component: './Foreground/Recruit',
  },
  {
    name: '招聘统计',
    path: '/foreground/statistics',
    component: './Foreground/Statistics',
  },
  {
    name: '行政人资',
    path: '/foreground',
    redirect: '/foreground/recruit',
  },

  {
    name: '证书申请',
    path: '/foreground/cetrificate',
    component: './Foreground/Certificate',
  },
  {
    name: '证书管理',
    // icon: 'BookOutlined',
    path: '/foreground/cetrificateadmin',
    component: './Foreground/Certificateadmin',
  },
  {
    name: '服务协议',
    // icon: 'AuditOutlined',
    path: '/foreground/agreement',
    component: './Foreground/Agreement',
  },
  {
    name: '人员资料信息管理',
    icon: 'TeamOutlined',
    path: '/foreground/usermanage',
    component: './Foreground/UserManage',
  },
  {
    name: 'list.table-list',
    icon: 'table',
    path: '/list',
    component: './TableList',
  },
  {
    name: '数据字典',
    icon: 'table',
    path: '/admins/dictionaries',
    component: './Admins/Dictionaries',
  },
  {
    name: '跟踪回访记录',
    icon: 'table',
    path: '/business/adminreturnvisit',
    component: './Admins/AdminReturnVisit',
  },
  {
    name: '部门管理',
    icon: 'table',
    path: '/admins/department',
    component: './Admins/Department',
  },
  {
    name: '订单列表',
    icon: 'table',
    path: '/admins/adminOrder',
    component: './Admins/AdminOrder',
  },
  {
    name: '赋权规则',
    path: '/admins/interceptionRule',
    component: './Admins/InterceptionRule',
  },
  {
    name: '系统设置',
    path: '/admins/sysconfig',
    component: './Admins/SysConfig',
  },
  {
    name: '角色管理',
    path: '/admins/adminRole',
    component: './Admins/AdminRole',
  },
  {
    name: '系统日志',
    icon: 'table',
    path: '/admins/callhistory',
    component: './Admins/CallHistory',
  },
  {
    name: '通话记录',
    icon: 'table',
    path: '/admins/adminlog',
    component: './Admins/AdminLog',
  },
  {
    name: '用户管理',
    icon: 'table',
    path: '/admins/usermanage',
    component: './Admins/UserManage',
  },
  {
    name: '合同管理',
    icon: 'table',
    path: '/admins/contract',
    component: './Admins/Contract',
  },
  {
    name: '合同模板',
    icon: 'table',
    path: '/business/contemplate',
    component: './Admins/ConTemplate',
  },
  {
    name: '合同模板下载',
    icon: 'table',
    path: '/business/contemplates/contractcontemplate',
    component: './Admins/ConTemplate/ContractContemplate',
  },
  {
    name: '合同列表',
    icon: 'table',
    path: '/business/contractlist',
    component: './Admins/ContractList',
  },
  {
    name: '合同审核',
    icon: 'table',
    path: '/business/contractaudit',
    component: './Business/ContractAudit',
  },
  {
    name: '系统公司',
    icon: 'table',
    path: '/business/contract',
    component: './Business/Contract',
  },
  {
    name: '银行信息',
    path: '/admins/bank',
    component: './Admins/Bank',
  },
  {
    name: '推荐信息配置',
    path: '/admins/recommends',
    component: './Admins/Recommend',
  },
  {
    name: '新媒体排班表',
    path: '/admins/scheduling',
    component: './Admins/Scheduling',
  },
  {
    name: '通知',
    icon: 'table',
    path: '/admins/notice',
    component: './Admins/Notice',
  },
  {
    name: '收费标准',
    icon: 'table',
    path: '/admins/jobassociation',
    component: './Admins/JobAssociation',
  },
  {
    name: '报考资料',
    icon: 'table',
    path: '/business/jobassociation',
    component: './Business/JobAssociation',
  },
  {
    name: '资料字段',
    icon: 'table',
    path: '/admins/signupdata',
    component: './Admins/SignUpData',
  },
  {
    name: '学员管理',
    icon: 'table',
    path: '/admins/studentmanage',
    component: './Admins/StudentManage',
  },
  {
    name: '缴费列表',
    icon: 'table',
    path: '/admins/charge',
    component: './Admins/AdminCharge',
  },
  {
    name: '管理员管理',
    icon: 'table',
    path: '/admins',
    // component: './Admins/AdminUser',
    redirect: '/admins/usermanage',
  },
  // {
  //   path: '/admins',
  //   redirect: '/admins/studentmanage',
  // },
  // {
  //   path: '/business',
  //   redirect: '/business/studentmanage',
  // },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    component: './404',
  },
];
