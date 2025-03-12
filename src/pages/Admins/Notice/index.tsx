import { useRef, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, message, Tag, Modal, Descriptions, Upload, Popconfirm } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import request from '@/services/ant-design-pro/apiRequest';
import NewsModal from '@/components/RightContent/NewsModal';
import Addmodal from './addmodal';
import UpDownload from '@/services/util/UpDownload';
import moment from 'moment';
type GithubIssueItem = {
  url: string;
  uri: string;
  id: number;
  files: string;
  isError: boolean;
  isPass: boolean;
  createTime: string;
};

export default (props: any) => {
  const { type = false } = props;
  const actionRef = useRef<ActionType>();

  const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
  const [modalContent, setmodalContent] = useState<any>();
  const [isModalVisible, setisModalVisible] = useState<boolean>(false);
  const callbackRef = () => {
    // @ts-ignore
    actionRef.current.reload();
  };

  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: '通知标题',
      dataIndex: 'title',
      ellipsis: true,
      tip: '内容过长会自动收缩',
    },
    {
      title: '通知内容',
      dataIndex: 'content',
      ellipsis: true,
      tip: '内容过长会自动收缩',
    },
    {
      title: '确认人',
      dataIndex: 'confirms',
      search: false,
      hideInTable: type,
    },
    {
      title: '附件',
      dataIndex: 'files',
      ellipsis: true,
      tip: '内容过长会自动收缩',
      search: false,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: true,
      tip: '内容过长会自动收缩',
      search: false,
    },
    {
      title: '发送时间',
      key: 'createTime',
      dataIndex: 'createTime',
      valueType: 'dateRange',
      render: (text, record) => (
        <span>{record.createTime}</span>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: 260,
      render: (text, record, _, action) => [
        <Button
          key="view"
          type="primary"
          size="small"
          icon={<SearchOutlined />}
          onClick={() => {
            setisModalVisible(true);
            setmodalContent(record);
          }}
        >
          查看
        </Button>,
        <Button
          key="edit"
          type="primary"
          size="small"
          icon={<EditOutlined />}
          onClick={() => {
            // let arr: { uid: number; name: any; url?: unknown }[] = [];
            // record.files &&
            //   record.files.split(',').forEach(async (item: any, index: number) => {
            //     arr.push({
            //       uid: index,
            //       name: item,
            //       // url: await UpDownload('/sms/business/bizNotice/download', record.id, item),
            //     });
            //   });
            setModalVisible(true);
            setmodalContent({ type: 'edit', ...record });
          }}
        >
          编辑
        </Button>,
        <Popconfirm
          key={record.id}
          title="是否确定删除？"
          onConfirm={() => {
            request.delete('/sms/business/bizNotice', { id: record.id }).then((res: any) => {
              if (res.status == 'success') {
                message.success('删除成功');
                callbackRef();
              }
            });
          }}
          okText="删除"
          cancelText="取消"
        >
          <Button
            hidden={type}
            type="primary"
            key="delete"
            size="small"
            danger
            icon={<DeleteOutlined />}
          >
            删除
          </Button>
        </Popconfirm>,
      ],
    },
  ];
  return (
    <PageContainer>
      <ProTable<GithubIssueItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        // scroll={{ x: 1500 }}
        request={async (
          params: {
            current?: any;
            isError?: string | boolean;
            isPass?: string | boolean;
            page?: number;
          } = {},
          sort,
          filter,
        ) => {
          const dataList: any = await request.get('/sms/business/bizNotice', params);
          return {
            data: dataList.data.content,
            success: dataList.success,
            total: dataList.data.totalElements,
          };
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
          collapsed: false,
        }}
        // form={{
        //   // 由于配置了 transform，提交的参与与定义的不同这里需要转化一下
        //   syncToUrl: (values, type) => {
        //     if (type === 'get') {
        //       return {
        //         ...values,
        //         created_at: [values.startTime, values.endTime],
        //       };
        //     }
        //     return values;
        //   },
        // }}
        pagination={{
          pageSize: 10,
        }}
        dateFormatter="string"
        headerTitle="通知管理"
        toolBarRender={() => [
          <Button
            key="button"
            hidden={type}
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              // setRenderData({ type: 'order', orderNumber: 0 });
              setmodalContent({ type: 'add' });
              setModalVisible(true);
            }}
          >
            新建
          </Button>,
        ]}
      />
      {modalVisibleFalg && (
        <Addmodal
          modalVisibleFalg={modalVisibleFalg}
          setModalVisible={() => setModalVisible(false)}
          modalContent={modalContent}
          callbackRef={() => callbackRef()}
        />
      )}

      {isModalVisible && (
        <NewsModal
          isModalVisible={isModalVisible}
          setisModalVisible={() => {
            setisModalVisible(false);
          }}
          modalContent={modalContent}
          callbackRef={() => callbackRef()}
        />
      )}
    </PageContainer>
  );
};
