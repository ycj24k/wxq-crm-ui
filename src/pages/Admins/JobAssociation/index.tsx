import React, { useEffect, useRef, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Table, Space, Menu, Dropdown, Popconfirm, message, Switch } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable, { TableDropdown } from '@ant-design/pro-table';
import request from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import Modals from './Modals';
import ModalsData from './ModalsData';
import Tables from '@/components/Tables';
import Upload from './upload';
import filter from '@/services/util/filter';
type GithubIssueItem = {
  content: string;
  id: number;
  examType: string;
  createTime: string;
  classType: string;
  project: string;
  classYear: string;
  enable: boolean;
};

export default (props: any) => {
  const { student = false, params = { _orderBy: 'enable,id', _direction: 'desc,desc' }, callbackRefP, orderId, setJobFalg, admin = true } = props;
  const [renderData, setRenderData] = useState<any>(null);
  const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
  const [modalDataFalg, setModalData] = useState<boolean>(false);
  const [deletId, setDeletId] = useState('');
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [switchLoding, setSwitchLoding] = useState<boolean>(false);
  const [UploadFalg, setUploadVisible] = useState<boolean>(false);
  const [signUpType, setsignUpTypes] = useState<any>(0);
  const actionRef = useRef<ActionType>();
  const url = '/sms/business/bizChargeStandard';
  const callbackRef = () => {
    // @ts-ignore
    actionRef.current.reload();
  };
  useEffect(() => {
    callbackRef();
  }, [props]);
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: '项目总称',
      dataIndex: 'parentProjects',
      key: 'parentProjects',
      // sorter: true,
      valueType: 'cascader',
      fieldProps: {
        options: Dictionaries.getList('dict_reg_job'),
        showSearch: { filter },
      },
      width: 150,
      render: (text, record) => (
        <span key="parentProjects">
          {Dictionaries.getCascaderAllName('dict_reg_job', record.project)}
        </span>
      ),
    },
    {
      title: '岗位名称',
      dataIndex: 'project',
      key: 'project',
      valueType: 'cascader',
      fieldProps: {
        options: Dictionaries.getCascader('dict_reg_job'),
        showSearch: { filter },
      },
      render: (text, record) => <>{Dictionaries.getCascaderName('dict_reg_job', record.project)}</>,
    },
    {
      title: '报考班型',
      dataIndex: 'classType',
      valueEnum: Dictionaries.getSearch('dict_class_type'),
      fieldProps: {
        showSearch: { filter },
      },
      render: (text, record) => <>{Dictionaries.getName('dict_class_type', record.classType)}</>,
    },
    {
      title: '班型年限',
      dataIndex: 'classYear',
      valueEnum: Dictionaries.getSearch('dict_class_year'),
      fieldProps: {
        showSearch: { filter },
      },
      render: (text, record) => <>{Dictionaries.getName('dict_class_year', record.classYear)}</>,
    },
    {
      title: '考试类型',
      dataIndex: 'examType',
      valueEnum: Dictionaries.getSearch('dict_exam_type'),
      fieldProps: {
        showSearch: { filter },
      },
      render: (text, record) => <>{Dictionaries.getName('dict_exam_type', record.examType)}</>,
    },

    {
      title: '收费标准',
      dataIndex: 'receivable',
      // search: false,
    },
    // {
    //   title: '考试费',
    //   dataIndex: 'examAmount',
    //   // search: false,
    // },
    {
      title: '报名资料字段',
      dataIndex: 'fields',
      ellipsis: true,
      tip: '备注过长会自动收缩',
    },
    {
      title: '考试资料字段',
      dataIndex: 'fields2',
      ellipsis: true,
      tip: '备注过长会自动收缩',
    },
    {
      title: '用户状态',
      dataIndex: 'enable',
      valueEnum: {
        true: '启用',
        false: '禁用'
      },
      // search: false,
      render: (text, record) => (
        <Switch
          key={record.id}
          checkedChildren="启用"
          unCheckedChildren="禁用"
          defaultChecked={record.enable}
          loading={switchLoding}
          onChange={async () => {
            setSwitchLoding(true);
            const status: any = await request.post('/sms/business/bizChargeStandard', {
              id: record.id,
              enable: !record.enable,
            });
            if (status.status != 'success') {
              message.error(status.msg);
            }
            setSwitchLoding(false);
            callbackRef();
          }}
        />
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      hideInTable: !admin,
      render: (text, record, _, action) => (
        <>
          <Button
            key="editable"
            type="primary"
            size="small"
            hidden={!student}
            icon={<EditOutlined />}
            style={{ marginRight: '10px', marginBottom: '8px' }}
            onClick={() => {
              request
                .post('/sms/business/bizOrder', { id: orderId, project: record.project })
                .then((res) => {
                  if (res.status == 'success') {
                    message.success('操作成功');
                    setJobFalg();
                    callbackRefP();
                  }
                });
            }}
          >
            选择
          </Button>
          <Button
            key="editable"
            type="primary"
            size="small"
            hidden={student}
            icon={<EditOutlined />}
            style={{ marginRight: '10px', marginBottom: '8px' }}
            onClick={() => {
              setRenderData({ ...record, types: 'edit' });
              setModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Popconfirm
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
            <Button
              hidden={student}
              key="delete"
              size="small"
              type="primary"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];
  return (
    <>
      <Tables
        columns={columns}
        className="JobAssociation"
        actionRef={actionRef}
        cardBordered
        request={{ url: url, params }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
        }}
        // pagination={{
        //   pageSize: 10,
        // }}
        rowSelection={{
          // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
          // 注释该行则默认不显示下拉选项
          selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
          onChange: (e, selectedRows) => {
            setDeletId(e.join(','));
          },
        }}
        tableAlertOptionRender={() => {
          return (
            <Space size={16}>
              <Popconfirm
                title="是否批量删除？"
                okText="删除"
                onConfirm={() => {
                  request
                    .delete('/sms/business/bizChargeStandard/deleteArray', { ids: deletId })
                    .then((res: any) => {
                      if (res.status == 'success') {
                        message.success('删除成功');
                        callbackRef();
                      }
                    });
                }}
              >
                <a hidden={student || !admin}>批量删除</a>
              </Popconfirm>
            </Space>
          );
        }}
        dateFormatter="string"
        headerTitle="项目关联"
        toolBarRender={
          student
            ? []
            : [
              <Button
                key="button"
                icon={<PlusOutlined />}
                type="primary"
                hidden={!admin}
                onClick={() => {
                  setUploadVisible(true);
                }}
              >
                批量导入收费标准
              </Button>,
              <Button
                key="button"
                icon={<PlusOutlined />}
                type="primary"
                hidden={!admin}
                onClick={() => {
                  setRenderData({ type: 'order', orderNumber: 0 });
                  setModalVisible(true);
                }}
              >
                新建收费标准
              </Button>,
              <Button
                key="button"
                icon={<PlusOutlined />}
                type="primary"
                onClick={() => {
                  if (deletId.length <= 0) {
                    message.error('请先勾选收费标准');
                    return;
                  }
                  setsignUpTypes(0);
                  setModalData(true);
                }}
              >
                关联报考资料
              </Button>,
              <Button
                key="button"
                icon={<PlusOutlined />}
                type="primary"
                onClick={() => {
                  if (deletId.length <= 0) {
                    message.error('请先勾选收费标准');
                    return;
                  }
                  setsignUpTypes(1);
                  setModalData(true);
                }}
              >
                关联考试资料
              </Button>,
            ]
        }
      />

      {modalVisibleFalg && (
        <Modals
          setModalVisible={() => setModalVisible(false)}
          modalVisible={modalVisibleFalg}
          callbackRef={() => callbackRef()}
          renderData={renderData}
          url={url}
        />
      )}
      {modalDataFalg && (
        <ModalsData
          setModalVisible={() => setModalData(false)}
          modalVisible={modalDataFalg}
          callbackRef={() => callbackRef()}
          renderData={deletId}
          signUpType={signUpType}
          url={url}
        />
      )}
      {UploadFalg && (
        <Upload
          setModalVisible={() => setUploadVisible(false)}
          modalVisible={UploadFalg}
          url={'/sms/business/bizChargeStandard/saveArray'}
          type="student"
          callbackFn={() => callbackRef()}
        />
      )}
    </>
  );
};
