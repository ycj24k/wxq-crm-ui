import { useRef, useState } from 'react';
import { EditOutlined, PlusOutlined, DeleteOutlined, RedoOutlined } from '@ant-design/icons';
import { Button, message, Tag, Modal, Popconfirm, Switch } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import Modals from './Modal';
import request from '@/services/ant-design-pro/apiRequest';
import moment from 'moment';
type GithubIssueItem = {
  url: string;
  uri: string;
  id: number;
  enable: boolean;
  isError: boolean;
  isPass: boolean;
  method: string;
};

export default () => {
  const actionRef = useRef<ActionType>();
  const [switchLoding, setSwitchLoding] = useState<boolean>(false);

  const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
  const [renderData, setRenderData] = useState<object>({});
  const callbackRef = () => {
    // @ts-ignore
    actionRef.current.reload();
  };
  const columns: ProColumns<GithubIssueItem>[] = [
    // {
    //   title: 'id',
    //   dataIndex: 'id',
    // },
    {
      title: '权限代码',
      dataIndex: 'permissionCodes',
      // copyable: true,
      ellipsis: true,
    },
    {
      title: '方法',
      dataIndex: 'method',
    },
    {
      title: '许可路径',
      dataIndex: 'uri',
      ellipsis: true,
      tip: '地址过长会自动收缩',
      // search: false,
    },
    {
      title: '排除路径',
      dataIndex: 'excludeUris',
      ellipsis: true,
      tip: '地址过长会自动收缩',
      search: false,
    },
    {
      title: '描述',
      dataIndex: 'description',
      tip: '描述过长会自动收缩',
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'enable',
      search: false,
      render: (text, record) => (
        <Switch
          key={record.id}
          checkedChildren="启用"
          unCheckedChildren="禁用"
          defaultChecked={record.enable}
          loading={switchLoding}
          onChange={async () => {
            setSwitchLoding(true);
            const status: any = await request.post('/sms/system/syInterceptionRule', {
              id: record.id,
              enable: !record.enable,
            });
            if (status.status != 'success') {
              message.error(status.msg);
            }
            setSwitchLoding(false);
            callbackRef();
          }}
        />
      ),
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
              request
                .delete('/sms/system/syInterceptionRule', { id: record.id })
                .then((res: any) => {
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
    <PageContainer>
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
          const dataList: any = await request.get('/sms/system/syInterceptionRule', params);
          return {
            data: dataList.data.content,
            success: dataList.success,
            total: dataList.data.totalElements,
          };
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
          collapsed: false,
        }}
        pagination={{
          pageSize: 10,
        }}
        dateFormatter="string"
        headerTitle="赋权规则"
        toolBarRender={() => [
          <Button
            type="primary"
            icon={<RedoOutlined />}
            onClick={() => {
              request.post('/sms/system/syInterceptionRule/reload').then((res: any) => {
                if (res.status == 'success') {
                  message.success('操作成功');
                }
              });
            }}
          >
            重载赋权规则
          </Button>,
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setRenderData({ type: 'add' });
              setModalVisible(true);
            }}
          >
            新增赋权规则
          </Button>,
        ]}
      />
      <Modals
        modalVisible={modalVisibleFalg}
        setModalVisible={() => setModalVisible(false)}
        callbackRef={() => callbackRef()}
        renderData={renderData}
      />
    </PageContainer>
  );
};
