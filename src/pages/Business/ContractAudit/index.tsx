import Tables from '@/components/Tables';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import Dictionaries from '@/services/util/dictionaries';
import moment from 'moment';
import request from '@/services/ant-design-pro/apiRequest';
import { useEffect, useRef, useState } from 'react';
import { Badge, Button, Image, message, Popconfirm, Tag } from 'antd';
import { FileDoneOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import ChargeIframe from '../../Admins/AdminCharge/ChargeIframe';
import Audit from '../../Admins/AdminCharge/Audit';
import StudentInfo from '../../Admins/StudentManage/studentInfo';
import ContractInfo from '../../Admins/ContractList/ContractInfo';
import filter from '@/services/util/filter';
type GithubIssueItem = {
  code: string;
  type: string;
  project: string;
  name: string;
  parameter: string;
  createTime: string;
  codeFile: string;
  viewUrl: any;
  id: number;
  studentUserId: number;
  studentId: number;
  auditType: string;
  studentName: string;
  downloadUrl: string;
  confirm: boolean;
  isFiling: boolean;
};
export default (props: any) => {
  const { type = '', hidden, onCancel } = props;
  const [AuditVisibleFalg, setAuditVisible] = useState<boolean>(false);
  const [isModalVisibles, setisModalVisibles] = useState<boolean>(false);
  const [Params, setParams] = useState<any>({ 'auditType-isNull': true });
  const [ModalVisibles, setModalVisibles] = useState<boolean>(false);
  const [InfoVisibleFalg, setInfoVisible] = useState<boolean>(false);
  const [renderData, setRenderData] = useState<any>(null);
  const [imgSrc, setImgSrc] = useState();
  const [Badges, setBadges] = useState<any>([0, 0]);
  const actionRef = useRef<ActionType>();
  const url2 = '/sms/business/bizStudentUser';
  const callbackRef = (value = true) => {
    // @ts-ignore
    actionRef.current.reload();
    if (value) BadgesNumber();
  };
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: '合同名称',
      dataIndex: 'name',
    },
    {
      title: '学员姓名',
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
      title: '对应项目',
      dataIndex: 'project',
      // search: false,
      key: 'project',
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
      title: '合同金额',
      dataIndex: 'amount',
      search: false,
    },
    {
      title: '签署老师',
      dataIndex: 'userName',
      search: false,
    },
    {
      title: '备注',
      dataIndex: 'description',
      search: false,
      ellipsis: true,
      tip: '过长会自动收缩',
    },
    {
      title: '审核状态',
      dataIndex: 'confirm',

      render: (text, record) => (
        <>
          {record.confirm === false ? (
            <Tag color={'#FF0000'}>部门主管未通过</Tag>
          ) : record.auditType == '5' ? (
            <Tag color={'#87d068'}>已通过</Tag>
          ) : (
            <Tag color={'#f50'}>未审核</Tag>
          )}
        </>
      ),
    },
    {
      title: '审核建议',
      dataIndex: 'remark',
      search: false,
      ellipsis: true,
      tip: '过长会自动收缩',
    },
    {
      title: '审核人',
      dataIndex: 'auditor',
      search: false,
    },
    {
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
         />,
      ],
    },
    {
      title: '审核操作',
      search: false,
      render: (text, record) => [
        <Popconfirm
          title="合同审核"
          okText="通过"
          key="look-contract-audit"
          cancelText="未通过"
          onConfirm={(e) => {
            // callbackRef();
            e?.stopPropagation();
            //缴费审核
            setRenderData({
              auditNum: record?.auditType ? record.auditType : 4,
              confirm: true,
              id: record.id,
            });
            setAuditVisible(true);
          }}
          onCancel={() => {
            setRenderData({
              auditNum: record?.auditType ? record.auditType : 4,
              confirm: false,
              id: record.id,
            });
            setAuditVisible(true);
          }}
        >
          <Button
            type="primary"
            size="small"
            icon={<FileDoneOutlined />}
            style={{ marginRight: '10px', marginBottom: '8px' }}
          >
            审核
          </Button>
        </Popconfirm>,
        <Button key="upDown" type="primary" size="small" href={record.downloadUrl}>
          合同下载
        </Button>,
      ],
    },
  ];
  const BadgesNumber = () => {
    request
      .get('/sms/contract/conContract/statistics', {
        array: JSON.stringify([
          { 'auditType-isNull': true },
          // { auditType: '5', 'confirm-isNot': false },
        ]),
      })
      .then((res) => {
        setBadges(res.data);
      });
  };
  useEffect(() => {
    BadgesNumber();
  }, []);
  const params: any = Params;
  // params['auditType-isNull'] = true;
  return (
    <PageContainer
      header={{
        title: hidden ? '' : '合同审核',
      }}
    >
      <Tables
        actionRef={actionRef}
        columns={columns}
        className="ContractAudit"
        request={{ url: '/sms/contract/conContract', params: params }}
        search={hidden ? false : { defaultCollapsed: false }}
        toolbar={{
          menu: {
            type: 'tab',
            // activeKey: activeKey,
            items: [
              {
                key: '4',
                label: (
                  <Badge count={Badges[0]} size="small" offset={[5, 3]}>
                    <span>①主管审核</span>
                  </Badge>
                ),
              },
              // {
              //   key: '5',
              //   label: (
              //     <Badge count={Badges[1]} size="small" offset={[5, 3]}>
              //       <span>②财务审核</span>
              //     </Badge>
              //   ),
              // },
              {
                key: '5',
                label: <span>审核完成</span>,
              },
              {
                key: 'false',
                label: <span>审核未通过</span>,
              },
            ],
            onChange: (key: any) => {
              if (key === 'false') {
                setParams({ confirm: false });
              } else if (key === '4') {
                setParams({ 'auditType-isNull': true });
              } else {
                setParams({ auditType: key, 'confirm-isNot': false });
              }
              callbackRef(false);
            },
          },
        }}
      />
      <ChargeIframe
        previewVisible={isModalVisibles}
        setPreviewVisible={() => setisModalVisibles(false)}
        previewImage={imgSrc}
      />
      {AuditVisibleFalg && (
        <Audit
          setModalVisible={() => setAuditVisible(false)}
          modalVisible={AuditVisibleFalg}
          callbackRef={() => callbackRef()}
          renderData={renderData}
        />
      )}
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
    </PageContainer>
  );
};
