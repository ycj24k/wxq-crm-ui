/**
 * 配置规则右侧弹窗组件
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Drawer, Button, Select, Input, Space, Card, Row, Col, DatePicker, InputNumber, message, Spin } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import moment from 'moment';
import apiRequest from '@/services/ant-design-pro/apiRequest';

const { Option } = Select;

// 计算字段类型
interface FieldType {
  key: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'datetime' | 'time' | 'boolean';
}

// 运算类型配置
interface OperatorConfig {
  value: number;
  name: string;
  valueType: 'string' | 'number' | 'date' | 'datetime' | 'time' | 'boolean' | 'empty';
}

// 规则行
interface RuleLine {
  id: number;
  field: string;
  operator: number;
  value: string;
  ruleGroupId?: number;
  createBy?: number;
  createTime?: string;
  isDel?: number;
  type?: number;
  updateBy?: number;
  updateTime?: string;
}

// 规则组
interface RuleGroup {
  id: number;
  name: string;
  relation: 'and' | 'or';
  rules: RuleLine[];
  userGroupId?: number;
  isDel?: number;
  operator?: number;
}

// API字段类型
interface ApiFieldType {
  field: string;
  name: string;
  type: string;
}

interface RuleConfigDrawerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: (groups: RuleGroup[]) => void;
  userGroupId?: number;
}

const RuleConfigDrawer: React.FC<RuleConfigDrawerProps> = ({
  visible,
  onClose,
  onConfirm,
  userGroupId,
}) => {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>([]);
  const [_apiFields, setApiFields] = useState<ApiFieldType[]>([]);

  // 运算类型配置
  const operatorConfigs: OperatorConfig[] = [
    { value: 0, name: '等于', valueType: 'string' },
    { value: 1, name: '不等于', valueType: 'string' },
    { value: 2, name: '包含', valueType: 'string' },
    { value: 3, name: '不包含', valueType: 'string' },
    { value: 4, name: '为空', valueType: 'empty' },
    { value: 5, name: '不为空', valueType: 'empty' },
    { value: 6, name: '数字大于', valueType: 'number' },
    { value: 7, name: '数字小于', valueType: 'number' },
    { value: 8, name: '正则表达式', valueType: 'string' },
    { value: 9, name: '日期时间大于', valueType: 'datetime' },
    { value: 10, name: '日期时间小于', valueType: 'datetime' },
    { value: 11, name: '时间大于', valueType: 'time' },
    { value: 12, name: '时间小于', valueType: 'time' },
    { value: 13, name: '在列表', valueType: 'string' },
    { value: 14, name: '是', valueType: 'boolean' },
    { value: 15, name: '否', valueType: 'boolean' },
  ];

  const [ruleGroups, setRuleGroups] = useState<RuleGroup[]>([]);

  // 加载字段列表
  const loadFieldTypes = async () => {
    try {
      const response = await apiRequest.getRuleFields();
      if (response.status === 'success' && response.data) {
        const data = Array.isArray(response.data) ? response.data : [response.data];
        setApiFields(data);
        // 转换API字段格式为组件需要的格式
        const convertedFields: FieldType[] = data.map((field: ApiFieldType) => ({
          key: field.field || '',
          name: field.name || '',
          type: (field.type as any) || 'string'
        }));
        setFieldTypes(convertedFields);
      } else {
        // 如果API失败，使用默认字段
        const defaultFields: FieldType[] = [
          { key: 'owner', name: '信息所有人', type: 'string' },
          { key: 'department', name: '部门', type: 'string' },
          { key: 'position', name: '职位', type: 'string' },
          { key: 'age', name: '年龄', type: 'number' },
          { key: 'salary', name: '薪资', type: 'number' },
          { key: 'createTime', name: '创建时间', type: 'datetime' },
          { key: 'birthday', name: '生日', type: 'date' },
          { key: 'workTime', name: '工作时间', type: 'time' },
          { key: 'isActive', name: '是否激活', type: 'boolean' },
        ];
        setFieldTypes(defaultFields);
      }
    } catch (error) {
      console.error('加载字段列表失败:', error);
      message.error('加载字段列表失败');
      // 使用默认字段
      const defaultFields: FieldType[] = [
        { key: 'owner', name: '信息所有人', type: 'string' },
        { key: 'department', name: '部门', type: 'string' },
        { key: 'position', name: '职位', type: 'string' },
        { key: 'age', name: '年龄', type: 'number' },
        { key: 'salary', name: '薪资', type: 'number' },
        { key: 'createTime', name: '创建时间', type: 'datetime' },
        { key: 'birthday', name: '生日', type: 'date' },
        { key: 'workTime', name: '工作时间', type: 'time' },
        { key: 'isActive', name: '是否激活', type: 'boolean' },
      ];
      setFieldTypes(defaultFields);
    }
  };

  // 加载规则配置
  const loadRuleConfig = useCallback(async () => {
    if (!userGroupId) return;
    
    setLoading(true);
    try {
      const response = await apiRequest.getRuleConfig(userGroupId);
      if (response.status === 'success' && response.data) {
        // 转换API数据格式为组件需要的格式
        const data = Array.isArray(response.data) ? response.data : [response.data];
        const convertedGroups: RuleGroup[] = data.map((group: any) => ({
          id: group.id || 0,
          name: `规则组${group.id || 1}`,
          relation: group.operator === 0 ? 'and' : 'or',
          rules: group.ruleList || [],
          userGroupId: group.userGroupId || userGroupId,
          isDel: group.isDel || 0,
          operator: group.operator || 0
        }));
        setRuleGroups(convertedGroups);
      } else {
        // 如果没有数据，初始化一个空的规则组
        setRuleGroups([{
          id: 0,
          name: '规则组1',
          relation: 'and',
          rules: [],
          userGroupId: userGroupId,
          isDel: 0,
          operator: 0
        }]);
      }
    } catch (error) {
      console.error('加载规则配置失败:', error);
      message.error('加载规则配置失败');
      // 初始化一个空的规则组
      setRuleGroups([{
        id: 0,
        name: '规则组1',
        relation: 'and',
        rules: [],
        userGroupId: userGroupId,
        isDel: 0,
        operator: 0
      }]);
    } finally {
      setLoading(false);
    }
  }, [userGroupId]);

  // 组件挂载时加载数据
  useEffect(() => {
    if (visible) {
      loadFieldTypes();
      loadRuleConfig();
    }
  }, [visible, userGroupId, loadRuleConfig]);

  // 获取字段类型
  const getFieldType = (fieldKey: string): string => {
    const field = fieldTypes.find(f => f.key === fieldKey);
    return field?.type || 'string';
  };

  // 获取可用的运算类型
  const getAvailableOperators = (fieldKey: string): OperatorConfig[] => {
    const fieldType = getFieldType(fieldKey);
    
    switch (fieldType) {
      case 'string':
        return operatorConfigs.filter(op => [0, 1, 2, 3, 4, 5, 8, 13].includes(op.value));
      case 'number':
        return operatorConfigs.filter(op => [0, 1, 4, 5, 6, 7].includes(op.value));
      case 'date':
      case 'datetime':
        return operatorConfigs.filter(op => [0, 1, 4, 5, 9, 10].includes(op.value));
      case 'time':
        return operatorConfigs.filter(op => [0, 1, 4, 5, 11, 12].includes(op.value));
      case 'boolean':
        return operatorConfigs.filter(op => [0, 1, 4, 5, 14, 15].includes(op.value));
      default:
        return operatorConfigs;
    }
  };

  // 获取运算类型的值类型
  const getOperatorValueType = (operator: number): string => {
    const config = operatorConfigs.find(op => op.value === operator);
    return config?.valueType || 'string';
  };

  // 添加规则行
  const addRuleLine = (groupId: number) => {
    setRuleGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        const newRule: RuleLine = {
          id: 0,
          field: fieldTypes.length > 0 ? fieldTypes[0].key : '',
          operator: 0,
          value: '',
          ruleGroupId: groupId,
          isDel: 0
        };
        return {
          ...group,
          rules: [...group.rules, newRule]
        };
      }
      return group;
    }));
  };

  // 删除规则行
  const removeRuleLine = (groupId: number, ruleId: number) => {
    setRuleGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          rules: group.rules.filter(rule => rule.id !== ruleId)
        };
      }
      return group;
    }));
  };

  // 添加规则组
  const addRuleGroup = () => {
    const newGroup: RuleGroup = {
      id: 0,
      name: `规则组${ruleGroups.length + 1}`,
      relation: 'and',
      rules: [
        {
          id: 0,
          field: fieldTypes.length > 0 ? fieldTypes[0].key : '',
          operator: 0,
          value: '',
          ruleGroupId: 0,
          isDel: 0
        }
      ],
      userGroupId: userGroupId,
      isDel: 0,
      operator: 0
    };
    setRuleGroups(prev => [...prev, newGroup]);
  };

  // 删除规则组
  const removeRuleGroup = (groupId: number) => {
    setRuleGroups(prev => prev.filter(group => group.id !== groupId));
  };

  // 更新规则值
  const updateRuleValue = (groupId: number, ruleId: number, field: string, value: any) => {
    setRuleGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          rules: group.rules.map(rule => {
            if (rule.id === ruleId) {
              const updatedRule = { ...rule, [field]: value };
              
              // 如果修改了字段或运算类型，重置值
              if (field === 'field' || field === 'operator') {
                updatedRule.value = '';
              }
              
              return updatedRule;
            }
            return rule;
          })
        };
      }
      return group;
    }));
  };

  // 保存规则配置
  const handleSave = async () => {
    if (!userGroupId) {
      message.error('用户组ID不能为空');
      return;
    }

    setLoading(true);
    try {
      // 转换数据格式为API需要的格式
      const apiData = ruleGroups.map(group => ({
        id: group.id,
        isDel: group.isDel || 0,
        operator: group.relation === 'and' ? 0 : 1,
        ruleList: group.rules.map(rule => ({
          createBy: rule.createBy || 0,
          createTime: rule.createTime || '',
          field: rule.field,
          id: rule.id,
          isDel: rule.isDel || 0,
          ruleGroupId: group.id,
          type: rule.type || 0,
          updateBy: rule.updateBy || 0,
          updateTime: rule.updateTime || '',
          value: rule.value
        })),
        userGroupId: userGroupId
      }));

      const response = await apiRequest.setRuleConfig(userGroupId, apiData);
      if (response.status === 'success') {
        message.success('规则配置保存成功');
        onConfirm?.(ruleGroups);
        onClose();
      } else {
        message.error(response.msg || '保存失败');
      }
    } catch (error) {
      console.error('保存规则配置失败:', error);
      message.error('保存规则配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 渲染计算值输入组件
  const renderValueInput = (rule: RuleLine) => {
    const valueType = getOperatorValueType(rule.operator);
    
    switch (valueType) {
      case 'empty':
        return <Input disabled placeholder="无需输入值" />;
      case 'number':
        return (
          <InputNumber
            value={rule.value ? Number(rule.value) : undefined}
            onChange={(value) => updateRuleValue(rule.ruleGroupId || 0, rule.id, 'value', value?.toString() || '')}
            placeholder="请输入数字"
            style={{ width: '100%' }}
          />
        );
      case 'date':
        return (
          <DatePicker
            value={rule.value ? moment(rule.value, 'YYYY-MM-DD') : null}
            onChange={(date) => updateRuleValue(rule.ruleGroupId || 0, rule.id, 'value', date?.format('YYYY-MM-DD') || '')}
            placeholder="请选择日期"
            style={{ width: '100%' }}
          />
        );
      case 'datetime':
        return (
          <DatePicker
            showTime
            value={rule.value ? moment(rule.value, 'YYYY-MM-DD HH:mm:ss') : null}
            onChange={(date) => updateRuleValue(rule.ruleGroupId || 0, rule.id, 'value', date?.format('YYYY-MM-DD HH:mm:ss') || '')}
            placeholder="请选择日期时间"
            style={{ width: '100%' }}
          />
        );
      case 'time':
        return (
          <DatePicker
            picker="time"
            value={rule.value ? moment(rule.value, 'HH:mm:ss') : null}
            onChange={(date) => updateRuleValue(rule.ruleGroupId || 0, rule.id, 'value', date?.format('HH:mm:ss') || '')}
            placeholder="请选择时间"
            style={{ width: '100%' }}
          />
        );
      case 'boolean':
        return (
          <Select
            value={rule.value}
            onChange={(value) => updateRuleValue(rule.ruleGroupId || 0, rule.id, 'value', value)}
            placeholder="请选择"
            style={{ width: '100%' }}
          >
            <Option value="true">是</Option>
            <Option value="false">否</Option>
          </Select>
        );
      default:
        return (
          <Input
            value={rule.value}
            onChange={(e) => updateRuleValue(rule.ruleGroupId || 0, rule.id, 'value', e.target.value)}
            placeholder="请输入值"
          />
        );
    }
  };

  return (
    <Drawer
      title="配置规则组"
      placement="right"
      width={1000}
      open={visible}
      onClose={onClose}
      extra={
        <Space>
          <Button size="middle" onClick={onClose}>取消</Button>
          <Button size="middle" type="primary" loading={loading} onClick={handleSave}>确认</Button>
        </Space>
      }
    >
      <Spin spinning={loading}>
        <div style={{ padding: '20px 0' }}>
          {ruleGroups.map((group, _groupIndex) => (
          <Card
            key={group.id}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span>{group.name}</span>
                <Select
                  value={group.relation}
                  style={{ width: 80 }}
                  onChange={(value) => {
                    setRuleGroups(prev => prev.map(g => g.id === group.id ? { ...g, relation: value } : g));
                  }}
                >
                  <Option value="and">且</Option>
                  <Option value="or">或</Option>
                </Select>
              </div>
            }
            style={{ marginBottom: '20px' }}
            extra={
              <Space>
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={() => addRuleLine(group.id)}
                />
                <Button
                  type="text"
                  danger
                  icon={<MinusOutlined />}
                  onClick={() => removeRuleGroup(group.id)}
                />
              </Space>
            }
          >
            {group.rules.map((rule, _ruleIndex) => (
              <Row key={rule.id} gutter={8} style={{ marginBottom: '12px', alignItems: 'center' }}>
                <Col span={5}>
                  <Select
                    value={rule.field}
                    style={{ width: '100%' }}
                    onChange={(value) => updateRuleValue(group.id, rule.id, 'field', value)}
                  >
                    {fieldTypes.map(field => (
                      <Option key={field.key} value={field.key}>{field.name}</Option>
                    ))}
                  </Select>
                </Col>
                <Col span={4}>
                  <Select
                    value={rule.operator}
                    style={{ width: '100%' }}
                    onChange={(value) => updateRuleValue(group.id, rule.id, 'operator', value)}
                  >
                    {getAvailableOperators(rule.field).map(op => (
                      <Option key={op.value} value={op.value}>{op.name}</Option>
                    ))}
                  </Select>
                </Col>
                <Col span={6}>
                  {renderValueInput(rule)}
                </Col>
                <Col span={2}>
                  <Space>
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={() => addRuleLine(group.id)}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<MinusOutlined />}
                      onClick={() => removeRuleLine(group.id, rule.id)}
                    />
                  </Space>
                </Col>
              </Row>
            ))}
          </Card>
        ))}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addRuleGroup}
            style={{ width: '200px' }}
          >
            添加规则组
          </Button>
        </div>
        </div>
      </Spin>
    </Drawer>
  );
};

export default RuleConfigDrawer;
