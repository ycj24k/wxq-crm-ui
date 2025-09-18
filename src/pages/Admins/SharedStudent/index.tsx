import React, { useState, useEffect, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { type ActionType, type ProColumns } from '@ant-design/pro-table';
import { Card, Form, Row, Col, Button, Space, message, Modal, Select } from 'antd';
import { PlusOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import apiRequest from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import moment from 'moment';

// const { RangePicker } = DatePicker;

interface SharedStudentData {
  id?: number;
  project: string;
  shareCompanyId: number;
  companyId: number;
  enable?: boolean;
  createBy?: number;
  createTime?: string;
  updateBy?: number;
  updateTime?: string;
  isDel?: number;
}

const SharedStudent: React.FC = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [companyOptions, setCompanyOptions] = useState<any[]>([]);
  const [huideDeptOptions, setHuideDeptOptions] = useState<any[]>([]);
  const actionRef = useRef<ActionType>();

  // 获取公司列表（保留）
  const fetchCompanyOptions = async () => {
    try {
      const response = await apiRequest.get('/sms/share/getCompany');
      if (response.status === 'success' && response.data) {
        // 处理公司数据
        const companies = response.data.map((item: any) => ({
          label: item.name,
          value: item.id,
        }));
        setCompanyOptions(companies);
      }
    } catch (error) {
      // console suppressed
    }
  };

  // 获取“汇德教育”下的下级部门列表作为共享发起/接收方可选项
  const fetchHuideDeptOptions = async () => {
    try {
      const res = await apiRequest.get('/sms/share/getDepartmentAndUser');
      const data = res?.data || [];
      // 查找包含“汇德教育”的部门节点
      const findHuide = (nodes: any[]): any | null => {
        for (const n of nodes) {
          if (n.departmentName && String(n.departmentName).includes('汇德教育')) return n;
          if (n.children && n.children.length) {
            const found = findHuide(n.children);
            if (found) return found;
          }
        }
        return null;
      };
      const huide = findHuide(Array.isArray(data) ? data : []);
      const options: any[] = [];
      if (huide && Array.isArray(huide.children)) {
        // 仅取“汇德教育”节点的直接下级部门
        huide.children.forEach((child: any) => {
          if (child?.departmentName) {
            options.push({ label: child.departmentName, value: child.id });
          }
        });
      }
      setHuideDeptOptions(options);
    } catch (e) {
      setHuideDeptOptions([]);
    }
  };

  useEffect(() => {
    fetchCompanyOptions();
    fetchHuideDeptOptions();
  }, []);

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

      const response = await apiRequest.get('/sms/business/bizCompanyShare', requestParams);
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
    form.resetFields();
    setAddModalVisible(true);
  };

  // 删除
  const handleDelete = (record: SharedStudentData) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除这条共享设置吗？`,
      onOk: async () => {
        try {
          await apiRequest.delete('/sms/business/bizCompanyShare', { id: record.id });
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
      const values = await form.validateFields();
      const data = {
        project: values.project,
        shareCompanyId: values.shareCompanyId,
        companyId: values.companyId,
        enable: true, // 默认启用
        createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      };

      await apiRequest.post('/sms/business/bizCompanyShare', data);
      message.success('添加成功');
      setAddModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };

  // 表格列配置
  const columns: ProColumns<SharedStudentData>[] = [
    {
      title: '项目总称',
      dataIndex: 'project',
      key: 'project',
      width: 120,
      ellipsis: true,
      render: (text, record) => <span>{Dictionaries.getCascaderAllName('dict_reg_job', record.project)}</span>,
    },
    {
      title: '共享发起方',
      dataIndex: 'shareCompanyId',
      key: 'shareCompanyId',
      width: 120,
      ellipsis: true,
      render: (text, record) => {
        // console.log('共享发起方数据:', { record, huideDeptOptions, shareCompanyId: record.shareCompanyId });
        const dept = huideDeptOptions.find((item) => item.value === record.shareCompanyId);
        return <span>{dept?.label || `ID:${record.shareCompanyId}`}</span>;
      },
    },
    {
      title: '共享接收方',
      dataIndex: 'companyId',
      key: 'companyId',
      width: 120,
      ellipsis: true,
      render: (text, record) => {
        // console.log('共享接收方数据:', { record, huideDeptOptions, companyId: record.companyId });
        const dept = huideDeptOptions.find((item) => item.value === record.companyId);
        return <span>{dept?.label || `ID:${record.companyId}`}</span>;
      },
    },
    {
      title: '添加时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (text: any) => (text ? moment(String(text)).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
          删除
        </Button>
      ),
    },
  ];

  return (
    <PageContainer title="共享学员设置" style={{ height: '100vh', overflow: 'hidden' }}>
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
                <Form.Item name="project" label="项目总称">
                  <Select placeholder="请选择项目总称" allowClear>
                    {Dictionaries.getList('dict_reg_job')?.map((item: any) => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="shareCompanyId" label="共享发起方">
                  <Select placeholder="请选择共享发起方" allowClear>
                    {companyOptions.map((option) => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="companyId" label="共享接收方">
                  <Select placeholder="请选择共享接收方" allowClear>
                    {companyOptions.map((option) => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
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
          <ProTable<SharedStudentData>
            actionRef={actionRef}
            columns={columns}
            request={fetchData}
            loading={loading}
            rowKey="id"
            search={false}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
            }}
            scroll={{ x: 600 }}
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

      {/* 添加弹窗 */}
      <Modal
        title="添加共享"
        open={addModalVisible}
        onOk={handleSave}
        onCancel={() => setAddModalVisible(false)}
        width={400}
        destroyOnClose
        okText="确认"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="project" label="项目总称:" rules={[{ required: true, message: '请选择项目总称' }]}>
            <Select
              placeholder="请选择项目总称"
              showSearch
              filterOption={(input, option) => option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              options={
                Dictionaries.getList('dict_reg_job')?.map((item: any) => ({
                  label: item.label,
                  value: item.value,
                })) || []
              }
            />
          </Form.Item>

          <Form.Item
            name="shareCompanyId"
            label="共享发起方:"
            rules={[{ required: true, message: '请选择共享发起方' }]}
          >
            <Select
              placeholder="请选择共享发起方"
              showSearch
              filterOption={(input, option) => option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              options={huideDeptOptions}
            />
          </Form.Item>

          <Form.Item name="companyId" label="共享接收方:" rules={[{ required: true, message: '请选择共享接收方' }]}>
            <Select
              placeholder="请选择共享接收方"
              showSearch
              filterOption={(input, option) => option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              options={huideDeptOptions}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default SharedStudent;
