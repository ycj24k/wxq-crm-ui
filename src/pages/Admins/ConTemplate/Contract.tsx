import Tables from '@/components/Tables';
import { PageContainer } from '@ant-design/pro-layout';
import { ActionType, ProColumns } from '@ant-design/pro-table';
import Dictionaries from '@/services/util/dictionaries';
import moment from 'moment';
import request from '@/services/ant-design-pro/apiRequest';
import { useRef, useState } from 'react';
import ModelAdd from './ModelAdd';
import ModelAdds from './ModelAdds';
import ModelNewAdd from './ModelNewAdd'
import { Button, Image, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ImgUrl from '@/services/util/ImgUrl';
import ChargeIframe from '../AdminCharge/ChargeIframe';
import UpDownload from '@/services/util/UpDownload';
import { text } from 'express';
import { Typography } from 'antd';
type GithubIssueItem = {
  code: string;
  type: string;
  name: string;
  parameter: string;
  codeFile: string;
  updateTime: string;
  file: string;
  newFile: string;
  id: number;
};
export default (props: any) => {
  const { type = '', setCompanyId, onCancel, Users = false } = props;
  const [renderData, setRenderData] = useState<any>(null);
  const [InfoVisibleFalg, setInfoVisible] = useState<boolean>(false);
  const [InfoVisibleFalgs, setInfoVisibles] = useState<boolean>(false);
  const [isModalVisibles, setisModalVisibles] = useState<boolean>(false);
  const [imgSrc, setImgSrc] = useState();
  const actionRef = useRef<ActionType>();
  const callbackRef = () => {
    // @ts-ignore
    actionRef.current.reload();
  };
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: '模板名称',
      dataIndex: 'name',
    },
    {
      title: '模板字段',
      dataIndex: 'parameter',
      hideInTable: type !== '' || Users,
      search: false,
      colSpan: 2,
      ellipsis: true,
      tip: '过长会自动收缩',
      render: (text, record) => <Typography.Paragraph copyable={{ text: JSON.stringify(record.parameter) }}>
        {record.parameter ? record.parameter.length : 0}个参数
      </Typography.Paragraph>
    },
    {
      width: 80,
      search: false,
      hideInTable: type !== '' || Users,
      colSpan: 0,
      render: (text, record) => (
        <Button
          size="small"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setRenderData({ ...record, recordNumber: 0 });
            setInfoVisibles(true);
          }}
        >
          编辑
        </Button>
      ),
    },
    {
      title: '法大大编号',
      dataIndex: 'num',
      hideInTable: type !== '' || Users,
      search: false,
    },
    {
      title: '查看',
      search: false,
      render: (text, record) => (
        <a
          onClick={async () => {
            await ImgUrl('/sms/contract/conTemplate/download', record.id, record.file).then(
              (res: any) => {
                console.log('res', res);
                setImgSrc(res.pdfUrl[0]);
                setisModalVisibles(true);
              },
            );
          }}
        >
          查看
        </a>
      ),
    },
    {
      title: '备注',
      dataIndex: 'description',
      search: false,
      ellipsis: true,
      tip: '过长会自动收缩',
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
      dataIndex: 'options',
      search: false,
      render: (text, record) => [
        <Button
          key="eidt"
          type="primary"
          size="small"
          hidden={type === 'contract' || Users}
          style={{ marginRight: '15px' }}
          onClick={() => {
            setRenderData({ ...record, type: 'eidtTitle', renderDataNumber: 0 });
            setInfoVisible(true);
          }}
        >
          编辑合同名称
        </Button>,
        <Button
          key="upload"
          type="primary"
          size="small"
          hidden={type === 'contract'}
          style={{ marginRight: '15px' }}
          onClick={() => {
            if (record?.newFile) {
              UpDownload(
                '/sms/contract/conTemplate/download',
                record.id,
                record.newFile,
                `${record.newFile}`,
              );
            } else {
              message.error('该合同还没上传模板。');
            }
          }}
        >
          下载
        </Button>,
        <Popconfirm
          title="是否删除"
          okText="删除"
          cancelText="取消"
          key="deletes"
          onConfirm={() => {
            request.delete('/sms/contract/conTemplate', { id: record.id }).then((res: any) => {
              if (res.status == 'success') {
                message.success('操作成功!');
                callbackRef();
              }
            });
          }}
        >
          <Button
            hidden={type === 'contract' || Users}
            key="delete"
            type="primary"
            size="small"
            danger
          >
            删除
          </Button>
        </Popconfirm>,
        <Button
          hidden={type === ''}
          key="xuanze"
          type="primary"
          onClick={() => {
            setCompanyId(record);
            onCancel();
          }}
        >
          选择
        </Button>,
      ],
    },
  ];

  return (
    <>
      <Tables
        actionRef={actionRef}
        columns={columns}
        request={{ url: '/sms/contract/conTemplate' }}
        toolBarRender={[
          <Button
            key="button"
            icon={<PlusOutlined />}
            hidden={Users}
            type="primary"
            onClick={() => {
              //   if (parentId) {
              //     setRenderData({ typee: 'add', parentId });
              //   } else {
              //     setRenderData({ typee: 'add' });
              //   }
              setRenderData({ type: 'add' });
              setInfoVisible(true);
              //   setModalVisible(true);
            }}
          >
            上传合同模板
          </Button>,
        ]}
      />
      {InfoVisibleFalg && (
        <ModelAdd
          setModalVisible={() => setInfoVisible(false)}
          modalVisible={InfoVisibleFalg}
          renderData={renderData}
          callbackRef={() => callbackRef()}
        />
      )}
      {/* {InfoVisibleFalgs && (
        <ModelAdds
          setModalVisible={() => setInfoVisibles(false)}
          modalVisible={InfoVisibleFalgs}
          renderData={renderData}
          callbackRef={() => callbackRef()}
        />
      )} */}
      {InfoVisibleFalgs && (
        <ModelNewAdd
          setModalVisible={() => setInfoVisibles(false)}
          modalVisible={InfoVisibleFalgs}
          renderData={renderData}
          callbackRef={() => callbackRef()}
        />
      )}
      <ChargeIframe
        previewVisible={isModalVisibles}
        setPreviewVisible={() => setisModalVisibles(false)}
        previewImage={imgSrc}
      />
    </>
  );
};
