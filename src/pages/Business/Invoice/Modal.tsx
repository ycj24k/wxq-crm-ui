import ProForm, { ModalForm, ProFormCheckbox, ProFormDigit, ProFormGroup, ProFormInstance, ProFormList, ProFormRadio, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { useEffect, useRef, useState } from 'react';
import request from '@/services/ant-design-pro/apiRequest';
import { Button, Col, Drawer, message, Modal, Radio, RadioChangeEvent, Row } from 'antd';
import Dictionaries from '@/services/util/dictionaries';
import Charge from '@/pages/Admins/AdminCharge/Charge';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import InvoiceRemarks from './InvoiceRemarks';
const { confirm } = Modal;
export default (props: any) => {
    const { renderDataInvoice, ModalsVisible, setModalsVisible, callbackRef, setAddInvoiceVisible } = props;
    console.log(renderDataInvoice,'renderDataInvoice=======>')
    const formRefInvoice = useRef<ProFormInstance>();
    const [invoiceFalg, setinvoiceFalg] = useState<any>(true);
    const [hasAccount, setHasAccount] = useState<any>(false);
    const [ModalsCharge, setModalsCharge] = useState<boolean>(false);
    const [ChargeList, setChargeList] = useState<any>([]);
    let [ChargeLists, setChargeLists] = useState<any>([]);
    const [steps, setSteps] = useState<any>(0)

    useEffect(() => {
        if (renderDataInvoice.editType == 'edit') {
            Object.keys(renderDataInvoice).forEach((key) => {
                if (typeof renderDataInvoice[key] == 'number') {
                    renderDataInvoice[key] = renderDataInvoice[key] + ''
                }

            })
            if (renderDataInvoice.type == 1) {
                setinvoiceFalg(false)
            }
            setFromValue(renderDataInvoice)
            if (renderDataInvoice.chargeIds != null) {
                request.get('/sms/business/bizCharge', { 'id-in': renderDataInvoice.chargeIds }).then(res => {
                    const list = []
                    const chargeIds = renderDataInvoice.chargeIds.split(',').filter((x: string) => !!x);
                    const chargeNum = renderDataInvoice.chargeNum.split(',').filter((x: string) => !!x);
                    const usedAmounts = renderDataInvoice.usedAmounts.split(',').filter((x: string) => !!x);
                    const chargeAmount = renderDataInvoice.chargeAmount.split(',').filter((x: string) => !!x);
                    for (let i = 0; i < chargeIds.length; i++) {
                        list.push({
                            num: chargeNum[i],
                            id: chargeIds[i],
                            amount: chargeAmount[i],
                            thisUsedAmount: usedAmounts[i],
                            usedAmount: (res.data.content as Array<any>).filter((x: any) => x.id == chargeIds[i])[0].usedAmount,
                            // surplusAmount: chargeAmount[i] - usedAmounts[i],
                        })
                    }
                    handleChargeList(list);
                })
                // request
                //     .get('/sms/business/bizCharge', { 'id-in': renderDataInvoice.chargeIds })
                //     .then((res) => {
                //         if (res.status === 'success') {
                //             const list = res.data.content;
                //             handleChargeList(list);
                //         }
                //     });
            }
        }

    }, []);
    const setFromValue = (value: any) => {
        const { title, productType, taxCode, amount, email, remark, cautions, type, bank, account, mobile, address, chargeAccount, price, quantity } = value
        formRefInvoice.current?.setFieldsValue({ title, productType, taxCode, amount, email, remark, cautions, type, bank, account, mobile, address, chargeAccount, price, quantity })

    }
    useEffect(() => {
        if (ChargeList.length > 0) {
            console.log('ChargeList', ChargeList);
            if (renderDataInvoice.editType != 'edit') {
                setFromValue({ chargeAccount: ChargeList[0].method + '' })
                getInvoiceInfo(ChargeList[0].studentUserId)
            }
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
            setFromValue(dataInfo)
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
    const setRadio = (e: RadioChangeEvent) => {
        setSteps(e.target.value)
    }
    const priceChange = (e) => {
        const price = formRefInvoice.current?.getFieldValue('price') || 0
        const quantity = formRefInvoice.current?.getFieldValue('quantity') || 0
        formRefInvoice?.current?.setFieldValue('amount', price * quantity)
        console.log(price, quantity);

    }
    const submits = (value: any) => {
        let url = '/sms/business/bizInvoice'

        delete value.hasAccount
        if (value?.chargeList) {
            value.chargeList.forEach((item: any) => {
                item.amount = item.usedAmount
                delete item.uamount
                delete item.num
                delete item.usedAmount
                delete item.surplusAmount
            })
        } else {
            value.chargeList = []
        }
        if (renderDataInvoice.editType == 'edit') {
            value.id = renderDataInvoice.id
            url = '/sms/business/bizInvoice/edit'
            value = [value]
        }
        return new Promise(async (resolve) => {
            request
                .postAll(url, value)
                .then((res: any) => {
                    if (res.status == 'success') {
                        message.success('操作成功');
                        setModalsVisible();
                        callbackRef();
                        resolve(res);
                    }
                })
                .catch((err: any) => {
                    resolve(true);
                });
        });
    };
    return (
        <ModalForm
            title="开票信息"
            visible={ModalsVisible}
            formRef={formRefInvoice}
            width={1200}

            modalProps={{
                onCancel: () => setModalsVisible(false),
                maskClosable: false,
            }}
            onFinish={async (value) => {
                //console.log(value,'value======>')
                await submits(value);
            }}
            submitter={{
                render: (props, doms) => {
                    return [
                        ...doms,
                        // <Button
                        //     htmlType="button"
                        //     type="primary"
                        //     key='over'
                        //     style={{ backgroundColor: 'green', borderColor: 'green' }}
                        //     onClick={() => {
                        //         setModalsVisible(false)
                        //         setAddInvoiceVisible(true)
                        //     }}
                        // >
                        //     开具发票
                        // </Button>
                    ]
                }
            }}
        >
            <div hidden={renderDataInvoice.editType == 'edit'}>
                <ProForm.Group title="首先请选择开票类型"></ProForm.Group>
                <Radio.Group name="radiogroup" onChange={(e) => setRadio(e)}>
                    <Radio value={1}>已有缴费开具发票</Radio>
                    <Radio value={2}>先开票后缴费</Radio>
                </Radio.Group>
            </div>
            <div hidden={steps == 0 && renderDataInvoice.editType != 'edit'} >
                <div hidden={steps == 2 && renderDataInvoice.editType != 'edit'} style={{ marginTop: '30px' }} >
                    <Button type='primary' icon={<PlusOutlined />} onClick={() => setModalsCharge(true)}> 选择缴费信息 </Button>
                    <span>点击选择缴费信息,选择你需要开票的缴费</span>

                    <ProForm.Group title='开票缴费信息' >
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
                                                        if (renderDataInvoice.editType != 'edit') {
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
                                                        if (renderDataInvoice.editType == 'edit') {
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
                    </ProForm.Group>
                </div>

                <div hidden={(steps == 1 && ChargeList.length == 0)}>
                    <ProForm.Group title="税票信息">
                        <InvoiceRemarks />
                    </ProForm.Group>
                    <div>
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
                            <ProFormCheckbox.Group
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
                            />
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

                    </div>
                </div>


            </div>


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
        </ModalForm>
    );
};
