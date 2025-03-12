import { Modal, Tag } from "antd"
import Message from "../Message";
export default (props: any) => {
    const { modalVisible, setModalVisible, renderData } = props;


    return (
        <Modal
            title='消息确认'
            width={1000}
            open={modalVisible}
            onCancel={() => setModalVisible()}
            onOk={() => setModalVisible()}
        >
            <Message classId={renderData.id} />
        </Modal>
    )
}
