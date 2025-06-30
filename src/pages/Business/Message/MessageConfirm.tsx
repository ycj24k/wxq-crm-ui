import Tables from "@/components/Tables";
import DownTable from "@/services/util/timeFn";
import { ProColumns } from "@ant-design/pro-table";
import { Modal, Tag } from "antd"
import moment from "moment";
import request from '@/services/ant-design-pro/apiRequest';



type GithubIssueItem = {
    studentName: string;
    confirmTime: string;
    isConfirm: boolean
};
export default (props: any) => {
    const { modalVisible, setModalVisible, renderData } = props;
    const downObj = {
        姓名: 'studentName',
        手机号: 'mobile',
        确认状态: 'isConfirm',
        确认时间: 'confirmTime'
    }
    const columns: ProColumns<GithubIssueItem>[] = [
        {
            title: '姓名',
            dataIndex: 'studentName',
            width: 200
        },
        {
            title: '确认状态',
            dataIndex: 'isConfirm',
            render: (text, record) => (
                <>
                    {
                        record.isConfirm ? <Tag color="#87d068">已确认</Tag> : <Tag color="#f50">未确认</Tag>
                    }
                </>
            )
        },
        {
            title: '手机号',
            dataIndex: 'mobile',
        },
        {
            title: '确认时间',
            dataIndex: 'confirmTime',
            width: 120,
            render: (text, record) => (
                <>
                    {record.confirmTime}
                </>
            )
        },
    ]
    const DownTableFn = async () => {
        const list = (await request.get('/sms/business/bizMessage', { batchId: renderData.batchId })).data.content
        DownTable(list, downObj, '消息确认状态')
    }

    return (
        <Modal
            title='消息确认'
            width={1000}
            open={modalVisible}
            onCancel={() => setModalVisible()}
            onOk={() => setModalVisible()}
        >
            <Tables
                columns={columns}
                request={{ url: '/sms/business/bizMessage', params: { batchId: renderData.batchId } }}
                toolBarRender={[
                    <a
                        onClick={() => DownTableFn()}
                    >
                        导出消息确认状态
                    </a>
                ]}
            />
        </Modal>
    )
}