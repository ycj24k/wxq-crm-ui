//import 'antd/dist/reset.css';
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
import ErrorBoundary from '@/components/ErrorBoundary';
import errorHandler from '@/utils/errorHandler';
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
  FieldTimeOutlined,
  ExceptionOutlined
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
  FieldTimeOutlined: <FieldTimeOutlined />,
  ExceptionOutlined:<ExceptionOutlined />
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




    // // 自定义菜单项渲染
    // menuItemRender: (menuItemProps, defaultDom) => {
    //   // 获取当前路径
    //   const { location } = history;
    //   const { path } = menuItemProps;

    //   // 判断当前菜单项是否被选中
    //   const isSelected = location.pathname === path || location.pathname.startsWith(path + '/');

    //   // 使用更可靠的方法判断菜单位置
    //   // 检查DOM结构中的父元素类名来确定是顶部菜单还是侧边栏菜单
    //   const isTopMenu = menuItemProps.isUrl !== true && !menuItemProps.pro_layout_parentKeys?.length;

    //   // 基本样式 - 移除可能导致文字位置变化的属性
    //   const baseStyle = {
    //     height: '100%',
    //     transition: 'all 0.3s',
    //   };

    //   if (isSelected) {
    //     // 为选中的菜单项添加自定义类名
    //     const className = isTopMenu
    //       ? 'ant-pro-menu-item-link selected-top-menu'
    //       : 'ant-pro-menu-item-link selected-side-menu';

    //     return (
    //       <Link
    //         to={menuItemProps.path || '/'}
    //         style={baseStyle}
    //         className={className}
    //       >
    //         {defaultDom}
    //       </Link>
    //     );
    //   }

    //   // 非选中状态
    //   return (
    //     <Link
    //       to={menuItemProps.path || '/'}
    //       style={baseStyle}
    //       className="ant-pro-menu-item-link"
    //     >
    //       {defaultDom}
    //     </Link>
    //   );
    // },

    // // 自定义子菜单渲染
    // subMenuItemRender: (item, defaultDom) => {
    //   // 获取当前路径
    //   const { location } = history;
    //   const { path } = item;

    //   // 判断当前菜单项是否被选中或者其子菜单是否被选中
    //   const isSelected = location.pathname === path || location.pathname.startsWith(path + '/');

    //   return (
    //     <div
    //       style={{
    //         color: isSelected ? '#ccc' : undefined,
    //         width: '100%',
    //         transition: 'color 0.3s',
    //       }}
    //     >
    //       {defaultDom}
    //     </div>
    //   );
    // },





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
      autoClose: true, //需要修改为false
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