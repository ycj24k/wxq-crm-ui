import { CommentOutlined, StopOutlined, TeamOutlined } from '@ant-design/icons';
import { Badge, Button, Dropdown, Input, Menu, message, Modal, Popconfirm } from 'antd';
import request from '@/services/ant-design-pro/apiRequest';
import { useState } from 'react';
import './index.less';
import sokect from '../../services/util/websocket';
const menu = <Menu></Menu>;

export default () => {
  const [menus, setMenus] = useState(menu);
  const [visible, setvisible] = useState(false);
  const [isModalVisible, setisModalVisible] = useState(false);
  const [user, setUser] = useState<any>({ name: '', id: '' });
  let contents: any;
  return (
    <div
      id="but"
      style={{ position: 'absolute', top: '700px', right: '20px', display: 'flex', zIndex: '9' }}
    >
      <Badge count={0}>
        {/* <div style={{ width: '200px', height: '500px', backgroundColor: 'white' }}></div> */}
        <Dropdown overlay={menus} placement="topRight" trigger={['click']} visible={visible}>
          <Button
            type="primary"
            icon={<CommentOutlined />}
            // size="small"
            onClick={async (e) => {
              e.stopPropagation();

              if (!visible) {
                const userList = await request.get('/sms/system/sysUser/getConnectInfo');
                userList.data.users.unshift({ name: '全体', id: '-1' });
                const menuList = userList.data.users.map((item: any, index: number) => {
                  return (
                    <Menu.Item
                      key={item.id}
                      onClick={(e) => {
                        // setUser({ name: item.name, id: item.id });
                        // setisModalVisible(true);
                      }}
                    >
                      <div
                        style={{ width: '300px', display: 'flex', justifyContent: 'space-between' }}
                      >
                        <div>
                          <TeamOutlined />
                          {item.name}
                          <Badge status="processing" style={{ marginLeft: '3px' }} />
                        </div>
                        <div>
                          <a
                            style={{ paddingRight: '15px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setUser({ name: item.name, id: item.id });
                              setisModalVisible(true);
                            }}
                          >
                            发送
                          </a>
                          <Popconfirm
                            title="是否踢掉此用户！"
                            onConfirm={() => {
                              e.stopPropagation();
                              if (item.id == '-1') {
                                message.error('请选择有效用户');
                              } else {
                                request
                                  .post('/sms/system/sysUser/kickout', { id: item.id })
                                  .then((res: any) => {
                                    if (res.status == 'success') {
                                      message.success('操作成功');
                                    }
                                  });
                              }
                            }}
                            okText="踢掉"
                            cancelText="取消"
                          >
                            <StopOutlined />
                          </Popconfirm>
                        </div>
                      </div>
                    </Menu.Item>
                  );
                });
                setMenus(<Menu>{menuList}</Menu>);
              }

              setvisible(!visible);
            }}
            // style={{ position: 'absolute', top: '700px', right: '-20px' }}
          ></Button>
        </Dropdown>
      </Badge>
      <Modal
        title={user.name}
        visible={isModalVisible}
        okText="发送"
        onOk={() => {
          sokect.send(user, contents);
          return;
        }}
        onCancel={() => {
          setisModalVisible(false);
        }}
      >
        <Input
          onChange={(e) => {
            contents = e.target.value;
          }}
        ></Input>
      </Modal>
    </div>
  );
};
