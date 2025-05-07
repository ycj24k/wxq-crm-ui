import React, { useEffect, useRef, useState } from 'react';
import { Empty, Descriptions, Image, Tag, Pagination, Modal } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import { DrawerForm } from '@ant-design/pro-form';
import Dictionaries from '@/services/util/dictionaries';
import moment from 'moment';
import getWindowSize from '@/services/util/windowSize';
import request from '@/services/ant-design-pro/apiRequest';
import './Charge.less';
import ProTable from '@ant-design/pro-table';
import ImgUrl from '@/services/util/UpDownload';
import ChargeIframe from '@/pages/Admins/AdminCharge/ChargeIframe';
import filter from '@/services/util/filter';
import Paragraph from 'antd/lib/typography/Paragraph';
import QrcodeInfo from './QrcodeInfo';
export default (props: any) => {
  const { modalVisible, setModalVisible, renderData, setPreviewImage } = props;
  const [totalPages, settotalPages] = useState<any>(
    renderData.totalPages ? renderData.totalPages : false,
  );
  const [refundList, setrefundList] = useState<any>([]);
  const [imgSrc, setImgSrc] = useState();
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [isModalVisibles, setisModalVisibles] = useState<boolean>(false);
  const [chargelist, setchargelist] = useState<any>([]);
  const [order, setorder] = useState<any>(false);
  const [charge, setcharge] = useState<any>(renderData.charge ? renderData.charge : false);
  const [qrcodeVisible, setQrcodeVisible] = useState<boolean>(false);
  const [qrcodeSrc, setQrcodeSrc] = useState<string>();
  const [windowSize, setWindowSize] = useState(getWindowSize());
  const contents = [
    <div hidden={renderData.type == 'refund' || renderData.type == 'refundList'}>
      <Descriptions title="缴费信息" bordered size="small"></Descriptions>
      {chargelist.map((item: any, index: number) => {
        return (
          <Descriptions bordered size="small" key={index} style={{ marginBottom: '30px' }}>
            <Descriptions.Item label="缴费编号">
              {
                item.num
              }
            </Descriptions.Item>
            <Descriptions.Item label="第三方订单编号">
              {
                item.num2
              }
            </Descriptions.Item>
            <Descriptions.Item label="缴费类型">{Dictionaries.getCascaderName('chargeType', item.type)}</Descriptions.Item>
            <Descriptions.Item label="收费金额">{item.amount}</Descriptions.Item>
            {/* <Descriptions.Item label="实收金额">
              {item.discount ? item.amount - item.discount : item.amount}
            </Descriptions.Item> */}
            <Descriptions.Item label="收款方式">
              {Dictionaries.getCascaderName('dict_stu_refund_type', item.method)}
            </Descriptions.Item>
            <Descriptions.Item label="本次折扣金额">{item.discount}</Descriptions.Item>
            <Descriptions.Item label="本次折扣原因">{item.discountRemark}</Descriptions.Item>
            <Descriptions.Item label="收费人">{item.userName}</Descriptions.Item>
            <Descriptions.Item label="缴费日期">
              {item.paymentTime}
            </Descriptions.Item>
            <Descriptions.Item label="下次缴费时间">
              {item.nextPaymentTime}
            </Descriptions.Item>
            <Descriptions.Item label="审核人">{item.auditor}</Descriptions.Item>
            <Descriptions.Item label="审核状态">
              {item.confirm === true ? (
                <Tag color={'#87d068'}>审核通过</Tag>
              ) : item.confirm === false ? (
                <Tag color={'#FF0000'}>审核未通过</Tag>
              ) : (
                <Tag color={'#f50'}>未审核</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="缴费备注" span={3}>
              {item.description}
            </Descriptions.Item>
            <Descriptions.Item label="财务备注" span={3}>
              {item.description2}
            </Descriptions.Item>
            <Descriptions.Item label="审核备注" span={3}>
              {item.remark}
            </Descriptions.Item>
            <Descriptions.Item label="附件" span={3}>
              {item?.files
                ? item.files.split(',').map((items: any, indexs: number) => {
                  return (
                    <div key={indexs} className="notice-files">
                      附件内容：{' '}
                      <a
                        onClick={() => {
                          look(item.id, items);
                        }}
                      >
                        {items}
                      </a>
                    </div>
                  );
                })
                : ''}
            </Descriptions.Item>
            {item.file && <Descriptions.Item label="二维码" span={3}>
              <div className="notice-files">
                二维码图片：{' '}
                <a
                  onClick={() => {
                    look2(item);
                  }}
                >
                  {item.file}
                </a>
              </div>
            </Descriptions.Item>}
            {item.code && <Descriptions.Item label="对公转账备注码" span={3}>
              <div className="notice-files">
                备注码：{' '}
                <Paragraph copyable >{item.code}</Paragraph>
              </div>
            </Descriptions.Item>}
          </Descriptions>
        );
      })}
    </div>,
    <div>
      <Descriptions title="退费信息" bordered size="small"></Descriptions>
      {refundList.map((item: any, key: number) => {
        return (
          <Descriptions key={key} bordered size="small" style={{ marginBottom: '30px' }}>
            <Descriptions.Item label="退费金额" style={{ width: '150px' }}>
              {item.amount}
            </Descriptions.Item>
            <Descriptions.Item label="退款方式">
              {Dictionaries.getCascaderName('dict_stu_refund_type', item.method)}
            </Descriptions.Item>
            <Descriptions.Item label="收费人">{item.userName}</Descriptions.Item>
            <Descriptions.Item label="退费项目总称">
              {item.project &&
                Dictionaries.getCascaderAllName('dict_reg_job', item.project.split(',')[0])}
            </Descriptions.Item>
            <Descriptions.Item label="退费项目">
              {item.project &&
                [...new Set(item.project.split(','))].map((item: any, index: number) => {
                  return (
                    <span key={index}>
                      {Dictionaries.getCascaderName('dict_reg_job', item)} <br />
                    </span>
                  );
                })}
            </Descriptions.Item>
            <Descriptions.Item label="申请时间">
              {item.paymentTime}
            </Descriptions.Item>
            <Descriptions.Item label="退款备注" span={3}>
              {item.description}
            </Descriptions.Item>
            <Descriptions.Item label="财务备注" span={3}>
              {item.description2}
            </Descriptions.Item>
            <Descriptions.Item label="退款领取人">{item.recipientName}</Descriptions.Item>
            <Descriptions.Item label="退款类型">
              {Dictionaries.getCascaderName('dict_refundType', item.refundType)}
            </Descriptions.Item>
            <Descriptions.Item label="经办人">{item.agentName}</Descriptions.Item>
            <Descriptions.Item label="账户">{item.account}</Descriptions.Item>
            <Descriptions.Item label="开户名">{item.accountName}</Descriptions.Item>
            <Descriptions.Item label="开户行">{item.bank}</Descriptions.Item>
            <Descriptions.Item label="审核进度" span={3}>
              <ProTable
                // actionRef={actionRefs}
                bordered
                columns={[
                  {
                    title: '审核步骤',
                    dataIndex: 'auditType',
                    search: false,
                    render: (text, record) => (
                      <span>{Dictionaries.getName('auditType', record.auditType)}</span>
                    ),
                  },
                  {
                    title: '审核人',
                    dataIndex: 'userName',
                    search: false,
                  },
                  {
                    title: '审核结果',
                    dataIndex: 'confirm',
                    search: false,
                    render: (text, record) => (
                      <Tag color={record.confirm ? '#87d068' : '#FF0000'}>
                        {record.confirm ? '审核通过' : '审核未通过，已退回第一步'}
                      </Tag>
                    ),
                  },
                  {
                    title: '审核建议',
                    dataIndex: 'remark',
                    ellipsis: true,
                    tip: '建议过长会自动收缩',
                  },
                  {
                    title: '审核时间',
                    key: 'createTime',
                    dataIndex: 'createTime',
                    valueType: 'dateRange',
                    render: (text, record) => (
                      <span>{record.createTime}</span>
                    ),
                  },
                ]}
                headerTitle={false}
                search={false}
                rowKey="id"
                options={false}
                // dataSource={record.projectClassExamList}
                request={async (params, sort, filter) => {
                  const dataList: any = await request.get('/sms/business/bizAudit', {
                    entityId: item.id,
                    'auditType-in': '1,2,3,4',
                  });

                  return {
                    data: dataList.data.content,
                    success: dataList.success,
                    total: dataList.data.totalElements,
                  };
                }}
                pagination={false}
              />
            </Descriptions.Item>
            <Descriptions.Item label="附件">
              {item?.files
                ? item.files.split(',').map((items: any, indexs: number) => {
                  return (
                    <div key={indexs} className="notice-files">
                      附件内容：{' '}
                      <a
                        onClick={() => {
                          look(item.id, items);
                        }}
                      >
                        {items}
                      </a>
                    </div>
                  );
                })
                : ''}
            </Descriptions.Item>
          </Descriptions>
        );
      })}
    </div>,
  ];
  // const charge = renderData.charge ? renderData.charge : false;
  useEffect(() => {
    contentList();
    request.get('/sms/business/bizOrder', { id: renderData.orderId }).then((res: any) => {
      setorder(res.data.content[0]);
    });
  }, [renderData]);

  const contentList = async () => {
    const list = await request.get('/sms/business/bizCharge', {
      orderId: renderData.orderId,
      enable: true,
    });
    const chargelist: any[] = [];
    const refundList: any[] = [];
    list.data.content.forEach((item: any) => {
      if (item.type != 1) {
        chargelist.push(item);
      } else {
        refundList.push(item);
      }
    });
    setchargelist(chargelist);
    setrefundList(refundList);
    if (renderData.type == 'refund' || renderData.type == 'refundList') {
      contents.splice(0, 1);
    }
  };
  const formRef = useRef<ProFormInstance>();
  const look = async (id: any, item: any) => {
    const type = item.slice(item.indexOf('.'));
    await ImgUrl('/sms/business/bizCharge/download', id, item).then((res: any) => {
      setImgSrc(res);
      if (type == '.png' || type == '.jpg' || type == '.jpeg') {
        setisModalVisibles(true);
      } else {
        setPreviewVisible(true);
      }
    });
  };
  const look2 = async (item: any) => {
    let tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
    let tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
    const src = '/sms/business/bizChargeQrcode/download?id=' + item.chargeQrcodeId + '&fileName=' + item.file + '&' + tokenName + '=' + tokenValue;
    setQrcodeSrc(src);
    setQrcodeVisible(true)
    setcharge(item)
  };
  return (
    <DrawerForm<{
      name: string;
      company: string;
      id: number;
    }>
      title={'缴费信息'}
      formRef={formRef}
      autoFocusFirstInput
      drawerProps={{
        destroyOnClose: true,
        onClose: () => {
          // setCharge([]);
          setModalVisible();
        },
      }}
      width={windowSize.innerWidth / 1.5}
      onFinish={async (values) => {
        setModalVisible();
      }}
      visible={modalVisible}
    >
      {order && (
        <Descriptions title={`订单信息:${order.num ? order.num : ''}`} bordered size="small">
          <Descriptions.Item label="学员/企业">
            <div>{order.studentName}</div>
            <div> {order.isPeer && <Tag color="#87CEEB">同行企业</Tag>}</div>
          </Descriptions.Item>
          <Descriptions.Item label="项目总称">
            {Dictionaries.getCascaderAllName('dict_reg_job', order.project)}
          </Descriptions.Item>
          <Descriptions.Item label="报考项目">
            {Dictionaries.getCascaderName('dict_reg_job', order.project)}
          </Descriptions.Item>
          <Descriptions.Item label="报考班型">
            {Dictionaries.getName('dict_class_type', order.classType)}
          </Descriptions.Item>
          <Descriptions.Item label="班型年限">
            {Dictionaries.getName('dict_class_year', order.classYear)}
          </Descriptions.Item>
          <Descriptions.Item label="考试类型">
            {Dictionaries.getName('dict_exam_type', order.examType)}
          </Descriptions.Item>
          {/* <Descriptions.Item label="考试费">{order.examAmount}</Descriptions.Item> */}
          <Descriptions.Item label="订单收费标准/人">{order.receivable}</Descriptions.Item>
          {/* <Descriptions.Item label="订单总收费金额">{order.totalReceivable}</Descriptions.Item> */}
          <Descriptions.Item label="订单实际应收金额">{order.actualReceivable}</Descriptions.Item>
          <Descriptions.Item label="订单已收金额">
            <span style={{ color: 'green' }}>{order.charge}</span>
          </Descriptions.Item>

          <Descriptions.Item label="订单累计优惠金额">{order.discount}</Descriptions.Item>

          <Descriptions.Item label="订单未收金额">
            <span style={{ color: 'red' }}>{order.arrears}</span>
          </Descriptions.Item>
          <Descriptions.Item label="报名人数">{order.quantity}</Descriptions.Item>
          <Descriptions.Item label="下单时间">
            {order.createTime}
          </Descriptions.Item>
          <Descriptions.Item label="是否已完结">
            {order.isServed === true ? (
              <Tag color={'#87d068'}>已完结</Tag>
            ) : (
              <Tag color={'#FF0000'}>未完结</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>
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
      {contents.map((item) => {
        return item;
      })}

      <a id="downloadDiv" style={{ display: 'none' }}></a>
      {previewVisible && (
        <ChargeIframe
          previewImage={imgSrc}
          previewVisible={previewVisible}
          setPreviewVisible={() => {
            setPreviewVisible(false);
          }}
        />
      )}
      <Modal
        visible={qrcodeVisible}
        title="二维码信息"
        footer={null}
        // width={600}
        onCancel={() => setQrcodeVisible(false)}
      >
        <QrcodeInfo src={qrcodeSrc} order={order} charge={charge} />
      </Modal>
    </DrawerForm>
  );
};
