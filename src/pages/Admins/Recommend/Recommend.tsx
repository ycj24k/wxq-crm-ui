import Tables from '@/components/Tables';
import { PageContainer } from '@ant-design/pro-layout';
import { ActionType, ProColumns } from '@ant-design/pro-table';
import Dictionaries from '@/services/util/dictionaries';
import moment from 'moment';
import request from '@/services/ant-design-pro/apiRequest';
import { useEffect, useRef, useState } from 'react';
import ModelAdd from './ModelAdd';
import { Button, Image, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import filter from '@/services/util/filter';
type GithubIssueItem = {
  project: string;
  type: string;
  name: string;
  codeFile: string;
  powerAttorneyFile: string;
  sealFile: string;
  autoSignUrl: string;
  address: string;
  updateTime: string;
  bank: string;
  oldData: string;
  newData: string;
  percent: number;
  id: number;
  isVerify: boolean;
};
export default (props: any) => {
  const { type = '', setCompanyId, onCancel, admin = true } = props;
  const [renderData, setRenderData] = useState<any>(null);
  const [TableUrl, setTableUrl] = useState<any>('/sms/business/bizIntroductionProject');

  const [InfoVisibleFalg, setInfoVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const callbackRef = () => {
    // @ts-ignore
    actionRef.current.reload();
  };
  useEffect(() => {
    Dictionaries.getDepartmentName();
  }, []);
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: '推荐项目',
      dataIndex: 'parentProjects',
      key: 'parentProjects',
      // sorter: true,
      valueType: 'cascader',
      fieldProps: {
        options: Dictionaries.getList('dict_reg_job'),
        showSearch: { filter },
      },
      render: (text, record) => (
        <span key="parentProjects">
          {Dictionaries.getCascaderAllName('dict_reg_job', record.project)}
        </span>
      ),
    },
    {
      title: '接受推荐项目负责人',
      // sorter: true,
      dataIndex: 'userName',
      // search: false,
    },
    {
      title: '推荐人所占业绩比例(%)',
      // sorter: true,
      dataIndex: 'percent',
      render: (text, record) => <span key="parentProjects">{record.percent * 100}%</span>,
    },
    {
      title: '操作',
      dataIndex: 'options',
      search: false,
      hideInTable: !admin,
      render: (text, record) => [
        <Button
          key="eidt"
          type="primary"
          size="small"
          hidden={type === 'contract'}
          style={{ marginRight: '15px' }}
          onClick={() => {
            setRenderData({ ...record, type: 'eidt', renderDataNumber: 0 });
            setInfoVisible(true);
          }}
        >
          编辑
        </Button>,
        <Popconfirm
          title="是否删除"
          okText="删除"
          key="deletes"
          cancelText="取消"
          onConfirm={() => {
            request.delete('/sms/contract/conCompany', { id: record.id }).then((res: any) => {
              if (res.status == 'success') {
                message.success('操作成功!');
                callbackRef();
              }
            });
          }}
        >
          <Button key="delete" hidden={type === 'contract'} type="primary" size="small" danger>
            删除
          </Button>
        </Popconfirm>,

        <Button
          hidden={type === ''}
          key="xuanze"
          type="primary"
          onClick={() => {
            setCompanyId(record);
            onCancel();
          }}
        >
          选择
        </Button>,
      ],
    },
  ];
  const getString = (value: string, type?: string) => {
    if (value === undefined) {
      return '';
    }
    console.log('1');
    let obj = JSON.parse(value);
    console.log('value', obj);
    if (type == 'project') {
      return Dictionaries.getCascaderAllName('dict_reg_job', obj.project);
    } else if (type == 'oldData' || type == 'newData') {
      let percent = obj.percent * 100 + '%';
      let user = Dictionaries.getDepartmentUserName(obj.userId);
      return `项目接收人${user}推荐人所占业绩比例${percent}`;
    } else {
      return '';
    }
  };
  const optionColumns: ProColumns<GithubIssueItem>[] = [
    {
      title: '推荐项目',
      dataIndex: 'parentProjects',
      key: 'parentProjects',
      // sorter: true,
      search: false,
      valueType: 'cascader',
      fieldProps: {
        options: Dictionaries.getList('dict_reg_job'),
        showSearch: { filter },
      },
      render: (text, record) => (
        <span key="parentProjects">
          {getString(record.oldData, 'project')}
          {/* {Dictionaries.getCascaderAllName('dict_reg_job', JSON.parse(record.oldData).project)} */}
          {/* {Dictionaries.getCascaderAllName('dict_reg_job', record.project)} */}
        </span>
      ),
    },
    {
      title: '更改前信息',
      // sorter: true,
      render: (text, record) => <span>{getString(record.oldData, 'oldData')}</span>,
      search: false,
    },
    {
      title: '更改后信息',
      // sorter: true,
      render: (text, record) => <span>{getString(record.newData, 'newData')}</span>,
      search: false,
    },
    {
      title: '操作人',
      sorter: true,
      // search: false,
      dataIndex: 'userName',
    },
    {
      title: '更新时间',
      key: 'updateTime',
      sorter: true,
      dataIndex: 'updateTime',
      valueType: 'dateRange',
      render: (text, record) => (
        <span>{record.updateTime}</span>
      ),
    },
  ];
  const [TableColumns, setColumns] = useState<any>(columns);
  let toolbar = {
    menu: {
      type: 'tab',
      items: [
        {
          key: 'recommendTable',
          label: '信息配置',
        },
        {
          key: 'optionTable',
          label: '操作记录',
        },
      ],
      onChange: (key: any) => {
        if (key == 'recommendTable') {
          setColumns(columns);
          setTableUrl('/sms/business/bizIntroductionProject');
        } else if (key == 'optionTable') {
          setColumns(optionColumns);
          setTableUrl('/sms/business/bizOperationLog');
        }

        callbackRef();
      },
    },
  };
  let sortList: any = {
    ['updateTime']: 'desc',
  };
  return (
    <>
      <Tables
        actionRef={actionRef}
        columns={TableColumns}
        className="Contract"
        request={{ url: TableUrl, sortList }}
        toolbar={toolbar}
        search={{ defaultCollapsed: false, labelWidth: 150 }}
        toolBarRender={[
          <Button
            key="button"
            icon={<PlusOutlined />}
            type="primary"
            hidden={!admin}
            onClick={() => {
              //   if (parentId) {
              //     setRenderData({ typee: 'add', parentId });
              //   } else {
              //     setRenderData({ typee: 'add' });
              //   }
              setRenderData({ type: 'add', renderDataNumber: 0 });
              setInfoVisible(true);
              //   setModalVisible(true);
            }}
          >
            新建
          </Button>,
        ]}
      />
      {InfoVisibleFalg && (
        <ModelAdd
          setModalVisible={() => setInfoVisible(false)}
          modalVisible={InfoVisibleFalg}
          renderData={renderData}
          callbackRef={() => callbackRef()}
        />
      )}
    </>
  );
};
