import { useEffect, useRef, useState } from "react";
import Tables from "@/components/Tables"
import type { ActionType, ProColumns } from "@ant-design/pro-table"
import Dictionaries from '@/services/util/dictionaries';
import { Badge, Button, message, Popconfirm, Space, Table, Tag } from "antd";
import HasInvoiceInfo from "@/pages/Admins/AdminCharge/HasInvoiceInfo";
import Modal from "./Modal";
import { Modal as AntdModal } from "antd";
import AddInvoice from "./AddInvoice";
import { DownloadOutlined, PlusOutlined } from "@ant-design/icons";
import request from '@/services/ant-design-pro/apiRequest';
import moment from "moment";
import DownHeader from "./DownHeader";
import DownTable from '@/services/util/timeFn';
import DownFn from "./DownFn";
import chargeDownload from '@/services/util/chargeDownload'
import type { ProFormInstance} from "@ant-design/pro-form";
import { ModalForm, ProFormUploadDragger } from "@ant-design/pro-form";
import * as XLSX from 'xlsx';
import { biuldDataFromExcelJson, deleteUndefined } from "@/services/util/util";
export default (props: any) => {
    const { chargeId = false, param = {} } = props
    const inWin = Object.keys(param).length !== 0
    param.enable = true
    deleteUndefined(param)
    const [HasInvoiceFalg, setHasInvoiceVisible] = useState<boolean>(false);
    const [renderDataInvoice, setRenderDataInvoice] = useState<any>(null);
    const [ModalsVisible, setModalsVisible] = useState<boolean>(false);
    const [addInvoiceVisible, setAddInvoiceVisible] = useState<boolean>(false)
    const [params, setParams] = useState<any>(param)
    const [contentList, setContentList] = useState<any>([])
    const [Badges, setBadges] = useState<any>([0, 0]);
    const [uploadFormVisible, setUploadFormVisible] = useState<boolean>(false);
    const [uploadData, setUploadData] = useState<any>();
    const [exportLoading, setExportLoading] = useState<boolean>(false);
    const formRef = useRef<ProFormInstance>();
    const actionRef = useRef<ActionType>();
    useEffect(() => {
        if (chargeId) {
            const data = JSON.parse(JSON.stringify(params))
            const chargeIds = chargeId.id
            // // chargeId.forEach((item: { id: any; }) => {
            // //     ids.push(item.id)
            // // })

            setParams({ ...data, chargeIds })
        }
        BadgesNumber()
    }, [])
    const callbackRef = () => {
        actionRef?.current?.reload();
        BadgesNumber()
    };
    const BadgesNumber = () => {
        request
            .get('/sms/business/bizInvoice/statistics', {
                array: JSON.stringify([
                    { enable: true, 'auditConfirm-isNull': true }
                ]),
            })
            .then((res) => {
                setBadges(res.data);
            });
    };
    const chargeInvoiceAudit = () => {
        console.log('1a', contentList);
        if (contentList.length == 0) return


        auditsFn(contentList, true)

    }
    const auditsFn = (list: any, resolution: boolean, proposal: string = '', type = 'invoice') => {
        const idList = list.map((item: any) => {
            return {
                entityId: item.id,
                auditType: '11',
                confirm: resolution,
                remark: proposal
            }
        })
        request.postAll("/sms/business/bizAudit/audits/11", idList).then((res: any) => {
            if (res.status == 'success' && type == 'invoice') {
                message.success('操作成功');
                callbackRef();
            }
        })
    }
    const columns: ProColumns<API.Invoice>[] = [
        {
            width: 85,
            title: '创建人',
            dataIndex: 'userName',
            sorter: true,
            fixed:'left'
        },
        {
            width: 100,
            title: "学员姓名",
            dataIndex: 'studentName',
            sorter: true,
        },
        {
            width: 100,
            title: "发票编号",
            dataIndex: 'num'
        },
        {
            width: 100,
            title: "发票号码",
            dataIndex: 'no'
        },
        {
            width: 100,
            title: "开票时间",
            valueType: 'dateRange',
            dataIndex: 'time',
            sorter: true,
            render: (text, record) => (
                record.time
            )
        },
        {
            width: 100,
            title: "缴费编号",
            dataIndex: 'chargeNum',
            sorter: true
        },
        {
            width: 100,
            title:'缴费类型',
            dataIndex: 'chargeType',
            render: (text, record) => {
                const chargeTypes = typeof text === 'string' ? text.split(',') : [];
                const result = localStorage.getItem('dictionariesList')
                let newCharge = []
                if(result){
                    const newResult = JSON.parse(result)[13].children
                    const chargeTypeNames = newResult.map((item: any)=>{
                        return {
                            value: item.value,
                            name: item.name
                        }
                    })
                    newCharge = chargeTypeNames
                }
                const names = chargeTypes?.map(type => {
                    const matched = newCharge.find((item: any) => item.value === type);
                    return matched ? matched.name : type;
                });
                return <span>{names?.join(', ')}</span>;
            }
        },
        {
            width: 100,
            title: '发票抬头',
            dataIndex: 'title',
            sorter: true
        },
        {
            width: 100,
            title: '商品种类',
            dataIndex: 'productType',
            sorter: true,
            render: (text, record) => (
                <span>{Dictionaries.getName('invoiceProductType', record.productType)}</span>
            )
        },
        // {
        //     title: '发票税号',
        //     dataIndex: 'taxCode',
        //     sorter: true
        // },
        {
            width: 100,
            title: '发票金额',
            dataIndex: 'amount',
            sorter: true
        },
        {
            width: 100,
            title: '发票备注',
            ellipsis: true,
            dataIndex: 'remark',
            sorter: true
        },
        {
            width: 100,
            title: '注意事项',
            ellipsis: true,
            dataIndex: 'cautions',
            sorter: true
        },
        {
            width: 100,
            title: '创建时间',
            dataIndex: 'createTime',
            valueType: 'dateRange',
            sorter: true,
            render: (text, record) => (
                <span>{record.createTime}</span>
            ),
        },
        // {
        //     title: '是否已开具发票',
        //     dataIndex: 'hasChild',
        //     sorter: true,
        //     render: (text, record) => (
        //         <span>{record.hasChild ? <Tag color='green'>是</Tag> : <Tag color='red'>否</Tag>}</span>
        //     ),
        // },
        {
            width: 100,
            title: '是否已完结',
            dataIndex: 'isOver',
            sorter: true,
            render: (text, record) => (
                <span>{record.isOver ? <Tag color='green'>是</Tag> : <Tag color='red'>否</Tag>}</span>
            ),
        },
        {
            width: 100,
            title: '审核状态',
            dataIndex: 'auditConfirm',
            sorter: true,
            render: (text, record) => (
                <span>{record.auditConfirm == null ? <Tag color='orange'>未审核</Tag> : record.auditConfirm == true ? <Tag color='green'>审核通过</Tag> : <Tag color='red'>审核不通过</Tag>}</span>
            ),
            valueEnum: {
                '-isNull': {
                    text: '未审核',
                    status: 'Processing',
                },
                true: {
                    text: '审核通过',
                    status: 'Success',
                },
                false: {
                    text: '未通过',
                    status: 'Error',
                },
            },
        },
        {
            width: 100,
            title: '审核人',
            dataIndex: 'auditor',
        },
        {
            title: '审核时间',
            key: 'auditTime',
            sorter: true,
            width: 120,
            dataIndex: 'auditTime',
            valueType: 'dateRange',
            render: (text, record) => (
                <span>{record.auditTime}</span>
            ),
        },
        {
            width: 100,
            title: '发票种类',
            dataIndex: 'type',
            sorter: true,
            render: (text, record) => (
                <span>{Dictionaries.getName('invoiceType', record.type)}</span>
            )
        },
        {
            width: 90,
            title: '开户行',
            dataIndex: 'bank',
            sorter: true,
            hideInTable: true
        },
        {
            width: 90,
            title: '账号',
            dataIndex: 'account',
            sorter: true,
            hideInTable: true
        },
        {
            width: 90,
            title: '电话',
            dataIndex: 'mobile',
            sorter: true
        },
        {
            width: 90,
            title: '地址',
            dataIndex: 'address',
            sorter: true,
            hideInTable: true
        },
        {
            title: '操作',
            width: 180,
            fixed: 'right',
            render: (text, record) => (
                <Space>
                    <a
                        onClick={() => {
                            setRenderDataInvoice({ ...record, invoiceType: record.type, invoiceProductType: record.productType })
                            setHasInvoiceVisible(true)
                        }}
                    >查看</a>
                    <Popconfirm
                        key={record.id + 'edit'}
                        title="审核"
                        onConfirm={() => {
                            request.post('/sms/business/bizAudit', {
                                entityId: record.id,
                                confirm: true,
                                auditType: '11',
                            }).then((res: any) => {
                                if (res.status == 'success') {
                                    message.success('操作成功');
                                    callbackRef();
                                }
                            });
                        }}
                        okText="审核通过"
                        cancelText="审核不通过"
                    >
                        <a
                            hidden={record.auditConfirm !== null}
                        >
                            审核
                        </a>
                    </Popconfirm>
                    <a
                        hidden={chargeId}
                        onClick={() => {
                            setRenderDataInvoice({ editType: 'edit', ...record })
                            setModalsVisible(true)
                        }}
                    >编辑</a>
                    {/* <a
                        hidden={chargeId}
                        onClick={() => {
                            setRenderDataInvoice(record)
                            setAddInvoiceVisible(true)
                        }}
                    >
                        开具发票
                    </a> */}

                    <Popconfirm
                        key={record.id + 'edit'}
                        title="是否完结？"
                        onConfirm={() => {
                            request.postAll('/sms/business/bizInvoice/edit', [{ id: record.id, isOver: true }]).then((res: any) => {
                                if (res.status == 'success') {
                                    message.success('操作成功');
                                    callbackRef();
                                }
                            });
                        }}
                        okText="完结"
                        cancelText="取消"
                    >
                        <a
                            hidden={record.isOver || chargeId}
                        >
                            完结
                        </a>
                    </Popconfirm>
                    <Popconfirm
                        key={record.id + 'disable'}
                        title="是否废除？"
                        onConfirm={() => {
                            request.post('/sms/business/bizInvoice/disable/' + record.id).then((res: any) => {
                                if (res.status == 'success') {
                                    message.success('废除成功');
                                    callbackRef();
                                }
                            });
                        }}
                        okText="废除"
                        cancelText="取消"
                    >
                        <a
                            hidden={chargeId}
                            style={{ color: 'red' }}
                        >
                            废除
                        </a>
                    </Popconfirm>
                </Space>
            )
        }

    ]
    const toolBarRender = [
        <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
                setRenderDataInvoice({ editType: 'add' });
                setModalsVisible(true);
            }}
        >
            新增发票信息
        </Button>,
        <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
                setUploadFormVisible(true);
            }}
        >
            财务开票
        </Button>,
        <Button
            type="primary"
            icon={<DownloadOutlined />}
            loading={exportLoading}
            onClick={(e) => {
                setExportLoading(true)
                const param = formRef.current?.getFieldsValue();
                Object.keys(param).forEach(key => {
                    if (!param[key]) delete param[key]
                })
                if (Object.keys(param).length == 0) {
                    message.error('未选择条件！')
                    setExportLoading(false)
                    return
                }
                param._isGetAll = true
                param.enable = true
                request.get('/sms/business/bizInvoice', param).then(res => {
                    if (res.status == 'success') {
                        DownTable(res.data.content, DownHeader.Invoice, '发票信息', 'invoice');
                    }
                    setExportLoading(false)
                })
            }}
        >
            条件导出
        </Button>,
    ];
    const sortList: any = {
        ['createTime']: 'desc'
    };
    const toolbar = {
        menu: {
            type: 'tab',
            items: inWin ? [{
                key: 'all',
                label: <span>全部</span>
            }] : [
                {
                    key: 'all',
                    label: <span>全部</span>
                },
                {
                    key: 'auditConfirm-isNull',
                    label: <Badge count={Badges[0]} size="small" offset={[5, 3]}><span>未审核</span></Badge>
                },
                {
                    key: 'auditConfirm-true',
                    label: <span>审核通过</span>
                },
                {
                    key: 'hasChild',
                    label: <span>进行中</span>
                },
                {
                    key: 'Completion',
                    label: <span>已完结</span>
                },
                {
                    key: 'delete',
                    label: <span>已废除</span>
                },
                {
                    key: 'auditConfirm-false',
                    label: <span>审核未通过</span>
                },
            ],
            onChange: (key: any) => {
                if (key == 'all') {
                    setParams({ enable: true })
                } else if (key == 'hasChild') {
                    setParams({ enable: true, isOver: false, auditConfirm: true })
                } else if (key == 'Completion') {
                    setParams({ enable: true, isOver: true, auditConfirm: true })
                } else if (key == 'delete') {
                    setParams({ enable: false })
                } else if (key == 'auditConfirm-isNull') {
                    setParams({ 'auditConfirm-isNull': true, enable: true })
                } else if (key == 'auditConfirm-false') {
                    setParams({ auditConfirm: false, enable: true })
                } else if (key == 'auditConfirm-true') {
                    setParams({ auditConfirm: true, enable: true })
                }
                callbackRef()
            }
        }
    }
    const chargeInvoiceDown = (data: any) => {
        let arr: any = []
        const idList: any = []
        data.forEach((item: any) => {
            if (item.chargeNum) {
                const idArr = item.chargeIds.split()
                idArr.forEach((itemArr) => {
                    if (itemArr != ',') {
                        idList.push(itemArr)
                    }
                })
                // idList.push(item.chargeIds.replace(/,/g, ''))
            } else {
                arr.push(item)
            }
        })
        arr = arr.map((item: any) => {
            item.productType = item.productType + ''
            item.invoiceType = item.type + ''
            item.invoiceAmount = item.amount
            item.invoiceBank = item.bank
            item.invoiceAccount = item.account
            delete item.amount
            return item
        })
        // console.log('arr', arr,idList);

        chargeDownload(idList.join(','), arr)

    }
    const invoiceDown = (data: any[]) => {
        if (!data || data.length == 0) {
            message.error('未选择数据！')
            return
        }
        request.get('/sms/business/bizInvoice', { 'id-in': data.map(x => x.id), _size: 100 }).then(res => {
            if (res.status == 'success') {
                DownTable(res.data.content, DownHeader.Invoice, '发票信息', 'invoice');
            }
        })
    }
    const biuldData = (data: any) => {
        setUploadData(biuldDataFromExcelJson(data));
    }
    return (
        <div>
            <Tables
                actionRef={actionRef}
                formRef={formRef}
                columns={columns}
                scroll={{ x: 1500 }}
                request={{ url: '/sms/business/bizInvoice', sortList: sortList, params }}
                search={chargeId || inWin ? false : {
                    labelWidth: 120,
                    defaultCollapsed: true,
                    defaultColsNumber: 10
                }}
                toolbar={chargeId ? false : toolbar}
                toolBarRender={chargeId ? false : toolBarRender}
                rowSelection={{
                    // 注释该行则默认不显示下拉选项
                    selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                    onChange: (e, selectedRows) => {
                        // setStudentIds(e);
                    },
                }}
                onFn={(e: any) => setContentList(e)}
                tableAlertOptionRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => {
                    return (
                        <Space size={24}>
                            <a style={{ marginInlineStart: 8 }} onClick={onCleanSelected}>
                                取消选择
                            </a>
                            {/* <a
                                onClick={async () => {

                                    const conetnt = await DownFn.chargFn(selectedRowKeys.join(','))
                                    DownTable(conetnt, DownHeader.chargeHeard, '发票信息', 'chargeInvoice')
                                }}
                            >
                                按缴费导出
                            </a>
                            <a
                                onClick={async () => {
                                    const conetnt = await DownFn.InvoiceFn(selectedRowKeys.join(','), 'invoice')
                                    console.log('conetnt', conetnt);

                                    DownTable(conetnt, DownHeader.InvoiceHeard, '发票信息', 'chargeInvoice')
                                }}
                            >
                                按开票导出
                            </a>
                            <a
                                onClick={async () => {
                                    const conetnt = await DownFn.InvoiceFn(selectedRowKeys.join(','), 'all')
                                    DownTable(conetnt, DownHeader.All, '发票信息', 'chargeInvoice')
                                }}
                            >
                                全部导出
                            </a> */}
                            <a
                                onClick={async () => chargeInvoiceDown(selectedRows)}
                            >
                                财务缴费导出
                            </a>
                            <a
                                onClick={async () => invoiceDown(selectedRows)}
                            >
                                导出发票
                            </a>
                            <Popconfirm
                                key={'Aedit'}
                                title="审核"
                                onConfirm={() => {
                                    auditsFn(selectedRows, true)
                                }}
                                onCancel={() => {
                                    auditsFn(selectedRows, false)
                                }}
                                okText="审核通过"
                                cancelText="审核不通过"
                            >
                                <a

                                >
                                    审核
                                </a>
                            </Popconfirm>
                        </Space>
                    );
                }}
            />
            {HasInvoiceFalg && (
                <HasInvoiceInfo
                    setModalVisible={() => setHasInvoiceVisible(false)}
                    modalVisible={HasInvoiceFalg}
                    callbackRef={() => callbackRef()}
                    renderData={renderDataInvoice}
                />
            )}


            {/* 新增发票信息 */}
            {ModalsVisible && (
                <Modal
                    renderDataInvoice={renderDataInvoice}
                    ModalsVisible={ModalsVisible}
                    setModalsVisible={() => setModalsVisible(false)}
                    callbackRef={() => callbackRef()}
                    setAddInvoiceVisible={() => setAddInvoiceVisible(true)}
                />
            )}

            
            {addInvoiceVisible && (
                <AddInvoice
                    renderData={renderDataInvoice}
                    ModalsVisible={addInvoiceVisible}
                    setModalsVisible={() => setAddInvoiceVisible(false)}
                    callbackRef={() => callbackRef()}
                />
            )}
            <AntdModal
                title="批量导入"
                okText="导入"
                onCancel={() => {
                    setUploadFormVisible(false)
                }}
                onOk={async () => {
                    if (!uploadData) {
                        message.error('请上传文件')
                        return
                    }
                    request.postAll("/sms/business/bizInvoice/editOfNum", uploadData).then(res => {
                        if (res.status == 'success') {
                            message.success('导入成功')
                            setUploadFormVisible(false);
                            callbackRef();
                        } else {
                            message.error(res.data)
                        }
                        setUploadData(undefined)
                    })
                }}
                width={800}
                visible={uploadFormVisible}
            >
                <a download="批量开票模板.xlsx" href="./template/批量开票模板.xlsx">
                    下载批量开票模板
                </a>
                <ProFormUploadDragger
                    // 这里我们只接受excel2007以后版本的文件，accept就是指定文件选择框的文件类型
                    accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    name='file'
                    // headers= {{authorization: 'authorization-text'}}
                    // 把excel的处理放在beforeUpload事件，否则要把文件上传到通过action指定的地址去后台处理
                    // 这里我们没有指定action地址，因为没有传到后台
                    fieldProps={{
                        beforeUpload: (file: any, fileList: any[]) => {
                            const reader = new FileReader();
                            reader.onload = (e: any) => {
                                const dataResult = e.target.result;
                                const workbook = XLSX.read(dataResult, { type: 'binary' });
                                // 假设我们的数据在第一个标签
                                const firstWorksheet = workbook.Sheets[workbook.SheetNames[0]];
                                // XLSX自带了一个工具把导入的数据转成json
                                const jsonArr = XLSX.utils.sheet_to_json(firstWorksheet, { header: 1 });
                                // 通过自定义的方法处理Json,得到Excel原始数据传给后端，后端统一处理
                                // this.importUserListExcel(jsonArr);
                                biuldData(jsonArr);
                            };
                            reader.readAsArrayBuffer(file);
                            return false;
                        }
                    }
                    }
                />
            </AntdModal>
        </div>
    )
}