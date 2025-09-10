import React, { useEffect, useMemo } from 'react';
import { Modal, Form, Select, InputNumber, Space, Button, message, Row, Col } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import apiRequest from '@/services/ant-design-pro/apiRequest';

// 组件内部使用的数据结构
export type RuleLine = {
  event?: number;           // 事件（后端是 int）
  duration?: number;        // 多久提醒（数值）
  unit?: '天' | '小时' | '分钟'; // 单位（前端展示）
  receivers?: string[];     // 接收人（多选） => 映射到字符串，逗号分隔
  notifyWays?: string[];    // 提醒方式（多选）
};

export type SopRuleDrawerProps = {
  open: boolean;
  templateId?: number;
  onClose: () => void;
};

const EVENT_OPTIONS = [
  { label: '录入后通知', value: 0 },
  { label: '跟进后通知', value: 1 },
  { label: '成交后通知', value: 2 },
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
  // 将“多久 + 单位”映射为秒
  const unitToSeconds = useMemo(() => ({ '天': 86400, '小时': 3600, '分钟': 60 }), []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!open) return; // 仍然保持 hooks 数量不变
      try {
        let mapped: RuleLine[] = [{}];
        if (templateId) {
          const res = await apiRequest.getSOPRules(templateId);
          const list = Array.isArray(res.data) ? res.data : [];
          mapped = list.map((it: any) => {
            const sec = Number(it.triggerTime || 0);
            let unit: '天' | '小时' | '分钟' = '分钟';
            let duration = 0;
            if (sec % 86400 === 0) { unit = '天'; duration = sec / 86400; }
            else if (sec % 3600 === 0) { unit = '小时'; duration = sec / 3600; }
            else { unit = '分钟'; duration = Math.max(1, Math.round(sec / 60)); }
            const receivers = (it.receivers || '').split(',').filter((s: string) => s);
            return { event: it.event, duration, unit, receivers, notifyWays: ['模板消息'] };
          });
          if (!mapped.length) mapped = [{}];
        }
        if (!cancelled) form.setFieldsValue({ rules: mapped });
      } catch {
        if (!cancelled) form.setFieldsValue({ rules: [{}] });
      }
    };
    load();
    return () => { cancelled = true; };
  }, [open, templateId]);

  return (
    <Modal
      title="配置规则"
      open={open}
      onCancel={onClose}
      centered
      destroyOnClose
      width={960}
      footer={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={async () => {
            const values = await form.validateFields();
            const payload = (values.rules || []).map((r) => ({
              event: r.event ?? 0,
              id: 0,
              isDel: 0,
              receivers: (r.receivers || []).join(','),
              sopId: templateId,
              triggerMode: 0,
              triggerTime: Number(r.duration || 0) * (unitToSeconds[r.unit || '分钟'] || 60),
            }));
            await apiRequest.saveSOPRules(Number(templateId), payload);
            message.success('保存成功');
            onClose();
          }}>保存</Button>
        </Space>
      }
      bodyStyle={{ overflowX: 'hidden' }}
    >
      <Form form={form} layout="vertical" initialValues={{ rules: [{}] }}>
        {/* 表头标签 */}
        <Row gutter={16} style={{ marginBottom: 8, color: '#555' }}>
          <Col span={5}>事件</Col>
          <Col span={4}>多久提醒</Col>
          <Col span={3}>单位</Col>
          <Col span={6}>接收人（多选）</Col>
          <Col span={6}>提醒方式</Col>
        </Row>
        <Form.List name="rules">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Row key={field.key} gutter={16} style={{ marginBottom: 12 }}>
                  <Col span={5}>
                    <Form.Item label={false} name={[field.name, 'event']} rules={[{ required: true, message: '请选择事件' }]}>
                      <Select options={EVENT_OPTIONS} placeholder="请选择事件" />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item label={false} name={[field.name, 'duration']} rules={[{ required: true, message: '请输入时长' }]}>
                      <InputNumber min={1} precision={0} style={{ width: '100%' }} placeholder="请输入" />
                    </Form.Item>
                  </Col>
                  <Col span={3}>
                    <Form.Item label={false} name={[field.name, 'unit']} initialValue="天" rules={[{ required: true, message: '请选择单位' }]}>
                      <Select options={UNIT_OPTIONS} placeholder="单位" />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label={false} name={[field.name, 'receivers']} rules={[{ required: true, message: '请选择接收人' }]}>
                      <Select mode="multiple" options={RECEIVER_OPTIONS} placeholder="请选择" />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item label={false} name={[field.name, 'notifyWays']} rules={[{ required: true, message: '请选择提醒方式' }]}>
                      <Select mode="multiple" options={NOTIFY_WAY_OPTIONS} placeholder="请选择" />
                    </Form.Item>
                  </Col>
                  <Col span={2} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-start', paddingTop: 4 }}>
                    <Space size={8}>
                      <Button shape="circle" size="small" icon={<PlusOutlined />} onClick={() => add({})} />
                      <Button
                        shape="circle"
                        size="small"
                        icon={<MinusOutlined />}
                        disabled={fields.length <= 1}
                        onClick={() => { if (fields.length > 1) remove(field.name); }}
                      />
                    </Space>
                  </Col>
                </Row>
              ))}
              <div style={{ textAlign: 'center' }}>
                <Button onClick={() => add({})}>添加</Button>
              </div>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default SopRuleDrawer;


