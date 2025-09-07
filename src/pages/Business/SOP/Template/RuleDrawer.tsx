import React, { useEffect } from 'react';
import { Drawer, Form, Select, InputNumber, Space, Button, message } from 'antd';
import apiRequest from '@/services/ant-design-pro/apiRequest';

export type RuleLine = {
  event?: string;
  duration?: number;
  unit?: '天' | '小时' | '分钟';
  receivers?: string[];
  notifyWays?: string[];
};

export type SopRuleDrawerProps = {
  open: boolean;
  templateId?: number;
  onClose: () => void;
};

const EVENT_OPTIONS = [
  { label: '录入后通知', value: '录入后通知' },
  { label: '跟进后通知', value: '跟进后通知' },
  { label: '成交后通知', value: '成交后通知' },
];

const UNIT_OPTIONS = [
  { label: '天', value: '天' },
  { label: '小时', value: '小时' },
  { label: '分钟', value: '分钟' },
];

const RECEIVER_OPTIONS = [
  { label: '全选', value: 'all' },
  { label: '创建人', value: 'creator' },
  { label: '负责人', value: 'owner' },
  { label: '上级', value: 'leader' },
];

const NOTIFY_WAY_OPTIONS = [
  { label: '模板消息', value: '模板消息' },
  { label: '站内信', value: '站内信' },
  { label: '短信', value: '短信' },
  { label: '企业微信', value: '企业微信' },
];

const SopRuleDrawer: React.FC<SopRuleDrawerProps> = ({ open, onClose, templateId }) => {
  const [form] = Form.useForm<{ rules: RuleLine[] }>();

  useEffect(() => {
    if (!open || !templateId) return;
    (async () => {
      // 读取已有规则（占位接口）
      const res = await apiRequest.get('/sms/sop/template/rule', { id: templateId });
      const list: RuleLine[] = res.data?.rules || [{}, {}];
      form.setFieldsValue({ rules: list });
    })();
  }, [open, templateId]);

  return (
    <Drawer
      title="配置规则"
      placement="right"
      width={720}
      open={open}
      onClose={onClose}
      destroyOnClose
      extra={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={async () => {
            const values = await form.validateFields();
            await apiRequest.post('/sms/sop/template/rule/save', { id: templateId, ...values });
            message.success('保存成功');
            onClose();
          }}>保存</Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.List name="rules">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Space key={field.key} style={{ display: 'flex', marginBottom: 16 }} align="start">
                  <Form.Item name={[field.name, 'event']} rules={[{ required: true, message: '请选择事件' }]}>
                    <Select style={{ width: 140 }} options={EVENT_OPTIONS} placeholder="事件" />
                  </Form.Item>
                  <Form.Item name={[field.name, 'duration']} rules={[{ required: true, message: '请输入时长' }]}>
                    <InputNumber min={1} precision={0} style={{ width: 80 }} placeholder="多久" />
                  </Form.Item>
                  <Form.Item name={[field.name, 'unit']} initialValue="天" rules={[{ required: true }]}>
                    <Select style={{ width: 80 }} options={UNIT_OPTIONS} placeholder="单位" />
                  </Form.Item>
                  <Form.Item name={[field.name, 'receivers']} rules={[{ required: true, message: '请选择接收人' }]}>
                    <Select mode="multiple" style={{ width: 160 }} options={RECEIVER_OPTIONS} placeholder="接收人（多选）" />
                  </Form.Item>
                  <Form.Item name={[field.name, 'notifyWays']} rules={[{ required: true, message: '请选择提醒方式' }]}>
                    <Select mode="multiple" style={{ width: 160 }} options={NOTIFY_WAY_OPTIONS} placeholder="提醒方式" />
                  </Form.Item>
                  <Button type="text" onClick={() => add({})}>＋</Button>
                  <Button type="text" onClick={() => remove(field.name)}>－</Button>
                </Space>
              ))}
              <Button onClick={() => add({})}>添加</Button>
            </>
          )}
        </Form.List>
      </Form>
    </Drawer>
  );
};

export default SopRuleDrawer;


