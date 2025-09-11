import React, { useEffect, useRef, useState } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined, RedoOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Tag, Space, Switch, Popconfirm, message, Modal } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable, { TableDropdown } from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import request from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import UserManageCard from '../Department/UserManageCard';
import Modals from './userModal';
import DownTable from '@/services/util/timeFn';
import UserInfo from './UserInfo'
import Upload from '@/services/util/upload';
import downObj from './DownHeard'
import ProCard from '@ant-design/pro-card';
import ProForm, { ModalForm, ProFormInstance } from '@ant-design/pro-form';
import UploadDragger from '@/components/UploadDragger/UploadDragger';
import mammoth from 'mammoth';
import fetchDownload from '@/services/util/fetchDownload';
import { getCompanyRequest } from '@/services/util/util';
type GithubIssueItem = {
  name: string;
  departmentName: string;
  sex: number;
  id: number;
  ecId: number;
  departmentId: number;
  url: string;
  status: string;
  enable: boolean;
  isReset: boolean;
  userList: any;
  projectList: any;
  topDepartmentName: any;
  infoFile: string;
};
let content: any = null;
// const downObj = {
//   id: 'id',
//   姓名: 'name',
//   部门: 'departmentName',
//   手机号: 'mobile',
//   身份证: 'idCard',
//   创建日期: 'createTime',
//   是否已重置密码: 'isReset',
//   是否启用: 'enable',
// };
export default (props: any) => {
  const { type = 0 } = props
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
  const [renderData, setRenderData] = useState<any>({});
  const [switchLoding, setSwitchLoding] = useState<boolean>(false);
  const [TabListNuber, setTabListNuber] = useState<any>('1');
  const [CardVisible, setCardVisible] = useState<boolean>(false);
  const [parentIdTree, setParentIdTree] = useState<string | number>('-1');
  const [UploadFalg, setUploadVisible] = useState<boolean>(false);
  const [CardContent, setCardContent] = useState<any>();
  let [department, setDepartment] = useState<any>();
  const [selectedRowsList, setselectedRowsList] = useState<any>([]);
  const [userInfoFalg, setUserInfoFalg] = useState<boolean>(false)
  const [infoFileVisible, setInfoFileVisible] = useState<boolean>(false)
  const [docxVisible, setDocxVisible] = useState<boolean>(false)
  const [userList1, setUserList1] = useState<any>({})
  const [userList2, setUserList2] = useState<any>({})
  const [propsUser, setPropsUser] = useState<any>()
  const callbackRef = () => {
    // @ts-ignore
    actionRef?.current?.reload();
  };
  const getUserList = async () => {
    const list1 = (await request.get('/sms/system/sysUser', { newOrderType: '1', _isGetAll: true })).data.content
    let L1: any = { userName: [], userId: [] }
    list1.forEach((item: any) => {
      L1.userName.push(item.name);
      L1.userId.push({ id: item.id, name: item.name })
    })
    const list2 = (await request.get('/sms/system/sysUser', { newOrderType: '2', _isGetAll: true })).data.content
    let L2: any = { userName: [], userId: [] }
    list2.forEach((item: any) => {
      L2.userName.push(item.name);
      L2.userId.push({ id: item.id, name: item.name })
    })
    setUserList1(L1)
    setUserList2(L2)

  }
  const achievementFn = async (num: number) => {
    if (!content) {
      content = await request.get('/sms/share/getDepartmentAndUser');
    }
    let userList: any = ''
    if (num == 3) {
      userList = propsUser.userId
    } else {
      userList = num == 1 ? userList1.userId : userList2.userId
    }
    // console.log('userList', userList);

    setCardContent({ content: content.data, type: num == 3 ? 'Groups' : 'achievement', typeNum: num, groups: props?.params?.id });
    setDepartment(userList);
    setCardVisible(true);
  }
  useEffect(() => {
    // Dictionaries.getDepartmentName(49);
    // console.log(Dictionaries.getDepartmentName(49));
    if (TabListNuber == '3') {
      getUserList()
    }

  }, [TabListNuber]);
  useEffect(() => {
    // console.log(infoFileVisible, renderData.infoFile)
    if (infoFileVisible && renderData.infoFile) {
      setTimeout(() => {
        formRef.current?.setFieldsValue({
          infoFile: [{
            uid: 1,
            name: renderData.infoFile,
            response: { data: renderData.infoFile },
          }]
        })
      }, 200);
    }
  }, [infoFileVisible]);
  const columns2: ProColumns<GithubIssueItem>[] = [
    {
      title: '名字',
      dataIndex: 'name',
      // width: 100,
      render: (text, record) => (
        <a
          onClick={() => {
            setRenderData({ ...record });
            setUserInfoFalg(true);
          }}
        >
          {record.name}
        </a>
      ),
    },
    {
      title: '授权人员',
      dataIndex: 'userNames',
      colSpan: 2,
      search: false,
      ellipsis: true,
      tip: '过长会自动收缩',
    },
    {
      title: '关联',
      colSpan: 0,
      search: false,
      render: (text, record, _, action) => (
        <Button
          size="small"
          type="primary"
          icon={<PlusOutlined />}
          onClick={async () => {
            if (!content) {
              content = await request.get('/sms/share/getDepartmentAndUser');
            }
            setCardContent({ content: content.data, type: 'user' });
            setDepartment(record.userList);
            setParentIdTree(record.id);
            setCardVisible(true);
          }}
        >
          授权
        </Button>
      ),
    },
    {
      title: '授权项目',
      dataIndex: 'project',
      colSpan: 2,
      search: false,
      ellipsis: true,
      tip: '过长会自动收缩',
    },
    {
      title: '关联',
      search: false,
      colSpan: 0,
      render: (text, record, _, action) => (
        <Button
          size="small"
          type="primary"
          icon={<PlusOutlined />}
          onClick={async () => {
            // if (!content) {
            //   content = await request.get('/sms/share/getDepartmentAndUser');
            // }
            // request.get('/sms/admin/bizJobUser');

            const arr = Dictionaries.getTree('dict_reg_job');

            setCardContent({ content: arr, type: 'project' });
            setDepartment(record.projectList);
            setParentIdTree(record.id);
            setCardVisible(true);
          }}
        >
          授权
        </Button>
      ),
    },
    // {
    //   title: '操作',
    //   render: (text, record) => [
    //     <Button key="editable" type="primary" size="small" icon={<EditOutlined />}>
    //       编辑
    //     </Button>,
    //   ],
    // },
  ];

  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: '名字',
      dataIndex: 'name',
      // width: 100,
      render: (text, record) => (
        <a
          onClick={() => {
            setRenderData({ ...record });
            setUserInfoFalg(true);
          }}
        >
          {record.name}
        </a>
      ),
    },
    {
      title: '所属公司',
      dataIndex: 'companyId',
      key: 'companyId',
      valueType: 'select',
      request: getCompanyRequest,
    },
    {
      title: '部门',
      dataIndex: 'departmentName',
      key: 'departmentName',
      search: false,
      render: (text, record) => (
        <span>
          {Dictionaries.getDepartmentName(record.departmentId).join('-')}
          {/* {record.departmentName} */}
        </span>
      ),
    },
    // {
    //   title: '性别',
    //   dataIndex: 'sex',
    //   // width: 80,
    //   search: false,
    //   render: (text, record) => <span>{record.sex ? '女' : '男'}</span>,
    // },
    {
      title: '手机号',
      dataIndex: 'mobile',
    },
    {
      title: '在职状态',
      dataIndex: 'status',
      valueType: 'select',
      key: 'status',
      filters: true,
      filterMultiple: false,
      valueEnum: Dictionaries.getSearch('onJobStatus'),
      render: (text, record) => (
        <span>{Dictionaries.getName('onJobStatus', record.status)}</span>
      ),
    },
    {
      title: '创建时间',
      key: 'showTime',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      // sorter: true,
      search: false,
      // hideInTable: true,
      // hideInSearch: true,
    },
    {
      title: '最后登录时间',
      key: 'lastLoginTime',
      dataIndex: 'lastLoginTime',
      valueType: 'dateTime',
      // sorter: true,
      search: false,
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: '是否已重置密码',
      key: 'isReset',
      dataIndex: 'isReset',
      search: false,
      hideInSearch: true,
      render: (text, record) => (
        <>{record.isReset ? '已重置' : <span style={{ color: 'red' }}>未重置</span>}</>
      ),
    },
    {
      title: '人员资料文件',
      dataIndex: 'infoFile',
      hideInTable: type != 1,
      search: false,
      render: (text, record) => <>
        <Button
          type="primary"
          size="small"
          hidden={!record.infoFile}
          // icon={<SearchOutlined />}
          onClick={async (e) => {
            let tokenName: any = sessionStorage.getItem('tokenName');
            let tokenValue = sessionStorage.getItem('tokenValue');
            let obj = {};
            obj[tokenName] = tokenValue;
            fetch('/sms/system/sysUser/download?id=' + record.id + '&fileName=' + record.infoFile, {
              method: 'GET',
              headers: { ...obj },
            }).then((res: any) => {
              res.blob().then((ress: any) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  // console.log(e)
                  if (e.target?.result && e.target.result instanceof ArrayBuffer)
                    mammoth.convertToHtml({ arrayBuffer: e.target.result })
                      .then(function (result) {
                        // var html = result.value; // 生成的HTML
                        // var messages = result.messages; // 转换期间的警告消息等
                        console.log(result)
                        let doc = document.getElementById('infoFileDocx')
                        if (doc) doc.innerHTML = result.value
                      })
                      .catch(function (error) {
                        console.error(error);
                      });
                };
                reader.readAsArrayBuffer(new Blob([ress]));
                // console.log(ress)
                // let element = document.getElementById("infoFileDocx")
                // if (element) renderAsync(ress, element).then(x => console.log("docx: 完成"));
              });
            });
            setDocxVisible(true);
          }}
        >
          查看
        </Button>
        <Button
          style={{ marginLeft: 5 }}
          type="primary"
          size="small"
          hidden={!record.infoFile}
          onClick={() => {
            fetchDownload('/sms/system/sysUser/download', record.id, { fileName: record.infoFile }, record.name + '.docx');
          }}
        >
          下载
        </Button>
        <Button
          style={{ marginLeft: 5 }}
          type="primary"
          size="small"
          onClick={async (e) => {
            setRenderData({ ...record })
            setInfoFileVisible(true);
          }}
        >
          上传资料
        </Button>
      </>
    }
    ,
    {
      title: '用户状态',
      dataIndex: 'enable',
      hideInTable: type == 1,
      search: false,
      render: (text, record) => (
        <Switch
          key={record.id}
          checkedChildren="启用"
          unCheckedChildren="禁用"
          defaultChecked={record.enable}
          loading={switchLoding}
          onChange={async () => {
            setSwitchLoding(true);
            const status: any = await request.post('/sms/system/sysUser', {
              id: record.id,
              enable: !record.enable,
            });
            if (status.status != 'success') {
              message.error(status.msg);
            }
            setSwitchLoding(false);
            callbackRef();
          }}
        />
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      hideInTable: props?.params,
      render: (text, record, _, action) => [
        <Button
          key="editable"
          type="primary"
          size="small"
          onClick={() => {
            setRenderData({ ...record, type: 'eidt', numberEidt: 0 });
            setModalVisible(true);
          }}
        >
          编辑
        </Button>,
        <Popconfirm
          key={`${record.id}-resetPwd`}
          title="是否重置密码？"
          onConfirm={() => {
            request
              .post('/sms/system/sysUser/resetPassword', { id: record.id })
              .then((res: any) => {
                if (res.status == 'success') {
                  message.success('重置成功');
                  callbackRef();
                }
              });
          }}
          okText="重置"
          cancelText="取消"
        >
          <Button type="primary" key={`btn-resetPwd-${record.id}`} size="small" danger>
            重置密码
          </Button>
        </Popconfirm>,
        <Popconfirm
          key={`${record.id}-ec`}
          title={record.ecId ? '是否删除EC账号？' : "是否创建EC账号？"}
          onConfirm={() => {
            if (record.ecId) {
              request.delete('/sms/system/sysUser/deleteEcUser', { id: record.id }).then((res: any) => {
                if (res.status == 'success') {
                  message.success('删除成功');
                  callbackRef();
                }
              });
            } else {
              request
                .post('/sms/system/sysUser/createEcUser', { id: record.id })
                .then((res: any) => {
                  if (res.status == 'success') {
                    message.success('创建成功');
                    callbackRef();
                  }
                });
            }

          }}
          okText="确定"
          cancelText="取消"
        >
          <Button type="primary" key={`btn-ec-${record.id}`} size="small" danger={record.ecId ? true : false} hidden={type == 1}>
            {record.ecId ? '删除EC' : '创建EC'}
          </Button>
        </Popconfirm>,
        <Popconfirm
          key={`${record.id}-rebuild`}
          title="是否重置密码？"
          onConfirm={() => {
            request.post('/sms/share/buildAccount').then((res: any) => {
              if (res.status == 'success') {
                message.success('重构成功');
                callbackRef();
              }
            });
          }}
          okText="重构"
          cancelText="取消"
        >
          <Button type="primary" key={`btn-rebuild-${record.id}`} size="small" danger hidden={type == 1}>
            重构法大大
          </Button>
        </Popconfirm>,
        <Popconfirm
          key={`${record.id}-delete`}
          title="是否确定删除？"
          onConfirm={() => {
            request.delete('/sms/system/sysUser', { id: record.id }).then((res: any) => {
              if (res.status == 'success') {
                message.success('删除成功');
                callbackRef();
              }
            });
          }}
          okText="删除"
          cancelText="取消"
        >
          <Button type="primary" key={`btn-delete-${record.id}`} size="small" danger hidden={type == 1}>
            删除
          </Button>
        </Popconfirm>,
      ],
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      hideInTable: !props?.params,
      render: (text, record, _, action) => [
        <Popconfirm
          key={`${record.id}-remove`}
          title="是否确定移除？"
          onConfirm={() => {
            request
              .post('/sms/system/sysUser', { groupId: '-1', id: record.id })
              .then((res: any) => {
                if (res.status == 'success') {
                  message.success('移除成功');
                  callbackRef();
                }
              });
          }}
          okText="移除"
          cancelText="取消"
        >
          <Button type="primary" key={`btn-remove-${record.id}`} size="small" danger>
            移除小组
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  const getContent = (key: string) => {
    let Dom = <span></span>
    if (key == '1') {
      Dom = (
        <ProTable<GithubIssueItem>
          columns={columns}
          actionRef={actionRef}
          cardBordered
          request={async (
            params: { name?: string; mobile?: string; current?: any; groupId?: number } = {},
            sort,
            filter,
          ) => {
            if (props?.params) params.groupId = props.params.id;
            const dataList: any = await request.get('/sms/system/sysUser', params);
            if (props?.params) {
              let L1: any = { userName: [], userId: [] }
              dataList.data.content.forEach((item: any) => {
                L1.userName.push(item.name);
                L1.userId.push({ id: item.id, name: item.name })
              })
              setPropsUser(L1)
            }
            return {
              data: dataList.data.content,
              success: dataList.success,
              total: dataList.data.totalElements,
            };
          }}
          rowKey="id"
          search={{
            labelWidth: 'auto',
          }}
          rowSelection={{
            onChange: (e, selectedRows) => {
              setselectedRowsList(selectedRows as []);
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
                    request.get('/sms/system/sysUser', { _isGetAll: true }).then((res) => {
                      if (res.status == 'success') {
                        DownTable(res.data.content, downObj, '员工信息', 'user');
                      }
                    });
                  }}
                >
                  导出全部数据
                </a>
                <a
                  onClick={() => {
                    // setcheckFalg(true);
                    DownTable(selectedRowsList, downObj, '员工信息', 'user');
                  }}
                >
                  导出选择数据
                </a>
              </Space>
            );
          }}
          dateFormatter="string"
          headerTitle="用户管理"
          toolBarRender={() => [
            <Button
              key='addUser'
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => {
                achievementFn(3)
              }}
              hidden={!props?.params}
            >
              添加用户
            </Button>,
            <Button
              key="addsbutton"
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => {
                setRenderData({ type: 'add' });
                setModalVisible(true);
              }}
            >
              新建
            </Button>,
          ]}
        />
      )
    }
    if (key == '2') {
      Dom = (
        <ProTable<GithubIssueItem>
          columns={columns2}
          actionRef={actionRef}
          cardBordered
          request={async (
            params: { name?: string; mobile?: string; current?: any; groupId?: number } = {},
            sort,
            filter,
          ) => {
            if (props?.params) params.groupId = props.params.id;
            const dataList: any = await request.get(
              '/sms/system/sysUser/getUserPermission',
              params,
            );

            dataList.data.content.forEach((item: any) => {
              const userNameRole: any[] = [];
              const project: any[] = [];
              if (item.userList) {
                item.userList.forEach((items: any) => {
                  userNameRole.push(items.name);
                });
              }
              if (item.projectList.length > 0) {
                item.projectList.forEach((items: any) => {
                  project.push(items.name);
                });
              }
              item.userNames = userNameRole.join(',');
              item.project = project.join(',');
            });
            return {
              data: dataList.data.content,
              success: dataList.success,
              total: dataList.data.totalElements,
            };
          }}
          rowKey="id"
          search={{
            labelWidth: 'auto',
          }}
          dateFormatter="string"
          headerTitle="用户管理"
          toolBarRender={() => [
            <Button
              key="chongbutton"
              icon={<RedoOutlined />}
              type="primary"
              onClick={() => {
                request.post('/sms/system/sysUserUser/reload').then((res) => {
                  if (res.status == 'success') {
                    message.success('重载成功');
                    callbackRef();
                  }
                });
              }}
            >
              重载授权人员
            </Button>,
            <Button
              key="addbutton"
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => {
                setRenderData({ type: 'add' });
                setModalVisible(true);
              }}
            >
              新建
            </Button>,
            // <Button
            //   key="buttona"
            //   icon={<DownloadOutlined />}
            //   type="primary"
            //   onClick={() => {
            //     setUploadVisible(true);
            //   }}
            // >
            //   批量导入
            // </Button>,
          ]}
        />
      )
    }
    if (key == '3') {
      Dom = (
        <div>
          <ProCard>
            <a
              onClick={async () => {
                achievementFn(1)
              }}
            >个人业绩展示</a>
            <div>{userList1.userName?.join(',')}</div>
            <a
              onClick={async () => {
                achievementFn(2)
              }}
            >部门负责人展示</a>
            <div>{userList2.userName?.join(',')}</div>
          </ProCard>
        </div>
      )
    }

    return Dom
  }


  return (
    <PageContainer
      onTabChange={(e) => {
        setTabListNuber(e);
        callbackRef();
      }}
      tabList={
        type == 0 ? [
          {
            tab: '用户管理',
            key: '1',
          },
          {
            tab: '权限管理',
            key: '2',
          },
          {
            tab: '业绩展示管理',
            key: '3'
          }
        ] : type == 1 ? [
          {
            tab: '用户管理',
            key: '1',
          }
        ] : []
      }
    >
      {
        getContent(TabListNuber)
      }
      {modalVisibleFalg && (
        <Modals
          setModalVisible={() => setModalVisible(false)}
          modalVisible={modalVisibleFalg}
          callbackRef={() => callbackRef()}
          renderData={renderData}
        />
      )}
      {userInfoFalg && (
        <UserInfo
          setModalVisible={() => setUserInfoFalg(false)}
          modalVisible={userInfoFalg}
          callbackRef={() => callbackRef()}
          renderData={renderData}
        />
      )}
      {CardVisible && (
        <UserManageCard
          CardVisible={CardVisible}
          CardContent={CardContent}
          callbackRef={() => callbackRef()}
          getUserList={() => getUserList()}
          setCardVisible={() => setCardVisible(false)}
          // setDepartment={(e: any) => setDepartment(e)}
          parentIdTree={parentIdTree}
          departments={department}
        />
      )}
      {UploadFalg && (
        <Upload
          setModalVisible={() => setUploadVisible(false)}
          modalVisible={UploadFalg}
          url={'/sms/system/sysUser/saveArray'}
          type="userManage"
          callbackRef={() => callbackRef()}
        />
      )}
      <ModalForm
        title="上传人员资料"
        // width={1000}
        visible={infoFileVisible}
        formRef={formRef}
        onLoad={() => {
        }}
        onFinish={async (form) => {
          if (!form.infoFile || form.infoFile.length == 0) message.error("请上传文件")
          else if (form.infoFile.length > 1) message.error("只能上传一个文件")
          else if (form.infoFile[0].response.data.indexOf(".docx") == -1) message.error("只能上传docx格式文件")
          else {
            request.post("/sms/system/sysUser", { id: renderData.id, infoFile: form.infoFile[0].response.data })
            callbackRef()
            setInfoFileVisible(false);
          }
        }}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            setInfoFileVisible(false);
          },
          maskClosable: false,
        }}
      >
        <UploadDragger
          // width={1100}
          name="infoFile"
          action="/sms/system/sysUser/upload"
          renderData={renderData}
          fileUrl={'/sms/system/sysUser/download'}
        />
      </ModalForm>
      <Modal
        width={1200}
        open={docxVisible}
        footer={null}
        onCancel={() => setDocxVisible(false)}
      >
        <div id="infoFileDocx"></div>
      </Modal>
    </PageContainer>
  );
};
