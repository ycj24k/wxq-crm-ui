import { useRef } from 'react';
import ProForm, {
    ModalForm, ProFormDatePicker, ProFormText, ProFormTextArea,
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import './index.less'
interface valueType {
    project: any;
    name: string;
    page: string;
    templateCode: string;
    templateId: number;
    id: number | string;
    templateParam: any;
    confirmTimeoutTime: string;
    content: string;
}

export default (props: any) => {
    const formRef = useRef<ProFormInstance>();
    const { modalVisible, setModalVisible } = props;
    return (
        <ModalForm<valueType>
            title='发送微信消息模板'
            width={500}
            autoFocusFirstInput
            // @ts-ignore
            layout="LAYOUT_TYPE_HORIZONTAL"
            modalProps={{
                onCancel: () => setModalVisible(),
            }}
            formRef={formRef}
            onFinish={async (values) => {
                console.log(values)
            }}
            visible={modalVisible}
        >
            <ProForm.Group>
                <ProFormText
                    name="studentName"
                    width="md"
                    label="标题"
                    placeholder="请输入标题"
                    rules={[
                        {
                            required: true,
                            message: '请输入标题',
                        },
                    ]}
                />
            </ProForm.Group>
            <ProForm.Group>
                <ProFormDatePicker
                    width="md"
                    name="nextVisitDate"
                    label="时间"
                    rules={[
                        {
                            required: true,
                            message: '请选择时间',
                        },
                    ]}
                />
            </ProForm.Group>
            <ProForm.Group>
                <ProFormTextArea width="md" name="description" label="内容" rules={[
                    {
                        required: true,
                        message: '请填写内容',
                    },
                ]} />
            </ProForm.Group>
        </ModalForm>
    );
};
