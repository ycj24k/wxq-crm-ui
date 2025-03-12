import Tables from '@/components/Tables';
import { PageContainer } from '@ant-design/pro-layout';
import { ActionType, ProColumns } from '@ant-design/pro-table';
import Dictionaries from '@/services/util/dictionaries';
import moment from 'moment';
import request from '@/services/ant-design-pro/apiRequest';
import { useRef, useState } from 'react';
import StudentInfo from '@/pages/Admins/StudentManage/studentInfo';
type GithubIssueItem = {
  studentName: string;
  type: string;
  userName: string;
  createTime: string;
  source: string;
  project: string;
  creatorName: string;
  studentId: number;
  studentUserId: number;
};
export default (props: any) => {
  const { studentUserId = null } = props;
  console.log('props', props);

  const [renderData, setRenderData] = useState<any>(null);
  const [InfoVisibleFalg, setInfoVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const callbackRef = () => {
    // @ts-ignore
    actionRef.current.reload();
  };
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: '学员/企业',
      dataIndex: 'studentName',
      render: (text, record) => (
        <a
          onClick={() => {
            request
              .get('/sms/business/bizStudentUser', { id: record.studentUserId })
              .then((res: any) => {
                setRenderData({ ...res.data.content[0] });
                setInfoVisible(true);
              });
          }}
        >
          {record.studentName}
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
    {
      title: '资源类型',
      dataIndex: 'type',
      valueType: 'select',
      filters: true,
      filterMultiple: false,
      valueEnum: Dictionaries.getSearch('circulationType'),
      render: (text, record) => <span>{Dictionaries.getName('circulationType', record.type)}</span>,
    },
    {
      title: '客户来源',
      dataIndex: 'source',
      valueType: 'select',
      valueEnum: Dictionaries.getSearch('dict_source'),
      render: (text, record) => <span>{Dictionaries.getName('dict_source', record.source)}</span>,
    },
    {
      title: '领取人',
      dataIndex: 'userName',
    },
    {
      title: '领取时间',
      key: 'createTime',
      sorter: true,
      dataIndex: 'createTime',
      valueType: 'dateRange',
      render: (text, record) => (
        <span>{record.createTime}</span>
      ),
    },
    {
      title: '创建人',
      dataIndex: 'creatorName',
    },
  ];
  let params: any = {};
  if (studentUserId) params.studentUserId = studentUserId;
  return (
    <>
      <Tables
        actionRef={actionRef}
        columns={columns}
        request={{ url: '/sms/business/bizReceive', params: params }}
      />
      {renderData && (
        <StudentInfo
          mobileHide={true}
          setModalVisible={() => setInfoVisible(false)}
          modalVisible={InfoVisibleFalg}
          renderData={renderData}
          callbackRef={() => callbackRef()}
        />
      )}
    </>
  );
};
