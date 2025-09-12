import { useEffect, useRef, useState } from 'react';
import {
  PlusOutlined,
  SearchOutlined,
  UserAddOutlined,
  ApiOutlined,
  FormOutlined,
  DownloadOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import {
  Button,
  Tag,
  Modal,
  Popconfirm,
  message,
  Space,
  Tooltip,
} from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import request from '@/services/ant-design-pro/apiRequest';
// import DownTable from '@/services/util/timeFn';
import Dictionaries from '@/services/util/dictionaries';
import { PageContainer } from '@ant-design/pro-layout';
import Modals from './userModal';
import FollowModal from './followModal';
import StudentInfo from './studentInfo';
import StudentOrder from '../AdminOrder/studentOrder';
import StepsOrder from '../AdminOrder/StepsOrder';
import AddModals from '../AdminReturnVisit/addModals';
import Upload from '@/services/util/upload';
import UserManageCard from '../Department/UserManageCard';
import ContractS from './ContractS';
import StudentOrders from './StudentOrder';
import CompanyContract from '../Contract/CompanyContract';
import ChargeIframe from '../AdminCharge/ChargeIframe';
import Tables from '@/components/Tables';
import IsVerifyModel from './isVerifyModel';
import ContractModel from './ContractModel';
import { useModel, history } from 'umi';
import filter from '@/services/util/filter';
import { ModalForm, ProFormCascader, ProFormInstance } from '@ant-design/pro-form';
import { getNextDay } from '@/pages/Department/AchievementUser/getTime';
import './index.less'
import UserTreeSelect from '@/components/ProFormUser/UserTreeSelect';
type GithubIssueItem = {
  name: string;
  mobile: string;
  sex: number;
  receiveNum: number;
  id: number;
  studentId: number;
  url: string;
  enable: boolean;
  isVisit: boolean;
  isPeer: boolean;
  source: string;
  studentSource: string;
  type: string | number;
  isFormal: boolean;
  createTime: any;
  consultationTime: any;
  circulationTime: any;
  presentationTime: any;
  idCard: string;
  project: string;
  userId: number;
  code: any;
  visitTime: any;
  dealDate: any;
  lastDealTime: any;
  ownerName: string;
  percent: number;
};
export default (props: any) => {
  const {
    TabListNuber,
    order = '',
    admin,
    oncancel,
    type,
    toolbar: propToolbar,
    setStudentId,
    setStudentVisible,
    isFormal = false,
    isPay = null,
    parentId = null,
    companyStudent = null,
    recommend = false,
    userIds = false,
    source = false
  } = props;

  const actionRef = useRef<ActionType>();
  const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
  const [followVisibleFalg, setFollowVisible] = useState<boolean>(false);
  const [ContractSFalg, setContractSVisible] = useState<boolean>(false);
  const [contract, setContract] = useState<boolean>(false);
  const [IsVerifyModelFalg, setIsVerifyModelVisible] = useState<boolean>(false);
  const [CompanyContractFalg, setCompanyContractVisible] = useState<boolean>(false);
  const [InfoVisibleFalg, setInfoVisible] = useState<boolean>(false);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [previewImage, setpreviewImage] = useState<boolean>(false);
  const [followStatus, setFollowStatus] = useState(undefined);
  const [UploadFalg, setUploadVisible] = useState<boolean>(false);
  const [StudentOrderOpen, setStudentOrderOpen] = useState<boolean>(false);
  const [UploadFalgs, setUploadVisibles] = useState<boolean>(false);
  const [orderVisibleFalg, setOrderVisible] = useState<boolean>(false);
  const [orderVisibleFalg1, setOrderVisible1] = useState<boolean>(false);
  const [FromFalg, setFromFalg] = useState<boolean>(false);
  const [userFromTeacher, setuserFromTeacher] = useState<boolean>(false);
  const [userFrom, setUserFrom] = useState<boolean>(false);
  const [AddModalsVisible, setAddModalsVisible] = useState<boolean>(false);
  const [renderData, setRenderData] = useState<any>(null);
  const [selectedRowsList, setselectedRowsList] = useState<any>([]);
  const [selectedRowsId, setselectedRowsId] = useState<any>([]);
  const [UploadUrl, setUploadUrl] = useState<string>('/sms/business/bizStudent/saveArray');
  const [paramsA, setparamsA] = useState<any>({});
  const [CardVisible, setCardVisible] = useState<boolean>(false);
  const [CardContent, setCardContent] = useState<any>();
  const { initialState } = useModel('@@initialState');
  const [userNameId, setUserNameId] = useState<any>();
  const [userNameId1, setUserNameId1] = useState<any>();
  let [department, setDepartment] = useState<any>({});
  const [isTabListNuber, setisTabListNuber] = useState<any>('0');
  const [isShowMedium, setShowisShowMedium] = useState<boolean>(false)
  // const url = isFormal || recommend ? '/sms/business/bizStudentUser' : '/sms/business/bizStudentUser/potentialStudent';
  const url = isFormal ? '/sms/business/bizStudent' : '/sms/business/bizStudentUser/potentialStudent';
  const formRef = useRef<ProFormInstance>();
  const formRefs = useRef<ProFormInstance>();
  useEffect(() => {
    // 当 TabListNuber 变化时，重新加载表格数据
    // setisTabListNuber(TabListNuber);
    if (actionRef.current) {
      actionRef.current.reload();
    }
  }, [TabListNuber]);

  // const url = '/sms/business/bizStudent';
  useEffect(() => {
    callbackRef();
  }, [type]);
  useEffect(() => {
    formRef.current?.setFieldsValue(history.location.query);
    setparamsA(history.location.query);
    // actionRef?.current?.reload();
  }, []);
  useEffect(() => {
    let isMounted = true;
    
    if (JSON.stringify(department) != '{}') {
      let userId = department.id;
      let studentIdList: any = [];
      selectedRowsList.forEach((item: { id: number }) => {
        studentIdList.push(item.id);
      });
      request
        .post('/sms/business/bizStudentUser/presentation', {
          userId,
          studentUserIdList: studentIdList.join(','),
        })
        .then((res) => {
          if (!isMounted) return; // 组件已卸载，不更新状态
          
          if (res.status == 'success') {
            message.success('操作成功！');
            setselectedRowsList([]);
            setDepartment({});
            callbackRef();
          }
        })
        .catch((error) => {
          if (!isMounted) return; // 组件已卸载，不处理错误
          console.error('操作失败:', error);
        });
    }
    
    return () => {
      isMounted = false;
    };
  }, [department]);
  const dynamicToolbar = propToolbar == '潜在学员' ? {
    menu: {
      type: 'tab',
      items: [
        { key: '0', label: <span>全部</span> },
        { key: '1', label: <span>今日待跟进</span> },
        { key: '2', label: <span>今日已联系</span> },
        { key: '3', label: <span>从未跟进</span> },
      ],
      onChange: (key: any) => {
        console.log(key, 'key');
        setFollowStatus(key);
        callbackRef();
      },
    }
  } : undefined;
  const downObj = {
    姓名: 'name',
    报考岗位: 'project',
    学员类型: 'type',
    客户来源: 'source',
    备注: 'description',
    咨询时间: 'createTime',
  };
  // const getProvider = () =>{
  //   request.get('/sms/business/bizStudent/totals',[
  //     {
  //       type:0,

  //     }
  //   ])
  // }
  const callbackRef = () => {
    actionRef?.current?.reload();
    // @ts-ignore
    actionRef?.current?.clearSelected();
  };

  const highlightRow = (record: { provider: any; userId: any; }) => {
    // 判断是否为目标行，这里以 id 为 2 的行为例
    if (record.provider != record.userId) {
      return 'highlight-row'; // 返回自定义的样式类名
    }
    return ''; // 返回空字符串
  };
  const placeAnOrder = (record: any) => {
    if (type == '学员' || type == '个人代理') {
      // if (!record.idCard) {
      //   message.error('请先补充学员身份证后在进行下单');
      // } else 
      if (!record.mobile || !record.name) {
        message.error('请先补充学员姓名、手机号后在进行下单');
        setRenderData({ ...record, typee: 'eidt' });
        setModalVisible(true);
      } else {
        setRenderData({
          ...record,
          typee: 'add',
          orderNumber: 0,
          group: type == '个人代理' ? true : false,
        });
        setOrderVisible1(true);
      }
    } else {
      if (record.code) {
        setRenderData({ ...record, typee: 'add', orderNumber: 0, group: true });
        setOrderVisible1(true);
      } else {
        message.error('请先上传企业统一社会信用代码');
      }
    }
  };
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      width: 100,
      fixed: 'left',
      title: type ? type : '学员/企业',
      dataIndex: 'name',
      align: 'center',
      key: 'name',
      render: (text, record) => (
        <div>
          <a
            onClick={() => {
              setRenderData({ ...record, admin: admin });
              setInfoVisible(true);
            }}
          >
            {record.name}

            <SearchOutlined />
          </a>
          <div>{record.isPeer && <Tag color="#87CEEB">同行企业</Tag>}</div>
          <div hidden={isFormal}>
            <Tag color={record.visitTime ? 'success' : 'error'}>
              {record.visitTime ? '已回访' : '未回访'}
            </Tag>
            {
              record.lastDealTime ? <Tooltip title="同手机号已有他人下过单(点击查看)"><Tag color='success'
                onClick={() => {
                  setRenderData({ ...record, admin: admin, lastDealTime: true, key: '8' });
                  setInfoVisible(true);
                }}
                style={{ cursor: 'pointer' }}
              >
                !已下单
              </Tag></Tooltip> : ''
            }
          </div>
        </div>
      ),
    },
    {
      title: '微信号',
      dataIndex: 'weChat',
      key: 'weChat',
      hideInTable: isFormal,
      width: 85,
      render: (text, record) => <span style={{ userSelect: 'none' }}>{record.weChat}</span>,
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      key: 'mobile',
      hideInTable: isFormal,
      width: 130,
      render: (text, record) => (<div>

        <a onClick={() => {
          setRenderData({ ...record, types: 'add', n: 0 });
          setAddModalsVisible(true);
          Dictionaries.phoneCall(record.id)

        }} style={{ userSelect: 'none' }}>
          <PhoneOutlined />
          :{record.mobile}
        </a></div>),
    },
    {
      width: 90,
      title: '所属老师',
      dataIndex: 'userName',
    },
    {
      width: 100,
      title: '信息所有人',
      dataIndex: 'ownerName',
      render: (text, record) => <div>{record.ownerName}<span>{record.ownerName && '(' + (record.percent * 100) + '%)'}</span></div>,
      // search: true,
      // key: 'ownerName',
      // hideInTable: !recommend,
    },
    {
      width: 100,
      title: '信息提供人',
      dataIndex: 'providerName',
    },
    {
      width: 100,
      title: '客户来源',
      dataIndex: 'studentSource',
      valueType: 'select',
      key: 'studentSource',
      filters: true,
      filterMultiple: false,
      valueEnum: Dictionaries.getSearch('dict_source'),
      render: (text, record) => (
        <span>{Dictionaries.getName('dict_source', record.studentSource)}</span>
      ),
    },
    {
      width: 100,
      title: '咨询岗位',
      dataIndex: 'project-in',
      // search: false,
      sorter: true,
      key: 'project-in',
      valueType: 'select',
      fieldProps: {
        options: Dictionaries.getCascader('dict_reg_job'),
        showSearch: { filter },
        mode: 'tags',
      },
      render: (text, record) => (
        <span>{Dictionaries.getCascaderName('dict_reg_job', record.project)}</span>
      ),
    },
    {
      width: 100,
      title: '企业负责人',
      dataIndex: 'chargePersonName',
      key: 'chargePersonName',
      hideInTable: type == '学员' ? true : false,
    },
    {
      width: 100,
      title: '上次回访时间',
      search: false,
      align: 'center',
      hideInTable: isFormal || recommend,
      render: (text, record) => (
        <span>{record.visitTime}</span>
      ),
    },
    // {
    //   title: '未下单天数',
    //   align: 'center',
    //   search: false,
    //   hideInTable: isFormal || recommend,
    //   render: (text, record) => <span>{record.dealDate}天</span>,
    // },
    {
      title: '性别',
      dataIndex: 'sex',
      width: 70,
      // search: false,
      valueType: 'select',
      key: 'sex',
      valueEnum: {
        false: '男',
        true: '女',
      },
      render: (text, record) => (
        <span>{record.sex == null ? '未知' : record.sex ? '女' : '男'}</span>
      ),
    },
    {
      title: '项目总称',
      dataIndex: 'parentProjects',
      key: 'parentProjects',
      sorter: true,
      valueType: 'select',
      fieldProps: {
        options: Dictionaries.getList('dict_reg_job'),
        mode: 'tags',
      },
      width: 100,
      render: (text, record) => (
        <span key="parentProjects">
          {Dictionaries.getCascaderAllName('dict_reg_job', record.project)}
        </span>
      ),
    },


    {
      title: 'QQ',
      dataIndex: 'qq',
      key: 'qq',
      hideInTable: isFormal,

      width: 100,
      render: (text, record) => <span style={{ userSelect: 'none' }}>{record.qq}</span>,
    },
    {
      title: '身份证',
      dataIndex: 'idCard',
      key: 'idCard',
      hideInTable: true,
    },
    {
      title: '信用代码',
      dataIndex: 'code',
      key: 'code',
      hideInTable: true,
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
      // title: '手机号',
      dataIndex: 'isFormal',
      search: false,
      key: 'isFormal',
      // width: 80,
      hideInTable: !admin,
      render: (text, record) => (
        <span style={{ color: record.isFormal ? 'rgb(0,172,132)' : 'red' }}>
          {record.isFormal ? '正式' : '潜在'}
        </span>
      ),
    },
    // {
    //   title: '所属企业名称',
    //   dataIndex: 'parentName',
    //   hideInTable: type != '学员' ? true : false,
    //   // valueType: 'select',
    //   // valueEnum: Dictionaries.getSearch('studentType'),
    //   // render: (text, record) => <span>{Dictionaries.getName('studentType', record.type)}</span>,
    // },

    {
      width: 100,
      title: '资源类型',
      dataIndex: 'source',
      valueType: 'select',
      key: 'source',
      filters: true,
      filterMultiple: false,
      valueEnum: Dictionaries.getSearch('circulationType'),
      render: (text, record) => (
        <span>{Dictionaries.getName('circulationType', record.source)}</span>
      ),
    },
    // {
    //   title: '信息提供人',
    //   dataIndex: 'referrerName',
    //   search: false,
    //   key: 'referrerName',
    //   hideInTable: !recommend,
    // },
    {
      width: 100,
      title: '接收信息负责人',
      dataIndex: 'userName',
      key: 'userNames',
      search: false,
      hideInTable: !recommend,
    },
    {
      width: 110,
      title: '信息提供人所占业绩比例(%)',
      sorter: true,
      dataIndex: 'percent',
      hideInTable: !recommend,
      render: (text, record) => <span key="parentProjects">{record.percent * 100}%</span>,
    },
    // {
    //   title: '是否为领取资源',
    //   key: 'receiveNum',
    //   align: 'center',
    //   dataIndex: 'receiveNum',
    //   sorter: true,
    //   hideInTable: isFormal || recommend,
    //   render: (text, record) => <span>{record.receiveNum > 0 ? '是' : '否'}</span>,
    // },
    {
      width: 100,
      title: '领取时间',
      key: 'receiveTime',
      dataIndex: 'circulationTime',
      valueType: 'dateRange',
      sorter: true,
      hideInTable: recommend,
      render: (text, record) => (
        <span>{record.circulationTime}</span>
      ),
    },
    {
      width: 100,
      title: '介绍时间',
      key: 'createTime',
      dataIndex: 'createTimes',
      valueType: 'dateRange',
      hideInTable: !recommend,
      sorter: true,
      render: (text, record) => (
        <span>{record.createTime}</span>
      ),
    },
    {
      width: 100,
      title: '下单时间',
      key: 'lastDealTime',
      dataIndex: 'lastDealTime',
      valueType: 'dateRange',
      hideInTable: !recommend,
      sorter: true,
      render: (text, record) => (
        <span>
          {record.lastDealTime ? (
            record.lastDealTime
          ) : (
            <Tag color="error">未下单</Tag>
          )}
        </span>
      ),
    },
    {
      width: 100,
      title: '创建时间',
      key: 'createTime',
      dataIndex: 'createTime',
      valueType: 'dateRange',
      hideInTable: recommend,
      sorter: true,
      render: (text, record) => (
        <span>{record.createTime}</span>
      ),
    },
    {
      width: 100,
      title: '咨询时间',
      key: 'consultationTime',
      dataIndex: 'consultationTime',
      valueType: 'dateRange',
      hideInTable: recommend,
      sorter: true,
      render: (text, record) => (
        <span>
          {record.consultationTime}
        </span>
      ),
    },
    {
      title: '是否为出镜人专属资源',
      key: 'isLive',
      dataIndex: 'isLive',
      valueType: 'select',
      valueEnum: {
        true: '是',
        false: '否'
      },
      hideInTable: true
    },


    {
      width: 100,
      title: '备注',
      dataIndex: 'description',
      key: 'descriptions',
      search: false,
      ellipsis: true,
      tip: '备注过长会自动收缩',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 260,
      key: 'options',
      fixed: 'right',
      render: (text, record, _, action) => (
        //order为选择学员时所用，parentId为企业添加学员时所用
        <>
          {order ? (
            <Button
              type="primary"
              size="small"
              key="looks"
              icon={<ApiOutlined />}
              style={{ marginRight: '15px', marginBottom: '8px' }}
              onClick={() => {
                // setRenderData({ ...record });
                // setInfoVisible(true);
                setStudentId({ id: record.id, name: record.name, record });
                setStudentVisible();
              }}
            >
              选择
            </Button>
          ) : (
            <>
              <div>

                <Space>
                  {source != 8 || record.userId != undefined ||
                    <Popconfirm
                      key="receivePop"
                      title="是否确定认领？"
                      style={{ marginRight: '15px', marginBottom: '8px' }}
                      onConfirm={() => {
                        request.post('/sms/business/bizStudentUser/receive', { ids: record.id, source: 8 }).then((res: any) => {
                          if (res.status == 'success') {
                            message.success('认领成功');
                            callbackRef();
                          }
                        });
                      }}
                      okText="认领"
                      cancelText="取消"
                    >
                      <a key="receive">
                        认领
                      </a>
                    </Popconfirm>
                  }
                  <a
                    // type="primary"
                    // size="small"
                    hidden={parentId}
                    key="look"
                    // icon={<SearchOutlined />}
                    onClick={() => {
                      setRenderData({ ...record });
                      setInfoVisible(true);
                    }}
                  >
                    查看
                  </a>

                  <a
                    key="editable"
                    // size="small"
                    // type="primary"
                    // icon={<EditOutlined />}
                    onClick={() => {
                      setRenderData({ ...record, typee: 'eidt' });
                      setModalVisible(true);
                    }}
                  >
                    编辑
                  </a>
                  <a
                    key="edit"
                    hidden={parentId}
                    // size="small"
                    type="primary"
                    // icon={<FormOutlined />}
                    onClick={() => {
                      setRenderData({ ...record, types: 'add', n: 0 });
                      setAddModalsVisible(true);
                    }}
                  >
                    回访
                  </a>
                  {type != '学员' ? (
                    <Button
                      key="parentIds"
                      size="small"
                      hidden={true}
                      type="primary"
                      icon={<UserAddOutlined />}
                      onClick={() => {
                        setRenderData({ typee: 'add', parentId: record.id });
                        setModalVisible(true);
                      }}
                    >
                      添加
                    </Button>
                  ) : (
                    ''
                  )}

                  <a
                    type="primary"
                    // size="small"
                    key="editable2"
                    hidden={parentId || (recommend && record.lastDealTime)}
                    // icon={<AccountBookOutlined />}
                    onClick={() => {
                      placeAnOrder(record);
                    }}
                  >
                    下单
                  </a>

                  <a
                    type="primary"
                    hidden={isFormal}
                    onClick={() => {
                      setFollowVisible(true)
                      setRenderData({ ...record });
                    }}
                  >
                    跟进记录
                  </a>
                </Space>
              </div>
              <Space>
                <div hidden={!isFormal}>
                  <Space>
                    <a
                      onClick={() => {
                        setRenderData({ ...record, chargeType: '0' });
                        setStudentOrderOpen(true);
                      }}
                    >
                      缴费
                    </a>
                    <a
                      style={{ color: 'red' }}
                      onClick={() => {
                        setRenderData({ ...record, chargeType: '1', showStudent: false });
                        setStudentOrderOpen(true);
                      }}
                    >
                      退费
                    </a>
                  </Space>
                </div>
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
                <Popconfirm
                  key="deletePop"
                  title="是否确定锁定？"
                  style={{ marginRight: '15px', marginBottom: '8px' }}
                  onConfirm={() => {
                    request.post(`/sms/business/bizStudent/lock/${record.id}`, ).then((res: any) => {
                      if (res.status == 'success') {
                        message.success('已锁定');
                        callbackRef();
                      }
                    });
                  }}
                  okText="锁定"
                  cancelText="取消"
                >
                  <a key="lock" style={{ color: 'brown' }}>
                    锁定学员
                  </a>
                </Popconfirm>
              </Space>
            </>
          )}
        </>
      ),
    },
  ];
  const buildAccount = () => {
    request
      .post('/sms/business/bizStudent/buildAccount', {
        id: selectedRowsList[0].studentId,
      })
      .then((res: any) => {
        if (res.status == 'success') {
          message.success('操作成功');
          callbackRef();
        }
      });
  };
  let params: any = {};
  let sortList: any = {};
  if (parentId) {
    params.parentId = parentId;
  }
  //  else {
  //   params.parentId = '-1';
  // }
  if (companyStudent && companyStudent.length > 0) {
    let arr: any = [];
    companyStudent.forEach((item: any) => {
      arr.push(item.id);
    });
    params['id-notIn'] = arr.join(',');
  }
  if (isPay != null) {
    params.isPay = isPay;
  }
  if (isFormal != null) {
    params.isFormal = isFormal;
  }
  if (isFormal === true) {
    sortList = {
      createTime: 'desc',
    };
    params["userId-isNull"] = false;
  } else {
    sortList = {
      ['visitTime,circulationTime,createTime']: 'asc,desc,desc',
    };
  }
  // let toolbar = undefined;
  if (admin) {
  } else {
    if (type == '学员') {
      params.type = '0';
    }
    if (type == '企业/同行机构') {
      params.type = '1';
    }
    if (type == '个人代理') {
      params.type = '2';
    }
    if (type == '同行机构') {
      params.type = '1';
      // params.isPeer = true;
    }
  }
  if (recommend) {
    params.source = 3;
    delete params.isFormal;
    delete params.type;
    sortList = {
      ['lastDealTime,createTime']: 'asc,desc',
    };
  } else {
    if (!isFormal) {
      params['source-notIn'] = 3;
      // params['refereeId-isNull'] = false;
    }
  }
  if (userIds) params.userId = initialState?.currentUser?.userid
  if (source) {
    delete params.isFormal;
    params.source = source
  }
  // params['userId-isNull'] = false;
  // params['isInWhitelist'] = false;
  Object.assign(params, paramsA);
  return (
    <>
      {/* <PageContainer
        onTabChange={(e) => {
          setTabListNuber(e);
          callbackRef();
        }}
        tabList={[
          {
            tab: '个人',
            key: '0',
          },
          {
            tab: '企业',
            key: '1',
          },
          {
            tab: '代理人',
            key: '2'
          },

        ]}
      > */}
      <Tables
        columns={columns}
        className="student"
        actionRef={actionRef}
        formRef={formRef}
        cardBordered
        scroll={{ x: 1800 }}
        search={{
          labelWidth: 'auto',
          defaultCollapsed: true,
          defaultColsNumber: 10
        }}
        rowClassName={highlightRow}
        onReset={() => {
          setparamsA({});
        }}
        toolbar={dynamicToolbar}
        request={
          order === 'BlacklistStudent'
            ? { url: url }
            : {
              url: url, params: {
                ...params,
                ...(followStatus !== undefined&&followStatus != '0' && { followStatus })
              }, sortList: sortList
            }
        }
        rowSelection={{
          // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
          // 注释该行则默认不显示下拉选项
          // selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
          onChange: (e, selectedRows) => {
            setselectedRowsId(e);
            setselectedRowsList(selectedRows as []);
          },
        }}
        tableAlertOptionRender={() => {
          return (
            <Space size={16}>
              <a
                key="orderq"
                style={{ color: 'red' }}
                onClick={() => {
                  console.log('type', selectedRowsList[0]);
                  if (selectedRowsList.length == 0 || selectedRowsList.length > 1) {
                    message.error('请只选择一位学员!');
                    return;
                  }
                  if (type == '学员') {
                    buildAccount();
                  } else {
                    if (selectedRowsList.length == 0 || selectedRowsList.length > 1) {
                      message.error('请选择一位学员签署合同!');
                      return;
                    }
                    if (!selectedRowsList[0].codeFile && !selectedRowsList[0].powerAttorneyFile) {
                      Modal.info({
                        title: '尚未上传企业授权信息!',
                        content: <p>请先补充信息在签署合同</p>,
                        okText: '补充',
                        onOk: () => {
                          setRenderData({
                            ...(selectedRowsList[0] as any),
                            addNumber: 0,
                            typee: 'eidt',
                          });
                          setCompanyContractVisible(true);
                        },
                      });
                    } else {
                      buildAccount();
                    }
                  }
                }}
              >
                重构法大大账号
              </a>
              {/*导出数据可用，已注释 */}
              {/* <a
                hidden={parentId}
                onClick={() => {
                  DownTable(selectedRowsList, downObj, '学员信息', 'student');
                }}
              >
                导出数据
              </a> */}
              <a
                onClick={() => {

                  let data = selectedRowsList.map((item: { studentId: any; }) => {
                    return {
                      id: item.studentId,
                      isInWhitelist: true
                    }
                  })
                  request.postAll('/sms/business/bizStudent/saveArray', { array: data }).then((res: any) => {
                    if (res.status == 'success') {
                      message.success('加入成功!')
                      callbackRef()
                    }
                  })
                }}
              >
                加入白名单
              </a>
              <a
                key="orders"
                hidden={!parentId || order == 'order'}
                onClick={() => {
                  let arr: any = [];
                  selectedRowsList.forEach((item: any) => {
                    arr.push({ id: item.id, name: item.name });
                  });

                  setStudentId(arr);
                  setStudentVisible();
                }}
              >
                选择学员
              </a>
            </Space>
          );
        }}
        toolBarRender={[
          // <Dropdown key="menu" overlay={menu}>
          //   <Button
          //     style={{
          //       backgroundColor: 'rgb(9,187,7)',
          //       borderColor: 'rgb(9,187,7)',
          //       color: 'white',
          //     }}
          //     hidden
          //   >
          //     <UploadOutlined />
          //     批量导出
          //   </Button>
          // </Dropdown>,
          // <Button
          //   key="ordere"
          //   type="primary"
          //   hidden={isFormal || recommend}
          //   icon={<PlusOutlined />}
          //   onClick={async () => {
          //     if (selectedRowsList.length == 0) {
          //       message.error('请先勾选至少一个学员在进行推荐!');
          //       return;
          //     }
          //     console.log('selectedRowsList', selectedRowsList);

          //     setTimeout(() => {
          //       formRefs.current?.setFieldsValue({
          //         project: Dictionaries.getCascaderValue(
          //           'dict_reg_job',
          //           selectedRowsList[0].project,
          //         ),
          //       });
          //     }, 100);
          //     setFromFalg(true);
          //   }}
          // >
          //   推荐已有学员/企业给别人
          // </Button>,
          // <Button
          //   key="buttons"
          //   icon={<FormOutlined />}
          //   type="primary"
          //   hidden={!isFormal}
          //   onClick={async () => {
          //     const status = (await request.get('/sms/share/isVerify')).data;
          //     const autoSign = (await request.get('/sms/share/isVerifyAutoSign')).data;
          //     if (status && autoSign) {
          //       if (initialState?.currentUser?.idCard) {
          //         if (selectedRowsList.length == 0 || selectedRowsList.length > 1) {
          //           message.error('请选择一位学员签署合同!');
          //           return;
          //         }
          //         setRenderData({ ...(selectedRowsList[0] as any), addNumber: 0, typee: 'eidt' });
          //         if (!selectedRowsList[0]?.idCard) {
          //           message.error('请先补充学员/负责人的身份证信息！');
          //           // setRenderData({ ...record, typee: 'eidt' });
          //           setModalVisible(true);
          //           return;
          //         }

          //         if (
          //           selectedRowsList[0].type == 1 &&
          //           !selectedRowsList[0].codeFile
          //           // !selectedRowsList[0].powerAttorneyFile
          //         ) {
          //           Modal.info({
          //             title: '尚未上传企业授权信息!',
          //             content: <p>请先补充信息在签署合同</p>,
          //             okText: '补充',
          //             onOk: () => {
          //               setCompanyContractVisible(true);
          //             },
          //           });
          //           return;
          //         }

          //         setContractSVisible(true);
          //       } else {
          //         message.error('请先完善您的身份证信息后再签署合同！');
          //       }
          //     } else {
          //       setRenderData([status, autoSign]);
          //       setIsVerifyModelVisible(true);
          //       // message.error('您还未实名，已为您跳转实名页面。实名才能签署合同', 5);
          //       // const urls = (await request.post('/sms/share/verify')).data;
          //       // setpreviewImage(urls);
          //       // setPreviewVisible(true);
          //     }
          //   }}
          // >
          //   合同签署
          // </Button>,
          <div key="toolbar-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <Space style={{ marginLeft: 'auto' }}>
              <a
                hidden={order == 'order' || isFormal || recommend}
                download="新学员导入模板"
                href="./template/新学员导入模板.xlsx"
                key="ordera"
              >
                下载导入模板
              </a>

              <Button
                key="buttonq"
                icon={<PlusOutlined />}
                type="primary"
                hidden={order == 'order' || isFormal || recommend}
                onClick={() => {
                  if (parentId) {
                    setRenderData({ typee: 'add', parentId, newMedia: false, teacher: true });
                  } else {
                    setRenderData({ typee: 'add', newMedia: false, teacher: true });
                  }

                  setModalVisible(true);
                  //新建或者新建新媒体学员导入的显示隐藏
                  setShowisShowMedium(false)
                }}
              >
                新建
              </Button>
              <Button
                key="buttonq"
                icon={<PlusOutlined />}
                type="primary"
                hidden={order == 'order' || isFormal || recommend}
                onClick={() => {
                  if (parentId) {
                    setRenderData({ typee: 'add', parentId, newMedia: true, teacher: false });
                  } else {
                    setRenderData({ typee: 'add', newMedia: true, teacher: false });
                  }

                  setModalVisible(true);
                  //新建或者新建新媒体学员导入的显示隐藏
                  setShowisShowMedium(true)
                }}
              >
                新建新媒体学员
              </Button>

              <Button
                key="ordere"
                type="primary"
                hidden={isFormal || recommend}
                icon={<PlusOutlined />}
                onClick={async () => {
                  if (selectedRowsList.length == 0) {
                    message.error('请先勾选至少一个学员在进行推荐!');
                    return;
                  }
                  setUserFrom(true);
                }}
              >
                推荐已有学员给他人
              </Button>
              <Button
                key="ordere"
                type="primary"
                hidden={isFormal || recommend}
                icon={<PlusOutlined />}
                onClick={async () => {
                  if (selectedRowsList.length == 0) {
                    message.error('请先勾选至少一个学员在进行分配!');
                    return;
                  }
                  setuserFromTeacher(true);
                }}
              >
                重新分配老师
              </Button>
              <Button
                key="buttonq"
                icon={<PlusOutlined />}
                type="primary"
                hidden={order == 'order' || isFormal}
                onClick={() => {
                  if (parentId) {
                    setRenderData({ typee: 'recommend', parentId });
                  } else {
                    setRenderData({ typee: 'recommend' });
                  }

                  setModalVisible(true);
                }}
              >
                新建推荐学员
              </Button>
            </Space>

            <Space style={{ marginLeft: 'auto' }}>
              <Button
                // key="buttons"
                // icon={<FormOutlined />}
                // type="primary"
                // hidden={!isFormal}
                // onClick={async () => {
                //   setContract(true);
                // }}


                key="buttons"
                icon={<FormOutlined />}
                type="primary"
                hidden={!isFormal}
                onClick={async () => {
                  const status = (await request.get('/sms/share/isVerify')).data;
                  const autoSign = (await request.get('/sms/share/isVerifyAutoSign')).data;
                  if (status && autoSign) {
                    if (initialState?.currentUser?.idCard) {
                      if (selectedRowsList.length == 0 || selectedRowsList.length > 1) {
                        message.error('请选择一位学员签署合同!');
                        return;
                      }
                      setRenderData({ ...(selectedRowsList[0] as any), addNumber: 0, typee: 'eidt' });
                      if (!selectedRowsList[0]?.idCard) {
                        message.error('请先补充学员/负责人的身份证信息！');
                        // setRenderData({ ...record, typee: 'eidt' });
                        setModalVisible(true);
                        return;
                      }

                      if (
                        selectedRowsList[0].type == 1 &&
                        !selectedRowsList[0].codeFile
                        // !selectedRowsList[0].powerAttorneyFile
                      ) {
                        Modal.info({
                          title: '尚未上传企业授权信息!',
                          content: <p>请先补充信息在签署合同</p>,
                          okText: '补充',
                          onOk: () => {
                            setCompanyContractVisible(true);
                          },
                        });
                        return;
                      }

                      setContractSVisible(true);
                    } else {
                      message.error('请先完善您的身份证信息后再签署合同！');
                    }
                  } else {
                    setRenderData([status, autoSign]);
                    setIsVerifyModelVisible(true);
                    // message.error('您还未实名，已为您跳转实名页面。实名才能签署合同', 5);
                    // const urls = (await request.post('/sms/share/verify')).data;
                    // setpreviewImage(urls);
                    // setPreviewVisible(true);
                  }
                }}
              >
                合同签署
              </Button>
              <Button
                key="butto"
                hidden={order == 'order' || isFormal || recommend}
                icon={<DownloadOutlined />}
                type="primary"
                onClick={() => {
                  setUploadVisibles(true);
                  setUploadUrl('/sms/business/bizStudent/batch/importForOther');
                }}
              >
                批量导入获客数据
              </Button>
              <Button
                key="butto"
                hidden={order == 'order' || isFormal || recommend}
                icon={<DownloadOutlined />}
                type="primary"
                onClick={() => {
                  setUploadVisible(true);
                  setUploadUrl('/sms/business/bizStudent/batch/import');
                }}
              >
                批量导入学员和回访记录
              </Button>
              <Button
                key="buttona"
                hidden={order == 'order' || isFormal || recommend}
                icon={<DownloadOutlined />}
                type="primary"
                onClick={() => {
                  setUploadVisible(true);
                  setUploadUrl('/sms/business/bizStudent/saveArray');
                }}
              >
                批量导入学员
              </Button>
            </Space>
          </div>
        ]}
      />

      {/* 回访记录 */}
      {followVisibleFalg && (
        <FollowModal
          setModalVisible={() => setFollowVisible(false)}
          modalVisible={followVisibleFalg}
          renderData={renderData}
          url="/sms/business/bizReturnVisit"
          callbackRef={() => callbackRef()}
        />
      )}

      {modalVisibleFalg && (
        <Modals
          setModalVisible={() => setModalVisible(false)}
          modalVisible={modalVisibleFalg}
          callbackRef={() => callbackRef()}
          isShowMedium={isShowMedium}
          renderData={renderData}
          url={url}
          type={type}
        />
      )}

      {InfoVisibleFalg && (
        <StudentInfo
          setModalVisible={() => setInfoVisible(false)}
          modalVisible={InfoVisibleFalg}
          renderData={renderData}
          admin={admin}
          callbackRef={() => callbackRef()}
        />
      )}
      {AddModalsVisible && (
        <AddModals
          setModalVisible={() => setAddModalsVisible(false)}
          modalVisible={AddModalsVisible}
          renderData={renderData}
          url="/sms/business/bizReturnVisit"
          callbackRef={() => callbackRef()}
        />
      )}
      {orderVisibleFalg && (
        <StudentOrder
          setModalVisible={() => setOrderVisible(false)}
          modalVisible={orderVisibleFalg}
          renderData={renderData}
          callbackRef={() => callbackRef()}
          callback={() => oncancel()}
          admin={admin}
        />
      )}
      {StudentOrderOpen && (
        <StudentOrders
          setModalVisible={() => setStudentOrderOpen(false)}
          modalVisible={StudentOrderOpen}
          renderData={renderData}
          callbackRef={() => callbackRef()}
          placeAnOrder={(e: any) => placeAnOrder(e)}
        />
      )}
      {orderVisibleFalg1 && (
        <StepsOrder
          setModalVisible={() => setOrderVisible1(false)}
          modalVisible={orderVisibleFalg1}
          renderData={renderData}
          callbackRef={() => callbackRef()}
          callback={() => oncancel()}
          admin={admin}
        />
      )}
      {CompanyContractFalg && (
        <CompanyContract
          setModalVisible={() => setCompanyContractVisible(false)}
          modalVisible={CompanyContractFalg}
          renderData={renderData}
          callbackRef={() => callbackRef()}
          callback={() => oncancel()}
        />
      )}
      {ContractSFalg && (
        <ContractS
          setModalVisible={() => setContractSVisible(false)}
          modalVisible={ContractSFalg}
          renderData={renderData}
          callbackRef={() => callbackRef()}
        // callback={() => oncancel()}
        // admin={admin}
        />
      )}
      {previewVisible && (
        <ChargeIframe
          setPreviewVisible={() => setPreviewVisible(false)}
          previewVisible={previewVisible}
          previewImage={previewImage}
          callbackRef={() => callbackRef()}
        // callback={() => oncancel()}
        // admin={admin}
        />
      )}
      {UploadFalg && (
        <Upload
          setModalVisible={() => setUploadVisible(false)}
          modalVisible={UploadFalg}
          url={UploadUrl}
          type="student"
          propsData={{ parentId: parentId ? parentId : '-1' }}
          callbackRef={() => callbackRef()}
        />
      )}
      {UploadFalgs && (
        <Upload
          setModalVisible={() => setUploadVisibles(false)}
          modalVisible={UploadFalgs}
          url={UploadUrl}
          type="student"
          upType="post2"
          propsData={{ parentId: parentId ? parentId : '-1' }}
          callbackRef={() => callbackRef()}
        />
      )}
      {CardVisible && (
        <UserManageCard
          CardVisible={CardVisible}
          CardContent={CardContent}
          setCardVisible={() => setCardVisible(false)}
          setDepartment={(e: any) => setDepartment(e)}
          departments={[department]}
        />
      )}
      {/* 合同签署 */}
      {contract && (
        <ContractModel
          modalVisible={contract}
          setModalVisible={() => setContract(false)}
          renderData={renderData}
        />
      )}
      {IsVerifyModelFalg && (
        <IsVerifyModel
          modalVisible={IsVerifyModelFalg}
          setModalVisible={() => setIsVerifyModelVisible(false)}
          renderData={renderData}
        />
      )}
      {FromFalg && (
        <ModalForm
          width={350}
          visible={FromFalg}
          modalProps={{
            destroyOnClose: true,
            maskClosable: false,
            onCancel: () => {
              setFromFalg(false);
            },
          }}
          formRef={formRefs}
          onFinish={async (value: any) => {
            console.log('value', value);
            let project = value.project[value.project.length - 1];
            new Promise((resolve) => {
              request
                .post('/sms/business/bizStudentUser/presentation', {
                  studentUserIdList: selectedRowsId.join(','),
                  project: project,
                })
                .then((res) => {
                  if (res.status == 'success') {
                    message.success('推荐成功!');
                    setFromFalg(false);
                    callbackRef();
                    resolve(res);
                  }
                });
            });
          }}
        >
          <ProFormCascader
            width="sm"
            name="project"
            placeholder="咨询报考岗位"
            label="推荐岗位"
            rules={[{ required: true, message: '请选择报考岗位' }]}
            fieldProps={{
              options: Dictionaries.getCascader('dict_reg_job'),
              showSearch: { filter },
              onSearch: (value) => console.log(value),
              // defaultValue: ['0', '00'],
            }}
          />
        </ModalForm>
      )}
      {userFromTeacher && (
        <ModalForm
          width={450}
          visible={userFromTeacher}
          modalProps={{
            // destroyOnClose: true,
            maskClosable: false,
            onCancel: () => {
              setuserFromTeacher(false);
            },
          }}
          formRef={formRefs}
          onFinish={async (value: any) => {
            if (!userNameId1) {
              message.error('请选择老师！')
              return
            }
            console.log('selectedRowsId', selectedRowsId);
            new Promise((resolve) => {
              request
                .postAll(`/sms/business/bizStudentUser/assign/${userNameId1.id}`, 
                  selectedRowsId,
                 )
                .then((res) => {
                  if (res.status == 'success') {
                    message.success('分配成功!');
                    setuserFromTeacher(false);
                    callbackRef();
                    // resolve(res);
                  }
                });
            });
          }}
        >
          <UserTreeSelect
            ref={null}
            userLabel={'推荐给'}
            userNames="userId"
            enable={true}
            // newMedia={renderData?.teacher && !(renderData.typee == 'eidt')}
            userPlaceholder="请选择老师"
            setUserNameId={(e: any) => setUserNameId1(e)}
            // setDepartId={(e: any) => setDepartId(e)}
            flag={true}
          // setFalgUser={(e: any) => setFalgUser(e)}
          />
        </ModalForm>
      )}
      {userFrom && (
        <ModalForm
          width={450}
          visible={userFrom}
          modalProps={{
            // destroyOnClose: true,
            maskClosable: false,
            onCancel: () => {
              setUserFrom(false);
            },
          }}
          formRef={formRefs}
          onFinish={async (value: any) => {
            if (!userNameId) {
              message.error('请选择招生老师！')
              return
            }
            console.log('value', value);
            new Promise((resolve) => {
              request
                .post('/sms/business/bizStudentUser/diyPresentation', {
                  studentUserIdList: selectedRowsId.join(','),
                  userId: userNameId.id,
                })
                .then((res) => {
                  if (res.status == 'success') {
                    message.success('推荐成功!');
                    setUserFrom(false);
                    callbackRef();
                    // resolve(res);
                  }
                });
            });
          }}
        >
          <UserTreeSelect
            ref={null}
            userLabel={'推荐给'}
            userNames="userId"
            enable={true}
            // newMedia={renderData?.teacher && !(renderData.typee == 'eidt')}
            userPlaceholder="请选择被推荐人"
            setUserNameId={(e: any) => setUserNameId(e)}
            // setDepartId={(e: any) => setDepartId(e)}
            flag={true}
          // setFalgUser={(e: any) => setFalgUser(e)}
          />
        </ModalForm>
      )}
      {/* </PageContainer> */}
    </>
  );
};
