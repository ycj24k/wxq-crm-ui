import { useEffect, useRef, useState } from 'react';
import ProForm, {
    ModalForm, ProFormText, ProFormTextArea, ProFormSelect, ProFormDateTimePicker
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';

import request from '@/services/ant-design-pro/apiRequest';
import './index.less'
import { message } from 'antd';
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
    thing4: string;
    thing2: string;
    time5: string;
}

export default (props: any) => {
    const formRef = useRef<ProFormInstance>();
    const { modalVisible, setModalVisible, renderData, callbackRef } = props;
    const [template, setTemplate] = useState<any>([])
    const [otherText, setOtherText] = useState<boolean>(false)
    useEffect(() => {
        const arr = localStorage.getItem('dictionariesList')
        const newArr = JSON.parse(arr as string)
        let arr2 = newArr[42].children.map((item: any) => {
            return {
                label: item.name,
                value: item.code
            }
        })
        setTemplate(arr2)
    }, [])
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
                console.log('表单提交 - values:', values);

                try {
                    let idArray = [];
                    if (renderData && renderData.id) {
                        if (typeof renderData.id === 'string' && renderData.id.includes(',')) {
                            idArray = renderData.id.split(',');
                        } else {
                            idArray = [renderData.id];
                        }
                    }

                    // 创建一个包含thing4、time5和thing2的嵌套对象
                    const templateParams = {
                        thing4: values.thing4,
                        time5: values.time5,
                        thing2: values.thing2
                    };

                    const data = templateParams


                    // 从values中提取其他字段
                    const { thing4, thing2, time5, ...restValues } = values;
                    const newArrs = {
                        data,
                        ...restValues
                    }
                    request.postAll('/sms/business/bizClass/sendTemplateMessageById', {
                        idList: idArray,
                        ...newArrs
                    }).then((res: any) => {
                        message.success('提交成功');
                        callbackRef()
                        setModalVisible(false)
                    });
                } catch (error) {
                    console.error('onFinish函数出错:', error);
                }
                return true;
            }}
            visible={modalVisible}
        >
            <ProForm.Group>
                <ProFormSelect
                    label="消息模板"
                    name="templateId"
                    options={template}
                    width="md"
                    fieldProps={{
                        onChange: (e) => {
                            setOtherText(true)
                        }
                    }}
                    rules={[{ required: true, message: '请选择短消息模板' }]}
                />
            </ProForm.Group>


            {otherText === true ? (
                <>
                    <ProForm.Group>
                        <ProFormText
                            name="thing4"
                            width="md"
                            label="工单名称"
                            placeholder="请输入工单名称"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入工单名称',
                                },
                            ]}
                        />
                    </ProForm.Group>
                    <ProForm.Group>
                        <ProFormText
                            name="thing2"
                            width="md"
                            label="创建人姓名"
                            placeholder="请输入创建人姓名"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入创建人姓名',
                                },
                            ]}
                        />
                    </ProForm.Group>
                    <ProForm.Group>
                        <ProFormDateTimePicker
                            name="time5"
                            width="md"
                            label="截止时间"
                            placeholder="请选择截止时间"
                            fieldProps={{
                                format: 'YYYY-MM-DD HH:mm:ss',
                            }}
                            rules={[{ required: true, message: '请选择截止时间' }]}
                        />
                    </ProForm.Group>
                </>
            ) : null}

            <ProForm.Group>
                <ProFormText
                    name="title"
                    width="md"
                    label="模板标题"
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
                <ProFormDateTimePicker
                    name="confirmTimeoutTime"
                    width="md"
                    label="超时时间"
                    placeholder="请选择超时时间"
                    fieldProps={{
                        format: 'YYYY-MM-DD HH:mm:ss',
                    }}
                    rules={[{ required: true, message: '请选择超时时间' }]}
                />
            </ProForm.Group>
            <ProForm.Group>
                <ProFormTextArea
                    width="md"
                    name="content"
                    label="模板内容"
                    rules={[
                        {
                            required: true,
                            message: '请填写内容',
                        },
                    ]}
                />
            </ProForm.Group>
        </ModalForm>
    );
};