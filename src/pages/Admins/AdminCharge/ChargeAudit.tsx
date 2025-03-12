import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PayCircleOutlined,
  FileDoneOutlined,
  SmileOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import {
  Button,
  Tag,
  Space,
  Divider,
  Popconfirm,
  message,
  Table,
  Spin,
  Timeline,
  Tooltip,
  Badge,
  Switch,
  Modal,
  Drawer,
} from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import request from '@/services/ant-design-pro/apiRequest';
import moment from 'moment';
import Dictionaries from '@/services/util/dictionaries';
import ChargeOrder from './ChargeOrderAudit';
import ChargeInfo from './ChargeInfo';
import ChargeNew from './ChargeNew';
import StudentInfo from '../StudentManage/studentInfo';
import ImgUrl from '@/services/util/ImgUrl';
import ChargeIframe from './ChargeIframe';
import Audit from './Audit';
import Tables from '@/components/Tables';
import ProCard from '@ant-design/pro-card';
import HasInvoiceInfo from './HasInvoiceInfo';
import './Charge.less';
import filter from '@/services/util/filter';
import { ModalForm, ProFormDigit, ProFormInstance } from '@ant-design/pro-form';
import Invoice from '@/pages/Business/Invoice/Invoice';
import DownTable from '@/services/util/timeFn';
import DownHeader from './DownHeader';
export default (props: any) => {
  const {
    admin,
    studentUserId = false,
    studentType = '0',
    type = '0',
    auditType = '',
    chargeType = 'charge',
  } = props;
  let params: any = { enable: true };
  let param: any = { 'auditNum-isNull': true, 'chargeIds-isNull': false, enable: true, 'isSubmit': true };
  const actionRef = useRef<ActionType>();
  const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
  const [orderVisibleFalg, setOrderVisible] = useState<boolean>(false);
  const [AuditVisibleFalg, setAuditVisible] = useState<boolean>(false);
  const [HasInvoiceFalg, setHasInvoiceVisible] = useState<boolean>(false);
  const [achievementVisible, setAchievementVisible] = useState<any>(false);
  const [ChargeInfoVisibleFalg, setChargeInfoVisible] = useState<boolean>(false);

  const [switchLoding, setSwitchLoding] = useState<boolean>(false);
  const [Params, setParams] = useState<any>(param);
  const [SpingFalg, SetSpingFalg] = useState<boolean>(false);
  const [InfoVisibleFalg, setInfoVisible] = useState<boolean>(false);
  const [renderData, setRenderData] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<any>();
  const [previewVisible, setPreviewVisible] = useState<any>(false);
  const [ChargeNewFalg, setChargeNewFalg] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [Badges, setBadges] = useState<any>([0, 0]);
  const url = '/sms/business/bizCharge';
  const url2 = '/sms/business/bizStudentUser';
  const formRefa = useRef<ProFormInstance>();
  const ChargeNews = forwardRef(ChargeNew);
  const but = !admin
    ? []
    : [
      <Button
        key="button"
        icon={<PlusOutlined />}
        type="primary"
        onClick={() => {
          setRenderData({ type: 'add' });
          setModalVisible(true);
        }}
      >
        新增
      </Button>,
    ];
  const callbackRef = (value: any = true) => {
    SetSpingFalg(false)
    setSwitchLoding(true)
    // @ts-ignore
    actionRef.current.reload();
    if (value && chargeType == 'charge') BadgesNumbers();
  };
  const chargeTypeFN = (type: string) => {
    let str = ''
    if (type == 'refund' || type == 'refundList') {
      str = '-'
    }
    return str
  }
  const setachievement = (type: string) => {
    if (type == 'max') {
      formRefa.current?.setFieldsValue({
        performanceAmount: renderData.amount
      })
    } else {
      formRefa.current?.setFieldsValue({
        performanceAmount: 0
      })
    }
  }
  const BadgesNumbers = () => {
    let studentTypes = studentType != 'all' ? { studentType: studentType } : {};
    request
      .get('/sms/business/bizCharge/statistics', {
        array: JSON.stringify([
          { type: 0, ...studentTypes, 'auditNum-isNull': true, 'chargeIds-isNull': false, enable: true, 'isSubmit': true },
          { type: 0, ...studentTypes, 'confirm': false, 'chargeIds-isNull': false, enable: true, 'isSubmit': false },
        ]),
      })
      .then((res) => {
        setBadges(res.data);
      });
  };
  const auditAll = (data: Array<any>) => {
    console.log("data", data)
    let auditsParam: any[] = []
    data.forEach(x => {
      let ids = x.chargeIds.split(',')
      auditsParam.push(...ids)
    })
    auditsParam = auditsParam.map(x => {
      return {
        confirm: true,
        entityId: x
      }
    })
    request
      .postAll('/sms/business/bizAudit/audits/0', auditsParam)
      .then((res: any) => {
        if (res.status == 'success') {
          message.success('操作成功');
          callbackRef();
        } else {
          message.error(res.msg)
        }
      })
  }
  useEffect(() => {
    callbackRef();
  }, [studentType, auditType]);
  const getChargeList = async (orderId: number, enable: boolean) => {
    const list: [] = (await request.get('/sms/business/bizCharge', { orderId, enable })).data
      .content;
    return list;
  };
  const columns: ProColumns<API.GithubIssueItem>[] = [
    {
      title: '缴费编号',
      dataIndex: 'num',
      width: 130,
      fixed: 'left',
      sorter: true,
    },
    {
      title: '收费日期',
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
      title: '学员',
      dataIndex: 'studentName',
      width: 80,
      sorter: true,
      // search: false,
      // fixed: 'left',
      render: (text, record) => (
        <a
          onClick={() => {
            request.get(url2, { id: record.studentUserId }).then((res: any) => {
              setRenderData({
                ...res.data.content[0],
                admin: admin,
              });
              setInfoVisible(true);
            });
          }}
        >
          {record.studentName}
          {record.isPeer && <Tag color="#87CEEB">同行企业</Tag>}
          {!record.enable && <Tag color="red">已废除</Tag>}
        </a>
      ),
    },
    {
      title: '是否是同行企业',
      dataIndex: 'isPeer',
      // width: 80,
      // search: false,
      valueType: 'select',
      key: 'isPeer',
      valueEnum: {
        false: '否',
        true: '是',
      },
      hideInTable: true,
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
      width: 180,
      render: (text, record) => (
        <span key="parentProjects">
          {Dictionaries.getCascaderAllName('dict_reg_job', record.project)}
        </span>
      ),
    },
    {
      title: '收费项目',
      dataIndex: 'project',
      width: 150,
      // search: false,
      key: 'project',
      sorter: true,
      valueType: 'cascader',
      fieldProps: {
        options: Dictionaries.getCascader('dict_reg_job'),
        showSearch: { filter },
      },
      render: (text, record) => (
        <span>
          {record.project &&
            [...new Set(record.project.split(','))].map((item: any, index: number) => {
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
      title: '考试类型',
      sorter: true,
      width: 80,
      dataIndex: 'examType',
      valueEnum: Dictionaries.getSearch('dict_exam_type'),
      render: (text, record) => <>{Dictionaries.getName('dict_exam_type', record.examType)}</>,
    },
    {
      title: '收费金额',
      dataIndex: 'amount',
      sorter: true,
      width: 80,
      search: false,
    },
    // {
    //   title: '优惠金额',
    //   sorter: true,
    //   width: 80,
    //   dataIndex: 'discount',
    //   search: false,
    // },
    {
      title: '收费方式',
      dataIndex: 'method',
      width: 80,
      sorter: true,
      valueType: 'select',
      valueEnum: Dictionaries.getSearch('dict_stu_refund_type'),
      render: (text, record) => (
        <span>{Dictionaries.getCascaderName('dict_stu_refund_type', record.method)}</span>
      ),
    },
    {
      title: '备注',
      dataIndex: 'description',
      search: false,
      // ellipsis: true,
      sorter: true,
      width: 150,
      // tip: '备注过长会自动收缩',
    },
    {
      title: '财务摘要',
      width: 150,
      dataIndex: 'description2',
      hideInTable: chargeType != 'chargeList',
      search: false,
      sorter: true,
      // ellipsis: true,
      // tip: '备注过长会自动收缩',
    },
    {
      title: '收费人',
      dataIndex: 'userName',
      width: 80,
      // search: false,
      sorter: true,
    },
    {
      title: '信息所有人',
      dataIndex: 'ownerName',
      width: 80,
      render: (text, record) => <div>{record.ownerName}<span>{record.ownerName && '(' + (record.percent * 100) + '%)'}</span></div>,
      // search: false,
      sorter: true,
    },
    {
      title: '发票信息',
      width: 80,
      sorter: true,
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
                setRenderData({ ...record, types: 'charges' });
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
      title: '业绩金额',
      dataIndex: 'performanceAmount',
      width: 100,
      // search: false,
      order: 8,
      render: (text, record, _, action) => (
        <>
          {
            chargeTypeFN(chargeType)
          }
          {
            record.performanceAmount ? record.performanceAmount : 0
          }
          <a onClick={() => {
            setRenderData(record)
            setAchievementVisible(true)
          }}>修改</a>
        </>
      ),
    },
    {
      title: '审核时间',
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
      title: '审核建议',
      dataIndex: 'remark',
      width: 150,
      search: false,
      // ellipsis: true,
      sorter: true,
      // tip: '建议过长会自动收缩',
    },

    {
      title: '审核状态',
      dataIndex: 'confirm',
      filters: true,
      width: 100,
      sorter: true,
      hideInTable: type == '1',
      filterMultiple: false,
      // onFilter: true,
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
      dataIndex: 'auditType',
      hideInTable: type == 0,
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
      },
      render: (text, record) => (
        <span>
          {record.confirm === false ? (
            <Tag color="#FF0000">
              {Dictionaries.getCascaderName('auditType', record.auditType)}未通过
            </Tag>
          ) : (
            <Tag color={record.auditType == 4 ? '#87d068' : '#f50'}>
              {record.auditType == 4
                ? '退费完成'
                : Dictionaries.getCascaderName(
                  'auditType',
                  record?.auditType ? record.auditType + 1 : 1,
                )}
            </Tag>
          )}
        </span>
      ),
    },
    {
      title: '是否废除',
      dataIndex: 'enable',
      filters: true,
      sorter: true,
      hideInTable: true,
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
      sorter: true,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      // hideInTable: !admin,
      render: (text, record, _, action) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          {/* <Space> */}
          <Button type="primary" key="order"
            size="small"
            style={{ marginBottom: 5 }}
            onClick={async () => {
              SetSpingFalg(true);
              setRenderData({ orderId: record.orderId });
              setModalVisible(true);
              SetSpingFalg(false);
            }}
          >
            订单信息
          </Button>
          <Button
            style={{ marginBottom: 5 }}
            hidden={!record.isSubmit}
            type="primary"
            key="editable"
            size="small"
            icon={<EditOutlined />}
            onClick={async () => {
              const list = (
                await request.get('/sms/business/bizCharge', { 'id-in': record.chargeIds ? record.chargeIds : record.id })
              ).data.content;
              const orderIdList = list.map((item: { orderId: number }) => {
                return item.orderId;
              });
              const orderList = (
                await request.get('/sms/business/bizOrder', { 'id-in': orderIdList.join(',') })
              ).data.content;
              const render: any = [];

              await orderList.forEach((item: any) => {
                list.forEach((items: any) => {
                  items.chargeId = items.id;
                  // delete items.id;
                  if (item.id == items.orderId) {
                    render.push({
                      ...item,
                      ...items,
                    });
                  }
                });
              });
              setTimeout(async () => {
                await setRenderData({ list: render, types: 'eidt', num: 0 });
                await setChargeNewFalg(true);
              }, 200);
            }}
          >
            编辑/查看/审核
          </Button>
          <Button
            style={{ marginBottom: 5 }}
            hidden={record.isSubmit}
            type="primary"
            key="editable"
            size="small"
            icon={<EditOutlined />}
            onClick={async () => {
              const list = (
                await request.get('/sms/business/bizCharge', { 'id-in': record.chargeIds })
              ).data.content;
              const orderIdList = list.map((item: { orderId: number }) => {
                return item.orderId;
              });
              const orderList = (
                await request.get('/sms/business/bizOrder', { 'id-in': orderIdList.join(',') })
              ).data.content;
              const render: any = [];

              await orderList.forEach((item: any) => {
                list.forEach((items: any) => {
                  items.chargeId = items.id;
                  // delete items.id;
                  if (item.id == items.orderId) {
                    render.push({
                      ...item,
                      ...items,
                    });
                  }
                });
              });
              setTimeout(async () => {
                await setRenderData({ list: render });
                await setChargeNewFalg(true);
              }, 200);
            }}
          >
            重新提交
          </Button>
          <Popconfirm
            style={{ marginBottom: 5 }}
            key={record.id}
            title="是否废除？"
            onConfirm={() => {
              let ids = record.chargeIds.split(',')
              ids.forEach((item) => {
                request.post('/sms/business/bizCharge/disable/' + item).then((ress: any) => {
                  if (ress.status == 'success') {
                    message.success('废除成功');
                    callbackRef();
                  }
                });
              })
              // request.post('/sms/business/bizCharge/disable/' + record.id).then((res: any) => {
              //   if (res.status == 'success') {
              //     message.success('废除成功');
              //     callbackRef();
              //   }
              // });
            }}
            onCancel={async () => {
              const list: any = await getChargeList(record.orderId, true)
              if (list.length > 1) {
                message.error('该订单还有其他缴费记录，需废除其余所有缴费记录！', 5);
                return;
              }
              let ids = record.chargeIds.split(',')
              if (ids.length > 1) {
                message.error('合并缴费不支持同步废除订单！', 5);
                return;
              }
              request.post('/sms/business/bizCharge/disable/' + record.id).then((res: any) => {
                if (res.status == 'success') {
                  request
                    .post('/sms/business/bizOrder/disable/' + record.orderId)
                    .then((ress: any) => {
                      if (ress.status == 'success') {
                        message.success('废除成功');
                        callbackRef();
                      }
                    });
                }
              });
            }}
            okText="仅废除缴费"
            cancelText="同步废除订单"
          >
            <Button
              type="primary"
              key="delete"
              size="small"
              // hidden={Params.confirm === false}
              danger
              icon={<DeleteOutlined />}
            >
              废除
            </Button>
          </Popconfirm>


          {/* </Space> */}
        </div>
      ),
    },
  ];

  let toolbar = undefined;

  params.type = type;
  if (studentType != 'all') {
    params.studentType = studentType;
  }
  // params['chargeIds-isNull'] = false;
  if (studentUserId) params.studentUserId = studentUserId;
  toolbar = {
    menu: {
      type: 'tab',
      // activeKey: activeKey,
      items: [
        {
          key: 'shenhe',
          label: (
            <Badge count={Badges[0]} size="small" offset={[5, 6]}>
              <Button size='small' type='link' disabled={switchLoding}>财务审核</Button>
            </Badge>
          ),
        },
        {
          key: 'true',
          label: <Button size='small' type='link' disabled={switchLoding}>审核通过</Button>,
        },
        {
          key: 'false',
          label: (
            <Badge count={Badges[1]} size="small" offset={[5, 6]}>
              <Button size='small' type='link' disabled={switchLoding}>审核未通过</Button>
            </Badge>
          ),
        },
        {
          key: 'enable',
          label: <Button size='small' type='link' disabled={switchLoding}>已废除</Button>,
        },
      ],
      onChange: (key: any) => {
        SetSpingFalg(true)
        if (key == 'shenhe') {
          // params['auditType-isNull'] = true;
          setParams({ isSubmit: true, 'auditNum-isNull': true, enable: true, 'chargeIds-isNull': false });
        } else if (key == 'true') {
          setParams({ enable: true, confirm: true });
          // params.confirm = true;
        } else if (key == 'false') {
          setParams({ isSubmit: false, confirm: false, enable: true, 'chargeIds-isNull': false });
          // params.confirm = false;
        } else if (key === 'enable') {
          setParams({ enable: false });
        }
        callbackRef();
      },
    },
  };
  let sortList = {
    ['num,updateTime']: 'desc,desc',
  };
  Object.assign(params, Params);
  return (
    <>
      <Spin spinning={SpingFalg}>
        <Tables
          columns={columns}
          className="Charge"
          actionRef={actionRef}
          cardBordered
          loding={(e) => setSwitchLoding(e)}
          scroll={{ x: 1500 }}
          request={{ url: url, params: params, sortList: sortList }}
          toolbar={toolbar}
          search={{ defaultCollapsed: false, labelWidth: 120 }}
          pagesizes={100}
          rowSelection={{
            // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
            // 注释该行则默认不显示下拉选项
            selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
            onChange: (e, selectedRows) => {
              // setStudentIds(e);
            },
          }}
          toolBarRender={
            <Button
              loading={exportLoading}
              onClick={async () => {
                setExportLoading(true)
                const content = (await request.get('/sms/business/bizCharge/getListOfFinance2',
                  {
                    enable: true,
                    'confirm-isNull': true,
                    'chargeIds-isNull': false,
                    'type-in': '0,2',
                    isSubmit: true
                  }
                )).data
                DownTable(content, DownHeader.PayHeader, '缴费信息', 'charge');
                setExportLoading(false)
              }}
            >
              导出未审核缴费
            </Button>
          }
          tableAlertOptionRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => {
            return <>
              <a onClick={() => {
                auditAll(selectedRows)
                onCleanSelected()
              }}>批量审核通过</a>
              <a style={{ marginInlineStart: 8 }} onClick={onCleanSelected}>
                取消选择
              </a>
            </>
          }
          }
        />

        {InfoVisibleFalg && (
          <StudentInfo
            setModalVisible={() => setInfoVisible(false)}
            modalVisible={InfoVisibleFalg}
            renderData={renderData}
            callbackRef={() => callbackRef()}
            admin={admin}
          />
        )}

        {orderVisibleFalg && (
          <ChargeOrder
            setModalVisible={() => setOrderVisible(false)}
            modalVisible={orderVisibleFalg}
            callbackRef={() => callbackRef()}
            renderData={renderData}
            setPreviewImage={(e: any) => setPreviewImage(e)}
            setPreviewVisible={() => setPreviewVisible(true)}
            admin={admin}
          />
        )}
        <Drawer
          title="缴费审核"
          width={1200}
          visible={ChargeNewFalg}
          onClose={() => setChargeNewFalg(false)}
          maskClosable={false}
          footer={null}
          destroyOnClose={true}
        >
          <ChargeNews
            setModalVisible={() => setChargeNewFalg(false)}
            modalVisible={ChargeNewFalg}
            renderData={renderData}
            callbackRef={() => callbackRef()}
          />
        </Drawer>
        {modalVisibleFalg && (
          <ChargeInfo
            setModalVisible={() => setModalVisible(false)}
            modalVisible={modalVisibleFalg}
            callbackRef={() => callbackRef()}
            renderData={renderData}
            setPreviewImage={(e: any) => setPreviewImage(e)}
            setPreviewVisible={() => setPreviewVisible(true)}
            admin={admin}
          />
        )}
        {AuditVisibleFalg && (
          <Audit
            setModalVisible={() => setAuditVisible(false)}
            modalVisible={AuditVisibleFalg}
            callbackRef={() => callbackRef()}
            renderData={renderData}
          />
        )}
        {/* {HasInvoiceFalg && (
          <HasInvoiceInfo
            setModalVisible={() => setHasInvoiceVisible(false)}
            modalVisible={HasInvoiceFalg}
            callbackRef={() => callbackRef()}
            renderData={renderData}
          />
        )} */}
        <Drawer
          open={HasInvoiceFalg}
          onClose={() => setHasInvoiceVisible(false)}
          width={1400}
        >
          <Invoice param={{ chargeIds: ',' + renderData?.id + ',' }} />
        </Drawer>
        <ChargeIframe
          previewVisible={previewVisible}
          setPreviewVisible={() => setPreviewVisible(false)}
          previewImage={previewImage}
        />
        <ModalForm
          title='修改业绩'
          formRef={formRefa}
          visible={achievementVisible}
          autoFocusFirstInput
          modalProps={{
            destroyOnClose: true,
            onCancel: () => {
              setAchievementVisible(false)
            },
          }}
          onFinish={async (values: any) => {
            request.postAll('/sms/business/bizCharge/edit', [{ id: renderData.id, ...values }]).then((res) => {
              if (res.status == 'success') {
                message.success('操作成功');
                setAchievementVisible(false)
                callbackRef()
              }
            })
          }
          }
        >
          <div> <a onClick={() => setachievement('max')}>最大</a> <a onClick={() => setachievement('min')}>最小</a>  </div>
          <ProFormDigit name='performanceAmount' label='业绩金额' />
        </ModalForm>
      </Spin>
    </>
  );
};
