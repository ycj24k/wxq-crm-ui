import Tables from "@/components/Tables"
import Dictionaries from "@/services/util/dictionaries"
import { ProColumns } from "@ant-design/pro-table"
import { Button, Tag, message } from "antd"
import { useState, useRef } from "react"
import request from '@/services/ant-design-pro/apiRequest';
import './index.less'
import {
    ModalForm,
    ProFormInstance,
    ProFormUploadDragger
} from '@ant-design/pro-form';

export default (props: any) => {
    const { getAll = false, type = 0 } = props

    let tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
    let tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
    let obj: { [key: string]: string } = {};
    if (tokenValue !== null) {
        obj[tokenName] = tokenValue;
    } else {
        // 处理 tokenValue 为 null 的情况，例如显示错误消息或设置默认值
        console.error('Token value is null');
    }


    //申请退费
    const [refund, setRefund] = useState<boolean>(false);
    //存储退款原因
    const [refundReason, setRefundReason] = useState<any>();
    //存储id
    const [refundId, setRefundId] = useState<any>();
    const formRef = useRef<ProFormInstance>();
    const actionRef = useRef<any>();

    //const param = getAll ? {} : { isUseUp: false }

    //申请退费
    const handleRefound = (record: any) => {
        setRefund(true)
        setRefundReason(record.remark)
        setRefundId(record.id)
    }
    const param = { isUseUp: false }

    const columns: ProColumns<any>[] = [
        {
            width: 100,
            title: '收款编号',
            dataIndex: 'num'
        },
        {
            width: 100,
            title: '学员姓名',
            dataIndex: 'name',
        },
        {
            title: '学员手机号',
            dataIndex: 'phone',
        },
        {
            title: '收付款方式',
            dataIndex: 'method',
            valueType: 'select',
            sorter: true,
            valueEnum: Dictionaries.getSearch('dict_stu_refund_type')
        },
        {
            title: '收费人',
            dataIndex: 'userName',
        },
        {
            title: '收款金额',
            dataIndex: 'amount'
        },
        {
            title: '已下单金额',
            dataIndex: 'usedAmount',
            sorter: true
        },
        {
            title: '是否已全部下单',
            dataIndex: 'isUseUp',
            valueType: 'switch',
            search: getAll,
            sorter: true,
            render: (text, record) => record.isUseUp ? <Tag color='green'>已下单</Tag> : <Tag color='red'>未下单</Tag>
        },
        {
            title: '退款状态',
            dataIndex: 'isUseUp',
            valueType: 'switch',
            search: getAll,
            sorter: true,//confirm //isRefund
            render: (text, record) => <>
                {/* <Tag
                    color={
                        record.confirm === true ? '#87d068' : record.confirm === false ? '#FF0000' : '#f50'
                    }
                >
                    {record.confirm === true && record.isRefund === true ? '审核通过' : record.confirm === false ? '未通过' : '未审核'}{record.confirm === false && record.isRefund && ',已重新提交'}
                </Tag><br /> */}
                {record.confirm === true && record.isRefund === true && <Tag color="#87d068">审核通过</Tag>}
                {record.confirm === false && record.isRefund === false && <Tag color="#f50">审核未通过</Tag>}
                {record.confirm === false && record.isRefund === true && <Tag color="red">审核不通过,已重新提交</Tag>}
                {record.confirm === null && record.isRefund === false && <Tag color="volcano">未提交退费</Tag>}
                {record.confirm === null && record.isRefund === true && <Tag color="green">已提交,待审核</Tag>}
            </>
        },
        {
            title: '收款时间',
            dataIndex: 'paymentTime',
            valueType: 'dateRange',
            sorter: true,
            render: (text, record) => record.paymentTime
        },
        {
            title: '操作',
            search: false,
            hideInTable: type !== 0,
            render: (text, record) => (
                <>
                    <Button
                        type="primary"
                        danger
                        disabled={record.confirm || record.confirm === null && record.isRefund === true}
                        onClick={() => handleRefound(record)}>申请退款</Button>
                </>

            )
        },
    ];

    return <>
        <Tables
            columns={columns}
            request={{ url: '/sms/business/bizChargeLog' }}
            params={param}
            actionRef={actionRef}
        />

        {/* 退费申请弹窗 */}
        <ModalForm
            title="退费申请"
            visible={refund}
            width={600}
            formRef={formRef}
            onFinish={async (values) => {
                if (values.filess) {
                    let arr: any[] = [];
                    values.filess.forEach((item: any) => {
                        arr.push(item.response.data);
                    });
                    delete values.filess;
                    values.files = arr.join(',');
                    let res = await request.post(`/sms/business/bizChargeLog/refund/${refundId}?file=${values.files}`)
                    if (res.status == 'success') {
                        message.success(res.msg)
                        actionRef.current.reload();
                        setRefund(false)
                    }
                }
            }}
            modalProps={{
                destroyOnClose: true,
                onCancel: () => {
                    setRefund(false);
                },
            }}
        >
            <a
                download="汇德退费申请书模板（两个--企业和个人）"
                href="./template/汇德退费申请书模板（两个--企业和个人）.doc"
            >
                下载退费申请书模板(两个--企业和个人)
            </a>,
            <ProFormUploadDragger
                width="xl"
                label="上传附件"
                name="filess"
                action="/sms/business/bizChargeLog/upload"
                fieldProps={{
                    multiple: true,
                    headers: {
                        ...obj,
                    },
                    listType: 'picture',
                    onRemove: (e: any) => { },
                    beforeUpload: (file: any) => {
                        console.log('file', file);
                    },
                    onPreview: async (file: any) => {
                        console.log('file', file);

                        if (!file.url && !file.preview) {
                            console.log('1');
                        }
                    },
                    onChange: (info: any) => {
                        const { status } = info.file;
                        if (status !== 'uploading') {
                        }
                        if (status === 'done') {
                            message.success(`${info.file.name} 上传成功.`);
                        } else if (status === 'error') {
                            message.error(`${info.file.name} 上传失败.`);
                        }
                    },
                }}
            />
            <span>不通过原因：{refundReason}</span>
        </ModalForm>


    </>
}