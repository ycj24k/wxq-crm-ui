import Tables from "@/components/Tables"
import { PageContainer } from "@ant-design/pro-layout"
import { ProColumns } from "@ant-design/pro-table"
import { Space } from "antd";
import request from '@/services/ant-design-pro/apiRequest';
import MessageConfirm from './MessageConfirm'
import { useState } from "react";



type GithubIssueItem = {
    name: string;
    batchId: number
};
export default (props: any) => {
    const { classId } = props
    const [modalVisible, setModalVisible] = useState(false);
    const [renderData, setRenderData] = useState<any>();
    const params = classId ? { classId } : {}


    const columns: ProColumns<GithubIssueItem>[] = [
        {
            title: '班级名称',
            dataIndex: 'className',
            width: 200
        },
        {
            title: '消息内容',
            dataIndex: 'content'
        },
        {
            title: '已确认人数',
            dataIndex: 'confirmQuantity',
            width: 120
        },
        {
            title: '操作',
            width: 100,
            key: 'optins',
            render: (text, record) => (
                <Space>
                    <a
                        onClick={() => {
                            setRenderData(record)
                            setModalVisible(true)
                        }}
                    >
                        查看
                    </a>
                </Space>
            )
        }

    ]
    let sortList = {
        ['updateTime']: 'desc',
    };
    return (
        <PageContainer>
            <Tables
                columns={columns}
                className="Message"
                request={{ url: '/sms/business/bizMessageBatch', params, sortList }}
            />
            {modalVisible && (
                <MessageConfirm
                    modalVisible={modalVisible}
                    setModalVisible={() => setModalVisible(false)}
                    renderData={renderData}
                />
            )}
        </PageContainer>
    )
}