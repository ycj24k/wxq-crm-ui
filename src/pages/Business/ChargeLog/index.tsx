import Tables from "@/components/Tables"
import apiRequest from "@/services/ant-design-pro/apiRequest"
import dictionaries from "@/services/util/dictionaries"
import DownTable from "@/services/util/timeFn"
import { ExportOutlined, RedoOutlined } from "@ant-design/icons"
import { ProColumns } from "@ant-design/pro-table"
import { Button, Tag } from "antd"
import { useState } from "react"
import DownHeader from "./DownHeader"


export default (props: any) => {
    const { reBuild, select, getAll = false } = props
    const [exportLoading, setExportLoading] = useState<boolean>();
    const param = getAll ? {} : { isUseUp: false }
    const exportNotUseUp = () => {
        setExportLoading(true)
        apiRequest.get('/sms/business/bizChargeLog', { isUseUp: false, _isGetAll: true }).then(res => {
            DownTable(res.data.content, DownHeader.transaction, '专属收款码未下单记录', 'chargeLog')
            setExportLoading(false)
        })
    }
    const columns: ProColumns<any>[] = [
        {
            title: '收款编号',
            dataIndex: 'num'
        },
        {
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
            valueEnum: dictionaries.getSearch('dict_stu_refund_type')
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
            title: '收款时间',
            dataIndex: 'paymentTime',
            valueType: 'dateRange',
            sorter: true,
            render: (text, record) => record.paymentTime
        },
        {
            title: '操作',
            search: false,
            hideInTable: !select,
            render: (text, record) => <Button type='primary' onClick={() => select(record)}>选择</Button>
        },
    ];
    return <Tables
        columns={columns}
        request={{ url: '/sms/business/bizChargeLog' }}
        params={param}
        toolBarRender={[
            <Button icon={<ExportOutlined />} onClick={exportNotUseUp} loading={exportLoading} >导出未下单记录</Button>,
            <Button hidden={!reBuild} icon={<RedoOutlined />} onClick={reBuild} >重新生成二维码</Button>,
        ]}
    />
}