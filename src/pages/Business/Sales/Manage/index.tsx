import React, { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Form, Input, InputNumber, message, Popconfirm } from 'antd';
import apiRequest from '@/services/ant-design-pro/apiRequest';

type SalesItem = {
  id: number;
  name: string;      // 销售姓名
  phone?: string;    // 联系电话
  level?: string;    // 销售等级编码/名称
  team?: string;     // 所属团队
  createdAt?: string;
};

export default () => {
  const actionRef = useRef<ActionType>();
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<SalesItem | null>(null);
  const [form] = Form.useForm<SalesItem>();

  const columns: ProColumns<SalesItem>[] = [
    { title: '姓名', dataIndex: 'name' },
    { title: '联系电话', dataIndex: 'phone' },
    { title: '所属团队', dataIndex: 'team' },
    { title: '销售等级', dataIndex: 'level' },
    { title: '创建时间', dataIndex: 'createdAt', valueType: 'dateTime' },
    {
      title: '操作', valueType: 'option', render: (_, record) => [
        <a key={`edit-${record.id || Math.random()}`} onClick={() => { setEditing(record); form.setFieldsValue(record); setVisible(true); }}>编辑</a>,
        <Popconfirm key="del" title="确认删除该销售？" onConfirm={async () => {
          await apiRequest.delete('/sms/sales', { id: record.id });
          message.success('删除成功');
          actionRef.current?.reload();
        }}><a>删除</a></Popconfirm>
      ]
    }
  ];

  return (
    <PageContainer>
      <ProTable<SalesItem>
        rowKey="id"
        columns={columns}
        actionRef={actionRef}
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          <Button type="primary" key="new" onClick={() => { setEditing(null); form.resetFields(); setVisible(true); }}>新增</Button>
        ]}
        request={async (params) => {
          // 列表接口占位：GET /sms/sales
          const res = await apiRequest.get('/sms/sales', params);
          return { data: res.data?.content || [], success: true, total: res.data?.totalElements || 0 };
        }}
      />

      <Modal
        title={editing ? '编辑销售' : '新增销售'}
        open={visible}
        destroyOnClose
        onCancel={() => setVisible(false)}
        onOk={async () => {
          const values = await form.validateFields();
          if (editing) {
            await apiRequest.post('/sms/sales/update', { id: editing.id, ...values });
            message.success('更新成功');
          } else {
            await apiRequest.post('/sms/sales', values);
            message.success('新增成功');
          }
          setVisible(false);
          actionRef.current?.reload();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入" />
          </Form.Item>
          <Form.Item label="联系电话" name="phone">
            <Input placeholder="请输入" />
          </Form.Item>
          <Form.Item label="所属团队" name="team">
            <Input placeholder="请输入" />
          </Form.Item>
          <Form.Item label="等级编码/名称" name="level">
            <Input placeholder="如：A、B、VIP 等" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}


