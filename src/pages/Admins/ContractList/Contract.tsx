import Tables from '@/components/Tables';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import Dictionaries from '@/services/util/dictionaries';
import moment from 'moment';
import request from '@/services/ant-design-pro/apiRequest';
import { useEffect, useRef, useState } from 'react';
import { Button, Image, message, Popconfirm, Space, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import ChargeIframe from '../AdminCharge/ChargeIframe';
import StudentInfo from '../StudentManage/studentInfo';
import ContractInfo from './ContractInfo';
import filter from '@/services/util/filter';
import DownTable from '@/services/util/timeFn';

type GithubIssueItem = {
  code: string;
  type: string;
  project: string;
  name: string;
  parameter: string;
  auditTime: string;
  downloadUrl: string;
  otherSignTime: string;
  createTime: string;
  studentName: string;
  filingNum: string;
  codeFile: string;
  viewUrl: any;
  id: number;
  studentUserId: number;
  isFinish: boolean;
  isFiling: boolean;
  isRepealed: string;
};
const tableHeard = {
  序号: 'nums',
  合同对应项目: 'project',
  归档编号: 'filingNum',
  签订日期: 'otherSignTime',
  对方单位: 'studentName',
  合同总金额: 'amount',
  我方单位: 'companyName',
  招生老师姓名: 'userName',
  部门: 'departmentId',
  合同编号: 'num',
};
export default (props: any) => {
  const { type = '', setCompanyId, onCancel, mobile = false } = props;
  const [renderData, setRenderData] = useState<any>(null);
  const [InfoVisibleFalg, setInfoVisible] = useState<boolean>(false);
  const [isModalVisibles, setisModalVisibles] = useState<boolean>(false);
  const [ModalVisibles, setModalVisibles] = useState<boolean>(false);
  const [selectedRowsList, setselectedRowsList] = useState<any>([]);
  const [selectedRows, setselectedRows] = useState<any>([]);
  const [imgSrc, setImgSrc] = useState();
  const actionRef = useRef<ActionType>();
  const url2 = '/sms/business/bizStudentUser';
  const callbackRef = () => {
    // @ts-ignore
    actionRef.current.reload();
  };
  const filing = (id: string | number) => {
    request.post('/sms/contract/conContract/filing', { id: id }).then((res: any) => {
      if (res.status == 'success') {
        message.success('操作成功');
        callbackRef();
      }
    });
  };
  useEffect(() => {
    Dictionaries.getDepartmentName();
  }, []);
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: '合同编号',
      dataIndex: 'num',
      width: 130,
      sorter: true,
      fixed: 'left'
    },
    {
      width: 100,
      title: '合同名称',
      dataIndex: 'name',
      sorter: true,
    },
    {
      title: '学员姓名',
      width: 100,
      dataIndex: 'studentName',
      render: (text, record) => (
        <a
          onClick={() => {
            request.get(url2, { id: record.studentUserId }).then((res: any) => {
              setRenderData({ ...res.data.content[0] });
              setInfoVisible(true);
            });
          }}
        >
          {record.studentName}
        </a>
      ),
    },
    {
      width: 100,
      title: '学员类型',
      dataIndex: 'type',
      filters: true,
      filterMultiple: false,
      valueType: 'select',
      valueEnum: {
        0: {
          text: '个人',
        },
        1: {
          text: '企业/同行机构',
        },
        2: {
          text: '代理人',
        },
      },
      render: (text, record) => <span>{Dictionaries.getName('studentType', record.type)}</span>,
    },
    {
      width: 100,
      title: '项目总称',
      dataIndex: 'parentProjects',
      key: 'parentProjects',
      // sorter: true,
      ellipsis: true,
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
      width: 100,
      title: '对应项目',
      dataIndex: 'project',
      // search: false,
      key: 'project',
      sorter: true,
      valueType: 'cascader',
      fieldProps: {
        options: Dictionaries.getCascader('dict_reg_job'),
        showSearch: { filter },
      },
      render: (text, record) => (
        <span>{Dictionaries.getCascaderName('dict_reg_job', record.project)}</span>
      ),
    },

    {
      width: 100,
      title: '合同金额',
      dataIndex: 'amount',
    },
    {
      width: 100,
      title: '签署老师',
      dataIndex: 'userName',
    },
    {
      width: 90,
      title: '备注',
      dataIndex: 'description',
      ellipsis: true,
      tip: '过长会自动收缩',
    },
    {
      width: 100,
      title: '签署状态',
      dataIndex: 'isFinish',
      filters: true,
      filterMultiple: false,
      valueType: 'select',
      valueEnum: {
        false: {
          text: '未签署',
        },
        true: {
          text: '已签署',
        },
      },
      render: (text, record) => (
        <Tag color={!record.isFinish ? '#FF0000' : '#87d068'}>
          {record.isFinish ? '已签署' : '未签署'}
        </Tag>
      ),
    },
    {
      width: 100,
      title: '签署时间',
      key: 'otherSignTime',
      dataIndex: 'otherSignTime',
      valueType: 'dateRange',
      sorter: true,
      render: (text, record) => (
        <span>
          {record.otherSignTime}
        </span>
      ),
    },
    {
      width: 100,
      title: '归档状态',
      dataIndex: 'filingNum',
      filters: true,
      filterMultiple: false,
      valueType: 'select',
      valueEnum: {
        null: {
          text: '未归档',
        },
        GD: {
          text: '已归档',
        },
      },
      render: (text, record) => (
        <Tag color={!record?.filingNum ? '#FF0000' : '#87d068'}>
          {record.filingNum ? '已归档' : '未归档'}
        </Tag>
      ),
    },
    {
      title: '归档编号',
      dataIndex: 'filingNum',
      width: 130,
      sorter: true,
    },
    {
      width: 100,
      title: '审核时间',
      key: 'auditTime',
      dataIndex: 'auditTime',
      valueType: 'dateRange',
      sorter: true,
      render: (text, record) => (
        <span>{record.auditTime}</span>
      ),
    },
    {
      width: 100,
      title: '创建时间',
      key: 'createTime',
      dataIndex: 'createTime',
      valueType: 'dateRange',
      sorter: true,
      render: (text, record) => (
        <span>{record.createTime}</span>
      ),
    },
    {
      width: 100,
      title: '合同状态',
      key: 'isRepealed',
      dataIndex: 'isRepealed',
      valueType: 'dateRange',
      sorter: true,
      render: (text, record) => (
        <Tag color={record.isRepealed == '1' ? '#FF0000' : '#87d068'}>
          {record.isRepealed == '1' ? '已废除' : '生效中'}
        </Tag>
      ),
    },
    {
      width: 100,
      title: '查看',
      dataIndex: 'options',
      search: false,
      render: (text, record) => [
        <Button
          key="eidt"
          type="primary"
          size="small"
          hidden={type === 'contract'}
          icon={<SearchOutlined />}
          style={{ marginRight: '15px' }}
          onClick={() => {
            // setImgSrc(record.viewUrl);
            // setisModalVisibles(true);
            setRenderData(record);
            setModalVisibles(true);
          }}
        >
          {/* 查看 */}
        </Button>,
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
    {
      title: '操作',
      search: false,
      fixed: 'right',
      width: 90,
      render: (text, record) => [
        <Popconfirm
          title="是否归档"
          onConfirm={() => {
            filing(record.id);
          }}
          okText="归档"
        >
          <Button type="primary" size="small" key="guidang" style={{ marginBottom: '10px' }}>
            合同归档
          </Button>
        </Popconfirm>,
        <Popconfirm
          title="是否废除"
          okText="废除"
          cancelText="取消"
          key="deletes"
          onConfirm={() => {
            request
              .post('/sms/contract/conContract/repealed', { id: record.id })
              .then((res: any) => {
                if (res.status == 'success') {
                  message.success('操作成功!');
                  callbackRef();
                }
              });
          }}
        >
          <Button key="delete" type="primary" size="small" danger style={{ marginBottom: '10px' }}>
            废除合同
          </Button>
        </Popconfirm>,
        <Button key="upDown" type="primary" size="small" href={record.downloadUrl}>
          合同下载
        </Button>,
      ],
    },
  ];
  const params: any = {};
  params.auditType = 5;
  params.confirm = true;
  if (mobile) params.mobile = mobile;
  return (
    <>
      <Tables
        actionRef={actionRef}
        columns={columns}
        request={{ url: '/sms/contract/conContract', params: params }}
        search={{ defaultCollapsed: true, defaultColsNumber: 10 }}
        scroll={{ x: 1500 }}
        rowSelection={{
          // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
          // 注释该行则默认不显示下拉选项
          // selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
          onChange: (e, selectedRows) => {
            setselectedRowsList(e as []);
            setselectedRows(selectedRows);
          },
        }}
        tableAlertOptionRender={() => {
          return (
            <Space size={24}>
              <a
                onClick={() => {
                  if (selectedRows.length == 0) {
                    message.error('请选择需要导出的合同！');
                    return;
                  }
                  DownTable(selectedRows, tableHeard, '合同信息', 'charge');
                }}
              >
                批量导出
              </a>
              <a
                onClick={() => {
                  filing(selectedRowsList.join(','));
                }}
              >
                批量归档
              </a>
            </Space>
          );
        }}
      />
      <ChargeIframe
        previewVisible={isModalVisibles}
        setPreviewVisible={() => setisModalVisibles(false)}
        previewImage={imgSrc}
      />
      {InfoVisibleFalg && (
        <StudentInfo
          setModalVisible={() => setInfoVisible(false)}
          modalVisible={InfoVisibleFalg}
          renderData={renderData}
          callbackRef={() => callbackRef()}
        />
      )}
      {ModalVisibles && (
        <ContractInfo
          setModalVisibles={() => setModalVisibles(false)}
          ModalVisibles={ModalVisibles}
          renderData={renderData}
        />
      )}
    </>
  );
};
