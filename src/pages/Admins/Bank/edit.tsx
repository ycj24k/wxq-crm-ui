import UploadDragger from "@/components/UploadDragger/UploadDragger"
import apiRequest from "@/services/ant-design-pro/apiRequest";
import dictionaries from "@/services/util/dictionaries";
import { getCompanyRequest } from "@/services/util/util";
import type { ProFormInstance} from "@ant-design/pro-form";
import ProForm, { ModalForm, ProFormDatePicker, ProFormMoney, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-form"
import { message } from "antd";
import { useEffect, useRef } from "react";

export default (props: any) => {
    const { renderData, visible, setVisible, callbackRef } = props;
    const formRef = useRef<ProFormInstance>();
    useEffect(() => {
        if (renderData) Object.keys(renderData).forEach(key => renderData[key] = renderData[key] + '')
        if (visible) formRef.current?.setFieldsValue(renderData)
        else formRef.current?.resetFields()
    }, [visible])
    return <ModalForm
        title='银行信息'
        visible={visible}
        formRef={formRef}
        modalProps={{
            onCancel: () => setVisible(false)
        }}
        onFinish={async (from) => {
            from = { ...renderData, ...from }
            console.log(from)
            apiRequest.post('/sms/system/sysBank', from).then((res: any) => {
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
            <ProFormSelect request={getCompanyRequest} rules={[{ required: true }]} width="xl" name='companyId' label='所属公司' />
            <ProFormText rules={[{ required: true }]} width="sm" name='name' label='银行名称' />
            <ProFormSelect valueEnum={dictionaries.getSearch('bankType')} rules={[{ required: true }]} width="sm" name='type' label='银行类型' />
            <ProFormSelect valueEnum={dictionaries.getSearch('dict_stu_refund_type')} rules={[{ required: true }]} width="sm" name='method' label='收付款方式' />
        </ProForm.Group>
        <ProForm.Group>
            <ProFormText width="sm" name='cusid' label='商户号ID' />
            <ProFormText width="sm" name='appid' label='应用ID' />
        </ProForm.Group>
        <ProFormTextArea name='privateKey' label='秘钥/私钥' />
    </ModalForm>
}