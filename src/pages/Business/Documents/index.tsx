import Tables from '@/components/Tables';
import { PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { ActionType, ProColumns } from '@ant-design/pro-table';
import { Button, message, Popconfirm } from 'antd';
import { useRef, useState } from 'react';
import Modal from './Modal';
import ImgUrl from '@/services/util/UpDownload';
import request from '@/services/ant-design-pro/apiRequest';
import moment from 'moment';
export default () => {
  const [ModalsVisible, setModalsVisible] = useState<boolean>(false);
  const [renderData, setRenderData] = useState<any>(null);
  const callbackRef = () => {
    // @ts-ignore
    actionRef.current.reload();
  };
  const actionRef = useRef<ActionType>();
  const columns: ProColumns<API.GithubIssueItem>[] = [
    {
      title: '文件名称',
      dataIndex: 'name',
      sorter: true,
    },
    {
      title: '说明',
      dataIndex: 'description',
      sorter: true,
    },
    {
      title: '上传时间',
      dataIndex: 'updateTime',
      sorter: true,
      valueType: 'dateRange',
      render: (text, record) => (
        <span>{record.updateTime}</span>
      ),
    },
    {
      title: '操作',
      render: (text, record) => [
        <Button
          type="primary"
          style={{ marginRight: '10px' }}
          size="small"
          onClick={() => {
            record.files.split(',').forEach((item, index) => {
              let fileName = record.name + item.slice(item.indexOf('.'));
              ImgUrl('/sms/business/bizFile/download', record.id, item, fileName);
            });
          }}
        >
          下载
        </Button>,
        <Button
          type="primary"
          style={{ marginRight: '10px' }}
          size="small"
          onClick={() => {
            setRenderData({ eidtType: 'eidt', ...record });
            setModalsVisible(true);
          }}
        >
          编辑
        </Button>,
        <Popconfirm
          key={record.id}
          title="是否删除？"
          onConfirm={() => {
            request.delete('/sms/business/bizFile/download', { id: record.id }).then((res: any) => {
              if (res.status == 'success') {
                message.success('删除成功!');
                callbackRef();
              }
            });
          }}
          okText="删除"
          cancelText="取消"
        >
          <Button
            type="primary"
            key="delete"
            size="small"
            style={{ marginTop: '10px' }}
            hidden={record.confirm === false}
            danger
          >
            删除
          </Button>
        </Popconfirm>,
      ],
    },
  ];
  const toolBarRender = [
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => {
        setRenderData({ eidtType: 'add', type: '2' });
        setModalsVisible(true);
      }}
    >
      新增下载文件
    </Button>,
  ];
  let sortList: any = {
    updateTime: 'desc',
  };
  return (
    <>
      <PageContainer>
        <Tables
          actionRef={actionRef}
          columns={columns}
          request={{ url: '/sms/business/bizFile', sortList: sortList, params: { type: 0 } }}
          toolBarRender={toolBarRender}
        />
      </PageContainer>

      {ModalsVisible && (
        <Modal
          renderData={renderData}
          ModalsVisible={ModalsVisible}
          setModalsVisible={() => setModalsVisible(false)}
          callbackRef={() => callbackRef()}
        />
      )}
    </>
  );
};
