import ProForm, {
    ProFormText,
    ProFormDateTimePicker,
    ProFormSelect,
    ProFormInstance
} from '@ant-design/pro-form';
import Dictionaries from '@/services/util/dictionaries';
import ProCard from '@ant-design/pro-card';
import UserTreeSelect from '@/components/ProFormUser/UserTreeSelect';
import { useRef, useState } from "react"
import moment from 'moment';
import { Modal } from 'antd';
import ChargeLog from '@/pages/Business/ChargeLog';

export default (props: any) => {
    const formRef = useRef<ProFormInstance>();
    const userRef: any = useRef(null);
    //显示收款记录
    const [showGetPay, setShowGetPay] = useState<number>(0)
    const [chargeLog, setChargeLog] = useState<Array<any> | null>();
    const [chargeLogVisible, setChargeLogVisible] = useState<any>(false);
    return <>
        <ProCard
            bordered
            title={'支付方式'}
            style={{
                marginBlockEnd: 8,
            }}
        >
            <ProForm
                formRef={formRef}
                submitter={false}
            >
                <ProForm.Group>
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
                                setShowGetPay(e)
                                formRef.current?.setFieldValue('paymentTime', undefined)
                            }
                        }}
                        required
                    />
                    {showGetPay == 6 ? (
                        <>
                            <ProFormText
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
                            />
                        </>
                    ) : null}

                    <ProFormSelect
                        label="付款方式"
                        name="method"
                        width="md"
                        disabled={showGetPay == 6}
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
                        width={300}
                        userLabel={'收费人'}
                        userNames="userId"
                        userPlaceholder="请选择收费人"
                        // setUserNameId={(e: any) => setUserNameId(e)}
                        // setDepartId={(e: any) => setDepartId(e)}
                        flag={true}
                    // setFalgUser={(e: any) => setFalgUser(e)}
                    />
                    <ProFormDateTimePicker
                        name="chargeTime"
                        width="md"
                        label="收费日期"
                        fieldProps={{
                            value: moment(),
                        }}
                        rules={[{ required: true, message: '请填写缴费日期' }]}
                    />
                    <ProFormDateTimePicker
                        name="paymentTime"
                        label="实际到账日期"
                        fieldProps={{
                            showTime: { format: 'HH:mm:ss' },
                            format: 'YYYY-MM-DD HH:mm:ss',
                        }}
                        width="md"
                        disabled={showGetPay == 4}
                        rules={[{ required: true, message: '请填写缴费日期' }]}
                    />
                    <ProFormDateTimePicker
                        name="nextPaymentTime"
                        width="md"
                        label="下次缴费时间"
                        fieldProps={{
                            showTime: { format: 'HH:mm' },
                            format: 'YYYY-MM-DD HH:mm',
                        }}
                    />
                </ProForm.Group>
            </ProForm>


        </ProCard>

        <Modal
            title="选择收款记录"
            width={1200}
            visible={chargeLogVisible}
            onCancel={() => setChargeLogVisible(false)}
            footer={null}
        >
            <ChargeLog select={setChargeLog} type={1} />
            
        </Modal>

    </>

}