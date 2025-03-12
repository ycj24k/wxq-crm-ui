import { useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Button, message, Tag, Modal, Descriptions } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';

import request from '@/services/ant-design-pro/apiRequest';
import moment from 'moment';
type GithubIssueItem = {
  url: string;
  uri: string;
  id: number;
  ip: string;
  createTime: string;
  isError: boolean;
  isPass: boolean;
  method: string;
};

export default () => {
  const actionRef = useRef<ActionType>();
  const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
  const [modalList, setModaList] = useState<any>();

  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: 'ip',
      dataIndex: 'ip',
      copyable: true,
      ellipsis: true,
    },
    {
      title: '操作人',
      dataIndex: 'userName',
      ellipsis: true,
    },
    {
      title: '请求方式',
      dataIndex: 'method',
      search: false,
      render: (text, record) => (
        <Tag
          color={
            record.method == 'GET' ? '#87d068' : record.method == 'DELETE' ? '#f50' : '#87d068'
          }
        >
          {record.method}
        </Tag>
      ),
    },

    {
      title: '请求状态',
      dataIndex: 'isError',
      valueType: 'select',
      valueEnum: {
        true: {
          text: 'Error',
        },
        false: { text: 'Success' },
      },
      render: (text, record) => (
        <div>
          {!record.isError ? <Tag color="success">success</Tag> : <Tag color="error">error</Tag>}
        </div>
      ),
    },
    {
      title: '拦截状态',
      dataIndex: 'isPass',
      valueType: 'select',
      valueEnum: {
        true: {
          text: 'Pass',
        },
        false: { text: 'Intercepted' },
      },
      render: (text, record) => (
        <div>
          {record.isPass ? <Tag color="success">Pass</Tag> : <Tag color="error">Intercepted</Tag>}
        </div>
      ),
    },
    {
      title: '错误信息',
      dataIndex: 'exception',
      search: false,
      ellipsis: true,
      tip: '错误信息过长会自动收缩',
    },
    {
      title: '请求地址',
      dataIndex: 'uri',
      ellipsis: true,
      tip: '地址过长会自动收缩',
      // search: false,
    },
    {
      title: '请求时间',
      key: 'createTime',
      dataIndex: 'createTime',
      valueType: 'dateRange',
      sorter: true,
      render: (text, record) => (
        <span>
          {record.createTime}
        </span>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      render: (text, record, _, action) => [
        <Button
          key="view"
          type="primary"
          size="small"
          icon={<SearchOutlined />}
          onClick={() => {
            setModalVisible(true);
            setModaList(record);
          }}
        >
          查看
        </Button>,
      ],
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
            isError?: string | boolean;
            isPass?: string | boolean;
            page?: number;
          } = {},
          sort,
          filter,
        ) => {
          const param = { _orderBy: 'createTime', _direction: 'desc' }
          const dataList: any = await request.get('/sms/system/sysLog', { ...param, ...params });
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
        // form={{
        //   // 由于配置了 transform，提交的参与与定义的不同这里需要转化一下
        //   syncToUrl: (values, type) => {
        //     if (type === 'get') {
        //       return {
        //         ...values,
        //         created_at: [values.startTime, values.endTime],
        //       };
        //     }
        //     return values;
        //   },
        // }}
        pagination={{
          pageSize: 10,
        }}
        dateFormatter="string"
        headerTitle="系统日志"
      />
      <Modal
        visible={modalVisibleFalg}
        centered
        width={800}
        onOk={() => {
          setModalVisible(false);
        }}
        onCancel={() => {
          setModalVisible(false);
        }}
      >
        {modalList ? (
          <Descriptions title="详情" column={4}>
            <Descriptions.Item label="IP">{modalList.ip}</Descriptions.Item>
            <Descriptions.Item label="method">
              <Tag
                color={
                  modalList.method == 'GET'
                    ? '#87d068'
                    : modalList.method == 'DELETE'
                      ? '#f50'
                      : '#87d068'
                }
              >
                {modalList.method}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="请求状态">
              {!modalList.isError ? (
                <Tag color="success">success</Tag>
              ) : (
                <Tag color="error">error</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="拦截状态">
              {modalList.isPass ? (
                <Tag color="success">Pass</Tag>
              ) : (
                <Tag color="error">Intercepted</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="请求参数" span={2}>
              {modalList.params}
            </Descriptions.Item>
            <Descriptions.Item label="请求时间" span={2}>
              {modalList.createTime}
            </Descriptions.Item>
            <Descriptions.Item label="错误信息" span={2}>
              {modalList.exception}
            </Descriptions.Item>
            <Descriptions.Item label="请求地址" span={2}>
              {modalList.url}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          ''
        )}
      </Modal>
    </PageContainer>
  );
};
