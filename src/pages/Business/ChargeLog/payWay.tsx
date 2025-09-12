import type {
    ProFormInstance} from '@ant-design/pro-form';
import ProForm, {
    ProFormText,
    ProFormDateTimePicker,
    ProFormSelect,
    ProFormDigit,
    ProFormTextArea
} from '@ant-design/pro-form';
import Dictionaries from '@/services/util/dictionaries';
import ProCard from '@ant-design/pro-card';
import UserTreeSelect from '@/components/ProFormUser/UserTreeSelect';
import { useRef, useState, forwardRef, useImperativeHandle, useEffect } from "react";
import moment from 'moment';
interface PayWayMethods {
    getFormValues: () => Promise<any>;
    addPayWayItem: () => void;
    removePayWayItem: (index: number) => void;
    resetPayWay: () => void;
}

const PayWay = forwardRef<PayWayMethods, any>((props, ref) => {
    const { renderData, payMessage } = props;
    console.log(renderData,'paywayRenderData')
    const [payWayList, setPayWayList] = useState<number[]>([0]); // 用于管理多个支付方式表单
    const formRefs = useRef<Record<number, ProFormInstance>>({});

    useImperativeHandle(ref, () => ({
        getFormValues: async () => {
            try {
                // 收集所有支付方式表单的值
                const allValues = await Promise.all(
                    payWayList.map(async (index) => {
                        if (formRefs.current[index]) {
                            return await formRefs.current[index].validateFields();
                        }
                        return null;
                    })
                );

                // 过滤掉空值
                const validValues = allValues.filter(Boolean);

                // 计算总金额
                let totalAmount = 0;
                validValues.forEach(values => {
                    if (values.amount) {
                        totalAmount += parseFloat(values.amount);
                    }
                });

                // 如果有 payMessage 且有 amount 字段，验证总金额
                if (payMessage?.amount && Math.abs(totalAmount - payMessage.amount) > 0.01) {
                    // 返回一个带有警告信息的对象
                    return {
                        values: validValues,
                        // warning: {
                        //     title: '金额不匹配',
                        //     message: `所有支付方式的金额总和(${totalAmount.toFixed(2)})与应收金额(${payMessage.amount.toFixed(2)})不一致，请检查金额是否正确。`,
                        //     totalAmount: totalAmount.toFixed(2),
                        //     expectedAmount: payMessage.amount.toFixed(2)
                        // }
                    };
                }

                // 金额匹配或没有应收金额信息，直接返回值
                return validValues;
            } catch (error) {
                console.error('表单验证失败:', error);
                throw error;
            }
        },
        addPayWayItem: () => {
            // 添加一个新的支付方式表单
            const newIndex = Math.max(...payWayList) + 1;
            setPayWayList([...payWayList, newIndex]);
        },
        removePayWayItem: (index) => {
            if (payWayList.length > 1) {
                setPayWayList(payWayList.filter(item => item !== index));
                // 清理相关引用
                delete formRefs.current[index];
                delete userRefs.current[index];
                setUserNameIds(prev => {
                    const newState = { ...prev };
                    delete newState[index];
                    return newState;
                });
            }
        },
        resetPayWay: () => {
            // 重置为只有一个支付方式表单
            setPayWayList([0]);

            // 清除所有表单引用和数据
            formRefs.current = {};
            userRefs.current = {};
            setUserNameIds({});


            // 重置其他状态
            setChargeType('6');

            // 设置第一个表单的初始值
            setTimeout(() => {
                if (formRefs.current[0]) {
                    const initialValues = {
                        chargeTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                        type: '6',
                        chargeLogName: '',
                        paymentTime: '',
                        userId: payMessage?.userId + '',
                        method: '',
                        chargeLogIds: '',
                        amount: '',
                    };

                    if (renderData?.departmentId) {
                        initialValues.departmentId = renderData.departmentId;
                    }

                    formRefs.current[0].setFieldsValue(initialValues);
                }
            }, 0);
        }
    }));
    const userRefs: any = useRef({});
    //显示收款记录
    const [userNameIds, setUserNameIds] = useState<Record<number, any>>({});
    const [chargeType, setChargeType] = useState<string>('6');


    // 删除支付方式
    // const removePayWayItem = (index: number) => {
    //     if (payWayList.length > 1) {
    //         setPayWayList(payWayList.filter(item => item !== index));
    //         // 清理相关引用
    //         delete formRefs.current[index];
    //         delete userRefs.current[index];
    //         setUserNameIds(prev => {
    //             const newState = { ...prev };
    //             delete newState[index];
    //             return newState;
    //         });
    //     }
    // };

    useEffect(() => {
        if (payWayList.length > 0) {
            // 设置所有表单的通用初始值
            payWayList.forEach(index => {
                if (formRefs.current[index]) {
                    const initialValues: any = {
                        chargeTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                    };

                    // 如果有 renderData，添加部门 ID
                    if (renderData?.departmentId) {
                        initialValues.departmentId = renderData.departmentId;
                    }

                    // 如果是第一个表单且有 payMessage，设置额外的初始值
                    if (index === payWayList[index] && payMessage) {
                        Object.assign(initialValues, {
                            chargeLogName: `${payMessage?.name}的收款记录`,
                            paymentTime: payMessage?.paymentTime,
                            userId: payMessage?.userId + '',
                            method: payMessage?.method + '',
                            chargeLogIds: payMessage?.id,
                            amount: payMessage?.amount,
                        });

                        // 设置用户信息
                        if (userRefs.current[index]) {
                            userRefs.current[index].setDepartment({
                                id: payMessage?.userId,
                                name: Dictionaries.getDepartmentUserName(payMessage?.userId)
                            });
                        }

                        setUserNameIds(prev => ({
                            ...prev,
                            [index]: {
                                id: payMessage?.userId,
                                name: Dictionaries.getDepartmentUserName(payMessage?.userId)
                            }
                        }));
                    }
                    formRefs.current[index].setFieldsValue(initialValues);
                }
            });
        }
    }, [payMessage, renderData, payWayList]);
    return <>
        {payWayList.map((index) => (
            <ProCard bordered
                title={'支付方式'}
                style={{
                    marginBlockEnd: 8,
                    position: 'relative', marginBottom: index !== payWayList[payWayList.length - 1] ? 16 : 0
                }} key={`charge-log-payway-${index}`} >
                {/* {payWayList.length > 1 && (
                        <Button
                            type="link"
                            danger
                            onClick={() => removePayWayItem(index)}
                            style={{ position: 'absolute', right: 0, top: 0, zIndex: 1 }}
                        >
                            删除支付方式
                        </Button>
                    )} */}
                <ProForm
                    formRef={(form: any) => {
                        if (form) {
                            formRefs.current[index] = form;
                        }
                    }}
                    submitter={false}
                >
                    <ProForm.Group>
                        <ProFormSelect
                            label="缴费类型"
                            name="type"
                            width="md"
                            initialValue={chargeType}
                            // isAddStudent
                            disabled={chargeType == '6'}
                            request={async () =>
                                Dictionaries.getList('chargeType')?.filter(x => ['0', '4', '5', '6'].indexOf(x.value) != -1) as any
                            }
                            required
                        />
                        <ProFormText
                            label="chargeLogIds"
                            name="chargeLogIds"
                            width="md"
                            hidden={true}
                        />
                        {chargeType == '6' ? (
                            <>
                                <ProFormText
                                    label="收款记录"
                                    name="chargeLogName"
                                    width="md"
                                    disabled={chargeType == '6'}
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                />
                            </>
                        ) : null}

                        <ProFormSelect
                            label="付款方式"
                            name="method"
                            width="md"
                            disabled={chargeType == '6'}
                            request={async () => Dictionaries.getList('dict_stu_refund_type') as any}
                            rules={[
                                {
                                    required: true,
                                    message: '请选择付款方式',
                                },
                            ]}
                        />
                        <ProFormSelect
                            label="付款方式"
                            name="departmentId"
                            width="md"
                            hidden={true}
                        />
                        <UserTreeSelect
                            ref={(ref) => {
                                if (ref) {
                                    userRefs.current[index] = ref;
                                }
                            }}
                            width={300}
                            userLabel={'收费人'}
                            disabled={chargeType == '6'}
                            userNames="userId"
                            userPlaceholder="请选择收费人"
                            setUserNameId={(e: any) => {
                                setUserNameIds(prev => ({
                                    ...prev,
                                    [index]: e
                                }));
                            }}
                            flag={true}
                        />
                        <ProFormDateTimePicker
                            name="chargeTime"
                            width="md"
                            label="收费日期"
                            fieldProps={{
                                value: moment(),
                                onChange(e) {
                                    formRefs.current[index]?.setFieldValue('paymentTime', undefined)
                                },
                                format: 'YYYY-MM-DD HH:mm:ss',
                            }}
                            rules={[{ required: true, message: '请填写缴费日期' }]}
                        />
                        <ProFormDateTimePicker
                            name="paymentTime"
                            label="实际到账日期"
                            fieldProps={{
                                showTime: { format: 'HH:mm:ss' },
                                format: 'YYYY-MM-DD HH:mm:ss',
                                onChange(e) {
                                    // 使用用户选择的时间，而不是当前时间
                                    if (e) {
                                        formRefs.current[index]?.setFieldValue('paymentTime', moment(e).format('YYYY-MM-DD HH:mm:ss'))
                                    }
                                },
                            }}
                            width="md"
                            disabled={chargeType == '4' || chargeType == '6'}
                            rules={[{ required: true, message: '请填写缴费日期' }]}
                        />
                        <ProFormDateTimePicker
                            name="nextPaymentTime"
                            width="md"
                            label="下次缴费时间"
                            fieldProps={{
                                showTime: { format: 'HH:mm' },
                                format: 'YYYY-MM-DD HH:mm',
                                onChange(e) {
                                    // 使用用户选择的时间，而不是当前时间
                                    if (e) {
                                        formRefs.current[index]?.setFieldValue('nextPaymentTime', moment(e).format('YYYY-MM-DD HH:mm:ss'))
                                    }
                                },
                            }}
                        />
                        <ProFormDigit
                            label={`本次收费金额`}
                            name="amount"
                            width="sm"
                            fieldProps={{
                                precision: 2,
                                min: 0,
                                formatter: (value) => value ? `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '',
                                parser: (value) => value ? value.replace(/\¥\s?|(,*)/g, '') : '',
                            }}
                            rules={[
                                { required: true, message: '请输入收费金额' },
                                { type: 'number', min: 0, message: '金额必须大于等于0' },
                                {
                                    validator: async (_, value) => {
                                        if (value && value > 999999999) {
                                            throw new Error('金额不能超过9位数');
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        />
                        <ProFormDigit
                            tooltip="返代理费、快递费、税费，不包含在收费标准里的报名费等"
                            label={`代收款项`}
                            name="collectedAmount"
                            width="sm"
                            fieldProps={{
                                precision: 2,
                                min: 0,
                                formatter: (value) => value ? `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '',
                                parser: (value) => value ? value.replace(/\¥\s?|(,*)/g, '') : '',
                            }}
                            rules={[
                                { required: true, message: '请输入代收款项金额' },
                                { type: 'number', min: 0, message: '金额必须大于等于0' },
                                {
                                    validator: async (_, value) => {
                                        if (value && value > 999999999) {
                                            throw new Error('金额不能超过9位数');
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        />
                        <ProFormTextArea
                            width={1100}
                            label="备注"
                            name="description"
                        />

                    </ProForm.Group>
                </ProForm>
            </ProCard>
        ))}
    </>
})

export default PayWay