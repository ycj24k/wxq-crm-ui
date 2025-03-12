import Tables from '@/components/Tables';
import { PageContainer } from '@ant-design/pro-layout';
import { ActionType, ProColumns } from '@ant-design/pro-table';
import Dictionaries from '@/services/util/dictionaries';
import moment from 'moment';
import request from '@/services/ant-design-pro/apiRequest';
import { useEffect, useRef, useState } from 'react';
import StudentInfo from '@/pages/Admins/StudentManage/studentInfo';
import { Button, message, Popconfirm } from 'antd';
import { PlusOutlined, UserAddOutlined } from '@ant-design/icons';
import StudentModals from '@/pages/Admins/AdminOrder/Modals';
type GithubIssueItem = {
  name: string;
  type: string;
  userName: string;
  createTime: string;
  source: string;
  project: string;
  creatorName: string;
  parentName: string;
  id: number;
  parentId: number;
};
export default () => {
  const [renderData, setRenderData] = useState<any>(null);
  const [InfoVisibleFalg, setInfoVisible] = useState<boolean>(false);
  const [StudentModalsVisible, setStudentModalsVisible] = useState(false);
  const [Student, setStudentId] = useState<any>(null);
  const [TabListNuber, setTabListNuber] = useState<any>(1);
  const actionRef = useRef<ActionType>();
  const callbackRef = () => {
    // @ts-ignore
    actionRef.current.reload();
  };
  useEffect(() => {
    if (Student) {
      let arr: any = Student;
      let arrId: any = [];
      if (!(Student?.constructor == Array)) {
        arr = [Student];
      }
      arr?.forEach((item: any) => {
        arrId.push(item.id);
      });
      request
        .post('/sms/business/bizStudent/addBlacklist', { ids: arrId.join(',') })
        .then((res: any) => {
          if (res.status == 'success') {
            message.success('操作成功!');
            callbackRef();
          }
        });
    }
  }, [Student]);
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: '学员/企业',
      dataIndex: 'name',
      render: (text, record) => (
        <a
          onClick={() => {
            request
              .get('/sms/business/bizStudent/getBlacklist', { id: record.id })
              .then((res: any) => {
                setRenderData({ ...res.data.content[0] });
                setInfoVisible(true);
              });
          }}
        >
          {record.name}
        </a>
      ),
    },
    {
      title: '所属团组',
      dataIndex: 'parentName',
      render: (text, record) => (
        <a
          onClick={() => {
            request.get('/sms/business/bizStudent', { id: record.parentId }).then((res: any) => {
              setRenderData({ ...res.data.content[0] });
              setInfoVisible(true);
            });
          }}
        >
          {record?.parentName ? record.parentName : ''}
        </a>
      ),
    },
    {
      title: '咨询岗位',
      dataIndex: 'project',
      // search: false,
      key: 'project',
      valueType: 'cascader',
      fieldProps: {
        options: Dictionaries.getCascader('dict_reg_job'),
      },
      render: (text, record) => (
        <span>{Dictionaries.getCascaderName('dict_reg_job', record.project)}</span>
      ),
    },
    // {
    //   title: '资源类型',
    //   dataIndex: 'type',
    //   valueType: 'select',
    //   filters: true,
    //   filterMultiple: false,
    //   valueEnum: Dictionaries.getSearch('circulationType'),
    //   render: (text, record) => <span>{Dictionaries.getName('circulationType', record.type)}</span>,
    // },
    {
      title: '客户来源',
      dataIndex: 'source',
      valueType: 'select',
      valueEnum: Dictionaries.getSearch('dict_source'),
      render: (text, record) => <span>{Dictionaries.getName('dict_source', record.source)}</span>,
    },
    {
      title: '所属老师',
      dataIndex: 'userName',
    },
    {
      title: '创建时间',
      key: 'createTime',
      sorter: true,
      dataIndex: 'createTime',
      valueType: 'dateRange',
      render: (text, record) => (
        <span>{record.createTime}</span>
      ),
    },
    {
      title: '操作',
      key: 'optins',
      hideInTable: TabListNuber == 2,
      render: (text, record) => (
        <>
          <Popconfirm
            key={record.id}
            title="是否移除该学员"
            onConfirm={() => {
              request
                .post('/sms/business/bizStudent/removeBlacklist', { ids: record.id })
                .then((res: any) => {
                  if (res.status === 'success') {
                    message.success('操作成功!');
                    callbackRef();
                  }
                });
            }}
            okText="移除"
            cancelText="取消"
          >
            <Button type="primary" size="small" key="look" icon={<UserAddOutlined />}>
              移除黑名单
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];
  let sortList = {
    ['updateTime']: 'desc',
  };
  return (
    <>
      <PageContainer

        onTabChange={(e) => {
          setTabListNuber(e);
          callbackRef();
        }}
        tabList={[
          {
            tab: '黑名单',
            key: '1',
          },
          {
            tab: '白名单',
            key: '2',
          },
        ]}
      >
        {
          TabListNuber == 1 ? <Tables
            actionRef={actionRef}
            columns={columns}
            request={{ url: '/sms/business/bizStudent/getBlacklist', sortList }}
            toolBarRender={[
              <Button
                key="button"
                icon={<PlusOutlined />}
                type="primary"
                onClick={() => {
                  setStudentModalsVisible(true);
                }}
              >
                添加黑名单
              </Button>,
            ]}
          /> : <Tables
            actionRef={actionRef}
            columns={columns}
            request={{ url: '/sms/business/bizStudentUser', params: { isInWhitelist: true }, sortList }}
          />
        }

      </PageContainer>
      {renderData && (
        <StudentInfo
          setModalVisible={() => setInfoVisible(false)}
          modalVisible={InfoVisibleFalg}
          renderData={renderData}
          callbackRef={() => callbackRef()}
        />
      )}
      {StudentModalsVisible && (
        <StudentModals
          type={0}
          modalVisible={StudentModalsVisible}
          setModalVisible={() => setStudentModalsVisible(false)}
          renderData={{ type: 'BlacklistStudent' }}
          setStudentId={(e: any) => {
            setStudentId(e);
          }}
        />
      )}
    </>
  );
};
