import React, { useState, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { type ActionType, type ProColumns } from '@ant-design/pro-table';
import { Button, DatePicker, Select, Space, Card, Row, Col, Radio, Tree, Input } from 'antd';
import { SearchOutlined, ExportOutlined, SettingOutlined, InfoCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import Dictionaries from '@/services/util/dictionaries';
import apiRequest from '@/services/ant-design-pro/apiRequest';

const { RangePicker } = DatePicker;
const { Option } = Select;

type SalesReportItem = {
  id: number;
  salesTeacher: string; // 销售老师
  newStudentsCount: number; // 新增学员数
  callbackCount: number; // 学员回访数
  leadsReceived: number; // 领取线索量
  conversionCount: number; // 成交量
  conversionAmount: number; // 成交金额
  groupName: string; // 所属组名
};

export default () => {
  const actionRef = useRef<ActionType>();
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment]>([
    moment('2025-08-01'),
    moment('2025-08-24'),
  ]);
  const [studentSource, setStudentSource] = useState<string>('抖音');
  const [viewResigned, setViewResigned] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // 模拟数据
  const mockData: SalesReportItem[] = [
    {
      id: 1,
      salesTeacher: '刘洁',
      newStudentsCount: 0,
      callbackCount: 0,
      leadsReceived: 173,
      conversionCount: 70,
      conversionAmount: 98689.2,
      groupName: '',
    },
    {
      id: 2,
      salesTeacher: '欧阳俊',
      newStudentsCount: 0,
      callbackCount: 0,
      leadsReceived: 142,
      conversionCount: 44,
      conversionAmount: 102899.9,
      groupName: '',
    },
    {
      id: 3,
      salesTeacher: '泰银',
      newStudentsCount: 0,
      callbackCount: 0,
      leadsReceived: 131,
      conversionCount: 42,
      conversionAmount: 47409.19,
      groupName: '',
    },
    {
      id: 4,
      salesTeacher: '刘新怡',
      newStudentsCount: 0,
      callbackCount: 0,
      leadsReceived: 1,
      conversionCount: 0,
      conversionAmount: 0,
      groupName: '',
    },
    {
      id: 5,
      salesTeacher: '黄金枝',
      newStudentsCount: 0,
      callbackCount: 0,
      leadsReceived: 242,
      conversionCount: 72,
      conversionAmount: 77909,
      groupName: '',
    },
    {
      id: 6,
      salesTeacher: '刘慧萍',
      newStudentsCount: 0,
      callbackCount: 0,
      leadsReceived: 328,
      conversionCount: 36,
      conversionAmount: 40300,
      groupName: '',
    },
    {
      id: 7,
      salesTeacher: '李雪晨',
      newStudentsCount: 0,
      callbackCount: 0,
      leadsReceived: 0,
      conversionCount: 0,
      conversionAmount: 0,
      groupName: '',
    },
    {
      id: 8,
      salesTeacher: '邓丽君',
      newStudentsCount: 0,
      callbackCount: 0,
      leadsReceived: 0,
      conversionCount: 0,
      conversionAmount: 0,
      groupName: '',
    },
    {
      id: 9,
      salesTeacher: '高萌',
      newStudentsCount: 0,
      callbackCount: 0,
      leadsReceived: 285,
      conversionCount: 7,
      conversionAmount: 54000,
      groupName: '',
    },
    {
      id: 10,
      salesTeacher: '戴柏强',
      newStudentsCount: 0,
      callbackCount: 0,
      leadsReceived: 0,
      conversionCount: 0,
      conversionAmount: 0,
      groupName: '',
    },
    {
      id: 11,
      salesTeacher: '李逸豪',
      newStudentsCount: 0,
      callbackCount: 0,
      leadsReceived: 0,
      conversionCount: 0,
      conversionAmount: 0,
      groupName: '',
    },
  ];

  // 计算总计
  const totalData = {
    leadsReceived: mockData.reduce((sum, item) => sum + item.leadsReceived, 0),
    conversionCount: mockData.reduce((sum, item) => sum + item.conversionCount, 0),
    conversionAmount: mockData.reduce((sum, item) => sum + item.conversionAmount, 0),
  };

  const columns: ProColumns<SalesReportItem>[] = [
    {
      title: '销售老师',
      dataIndex: 'salesTeacher',
      width: 120,
      fixed: 'left',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: '新增学员数',
      dataIndex: 'newStudentsCount',
      width: 120,
      align: 'center',
      render: (text) => text || '-',
    },
    {
      title: '学员回访数',
      dataIndex: 'callbackCount',
      width: 120,
      align: 'center',
      render: (text) => text || '-',
    },
    {
      title: '领取线索量',
      dataIndex: 'leadsReceived',
      width: 120,
      align: 'center',
      render: (text) => <span style={{ color: '#1890ff', fontWeight: 500 }}>{text}</span>,
    },
    {
      title: '成交量',
      dataIndex: 'conversionCount',
      width: 100,
      align: 'center',
      render: (text) => <span style={{ color: '#52c41a', fontWeight: 500 }}>{text}</span>,
    },
    {
      title: '成交金额',
      dataIndex: 'conversionAmount',
      width: 120,
      align: 'right',
      render: (text) => <span style={{ color: '#fa8c16', fontWeight: 500 }}>¥{text?.toLocaleString()}</span>,
    },
    {
      title: '所属组名',
      dataIndex: 'groupName',
      width: 120,
      render: (text) => text || '-',
    },
  ];

  // 部门树数据
  const treeData = [
    {
      title: '湖南楚怡',
      key: '0',
      children: [
        {
          title: '教务部',
          key: '0-0',
        },
        {
          title: '市场部',
          key: '0-1',
        },
      ],
    },
  ];

  return (
    <PageContainer>
      <Row gutter={16}>
        {/* 左侧导航 */}
        <Col span={6}>
          <Card style={{ height: 'calc(100vh - 200px)' }}>
            {/* 离职人员查看选项 */}
            <div style={{ marginBottom: 16 }}>
              <Radio.Group
                value={viewResigned}
                onChange={(e) => setViewResigned(e.target.value)}
                style={{ width: '100%' }}
              >
                <Radio.Button value={false} style={{ width: '50%', textAlign: 'center' }}>
                  不查看离职
                </Radio.Button>
                <Radio.Button value={true} style={{ width: '50%', textAlign: 'center' }}>
                  查看离职
                </Radio.Button>
              </Radio.Group>
            </div>

            {/* 搜索框 */}
            <div style={{ marginBottom: 16 }}>
              <Input
                placeholder="Search"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            {/* 部门树 */}
            <Tree
              treeData={treeData}
              selectedKeys={selectedKeys}
              onSelect={(keys) => setSelectedKeys(keys as string[])}
              style={{ marginBottom: 16 }}
            />

            {/* 显示单个分公司全部人员 */}
            <div
              style={{
                backgroundColor: '#fff7e6',
                border: '1px solid #ffd591',
                borderRadius: 4,
                padding: 8,
                textAlign: 'center',
                fontSize: 12,
                color: '#d46b08',
              }}
            >
              显示单个分公司全部人员
            </div>

            {/* 用户信息 */}
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                right: 16,
                fontSize: 12,
                color: '#666',
              }}
            >
              阿彪 | 小程序开发 2025.08.25
            </div>
          </Card>
        </Col>

        {/* 右侧内容 */}
        <Col span={18}>
          <Card>
            {/* 顶部筛选区域 */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space size="large">
                <div>
                  <span style={{ marginRight: 8 }}>日期时间:</span>
                  <RangePicker
                    value={dateRange}
                    onChange={(dates) => dates && setDateRange(dates as [moment.Moment, moment.Moment])}
                    format="YYYY-MM-DD"
                  />
                </div>
                <div>
                  <span style={{ marginRight: 8 }}>学员来源:</span>
                  <Select value={studentSource} onChange={setStudentSource} style={{ width: 120 }}>
                    <Option value="抖音">抖音</Option>
                    <Option value="头条">头条</Option>
                    <Option value="微博">微博</Option>
                  </Select>
                </div>
              </Space>
              <Space>
                <Button type="primary">提交</Button>
                <Button>重置</Button>
              </Space>
            </div>

            {/* 报表标题和操作 */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>学员信息提供成交比</h2>
              <Space>
                <Button type="link" size="small">
                  条件导出
                </Button>
                <Button type="link" size="small">
                  导出下单明细
                </Button>
                <Button type="link" size="small">
                  导出缴费明细
                </Button>
                <SearchOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
                <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
                <SettingOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
              </Space>
            </div>

            {/* 数据表格 */}
            <ProTable<SalesReportItem>
              rowKey="id"
              columns={columns}
              actionRef={actionRef}
              loading={loading}
              search={false}
              options={false}
              pagination={{
                defaultPageSize: 20,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
              }}
              scroll={{ x: 800 }}
              request={async () => {
                setLoading(true);
                try {
                  // 这里应该调用真实的API
                  // const res = await apiRequest.get('/sms/statistics/sales-report', {
                  //   startDate: dateRange[0].format('YYYY-MM-DD'),
                  //   endDate: dateRange[1].format('YYYY-MM-DD'),
                  //   studentSource,
                  //   viewResigned
                  // });

                  // 模拟API延迟
                  await new Promise((resolve) => setTimeout(resolve, 500));

                  return {
                    data: mockData,
                    success: true,
                    total: mockData.length,
                  };
                } catch (error) {
                  console.error('获取数据失败:', error);
                  return {
                    data: [],
                    success: false,
                    total: 0,
                  };
                } finally {
                  setLoading(false);
                }
              }}
              summary={() => (
                <ProTable.Summary fixed>
                  <ProTable.Summary.Row style={{ backgroundColor: '#fff7e6' }}>
                    <ProTable.Summary.Cell index={0} colSpan={3}>
                      <span style={{ fontWeight: 600, color: '#d46b08' }}>总计</span>
                    </ProTable.Summary.Cell>
                    <ProTable.Summary.Cell index={3} align="center">
                      <span style={{ color: '#1890ff', fontWeight: 600 }}>{totalData.leadsReceived}</span>
                    </ProTable.Summary.Cell>
                    <ProTable.Summary.Cell index={4} align="center">
                      <span style={{ color: '#52c41a', fontWeight: 600 }}>{totalData.conversionCount}</span>
                    </ProTable.Summary.Cell>
                    <ProTable.Summary.Cell index={5} align="right">
                      <span style={{ color: '#fa8c16', fontWeight: 600 }}>
                        ¥{totalData.conversionAmount.toLocaleString()}
                      </span>
                    </ProTable.Summary.Cell>
                    <ProTable.Summary.Cell index={6}>-</ProTable.Summary.Cell>
                  </ProTable.Summary.Row>
                </ProTable.Summary>
              )}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};
