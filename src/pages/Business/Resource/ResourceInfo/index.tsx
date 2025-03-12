import { useEffect, useRef, useState } from 'react';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Table, message, Tag, Popconfirm } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import request from '@/services/ant-design-pro/apiRequest';
import moment from 'moment';
import Dictionaries from '@/services/util/dictionaries';
import Upload from '@/services/util/upload';
import { PageContainer } from '@ant-design/pro-layout';
import StudentInfo from '@/pages/Admins/StudentManage/studentInfo';
import Tables from '@/components/Tables';
import filter from '@/services/util/filter';
import { useModel } from 'umi';
// import Modals from './Modals';
type GithubIssueItem = {
  name: string;
  sex: number;
  id: number;
  departmentId: number;
  url: string;
  enable: boolean;
  isVisit: boolean;
  source: string;
  studentSource: string;
  type: string | number;
  isFormal: boolean;
  createTime: any;
  circulationTime: any;
  idCard: string;
  project: string;
  code: any;
  receiveDate: any;
};

export default (props: any) => {
  const { hidden } = props;
  const { initialState } = useModel('@@initialState');
  const [renderData, setRenderData] = useState<any>(null);
  const [UploadFalg, setUploadVisible] = useState<boolean>(false);
  const [UploadUrl, setUploadUrl] = useState<string>('/sms/business/bizStudent/addSystemRepository');
  const [InfoVisibleFalg, setInfoVisible] = useState<boolean>(false);
  const [TabListNuber, setTabListNuber] = useState<any>('1');
  const [StudentIds, setStudentIds] = useState<any>([]);
  const departmentId = Dictionaries.getDepartmentList(initialState?.currentUser?.userid).id
  const [params, setParams] = useState<any>({ departmentId: departmentId })
  const actionRef = useRef<ActionType>();
  const callbackRef = () => {
    // @ts-ignore
    actionRef.current.reload();
  };
  useEffect(() => {
    if (TabListNuber == '7') {
      setParams({})
    }
  }, [TabListNuber])
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: '姓名',
      dataIndex: 'name',
      // width: 100,
      sorter: true,
      fixed: 'left',
      render: (text, record) => (
        <div>
          <a
            onClick={() => {
              setRenderData({ ...record });
              setInfoVisible(true);
            }}
          >
            {record.name}

            <SearchOutlined />
          </a>
        </div>
      ),
    },
    // {
    //   title: '企业负责人',
    //   dataIndex: 'chargePersonName',
    //   hideInTable: type == '学员' ? true : false,
    // },
    {
      title: '性别',
      dataIndex: 'sex',
      // width: 80,
      // search: false,
      valueType: 'select',
      valueEnum: {
        false: '男',
        true: '女',
      },
      render: (text, record) => (
        <span>{record.sex == null ? '未知' : record.sex ? '女' : '男'}</span>
      ),
      sorter: true,
    },
    {
      title: '身份证',
      dataIndex: 'idCard',
      hideInTable: true,
      sorter: true,
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      key: 'mobile',
      hideInTable: true,
    },
    {
      title: '微信号',
      dataIndex: 'weChat',
      key: 'weChat',
      hideInTable: true,
    },
    {
      title: '学员类型',
      dataIndex: 'type',
      valueType: 'select',
      sorter: true,
      order: 9,
      filters: true,
      filterMultiple: false,
      valueEnum: Dictionaries.getSearch('studentType'),
      render: (text, record) => <span>{Dictionaries.getName('studentType', record.type)}</span>,
    },
    {
      title: '项目总称',
      dataIndex: 'parentProjects',
      key: 'parentProjects',
      sorter: true,
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
      title: '咨询岗位',
      dataIndex: 'project',
      // search: false,
      sorter: true,
      key: 'project',
      valueType: 'cascader',
      fieldProps: {
        showSearch: { filter },
        options: Dictionaries.getCascader('dict_reg_job'),
      },
      render: (text, record) => (
        <span>{Dictionaries.getCascaderName('dict_reg_job', record.project)}</span>
      ),
    },
    {
      title: '咨询时间',
      key: 'createTime',
      sorter: true,
      dataIndex: 'createTime',
      valueType: 'dateRange',
      render: (text, record) => (
        <span>{record.createTime}</span>
      ),
    },
    {
      title: '客户来源',
      dataIndex: 'studentSource',
      valueType: 'select',
      sorter: true,
      valueEnum: Dictionaries.getSearch('dict_source'),
      render: (text, record) => (
        <span>{Dictionaries.getName('dict_source', record.studentSource)}</span>
      ),
    },
    // {
    //   title: '未领取天数',
    //   dataIndex: 'receiveDate',
    //   search: false,
    //   sorter: true,
    //   render: (text, record) => <span>{record.receiveDate}天</span>,
    // },
    {
      title: '领取次数',
      sorter: true,
      dataIndex: 'receiveNum',
      key: 'receiveNum',
    },
    {
      title: '当前所在部门',
      sorter: true,
      dataIndex: 'departmentId',
      search: false,
      render: (text, record) => (
        <span>
          {Dictionaries.getDepartmentName(record.departmentId).join('-')}
          {/* {record.departmentName} */}
        </span>
      ),
    },
    {
      title: '备注',
      dataIndex: 'description',
      ellipsis: true,
      tip: '备注过长会自动收缩',
    },
    {
      title: '流转时间',
      sorter: true,
      key: 'circulationTime',
      dataIndex: 'circulationTime',
      valueType: 'dateRange',
      render: (text, record) => (
        <span>{record.circulationTime}</span>
      ),
    },
    {
      title: '信息提供人',
      dataIndex: 'providerName',
      key: 'providerName',
      hideInTable: true,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 260,
      key: 'options',
      fixed: 'right',
      render: (text, record, _, action) => (
        <>
          <Popconfirm
            key="deletePop"
            title="是否确定删除？"
            style={{ marginRight: '15px', marginBottom: '8px' }}
            onConfirm={() => {
              request.delete('/sms/business/bizStudentUser', { id: record.id }).then((res: any) => {
                if (res.status == 'success') {
                  message.success('删除成功');
                  callbackRef();
                }
              });
            }}
            okText="删除"
            cancelText="取消"
          >
            <a key="deletes" style={{ color: 'red' }}>
              删除
            </a>
          </Popconfirm>
        </>

      )
    }
  ];
  let sortList: any = {
    ['receiveNum,circulationTime']: 'asc,desc',
  };
  let toolbar = {
    menu: {
      type: 'tab',
      items: [
        {
          key: 'fen',
          label: (<span>分公司资源库</span>)
        },
        {
          key: 'zong',
          label: (<span>总公司资源库</span>)
        },
        {
          key: 'all',
          label: (<span>所有资源</span>)
        },
      ],
      onChange: (key: string) => {
        if (key == 'fen') {
          setParams({ departmentId: departmentId })
        } else if (key == 'zong') {
          setParams({ 'departmentId-in': '15,-1' })
        } else {
          setParams({})
        }
        callbackRef();
      }
    }
  }
  return (
    <>
      <PageContainer
        onTabChange={(e) => {
          setTabListNuber(e);
          callbackRef();
        }}
        tabList={[
          {
            tab: '流转资源库',
            key: '1',
          },
          // {
          //   tab: '系统资源库',
          //   key: '2',
          // },
          {
            tab: '正式学员流转库',
            key: '4',
          },
          {
            tab: '无效数据库',
            key: '7',
          },
        ]}
      >
        <Tables
          columns={columns}
          actionRef={actionRef}
          toolbar={TabListNuber != '7' ? toolbar : undefined}
          request={{
            url: '/sms/business/bizStudentUser',
            params: { source: TabListNuber, 'userId-isNull': true, ...params },
            sortList: sortList,
          }}
          search={hidden ? false : { defaultCollapsed: false }}
          rowSelection={{
            // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
            // 注释该行则默认不显示下拉选项
            selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
            onChange: (e, selectedRows) => {
              setStudentIds(e);
            },
          }}
          toolBarRender={[
            <a
              hidden={TabListNuber == '1' || hidden}
              download="新学员导入模板"
              href="./template/新学员导入模板.xlsx"
            >
              下载导入模板
            </a>,
            <Button
              key="button"
              hidden={TabListNuber == '2' || hidden}
              icon={<DownloadOutlined />}
              type="primary"
              onClick={() => {
                setUploadUrl('/sms/business/bizStudent/batch/importForOtherOfSpecial')
                setUploadVisible(true);
              }}
            >
              导入特殊资源
            </Button>,
            <Button
              key="button"
              hidden={TabListNuber == '1' || hidden}
              icon={<DownloadOutlined />}
              type="primary"
              onClick={() => {
                setUploadUrl('/sms/business/bizStudent/addSystemRepository')
                setUploadVisible(true);
              }}
            >
              批量导入
            </Button>,
            <Button
              key="button"
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => {
                if (StudentIds.length == 0) {
                  message.error('请选择需要领取的学员!');
                  return;
                }
                console.log(StudentIds);
                request
                  .post('/sms/business/bizStudentUser/receive', {
                    ids: StudentIds.join(','),
                    source: TabListNuber,
                  })
                  .then((res: any) => {
                    if (res.status == 'success') {
                      message.success('操作成功');
                      callbackRef();
                    }
                  });
              }}
            >
              领取
            </Button>,
          ]}
        />

        {UploadFalg && (
          <Upload
            setModalVisible={() => setUploadVisible(false)}
            modalVisible={UploadFalg}
            url={UploadUrl}
            type={'student'}
            upType="post2"
            uploadtype="student"
            propsData={{ resourceType: TabListNuber }}
            callbackRef={() => callbackRef()}
          />
        )}
        {InfoVisibleFalg && (
          <StudentInfo
            setModalVisible={() => setInfoVisible(false)}
            modalVisible={InfoVisibleFalg}
            renderData={renderData}
            callbackRef={() => callbackRef()}
            mobileHide={true}
          />
        )}
      </PageContainer>
    </>
  );
};
