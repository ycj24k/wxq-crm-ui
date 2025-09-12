import UploadDragger from "@/components/UploadDragger/UploadDragger"
import apiRequest from "@/services/ant-design-pro/apiRequest";
import type { ProFormInstance} from "@ant-design/pro-form";
import ProForm, { ModalForm, ProFormDatePicker, ProFormMoney, ProFormText, ProFormTextArea } from "@ant-design/pro-form"
import { message } from "antd";
import { useEffect, useRef } from "react";

export default (props: any) => {
    const { renderData, visible, setVisible, callbackRef } = props;
    const formRef = useRef<ProFormInstance>();
    useEffect(() => {
        if (visible) {
            console.log(formRef)
            console.log(renderData)
            const formData = { ...renderData }
            if (formData.file && typeof renderData.file == 'string') {
                const arr: { uid: number; name: any; response: { data: any } }[] = [];
                formData.file.split(',').forEach((item: any, index: number) => {
                    arr.push({
                        uid: index + 1,
                        name: item,
                        response: { data: item },
                    });
                });
                formData.file = arr;
            }
            formRef.current?.setFieldsValue(formData)
        }
    }, [visible])
    return <ModalForm
        title='服务协议'
        visible={visible}
        formRef={formRef}
        modalProps={{
            // destroyOnClose: true,
            onCancel: () => {
                formRef.current?.resetFields()
                setVisible(false);
            }
        }}
        onFinish={async (from) => {
            if (from.file) {
                const arr: any[] = [];
                from.file.forEach((item: any) => {
                    arr.push(item.response.data);
                });
                from.file = arr.join(',');
            }
            console.log(from);
            from = { ...renderData, ...from }
            console.log(from)

            apiRequest.post('/sms/business/bizAgreement', from).then((res: any) => {
                if (res.status == 'success') {
                    message.success('操作成功');
                    setVisible(false)
                    callbackRef();
                } else {
                    message.error(res.msg);
                }
            })
        }}
    >
        <ProForm.Group>
            <ProFormText rules={[{ required: true }]} width="xs" name='personName' label='老师' />
            <ProFormText rules={[{ required: true }]} width="sm" name='project' label='项目' />
            <ProFormMoney rules={[{ required: true }]} width="sm" name='amount' label='金额' />
        </ProForm.Group>
        <ProForm.Group>
            <ProFormDatePicker rules={[{ required: true }]} width="sm" name='startDate' label='服务开始时间' />
            <ProFormDatePicker rules={[{ required: true }]} width="sm" name='endDate' label='服务结束时间' />
        </ProForm.Group>
        <ProFormTextArea name='remark' label='备注' />
        <UploadDragger
            rules={[{ required: true }]}
            label="协议文件"
            name="file"
            action={'/sms/business/bizAgreement/upload'}
            renderData={renderData}
            fileUrl={'/sms/business/bizAgreement/download'}
        />
    </ModalForm>
}