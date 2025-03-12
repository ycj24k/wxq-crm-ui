import Tables from "@/components/Tables"
import ProForm, { ProFormDatePicker, ProFormDigit, ProFormInstance, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-form"
import { ActionType, ProColumns } from "@ant-design/pro-table"
import { Button, Drawer, message, Modal, Popconfirm, Space } from "antd"
import request from '@/services/ant-design-pro/apiRequest';
import { useEffect, useRef, useState } from "react";
import moment from "moment";
import Dictionaries from '@/services/util/dictionaries';
import { ExclamationCircleFilled } from "@ant-design/icons";
const { confirm } = Modal;



export default (props: any) => {
    const { ModalsVisible, setModalsVisible, renderData, callbackRef } = props
    const [contentList, setContentList] = useState<any[]>([])
    const [InvoiceValue, setInvoiceValue] = useState<any>(renderData.amount)
    const [amountValue, setAmountValue] = useState<any>(0)
    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
    const actionRefC = useRef<ActionType>();
    const formRef = useRef<ProFormInstance>();
    const callbackRefC = () => {
        getInvoiceList()
    };
    useEffect(() => {
        getInvoiceList()
    }, [])
    const getInvoiceList = async () => {
        formRef.current?.setFieldsValue({
            time: moment().format('YYYY-MM-DD HH:mm'),
            amount: 0,
            seller: '',
            num: ''
        })
        let value = renderData.amount
        const list = (await request.get('/sms/business/bizIssueInvoice', { invoiceId: renderData.id })).data.content
        if (list.length > 0) {
            let num = 0
            list.forEach((item: { amount: number }) => {
                num = num + item.amount
            })
            value = value - num
        }
        setInvoiceValue(value)
        setContentList(list)
    }
    const columns: ProColumns<API.Invoice>[] = [
        {
            title: '发票号',
            dataIndex: 'num',
            sorter: true,
        },
        {
            title: '销售方',
            dataIndex: 'seller',
            sorter: true,
            valueType: 'select',
            filters: true,
            filterMultiple: false,
            valueEnum: Dictionaries.getSearch('companyInfo'),
        },
        {
            title: '金额',
            dataIndex: 'amount',
            sorter: true
        },
        {
            title: '开票时间',
            dataIndex: 'time',
            valueType: 'dateTime',
            sorter: true,
            render: (text, record) => (
                <span>{record.time}</span>
            ),
        },
        {
            title: '备注',
            dataIndex: 'remark',
            sorter: true
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'operation',
            dataIndex: 'operation',
            render: (text, record, _, action) => (
                <Space>
                    <a
                        onClick={() => {
                            action?.startEditable?.(record.id);
                        }}
                    >编辑</a>
                    <Popconfirm
                        key="deletePop"
                        title="是否确定删除？"
                        style={{ marginRight: '15px', marginBottom: '8px' }}
                        onConfirm={() => {
                            request.delete('/sms/business/bizIssueInvoice', { id: record.id }).then((res: any) => {
                                if (res.status == 'success') {
                                    message.success('删除成功');
                                    callbackRefC();
                                }
                            });
                        }}
                        okText="删除"
                        cancelText="取消"
                    >
                        <a key="deletes" style={{ color: 'red' }}>
                            删除
                        </a>
                    </Popconfirm>
                </Space>
            )
        }
    ]
    const overInvoice = () => {
        request.postAll('/sms/business/bizInvoice/edit', [{ id: renderData.id, isOver: true }]).then((res: any) => {
            if (res.status == 'success') {
                message.success('操作成功');
                setModalsVisible()
                callbackRef()
            }
        });
    }
    const submits = (value: any) => {

        value.invoiceId = renderData.id
        return new Promise(async (resolve) => {
            request
                .post('/sms/business/bizIssueInvoice', value)
                .then((res: any) => {
                    if (res.status == 'success') {
                        message.success('操作成功');
                        callbackRefC();
                        resolve(res);
                    }
                })
                .catch((err: any) => {
                    resolve(true);
                });
        });
    }

    return (
        <Drawer
            title='开具发票信息'
            open={ModalsVisible}
            onClose={() => setModalsVisible()}
            maskClosable={false}
            width={1200}
        >
            <Tables
                actionRef={actionRefC}
                columns={columns}
                // request={{ url: '/sms/business/bizIssueInvoice', params: { invoiceId: renderData.id } }}
                dataSource={contentList}
                editable={{
                    type: 'multiple',
                    editableKeys,
                    onChange: setEditableRowKeys,
                    onSave: async (rowKey: any, data: { amount: any; seller: any; remark: any; time: any; id: number; num: string }, row: any) => {
                        console.log(data);
                        const { amount, seller, remark, time, id, num } = data
                        await submits({ amount, seller, remark, time, id, num })
                    }

                }}
            />
            <div>当前发票信息还能开{InvoiceValue - amountValue}元</div>
            <ProForm
                submitter={{
                    render: (props, doms) => {
                        return [
                            ...doms,
                            <Button
                                htmlType="button"
                                type="primary"
                                key='over'
                                style={{ backgroundColor: 'green', borderColor: 'green' }}
                                onClick={() => overInvoice()}
                            >
                                完结该发票
                            </Button>
                        ]
                    }
                }}
                formRef={formRef}
                onFinish={async (value) => {
                    if (InvoiceValue - amountValue < 0) {
                        confirm({
                            title: '注意！当前开票金额大于发票信息金额！',
                            icon: <ExclamationCircleFilled />,
                            content: '是否继续开票',
                            onOk() {
                                submits(value);
                            },
                            onCancel() {
                                console.log('Cancel');
                            },
                            okText: '继续',
                            cancelText: '取消'
                        });
                    } else {
                        await submits(value);
                    }

                }}
            >
                <ProForm.Group title='新增发票：'>
                    <ProFormText
                        label='发票号'
                        name='num'
                        width={120}
                        rules={[{ required: true, message: '请填写发票号' }]}
                    />
                    <ProFormSelect
                        label="销售方"
                        name="seller"
                        width={300}
                        rules={[{ required: true, message: '请选择销售方' }]}
                        request={async () => Dictionaries.getList('companyInfo') as any}
                    />
                    <ProFormDigit
                        name="amount"
                        label="开票金额"
                        width="sm"
                        rules={[{
                            required: true
                        }]}
                        fieldProps={{
                            precision: 2,
                            onChange: (e: any) => {
                                setAmountValue(e)
                            }
                        }}

                    />
                    <ProFormDatePicker
                        name="time"
                        fieldProps={{
                            showTime: { format: 'HH:mm:ss' },
                            format: 'YYYY-MM-DD HH:mm:ss',
                        }}
                        width="sm"
                        label='开票时间'
                        rules={[{ required: true, message: '请选择开票时间' }]}
                    />
                </ProForm.Group>

                <ProFormTextArea
                    name='remark'
                    label='备注'
                />
            </ProForm>
        </Drawer>
    )
}