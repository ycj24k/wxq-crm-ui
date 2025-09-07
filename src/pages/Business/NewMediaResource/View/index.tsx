import React, { useMemo, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { Button, Space, Tag, Modal, Form, Input, Select, DatePicker, message } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import moment from 'moment';
// 参考资源小组使用方式，统一使用 apiRequest
import apiRequest from '@/services/ant-design-pro/apiRequest';

const { Option } = Select;

type ResourceItem = {
  id: number;
  title: string;
  platform: string;
  author: string;
  status: number; // 0 未处理 1 已处理
  createdAt: string;
  phone?: string;
  wechat?: string;
  qq?: string;
  currentTeacher?: string;
  inputTeacher?: string;
  provider?: string;
  project?: string;          // 项目名称
  consultTime?: string;      // 咨询时间
  customerSource?: string;   // 客户来源
  convertStatus?: string;    // 成交状态
  followStatus?: string;     // 成交跟进状态
  successProject?: string;   // 成交项目
  successPosition?: string;  // 成交岗位/职位
  amount?: number;           // 成交金额
};

export default () => {
  const actionRef = useRef<ActionType>();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<ResourceItem | null>(null);
  const searchFormRef = useRef<ProFormInstance>();

  // 假数据
  const mockList: ResourceItem[] = useMemo(() => [
    { id: 1, title: '2025考证攻略合集', platform: 'douyin', author: '头条信息流', status: 1, createdAt: '2025-08-27 10:33:48', phone: '13800001111', wechat: 'wx_abc', qq: '123456', currentTeacher: '系统管理员', inputTeacher: '系统管理员', provider: '渠道部', project: '机电类工种', consultTime: '2025-08-27 10:33:48', customerSource: '头条信息流', convertStatus: '已成交', followStatus: '已联系', successProject: '就业指导课', successPosition: '人社部专项职业能力', amount: 1500 },
    { id: 2, title: '就业指导课（完整版）', platform: 'wechat', author: '商务洽谈', status: 0, createdAt: '2025-08-26 11:34:14', phone: '13900002222', wechat: 'wx_def', qq: '888888', currentTeacher: '系统管理员', inputTeacher: '系统管理员', provider: '抖音达人A', project: '应急特种作业', consultTime: '2025-08-26 11:34:14', customerSource: '商务洽谈', convertStatus: '未成交', followStatus: '跟进中', successProject: '-', successPosition: '-', amount: 0 },
    { id: 3, title: '行业简报：工程造价', platform: 'weibo', author: '鹿队', status: 1, createdAt: '2025-08-25 10:38:37', phone: '13700003333', wechat: 'wx_xyz', qq: '666666', currentTeacher: '系统管理员', inputTeacher: '系统管理员', provider: '渠道B', project: '就业指导课', consultTime: '2025-08-25 10:38:37', customerSource: '微博信息流', convertStatus: '已成交', followStatus: '已归档', successProject: '外分校岗前安全', successPosition: '岗前安全委员', amount: 1480 },
  ], []);

  const columns: ProColumns<ResourceItem>[] = [
    // 顶部查询表单（仿截图）
    { title: '手机号', dataIndex: 'phone', hideInTable: true },
    { title: '微信', dataIndex: 'wechat', hideInTable: true },
    { title: '现所属老师', dataIndex: 'currentTeacher', hideInTable: true },
    { title: '录入所属老师', dataIndex: 'inputTeacher', hideInTable: true },
    { title: '信息提供人', dataIndex: 'provider', hideInTable: true },
    { title: 'QQ', dataIndex: 'qq', hideInTable: true },
    { title: '线索录入时间', dataIndex: 'createdAtRange', valueType: 'dateTimeRange', hideInTable: true },
    { title: '学员姓名', dataIndex: 'title', hideInTable: true, fieldProps: { placeholder: '请输入学员姓名' } },

    // 表格列
    { title: '学员姓名', dataIndex: 'title', ellipsis: true, render: (_, r) => <a>{r.title}</a>, width: 120 },
    { title: '现所属老师', dataIndex: 'currentTeacher' },
    { title: '录入所属老师', dataIndex: 'inputTeacher' },
    { title: '信息提供人', dataIndex: 'provider' },
    { title: '平台', dataIndex: 'platform', valueType: 'select', valueEnum: { douyin: { text: '抖音' }, kuaishou: { text: '快手' }, wechat: { text: '微信' }, weibo: { text: '微博' } }, width: 90 },
    { title: '作者/来源', dataIndex: 'author', width: 120 },
    { title: '项目意向', dataIndex: 'project', width: 140 },
    { title: '咨询时间', dataIndex: 'consultTime', valueType: 'dateTime', width: 170 },
    { title: '客户来源', dataIndex: 'customerSource', width: 120 },
    { title: '成交状态', dataIndex: 'convertStatus', render: (_, r) => <a>{r.convertStatus}</a>, width: 100 },
    { title: '跟进状态', dataIndex: 'followStatus', width: 100 },
    { title: '成交项目', dataIndex: 'successProject', width: 140 },
    { title: '成交岗位', dataIndex: 'successPosition', width: 140 },
    { title: '成交金额', dataIndex: 'amount', width: 100 },
    { title: '创建时间', dataIndex: 'createdAt', valueType: 'dateTime', width: 170 },
    { title: '状态', dataIndex: 'status', valueType: 'select', valueEnum: { 0: { text: '未处理', status: 'Default' }, 1: { text: '已处理', status: 'Success' } }, render: (_, r) => <Tag color={r.status === 1 ? 'green' : 'default'}>{r.status === 1 ? '已处理' : '未处理'}</Tag>, width: 90 },
    { title: '操作', valueType: 'option', width: 120, render: (_, record) => [
      <a key="edit" onClick={() => {
        setEditing(record);
        form.setFieldsValue({
          title: record.title,
          platform: record.platform,
          author: record.author,
          createdAt: moment(record.createdAt),
          phone: record.phone,
          wechat: record.wechat,
          qq: record.qq,
          currentTeacher: record.currentTeacher,
          inputTeacher: record.inputTeacher,
          provider: record.provider,
          project: record.project,
          consultTime: moment(record.consultTime),
          customerSource: record.customerSource,
          convertStatus: record.convertStatus,
          followStatus: record.followStatus,
          successProject: record.successProject,
          successPosition: record.successPosition,
          amount: record.amount,
        });
        setVisible(true);
      }}>编辑</a>,
    ] },
  ];

  return (
    <PageContainer>
      <ProTable<ResourceItem>
        rowKey="id"
        columns={columns}
        actionRef={actionRef}
        loading={loading}
        formRef={searchFormRef}
        search={{ labelWidth: 'auto', defaultCollapsed: false }}
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
          // 参考资源小组：这里预留真实接口
          // const res = await apiRequest.get('/sms/newmedia/resources', params);
          // return { data: res.data.content, success: true, total: res.data.totalElements };

          // 本地假数据筛选
          const { createdAtRange, ...rest } = params as any;
          let list = [...mockList];
          Object.keys(rest).forEach((k) => {
            if (rest[k]) list = list.filter((it: any) => String(it[k] ?? '').includes(String(rest[k])));
          });
          if (createdAtRange && createdAtRange.length === 2) {
            const [start, end] = createdAtRange;
            const s = moment(start);
            const e = moment(end);
            list = list.filter((it) => {
              const t = moment(it.createdAt);
              return t.isBetween(s, e, undefined, '[]');
            });
          }
          return { data: list, success: true, total: list.length };
        }}
      />

      <Modal
        title={editing ? '编辑资源' : '新增资源'}
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={async () => {
          const values = await form.validateFields();
          // 参考资源小组：这里预留真实接口
          // const payload = { ...values, createdAt: values.createdAt?.format('YYYY-MM-DD HH:mm:ss') };
          // if (editing) await apiRequest.post('/sms/newmedia/resource/update', { id: editing.id, ...payload });
          // else await apiRequest.post('/sms/newmedia/resource', payload);
          message.success('已提交（示例数据，仅本地更新）');
          setVisible(false);
          actionRef.current?.reload();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="标题" name="title" rules={[{ required: true, message: '请输入标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="平台" name="platform" rules={[{ required: true, message: '请选择平台' }]}>
            <Select placeholder="请选择平台">
              <Option value="douyin">抖音</Option>
              <Option value="kuaishou">快手</Option>
              <Option value="wechat">微信</Option>
              <Option value="weibo">微博</Option>
            </Select>
          </Form.Item>
          <Form.Item label="现所属老师" name="currentTeacher">
            <Input />
          </Form.Item>
          <Form.Item label="录入所属老师" name="inputTeacher">
            <Input />
          </Form.Item>
          <Form.Item label="信息提供人" name="provider">
            <Input />
          </Form.Item>
          <Form.Item label="作者" name="author" rules={[{ required: true, message: '请输入作者' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="发布时间" name="createdAt" rules={[{ required: true, message: '请选择发布时间' }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="链接" name="link">
            <Input placeholder="可选" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};


