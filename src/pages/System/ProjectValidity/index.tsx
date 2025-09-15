import React, { useState, useEffect, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { type ActionType, type ProColumns } from '@ant-design/pro-table';
import { Card, Form, Row, Col, Input, Button, Space, message, Modal, InputNumber, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import apiRequest from '@/services/ant-design-pro/apiRequest';

interface ProjectValidityConfig {
  id?: number;
  project: string;
  clueValidityPeriod: number;
  firstOrderProtectionPeriod: number;
  unclaimedTransferTime: number;
  unclaimedDegradationTime: number;
  customerProtectionPeriod: number;
  activePercent: number;
  passivePercent: number;
  status: boolean;
}

const ProjectValidity: React.FC = () => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ProjectValidityConfig | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const actionRef = useRef<ActionType>();

  // 获取列表数据
  const fetchData = async (params: any = {}) => {
    setLoading(true);
    try {
      const searchValues = searchForm.getFieldsValue();
      const requestParams = {
        _page: params.current ? params.current - 1 : 0, // 从0开始
        _size: params.pageSize || 10,
        ...searchValues,
        ...params,
      };

      // 移除空值参数
      Object.keys(requestParams).forEach((key) => {
        if (requestParams[key] === undefined || requestParams[key] === '') {
          delete requestParams[key];
        }
      });

      const response = await apiRequest.get('/sms/business/bizEffectiveConfig', requestParams);
      return {
        data: response.data?.content || [],
        success: true,
        total: response.data?.totalElements || 0,
      };
    } catch (error) {
      console.error('获取数据失败:', error);
      message.error('获取数据失败');
      return {
        data: [],
        success: false,
        total: 0,
      };
    } finally {
      setLoading(false);
    }
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

  // 添加
  const handleAdd = () => {
    setEditingRecord(null);
    setIsEdit(false);
    editForm.resetFields();
    setEditModalVisible(true);
  };

  // 编辑
  const handleEdit = (record: ProjectValidityConfig) => {
    setEditingRecord(record);
    setIsEdit(true);
    editForm.setFieldsValue({
      ...record,
      status: record.status !== false, // 确保布尔值
    });
    setEditModalVisible(true);
  };

  // 删除
  const handleDelete = (record: ProjectValidityConfig) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除项目"${record.project}"的配置吗？`,
      onOk: async () => {
        try {
          await apiRequest.delete('/sms/business/bizEffectiveConfig', { id: record.id });
          message.success('删除成功');
          actionRef.current?.reload();
        } catch (error) {
          console.error('删除失败:', error);
          message.error('删除失败');
        }
      },
    });
  };

  // 保存
  const handleSave = async () => {
    try {
      const values = await editForm.validateFields();
      const data = {
        ...values,
        id: editingRecord?.id,
      };

      if (isEdit) {
        await apiRequest.put('/sms/business/bizEffectiveConfig', data);
        message.success('更新成功');
      } else {
        await apiRequest.post('/sms/business/bizEffectiveConfig', data);
        message.success('添加成功');
      }

      setEditModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };

  // 表格列配置
  const columns: ProColumns<ProjectValidityConfig>[] = [
    {
      title: '项目名称',
      dataIndex: 'project',
      key: 'project',
      width: 120,
      ellipsis: true,
    },
    {
      title: '资源有效保护期',
      dataIndex: 'clueValidityPeriod',
      key: 'clueValidityPeriod',
      width: 140,
      render: (text) => `${text}天`,
    },
    {
      title: '首单保护期',
      dataIndex: 'firstOrderProtectionPeriod',
      key: 'firstOrderProtectionPeriod',
      width: 120,
      render: (text) => `${text}天`,
    },
    {
      title: '流入分公司公海流转保护期',
      dataIndex: 'unclaimedTransferTime',
      key: 'unclaimedTransferTime',
      width: 200,
      render: (text) => `${text}天`,
    },
    {
      title: '流入平台公海流转保护期',
      dataIndex: 'unclaimedDegradationTime',
      key: 'unclaimedDegradationTime',
      width: 200,
      render: (text) => `${text}天`,
    },
    {
      title: '公海未领取降级时间',
      dataIndex: 'unclaimedDegradationTime',
      key: 'unclaimedDegradationTime2',
      width: 160,
      render: (text) => `${text}天`,
    },
    {
      title: '成交正式学员保护期',
      dataIndex: 'customerProtectionPeriod',
      key: 'customerProtectionPeriod',
      width: 160,
      render: (text) => `${text}天`,
    },
    {
      title: '主动共享分配比例',
      dataIndex: 'activePercent',
      key: 'activePercent',
      width: 160,
      render: (text) => `${text}%`,
    },
    {
      title: '被动共享分配比例',
      dataIndex: 'passivePercent',
      key: 'passivePercent',
      width: 160,
      render: (text) => `${text}%`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (text) => <span style={{ color: text ? '#52c41a' : '#ff4d4f' }}>{text ? '开启' : '关闭'}</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
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
                  <Input placeholder="请输入状态" />
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
          <ProTable<ProjectValidityConfig>
            actionRef={actionRef}
            columns={columns}
            request={fetchData}
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
                onClick={handleAdd}
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

      {/* 编辑弹窗 */}
      <Modal
        title={isEdit ? '编辑项目有效期配置' : '添加项目有效期配置'}
        open={editModalVisible}
        onOk={handleSave}
        onCancel={() => setEditModalVisible(false)}
        width={800}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" preserve={false}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="project" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
                <Input placeholder="请输入项目名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" valuePropName="checked">
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="clueValidityPeriod"
                label="资源有效保护期(天)"
                rules={[{ required: true, message: '请输入资源有效保护期' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入天数" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="firstOrderProtectionPeriod"
                label="首单保护期(天)"
                rules={[{ required: true, message: '请输入首单保护期' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入天数" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="unclaimedTransferTime"
                label="流入分公司公海流转保护期(天)"
                rules={[{ required: true, message: '请输入流入分公司公海流转保护期' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入天数" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unclaimedDegradationTime"
                label="流入平台公海流转保护期(天)"
                rules={[{ required: true, message: '请输入流入平台公海流转保护期' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入天数" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customerProtectionPeriod"
                label="成交正式学员保护期(天)"
                rules={[{ required: true, message: '请输入成交正式学员保护期' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入天数" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="activePercent"
                label="主动共享分配比例(%)"
                rules={[{ required: true, message: '请输入主动共享分配比例' }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="请输入百分比" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="passivePercent"
                label="被动共享分配比例(%)"
                rules={[{ required: true, message: '请输入被动共享分配比例' }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="请输入百分比" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default ProjectValidity;
