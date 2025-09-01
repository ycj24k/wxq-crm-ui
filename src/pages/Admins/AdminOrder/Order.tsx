import { forwardRef, useEffect, useRef, useState } from 'react';
import {
  PlusOutlined,
  FormOutlined,
  EditOutlined,
  AccountBookOutlined,
  DeleteOutlined,
  ProfileOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons';
import {
  Button,
  Tag,
  Space,
  Popconfirm,
  message,
  Spin,
  Tooltip,
  Modal,
  Table,
  Drawer,
} from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import request from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import StudentOrder from './studentOrder';
import CompanyOrder from './companyOrder';
import StudentInfo from '../StudentManage/studentInfo';
import Modals from './Modals';
import ChargeOrder from '../AdminCharge/ChargeOrder';
import ChargeNew from '../AdminCharge/ChargeNew';
import ChargeNewCopy from '../AdminCharge/ChargeNewCopy';
import ChargeInfo from '../AdminCharge/ChargeInfo';
import { history } from 'umi';
import ChargeIframe from '../AdminCharge/ChargeIframe';
import CompanyStudentClass from './CompanyStudentClass';
import StudentList from './StudentList';
import Tables from '@/components/Tables';
import Upload from '@/services/util/upload';
import filter from '@/services/util/filter';
const { confirm } = Modal;
type GithubIssueItem = {
  studentName: string;
  sex: number;
  id: number;
  parentId: number | string;
  url: string;
  enable: boolean;
  isPeer: boolean;
  source: string;
  type: string | number;
  studentType: string | number;
  arrears: string | number;
  isFormal: boolean;
  status: string | number;
  discount: number;
  studentUserId: number;
  charge: number;
  receivable: number;
  project: string;
  classType: string;
  classYear: string;
  examType: string;
  createTime: any;
  studentId: number;
  createBy: number;
  provider: number;
  ownerName: string;
  percent: number;
};

export default (props: any) => {
  const {
    admins,
    admin,
    refund,
    suppOrder,
    studentUserId = '',
    type = 0,
    orderId = '',
    orderIds = undefined,
    searchFalg = false,
    searchParams,
    showType,
    showStudentBtn,
    orderType
  } = props;
  const [CommodalVisibleFalg, setComModalVisible] = useState<boolean>(false);
  const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
  const [orderVisibleFalg, setOrderVisible] = useState<boolean>(false);
  const [CorderVisibleFalg, setCOrderVisible] = useState<boolean>(false);
  const [CorderVisibleFalg2, setCOrderVisible2] = useState<boolean>(false);
  const [SpingFalg, SetSpingFalg] = useState<boolean>(false);
  const [ChargeOrderVisibleFalg, setChargeOrderVisible] = useState<boolean>(false);
  const [ChargeNewsVisibleFalg, setChargeNewsVisibleFalg] = useState<boolean>(false);
  const [suppVisibleFalg, setSuppVisible] = useState<boolean>(false);
  const [UploadFalg, setUploadVisible] = useState<boolean>(false);
  const [ChargeInfoVisibleFalg, setChargeInfoVisible] = useState<boolean>(false);
  //学员下单
  const [StudentVisibleFalg, setStudentVisible] = useState<boolean>(false);

  const [InfoVisibleFalg, setInfoVisible] = useState<boolean>(false);
  const [renderData, setRenderData] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<any>();
  const [paramsA, setparamsA] = useState<any>({});
  const [Student, setStudentId] = useState<any>(null);
  const [dataSourceList, setDataSourceList] = useState<any>([]);
  const [previewVisible, setPreviewVisible] = useState<any>(false);
  const [Uploadurl, setUrl] = useState<string>('');
  const [expandedRowKeys, setexpandedRowKeys] = useState<any>([]);
  const url2 = '/sms/business/bizStudentUser';
  const urlCharge = '/sms/business/bizCharge';
  const url = '/sms/business/bizOrder'
  const CompanyOrders = forwardRef(CompanyOrder);
  const ChargeOrders = forwardRef(ChargeOrder);
  const ChargeNews = forwardRef(ChargeNew);
  const ChargeNewsCopy = forwardRef(ChargeNewCopy)
  const childRef = useRef();
  const orderRef = useRef();
  const actionRef = useRef<ActionType>();
  const actionRefs = useRef<ActionType>();
  useEffect(() => {
    callbackRef();
  }, [type]);
  useEffect(() => {
    getdataSource()
    setparamsA({ ...history.location.query, ...searchParams });
  }, []);
  const callbackRef = () => {
    // @ts-ignore
    actionRef.current.reload();
    actionRefs?.current?.reload();
    SetSpingFalg(false);
  };
  useEffect(() => {
    let arr: any = [];
    let array: any = [];
    let array2: any = [];
    let params: any = {};


    if (Student) {
      SetSpingFalg(true);
      let arr2 = [];
      if (!Array.isArray(Student)) {
        arr2 = [Student];
      } else {
        arr2 = Student;
      }
      params.parentId = renderData.id;
      params.project = renderData.order.project;
      // params.studentId = Student.id;
      console.log('Student', arr2, renderData);
      arr2.forEach((item: any) => {
        // arr.push({ ...params, studentUserId: item.id });
        array.push({
          studentUserId: item.id,
          classType: renderData.order.classType,
          examType: renderData.order.examType,
          classYear: renderData.order.classYear,
          receivable: renderData.order.receivable,
          project: renderData.order.project,
          parentId: renderData.id,
          quantity: 1,
          discount: renderData.discount,
          source: renderData.source,
          provider: renderData.provider,
          discountRemark: renderData.discountRemark
        });
      });
      request.postAll('/sms/business/bizOrder/saveArray', { array }).then((res: any) => {
        if (res.status == 'success') {
          message.success('操作成功');
        }
        callbackRef();
      });
      SetSpingFalg(false);
    }
  }, [Student]);
  const getChargeList = async (orderId: number, enable: boolean) => {
    const list: [] = (await request.get('/sms/business/bizCharge', { orderId, enable })).data
      .content;
    return list;
  };
  const showConfirm = (obj: { title: string; content: string }, fn: () => void) => {
    confirm({
      title: obj.title,
      icon: <ExclamationCircleFilled />,
      content: obj.content,
      onOk() {
        fn();
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      width: 120,
      title: '订单编号',
      dataIndex: 'num',
      sorter: true,
      fixed: 'left',
    },
    {
      width: 100,
      title: '学员/企业',
      dataIndex: 'studentName',
      sorter: true,
      fixed: 'left',
      // width: 100,
      // search: false,
      render: (text, record) => (
        <>
          {studentUserId ? (
            <span> {record.studentName}</span>
          ) : (
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
          )}
        </>
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
      sorter: true,
    },
    {
      width: 100,
      title: '订单金额',
      dataIndex: 'totalReceivable',
      sorter: true,
      search: false,
    },
    {
      width: 100,
      title: '订单实际应收金额',
      dataIndex: 'actualReceivable',
      sorter: true,
      search: false,
    },
    {
      width: 100,
      title: '累计实收',
      sorter: true,
      dataIndex: 'charge',
      search: false,
    },
    {
      width: 100,
      title: '累计优惠',
      sorter: true,
      dataIndex: 'discount',
      search: false,
    },
    {
      width: 80,
      title: '欠费',
      dataIndex: 'arrears',
      sorter: true,
      search: false,
      render: (text, record) => <span style={{ color: 'red' }}>{record.arrears}</span>,
    },
    {
      width: 120,
      title: '订单来源',
      dataIndex: 'source',
      valueType: 'select',
      key: 'source',
      filters: true,
      sorter: true,
      filterMultiple: false,
      valueEnum: Dictionaries.getSearch('dict_source'),
      render: (text, record) => <span>{Dictionaries.getName('dict_source', record.source)}</span>,
    },
    {
      width: 100,
      title: '项目总称',
      dataIndex: 'parentProjects',
      key: 'parentProjects',
      sorter: true,
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
      title: '报考岗位',
      dataIndex: 'project',
      sorter: true,
      // search: false,
      key: 'project',
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
      width: 100,
      title: '报考人数',
      dataIndex: 'quantity',
      sorter: true,
      search: false,
    },

    {
      width: 80,
      title: '备注',
      dataIndex: 'description',
      search: false,
      sorter: true,
      ellipsis: true,
      tip: '备注过长会自动收缩',
    },
    {
      width: 100,
      title: '下单时间',
      key: 'createTime',
      sorter: true,
      dataIndex: 'createTime',
      valueType: 'dateRange',
      render: (text, record) => (
        <span>{record.createTime}</span>
      ),
      // sorter: true,
      // hideInSearch: true,
    },
    {
      width: 120,
      title: '缴费状态',
      dataIndex: 'status',
      // search: false,
      filters: true,
      sorter: true,
      filterMultiple: false,
      valueType: 'select',
      valueEnum: {
        '0': {
          text: <Tag color="#FF0000">{Dictionaries.getName('orderStatus', '0')}</Tag>,
          status: 'Processing',
        },
        '1': {
          text: <Tag color="#f50">{Dictionaries.getName('orderStatus', '1')}</Tag>,
          status: 'Error',
        },
        '2': {
          text: <Tag color="#87d068">{Dictionaries.getName('orderStatus', '2')}</Tag>,
          status: 'Success',
        },
      },
      render: (text, record) => (
        <>
          <Tag color={record.status == 0 ? '#FF0000' : record.status == 1 ? '#f50' : '#87d068'}>
            {Dictionaries.getName('orderStatus', record.status)}
          </Tag>
        </>
      ),
    },
    {
      width: 100,
      title: '报考岗位',
      // dataIndex: 'classType',
      search: false,
      sorter: true,
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
      width: 100,
      title: '班级类型',
      dataIndex: 'classType',
      search: false,
      sorter: true,
      render: (text, record) => {
        let res = Dictionaries.getName('dict_class_type', record.classType)
        if (!res) return (
          <Button
            key="editable"
            type="primary"
            size="small"
            icon={<EditOutlined />}
            className="tablebut"
            onClick={async () => {
              setRenderData({
                ...record,
                type: 'order',
                orderNumber: 0,
                projectClassExamList: [],
              });
              setCOrderVisible2(true);
            }}
          >
            完善班型信息
          </Button>
        )
        else return (
          <span>{res}</span>
        )
      },
    },
    {
      width: 100,
      title: '班型年限',
      dataIndex: 'classYear',
      search: false,
      sorter: true,
      render: (text, record) => (
        <span>{Dictionaries.getName('dict_class_year', record.classYear)}</span>
      ),
    },
    {
      title: '考试类型',
      dataIndex: 'examType',
      search: false,
      sorter: true,
      render: (text, record) => (
        <span>{Dictionaries.getName('dict_exam_type', record.examType)}</span>
      ),
    },
    {
      title: '班型人数',
      dataIndex: 'quantity',
      sorter: true,
      hideInTable: type == 0,
    },
    {
      title: '报考岗位数量',
      dataIndex: 'studentQuantity',
      hideInTable: type == 0,
      sorter: true,
    },
    {
      title: '收费人',
      dataIndex: 'userName',
      sorter: true,
    },
    {
      title: '信息所有人',
      dataIndex: 'ownerName',
      sorter: true,
      render: (text, record) => <div>{record.ownerName}<span>{record.ownerName && '(' + (record.percent * 100) + '%)'}</span></div>,
    },
    {
      title: '信息提供人',
      dataIndex: 'providerName',
      sorter: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 170,
      fixed: 'right',
      render: (text, record, _, action) => (
        <>
          <Tooltip placement="topLeft" title={'订单缴费'}>
            <Button
              key="jiaofei"
              size="small"
              type="primary"
              hidden={!suppOrder}
              icon={<AccountBookOutlined />}
              className="tablebut"
              onClick={async () => {
                console.log(record, 'record------>')
                const list = await getChargeList(record.id, true);
                if (list.length > 0 && list.every((item: any) => item.confirm !== true)) {
                  showConfirm(
                    { title: '该订单尚有缴费未审核！', content: '点击确定继续缴费' },
                    () => {
                      let orders: any = record;
                      orders.orderId = record.id;
                      setRenderData({ list: [orders], type: 'charge', orderNumber: 0 });
                      setSuppVisible(true);
                    },
                  );
                } else {
                  let orders: any = record;
                  orders.orderId = record.id;
                  setRenderData({ list: [orders], type: 'charge', orderNumber: 0 });
                  setSuppVisible(true);
                }
              }}
            >
              补缴下单
            </Button>
          </Tooltip>


          <Tooltip placement="topLeft" title={'订单缴费'}>
            <Button
              key="jiaofei"
              hidden={record.parentId != '-1' || orderType == 'sp' || refund || suppOrder}
              size="small"
              type="primary"
              icon={<AccountBookOutlined />}
              className="tablebut"
              onClick={async () => {
                const list = await getChargeList(record.id, true);
                if (list.length > 0 && list.every((item: any) => item.confirm !== true)) {
                  showConfirm(
                    { title: '该订单尚有缴费未审核！', content: '点击确定继续缴费' },
                    () => {
                      let orders: any = record;
                      orders.orderId = record.id;
                      setRenderData({ list: [orders], type: 'charge', orderNumber: 0 });
                      setChargeNewsVisibleFalg(true);
                    },
                  );
                } else {
                  let orders: any = record;
                  orders.orderId = record.id;
                  setRenderData({ list: [orders], type: 'charge', orderNumber: 0 });
                  setChargeNewsVisibleFalg(true);
                }
              }}
            >
              缴费
            </Button>
          </Tooltip>
          <Tooltip placement="topLeft" title={'编辑订单'}>
            <Button
              key="editable"
              type="primary"
              size="small"
              hidden={showType == 'refund' || orderType == 'sp' || refund || suppOrder}
              icon={<EditOutlined />}
              className="tablebut"
              onClick={async () => {
                setRenderData({
                  ...record,
                  type: 'order',
                  orderNumber: 0,
                  projectClassExamList: [],
                });
                setCOrderVisible(true);
              }}
            >
              编辑
            </Button>
          </Tooltip>
          <Button
            key="deletejiaofei"
            size="small"
            type="primary"
            onClick={() => {
              if (record.charge <= 0) {
                message.error('当前订单累计实收为0，不能进行退费', 5);
                return;
              }
              setRenderData({ ...record, type: 'orders', orderNumber: 0 });
              setChargeOrderVisible(true);
            }}
            hidden={record.parentId != '-1' || orderType == 'sp' || suppOrder}
            icon={<AccountBookOutlined />}
            className="tablebut"
            danger
          >
            退费
          </Button>
          <Popconfirm
            key={record.id}
            title="是否确定删除？"
            onConfirm={async () => {
              const list = await getChargeList(record.id, true);
              if (list.length > 0) {
                message.error('该订单尚有缴费记录，请先废除缴费记录！', 5);
                return;
              }
              request.post('/sms/business/bizOrder/disable/' + record.id).then((res: any) => {
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
              hidden={record.parentId != '-1' || showType == 'refund' || orderType == 'sp' || refund || suppOrder}
              key="delete"
              size="small"
              type="primary"
              danger
              icon={<DeleteOutlined />}
            >
              废除
            </Button>
          </Popconfirm>
          <Tooltip placement="topLeft" title={'缴费信息'}>
            <Button
              key="ljiaofei"
              size="small"
              type="primary"
              className="tablebut"
              hidden={showType == 'refund' || refund}
              icon={<ProfileOutlined />}
              onClick={async () => {
                SetSpingFalg(true);
                setRenderData({ orderId: record.id });
                setChargeInfoVisible(true);
                SetSpingFalg(false);
              }}
            >
              缴费信息
            </Button>
          </Tooltip>
          <div hidden={record.studentType == 0 || showType == 'refund' || orderType == 'sp' || refund || suppOrder}>
            <Button
              key="banxin"
              size="small"
              type="primary"
              className="tablebut"
              icon={<ProfileOutlined />}
              onClick={async () => {
                setRenderData({ ...record, order: { ...record, parentId: record.id } });

                setComModalVisible(true);
              }}
            >
              查看订单学员
            </Button>
            <Button
              key="daoru"
              size="small"
              type="primary"
              onClick={async () => {
                let url = '/sms/business/bizOrder/saveStudentAndOrder';
                setRenderData({ ...record, order: { ...record, parentId: record.id } });
                setUrl(url + '?id=' + record.id);
                setUploadVisible(true);
              }}
            >
              批量导入学员到班型
            </Button>
            <Button
              key="dataJob"
              size="small"
              type="primary"
              style={{ margin: '5px 0' }}
              onClick={async () => {
                const fileName = record.studentName + '资料收集'
                const data = {
                  classType: record.classType,
                  examType: record.examType,
                  classYear: record.classYear,
                  receivable: record.receivable,
                  u: record.createBy,
                  t: '3',
                  source: record.source,
                  provider: record.provider,
                  p: record.project,
                  parentId: record.id
                }
                request.post2('/sms/business/bizFile/createWeChatMiniQRCode', { fileName }, data).then((res) => {
                  if (res.status == 'success') {
                    history.push('/business/qrcode')
                  }
                })
              }}
            >
              资料收集
            </Button>
            <Button
              key="daoruxueyuan"
              size="small"
              type="primary"
              style={{ margin: '5px 0' }}
              onClick={() => {
                setRenderData({
                  ...record,
                  order: { ...record, parentId: record.id },
                  type: 'orders',
                });
                setModalVisible(true);
              }}
            >
              选择已有学员添加到班型
            </Button>
          </div>
          {/* {admin ? (
            
          ) : (
            ''
          )} */}
        </>
      ),
    },
  ];
  // const expandedRowRender = (record: any, index: number, indent: any, expanded: any) => {
  //   return (
  //     <ProTable
  //       actionRef={actionRefs}
  //       bordered
  //       headerTitle="班型管理"
  //       scroll={{ x: 1500 }}
  //       columns={[
  //         {
  //           title: '子订单导入编号',
  //           dataIndex: 'id',
  //         },
  //         {
  //           title: '项目总称',
  //           dataIndex: 'parentProjects',
  //           key: 'parentProjects',
  //           sorter: true,
  //           valueType: 'cascader',
  //           fieldProps: {
  //             options: Dictionaries.getList('dict_reg_job'),
  //             showSearch: { filter },
  //           },
  //           width: 180,
  //           render: (text, record) => (
  //             <span key="parentProjects">
  //               {Dictionaries.getCascaderAllName('dict_reg_job', record.project)}
  //             </span>
  //           ),
  //         },
  //         {
  //           title: '报考岗位',
  //           // dataIndex: 'classType',
  //           search: false,
  //           render: (text, record) => (
  //             <span>
  //               {record.project &&
  //                 [...new Set(record.project.split(','))].map((item: any, index: number) => {
  //                   return (
  //                     <span key={index}>
  //                       {Dictionaries.getCascaderName('dict_reg_job', item)} <br />
  //                     </span>
  //                   );
  //                 })}
  //             </span>
  //           ),
  //         },
  //         {
  //           title: '班级类型',
  //           dataIndex: 'classType',
  //           search: false,
  //           render: (text, record) => (
  //             <span>{Dictionaries.getName('dict_class_type', record.classType)}</span>
  //           ),
  //         },
  //         {
  //           title: '班型年限',
  //           dataIndex: 'classYear',
  //           search: false,
  //           render: (text, record) => (
  //             <span>{Dictionaries.getName('dict_class_year', record.classYear)}</span>
  //           ),
  //         },
  //         {
  //           title: '考试类型',
  //           dataIndex: 'examType',
  //           search: false,
  //           render: (text, record) => (
  //             <span>{Dictionaries.getName('dict_exam_type', record.examType)}</span>
  //           ),
  //         },
  //         {
  //           title: '班型收费/人',
  //           dataIndex: 'receivable',
  //         },
  //         {
  //           title: '班型人数',
  //           dataIndex: 'quantity',
  //           hideInTable: type == 0,
  //         },
  //         {
  //           title: '已报名人数',
  //           dataIndex: 'studentQuantity',
  //           hideInTable: type == 0,
  //         },
  //         {
  //           title: '班级操作',
  //           dataIndex: 'operation',
  //           key: 'operation',
  //           valueType: 'option',
  //           width: 240,
  //           fixed: 'right',
  //           render: (text, records) => (
  //             <div>
  //               {/* <div>
  //                 <a
  //                   key="Pause"
  //                   hidden={!record.studentType}
  //                   onClick={() => {
  //                     setRenderData({
  //                       ...record,
  //                       order: { ...records, parentId: record.id },
  //                       type: 'orders',
  //                     });
  //                     setModalVisible(true);
  //                   }}
  //                 >
  //                   选择已有学员添加到班型
  //                 </a>
  //               </div> */}
  //               <div>
  //                 <a
  //                   key="Stop"
  //                   hidden={!record.studentType}
  //                   onClick={async () => {
  //                     // const list = (
  //                     //   await request.get('/sms/business/bizOrder', { parentId: records.orderId })
  //                     // ).data.content;
  //                     // console.log('list', list);
  //                     setRenderData({ ...records, order: { ...records, parentId: record.id } });

  //                     setComModalVisible(true);
  //                   }}
  //                 >
  //                   查看班型学员
  //                 </a>
  //               </div>
  //               {/* <div>
  //                 <a
  //                   key="Stop"
  //                   hidden={!record.studentType}
  //                   onClick={async () => {
  //                     let url = '/sms/business/bizOrder/saveStudentAndOrder';
  //                     setRenderData({ ...records, order: { ...records, parentId: record.id } });
  //                     setUrl(url + '?id=' + records.id);
  //                     setUploadVisible(true);
  //                   }}
  //                 >
  //                   批量导入学员到班型
  //                 </a>
  //               </div> */}
  //               <div>
  //                 <Popconfirm
  //                   key="deletes"
  //                   title="是否删除班型?"
  //                   onConfirm={() => {
  //                     request.delete('/sms/business/bizOrder', { id: records.id }).then((res) => {
  //                       if (res.status == 'success') {
  //                         message.success('操作成功!');
  //                       }
  //                     });
  //                     callbackRef();
  //                   }}
  //                   okText="删除"
  //                   cancelText="取消"
  //                 >
  //                   <a key="deletees" style={{ color: 'red' }}>
  //                     删除班型
  //                   </a>
  //                 </Popconfirm>
  //               </div>
  //             </div>
  //           ),
  //         },
  //       ]}
  //       search={false}
  //       rowKey="id"
  //       // rowClassName={(record) => style.backgrounds}
  //       options={false}
  //       dataSource={record.projectClassExamList}
  //       request={async (params, sort, filter) => {
  //         const dataList: any = await request.get('/sms/business/bizOrder', {
  //           parentId: record.id,
  //         });

  //         return {
  //           data: dataList.data.content,
  //           success: dataList.success,
  //           total: dataList.data.totalElements,
  //         };
  //       }}
  //       // dataSource={[record]}
  //       pagination={false}
  //     />
  //   );
  // };
  const studentTypes = type == 'all' ? {} : { studentType: type };
  let params: any =
    type == 3
      ? { parentId: '-1', enable: false }
      : { parentId: '-1', ...studentTypes, enable: true };
  let toolbar = undefined;
  if (studentUserId) params.studentUserId = studentUserId;

  if (orderId) params['id-in'] = orderId;
  let sortList = {
    ['createTime,status']: 'desc,asc',
  };
  if (searchFalg) {
    params = { ...params, ...searchFalg }
  }
  // if (admins === 'admin') delete params.parentId;
  const getdataSource = async () => {
    if (admins) {
      const data = (await request.get('/sms/business/bizOrder/lastDealOrder', { id: studentUserId })).data
      setDataSourceList([data])
    }

  }
  return (
    <>
      <Spin spinning={SpingFalg}>
        {
          admins ? <Tables
            columns={columns}
            className="Order"
            scroll={{ x: 2500 }}
            actionRef={actionRef}
            cardBordered
            dataSource={dataSourceList}
            rowKey="id"
          /> : <Tables
            columns={columns}
            className="Order"
            scroll={{ x: 2500 }}
            actionRef={actionRef}
            cardBordered
            request={{ url: url, params: { ...params, ...paramsA }, sortList }}
            rowKey="id"
            // expandable={{
            //   expandedRowRender: expandedRowRender,
            //   defaultExpandAllRows: true,
            //   expandedRowKeys: orderIds,
            // }}
            toolbar={toolbar}
            rowSelection={{
              // 注释该行则默认不显示下拉选项
              selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
              onChange: (e, selectedRows) => {
                setexpandedRowKeys(selectedRows);
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
                      selectedRows.forEach((item: any) => {
                        item.orderId = item.id;
                      });

                      setRenderData({ list: selectedRows, type: 'charge' });
                      setChargeNewsVisibleFalg(true);
                    }}
                  >
                    多订单缴费
                  </a>
                </Space>
              );
            }}
            toolBarRender={[
              // <Button
              //   key="ordere"
              //   type="primary"
              //   hidden={showStudentBtn == 'hiddenBtn'}
              //   icon={<FormOutlined />}
              //   onClick={() => {
              //     setStudentVisible(true)
              //   }}
              // >
              //   学员下单
              // </Button>,
              <Button
                key="ordere"
                type="primary"
                icon={<PlusOutlined />}
                onClick={async () => {
                  if (expandedRowKeys.length == 0) {
                    message.error('请先勾选至少一笔订单进行缴费!');
                    return;
                  }
                  expandedRowKeys.forEach((item: any) => {
                    item.orderId = item.id;
                  });
                  setRenderData({ list: expandedRowKeys, type: 'charge' });
                  setChargeNewsVisibleFalg(true);
                }}
                hidden={searchFalg}
              >
                勾选多个订单合并缴费
              </Button>,
            ]}
            search={(orderId || searchFalg) ? false : { defaultCollapsed: false, labelWidth: 120 }}
            key={params}
          />
        }
        <Modal
          title="编辑"
          width={1200}
          visible={CorderVisibleFalg}
          onCancel={() => setCOrderVisible(false)}
          destroyOnClose={true}
          maskClosable={false}
          footer={null}
        >
          {CorderVisibleFalg && (
            <CompanyOrders
              ref={childRef}
              setModalVisible={() => setCOrderVisible(false)}
              modalVisible={CorderVisibleFalg}
              callbackRef={() => callbackRef()}
              renderData={renderData}
            />
          )}
        </Modal>
        <Modal
          title="完善班型信息"
          width={1200}
          visible={CorderVisibleFalg2}
          onCancel={() => setCOrderVisible2(false)}
          destroyOnClose={true}
          maskClosable={false}
          footer={null}
        >
          {CorderVisibleFalg2 && (
            <CompanyOrders
              ref={childRef}
              setModalVisible={() => setCOrderVisible2(false)}
              modalVisible={CorderVisibleFalg2}
              callbackRef={() => callbackRef()}
              renderData={renderData}
              url="/sms/business/bizOrder/improveAndSubmit"
            />
          )}
        </Modal>
        <Modal
          title={renderData?.type == 'order' ? '缴费' : '退费'}
          width={1200}
          visible={ChargeOrderVisibleFalg}
          onCancel={() => setChargeOrderVisible(false)}
          maskClosable={false}
          footer={null}
        >
          <ChargeOrders
            ref={orderRef}
            setModalVisible={() => setChargeOrderVisible(false)}
            modalVisible={ChargeOrderVisibleFalg}
            renderData={renderData}
            callbackRef={() => callbackRef()}
            setPreviewImage={(e: any) => setPreviewImage(e)}
            setPreviewVisible={() => setPreviewVisible(true)}
          />
        </Modal>
        {modalVisibleFalg && (
          <Modals
            setModalVisible={() => setModalVisible(false)}
            modalVisible={modalVisibleFalg}
            callbackRef={() => callbackRef()}
            renderData={renderData}
            maskClosable={false}
            isFormal={null}
            parentId={renderData.studentId}
            setStudentId={(e: any) => {
              setStudentId(e);
            }}
          />
        )}
        {CommodalVisibleFalg && (
          <CompanyStudentClass
            setModalVisible={() => setComModalVisible(false)}
            modalVisible={CommodalVisibleFalg}
            callbackRef={() => callbackRef()}
            renderData={renderData}
            setStudentId={(e: any) => {
              setStudentId(e);
            }}
          />
        )}
        {orderVisibleFalg && (
          <StudentOrder
            setModalVisible={() => setOrderVisible(false)}
            modalVisible={orderVisibleFalg}
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

        <Drawer
          title="补缴下单"
          width={1200}


          visible={suppVisibleFalg}
          onClose={() => setSuppVisible(false)}
          maskClosable={false}
          footer={null}
          destroyOnClose={true}
        >
          <ChargeNews
            setModalVisible={() => setSuppVisible(false)}
            modalVisible={suppVisibleFalg}
            renderData={renderData}
            supple={true}
            callbackRef={() => callbackRef()}
          />
        </Drawer>

        <Drawer
          title="缴费"
          width={1200}
          visible={ChargeNewsVisibleFalg}
          onClose={() => setChargeNewsVisibleFalg(false)}
          maskClosable={false}
          footer={null}
          destroyOnClose={true}
        >
          <ChargeNews
            setModalVisible={() => setChargeNewsVisibleFalg(false)}
            modalVisible={ChargeNewsVisibleFalg}
            renderData={renderData}
            callbackRef={() => callbackRef()}
          />

          {/* <ChargeNewsCopy
            setModalVisible={() => setChargeNewsVisibleFalg(false)}
            modalVisible={ChargeNewsVisibleFalg}
            renderData={renderData}
            callbackRef={() => callbackRef()}
          /> */}
        </Drawer>

        {ChargeInfoVisibleFalg && (
          <ChargeInfo
            setModalVisible={() => setChargeInfoVisible(false)}
            modalVisible={ChargeInfoVisibleFalg}
            renderData={renderData}
            callbackRef={() => callbackRef()}
            setPreviewImage={(e: any) => setPreviewImage(e)}
            setPreviewVisible={() => setPreviewVisible(true)}
          />
        )}

        {/* 学员下单 */}
        {StudentVisibleFalg && (
          <StudentList
            setModalVisible={() => setStudentVisible(false)}
            modalVisible={StudentVisibleFalg}
            renderData={renderData}
            callbackRef={() => callbackRef()}
          />
        )}

        {UploadFalg && (
          <Upload
            setModalVisible={() => setUploadVisible(false)}
            modalVisible={UploadFalg}
            url={Uploadurl}
            type="studentOrder"
            propsData={{ resourceType: 0, parentId: renderData.studentId }}
            callbackFn={(e: any) => setComModalVisible(true)}
          />
        )}
        <ChargeIframe
          previewVisible={previewVisible}
          setPreviewVisible={() => setPreviewVisible(false)}
          previewImage={previewImage}
        />
      </Spin>
    </>
  );
};