import React, { useEffect, useRef, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Table, Space, Menu, Dropdown, Popconfirm, message, Spin } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable, { TableDropdown } from '@ant-design/pro-table';
import request from '@/services/ant-design-pro/apiRequest';
import ImgUrl from '@/services/util/ImgUrl';
import Dictionaries from '@/services/util/dictionaries';
import Tables from '@/components/Tables';
import StudentInfo from '../SignUpStudent/SignUpData';
import type { ProFormInstance} from '@ant-design/pro-form';
import ProForm, { ModalForm, ProFormDatePicker, ProFormDateTimePicker, ProFormRadio, ProFormTextArea } from '@ant-design/pro-form';
import moment from 'moment';

type GithubIssueItem = {
  content: string;
  id: number;
  studentUserId: number;
  studentName: string;
  type: number;
  updateBy: number;
  intention: number;
  createTime: string;
  project: string;
  userName: string;
};

export default (props: any) => {
  const { orderId } = props;
  const [SpingFalg, SetSpingFalg] = useState<boolean>(false);
  const [renderData, setRenderData] = useState<any>(null);
  const [InfoVisibleFalg, setInfoVisible] = useState<boolean>(false);
  const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
  const [Params, setParams] = useState<any>(orderId ? { orderId } : {});
  const actionRef = useRef<ActionType>();
  const url2 = '/sms/business/bizStudentUser';
  const formRef = useRef<ProFormInstance>();
  useEffect(() => {
    if (orderId) setParams({ orderId });
    callbackRef();
  }, [orderId]);

  const callbackRef = () => {
    // @ts-ignore
    actionRef.current.reload();
  };
  const Img = async (id: number, name: string) => {
    const url = await ImgUrl('/sms/business/bizOrderField/download', id, name);
    return url.imgUrl[0];
  };
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: '姓名',
      dataIndex: 'studentName',
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
                  .then((res: any) => {
                    const signUp = res.data.content.reverse();
                    console.log('signUp', signUp);
                    if (signUp.length > 0) {
                    }
                    signUp?.forEach(async (item: any) => {
                      if (item?.value?.indexOf('.') > 0) {
                        item.imgUrl = await Img(item.orderFieldId, item.value);
                      }
                    });
                    setRenderData({ ...ress.data.content[0], signUp: signUp, record: record });
                    setTimeout(() => {
                      setInfoVisible(true);
                      SetSpingFalg(false);
                    }, 200);
                  });
              });
            }}
          >
            {record.studentName}
          </a>
        </>
      ),
    },
    {
      title: '报考岗位',
      dataIndex: 'project',
      // search: false,
      key: 'project',
      sorter: true,
      valueType: 'cascader',
      fieldProps: {
        options: Dictionaries.getCascader('dict_reg_job'),
      },
      render: (text, record) => (
        <span key="project">
          {record.project &&
            [...new Set(record.project.split(','))].map((item: any, index: number) => {
              return (
                <span key={`project-${item}-${index}`}>
                  {Dictionaries.getCascaderName('dict_reg_job', item)} <br />
                </span>
              );
            })}
        </span>
      ),
    },

    {
      title: '服务内容',
      sorter: true,
      dataIndex: 'content',
    },
    {
      title: '服务时间',
      sorter: true,
      key: 'showTime',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      // sorter: true,
      hideInSearch: true,
    },
    {
      title: '服务老师',
      sorter: true,
      dataIndex: 'userName',
    },
    {
      title: '操作',
      hideInTable: true,
      valueType: 'option',
      key: 'option',
      render: (text, record, _, action) => (
        <>
          {/* <Button
            key="editable"
            type="primary"
            size="small"
            icon={<EditOutlined />}
            style={{ marginRight: '10px', marginBottom: '8px' }}
            onClick={() => {
              setRenderData({ ...record, types: 'edit', n: 0 });
              setModalVisible(true);
            }}
          >
            编辑
          </Button> */}
          <Popconfirm
            key={record.id}
            title="是否确定删除？"
            onConfirm={() => {
              request.delete('/sms/business/bizService', { id: record.id }).then((res: any) => {
                if (res.status == 'success') {
                  message.success('删除成功');
                  callbackRef();
                }
              });
            }}
            okText="删除"
            cancelText="取消"
          >
            <Button key="delete" size="small" type="primary" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];
  const sortList = {
    ['createTime']: 'desc',
  };

  return (
    <>
      <Spin spinning={SpingFalg}>
        <Tables
          columns={columns}
          scroll={{ x: 1200 }}
          actionRef={actionRef}
          cardBordered
          request={{ url: '/sms/business/bizService', sortList: sortList, params: Params }}
          rowKey="id"
          search={orderId ? false : true}
          toolBarRender={[
            <Button
              key="button-service-record"
              icon={<PlusOutlined />}
              type="primary"
              hidden={!orderId}
              onClick={() => {
                setModalVisible(true);
                setTimeout(() => {
                  formRef.current?.setFieldsValue({ createTime: moment() });
                }, 500)
              }}
            >
              添加服务记录
            </Button>,
          ]}
        />
        {InfoVisibleFalg && (
          <StudentInfo
            setModalVisible={() => setInfoVisible(false)}
            modalVisible={InfoVisibleFalg}
            renderData={renderData}
            callbackRef={() => callbackRef()}
          />
        )}
        <ModalForm
          visible={modalVisibleFalg}
          modalProps={{
            onCancel: () => setModalVisible(false),
          }}
          onFinish={async (values) => {
            request
              .postAll('/sms/business/bizOrder/editService/' + orderId, {
                createTime: values.createTime,
                serviceContent: values.content,
                serviceStatus: values.status,
              })
              .then((res) => {
                if (res.status == 'success') {
                  message.success('操作成功');
                  setModalVisible(false);
                  callbackRef();
                  // resolve(true);
                }
              });
          }}
          formRef={formRef}
        >
          <ProFormDateTimePicker
            name="createTime"
            fieldProps={{
              showTime: { format: 'HH:mm:ss' },
              format: 'YYYY-MM-DD HH:mm:ss'
            }}
            width="md"
            label="服务日期"
            rules={[{ required: true, message: '请填写服务日期' }]}
          />
          <ProFormRadio.Group
            name="status"
            label="服务状态"
            options={[
              {
                label: '未服务',
                value: 0,
              },
              {
                label: '服务中',
                value: 1,
              },
              {
                label: '已完结',
                value: 2,
              },
            ]}
            rules={[
              {
                required: true,
              },
            ]}
          />
          <ProFormTextArea
            label="服务内容"
            name="content"
            rules={[
              {
                required: true,
              },
            ]}
          />
        </ModalForm>
      </Spin>
    </>
  );
};
