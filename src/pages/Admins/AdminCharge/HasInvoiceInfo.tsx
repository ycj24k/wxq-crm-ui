import { Descriptions, Drawer, Modal, Tag } from 'antd';
import Dictionaries from '@/services/util/dictionaries';
import { useEffect, useState } from 'react';
import look from '@/services/util/viewLook';
import Preview from '@/services/util/preview';
import moment from 'moment';
import request from '@/services/ant-design-pro/apiRequest';
import StudentInfo from '../StudentManage/studentInfo';

export default (props: any) => {
  const { modalVisible, setModalVisible, renderData } = props;
  const [chargeList, setChargeList] = useState<any[]>([])
  const [PreviewVisibles, setPreviewVisibles] = useState<boolean>(false);
  const [previewurl, setPreviewurl] = useState<any>();
  const [student, setStudent] = useState<any>()
  const [InfoVisibleFalg, setInfoVisible] = useState<boolean>(false);
  const [InvoiceList, setInvoiceList] = useState<any>(false)
  const [chargeUsedAmount, setChargeUsedAmount] = useState<any>()
  const getChargelist = async (id: string) => {

    const list = (await request.get('/sms/business/bizCharge', { 'id-in': id })).data.content
    setChargeList(list)
  }
  const getInvoiceList = async (id: string) => {
    const lists = (await request.get('/sms/business/bizInvoice', { 'chargeIds': `,${id},` })).data.content

    setInvoiceList(lists)
  }
  useEffect(() => {
    if (renderData.chargeIds) {
      getChargelist(renderData.chargeIds)
    }
    if (renderData.types == 'charges') {
      getInvoiceList(renderData.id)
    } else {
      setInvoiceList([renderData])
    }
    if (renderData.chargeIds != null) {
      const obj = {}
      const chargeIds = renderData.chargeIds.split(',').filter((x: string) => !!x);
      const usedAmounts = renderData.usedAmounts.split(',');
      for (let i = 0; i < chargeIds.length; i++) {
        obj[chargeIds[i]] = usedAmounts[i]
      }
      setChargeUsedAmount(obj)
    }

  }, [])
  const studentInfo = (id: number) => {
    request.get('/sms/business/bizStudentUser', { id: id }).then((res: any) => {
      setStudent({
        ...res.data.content[0]
      });
      setInfoVisible(true);
    });
  }
  return (
    <Drawer
      open={modalVisible}
      onClose={() => setModalVisible()}
      width={1200}
    >
      {InvoiceList &&
        InvoiceList.map((item: any) => {
          return (
            <Descriptions title="发票信息" column={2} bordered size="small">
              <Descriptions.Item label="发票号码">{item.no}</Descriptions.Item>
              <Descriptions.Item label="开票时间">{item.time}</Descriptions.Item>
              <Descriptions.Item label="发票抬头" span={2}>
                {item.title}
              </Descriptions.Item>
              <Descriptions.Item label="商品种类">
                {Dictionaries.getName('invoiceProductType', item.productType)}
              </Descriptions.Item>
              <Descriptions.Item label="发票税号">{item.taxCode}</Descriptions.Item>
              <Descriptions.Item label="发票金额">{item.amount}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{item.email}</Descriptions.Item>
              <Descriptions.Item label="发票备注" span={2}>
                {item.remark}
              </Descriptions.Item>
              <Descriptions.Item label="注意事项" span={2}>
                {item.cautions}
              </Descriptions.Item>
              <Descriptions.Item label="发票种类" span={2}>
                {Dictionaries.getName('invoiceType', item.type)}
              </Descriptions.Item>
              <Descriptions.Item label="开户行">{item.bank}</Descriptions.Item>
              <Descriptions.Item label="账号">{item.account}</Descriptions.Item>
              <Descriptions.Item label="电话">{item.mobile}</Descriptions.Item>
              <Descriptions.Item label="地址">{item.address}</Descriptions.Item>
              <Descriptions.Item label="要求开票公司" span={2}>{item.chargeAccount !== null ? Dictionaries.getName('dict_stu_refund_type', item.chargeAccount) : ''}</Descriptions.Item>
              <Descriptions.Item label="单价">{item.price}</Descriptions.Item>
              <Descriptions.Item label="数量">{item.quantity}</Descriptions.Item>
            </Descriptions>
          )
        })
      }

      <Descriptions title="缴费信息" bordered size="small"></Descriptions>
      {chargeList.map((item: any, index: number) => {
        return (
          <Descriptions title={<span>{`缴费编号:${item.num ? item.num : '未审核'}`} {`开票金额:${chargeUsedAmount[item.id]}`}  学员姓名:{item.studentUserId ? <a onClick={() => studentInfo(item.studentUserId)}>{item.studentName}</a> : item.studentName}</span>} bordered size="small" key={index} style={{ marginBottom: '30px' }}>
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
            <Descriptions.Item label="审核未通过原因" span={3}>
              {item.remark}
            </Descriptions.Item>
            <Descriptions.Item label="附件">
              {item?.files
                ? item.files.split(',').map((items: any, indexs: number) => {
                  return (
                    <div key={indexs} className="notice-files">
                      附件内容：{' '}
                      <a
                        onClick={() => {
                          look(item.id,
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
        );
      })}
      {PreviewVisibles && (
        <Preview
          imgSrc={previewurl}
          isModalVisibles={PreviewVisibles}
          setisModalVisibles={(e: boolean | ((prevState: boolean) => boolean)) =>
            setPreviewVisibles(e)
          }
        />
      )}
      {InfoVisibleFalg && (
        <StudentInfo
          setModalVisible={() => setInfoVisible(false)}
          modalVisible={InfoVisibleFalg}
          renderData={student}
        />
      )}
    </Drawer>
  );
};
