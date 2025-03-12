import React, { useEffect, useRef, useState } from 'react';
import { Button, Image, message, Upload } from 'antd';
import ProForm, {
    ModalForm,
    ProFormDigit,
    ProFormInstance,
} from '@ant-design/pro-form';
import request from '@/services/ant-design-pro/apiRequest';
import { getFirstAndLastDayOfMonth } from './getTime'

export default (props: any) => {
    const { modalVisible, setModalVisible, callbackRef, renderData, url, setSubimtDatas } = props;
    const [infoId, setInfoId] = useState<any>({})
    const formRef2 = useRef<ProFormInstance>();
    useEffect(() => {
        getTarget()
    }, [renderData])
    const getTarget = async () => {
        const { type } = renderData
        const time = getFirstAndLastDayOfMonth()
        let data: any = {
            startTime: time.firstDay,
            endTime: time.lastDay,
            userId: renderData.userId
        }
        data.type = renderData.typeNumber
        const info = (await request.get('/sms/business/bizTarget', data)).data.content[0]
        if (!info) return
        formRef2?.current?.setFieldValue('count', info.count)
        setInfoId(info)
    }
    const submitok = (values: any) => {
        const time = getFirstAndLastDayOfMonth()
        let data: any = {
            startTime: time.firstDay,
            endTime: time.lastDay
        }
        data.type = renderData.typeNumber
        data.count = values.count
        if (infoId.id) {
            data.id = infoId.id
        }
        data.userId = renderData.userId
        return new Promise((resolve, reject) => {
            request.post('/sms/business/bizTarget', data).then((res) => {
                if (res.status == 'success') {
                    resolve(true);
                    message.success('提交成功');
                    setModalVisible();
                    // callbackRef();
                }
            })

        })

    };
    const getContent = (type: string) => {
        let dom;
        switch (type) {
            case 'performance':
                dom = <ProFormDigit
                    label='每月业绩目标'
                    name='count'
                />
                break
            case 'Phone':
                dom = <ProFormDigit
                    label='每日通话目标'
                    name='count'
                />
                break
            case 'clue':
                dom = <ProFormDigit
                    label='每月录入线索量目标'
                    name='count'
                />
                break
            case 'tigong':
                dom = <ProFormDigit
                    label='每月信息提供成交金额目标'
                    name='count'
                />
                break
        }

        return dom
    }
    return (
        <ModalForm<{
            name: string;
            company: string;
        }>
            title="设置目标"
            visible={modalVisible}
            formRef={formRef2}
            width={660}
            autoFocusFirstInput
            modalProps={{
                onCancel: () => setModalVisible(),
                destroyOnClose: true,
            }}
            onFinish={async (values: any) => {
                // if (renderData.types == 'edit') values.id = renderData.id;

                await submitok(values);
            }}
        >
            {getContent(renderData.type)}



        </ModalForm>
    );
};
