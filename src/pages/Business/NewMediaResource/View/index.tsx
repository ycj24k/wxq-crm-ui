import { useRef, useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { type ActionType, type ProColumns } from '@ant-design/pro-table';
import { Button, Space, Tag, Modal, Form, Input, Select, DatePicker, message, Radio, Cascader, TreeSelect, Tooltip } from 'antd';
import Dictionaries from '@/services/util/dictionaries';
import type { ProFormInstance } from '@ant-design/pro-form';
import moment from 'moment';
// 参考资源小组使用方式，统一使用 apiRequest
import apiRequest from '@/services/ant-design-pro/apiRequest';
import { useModel } from 'umi';

type StudentItem = {
  id: number;
  name: string; // 学员姓名
  type: number; // 学员类型 0个人 1企业
  education: number; // 学历
  mobile: string; // 联系电话
  idCard: string; // 身份证号
  weChat: string; // 微信
  qq: string; // QQ
  sex: boolean; // 性别 0男 1女
  project: string; // 报考岗位
  source: number; // 客户来源
  consultationTime: string; // 咨询时间
  intentionLevel?: number; // 意向等级 0普通 1高意向
  provider: number; // 信息提供人
  owner: number; // 信息所有人
  ownerName?: string; // 信息所有人姓名（后端直给）
  address: string; // 地址
  description: string; // 备注
  userId: number; // 招生老师
  createTime: string; // 创建时间
  isDel: number; // 是否删除
  isFormal: boolean; // 是否正式
  isInBlacklist: boolean; // 是否进入黑名单
  isInWhitelist: boolean; // 是否进入白名单
  isLive: boolean; // 是否为出镜人专属资源
  isLocked: boolean; // 是否已锁定
  isPeer: boolean; // 是否同行
  levelWeight: number; // 客户等级权重
  chargePersonName?: string; // 企业负责人姓名
  code?: string; // 统一社会信用码
  codeFile?: string; // 统一社会信用码电子版
  providerName?: string; // 信息提供人姓名（后端直给）
};

type ExpandField = {
  field: string;
  name: string;
  operationType: string;
};

export default () => {
  const actionRef = useRef<ActionType>();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<StudentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandFields, setExpandFields] = useState<ExpandField[]>([]);
  const [batchVisible, setBatchVisible] = useState(false);
  const [batchForm] = Form.useForm();
  const { initialState } = useModel('@@initialState');
  const safeGetPopupContainer = (trigger: any) => (trigger && (trigger.parentNode as HTMLElement)) || document.body;
  const typeWatch = Form.useWatch('type', form);

  // 学员类型切换时，清理不需要的企业字段
  useEffect(() => {
    if (typeWatch !== 1) {
      form.setFieldsValue({ chargePersonName: undefined, code: undefined, codeFile: undefined });
    }
  }, [typeWatch]);

  // 统一安全获取字典 options，过滤掉无效值，防止 Select 内部 children 生成 undefined key
  const getDictOptions = (dictKey: string) => {
    const list = (Dictionaries.getList(dictKey) as any) || [];
    const seen: Record<string, boolean> = {};
    return list
      .filter((it: any) => it && it.value !== undefined && it.value !== null && it.label !== undefined)
      .map((it: any) => {
        const valueStr = String(it.value);
        return { label: it.label, value: it.value, key: `dict_${dictKey}_${valueStr}` };
      })
      .filter((it: any) => {
        const k = String(it.value);
        if (seen[k]) return false;
        seen[k] = true;
        return true;
      });
  };

  // 按字典选项的值类型，将原始值规范为一致类型，避免编辑回显因类型不一致导致不显示
  const normalizeDictValue = (dictKey: string, raw: any): any => {
    const opts: any[] = getDictOptions(dictKey) as any[];
    if (!opts || opts.length === 0) return raw;
    const sample = opts[0];
    const sampleType = typeof sample?.value;
    if (raw === undefined || raw === null) return undefined;
    if (sampleType === 'number') {
      const n = Number(raw);
      return Number.isFinite(n) ? n : undefined;
    }
    if (sampleType === 'string') {
      return String(raw);
    }
    return raw;
  };

  // 安全获取级联选择器数据，过滤掉 null 值
  const getSafeCascaderOptions = (dictKey: string) => {
    const options = (Dictionaries.getCascader(dictKey) as any) || [];
    
    const cleanOptions = (nodes: any[]): any[] => {
      return nodes
        .filter((node: any) => node && node.value !== null && node.value !== undefined && node.label !== undefined)
        .map((node: any) => ({
          ...node,
          children: node.children ? cleanOptions(node.children) : undefined,
        }))
        .filter((node: any) => node.children === undefined || node.children.length > 0);
    };
    
    return cleanOptions(options);
  };

  // 人员树（部门/用户），与潜在学员一致数据源：localStorage Department 或后续统一 API
  const getUserTreeData = (): any[] => {
    const dep = (JSON.parse(localStorage.getItem('Department') as any) || []) as any[];
    const convert = (nodes: any[]): any[] => {
      const result: any[] = [];
      nodes.forEach((node: any) => {
        if (node.departmentName) {
          const deptNode: any = {
            title: node.departmentName,
            value: `dept_${node.id}`,
            key: `dept_${node.id}`,
            children: [],
          };
          if (node.userId && node.enable !== false) {
            deptNode.children.push({
              title: node.name,
              value: `user_${node.userId}`,
              key: `user_${node.userId}`,
              isLeaf: true,
            });
          }
          if (node.children && node.children.length) {
            deptNode.children.push(...convert(node.children));
          }
          if (deptNode.children.length) result.push(deptNode);
        } else {
          if (node.userId && node.enable !== false) {
            result.push({ title: node.name, value: `user_${node.userId}`, key: `user_${node.userId}`, isLeaf: true });
          }
          if (node.children && node.children.length) result.push(...convert(node.children));
        }
      });
      return result;
    };
    return convert(dep);
  };

  // 获取拓展字段配置
  const fetchExpandFields = async () => {
    try {
      const response = await apiRequest.post('/sms/lead/ladRule/getExpandField');
      if (response.status === 'success' && response.data) {
        setExpandFields(response.data);
      }
    } catch (error) {
      console.error('获取拓展字段失败:', error);
    }
  };

  // 组件加载时获取拓展字段
  useEffect(() => {
    fetchExpandFields();
  }, []);

  // 根据 userId 获取姓名（从 Department 树中解析），做简单缓存
  const userNameCache: Record<string, string> = {};
  const getUserNameById = (id?: number) => {
    if (!id && id !== 0) return '';
    const key = String(id);
    if (userNameCache[key]) return userNameCache[key];
    const walk = (nodes: any[]): string | undefined => {
      for (const n of nodes) {
        if (n.userId === id) return n.name;
        if (n.children) {
          const r = walk(n.children);
          if (r) return r;
        }
      }
      return undefined;
    };
    const dep = (JSON.parse(localStorage.getItem('Department') as any) || []) as any[];
    const name = walk(dep) || '';
    userNameCache[key] = name;
    return name;
  };
  // （批量导入已不再需要按用户名匹配ID，保留名称解析在其他处使用时再补充）

  // （批量导入已不再需要客户来源匹配，保留字典解析在其他处使用时再补充）

  // 通过级联（dict_reg_job）获取叶子值；
  // 支持：
  // 1) 直接传 value（若能命中任一节点 value，返回该值；如是父级则取其第一个叶子）
  // 2) 传“父/子/叶”路径（逐级按 label 精确/包含匹配，末级若为父级则取其第一个叶子）
  // 3) 仅传某一级 label（优先匹配叶子；若命中父级则取其第一个叶子）
  const getRegJobLeafValueByLabelPath = (labelOrPathOrValue: string) => {
    if (!labelOrPathOrValue) return undefined;
    const normalize = (s: string) => String(s || '').replace(/\s+/g, '').trim();
    const inputRaw = String(labelOrPathOrValue);
    const input = normalize(inputRaw);
    const tree = getSafeCascaderOptions('dict_reg_job');

    // 工具：取某节点的第一个叶子 value
    const firstLeafValue = (node: any): any => {
      if (!node) return undefined;
      if (!node.children || node.children.length === 0) return node.value;
      for (const c of node.children) {
        const leaf = firstLeafValue(c);
        if (leaf !== undefined) return leaf;
      }
      return undefined;
    };

    // 遍历任意节点 by predicate
    const findNode = (nodes: any[], pred: (n: any) => boolean): any => {
      for (const n of nodes) {
        if (pred(n)) return n;
        if (n.children && n.children.length) {
          const r = findNode(n.children, pred);
          if (r) return r;
        }
      }
      return undefined;
    };

    // 0) 若传入的是存在的 value，直接定位该节点；若为父级则取其第一个叶子
    const byValue = findNode(tree, (n) => String(n.value) === inputRaw);
    if (byValue) return firstLeafValue(byValue);

    // 1) 路径匹配：逐级按 label 精确→包含 匹配
    const parts = inputRaw.split('/').map((p) => normalize(p)).filter(Boolean);
    if (parts.length > 1) {
      const walkPath = (nodes: any[], idx: number): any => {
        if (idx >= parts.length) return undefined;
        const part = parts[idx];
        // 先精确，再包含
        const pick = (arr: any[]) =>
          findNode(arr, (n) => normalize(n.label) === part) || findNode(arr, (n) => normalize(n.label).includes(part));
        const node = pick(nodes);
        if (!node) return undefined;
        if (idx === parts.length - 1) return firstLeafValue(node);
        return walkPath(node.children || [], idx + 1);
      };
      const val = walkPath(tree, 0);
      if (val !== undefined) return val;
    }

    // 2) 单 label：优先精确命中叶子；否则命中父级则取第一个叶子；再尝试包含匹配
    const exactLeaf = findNode(tree, (n) => normalize(n.label) === input && (!n.children || n.children.length === 0));
    if (exactLeaf) return exactLeaf.value;
    const exactAny = findNode(tree, (n) => normalize(n.label) === input);
    if (exactAny) return firstLeafValue(exactAny);
    const incLeaf = findNode(
      tree,
      (n) => normalize(n.label).includes(input) && (!n.children || n.children.length === 0)
    );
    if (incLeaf) return incLeaf.value;
    const incAny = findNode(tree, (n) => normalize(n.label).includes(input));
    if (incAny) return firstLeafValue(incAny);

    return undefined;
  };

  // 意向等级名称转数值
  const parseIntentionLevel = (text: string) => {
    const s = String(text).trim();
    if (/^-?\d+$/.test(s)) return Number(s);
    if (s === '高意向') return 1;
    if (s === '普通' || s === '一般') return 0;
    return 0;
  };
  const searchFormRef = useRef<ProFormInstance>();

  const columns: ProColumns<StudentItem>[] = [
    // 顶部查询表单
    { title: '学员姓名', dataIndex: 'name', hideInTable: true, fieldProps: { placeholder: '请输入学员姓名' } },
    { title: '联系电话', dataIndex: 'mobile', hideInTable: true, fieldProps: { placeholder: '请输入联系电话' } },
    {
      key: 'search-wechat',
      title: '微信',
      dataIndex: 'weChat',
      hideInTable: true,
      fieldProps: { placeholder: '请输入微信' },
    },
    { key: 'search-qq', title: 'QQ', dataIndex: 'qq', hideInTable: true, fieldProps: { placeholder: '请输入QQ' } },
    {
      key: 'search-idcard',
      title: '身份证号',
      dataIndex: 'idCard',
      hideInTable: true,
      fieldProps: { placeholder: '请输入身份证号' },
    },
    {
      key: 'search-type',
      title: '学员类型',
      dataIndex: 'type',
      hideInTable: true,
      renderFormItem: () => <Select allowClear options={getDictOptions('studentType')} placeholder="请选择学员类型" />,
    },
    {
      key: 'search-source',
      title: '客户来源',
      dataIndex: 'source',
      hideInTable: true,
      renderFormItem: () => <Select allowClear options={getDictOptions('dict_source')} placeholder="请选择客户来源" />,
    },
    {
      key: 'search-intention',
      title: '意向等级',
      dataIndex: 'intentionLevel',
      hideInTable: true,
      renderFormItem: () => (
        <Select allowClear options={getDictOptions('clue_intention_level')} placeholder="请选择意向等级" />
      ),
    },
    { title: '创建时间', dataIndex: 'createTimeRange', valueType: 'dateTimeRange', hideInTable: true },

    // 表格列
    {
      key: 'col-name',
      title: '学员姓名',
      dataIndex: 'name',
      ellipsis: true,
      render: (_, r) => <a>{r.name}</a>,
      width: 100,
      fixed: 'left',
    },
    {
      key: 'col-type',
      title: '学员类型',
      dataIndex: 'type',
      width: 80,
      render: (_, r) => Dictionaries.getName('studentType', r.type),
    },
    { key: 'col-mobile', title: '联系电话', dataIndex: 'mobile', width: 120 },
    { key: 'col-wechat', title: '微信', dataIndex: 'weChat', width: 100 },
    { key: 'col-qq', title: 'QQ', dataIndex: 'qq', width: 100 },
    { key: 'col-sex', title: '性别', dataIndex: 'sex', width: 60, render: (_, r) => (r.sex ? '女' : '男') },
    {
      key: 'col-project',
      title: '报考岗位',
      dataIndex: 'project',
      width: 120,
      ellipsis: true,
      render: (_, r) => {
        const name = (Dictionaries.getCascaderAllName('dict_reg_job', r.project) as any) || '';
        const text = name || r.project || '';
        return (
          <Tooltip title={text} placement="topLeft">
            <span>{text}</span>
          </Tooltip>
        );
      },
    },
    {
      key: 'col-source',
      title: '客户来源',
      dataIndex: 'source',
      width: 100,
      render: (_, r) => {
        const sourceValue = (r as any).source;
        // 后台返回数字，字典值是字符串，需要转换为字符串
        const sourceName = Dictionaries.getName('dict_source', String(sourceValue));
        return <span key={`source-${r.id}`}>{sourceName || sourceValue || '--'}</span>;
      },
    },
    {
      key: 'col-consultationTime',
      title: '咨询时间',
      dataIndex: 'consultationTime',
      valueType: 'dateTime',
      width: 150,
    },
    {
      key: 'col-intention',
      title: '意向等级',
      dataIndex: 'intentionLevel',
      width: 80,
      render: (_, r) => (
        <Tag key={`intention-${r.id}`} color={r.intentionLevel === 1 ? 'red' : 'default'}>
          {r.intentionLevel === 1 ? '高意向' : '普通'}
        </Tag>
      ),
    },
    {
      key: 'col-isLive',
      title: '出镜人专属',
      dataIndex: 'isLive',
      width: 100,
      render: (_, r) => (
        <Tag key={`isLive-${r.id}`} color={Boolean(r.isLive) ? 'blue' : 'default'}>
          {Boolean(r.isLive) ? '是' : '否'}
        </Tag>
      ),
    },
    {
      key: 'col-provider',
      title: '信息提供人',
      dataIndex: 'provider',
      width: 120,
      render: (_, r) => (
        <span key={`provider-${r.id}`}>{(r as any).providerName}</span>
      ),
    },
    {
      key: 'col-owner',
      title: '信息所有人',
      dataIndex: 'owner',
      width: 120,
      render: (_, r) => (
        <span key={`owner-${r.id}`}>{(r as any).ownerName}</span>
      ),
    },
    { key: 'col-address', title: '地址', dataIndex: 'address', width: 120, ellipsis: true },
    { key: 'col-createTime', title: '创建时间', dataIndex: 'createTime', valueType: 'dateTime', width: 150 },
    {
      key: 'col-actions',
      title: '操作',
      valueType: 'option',
      width: 80,
      fixed: 'right',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
        setEditing(record);
            // 解析拓展字段数据
            let leadExpandFieldData = {};
            if ((record as any).leadExpandField) {
              try {
                leadExpandFieldData = JSON.parse((record as any).leadExpandField);
              } catch (error) {
                console.error('解析拓展字段数据失败:', error);
              }
            }

            // 构建表单值，清理 undefined
            const formValues: any = {
          name: record.name,
              // 学员类型/客户来源根据字典选项值类型做动态规范，确保回显
              type: normalizeDictValue('studentType', (record as any).type),
              education: normalizeDictValue('dict_education', record.education),
          mobile: record.mobile,
          idCard: record.idCard,
          weChat: record.weChat,
          qq: record.qq,
              sex: typeof record.sex === 'boolean' ? record.sex : record.sex === 1,
              // 报考岗位为级联路径
              project: record.project
                ? (Dictionaries.getCascaderValue('dict_reg_job', record.project) as any)
                : undefined,
              // 后台返回数字，字典值是字符串，需要转换为字符串
              source: String((record as any).source),
          consultationTime: moment(record.consultationTime),
              intentionLevel: (record as any).intentionLevel ?? 0,
              isLive: Boolean(record.isLive),
              // 人员树使用 user_ 前缀
              provider:
                record.provider !== undefined && record.provider !== null ? `user_${record.provider}` : undefined,
              owner: record.owner !== undefined && record.owner !== null ? `user_${record.owner}` : undefined,
          address: record.address,
          description: record.description,
              // 企业/代理人相关
              chargePersonName: (record as any).chargePersonName,
              code: (record as any).code,
              codeFile: (record as any).codeFile,
              // 设置拓展字段数据
              leadExpandField: leadExpandFieldData,
            };

            // 清理 undefined 值
            const cleanFormValues: any = {};
            Object.keys(formValues).forEach(key => {
              const value = formValues[key];
              if (value !== undefined) {
                cleanFormValues[key] = value;
              }
            });

            form.setFieldsValue(cleanFormValues);
        setVisible(true);
          }}
        >
          编辑
        </a>,
      ],
    },
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
            <Button
              key="create"
              type="primary"
              onClick={() => {
                setEditing(null);
                form.resetFields();
                // 新增时信息提供人默认为当前用户
                form.setFieldsValue({
                  provider: initialState?.currentUser?.userid
                });
                setVisible(true);
              }}
            >
              新建
            </Button>
            <Button
              key="batch"
              onClick={() => {
                setBatchVisible(true);
                batchForm.resetFields();
              }}
            >
              批量导入
            </Button>
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
            return { data: [], success: false, total: 0 };
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
        centered
        maskClosable={false}
        onOk={async () => {
          try {
            setSubmitting(true);
            const values = await form.validateFields();
            // 处理拓展字段数据
            const leadExpandFieldData: Record<string, any> = {};
            if (values.leadExpandField) {
              Object.keys(values.leadExpandField).forEach(fieldKey => {
                const fieldValue = values.leadExpandField[fieldKey];
                if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
                  // 处理日期时间字段
                  if (moment.isMoment(fieldValue)) {
                    leadExpandFieldData[fieldKey] = fieldValue.format('YYYY-MM-DD HH:mm:ss');
                  } else {
                    leadExpandFieldData[fieldKey] = fieldValue;
                  }
                }
              });
            }

            // 处理 project 为级联，取最后一级 value；提取人员ID
            const rawPayload: any = {
              ...values,
              consultationTime: values.consultationTime?.format('YYYY-MM-DD HH:mm:ss'),
              isFormal: false,
              isInBlacklist: false,
              isInWhitelist: false,
              isLive: values.isLive ?? false,
              isLocked: false,
              isPeer: false,
              intentionLevel: values.intentionLevel,
              project: Array.isArray(values.project) ? values.project[values.project.length - 1] : values.project,
              source: Number(values.source),
              leadExpandField: Object.keys(leadExpandFieldData).length > 0 
                ? JSON.stringify(leadExpandFieldData) 
                : undefined,
              // 企业字段透传
              chargePersonName: values.chargePersonName,
              code: values.code,
              provider:
                typeof values.provider === 'string' && values.provider.startsWith('user_')
                  ? Number(values.provider.replace('user_', ''))
                  : values.provider,
              owner:
                typeof values.owner === 'string' && values.owner.startsWith('user_')
                  ? Number(values.owner.replace('user_', ''))
                  : values.owner,
              levelWeight: values.intentionLevel === 1 ? 5 : 3,
            };

            // 清理 null 和 undefined 值，转换为空字符串
            const payload: any = {};
            Object.keys(rawPayload).forEach(key => {
              const value = rawPayload[key];
              if (value === null || value === undefined) {
                payload[key] = '';
              } else {
                payload[key] = value;
              }
            });

            // 新增/编辑分别处理
            if (editing) {
              // 编辑使用新接口，直接传bizStudent对象
              await apiRequest.post('/sms/business/bizStudent/editOfProvider', { 
                ...payload, 
                id: editing.id 
              });
            } else {
              // 新增使用原接口
              await apiRequest.addStudentsToGroup([payload]);
            }
            message.success(editing ? '编辑成功' : '新增成功');
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
        <Form form={form} layout="vertical" initialValues={{
          provider: (() => {
            const uid = (initialState as any)?.currentUser?.userid;
            return uid ? `user_${uid}` : undefined;
          })()
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <Form.Item
              label="学员类型"
              name="type"
              style={{ marginBottom: 10 }}
              rules={[{ required: true, message: '请选择学员类型' }]}
            >
              <Select placeholder="请选择" options={getDictOptions('studentType') as any} />
            </Form.Item>
            <Form.Item
              label="学员姓名"
              name="name"
              style={{ marginBottom: 10 }}
              rules={[{ required: true, message: '请输入姓名' }]}
            >
              <Input placeholder="请输入姓名" />
            </Form.Item>
            <div />

            <Form.Item
              label="联系电话"
              name="mobile"
              style={{ marginBottom: 10 }}
              rules={[
                {
                  validator: (_, value) => {
                    const weChat = form.getFieldValue('weChat');
                    if (!value && !weChat) {
                      return Promise.reject(new Error('联系电话或微信至少填写一个'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder="请输入联系电话" />
            </Form.Item>
            <Form.Item label="身份证号" name="idCard" style={{ marginBottom: 10 }}> 
              <Input placeholder="请输入身份证" />
            </Form.Item>
            <div />

            {/* 企业类字段（type===1） */}
            {typeWatch === 1 && (
              <>
                <Form.Item label="企业负责人姓名" name="chargePersonName" style={{ marginBottom: 10 }}>
                  <Input placeholder="请输入企业负责人姓名" />
                </Form.Item>
                <Form.Item label="统一社会信用码" name="code" style={{ marginBottom: 10 }}>
                  <Input placeholder="请输入统一社会信用码" />
                </Form.Item>
                <Form.Item label="社会信用码电子版" name="codeFile" style={{ marginBottom: 10 }}>
                  <Input placeholder="请输入电子版文件地址或编号" />
                </Form.Item>
                <div />
              </>
            )}

            <Form.Item 
              label="微信" 
              name="weChat" 
              style={{ marginBottom: 10 }}
              rules={[
                {
                  validator: (_, value) => {
                    const mobile = form.getFieldValue('mobile');
                    if (!value && !mobile) {
                      return Promise.reject(new Error('联系电话或微信至少填写一个'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder="请输入微信" />
            </Form.Item>
            <Form.Item label="QQ" name="qq" style={{ marginBottom: 10 }}> 
              <Input placeholder="请输入QQ" />
            </Form.Item>
            <Form.Item label="性别" name="sex" style={{ marginBottom: 10 }}> 
              <Select
                placeholder="请选择"
                options={[
                  { label: '男', value: false },
                  { label: '女', value: true },
                ]}
              />
            </Form.Item>

            <Form.Item 
              label="学历" 
              name="education" 
              style={{ marginBottom: 10 }}
              rules={[{ required: true, message: '请选择学历' }]}
            >
              <Select placeholder="请选择" options={getDictOptions('dict_education') as any} />
            </Form.Item>
            <Form.Item
              label="客户来源"
              name="source"
              style={{ marginBottom: 10 }}
              rules={[{ required: true, message: '请选择客户来源' }]}
            >
              <Select placeholder="请选择客户来源" options={getDictOptions('dict_source') as any} />
            </Form.Item>
            {/* 客户来源固定为9，移除此输入项 */}
            <Form.Item
              label="咨询日期"
              name="consultationTime"
              style={{ marginBottom: 10 }}
              rules={[{ required: true, message: '请选择咨询日期' }]}
            >
              <DatePicker
                showTime
                style={{ width: '100%' }}
                disabledDate={(current) => current && current > moment().endOf('day')}
                disabledTime={(date) => {
                  const now = moment();
                  if (!date) return {};
                  if (!date.isSame(now, 'day')) return {};
                  const disabledHours = Array.from({ length: 24 }, (_, h) => (h > now.hour() ? h : -1)).filter(
                    (h) => h >= 0
                  );
                  const disabledMinutes = Array.from({ length: 60 }, (_, m) =>
                    date.hour() === now.hour() && m > now.minute() ? m : -1
                  ).filter((m) => m >= 0);
                  const disabledSeconds = Array.from({ length: 60 }, (_, s) =>
                    date.hour() === now.hour() && date.minute() === now.minute() && s > now.second() ? s : -1
                  ).filter((s) => s >= 0);
                  return {
                    disabledHours: () => disabledHours,
                    disabledMinutes: () => disabledMinutes,
                    disabledSeconds: () => disabledSeconds,
                  };
                }}
              />
            </Form.Item>

            <Form.Item
              label="意向等级"
              name="intentionLevel"
              style={{ marginBottom: 10, gridColumn: '1 / span 1' }}
              rules={[{ required: true, message: '请选择意向等级' }]}
            >
              <Radio.Group>
                <Radio value={0}>普通</Radio>
                <Radio value={1}>高意向</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label="报考岗位"
              name="project"
              style={{ marginBottom: 10, gridColumn: '2 / span 2' }}
              rules={[{ required: true, message: '请选择报考岗位' }]}
            >
              <Cascader
                placeholder="选择报考岗位"
                options={getSafeCascaderOptions('dict_reg_job')}
                showSearch={{
                  filter: (inputValue: string, path: any[]) =>
                    path.some((o) => String(o.label).toLowerCase().includes(inputValue.toLowerCase())),
                }}
                style={{ width: '100%' }}
                disabled={!!editing}
              />
            </Form.Item>

            <Form.Item
              label="信息提供人"
              name="provider"
              style={{ marginBottom: 10, textAlign: 'left' }}
              rules={[{ required: true, message: '请选择信息提供人' }]}
            >
              <TreeSelect
                allowClear
                showSearch
                treeDefaultExpandAll
                treeData={getUserTreeData()}
                placeholder="请选择信息提供人"
                treeNodeFilterProp="title"
                filterTreeNode={(input, treeNode) => String(treeNode.title).toLowerCase().includes(input.toLowerCase())}
                getPopupContainer={safeGetPopupContainer}
                fieldNames={{ label: 'title', value: 'value', children: 'children' }}
                dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
                disabled={true}
              />
            </Form.Item>
            <Form.Item
              label="信息所有人"
              name="owner"
              style={{ marginBottom: 10, textAlign: 'left' }}
              rules={[{ required: true, message: '请选择信息所有人' }]}
            >
              <TreeSelect
                allowClear
                showSearch
                treeDefaultExpandAll
                treeData={getUserTreeData()}
                placeholder="请选择信息所有人"
                treeNodeFilterProp="title"
                filterTreeNode={(input, treeNode) => String(treeNode.title).toLowerCase().includes(input.toLowerCase())}
                getPopupContainer={safeGetPopupContainer}
                fieldNames={{ label: 'title', value: 'value', children: 'children' }}
                dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
                disabled={!!editing}
              />
            </Form.Item>
            <Form.Item
              label="是否为出镜人专属资源"
              name="isLive"
              style={{ marginBottom: 10, textAlign: 'left' }}
            >
              <Radio.Group>
                <Radio value={false}>否</Radio>
                <Radio value={true}>是</Radio>
              </Radio.Group>
            </Form.Item>

            {/* 拓展字段 */}
            {expandFields.map((field, index) => (
              <Form.Item
                key={field.field}
                label={field.name}
                name={['leadExpandField', field.field]}
                style={{ 
                  gridColumn: index % 2 === 0 ? '1 / span 1' : '2 / span 1', 
                  marginBottom: 10 
                }}
              >
                {(() => {
                  // 根据运算类型判断字段类型
                  const opType = field.operationType;
                  
                  // 字符串类型：0,1,2,3,8,13
                  if (['0', '1', '2', '3', '8', '13'].includes(opType)) {
                    return <Input placeholder={`请输入${field.name}`} />;
                  }
                  
                  // 空值类型：4,5,14,15
                  if (['4', '5', '14', '15'].includes(opType)) {
                    return <Input placeholder={`请输入${field.name}`} disabled />;
                  }
                  
                  // 数字类型：6,7
                  if (['6', '7'].includes(opType)) {
                    return <Input type="number" placeholder={`请输入${field.name}`} />;
                  }
                  
                  // 日期时间类型：9,10 (yyyy-MM-dd HH:mm:ss)
                  if (['9', '10'].includes(opType)) {
                    return (
                      <DatePicker
                        showTime
                        style={{ width: '100%' }}
                        placeholder={`请选择${field.name}`}
                        format="YYYY-MM-DD HH:mm:ss"
                      />
                    );
                  }
                  
                  // 时间类型：11,12 (HH:mm:ss)
                  if (['11', '12'].includes(opType)) {
                    return (
                      <DatePicker
                        showTime={{ format: 'HH:mm:ss' }}
                        style={{ width: '100%' }}
                        placeholder={`请选择${field.name}`}
                        format="HH:mm:ss"
                      />
                    );
                  }
                  
                  // 默认字符串输入
                  return <Input placeholder={`请输入${field.name}`} />;
                })()}
            </Form.Item>
            ))}

            <Form.Item label="地址" name="address" style={{ gridColumn: '1 / span 3', marginBottom: 10 }}>
              <Input.TextArea placeholder="请输入地址..." rows={2} />
            </Form.Item>
            
            <Form.Item label="备注" name="description" style={{ gridColumn: '1 / span 3', marginBottom: 0 }}>
              <Input.TextArea placeholder="请输入备注..." rows={3} />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* 批量导入 */}
      <Modal
        title="批量导入"
        open={batchVisible}
        onCancel={() => setBatchVisible(false)}
        confirmLoading={submitting}
        centered
        maskClosable={false}
        onOk={async () => {
          try {
            setSubmitting(true);
            const values = await batchForm.validateFields();
            const { text } = values as any;

            // 固定顺序（中文名可填）：
            // 姓名,电话,意向等级(普通/高意向或0/1),报考岗位名称,学员类型(字典名称或值),咨询时间(yyyy-MM-dd HH:mm:ss)
            const lines: string[] = (text || '').split(/\r?\n/).filter((l: string) => l.trim());
            const students = lines.map((line: string, idx: number) => {
              const parts = line.split(',').map((s) => (s || '').trim());
              if (parts.length < 6) {
                throw new Error(`第 ${idx + 1} 行字段数量不足，应为6个`);
              }
              const [name, mobile, intentionText, projectText, typeText, consultationTime] = parts;
              const il = parseIntentionLevel(intentionText);

              // 学员类型：通过字典匹配
              const typeNum = (() => {
                const t = String(typeText).trim();
                if (/^-?\d+$/.test(t)) return Number(t);
                // 通过字典匹配学员类型
                const studentTypeOptions = getDictOptions('studentType');
                const matchedOption = studentTypeOptions?.find((option: any) => 
                  option.label === t || option.label.includes(t) || t.includes(option.label)
                );
                return matchedOption ? matchedOption.value : 0;
              })();

              // 报考岗位：名称/路径 → 叶子值
              const projectVal = getRegJobLeafValueByLabelPath(projectText);
              if (projectVal === undefined) {
                throw new Error(`第 ${idx + 1} 行报考岗位无法匹配：${projectText}`);
              }

              return {
                name,
                mobile,
                intentionLevel: isNaN(il) ? 0 : il,
                project: projectVal,
                type: typeNum,
                source: 9,
                consultationTime,
                isFormal: false,
                isInBlacklist: false,
                isInWhitelist: false,
                isLive: false,
                isLocked: false,
                isPeer: false,
                levelWeight: il === 1 ? 5 : 3,
              } as any;
            });
            if (!students.length) {
              message.warning('请粘贴至少一行数据');
              setSubmitting(false);
              return;
            }
            await apiRequest.addStudentsToGroup(students);
            message.success(`成功提交 ${students.length} 条`);
            setBatchVisible(false);
            actionRef.current?.reload();
          } catch (e: any) {
            message.error(e?.message || '导入失败，请检查数据格式');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <Form form={batchForm} layout="vertical">
          <Space style={{ marginBottom: 8 }}>
            <Button
              onClick={() => {
                const sample = '张三,13800001111,高意向,应急特种作业,个人,2025-08-27 10:33:48';
                if (navigator && (navigator as any).clipboard && (navigator as any).clipboard.writeText) {
                  (navigator as any).clipboard.writeText(sample).then(() => message.success('示例已复制到剪贴板'));
                } else {
                  message.info('当前环境不支持一键复制，请手动复制示例');
                }
              }}
            >
              复制示例
            </Button>
          </Space>
          <Form.Item
            label="粘贴数据（每行6列，逗号分隔：姓名,电话,意向等级(普通/高意向或0/1),报考岗位名称,学员类型(字典名称或值),咨询时间(yyyy-MM-dd HH:mm:ss)）"
            name="text"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <Input.TextArea
              rows={10}
              placeholder={"示例：\n张三,13800001111,高意向,应急特种作业,个人,2025-08-27 10:33:48\n李四,13900002222,普通,机电类工种,个人,2025-08-26 11:34:14"}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};
