import { DrawerForm } from '@ant-design/pro-form';
import { useState } from 'react';
import getWindowSize from '@/services/util/windowSize';
import { Descriptions, Tag } from 'antd';
import Dictionaries from '@/services/util/dictionaries';
import moment from 'moment';
import Preview from '@/services/util/preview';
import ImgUrl from '@/services/util/UpDownload';
import request from '@/services/ant-design-pro/apiRequest';
import ProTable from '@ant-design/pro-table';
import look from '@/services/util/viewLook';
import ChargeIframe from '@/pages/Admins/AdminCharge/ChargeIframe';
export default (props: any) => {
  const { setModalVisible, modalVisible, renderData } = props;
  const [windowSize, setWindowSize] = useState(getWindowSize());
  const [previewurl, setPreviewurl] = useState<any>();
  const [PreviewVisibles, setPreviewVisibles] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<any>();
  const [previewVisible, setPreviewVisible] = useState<any>(false);
  return (
    <DrawerForm<{
      name: string;
      company: string;
      id: number;
    }>
      title={'缴费信息'}
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
      {renderData.type == 2 ? (
        <Descriptions bordered size="small" key={'jiaofei'} style={{ marginBottom: '30px' }}>
          <Descriptions.Item label="学员">{renderData.oldStudentName}</Descriptions.Item>
          <Descriptions.Item label="项目总称">
            {Dictionaries.getCascaderAllName('dict_reg_job', renderData.oldProject)}
          </Descriptions.Item>
          <Descriptions.Item label="缴费项目">
            {Dictionaries.getCascaderName('dict_reg_job', renderData.oldProject)}
          </Descriptions.Item>
          <Descriptions.Item label="收款方式">
            {Dictionaries.getCascaderName('dict_stu_refund_type', renderData.method)}
          </Descriptions.Item>
          <Descriptions.Item label="本次折扣金额">{renderData.discount}</Descriptions.Item>
          <Descriptions.Item label="本次折扣原因">{renderData.discountRemark}</Descriptions.Item>
          <Descriptions.Item label="收费人">{renderData.userName}</Descriptions.Item>
          <Descriptions.Item label="缴费日期">
            {renderData.paymentTime}
          </Descriptions.Item>
          <Descriptions.Item label="下次缴费时间">
            {renderData.nextPaymentTime}
          </Descriptions.Item>
          <Descriptions.Item label="审核人">{renderData.auditor}</Descriptions.Item>
          <Descriptions.Item label="审核状态">
            {renderData.confirm === true ? (
              <Tag color={'#87d068'}>审核通过</Tag>
            ) : renderData.confirm === false ? (
              <Tag color={'#FF0000'}>审核未通过</Tag>
            ) : (
              <Tag color={'#f50'}>未审核</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="缴费备注" span={3}>
            {renderData.description}
          </Descriptions.Item>
          <Descriptions.Item label="财务备注" span={3}>
            {renderData.description2}
          </Descriptions.Item>
          <Descriptions.Item label="审核备注" span={3}>
            {renderData.remark}
          </Descriptions.Item>
          <Descriptions.Item label="附件">
            {renderData?.files
              ? renderData.files.split(',').map((items: any, indexs: number) => {
                return (
                  <div key={indexs} className="notice-files">
                    附件内容：{' '}
                    <a
                      onClick={() => {
                        look(
                          renderData.id,
                          items,
                          '/sms/business/bizCharge/download',
                          setPreviewurl,
                          setPreviewVisibles,
                        );
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
      ) : (
        <Descriptions key={'tuifei'} bordered size="small" style={{ marginBottom: '30px' }}>
          <Descriptions.Item label="退费金额" style={{ width: '150px' }}>
            {renderData.amount}
          </Descriptions.Item>
          <Descriptions.Item label="退款方式">
            {Dictionaries.getCascaderName('dict_stu_refund_type', renderData.method)}
          </Descriptions.Item>
          <Descriptions.Item label="收费人">{renderData.userName}</Descriptions.Item>
          <Descriptions.Item label="项目总称">
            {Dictionaries.getCascaderAllName('dict_reg_job', renderData.oldProject)}
          </Descriptions.Item>
          <Descriptions.Item label="退费项目">
            {Dictionaries.getCascaderName('dict_reg_job', renderData.oldProject)}
          </Descriptions.Item>
          <Descriptions.Item label="申请时间">
            {renderData.paymentTime}
          </Descriptions.Item>
          <Descriptions.Item label="退款备注" span={3}>
            {renderData.description}
          </Descriptions.Item>
          <Descriptions.Item label="财务备注" span={3}>
            {renderData.description2}
          </Descriptions.Item>
          <Descriptions.Item label="退款领取人">{renderData.recipientName}</Descriptions.Item>
          <Descriptions.Item label="退款类型">
            {Dictionaries.getCascaderName('dict_refundType', renderData.refundType)}
          </Descriptions.Item>
          <Descriptions.Item label="经办人">{renderData.agentName}</Descriptions.Item>
          <Descriptions.Item label="账户">{renderData.account}</Descriptions.Item>
          <Descriptions.Item label="开户名">{renderData.accountName}</Descriptions.Item>
          <Descriptions.Item label="开户行">{renderData.bank}</Descriptions.Item>
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
                      {record.confirm ? '审核通过' : '审核未通过，已退回上一步'}
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
            {renderData?.files
              ? renderData.files.split(',').map((items: any, indexs: number) => {
                return (
                  <div key={indexs} className="notice-files">
                    附件内容：{' '}
                    <a
                      onClick={() => {
                        const type = items.slice(items.indexOf('.'));
                        if (type == '.png' || type == '.jpg' || type == '.jpeg') {
                          look(
                            renderData.id,
                            items,
                            '/sms/business/bizCharge/download',
                            setPreviewurl,
                            setPreviewVisibles,
                          );
                        } else {
                          look(
                            renderData.id,
                            items,
                            '/sms/business/bizCharge/download',
                            setPreviewImage,
                            setPreviewVisible,
                          );
                        }
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
      )}

      {PreviewVisibles && (
        <Preview
          imgSrc={previewurl}
          isModalVisibles={PreviewVisibles}
          setisModalVisibles={(e: boolean | ((prevState: boolean) => boolean)) =>
            setPreviewVisibles(e)
          }
        />
      )}

      <ChargeIframe
        previewVisible={previewVisible}
        setPreviewVisible={() => setPreviewVisible(false)}
        previewImage={previewImage}
      />
    </DrawerForm>
  );
};
