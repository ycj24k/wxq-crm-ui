import Tables from '@/components/Tables';
import { PageContainer } from '@ant-design/pro-layout';
import { ActionType, ProColumns } from '@ant-design/pro-table';
import Dictionaries from '@/services/util/dictionaries';
import moment from 'moment';
import request from '@/services/ant-design-pro/apiRequest';
import { useEffect, useRef, useState } from 'react';
import { Badge, Button, Image, message, Popconfirm, Tag, Tooltip } from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FieldNumberOutlined,
  FileDoneOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import Audit from '../../../Admins/AdminCharge/Audit';
import PaymentInfo from '../List/PaymentInfo';
import AddModel from '../List/AddModel';
import fetchDownload from '@/services/util/fetchDownload';
type GithubIssueItem = {
  num: string;
  code: string;
  type: string;
  project: string;
  name: string;
  parameter: string;
  createTime: string;
  codeFile: string;
  viewUrl: any;
  id: number;
  studentId: number;
  auditNum: string;
  auditType: string;
  paymentTime: string;
  studentName: string;
  confirm: boolean;
  hasInvoice: boolean;
  isSubmit: boolean;
};
export default (props: any) => {
  const [AuditVisibleFalg, setAuditVisible] = useState<boolean>(false);
  const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
  const [Params, setParams] = useState<any>({
    'auditNum-isNull': true,
    enable: true,
    isSubmit: true,
  });
  const [InfoVisibleFalg, setInfoVisible] = useState<boolean>(false);
  const [auditNum, setAuditNum] = useState<any>(7);
  const [renderData, setRenderData] = useState<any>(null);
  const [Badges, setBadges] = useState<any>([0, 0]);
  const actionRef = useRef<ActionType>();
  const url2 = '/sms/business/bizStudent';
  const callbackRef = (value = true) => {
    // @ts-ignore
    actionRef.current.reload();
    if (value) BadgesNumber();
  };
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      width: 80,
      title: '编号',
      dataIndex: 'num',
      sorter: true,
    },
    {
      width: 100,
      title: '申请部门',
      dataIndex: 'departmentName',
      sorter: true,
    },
    {
      width:90,
      title: '申请人',
      dataIndex: 'userName',
      sorter: true,
    },
    {
      width:100,
      title: '收款单位',
      dataIndex: 'payee',
      sorter: true,
    },
    {
      width:100,
      title: '付款明细',
      dataIndex: 'details',
      // search: false,
      // ellipsis: true,
      sorter: true,
      // tip: '过长会自动收缩',
    },
    {
      width:100,
      title: '付款金额',
      dataIndex: 'amount',
      sorter: true,
      // search: false,
    },
    {
      width:90,
      title: '负责人',
      dataIndex: 'chargePersonName',
      sorter: true,
    },
    {
      title: '申请时间',
      key: 'createTime',
      dataIndex: 'createTime',
      valueType: 'dateRange',
      sorter: true,
      render: (text, record) => <span>{record.createTime}</span>,
    },
    {
      title: '要求付款时间',
      key: 'paymentTime',
      dataIndex: 'paymentTime',
      valueType: 'dateRange',
      sorter: true,
      render: (text, record) => <span>{record.paymentTime}</span>,
    },
    {
      width: 100,
      title: '有无发票',
      dataIndex: 'hasInvoice',
      search: false,
      sorter: true,
      render: (text, record) => <span>{record.hasInvoice ? '有发票' : '无发票'}</span>,
    },
    {
      title: '备注',
      dataIndex: 'description',
      search: false,
      // ellipsis: true,
      // tip: '过长会自动收缩',
    },
    {
      width: 100,
      title: '审核状态',
      dataIndex: 'confirm',
      sorter: true,
      render: (text, record) => (
        <>
          {record.confirm === false ? (
            <Tag color={'#FF0000'}>{record.auditType == '7' ? '部门主管' : '财务'}未通过</Tag>
          ) : record.auditType == '8' ? (
            <Tag color={'#87d068'}>已通过</Tag>
          ) : (
            <Tag color={'#f50'}>未审核</Tag>
          )}
        </>
      ),
    },
    {
      width: 100,
      title: '审核建议',
      dataIndex: 'remark',
      search: false,
      // ellipsis: true,
      sorter: true,
      // tip: '过长会自动收缩',
    },
    {
      width: 90,
      title: '审核人',
      dataIndex: 'auditor',
      search: false,
      sorter: true,
    },
    {
      title: '操作',
      search: false,
      width: 180,
      render: (text, record) => [
        <Tooltip placement="topLeft" key="eidts" title={'查看'}>
          <Button
            key="eidt"
            type="primary"
            size="small"
            icon={<SearchOutlined />}
            style={{ marginRight: '10px', marginBottom: '8px' }}
            onClick={() => {
              setRenderData(record);
              setInfoVisible(true);
            }}
          >
            查看
          </Button>
        </Tooltip>,
        <Tooltip placement="topLeft" key="eidts" title={'重新提交'}>
          <Button
            key="eidt"
            type="primary"
            size="small"
            hidden={record.isSubmit}
            icon={<EditOutlined />}
            style={{ marginRight: '10px', marginBottom: '8px' }}
            onClick={() => {
              request
                .post('/sms/business/bizPaymentApply', { id: record.id, isSubmit: true })
                .then((res) => {
                  if (res.status == 'success') {
                    message.success('重新提交成功');
                    callbackRef();
                  }
                });
            }}
          >
            重新提交
          </Button>
        </Tooltip>,
        <Tooltip placement="topLeft" title={'审核'} key="looks">
          <Popconfirm
            title="审核"
            okText="通过"
            key="look"
            cancelText="未通过"
            onConfirm={(e) => {
              // callbackRef();
              e?.stopPropagation();
              //缴费审核
              setRenderData({
                auditNum: record?.auditNum ? record.auditNum : 6,
                confirm: true,
                id: record.id,
              });
              setAuditVisible(true);
            }}
            onCancel={() => {
              setRenderData({
                auditNum: record?.auditNum ? record.auditNum : 6,
                confirm: false,
                id: record.id,
              });
              setAuditVisible(true);
            }}
          >
            <Button
              type="primary"
              key="audit"
              size="small"
              hidden={!record.isSubmit}
              icon={<FileDoneOutlined />}
              style={{ marginRight: '10px', marginBottom: '8px' }}
            >
              审核
            </Button>
          </Popconfirm>
        </Tooltip>,
        <Tooltip placement="topLeft" title={'编辑'} key="editables">
          <Button
            key="editable"
            type="primary"
            size="small"
            icon={<EditOutlined />}
            className="tablebut"
            style={{ marginRight: '10px', marginBottom: '8px' }}
            onClick={async () => {
              setRenderData({ ...record, type: 'eidt', renderDataNum: 0, audit: auditNum });
              setModalVisible(true);
            }}
          >
            编辑
          </Button>
        </Tooltip>,
        <Tooltip placement="topLeft" title={'废除'} key="enable">
          <Popconfirm
            title="是否废除"
            okText="废除"
            key="enable"
            cancelText="取消"
            onConfirm={(e) => {
              request.post('/sms/business/bizPaymentApply/disable/' + record.id).then((res) => {
                if (res.status == 'success') {
                  message.success('操作成功');
                  callbackRef();
                }
              });
            }}
          >
            <Button
              key="enable"
              type="primary"
              size="small"
              danger
              style={{ marginRight: '10px', marginBottom: '8px' }}
              icon={<DeleteOutlined />}
              className="tablebut"
            >
              废除
            </Button>
          </Popconfirm>
        </Tooltip>,
        <Tooltip placement="topLeft" key="dapchu" title={'导出付费信息'}>
          <Button
            type="primary"
            key="dapchu"
            hidden={Params.auditNum != '8'}
            size="small"
            style={{ marginRight: '10px', marginBottom: '8px' }}
            icon={<FieldNumberOutlined />}
            onClick={() => {
              fetchDownload('/sms/business/bizPaymentApply/export', record.id);
            }}
          >
            导出付费信息
          </Button>
        </Tooltip>,
        <Tooltip placement="topLeft" key="dayin" title={'打印'}>
          <Button
            type="primary"
            key="打印"
            hidden={Params.auditNum != '8'}
            size="small"
            style={{ marginRight: '10px', marginBottom: '8px' }}
            icon={<DownloadOutlined />}
            onClick={() => {
              let tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
              let tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
              let headers = {}
              headers[tokenName] = tokenValue;
              fetch('/sms/business/bizPaymentApply/export/2?id=' + record.id, {
                method: 'GET',
                headers: headers,
              }).then((res: any) => {
                res.blob().then((blob: any) => {
                  const iframe = document.createElement('iframe')
                  iframe.src = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
                  iframe.style.display = 'none'
                  document.body.appendChild(iframe)
                  iframe.contentWindow?.print()
                });
              });
            }}
          >
            打印
          </Button>
        </Tooltip>,
      ],
    },
  ];
  const BadgesNumber = () => {
    request
      .get('/sms/business/bizPaymentApply/statistics', {
        array: JSON.stringify([
          { 'auditNum-isNull': true, isSubmit: true },
          { auditNum: '7', confirm: true, isSubmit: true },
          { enable: true, isSubmit: false },
        ]),
      })
      .then((res) => {
        setBadges(res.data);
      });
  };
  useEffect(() => {
    BadgesNumber();
    // request.get('/sms/business/bizPaymentApply/totals', {
    //   array: JSON.stringify([
    //     { 'auditNum-isNull': true },
    //     { auditNum: '7', 'confirm-isNot': false },
    //   ]),
    //   totalFields: 'amount',
    // });
  }, []);
  let params: any = Params;
  let sortList = {
    ['num,updateTime']: 'desc,desc',
  };
  // params['auditNum-isNull'] = true;
  return (
    <PageContainer>
      <Tables
        actionRef={actionRef}
        columns={columns}
        className="PaymentAudit"
        search={{
          labelWidth: 120,
          defaultCollapsed: true,
          defaultColsNumber: 6
        }}
        request={{ url: '/sms/business/bizPaymentApply', params: params, sortList: sortList }}
        toolbar={{
          menu: {
            type: 'tab',
            // activeKey: activeKey,
            items: [
              {
                key: '6',
                label: (
                  <Badge count={Badges[0]} size="small" offset={[5, 3]}>
                    <span>①主管审核</span>
                  </Badge>
                ),
              },
              {
                key: '7',
                label: (
                  <Badge count={Badges[1]} size="small" offset={[5, 3]}>
                    <span>②财务审核</span>
                  </Badge>
                ),
              },
              {
                key: '8',
                label: <span>审核完成</span>,
              },
              {
                key: 'false',
                label: (
                  <Badge count={Badges[2]} size="small" offset={[5, 3]}>
                    <span>审核未通过</span>
                  </Badge>
                ),
              },
              {
                key: 'enable',
                label: <span>已废除</span>,
              },
            ],
            onChange: (key: any) => {
              if (key === 'false') {
                setParams({ isSubmit: false, enable: true });
              } else if (key === '6') {
                setParams({ 'auditNum-isNull': true, enable: true, isSubmit: true });
              } else if (key === 'enable') {
                setParams({ enable: false });
              } else {
                setParams({ auditNum: key, 'confirm-isNot': false, enable: true, isSubmit: true });
              }
              setAuditNum(Number(key) + 1);
              callbackRef(false);
            },
          },
        }}
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
        <PaymentInfo
          setModalVisible={() => setInfoVisible(false)}
          modalVisible={InfoVisibleFalg}
          renderData={renderData}
          callbackRef={() => callbackRef()}
        />
      )}
      {modalVisibleFalg && (
        <AddModel
          setModalVisible={() => setModalVisible(false)}
          modalVisible={modalVisibleFalg}
          renderData={renderData}
          callbackRef={() => callbackRef()}
        />
      )}
    </PageContainer>
  );
};
