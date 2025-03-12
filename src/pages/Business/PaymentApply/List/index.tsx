import Tables from '@/components/Tables';
import { PageContainer } from '@ant-design/pro-layout';
import { ActionType, ProColumns } from '@ant-design/pro-table';
import Dictionaries from '@/services/util/dictionaries';
import moment from 'moment';
import request from '@/services/ant-design-pro/apiRequest';
import { useRef, useState } from 'react';
import { Button, message, Popconfirm, Space, Tag, Tooltip } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  FieldNumberOutlined,
  FileDoneOutlined,
  PlusOutlined,
  SearchOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import ModelAdd from './AddModel';
import PaymentInfo from './PaymentInfo';
import fetchDownload from '@/services/util/fetchDownload';
import DownTable from '@/services/util/timeFn';
import { useModel } from 'umi';
type GithubIssueItem = {
  viewUrl: any;
  id: number;
  auditNum: number | string;
  createTime: string;
  studentName: string;
  paymentTime: string;
  confirm: boolean;
  hasInvoice: boolean;
};
const downObj = {
  序号: 'num',
  申请部门: 'departmentName',
  申请日期: 'chargeTime',
  申请人: 'userName',
  收款单位: 'payee',
  收款方联系电话: 'mobile',
  开户行详细到支行: 'bank',
  账号: 'account',
  付款方式: 'source',

  付款明细: 'details',
  付款金额: 'amount',
  要求付款时间: 'paymentTime',
  负责人: 'chargePersonName',
  备注: 'description',
  是否有发票: 'hasInvoice',
};
export default (props: any) => {
  let tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
  let tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
  const { initialState, setInitialState } = useModel('@@initialState');
  // @ts-ignore
  const { currentUser } = initialState;

  let obj = {};
  obj[tokenName] = tokenValue;
  const [InfoVisibleFalg, setInfoVisible] = useState<boolean>(false);
  const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
  const [renderData, setRenderData] = useState<any>(null);
  const [selectedRow, setselectedRow] = useState<any>([]);
  const actionRef = useRef<ActionType>();
  const callbackRef = (value = true) => {
    // @ts-ignore
    actionRef.current.reload();
  };
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: '编号',
      dataIndex: 'num',
      width: 130,
      sorter: true,
    },
    {
      title: '申请部门',
      dataIndex: 'departmentName',
      search: false,
      sorter: true,
    },
    {
      title: '申请人',
      dataIndex: 'userName',
      sorter: true,
    },
    {
      title: '收款单位',
      dataIndex: 'payee',
      sorter: true,
      // search: false,
    },
    {
      title: '付款明细',
      dataIndex: 'details',
      // search: false,
      // ellipsis: true,
      // tip: '过长会自动收缩',
      sorter: true,
    },
    {
      title: '付款金额',
      dataIndex: 'amount',
      sorter: true,
      // search: false,
    },
    {
      title: '负责人',
      dataIndex: 'chargePersonName',
      sorter: true,
    },
    {
      title: '付款方式',
      dataIndex: 'source',
      hideInTable: true,
      valueType: 'select',
      valueEnum: Dictionaries.getSearch('dict_stu_refund_type')
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
      title: '备注',
      dataIndex: 'description',
      search: false,
      // ellipsis: true,
      // tip: '过长会自动收缩',
    },
    {
      title: '审核状态',
      dataIndex: 'confirm',
      order: 9,
      sorter: true,
      filterMultiple: false,
      // ellipsis: false,
      // filters: true,
      valueType: 'select',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '此项为必填项',
          },
        ],
      },
      valueEnum: {
        null: {
          text: <Tag color={'#f50'}>未审核</Tag>,
          status: 'Processing',
        },
        ing: {
          text: <Tag color={'#2db7f5'}>审核中</Tag>,
          status: 'ing',
        },
        true: {
          text: <Tag color={'#87d068'}>审核通过</Tag>,
          status: 'Success',
        },
        false: {
          text: <Tag color={'#FF0000'}>未通过</Tag>,
          status: 'Error',
        },
      },
      render: (text, record) => (
        <div>
          {record.confirm === false ? (
            <Tag color={'#FF0000'}>{record.auditNum == '7' ? '部门主管' : '财务'}未通过</Tag>
          ) : record.auditNum == '8' ? (
            <Tag color={'#87d068'}>审核通过</Tag>
          ) : record.auditNum ? (
            <Tag color={'#2db7f5'}>{record.auditNum == '7' ? '部门主管' : '财务'}审核中</Tag>
          ) : (
            <Tag color={'#f50'}>未审核</Tag>
          )}
        </div>
      ),
    },
    {
      title: '有无发票',
      dataIndex: 'hasInvoice',
      search: false,
      sorter: true,
      render: (text, record) => <span>{record.hasInvoice ? '有发票' : '无发票'}</span>,
    },
    {
      title: '操作',
      search: false,
      width: 180,
      render: (text, record) => [
        <Tooltip placement="topLeft" title={'编辑'} key="editables">
          <Button
            key="editable"
            type="primary"
            size="small"
            hidden={Boolean(record.auditNum)}
            icon={<EditOutlined />}
            className="tablebut"
            onClick={async () => {
              setRenderData({ ...record, type: 'eidt', renderDataNum: 0 });
              setModalVisible(true);
            }}
          >
            编辑
          </Button>
        </Tooltip>,
        <Tooltip placement="topLeft" title={'查看'} key="look">
          <Button
            key="eidt"
            type="primary"
            size="small"
            icon={<SearchOutlined />}
            style={{ marginRight: '8px' }}
            onClick={() => {
              setRenderData(record);
              setInfoVisible(true);
            }}
          >
            查看
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
            hidden={record.auditNum != '8'}
            size="small"
            icon={<FieldNumberOutlined />}
            onClick={() => {
              fetchDownload('/sms/business/bizPaymentApply/export', record.id);
            }}
          >
            导出付费信息
          </Button>
        </Tooltip>,
      ],
    },
  ];
  let params: any = {};
  let sortList = {
    ['confirm,num,updateTime']: 'asc,desc,desc',
  };
  // params.auditNum = 8;
  // params['confirm-isNot'] = false;
  // params.createBy = currentUser.userid;
  return (
    <PageContainer>
      <Tables
        actionRef={actionRef}
        columns={columns}
        className="Payment"
        cardBordered
        search={{
          labelWidth: 120,
          defaultCollapsed: false,
        }}
        rowSelection={{
          onChange: (e, selectedRows) => {
            setselectedRow(selectedRows);
          },
        }}
        tableAlertOptionRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => {
          return (
            <Space size={24}>
              <span>
                <a style={{ marginInlineStart: 8 }} onClick={onCleanSelected}>
                  取消选择
                </a>
              </span>
              <a
                onClick={() => {
                  // setcheckFalg(true);
                  console.log('selectedRows', selectedRows);
                  DownTable(selectedRows, downObj, '付款申请单', 'payment');
                  // request
                  //   .get('/sms/business/bizCharge/getListOfFinance', {
                  //     idList: selectedRowKeys.join(','),
                  //   })
                  //   .then((res) => {
                  //     if (res.status == 'success') {
                  //     ;
                  //     }
                  //   });
                }}
              >
                导出数据
              </a>
            </Space>
          );
        }}
        beforeSearchSubmit={(params: any) => {
          if (params.confirm === 'null') {
            params['auditNum-isNull'] = true;
            delete params.confirm;
          } else if (params.confirm === 'ing') {
            params.auditNum = 7;
            params['confirm-isNot'] = false;
            delete params.confirm;
          } else if (params.confirm === 'true') {
            params.auditNum = 8;
            params['confirm-isNot'] = false;
            delete params.confirm;
          }
          return params;
        }}
        request={{
          url: '/sms/business/bizPaymentApply',
          params: { enable: true, ...params },
          sortList: sortList,
        }}
        toolBarRender={[
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              if (selectedRow.length != 1) {
                message.error('请勾选一个付费申请作为模板使用!', 5);
                return;
              }
              setRenderData({ type: 'adds', renderDataNum: 0, ...selectedRow[0] });
              setModalVisible(true);
            }}
          >
            使用模板申请
          </Button>,
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setRenderData({ type: 'add' });
              setModalVisible(true);
            }}
          >
            付费申请
          </Button>,
        ]}
      />
      {modalVisibleFalg && (
        <ModelAdd
          setModalVisible={() => setModalVisible(false)}
          modalVisible={modalVisibleFalg}
          renderData={renderData}
          callbackRef={() => callbackRef()}
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
    </PageContainer>
  );
};
