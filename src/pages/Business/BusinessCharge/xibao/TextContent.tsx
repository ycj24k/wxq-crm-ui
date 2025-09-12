import React, { useRef, useState } from 'react';
import { Button, message, Modal, Popconfirm, Switch } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import Tables from '@/components/Tables';
import request from '@/services/ant-design-pro/apiRequest';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import Dictionaries from '@/services/util/dictionaries';
import AddTextConten from './addText';
type GithubIssueItem = {
  name: string;
  id: number;
  type: string;
  isDel?: number;
  code: string;
  isSend?: boolean;
};
type textContent = {
  content?: string;
  types?: string;
};
export default (props: any) => {
  const actionRefClass = useRef<ActionType>();
  const { modalVisible, setModalVisible, callbackRef } = props;
  const [addTextVisible, setaddTextVisible] = useState<boolean>(false);
  const [renderData, setrenderData] = useState<textContent>({});
  const callbackRefs = () => {
    // @ts-ignore
    actionRefClass.current.reload();
  };
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: '喜报内容',
      dataIndex: 'content',
      sorter: true,
      //   readonly: true,
    },
    // {
    //   title: '文本类型',
    //   dataIndex: 'type',
    //   search: false,
    //   sorter: true,
    //   render: (text, record) => <span>{Dictionaries.getName('textType', record.type)}</span>,
    // },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      valueType: 'option',
      render: (text, record, _, action) => (
        <>
          <Button
            key="editable"
            type="primary"
            size="small"
            icon={<EditOutlined />}
            className="tablebut"
            onClick={() => {
              setrenderData({ types: 'eidt', ...record });
              setaddTextVisible(true);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            key={record.id}
            title="是否确定删除？"
            onConfirm={() => {
              request.delete('/sms/business/bizText', { id: record.id }).then((res: any) => {
                if (res.status == 'success') {
                  message.success('删除成功');
                  callbackRefs();
                }
              });
            }}
            okText="删除"
            cancelText="取消"
          >
            <Button type="primary" key="delete" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];
  return (
    <Modal
      title="设置喜报语句"
      width={1200}
      open={modalVisible}
      onOk={() => setModalVisible()}
      onCancel={() => setModalVisible()}
    >
      <Tables
        columns={columns}
        actionRef={actionRefClass}
        request={{
          url: '/sms/business/bizText',
          params: { isGetAll: true },
        }}
        toolBarRender={[
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setrenderData({ types: 'add' });
              setaddTextVisible(true);
            }}
          >
            添加语句
          </Button>,
        ]}
      />
      {addTextVisible && (
        <AddTextConten
          modalVisible={addTextVisible}
          setModalVisible={() => setaddTextVisible(false)}
          renderData={renderData}
          callbackRef={() => callbackRefs()}
        />
      )}
    </Modal>
  );
};
