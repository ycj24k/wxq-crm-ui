import React, { useRef, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Table, Space, Menu, Dropdown, Popconfirm, message } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable, { TableDropdown } from '@ant-design/pro-table';
import request from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import Modals from './Modals';
type GithubIssueItem = {
  content: string;
  id: number;
  type: string;
};

export default (props: any) => {
  const [renderData, setRenderData] = useState<any>(null);
  const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
  const [deletId, setDeletId] = useState('');
  const actionRef = useRef<ActionType>();
  const url = '/sms/business/bizField';
  const callbackRef = () => {
    // @ts-ignore
    actionRef.current.reload();
  };
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: '字段名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '字段类型',
      dataIndex: 'type',
      key: 'type',
      render: (text, record) => <span>{Dictionaries.getName('SignUpData', record.type)}</span>,
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '限制',
      dataIndex: 'format',
      key: 'format',
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text, record, _, action) => (
        <>
          <Button
            key="editable"
            type="primary"
            size="small"
            icon={<EditOutlined />}
            style={{ marginRight: '10px', marginBottom: '8px' }}
            onClick={() => {
              setRenderData({ ...record, types: 'edit' });
              setModalVisible(true);
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
            <Button key="delete" size="small" type="primary" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];
  return (
    <>
      <ProTable<GithubIssueItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (
          params: { name?: string; mobile?: string; current?: any; project?: string } = {},
          sort,
          filter,
        ) => {
          const dataList: any = await request.get(url, params);
          return {
            data: dataList.data.content,
            success: dataList.success,
            total: dataList.data.totalElements,
          };
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSize: 10,
        }}
        rowSelection={{
          // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
          // 注释该行则默认不显示下拉选项
          selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
          onChange: (e, selectedRows) => {
            setDeletId(e.join(','));
          },
        }}
        tableAlertOptionRender={() => {
          return (
            <Space size={16}>
              <Popconfirm
                title="是否批量删除？"
                okText="删除"
                onConfirm={() => {
                  request
                    .delete('/sms/business/bizChargeStandard/deleteArray', { ids: deletId })
                    .then((res: any) => {
                      if (res.status == 'success') {
                        message.success('删除成功');
                        callbackRef();
                      }
                    });
                }}
              >
                <a>批量删除</a>
              </Popconfirm>
            </Space>
          );
        }}
        dateFormatter="string"
        headerTitle="报名资料字段"
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              setRenderData({ type: 'order', orderNumber: 0 });
              setModalVisible(true);
            }}
          >
            新建字段
          </Button>,
          // <Button
          //   key="button"
          //   icon={<PlusOutlined />}
          //   type="primary"
          //   onClick={() => {
          //     setRenderData({ type: 'order', orderNumber: 0 });
          //     setModalVisible(true);
          //   }}
          // >
          //   添加学员团组/回访记录
          // </Button>,
        ]}
      />
      {/* {renderData && (
        <StudentInfo
          setModalVisible={() => setInfoVisible(false)}
          modalVisible={InfoVisibleFalg}
          renderData={renderData}
          admin={admin}
          callbackRef={() => callbackRef()}
        />
      )} */}

      {modalVisibleFalg && (
        <Modals
          setModalVisible={() => setModalVisible(false)}
          modalVisible={modalVisibleFalg}
          callbackRef={() => callbackRef()}
          renderData={renderData}
          // admin={admin}
          url={url}
        />
      )}
    </>
  );
};
