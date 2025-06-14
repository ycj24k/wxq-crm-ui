import { Button, message, Modal, Radio, Spin, Steps } from 'antd';
import React, { forwardRef, useRef, useEffect } from 'react';
import { useState } from 'react';
import CompanyOrder from './companyOrder';
import ChargeOrder from '../AdminCharge/ChargeOrder';
import ChargeNew from '../AdminCharge/ChargeNew';
import Order from './Order';
import request from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import moment from 'moment';
import './index.less';
import e from 'express';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { history, useModel } from 'umi';
import { ProFormRadio } from '@ant-design/pro-form';
import apiRequest from '@/services/ant-design-pro/apiRequest';
import QrcodeInfo from '../AdminCharge/QrcodeInfo';
import dictionaries from '@/services/util/dictionaries';
const { Step } = Steps;
const { confirm } = Modal;
export default (props: any) => {
  const { modalVisible, setModalVisible, callbackRef, renderData, admin, callback } = props;
  const { initialState } = useModel('@@initialState');
  const providerId = initialState?.currentUser?.userid
  const [current, setCurrent] = useState(0);
  const [orderContent, setOrderContent] = useState<any>();
  const [orderId, setOrderId] = useState<any>();
  const [chargeInfo, setChargeInfo] = useState<any>();
  const [loging, setloging] = useState<boolean>(false);
  const [chargeType, setChargeType] = useState<number>();
  const [chargeId, setChargeId] = useState<number>();
  const [order, setOrder] = useState<any>();
  // const [steps, setSteps] = useState<any[]>([]);
  const CompanyOrders = forwardRef(CompanyOrder);
  const ChargeOrders = forwardRef(ChargeOrder);
  const ChargeNews = forwardRef(ChargeNew);
  const childRef = useRef() as any;
  const orderRef = useRef() as any;
  // const chargeTypeOptions = [
  //   {
  //     label: <><b>专属收款码支付</b>：学员已通过专属收款码支付，关联收款记录后需要补充部分信息</>,
  //     value: 6,
  //     style: { margin: '50px 150px 0px' }
  //   },
  //   {
  //     label: <><b>对公打款</b>：直接转账到公司公账银行卡账户</>,
  //     value: 5,
  //     style: { margin: '20px 150px 0px' }
  //   },
  //   {
  //     label: <><b>其他缴费</b>：填写缴费信息事需要上传学员支付截图，需等待财务审核确认</>,
  //     value: 0,
  //     style: { margin: '20px 150px 0px' }
  //   },
  //   {
  //     label: <><b>订单支付</b>：先生成订单再给学员扫码支出</>,
  //     value: 4,
  //     style: { margin: '20px 150px 0px' }
  //   },
  // ]
  // useEffect(() => {
  let chargeTypeOptions = dictionaries.list.find(x => x.code == "chargeType").children.filter((x: any) => ['0', '4', '5', '6'].includes(x.value)).map((x: any) =>
  ({
    style: { margin: '20px 150px 0px', display: 'block' },
    label: <><b>{x.name}</b>{x.description && '：' + x.description}</>,
    value: x.value,
    sort: x.sort,
  })
  ).sort((x: any, y: any) => x.sort - y.sort) || [{}]
  // chargeTypeOptions[0].style = { margin: '50px 150px 0px' }
  console.log("chargeTypeOptions", dictionaries.list)
  console.log("chargeTypeOptions", chargeTypeOptions)
  let steps = (renderData.type === 1
    ? [
      {
        title: '下单',
        content: (
          <CompanyOrders
            ref={childRef}
            renderData={renderData}
            // callbackRef={() => callbackRef()}
            admin="step"
          />
        ),
      },
      {
        title: '选择缴费方式',
        content: <Radio.Group
          onChange={(e) => { setChargeType(e.target.value) }}
          name="chargeType"
          options={chargeTypeOptions}
        >
          {/* <Radio value={0}>扫码支付：填写缴费信息后生成二维码，把二维码发送给学员，学员扫码支付</Radio>
            <Radio value={1}>对公打款：填写缴费信息后生成备注码，把备注码发送给学员，学员对公打款时将备注码填写入备注中，需等待财务关联打款</Radio>
            <Radio value={2}>手动缴费：填写缴费信息事需要上传学员支付截图，需等待财务审核确认</Radio> */}
        </Radio.Group>,
        // content: <ChargeOrders ref={orderRef} renderData={orderContent} admin="step" />,
      },
      {
        title: '缴费',
        content: <ChargeNews ref={orderRef} renderData={orderContent} chargeType={chargeType?.toString()} admin="step" />,
        // content: <ChargeOrders ref={orderRef} renderData={orderContent} admin="step" />,
      },
      {
        title: '添加学员',
        content: <Order orderId={orderId} type="1" orderIds={[orderId]} />,
      },
    ]
    : [
      {
        title: '下单',
        content: (
          <CompanyOrders
            ref={childRef}
            renderData={renderData}
            // callbackRef={() => callbackRef()}
            admin="step"
          />
        ),
      },
      {
        title: '选择缴费方式',
        content: <Radio.Group
          onChange={(e) => { setChargeType(e.target.value) }}
          name="chargeType"
          options={chargeTypeOptions}
        >
          {/* <Radio value={0}>扫码支付：填写缴费信息后生成二维码，把二维码发送给学员，学员扫码支付</Radio>
            <Radio value={1}>对公打款：填写缴费信息后生成备注码，把备注码发送给学员，学员对公打款时将备注码填写入备注中，需等待财务关联打款</Radio>
            <Radio value={2}>手动缴费：填写缴费信息事需要上传学员支付截图，需等待财务审核确认</Radio> */}
        </Radio.Group>,
        // content: <ChargeOrders ref={orderRef} renderData={orderContent} admin="step" />,
      },
      {
        title: '缴费',
        content: <ChargeNews ref={orderRef} renderData={orderContent} chargeType={chargeType?.toString()} admin="step" />,
        // content: <ChargeOrders ref={orderRef} renderData={orderContent} admin="step" />,
      },
      {
        title: '获取缴费信息',
        content: <>{chargeInfo}</>,
        // content: <ChargeOrders ref={orderRef} renderData={orderContent} admin="step" />,
      },
    ])
  // }, [])

  const callbackRefs = () => {
    setModalVisible(false);
    callbackRef();
  };
  const showConfirm = (obj: { title: string; content: string }, fn: () => void, data: any) => {
    confirm({
      title: obj.title,
      icon: <ExclamationCircleFilled />,
      content: obj.content,
      onOk() {
        fn();
      },
      onCancel() {
        let url = `/business/businessorder?studentName=${renderData.name}&project=${data.project}&classType=${data.classType}&classYear=${data.classYear}&examType=${data.examType}`;
        history.push(url);
      },
      okText: '继续下单缴费',
      cancelText: '前往订单列表',
    });
  };
  const pre = async () => {
  }
  const next = async () => {
    if (current == 0) {
      let values = childRef.current.formRefs.current.getFieldsValue();


      const standards = values.standards;
      // if (renderData.provider && !renderData.isFormal) {
      //   values.provider = renderData.provider
      // } else {
      //   values.provider = providerId
      // }
      let falg: boolean[] = [];
      await standards.forEach(
        async (item: { discount: number; discountRemark: string; provider: any }, index: number) => {
          if (item.provider)
            if (typeof item.provider == 'number') {
              item.provider = item.provider
            } else {
              // item.provider = Dictionaries.getUserId(item.provider.label)[0]
              item.provider = item.provider.value
            }
          if (!item.discount) {
            falg[index] = true;
            if (item.discount !== 0) {
              falg[index] = true;
              if (
                !item.discountRemark ||
                item.discountRemark === '' ||
                item.discountRemark === undefined
              ) {
                falg[index] = true;
              } else {
                falg[index] = false;
              }
            } else {
              falg[index] = false;
            }
          } else {
            if (item.discount !== 0) {
              falg[index] = true;
              if (
                !item.discountRemark ||
                item.discountRemark === '' ||
                item.discountRemark === undefined
              ) {
                falg[index] = true;
              } else {
                falg[index] = false;
              }
            } else {
              falg[index] = false;
            }
          }
        },
      );
      values = { ...values, ...values.standards[0] };
      // delete values.standards;
      if (!values.JobClassExam || values.project == '' || !values.provider || falg.indexOf(true) >= 0) {
        message.error('有选项未填完!');
        // setloging(false);
        return;
      }
      let jobClassExam = JSON.parse(values.JobClassExam)
      // if (!jobClassExam.examAmount) delete jobClassExam.examAmount
      setloging(true);
      const dataSearch = {
        parentId: '-1',
        enable: true,
        idCard: renderData.idCard,
        jobClassExam,
      };
      const orderListS = (await request.get('/sms/business/bizOrder', dataSearch)).data.content;
      console.log('values', values);
      const fn = () => {
        childRef.current.submitAddNew(values).then(async (res: any) => {
          if (res.status === 'success') {
            let orderList = (
              await request.get('/sms/business/bizOrder', { 'id-in': res.data.join(',') })
            ).data.content;
            orderList.forEach((item: any) => {
              item.orderId = item.id;
            });
            setOrderContent({ list: orderList, type: 'add' });
            setOrder(orderList[0])
            setOrderId(res.data.join(','));
            setloging(false);
            setCurrent(1);
          }
        });
      };
      if (
        orderListS.length > 0 &&
        orderListS.every((item: any) => item.status === 0) &&
        standards.length <= 1
      ) {
        showConfirm(
          {
            title: `该学员已经有选择的项目班型订单`,
            content: '请选择是否继续下相同项目订单',
          },
          fn,
          dataSearch,
        );
        return;
      } else {
        fn();
      }
    }
    if (current == 1) {
      if (chargeType == undefined) message.error('请选择缴费方式！')
      else {
        setCurrent(2)
        setTimeout(() => {
          orderRef.current.formRefs.current.setFieldsValue({
            type: chargeType + ""
          })
        }, 1000);

      }
    }
    if (current == 2) {
      doCharge('next');
    }
    // if (current == 3) {
    // }
    // setCurrent(current + 1);
  };

  const prev = () => {
    // if (current + 1 >= steps.length) {
    callbackRefs();
    //   return;
    // }
    // setCurrent(current + 1);
  };
  const doCharge = (type: string) => {
    const values = orderRef.current.formRefs.current.getFieldsValue();
    // console.log();

    // if (values.fFalg === undefined) {
    //   message.error('请填写是否开具发票');
    //   setloging(false);
    //   return;
    // } else if (values.fFalg == 'true') {
    // }
    if (values.discount) {
      if (values.discountRemark === undefined) {
        message.error('请填写优惠原因');
        setloging(false);
        return;
      }
    }
    // if (values.description === undefined) {
    //   message.error('请填写备注');
    //   setloging(false);
    //   return;
    // }
    if (values.paymentTime === undefined && ['4', '5'].indexOf(values.type) == -1) {
      message.error('请填写到账日期');
      setloging(false);
      return;
    }
    // if (values.amount === undefined) {
    //   message.error('请填写收费金额');
    //   setloging(false);
    //   return;
    // }
    if (values.method === undefined) {
      message.error('请填写付款方式');
      setloging(false);
      return;
    }
    // if (values.fFalg == 'true' || values.fFalg == '是') {
    //   let arrData = values.fapiao[0];
    //   const arr = ['title', 'taxCode', 'email', 'amount'];
    //   if (
    //     !arr.every((item) => {
    //       return arrData[item];
    //     })
    //   ) {
    //     message.error('发票信息尚未填充完整，请检查并补充!', 5);
    //     setloging(false);
    //     return;
    //   }
    // }
    if (values.fFalg == 'false') delete values.fapiao;
    Object.keys(values).forEach((item) => {
      if (values[item] == undefined) delete values[item];
    });
    values.paymentTime = moment(values.paymentTime).format('YYYY-MM-DD HH:mm:ss');
    values.chargeTime = moment(values.chargeTime).format('YYYY-MM-DD HH:mm:ss');
    values.nextPaymentTime = moment(values.nextPaymentTime).format('YYYY-MM-DD HH:mm:ss');
    // values.type = chargeType;
    // setChargeType(() => values.type)
    orderRef.current.submitok(values).then((res: any) => {
      // console.log('res' + res)
      // console.log('res.data[0]' + res.data[0])
      if (res.status === 'success') {
        if (type == 'next') {
          setloging(false);
          setChargeId(res.data[0])
          if (values.type == 0) {
            setChargeInfo(<div
              style={{
                textAlign: 'center',
                marginTop: '75px',
                fontSize: '25px'
              }}
            >已提交缴费，请等待财务审核</div>);
            setCurrent(3);
          }
          if (values.type == 4) {
            apiRequest.get('/sms/business/bizCharge', { id: res.data[0] }).then(charge => {
              if (charge.status == 'success') {
                let tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
                let tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
                setChargeInfo(<QrcodeInfo
                  src={'/sms/business/bizChargeQrcode/download?id=' + charge.data.content[0].chargeQrcodeId + '&fileName=' + charge.data.content[0].file + '&' + tokenName + '=' + tokenValue}
                  order={order}
                  charge={charge.data.content[0]}
                />)
                setCurrent(3);
              }
            })
          }
          if (values.type == 5) {
            apiRequest.get('/sms/business/bizCharge', { id: res.data[0] }).then(charge => {
              if (charge.status == 'success') {
                setChargeInfo(<div
                  style={{
                    textAlign: 'center',
                    marginTop: '75px',
                    fontSize: '25px'
                  }}
                >对公打款备注码已生成：{charge.data.content[0].code}</div>);
                setCurrent(3);
              }
            })
          }
          if (values.type == 6) {
            setChargeInfo(<div
              style={{
                textAlign: 'center',
                marginTop: '75px',
                fontSize: '25px'
              }}
            >已完成缴费</div>);
            setCurrent(3);
          }
        } else {
          setloging(false);
          callbackRefs();
        }
      }
    });
  };
  const over = () => {
    if (current == 1) {
      setloging(true);
      doCharge('over');
    } else {
      callbackRefs();
    }
  };
  return (
    <Modal
      width={1200}
      footer={null}
      title="学员下单"
      maskClosable={false}
      visible={modalVisible}
      onCancel={() => setModalVisible(false)}
    >
      <Spin spinning={loging}>
        <Steps current={current}>
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div className="steps-content">{steps[current]?.content}</div>
        <div className="steps-action" style={{ textAlign: 'right' }}>
          {current > 0 && (
            <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
              跳过
            </Button>
          )}
          {/* {current === 1 && (
            <Button type="default" onClick={() => pre()}>
              上一步
            </Button>
          )} */}
          {current < steps.length - 1 && (
            <Button type="primary" onClick={() => next()}>
              下一步
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button type="primary" onClick={() => over()}>
              完成
            </Button>
          )}
        </div>
      </Spin>
    </Modal>
  );
};
