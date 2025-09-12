/**
 * 配置规则右侧弹窗组件
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Drawer, Button, Select, Input, Space, Card, Row, Col, DatePicker, InputNumber, message, Spin, TreeSelect } from 'antd';
import { PlusOutlined, PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import apiRequest from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import './RuleConfigDrawer.less';

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
  operator?: number;
  value: string;
  ruleGroupId?: number;
  uid: string; // 本地唯一键，避免同 id 规则联动
  // 删除多余元信息字段
  type?: number;
}

// 规则组
interface RuleGroup {
  id: number;
  name: string;
  relation: 'and' | 'or';
  rules: RuleLine[];
  userGroupId?: number;
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
  const loadFieldTypes = async (isMounted: boolean = true) => {
    try {
      const response = await apiRequest.getRuleFields();
      if (!isMounted) return; // 组件已卸载，不更新状态
      
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
          // { key: 'createTime', name: '创建时间', type: 'datetime' },
          { key: 'birthday', name: '生日', type: 'date' },
          { key: 'workTime', name: '工作时间', type: 'time' },
          { key: 'isActive', name: '是否激活', type: 'boolean' },
        ];
        setFieldTypes(defaultFields);
      }
    } catch (error) {
      if (!isMounted) return; // 组件已卸载，不更新状态
      
      // console suppressed
      message.error('加载字段列表失败');
      // 使用默认字段
      const defaultFields: FieldType[] = [
        { key: 'owner', name: '信息所有人', type: 'string' },
        { key: 'department', name: '部门', type: 'string' },
        { key: 'position', name: '职位', type: 'string' },
        { key: 'age', name: '年龄', type: 'number' },
        { key: 'salary', name: '薪资', type: 'number' },
        // { key: 'createTime', name: '创建时间', type: 'datetime' },
        { key: 'birthday', name: '生日', type: 'date' },
        { key: 'workTime', name: '工作时间', type: 'time' },
        { key: 'isActive', name: '是否激活', type: 'boolean' },
      ];
      setFieldTypes(defaultFields);
    }
  };

  // 加载规则配置
  const loadRuleConfig = useCallback(async (isMounted: boolean = true) => {
    if (!userGroupId) return;
    
    setLoading(true);
    try {
      const response = await apiRequest.getRuleConfig(userGroupId);
      if (!isMounted) return; // 组件已卸载，不更新状态
      
      if (response.status === 'success' && response.data) {
        // 转换API数据格式为组件需要的格式
        const data = Array.isArray(response.data) ? response.data : [response.data];
        const convertedGroups: RuleGroup[] = data.map((group: any, gi: number) => ({
          id: group.id || 0,
          name: `规则组${group.id || 1}`,
          relation: group.operator === 0 ? 'and' : 'or',
          rules: (group.ruleList || []).map((r: any, ri: number) => ({
            ...r,
            uid: `${gi}-${ri}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
          })),
          userGroupId: group.userGroupId || userGroupId,
          // 移除 isDel
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
          // 移除 isDel
          operator: 0
        }]);
      }
    } catch (error) {
      if (!isMounted) return; // 组件已卸载，不更新状态
      
      // console suppressed
      message.error('加载规则配置失败');
      // 初始化一个空的规则组
      setRuleGroups([{
        id: 0,
        name: '规则组1',
        relation: 'and',
        rules: [],
        userGroupId: userGroupId,
        // 移除 isDel
        operator: 0
      }]);
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [userGroupId]);

  // 组件挂载时加载数据
  useEffect(() => {
    let isMounted = true;
    
    if (visible) {
      const loadData = async () => {
        try {
          await loadFieldTypes(isMounted);
          if (isMounted) {
            await loadRuleConfig(isMounted);
          }
        } catch (error) {
          if (isMounted) {
            console.error('加载数据失败:', error);
          }
        }
      };
      
      loadData();
    }
    
    return () => {
      isMounted = false;
    };
  }, [visible, userGroupId, loadRuleConfig]);

  // 获取字段类型
  const getFieldType = (fieldKey: string): string => {
    const field = fieldTypes.find(f => f.key === fieldKey);
    return field?.type || 'string';
  };

  // 获取可用的运算类型（优先使用后端约定/图片规则）
  const getAvailableOperators = (fieldKey: string): OperatorConfig[] => {
    // 已知映射（严格按后端/图片提供）
    const strictMap: Record<string, number[]> = {
      consultationTime: [4, 5, 9, 10, 11, 12],
      project: [4, 5, 13],
      studentSource: [4, 5, 13],
      provider: [4, 5, 13],
      isLive: [4, 5, 14, 15],
      owner: [4, 5, 13],
      intentionLevel: [4, 5, 13],
    };
    const matched = strictMap[fieldKey];
    if (matched) return operatorConfigs.filter(op => matched.includes(op.value));

    // 兜底：按字段类型
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
  const getOperatorValueType = (operator?: number): string => {
    if (operator == null) return 'empty';
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
          type: undefined,
          value: '',
          ruleGroupId: groupId,
          uid: `${groupId}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
        };
        return {
          ...group,
          rules: [...group.rules, newRule]
        };
      }
      return group; // 返回未修改的组
    }));
  };

  // 删除规则行
  const removeRuleLine = (groupId: number, ruleUid: string) => {
    setRuleGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          rules: group.rules.filter(rule => rule.uid !== ruleUid)
        };
      }
      return group; // 返回未修改的组
    }));
  };

  // 添加规则组
  const addRuleGroup = () => {
    const newGroupId = Date.now(); // 生成唯一ID
    const newGroup: RuleGroup = {
      id: newGroupId,
      name: `规则组${ruleGroups.length + 1}`,
      relation: 'and',
      rules: [
        {
          id: 0,
          field: fieldTypes.length > 0 ? fieldTypes[0].key : '',
          type: undefined,
          value: '',
          ruleGroupId: newGroupId,
          uid: `${newGroupId}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
        }
      ],
      userGroupId: userGroupId,
      // 移除 isDel
      operator: 0
    };
    setRuleGroups(prev => [...prev, newGroup]);
  };

  // 删除规则组
  const removeRuleGroup = (groupId: number) => {
    setRuleGroups(prev => prev.filter(group => group.id !== groupId));
  };

  // 更新规则值
  const updateRuleValue = (groupId: number, ruleUid: string, field: string, value: any) => {
    setRuleGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          rules: group.rules.map(rule => {
            if (rule.uid === ruleUid) {
              const updatedRule = { ...rule, [field]: value };
              // 如果修改了字段：置空运算类型与值
              if (field === 'field') {
                (updatedRule as any).type = undefined;
                updatedRule.value = '';
              }
              // 如果修改了运算类型：置空值
              if (field === 'type') {
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
      // 转换为后端期望的数组：每个组需要有顺序 id(从1开始)、operator、ruleList
      const apiData = ruleGroups.map((group) => ({
        userGroupId: userGroupId,
        operator: group.relation === 'and' ? 0 : 1,
        ruleList: group.rules.map((rule) => ({
          userGroupId: userGroupId,
          field: rule.field,
          type: rule.type,
          value: rule.value
        }))
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
      // console suppressed
      message.error('保存规则配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 扁平化项目字典为叶子选项
  const getProjectLeafOptions = (): { label: string; value: string }[] => {
    const cascade = Dictionaries.getCascader('dict_reg_job') || [];
    const res: { label: string; value: string }[] = [];
    const walk = (nodes: any[]) => {
      nodes.forEach((n) => {
        if (n.children && n.children.length) {
          walk(n.children);
        } else {
          res.push({ label: n.label, value: n.value });
        }
      });
    };
    walk(cascade);
    return res;
  };

  // 扁平化人员为下拉选项
  const getUserOptions = (): { label: string; value: string | number }[] => {
    const dep = JSON.parse(localStorage.getItem('Department') as any) || [];
    const out: any[] = [];
    const walk = (nodes: any[]) => {
      nodes.forEach((n) => {
        if (n.userId && n.enable !== false) out.push({ label: n.name, value: n.userId });
        if (n.children && n.children.length) walk(n.children);
      });
    };
    walk(dep);
    return out;
  };

  // 获取人员树数据
  const getUserTreeData = (): any[] => {
    const dep = JSON.parse(localStorage.getItem('Department') as any) || [];
    const convertToTreeData = (nodes: any[]): any[] => {
      return nodes.map((node) => {
        const treeNode: any = {
          title: node.name,
          value: `dept_${node.id}`, // 部门节点使用dept_前缀
          key: `dept_${node.id}`,
          children: [],
        };
        
        // 如果有用户，添加用户节点
        if (node.userId && node.enable !== false) {
          treeNode.children.push({
            title: node.name,
            value: `user_${node.userId}`, // 用户节点使用user_前缀
            key: `user_${node.userId}`,
            isLeaf: true,
          });
        }
        
        // 如果有子部门，递归处理
        if (node.children && node.children.length > 0) {
          const childNodes = convertToTreeData(node.children);
          treeNode.children.push(...childNodes);
        }
        
        // 如果部门下没有用户和子部门，则不显示该部门
        if (treeNode.children.length === 0) {
          return null;
        }
        
        return treeNode;
      }).filter(Boolean); // 过滤掉null值
    };
    
    return convertToTreeData(dep);
  };

  // 获取列表型选项（运算类型13用）
  const getListOptionsByField = (fieldKey: string): { label: string; value: string | number }[] => {
    if (fieldKey === 'project') return getProjectLeafOptions();
    if (fieldKey === 'studentSource') return (Dictionaries.getList('dict_source') || []) as any;
    if (fieldKey === 'intentionLevel') return (Dictionaries.getList('dict_intention_level') || []) as any;
    if (fieldKey === 'provider' || fieldKey === 'owner') return getUserOptions();
    return [];
  };

  // 渲染计算值输入组件
  const renderValueInput = (rule: RuleLine) => {
    const valueType = getOperatorValueType(rule.type);
    const fieldKey = rule.field;

    switch (valueType) {
      case 'empty':
        return <Input disabled placeholder="无需输入值" />;
      case 'number':
        return (
          <InputNumber
            value={rule.value ? Number(rule.value) : undefined}
            onChange={(value) => updateRuleValue(rule.ruleGroupId || 0, rule.uid, 'value', value?.toString() || '')}
            placeholder="请输入数字"
            style={{ width: '100%' }}
          />
        );
      case 'date':
        // 规范：日期型统一使用 yyyy-MM-dd HH:mm:ss（按你要求，9/10 用日期时间，11/12 用时间）
        return (
          <DatePicker
            showTime
            value={rule.value ? moment(rule.value, 'YYYY-MM-DD HH:mm:ss') : null}
            onChange={(date) => updateRuleValue(rule.ruleGroupId || 0, rule.uid, 'value', date?.format('YYYY-MM-DD HH:mm:ss') || '')}
            placeholder="请选择日期时间"
            style={{ width: '100%' }}
          />
        );
      case 'datetime':
        return (
          <DatePicker
            showTime
            value={rule.value ? moment(rule.value, 'YYYY-MM-DD HH:mm:ss') : null}
            onChange={(date) => updateRuleValue(rule.ruleGroupId || 0, rule.uid, 'value', date?.format('YYYY-MM-DD HH:mm:ss') || '')}
            placeholder="请选择日期时间"
            style={{ width: '100%' }}
          />
        );
      case 'time':
        return (
          <DatePicker
            picker="time"
            value={rule.value ? moment(rule.value, 'HH:mm:ss') : null}
            onChange={(date) => updateRuleValue(rule.ruleGroupId || 0, rule.uid, 'value', date?.format('HH:mm:ss') || '')}
            placeholder="请选择时间"
            style={{ width: '100%' }}
          />
        );
      case 'boolean':
        return (
          <Select
            value={rule.value}
            onChange={(value) => updateRuleValue(rule.ruleGroupId || 0, rule.uid, 'value', value)}
            placeholder="请选择"
            style={{ width: '100%' }}
          >
            <Option value="14">是</Option>
            <Option value="15">否</Option>
          </Select>
        );
      // 列表选择（在列表 13）
      case 'string':
        if (rule.type === 13) {
          const options = getListOptionsByField(fieldKey);
          const valueArr = (rule.value ? String(rule.value).split(',') : []) as any[];
          // 对人员字段采用树形选择
          if (fieldKey === 'provider' || fieldKey === 'owner') {
            // 将存储的用户ID转换为带前缀的格式用于显示
            const displayValues = valueArr.map((id: any) => `user_${id}`);
            
            return (
              <TreeSelect
                multiple
                allowClear
                showSearch
                treeCheckable
                treeDefaultExpandAll
                value={displayValues}
                onChange={(values: any[]) => {
                  // 只提取用户ID（过滤掉部门ID）
                  const userIds = values
                    .filter((val: string) => val.startsWith('user_'))
                    .map((val: string) => val.replace('user_', ''));
                  updateRuleValue(rule.ruleGroupId || 0, rule.uid, 'value', userIds.join(','));
                }}
                treeData={getUserTreeData()}
                placeholder="请选择人员"
                style={{ width: '100%' }}
                treeNodeFilterProp="title"
                maxTagCount="responsive"
                treeCheckStrictly={false}
              />
            );
          }
          return (
            <Select
              mode="multiple"
              allowClear
              value={valueArr}
              onChange={(vals: any[]) => updateRuleValue(rule.ruleGroupId || 0, rule.uid, 'value', vals.join(','))}
              options={options}
              placeholder="请选择"
              style={{ width: '100%' }}
            />
          );
        }
        // 默认字符串输入
        return (
          <Input
            value={rule.value}
            onChange={(e) => updateRuleValue(rule.ruleGroupId || 0, rule.uid, 'value', e.target.value)}
            placeholder="请输入值"
          />
        );
      default:
        return (
          <Input
            value={rule.value}
            onChange={(e) => updateRuleValue(rule.ruleGroupId || 0, rule.uid, 'value', e.target.value)}
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
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{`规则组${_groupIndex + 1}`}</span>
                <span style={{ fontSize: '13px', color: '#333' }}>组内关系：</span>
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
                  key={`add-rule-${group.id}`}
                  type="text"
                  icon={<PlusCircleOutlined />}
                  onClick={() => addRuleLine(group.id)}
                />
                <Button
                  key={`remove-group-${group.id}`}
                  type="text"
                  danger
                  icon={<MinusCircleOutlined />}
                  onClick={() => removeRuleGroup(group.id)}
                />
              </Space>
            }
          >
            {group.rules.map((rule, _ruleIndex) => (
              <Row key={rule.uid} gutter={8} style={{ marginBottom: '12px', alignItems: 'center' }}>
                <Col span={5}>
                  <Select
                    value={rule.field}
                    style={{ width: '100%' }}
                    onChange={(value) => updateRuleValue(group.id, rule.uid, 'field', value)}
                  >
                    {fieldTypes.map(field => (
                      <Option key={field.key} value={field.key}>{field.name}</Option>
                    ))}
                  </Select>
                </Col>
                <Col span={4}>
                  <Select
                    value={rule.type}
                    style={{ width: '100%' }}
                    onChange={(value) => updateRuleValue(group.id, rule.uid, 'type', value)}
                    placeholder="请选择运算类型"
                  >
                    {getAvailableOperators(rule.field).map(op => (
                      <Option key={op.value} value={op.value}>{op.name}</Option>
                    ))}
                  </Select>
                </Col>
                <Col span={8}>
                  {renderValueInput(rule)}
                </Col>
                <Col span={3}>
                  <Space>
                    <Button
                      key={`add-rule-${group.id}-${rule.uid}`}
                      type="text"
                      icon={<PlusCircleOutlined />}
                      onClick={() => addRuleLine(group.id)}
                    />
                    <Button
                      key={`remove-rule-${group.id}-${rule.uid}`}
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => removeRuleLine(group.id, rule.uid)}
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
