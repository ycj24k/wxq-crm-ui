import { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { type ActionType, type ProColumns } from '@ant-design/pro-table';
import { Button, Modal, Form, Input, Switch, message, Popconfirm, Select, Space } from 'antd';
import RuleDrawer from './RuleDrawer';
import apiRequest from '@/services/ant-design-pro/apiRequest';

const CATEGORY_OPTIONS = [
  { label: '客户跟进', value: '客户跟进' },
  { label: '下单意愿', value: '下单意愿' },
];

type TemplateItem = {
  id: number;
  name: string;       // 规则名称
  category?: string;  // 分类
  project?: string;   // 项目名称
  description?: string; // 描述
  enable?: boolean;  // 是否启用（接口字段名）
};

export default () => {
  const actionRef = useRef<ActionType>();
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<TemplateItem | null>(null);
  const [form] = Form.useForm<TemplateItem>();
  const [ruleOpen, setRuleOpen] = useState(false);
  const [currentId, setCurrentId] = useState<number | undefined>();
  const [searchForm] = Form.useForm();
  const [filters, setFilters] = useState<any>({});

  const columns: ProColumns<TemplateItem>[] = [
    // 列表列
    { title: '规则名称', dataIndex: 'name', width: 180 },
    { title: '分类', dataIndex: 'category', width: 140, hideInSearch: true },
    { title: '开启/关闭', dataIndex: 'enable', width: 140, align: 'center',
      render: (_, record) => (
        <Switch checked={!!record.enable} onChange={async (checked) => {
          try {
            await apiRequest.post('/sms/sop/template/toggle', { id: record.id, enable: checked });
            message.success('状态已更新');
            actionRef.current?.reload();
          } catch (e) {
            message.error('切换失败');
          }
        }} />
      ),
      hideInSearch: true
    },
    { title: '项目名称', dataIndex: 'project', width: 160 },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    {
      title: '操作', valueType: 'option', width: 200, render: (_, record) => [
        <a key="view" onClick={() => { setEditing(record); form.setFieldsValue(record); setVisible(true); }}>查看</a>,
        <a key="edit" onClick={() => { setEditing(record); form.setFieldsValue(record); setVisible(true); }}>编辑</a>,
        <a key="config" onClick={() => { setCurrentId(record.id); setRuleOpen(true); }}>配置规则</a>,
        <Popconfirm key="del" title="确认删除该模板？" onConfirm={async () => {
          await apiRequest.delete('/sms/sop/template', { id: record.id });
          message.success('删除成功');
          actionRef.current?.reload();
        }}><a>删除</a></Popconfirm>
      ]
    }
  ];

  return (
    <PageContainer>
      {/* 顶部搜索表单（贴近效果图） */}
      <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 4, padding: 16, marginBottom: 16 }}>
        <Form
          form={searchForm}
          layout="inline"
          onFinish={(vals) => {
            const enable = vals.enable === undefined ? undefined : vals.enable === 'true' ? true : vals.enable === 'false' ? false : undefined;
            const next = { ...vals, enable };
            setFilters(next);
            actionRef.current?.reload();
          }}
        >
          <Form.Item label="规则名称" name="name">
            <Input allowClear placeholder="请输入" style={{ width: 220 }} />
          </Form.Item>
          <Form.Item label="分类" name="category">
            <Select allowClear placeholder="请选择" style={{ width: 180 }} options={CATEGORY_OPTIONS} />
          </Form.Item>
          <Form.Item label="项目名称" name="project">
            <Input allowClear placeholder="请输入" style={{ width: 220 }} />
          </Form.Item>
          <Form.Item label="启用" name="enable" initialValue={undefined}>
            <Select allowClear placeholder="全部" style={{ width: 140 }}
              options={[
                { label: '全部', value: undefined as any },
                { label: '已启用', value: 'true' },
                { label: '未启用', value: 'false' },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button onClick={() => { searchForm.resetFields(); setFilters({}); actionRef.current?.reload(); }}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
      <ProTable<TemplateItem>
        rowKey="id"
        columns={columns}
        actionRef={actionRef}
        search={false}
        size="middle"
        options={false}
        scroll={{ x: 1000, y: 'calc(100vh - 380px)' }}
        toolBarRender={() => [
          <Button type="primary" key="new" onClick={() => { setEditing(null); form.resetFields(); setVisible(true); }}>添加</Button>
        ]}
        request={async (params, sorter) => {
          // 参数映射到后端
          const { current, pageSize } = params as any;
          const { name, project, description, enable, category } = filters as any;
          let _orderBy: string | undefined;
          let _direction: string | undefined;
          if (sorter && typeof sorter === 'object') {
            const keys = Object.keys(sorter);
            if (keys.length) {
              _orderBy = keys.join(',');
              _direction = keys.map((k) => (sorter as any)[k]?.order === 'ascend' ? 'asc' : 'desc').join(',');
            }
          }
          const query: any = {
            name,
            category,
            project,
            description,
            enable,
            _page: current,
            _size: pageSize,
            _orderBy,
            _direction,
          };
          // 清理 undefined / 空字符串，并规范 enable 为布尔或空
          Object.keys(query).forEach((key) => {
            const value = (query as any)[key];
            if (value === undefined || value === '') {
              delete (query as any)[key];
            }
          });
          if (query.enable !== undefined) {
            query.enable = query.enable === true || query.enable === 'true';
          }
          const res = await apiRequest.getSOPTemplates(query);
          return { data: res.data?.content || [], success: true, total: res.data?.totalElements || 0 };
        }}
      />

      <Modal
        title={editing ? '编辑SOP模板' : '新增SOP模板'}
        open={visible}
        destroyOnClose
        onCancel={() => setVisible(false)}
        onOk={async () => {
          const values = await form.validateFields();
          if (editing) {
            const payload = { ...values, id: editing.id };
            await apiRequest.post('/sms/sop/template/update', payload);
            message.success('更新成功');
          } else {
            await apiRequest.post('/sms/sop/template', values);
            message.success('新增成功');
          }
          setVisible(false);
          actionRef.current?.reload();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="规则名称" name="name" rules={[{ required: true, message: '请输入规则名称' }]}>
            <Input placeholder="请输入" />
          </Form.Item>
          <Form.Item label="分类" name="category">
            <Select placeholder="请选择" options={CATEGORY_OPTIONS} />
          </Form.Item>
          <Form.Item label="项目名称" name="project">
            <Input placeholder="请输入" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
      <RuleDrawer open={ruleOpen} templateId={currentId} onClose={() => setRuleOpen(false)} />
    </PageContainer>
  );
}


