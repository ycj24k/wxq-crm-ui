import React, { useEffect, useRef, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Table, Space, Menu, Dropdown, Popconfirm, message } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable, { TableDropdown } from '@ant-design/pro-table';
import request from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import Modal from './Modals';
import AddModals from './addModalsNew';
import StudentInfo from '../StudentManage/studentInfo';
import { history } from 'umi';
import moment from 'moment';

type GithubIssueItem = {
  content: string;
  id: number;
  studentId: number;
  studentName: string;
  type: number;
  updateBy: number;
  intention: number;
  studentUserId: number;
  createTime: string;
  updateTime: string;
  userName: string;
};

export default (props: any) => {
  const { admin, studentUserId = '',IsrenderData } = props;
  const [renderData, setRenderData] = useState<any>(null);
  const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
  const [InfoVisibleFalg, setInfoVisible] = useState<boolean>(false);
  const [nextVisitDate, setnextVisitDate] = useState<any>(false)
  const actionRef = useRef<ActionType>();
  const url2 = '/sms/business/bizStudentUser';
  const url = '/sms/business/bizReturnVisit';
  const callbackRef = () => {
    // @ts-ignore
    actionRef.current.reload();
  };
  useEffect(() => {
    if (history.location.query?.nextVisitDate) {
      setnextVisitDate(history.location.query?.nextVisitDate)
    }
  }, [])
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: '姓名',
      dataIndex: 'studentName',
      sorter: true,
      // search: false,
      render: (text, record) => (
        <>
          {studentUserId ? (
            <span>{record.studentName}</span>
          ) : (
            <a
              onClick={() => {
                // setRenderData({ id: record.studentId, admin: admin });
                // setInfoVisible(true);
                request.get(url2, { id: record.studentUserId }).then((res: any) => {
                  setRenderData({ ...res.data.content[0], admin: admin });
                  setInfoVisible(true);
                });
              }}
            >
              {record.studentName}
            </a>
          )}
        </>
      ),
    },
    {
      title: '沟通类型',
      dataIndex: 'type',
      valueEnum: Dictionaries.getSearch('dict_c_type'),
      render: (text, record) => <>{Dictionaries.getName('dict_c_type', record.type)}</>,
      sorter: true,
    },
    {
      title: '意向级别',
      dataIndex: 'intention',
      sorter: true,
      valueEnum: Dictionaries.getSearch('dict_intention_level'),
      render: (text, record) => (
        <>{Dictionaries.getName('dict_intention_level', record.intention)}</>
      ),
    },
    {
      title: '沟通内容',
      dataIndex: 'content',
      sorter: true,
    },
    {
      title: '沟通时间',
      key: 'createTime',
      dataIndex: 'createTime',
      valueType: 'dateRange',
      // hideInSearch: true,
      sorter: true,
      render: (text, record) => (
        <span>{record.createTime}</span>
      ),
    },
    {
      title: '下一次跟进时间',
      key: 'nextVisitDate',
      dataIndex: 'nextVisitDate',
      valueType: 'dateRange',
      sorter: true,
      render: (text, record) => (
        <span>{record.nextVisitDate}</span>
      ),
    },
    {
      title: '沟通老师',
      dataIndex: 'userName',
      sorter: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text, record, _, action) => (
        <>
          <Button
            key="editable"
            type="primary"
            size="small"
            icon={<EditOutlined />}
            style={{ marginRight: '10px', marginBottom: '8px' }}
            onClick={() => {
              setRenderData({ id: record.studentUserId, types: 'add', n: 0 });
              setModalVisible(true);
            }}
          >
            回访
          </Button>
          {/* <Popconfirm
            key={record.id}
            title="是否确定删除？"
            onConfirm={() => {
              request.delete(url, { id: record.id }).then((res: any) => {
                if (res.status == 'success') {
                  message.success('删除成功');
                  callbackRef();
                }
              });
            }}
            okText="删除"
            cancelText="取消"
          >
            <Button key="delete" size="small" type="primary" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm> */}
        </>
      ),
    },
  ];
  return (
    <>
      <ProTable<GithubIssueItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (
          params: any,
          sort,
          filter,
        ) => {
          if (IsrenderData.id) params.studentId = IsrenderData.id;
          if (nextVisitDate) params.nextVisitDate = nextVisitDate
          const dataList: any = await request.get('/sms/business/bizReturnVisit', params);
          return {
            data: dataList.data.content,
            success: dataList.success,
            total: dataList.data.totalElements,
          };
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false
        }}
        pagination={{
          pageSize: 10,
        }}
        rowSelection={{
          // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
          // 注释该行则默认不显示下拉选项
          selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
          onChange: (e, selectedRows) => {
            console.log('selectedRows', selectedRows);
            console.log('e', e);
          },
        }}
        dateFormatter="string"
        headerTitle="回访记录"
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              setRenderData({type: 'order', orderNumber: 0 });
              setModalVisible(true);
            }}
          >
            添加学员跟进/回访记录
          </Button>,
        ]}
      />
      {renderData && (
        <StudentInfo
          setModalVisible={() => setInfoVisible(false)}
          modalVisible={InfoVisibleFalg}
          renderData={renderData}
          admin={admin}
          callbackRef={() => callbackRef()}
        />
      )}
      {renderData && (
        <AddModals
          setModalVisible={() => setModalVisible(false)}
          modalVisible={modalVisibleFalg}
          callbackRef={() => callbackRef()}
          renderData={{...JSON.parse(JSON.stringify(IsrenderData)),types:'add'}}
          // admin={admin}
          url={"/sms/business/bizReturnVisit"}
        />
      )}
    </>
  );
};
