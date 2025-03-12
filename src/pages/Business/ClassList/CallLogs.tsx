import Tables from "@/components/Tables";
import { Modal } from "antd"




export default (props: any) => {
    const { modalVisible, setModalVisible, renderData } = props;


    const columns = [
        {
            title: '姓名',
            dataIndex: 'studentName'
        },
        {
            title: '手机号',
            dataIndex: 'mobile'
        },
        {
            title: '通话状态',
            dataIndex: 'code'
        },
        {
            title: '创建时间',
            dataIndex: 'createTime'
        },
    ]


    return <Modal

        title='通话记录'
        open={modalVisible}
        width={1000}
        onOk={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
    >

        <Tables
            columns={columns}
            request={{ url: '/sms/business/bizCallLog', params: { classId: renderData.id } }}
        />

    </Modal>
}