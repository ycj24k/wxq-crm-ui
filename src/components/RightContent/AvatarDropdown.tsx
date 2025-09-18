import React, { useCallback } from 'react';
import { BellOutlined, LogoutOutlined, SettingOutlined, UserOutlined, ScheduleOutlined } from '@ant-design/icons';
import { Avatar, Menu, Spin, Badge } from 'antd';
import { history, useModel } from 'umi';
import { stringify } from 'querystring';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import { outLogin } from '@/services/ant-design-pro/api';
import type { MenuInfo } from 'rc-menu/lib/interface';
import request from '@/services/ant-design-pro/apiRequest';
import Sockect from '@/pages/Sockect';

export type GlobalHeaderRightProps = {
  menu?: boolean;
};

/**
 * 退出登录，并且将当前的 url 保存
 */
const loginOut = async () => {
  sessionStorage.removeItem('tokenName');
  sessionStorage.removeItem('tokenValue');
  sessionStorage.removeItem('userInfo');
  // await request.get('/sms/user/logout');
  const { query = {}, search, pathname } = history.location;
  const { redirect } = query;

  // Note: There may be security issues, please note
  if (window.location.pathname !== '/user/login' && !redirect) {
    history.replace({
      pathname: '/user/login',
      search: stringify({
        redirect: pathname + search,
      }),
    });
  }
};

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu }) => {
  const { initialState, setInitialState } = useModel('@@initialState');

  const onMenuClick = useCallback(
    (event: MenuInfo) => {
      const { key } = event;
      if (key === 'logout') {
        console.log('logout')
        setInitialState((s) => ({ ...s, currentUser: undefined }));
        loginOut();
        return;
      }
      if (key === 'center') {
        history.push('/users/usercenter?key=1');
        return;
      }
      if (key === 'todolist') {
        history.push('/users/todolist?key=1'); // 跳转到待办计划页面
        return;
      }
      history.push(`/account/${key}`);
    },
    [setInitialState],
  );

  const loading = (
    <span className={`${styles.action} ${styles.account}`}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { currentUser } = initialState;

  if (!currentUser || !currentUser.name) {
    return loading;
  }

  // 模拟待办事项数量，这个接口麻烦纯金负责下
  const todoCount = 0; // 可以从API获取实际数量

  const menuHeaderDropdown = (
    <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
      {menu && (
        <Menu.Item key="center">
          <UserOutlined />
          个人中心
        </Menu.Item>
      )}
      {menu && (
        <Menu.Item key="todolist">
          <Badge count={todoCount} size="small" offset={[10, 0]}>
            <ScheduleOutlined />
            <span>待办计划</span>
          </Badge>
        </Menu.Item>
      )}
      {menu && (
        <Menu.Item key="settings">
          <SettingOutlined />
          个人设置
        </Menu.Item>
      )}
      {menu && <Menu.Divider />}
      <Menu.Item key="center">
        <UserOutlined />
        个人中心
      </Menu.Item>
      <Menu.Item key="todolist">
          <Badge count={todoCount} size="small" offset={[10, 0]}>
            <ScheduleOutlined />
            <span>待办计划</span>
          </Badge>
        </Menu.Item>
      <Menu.Item key="logout">
        <LogoutOutlined />
        退出登录
      </Menu.Item>
    </Menu>
  );
  
  return (
    <div>
      {/* <Sockect /> */}
      <HeaderDropdown overlay={menuHeaderDropdown}>
        <span className={`${styles.action} ${styles.account}`}>
          <Avatar size="small" className={styles.avatar} src={currentUser.avatar} alt="avatar" />
          <span className={`${styles.name} anticon`}>
            {currentUser.departmentName}-{currentUser.name}
          </span>
        </span>
      </HeaderDropdown>
    </div>
  );
};

export default AvatarDropdown;