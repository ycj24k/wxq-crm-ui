import Tables from "@/components/Tables"
import apiRequest from "@/services/ant-design-pro/apiRequest"
import DownTable from "@/services/util/timeFn"
import { ExportOutlined, RedoOutlined } from "@ant-design/icons"
import { ActionType } from "@ant-design/pro-components"
import { ProFormDateRangePicker } from "@ant-design/pro-form"
import { ProColumns } from "@ant-design/pro-table"
import { Button, Drawer, message, Modal } from "antd"
import { useRef, useState } from "react"
import DownHeader from "./DownHeader"
import Info from "./info"


export default (props: any) => {
    const actionRef = useRef<ActionType>();
    const [visible, setVisible] = useState<boolean>();
    const [data, setData] = useState<boolean>();
    const [exportVisible, setExportVisible] = useState<boolean>();
    const [exportLoading, setExportLoading] = useState<boolean>();
    const [exportData, setExportData] = useState<any>();
    const [syncVisible, setSyncVisible] = useState<boolean>();
    const [syncLoading, setSyncLoading] = useState<boolean>();
    const [syncData, setSyncData] = useState<any>();
    const columns: ProColumns<any>[] = [
        {
            title: '订单号',
            dataIndex: 'num'
        },
        {
            title: '商户号',
            dataIndex: 'cusid',
        },
        {
            title: '交易时间',
            dataIndex: 'dateTime',
            valueType: 'dateRange',
            render: (text, record) => <span>{record.dateTime}</span>,
        },
        {
            title: '交易金额',
            dataIndex: 'amount',
        },
        {
            title: '手续费',
            dataIndex: 'commission'
        },
        {
            title: '原始金额',
            dataIndex: 'originalAmount'
        },
        {
            title: '结算金额',
            dataIndex: 'settlementAmount',
            sorter: true
        },
        {
            title: '产品类型',
            dataIndex: 'productType',
        },
        {
            title: '操作',
            search: false,
            render: (text, record) => <Button type='link' onClick={() => {
                setData(record)
                setVisible(true)
            }}>查看详情</Button>
        },
    ];
    return <>
        <Tables
            columns={columns}
            actionRef={actionRef}
            request={{ url: '/sms/business/bizTransaction' }}
            toolBarRender={[
                <Button icon={<RedoOutlined />} onClick={() => setSyncVisible(true)} >手动同步流水</Button>,
                <Button icon={<ExportOutlined />} onClick={() => setExportVisible(true)} >导出</Button>,
            ]}
        />
        <Modal
            open={exportVisible}
            okText="导出"
            onCancel={() => setExportVisible(false)}
            onOk={() => {
                if (!exportData || exportData.length < 2) {
                    message.error('请选择交易时间')
                    return
                }
                setExportLoading(true)
                apiRequest.get('/sms/business/bizTransaction', { dateTime: exportData, _isGetAll: true }).then(res => {
                    DownTable(res.data.content, DownHeader.transaction, '交易流水', 'transaction')
                    setExportLoading(false)
                })
            }}
            confirmLoading={exportLoading}
        >
            <ProFormDateRangePicker fieldProps={{
                onChange(e) {
                    setExportData(e)
                },
            }} label="交易时间区间" />
        </Modal>
        <Modal
            open={syncVisible}
            okText="同步"
            onCancel={() => setSyncVisible(false)}
            onOk={() => {
                if (!syncData || syncData.length < 2) {
                    message.error('请选择同步时间')
                    return
                }
                setSyncLoading(true)
                apiRequest.post('/sms/business/bizTransaction/sync', {
                    startDate: syncData.at(0).format('YYYY-MM-DD'),
                    endDate: syncData.at(1).format('YYYY-MM-DD')
                }).then(res => {
                    message.success('同步成功')
                    actionRef.current?.reload()
                }).finally(() => {
                    setSyncLoading(false)
                })
            }}
            confirmLoading={syncLoading}
        >
            <ProFormDateRangePicker fieldProps={{
                onChange(e) {
                    setSyncData(e)
                },
            }} label="同步时间区间" />
        </Modal>
        <Drawer
            title={'缴费信息'}
            onClose={() => setVisible(false)}
            visible={visible}
            width={1200}
        >
            <Info data={data} />
        </Drawer>
    </>
}