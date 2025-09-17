import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import moment from 'moment';
import type { Moment } from 'moment';
import {
  Calendar,
  Button,
  Card,
  Tag,
  message,
  Badge,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Popconfirm,
} from 'antd';
import { LeftOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import apiRequest from '@/services/ant-design-pro/apiRequest';
// import Dictionaries from '@/services/util/dictionaries';
import 'moment/locale/zh-cn';
import './index.less';

const { Option } = Select;
const { TextArea } = Input;

type TodoItem = {
  id: number;
  content: string;
  joinUser: string;
  remindTime: string;
  completeStatus?: boolean;
  completeTime?: string;
  createBy?: number;
  createTime?: string;
  remindStatus?: boolean;
  updateBy?: number;
  updateTime?: string;
};

export default () => {
  const [selectedDate, setSelectedDate] = useState<moment.Moment>(moment());
  const [list, setList] = useState<TodoItem[]>([]);
  const [monthMap, setMonthMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<TodoItem | null>(null);
  const [form] = Form.useForm();
  // const actionRef = useRef<any>();

  moment.locale('zh-cn');

  // 获取待办事项列表
  const fetchTodoList = async (date?: moment.Moment) => {
    setLoading(true);
    try {
      const params: any = {
        _page: 0,
        _size: 100,
      };

      if (date) {
        // 获取选中日期的开始和结束时间，使用数组格式让apiRequest自动处理
        const startTime = date.clone().startOf('day');
        const endTime = date.clone().endOf('day');
        params.remindTime = [startTime, endTime];
      }

      const response = await apiRequest.get('/sms/business/bizTodo', params);
      // console.log('待办事项列表响应:', response);
      if (response.status === 'success' && response.data) {
        setList(response.data.content || []);
      } else {
        setList([]);
      }
    } catch (error) {
      console.error('获取待办事项失败:', error);
      message.error('获取待办事项失败');
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  // 获取月份统计数据
  const fetchMonthStats = async (date: moment.Moment) => {
    try {
      const year = date.year();
      const month = date.month() + 1;

      // 获取该月所有待办事项
      const startTime = moment(`${year}-${month.toString().padStart(2, '0')}-01`).startOf('day');
      const endTime = moment(`${year}-${month.toString().padStart(2, '0')}-01`).endOf('month');

      const params = {
        _page: 0,
        _size: 1000,
        remindTime: [startTime, endTime],
      };

      const response = await apiRequest.get('/sms/business/bizTodo', params);
      if (response.status === 'success' && response.data) {
        const map: Record<string, number> = {};
        response.data.content?.forEach((item: TodoItem) => {
          // 只统计未完成的待办事项
          if (!item.completeStatus) {
            const dateKey = moment(item.remindTime).format('YYYY-MM-DD');
            map[dateKey] = (map[dateKey] || 0) + 1;
          }
        });
        setMonthMap(map);
      }
    } catch (error) {
      console.error('获取月份统计失败:', error);
    }
  };

  // 日历选择事件
  const onSelect = (date: Moment) => {
    setSelectedDate(date);
    fetchTodoList(date);
  };

  // 面板变化事件
  const onPanelChange = (date: Moment) => {
    setSelectedDate(date);
    fetchMonthStats(date);
  };

  // 完成待办事项
  const handleComplete = async (item: TodoItem) => {
    try {
      await apiRequest.post(`/sms/business/bizTodo/complete/${item.id}`);
      message.success('已完成');
      fetchTodoList(selectedDate);
      fetchMonthStats(selectedDate);
    } catch (error) {
      console.error('完成待办事项失败:', error);
      message.error('完成待办事项失败');
    }
  };

  // 删除待办事项
  const handleDelete = async (item: TodoItem) => {
    try {
      await apiRequest.delete('/sms/business/bizTodo', { id: item.id });
      message.success('删除成功');
      fetchTodoList(selectedDate);
      fetchMonthStats(selectedDate);
    } catch (error) {
      console.error('删除待办事项失败:', error);
      message.error('删除待办事项失败');
    }
  };

  // 打开添加/编辑弹窗
  const openModal = (item?: TodoItem) => {
    setEditingItem(item || null);
    setModalVisible(true);
    if (item) {
      form.setFieldsValue({
        ...item,
        remindTime: item.remindTime ? moment(item.remindTime) : moment(),
      });
    } else {
      form.setFieldsValue({
        remindTime: selectedDate,
      });
    }
  };

  // 保存待办事项
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        content: values.content,
        joinUser: values.joinUser || '1', // 默认值
        remindTime: values.remindTime.format('YYYY-MM-DD HH:mm:ss'),
        completeStatus: false,
        remindStatus: false,
      };

      if (editingItem) {
        // 编辑
        await apiRequest.post('/sms/business/bizTodo', {
          ...data,
          id: editingItem.id,
        });
        message.success('更新成功');
      } else {
        // 新增
        await apiRequest.post('/sms/business/bizTodo', data);
        message.success('添加成功');
      }

      setModalVisible(false);
      form.resetFields();
      fetchTodoList(selectedDate);
      fetchMonthStats(selectedDate);
    } catch (error) {
      console.error('保存待办事项失败:', error);
      message.error('保存待办事项失败');
    }
  };

  // 初始化
  useEffect(() => {
    fetchTodoList(selectedDate);
    fetchMonthStats(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空依赖数组，只在组件挂载时执行一次

  return (
    <PageContainer title="待办事项">
      <ProCard split="vertical">
        <ProCard title="日历视图" colSpan="70%">
          <Calendar
            value={selectedDate}
            onSelect={onSelect}
            onPanelChange={onPanelChange}
            headerRender={({ value, onChange }) => {
              // 生成年份选项
              const currentYear = moment().year();
              const yearOptions = [];
              for (let i = currentYear - 5; i <= currentYear + 5; i++) {
                yearOptions.push({ label: `${i}年`, value: i });
              }

              // 生成月份选项
              const monthOptions = [];
              for (let i = 1; i <= 12; i++) {
                monthOptions.push({ label: `${i}月`, value: i });
              }

              return (
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}
                >
                  <Button
                    type="primary"
                    onClick={() => onChange(moment())}
                    style={{ marginRight: '8px' }}
                  >
                    今天
                  </Button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Button
                      size="large"
                      icon={<LeftOutlined />}
                      onClick={() => onChange(value.clone().subtract(1, 'month'))}
                      style={{ width: '40px', height: '40px' }}
                    />
                    <div style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 16px' }}>{value.format('YYYY年MM月')}</div>
                    <Button
                      size="large"
                      icon={<RightOutlined />}
                      onClick={() => onChange(value.clone().add(1, 'month'))}
                      style={{ width: '40px', height: '40px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Select
                      value={value.year()}
                      options={yearOptions}
                      onChange={(year) => onChange(value.clone().year(year))}
                      style={{ width: '90px', height: '32px' }}
                      size="middle"
                    />
                    <Select
                      value={value.month() + 1}
                      options={monthOptions}
                      onChange={(month) => onChange(value.clone().month(month - 1))}
                      style={{ width: '80px', height: '32px' }}
                      size="middle"
                    />
                  </div>
                </div>
              );
            }}
            dateCellRender={(value) => {
              const key = value.format('YYYY-MM-DD');
              const count = monthMap[key] || 0;
              if (!count) return null;
              return (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  color: '#1890ff',
                  fontSize: '12px',
                  marginTop: '2px'
                }}>
                  <span style={{ fontSize: '14px' }}>i</span>
                  <span>有{count}项待办</span>
                </div>
              );
            }}
          />
        </ProCard>

        <ProCard headerBordered>
          <div className="todo_right_header">
            <div className="date_title">待办事项 {selectedDate.format('YYYY-MM-DD')}</div>
            <Button 
              type="primary" 
              shape="circle" 
              icon={<PlusOutlined />}
              onClick={() => openModal()}
              style={{ width: '32px', height: '32px' }}
            />
          </div>

          <div className="todo_list">
            {(() => {
              if (loading) {
                return <div style={{ textAlign: 'center', padding: '20px' }}>加载中...</div>;
              }
              if (list.length === 0) {
                return <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>暂无待办事项</div>;
              }
              return list.map((item) => (
                <Card
                  className="todo_card"
                  key={item.id}
                  size="small"
                  style={{ marginBottom: '8px' }}
                  bodyStyle={{ padding: '12px' }}
                  extra={
                    item.completeStatus ? (
                      <Tag color="green">已完成</Tag>
                    ) : (
                      <Button size="small" type="primary" onClick={() => handleComplete(item)}>
                        完成
                      </Button>
                    )
                  }
                >
                  <div style={{ marginBottom: '8px', fontSize: '14px', lineHeight: '1.4' }}>
                    {item.content}
                  </div>
                  <div style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                    参与人：{(() => {
                      if (item.joinUser === '1') return '我';
                      if (item.joinUser === '2') return '团队';
                      if (item.joinUser === '3') return '全部';
                      return item.joinUser || '-';
                    })()}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    待办日期：{item.remindTime ? moment(item.remindTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
                  </div>
                </Card>
              ));
            })()}
          </div>
        </ProCard>
      </ProCard>

      {/* 添加/编辑弹窗 */}
      <Modal
        title={editingItem ? '编辑待办事项' : '添加待办事项'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="content" label="待办内容" rules={[{ required: true, message: '请输入待办内容' }]}>
            <TextArea rows={3} placeholder="请输入待办内容" />
          </Form.Item>

          <Form.Item name="joinUser" label="参与人" rules={[{ required: true, message: '请选择参与人' }]}>
            <Select placeholder="请选择参与人">
              <Option value="1">我</Option>
              <Option value="2">团队</Option>
              <Option value="3">全部</Option>
            </Select>
          </Form.Item>

          <Form.Item name="remindTime" label="提醒时间" rules={[{ required: true, message: '请选择提醒时间' }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" placeholder="请选择提醒时间" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};
