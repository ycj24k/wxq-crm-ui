import { useMemo, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { type ActionType, type ProColumns } from '@ant-design/pro-table';
import { Button, Space, Tag, Modal, Form, Input, Select, DatePicker, message, Radio } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import moment from 'moment';
// 参考资源小组使用方式，统一使用 apiRequest
import apiRequest from '@/services/ant-design-pro/apiRequest';

const { Option } = Select;

type StudentItem = {
  id: number;
  name: string;                    // 学员姓名
  type: number;                    // 学员类型 0个人 1企业
  education: number;               // 学历
  mobile: string;                  // 联系电话
  idCard: string;                  // 身份证号
  weChat: string;                  // 微信
  qq: string;                      // QQ
  sex: boolean;                    // 性别 0男 1女
  project: string;                 // 报考岗位
  source: number;                  // 客户来源
  consultationTime: string;        // 咨询时间
  level: number;                   // 意向等级 0普通 1高意向
  provider: number;                // 信息提供人
  owner: number;                   // 信息所有人
  address: string;                 // 地址
  description: string;             // 备注
  userId: number;                  // 招生老师
  createTime: string;              // 创建时间
  isDel: number;                   // 是否删除
  isFormal: boolean;               // 是否正式
  isInBlacklist: boolean;          // 是否进入黑名单
  isInWhitelist: boolean;          // 是否进入白名单
  isLive: boolean;                 // 是否为出镜人专属资源
  isLocked: boolean;               // 是否已锁定
  isPeer: boolean;                 // 是否同行
  levelWeight: number;             // 客户等级权重
  chargePersonName?: string;       // 企业负责人姓名
  code?: string;                   // 统一社会信用码
  codeFile?: string;               // 统一社会信用码电子版
};

export default () => {
  const actionRef = useRef<ActionType>();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<StudentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const searchFormRef = useRef<ProFormInstance>();

  // 假数据
  const mockList: StudentItem[] = useMemo(() => [
    { 
      id: 1, 
      name: '张三', 
      type: 0, 
      education: 1, 
      mobile: '13800001111', 
      idCard: '110101199001011234', 
      weChat: 'wx_zhangsan', 
      qq: '123456789', 
      sex: false, 
      project: '机电类工种', 
      source: 1, 
      consultationTime: '2025-08-27 10:33:48', 
      level: 1, 
      provider: 1, 
      owner: 1, 
      address: '北京市朝阳区', 
      description: '高意向客户', 
      userId: 1, 
      createTime: '2025-08-27 10:33:48', 
      isDel: 0, 
      isFormal: false, 
      isInBlacklist: false, 
      isInWhitelist: false, 
      isLive: false, 
      isLocked: false, 
      isPeer: false, 
      levelWeight: 5 
    },
    { 
      id: 2, 
      name: '李四', 
      type: 0, 
      education: 2, 
      mobile: '13900002222', 
      idCard: '110101199002021234', 
      weChat: 'wx_lisi', 
      qq: '987654321', 
      sex: true, 
      project: '应急特种作业', 
      source: 2, 
      consultationTime: '2025-08-26 11:34:14', 
      level: 0, 
      provider: 2, 
      owner: 2, 
      address: '上海市浦东新区', 
      description: '普通客户', 
      userId: 2, 
      createTime: '2025-08-26 11:34:14', 
      isDel: 0, 
      isFormal: false, 
      isInBlacklist: false, 
      isInWhitelist: false, 
      isLive: false, 
      isLocked: false, 
      isPeer: false, 
      levelWeight: 3 
    },
  ], []);

  const columns: ProColumns<StudentItem>[] = [
    // 顶部查询表单
    { title: '学员姓名', dataIndex: 'name', hideInTable: true, fieldProps: { placeholder: '请输入学员姓名' } },
    { title: '联系电话', dataIndex: 'mobile', hideInTable: true, fieldProps: { placeholder: '请输入联系电话' } },
    { title: '微信', dataIndex: 'weChat', hideInTable: true, fieldProps: { placeholder: '请输入微信' } },
    { title: 'QQ', dataIndex: 'qq', hideInTable: true, fieldProps: { placeholder: '请输入QQ' } },
    { title: '身份证号', dataIndex: 'idCard', hideInTable: true, fieldProps: { placeholder: '请输入身份证号' } },
    { title: '学员类型', dataIndex: 'type', hideInTable: true, valueType: 'select', valueEnum: { 0: { text: '个人' }, 1: { text: '企业' } } },
    { title: '客户来源', dataIndex: 'source', hideInTable: true, valueType: 'select', valueEnum: { 1: { text: '头条信息流' }, 2: { text: '商务洽谈' }, 3: { text: '微博信息流' } } },
    { title: '意向等级', dataIndex: 'level', hideInTable: true, valueType: 'select', valueEnum: { 0: { text: '普通' }, 1: { text: '高意向' } } },
    { title: '创建时间', dataIndex: 'createTimeRange', valueType: 'dateTimeRange', hideInTable: true },

    // 表格列
    { title: '学员姓名', dataIndex: 'name', ellipsis: true, render: (_, r) => <a>{r.name}</a>, width: 100, fixed: 'left' },
    { title: '学员类型', dataIndex: 'type', width: 80, render: (_, r) => r.type === 0 ? '个人' : '企业' },
    { title: '联系电话', dataIndex: 'mobile', width: 120 },
    { title: '微信', dataIndex: 'weChat', width: 100 },
    { title: 'QQ', dataIndex: 'qq', width: 100 },
    { title: '性别', dataIndex: 'sex', width: 60, render: (_, r) => r.sex ? '女' : '男' },
    { title: '报考岗位', dataIndex: 'project', width: 120, ellipsis: true },
    { title: '客户来源', dataIndex: 'source', width: 100, render: (_, r) => {
      const sourceMap = { 1: '头条信息流', 2: '商务洽谈', 3: '微博信息流' };
      return sourceMap[r.source as keyof typeof sourceMap] || '未知';
    }},
    { title: '咨询时间', dataIndex: 'consultationTime', valueType: 'dateTime', width: 150 },
    { title: '意向等级', dataIndex: 'level', width: 80, render: (_, r) => (
      <Tag color={r.level === 1 ? 'red' : 'default'}>{r.level === 1 ? '高意向' : '普通'}</Tag>
    )},
    { title: '信息提供人', dataIndex: 'provider', width: 100 },
    { title: '信息所有人', dataIndex: 'owner', width: 100 },
    { title: '地址', dataIndex: 'address', width: 120, ellipsis: true },
    { title: '创建时间', dataIndex: 'createTime', valueType: 'dateTime', width: 150 },
    { title: '操作', valueType: 'option', width: 80, fixed: 'right', render: (_, record) => [
      <a key="edit" onClick={() => {
        setEditing(record);
        form.setFieldsValue({
          name: record.name,
          type: record.type,
          education: record.education,
          mobile: record.mobile,
          idCard: record.idCard,
          weChat: record.weChat,
          qq: record.qq,
          sex: record.sex,
          project: record.project,
          source: record.source,
          consultationTime: moment(record.consultationTime),
          level: record.level,
          provider: record.provider,
          owner: record.owner,
          address: record.address,
          description: record.description,
        });
        setVisible(true);
      }}>编辑</a>,
    ] },
  ];

  return (
    <PageContainer>
      <ProTable<StudentItem>
        rowKey="id"
        columns={columns}
        actionRef={actionRef}
        loading={loading}
        formRef={searchFormRef}
        search={{ labelWidth: 'auto', defaultCollapsed: true }}
        scroll={{ x: 1200, y: 'calc(100vh - 280px)' }}
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
        }}
        toolBarRender={() => [
          <Space key="toolbar">
            <Button onClick={() => { searchFormRef.current?.resetFields(); actionRef.current?.reload(); }}>重置</Button>
            <Button type="primary" onClick={() => actionRef.current?.reload()}>查询</Button>
            <Button type="primary" onClick={() => { setEditing(null); form.resetFields(); setVisible(true); }}>新建</Button>
            <Button>批量导入</Button>
            <Button>导出</Button>
          </Space>
        ]}
        request={async (params) => {
          setLoading(true);
          try {
            // 使用真实接口
            const res = await apiRequest.getNewMediaStudents(params);
            return {
              data: res.data?.content || res.data || [],
              success: res.status === 'success',
              total: res.data?.totalElements || res.data?.length || 0,
            };
          } catch (error) {
            console.error('获取学员列表失败:', error);
            const { createTimeRange, ...rest } = params as any;
            let list = [...mockList];
            Object.keys(rest).forEach((k) => {
              if (rest[k]) list = list.filter((it: any) => String(it[k] ?? '').includes(String(rest[k])));
            });
            if (createTimeRange && createTimeRange.length === 2) {
              const [start, end] = createTimeRange;
              const s = moment(start);
              const e = moment(end);
              list = list.filter((it) => {
                const t = moment(it.createTime);
                return t.isBetween(s, e, undefined, '[]');
              });
            }
            return { data: list, success: true, total: list.length };
          } finally {
            setLoading(false);
          }
        }}
      />

      <Modal
        title={editing ? '编辑学员' : '新建'}
        open={visible}
        onCancel={() => setVisible(false)}
        width={900}
        confirmLoading={submitting}
        onOk={async () => {
          try {
            setSubmitting(true);
            const values = await form.validateFields();
            const payload = {
              ...values,
              consultationTime: values.consultationTime?.format('YYYY-MM-DD HH:mm:ss'),
              createTime: new Date().toISOString(),
              isDel: 0,
              isFormal: false,
              isInBlacklist: false,
              isInWhitelist: false,
              isLive: false,
              isLocked: false,
              isPeer: false,
              levelWeight: values.level === 1 ? 5 : 3,
            };
            
            if (editing) {
              // 编辑逻辑
              await apiRequest.addStudentsToGroup([{ ...payload, id: editing.id }]);
              message.success('编辑成功');
            } else {
              // 新增逻辑
              await apiRequest.addStudentsToGroup([payload]);
              message.success('新增成功');
            }
            setVisible(false);
            actionRef.current?.reload();
          } catch (error) {
            console.error('保存失败:', error);
            message.error('保存失败，请重试');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <Form form={form} layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <Form.Item label="学员类型" name="type" style={{ marginBottom: 10 }} rules={[{ required: true, message: '请选择学员类型' }]}> 
              <Select placeholder="请选择">
                <Option value={0}>个人</Option>
                <Option value={1}>企业</Option>
              </Select>
            </Form.Item>
            <Form.Item label="学员姓名" name="name" style={{ marginBottom: 10 }} rules={[{ required: true, message: '请输入姓名' }]}> 
              <Input placeholder="请输入姓名" />
            </Form.Item>
            <div />

            <Form.Item label="联系电话" name="mobile" style={{ marginBottom: 10 }} rules={[{ required: true, message: '请输入联系电话' }]}> 
              <Input placeholder="请输入联系电话" />
            </Form.Item>
            <Form.Item label="身份证号" name="idCard" style={{ marginBottom: 10 }}> 
              <Input placeholder="请输入身份证" />
            </Form.Item>
            <div />

            <Form.Item label="微信" name="weChat" style={{ marginBottom: 10 }}> 
              <Input placeholder="请输入微信" />
            </Form.Item>
            <Form.Item label="QQ" name="qq" style={{ marginBottom: 10 }}> 
              <Input placeholder="请输入QQ" />
            </Form.Item>
            <Form.Item label="性别" name="sex" style={{ marginBottom: 10 }}> 
              <Select placeholder="请选择">
                <Option value={false}>男</Option>
                <Option value={true}>女</Option>
              </Select>
            </Form.Item>

            <Form.Item label="学历" name="education" style={{ marginBottom: 10 }}> 
              <Select placeholder="请选择">
                <Option value={1}>高中</Option>
                <Option value={2}>大专</Option>
                <Option value={3}>本科</Option>
                <Option value={4}>硕士</Option>
                <Option value={5}>博士</Option>
              </Select>
            </Form.Item>
            <Form.Item label="客户来源" name="source" style={{ marginBottom: 10 }} rules={[{ required: true, message: '请选择客户来源' }]}> 
              <Select placeholder="请选择">
                <Option value={1}>头条信息流</Option>
                <Option value={2}>商务洽谈</Option>
                <Option value={3}>微博信息流</Option>
              </Select>
            </Form.Item>
            <Form.Item label="咨询日期" name="consultationTime" style={{ marginBottom: 10 }} rules={[{ required: true, message: '请选择咨询日期' }]}> 
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item label="意向等级" name="level" style={{ marginBottom: 10 }}> 
              <Radio.Group>
                <Radio value={0}>普通</Radio>
                <Radio value={1}>高意向</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="报考岗位" name="project" style={{ marginBottom: 10 }}> 
              <Input placeholder="咨询报考岗位" />
            </Form.Item>
            <div />

            <Form.Item label="信息提供人" name="provider" style={{ marginBottom: 10 }}> 
              <Select placeholder="请选择">
                <Option value={1}>系统管理员</Option>
                <Option value={2}>渠道部</Option>
                <Option value={3}>销售部</Option>
              </Select>
            </Form.Item>
            <Form.Item label="信息所有人" name="owner" style={{ marginBottom: 10 }}> 
              <Select placeholder="请选择">
                <Option value={1}>系统管理员</Option>
                <Option value={2}>渠道部</Option>
                <Option value={3}>销售部</Option>
              </Select>
            </Form.Item>
            <div />

            <Form.Item label="地址" name="address" style={{ gridColumn: '1 / span 3', marginBottom: 10 }}>
              <Input.TextArea placeholder="请输入地址..." rows={2} />
            </Form.Item>
            <Form.Item label="备注" name="description" style={{ gridColumn: '1 / span 3', marginBottom: 0 }}>
              <Input.TextArea placeholder="请输入备注..." rows={3} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </PageContainer>
  );
};


