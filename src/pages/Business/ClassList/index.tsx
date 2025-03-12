import Tables from '@/components/Tables';
import { PageContainer } from '@ant-design/pro-layout';
import { ActionType, ProColumns } from '@ant-design/pro-table';
import Dictionaries from '@/services/util/dictionaries';
import moment from 'moment';
import request from '@/services/ant-design-pro/apiRequest';
import { useEffect, useRef, useState } from 'react';
import { Button, message, Modal, Popconfirm, Space, Table } from 'antd';
import {
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons';
import MessageModal from './MessageModal';
import WxMessage from './WxMessage';
import Upload from '@/services/util/upload';
import Modals from './Modal';
import Plan from './Plan';
import ClassInfo from './ClassInfo';
import SignUpStudent from '../SignUpStudent/index';
import ClassMessageModal from './ClassMessageModal';
import CallLogs from './CallLogs'
import e from 'express';
type GithubIssueItem = {
  name: string;
  classType: string;
  classYear: string;
  createTime: string;
  examStartTime: string;
  examEndTime: string;
  examType: string;
  project: string;
  creatorName: string;
  parentName: string;
  id: number;
  parentId: number;
};
export default (props: any = null) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [MessageVisible, setMessageVisible] = useState(false);
  const [MessageModalVisible, setMessageModalVisible] = useState(false);
  const [WXMessageVisible, setWXMessageVisible] = useState(false);
  const [modalInfo, setModalInfo] = useState(false);
  const [signUpFalg, setSignUoFalg] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [renderData, setRenderData] = useState<any>();
  const [ClassId, setClassId] = useState<number>();
  const [UploadFalgs, setUploadVisibles] = useState<boolean>(false);
  const [params, setparams] = useState<any>({});
  const [UploadUrl, setUploadurl] = useState<string>('')
  const [upType, setupType] = useState<string>('')
  const [modalPlanVisible, setModalPlanVisible] = useState<boolean>(false);
  const [modalCallVisible, setModalCallVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const { renderDatas, setClassFalg, callbackRefs, selectedIds, setClassRef } = props;
  // useEffect(() => {
  //   if (!renderDatas) return;
  //   setparams({
  //     project: renderDatas.project,
  //   });
  //   callbackRef();
  // }, [props]);
  const callbackRef = () => {
    // @ts-ignore
    actionRef.current.reload();
  };
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: '班级名称',
      dataIndex: 'name',
    },
    {
      title: '岗位名称',
      dataIndex: 'project',
      key: 'project',
      valueType: 'cascader',
      fieldProps: {
        options: Dictionaries.getCascader('dict_reg_job'),
      },
      render: (text, record) => <>{Dictionaries.getCascaderName('dict_reg_job', record.project)}</>,
    },
    {
      title: '班级人数',
      dataIndex: 'quantity',
    },
    {
      title: '考试开始时间',
      key: 'examStartTime',
      sorter: true,
      dataIndex: 'examStartTime',
      valueType: 'dateRange',
      render: (text, record) => (
        <span>{record.examStartTime}</span>
      ),
    },
    {
      title: '考试结束时间',
      key: 'examEndTime',
      sorter: true,
      dataIndex: 'examEndTime',
      valueType: 'dateRange',
      render: (text, record) => (
        <span>{record.examEndTime}</span>
      ),
    },
    {
      title: '备注',
      dataIndex: 'description',
      search: false,
      ellipsis: true,
      tip: '备注过长会自动收缩',
    },
    {
      title: '操作',
      key: 'optins',
      width: 320,
      render: (text, record) => (
        <>
          <div hidden={renderDatas || setClassRef != null}>
            <Space>
              <a
                key="editable"
                onClick={() => {
                  setRenderData({ ...record, typee: 'eidt' });
                  setModalVisible(true);
                }}>
                编辑
              </a>
              <a
                key="look"
                onClick={() => {
                  setClassId(record.id);
                  setSignUoFalg(true);
                }}
              >查看
              </a>
              <a
                key="phone"
                onClick={() => {
                  setRenderData(record);
                  setModalCallVisible(true);
                }}
              >通话记录
              </a>
              <a
                key="plan"
                onClick={() => {
                  setRenderData(record);
                  setModalPlanVisible(true);
                }}
              >学习计划
              </a>
              <a
                key="message"
                onClick={() => {
                  setRenderData({ messageType: 'class', ...record })
                  setMessageVisible(true)
                }}
              >
                发送短信
              </a>
              <a
                key="wxmessage"
                onClick={() => {
                  setRenderData({ messageType: 'class', ...record })
                  setWXMessageVisible(true)
                }}
              >
                订阅消息
              </a>
              <a
                key="wxmessageLooks"
                onClick={() => {
                  setRenderData({ id: record.id })
                  setMessageModalVisible(true)
                }}
              >
                查看消息
              </a>
              <a
                key="addStudent"
                onClick={() => {
                  setUploadurl('/sms/business/bizOrder/editClass?classId=' + record.id)
                  setupType('post2')
                  setUploadVisibles(true)
                }}
              >
                批量加入学员
              </a>
              <Popconfirm
                key="deletes"
                title="是否删除班级?"
                onConfirm={() => {
                  request.delete('/sms/business/bizClass', { id: record.id }).then((res) => {
                    if (res.status == 'success') {
                      message.success('操作成功!');
                    }
                  });
                  callbackRef();
                }}
                okText="删除"
                cancelText="取消"
              >
                <a style={{ color: 'red' }}>删除班级</a>
              </Popconfirm>
            </Space>
          </div>

          <div hidden={!renderDatas && !setClassRef}>
            <Button
              key="click"
              size="small"
              style={{ marginRight: '15px', marginBottom: '8px' }}
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                if (setClassRef) {
                  // Object.assign(classRef, record)
                  setClassRef(record)
                  setClassFalg();
                } else if (!selectedIds || selectedIds.length == 0) {
                  request
                    .post('/sms/business/bizOrder', {
                      classId: record.id,
                      id: renderDatas.id,
                    })
                    .then((res) => {
                      if (res.status == 'success') {
                        message.success('提交成功');
                        setClassFalg();
                        callbackRefs();
                      }
                    });
                } else {
                  let array: any = [];
                  selectedIds.forEach((item: any) => {
                    array.push({ classId: record.id, id: item });
                  });
                  request
                    .postAll('/sms/business/bizOrder/saveArray', { array: array })
                    .then((res) => {
                      if (res.status == 'success') {
                        message.success('提交成功');
                        setClassFalg();
                        callbackRefs();
                      }
                    });
                }
              }}
            >
              选择
            </Button>
          </div>
        </>
      ),
    },
  ];
  const donwLoad = (id: number, type: number) => {
    let tokenName: any = sessionStorage.getItem('tokenName');
    let tokenValue = sessionStorage.getItem('tokenValue');
    let obj = {};
    obj[tokenName] = tokenValue;
    fetch('/sms/business/bizOrderField/export/fileByClassId?classId=' + id + '&type=' + type, {
      method: 'POST',
      headers: { ...obj },
    }).then((res: any) => {
      console.log('res', res);

      res.blob().then((ress: any) => {
        let blobUrl = window.URL.createObjectURL(ress);
        const a = document.createElement('a'); //获取a标签元素
        document.body.appendChild(a);
        let filename = '附件'; //设置文件名称
        a.href = blobUrl; //设置a标签路径
        a.download = filename;
        a.target = '_blank';
        a.click();
        a.remove();
      });
    });
  };
  const subscription = () => {

  }
  const sendMessage = () => {
    setMessageVisible(true)
  }
  let sortList = {
    ['createTime']: 'desc',
  };
  return (
    <>
      <PageContainer>
        <Tables
          actionRef={actionRef}
          columns={columns}
          className="ClassList"
          request={{ url: '/sms/business/bizClass', params, sortList }}
          rowSelection={{
            // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
            // 注释该行则默认不显示下拉选项
            selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
            onChange: (e, selectedRows) => {
              setSelectedRows(e);
            },
          }}
          tableAlertOptionRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => {
            return (
              <Space>
                <span>
                  <a style={{ marginInlineStart: 8 }} onClick={onCleanSelected}>
                    取消选择
                  </a>
                </span>
                <a
                  onClick={() => {
                    sendMessage()
                  }}
                >
                  发送短信消息
                </a>
                <a
                  onClick={() => {
                    setRenderData({ messageType: 'class', id: selectedRowKeys.join(',') })
                    setWXMessageVisible(true)
                  }}
                >
                  发送订阅消息
                </a>
              </Space>
            );
          }}
          toolBarRender={[
            // <a download="批量加入班级模板" href="./template/批量修改班级.xlsx" key="ordera">
            //   下载批量加入班级模板
            // </a>,
            <Button
              key="button"
              icon={<DownloadOutlined />}
              hidden={renderDatas}
              type="primary"
              onClick={() => {
                console.log(selectedRows);
                if (selectedRows.length != 1) {
                  message.error('请选择一个班级进行导出操作！');
                  return;
                }
                donwLoad(selectedRows[0], 0);
              }}
            >
              导出报名资料
            </Button>,
            <Button
              key="button"
              hidden={renderDatas}
              icon={<DownloadOutlined />}
              type="primary"
              onClick={() => {
                console.log(selectedRows);
                if (selectedRows.length != 1) {
                  message.error('请选择一个班级进行导出操作！');
                  return;
                }
                donwLoad(selectedRows[0], 1);
              }}
            >
              导出考试资料
            </Button>,
            <Button
              key="button"
              icon={<UserDeleteOutlined />}
              type="primary"
              danger
              onClick={() => {
                request
                  .post('/sms/business/bizOrder', {
                    classId: '-1',
                    id: renderDatas.id,
                  })
                  .then((res) => {
                    if (res.status == 'success') {
                      message.success('移出成功');
                      setClassFalg(false);
                      callbackRefs();
                    }
                  });
              }}
            >
              移出班级
            </Button>,
            <Button
              key="button"
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => {
                setUploadurl('/sms/business/bizClass/saveArray')
                setupType('')
                setUploadVisibles(true);
              }}
            >
              批量新建班级
            </Button>,
            <Button
              key="button"
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => {
                setRenderData({ typee: 'add' });
                setModalVisible(true);
              }}
            >
              新建班级
            </Button>,
          ]}
        />
        <Modal
          open={signUpFalg}
          width={1200}
          title="班级详情"
          onCancel={() => setSignUoFalg(false)}
          onOk={() => setSignUoFalg(false)}
        >
          <SignUpStudent classId={ClassId} />
        </Modal>
        {modalVisible && (
          <Modals
            modalVisible={modalVisible}
            setModalVisible={() => setModalVisible(false)}
            callbackRef={() => callbackRef()}
            renderData={renderData}
          />
        )}
        {modalPlanVisible && (
          <Plan
            modalVisible={modalPlanVisible}
            setModalVisible={() => setModalPlanVisible(false)}
            callbackRef={() => callbackRef()}
            renderData={renderData}
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
        {MessageModalVisible && (
          <ClassMessageModal
            modalVisible={MessageModalVisible}
            setModalVisible={() => setMessageModalVisible(false)}
            callbackRef={() => callbackRef()}
            renderData={renderData}
          />
        )}
        {modalCallVisible && (
          <CallLogs
            modalVisible={modalCallVisible}
            setModalVisible={() => setModalCallVisible(false)}
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
        {modalInfo && (
          <ClassInfo
            modalVisible={modalInfo}
            setModalVisible={() => setModalInfo(false)}
            callbackRef={() => callbackRef()}
            renderData={renderData}
          />
        )}
        {UploadFalgs && (
          <Upload
            setModalVisible={() => setUploadVisibles(false)}
            modalVisible={UploadFalgs}
            url={UploadUrl}
            upType={upType}
            propsData={{}}
            type='classlist'
            callbackRef={() => callbackRef()}
          />
        )}
      </PageContainer>
    </>
  );
};
