import React, { useEffect, useRef, useState } from 'react';
import { Button, message } from 'antd';
import ProForm, {
    ModalForm,
    ProFormCascader,
    ProFormDatePicker,
    ProFormDateRangePicker,
    ProFormDateTimeRangePicker,
    ProFormDigit,
    ProFormSelect,
    ProFormSwitch,
    ProFormText,
    ProFormTextArea,
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import Dictionaries from '@/services/util/dictionaries';

import request from '@/services/ant-design-pro/apiRequest';
interface valueType {
    project: any;
    name: string;
    value: string;
    description: string;
    parentId: number;
    id: number | string;
    JobClassExam: any;
}

export default (props: any) => {
    const formRef = useRef<ProFormInstance>();
    const { modalVisible, setModalVisible, callbackRef, renderData } = props;
    const [siwtch1, setSiwtch1] = useState<boolean>(false)
    const [siwtch2, setSiwtch2] = useState<boolean>(false)
    const [id, setId] = useState<boolean | number>(false)
    useEffect(() => {
        getStudyPlan()
    }, [])
    const getStudyPlan = async () => {
        const data = (await request.get('/sms/business/bizStudyPlan', { classId: renderData.id })).data.content
        if (data.length > 0) {
            const info = data[0]
            setId(info.id)
            info.question = [info.questionStartTime, info.questionEndTime]
            formRef.current?.setFieldsValue(info)
        } else {
            setSiwtch1(true)
            setSiwtch2(true)
        }
    }


    const submitok = (values: any) => {
        values.classId = renderData.id
        if (id) values.id = id
        if (values.question) {
            values.questionStartTime = values.question[0]
            values.questionEndTime = values.question[1]
            delete values.question
        }

        return new Promise((resolve, reject) => {
            request.post('/sms/business/bizStudyPlan', values).then((res: any) => {
                if (res.status == 'success') {
                    resolve(true);
                    message.success('提交成功');
                    setModalVisible();
                    callbackRef();
                }
            })
                .catch((err: any) => {
                    resolve(true);
                });
        });
    };

    return (
        <ModalForm<valueType>
            title='学习计划'
            autoFocusFirstInput
            // width={500}
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
            <div style={{ display: 'flex' }}>
                <div style={{ marginRight: '30px' }}>
                    <ProFormSwitch
                        label='是否开启登录提醒'
                        name='loginReminderEnable'
                        fieldProps={{
                            onChange: async (e) => {
                                setSiwtch1(!e)
                            }
                        }}
                    />
                </div>
                <div>
                    <ProFormDigit
                        label='开启提醒的未登录天数'
                        name='notLoginDayNum'
                        disabled={siwtch1}
                    />
                </div>
            </div>
            <div style={{ display: 'flex' }}>
                <div style={{ marginRight: '30px', width: '175px' }}>
                    <ProFormSwitch
                        label='是否开启刷题提醒'
                        name='questionReminderEnable'
                        fieldProps={{
                            onChange: e => setSiwtch2(!e)
                        }}
                    />
                </div>
                <div>
                    <ProFormDateRangePicker
                        width={'md'}
                        label='刷题开始-结束时间'
                        name='question'
                        disabled={siwtch2}
                    />
                    <ProFormDigit
                        label='目标刷题量'
                        name='targetQuestionNum'
                        width={'sm'}
                        disabled={siwtch2}
                    />
                </div>
            </div>
            <div>
                <ProFormDigit
                    label='统一提醒时间小时'
                    name='reminderHour'
                    width={'sm'}
                    rules={[{
                        required: true
                    }]}
                />
            </div>
        </ModalForm>
    );
};


