import { useRef, useState, useEffect } from 'react';
import { EditOutlined, PlusOutlined, DeleteOutlined, RedoOutlined } from '@ant-design/icons';
import { Button, message, Tree, Input, Popconfirm } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import Modals from './Modal';
import request from '@/services/ant-design-pro/apiRequest';
import UserManageCard from '../Department/UserManageCard';
//import MenuManageCard from '../MenusManger/UserManageCard';
import MenuManageCard from '../MenusManger/MenuTree';
import ModalRole from './ModalRole';
type GithubIssueItem = {
  url: string;
  uri: string;
  id: number;
  ip: string;
  isError: boolean;
  isPass: boolean;
  method: string;
  userList: any[];
  permissionList: any[];
  menuList:any[];
};
let content: any = null;
let menuContentlist: any = null;
let roleContent: any = null;
let roleContent2: any = null;
export default () => {
  const actionRef = useRef<ActionType>();
  const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
  const [modalsVisible, setModalsVisible] = useState<boolean>(false);
  const [renderData, setRenderData] = useState<object>({});
  const [CardVisible, setCardVisible] = useState<boolean>(false);
  //菜单权限
  const [MenuVisible, setMenuVisible] = useState<boolean>(false);
  //菜单列表
  const [MenuContent, setMenuContent] = useState<any>();
  //菜单数据
  const [menuRenderData, setMenuRenderData] = useState<any>();

  const [parentIdTree, setParentIdTree] = useState<string | number>('-1');
  let [department, setDepartment] = useState<any>();
  const [CardContent, setCardContent] = useState<any>();
  const [roleCardContent, setRoleCardContent] = useState<any>();
  const [TabListNuber, setTabListNuber] = useState<any>('1');
  let departmentsList: { name: any; id: any }[] = [];
  let url = TabListNuber == '1' ? '/sms/system/sysRole' : '/sms/system/sysPermission';
  const callbackRef = () => {
    roleContent = null;
    roleContent2 = null;
    actionRef?.current?.reload();
  };
  const columns: ProColumns<GithubIssueItem>[] = [
    // {
    //   title: 'id',
    //   dataIndex: 'id',
    //   search: false,
    // },
    {
      title: '权限名称',
      dataIndex: 'name',
    },
    {
      title: '角色代码',
      dataIndex: 'code',
    },
    {
      title: '授权人员',
      dataIndex: 'userName',
      colSpan: 2,
      hideInTable: TabListNuber == '1' ? false : true,
      ellipsis: true,
      // width: 150,
      search: false,
      tip: '过长会自动收缩',
      // copyable: true,
      // ellipsis: true,
    },
    {
      width: 80,
      hideInTable: TabListNuber == '1' ? false : true,
      search: false,
      colSpan: 0,
      render: (text, record, _, action) => (
        <Button
          size="small"
          type="primary"
          icon={<PlusOutlined />}
          onClick={async () => {
            if (!content) {
              content = await request.get('/sms/share/getDepartmentAndUser');
            }

            setCardContent({ content: content.data, type: 'role' });
            setDepartment(record.userList);
            setParentIdTree(record.id);
            setCardVisible(true);
          }}
        >
          授权
        </Button>
      ),
    },

    {
      title: '授权权限',
      dataIndex: 'permission',
      colSpan: 2,
      search: false,
      hideInTable: TabListNuber == '1' ? false : true,
      ellipsis: true,
      tip: '过长会自动收缩',
    },
    {
      width: 80,
      colSpan: 0,
      hideInTable: TabListNuber == '1' ? false : true,
      search: false,
      render: (text, record, _, action) => (
        <Button
          size="small"
          type="primary"
          icon={<PlusOutlined />}
          onClick={async () => {
            const arr: any = [];
            record.permissionList.forEach((item: any) => {
              arr.push(item.id);
            });
            setRenderData(record);
            setDepartment(arr);
            setModalsVisible(true);
          }}
        >
          授权
        </Button>
      ),
    },

    // {
    //   title: '授权菜单',
    //   dataIndex: 'menu',
    //   colSpan: 2,
    //   search: false,
    //   hideInTable: TabListNuber == '1' ? false : true,
    //   ellipsis: true,
    //   tip: '过长会自动收缩',
    // },
    // {
    //   width: 120,
    //   colSpan: 0,
    //   hideInTable: TabListNuber == '1' ? false : true,
    //   search: false,
    //   render: (text, record, _, action) => (
    //     <Button
    //       size="small"
    //       type="primary"
    //       icon={<PlusOutlined />}
    //       onClick={async () => {
    //         if (!menuContentlist) {
    //           menuContentlist = await request.get('/sms/system/sysMenu/tree');
    //         }
    //         const arr: any = [];
    //         record.menuList.forEach((item: any) => {
    //           arr.push(item.name);
    //         });
    //         //setDepartment(arr);
    //         setMenuRenderData(record)
    //         setMenuContent({ menuContentlist: menuContentlist.data });
    //         setMenuVisible(true)
    //       }}
    //     >
    //       授权菜单
    //     </Button>
    //   ),
    // },


    {
      title: '备注',
      dataIndex: 'description',
      search: false,
      ellipsis: true,
      tip: '备注过长会自动收缩',
    },



    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      render: (text, record, _, action) => (
        <>
          <Button
            key="view"
            type="primary"
            size="small"
            icon={<EditOutlined />}
            style={{ marginRight: '10px', marginBottom: '8px' }}
            onClick={() => {
              setModalVisible(true);
              setRenderData({ type: 'eidt', ...record });
            }}
          >
            编辑
          </Button>
          <Popconfirm
            key={record.id}
            title="是否确定删除？"
            onConfirm={() => {
              request.delete(url, { id: record.id }).then((res: any) => {
                if (res.status == 'success') {
                  message.success('删除成功');
                  callbackRef();
                }
              });
            }}
            okText="删除"
            cancelText="取消"
          >
            <Button type="primary" key="delete" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <PageContainer
      onTabChange={(e) => {
        setTabListNuber(e);
        actionRef?.current?.reload();
      }}
      tabList={[
        {
          tab: '角色管理',
          key: '1',
        },
        {
          tab: '角色权限',
          key: '2',
        },
      ]}
    >
      {TabListNuber == '1' ? (
        <ProTable<GithubIssueItem>
          columns={columns}
          actionRef={actionRef}
          cardBordered
          scroll={{ x: 1500 }}
          request={async (
            params: {
              current?: any;
              page?: number;
            } = {
              
            },
            sort,
            filter,
          ) => {
            departmentsList = [];

            if (!roleContent) roleContent = await request.get(url, params);

            roleContent.data.content.forEach((item: any) => {
              const userNameRole: any[] = [];
              const permission: any[] = [];
              const menu: any[] = [];
              departmentsList.push({ name: item.userName, id: item.userId });
              if (item.userList) {
                item.userList.forEach((items: any) => {
                  userNameRole.push(items.name);
                });
                if (item.permissionList) {
                  item.permissionList.forEach((items: any) => {
                    permission.push(items.name);
                  });
                }
                if(item.menuList) {
                  item.menuList.forEach((items: any) => {
                    menu.push(items.name);
                  });
                }
                item.userName = userNameRole.join(',');
                item.permission = permission.join(',');
                item.menu = menu.join(',');
              }
            });
            setDepartment(departmentsList);
            return {
              data: roleContent.data.content,
              success: roleContent.success,
              total: roleContent.data.totalElements,
            };
          }}
          rowKey="id"
          search={{
            labelWidth: 'auto',
            collapsed: false,
          }}
          // pagination={{
          //   pageSize: 10,
          // }}
          onSubmit={() => {
            roleContent = null;
          }}
          onReset={() => {
            roleContent = null;
          }}
          options={{
            reload: () => {
              roleContent = null;
              callbackRef();
            },
          }}
          dateFormatter="string"
          headerTitle="授权人员"
          toolBarRender={() => [
            <Button
              type="primary"
              icon={<RedoOutlined />}
              onClick={() => {
                request
                  .post(
                    TabListNuber == 1
                      ? '/sms/system/sysRole/reload'
                      : '/sms/system/sysPermission/reload',
                  )
                  .then((res: any) => {
                    if (res.status == 'success') {
                      message.success('重载成功');
                    } else {
                      message.error(res.msg);
                    }
                  });
              }}
            >
              重载角色
            </Button>,
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setRenderData({ type: 'add' });
                setModalVisible(true);
              }}
            >
              新增角色
            </Button>,
          ]}
        />
      ) : (
        <ProTable<GithubIssueItem>
          columns={columns}
          actionRef={actionRef}
          cardBordered
          request={async (
            params: {
              current?: any;
              page?: number;
            } = {},
            sort,
            filter,
          ) => {
            roleContent2 = await request.get(url, params);
            return {
              data: roleContent2.data.content,
              success: roleContent2.success,
              total: roleContent2.data.totalElements,
            };
          }}
          onSubmit={() => {
            roleContent2 = null;
          }}
          onReset={() => {
            roleContent2 = null;
          }}
          options={{
            reload: () => {
              roleContent = null;
              //手动刷新列表
              callbackRef();
            },
          }}
          rowKey="id"
          search={{
            labelWidth: 'auto',
            collapsed: false,
          }}
          // pagination={{
          //   pageSize: 10,
          // }}
          dateFormatter="string"
          headerTitle="权限管理"
          toolBarRender={() => [
            <Button
              type="primary"
              icon={<RedoOutlined />}
              onClick={() => {
                request.post('/sms/system/sysPermission/reload').then((res: any) => {
                  if (res.status == 'success') {
                    message.success('重载成功');
                  } else {
                    message.error(res.msg);
                  }
                });
              }}
            >
              重载权限
            </Button>,
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setRenderData({ type: 'add' });
                setModalVisible(true);
              }}
            >
              新增权限
            </Button>,
          ]}
        />
      )}
      {modalVisibleFalg && (
        <Modals
          modalVisible={modalVisibleFalg}
          setModalVisible={() => setModalVisible(false)}
          callbackRef={() => callbackRef()}
          renderData={renderData}
          url={url}
        />
      )}

      {/* 人员信息 */}
      {modalsVisible && (
        <ModalRole
          modalVisible={modalsVisible}
          setModalVisible={() => setModalsVisible(false)}
          callbackRef={() => callbackRef()}
          departments={department}
          renderData={renderData}
          roleCardContent={roleCardContent}
          url={url}
        />
      )}

      {CardVisible && (
        <UserManageCard
          CardVisible={CardVisible}
          CardContent={CardContent}
          callbackRef={() => callbackRef()}
          setCardVisible={() => setCardVisible(false)}
          // setDepartment={(e: any) => setDepartment(e)}
          parentIdTree={parentIdTree}
          departments={department}
        />
      )}

      {MenuVisible && (
        <MenuManageCard
          MenuVisible={MenuVisible}
          MenuContent={menuContentlist}
          menuRenderData={menuRenderData}
          callbackRef={() => callbackRef()}
          setMenuVisible={() => setMenuVisible(false)}
        />
      )}

    </PageContainer>
  );
};
