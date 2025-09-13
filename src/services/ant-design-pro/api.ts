// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import request1 from './apiRequest';
// import component from '@/locales/bn-BD/component';

/** 获取待办事项列表 GET /sms/business/bizTodo */
export async function getTodoList(params?: any, options?: { [key: string]: any }) {
  return request1.get('/sms/business/bizTodo', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

/** 创建/更新待办事项 POST /sms/business/bizTodo */
export async function saveTodo(data: any, options?: { [key: string]: any }) {
  return request1.post('/sms/business/bizTodo', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

/** 删除待办事项 DELETE /sms/business/bizTodo */
export async function deleteTodo(params: any, options?: { [key: string]: any }) {
  return request1.delete('/sms/business/bizTodo', {
    method: 'DELETE',
    params,
    ...(options || {}),
  });
}

/** 完成待办事项 POST /sms/business/bizTodo/complete/{id} */
export async function completeTodo(id: number, options?: { [key: string]: any }) {
  return request1.post(`/sms/business/bizTodo/complete/${id}`, {
    method: 'POST',
    ...(options || {}),
  });
}

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  // const convertToRoutes = (menuData: any[], level = 1) => {
  //   return menuData.map(item => {
  //     const route: any = {
  //       path: item.code,
  //       name: item.name,
  //       component: item.path,
  //       key: item.id || item.code,
  //       // 只为二级菜单添加图标
  //       ...(level === 2 ? { icon: item.icon || 'table' } : {}),
  //       // 添加选中状态相关的属性
  //       exact: true, // 精确匹配路由
  //       activeMenu: item.code, // 添加activeMenu属性，用于控制菜单选中状态
  //     };

  //     // 确保每个菜单项有唯一的key
  //     if (item.children && item.children.length > 0) {
  //       route.routes = convertToRoutes(item.children, level + 1);
  //       // 使用menu属性来控制菜单行为，而不是flatMenu
  //       route.menu = {
  //         hideChildren: false, // 不隐藏子菜单
  //         defaultOpen: true, // 默认展开子菜单
  //       };

  //       // 为父级菜单添加选中状态控制
  //       if (level === 1) {
  //         route.activeMenuParent = true; // 标记为父级菜单，当子菜单被选中时也高亮显示
  //       }
  //     }

  //     return route;
  //   });
  // }

  // const loginRouter = await request1.get('/sms/user/getMenus');
  // // 添加对loginRouter.data为null的检查
  // let newRouter = loginRouter.data ? convertToRoutes(loginRouter.data) : [];

  // const user: any = await request1.get('/sms/user');
  let user: any = JSON.parse(sessionStorage.getItem('userInfo') as string);
  if (!user) {
    user = await request1.get('/sms/user');
    sessionStorage.setItem('userInfo', JSON.stringify(user));
  }
  return {
    ...user.data,
    // avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
    avatar: 'http://m.imeitou.com/uploads/allimg/220713/7-220G3111245.jpg',
    userid: user.data.id,
    // access: 'admin',
    // id: user.data.id,
    router: [
      {
        path: '/user',
        layout: false,
        exact: true,
        activeMenu: '/user',
        activeMenuParent: true,
        menu: {
          hideChildren: false,
          defaultOpen: true,
        },
        routes: [
          {
            path: '/user',
            exact: true,
            activeMenu: '/user',
            activeMenuParent: true,
            menu: {
              hideChildren: false,
              defaultOpen: true,
            },
            routes: [
              {
                name: 'login',
                path: '/user/login',
                component: './user/Login',
                exact: true,
                activeMenu: '/user/login',
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
        exact: true,
        activeMenu: '/public',
        activeMenuParent: true,
        menu: {
          hideChildren: false,
          defaultOpen: true,
        },
        routes: [
          {
            path: '/public',
            exact: true,
            activeMenu: '/public',
            activeMenuParent: true,
            menu: {
              hideChildren: false,
              defaultOpen: true,
            },
            routes: [
              {
                name: 'charge',
                path: '/public/charge',
                component: './Public/Charge',
                exact: true,
                activeMenu: '/public/charge',
              },
            ],
          },
        ],
      },
      {
        path: '/welcome',
        name: '首页',
        // icon: 'smile',
        component: './Welcome',
        exact: true, // 添加精确匹配
        activeMenu: '/welcome', // 添加activeMenu属性
        // routes: [
        //   {
        //     name: '工作台',
        //     icon: 'DashboardOutlined',
        //     path: '/welcome',
        //     component: './Welcome',
        //   },
        // ],
      },
      // {
      //   name: '列表',
      //   // icon: 'table',
      //   path: '/list',
      //   component: './TableList',
      // },

      //...(newRouter || []), // 使用展开运算符添加动态路由，并确保在newRouter为null或undefined时使用空数组

      {
        name: '学员管理',
        path: '/business',
        // redirect: '/business/studentmanage',
        routes: [
          {
            name: '信息共享',
            icon: 'table',
            // path: '/admins/contract',
            // component: './Admins/Contract',
            routes: [
              {
                name: '合同模板下载',
                path: '/business/contemplates/contractcontemplate',
                component: './Admins/ConTemplate/ContractContemplate',
              },
              {
                name: '公司信息',
                icon: 'table',
                path: '/business/contract',
                component: './Business/Contract',
              },
              {
                name: '其他共享文件',
                path: '/business/documents',
                component: './Business/Documents',
              },
            ],
          },
          {
            name: '售前服务',
            icon: 'MessageOutlined',
            routes: [
              {
                name: '下单专页',
                path: '/business/orderpage',
                component: './Business/OrderPage',
              },
              {
                name: '潜在所属学员',
                icon: 'SolutionOutlined',
                path: '/business/studentmanages',
                component: './Business/StudentManages',
              },
              {
                name: '潜在学员',
                icon: 'SolutionOutlined',
                path: '/business/studentmanage',
                component: './Business/StudentManage',
              },
              {
                name: '潜在团组',
                icon: 'TeamOutlined',
                path: '/business/companymanage',
                component: './Business/CompanyManage',
              },
              {
                name: '待支付学员',
                icon: 'SolutionOutlined',
                path: '/business/studentmanage2',
                component: './Business/StudentManage2',
              },
              {
                name: '待支付团组',
                icon: 'TeamOutlined',
                path: '/business/companymanage2',
                component: './Business/CompanyManage2',
              },
              {
                name: '小程序下单学员',
                icon: 'SolutionOutlined',
                path: '/business/studentmanageswx',
                component: './Business/StudentManageWx',
              },
              {
                name: '推荐学员',
                path: '/business/recommend',
                component: './Business/Recommend',
              },
              {
                name: '跟踪回访记录',
                icon: 'MessageOutlined',
                path: '/business/adminreturnvisit',
                component: './Admins/AdminReturnVisit',
              },
              {
                name: '学员提供信息',
                path: '/business/provideuser',
                component: './Business/ProvideUser',
              },
              // {
              //   name: '新媒体学员',
              //   path: '/business/provide/resource',
              //   component: './Business/ProvideUser/Resource',
              // },

              {
                name: '小程序二维码下载',
                path: '/business/qrcode',
                component: './Business/QRCode',
              },
              {
                name: '专属收款二维码',
                path: '/business/exclusiveqrcode',
                component: './Business/ExclusiveQRCode',
              },
              {
                name: '专属码未支付申请退款',
                path: '/business/exclusiveqrcoderefund',
                component: './Business/ExclusiveQRCodeRefund',
              },
            ],
          },
          {
            name: '学员管理',
            icon: 'TeamOutlined',
            routes: [
              {
                name: '正式学员',
                icon: 'SolutionOutlined',
                path: '/business/studentmanagetrue',
                component: './Business/StudentManageTrue',
              },
              {
                name: '学员等级',
                path: '/business/studentlevel',
                component: './Business/StudentLevel',
              },
              {
                name: '正式团组',
                icon: 'TeamOutlined',
                path: '/business/companymanagetrue',
                component: './Business/CompanyManageTrue',
              },
              {
                name: '提供人学员',
                path: '/business/studentdeal',
                component: './Business/StudentDeal',
              },
              {
                name: '学员黑/白名单',
                // icon: 'UsergroupDeleteOutlined',
                path: '/business/blackliststudent',
                component: './Business/BlacklistStudent',
              },
              {
                name: '报名学员',
                path: '/business/signupstudent',
                component: './Business/SignUpStudent',
              },
              {
                name: '报名团组',
                path: '/business/teamstudent',
                component: './Business/TeamStudent',
              },
              {
                name: '题库设置',
                path: '/business/question',
                component: './Business/Question',
              },
              {
                name: '开通记录',
                path: '/business/openquestionrecord',
                component: './Business/OpenquestionRecord',
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
                name: '报考资料设置',
                icon: 'table',
                path: '/business/jobassociation',
                component: './Business/JobAssociation',
              },
              {
                name: '服务记录',
                path: '/business/servicerecord',
                component: './Business/Servicerecord',
              },
            ],
          },
          {
            name: '订单缴费',
            icon: 'AccountBookOutlined',
            routes: [
              {
                name: '订单列表',
                icon: 'table',
                path: '/business/businessorder',
                component: './Business/BusinessOrder',
              },
              // {
              //   name: '补缴下单',
              //   path: '/business/supplementary',
              //   component: './Business/Supplementary',
              // },
              {
                name: '待支付订单',
                icon: 'table',
                path: '/business/payingorder',
                component: './Business/PayingOrder',
              },
              {
                name: '缴费列表',
                path: '/business/businesscharge/list',
                component: './Business/BusinessCharge/List',
              },
              {
                name: '退款',
                path: '/business/refund',
                component: './Business/Refund',
              },
              {
                name: '补缴下单',
                path: '/business/supplementaryorder',
                component: './Business/SuppleMentaryOrder',
              },
              {
                name: '开具发票',
                path: '/business/invoicelist',
                component: './Business/InvoiceList',
              },
              {
                name: '发票信息',
                path: '/business/invoice',
                component: './Business/Invoice',
              },
              {
                name: '缴费审核',
                path: '/business/businesscharge/audit',
                component: './Business/BusinessCharge/Audit',
              },
              {
                name: '喜报列表',
                path: '/business/businesscharge/xibao',
                component: './Business/BusinessCharge/xibao',
              },
              {
                name: '退费列表',
                icon: 'AccountBookOutlined',
                path: '/business/refundCharge/list',
                component: './Business/RefundCharge/List',
              },
              {
                name: '退费审核',
                path: '/business/refundCharge/audit',
                component: './Business/RefundCharge/Audit',
              },
              {
                name: '财务查询',
                path: '/business/businessorder/search',
                component: './Business/BusinessOrder/searchFalg',
              },
              {
                name: '专属码申请退款审核',
                path: '/business/refundreview',
                component: './Business/RefundReview',
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
            ],
          },
          {
            name: '资源管理',
            icon: 'table',
            routes: [
              {
                name: '资源库',
                icon: 'table',
                path: '/business/resource/info',
                component: './Business/Resource/ResourceInfo',
              },
              {
                name: '流转资源看板',
                icon: 'table',
                path: '/business/resource/statistics',
                component: './Business/Resource/Statistics',
              },
              {
                name: '领取记录',
                icon: 'table',
                path: '/business/receive',
                component: './Business/Receive',
              },
            ],
          },
          {
            name: '付费申请',
            icon: 'table',
            routes: [
              {
                name: '申请列表',
                icon: 'table',
                path: '/business/paymentapply/list',
                component: './Business/PaymentApply/List',
              },
              {
                name: '审核列表',
                path: '/business/paymentapply/audit',
                component: './Business/PaymentApply/Audit',
              },
            ],
          },
          {
            name: '合同管理',
            icon: 'table',
            // path: '/admins/contract',
            // component: './Admins/Contract',
            routes: [
              {
                name: '合同列表',
                path: '/business/contractlist',
                component: './Admins/ContractList',
              },
              {
                name: '合同审核',
                path: '/business/contractaudit',
                component: './Business/ContractAudit',
              },
              {
                name: '合同模板',
                path: '/business/contemplate',
                component: './Admins/ConTemplate',
              },
            ],
          },

          {
            name: '数据统计',
            icon: 'AreaChartOutlined',
            path: '/business/data-statistics',
            routes: [
              // {
              //   name: '部门看板',
              //   path: '/business/statistics/departmentkanban',
              //   component: './Business/Statistics/DepartmentKanban',
              // },
              {
                name: '学生来源',
                path: '/business/data-statistics/source',
                component: './Business/Statistics/Source',
              },
              // {
              //   name: '招生老师业绩统计',
              //   path: '/business/data-statistics/performance',
              //   component: './Business/Statistics/Performance',
              // },
              {
                name: '业绩统计',
                path: '/business/data-statistics/performances',
                component: './Business/Statistics/Performances',
              },
              {
                name: '新媒体运营统计',
                path: '/business/data-statistics/operations',
                component: './Business/Statistics/Operations',
              },
            ],
          },
          {
            name: '历史遗留退缴费',
            icon: 'AccountBookOutlined',
            routes: [
              {
                name: '缴费列表',
                path: '/business/oldcharge/charges/audit',
                component: './Business/OldCharge/Charge/Audit',
              },

              {
                name: '退费列表',
                path: '/business/oldcharge/refundCharges/audit',
                component: './Business/OldCharge/RefundCharge/Audit',
              },
            ],
          },
          {
            name: '反馈中心',
            icon: 'AccountBookOutlined',
            routes: [
              {
                name: '反馈中心',
                path: '/business/feedback',
                component: './Business/Feedback',
              },
            ],
          },
          {
            name: '培训申请',
            icon: 'AccountBookOutlined',
            routes: [
              {
                name: '培训申请',
                path: '/foreground/cetrificate',
                component: './Foreground/Certificate',
              },
            ],
          },
          {
            name: '资源小组管理',
            icon: 'ClusterOutlined',
            routes: [
              {
                name: '资源小组',
                path: '/business/cluemanagement',
                component: './Business/Cluemanagement',
              },
            ],
          },
          {
            name: '新媒体资源',
            icon: 'table',
            routes: [
              {
                name: '新媒体资源视图',
                path: '/business/newmedia/view',
                component: './Business/NewMediaResource/View',
              },
              {
                path: '/business/newmedia',
                redirect: '/business/newmedia/view',
              },
            ],
          },
          // {
          //   name: '销售管理',
          //   icon: 'table',
          //   routes: [
          //     {
          //       name: '销售管理',
          //       path: '/business/sales/manage',
          //       component: './Business/Sales/Manage',
          //     },
          //     {
          //       name: '销售等级',
          //       path: '/business/sales/level',
          //       component: './Business/Sales/Level',
          //     },
          //   ]
          // },
          {
            name: 'SOP模板管理',
            icon: 'table',
            routes: [
              {
                name: 'SOP模板管理',
                path: '/business/sop/template',
                component: './Business/SOP/Template',
              },
            ],
          },
          {
            name: '统计报表',
            icon: 'AreaChartOutlined',
            path: '/business/statistics',
            routes: [
              // {
              //   name: '销售市场业绩报表',
              //   path: '/business/statistics/sales-report',
              //   component: './Business/Statistics/SalesReport',
              // },
              {
                name: '新媒体运营报表',
                path: '/business/statistics/new-media-report',
                component: './Business/Statistics/NewMediaReport',
              },
              {
                name: '销售业绩报表',
                path: '/business/statistics/sales-performance-report',
                component: './Business/Statistics/SalesPerformanceReport',
              },
            ],
          },
          {
            name: '线索列表',
            icon: 'table',
            routes: [
              {
                name: '新媒体线索视图',
                path: '/business/cluelist/personview',
                component: './Business/Cluelist/PersonView',
              },
              {
                name: '线索池',
                path: '/business/cluelist/managerview',
                component: './Business/Cluelist/Managerview',
              },
            ],
          },
          {
            name: '销售线索视图',
            icon: 'ClusterOutlined',
            path: '/business/saleslead',
            component: './Business/SalesLead',
          },
          // {
          //   name:'销售线索管理',
          //   icon: 'table',
          //   routes: [
          //     {
          //       name:'个人视图',
          //       path:'/business/salelead/salepersonlead',
          //       component:'./Business/SaleLead/SaleGroupLead'
          //     },
          //     {
          //       name:'管理视图',
          //       path: '/business/salelead/salegrouplead',
          //       component: './Business/SaleLead/SalePersonLead'
          //     }
          //   ]
          // }
        ],
      },
      {
        path: '/department',
        name: '部门看板',
        // redirect: './finance/financecharge',
        routes: [
          {
            name: '个人看板',
            icon: 'table',
            path: '/department/user',
            component: './Department/AchievementUser',
          },
          {
            name: '部门看板',
            icon: 'table',
            path: '/department/achievement',
            component: './Department/Achievement',
          },
          {
            name: 'EC统计',
            icon: 'table',
            path: '/department/ec',
            component: './Department/ECCall',
          },
        ],
      },
      {
        name: '个人中心',
        path: '/users',
        routes: [
          {
            name: '个人中心',
            icon: 'UserOutlined',
            path: '/users/usercenter',
            component: './UserCenter',
          },
          {
            name: '待办计划',
            icon: 'ReadOutlined',
            path: '/users/todolist',
            component: './UserCenter/TodoList',
          },
        ],
      },
      {
        name: '行政人资',
        path: '/foreground',
        // component: './UserCenter',
        routes: [
          {
            name: '招聘管理',
            icon: 'UserOutlined',
            path: '/foreground/recruit',
            component: './Foreground/Recruit',
          },
          {
            name: '招聘统计',
            icon: 'table',
            path: '/foreground/statistics',
            component: './Foreground/Statistics',
          },
          {
            name: '培训申请',
            icon: 'MessageOutlined',
            path: '/foreground/cetrificate',
            component: './Foreground/Certificate',
          },
          {
            name: '证书管理',
            // icon: 'BookOutlined',
            icon: 'ReadOutlined',
            path: '/foreground/cetrificateadmin',
            component: './Foreground/Certificateadmin',
          },
          {
            name: '服务协议',
            icon: 'FolderOpenOutlined',
            // icon: 'AuditOutlined',
            path: '/foreground/agreement',
            component: './Foreground/Agreement',
          },
          {
            name: '人员资料',
            icon: 'TeamOutlined',
            path: '/foreground/usermanage',
            component: './Foreground/UserManage',
          },
        ],
      },
      {
        name: '管理员管理',
        // icon: 'UserOutlined',
        path: '/admins',
        // component: './Admins/AdminUser',
        routes: [
          {
            name: '用户相关',
            icon: 'TeamOutlined',
            routes: [
              {
                name: '用户管理',
                path: '/admins/usermanage',
                component: './Admins/UserManage',
              },
              {
                name: '销售等级',
                path: '/admins/saleslevel',
                component: './Admins/SalesLevel',
              },
              // {
              //   name: '用户等级',
              //   path: '/business/sales/level',
              //   component: './Business/Sales/Level',
              // },
            ],
          },
          // {
          //   name: '用户相关',
          //   icon: 'table',
          //   routes: [
          //     {
          //       name: '用户管理',
          //       path: '/business/sales/manage',
          //       component: './Business/Sales/Manage',
          //     },
          //     {
          //       name: '用户等级',
          //       path: '/business/sales/level',
          //       component: './Business/Sales/Level',
          //     },
          //   ]
          // },
          {
            name: '部门管理',
            icon: 'ClusterOutlined',
            path: '/admins/department',
            component: './Admins/Department',
          },
          // {
          //   name: '菜单管理',
          //   icon: 'ClusterOutlined',
          //   path: '/admins/menusmanger',
          //   component: './Admins/MenusManger',
          // },
          {
            name: '角色管理',
            icon: 'TeamOutlined',
            path: '/admins/adminRole',
            component: './Admins/AdminRole',
          },
          {
            name: '收费标准',
            icon: 'ClusterOutlined',
            path: '/admins/jobassociation',
            component: './Admins/JobAssociation',
          },
          {
            name: '报名资料',
            icon: 'table',
            path: '/admins/signupdata',
            component: './Admins/SignUpData',
          },
          {
            name: '数据字典',
            icon: 'ReadOutlined',
            path: '/admins/dictionaries',
            component: './Admins/Dictionaries',
          },
          {
            name: '赋权规则',
            icon: 'ReadOutlined',
            path: '/admins/interceptionRule',
            component: './Admins/InterceptionRule',
          },
          {
            name: '系统设置',
            icon: 'SettingOutlined',
            path: '/admins/sysconfig',
            component: './Admins/SysConfig',
          },
          {
            name: '通知管理',
            icon: 'BellOutlined',
            path: '/admins/notice',
            component: './Admins/Notice',
          },
          {
            name: '系统日志',
            icon: 'FolderOpenOutlined',
            path: '/admins/adminlog',
            component: './Admins/AdminLog',
          },
          {
            name: '通话记录',
            icon: 'table',
            path: '/admins/callhistory',
            component: './Admins/CallHistory',
          },
          {
            name: '公司信息',
            icon: 'table',
            path: '/admins/contract',
            component: './Admins/Contract',
          },
          {
            name: '银行信息',
            icon: 'table',
            path: '/admins/bank',
            component: './Admins/Bank',
          },
          {
            name: '排班计划',
            path: '/admins/scheduling',
            icon: 'ReadOutlined',
            component: './Admins/Scheduling',
          },
          {
            name: '系统配置',
            icon: 'SettingOutlined',
            routes: [
              {
                name: '项目有效期配置',
                path: '/admins/expirationdate',
                icon: 'FieldTimeOutlined',
                component: './Admins/ExpirationDate',
              },
              {
                name: '共享学员设置',
                path: '/admins/shared-student',
                icon: 'ShareAltOutlined',
                component: './Admins/SharedStudent',
              },
            ],
          },
          // {
          //   name: '有效期配置',
          //   path: '/admins/expiration',
          //   component: './Admins/Expiration'
          // },
          {
            name: '推荐学员配置',
            path: '/admins/recommends',
            icon: 'ReadOutlined',
            component: './Admins/Recommend',
          },
        ],
      },

      {
        path: '/',
        redirect: '/welcome',
        exact: true,
        activeMenu: '/',
      },
      {
        component: './404',
        exact: true,
        activeMenu: '/404',
      },
    ],
  };
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/login/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口 POST /api/login/account */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/api/login/account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any }
) {
  return request<API.RuleList>('/api/rule', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 新建规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'PUT',
    ...(options || {}),
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** ================= 学员等级 API ================= */
/** 列表 GET /sms/student/level */
export async function getStudentLevel(params?: any) {
  return request1.get('/sms/student/level', params);
}
/** 新增 POST /sms/student/level */
export async function createStudentLevel(data: any) {
  return request1.post('/sms/student/level', data);
}
/** 更新 POST /sms/student/level/update */
export async function updateStudentLevel(data: any) {
  return request1.post('/sms/student/level/update', data);
}
/** 删除 DELETE /sms/student/level */
export async function deleteStudentLevel(id: number | string) {
  return request1.delete('/sms/student/level', { id });
}

/** ================= 项目有效期配置 API ================= */
/** 列表 GET /sms/business/bizEffectiveConfig */
export async function getProjectValidityConfig(params?: any) {
  return request1.get('/sms/business/bizEffectiveConfig', params);
}
/** 新增 POST /sms/business/bizEffectiveConfig */
export async function createProjectValidityConfig(data: any) {
  return request1.post('/sms/business/bizEffectiveConfig', data);
}
/** 更新 POST /sms/business/bizEffectiveConfig */
export async function updateProjectValidityConfig(data: any) {
  return request1.post('/sms/business/bizEffectiveConfig', data);
}
/** 删除 DELETE /sms/business/bizEffectiveConfig */
export async function deleteProjectValidityConfig(id: number | string) {
  return request1.delete('/sms/business/bizEffectiveConfig', { id });
}

/** ================= 共享学员设置 API ================= */
/** 列表 GET /sms/business/bizCompanyShare */
export async function getSharedStudentConfig(params?: any) {
  return request1.get('/sms/business/bizCompanyShare', params);
}
/** 新增 POST /sms/business/bizCompanyShare */
export async function createSharedStudentConfig(data: any) {
  return request1.post('/sms/business/bizCompanyShare', data);
}
/** 删除 DELETE /sms/business/bizCompanyShare */
export async function deleteSharedStudentConfig(id: number | string) {
  return request1.delete('/sms/business/bizCompanyShare', { id });
}
