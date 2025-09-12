import React, { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Form, Select, Input, InputNumber, Space, message, Popconfirm, Tag } from 'antd';
import apiRequest from '@/services/ant-design-pro/apiRequest';
import { getCompanyRequest } from '@/services/util/util';
import Dictionaries from '@/services/util/dictionaries';
type LevelItem = {
  id?: number;
  departmentId?: number; // 所属公司
  name?: string;       // 等级名称
  code?: string;       // 等级编码
  priority: number;   // 优先级（数字越大越靠前）
  description?: string;
  enable?: boolean;
  createdAt?: string;
};

export default () => {
  const actionRef = useRef<ActionType>();
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<LevelItem | null>(null);
  const [form] = Form.useForm<LevelItem>();
  const [departmentList, setDepartmentList] = useState<any>([]);
  // 获取分公司名称
  useEffect(() => {
    let isMounted = true;
    
    const loadCompanyName = async () => {
      try {
        const contentList: any = await apiRequest.get('/sms/share/getDepartment', {
          _isGetAll: true,
        });
        
        if (!isMounted) return; // 组件已卸载，不更新状态
        
        const targetID = contentList.data[0].id;
        const targetData = contentList.data.find((item: any) => item.parentId === targetID);
        const result = targetData ? contentList.data.filter((item: any) => item.parentId === targetID && item.parentId != -1) : [];
        const data = result.map((item: any) => {
          return {
            ...item,
            label: item.name,
            value: item.id,
          }
        });
        setDepartmentList(data);
      } catch (error) {
        if (isMounted) {
          console.error('加载部门列表失败:', error);
        }
      }
    };
    
    loadCompanyName();
    // getStudentLevelOptions();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // 获取分公司名称
  const getCompanyName = async () => {
    const contentList: any = await apiRequest.get('/sms/share/getDepartment', {
      _isGetAll: true,
    });
    const targetID = contentList.data[0].id;
    const targetData = contentList.data.find((item: any) => item.parentId === targetID);
    const result = targetData ? contentList.data.filter((item: any) => item.parentId === targetID && item.parentId != -1) : [];
    const data = result.map((item: any) => {
      return {
        ...item,
        label: item.name,
        value: item.id,
      }
    });
    setDepartmentList(data);
  }
  const columns: ProColumns<LevelItem>[] = [
    { title: '等级名称', dataIndex: 'name' },
    // {
    //      title: '所属公司',
    //      dataIndex: 'companyId',
    //      key: 'companyId',
    //      valueType: 'select',
    //      request: getCompanyRequest,
    //    },
     {
          title: '部门',
          dataIndex: 'departmentId',
          search: false,
          sorter: true,
          render: (text, record) => (
            <span>{Dictionaries.getDepartmentName(record.departmentId)[0]}</span>
          ),
        },
    // { title: '等级编码', dataIndex: 'code' },
    { title: '优先级', dataIndex: 'weight', sorter: true },
    // { title: '状态', dataIndex: 'enable', valueType: 'select', valueEnum: { true: { text: '启用', status: 'Success' }, false: { text: '停用', status: 'Default' } }, render: (_, r) => <Tag color={r.enable ? 'green' : 'default'}>{r.enable ? '启用' : '停用'}</Tag> },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    // { title: '创建时间', dataIndex: 'createdAt', valueType: 'dateTime' },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <a key="edit" onClick={() => { setEditing(record); form.setFieldsValue(record); setVisible(true); }}>编辑</a>,
        <Popconfirm key="del" title="确定删除该等级？" onConfirm={async () => {
          // DELETE /sms/student/level
          await apiRequest.delete('/sms/business/bizStudentLevel', { id: record.id });
          message.success('删除成功');
          actionRef.current?.reload();
        }}>
          <a>删除</a>
        </Popconfirm>
      ]
    }
  ];

  return (
    <PageContainer>
      <ProTable<LevelItem>
        rowKey="id"
        columns={columns}
        actionRef={actionRef}
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          <Button type="primary" key="new" onClick={() => { setEditing(null); form.resetFields(); setVisible(true); }}>新增</Button>
        ]}
        request={async (params, sort) => {
          // 对齐资源小组用法：GET /sms/student/level
          // 支持分页 / 排序
          const query = { ...params } as any;
          if (sort && Object.keys(sort).length) {
            const key = Object.keys(sort)[0];
            query._orderBy = key;
            query._direction = sort[key]?.startsWith('desc') ? 'desc' : 'asc';
          }
          const res = await apiRequest.get('/sms/business/bizStudentLevel', query);
          return {
            data: res.data?.content || [],
            success: true,
            total: res.data?.totalElements || 0,
          };
        }}
      />

      <Modal
        title={editing ? '编辑学员等级' : '新增学员等级'}
        open={visible}
        destroyOnClose
        onCancel={() => setVisible(false)}
        onOk={async () => {
          const values = await form.validateFields();
          if (editing) {
            // 更新：POST /sms/student/level/update
            await apiRequest.post('/sms/business/bizStudentLevel', { id: editing.id, ...values });
            message.success('更新成功');
          } else {
            // 新增：POST /sms/student/level
            await apiRequest.post('/sms/business/bizStudentLevel', values);
            message.success('新增成功');
          }
          setVisible(false);
          actionRef.current?.reload();
        }}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item label="等级名称" name="name" rules={[{ required: true, message: '请输入等级名称' }]}>
            <Input placeholder="例如：VIP、普通、重点跟进" />
          </Form.Item>
          <Form.Item name='departmentId' label='所属公司' rules={[{ required: true, message: '请选择所属公司' }]}>
            <Select style={{ width: '100%' }} options={departmentList} placeholder="公司" />
          </Form.Item>
          {/* <Form.Item label="等级编码" name="code" rules={[{ required: true, message: '请输入唯一编码' }]}>
            <Input placeholder="例如：VIP、NORMAL、KEY" />
          </Form.Item> */}
          <Form.Item label="优先级" name="weight" rules={[{ required: true, message: '请输入优先级' }]}>
            <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="数字越大优先级越高" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} placeholder="可填写该等级的说明" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};


