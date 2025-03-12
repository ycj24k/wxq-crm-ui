import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Checkbox, message, Spin } from 'antd';
import ProForm, {
    ModalForm, ProFormDatePicker, ProFormDateRangePicker, ProFormList, ProFormSelect, ProFormText, ProFormTextArea,
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProCard from '@ant-design/pro-card';
import Dictionaries from '@/services/util/dictionaries';
import request from '@/services/ant-design-pro/apiRequest';
import './index.less'
import WxMessageRule from './WxMessageRule'
import WxMessageErrCode from './WxMessageErrCode';
import Tables from '@/components/Tables';
import DownTable from '@/services/util/timeFn';
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
    const { modalVisible, setModalVisible, callbackRef, renderData } = props;
    const [template, setTemplate] = useState('')
    const [WxPage, setWxPage] = useState<string | boolean>(false)
    const [spinning, setspinning] = useState<boolean>(false)
    const [templateContent, setTemplateContent] = useState([])
    const [templateContentMessage, setTemplateContentMessage] = useState([])
    const [dataSourceNull, setdataSourceNull] = useState([])
    const [dataSourceOk, setdataSourceOk] = useState([])
    const [dataSourceErr, setdataSourceErr] = useState([])
    useEffect(() => {
        // checkMobileById()
    }, [])
    const downObj = {
        姓名: 'name',
        手机号: 'mobile',
        错误信息: 'errcode'
    }
    const checkMobileById = async () => {
        let url = renderData.messageType == 'class' ? '/sms/business/bizClass/checkMobileById' : '/sms/business/bizOrder/checkMobileById'
        let data = { idList: renderData.id }
        const dataDataSour = await request.get(url, data)
        setdataSourceNull(dataDataSour.data)
    }
    const submitok = async (values: valueType) => {
        setspinning(true)
        let requestData: any = {
            idList: renderData.id,
            templateId: values.templateId,
            page: values.page,
            confirmTimeoutTime: values.confirmTimeoutTime,
            content: values.content

        }
        let url = '/sms/business/bizClass/sendMessageById'
        if (renderData.messageType == 'class') {
            url = '/sms/business/bizClass/sendMessageById'
        } else {
            url = '/sms/business/bizOrder/sendMessageById'
        }
        let data = {}
        const templateData = values.templateParam[0]
        Object.keys(templateData).forEach((key) => {
            data[key] = { "value": templateData[key] }
        })
        requestData.data = JSON.stringify(data)
        console.log('requestData', requestData);

        const resData = (await request.post(url, requestData)).data
        let okArr: any = []
        let errArr: any = []
        resData.forEach((item: { errmsg: string; name: any; mobile: any; errcode: string | number; }) => {
            if (item.errmsg == 'ok') {
                okArr.push({
                    name: item.name,
                    mobile: item.mobile
                })
            } else {
                errArr.push({
                    name: item.name,
                    mobile: item.mobile,
                    errcode: WxMessageErrCode[item.errcode],
                })
            }
        })
        message.success('操作成功!', 5)
        checkMobileById()
        setdataSourceErr(errArr)
        setdataSourceOk(okArr)
        setspinning(false)
    };

    const onChange = (e: string) => {
        setTemplate(e)
        const data = JSON.parse(Dictionaries.getDescription('Wx_message', e))
        let arr: any = []
        data.forEach((item: any) => {
            arr.push({ label: item.label, value: '', name: item.name })
        })
        setTemplateContent(data)
        setTemplateContentMessage(arr)
    }
    const onFormChange = (e: any) => {
        const formValue = formRef.current?.getFieldsValue().templateParam[0];
        let data = JSON.parse(JSON.stringify(templateContentMessage));
        Object.keys(formValue).forEach((key) => {
            data.forEach((item: any) => {
                if (key == item.name && formValue[key]) {
                    item.value = formValue[key]
                }
            })
        })
        setTemplateContentMessage(data)
    }
    return (
        <ModalForm<valueType>
            title='发送微信订阅消息'
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
                <ProCard colSpan="60%">
                    <ProFormSelect
                        label="消息模板"
                        name="templateId"
                        width={200}
                        fieldProps={{
                            onChange: (e) => onChange(e)
                        }}
                        rules={[{ required: true, message: '请选择短消息模板' }]}
                        request={async () => Dictionaries.getList('Wx_message') as any}
                    />
                    {
                        templateContent.length && <ProFormList
                            name='templateParam'
                            label='消息模板内容填充'
                            initialValue={[
                                {

                                }
                            ]}
                            max={1}
                            min={1}
                            itemRender={({ listDom, action }, { record, index, name }) => {
                                return (
                                    templateContent.map((item: { name: string, label: string }, index) => {
                                        return (
                                            <div>
                                                <div>
                                                    <a>{WxMessageRule[item.name.replace(/\d/g, '')]}</a>
                                                </div>
                                                <ProFormText
                                                    fieldProps={{ onChange: e => onFormChange(e) }}
                                                    key={index}
                                                    name={item.name}
                                                    label={item.label}
                                                    rules={[{ required: true, message: `请输入${item.label}` }]}
                                                />

                                            </div>
                                        )
                                    })
                                )
                            }}
                        ></ProFormList>
                    }
                    <ProFormSelect
                        label="小程序页面"
                        name="page"
                        width={200}
                        fieldProps={{
                            onChange: (e) => {
                                setWxPage(e)
                            }
                        }}
                        rules={[{ required: true, message: '请选择小程序页面' }]}
                        request={async () => Dictionaries.getList('Wx_Routes') as any}
                    />
                    <div>
                        <a>
                            填写消息内容前请先写消息标题用【】包裹,在写消息内容,列如:【考试确认通知】 计划考试时间为XXXX年XX月XX日 是否确认考试
                        </a>
                    </div>
                    <ProFormTextArea
                        name='content'
                        label='消息内容'
                        rules={[{ required: true, message: '请填写消息内容' }]}
                    />
                    <ProFormDatePicker
                        name="confirmTimeoutTime"
                        fieldProps={{
                            // showTime: { format: 'HH:mm:ss' },
                            format: 'YYYY-MM-DD',
                        }}
                        width="sm"
                        label='消息确认期限'
                        rules={[{ required: true, message: '请填写消息确认期限' }]}
                    />
                </ProCard>
                <ProCard title='订阅消息预览：' colSpan="40%">
                    <div className='wxmessage'>
                        <div className='wxmessage-title'>联材通</div>
                        <div className='wxmessage-messageName'>{Dictionaries.getName('Wx_message', template)}</div>
                        <div className='wxmessage-content'>
                            {
                                templateContentMessage.map((item: any, index) => {
                                    return (
                                        <div key={index}>
                                            <span>{item.label}</span>{item.value}
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div className='wxmessage-bot' hidden={!WxPage}>
                            <div>
                                进入小程序查看
                            </div>
                            <div>
                                {`>`}
                            </div>
                        </div>
                    </div>
                    <div className='send'>
                        <Button loading={spinning} key="button" type="primary" onClick={() => {
                            const sub = formRef.current
                            sub?.submit()
                        }}>发送</Button>
                    </div>
                </ProCard>
            </ProCard>
            <ProCard title='发送状态：'>
                <Spin spinning={spinning}>
                    <Tables
                        columns={[{ title: '姓名', dataIndex: 'name', key: 'name' }, { title: '手机号', dataIndex: 'mobile', key: 'mobile' }]}
                        toolBarRender={[
                            <div>未登陆小程序学员</div>,
                            <a onClick={() => DownTable(dataSourceNull, downObj, '未登陆小程序学员')}>导出信息</a>
                        ]}
                        dataSource={dataSourceNull}
                        search={false}
                    />
                    <Tables
                        columns={[{ title: '姓名', dataIndex: 'name', key: 'name' }, { title: '手机号', dataIndex: 'mobile', key: 'mobile' }, { title: '错误原因', dataIndex: 'errcode', key: 'errcode' }]}
                        toolBarRender={[
                            <div>发送失败的学员</div>,
                            <a onClick={() => DownTable(dataSourceErr, downObj, '发送失败的学员')}>导出信息</a>
                        ]}
                        dataSource={dataSourceErr}
                        search={false}
                    />
                    <Tables
                        columns={[{ title: '姓名', dataIndex: 'name', key: 'name' }, { title: '手机号', dataIndex: 'mobile', key: 'mobile' }]}
                        toolBarRender={[
                            <div>发送成功的学员</div>,
                            <a onClick={() => DownTable(dataSourceOk, downObj, '发送成功的学员')}>导出信息</a>
                        ]}
                        dataSource={dataSourceOk}
                        search={false}
                    />
                </Spin>
            </ProCard>
        </ModalForm>
    );
};
