import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { SettingDrawer } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import type { RunTimeLayoutConfig } from 'umi';
import { history, Link } from 'umi';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import { currentUser as queryCurrentUser } from './services/ant-design-pro/api';
import Dictionaries from './services/util/dictionaries';
import Socket from '@/services/util/websocket';
import {
  SmileOutlined,
  HeartOutlined,
  CrownOutlined,
  TableOutlined,
  UserOutlined,
  FolderOpenOutlined,
  TeamOutlined,
  ClusterOutlined,
  ReadOutlined,
  SolutionOutlined,
  BellOutlined,
  MessageOutlined,
  AccountBookOutlined,
  DashboardOutlined,
  AreaChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import defaultSettings from '../config/defaultSettings';
import type { MenuDataItem } from '@ant-design/pro-layout';
import { getSession } from './services/util/util';
const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';
const IconMap = {
  SettingOutlined: <SettingOutlined />,
  smile: <SmileOutlined />,
  heart: <HeartOutlined />,
  crown: <CrownOutlined />,
  table: <TableOutlined />,
  AreaChartOutlined: <AreaChartOutlined />,
  BellOutlined: <BellOutlined />,
  AccountBookOutlined: <AccountBookOutlined />,
  MessageOutlined: <MessageOutlined />,
  ReadOutlined: <ReadOutlined />,
  UserOutlined: <UserOutlined />,
  TeamOutlined: <TeamOutlined />,
  FolderOpenOutlined: <FolderOpenOutlined />,
  ClusterOutlined: <ClusterOutlined />,
  SolutionOutlined: <SolutionOutlined />,
  DashboardOutlined: <DashboardOutlined />,
};
/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

const loopMenuItem = (menus: MenuDataItem[]): MenuDataItem[] =>
  menus.map(({ icon, routes, ...item }) => ({
    ...item,
    icon: icon && IconMap[icon as string],
    routes: routes && loopMenuItem(routes),
  }));
/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  routes?: MenuDataItem[];
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser();
      return msg;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };

  // 如果不是登录页面，执行
  if (history.location.pathname !== loginPath && !history.location.pathname.startsWith('/public')) {
    const currentUser = await fetchUserInfo();

    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings,
  };
}

if (history.location.pathname !== loginPath && !history.location.pathname.startsWith('/public')) {
  Dictionaries.get();
  // Dictionaries.getDepartmentName(47);
  getSession()
  //   if (!Socket.sockets) Socket.open();
}

const jurisdiction = (url: string, userUrl: [] = []) => {
  if (url == loginPath || url.startsWith('/public')) return;
  let arr: any[] = [];

  const treeList = (arrList: []) => {
    if (!arrList) history.push(loginPath);
    arrList.forEach((item: { path: any; routes: [] }) => {
      if (item.path && item.path != '/') arr.push(item.path);
      if (item.routes && item.routes.length > 0) {
        treeList(item.routes);
      }
    });
  };
  treeList(userUrl);
  // arr = treeList(userUrl);
  if ((arr.indexOf(url) as unknown) == '-1') {
    history.push('/');
  }

  // userUrl.forEach((item: { path: any }) => {
  //   console.log('item', item);
  // });
};
window.addEventListener('unload', () => {
  localStorage.removeItem('Department');
});
// window.onbeforeunload = function(ev) {
//   return true;
// };
// ProLayout 支持的api https://procomponents.ant.design/components/layout
// @ts-ignore
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    waterMarkProps: {
      content: '文星棋管理系统',
      // content: initialState?.currentUser?.name,
    },

    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath && !location.pathname.startsWith('/public')) {
        history.push(loginPath);
      }
      // if (!localStorage.getItem('dictionariesList')) {
      //   Dictionaries.get();
      // }
      jurisdiction(location.pathname, initialState?.currentUser?.router);
      // if (location.pathname !== loginPath) {
      //   Dictionaries.isLatestDict();
      // }
    },
    onMenuHeaderClick: () => {
      history.push('/welcome');
    },
    menuHeaderRender: undefined,
    menu: {
      autoClose: true,
      locale: false,
      request: async () => {
        return loopMenuItem(initialState?.currentUser?.router);
      },
    },
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    // childrenRender: (children, props) => {
    //   // if (initialState?.loading) return <PageLoading />;
    //   return (
    //     <div>
    //       {children}
    //       {!props.location?.pathname?.includes('/login') && (
    //         <SettingDrawer
    //           disableUrlParams
    //           enableDarkTheme
    //           settings={initialState?.settings}
    //           onSettingChange={(settings) => {
    //             setInitialState((preInitialState: any) => ({
    //               ...preInitialState,
    //               settings,
    //             }));
    //           }}
    //         />
    //       )}
    //     </div>
    //   );
    // },
    ...initialState?.settings,
  };
};
