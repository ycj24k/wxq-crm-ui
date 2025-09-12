import React, { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { EditOutlined, PlusOutlined, DeleteOutlined, RedoOutlined } from '@ant-design/icons';
import { Button, Modal, Select, Form, Input, InputNumber, message, Popconfirm, Spin } from 'antd';
import UserManageCard from '../Department/UserManageCard';
import apiRequest from '@/services/ant-design-pro/apiRequest';

import Dictionaries from '@/services/util/dictionaries';

type SalesLevel = {
  studentLevelNameList: any;
  id?: number;
  name: string;      // 等级名称
  description: string;//描述
  departmentId: number; //部门id
  customerCapacity: number; //客户容量
  lockedCustomerLimit: number; //锁定客户上限
  studentLevelList?: any[]; // 学生等级列表
};

// 获取学生等级选项
async function getsysUserLevel() {
  const res = await apiRequest.get('/sms/system/sysUserLevel');
  console.log('等级选项',res.data);
  return res.data?.content?.map((e: any) => ({
    label: e.name,
    value: e.id
  })) || [];
}

export default () => {
  const actionRef = useRef<ActionType>();
  const [visible, setVisible] = useState(false);
  const [userVisible, setUserVisible] = useState(false);
  const [editing, setEditing] = useState<SalesLevel | null>(null);
  const [renderData, setRenderData] = useState<SalesLevel | null>(null);
  const [form] = Form.useForm<SalesLevel>();
  const [departmentList, setDepartmentList] = useState<any>([]);
  const [CardVisible, setCardVisible] = useState<boolean>(false);
  const [CardContent, setCardContent] = useState<any>();
  const [department, setDepartment] = useState<any>();
  const [parentIdTree, setParentIdTree] = useState<string | number>('-1');
  const [studentLevelOptions, setStudentLevelOptions] = useState<any[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  
  const callbackRef = () => {
    actionRef?.current?.reload();
  };
  
  // 获取分公司名称
  useEffect(() => {
    getCompanyName();
    getStudentLevelOptions();
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
  
  // 获取学生等级选项
  const getStudentLevelOptions = async () => {
    try {
      const options = await getsysUserLevel();
      setStudentLevelOptions(options);
    } catch (error) {
      message.error('获取客戶等级选项失败');
    }
  };
  
  // 提交关联学生等级
  const handleCorrelationSubmit = async () => {
    if (!renderData?.id) return;
    
    try {
      setLoading(true);
      await apiRequest.postAll(
        `/sms/system/sysUserLevel/correlationStudentLevel/${renderData.id}`,
         selectedLevels,
        // selectedLevels  // 直接传递数组作为请求体
      );
      message.success('关联成功');
      setUserVisible(false);
      setSelectedLevels([]);
      actionRef.current?.reload();
    } catch (error) {
      message.error('关联失败');
    } finally {
      setLoading(false);
    }
  };
  
  const columns: ProColumns<SalesLevel>[] = [
    { title: '名称', dataIndex: 'name' },
    {
      title: '所属公司',
      sorter: true,
      dataIndex: 'departmentId',
      search: false,
      render: (text, record) => (
        <span>
          {Dictionaries.getDepartmentName(record.departmentId).join('-')}
        </span>
      ),
    },
    { title: '客户容量', dataIndex: 'customerCapacity', sorter: true },
    { title: '锁定数量容量', dataIndex: 'lockedCustomerLimit', sorter: true },
    { title: '描述', dataIndex: 'description', sorter: true },
    // { 
    //   title: '可见等级', 
    //   colSpan: 2,
    //   dataIndex: 'studentLevelList', 
    //   sorter: true,
    //   render: (_, record) => (
    //     <span>
    //       {record.studentLevelNameList|| '无'}
    //     </span>
    //   )
    // },
    {
         title: '可见等级',
         search: false,
         colSpan: 2,
         dataIndex: 'studentLevelList',
         key: 'studentLevelList',
         valueType: 'select',
         request: getsysUserLevel,
            render: (_, record) => (
        <span>
          {record.studentLevelNameList|| '无'}
        </span>
      )
       },
    {                   
      search: false,
      colSpan: 0,
      render: (text, record: any, _, action) => (
        <Button
          size="small"
          type="primary"
          icon={<PlusOutlined />}
          onClick={async () => {
            setRenderData(record);
            // 设置已选中的学生等级
            if (record.studentLevelList) {
              // console.log(record.studentLevelList);
              setSelectedLevels(record.studentLevelList.map((item: any) => item));
            } else {
              setSelectedLevels([]);
            }
            setUserVisible(true);
          }}
        >
          等级
        </Button>
      ),
    },
    {
      title: '所属用户',
      dataIndex: 'userNameList',
      colSpan: 2,
      search: false,
      ellipsis: true,
      tip: '过长会自动收缩',
    },
    {
      search: false,
      colSpan: 0,
      render: (text, record: any, _, action) => (
        <Button
          size="small"
          type="primary"
          icon={<PlusOutlined />}
          onClick={async () => {
            console.log(record);
            const content = await apiRequest.get('/sms/share/getDepartmentAndUser');
            setCardContent({ content: content.data, type: 'sysuser' });
            
            // 省略类型注解
            setDepartment(record?.userIdList?.map((id: any) => ({ id })));
            setParentIdTree(record.id);
            setCardVisible(true);
          }}
        >
          用户
        </Button>
      ),
    },
    {
      title: '操作', 
      valueType: 'option', 
      render: (_, record) => [
        <a key="edit" onClick={() => { setEditing(record); form.setFieldsValue(record); setVisible(true); }}>编辑</a>,
        <Popconfirm key="del" title="确认删除该等级？" onConfirm={async () => {
          await apiRequest.delete('/sms/system/sysUserLevel', { id: record.id });
          message.success('删除成功');
          actionRef.current?.reload();
        }}><a>删除</a></Popconfirm>
      ]
    }
  ];

  return (
    <PageContainer>
      {CardVisible && (
        <UserManageCard
          CardVisible={CardVisible}
          CardContent={CardContent}
          callbackRef={() => callbackRef()}
          setCardVisible={() => setCardVisible(false)}
          parentIdTree={parentIdTree}
          departments={department}
        />
      )}
      
      {/* 关联学生等级的弹窗 */}
      <Modal
        title={`关联学生等级 - ${renderData?.name || ''}`}
        open={userVisible}
        onCancel={() => {
          setUserVisible(false);
          setSelectedLevels([]);
        }}
        onOk={handleCorrelationSubmit}
        confirmLoading={loading}
      >
        <Spin spinning={loading}>
          <Form layout="vertical">
            <Form.Item label="选择学生等级">
              <Select
                mode="multiple"
                options={studentLevelOptions}
                value={selectedLevels}
                onChange={setSelectedLevels}
                placeholder="请选择学生等级"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
      
      <ProTable<SalesLevel>
        rowKey="id"
        columns={columns}
        actionRef={actionRef}
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          <Button type="primary" key="new" onClick={() => { setEditing(null); form.resetFields(); setVisible(true); }}>新增</Button>
        ]}
        request={async (params) => {
          const res = await apiRequest.get('/sms/system/sysUserLevel', params);
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
            await apiRequest.post('/sms/system/sysUserLevel', { id: editing.id, ...values });
            message.success('更新成功');
          } else {
            await apiRequest.post('/sms/system/sysUserLevel', values);
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
          <Form.Item name='departmentId' label='所属公司' rules={[{ required: true, message: '请选择所属公司' }]}>
            <Select style={{ width: '100%' }} options={departmentList} placeholder="公司" />
          </Form.Item>
          <Form.Item label="客户容量" name="customerCapacity" rules={[{ required: true, message: '请输入客户容量' }]}>
            <InputNumber min={0} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="锁定数量容量" name="lockedCustomerLimit"  rules={[{ required: true, message: '锁定数量容量' }]}>
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