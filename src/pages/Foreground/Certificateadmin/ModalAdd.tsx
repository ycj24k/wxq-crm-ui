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
import UserTreeSelect from '@/components/ProFormUser/UserTreeSelect';
export default (props: any) => {
    const formRef = useRef<ProFormInstance>();
    const { modalVisible, setModalVisible, callbackRef, renderData } = props;
    const [userNameId, setUserNameId] = useState<any>();
    const [DepartId, setDepartId] = useState<any>();
    const [falgUser, setFalgUser] = useState<boolean>(false);
    const userRef: any = useRef(null);
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
                formRef?.current?.setFieldsValue({
                    ...renderData,
                    // departmentId: department?.name,
                });
                // setEidtNumber(1);
            }, 100);
        }
    }, [])

    const submitok = (value: any) => {
        if (falgUser) {
            message.error('请填写正确的姓名/部门');
        }
        if (renderData.type == 'add') {
            value.userName = userNameId.name;
            value.userId = userNameId.id;
            value.departmentId = DepartId
            // delete value.userName
        }
        delete value.createBy
        if (value.file) {
            let arr: any[] = [];
            value.file.forEach((item: any) => {
                arr.push(item.response.data);
            });
            value.file = arr.join(',');
        }
        const url = '/sms/business/bizCertificate'

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
            width={1200}
            autoFocusFirstInput
            modalProps={{
                destroyOnClose: true,
                maskClosable: false,
                onCancel: () => {
                    setModalVisible();
                },
            }}
            onFinish={async (values: any) => {
                if (renderData.id) values.id = renderData.id;
                if (renderData.applyId) values.applyId = renderData.applyId
                await submitok(values);
                // message.success('提交成功');
            }}
            visible={modalVisible}
        >
            {
                renderData.type == 'add' ? <ProForm.Group>
                    <UserTreeSelect
                        ref={userRef}
                        userLabel="招生老师"
                        userNames="userName"
                        userPlaceholder="请输入招生老师的名字"
                        setUserNameId={(e: any) => setUserNameId(e)}
                        setDepartId={(e: any) => setDepartId(e)}
                        setFalgUser={(e: any) => setFalgUser(e)}
                    />
                    <ProFormText
                        width="sm"
                        name="mobile"
                        label="联系电话"
                        placeholder="请输入联系电话"
                        rules={[
                            {
                                // required: true,
                                pattern: new RegExp(Dictionaries.getRegex('mobile')),
                                message: '请输入正确的手机号',
                            },
                        ]}
                    />
                    <ProFormText
                        width="md"
                        name="idCard"
                        label={'身份证号'}
                        placeholder="请输入身份证"
                        rules={[
                            {
                                pattern: new RegExp(Dictionaries.getRegex('idCard')),
                                message: '请输入正确的身份证号',
                            },
                        ]}
                    /></ProForm.Group> : <ProFormText readonly name='userName' label='持有人姓名' />
            }

            <ProFormSelect
                label="证书种类"
                name="kind"
                width="md"
                rules={[{ required: true, message: '请选择证书种类' }]}
                request={async () => Dictionaries.getList('certificateKind') as any}
            />
            <UploadDragger
                // width={650}
                label="上传证书"
                name="file"
                action={'/sms/business/bizCertificate/upload'}
                renderData={renderData}
                fileUrl={'/sms/business/bizCertificate/download'}
            />
            <ProForm.Group>
                <ProFormTextArea
                    name="remark"
                    label="证书备注"
                    placeholder="请输入证书备注..."
                    width={1000}
                // fieldProps={inputTextAreaProps}
                />
                <ProFormDatePicker
                    name="uploadTime"
                    fieldProps={{
                        showTime: { format: 'HH:mm:ss' },
                        format: 'YYYY-MM-DD HH:mm:ss',
                    }}
                    width="sm"
                    label={`上交时间`}
                    rules={[{ required: true, message: '请选择上交时间' }]}
                />
                <ProFormDatePicker
                    name="returnTime"
                    fieldProps={{
                        showTime: { format: 'HH:mm:ss' },
                        format: 'YYYY-MM-DD HH:mm:ss',
                    }}
                    width="sm"
                    label={`最近归还时间`}
                />
                <ProFormDatePicker
                    name="takeTime"
                    fieldProps={{
                        showTime: { format: 'HH:mm:ss' },
                        format: 'YYYY-MM-DD HH:mm:ss',
                    }}
                    width="sm"
                    label={`最近外带时间`}
                />
            </ProForm.Group>

        </ModalForm>
    );
};
