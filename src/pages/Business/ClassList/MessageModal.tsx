import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Checkbox, message } from 'antd';
import ProForm, {
    ModalForm,
    ProFormCascader,
    ProFormList,
    ProFormSelect,
    ProFormText,
    ProFormTextArea,
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import Dictionaries from '@/services/util/dictionaries';

import request from '@/services/ant-design-pro/apiRequest';
import './index.less'
import ProCard from '@ant-design/pro-card';
interface valueType {
    project: any;
    name: string;
    signName: string;
    templateCode: string;
    parentId: number;
    id: number | string;
    templateParam: any;
}

export default (props: any) => {
    const formRef = useRef<ProFormInstance>();
    const { modalVisible, setModalVisible, callbackRef, renderData } = props;
    const [contentMessage, setContentMessage] = useState<string>('')
    const [contentMessageNew, setContentMessageNew] = useState<String>('')
    const [formInput, SetFormInput] = useState<string[]>([])
    const [signName, setsignName] = useState<string>('')
    useEffect(() => {
        let str = contentMessage
        let formList = []
        const regex = /\${(.*?)}/g;
        let match;
        while ((match = regex.exec(str)) !== null) {
            formList.push(match[1])
        }
        console.log('formList', formList);

        SetFormInput(formList)
        setContentMessageNew(str)
    }, [contentMessage])
    const submitok = (values: valueType) => {
        let data = {}
        let url = ''
        if (renderData.messageType == 'class') {
            data = { signName: values.signName, templateCode: values.templateCode, templateParam: JSON.stringify(values.templateParam[0]), id: renderData.id }
            url = '/sms/business/bizClass/sendBatchSmsById'
        } else {
            data = { signName: values.signName, templateCode: values.templateCode, templateParam: JSON.stringify(values.templateParam[0]), idList: renderData.id }
            url = '/sms/business/bizOrder/sendBatchSmsById'
        }
        request.post(url, data).then((res) => {
            const codeData = res.data
            if (codeData.every((item: { code: string; }) => item.code == 'OK')) {
                message.success('发送成功');
                setModalVisible();
                callbackRef();
            } else {
                message.success('发送失败');
            }

        })
    };
    const onFormChange = (e: any) => {
        const formValue = formRef.current?.getFieldsValue().templateParam[0]
        let formattedMessage = contentMessage
        Object.keys(formValue).forEach((key) => {
            if (formValue[key]) {
                const replaceStr = new RegExp(`\\$\\{${key}}`, "g");
                formattedMessage = formattedMessage.replace(replaceStr, formValue[key]);
            }
        });
        setContentMessageNew(formattedMessage)
    }
    const onChangeText = (item: string) => {
        let formValue = formRef.current?.getFieldsValue().templateParam[0]
        formValue[item] = '$' + item
        formRef.current?.setFieldValue('templateParam', [formValue])
    }
    return (
        <ModalForm<valueType>
            title='发送短信'
            autoFocusFirstInput
            width={1000}
            // @ts-ignore
            layout="LAYOUT_TYPE_HORIZONTAL"
            modalProps={{
                onCancel: () => setModalVisible(),
            }}
            formRef={formRef}
            onFinish={async (values) => {
                await submitok(values);
            }}
            visible={modalVisible}
        >
            <ProCard split="vertical">
                <ProCard colSpan="70%">
                    <ProFormSelect
                        label="短信签名"
                        name="signName"
                        width={200}
                        fieldProps={{
                            onChange: (e) => {
                                setsignName(e)
                            }
                        }}
                        rules={[{ required: true, message: '请选择短信签名' }]}
                        request={async () => Dictionaries.getList('aliyun_signName') as any}
                    />
                    <ProFormSelect
                        label="短信模板"
                        name="templateCode"
                        width={200}
                        fieldProps={{
                            onChange: (e) => {
                                setContentMessage(Dictionaries.getDescription('aliyun_templateCode', e))
                            }
                        }}
                        rules={[{ required: true, message: '请选择短信签名' }]}
                        request={async () => Dictionaries.getList('aliyun_templateCode') as any}
                    />
                    {
                        formInput.length > 0 ? <ProFormList
                            name='templateParam'
                            label='短信内容填充'
                            initialValue={[
                                {
                                    name: ''
                                }
                            ]}
                            max={1}
                            min={1}
                            itemRender={({ listDom, action }, { record, index, name }) => {
                                return (
                                    formInput.map((item) => {
                                        return (
                                            <div style={{ display: 'flex' }}>
                                                <ProFormText name={item} label={item} fieldProps={{ onChange: e => onFormChange(e) }} width={400} />
                                                <Checkbox onChange={() => onChangeText(item)}>动态参数</Checkbox>
                                            </div>

                                        )
                                    })
                                )
                            }}
                        >
                            {/* {
                                formInput.map((item) => {
                                    return (
                                        <ProFormText name={item} label={item} fieldProps={{ onChange: e => onFormChange(e) }} />
                                    )
                                })
                            } */}
                        </ProFormList> : ''
                    }



                    {/* <ProFormTextArea width="md" name="content" label="短信内容" /> */}
                </ProCard>
                <ProCard title='短信预览：' colSpan="30%">
                    <div className='message'>
                        【{signName}】 {`${contentMessageNew}`}
                    </div>
                </ProCard>
            </ProCard>

        </ModalForm>
    );
};
