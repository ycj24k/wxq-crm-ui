import React, { useState, useEffect, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { type ActionType, type ProColumns } from '@ant-design/pro-table';
import {
  Card,
  Form,
  Row,
  Col,
  DatePicker,
  Select,
  Button,
  Space,
  message,
  Tabs,
  Tree,
  Input,
  Radio,
  Tooltip,
  Typography,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import apiRequest from '@/services/ant-design-pro/apiRequest';
import moment from 'moment';
import Dictionaries from '@/services/util/dictionaries';
import DownTable from '@/services/util/timeFn';
import DownHeader from '../Operations/DownHeader';
import DownHeaders from '../../../Admins/AdminCharge/DownHeader';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface ProviderReportData {
  dealAmount: number;
  dealNum: number;
  dealPercent: number;
  endTime: string;
  newNum: number;
  startTime: string;
  userId: number;
  userName: string;
}

const NewMediaReport: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<ProviderReportData[]>([]);
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
  const fetchUserTreeData = async (includeResigned: boolean = viewResigned) => {
    try {
      // 调用获取部门用户树的接口
      const response = await apiRequest.get('/sms/share/getDepartmentAndUser');

      let data = null;

      if (response && response.data) {
        data = response.data;
      } else {
        // 如果接口返回失败，尝试从localStorage获取
        const localData = JSON.parse(localStorage.getItem('Department') || '[]');
        if (localData && localData.length > 0) {
          data = localData;
        }
      }

      if (data && data.length > 0) {
        const convertToTreeData = (nodes: any[]): any[] => {
          const result: any[] = [];

          nodes.forEach((node) => {
            // 如果是部门节点
            if (node.departmentName) {
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

        const treeNodes = convertToTreeData(data);
        setTreeData(treeNodes);

        // 默认只展开汇德教育相关的部门，不展开历史离职员工
        const defaultExpandedKeys = treeNodes
          .filter(
            (node) =>
              !node.isLeaf &&
              (node.title.includes('汇德') ||
                node.title.includes('教育') ||
                node.title.includes('新媒体') ||
                node.title.includes('运营') ||
                node.title.includes('应急') ||
                node.title.includes('投放') ||
                node.title.includes('无人机'))
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

      const apiUrl = '/sms/business/bizCharge/providerReport';

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

      if (response && Array.isArray(response)) {
        setDataSource(response);

        // 数据设置完成
      } else {
        setDataSource([]);
      }
    } catch (error) {
      console.error('获取新媒体运营报表数据失败:', error);
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

    const filterNode = (node: any): any | null => {
      const title = node.title?.toLowerCase() || '';
      const search = searchValue.toLowerCase();

      if (title.includes(search)) {
        return node;
      }

      if (node.children) {
        const filteredChildren = node.children.map(filterNode).filter(Boolean);

        if (filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren,
          };
        }
      }

      return null;
    };

    return data.map(filterNode).filter(Boolean);
  };

  // 搜索时自动展开匹配的节点
  useEffect(() => {
    if (searchValue) {
      const findMatchingKeys = (data: any[]): string[] => {
        const keys: string[] = [];
        data.forEach((node) => {
          const title = node.title?.toLowerCase() || '';
          const search = searchValue.toLowerCase();

          if (title.includes(search)) {
            keys.push(node.key);
          }

          if (node.children) {
            keys.push(...findMatchingKeys(node.children));
          }
        });
        return keys;
      };

      const matchingKeys = findMatchingKeys(treeData);
      setExpandedKeys(matchingKeys);
    } else {
      // 搜索清空时，展开汇德教育相关的部门
      const defaultExpandedKeys = treeData
        .filter(
          (node) =>
            !node.isLeaf &&
            (node.title.includes('汇德') ||
              node.title.includes('教育') ||
              node.title.includes('新媒体') ||
              node.title.includes('运营') ||
              node.title.includes('应急') ||
              node.title.includes('投放') ||
              node.title.includes('无人机'))
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
  const columns: ProColumns<ProviderReportData>[] = [
    {
      title: '运营老师',
      dataIndex: 'userName',
      key: 'userName',
      width: 150,
      fixed: 'left' as const,
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 150,
      render: (_, record) => (record.startTime ? moment(record.startTime).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 150,
      render: (_, record) => (record.endTime ? moment(record.endTime).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '线索量',
      dataIndex: 'newNum',
      key: 'newNum',
      width: 120,
      render: (_, record) => record.newNum || 0,
    },
    {
      title: (
        <span>
          成交量
          <Tooltip title="当前查询时间段内产生资源数量中销售订单下单成功的数量">
            <InfoCircleOutlined style={{ marginLeft: 4, color: '#1890ff' }} />
          </Tooltip>
        </span>
      ),
      dataIndex: 'dealNum',
      key: 'dealNum',
      width: 120,
      render: (_, record) => record.dealNum || 0,
    },
    {
      title: (
        <span>
          成交金额
          <Tooltip title="当前查询时间段内产生资源量中销售订单下单成功的金额">
            <InfoCircleOutlined style={{ marginLeft: 4, color: '#1890ff' }} />
          </Tooltip>
        </span>
      ),
      dataIndex: 'dealAmount',
      key: 'dealAmount',
      width: 150,
      render: (_, record) => `¥${(record.dealAmount || 0).toLocaleString()}`,
    },
    {
      title: (
        <span>
          成交率
          <Tooltip title="当前查询时间段内产生资源数量中销售订单下单成功的比例">
            <InfoCircleOutlined style={{ marginLeft: 4, color: '#1890ff' }} />
          </Tooltip>
        </span>
      ),
      dataIndex: 'dealPercent',
      key: 'dealPercent',
      width: 120,
      render: (_, record) => `${(record.dealPercent || 0).toFixed(2)}%`,
    },
    {
      title: '所属组名',
      dataIndex: 'groupName',
      key: 'groupName',
      width: 150,
    },
  ];

  return (
    <PageContainer title="新媒体运营报表">
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
          bodyStyle={{
            padding: '12px',
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* 离职人员查看选项 */}
          <div style={{ marginBottom: '12px' }}>
            <Radio.Group value={viewResigned} onChange={(e) => setViewResigned(e.target.value)} size="small">
              <Radio value={false}>不查看离职</Radio>
              <Radio value={true}>查看离职</Radio>
            </Radio.Group>
          </div>

          {/* 搜索框 */}
          <div style={{ marginBottom: '12px' }}>
            <Input
              placeholder="Search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </div>

          {/* 人员树 */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <Tree
              treeData={filterTreeData(treeData, searchValue)}
              checkable
              checkedKeys={checkedKeys}
              onCheck={(checkedKeys) => {
                setCheckedKeys(checkedKeys as string[]);
              }}
              selectedKeys={selectedKeys}
              onSelect={(selectedKeys) => setSelectedKeys(selectedKeys as string[])}
              expandedKeys={expandedKeys}
              onExpand={(expandedKeys) => setExpandedKeys(expandedKeys as string[])}
              showLine
              showIcon={false}
              style={{
                height: '100%',
                overflow: 'auto',
              }}
            />
          </div>
        </Card>

        {/* 右侧内容区域 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
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
          <Card
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            bodyStyle={{
              flex: 1,
              padding: '16px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <ProTable<ProviderReportData>
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
                  y: 'calc(100vh - 450px)',
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
                  const avgDealPercent = totalNewNum > 0 ? (totalDealNum / totalNewNum) * 100 : 0;

                  return (
                    <ProTable.Summary.Row style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
                      <ProTable.Summary.Cell index={0}>总计</ProTable.Summary.Cell>
                      <ProTable.Summary.Cell index={1}>2025-08-01</ProTable.Summary.Cell>
                      <ProTable.Summary.Cell index={2}>2025-08-24</ProTable.Summary.Cell>
                      <ProTable.Summary.Cell index={3}>{totalNewNum}</ProTable.Summary.Cell>
                      <ProTable.Summary.Cell index={4}>{totalDealNum}</ProTable.Summary.Cell>
                      <ProTable.Summary.Cell index={5}>¥{totalDealAmount.toLocaleString()}</ProTable.Summary.Cell>
                      <ProTable.Summary.Cell index={6}>{avgDealPercent.toFixed(2)}%</ProTable.Summary.Cell>
                      <ProTable.Summary.Cell index={7}>-</ProTable.Summary.Cell>
                    </ProTable.Summary.Row>
                  );
                }}
              />
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default NewMediaReport;
