import Tables from "@/components/Tables"
import Dictionaries from "@/services/util/dictionaries"
import { ProColumns } from "@ant-design/pro-table"
import { Button, Tag, message, Popconfirm, Badge } from "antd"
import { useState, useRef, useEffect } from "react"
import request from '@/services/ant-design-pro/apiRequest';
import fetchDownload from '@/services/util/fetchDownload';
import './index.less'
import {
    ModalForm,
    ProFormInstance,
    ProFormTextArea
} from '@ant-design/pro-form';

export default (props: any) => {
    const { getAll = false, type = 0 } = props


    //存储退款原因
    const [refundID, setRefundID] = useState<any>();
    //存储id
    const [reply, setReply] = useState<boolean>(false);
    //存储数量
    const [badges, setBadges] = useState<any>([])
    //展示
    const [showBtn, setShowBtn] = useState<string>('inReview');
    
    // const [listContent, setlistContent] = useState<any>([
    //     {
    //         name:'张三'
    //     },
    //     {
    //         name:'lisi'
    //     }
    // ]);

    const formRef = useRef<ProFormInstance>();
    const actionRef = useRef<any>();

    //const param = getAll ? {} : { isUseUp: false }
    let param: any = {isRefund: true, 'auditNum-isNull': true};
    const [Params, setParams] = useState<any>(param);
    useEffect(() => {
        BadgesNumbers()
    }, [])

    //申请退费
    const handleNotPass = (record: any) => {
        setReply(true)
        setRefundID(record.id)
    }
    //废除
    const handleRepeal = (record: any) => {
        request
            .post(`/sms/business/bizChargeLog/disable/${record.id}`)
            .then((res) => {
                message.success('废除成功')
                actionRef.current.reload()
            });
    }
    const BadgesNumbers = () => {
        request
            .get('/sms/business/bizChargeLog/statistics', {
                array: JSON.stringify([
                    {
                        isRefund: true, 
                        'auditNum-isNull': true,
                        enable: true
                    },
                    {
                        isRefund: false,
                        confirm: false,
                        enable: true
                    },
                    {
                        isRefund: true,
                        confirm: true,
                        enable: true
                    },
                    {
                        enable: true
                    },
                    {
                        enable: false
                    },
                    {
                        isRefund: false, 
                        isUseUp: false, 
                        enable: true
                    }
                ]),
            })
            .then((res) => {
                setBadges(res.data);
            });
    };

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
            title: '退款文件',
            dataIndex: 'refundReason',
            search: false,
            render: (text, record) => <>
                <Button
                    style={{ marginLeft: 5 }}
                    type="primary"
                    size="small"
                    onClick={() => {
                        fetchDownload('/sms/business/bizChargeLog/download', record.id, { fileName: record.refundReason }, '.docx');
                    }}
                >
                    下载
                </Button>
            </>
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
            title: '收款时间',
            dataIndex: 'paymentTime',
            valueType: 'dateRange',
            sorter: true,
            render: (text, record) => record.paymentTime
        },
        {
            title: '操作',
            search: false,
            hideInTable: showBtn !== 'inReview' && showBtn !== 'noOrder',
            render: (text, record) => (
                <>
                    <Popconfirm
                        style={{ marginBottom: 5 }}
                        key={record.id}
                        title="是否确认通过？"
                        onConfirm={() => {
                            request.post(`/sms/business/bizAudit/audit/${12}?entityId=${record.id}&confirm=true`).then((res: any) => {
                                if (res.status == 'success') {
                                    message.success('成功通过');
                                }
                            });
                        }}
                        okText="通过"
                        cancelText="取消"
                    >
                        <Button
                            type="primary"
                            size="small"
                            
                        hidden={showBtn !== 'inReview'}
                        >
                            通过
                        </Button>

                    </Popconfirm>
                    <Button
                        type="primary"
                        size="small"
                        danger
                        hidden={showBtn !== 'inReview'}
                        onClick={() => handleNotPass(record)}>不通过</Button>
                    <Button
                        type="primary"
                        size="small"
                        hidden={showBtn !== 'noOrder'}
                        danger
                        onClick={() => handleRepeal(record)}>废除</Button>
                </>

            )
        },
    ];
    const renderBadge = (count: number) => {
        return (
            <Badge
                count={count}
                style={{
                    height:15,
                    lineHeight:'15px',
                    marginInlineStart: 4,
                    color:'#fff',
                    backgroundColor:'#ff4d4f',
                }}
            />
        );
    };
    let toolbar = undefined;
    toolbar = {
        menu: {
            type: 'tab',
            items: [
                {
                    key: 'inReview',
                    label: <Button size='small' type='link'>审核中{renderBadge(badges[0])}</Button>
                },
                {
                    key: 'fail',
                    label: <Button size='small' type='link'>未通过{renderBadge(badges[1])}</Button>
                },
                {
                    key: 'pass',
                    label: <Button size='small' type='link'>已通过{renderBadge(badges[2])}</Button>
                },
                {
                    key: 'all',
                    label: <Button size='small' type='link'>全部{renderBadge(badges[3])}</Button>
                },
                {
                    key: 'enable',
                    label: <Button size='small' type='link'>已废除{renderBadge(badges[4])}</Button>
                },
                {
                    key: 'noOrder',
                    label: <Button size='small' type='link'>未下单{renderBadge(badges[5])}</Button>
                }
            ],
            onChange: (key: any) => {
                if (key == 'all') {
                    setParams({ enable: true })
                    setShowBtn('all')
                    actionRef.current.reload();
                }
                if (key == 'inReview') {
                    setParams({ isRefund: true, 'auditNum-isNull': true, enable: true })
                    setShowBtn('inReview')
                    actionRef.current.reload();
                }
                if (key == 'pass') {
                    setShowBtn('pass')
                    setParams({ isRefund: true, confirm: true, enable: true })
                    actionRef.current.reload();
                }
                if (key == 'fail') {
                    setShowBtn('fail')
                    setParams({ isRefund: false, confirm: false, enable: true })
                    actionRef.current.reload();
                }
                if (key == 'enable') {
                    setShowBtn('enable')
                    setParams({ enable: false })
                    actionRef.current.reload();
                }
                if (key == 'noOrder') {
                    setParams({ isRefund: false, isUseUp: false, enable: true })
                    setShowBtn('noOrder')
                    actionRef.current.reload();
                }
            },
        },
    };

    return <>
        <Tables
            columns={columns}
            request={{ url: '/sms/business/bizChargeLog', params: Params }}
            toolbar={toolbar}
            actionRef={actionRef}
        />
        {/* {listContent.map((item:any) => {
            return <>
                <div>{item.name}</div>
            </>
        })} */}
        {/* 退费申请弹窗 */}
        <ModalForm
            title="退款审核"
            visible={reply}
            width={600}
            formRef={formRef}
            onFinish={async (values) => {
                let res = await request.post(`/sms/business/bizAudit/audit/${12}?entityId=${refundID}&confirm=false&remark=${values.description}`)
                if (res.status == 'success') {
                    message.success('成功');
                    actionRef.current.reload();
                    setReply(false)
                }
            }}
            modalProps={{
                destroyOnClose: true,
                onCancel: () => {
                    setReply(false);
                },
            }}
        >
            <ProFormTextArea label="不通过原因" name="description" rules={[
                {
                    required: true,
                    message: '请输入未通过原因',
                },
            ]} />
        </ModalForm>


    </>
}