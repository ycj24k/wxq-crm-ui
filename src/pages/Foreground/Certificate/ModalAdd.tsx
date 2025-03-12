import React, { useEffect, useRef, useState } from 'react';
import { Button, message, Descriptions } from 'antd';
import { ProFormDatePicker, ProFormInstance } from '@ant-design/pro-form';
import ProForm, {
    ModalForm,
    ProFormText,
    ProFormTextArea,
    ProFormSelect,
} from '@ant-design/pro-form';
import request from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import UploadDragger from '@/components/UploadDragger/UploadDragger';
import { useModel } from 'umi';
export default (props: any) => {
    const { initialState } = useModel('@@initialState');
    const formRef = useRef<ProFormInstance>();
    const { modalVisible, setModalVisible, callbackRef, renderData } = props;
    const [userNames, setUserName] = useState({ id: initialState?.currentUser?.userid, userName: initialState?.currentUser?.name })
    useEffect(() => {
        if ((renderData.type == 'eidt')) {
            setTimeout(async () => {
                Object.keys(renderData).forEach((keys) => {
                    if (typeof renderData[keys] == 'number') {
                        renderData[keys] = renderData[keys] + ''
                    }
                })
                if (renderData.file) {
                    let arr: { uid: number; name: any; response: { data: any } }[] = [];
                    renderData.file.split(',').forEach((item: any, index: number) => {
                        arr.push({
                            uid: index + 1,
                            name: item,
                            response: { data: item },
                        });
                    });
                    renderData.file = arr;
                }
                setUserName({ id: renderData.createBy, userName: renderData.userName })
                formRef?.current?.setFieldsValue({
                    ...renderData,
                    createBy: renderData.userName
                    // departmentId: department?.name,
                });
                // setEidtNumber(1);
            }, 100);
        } else {
            formRef?.current?.setFieldsValue({
                createBy: userNames.userName
            });
        }
    }, [])

    const submitok = (value: any) => {
        delete value.createBy
        if (value.file) {
            let arr: any[] = [];
            value.file.forEach((item: any) => {
                arr.push(item.response.data);
            });
            value.file = arr.join(',');
        }
        const url = renderData.type == 'eidt' ? '/sms/business/bizCertificateApply' : '/sms/business/bizCertificateApply/submit'
        return new Promise((resolve) => {
            request
                .post(url, value)
                .then((res: any) => {
                    if (res.status == 'success') {
                        message.success('操作成功');
                        setModalVisible();
                        // setDepartment('');

                        callbackRef();
                        resolve(true);
                    }
                })
                .catch((err: any) => {
                    resolve(true);
                });
        });
    };
    return (
        <ModalForm<{
            name: string;
            company: string;
            id: number;
        }>
            title="证书申请"
            formRef={formRef}
            width={600}
            autoFocusFirstInput
            modalProps={{
                destroyOnClose: true,
                maskClosable: false,
                onCancel: () => {
                    setModalVisible();
                },
            }}
            onFinish={async (values) => {
                if (renderData.id) values.id = renderData.id;
                await submitok(values);
                // message.success('提交成功');
            }}
            visible={modalVisible}
        >
            <div>
                <ProFormText readonly name='createBy' label='申请人' />
                <ProFormSelect
                    label="证书种类"
                    name="kind"
                    width="md"
                    rules={[{ required: true, message: '请选择证书种类' }]}
                    request={async () => Dictionaries.getList('certificateKind') as any}
                />
                <ProFormTextArea
                    name="remark"
                    label="申请备注"
                    placeholder="请输入申请备注..."
                    width={580}
                    rules={[{ required: true, message: '请输入申请备注...' }]}
                // fieldProps={inputTextAreaProps}
                />
                <ProFormSelect
                    label="费用类型"
                    name="chargeType"
                    width="md"
                    rules={[{ required: true, message: '请选择费用类型' }]}
                    request={async () => Dictionaries.getList('ExpenseType') as any}
                />
                <ProFormDatePicker
                    name="startTime"
                    fieldProps={{
                        showTime: { format: 'HH:mm:ss' },
                        format: 'YYYY-MM-DD HH:mm:ss',
                    }}
                    width="sm"
                    label={`培训开始时间`}
                />
                <ProFormDatePicker
                    name="endTime"
                    fieldProps={{
                        showTime: { format: 'HH:mm:ss' },
                        format: 'YYYY-MM-DD HH:mm:ss',
                    }}
                    width="sm"
                    label={`培训结束时间`}
                />
            </div>

        </ModalForm>
    );
};
