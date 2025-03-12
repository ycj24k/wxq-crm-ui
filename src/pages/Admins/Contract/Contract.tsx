import Tables from '@/components/Tables';
import { PageContainer } from '@ant-design/pro-layout';
import { ActionType, ProColumns } from '@ant-design/pro-table';
import Dictionaries from '@/services/util/dictionaries';
import moment from 'moment';
import request from '@/services/ant-design-pro/apiRequest';
import { useRef, useState } from 'react';
import ModelAdd from './ModelAdd';
import { Button, Image, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ImgUrl from '@/services/util/ImgUrl';
import ChargeIframe from '../AdminCharge/ChargeIframe';
import { text } from 'express';
type GithubIssueItem = {
  code: string;
  type: string;
  name: string;
  codeFile: string;
  powerAttorneyFile: string;
  sealFile: string;
  autoSignUrl: string;
  address: string;
  mobile2: string;
  bank: string;
  account: string;
  userId: number;
  id: number;
  isVerify: boolean;
};
export default (props: any) => {
  const { type = '', setCompanyId, onCancel, admin = true } = props;
  const [renderData, setRenderData] = useState<any>(null);
  const [InfoVisibleFalg, setInfoVisible] = useState<boolean>(false);
  const [isModalVisibles, setisModalVisibles] = useState<boolean>(false);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [previewImage, setpreviewImage] = useState<boolean>(false);
  const [imgSrc, setImgSrc] = useState();
  const actionRef = useRef<ActionType>();
  const callbackRef = () => {
    // @ts-ignore
    actionRef.current.reload();
  };
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: '公司名称',
      dataIndex: 'name',
    },
    {
      title: '信用代码',
      dataIndex: 'code',
      // search: false,
      hideInTable: type === 'contract' || !admin,
    },
    {
      title: '开户名',
      dataIndex: 'accountName',
      search: false,
    },
    {
      title: '开户行',
      dataIndex: 'bank',
      search: false,
    },
    {
      title: '银行账号',
      dataIndex: 'account',
      search: false,
    },
    {
      title: '银行行号',
      dataIndex: 'bankNum',
      search: false,
    },

    {
      title: '备注',
      dataIndex: 'description',
      search: false,
      hideInTable: !admin,
    },
    {
      title: '授权',
      dataIndex: 'autoSignUrl',
      search: false,
      hideInTable: !admin,
      width: 80,
      render: (text, record) => (
        <>
          {record.autoSignUrl ? (
            <span>已授权</span>
          ) : (
            <span
              style={{ color: 'red', textDecoration: 'underline', cursor: 'pointer' }}
              onClick={async () => {
                const urls = (
                  await request.post('/sms/contract/conCompany/getAuthOfAutoSign', {
                    id: record.id,
                  })
                ).data;
                setpreviewImage(urls);
                setPreviewVisible(true);
              }}
            >
              未授权
            </span>
          )}
        </>
      ),
    },
    {
      title: '认证',
      dataIndex: 'isVerify',
      search: false,
      hideInTable: !admin,
      width: 80,
      render: (text, record) => (
        <>
          {record.isVerify ? (
            <span>已认证</span>
          ) : (
            <span
              style={{ color: 'red', textDecoration: 'underline', cursor: 'pointer' }}
              onClick={async () => {
                const urls = (
                  await request.post('/sms/contract/conCompany/verify', { id: record.id })
                ).data;
                setpreviewImage(urls);
                setPreviewVisible(true);
              }}
            >
              未认证
            </span>
          )}
        </>
      ),
    },
    {
      title: '统一社会信用码电子版',
      dataIndex: 'codeFile',
      search: false,

      hideInTable: type === 'contract' || !admin,
      render: (text, record) => (
        <a
          style={{ display: record.codeFile ? 'block' : 'none' }}
          onClick={async () => {
            await ImgUrl('/sms/contract/conCompany/download', record.id, record.codeFile).then(
              (res: any) => {
                console.log('res', res);
                setImgSrc(res.imgUrl[0]);
                setisModalVisibles(true);
              },
            );
          }}
        >
          查看
        </a>
      ),
    },
    // {
    //   title: '授权委托书电子版',
    //   dataIndex: 'powerAttorneyFile',
    //   search: false,
    //   hideInTable: type === 'contract',
    //   render: (text, record) => (
    //     <a
    //       style={{ display: record.powerAttorneyFile ? 'block' : 'none' }}
    //       onClick={async () => {
    //         await ImgUrl(
    //           '/sms/contract/conCompany/download',
    //           record.id,
    //           record.powerAttorneyFile,
    //         ).then((res: any) => {
    //           console.log('res', res);
    //           setImgSrc(res.imgUrl[0]);
    //           setisModalVisibles(true);
    //         });
    //       }}
    //     >
    //       查看
    //     </a>
    //   ),
    // },
    {
      title: '财务印章',
      dataIndex: 'sealFile',
      search: false,
      hideInTable: type === 'contract' || !admin,
      render: (text, record) => (
        <a
          style={{ display: record.sealFile ? 'block' : 'none' }}
          onClick={async () => {
            if (record.sealFile) {
              await ImgUrl('/sms/contract/conCompany/download', record.id, record.sealFile).then(
                (res: any) => {
                  console.log('res', res);
                  setImgSrc(res.imgUrl[0]);
                  setisModalVisibles(true);
                },
              );
            } else {
              message.error('尚未上传财务印章！', 5);
            }
          }}
        >
          查看
        </a>
      ),
    },
    {
      title: '税票抬头信息',
      search: false,
      key: 'taitou',
      hideInTable: admin,
      copyable: true,
      render: (text, record) => (
        <div>
          <div>名称：{record.name}</div>
          <div>纳税人识别号：{record.code}</div>
          <div>
            地址、电话：{record.address} {record.mobile2}
          </div>
          <div>
            开户行及账号：{record.bank} {record.account}
          </div>
        </div>
      ),
    },
    {
      title: '操作',
      dataIndex: 'options',
      search: false,
      hideInTable: !admin,
      render: (text, record) => [
        <Button
          key="eidt"
          type="primary"
          size="small"
          hidden={type === 'contract'}
          style={{ marginRight: '15px' }}
          onClick={() => {
            setRenderData({ ...record, type: 'eidt', renderDataNumber: 0 });
            setInfoVisible(true);
          }}
        >
          编辑
        </Button>,
        <Popconfirm
          title="是否重构法大大账号"
          okText="重构"
          key="buildAccount"
          cancelText="取消"
          onConfirm={() => {
            request
              .post('/sms/contract/conCompany/buildAccount', { id: record.id })
              .then((res: any) => {
                if (res.status == 'success') {
                  message.success('操作成功!');
                  callbackRef();
                }
              });
          }}
        >
          <Button
            key="delete"
            style={{ marginRight: '15px' }}
            hidden={type === 'contract'}
            type="primary"
            size="small"
            danger
          >
            重构
          </Button>
        </Popconfirm>,
        <Popconfirm
          title="是否删除"
          okText="删除"
          key="deletes"
          cancelText="取消"
          onConfirm={() => {
            request.delete('/sms/contract/conCompany', { id: record.id }).then((res: any) => {
              if (res.status == 'success') {
                message.success('操作成功!');
                callbackRef();
              }
            });
          }}
        >
          <Button key="delete" hidden={type === 'contract'} type="primary" size="small" danger>
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
        className="Contract"
        request={{ url: '/sms/contract/conCompany' }}
        toolBarRender={[
          <Button
            key="button"
            icon={<PlusOutlined />}
            type="primary"
            hidden={!admin}
            onClick={() => {
              //   if (parentId) {
              //     setRenderData({ typee: 'add', parentId });
              //   } else {
              //     setRenderData({ typee: 'add' });
              //   }
              setRenderData({ type: 'add', renderDataNumber: 0 });
              setInfoVisible(true);
              //   setModalVisible(true);
            }}
          >
            新建
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
      {previewVisible && (
        <ChargeIframe
          setPreviewVisible={() => setPreviewVisible(false)}
          previewVisible={previewVisible}
          previewImage={previewImage}
          callbackRef={() => callbackRef()}
        />
      )}
      <div style={{ display: 'none' }}>
        <Image
          width={200}
          style={{ display: 'none' }}
          preview={{
            visible: isModalVisibles,
            src: imgSrc,
            onVisibleChange: (value: any) => {
              setisModalVisibles(value);
            },
          }}
        />
      </div>
    </>
  );
};
