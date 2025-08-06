
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import { Radio, Button, RadioChangeEvent, Drawer, Modal, Checkbox } from 'antd';
import request from '@/services/ant-design-pro/apiRequest';
import ProForm, {
    ProFormDigit,
    ProFormGroup,
    ProFormInstance,
    ProFormList,
    ProFormSelect,
    ProFormText,
    ProFormTextArea
} from '@ant-design/pro-form';
import { useEffect, useRef, useState } from 'react';
import InvoiceRemarks from './InvoiceRemarks';
import Dictionaries from '@/services/util/dictionaries';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import Charge from '@/pages/Admins/AdminCharge/Charge';


export default () => {
    const [steps, setSteps] = useState<any>(0)
    const [ModalsCharge, setModalsCharge] = useState<boolean>(false);
    const [ChargeList, setChargeList] = useState<any>([]);
    const [hasAccount, setHasAccount] = useState<any>(false);
    const [invoiceFalg, setinvoiceFalg] = useState<any>(true);
    let [ChargeLists, setChargeLists] = useState<any>([]);
    const formRefInvoice = useRef<ProFormInstance>();
    const formRefInvoiceelse = useRef<ProFormInstance>();

    const setRadio = (e: RadioChangeEvent) => {
        setSteps(e.target.value)
    }
    const onChange = (e: any) => {
        if (e.target.checked == true) {
            setinvoiceFalg(false);
        } else {
            setinvoiceFalg(true);
        }
    }
    const handleChargeList = (list: any[]) => {
        const ChargeLists = list.map((item) => ({
            num: item.num,
            id: item.id,
            uamount: item.amount,
            usedAmount: item.thisUsedAmount,
            surplusAmount: item.amount - item.usedAmount
        }));
        setChargeLists(ChargeLists);
        formRefInvoice.current?.setFieldsValue({
            chargeList: ChargeLists,
        });
    };

    const priceChange = (e: any) => {
        const price = formRefInvoiceelse.current?.getFieldValue('price') || 0
        const quantity = formRefInvoiceelse.current?.getFieldValue('quantity') || 0
        formRefInvoiceelse?.current?.setFieldValue('amount', price * quantity)
        console.log(price, quantity);
    }

    const setFromValue = (value: any) => {
        const { title, productType, taxCode, amount, email, remark, cautions, type, bank, account, mobile, address, chargeAccount, price, quantity } = value
        formRefInvoice.current?.setFieldsValue({ title, productType, taxCode, amount, email, remark, cautions, type, bank, account, mobile, address, chargeAccount, price, quantity })

    }
    useEffect(() => {
        if (ChargeList.length > 0) {
            setFromValue({ chargeAccount: ChargeList[0].method + '' })
            getInvoiceInfo(ChargeList[0].studentUserId)
            handleChargeList(ChargeList);
        }
    }, [ChargeList])
    const getInvoiceInfo = async (userId: string) => {
        const info = (await request.get('/sms/business/bizInvoice', { studentUserId: userId })).data.content
        if (info.length > 0) {
            let dataInfo = info[0]
            Object.keys(dataInfo).forEach((key) => {
                if (typeof dataInfo[key] == 'number') {
                    dataInfo[key] = dataInfo[key] + ''
                }
            })
            //setFromValue(dataInfo)
        }
    }
    const submitInvoice = async () => {
        try {
            // 验证第一个表单
            await formRefInvoice.current?.validateFields();
            
            // 验证第二个表单
            await formRefInvoiceelse.current?.validateFields();
            
            // 合并表单值
            const invoiceValues = formRefInvoice.current?.getFieldsValue();
            const invoiceElseValues = formRefInvoiceelse.current?.getFieldsValue();
            
            // 根据条件删除不需要的字段
            if (invoiceFalg) {
                delete invoiceElseValues.bank;
                delete invoiceElseValues.account;
                delete invoiceElseValues.mobile;
                delete invoiceElseValues.address;
            }
            
            const combinedValues = {
                ...invoiceValues,
                ...invoiceElseValues
            };
            
            console.log('表单验证通过，合并后的值:', combinedValues);
            
            // 在这里添加提交逻辑（如API调用）
            
        } catch (error) {
            console.error('表单验证失败:', error);
            Modal.error({
                title: '表单验证失败',
                content: '请检查表单填写是否完整且符合要求。',
            });
        }
    }
    return (
        <PageContainer>
            <ProCard
                hoverable
                style={{ minHeight: '900px' }}
            >
                <div>
                    <ProForm.Group title="首先请选择开票类型"></ProForm.Group>
                    <Radio.Group name="radiogroup" onChange={(e) => setRadio(e)}>
                        <Radio value={1}>已有缴费开具发票</Radio>
                        <Radio value={2}>先开票后缴费</Radio>
                    </Radio.Group>
                </div>
                <div hidden={steps == 0} >
                    <div hidden={steps == 2} style={{ marginTop: '30px' }} >
                        <Button type='primary' icon={<PlusOutlined />} onClick={() => setModalsCharge(true)}> 选择缴费信息 </Button>
                        <span>点击选择缴费信息,选择你需要开票的缴费</span>


                        <ProForm.Group title='开票缴费信息' >
                            <ProForm
                                formRef={formRefInvoice}
                                submitter={false}
                            >
                                <ProFormList
                                    name='chargeList'
                                    creatorButtonProps={false}
                                    deleteIconProps={false}
                                    copyIconProps={false}
                                    itemRender={({ listDom, action }, { record, index, name }) => {
                                        return (
                                            <ProCard
                                                title='缴费信息'
                                                bordered
                                                style={{
                                                    marginBottom: 8,
                                                }}
                                                key={index}
                                            >
                                                <ProFormGroup key={index}>
                                                    <ProFormText label='缴费编号' name='num' readonly />
                                                    <ProFormText label='缴费金额' name='uamount' readonly />
                                                    <ProFormText label='当前缴费剩余可开票金额' name='surplusAmount' readonly />
                                                    <ProFormDigit
                                                        name="usedAmount"
                                                        label="此缴费需要开票金额"
                                                        width="md"
                                                        rules={[{ required: true }]}
                                                        fieldProps={{
                                                            precision: 2, onChange: (e: any) => {
                                                                // let fromValues = formRefInvoice.current?.getFieldValue('chargeList')
                                                                // let fromValue = fromValues[index]
                                                                // fromValue.surplusAmount = fromValue.uamount - e

                                                                // fromValues[index] = fromValue
                                                                // formRefInvoice.current?.setFieldValue('chargeList', fromValues)
                                                            },
                                                            onBlur: () => {
                                                                let fromValues = formRefInvoice.current?.getFieldValue('chargeList')
                                                                let fromValue = fromValues[index]
                                                                if (fromValue.surplusAmount < fromValue.usedAmount) {
                                                                    Modal.info({
                                                                        title: '注意！当前开票金额大于剩余可开票金额！',
                                                                        icon: <ExclamationCircleFilled />,
                                                                        onOk() {

                                                                            let fromValues = formRefInvoice.current?.getFieldValue('chargeList')
                                                                            let fromValue = fromValues[index]
                                                                            delete fromValue.usedAmount

                                                                            fromValues[index] = fromValue
                                                                            formRefInvoice.current?.setFieldValue('chargeList', fromValues)

                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </ProFormGroup>
                                                <p style={{ color: "red" }}>2024年10月25号后（含25号）应急项目填写开票金额要减去考试费（有合同的以合同签订日期为准，无合同的以收款日期为准）</p>
                                            </ProCard>
                                        )
                                    }}
                                >

                                </ProFormList>
                            </ProForm>
                        </ProForm.Group>
                    </div>

                    <div hidden={(steps == 1 && ChargeList.length == 0)}>
                        <ProForm.Group title="税票信息">
                            <InvoiceRemarks />
                        </ProForm.Group>
                        <div>
                            <ProForm
                                formRef={formRefInvoiceelse}
                                submitter={false}
                            >
                                <ProForm.Group>
                                    <ProFormText name="title" label="发票抬头" width="lg" rules={[{ required: true }]} />
                                    <ProFormSelect
                                        label="商品种类"
                                        name="productType"
                                        width="md"
                                        initialValue="0"
                                        rules={[{ required: true }]}
                                        request={async () =>
                                            Dictionaries.getList('invoiceProductType') as any
                                        }
                                    />
                                </ProForm.Group>
                                {/* <div hidden={steps == 1 && renderDataInvoice.editType != 'edit'}> */}
                                <ProForm.Group>

                                    <ProFormSelect
                                        label="付款方式"
                                        name="chargeAccount"
                                        rules={[{ required: true }]}
                                        width="md"
                                        request={async () => Dictionaries.getList('dict_stu_refund_type') as any}
                                    />
                                    <ProFormDigit name='price' label='单价' rules={[{ required: true }]} fieldProps={{
                                        onChange: e => priceChange(e)
                                    }} />
                                    <ProFormDigit name='quantity' label='数量' rules={[{ required: true }]} fieldProps={{
                                        onChange: e => priceChange(e)
                                    }} />
                                </ProForm.Group>
                                {/* </div> */}
                                <ProForm.Group>
                                    <ProFormText name="taxCode" label="税号" width="md" rules={[{ required: true }]} />
                                    <ProFormDigit
                                        name="amount"
                                        label="金额"
                                        width="md"
                                        rules={[{ required: true }]}
                                        fieldProps={{ precision: 2 }}
                                    />
                                    <ProFormText
                                        name="email"
                                        label="学员邮箱"
                                        width="md"
                                        rules={[{ required: true }]}
                                        fieldProps={{
                                            autoComplete: 'no',
                                        }}
                                    />
                                </ProForm.Group>
                                <ProForm.Group>
                                    <ProFormTextArea
                                        width={1100}
                                        label="发票备注（在票据上显示，谨慎填写）"
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
                                        name="type"
                                        width="md"
                                        rules={[{ required: true }]}
                                        fieldProps={{
                                            onChange: (e) => {
                                                if (e == 0) {
                                                    setinvoiceFalg(true);
                                                    setHasAccount(false)
                                                } else {
                                                    setinvoiceFalg(false);
                                                    setHasAccount(true)
                                                }
                                            },
                                        }}
                                        initialValue="0"
                                        request={async () => Dictionaries.getList('invoiceType') as any}
                                    />
                                    <Checkbox style={{ marginTop: '35px' }} disabled={hasAccount} onChange={onChange}>填写账号信息</Checkbox>

                                    {/* <ProFormCheckbox.Group
                                        hidden={hasAccount}
                                        name="hasAccount"
                                        layout="vertical"
                                        options={['填写账号信息']}
                                        fieldProps={{
                                            onChange: (e) => {
                                                console.log(e)
                                                if (e.length > 0) {
                                                    setinvoiceFalg(false);
                                                } else {
                                                    setinvoiceFalg(true);
                                                }
                                            },
                                        }}
                                    /> */}
                                </ProForm.Group>
                                <div hidden={invoiceFalg}>
                                    <ProForm.Group>
                                        <ProFormText name="bank" label="开户行" width="md"
                                            rules={[{ required: !invoiceFalg }]} />
                                        <ProFormText name="account" label="账号" width="md"
                                            rules={[{ required: !invoiceFalg }]} />
                                    </ProForm.Group>
                                    <ProForm.Group>
                                        <ProFormText name="mobile" label="电话" width="md"
                                            rules={[{ required: !invoiceFalg }]} />
                                        <ProFormText name="address" label="地址" width="md"
                                            rules={[{ required: !invoiceFalg }]} />
                                    </ProForm.Group>
                                </div>
                            </ProForm>
                        </div>
                        <Button type='primary' onClick={submitInvoice}>提交</Button>
                    </div>


                </div>
            </ProCard>
            {
                ModalsCharge && (
                    <Drawer
                        open={ModalsCharge}
                        onClose={() => setModalsCharge(false)}
                        width={1200}
                    >
                        <p style={{ fontSize: '26px', fontWeight: 'bold' }}>请勾选你要开票的缴费信息</p>
                        <Charge
                            setModalsCharge={() => setModalsCharge(false)}
                            setChargeList={(e: any) => setChargeList(e)}
                            chargeType="chargeList"
                            studentType='all'
                            formParam={{ confirm: true }}
                        />
                    </Drawer>
                )
            }
        </PageContainer>
    );
};
