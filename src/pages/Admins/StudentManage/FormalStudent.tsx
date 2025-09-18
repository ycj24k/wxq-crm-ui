import { useEffect, useRef, useState } from 'react';
import {
  PlusOutlined,
  SearchOutlined,
  FormOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import {
  Button,
  Tag,
  Modal,
  Popconfirm,
  message,
  Space,
} from 'antd';
import Modals from './newUserModal';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import request from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import StudentInfo from './newstudentInfo';
import StepsOrder from '../AdminOrder/StepsOrder';
import AddModals from '../AdminReturnVisit/addModalsNew';
import ContractS from './ContractS';
import StudentOrders from './StudentOrder';
import CompanyContract from '../Contract/CompanyContract';
import Tables from '@/components/Tables';
import IsVerifyModel from './isVerifyModel';
import { useModel, history } from 'umi';
import filter from '@/services/util/filter';
import { ModalForm, ProFormInstance } from '@ant-design/pro-form';
import './index.less'
import UserTreeSelect from '@/components/ProFormUser/UserTreeSelect';
type GithubIssueItem = {
  qq: any;
  weChat: any;
  name: string;
  mobile: string;
  isLocked?: boolean;
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
  protectionPeriodExpireTime: any;
  updateTime: any;
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
export default () => {
  const actionRef = useRef<ActionType>();
  const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
  const [ContractSFalg, setContractSVisible] = useState<boolean>(false);
  const [IsVerifyModelFalg, setIsVerifyModelVisible] = useState<boolean>(false);
  const [CompanyContractFalg, setCompanyContractVisible] = useState<boolean>(false);
  const [InfoVisibleFalg, setInfoVisible] = useState<boolean>(false);
  const [followStatus, setFollowStatus] = useState('0');
  const [StudentOrderOpen, setStudentOrderOpen] = useState<boolean>(false);
  const [orderVisibleFalg1, setOrderVisible1] = useState<boolean>(false);
  const [userFromTeacher, setuserFromTeacher] = useState<boolean>(false);
  const [AddModalsVisible, setAddModalsVisible] = useState<boolean>(false);
  const [renderData, setRenderData] = useState<any>(null);
  const [selectedRowsList, setselectedRowsList] = useState<any>([]);
  const [selectedRowsId, setselectedRowsId] = useState<any>([]);
  const [paramsA, setparamsA] = useState<any>({});
  const { initialState } = useModel('@@initialState');
  const [userNameId1, setUserNameId1] = useState<any>();
  let [department, setDepartment] = useState<any>({});
  const formRef = useRef<ProFormInstance>();
  const formRefs = useRef<ProFormInstance>();
  useEffect(() => {
    formRef.current?.setFieldsValue(history.location.query);
    setparamsA(history.location.query);
  }, []);
  useEffect(() => {
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
          if (res.status == 'success') {
            message.success('操作成功！');
            setselectedRowsList([]);
            setDepartment({});
            callbackRef();
          }
        });
    }
  }, [department]);
  const dynamicToolbar =
  {
    menu: {
      type: 'tab',
      items: [
        { key: '0', label: <span>我的学员</span> },
        { key: '1', label: <span>共享学员</span> },
      ],
      onChange: (key: any) => {
        setFollowStatus(key);
        callbackRef();
      },
    }
  };
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

    if (!record.mobile || !record.name) {
      message.error('请先补充学员姓名、手机号后在进行下单');
      setRenderData({ ...record, typee: 'eidt' });
      setModalVisible(true);
    } else {
      setRenderData({
        ...record,
        typee: 'add',
        orderNumber: 0,
        group: false,
      });
      setOrderVisible1(true);
    }

  };
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      width: 100,
      fixed: 'left',
      title: '学员',
      dataIndex: 'name',
      align: 'center',
      key: 'name',
      render: (text, record) => (
        <div>
          <a
            onClick={() => {
              setRenderData({ ...record, isFormal: true });
              setInfoVisible(true);
            }}
          >
            {record.name}

            <SearchOutlined />
          </a>
          <div>{record.isPeer && <Tag color="#87CEEB">同行企业</Tag>}</div>
        </div>
      ),
    },
    {
      title: '微信号',
      dataIndex: 'weChat',
      key: 'weChat',
      hideInTable: true,
      width: 85,
      render: (text, record) => <span style={{ userSelect: 'none' }}>{record.weChat}</span>,
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      key: 'mobile',
      hideInTable: true,
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
      title: '客户来源',
      dataIndex: 'source',
      valueType: 'select',
      key: 'source',
      filters: true,
      filterMultiple: false,
      valueEnum: Dictionaries.getSearch('dict_source'),
      render: (text, record) => (
        <span>{Dictionaries.getName('dict_source', record.source)}</span>
      ),
    },
    {
      width: 100,
      title: '咨询岗位',
      dataIndex: 'project-in',
      // sorter: true,
      key: 'project-in',
      valueType: 'select',
      fieldProps: {
        options: Dictionaries.getCascader('dict_reg_job'),
        showSearch: { filter },
        mode: 'tags',
      },
      ellipsis: true,
      render: (text, record) => (
        <span>{Dictionaries.getCascaderName('dict_reg_job', record.project)}</span>
      ),
    },
    {
      width: 100,
      title: '企业负责人',
      dataIndex: 'chargePersonName',
      key: 'chargePersonName',
      hideInTable: true,
    },
    {
      width: 100,
      title: '上次回访时间',
      search: false,
      align: 'center',
      hideInTable: true,
      render: (text, record) => (
        <span>{record.visitTime}</span>
      ),
    },
    {
      title: '性别',
      dataIndex: 'sex',
      width: 70,
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
      // sorter: true,
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
      hideInTable: true,
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
      valueType: 'select',
      key: 'isPeer',
      valueEnum: {
        false: '否',
        true: '是',
      },
      hideInTable: true,
    },
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
    {
      width: 150,
      title: '接收信息负责人',
      dataIndex: 'userName',
      key: 'userNames',
      search: false,
      hideInTable: false,
    },
    {
      width: 180,
      title: '成交客户保护期到期时间',
      key: 'protectionPeriodExpireTime',
      dataIndex: 'protectionPeriodExpireTime',
      valueType: 'dateRange',
      sorter: true,
      ellipsis: true,
      hideInTable: false,
      render: (text, record) => (
        <span>{record.protectionPeriodExpireTime}</span>
      ),
    },
    {
      width: 150,
      title: '介绍时间',
      key: 'createTime',
      dataIndex: 'createTimes',
      valueType: 'dateRange',
      hideInTable: true,
      sorter: true,
      render: (text, record) => (
        <span>{record.createTime}</span>
      ),
    },
    {
      width: 150,
      title: '下单时间',
      key: 'lastDealTime',
      dataIndex: 'lastDealTime',
      valueType: 'dateRange',
      hideInTable: true,
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
      width: 150,
      title: '创建时间',
      key: 'createTime',
      dataIndex: 'createTime',
      valueType: 'dateRange',
      hideInTable: false,
      sorter: true,
      ellipsis: true,
      render: (text, record) => (
        <span>{record.createTime}</span>
      ),
    },
    {
      width: 150,
      title: '最后更新时间',
      key: 'updateTime',
      dataIndex: 'updateTime',
      valueType: 'dateRange',
      hideInTable: false,
      sorter: true,
      ellipsis: true,
      render: (text, record) => (
        <span>
          {record.updateTime}
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
          {followStatus == '1' ? (
            <>
              <div>
                <Space>

                  <Popconfirm
                    key="receivePop"
                    title="是否确定领取？"
                    style={{ marginRight: '15px', marginBottom: '8px' }}
                    onConfirm={() => {
                      request.postAll('/sms/business/bizStudent/receiveCompanyShare', [record.id]).then((res: any) => {
                        if (res.status == 'success') {
                          message.success('领取成功');
                          callbackRef();
                        }
                      });
                    }}
                    okText="领取"
                    cancelText="取消"
                  >
                    <a key="receive">
                      领取
                    </a>
                  </Popconfirm>
                </Space>
              </div>

            </>
          ) : (
            <>
              <div>

                <Space>

                  <a
                    hidden={false}
                    key="look"
                    onClick={() => {
                      setRenderData({ ...record, isFormal: true });
                      setInfoVisible(true);
                    }}
                  >
                    查看
                  </a>

                  <a
                    key="editable"
                    onClick={() => {
                      setRenderData({ ...record, typee: 'eidt' });
                      setModalVisible(true);
                    }}
                  >
                    编辑
                  </a>
                  <a
                    key={`edit-${record.id || Math.random()}`}
                    hidden={false}
                    type="primary"
                    onClick={() => {
                      setRenderData({ ...record, types: 'add', n: 0 });
                      setAddModalsVisible(true);
                    }}
                  >
                    回访
                  </a>
                  <a
                    type="primary"
                    key="editable2"
                    hidden={false}
                    onClick={() => {
                      placeAnOrder(record);
                    }}
                  >
                    下单
                  </a>
                </Space>
              </div>
              <Space>
                <div>
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

                {/* <Popconfirm
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
                </Popconfirm> */}
                <div hidden={record.isLocked}>
                  <Popconfirm
                    key="deletePop"
                    title="是否确定锁定？"
                    style={{ marginRight: '15px', marginBottom: '8px' }}
                    onConfirm={() => {
                      request.post(`/sms/business/bizStudent/lock/${record.id}`,).then((res: any) => {
                        if (res.status == 'success') {
                          message.success('已锁定');
                          callbackRef();
                          console.log('record:', record.isLocked)
                        }
                      });
                    }}
                    okText="锁定"
                    cancelText="取消"
                  >
                    <a key="lock" style={{ color: '#fa8c16' }}>
                      锁定学员
                    </a>
                  </Popconfirm>
                </div>
                <div hidden={!record.isLocked}>
                  <Popconfirm
                    key="deletePop"
                    title="是否解除锁定？"
                    style={{ marginRight: '15px', marginBottom: '8px' }}
                    onConfirm={() => {
                      request.post(`/sms/business/bizStudent/unlock/${record.id}`,).then((res: any) => {
                        if (res.status == 'success') {
                          message.success('已解锁');
                          callbackRef();
                          console.log('record:', record.isLocked)
                        }
                      });
                    }}
                    okText="解锁"
                    cancelText="取消"
                  >
                    <a key="lock" style={{ color: '#52c41a' }}>
                      解除锁定
                    </a>
                  </Popconfirm>
                </div>
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
  params.isPay = true
  params.isFormal = true;
  sortList = {
    createTime: 'desc',
  };
  params["userId-isNull"] = false;
  params.type = '0';
  Object.assign(params, paramsA);
  return (
    <>
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
          {
            url: followStatus == '1'
              ? '/sms/business/bizStudent/companyShare'
              : '/sms/business/bizStudent',
            params: params,
            sortList: sortList
          }
        }
        rowSelection={{
          onChange: (e, selectedRows) => {
            setselectedRowsId(e);
            setselectedRowsList(selectedRows as []);
          },
        }}
        tableAlertOptionRender={() => {//多选后
          return (
            <Space size={16}>
              <a
                key="orderq"
                style={{ color: 'red' }}
                onClick={() => {
                  if (selectedRowsList.length == 0 || selectedRowsList.length > 1) {
                    message.error('请只选择一位学员!');
                    return;
                  }
                  buildAccount();
                }}
              >
                重构法大大账号
              </a>

            </Space>
          );
        }}
        toolBarRender={[//顶栏
          <div key="toolbar-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <Space style={{ marginLeft: 'auto' }}>
              <Button
                key="ordere"
                type="primary"
                hidden={!(followStatus == '0')}
                icon={<PlusOutlined />}
                onClick={async () => {
                  if (selectedRowsList.length == 0) {
                    message.error('请先勾选至少一个学员再进行分配!');
                    return;
                  }
                  setuserFromTeacher(true);
                }}
              >
                重新分配老师
              </Button>
              <Button
                key="buttons"
                icon={<FormOutlined />}
                type="primary"
                hidden={false}
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
                        setModalVisible(true);
                        return;
                      }

                      if (
                        selectedRowsList[0].type == 1 &&
                        !selectedRowsList[0].codeFile
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
                  }
                }}
              >
                合同签署
              </Button>
            </Space>
          </div>
        ]}
      />


      {InfoVisibleFalg && (//查看
        <StudentInfo
          setModalVisible={() => setInfoVisible(false)}
          modalVisible={InfoVisibleFalg}
          renderData={renderData}
          callbackRef={() => callbackRef()}
        />
      )}
      {AddModalsVisible && (//回访
        <AddModals
          setModalVisible={() => setAddModalsVisible(false)}
          modalVisible={AddModalsVisible}
          renderData={renderData}
          url="/sms/business/bizReturnVisit"
          callbackRef={() => callbackRef()}
        />
      )}
      {modalVisibleFalg && (//编辑窗口
        <Modals
          setModalVisible={() => setModalVisible(false)}
          modalVisible={modalVisibleFalg}
          callbackRef={() => callbackRef()}
          isShowMedium={false}
          renderData={renderData}
          url={'/sms/business/bizStudent'}
          type={'学员'}
        />
      )}
      {StudentOrderOpen && (//缴费退费
        <StudentOrders
          setModalVisible={() => setStudentOrderOpen(false)}
          modalVisible={StudentOrderOpen}
          renderData={renderData}
          callbackRef={() => callbackRef()}
          placeAnOrder={(e: any) => placeAnOrder(e)}
        />
      )}
      {orderVisibleFalg1 && (//下单提示
        <StepsOrder
          setModalVisible={() => setOrderVisible1(false)}
          modalVisible={orderVisibleFalg1}
          renderData={renderData}
          callbackRef={() => callbackRef()}
        />
      )}
      {CompanyContractFalg && (//合同签署1
        <CompanyContract
          setModalVisible={() => setCompanyContractVisible(false)}
          modalVisible={CompanyContractFalg}
          renderData={renderData}
          callbackRef={() => callbackRef()}
        />
      )}
      {ContractSFalg && (//合同签署2
        <ContractS
          setModalVisible={() => setContractSVisible(false)}
          modalVisible={ContractSFalg}
          renderData={renderData}
          callbackRef={() => callbackRef()}
        />
      )}

      {IsVerifyModelFalg && (//合同签署3
        <IsVerifyModel
          modalVisible={IsVerifyModelFalg}
          setModalVisible={() => setIsVerifyModelVisible(false)}
          renderData={renderData}
        />
      )}

      {userFromTeacher && (
        <ModalForm
          width={450}
          visible={userFromTeacher}
          modalProps={{
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
                .postAll(followStatus == '0' ? `/sms/business/bizStudent/assign/${userNameId1.id}` : `/sms/business/bizStudentUser/assign/${userNameId1.id}`,
                  selectedRowsId,
                )
                .then((res) => {
                  if (res.status == 'success') {
                    message.success('分配成功!');
                    setuserFromTeacher(false);
                    callbackRef();
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
            userPlaceholder="请选择老师"
            setUserNameId={(e: any) => setUserNameId1(e)}
            flag={true}
          />
        </ModalForm>
      )}

    </>
  );
};
