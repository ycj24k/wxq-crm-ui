import { ModalForm, ProFormCheckbox, ProFormTextArea, ProFormSelect } from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import { message, Modal, Table, Space } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';

import request from '@/services/ant-design-pro/apiRequest';
import { useRef, useState } from 'react';
type GithubIssueItem = {
  id: number;
  userList: any[];
  permissionList: any[];
};
export default (props: any) => {
  const actionRef = useRef<ActionType>();
  const { modalVisible, setModalVisible, callbackRef, departments, renderData } = props;
  const [selectedRowsList, setselectedRowsList] = useState([]);
  const deleteAll = (data: string) => {
    request
      .delete('/sms/system/sysRolePermission/delFromRoleAndPermission', {
        roleId: renderData.id,
        permissionIds: data,
      })
      .then((res: any) => {
        if (res.status == 'success') {
          message.success('取消授权');
          data.split(',').forEach((item: any) => {
            departments.splice(departments.indexOf(item, 1));
          });

          actionRef.current?.reload();
        }
      });
  };
  const role = (data: any) => {
    if (typeof data != 'object') [data];
    const arr: any = [];
    data.forEach((item: any) => {
      arr.push({ roleId: renderData.id, permissionId: item });
    });
    console.log('arr', arr);
    request
      .postAll('/sms/system/sysRolePermission/saveArray', {
        array: arr,
      })
      .then((res: any) => {
        if (res.status == 'success') {
          message.success('授权成功');
          data.forEach((item: any) => {
            departments.push(item);
          });
          actionRef.current?.reload();
        }
      });
  };
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: 'id',
      dataIndex: 'id',
      search: false,
    },
    {
      title: '权限名称',
      dataIndex: 'name',
    },
    {
      title: '权限代码',
      dataIndex: 'code',
    },
    {
      title: '操作',
      search: false,
      render: (text, record) => (
        <>
          {departments.some((item: any) => {
            return item == record.id;
          }) ? (
            <a
              key={record.id}
              onClick={() => {
                deleteAll(record.id + '');
              }}
              style={{ color: 'red' }}
            >
              取消授权
            </a>
          ) : (
            <a
              key={record.id}
              onClick={() => {
                role([record.id]);
              }}
            >
              授权
            </a>
          )}
        </>
      ),
    },
  ];
  return (
    <Modal
      title="角色授权"
      width={1000}
      onCancel={() => {
        setModalVisible(false);
        callbackRef();
      }}
      onOk={() => {
        setModalVisible(false);
        callbackRef();
      }}
      destroyOnClose={true}
      visible={modalVisible}
    >
      <ProTable
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
          const dataList: any = await request.get('/sms/system/sysPermission', params);
          return {
            data: dataList.data.content,
            success: dataList.success,
            total: dataList.data.totalElements,
          };
        }}
        rowSelection={{
          // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
          // 注释该行则默认不显示下拉选项
          selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
          // defaultSelectedRowKeys: [1],
          onChange: (e, selectedRows) => {
            setselectedRowsList(e as []);
          },
        }}
        tableAlertOptionRender={() => {
          return (
            <Space size={16}>
              <a
                style={{ color: 'red' }}
                onClick={() => {
                  deleteAll(selectedRowsList.join(','));
                }}
              >
                批量取消
              </a>
              <a
                onClick={() => {
                  role(selectedRowsList);
                }}
              >
                批量授权
              </a>
            </Space>
          );
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
        headerTitle="权限管理"
        toolBarRender={() => []}
      />
    </Modal>
  );
};
