// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import request1 from './apiRequest';

/** 获取用户路由权限 GET /api/user/routes */
export async function getUserRoutes(options?: { [key: string]: any }) {
  try {
    // 从缓存中获取路由配置
    const cachedRoutes = sessionStorage.getItem('userRoutes');
    if (cachedRoutes) {
      return JSON.parse(cachedRoutes);
    }
    
    // 如果缓存中没有，则从服务器获取
    const result = await request1.get('/api/user/routes');
    if (result && result.data) {
      // 缓存路由配置
      sessionStorage.setItem('userRoutes', JSON.stringify(result.data));
      return result.data;
    }
    
    // 如果服务器没有返回路由配置，则使用默认路由配置
    return getDefaultRoutes();
  } catch (error) {
    console.error('获取用户路由权限失败:', error);
    // 如果获取失败，则使用默认路由配置
    return getDefaultRoutes();
  }
}

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  // const user: any = await request1.get('/sms/user');
  let user: any = JSON.parse(sessionStorage.getItem('userInfo') as string);
  if (!user) {
    user = await request1.get('/sms/user');
    sessionStorage.setItem('userInfo', JSON.stringify(user));
  }
  
  // 获取用户路由权限
  const router = await getUserRoutes();
  
  return {
    ...user.data,
    // avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
    avatar: 'http://m.imeitou.com/uploads/allimg/220713/7-220G3111245.jpg',
    userid: user.data.id,
    // access: 'admin',
    // id: user.data.id,
    router: router,
  };
}

/** 获取默认路由配置 */
function getDefaultRoutes() {
  return [
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
      name: '首页',
      // icon: 'smile',
      component: './Welcome',
    },
    // 基础路由，所有用户都应该有权限访问
    {
      path: '/',
      redirect: '/welcome',
    },
    {
      component: './404',
    },
  ];
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
  options?: { [key: string]: any },
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