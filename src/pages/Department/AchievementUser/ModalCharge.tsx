import Tables from "@/components/Tables"
import type { ProColumns } from "@ant-design/pro-table";
import { Modal } from "antd"
import moment from 'moment';
import Dictionaries from '@/services/util/dictionaries';
import filter from '@/services/util/filter';
















export default (props: any) => {
    const { modalVisible, setModalVisible, callbackRef, renderData, userId, setSubimtDatas, chargeType } = props;
    const columns: ProColumns<API.GithubIssueItem>[] = [
        {
            title: '缴费编号',
            dataIndex: 'num',
            width: 130,
            fixed: 'left',
            sorter: true,
        },
        {
            title: '学员',
            dataIndex: 'studentName',
            width: 80,
            // search: false,
            fixed: 'left',
            sorter: true,
        },
        {
            title: chargeType == 'refundList' ? '退费日期' : '收费日期',
            key: 'chargeTime',
            sorter: true,
            width: 120,
            dataIndex: 'chargeTime',
            valueType: 'dateRange',
            render: (text, record) => <span>{record.chargeTime}</span>,
        },
        {
            title: '项目总称',
            dataIndex: 'parentProjects',
            key: 'parentProjects',
            sorter: true,
            valueType: 'cascader',
            fieldProps: {
                options: Dictionaries.getList('dict_reg_job'),
                showSearch: { filter },
            },
            width: 150,
            render: (text, record) => (
                <span key="parentProjects">
                    {Dictionaries.getCascaderAllName('dict_reg_job', record.project)}
                </span>
            ),
        },
        {
            title: chargeType == 'refundList' ? '退费项目' : '收费项目',
            dataIndex: 'project',
            width: 150,
            // search: false,
            key: 'project',
            sorter: true,
            valueType: 'cascader',
            fieldProps: {
                options: Dictionaries.getCascader('dict_reg_job'),
                showSearch: { filter },
            },
            render: (text, record) => (
                <span>
                    {record.project &&
                        [...new Set(record.project.split(','))].map((item: any, index: number) => {
                            return (
                                <span key={`project-${item}-${index}`}>
                                    {Dictionaries.getCascaderName('dict_reg_job', item)} <br />
                                </span>
                            );
                        })}
                </span>
            ),
        },
        {
            title: '退款类型',
            dataIndex: 'refundType',
            width: 80,
            valueType: 'select',
            hideInTable: chargeType != 'refundList',
            valueEnum: Dictionaries.getSearch('dict_refundType'),
            render: (text, record) => (
                <span>{Dictionaries.getCascaderName('dict_refundType', record.refundType)}</span>
            ),
        },
        {
            title: '备注',
            dataIndex: 'description',
            // search: false,
            // ellipsis: true,
            width: 150,
            // tip: '备注过长会自动收缩',
        },
        {
            title: chargeType == 'refundList' ? '退费人' : '收费人',
            dataIndex: 'userName',
            width: 80,
            // search: false,
        },
        {
            title: '经办人',
            dataIndex: 'agentName',
            hideInTable: chargeType != 'refundList',
            width: 80,
            // search: false,
        },
        {
            title: '业绩金额',
            dataIndex: 'performanceAmount',
            width: 100,
            // search: false,
            order: 8,
        },
        {
            title: '审核人',
            dataIndex: 'auditor',
            width: 80,
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
    ]
    const sortList: any = {
        ['num,updateTime']: 'desc,desc',
    };
    const params = chargeType == 'refundList' ? { enable: true, 'type-in': '1,3', auditType: 4, confirm: true } : { enable: true, confirm: true, 'type-in': '0,2' }
    return (

        <Modal
            width={1200}
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
        >
            <Tables
                columns={columns}
                request={{ url: '/sms/business/bizCharge', sortList: sortList, params: { ...params, ...renderData, userId } }}

            />

        </Modal>


    )


}