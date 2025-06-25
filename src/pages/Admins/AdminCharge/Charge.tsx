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
  FieldNumberOutlined,
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
import ChargeInfoOld from '@/pages/Business/OldCharge/ChargeInfo';
import StudentInfo from '../StudentManage/studentInfo';
import ImgUrl from '@/services/util/ImgUrl';
import ChargeIframe from './ChargeIframe';
import Audit from './Audit';
import HasInvoiceInfo from './HasInvoiceInfo';
import Tables from '@/components/Tables';
import fetchDownload from '@/services/util/fetchDownload';
import DownTable from '@/services/util/timeFn';
import DownHeader from './DownHeader';
import chargeDownload from '@/services/util/chargeDownload'
import './Charge.less';
import filter from '@/services/util/filter';
import { ModalForm, ProFormDigit, ProFormInstance, ProFormTextArea, ProFormUploadDragger } from '@ant-design/pro-form';
import Invoice from '@/pages/Business/Invoice/Invoice';
import ChargeNew from './ChargeNew';
import * as XLSX from 'XLSX';
import { biuldDataFromExcelJson } from '@/services/util/util';
import TextArea from 'antd/lib/input/TextArea';

export default (props: any) => {
  const {
    admin,
    studentUserId = false,
    studentType = '0',
    type = '0',
    auditType = '',
    chargeType = 'charge',
    chargeTypes,
    setChargeModal,
    setChargeInfo,
    setModalsCharge = undefined,
    setChargeList,
    formParam = {}
  } = props;
  let params: any = { enable: true };
  let param: any = formParam;
  params.type = type;
  if (chargeType == 'refundList') {
    // param.auditType = 4;
    // param.confirm = true;
    delete params.type;
    params['type-in'] = '1,3';
  } else if (chargeType == 'chargeList') {
    // param.confirm = true;
    params['type-in'] = '0,2,4,5,6';
    params['userId-isNull'] = false;
    delete params.type;
  } else {
    // param.auditType = 4;
    // param.confirm = true;
  }

  const actionRef = useRef<ActionType>();
  const formRefa = useRef<ProFormInstance>();
  const departmentTree = Dictionaries.getDepartmentTree();
  const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
  const [orderVisibleFalg, setOrderVisible] = useState<boolean>(false);
  const [refundVisible, setRefundVisible] = useState<boolean>(false);
  const [ModalVisibleOld, setModalVisibleOld] = useState<boolean>(false);
  const [AuditVisibleFalg, setAuditVisible] = useState<boolean>(false);
  const [switchLoding, setSwitchLoding] = useState<boolean>(true);
  const [HasInvoiceFalg, setHasInvoiceVisible] = useState<boolean>(false);
  const [Params, setParams] = useState<any>(param);
  const [SpingFalg, SetSpingFalg] = useState<boolean>(false);
  const [InfoVisibleFalg, setInfoVisible] = useState<boolean>(false);
  const [renderData, setRenderData] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<any>();
  const [previewVisible, setPreviewVisible] = useState<any>(false);
  const [achievementVisible, setAchievementVisible] = useState<any>(false);
  const [Badges, setBadges] = useState<any>([0, 0]);
  const [uploadFormVisible, setUploadFormVisible] = useState<boolean>(false);
  const [uploadData, setUploadData] = useState<any>();
  const [fromDataList, setFromDataList] = useState<any>({});
  const url = '/sms/business/bizCharge';
  const url2 = '/sms/business/bizStudentUser';
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
    // @ts-ignore
    actionRef.current.reloadAndRest();
    if (value && chargeType == 'refund') BadgesNumber();
    if (value && chargeType == 'charge') BadgesNumbers();
  };
  const BadgesNumber = () => {
    let studentTypes = studentType != 'all' ? { studentType: studentType } : {};
    request
      .get('/sms/business/bizCharge/statistics', {
        array: JSON.stringify([
          { type: 1, ...studentTypes, 'auditNum-isNull': true, isSubmit: true },
          { auditNum: '1', type: 1, ...studentTypes, isSubmit: true },
          { auditNum: '2', type: 1, ...studentTypes, isSubmit: true },
          { auditNum: '3', type: 1, ...studentTypes, isSubmit: true },
          { enable: true, type: 1, isSubmit: false },
        ]),
      })
      .then((res) => {
        setBadges(res.data);
      });
  };
  const BadgesNumbers = () => {
    let studentTypes = studentType != 'all' ? { studentType: studentType } : {};
    request
      .get('/sms/business/bizCharge/statistics', {
        array: JSON.stringify([{ type: 0, ...studentTypes, 'auditType-isNull': true }]),
      })
      .then((res) => {
        setBadges(res.data);
      });
  };
  useEffect(() => {
    callbackRef();
  }, [studentType, auditType]);
  useEffect(() => {
    if (chargeType == 'refund') {
      setParams({ 'auditNum-isNull': true, enable: true, isSubmit: true })
    }
  }, []);
  useEffect(() => {
    if (renderData?.performanceAmount) {
      setTimeout(() => {
        formRefa.current?.setFieldsValue({
          performanceAmount: renderData.performanceAmount
        })
      }, 100)

    }
  }, [achievementVisible]);
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
  const chargeTypeFN = (type: string) => {
    let str = ''
    if (type == 'refund' || type == 'refundList') {
      str = '-'
    }
    return str
  }
  const columns: ProColumns<API.GithubIssueItem>[] = [
    {
      title: '编号',
      dataIndex: 'num',
      width: 130,
      fixed: 'left',
      sorter: true,
      // render: (text, record) => (
      //   <div style={{ textAlign: 'center' }}>
      //     <text>{record.num}</text>
      //     {record.type == '0' || record.type == '1' ? (
      //       <Tag color="#87CEEB">新系统</Tag>
      //     ) : (
      //       <Tag color="red">老系统</Tag>
      //     )}
      //   </div>
      // ),
    },
    {
      title: '第三方订单编号',
      dataIndex: 'num2',
      hideInTable: true,
      hideInSearch: chargeType == 'refundList' || chargeType == 'refund'
    },
    {
      title: '缴费类型',
      dataIndex: 'type',
      width: 120,
      // hideInTable: true,
      valueType: 'select',
      key: 'type',
      valueEnum: Dictionaries.getSearch("chargeType")
    },
    {
      title: '审核状态',
      dataIndex: 'confirm',
      width: 120,
      sorter: true,
      filters: true,
      hideInTable: type == '1',
      filterMultiple: false,
      // onFilter: true,
      valueType: 'select',
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
      formItemProps: {
        rules: [
          {
            required: true,
            message: '此项为必填项',
          },
        ],
      },
      render: (text, record) => (
        <>
          <Tag
            color={
              record.confirm === true ? '#87d068' : record.confirm === false ? '#FF0000' : '#f50'
            }
          >
            {record.confirm === true ? '审核通过' : record.confirm === false ? '未通过' : '未审核'}{record.confirm === false && record.isSubmit && ',已重新提交'}
          </Tag><br />
          {record.confirm === false && !record.isSubmit && ':' + record.remark}
        </>
      ),
    },
    {
      title: '收费部门',
      dataIndex: 'departmentId-in',
      width: 130,
      valueType: 'treeSelect',
      request: async () => departmentTree,
      render: (text, record) => {
        //打包的时候放出来
        return <>{Dictionaries.getDepartmentName(record.departmentId).reverse().slice(1).join('-')}</>
      }
    },
    {
      title: '学员',
      dataIndex: 'studentName',
      width: 80,
      // search: false,
      fixed: 'left',
      sorter: true,
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
      title: chargeType == 'refundList' || chargeType == 'refund' ? '退费日期' : '收费日期',
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
        '-isNull': {
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
              {record.isSubmit && '已重新提交' || Dictionaries.getCascaderName('auditType', record.auditType) + '未通过'}
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
      title: chargeType == 'refundList' || chargeType == 'refund' ? '退费项目' : '收费项目',
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
    // {
    //   title: '报考班型',
    //   dataIndex: 'classType',
    //   width: 80,
    //   sorter: true,
    //   valueEnum: Dictionaries.getSearch('dict_class_type'),
    //   render: (text, record) => <>{Dictionaries.getName('dict_class_type', record.classType)}</>,
    // },
    // {
    //   title: '班型年限',
    //   sorter: true,
    //   width: 80,
    //   dataIndex: 'classYear',
    //   valueEnum: Dictionaries.getSearch('dict_class_year'),
    //   render: (text, record) => <>{Dictionaries.getName('dict_class_year', record.classYear)}</>,
    // },
    {
      title: '考试类型',
      sorter: true,
      width: 80,
      dataIndex: 'examType',
      valueEnum: Dictionaries.getSearch('dict_exam_type'),
      render: (text, record) => <>{Dictionaries.getName('dict_exam_type', record.examType)}</>,
    },
    {
      title: chargeType == 'chargeList' ? '收费金额' : '退费金额',
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
      title: chargeType == 'refundList' || chargeType == 'refund' ? '退费方式' : '收费方式',
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
      hideInTable: chargeType != 'refundList' && chargeType != 'refund',
      valueEnum: Dictionaries.getSearch('dict_refundType'),
      render: (text, record) => (
        <span>{Dictionaries.getCascaderName('dict_refundType', record.refundType)}</span>
      ),
    },
    {
      title: '备注',
      dataIndex: 'description',
      // search: false,
      // ellipsis: true,
      width: 150,
      // tip: '备注过长会自动收缩',
    },
    {
      title: '财务摘要',
      width: 150,
      dataIndex: 'description2',

      // search: false,
      // ellipsis: true,
      // tip: '备注过长会自动收缩',
    },

    {
      title: chargeType == 'refundList' || chargeType == 'refund' ? '退费人' : '收费人',
      dataIndex: 'userName',
      width: 80,
      // search: false,
    },

    {
      title: '信息提供人',
      dataIndex: 'providerName',
      width: 80,
      // search: false,
    },

    {
      title: '信息所有人',
      dataIndex: 'ownerName',
      width: 80,
      render: (text, record) => <div>{record.ownerName}<span>{record.ownerName && '(' + (record.percent * 100) + '%)'}</span></div>,
      // search: false,
    },

    {
      title: '经办人',
      dataIndex: 'agentName',
      hideInTable: chargeType != 'refundList' && chargeType != 'refund',
      width: 80,
      // search: false,
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
      title: '已开票金额',
      dataIndex: 'usedAmount',
      width: 80,
    },
    {
      title: '审核人',
      dataIndex: 'auditor',
      width: 80,
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
      key: 'options',
      fixed: 'right',
      hideInTable: !chargeTypes,
      render: (text, record) => (
        <Button
          type="primary"
          onClick={() => {
            setChargeInfo(record);
            setChargeModal(false);
          }}
        >
          选择
        </Button>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: 120,
      hideInTable: chargeTypes,
      render: (text, record, _, action) => (
        <>
          <Button
            key="look"
            type="primary"
            size="small"
            icon={<SearchOutlined />}
            style={{ marginRight: '10px', marginBottom: '8px' }}
            onClick={async (e) => {
              e.stopPropagation();
              if (record.type != 2 && record.type != 3) {
                setRenderData({ orderId: record.orderId, type: chargeType });
                setModalVisible(true);
              } else {
                setRenderData(record);
                setModalVisibleOld(true);
              }
            }}
          >
            查看
          </Button>
          <Button
            type="primary"
            key="editable"
            size="small"
            // hidden={record.isSubmit !== false}
            hidden={!record.isSubmit || chargeType != 'refund'}
            // hidden={!!record.auditNum || !record.isSubmit}
            icon={<EditOutlined />}
            style={{ marginRight: '10px', marginBottom: '8px' }}
            onClick={() => {
              setRenderData({ ...record, types: 'eidt', orderId: record.orderId });
              setRefundVisible(true);
            }}
          >
            审核
          </Button>
          <Button
            type="primary"
            key="editable"
            size="small"
            // hidden={record.isSubmit !== false}
            // hidden={!record.isSubmit || chargeType == 'chargeList' || chargeType == 'refundList'}
            hidden={!!record.auditNum || !record.isSubmit || record.confirm || chargeType == 'refund' || record.type == 2 || record.type == 3}
            icon={<EditOutlined />}
            style={{ marginRight: '10px', marginBottom: '8px' }}
            onClick={() => {
              // console.log(record)
              request.get('/sms/business/bizOrder', { 'id': record.orderId }).then(res => {
                const order = res.data.content[0]
                if (!order) {
                  message.error('权限不足，无法提交')
                  return
                }
                const render: any = [];
                order.chargeId = record.id;
                render.push({
                  ...order,
                  ...record
                })
                // console.log(order)
                // console.log(render)
                setRenderData({ list: render, type: record.type == 1 ? 'orders' : record.type });
                setOrderVisible(true);
              });
              // setRenderData({ ...record, types: 'eidt', orderId: record.orderId });
              // setOrderVisible(true);
            }}
          >
            编辑
          </Button>
          <Button
            type="primary"
            key="editable"
            size="small"
            hidden={record.isSubmit || record.type == 2 || record.type == 3}
            icon={<EditOutlined />}
            style={{ marginRight: '10px', marginBottom: '8px' }}
            onClick={() => {
              request.get('/sms/business/bizOrder', { 'id': record.orderId }).then(res => {
                const order = res.data.content[0]
                if (!order) {
                  message.error('权限不足，无法提交')
                  return
                }
                const render: any = [];
                order.chargeId = record.id;
                render.push({
                  ...order,
                  ...record
                })
                // console.log(order)
                // console.log(render)
                setRenderData({ list: render, type: record.type == 1 ? 'orders' : record.type });
                setOrderVisible(true);
              });
              // setTimeout(async () => {
              // }, 200);
              // setRenderData({ ...record, types: 'eidt', orderId: record.orderId });
              // setOrderVisible(true);
            }}
          >
            重新提交
          </Button>
          {/* <Popconfirm
            title="财务订单审核"
            okText="通过"
            cancelText="未通过"
            onConfirm={(e) => {
              e?.stopPropagation();
              //缴费审核
              request
                .post(`/sms/business/bizAudit/audit/${type}`, {
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
              setRenderData({ ...record, confirm: false });
              setAuditVisible(true);
            }}
          >
            <Button
              key="look"
              type="primary"
              hidden={
                record.auditType == 4 ||
                record.isSubmit === false ||
                record.auditType == 0 ||
                type == '1'
              }
              size="small"
              icon={<FileDoneOutlined />}
              style={{ marginRight: '10px', marginBottom: '8px' }}
            >
              审核
            </Button>
          </Popconfirm> */}
          {/* <Popconfirm
            title="退费审核"
            okText="通过"
            cancelText="未通过"
            onConfirm={(e) => {
              e?.stopPropagation();
              //退费审核
              setRenderData({ ...record, confirm: true });
              setAuditVisible(true);
            }}
            onCancel={() => {
              setRenderData({ ...record, confirm: false });
              setAuditVisible(true);
            }}
          >
            <Button
              key="look"
              type="primary"
              hidden={record.isSubmit === false || record.auditType == 0 || type == '0'}
              size="small"
              icon={<FileDoneOutlined />}
              style={{ marginRight: '10px', marginBottom: '8px' }}
            >
              审核
            </Button>
          </Popconfirm> */}

          <Popconfirm
            key={record.id}
            title="是否废除？"
            onConfirm={() => {
              let url = record.auditNum === null ? '/sms/business/bizCharge/unAuditDisable/' : '/sms/business/bizCharge/disable/'

              request.post(url + record.id).then((res: any) => {
                if (res.status == 'success') {
                  message.success('废除成功');
                  callbackRef();
                }
              });
            }}
            onCancel={() => {
              let url = record.auditNum === null ? '/sms/business/bizCharge/unAuditDisable/' : '/sms/business/bizCharge/disable/'
              request.post(url + record.id).then((res: any) => {
                if (res.status == 'success') {
                  if (record.type == '0' || record.type == '1') {
                    request
                      .post('/sms/business/bizOrder/disable/' + record.orderId)
                      .then((ress: any) => {
                        if (ress.status == 'success') {
                          message.success('废除成功');
                          callbackRef();
                        }
                      });
                  } else {
                    message.success('废除成功');
                    callbackRef();
                  }
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
              style={{ marginRight: '10px', marginBottom: '8px' }}
              hidden={Params.confirm === false || chargeType != 'refund'}
              danger
              icon={<DeleteOutlined />}
            >
              废除
            </Button>
          </Popconfirm>
          <Button
            type="primary"
            key="dapchu"
            size="small"
            icon={<FieldNumberOutlined />}
            style={{ marginRight: '10px', marginBottom: '8px' }}
            hidden={chargeType == 'refund' || chargeType == 'refundList'}
            onClick={async () => {
              fetchDownload('/sms/business/bizCharge/export/', record.id, undefined, '.png');
            }}
          >
            导出收据照片
          </Button>
          <Button
            type="primary"
            key="dapchu"
            size="small"
            style={{ marginRight: '10px', marginBottom: '8px' }}
            icon={<FieldNumberOutlined />}
            hidden={chargeType == 'refund'}
            onClick={async () => {
              if (chargeType == 'refundList') {
                fetchDownload('/sms/business/bizCharge/export/2', record.id);
              } else {
                fetchDownload('/sms/business/bizCharge/export/3', record.id);
              }
            }}
          >
            导出收据Word
          </Button>
          {admin ? (
            <>
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
                <Button type="primary" key="delete" size="small" danger icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>
            </>
          ) : (
            ''
          )}
        </>
      ),
    },
  ];

  let toolbar = undefined;

  if (studentType != 'all') {
    params.studentType = studentType;
  }

  if (studentUserId) params.studentUserId = studentUserId;

  if (type == '1' && chargeType == 'refund') {
    // params.auditType = '-isNull';
    toolbar = {
      menu: {
        type: 'tab',
        // activeKey: activeKey,
        items: [

          {
            key: '-isNull',
            label: (
              <Badge count={Badges[0]} size="small" offset={[5, 6]}>
                <Button size='small' type='link' disabled={switchLoding}>①教务主管/学籍审核</Button>
              </Badge>
            ),
          },
          {
            key: '1',
            label: (
              <Badge count={Badges[1]} size="small" offset={[5, 6]}>
                <Button size='small' type='link' disabled={switchLoding}>②事业部负责人审核</Button>
              </Badge>
            ),
          },
          {
            key: '2',
            label: (
              <Badge count={Badges[2]} size="small" offset={[5, 6]}>
                <Button size='small' type='link' disabled={switchLoding}>③财务审核</Button>
              </Badge>
            ),
          },
          {
            key: '3',
            label: (
              <Badge count={Badges[3]} size="small" offset={[5, 6]}>
                <Button size='small' type='link' disabled={switchLoding}>④总经办审核</Button>
              </Badge>
            ),
          },
          {
            key: '4',
            label: <Button size='small' disabled={switchLoding} type='link'>退费列表</Button>,
          },
          {
            key: 'false',
            label: (
              <Badge count={Badges[4]} size="small" offset={[5, 6]}>
                <Button size='small' type='link' disabled={switchLoding}>审核未通过</Button>
              </Badge>
            ),
          },
          {
            key: 'enable',
            label: <Button size='small' type='dashed' danger disabled={switchLoding}>已废除</Button>,
          },
        ],
        onChange: (key: any) => {
          setSwitchLoding(true)
          if (key === 'false') {
            setParams({ auditNum: 'All', enable: true, isSubmit: false });
          } else if (key === '-isNull') {
            setParams({ 'auditNum-isNull': true, enable: true, isSubmit: true });
          } else if (key === 'enable') {
            setParams({ enable: false });
          } else if (key == '4') {
            // setParams({ auditNum: key });
            setParams({});
          } else {
            setParams({ auditNum: key, enable: true, isSubmit: true });
          }

          callbackRef(false);
        },
      },
    };
  }
  let sortList: any = {
    ['confirm,auditNum,num,updateTime']: 'asc,asc,desc,desc',
  };
  if (chargeTypes) {
    sortList = {
      ['updateTime']: 'desc',
    };
  }
  Object.assign(params, Params);
  const isEmpty = (obj: {}) => {
    return Object.keys(obj).length === 0;
  }
  return (
    <>
      <Spin spinning={SpingFalg}>
        <Tables
          columns={columns}
          actionRef={actionRef}
          className="Charge"
          cardBordered
          scroll={{ x: 1500 }}
          request={{ url: url, params: chargeTypes ? { type: 0 } : params, sortList: sortList }}
          toolbar={toolbar}
          getData={(e) => {
            delete e.current
            delete e.pageSize
            setFromDataList(e)
          }}
          loding={(e) => setSwitchLoding(e)}
          search={{ defaultCollapsed: false, labelWidth: 120 }}
          rowSelection={{
            // 注释该行则默认不显示下拉选项
            selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
            onChange: (e, selectedRows) => {
              // setStudentIds(e);
            },
            preserveSelectedRowKeys: true
          }}
          tableAlertOptionRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => {
            return (
              <Space size={24}>
                <span>
                  <a style={{ marginInlineStart: 8 }} onClick={onCleanSelected}>
                    取消选择
                  </a>
                </span>
                <a hidden={!!setModalsCharge}
                  onClick={() => {
                    // setcheckFalg(true);
                    if (chargeType == 'refundList' || chargeType == 'refund') {
                      request
                        .get('/sms/business/bizCharge/getListOfFinance', {
                          idList: selectedRowKeys.join(','),
                        })
                        .then((res) => {
                          if (res.status == 'success') {
                            DownTable(res.data, DownHeader.RefundHeader, '退费信息', 'refund');
                          }
                        });
                    } else {
                      chargeDownload(selectedRowKeys.join(','))

                    }
                  }}
                >
                  导出数据
                </a>
                <Popconfirm
                  title="是否批量不计算业绩？"
                  onConfirm={() => {
                    request.post('/sms/business/bizCharge/reports/setIsCalculation', { ids: selectedRowKeys.join(','), isCalculation: false }).then((res) => {
                      if (res.status == 'success') {
                        callbackRef()
                      }
                    })
                  }}
                  okText="不算"
                  cancelText="取消"
                >
                  <a hidden={!!setModalsCharge}
                  >
                    不计算业绩
                  </a>
                </Popconfirm>
                <Popconfirm
                  title="是否批量计算业绩？"
                  onConfirm={() => {
                    request.post('/sms/business/bizCharge/reports/setIsCalculation', { ids: selectedRowKeys.join(','), isCalculation: true }).then((res) => {
                      if (res.status == 'success') {
                        callbackRef()
                      }
                    })
                  }}
                  okText="算"
                  cancelText="取消"
                >
                  <a hidden={!!setModalsCharge}
                  >
                    计算业绩
                  </a>
                </Popconfirm>
                <a
                  hidden={!setModalsCharge}
                  onClick={() => {
                    let err: any[] = []
                    if (setModalsCharge) {
                      selectedRows.forEach(e => {
                        if (e.usedAmount >= e.amount) {
                          err.push(e.num)
                        }
                      })
                    }
                    if (err.length === 0) {
                      setChargeList(selectedRows)
                      setModalsCharge()
                    } else {
                      Modal.error({
                        title: '以下缴费可开票金额已用完，请重新选择!',
                        content: <p>{err.join(',')}</p>,
                      })
                    }
                  }}
                >
                  选择绑定到发票信息
                </a>
              </Space>
            );
          }}
          toolBarRender={[

            <Button
              hidden={chargeType == 'refundList' || chargeType == 'refund'}
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setUploadFormVisible(true);
              }}
            >
              导入对公转账流水
            </Button>
            , <a
              hidden={chargeType != 'refundList' && chargeType != 'refund'}
              download="汇德退费申请表协议版（未下单直接退款模板）"
              href="./template/汇德退费申请表协议版（未下单直接退款模板）.doc"
            >
              下载退费申请表协议版(未下单直接退款模板)
            </a>,
            <a
              hidden={chargeType != 'refundList' && chargeType != 'refund'}
              download="汇德退费申请书模板（两个--企业和个人）"
              href="./template/汇德退费申请书模板（两个--企业和个人）.doc"
            >
              下载退费申请书模板(两个--企业和个人)
            </a>,
            <a onClick={async () => {
              console.log('actionRef', actionRef);
              if (isEmpty(fromDataList)) {
                message.error('请选择条件!')
                return
              } else {
                // const data = {
                //   enable: true,
                //   'type-in': '0,2',
                //   'num-isNull': false,
                // }
                request
                  .get('/sms/business/bizCharge/getListOfFinance2', fromDataList)
                  .then((res) => {
                    if (res.status == 'success') {
                      if (chargeType == 'refundList' || chargeType == 'refund') {
                        DownTable(res.data, DownHeader.PayHeader, '退费信息', 'refund');
                      } else {
                        DownTable(res.data, DownHeader.jiaoPayHeader, '缴费', 'charge');
                      }
                    }
                  });
                // const content = (await request.get('/sms/business/bizCharge/getListOfFinance2', fromDataList)).data
                // DownTable(content, DownHeader.PayHeader, '缴费信息', 'charge');
              }
            }}>
              条件导出
            </a>
          ]}
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

        {refundVisible && (
          <ChargeOrder
            setModalVisible={() => setRefundVisible(false)}
            modalVisible={refundVisible}
            callbackRef={() => callbackRef()}
            renderData={renderData}
            setPreviewImage={(e: any) => setPreviewImage(e)}
            setPreviewVisible={() => setPreviewVisible(true)}
            admin={admin}
          />
        )}
        <Drawer
          title="重新提交"
          width={1200}
          visible={orderVisibleFalg}
          onClose={() => setOrderVisible(false)}
          maskClosable={false}
          footer={null}
          destroyOnClose={true}
        >
          <ChargeNews
            setModalVisible={() => setOrderVisible(false)}
            modalVisible={orderVisibleFalg}
            renderData={renderData}
            callbackRef={() => callbackRef()}
          />
          {/* {orderVisibleFalg && (
            <ChargeOrder
              setModalVisible={() => setOrderVisible(false)}
              modalVisible={orderVisibleFalg}
              callbackRef={() => callbackRef()}
              renderData={renderData}
              setPreviewImage={(e: any) => setPreviewImage(e)}
              setPreviewVisible={() => setPreviewVisible(true)}
              admin={admin}
            />
          )} */}
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
        {ModalVisibleOld && (
          <ChargeInfoOld
            setModalVisible={() => setModalVisibleOld(false)}
            modalVisible={ModalVisibleOld}
            callbackRef={() => callbackRef()}
            renderData={renderData}
          />
        )}
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
        <Modal
          title="批量导入"
          okText="导入"
          onCancel={() => {
            setUploadFormVisible(false)
          }}
          onOk={async () => {
            if (!uploadData) {
              message.error('请上传文件')
              return
            }
            request.baseOptions({ url: "/sms/business/bizCharge/uploadRemarkCode", data: uploadData }, 'POST', 'up', false).then(res => {
              if (res.status == 'success') {
                message.success('导入成功')
                setUploadFormVisible(false);
                callbackRef();
              } else {
                // content. = res.msg.replaceAll('\n', '<br />')
                Modal.confirm({
                  title: '导入失败',
                  // okText: '我已了解',
                  content: <div style={{ whiteSpace: 'pre' }}>{res.msg}</div>,
                })
              }
              setUploadData(undefined)
            })
          }}
          width={800}
          visible={uploadFormVisible}
        >
          <a download="导入对公转账流水模板.xlsx" href="./template/导入对公转账流水模板.xlsx">
            下载导入对公转账流水模板
          </a>
          <ProFormUploadDragger
            accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            name='file'
            fieldProps={{
              beforeUpload: (file: any, fileList: any[]) => {
                const reader = new FileReader();
                reader.onload = (e: any) => {
                  let dataResult = e.target.result;
                  const workbook = XLSX.read(dataResult, { type: 'binary' });
                  // 假设我们的数据在第一个标签
                  const firstWorksheet = workbook.Sheets[workbook.SheetNames[0]];
                  // XLSX自带了一个工具把导入的数据转成json
                  const jsonArr = XLSX.utils.sheet_to_json(firstWorksheet, { header: 1 });
                  // 通过自定义的方法处理Json,得到Excel原始数据传给后端，后端统一处理
                  // this.importUserListExcel(jsonArr);
                  setUploadData(biuldDataFromExcelJson(jsonArr));
                };
                reader.readAsArrayBuffer(file);
                return false;
              }
            }
            }
          />
        </Modal>
      </Spin>
    </>
  );
};
