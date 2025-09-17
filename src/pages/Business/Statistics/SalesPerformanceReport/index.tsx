import React, { useState, useEffect, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { type ActionType, type ProColumns } from '@ant-design/pro-table';
import { Card, Form, Row, Col, DatePicker, Select, Button, Space, message, Tabs, Tree, Input, Radio, Typography } from 'antd';
import { SearchOutlined, ReloadOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import apiRequest from '@/services/ant-design-pro/apiRequest';
import moment from 'moment';
import Dictionaries from '@/services/util/dictionaries';
import DownTable from '@/services/util/timeFn';
import DownHeader from '../Operations/DownHeader';
import DownHeaders from '../../../Admins/AdminCharge/DownHeader';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface SalesReportData {
  amount: number;
  dealAmount: number;
  dealNum: number;
  endTime: string;
  followNum: number;
  groupName: string;
  newNum: number;
  percentAmount: number;
  receiveNum: number;
  startTime: string;
  userId: number;
  userName: string;
}

const SalesPerformanceReport: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<SalesReportData[]>([]);
  const [activeTab, setActiveTab] = useState('1'); // 1:资源量统计 2:成交量统计
  const [viewResigned, setViewResigned] = useState(true); // 是否查看离职人员
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [treeData, setTreeData] = useState<any[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [treeInitialized, setTreeInitialized] = useState(false);
  const actionRef = useRef<ActionType>();

  // 获取人员树数据
  const fetchUserTreeData = async (includeResigned: boolean = true) => {
    try {
      const response = await apiRequest.get('/sms/share/getDepartmentAndUser');

      if (response && response.data) {
        const { data } = response;

        // 转换数据格式
        const convertToTreeData = (nodes: any[]): any[] => {
          const result: any[] = [];
          nodes.forEach((node) => {
            if (node.departmentName) {
              // 部门节点
              const deptNode: any = {
                title: node.departmentName,
                value: `dept_${node.id}`,
                key: `dept_${node.id}`,
                children: [],
              };
              // 如果有用户，根据离职状态过滤
              if (node.userId && (includeResigned || node.enable !== false)) {
                deptNode.children.push({
                  title: node.name,
                  value: `user_${node.userId}`,
                  key: `user_${node.userId}`,
                  isLeaf: true,
                  userId: node.userId,
                  userName: node.name,
                  enable: node.enable,
                });
              }
              // 递归处理子部门
              if (node.children && node.children.length > 0) {
                const childNodes = convertToTreeData(node.children);
                deptNode.children.push(...childNodes);
              }
              // 只添加有子节点的部门
              if (deptNode.children.length > 0) {
                result.push(deptNode);
              }
            } else {
              // 用户节点（顶级用户）
              if (node.userId && (includeResigned || node.enable !== false)) {
                result.push({
                  title: node.name,
                  value: `user_${node.userId}`,
                  key: `user_${node.userId}`,
                  isLeaf: true,
                  userId: node.userId,
                  userName: node.name,
                  enable: node.enable,
                });
              }
              // 递归处理子节点
              if (node.children && node.children.length > 0) {
                const childNodes = convertToTreeData(node.children);
                result.push(...childNodes);
              }
            }
          });
          return result;
        };

        const treeDataResult = convertToTreeData(data);
        setTreeData(treeDataResult);

        // 默认展开汇德教育相关的部门
        const defaultExpandedKeys = treeDataResult
          .filter(
            (node) =>
              node.title.includes('汇德') ||
              node.title.includes('教育') ||
              node.title.includes('销售') ||
              node.title.includes('市场') ||
              node.title.includes('应急') ||
              node.title.includes('投放') ||
              node.title.includes('无人机')
          )
          .map((node) => node.key);
        setExpandedKeys(defaultExpandedKeys);

        // 默认不选中任何部门
        setCheckedKeys([]);
      }
    } catch (error) {
      setTreeData([]);
      setExpandedKeys([]);
      setCheckedKeys([]);
    }
  };

  // 获取数据
  const fetchData = async (params: any = {}) => {
    setLoading(true);
    try {
      // 根据选中的员工获取userIdList
      const selectedUserIds = checkedKeys
        .filter((key) => key.startsWith('user_'))
        .map((key) => key.replace('user_', ''));

      const apiUrl = '/sms/business/bizCharge/salesReport';

      // 构建请求参数，只传递有值的参数
      const requestParams: any = {
        startTime: params.startTime || moment().startOf('week').format('YYYY-MM-DD HH:mm:ss'),
        endTime: params.endTime || moment().endOf('week').format('YYYY-MM-DD HH:mm:ss'),
        // type: 资源量统计 1，成交量统计 0
        type: activeTab === '1' ? 1 : 0,
      };

      // 只有当参数有值时才添加到请求中
      if (params.source !== undefined && params.source !== null && params.source !== '') {
        requestParams.source = params.source;
      }

      if (selectedUserIds.length > 0) {
        requestParams.userIdList = selectedUserIds;
      } else if (params.userIdList && params.userIdList.length > 0) {
        requestParams.userIdList = params.userIdList;
      }

      const response = await apiRequest.get(apiUrl, requestParams);

      // 兼容两种返回：直接数组 或 { status, data }
      const list = Array.isArray(response)
        ? response
        : (response && Array.isArray(response.data) ? response.data : []);
      setDataSource(list || []);
    } catch (error) {
      console.error('获取销售业绩报表数据失败:', error);
      message.error('获取数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 搜索
  const handleSearch = () => {
    const values = form.getFieldsValue();
    const params: any = {};

    if (values.dateRange && values.dateRange.length === 2) {
      params.startTime = values.dateRange[0].format('YYYY-MM-DD HH:mm:ss');
      params.endTime = values.dateRange[1].format('YYYY-MM-DD HH:mm:ss');
    }

    if (values.source !== undefined && values.source !== null && values.source !== '') {
      params.source = values.source;
    }

    if (values.userIdList && values.userIdList.length > 0) {
      params.userIdList = values.userIdList;
    }

    fetchData(params);
  };

  // 重置
  const handleReset = () => {
    form.resetFields();
    fetchData();
  };

  // 导出下单明细
  const downOrder = async (type: number) => {
    if (checkedKeys.length == 0) {
      message.error('请先左侧勾选招生老师');
      return;
    }
    const formValues = form.getFieldsValue();
    const { dateRange } = formValues;
    const data: any = {
      parentId: -1,
      enable: true,
      'createTime-start': dateRange ? dateRange[0].format('YYYY-MM-DD') : moment().startOf('week').format('YYYY-MM-DD'),
      'createTime-end': dateRange ? dateRange[1].format('YYYY-MM-DD') : moment().endOf('week').format('YYYY-MM-DD'),
      'status-isNot': 0,
      _isGetAll: true,
    };
    if (type == 0) {
      data['provider-in'] = checkedKeys.join(',');
    } else if (type == 1) {
      data['userId-in'] = checkedKeys.join(',');
    }
    const { content } = (await apiRequest.get('/sms/business/bizOrder', data)).data;
    DownTable(content, DownHeader, '订单信息', 'charge');
  };

  // 导出缴费明细
  const downCharge = async () => {
    if (checkedKeys.length == 0) {
      message.error('请先左侧勾选招生老师');
      return;
    }
    const formValues = form.getFieldsValue();
    const { dateRange } = formValues;
    const data: any = {
      enable: true,
      'chargeTime-start': dateRange ? dateRange[0].format('YYYY-MM-DD') : moment().startOf('week').format('YYYY-MM-DD'),
      'chargeTime-end': dateRange ? dateRange[1].format('YYYY-MM-DD') : moment().endOf('week').format('YYYY-MM-DD'),
      'provider-in': checkedKeys.join(','),
      'auditType-in': '0,4',
      confirm: true,
      _isGetAll: true,
    };
    const content = (await apiRequest.get('/sms/business/bizCharge/getListOfFinance3', data)).data;
    DownTable(content, DownHeaders.jiaoPayHeader, '缴费信息', 'charge');
  };

  // 搜索功能
  const filterTreeData = (data: any[], searchValue: string): any[] => {
    if (!searchValue) return data;

    const filter = (nodes: any[]): any[] => {
      return nodes.reduce((result: any[], node) => {
        if (node.title.toLowerCase().includes(searchValue.toLowerCase())) {
          result.push(node);
        } else if (node.children) {
          const filteredChildren = filter(node.children);
          if (filteredChildren.length > 0) {
            result.push({
              ...node,
              children: filteredChildren,
            });
          }
        }
        return result;
      }, []);
    };

    return filter(data);
  };

  // 搜索值变化时自动展开匹配的节点
  useEffect(() => {
    if (searchValue) {
      const filteredData = filterTreeData(treeData, searchValue);
      const matchingKeys = filteredData.map((node) => node.key).filter((key) => key);
      setExpandedKeys(matchingKeys);
    } else {
      // 恢复默认展开的节点
      const defaultExpandedKeys = treeData
        .filter(
          (node) =>
            node.title.includes('汇德') ||
            node.title.includes('教育') ||
            node.title.includes('销售') ||
            node.title.includes('市场') ||
            node.title.includes('应急') ||
            node.title.includes('投放') ||
            node.title.includes('无人机')
        )
        .map((node) => node.key);
      setExpandedKeys(defaultExpandedKeys);
    }
  }, [searchValue, treeData]);

  // 离职状态变化时重新获取人员树数据
  useEffect(() => {
    if (treeInitialized) {
      fetchUserTreeData(viewResigned);
    }
  }, [viewResigned]);

  // tab切换时重新获取数据
  useEffect(() => {
    if (initialized && activeTab) {
      fetchData();
    }
  }, [activeTab]);

  // 员工选择变化时重新获取数据
  useEffect(() => {
    if (initialized && checkedKeys.length >= 0) {
      // 允许空数组
      fetchData();
    }
  }, [checkedKeys]);

  // 初始化加载数据
  useEffect(() => {
    const initData = async () => {
      await fetchUserTreeData(true); // 默认查看离职人员
      setTreeInitialized(true);
      await fetchData();
      setInitialized(true);
    };
    initData();
  }, []);

  // 表格列配置
  const columns: ProColumns<SalesReportData>[] = [
    {
      title: '销售老师',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
      fixed: 'left' as const,
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 150,
      render: (_, record) => (record.startTime ? record.startTime.split(' ')[0] : '-'),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 150,
      render: (_, record) => (record.endTime ? record.endTime.split(' ')[0] : '-'),
    },
    {
      title: '线索量',
      dataIndex: 'newNum',
      key: 'newNum',
      width: 120,
      render: (_, record) => record.newNum || 0,
    },
    { title: '成交量', dataIndex: 'dealNum', key: 'dealNum', width: 120, render: (_, r) => r.dealNum || 0 },
    { title: '成交金额', dataIndex: 'dealAmount', key: 'dealAmount', width: 150, render: (_, r) => `¥${(r.dealAmount || 0).toLocaleString()}` },
    { title: '成交率', dataIndex: 'dealPercent', key: 'dealPercent', width: 120, render: (_, r) => {
      const percent = r.newNum > 0 ? (((r.dealNum || 0) / r.newNum) * 100).toFixed(2) : '0.00';
      return `${percent}%`;
    } },
    {
      title: '所属组名',
      dataIndex: 'groupName',
      key: 'groupName',
      width: 150,
    },
  ];

  return (
    <PageContainer title="销售业绩报表">
      <div
        style={{
          display: 'flex',
          gap: '16px',
          height: 'calc(100vh - 270px)',
          overflow: 'hidden',
        }}
      >
        {/* 左侧人员树 */}
        <Card
          title="人员选择"
          style={{
            width: '300px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <Radio.Group
              value={viewResigned}
              onChange={(e) => setViewResigned(e.target.value)}
              style={{ marginBottom: 12 }}
            >
              <Radio value={false}>不查看离职</Radio>
              <Radio value={true}>查看离职</Radio>
            </Radio.Group>
            <Input
              placeholder="搜索"
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <Tree
              checkable
              checkedKeys={checkedKeys}
              expandedKeys={expandedKeys}
              selectedKeys={selectedKeys}
              onCheck={(keys) => setCheckedKeys(keys as string[])}
              onSelect={(keys) => setSelectedKeys(keys as string[])}
              onExpand={(keys) => setExpandedKeys(keys as string[])}
              treeData={filterTreeData(treeData, searchValue)}
              style={{ height: '100%' }}
            />
          </div>
        </Card>

        {/* 右侧内容区域 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* 顶部Tab和筛选 */}
          <Card style={{ marginBottom: 12, flexShrink: 0 }}>
            <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 16 }}>
              <Tabs.TabPane tab="资源量统计" key="1" />
              <Tabs.TabPane tab="成交量统计" key="2" />
            </Tabs>

            <Form form={form} layout="inline" style={{ marginBottom: 0 }}>
              <Row gutter={16} style={{ width: '100%' }}>
                <Col span={8}>
                  <Form.Item label="日期时间" name="dateRange">
                    <RangePicker
                      style={{ width: '100%' }}
                      format="YYYY-MM-DD"
                      placeholder={['开始时间', '结束时间']}
                      defaultValue={[moment().startOf('week'), moment().endOf('week')]}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="学员来源" name="source">
                    <Select placeholder="请选择学员来源" allowClear style={{ width: '100%' }}>
                      {Dictionaries.getList('dict_source')?.map((item: any) => (
                        <Option key={item.value} value={item.value}>
                          {item.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Space>
                    <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} loading={loading}>
                      提交
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={handleReset}>
                      重置
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Card>

          {/* 表格标题 */}
          <Card style={{ marginBottom: 12, flexShrink: 0 }}>
            <Typography.Title level={4} style={{ margin: 0 }}>
              学员信息提供成交比
            </Typography.Title>
          </Card>

          {/* 数据表格 */}
          <Card style={{ flex: 1, overflow: 'hidden' }}>
            <ProTable<SalesReportData>
              actionRef={actionRef}
              columns={columns}
              dataSource={dataSource}
              loading={loading}
              rowKey="userId"
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
                pageSizeOptions: ['10', '20', '50', '100'],
                defaultPageSize: 20,
              }}
              scroll={{
                x: 'max-content',
                y: 'calc(100vh - 500px)',
              }}
              toolBarRender={() => [
                <Space key="toolbar">
                  <Button
                    type="default"
                    icon={<FileExcelOutlined />}
                    onClick={() => downOrder(0)}
                    style={{
                      borderRadius: '6px',
                      fontWeight: 500,
                      borderColor: '#52c41a',
                      color: '#52c41a',
                      boxShadow: '0 2px 4px rgba(82, 196, 26, 0.2)',
                    }}
                  >
                    导出下单明细
                  </Button>
                  <Button
                    type="default"
                    icon={<FilePdfOutlined />}
                    onClick={() => downCharge()}
                    style={{
                      borderRadius: '6px',
                      fontWeight: 500,
                      borderColor: '#fa541c',
                      color: '#fa541c',
                      boxShadow: '0 2px 4px rgba(250, 84, 28, 0.2)',
                    }}
                  >
                    导出缴费明细
                  </Button>
                </Space>,
              ]}
              summary={(pageData) => {
                const totalNewNum = pageData.reduce((sum, item) => sum + (item.newNum || 0), 0);
                const totalDealNum = pageData.reduce((sum, item) => sum + (item.dealNum || 0), 0);
                const totalDealAmount = pageData.reduce((sum, item) => sum + (item.dealAmount || 0), 0);
                const avgDealPercent = totalNewNum > 0 ? ((totalDealNum / totalNewNum) * 100).toFixed(2) : '0.00';

                return (
                  <ProTable.Summary fixed>
                    <ProTable.Summary.Row>
                      <ProTable.Summary.Cell index={0}>总计</ProTable.Summary.Cell>
                      <ProTable.Summary.Cell index={1} />
                      <ProTable.Summary.Cell index={2} />
                      <ProTable.Summary.Cell index={3}>{totalNewNum}</ProTable.Summary.Cell>
                      <ProTable.Summary.Cell index={4}>{totalDealNum}</ProTable.Summary.Cell>
                      <ProTable.Summary.Cell index={5}>¥{totalDealAmount.toLocaleString()}</ProTable.Summary.Cell>
                      <ProTable.Summary.Cell index={6}>{avgDealPercent}%</ProTable.Summary.Cell>
                      <ProTable.Summary.Cell index={7} />
                    </ProTable.Summary.Row>
                  </ProTable.Summary>
                );
              }}
            />
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default SalesPerformanceReport;
