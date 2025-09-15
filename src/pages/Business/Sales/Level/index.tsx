import { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Form, Input, InputNumber, message, Popconfirm } from 'antd';
import apiRequest from '@/services/ant-design-pro/apiRequest';

type SalesLevel = {
  id: number;
  name: string;      // 等级名称
  code: string;      // 等级编码
  priority?: number; // 优先级
  description?: string;
};

export default () => {
  const actionRef = useRef<ActionType>();
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<SalesLevel | null>(null);
  const [form] = Form.useForm<SalesLevel>();

  const columns: ProColumns<SalesLevel>[] = [
    { title: '等级名称', dataIndex: 'name' },
    { title: '等级编码', dataIndex: 'code' },
    { title: '优先级', dataIndex: 'priority', sorter: true },
    { title: '描述', dataIndex: 'description', ellipsis: true,
      render: (_, record) => (
            <span>
              {record.description!="undefined"?record.description: '无'}
            </span>
          )


     },
    {
      title: '操作', valueType: 'option', render: (_, record) => [
        <a key={`edit-${record.id || Math.random()}`} onClick={() => { setEditing(record); form.setFieldsValue(record); setVisible(true); }}>编辑</a>,
        <Popconfirm key="del" title="确认删除该等级？" onConfirm={async () => {
          await apiRequest.delete('/sms/sales/level', { id: record.id });
          message.success('删除成功');
          actionRef.current?.reload();
        }}><a>删除</a></Popconfirm>
      ]
    }
  ];

  return (
    <PageContainer>
      <ProTable<SalesLevel>
        rowKey="id"
        columns={columns}
        actionRef={actionRef}
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          <Button type="primary" key="new" onClick={() => { setEditing(null); form.resetFields(); setVisible(true); }}>新增</Button>
        ]}
        request={async (params) => {
          const res = await apiRequest.get('/sms/sales/level', params);
          return { data: res.data?.content || [], success: true, total: res.data?.totalElements || 0 };
        }}
      />


      <Modal
        title={editing ? '编辑销售等级' : '新增销售等级'}
        open={visible}
        destroyOnClose
        onCancel={() => setVisible(false)}
        onOk={async () => {
          const values = await form.validateFields();
          if (editing) {
            await apiRequest.post('/sms/sales/level/update', {...values ,id: editing.id  });
            message.success('更新成功');
          } else {
            await apiRequest.post('/sms/sales/level', values);
            message.success('新增成功');
          }
          setVisible(false);
          actionRef.current?.reload();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="等级名称" name="name" rules={[{ required: true, message: '请输入等级名称' }]}>
            <Input placeholder="请输入" />
          </Form.Item>
          <Form.Item label="等级编码" name="code" rules={[{ required: true, message: '请输入等级编码' }]}>
            <Input placeholder="请输入" />
          </Form.Item>
          <Form.Item label="优先级" name="priority">
            <InputNumber min={0} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}


