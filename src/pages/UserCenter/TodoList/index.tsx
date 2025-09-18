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
  // Badge,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  // Space,
  // Popconfirm,
  TreeSelect,
} from 'antd';
import { LeftOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import apiRequest from '@/services/ant-design-pro/apiRequest';
// import Dictionaries from '@/services/util/dictionaries';
import 'moment/locale/zh-cn';
import './index.less';

// const { Option } = Select;
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
  const { initialState } = useModel('@@initialState');
  const currentUserId: string | undefined = initialState?.currentUser?.userid
    ? String(initialState.currentUser.userid)
    : undefined;
  const [selectedDate, setSelectedDate] = useState<moment.Moment>(moment());
  const [list, setList] = useState<TodoItem[]>([]);
  const [monthMap, setMonthMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<TodoItem | null>(null);
  const [form] = Form.useForm();
  // const actionRef = useRef<any>();
  const [userTreeData, setUserTreeData] = useState<any[]>([]);
  const [userIdToName, setUserIdToName] = useState<Record<string, string>>({});

  moment.locale('zh-cn');
  // 日历从周日开始
  moment.updateLocale('zh-cn', {
    week: { dow: 0 },
    weekdaysMin: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  });

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
  // 删除逻辑保留（未启用）
  void 0;

  // 打开添加/编辑弹窗
  const openModal = (item?: TodoItem) => {
    setEditingItem(item || null);
    setModalVisible(true);
    if (item) {
      form.setFieldsValue({
        ...item,
        remindTime: item.remindTime ? moment(item.remindTime) : moment(),
        // 将后端格式 ",1,2,3," 解析为 ["1","2","3"]
        joinUser: item.joinUser
          ? item.joinUser.split(',').filter((v: string) => v && v.trim())
          : [],
      });
    } else {
      form.setFieldsValue({
        remindTime: selectedDate,
        joinUser: currentUserId ? [currentUserId] : [],
      });
    }
  };

  // 保存待办事项
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        content: values.content,
        // joinUser 需为后端要求格式：",1,2,3,"
        joinUser: (function () {
          const ids = Array.isArray(values.joinUser)
            ? values.joinUser.filter((v: any) => v !== undefined && v !== null && String(v).trim())
            : (values.joinUser ? String(values.joinUser).split(',').filter((v: string) => v && v.trim()) : []);
          if (ids.length === 0) return '';
          return `,${ids.join(',')},`;
        })(),
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

  // 加载人员树用于“参与人”多选
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await apiRequest.get('/sms/share/getDepartmentAndUser');
        const idNameMap: Record<string, string> = {};
        const buildTree = (nodes: any[]): any[] => {
          if (!Array.isArray(nodes)) return [];
          return nodes
            .map((node: any, idx: number) => {
              // const hasChildren = Array.isArray(node.children) && node.children.length > 0;
              const isDept = !!node.departmentName;
              const title = isDept ? node.departmentName : node.name;
              const key = `${node.id || node.userId || 'k'}-${idx}`;
              // 仅保留在职用户：用户节点需要 enable === true
              if (!isDept) {
                if (!node.enable) {
                  return null; // 过滤离职员工
                }
                const userKey = String(node.userId);
                const item: any = {
                  title,
                  key: userKey,
                  value: userKey,
                  selectable: true,
                };
                if (node.userId) {
                  idNameMap[String(node.userId)] = node.name;
                }
                return item;
              }
              // 部门节点：仅在有有效子节点时保留
              const children = buildTree(node.children || []);
              if (!children || children.length === 0) return null;
              return {
                title,
                key,
                value: key,
                selectable: false,
                disabled: true,
                children,
              };
            })
            .filter(Boolean);
        };
        const tree = buildTree(res?.data || []);
        setUserTreeData(tree);
        setUserIdToName(idNameMap);
      } catch (e) {
        // 忽略加载失败，仅不提供多选名单
      }
    };
    loadUsers();
  }, []);

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
                      type="primary"
                      shape="circle"
                      size="large"
                      icon={<LeftOutlined />}
                      onClick={() => onChange(value.clone().subtract(1, 'month'))}
                    />
                    <div style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 16px' }}>{value.format('YYYY年MM月')}</div>
                    <Button
                      type="primary"
                      shape="circle"
                      size="large"
                      icon={<RightOutlined />}
                      onClick={() => onChange(value.clone().add(1, 'month'))}
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
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#1890ff',
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: 3,
                      height: 12,
                      background: '#1890ff',
                      borderRadius: 2,
                    }}
                  />
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
                      if (!item.joinUser) return '-';
                      const ids = String(item.joinUser).split(',').filter(Boolean);
                      const names = ids
                        .map((id) => userIdToName[id] || id)
                        .filter(Boolean)
                        .join('、');
                      return names || item.joinUser;
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
            <TreeSelect
              treeData={userTreeData}
              placeholder="请选择参与人（可多选）"
              allowClear
              multiple
              showSearch
              treeNodeFilterProp="title"
              filterTreeNode
              treeDefaultExpandAll
              treeCheckable
              showCheckedStrategy={TreeSelect.SHOW_CHILD}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item name="remindTime" label="提醒时间" rules={[{ required: true, message: '请选择提醒时间' }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" placeholder="请选择提醒时间" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};
