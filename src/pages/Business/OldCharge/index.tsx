import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import Tables from '@/components/Tables';
import { ActionType, ProColumns } from '@ant-design/pro-table';
import { useRef } from 'react';
import request from '@/services/ant-design-pro/apiRequest';
import moment from 'moment';
import Dictionaries from '@/services/util/dictionaries';
import filter from '@/services/util/filter';
import fetchDownload from '@/services/util/fetchDownload';
import { Button, message, Popconfirm, Switch, Tag, Tooltip } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import {
  DeleteOutlined,
  EditOutlined,
  FieldNumberOutlined,
  FileDoneOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import Audit from '@/pages/Admins/AdminCharge/Audit';
import HasInvoiceInfo from '@/pages/Admins/AdminCharge/HasInvoiceInfo';
import ChargeInfo from './ChargeInfo';
export default forwardRef((props: any, ref) => {
  const { setRenderData, setModalsVisible, params, BadgesNumbers, ChangeKey } = props;
  const [renderDatas, setRenderDatas] = useState<any>(null);
  const [AuditVisibleFalg, setAuditVisible] = useState<boolean>(false);
  const [HasInvoiceFalg, setHasInvoiceVisible] = useState<boolean>(false);
  const [ModalVisible, setModalVisible] = useState<boolean>(false);
  const [switchLoding, setSwitchLoding] = useState<boolean>(false);
  const [switchLodings, setSwitchLodings] = useState<boolean>(true);

  const { type = '2' } = props.params;
  const actionRef = useRef<ActionType>();
  const url = '/sms/business/bizCharge';
  const url2 = '/sms/business/bizStudentUser';
  const typeName = type == '2' ? '缴费' : '退费';
  const callbackRef = (value: any = true) => {
    // @ts-ignore
    actionRef.current.reloadAndRest();
    BadgesNumbers && BadgesNumbers();
  };
  useImperativeHandle(ref, () => ({
    callbackRef: () => {
      callbackRef();
    },
  }));
  useEffect(() => {

    console.log('1', Dictionaries.getUserId());
  }, []);
  const getDepName = (id: number) => {
    let depName = Dictionaries.getDepartmentName(id);
    if (depName.length > 1) {
      depName = depName.slice(0, depName.length - 1);
    }
    return depName;
  };
  const columns: ProColumns<API.GithubIssueItem>[] = [
    {
      title: typeName + '编号',
      dataIndex: 'num',
      width: 130,
      fixed: 'left',
      sorter: true,
    },
    {
      title: (
        <>
          审核进度
          <Tooltip
            placement="top"
            title="退费审核流程： ①教务负责人审核 → ②教务主管审核 →③财务主管审核 →④总经办审核"
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      sorter: true,
      dataIndex: 'auditType',
      hideInTable: params.type == 2,
      filters: true,
      filterMultiple: false,
      // onFilter: true,
      valueType: 'select',
      width: 180,
      align: 'center',
      valueEnum: {
        '': {
          text: '教务主管',
        },
        '1': {
          text: '教务负责人',
        },
        '2': {
          text: '财务',
        },
        '3': {
          text: '总经办',
        },
        '4': {
          text: '退费完成',
        },
      },
      render: (text, record) => (
        <span>
          {record.confirm === false ? (
            <Tag color="#FF0000">
              {Dictionaries.getCascaderName('auditType', record.auditType)}未通过
            </Tag>
          ) : (
            <Tag color={record.auditNum == 4 ? '#87d068' : '#f50'}>
              {record.auditNum == 4
                ? '退费完成'
                : Dictionaries.getCascaderName(
                  'auditType',
                  record?.auditNum ? record.auditNum + 1 : 1,
                )}
            </Tag>
          )}
        </span>
      ),
    },
    {
      title: '审核状态',
      dataIndex: 'confirm',
      width: 100,
      sorter: true,
      filters: true,
      filterMultiple: false,
      // onFilter: true,
      hideInTable: params.type == 3,

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
        '': {
          text: <Tag color="#f50">未审核</Tag>,
          status: 'Processing',
        },
        false: {
          text: <Tag color="#FF0000">未通过</Tag>,
          status: 'Error',
        },
        true: {
          text: <Tag color="#87d068">已审核</Tag>,
          status: 'Success',
        },
      },

      render: (text, record) => (
        <Tag
          color={
            record.confirm === true ? '#87d068' : record.confirm === false ? '#FF0000' : '#f50'
          }
        >
          {record.confirm === true ? '审核通过' : record.confirm === false ? '未通过' : '未审核'}
        </Tag>
      ),
    },
    {
      title: '学员',
      dataIndex: 'oldStudentName',
      width: 80,
      // search: false,
      fixed: 'left',
      sorter: true,
      render: (text, record) => (
        <div>
          <div>{record.oldStudentName}</div>
          {!record.enable && <Tag color="red">已废除</Tag>}
        </div>
      ),
    },
    {
      title: '审核日期',
      key: 'auditTime',
      sorter: true,
      width: 120,
      dataIndex: 'auditTime',
      valueType: 'dateRange',
      render: (text, record) => (
        <span>{record.auditTime}</span>
      ),
    },
    {
      title: typeName + '日期',
      key: 'chargeTime',
      sorter: true,
      width: 120,
      dataIndex: 'chargeTime',
      valueType: 'dateRange',
      render: (text, record) => <span>{record.chargeTime}</span>,
    },
    {
      title: '到账日期',
      key: 'paymentTime',
      sorter: true,
      width: 120,
      dataIndex: 'paymentTime',
      valueType: 'dateRange',
      render: (text, record) => (
        <span>{record.paymentTime}</span>
      ),
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
          {Dictionaries.getCascaderAllName('dict_reg_job', record.oldProject)}
        </span>
      ),
    },
    {
      title: typeName + '项目',
      dataIndex: 'oldProject',
      width: 150,
      // search: false,
      key: 'oldProject',
      sorter: true,
      valueType: 'cascader',
      fieldProps: {
        options: Dictionaries.getCascader('dict_reg_job'),
        showSearch: { filter },
      },
      render: (text, record) => (
        <span>
          {record.oldProject &&
            [...new Set(record.oldProject.split(','))].map((item: any, index: number) => {
              return (
                <span key={index}>
                  {Dictionaries.getCascaderName('dict_reg_job', item)} <br />
                </span>
              );
            })}
        </span>
      ),
    },
    {
      title: typeName + '金额',
      dataIndex: 'amount',
      sorter: true,
      width: 80,
      search: false,
    },
    {
      title: '消费金额',
      dataIndex: 'oldConsumptionAmount',
      sorter: true,
      width: 80,
      search: false,
      hideInTable: params.type == 2,
    },
    {
      title: '优惠金额',
      sorter: true,
      width: 80,
      dataIndex: 'discount',
      search: false,
      hideInTable: params.type == 3,
    },
    {
      title: typeName + '方式',
      dataIndex: 'method',
      width: 80,
      valueType: 'select',
      valueEnum: Dictionaries.getSearch('dict_stu_refund_type'),
      render: (text, record) => (
        <span>{Dictionaries.getCascaderName('dict_stu_refund_type', record.method)}</span>
      ),
    },
    {
      title: '退款类型',
      dataIndex: 'refundType',
      width: 80,
      valueType: 'select',
      hideInTable: params.type == 2,
      valueEnum: Dictionaries.getSearch('dict_refundType'),
      render: (text, record) => (
        <span>{Dictionaries.getCascaderName('dict_refundType', record.refundType)}</span>
      ),
    },
    {
      title: '备注',
      dataIndex: 'description',
      // search: false,
      ellipsis: true,
      width: 150,
      tip: '备注过长会自动收缩',
    },
    {
      title: '财务摘要',
      width: 150,
      dataIndex: 'description2',
      search: false,
      ellipsis: true,
      tip: '备注过长会自动收缩',
    },
    {
      title: typeName + '人',
      dataIndex: 'userName',
      width: 80,
      // search: false,
    },
    {
      title: typeName + '人部门',
      dataIndex: 'departmentId',
      width: 80,
      // search: false,
      render: (text, record) => <span>{getDepName(record.departmentId).join('-')}</span>,
    },
    {
      title: '经办人',
      dataIndex: 'agentName',
      width: 80,
      hideInTable: params.type == 2,
      // search: false,
    },
    {
      title: '发票信息',
      width: 80,
      sorter: true,
      hideInTable: params.type == 3,
      dataIndex: 'hasInvoice',
      render: (text, record) => (
        <>
          {record.hasInvoice ? (
            <Button
              key="hasInvoicelook"
              type="primary"
              size="small"
              icon={<SearchOutlined />}
              onClick={async (e) => {
                setRenderDatas(record);
                setHasInvoiceVisible(true);
              }}
            >
              查看
            </Button>
          ) : (
            ''
          )}
        </>
      ),
    },

    {
      title: '审核建议',
      dataIndex: 'remark',
      width: 150,
      search: false,
      ellipsis: true,
      sorter: true,
      tip: '建议过长会自动收缩',
    },
    {
      title: '是否计算业绩',
      dataIndex: 'isCalculation',
      valueType: 'select',
      width: 100,
      search: false,
      order: 8,
      valueEnum: {
        All: {
          text: '全部',
          status: 'All',
        },
        false: {
          text: '不计算',
          status: 'Error',
        },
        true: {
          text: '计算',
          status: 'Success',
        },
      },
      render: (text, record, _, action) => (
        <>
          {/* {record.isSend ? <Tag color={'#87d068'}>发送</Tag> : <Tag color={'#FF0000'}>不发送</Tag>} */}
          <Switch
            key={record.id}
            checkedChildren="计算"
            unCheckedChildren="不计算"
            // disabled={Params.isSendOver}
            defaultChecked={record.isCalculation}
            loading={switchLoding}
            onChange={async () => {
              setSwitchLoding(true);
              const status: any = await request.post(
                '/sms/business/bizCharge/reports/setIsCalculation',
                {
                  ids: record.id,
                  isCalculation: !record.isCalculation,
                },
              );
              if (status.status != 'success') {
                message.error(status.msg);
              }
              setSwitchLoding(false);
              callbackRef();
            }}
          />
        </>
      ),
    },
    {
      title: '是否废除',
      dataIndex: 'enable',
      filters: true,
      hideInTable: true,
      sorter: true,
      filterMultiple: false,
      // onFilter: true,
      valueType: 'select',
      valueEnum: {
        false: {
          text: '已废除',
          status: 'Error',
        },
        true: {
          text: '未废除',
          status: 'Success',
        },
      },
    },
    {
      title: '审核员',
      dataIndex: 'auditor',
      search: false,
      sorter: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: 120,
      // hideInTable: !admin,
      render: (text, record) => (
        <>
          <Button
            key="look"
            type="primary"
            size="small"
            icon={<SearchOutlined />}
            style={{ marginRight: '10px', marginBottom: '8px' }}
            onClick={async (e) => {
              e.stopPropagation();

              setRenderDatas(record);
              setModalVisible(true);
            }}
          >
            查看
          </Button>
          <Popconfirm
            title="财务订单审核"
            okText="通过"
            cancelText="未通过"
            onConfirm={(e) => {
              e?.stopPropagation();
              //缴费审核
              request
                .post(`/sms/business/bizAudit/audit/0`, {
                  // auditType: '0',
                  confirm: true,
                  entityId: record.id,
                })
                .then((res: any) => {
                  if (res.status == 'success') {
                    message.success('操作成功!');
                    callbackRef();
                  }
                });
            }}
            onCancel={() => {
              setRenderDatas({ ...record, confirm: false, type: 0 });
              setAuditVisible(true);
            }}
          >
            <Button
              key="look"
              type="primary"
              hidden={params.list || params.type == 3}
              size="small"
              icon={<FileDoneOutlined />}
              style={{ marginRight: '10px', marginBottom: '8px' }}
            >
              审核
            </Button>
          </Popconfirm>
          <Popconfirm
            title="退费审核"
            okText="通过"
            cancelText="未通过"
            onConfirm={(e) => {
              e?.stopPropagation();
              //退费审核
              setRenderDatas({ ...record, confirm: true });
              setAuditVisible(true);
            }}
            onCancel={() => {
              setRenderDatas({ ...record, confirm: false });
              setAuditVisible(true);
            }}
          >
            <Button
              key="look"
              type="primary"
              hidden={
                record.isSubmit === false ||
                record.auditType == 0 ||
                params.type == '2' ||
                params.audit
              }
              size="small"
              icon={<FileDoneOutlined />}
              style={{ marginRight: '10px', marginBottom: '8px' }}
            >
              审核
            </Button>
          </Popconfirm>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setRenderData({ eidtType: 'eidt', ...record });
              setModalsVisible(true);
            }}
          >
            编辑
          </Button>
          <Button
            type="primary"
            key="dapchu"
            size="small"
            style={{ marginTop: '10px' }}
            icon={<FieldNumberOutlined />}
            hidden={!(params.type == 2 && record.auditNum == 0)}
            onClick={async () => {
              fetchDownload('/sms/business/bizCharge/export', record.id, undefined, '.png');
            }}
          >
            导出收据照片
          </Button>
          <Button
            type="primary"
            key="dapchu"
            size="small"
            style={{ marginTop: '10px' }}
            icon={<FieldNumberOutlined />}
            onClick={async () => {
              if (params.type == '2') {
                fetchDownload('/sms/business/bizCharge/export/3', record.id);
              } else {
                fetchDownload('/sms/business/bizCharge/export/2', record.id);
              }
            }}
          >
            导出收据Word
          </Button>
          <Popconfirm
            key={record.id}
            title="是否废除？"
            onConfirm={() => {
              request.post('/sms/business/bizCharge/disable/' + record.id).then((res: any) => {
                if (res.status == 'success') {
                  message.success('废除成功');
                  callbackRef();
                }
              });
            }}
            okText="废除"
            cancelText="取消"
          >
            <Button
              type="primary"
              key="delete"
              size="small"
              style={{ marginTop: '10px' }}
              // hidden={record.confirm === false}
              danger
              icon={<DeleteOutlined />}
            >
              废除
            </Button>
          </Popconfirm>
          <Button
            type="primary"
            key="editable"
            size="small"
            hidden={record.isSubmit !== false}
            icon={<EditOutlined />}
            style={{ marginTop: '10px' }}
            onClick={() => {
              request.post(url, { id: record.id, isSubmit: true }).then((res: any) => {
                if (res.status == 'success') {
                  message.success('提交成功');
                  callbackRef();
                }
              });
            }}
          >
            重新提交
          </Button>
        </>
      ),
    },
  ];
  let sortList: any = {
    ['num,updateTime']: 'desc,desc',
  };
  if (ChangeKey == 4 || ChangeKey == 'list') {
    sortList = {
      ['confirm,auditType']: 'asc,asc',
    };
  }
  return (
    <>
      <PageContainer>
        <Tables
          actionRef={actionRef}
          columns={columns}
          request={{ url: url, params: params, sortList: sortList }}
          scroll={{ x: 1500 }}
          className="OldCharge"
          loding={(e) => setSwitchLodings(e)}
          rowSelection={
            {
              // onChange: (e, selectedRows) => {
              //   setSelectedRows(e);
              // },
            }
          }
          search={{
            labelWidth: 120,
            defaultCollapsed: false,
          }}
          toolBarRender={props?.toolBarRender}
          toolbar={props?.toolbar}
          tableAlertOptionRender={props?.tableAlertOptionRender}
        />
      </PageContainer>
      {AuditVisibleFalg && (
        <Audit
          setModalVisible={() => setAuditVisible(false)}
          modalVisible={AuditVisibleFalg}
          callbackRef={() => callbackRef()}
          renderData={renderDatas}
        />
      )}
      {HasInvoiceFalg && (
        <HasInvoiceInfo
          setModalVisible={() => setHasInvoiceVisible(false)}
          modalVisible={HasInvoiceFalg}
          callbackRef={() => callbackRef()}
          renderData={renderDatas}
        />
      )}
      {ModalVisible && (
        <ChargeInfo
          setModalVisible={() => setModalVisible(false)}
          modalVisible={ModalVisible}
          callbackRef={() => callbackRef()}
          renderData={renderDatas}
        />
      )}
    </>
  );
});
