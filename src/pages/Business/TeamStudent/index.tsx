import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {
  Button,
  Tag,
  Popconfirm,
  message,
  Spin,
  Tooltip,
  Modal,
  Select,
  Divider,
  Space,
  Table,
  Dropdown,
  Menu
} from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import moment from 'moment';
import request from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import DownTable from '@/services/util/timeFn';
import ImgUrl from '@/services/util/ImgUrl';
import Tables from '@/components/Tables';
import StudentInfo from './SignUpData';
import SignUp from './SignUp';
import Audit from './Audit';
import ClassList from '../ClassList/index';
import Return from '../Servicerecord/Return';
import JobAssociation from '@/pages/Admins/JobAssociation';
import MessageModal from '@/pages/Business/ClassList/MessageModal';
import WxMessage from '../ClassList/WxMessage';
import AddQuestion from '@/pages/Business/Question/projectAdd';
import './index.less';
import filter from '@/services/util/filter';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormDatePicker } from '@ant-design/pro-form';
type GithubIssueItem = {
  studentName: string;
  studentParentName: string;
  sex: number;
  id: number;
  studentParentId: number;
  classType: string;
  classYear: string;
  examType: string;
  isServed: boolean;
  className: string;
  type: string | number;
  studentType: string | number;
  arrears: string | number;
  isComplete: boolean;
  isComplete2: boolean;
  isSubmit: boolean;
  isConfirmExam: boolean;
  status: string | number;
  receivable: number;
  project: string;
  createTime: any;
  exportNum: any;
  auditTime: any;
  servedTime: any;
  confirm: any;
  studentUserId: number;
  serviceStatus: number;
  certStartDate: any;
  certEndDate: any;
};

export default (props: any) => {
  const downObj = {
    订单编号: 'num',
    姓名: 'studentName',
    所属团组: 'studentParentName',
    身份证: 'idCard',
    // 手机号: 'mobile',
    所属班级: 'className',
    报考岗位: 'project',
    报考班型: 'classType',
    班型年限: 'classYear',
    考试类型: 'examType',
    订单金额: 'receivable',
    累计实收: 'charge',
    累计优惠: 'averageDiscount',
    欠费: 'arrears',
    备注: 'description',
    报名时间: 'createTime',
    考试资料: 'isComplete2',
    报名资料: 'isComplete',
    下证日期: 'certStartDate',
    证书到期日期: 'certEndDate',
    审核: 'isSubmit',
    缴费: 'status',
  };
  const { classId } = props;


  const [SpingFalg, SetSpingFalg] = useState<boolean>(false);
  const [InfoVisibleFalg, setInfoVisible] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const [AuditVisibleFalg, setAuditVisible] = useState<boolean>(false);
  const [MessageVisible, setMessageVisible] = useState(false);
  const [ClassFalg, setClassFalg] = useState<boolean>(false);
  const [checkFalg, setcheckFalg] = useState<boolean>(false);
  const [WXMessageVisible, setWXMessageVisible] = useState(false);
  const [certVisible, setCertVisible] = useState(false);
  //二维码弹窗
  const [qrcodeVisible, setQrcodeVisible] = useState(false);
  //保存二维码图片
  const [qrcodeSrc, setQrcodeSrc] = useState<string>();
  //开通题库
  const [AddModalsVisible, setAddModalsVisible] = useState<boolean>(false);

  const [jobFalg, setJobFalg] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [selectedIds, setSelectedIds] = useState<any>([]);
  const [renderData, setRenderData] = useState<any>(null);
  const [StudentData, setStudentData] = useState<any>(null);
  const [orderId, setorderId] = useState<any>('');
  const [examinationId, setExaminationId] = useState<any>('')
  const [TabListNuber, setTabListNuber] = useState<any>();
  const certForm = useRef<ProFormInstance>();
  const param: any = {
    'studentType-in': '1,2',
    enable: true
  };
  if (classId) param.classId = classId;
  const [Params, setParams] = useState<any>(param);
  const url = '/sms/business/bizOrder/registration';
  const url2 = '/sms/business/bizStudentUser';
  const actionRef = useRef<ActionType>();
  const callbackRef = () => {
    // @ts-ignore
    actionRef.current.reload();
    SetSpingFalg(false);
  };
  useEffect(() => {
    if (!classId) return;
    setParams(param);
    callbackRef();
  }, [props]);
  useEffect(() => {
    console.log('examinationId', examinationId);
  }, [examinationId])
  const examination = (boolean: boolean, selectedIds: any = false) => {
    const data: { id: any; isConfirmExam: boolean; }[] = []
    const dataId = selectedIds ? selectedIds : examinationId
    if (dataId.length > 0) {
      dataId.forEach((item: any) => {
        data.push({ id: item, isConfirmExam: boolean })
      })
      request.postAll('/sms/business/bizOrder/editOrders', data).then((res) => {
        if (res.status == 'success') {
          message.success('操作成功')
          callbackRef()
        }
      })
    }

  }

  //打开二维码弹窗
  const handleOpenQrCode = async (data: any) => {
    const res = await request.get('/sms/business/bizField/orderField', {
      orderId: data.id,
      valueType: 0,
      _isGetAll: true,
      _orderBy: 'fieldStandardId',
      _direction: 'asc'
    });
    if (res.data.content.length === 0) {
      message.error('暂无报名资料数据')
    } else {
      setQrcodeVisible(true);
      const tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
      const tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
      const src = '/sms/business/bizOrder/buildSubmitQrcode?id=' + data.id + '&' + tokenName + '=' + tokenValue;
      setQrcodeSrc(src)
    }
  }

  //开通题库
  const handleOpenQuestion = (record: any) => {
    setAddModalsVisible(true)
    setRenderData({ typeEdit: '1', record: record.id })
  }

  const menu = (
    <Menu
      items={[
        {
          key: 'confirm',
          label: (
            <Tag color='#87d068' onClick={() => examination(true)}>参加</Tag>
          )
        },
        {
          key: 'confirm',
          label: (
            <Tag color='#FF0000' onClick={() => examination(false)}>不参加</Tag>
          )
        },
      ]}
    />
  )
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: '学员',
      dataIndex: 'studentName',
      sorter: true,
      width: 100,
      fixed: 'left',
      // search: false,
      render: (text, record) => (
        <>
          <a
            onClick={async () => {
              SetSpingFalg(true);
              request.get(url2, { id: record.studentUserId }).then((ress: any) => {
                request
                  .get('/sms/business/bizField/orderField', {
                    orderId: record.id,
                    // valueType: 0,
                  })
                  .then(async (res: any) => {
                    const signUp = res.data.content.reverse();
                    setStudentData({ ...ress.data.content[0], signUp: signUp, record: record });
                    setInfoVisible(true);
                    SetSpingFalg(false);
                  });
              });
            }}
          >
            {record.studentName}
          </a>
        </>
      ),
    },
    // {
    //   title: '所属团组',
    //   dataIndex: 'studentParentName',
    //   sorter: true,
    //   width: 100,
    //   // search: false,
    //   render: (text, record) => (
    //     <>
    //       <span> {record.studentParentName}</span>
    //     </>
    //   ),
    // },
    {
      title: '班级',
      dataIndex: 'className',
      sorter: true,
      width: 100,
      hideInTable: classId,
      render: (text, record) => (
        <a
          onClick={() => {
            setRenderData(record);
            setClassFalg(true);
          }}
        >
          {record.className ? record.className : '选择班级'}
        </a>
      ),
    },
    {
      title: '报考班型',
      dataIndex: 'classType',
      sorter: true,
      width: 100,
      valueEnum: Dictionaries.getSearch('dict_class_type'),
      render: (text, record) => <>{Dictionaries.getName('dict_class_type', record.classType)}</>,
    },
    {
      title: '班型年限',
      sorter: true,
      dataIndex: 'classYear',
      width: 100,
      valueEnum: Dictionaries.getSearch('dict_class_year'),
      render: (text, record) => <>{Dictionaries.getName('dict_class_year', record.classYear)}</>,
    },
    {
      title: '考试类型',
      sorter: true,
      dataIndex: 'examType',
      width: 100,
      valueEnum: Dictionaries.getSearch('dict_exam_type'),
      render: (text, record) => <>{Dictionaries.getName('dict_exam_type', record.examType)}</>,
    },
    {
      width: 140,
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
      title: '报考岗位',
      dataIndex: 'project',
      // search: false,
      key: 'project',
      sorter: true,
      width: 120,
      valueType: 'cascader',
      fieldProps: {
        options: Dictionaries.getCascader('dict_reg_job'),
        showSearch: { filter },
      },
      render: (text, record) => (
        <span key="project">
          {record.project &&
            [...new Set(record.project.split(','))].map((item: any, index: number) => {
              return (
                <a
                  key={`project-link-${item}-${index}`}
                  onClick={() => {
                    setRenderData({
                      parentProject: Dictionaries.getCascaderAllName(
                        'dict_reg_job',
                        record.project,
                        'value',
                      ),
                      receivable: record.receivable,
                      examType: record.examType,
                      classYear: record.classYear,
                      classType: record.classType,
                    });
                    setorderId(record.id);
                    setJobFalg(true);
                  }}
                >
                  {Dictionaries.getCascaderName('dict_reg_job', item)} <br />
                </a>
              );
            })}
        </span>
      ),
    },
    {
      title: '服务状态',
      dataIndex: 'serviceStatus',
      sorter: true,
      // search: false,
      filters: true,
      width: 120,
      filterMultiple: false,
      valueType: 'select',
      valueEnum: {
        0: {
          text: <Tag color="#FF0000">未服务</Tag>,
          status: 'Error',
        },
        1: {
          text: <Tag color="#f50">服务中</Tag>,
          status: 'Success',
        },
        2: {
          text: <Tag color="#87d068">已完结</Tag>,
          status: 'Success',
        },
      },
      render: (text, record) => (
        <>
          <Tag
            color={
              record.serviceStatus == 0 ? '#FF0000' : record.serviceStatus == 1 ? '#f50' : '#87d068'
            }
          >
            {
              record.serviceStatus == 0 ? '未服务' : record.serviceStatus == 1 ? '服务中' : '>已完结'
            }
          </Tag>
        </>
      ),
    },

    {
      title: '考试资料',
      dataIndex: 'isComplete2',
      sorter: true,
      // search: false,
      filters: true,
      width: 120,
      hideInTable: !classId,
      filterMultiple: false,
      valueType: 'select',
      valueEnum: {
        false: {
          text: <Tag color="#f50">未提交</Tag>,
          status: 'Error',
        },
        true: {
          text: <Tag color="#87d068">已提交</Tag>,
          status: 'Success',
        },
      },
      render: (text, record) => (
        <>
          <Tag color={record.isComplete2 === false ? '#f50' : '#87d068'}>
            {record.isComplete2 === false ? '未提交' : '已提交'}
          </Tag>
        </>
      ),
    },
    {
      title: '报名资料',
      dataIndex: 'isComplete',
      sorter: true,
      // search: false,
      width: 120,
      filters: true,
      filterMultiple: false,
      valueType: 'select',
      valueEnum: {
        false: {
          text: <Tag color="#f50">未提交</Tag>,
          status: 'Error',
        },
        true: {
          text: <Tag color="#87d068">已提交</Tag>,
          status: 'Success',
        },
      },
      render: (text, record) => (
        <>
          <Tag color={record.isComplete == false ? '#f50' : '#87d068'}>
            {record.isComplete == false ? '未提交' : '已提交'}
          </Tag>
        </>
      ),
    },
    {
      title: '审核',
      dataIndex: 'isSubmit',
      sorter: true,
      width: 80,
      // search: false,
      filters: true,
      hideInTable: Params.isServed,
      filterMultiple: false,
      valueType: 'select',
      valueEnum: {
        // '-isNull': {
        //   text: <Tag color="#f50">未审核</Tag>,
        //   status: 'Processing',
        // },
        false: {
          text: (
            <Tag color="#FF0000">
              <span style={{ textDecoration: 'underline' }}>未通过</span>
            </Tag>
          ),
          status: 'Error',
        },
        true: {
          text: <Tag color="#87d068">已通过</Tag>,
          status: 'Success',
        },
      },
      render: (text, record) => (
        <>
          <Tag
            color={
              record.isSubmit === false ? '#FF0000' : record.confirm === null ? '#f50' : '#87d068'
            }
          >
            {record.isSubmit === false ? (
              <span
                className="isSubmit"
                style={{ textDecoration: 'underline' }}
              // onClick={() => {
              //   request.get('/sms/business/bizAudit', { auditType: '9', entityId: record.id });
              // }}
              >
                未通过
              </span>
            ) : record.confirm === null ? (
              '未审核'
            ) : (
              '已通过'
            )}
          </Tag>
        </>
      ),
    },
    {
      title: '缴费',
      dataIndex: 'status',
      sorter: true,
      width: 80,
      // search: false,
      filters: true,
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
      title: '招生老师',
      dataIndex: 'userName',
      sorter: true,
      width: 100,
    },
    // {
    //   title: '是否确认考试',
    //   dataIndex: 'isConfirmExam',
    //   sorter: true,
    //   width: 80,
    //   valueType: 'select',
    //   valueEnum: {
    //     // '-isNull': {
    //     //   text: <Tag color="#f50">未审核</Tag>,
    //     //   status: 'Processing',
    //     // },
    //     false: {
    //       text: (
    //         <Tag color="#FF0000">
    //           <span style={{ textDecoration: 'underline' }}>不参加</span>
    //         </Tag>
    //       ),
    //       status: 'Error',
    //     },
    //     true: {
    //       text: <Tag color="#87d068">参加</Tag>,
    //       status: 'Success',
    //     },
    //   },
    //   render: (text, record) => (
    //     <>
    //       <Dropdown overlay={menu} onOpenChange={(e) => {
    //         setExaminationId([record.id])
    //       }}>
    //         <Tag color={record.isConfirmExam ? '#87d068' : '#FF0000'}>{record.isConfirmExam ? '参加' : '不参加'}</Tag>
    //       </Dropdown>
    //     </>
    //   ),
    // },

    {
      title: '审核建议',
      dataIndex: 'remark',
      width: 120,
      search: false,
      ellipsis: true,
      tip: '审核建议过长会自动收缩',
    },
    {
      title: '备注',
      width: 120,
      dataIndex: 'description',
      search: false,
      ellipsis: true,
      tip: '备注过长会自动收缩',
    },
    {
      title: '报名时间',
      width: 100,
      key: 'createTime',
      sorter: true,
      dataIndex: 'createTime',
      valueType: 'dateRange',
      render: (text, record) => (
        <span key={`createTime-${record.id}`}>{record.createTime}</span>
      ),
      // sorter: true,
      // hideInSearch: true,
    },
    {
      title: '下证日期',
      width: 100,
      key: 'certStartDate',
      sorter: true,
      dataIndex: 'certStartDate',
      valueType: 'dateRange',
      render: (text, record) => (
        <span key="certStartDate">{record.certStartDate}</span>
      ),
    },
    {
      title: '证书到期日期',
      width: 100,
      key: 'certEndDate',
      sorter: true,
      dataIndex: 'certEndDate',
      valueType: 'dateRange',
      render: (text, record) => (
        <span key="certEndDate">{record.certEndDate}</span>
      ),
    },
    {
      title: '导出次数',
      dataIndex: 'exportNum',
      width: 100,
      sorter: true,
      render: (text, record) => (
        <span key="exportNum">{record.exportNum ? record.exportNum : 0}</span>
      ),
    },
    {
      title: '审核时间',
      key: 'auditTime',
      width: 100,
      sorter: true,
      order: 9,
      dataIndex: 'auditTime',
      valueType: 'dateTimeRange',
      // fieldProps: {
      //   showTime: true,
      // },
      render: (text, record) => (
        <span key="auditTime">
          {record.auditTime ? record.auditTime : '未审核'}
        </span>
      ),
      // sorter: true,
      // hideInSearch: true,
    },
    {
      title: '完结时间',
      key: 'servedTime',
      width: 100,
      sorter: true,
      hideInTable: !Params.isServed,
      dataIndex: 'servedTime',
      valueType: 'dateRange',
      render: (text, record) => (
        <span key="servedTime">
          {record.servedTime}
        </span>
      ),
      // sorter: true,
      // hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 170,
      fixed: 'right',
      render: (text, record, _, action) => (
        <>
          <div hidden={classId}>
            <a
              key="signUp"
              hidden={param.studentType != 0}
              onClick={() => {
                request
                  .get('/sms/business/bizField/orderField', {
                    orderId: record.id,
                    valueType: 0,
                    _isGetAll: true,
                    _orderBy: 'fieldStandardId',
                    _direction: 'asc',
                  })
                  .then((res) => {
                    const resData = res.data.content;
                    if (resData.length <= 0) {
                      message.error('学员报考项目尚未配置报名资料，请联系管理员添加。', 5);
                      return;
                    }
                    setRenderData({ ...record, signup: resData, valueType: 0 });
                    setModalVisible(true);
                  });
              }}
            >
              {record.isSubmit === false ? '修改资料' : '提交资料'}
              <Divider type="vertical" />
            </a>

            <a
              key="signUpqiye"
              hidden={param.studentType == 0}
              onClick={() => {
                donwLoad('/sms/business/bizOrderField/export/fileByParentId?parentId=' + record.id + '&type=0');
              }}
            >
              导出企业学员资料
              <Divider type="vertical" />
            </a>
            <a
              key="signUps"
              hidden={record.isSubmit !== false}
              onClick={() => {
                request
                  .post('/sms/business/bizOrder', { id: record.id, isSubmit: true })
                  .then((res) => {
                    if (res.status == 'success') {
                      message.success('提交成功');
                      callbackRef();
                    }
                  });
              }}
            >
              重新提交
              <Divider type="vertical" />
            </a>

            <Popconfirm
              title="资料审核"
              okText="通过"
              cancelText="未通过"
              onConfirm={(e) => {
                e?.stopPropagation();
                setRenderData({ ...record, confirm: true });
                setAuditVisible(true);
              }}
              onCancel={() => {
                setRenderData({ ...record, confirm: false });
                setAuditVisible(true);
              }}
            >
              <a
                hidden={record.isSubmit === false || record.confirm}
                key="audit"
                style={{ marginRight: '10px', marginBottom: '8px' }}
              >
                审核
                <Divider type="vertical" />
              </a>
            </Popconfirm>
            <a
              onClick={() => {
                setRenderData(record);
                setcheckFalg(true);
              }}
            >
              服务记录
            </a>
            <Divider type="vertical" />
            <a
              onClick={() => {
                setRenderData(record);
                setCertVisible(true)
              }}
            >
              证书
            </a>
            <Divider type="vertical" />
            <a
              onClick={() => { handleOpenQrCode(record) }}
            >
              二维码
            </a>
            <Divider type="vertical" />
            <a
              onClick={() => { handleOpenQuestion(record) }}
            >
              开通题库
            </a>
            {/* <Popconfirm
              title="服务完结"
              okText="完结"
              cancelText="未完结"
              onConfirm={(e) => {
                e?.stopPropagation();
                request
                  .post('/sms/business/bizOrder/served', { ids: record.id, isServed: true })
                  .then((res) => {
                    if (res.status == 'success') {
                      message.success('提交成功');
                      callbackRef();
                    }
                  });
              }}
            >
              <a
                hidden={record.isServed}
                key="audits"
                style={{ marginRight: '10px', marginBottom: '8px' }}
              >
                完结
              </a>
            </Popconfirm> */}
          </div>
          <div hidden={!classId}>
            <a
              key="signUp"
              // hidden={record.isServed}
              onClick={() => {
                request
                  .get('/sms/business/bizField/orderField', {
                    orderId: record.id,
                    valueType: 1,
                  })
                  .then((res) => {
                    const resData = res.data.content;
                    if (resData.length <= 0) {
                      message.error('学员报考项目尚未配置考试资料，请联系管理员添加。', 5);
                      return;
                    }
                    setRenderData({ ...record, signup: resData.reverse(), valueType: 1 });
                    setModalVisible(true);
                  });
              }}
            >
              考试资料
              <Divider type="vertical" />
            </a>
            <a
              key="signUp"
              // hidden={record.isServed}
              style={{ color: 'red' }}
              onClick={() => {
                request
                  .post('/sms/business/bizOrder', {
                    classId: '-1',
                    id: record.id,
                  })
                  .then((res) => {
                    if (res.status == 'success') {
                      message.success('提交成功');
                      callbackRef();
                    }
                  });
              }}
            >
              移除班级
              <Divider type="vertical" />
            </a>
          </div>
        </>
      ),
    },
  ];
  const handleChange = (e: any, record: GithubIssueItem) => {
    console.log('e', e);
    console.log('record', record);
    request.post('/sms/business/bizOrder', { id: record.id, classId: e }).then((res) => {
      if (res.status == 'success') {
        message.success('提交成功');
        callbackRef();
      }
    });
  };
  const donwLoad = (url: string) => {
    const tokenName: any = sessionStorage.getItem('tokenName');
    const tokenValue = sessionStorage.getItem('tokenValue');
    const obj = {};
    obj[tokenName] = tokenValue;
    fetch(url, {
      method: 'POST',
      headers: { ...obj },
    }).then((res: any) => {
      res.blob().then((ress: any) => {
        const blobUrl = window.URL.createObjectURL(ress);
        const a = document.createElement('a'); //获取a标签元素
        document.body.appendChild(a);
        const filename = '附件'; //设置文件名称
        a.href = blobUrl; //设置a标签路径
        a.download = filename;
        a.target = '_blank';
        a.click();
        a.remove();
        callbackRef();
      });
    });
  };
  const sortList = {
    ['createTime,status']: 'desc,desc',
  };

  const toolbar = {
    menu: {
      type: 'tab',
      items: [
        {
          key: 'All',
          label: <span>全部</span>,
        },
        {
          key: '0',
          label: <span>未服务</span>,
        },
        {
          key: '1',
          label: <span>服务中</span>,
        },
        {
          key: '2',
          label: <span>已完结</span>,
        },
        // {
        //   key: 'isCompleteFalse',
        //   label: <span>资料待提交</span>,
        // },
        // {
        //   key: 'isCompleteTrue',
        //   label: <span>资料提交待审核</span>,
        // },
        // {
        //   key: 'confirmFalse',
        //   label: <span>审核不通过待修改</span>,
        // },
        // {
        //   key: 'confirmTrue',
        //   label: <span>审核通过待服务/服务中</span>,
        // },
        // {
        //   key: 'isServed',
        //   label: <span>已服务完结</span>,
        // },
      ],
      onChange: (key: string) => {
        switch (key) {
          // case 'isCompleteFalse':
          //   setParams({
          //     ...param,
          //     isComplete: false,
          //     'isSubmit-isNot': false,
          //     'confirm-isNull': true,
          //     'isServed-isNot': true,
          //   });
          //   break;
          // case 'isCompleteTrue':
          //   setParams({
          //     ...param,
          //     isComplete: true,
          //     'isSubmit-isNot': false,
          //     'confirm-isNull': true,
          //     'isServed-isNot': true,
          //   });
          //   break;
          // case 'confirmFalse':
          //   setParams({ ...param, isSubmit: false, isServed: false });
          //   break;
          // case 'confirmTrue':
          //   setParams({ ...param, isSubmit: true, auditType: 9, confirm: true, isServed: false });
          //   break;
          // case 'isServed':
          //   setParams({ ...param, isServed: true });
          //   break;
          case 'All':
            setParams(param);
            break;
          case '0':
            setParams({ ...param, serviceStatus: 0 });
            break;
          case '1':
            setParams({ ...param, serviceStatus: 1 });
            break;
          case '2':
            setParams({ ...param, serviceStatus: 2 });
            break;
        }
        callbackRef();
      },
    },
  };
  return (
    <PageContainer
      onTabChange={(e) => {
        setTabListNuber(e);
        const data = Params
        data.studentType = e
        setParams(data)
        callbackRef();
      }}
    // tabList={[
    //   {
    //     tab: '学员',
    //     key: '0',
    //   },
    //   {
    //     tab: '企业',
    //     key: '1',
    //   },
    //   {
    //     tab: '代理',
    //     key: '2',
    //   },
    // ]}

    >
      <Spin spinning={SpingFalg}>
        <Tables
          columns={columns}
          className="SignUpStudent"
          scroll={{ x: 1500 }}
          actionRef={actionRef}
          cardBordered
          request={{ url: url, params: Params, sortList: sortList }}
          search={{ defaultCollapsed: true, defaultColsNumber: 10 }}
          rowKey="id"
          toolbar={toolbar}
          // search={orderId ? false : true}
          rowSelection={{
            // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
            // 注释该行则默认不显示下拉选项
            selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
            onChange: (e, selectedRows) => {
              setSelectedRows(selectedRows);
              setSelectedIds(e);
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
                    DownTable(selectedRows, downObj, '学员信息', 'student');
                  }}
                >
                  导出学员信息
                </a>
                <a
                  onClick={() => {
                    setRenderData(selectedRows[0]);
                    setClassFalg(true);
                  }}
                  hidden={classId}
                >
                  批量选择班级
                </a>
                <a
                  onClick={() => {
                    console.log('selectedIds', selectedIds);
                    request
                      .post('/sms/business/bizOrder/served', {
                        ids: selectedIds.join(','),
                        isServed: true,
                      })
                      .then((res) => {
                        if (res.status == 'success') {
                          message.success('提交成功');
                          callbackRef();
                        }
                      });
                  }}
                // hidden={Params.confirm !== true}
                >
                  批量完结
                </a>
                <a onClick={async () => {
                  examination(true, selectedIds)
                  // setTimeout(() => {
                  //   
                  // }, 1000)

                }}>
                  批量确认参加考试
                </a>
                <a onClick={async () => {
                  setMessageVisible(true)
                  setRenderData({ messageType: 'student', id: selectedIds.join(',') })
                }}>
                  批量发送短信
                </a>
                <a onClick={async () => {
                  setWXMessageVisible(true)
                  setRenderData({ messageType: 'student', id: selectedIds.join(',') })
                }}>
                  批量发送微信订阅消息
                </a>
                <a
                  hidden={param.studentType != 0}
                  onClick={() => {
                    donwLoad('/sms/business/bizOrderField/export/fileById?idList=' + selectedIds.join(',') + '&type=0');
                  }}
                // hidden={Params.confirm !== true}
                >
                  导出报名资料
                </a>
              </Space>
            );
          }}
        />

        <Modal
          open={checkFalg}
          width={1200}
          onOk={() => setcheckFalg(false)}
          onCancel={() => setcheckFalg(false)}
          title={'服务记录'}
        >
          {renderData && <Return orderId={renderData.id} />}
        </Modal>
        <Modal
          open={jobFalg}
          width={1200}
          onOk={() => setJobFalg(false)}
          onCancel={() => setJobFalg(false)}
          title={'收费标准'}
        >
          <JobAssociation
            student={true}
            params={renderData}
            callbackRefP={() => callbackRef()}
            orderId={orderId}
            setJobFalg={() => setJobFalg(false)}
          />
        </Modal>
        <Modal
          open={ClassFalg}
          width={1200}
          onOk={() => setClassFalg(false)}
          onCancel={() => setClassFalg(false)}
          footer={null}
        >
          <ClassList
            selectedIds={selectedIds}
            renderDatas={renderData}
            callbackRefs={() => callbackRef()}
            setClassFalg={() => setClassFalg(false)}
          />
        </Modal>
        {InfoVisibleFalg && (
          <StudentInfo
            setModalVisible={() => setInfoVisible(false)}
            modalVisible={InfoVisibleFalg}
            renderData={StudentData}
            callbackRef={() => callbackRef()}
            setAuditVisible={(e: boolean) => setAuditVisible(e)}
            setRenderData={(e: any) => setRenderData(e)}
          />
        )}
        {modalVisible && (
          <SignUp
            setModalVisible={() => setModalVisible(false)}
            modalVisible={modalVisible}
            renderData={renderData}
            callbackRef={() => callbackRef()}
          />
        )}
        {MessageVisible && (
          <MessageModal
            modalVisible={MessageVisible}
            setModalVisible={() => setMessageVisible(false)}
            callbackRef={() => callbackRef()}
            renderData={renderData}
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
        {WXMessageVisible && (
          <WxMessage
            modalVisible={WXMessageVisible}
            setModalVisible={() => setWXMessageVisible(false)}
            callbackRef={() => callbackRef()}
            renderData={renderData}
          />
        )}
        <Modal
          title="提交资料二维码"
          open={qrcodeVisible}
          width={500}
          onCancel={() => setQrcodeVisible(false)}
          footer={null}
          destroyOnClose
        >

          <img style={{ width: '400px', height: '400px' }} src={qrcodeSrc} />
        </Modal>

        {/* 开通题库 */}
        {AddModalsVisible && (
          <AddQuestion
            setModalVisible={() => setAddModalsVisible(false)}
            modalVisible={AddModalsVisible}
            renderData={renderData}
            callbackRef={() => callbackRef()}
          />
        )}

        <Modal
          title="编辑证书"
          open={certVisible}
          onCancel={() => setCertVisible(false)}
          footer={null}
          destroyOnClose
        >
          <ProForm
            onFinish={async (e: any) => {
              request
                .post('/sms/business/bizOrder', { ...e, id: renderData.id })
                .then((res) => {
                  if (res.status == 'success') {
                    message.success('提交成功');
                    setCertVisible(false)
                    callbackRef();
                  }
                });
            }}
          >
            <ProFormDatePicker
              name="certStartDate"
              initialValue={renderData?.certStartDate && moment(renderData.certStartDate).format('YYYY-MM-DD')}
              fieldProps={{
                format: 'YYYY-MM-DD'
              }}
              label={`下证日期`}
              rules={[{ required: true }]}
            />
            <ProFormDatePicker
              name="certEndDate"
              initialValue={renderData?.certEndDate && moment(renderData.certEndDate).format('YYYY-MM-DD')}
              fieldProps={{
                format: 'YYYY-MM-DD'
              }}
              label={`证书到期日期`}
              rules={[{ required: true }]}
            />
          </ProForm>
        </Modal>
      </Spin>
    </PageContainer>
  );
};
