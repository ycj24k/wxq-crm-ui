import Dictionaries from "@/services/util/dictionaries";
import { ProCard } from "@ant-design/pro-components";
import ProForm, { ProFormDatePicker, ProFormDateTimePicker, ProFormSelect } from "@ant-design/pro-form";
import { useRef, useState } from "react";
import UserTreeSelect from '@/components/ProFormUser/UserTreeSelect';

export default (props: any, orderRef: any) => {
  const { setModalVisible = undefined, callbackRef = undefined, renderData, admin, chargeType } = props;
  //订单数量
  const [orderCount, setOrderCount] = useState<any>(renderData.list);
  //收费人
  const [userNameId, setUserNameId] = useState<any>();
  const userRef: any = useRef(null);

  console.log(renderData.list,'renderDatalist')



  return (
    <>
      <ProCard>
        {orderCount.map((item: any, index: string) => {
          return (
            <>
              <ProForm
                autoFocusFirstInput
                submitter={false}
              >
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
                          // setThisChargeType(e)
                          // formRef.current?.setFieldValue('paymentTime', undefined)
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
                  {/* {thisChargeType == '6' && <ProFormText
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
                  />} */}
                  <ProFormSelect
                    label="付款方式"
                    name="method"
                    width="md"
                    //disabled={thisChargeType == '6'}
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
                    //disabled={thisChargeType == '6'}
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
                    label="缴费日期"
                    width="md"
                    //label={`${orderTitle}日期`}
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
                    label="收费日期"
                    // label={`${orderTitle == '收费' ? '实际到账' : orderTitle}日期`}
                    // disabled={['4', '6'].indexOf(thisChargeType) != -1}
                    // rules={[{ required: renderData.type != 'orders' && ['4', '6'].indexOf(thisChargeType) == -1, message: '请填写缴费日期' }]}
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
                <ProCard
                  title="订单班型详情缴费"
                 />
              </ProForm>
            </>
          )
        })}
      </ProCard>
    </>
  );
};
