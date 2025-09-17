import { useRef, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Table, Space, Popconfirm, message, Card, Form, Row, Col, Input, Select } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import request from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import Modals from './Modals';
import filter from '@/services/util/filter';

export default (props: any) => {
  const [renderData, setRenderData] = useState<any>(null);
  const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
  const [deletId, setDeletId] = useState('');
  const [searchForm] = Form.useForm();
  const actionRef = useRef<ActionType>();
  const url = '/sms/business/bizEffectiveConfig';
  type GithubIssueItem = {
    url: string;
    uri: string;
    id: number;
    project: string;
    type: string;
    cluesValidityPeriod: string;
    allocationValidityPeriod: string;
  };
  const callbackRef = () => {
    // @ts-ignore
    actionRef.current.reload();
  };

  // 搜索
  const handleSearch = () => {
    actionRef.current?.reload();
  };

  // 重置
  const handleReset = () => {
    searchForm.resetFields();
    actionRef.current?.reload();
  };
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: '项目名称',
      dataIndex: 'project',
      key: 'project',
      width: 120,
      ellipsis: true,
      render: (text, record) => (
        <span key="project">{Dictionaries.getCascaderAllName('dict_reg_job', record.project)}</span>
      ),
    },
    {
      title: '资源有效保护期',
      dataIndex: 'clueValidityPeriod',
      key: 'clueValidityPeriod',
      width: 140,
      render: (text, record) => <span>{record.clueValidityPeriod || record.cluesValidityPeriod}天</span>,
    },
    {
      title: '首单保护期',
      dataIndex: 'firstOrderProtectionPeriod',
      key: 'firstOrderProtectionPeriod',
      width: 120,
      render: (text, record) => <span>{record.firstOrderProtectionPeriod}天</span>,
    },
    {
      title: '流入分公司公海流转保护期',
      dataIndex: 'unclaimedTransferTime',
      key: 'unclaimedTransferTime',
      width: 200,
      render: (text, record) => <span>{record.unclaimedTransferTime}天</span>,
    },
    {
      title: '流入平台公海流转保护期',
      dataIndex: 'unclaimedDegradationTime',
      key: 'unclaimedDegradationTime',
      width: 200,
      render: (text, record) => <span>{record.unclaimedDegradationTime}天</span>,
    },
    {
      title: '公海未领取降级时间',
      dataIndex: 'unclaimedDegradationTime2',
      key: 'unclaimedDegradationTime2',
      width: 160,
      render: (text, record) => <span>{record.unclaimedDegradationTime}天</span>,
    },
    {
      title: '成交正式学员保护期',
      dataIndex: 'customerProtectionPeriod',
      key: 'customerProtectionPeriod',
      width: 160,
      render: (text, record) => <span>{record.customerProtectionPeriod}天</span>,
    },
    {
      title: '主动共享分配比例',
      dataIndex: 'activePercent',
      key: 'activePercent',
      width: 160,
      render: (text, record) => <span>{record.activePercent}%</span>,
    },
    {
      title: '被动共享分配比例',
      dataIndex: 'passivePercent',
      key: 'passivePercent',
      width: 160,
      render: (text, record) => <span>{record.passivePercent}%</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (text, record) => {
        // 状态由后台自动判断：有效期内就是开启，有效期外就是关闭
        const isActive = record.status !== false;
        return <span style={{ color: isActive ? '#52c41a' : '#ff4d4f' }}>{isActive ? '开启' : '关闭'}</span>;
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 160,
      fixed: 'right',
      render: (text, record, _, action) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
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
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  return (
    <PageContainer title="项目有效期配置" style={{ height: '100vh', overflow: 'hidden' }}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 搜索模块 */}
        <Card
          style={{
            marginBottom: 16,
            flexShrink: 0,
            border: '1px solid #f0f0f0',
            borderRadius: '6px',
          }}
        >
          <Form form={searchForm} layout="inline" style={{ marginBottom: 0 }}>
            <Row gutter={16} style={{ width: '100%' }}>
              <Col span={6}>
                <Form.Item name="project" label="项目名称">
                  <Input placeholder="请输入项目名称" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="status" label="状态">
                  <Select placeholder="请选择状态" allowClear>
                    <Select.Option value={true}>开启</Select.Option>
                    <Select.Option value={false}>关闭</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item>
                  <Space>
                    <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                      搜索
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={handleReset}>
                      重置
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* 数据表格 */}
        <Card
          style={{
            flex: 1,
            overflow: 'hidden',
            border: '1px solid #f0f0f0',
            borderRadius: '6px',
          }}
        >
          <ProTable<GithubIssueItem>
            columns={columns}
            actionRef={actionRef}
            request={async (
              params: { name?: string; mobile?: string; current?: any; project?: string } = {},
              sort,
              filter
            ) => {
              const searchValues = searchForm.getFieldsValue();
              const requestParams = {
                ...params,
                ...searchValues,
                _page: params.current ? params.current - 1 : 0, // 从0开始
                _size: params.pageSize || 10,
              };

              // 移除空值参数
              Object.keys(requestParams).forEach((key) => {
                if (requestParams[key] === undefined || requestParams[key] === '') {
                  delete requestParams[key];
                }
              });

              const dataList: any = await request.get(url, requestParams);
              return {
                data: dataList.data.content,
                success: dataList.success,
                total: dataList.data.totalElements,
              };
            }}
            rowKey="id"
            search={false}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
            }}
            scroll={{ x: 1400 }}
            toolBarRender={() => [
              <Button
                key="add"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setRenderData({ type: 'order', orderNumber: 0 });
                  setModalVisible(true);
                }}
                style={{
                  borderRadius: '6px',
                  fontWeight: 500,
                }}
              >
                添加
              </Button>,
            ]}
            options={{
              reload: true,
              density: true,
              fullScreen: true,
              setting: true,
            }}
          />
        </Card>
      </div>

      {modalVisibleFalg && (
        <Modals
          setModalVisible={() => setModalVisible(false)}
          modalVisible={modalVisibleFalg}
          callbackRef={() => callbackRef()}
          renderData={renderData}
          url={url}
        />
      )}
    </PageContainer>
  );
};
