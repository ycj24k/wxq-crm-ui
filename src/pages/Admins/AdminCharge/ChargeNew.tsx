import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Button, Col, message, Modal, Row, Space, Spin } from 'antd';
import {
  ProFormCheckbox,
  ProFormDatePicker,
  ProFormGroup,
  ProFormInstance,
  ProFormList,
} from '@ant-design/pro-form';
import ProForm, {
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
  ProFormDateTimePicker,
  ProFormSelect,
} from '@ant-design/pro-form';
import moment from 'moment';
import Dictionaries from '@/services/util/dictionaries';
import request from '@/services/ant-design-pro/apiRequest';
import ProCard from '@ant-design/pro-card';
import { useModel } from 'umi';
import UserManageCard from '../Department/UserManageCard';
import Charge from '../AdminCharge/Charge';
import Preview from '@/services/util/preview';
import UploadDragger from '@/components/UploadDragger/UploadDragger';
import ChargesUp from './ChargesUp';
import InvoiceRemarks from '@/pages/Business/Invoice/InvoiceRemarks';
import Invoice from '@/pages/Business/Invoice/Invoice';
import UserTreeSelect from '@/components/ProFormUser/UserTreeSelect';
import Audit from './Audit';
import CompanyOrder from '../AdminOrder/companyOrder';
import ChargeLog from '@/pages/Business/ChargeLog';
import dictionaries from '@/services/util/dictionaries';
export default (props: any, orderRef: any) => {
  const { setModalVisible = undefined, callbackRef = undefined, renderData, admin, chargeType } = props;

  const { initialState } = useModel('@@initialState');
  // const actionRefs = useRef<ActionType>();
  const [PreviewVisibles, setPreviewVisibles] = useState<boolean>(false);
  const [CardVisible, setCardVisible] = useState<boolean>(false);
  const [Spinngs, setSpinngs] = useState<boolean>(false);
  const [ChargeModal, setChargeModal] = useState<boolean>(false);
  const [ChargeModals, setChargeModals] = useState<boolean>(false);
  const [previewurl, setPreviewurl] = useState<any>();
  const [thisChargeType, setThisChargeType] = useState<any>();
  const [chargeLog, setChargeLog] = useState<Array<any> | null>();
  const [CardContent, setCardContent] = useState<any>();
  const [CorderVisibleFalg, setCOrderVisible] = useState<boolean>(false);
  const [order, setorder] = useState<any>(false);
  const [chargeLogVisible, setChargeLogVisible] = useState<any>(false);
  const [invoiceFalg, setinvoiceFalg] = useState<any>([]);
  const [fapiaoFalg, setfapiaoFalgFalg] = useState<any>([]);
  const [chargeNewList, setchargeNewList] = useState<any>([]);
  const [servedOrderIds, setservedOrderIds] = useState<any>([]);
  const [InvoiceContent, setInvoiceContent] = useState<any>([]);
  const [userNameId, setUserNameId] = useState<any>();
  const [InvoiceList, setInvoiceList] = useState<any>([]);
  const [chargeInfo, setChargeInfo] = useState<any>(false);
  const [spinning, setspinning] = useState<any>(false);
  const [AuditVisibleFalg, setAuditVisible] = useState<boolean>(false);
  const [auditData, setAuditData] = useState<any>({});
  const [hasAccount, setHasAccount] = useState<any>(false);
  const cNumber = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
  let fs = [false, false, false, false, false, false, false, false];
  let invoiceFalgs = [false, false, false, false, false, false, false, false];
  const projectName = ['成考', '国家开放大学	'];
  const [fromDataUp, setFromDataUp] = useState<any>(false);
  const userRef: any = useRef(null);
  const childRef = useRef();
  const CompanyOrders = forwardRef(CompanyOrder);
  let [department, setDepartment] = useState<any>({
    name: initialState?.currentUser?.name,
    id: initialState?.currentUser?.userid,
    departmentId: initialState?.currentUser?.departmentId,
  });
  const getOrder = (orderId: any) => {
    request.get('/sms/business/bizOrder', { id: orderId }).then((res: any) => {
      // let fromData = formRef.current?.getFieldsValue()
      for (let index = 0; index < renderData.list.length; index++) {
        const element = renderData.list[index];
        if (element.orderId == orderId) {
          delete res.data.content[0].amount
          delete res.data.content[0].description
          renderData.list[index] = { ...element, ...res.data.content[0] }
          genOrder()
          console.log(renderData)
          return
        }
      }
      // setorder(res.data.content[0]);
      // actionRefs.current?.reload();
    });
  };
  let tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
  let tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
  let obj = {};
  obj[tokenName] = tokenValue;
  const orderTitle = renderData.type == 'orders' ? '退费' : '收费';
  const orderAmountTitle = renderData.type == 'orders' ? '（-）' : '（+）';
  const ment = () => {
    formRef?.current?.setFieldsValue({
      agent: department.name,
    });
  };
  useEffect(() => {
    genOrder()
    setThisChargeType(chargeType)
    // console.log('123', getOrderCharge(idlist));

    // setTimeout(() => {
    //   setchargeNewList(chargeList);
    //   formRef?.current?.setFieldsValue({
    //     chargeLists: chargeList,
    //   });
    // }, 500);
  }, []);
  useEffect(() => {
    if (chargeLog) {
      setChargeLogVisible(false)
      let chargeLists = formRef?.current?.getFieldsValue().chargeLists;
      chargeLists[0].amount = chargeLog.reduce((x, y) => x + y.amount, 0)
      formRef?.current?.setFieldsValue({
        chargeLogName: chargeLog.map(x => x.name).join('、') + '的收款记录',
        paymentTime: chargeLog[0].paymentTime,
        userId: chargeLog[0].userId + '',
        method: chargeLog[0].method + '',
        chargeLists: chargeLists,
      });
      userRef?.current?.setDepartment({
        id: chargeLog[0].userId,
        name: dictionaries.getDepartmentUserName(chargeLog[0].userId)
      });
      setUserNameId({
        id: chargeLog[0].userId,
        name: dictionaries.getDepartmentUserName(chargeLog[0].userId)
      })
    }
  }, [chargeLog]);
  const genOrder = () => {
    setspinning(true);
    const list = renderData.list;

    const asyncList = async (lists: any) => {
      const PaymentLengthList = await getPaymentLength(list);
      return new Promise((resolve, reject) => {
        let promiseList: any = [];
        lists.forEach(async (item: any, index: number) => {
          let str =
            Dictionaries.getName('dict_class_type', item.classType) +
            '/' +
            Dictionaries.getName('dict_class_year', item.classYear) +
            '/' +
            Dictionaries.getName('dict_exam_type', item.examType);
          if (renderData.type == 'add') {
            promiseList.push({
              orderId: item.orderId,
              PaymentLength: 0,
              parentProjectList: Dictionaries.getCascaderAllName('dict_reg_job', item.project),
              projectList: Dictionaries.getCascaderName('dict_reg_job', item.project),
              banxin: str,
              quantity: item.quantity, //人数
              totalReceivable: item.receivable * item.quantity, //总额
              receivable: item.receivable, //收费标准
              // examAmount: item.examAmount, //收费标准
              charge: 0, //已收
              arrears: item.receivable * item.quantity - item.discount, //欠费
              source: Dictionaries.getName('dict_source', item.source),
              discount: item.discount, //优惠
              discountRemark: item.discountRemark, //优惠原因
              fFalg: 'false',
              percent: item.percent ? item.percent * 100 + '%' : null,
              // referrerName: item.referrerName,
              ownerName: item.ownerName,
              studentName: item.studentName,
              isCalculation: item.isCalculation,
              providerName: item.providerName,
            });

          } else {
            // const Invoice = (await request.get('/sms/business/bizInvoice', { chargeIds: item.id, _isGetAll: true, enable: true })).data.content
            let arr: any = JSON.parse(JSON.stringify(InvoiceList));
            arr[index] = item
            setInvoiceList(arr)
            // if (renderData.types == 'eidt' && item.invoiceTitle) {
            //   const arr: any = JSON.parse(JSON.stringify(fs));
            //   arr[index] = true;
            //   setfapiaoFalgFalg(arr);
            //   if (item.invoiceType == 1) {
            //     const arr: any = JSON.parse(JSON.stringify(invoiceFalgs));
            //     arr[index] = true;
            //     setinvoiceFalg(arr);
            //   }
            // }
            promiseList.push({
              orderId: item.orderId,
              PaymentLength: await getOrderCharge(item.orderId, PaymentLengthList),
              parentProjectList: Dictionaries.getCascaderAllName('dict_reg_job', item.project),
              projectList: Dictionaries.getCascaderName('dict_reg_job', item.project),
              banxin: str,
              chargeId: item.chargeId,
              studentName: item.studentName,
              isCalculation: item.isCalculation,
              quantity: item.quantity, //人数
              totalReceivable: item.totalReceivable, //总额
              receivable: item.receivable, //收费标准
              // examAmount: item.examAmount, //收费标准
              charge: item.charge, //已收
              arrears: item.arrears, //欠费
              discount: item.discount, //优惠
              discountRemark: item.discountRemark, //优惠原因
              source: Dictionaries.getName('dict_source', item.source),
              amount: item.amount ? item.amount : 0,
              collectedAmount: item.collectedAmount,
              performanceAmount: item.performanceAmount,
              commissionBase: item.commissionBase,
              description: item.description ? item.description : '',
              description2: item.description2 ? item.description2 : '',
              surplus: item.arrears - item.amount,
              // fFalg: item.invoiceTitle ? 'true' : 'false',
              // account: item.invoiceAccount,
              // address: item.invoiceAddress,
              // amounts: item.invoiceAmount,
              // invoiceId: item.invoiceId,
              // bank: item.invoiceBank,
              // title: item.invoiceTitle,
              // productType: item.invoiceProductType == 0 ? item.invoiceProductType + '' : null,
              // taxCode: item.invoiceTaxCode,
              // email: item.invoiceEmail,
              // remark: item.invoiceRemark,
              // cautions: item.invoiceCautions,
              // type: item.invoiceType ? item.invoiceType + '' : '0',
              // mobile: item.invoiceMobile,
              percent: item.percent ? item.percent * 100 + '%' : null,
              // referrerName: item.referrerName,
              ownerName: item.ownerName,
              providerName: item.providerName,
              percents: item.percent ? item.amount * item.percent : '-',
            });
          }
        });
        resolve(promiseList);
      });
    };
    asyncList(list).then((res) => {
      setTimeout(() => {
        setspinning(false);
        setchargeNewList(res);
        const fiedsValue = renderData.list[0];
        if (fiedsValue?.files && typeof fiedsValue?.files == 'string') {
          let arr: { uid: number; name: any; response: { data: any } }[] = [];
          fiedsValue?.files?.split(',').forEach((item: any, index: number) => {
            arr.push({
              uid: index + 1,
              name: item,
              response: { data: item },
            });
          });
          fiedsValue.files = arr;
        }
        // Object.keys(fiedsValue).forEach((key: string) => {
        //   if (typeof fiedsValue[key] == 'number') {
        //     fiedsValue[key] = fiedsValue[key] + '';
        //   }
        // });
        fiedsValue.type = fiedsValue.type != null ? fiedsValue.type + '' : fiedsValue.type;
        fiedsValue.method = fiedsValue.method != null ? fiedsValue.method + '' : fiedsValue.method;
        console.log('renderData.list[0]', renderData.list[0]);
        console.log('res', res);
        console.log('fiedsValue', fiedsValue);
        // if (renderData.types == 'eidt') {
        if (!!fiedsValue.userId) {
          formRef?.current?.setFieldsValue({
            ...fiedsValue,
            chargeLists: res,
          });
          userRef?.current?.setDepartment({
            id: (fiedsValue.userId + '').split(',')[0],
            name: fiedsValue.userName.split(',')[0],
          });
          setUserNameId({
            id: (fiedsValue.userId + '').split(',')[0],
            name: fiedsValue.userName.split(',')[0],
            departmentId: fiedsValue.departmentId,
          })
        } else {
          formRef?.current?.setFieldsValue({
            // ...renderData.list[0],
            ...fiedsValue,
            chargeLists: res,
          });
          userRef?.current?.setDepartment(department);
          setUserNameId(department)
        }
      }, 500);
    });
  }
  useEffect(() => {
    fs = fapiaoFalg;
    invoiceFalgs = invoiceFalg;
  }, [fapiaoFalg, invoiceFalg]);

  const setInvoiceContentFn = async (e: boolean, index: number) => {
    const list = JSON.parse(JSON.stringify(InvoiceContent))
    if (list[index]) {
      console.log('list[index]', list[index]);

    } else {
      const listInfo = (await request.get('/sms/business/bizInvoice', { studentUserId: renderData.list[index].studentUserId })).data.content[0]
      if (listInfo) {
        let formValue = formRef?.current?.getFieldValue('chargeLists')
        const valueInfo = formValue[index]
        delete listInfo.amount
        listInfo.amounts = valueInfo.amount
        Object.keys(listInfo).forEach((key: string) => {
          if (typeof listInfo[key] == 'number') {
            listInfo[key] = listInfo[key] + '';
          }
        });
        formValue[index] = { ...valueInfo, ...listInfo }
        console.log('formValue', formValue);
        formRef?.current?.setFieldsValue({
          chargeLists: formValue,
        });
      }

    }
  }
  const getPaymentLength = async (list: any) => {
    if (renderData.type == 'add') return;
    let listId = list.map((item: any) => {
      return { orderId: item.orderId };
    });
    const arr = (
      await request.get('/sms/business/bizCharge/statistics', { array: JSON.stringify(listId) })
    ).data.map((itemLength: any, index: number) => {
      return { orderId: listId[index].orderId, PaymentLength: itemLength };
    });
    return arr;
  };
  const getOrderCharge = async (id: any, PaymentLengthList: any) => {
    if (PaymentLengthList.length == 0) return;
    let lengths = 0;
    PaymentLengthList.forEach((item: any) => {
      if (item.orderId == id) {
        lengths = item.PaymentLength;
      }
    });
    if (renderData.types == 'eidt') {
      lengths = lengths - 1;
    }
    return lengths;
  };
  const amountFn = async (index: any) => {
    //chargeNewList
    let chargeList = formRef?.current?.getFieldsValue().chargeLists;
    const charge = chargeList[index]
    const amount = charge.amount
    charge.surplus = Number(charge.arrears) - amount;
    charge.fFalg = fapiaoFalg[index] ? 'true' : 'false';
    if (
      projectName.indexOf(
        Dictionaries.getCascaderAllName('dict_reg_job', charge.project),
      ) >= 0
    ) {
      charge.description = '';
    } else {
      if (amount % charge.quantity !== 0) {
        charge.description = '';
      } else {
        let many = '';
        if (amount - charge.arrears >= 0 && charge.PaymentLength == 0) {
          many = '全款';
        } else if (amount - charge.arrears >= 0 && charge.PaymentLength != 0) {
          many = '尾款';
        } else {
          many = '第' + cNumber[charge.PaymentLength] + '次';
        }
        let people = charge.quantity + '*';
        let money = (amount - (charge.collectedAmount || 0)) / charge.quantity;
        charge.description = many + people + money;
      }
    }
    if (charge.percent) {
      const percent = charge.percent.slice(0, charge.percent.indexOf('%'));
      charge.percents = (percent / 100) * amount;
    }
    if (charge.collectedAmount != undefined) {
      charge.performanceAmount = amount - charge.collectedAmount
      charge.commissionBase = amount - charge.collectedAmount
    }
    setchargeNewList(chargeList);
    formRef?.current?.setFieldsValue({
      chargeLists: chargeList,
    });
  };
  const CalculationFn = async (e: any, index: any) => {
    let chargeList = formRef?.current?.getFieldsValue().chargeLists[index];
    await request.post('/sms/business/bizCharge/reports/setIsCalculation', {
      ids: chargeList.chargeId,
      isCalculation: e,
    });
  };
  useImperativeHandle(orderRef, () => ({
    submitok: submitok,
    formRefs: formRef,
  }));
  useEffect(() => {
    ment();
  }, [department]);
  const formRef = useRef<ProFormInstance>();
  useEffect(() => {
    formRef?.current?.setFieldsValue({
      chargeTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
  }, []);

  const filter = (inputValue: string, path: any[]) => {
    return path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
  };


  const priceChange = (e: any) => {
    let formValue = formRef?.current?.getFieldValue('chargeLists')
    let from = formValue[e]
    const price = from.price || 0
    const quantity = from.quantity || 0
    from.amounts = price * quantity;
    formRef.current?.setFieldValue('chargeLists', formValue)
    console.log(formValue)
  }
  const objDelete = (obj: any) => {
    Object.keys(obj).forEach((key: any) => {
      if (obj[key] == undefined || obj[key] == 'undefined' || obj[key] == null) {
        delete obj[key];
      }
    });
  };
  const submitok = (value: any, type: string = 'add') => {
    setSpinngs(true)
    if (!fapiaoFalg) delete value.fapiao;
    let arrData = '';
    let data: any = [];
    let dataFapiao: any = [];
    if (value.files) {
      let arr: any[] = [];
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
    value.userId = userNameId.id;
    value.departmentId = userNameId.departmentId;
    if (value.type == undefined) value.type = renderData.type == 'orders' ? '1' : 0;
    if (thisChargeType == '6') value.chargeLogIds = chargeLog?.map(x => x.id).join(',')
    value.chargeLists.forEach((item: any) => {
      data.push({
        chargeLogIds: value.chargeLogIds,
        chargeTime: value.chargeTime,
        method: value.method,
        userId: value.userId,
        departmentId: value.departmentId,
        type: value.type,
        paymentTime: value.paymentTime,
        id: item.chargeId,
        orderId: item.orderId,
        description: item.description,
        description2: item.description2,
        amount: item.amount,
        collectedAmount: item.collectedAmount,
        performanceAmount: item.performanceAmount,
        commissionBase: item.commissionBase,
        isSubmit: true,
        // nextPaymentTime: value.nextPaymentTime + ':00',
        files: value.files,
      });
      if (item.fFalg == 'false') {
        dataFapiao.push({});
      } else {
        dataFapiao.push({
          account: item.account,
          address: item.address,
          chargeId: item.chargeId,
          amount: item.amounts,
          id: item.invoiceId,
          bank: item.bank,
          title: item.title,
          productType: item.productType,
          price: item.price,
          quantity: item.quantity,
          chargeAccount: item.chargeAccount,
          taxCode: item.taxCode,
          email: item.email,
          remark: item.remark,
          cautions: item.cautions,
          type: item.invoiceType,
          mobile: item.mobile,
        });
      }
    });
    objDelete(data);
    objDelete(value);
    return new Promise((resolve) => {
      let url =
        renderData.types == 'eidt'
          ? '/sms/business/bizCharge/edit'
          : '/sms/business/bizCharge/saves';
      let reqData = renderData.types == 'eidt' ? data : { array: data, array2: dataFapiao };
      request
        .postAll(url, reqData)
        .then((res: any) => {
          if (res.status == 'success') {
            const mes = () => {
              message.success('操作成功');
              if (setModalVisible) {
                setSpinngs(false)
                setModalVisible();
                callbackRef();
              }
              resolve(res);
            };
            if (renderData.types == 'eidt') {
              let fapiaoList: any = [];
              dataFapiao.forEach((item: any) => {
                console.log('123', Object.keys(item));

                if (Object.keys(item).length > 0) {
                  fapiaoList.push(item);
                }
              });
              // request.postAll('/sms/business/bizInvoice/saveArray', { array: fapiaoList });
            }
            if (type == 'audit') {
              console.log('value.chargeLists', value.chargeLists);

              let auditIds: any = []
              value.chargeLists.forEach(async (item: any) => {
                auditIds.push(request.post('/sms/business/bizAudit', {
                  entityId: item.chargeId,
                  confirm: true,
                  auditType: '0',
                }))
                const invoiceData = (await request.get('/sms/business/bizInvoice', {
                  enable: true, chargeIds: item.chargeId
                })).data.content
                if (invoiceData.length > 0) {
                  auditIds.push(
                    request.post('/sms/business/bizAudit', {
                      entityId: invoiceData[0].id,
                      confirm: true,
                      auditType: '11',
                    })
                  )
                }
              });

              Promise.all(auditIds).then((ress) => {
                mes();

              }).catch((error) => {
                setSpinngs(false)
              })
            } else {
              mes();
            }
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
                  <Col span={24} offset={17}>
                    <Space>
                      {dom}
                      <Spin spinning={Spinngs}>
                        <Button
                          htmlType="button"
                          type="primary"
                          hidden={renderData.types != 'eidt'}
                          onClick={async () => {
                            // if (order.arrears - amounts.amount - amounts.discount < 0) {
                            //   setOpenModal(true);
                            //   setOpenType('audit');
                            //   return;
                            // }
                            formRef.current
                              ?.validateFieldsReturnFormatValue?.()
                              .then(async (values) => {
                                console.log('校验表单并返回格式化后的所有数据：', values);
                                await submitok(values, 'audit');
                              });
                          }}
                          key="edit"
                        >
                          修改并审核通过
                        </Button>
                      </Spin>
                      <Spin spinning={Spinngs}>
                        <Button
                          htmlType="button"
                          type="dashed"
                          hidden={renderData.types != 'eidt'}
                          onClick={async () => {
                            let id = []
                            for (let i = 0; i < renderData.list.length; i++) {
                              id[i] = renderData.list[i].id
                            }
                            setAuditData({ id: id, type: 0, confirm: false });
                            setAuditVisible(true);
                          }}
                          key="edit"
                        >
                          不通过
                        </Button>
                        <Audit
                          setModalVisible={() => setAuditVisible(false)}
                          modalVisible={AuditVisibleFalg}
                          callbackRef={() => {
                            callbackRef()
                            setModalVisible()
                          }}
                          renderData={auditData}
                        />
                      </Spin>
                    </Space>

                  </Col>
                </Row>
              );
            },
          }
      }
      formRef={formRef}
      autoFocusFirstInput
      initialValues={{
        userId: userNameId?.id
      }}
      onFinish={async (values) => {
        await submitok(values);
        // message.success('提交成功');
      }}
    >
      <Spin spinning={spinning}>
        <div className="scolle" style={{ overflowX: 'auto', paddingBottom: '100px' }}>
          <ProForm.Group>
            {renderData.type == 'orders' ? <ProFormSelect
              label="缴费类型"
              name="type"
              width="md"
              request={async () =>
                Dictionaries.getList('chargeType') as any
              }
              // valueEnum={{
              //   0: '订单缴费',
              //   1: '订单退费',
              // }}
              required
              disabled
              fieldProps={{
                defaultValue: renderData.type == 'orders' ? ['订单退费'] : ['订单缴费'],
              }}
            /> :
              <ProFormSelect
                label="缴费类型"
                name="type"
                width="md"
                request={async () =>
                  Dictionaries.getList('chargeType')?.filter(x => ['0', '4', '5', '6'].indexOf(x.value) != -1) as any
                }
                fieldProps={{
                  onChange(e) {
                    console.log('e', e)
                    setThisChargeType(e)
                    formRef.current?.setFieldValue('paymentTime', undefined)
                  }
                }}
                // valueEnum={{
                //   0: '订单缴费',
                //   1: '订单退费',
                // }}
                required
                initialValue={chargeType}
                disabled={chargeType != undefined}
              // fieldProps={{
              //   defaultValue: renderData.type == 'orders' ? ['订单退费'] : ['订单缴费'],
              // }}
              />
            }
            {thisChargeType == '6' && <ProFormText
              label="收款记录"
              name="chargeLogName"
              width="md"
              rules={[
                {
                  required: true,
                },
              ]}
              fieldProps={{
                onClick: () => {
                  setChargeLog(null)
                  setChargeLogVisible(true)
                  return false
                }
              }}
            />}
            <ProFormSelect
              label="付款方式"
              name="method"
              width="md"
              disabled={thisChargeType == '6'}
              request={async () => Dictionaries.getList('dict_stu_refund_type') as any}
              rules={[
                {
                  required: true,
                  message: '请选择付款方式',
                },
              ]}
            />
            <UserTreeSelect
              ref={userRef}
              userLabel={renderData.type == 'orders' ? '退费人' : '收费人'}
              userNames="userId"
              userPlaceholder="请输入招生老师的名字"
              setUserNameId={(e: any) => setUserNameId(e)}
              disabled={thisChargeType == '6'}
              // setDepartId={(e: any) => setDepartId(e)}
              flag={true}
            // setFalgUser={(e: any) => setFalgUser(e)}
            />
            {/* {renderData.type == 'orders' ? (
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
            )} */}
          </ProForm.Group>
          <ProForm.Group>{renderData.type == 'orders' ? '' : <></>}</ProForm.Group>
          <ProForm.Group>
            <ProFormDatePicker
              name="chargeTime"
              fieldProps={{
                showTime: { format: 'HH:mm:ss' },
                format: 'YYYY-MM-DD HH:mm:ss',
                // disabledDate: disabledDate,
              }}
              width="md"
              label={`${orderTitle}日期`}
              rules={[{ required: true, message: '请填写缴费日期' }]}
            />
            <ProFormDateTimePicker
              name="paymentTime"
              fieldProps={{
                showTime: { format: 'HH:mm:ss' },
                format: 'YYYY-MM-DD HH:mm:ss',
              }}
              width="md"
              hidden={renderData.type == 'orders'}
              label={`${orderTitle == '收费' ? '实际到账' : orderTitle}日期`}
              disabled={['4', '5', '6'].indexOf(thisChargeType) != -1}
              rules={[{ required: renderData.type != 'orders' && ['4', '5', '6'].indexOf(thisChargeType) == -1, message: '请填写缴费日期' }]}
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
          <ProFormList
            name="chargeLists"
            creatorButtonProps={false}
            deleteIconProps={false}
            copyIconProps={false}
            itemRender={({ listDom, action }, { record, index, name }) => {
              return (
                <ProCard
                  bordered
                  style={{
                    marginBottom: 8,
                  }}
                  key={index}
                  title="订单班型详情缴费"
                >
                  <ProFormGroup key={index}>
                    <ProForm.Group>
                      <ProFormText label="报名学员/企业" name="studentName" readonly />
                      <ProFormText label="项目总称" name="parentProjectList" readonly />
                      <ProFormText label="报考岗位" name="projectList" readonly />
                      <ProFormText label="订单班型" name="banxin" readonly />
                      <ProFormText label="班型收费标准" name="receivable" readonly />
                      {/* <ProFormText label="考试费" name="examAmount" readonly /> */}
                      <ProFormText label="订单人数" name="quantity" readonly />
                      <ProFormText label="订单应收总额" name="totalReceivable" readonly />
                      <ProFormText label="订单优惠金额" name="discount" readonly />
                      <ProFormText label="订单已收金额" name="charge" readonly />
                      <ProFormText label="订单当前欠费" name="arrears" readonly />
                    </ProForm.Group>
                    <ProForm.Group>
                      <ProFormDigit
                        label={`本次${orderTitle}金额`}
                        name="amount"
                        width="sm"
                        fieldProps={{
                          precision: 2,
                          onChange: (e) => {
                            amountFn(index);
                          },
                        }}
                        rules={[
                          {
                            required: true,
                          },
                        ]}
                      />
                      {/* 退费则隐藏 */}
                      {renderData.type != 'orders' &&
                        <ProFormDigit
                          hidden={renderData.type == 'orders'}
                          tooltip="返代理费、快递费、税费，不包含在收费标准里的报名费等"
                          label={`代收款项`}
                          name="collectedAmount"
                          width="sm"
                          fieldProps={{
                            onChange: (e) => {
                              amountFn(index);
                            },
                          }}
                          rules={[
                            {
                              required: true,
                            },
                          ]}
                        />
                      }
                      {/* {renderData.types == 'eidt' && */}
                      <ProFormDigit
                        label={`业绩金额` + orderAmountTitle}
                        readonly={renderData.types != 'eidt'}
                        name="performanceAmount"
                        width="sm"
                      />
                      {/* } */}
                      {/* {renderData.type != 'orders' && */}
                      <ProFormDigit
                        label={`提成基数` + orderAmountTitle}
                        readonly={renderData.types != 'eidt'}
                        name="commissionBase"
                        width="sm"
                      />
                      {/* } */}

                      {/* <ProFormText label={`业绩金额` + orderAmountTitle} name="performanceAmount" readonly /> */}
                      <ProFormText label="订单来源" name="source" readonly />
                      <ProFormText label="本次收费后剩余尾款" name="surplus" readonly />
                      <ProFormText label="订单优惠原因" name="discountRemark" readonly />
                      {/* <ProFormText label="学员推荐人" name="referrerName" readonly /> */}
                      <ProFormText label="信息所有人" name="ownerName" readonly />
                      <ProFormText label="信息所有人分成比例" name="percent" readonly />
                      <ProFormText label="信息所有人分成金额" name="percents" readonly />
                      <ProFormText label="信息提供人" name="providerName" readonly />
                      <Button type="primary" onClick={() => {
                        request.get('/sms/business/bizOrder', { id: record.orderId }).then((res: any) => {
                          // setorder(res.data.content[0]);
                          // actionRefs?.current?.reload();
                          setorder(res.data.content[0])
                          console.log(record)
                          setCOrderVisible(true)
                        });
                      }}>
                        编辑订单
                      </Button>
                    </ProForm.Group>

                    <ProFormTextArea
                      width={1100}
                      label={renderData.type != 'orders' ? '备注' : '退款原因'}
                      name="description"
                      rules={[{ required: true }]}
                    />
                    <ProFormTextArea
                      hidden={renderData.types != 'eidt'}
                      width={1100}
                      label={'财务备注'}
                      name="description2"
                    />
                    <div hidden={renderData.types != 'eidt'}>
                      <ProForm.Group title='发票信息'></ProForm.Group>
                      <Invoice chargeId={InvoiceList[index]} />
                    </div>
                    <div hidden={renderData.type == 'orders' || renderData.types == 'eidt'}>
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
                            const arr: any = JSON.parse(JSON.stringify(fs));
                            console.log('renderDatass', renderData);

                            if (e == 'false') {
                              arr[index] = false;
                              fs = arr;
                              setfapiaoFalgFalg(arr);
                            } else {
                              setInvoiceContentFn(true, index)
                              arr[index] = true;
                              fs = arr;
                              setfapiaoFalgFalg(arr);
                            }
                          },
                          placeholder: '请选择',
                        }}
                      // rules={[
                      //   {
                      //     required: renderData.type != 'eidt',
                      //   },
                      // ]}
                      // required
                      />
                      {!!fapiaoFalg[index] &&
                        <div hidden={!fapiaoFalg[index]}>
                          <ProForm.Group title="税票信息">
                            <InvoiceRemarks />
                          </ProForm.Group>
                          <div>
                            <ProForm.Group>
                              <ProFormText name="title" label="发票抬头" width="lg" required />
                              <ProFormSelect
                                label="商品种类"
                                name="productType"
                                width="md"
                                initialValue="0"
                                required
                                request={async () =>
                                  Dictionaries.getList('invoiceProductType') as any
                                }
                              />
                            </ProForm.Group>
                            <ProForm.Group>

                              <ProFormSelect
                                label="付款方式"
                                name="chargeAccount"
                                rules={[{ required: true }]}
                                width="md"
                                request={async () => Dictionaries.getList('dict_stu_refund_type') as any}
                              />
                              <ProFormDigit name='price' label='单价' rules={[{ required: true }]} fieldProps={{
                                onChange: e => priceChange(index)
                              }} />
                              <ProFormDigit name='quantity' label='数量' rules={[{ required: true }]} fieldProps={{
                                onChange: e => priceChange(index)
                              }} />
                            </ProForm.Group>
                            <ProForm.Group>
                              <ProFormText name="taxCode" label="税号" width="md" required />
                              <ProFormDigit
                                name="amounts"
                                label="金额"
                                width="md"
                                required
                                fieldProps={{ precision: 2 }}
                              />
                              <ProFormText
                                name="email"
                                label="学员邮箱"
                                width="md"
                                required
                                fieldProps={{
                                  autoComplete: 'no',
                                }}
                              />
                            </ProForm.Group>
                            <ProForm.Group>
                              <ProFormTextArea
                                width={1100}
                                label="发票备注"
                                name="remark"
                                fieldProps={{
                                  autoComplete: 'no',
                                }}
                              />
                              <ProFormTextArea
                                width={1100}
                                label="注意事项"
                                name="cautions"
                                fieldProps={{
                                  autoComplete: 'no',
                                }}
                              />
                            </ProForm.Group>
                            <ProForm.Group>
                              <ProFormSelect
                                label="发票种类"
                                name="invoiceType"
                                width="md"
                                fieldProps={{
                                  onChange: (e) => {
                                    // let falgs = e == 0 ? false : true;
                                    // setinvoiceFalg(falgs);
                                    const arr: any = JSON.parse(JSON.stringify(invoiceFalgs));
                                    if (e == 0) {
                                      arr[index] = false;
                                      invoiceFalgs = arr;
                                      setinvoiceFalg(arr);
                                      setHasAccount(false)
                                    } else {
                                      arr[index] = true;
                                      invoiceFalgs = arr;
                                      setinvoiceFalg(arr);
                                      setHasAccount(true)
                                    }
                                  },
                                }}
                                initialValue="0"
                                request={async () => Dictionaries.getList('invoiceType') as any}
                              />
                              <ProFormCheckbox.Group
                                hidden={hasAccount}
                                name="hasAccount"
                                layout="vertical"
                                label=" "
                                options={['填写账号信息']}
                                fieldProps={{
                                  onChange: (e) => {
                                    const arr: any = JSON.parse(JSON.stringify(invoiceFalgs));
                                    if (e.length > 0) {
                                      arr[index] = true;
                                      invoiceFalgs = arr;
                                      setinvoiceFalg(arr);
                                    } else {
                                      arr[index] = false;
                                      invoiceFalgs = arr;
                                      setinvoiceFalg(arr);
                                    }
                                  },
                                }}
                              />
                            </ProForm.Group>
                            <div hidden={!invoiceFalg[index]}>
                              <ProForm.Group>
                                <ProFormText name="bank" label="开户行" width="md"
                                  rules={[{ required: !!invoiceFalg[index] }]} />
                                <ProFormText name="account" label="账号" width="md"
                                  rules={[{ required: !!invoiceFalg[index] }]} />
                              </ProForm.Group>
                              <ProForm.Group>
                                <ProFormText name="mobile" label="电话" width="md"
                                  rules={[{ required: !!invoiceFalg[index] }]} />
                                <ProFormText name="address" label="地址" width="md"
                                  rules={[{ required: !!invoiceFalg[index] }]} />
                              </ProForm.Group>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  </ProFormGroup>
                </ProCard>
              );
            }}
          ></ProFormList>

          <ProForm.Group>
            <UploadDragger
              width={1100}
              label="上传附件"
              name="files"
              action="/sms/business/bizCharge/upload"
              renderData={chargeInfo ? chargeInfo : renderData.list[0]}
              fileUrl={'/sms/business/bizCharge/download'}
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
        </div>
      </Spin>
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
      <Modal
        title="编辑"
        width={1200}
        visible={CorderVisibleFalg}
        onCancel={() => setCOrderVisible(false)}
        destroyOnClose={true}
        footer={null}
      >
        {CorderVisibleFalg && (
          <CompanyOrders
            ref={childRef}
            editAll={renderData.types == 'eidt'}
            setModalVisible={() => setCOrderVisible(false)}
            modalVisible={CorderVisibleFalg}
            callbackRef={() => getOrder(order.id)}
            renderData={{ ...order, type: 'order', orderNumber: 0, projectClassExamList: [] }}
          />
        )}
      </Modal>
      <Modal
        title="选择收款记录"
        width={1200}
        visible={chargeLogVisible}
        onCancel={() => setChargeLogVisible(false)}
        footer={null}
      >
        <ChargeLog select={setChargeLog} type={1} />
      </Modal>
    </ProForm>
  );
};
