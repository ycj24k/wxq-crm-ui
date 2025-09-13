import { useMemo, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { type ActionType, type ProColumns } from '@ant-design/pro-table';
import { Button, Space, Tag, Modal, Form, Input, Select, DatePicker, message, Radio, Cascader, TreeSelect } from 'antd';
import Dictionaries from '@/services/util/dictionaries';
import type { ProFormInstance } from '@ant-design/pro-form';
import moment from 'moment';
// 参考资源小组使用方式，统一使用 apiRequest
import apiRequest from '@/services/ant-design-pro/apiRequest';

const { Option } = Select;

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
};

export default () => {
  const actionRef = useRef<ActionType>();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<StudentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [batchVisible, setBatchVisible] = useState(false);
  const [batchForm] = Form.useForm();

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
  const searchFormRef = useRef<ProFormInstance>();

  // 假数据
  const mockList: StudentItem[] = useMemo(
    () => [
      {
        id: 1,
        name: '张三',
        type: 0,
        education: 1,
        mobile: '13800001111',
        idCard: '110101199001011234',
        weChat: 'wx_zhangsan',
        qq: '123456789',
        sex: false,
        project: '机电类工种',
        source: 1,
        consultationTime: '2025-08-27 10:33:48',
        level: 1,
        provider: 1,
        owner: 1,
        address: '北京市朝阳区',
        description: '高意向客户',
        userId: 1,
        createTime: '2025-08-27 10:33:48',
        isDel: 0,
        isFormal: false,
        isInBlacklist: false,
        isInWhitelist: false,
        isLive: false,
        isLocked: false,
        isPeer: false,
        levelWeight: 5,
      },
      {
        id: 2,
        name: '李四',
        type: 0,
        education: 2,
        mobile: '13900002222',
        idCard: '110101199002021234',
        weChat: 'wx_lisi',
        qq: '987654321',
        sex: true,
        project: '应急特种作业',
        source: 2,
        consultationTime: '2025-08-26 11:34:14',
        level: 0,
        provider: 2,
        owner: 2,
        address: '上海市浦东新区',
        description: '普通客户',
        userId: 2,
        createTime: '2025-08-26 11:34:14',
        isDel: 0,
        isFormal: false,
        isInBlacklist: false,
        isInWhitelist: false,
        isLive: false,
        isLocked: false,
        isPeer: false,
        levelWeight: 3,
      },
    ],
    []
  );

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
        <Select allowClear options={getDictOptions('dict_intention_level')} placeholder="请选择意向等级" />
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
    { key: 'col-project', title: '报考岗位', dataIndex: 'project', width: 120, ellipsis: true },
    {
      key: 'col-source',
      title: '客户来源',
      dataIndex: 'source',
      width: 100,
      render: (_, r) => <span key={`source-${r.id}`}>{Dictionaries.getName('dict_source', r.source)}</span>,
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
      key: 'col-provider',
      title: '信息提供人',
      dataIndex: 'provider',
      width: 120,
      render: (_, r) => <span key={`provider-${r.id}`}>{getUserNameById(r.provider)}</span>,
    },
    {
      key: 'col-owner',
      title: '信息所有人',
      dataIndex: 'owner',
      width: 120,
      render: (_, r) => <span key={`owner-${r.id}`}>{getUserNameById(r.owner)}</span>,
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
            form.setFieldsValue({
              name: record.name,
              type: record.type,
              education: record.education,
              mobile: record.mobile,
              idCard: record.idCard,
              weChat: record.weChat,
              qq: record.qq,
              sex: typeof record.sex === 'boolean' ? record.sex : record.sex === 1,
              // 报考岗位为级联路径
              project: record.project
                ? (Dictionaries.getCascaderValue('dict_reg_job', record.project) as any)
                : undefined,
              source: record.source !== undefined && record.source !== null ? String(record.source) : undefined,
              consultationTime: moment(record.consultationTime),
              intentionLevel: (record as any).intentionLevel ?? 0,
              // 人员树使用 user_ 前缀
              provider:
                record.provider !== undefined && record.provider !== null ? `user_${record.provider}` : undefined,
              owner: record.owner !== undefined && record.owner !== null ? `user_${record.owner}` : undefined,
              address: record.address,
              description: record.description,
            });
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
              key="reset"
              onClick={() => {
                searchFormRef.current?.resetFields();
                actionRef.current?.reload();
              }}
            >
              重置
            </Button>
            <Button key="search" type="primary" onClick={() => actionRef.current?.reload()}>
              查询
            </Button>
            <Button
              key="create"
              type="primary"
              onClick={() => {
                setEditing(null);
                form.resetFields();
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
            <Button key="export">导出</Button>
          </Space>,
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
            console.error('获取学员列表失败:', error);
            const { createTimeRange, ...rest } = params as any;
            let list = [...mockList];
            Object.keys(rest).forEach((k) => {
              if (rest[k]) list = list.filter((it: any) => String(it[k] ?? '').includes(String(rest[k])));
            });
            if (createTimeRange && createTimeRange.length === 2) {
              const [start, end] = createTimeRange;
              const s = moment(start);
              const e = moment(end);
              list = list.filter((it) => {
                const t = moment(it.createTime);
                return t.isBetween(s, e, undefined, '[]');
              });
            }
            return { data: list, success: true, total: list.length };
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
            // 处理 project 为级联，取最后一级 value；提取人员ID
            const payload: any = {
              ...values,
              consultationTime: values.consultationTime?.format('YYYY-MM-DD HH:mm:ss'),
              isFormal: false,
              isInBlacklist: false,
              isInWhitelist: false,
              isLive: false,
              isLocked: false,
              isPeer: false,
              intentionLevel: values.intentionLevel,
              project: Array.isArray(values.project) ? values.project[values.project.length - 1] : values.project,
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

            // 新增/编辑统一接口：数组提交
            await apiRequest.addStudentsToGroup([editing ? { ...payload, id: editing.id } : payload]);
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
        <Form form={form} layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <Form.Item
              label="学员类型"
              name="type"
              style={{ marginBottom: 10 }}
              rules={[{ required: true, message: '请选择学员类型' }]}
            >
              <Select placeholder="请选择">
                <Option value={0}>个人</Option>
                <Option value={1}>企业</Option>
              </Select>
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
              rules={[{ required: true, message: '请输入联系电话' }]}
            >
              <Input placeholder="请输入联系电话" />
            </Form.Item>
            <Form.Item label="身份证号" name="idCard" style={{ marginBottom: 10 }}>
              <Input placeholder="请输入身份证" />
            </Form.Item>
            <div />

            <Form.Item label="微信" name="weChat" style={{ marginBottom: 10 }}>
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

            <Form.Item label="学历" name="education" style={{ marginBottom: 10 }}>
              <Select placeholder="请选择" options={getDictOptions('dict_education') as any} />
            </Form.Item>
            <Form.Item
              label="客户来源"
              name="source"
              style={{ marginBottom: 10 }}
              rules={[{ required: true, message: '请选择客户来源' }]}
            >
              <Select placeholder="请选择" options={getDictOptions('dict_source') as any} />
            </Form.Item>
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
                options={Dictionaries.getCascader('dict_reg_job') as any}
                showSearch={{
                  filter: (inputValue: string, path: any[]) =>
                    path.some((o) => String(o.label).toLowerCase().includes(inputValue.toLowerCase())),
                }}
                style={{ width: '100%' }}
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
                getPopupContainer={(trigger) => trigger.parentNode as HTMLElement}
                fieldNames={{ label: 'title', value: 'value', children: 'children' }}
                dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
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
                getPopupContainer={(trigger) => trigger.parentNode as HTMLElement}
                fieldNames={{ label: 'title', value: 'value', children: 'children' }}
                dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
              />
            </Form.Item>
            <div />

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
            // 约定使用换行分隔的文本区域：每行为一个学员“姓名,电话,意向等级(0/1),项目”
            const lines: string[] = (values.text || '').split(/\r?\n/).filter((l: string) => l.trim());
            const students = lines.map((line: string) => {
              const [name, mobile, intentionLevel, project] = line.split(',').map((s) => (s || '').trim());
              const il = Number(intentionLevel);
              return {
                name,
                mobile,
                intentionLevel: isNaN(il) ? 0 : il,
                project,
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
          } catch (e) {
            message.error('导入失败，请检查数据格式');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <Form form={batchForm} layout="vertical">
          <Form.Item
            label="粘贴数据（每行：姓名,电话,意向等级(0/1),项目）"
            name="text"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <Input.TextArea
              rows={8}
              placeholder="示例：\n张三,13800001111,1,机电类工种\n李四,13900002222,0,应急特种作业"
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};
