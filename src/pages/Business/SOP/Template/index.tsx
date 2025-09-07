import React, { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { Button, Modal, Form, Input, Switch, message, Popconfirm } from 'antd';
import RuleDrawer from './RuleDrawer';
import apiRequest from '@/services/ant-design-pro/apiRequest';

type TemplateItem = {
  id: number;
  name: string;       // 规则名称
  category?: string;  // 分类
  project?: string;   // 项目名称
  description?: string; // 描述
  enabled?: boolean;  // 开启/关闭
};

export default () => {
  const actionRef = useRef<ActionType>();
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<TemplateItem | null>(null);
  const [form] = Form.useForm<TemplateItem>();
  const [ruleOpen, setRuleOpen] = useState(false);
  const [currentId, setCurrentId] = useState<number | undefined>();

  const columns: ProColumns<TemplateItem>[] = [
    { title: '规则名称', dataIndex: 'name' },
    { title: '分类', dataIndex: 'category' },
    { title: '项目名称', dataIndex: 'project' },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    {
      title: '开关', dataIndex: 'enabled', render: (_, record) => (
        <Switch checked={!!record.enabled} onChange={async (checked) => {
          await apiRequest.post('/sms/sop/template/toggle', { id: record.id, enabled: checked });
          message.success('状态已更新');
          actionRef.current?.reload();
        }} />
      )
    },
    {
      title: '操作', valueType: 'option', render: (_, record) => [
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
      <ProTable<TemplateItem>
        rowKey="id"
        columns={columns}
        actionRef={actionRef}
        search={false}
        toolBarRender={() => [
          <Button type="primary" key="new" onClick={() => { setEditing(null); form.resetFields(); setVisible(true); }}>添加</Button>
        ]}
        request={async (params) => {
          const res = await apiRequest.get('/sms/sop/template', params);
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
            await apiRequest.post('/sms/sop/template/update', { id: editing.id, ...values });
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
            <Input placeholder="客户跟进/下单/成单等" />
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


