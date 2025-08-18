import apiRequest from "@/services/ant-design-pro/apiRequest";
import { ModalForm, ProFormInstance, ProFormText, ProFormTextArea, ProFormSelect, ProFormDigit } from "@ant-design/pro-form"
import { message } from "antd";
import { useEffect, useRef, useState } from "react";


export default (props: any) => {
    const { renderData, visible, setVisible, callbackRef } = props;
    const formRef = useRef<ProFormInstance>();
    const [departmentList, setDepartmentList] = useState<any>([]);
    //编辑回显数据
    useEffect(() => {
        if (renderData.type == 'eidt') {
            let formData = { ...renderData.record }
            formRef.current?.setFieldsValue(formData)
        }
    }, [renderData])
    //获取分公司名称
    useEffect(() => {
        getCompanyName()
    }, [])
    //获取分公司名称
    const getCompanyName = async () => {
        const contentList: any = await apiRequest.get('/sms/share/getDepartment', {
            _isGetAll: true,
        });
        let targetID = contentList.data[0].id
        const targetData = contentList.data.find((item: any) => item.parentId === targetID)
        const result = targetData ? contentList.data.filter((item: any) => item.parentId === targetID && item.parentId != -1) : [];
        const data = result.map((item: any) => {
            return {
                ...item,
                label: item.name,
                value: item.id,
            }
        })
        setDepartmentList(data)
    }
    return <ModalForm
        title='添加小组名称'
        visible={visible}
        formRef={formRef}
        width={500}
        modalProps={{
            // destroyOnClose: true,
            onCancel: () => {
                formRef.current?.resetFields()
                setVisible(false);
            }
        }}
        onFinish={async (value) => {

            if (renderData.type == 'eidt') {
                value.id = renderData.record.id;
            } else if (renderData.type == 'add') {
                delete value.id
            }

            apiRequest.post('/sms/lead/ladUserGroup', value).then((res: any) => {
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
        <ProFormText
            label="小组名称"
            placeholder={"请输入小组名称"}
            name="name"
            width="md"
            rules={[{ required: true, message: '请输入小组名称' }]}
        />
        <ProFormDigit name='sort' label='优先级' width="md" rules={[{ required: true }]} />
        <ProFormSelect
            label="事业部公司"
            name="departmentId"
            width="md"
            options={departmentList}
            rules={[{ required: true, message: '请选择事业部公司' }]}
        />
        <ProFormTextArea
            label="描述"
            name="description"
            width="md"
        />
    </ModalForm>
}