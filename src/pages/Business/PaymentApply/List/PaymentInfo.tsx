import { DrawerForm } from '@ant-design/pro-form';
import { Descriptions, Drawer, Image, Tag } from 'antd';
import moment from 'moment';
import Dictionaries from '@/services/util/dictionaries';
import ProTable from '@ant-design/pro-table';
import request from '@/services/ant-design-pro/apiRequest';
import { Key, useEffect, useState } from 'react';
import ImgUrl from '@/services/util/UpDownload';
import ChargeIframe from '@/pages/Admins/AdminCharge/ChargeIframe';
import look from '@/services/util/viewLook';
export default (props: any) => {
  const { modalVisible, setModalVisible, renderData } = props;
  const [Imgs, setImgs] = useState<any>({ imgUrl: false, pdfUrl: false });
  const [imgSrc, setImgSrc] = useState();
  const [isModalVisibles, setisModalVisibles] = useState<boolean>(false);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  return (
    <DrawerForm
      title="查看申请信息"
      visible={modalVisible}
      width={1200}
      drawerProps={{
        destroyOnClose: true,
        onClose: () => {
          // setCharge([]);
          setModalVisible();
        },
      }}
      onFinish={async () => {
        setModalVisible();
      }}
    >
      <Descriptions title="单据信息" bordered size="small" column={2}>
        <Descriptions.Item label="编号">{renderData.num ? renderData.num : '-'}</Descriptions.Item>
        <Descriptions.Item label="申请部门">{renderData.departmentName}</Descriptions.Item>
        <Descriptions.Item label="申请时间">
          {renderData.createTime}
        </Descriptions.Item>
        <Descriptions.Item label="申请人">{renderData.userName}</Descriptions.Item>
        <Descriptions.Item label="收款方单位">{renderData.payee}</Descriptions.Item>
        <Descriptions.Item label="收款方电话">{renderData.mobile}</Descriptions.Item>
        <Descriptions.Item label="开户行（详细到支行）">{renderData.bank}</Descriptions.Item>
        <Descriptions.Item label="收款方账号">{renderData.account}</Descriptions.Item>
        <Descriptions.Item label="付款方式">
          {Dictionaries.getName('dict_stu_refund_type', renderData.source)}
        </Descriptions.Item>
        <Descriptions.Item label="付款明细" contentStyle={{ width: '30%', fontSize: '12px' }}>
          {renderData.details}
        </Descriptions.Item>
        <Descriptions.Item label="付款金额">{renderData.amount}</Descriptions.Item>
        <Descriptions.Item label="要求付款时间">
          {renderData.paymentTime}
        </Descriptions.Item>
        <Descriptions.Item label="负责人">{renderData.chargePersonName}</Descriptions.Item>
        <Descriptions.Item label="是否有发票">
          {renderData.hasInvoice ? '有发票' : '无发票'}
        </Descriptions.Item>
        <Descriptions.Item label="备注" span={2}>
          {renderData.description}
        </Descriptions.Item>
        <Descriptions.Item label="附件" span={2}>
          {renderData?.files &&
            renderData?.files.split(',').map((item: any) => {
              return (
                <div
                  style={{ marginBottom: '10px' }}
                  onClick={() => {
                    const type = item.slice(item.indexOf('.'));
                    if (type == '.png' || type == '.jpg' || type == '.jpeg') {
                      look(
                        renderData.id,
                        item,
                        '/sms/business/bizPaymentApply/download',
                        setImgSrc,
                        setisModalVisibles,
                      );
                    } else {
                      look(
                        renderData.id,
                        item,
                        '/sms/business/bizPaymentApply/download',
                        setImgSrc,
                        setPreviewVisible,
                      );
                    }
                  }}
                >
                  <a>{item}</a>
                </div>
              );
            })}
        </Descriptions.Item>
      </Descriptions>
      <Descriptions title="审核信息" style={{ marginTop: '30px' }}>
        <Descriptions.Item label="审核进度">
          <ProTable
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
                    {record.confirm ? '审核通过' : '审核未通过'}
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
                entityId: renderData.id,
                'auditType-in': '7,8',
              });

              return {
                data: dataList.data.content,
                success: dataList.success,
                total: dataList.data.totalElements,
              };
            }}
            pagination={false}
          ></ProTable>
        </Descriptions.Item>
      </Descriptions>
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
      {previewVisible && (
        <ChargeIframe
          previewImage={imgSrc}
          previewVisible={previewVisible}
          setPreviewVisible={() => {
            setPreviewVisible(false);
          }}
        />
      )}
    </DrawerForm>
  );
};
