import Tables from '@/components/Tables';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import Dictionaries from '@/services/util/dictionaries';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import GroupsModal from './GroupsModal';
import GroupsUser from './GroupsUser';
export default (props: any) => {
  const { falg = true, setGrouptment, setCardVisible } = props;
  const actionRef = useRef<ActionType>();
  const [renderData, setRenderData] = useState<object>({});
  const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
  const [userVisibleFalg, setUserVisible] = useState<boolean>(false);
  const callbackRef = () => {
    setTimeout(() => {
      // @ts-ignore
      actionRef?.current?.reload();
      // contentTree();
    }, 100);
  };
  //   useEffect(() => {
  //     console.log('123', Dictionaries.getDepartmentName()[0]);
  //   }, []);
  const columns: ProColumns<API.GithubIssueItem>[] = [
    {
      title: '名字',
      dataIndex: 'name',
      // width: 100
    },
    {
      title: '部门',
      dataIndex: 'departmentId',
      render: (text, record) => (
        <span>{Dictionaries.getDepartmentName(record.departmentId)[0]}</span>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      // width: 100
    },
    {
      title: '操作',
      render: (text, record) => [
        <Button
          type="primary"
          size="small"
          style={{ marginRight: '10px' }}
          hidden={falg}
          onClick={(e) => {
            setGrouptment({ name: record.name, id: record.id });
            setCardVisible();
          }}
        >
          选择
        </Button>,
        <Button
          type="primary"
          size="small"
          style={{ marginRight: '10px' }}
          onClick={(e) => {
            setRenderData(record);
            setUserVisible(true);
          }}
        >
          查看
        </Button>,
        <Button
          type="primary"
          size="small"
          onClick={(e) => {
            setRenderData({ ...record, type: 'eidt' });
            setModalVisible(true);
          }}
        >
          编辑
        </Button>,
      ],
    },
  ];
  const toolBarRender = [
    <Button
      key="button"
      icon={<PlusOutlined />}
      type="primary"
      onClick={() => {
        setRenderData({ type: 'add' });
        setModalVisible(true);
      }}
    >
      新建
    </Button>,
  ];
  return (
    <>
      <Tables
        request={{ url: '/sms/system/sysGroup' }}
        columns={columns}
        toolBarRender={toolBarRender}
        actionRef={actionRef}
      />
      {modalVisibleFalg && (
        <GroupsModal
          modalVisible={modalVisibleFalg}
          setModalVisible={() => setModalVisible(false)}
          callbackRef={() => callbackRef()}
          renderData={renderData}
        />
      )}
      {userVisibleFalg && (
        <GroupsUser
          CardVisible={userVisibleFalg}
          setCardVisible={() => setUserVisible(false)}
          callbackRef={() => callbackRef()}
          renderData={renderData}
        />
      )}
    </>
  );
};
