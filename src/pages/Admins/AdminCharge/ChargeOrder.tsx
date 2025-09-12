import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Button, Col, Descriptions, message, Modal, Row, Select, Space, Upload } from 'antd';
import type { ProFormInstance} from '@ant-design/pro-form';
import { ProFormDatePicker, ProFormList } from '@ant-design/pro-form';
import ProForm, {
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
  ProFormDateTimePicker,
  ProFormSelect,
  ProFormUploadDragger,
} from '@ant-design/pro-form';
import Tables from '@/components/Tables';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import moment from 'moment';
import Dictionaries from '@/services/util/dictionaries';
import request from '@/services/ant-design-pro/apiRequest';
import ProCard from '@ant-design/pro-card';
import { useModel } from 'umi';
import UserManageCard from '../Department/UserManageCard';
import Charge from '../AdminCharge/Charge';
import Preview from '@/services/util/preview';
import ProFormUser from '@/components/ProFormUser';
import UploadDragger from '@/components/UploadDragger/UploadDragger';
import ChargesUp from './ChargesUp';
import { judgeDivisor } from '@/services/util/util';
function getBase64(file: any) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
let content: any = null;
const { Option } = Select;
export default (props: any, orderRef: any) => {
  const {
    modalVisible,
    setModalVisible = undefined,
    callbackRef = undefined,
    renderData,
    callback,
    admin,
    setPreviewImage,
    setPreviewVisible,
  } = props;
  const url = '/sms/business/bizCharge/complex';
  const { initialState } = useModel('@@initialState');
  const [falg, setFalg] = useState<boolean>(false);
  const [refundType, setRefundType] = useState<any>(0)
  const [PreviewVisibles, setPreviewVisibles] = useState<boolean>(false);
  const [CardVisible, setCardVisible] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [ChargeModal, setChargeModal] = useState<boolean>(false);
  const [ChargeModals, setChargeModals] = useState<boolean>(false);
  const [previewurl, setPreviewurl] = useState<any>();
  const [CardContent, setCardContent] = useState<any>();
  const [invoiceFalg, setinvoiceFalg] = useState<boolean>(false);
  const [fapiaoFalg, setfapiaoFalgFalg] = useState<boolean>(false);
  const [amountOrder, setamountOrder] = useState<number>(0);
  const [discountOrder, setdiscountOrder] = useState<number>(0);
  const [servedOrderIds, setservedOrderIds] = useState<any>([]);
  const [servedOrderTable, setservedOrderTable] = useState<any>([]);
  const [userNameId, setUserNameId] = useState<any>();
  const [chargeInfo, setChargeInfo] = useState<any>(false);
  const [refundTypeFalg, setrefundTypeFalg] = useState<boolean>(true);
  const [descriptionContent, setDescriptionContent] = useState<any>('');
  const [ChargeList, setChargeList] = useState<any>([]);
  const [OrderList, setOrderList] = useState<any>([]);
  const cNumber = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const projectName = ['成考', '国家开放大学	'];
  const [fromDataUp, setFromDataUp] = useState<any>(false);
  const userRef: any = useRef(null);
  const [department, setDepartment] = useState<any>({
    name: initialState?.currentUser?.name,
    id: initialState?.currentUser?.userid,
  });
  const tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
  const tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
  const obj = {};
  obj[tokenName] = tokenValue;
  const orderTitle = renderData.type == 'orders' ? '退费' : '收费';
  const ment = () => {
    formRef?.current?.setFieldsValue({
      agent: department.name,
    });
  };
  //自动填充备注
  useEffect(() => {
    if (renderData.type == 'orders') return;
    if (
      projectName.indexOf(Dictionaries.getCascaderAllName('dict_reg_job', renderData.project)) >= 0
    )
      return;
    if (amountOrder == 0) return;
    if (renderData.studentType == 0) {
      const amount = `1*${amountOrder}`;
      let amountLeft = '';
      if (ChargeList.length == 0) {
        if (renderData.arrears - amountOrder - discountOrder <= 0) {
          amountLeft = '全款';
        } else {
          amountLeft = '第' + cNumber[ChargeList.length] + '次付款';
        }
      } else {
        if (renderData.arrears - amountOrder - discountOrder <= 0) {
          amountLeft = '尾款';
        } else {
          amountLeft = '第' + cNumber[ChargeList.length] + '次付款';
        }
      }
      formRef?.current?.setFieldsValue({
        description: amountLeft + ' ' + amount,
      });
    } else {
      const {quantity} = renderData;
      const amounts = amountOrder - discountOrder;
      let amountLeft = '';

      if (judgeDivisor(amountOrder, quantity)) {
        const amount = `${quantity} * ${amountOrder / quantity}`;
        if (ChargeList.length == 0) {
          if (renderData.arrears - amountOrder - discountOrder <= 0) {
            amountLeft = '全款';
          } else {
            amountLeft = '第' + cNumber[ChargeList.length] + '次付款';
          }
        } else {
          if (renderData.arrears - amountOrder - discountOrder <= 0) {
            amountLeft = '尾款';
          } else {
            amountLeft = '第' + cNumber[ChargeList.length] + '次付款';
          }
        }
        formRef?.current?.setFieldsValue({
          description: amountLeft + ' ' + amount,
        });
      } else {
        formRef?.current?.setFieldsValue({
          description: '',
        });
      }
    }
  }, [amountOrder, discountOrder]);

  //chargeInfo 使用模板填充
  useEffect(() => {
    if (!chargeInfo) return;
    setTimeout(() => {
      const Data = chargeInfo;
      const fapiaos = [];
      const arr: { uid: number; name: any; response: { data: any } }[] = [];
      if (chargeInfo.files) {
        chargeInfo.files.split(',').forEach((item: any, index: number) => {
          arr.push({
            uid: index + 1,
            name: item,
            response: { data: item },
          });
        });
      }
      if (Data.invoiceTitle) {
        fapiaos.push({
          title: Data.invoiceTitle,
          productType: Data.invoiceProductType + '',
          taxCode: Data.invoiceTaxCode,
          amount: Data.invoiceAmount,
          email: Data.invoiceEmail,
          remark: Data.invoiceRemark,
          cautions: Data.invoiceCautions,
          type: Data.invoiceType + '',
          bank: Data.invoiceBank,
          account: Data.invoiceAccount,
          mobile: Data.invoiceMobile,
          address: Data.invoiceAddress,
        });
      }
      // delete Data.files;
      // delete Data.type;
      //invoiceTitle
      setamountOrder(Data.amount);
      Data.type = Data.type + '';
      Data.refundType = Data.refundType + '';
      Data.agent = chargeInfo.agentName;
      userRef.current.setDepartment({
        id: chargeInfo.userId,
        name: chargeInfo.userName,
      });
      setfapiaoFalgFalg(Data.invoiceTitle ? true : false);
      setinvoiceFalg(Data.invoiceType ? true : false);
      delete Data.description;
      formRef?.current?.setFieldsValue({
        ...Data,
        method: chargeInfo.method.toString(),
        files: arr,
        fFalg: Data.invoiceTitle ? '是' : '否',
        fapiao: fapiaos,
      });
    }, 100);
  }, [chargeInfo]);
  const getCorporateName = async (name: string) => {
    //chargeMethod
    const content = await request.get('/sms/contract/conCompany', { name });
    // const content = (await request.get('/sms/contract/conCompany', { name })).data.content[0];
    if (content.data.content.length == 0) {
      return '0';
    } else {
      if (content.data.content[0].chargeMethod) {
        const method = content.data.content[0].chargeMethod.split(',')[0];
        return method;
      } else {
        return '0';
      }
    }
  };
  //fromDataUp 使用图片填充
  useEffect(() => {
    if (!fromDataUp) return;
    if (!fromDataUp.chargeTime) return;
    const method = getCorporateName(fromDataUp.corporateName);
    const chargeTime = fromDataUp.chargeTime.substring(0, 10);
    let paymentTime =
      fromDataUp.chargeTime.substring(0, 10) + ' ' + fromDataUp.chargeTime.substring(10);
    if (fromDataUp.amount) {
      setamountOrder(Number(fromDataUp.amount));
    }
    if (paymentTime.indexOf('年') >= 0) {
      console.log('paymentTime', paymentTime);
      const pattern = /年|月/g; // 匹配"年"和"月"
      paymentTime = paymentTime.replace(pattern, '-').replace('日', ''); // 替换为"-"，并去掉"日"
    }
    setTimeout(async () => {
      formRef?.current?.setFieldsValue({
        amount: fromDataUp.amount,
        // chargeTime: chargeTime,
        paymentTime: paymentTime,
        method: (await method) + '',
        discount: 0,
        fFalg: '否',
        fapiao: [],
        files: fromDataUp.files,
      });
    }, 100);
  }, [fromDataUp]);
  useEffect(() => {
    ment();
  }, [department]);
  const columns: ProColumns<any>[] = [
    {
      title: '学员',
      dataIndex: 'studentName',
      sorter: true,
      // width: 100,
      // search: false,
    },
    {
      title: '所属团组',
      dataIndex: 'studentParentName',
      sorter: true,
      // width: 100,
      // search: false,
      render: (text, record) => (
        <>
          <span> {record.studentParentName}</span>
        </>
      ),
    },
    {
      title: '报考班型',
      dataIndex: 'classType',
      sorter: true,
      valueEnum: Dictionaries.getSearch('dict_class_type'),
      render: (text, record) => <>{Dictionaries.getName('dict_class_type', record.classType)}</>,
    },
    {
      title: '班型年限',
      sorter: true,
      dataIndex: 'classYear',
      valueEnum: Dictionaries.getSearch('dict_class_year'),
      render: (text, record) => <>{Dictionaries.getName('dict_class_year', record.classYear)}</>,
    },
    {
      title: '考试类型',
      sorter: true,
      dataIndex: 'examType',
      valueEnum: Dictionaries.getSearch('dict_exam_type'),
      render: (text, record) => <>{Dictionaries.getName('dict_exam_type', record.examType)}</>,
    },
    {
      title: '报考岗位',
      dataIndex: 'project',
      // search: false,
      key: 'project',
      sorter: true,
      valueType: 'cascader',
      fieldProps: {
        options: Dictionaries.getCascader('dict_reg_job'),
      },
      render: (text, record) => (
        <span key="project">
          {record.project &&
            [...new Set(record.project.split(','))].map((item: any, index: number) => {
              return (
                <span key={`charge-order-${item}-${index}`}>
                  {Dictionaries.getCascaderName('dict_reg_job', item)} <br />
                </span>
              );
            })}
        </span>
      ),
    },
  ];

  const formRef = useRef<ProFormInstance>();
  useImperativeHandle(orderRef, () => ({
    submitok: submitok,
    formRefs: formRef,
  }));
  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
  };
  const getChargeList = async () => {
    const list = (
      await request.get('/sms/business/bizCharge', { orderId: renderData.id, enable: true })
    ).data.content;
    const orderList = (
      await request.get('/sms/business/bizOrder', { parentId: renderData.id, enable: true })
    ).data.content;
    setChargeList(list);
    setOrderList(orderList);
  };
  useEffect(() => {
    getChargeList();
    formRef?.current?.setFieldsValue({
      chargeTime: moment().format('YYYY-MM-DD'),
    });
    if (renderData.type == 'orders') {
      const data: { parentId?: string; id?: string } = {};
      renderData.studentType == 1 ? (data.parentId = renderData.id) : (data.id = renderData.id);
      request.get('/sms/business/bizOrder/registration', data).then((res) => {
        setservedOrderTable(res.data.content);
      });
    }
  }, []);
  if (renderData.type == 'eidt') {
    setTimeout(() => {
      const Data = renderData;
      delete Data.files;
      // delete renderData.files;
      formRef?.current?.setFieldsValue({
        ...Data,
        method: renderData.method.toString(),
      });
    }, 100);
  }
  const filter = (inputValue: string, path: any[]) => {
    return path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
  };
  function onChange(value: any, selectedOptions: any) {
    console.log(value, selectedOptions);
  }
  const submitok = (value: any) => {
    if (!fapiaoFalg) delete value.fapiao;
    let arrData = '';
    if (value.files) {
      const arr: any[] = [];
      value.files.forEach((item: any) => {
        arr.push(item.response.data);
      });
      value.files = arr.join(',');
    }

    if (renderData.orderId) {
      // value.orderId = renderData.orderId;
      value.id = renderData.studentId;
    } else {
      value.orderId = renderData.id;
    }

    if (value.fapiao) {
      arrData = value.fapiao[0];
      delete value.fapiao;
    }
    if (renderData.type == 'orders') {
      value.agent = department.id;
      value.paymentTime = value.chargeTime;
      // value.isCalculation = false;
      if (servedOrderIds.length > 0) value.servedOrderIds = servedOrderIds.join(',');
    }
    if (value.id == undefined) {
      delete value.id
    }
    value.isCalculation = true;
    value.userId = userNameId.id;
    value.type = renderData.type == 'orders' ? '1' : 0;
    return new Promise((resolve) => {
      request
        .post2(url, value, arrData)
        .then((res: any) => {
          if (res.status == 'success') {
            message.success('操作成功');
            if (setModalVisible) {
              setModalVisible();
              callbackRef();
            }

            resolve(res);
          }
        })
        .catch((err: any) => {
          resolve(true);
        });
    });
  };
  const disabledDate = (current: any) => {
    // 将当前日期与上个月的日期进行比较
    return current && current < moment().subtract(2, 'month').endOf('month');
  };
  return (
    <ProForm<{
      name: string;
      company: string;
      id: number;
      fapiao: any;
      fFalg: any;
    }>
      submitter={
        admin === 'step'
          ? false
          : {
            render: (_, dom) => {
              return (
                <Row>
                  {/* <Col span={10}></Col> */}
                  <Col span={24} offset={21}>
                    <Space>{dom}</Space>
                  </Col>
                </Row>
              );
            },
          }
      }
      formRef={formRef}
      autoFocusFirstInput
      onFinish={async (values) => {
        delete values.fFalg;
        if (!fapiaoFalg) delete values.fapiao;
        // if (renderData.studentId) values.id = renderData.studentId;
        if (renderData.type == 'orders') {
          if (renderData.charge - amountOrder < 0) {
            setOpenModal(true);
            return;
          }
        } else {
          if (renderData.arrears - amountOrder - discountOrder < 0) {
            setOpenModal(true);
            return;
          }
        }

        await submitok(values);
        // message.success('提交成功');
      }}
    >
      <div
        className="scolle"
        style={{ overflowX: 'auto', height: '600px', paddingBottom: '100px' }}
      >
        <div style={{ textAlign: 'right' }} hidden={renderData.type == 'orders'}>
          <Button
            type="primary"
            onClick={() => {
              setChargeModals(true);
            }}
          >
            图片模板填充
          </Button>
          <Button
            style={{ marginLeft: '30px' }}
            type="primary"
            onClick={() => {
              setChargeModal(true);
            }}
          >
            选择过往缴费做模板填充
          </Button>
        </div>
        {renderData.type == 'orders' ? (
          <Descriptions title="订单收费信息" bordered style={{ marginBottom: '20px' }}>
            <Descriptions.Item style={{ width: '120px' }} label="订单金额">
              <span>{renderData.totalReceivable}</span>
            </Descriptions.Item>
            <Descriptions.Item style={{ width: '120px' }} label="累计优惠">
              <span>{renderData.discount + discountOrder}</span>
            </Descriptions.Item>
            <Descriptions.Item style={{ width: '120px' }} label="可退款金额">
              <span style={{ color: 'green' }}>{renderData.charge}</span>
            </Descriptions.Item>

            <Descriptions.Item style={{ width: '120px' }} label="退款后剩余">
              <span style={{ color: 'red' }}>{renderData.charge - amountOrder}</span>
            </Descriptions.Item>
          </Descriptions>
        ) : renderData.type != 'eidt' ? (
          <Descriptions title="订单已收费信息" bordered style={{ marginBottom: '20px' }}>
            <Descriptions.Item style={{ width: '120px' }} label="订单金额">
              <span>{renderData.totalReceivable}</span>
            </Descriptions.Item>
            <Descriptions.Item style={{ width: '120px' }} label="累计优惠">
              <span>{renderData.discount + discountOrder}</span>
            </Descriptions.Item>
            <Descriptions.Item style={{ width: '120px' }} label="累计实收">
              <span style={{ color: 'green' }}>{renderData.charge + Number(amountOrder)}</span>
            </Descriptions.Item>

            <Descriptions.Item style={{ width: '120px' }} label="当前欠费">
              <span style={{ color: 'red' }}>
                {renderData.arrears - amountOrder - discountOrder}
              </span>
            </Descriptions.Item>
          </Descriptions>
        ) : (
          ''
        )}

        <ProForm.Group>
          <ProFormDigit
            label={`本次${orderTitle}金额`}
            name="amount"
            width="md"
            fieldProps={{
              precision: 2,
              onChange: (e) => {
                setamountOrder(e as number);
              },
            }}
            rules={[
              {
                required: true,
              },
            ]}
          />
          <ProFormSelect
            label="付款方式"
            name="method"
            width="md"
            request={async () => Dictionaries.getList('dict_stu_refund_type') as any}
            rules={[
              {
                required: true,
                message: '请选择付款方式',
              },
            ]}
          />
          <ProFormSelect
            label="缴费类型"
            name="type"
            width="md"
            // request={async () => Dictionaries.getList('chargeType')}
            valueEnum={{
              0: '订单缴费',
              1: '订单退费',
            }}
            required
            disabled
            fieldProps={{ defaultValue: renderData.type == 'orders' ? ['订单退费'] : ['订单缴费'] }}
          />
        </ProForm.Group>
        <Row
          style={{
            width: '1100px',
            backgroundColor: '#d9edf7',
            border: '1px solid #bce8f1',
            padding: '20px',
            marginBottom: '20px',
          }}
          hidden={renderData.type == 'orders'}
        >
          <Col span={2} style={{ color: 'red' }}>
            注意：
          </Col>
          <Col span={22}>（1）超收金额，请在第一次缴费优惠金额里填写超收金额的负数。</Col>
        </Row>
        <ProForm.Group>
          {renderData.type == 'orders' ? (
            ''
          ) : (
            <>
              <ProFormDigit
                name="discount"
                label="本次优惠金额"
                disabled={renderData.type == 'orders'}
                hidden={renderData.type == 'orders'}
                min={-999999}
                width="md"
                rules={[
                  {
                    required: true,
                  },
                ]}
                fieldProps={{
                  onChange: (e) => {
                    setdiscountOrder(e as number);
                    if (e) {
                      setFalg(true);
                    } else {
                      setFalg(false);
                    }
                  },
                }}
              />
              <ProFormText
                name="discountRemark"
                label="本次优惠原因"
                width="lg"
                fieldProps={{
                  autoComplete: 'no',
                }}
                disabled={renderData.type == 'orders'}
                hidden={renderData.type == 'orders'}
                rules={[{ required: falg, message: '请填写本次折扣原因' }]}
              />
            </>
          )}
          {renderData.type == 'orders' ? (
            <ProFormUser
              ref={userRef}
              label="退费人"
              name="userId"
              formRefs={formRef}
              setUserNameId={(e: any) => setUserNameId(e)}
              userName={{
                name: renderData?.userName?.split(',')[0],
                id: renderData?.userId?.split(',')[0],
              }}
            />
          ) : (
            <ProFormUser
              ref={userRef}
              label="收费人"
              name="userId"
              formRefs={formRef}
              setUserNameId={(e: any) => setUserNameId(e)}
            // userName={userName}
            />
          )}
        </ProForm.Group>
        <ProForm.Group>
          <ProFormDatePicker
            name="chargeTime"
            fieldProps={{
              showTime: false,
              disabledDate: disabledDate,
            }}
            width="md"
            label={`${orderTitle}日期`}
            rules={[{ required: true, message: '请填写缴费日期' }]}
          />
          <ProFormDateTimePicker
            name="paymentTime"
            fieldProps={{
              showTime: { format: 'HH:mm' },
              format: 'YYYY-MM-DD HH:mm',
            }}
            width="md"
            hidden={renderData.type == 'orders'}
            label={`${orderTitle == '收费' ? '实际到账' : orderTitle}日期`}
            rules={[{ required: renderData.type != 'orders', message: '请填写缴费日期' }]}
          />
          <ProFormDateTimePicker
            name="nextPaymentTime"
            width="md"
            label="下次缴费时间"
            fieldProps={{
              showTime: { format: 'HH:mm' },
              format: 'YYYY-MM-DD HH:mm',
            }}
            hidden={renderData.type == 'orders'}
            disabled={renderData.type == 'orders'}
          />
        </ProForm.Group>
        <div hidden={renderData.type == 'orders'}>
          <ProFormSelect
            name="fFalg"
            label="是否开具发票"
            valueEnum={{
              false: '否',
              true: '是',
            }}
            width="xs"
            fieldProps={{
              // defaultValue: 'false',
              onChange: (e) => {
                if (e == 'false') {
                  setfapiaoFalgFalg(false);
                } else {
                  setfapiaoFalgFalg(true);
                }
              },
              placeholder: '请选择',
            }}
            rules={[
              {
                required: renderData.type != 'orders',
              },
            ]}
          // required
          />
          <div hidden={!fapiaoFalg}>
            <ProFormList
              name="fapiao"
              creatorButtonProps={false}
              initialValue={[
                {
                  title: '',
                },
              ]}
              max={1}
              itemRender={({ listDom, action }, { record, index, name }) => {
                return (
                  <ProCard
                    title="发票信息"
                    style={{
                      width: '1050px',
                      border: '1px solid #bce8f1',
                      padding: '20px',
                      // marginTop: '10px',
                    }}
                  >
                    <ProForm.Group>
                      <ProFormText name="title" label="发票抬头" width="lg" required />
                      <ProFormSelect
                        label="商品种类"
                        name="productType"
                        width="md"
                        initialValue="0"
                        request={async () => Dictionaries.getList('invoiceProductType') as any}
                      />
                    </ProForm.Group>
                    <ProForm.Group>
                      <ProFormText name="taxCode" label="税号" width="md" required />
                      <ProFormDigit
                        name="amount"
                        label="金额"
                        width="md"
                        required
                        fieldProps={{ precision: 2 }}
                      />
                      <ProFormText name="email" label="学员邮箱" width="md" required />
                    </ProForm.Group>
                    <ProForm.Group>
                      <ProFormTextArea width={1100} label="发票备注" name="remark" />
                      <ProFormTextArea width={1100} label="注意事项" name="cautions" />
                    </ProForm.Group>
                    <ProForm.Group>
                      <ProFormSelect
                        label="发票种类"
                        name="type"
                        width="md"
                        fieldProps={{
                          onChange: (e) => {
                            const falgs = e == 0 ? false : true;
                            setinvoiceFalg(falgs);
                          },
                        }}
                        initialValue="0"
                        request={async () => Dictionaries.getList('invoiceType') as any}
                      />
                    </ProForm.Group>
                    <div hidden={!invoiceFalg}>
                      <ProForm.Group>
                        <ProFormText name="bank" label="开户行" width="md" required />
                        <ProFormText name="account" label="账号" width="md" required />
                      </ProForm.Group>
                      <ProForm.Group>
                        <ProFormText name="mobile" label="电话" width="md" required />
                        <ProFormText name="address" label="地址" width="md" required />
                      </ProForm.Group>
                    </div>
                  </ProCard>
                );
              }}
             />
          </div>
          <ProForm.Group title="税票信息">
            <Row
              style={{
                width: '1100px',
                backgroundColor: '#d9edf7',
                border: '1px solid #bce8f1',
                padding: '20px',
                marginBottom: '20px',
              }}
            >
              <Col span={2} style={{ color: 'red' }}>
                注意：
              </Col>
              <Col span={22}>
                （1）学历项目不开发票
                <br />
                （2）招生老师在下单时填写发票申请信息→出纳审核→出纳开具发票→招生老师领取发票或出纳发送电子发票给学员；
                <br />
                （3）选择不开票的业务收款，后期不再开具发票，否则会导致重复缴税。
                <br />
                （4）务必询问学员是否开咨询费，可降低风险。
                <br />
                （5）职称评审只可以开咨询费。
                <br />
                （6）如果学员开专票，需加收票面税率的税费（2023年为1%），原因是小规模纳税人开普票免税，而开专票不减免任何税费。
                <br />
                （7）请跟学员确定好开票信息，如果错误不重开，因为发票张数有限。
                <br />
                （8）若学员开个人发票，招生老师请提前告知学员个人发票一般公司不给报销，如因开具个人发票学员不能报销需要退回重开，财务不予开具。
              </Col>
            </Row>
          </ProForm.Group>
        </div>
        <ProForm.Group>
          <UploadDragger
            width={1100}
            label="上传附件"
            name="files"
            action="/sms/business/bizCharge/upload"
            renderData={chargeInfo ? chargeInfo : renderData}
            fileUrl={'/sms/business/bizCharge/download'}
            rules={[{ required: refundType == 1 ? false : true }]}
          />
          <ProFormTextArea
            width={1100}
            label={renderData.type != 'orders' ? '备注' : '退款原因'}
            name="description"
            rules={[{ required: true }]}
          />
        </ProForm.Group>
        <Row
          hidden={renderData.type == 'orders'}
          style={{
            width: '1100px',
            backgroundColor: '#d9edf7',
            border: '1px solid #bce8f1',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <Col span={2} style={{ color: 'red' }}>
            注意：
          </Col>
          <Col span={22}>
            （1）如客户名称与实际付款人不一致，请备注实际付款人姓名。
            <br />
            （2）如收费金额中包含代理费，请根据实际情况备注清楚。
            <br />
            （3）学历项目请按以下示例填写备注栏：
            <br />
            ①成考：
            <br />
            A.未交齐第一年学费：服务费1200+第一年学费第一次付款1000（23年 湖南工业大学
            机电一体化枝术 高升专 ）
            因个人原因报考成功，考试出现0分，录取不读，此费用均不退，可延续服务
            <br />
            B.第二次付款并交齐第一年学费的：第一年学费尾款1200（23年 湖南工业大学 机电一体化枝术
            高升专 ）
            <br />
            ②国开和网教：
            <br />
            A.第一次付款，未交齐第一年学费的：第一年学费第一次付款2000（23春 武汉理工大学 专升本
            土木工程专业）
            <br />
            B.第二次付款并交齐第一年学费的：第一年学费尾款2500（23春 武汉理工大学 专升本
            土木工程专业）
          </Col>
        </Row>
        {renderData.type != 'orders' ? (
          ''
        ) : (
          <div>
            <ProForm.Group title="退款领取人信息">
              <ProFormText
                name="recipientName"
                label="退费领取人"
                rules={[{ required: true }]}
                width="sm"
              />
              <ProFormSelect
                label="退款类型"
                name="refundType"
                width="md"
                request={async () => Dictionaries.getList('dict_refundType') as any}
                fieldProps={{
                  onChange: e => {
                    setRefundType(e)
                    if (e == 1) {
                      setrefundTypeFalg(false)
                    } else {
                      setrefundTypeFalg(true)
                    }
                  }
                }}
                rules={[
                  {
                    required: true,
                    message: '请选择退款类型',
                  },
                ]}
              />
            </ProForm.Group>
            <ProForm.Group>
              <ProFormText name="accountName" label="开户名" width="md" rules={[{ required: refundTypeFalg }]} />
              <ProFormText name="account" label="卡号" width="md" rules={[{ required: refundTypeFalg }]} />
              <ProFormText name="bank" label="开户行（精确到支行）" width="md" rules={[{ required: refundTypeFalg }]} />
            </ProForm.Group>
            <Row>
              <ProFormText name="agent" label="经办人" width="sm" />
              <Button
                style={{ marginTop: '30px', marginLeft: '-30px' }}
                type="primary"
                onClick={async () => {
                  if (!content) {
                    content = await request.get('/sms/share/getDepartmentAndUser');
                  }
                  setCardContent({ content: content.data, type: 'order' });
                  setCardVisible(true);
                }}
              >
                选择
              </Button>
            </Row>
            <ProForm.Group title="完结学员" />
            <Tables
              rowSelection={{
                // selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                onChange: (e, selectedRows) => {
                  setservedOrderIds(e);
                },
              }}
              columns={columns}
              dataSource={servedOrderTable}
              search={false}
            />
          </div>
        )}
      </div>
      {CardVisible && (
        <UserManageCard
          CardVisible={CardVisible}
          CardContent={CardContent}
          setCardVisible={() => setCardVisible(false)}
          setDepartment={(e: any) => setDepartment(e)}
          departments={[department]}
        />
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
      <Modal
        open={openModal}
        onCancel={() => {
          setOpenModal(false);
        }}
        onOk={() => {
          // formRef.current?.validateFieldsReturnFormatValue?.().then(async (values) => {
          //   await submitok(values);
          // });
          setOpenModal(false);
        }}
        okText="返回修改"
        cancelText=""
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '20px' }}>注意!</div>
          <div>当前订单欠费金额为负数,请确认是否有误</div>
        </div>
      </Modal>
      <Modal
        width={1200}
        open={ChargeModal}
        onCancel={() => setChargeModal(false)}
        onOk={() => setChargeModal(false)}
      >
        <Charge
          setChargeModal={() => setChargeModal(false)}
          setChargeInfo={(e: any) => setChargeInfo(e)}
          type="0"
          studentType={renderData.studentType}
          chargeType="chargeList"
          chargeTypes={true}
        />
      </Modal>
      <Modal
        width={1000}
        open={ChargeModals}
        onCancel={() => setChargeModals(false)}
        onOk={() => setChargeModals(false)}
      >
        <ChargesUp
          setChargeModals={() => setChargeModals(false)}
          setFromDataUp={(e: any) => {
            setFromDataUp(e);
          }}
        />
      </Modal>
    </ProForm>
  );
};
