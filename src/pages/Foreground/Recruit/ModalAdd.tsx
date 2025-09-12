import React, { useEffect, useRef, useState } from 'react';
import { Button, message, Descriptions } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ProFormDatePicker } from '@ant-design/pro-form';
import ProForm, {
    DrawerForm,
    ProFormText,
    ProFormTextArea,
    ProFormSelect,
} from '@ant-design/pro-form';
import Dictionaries from '@/services/util/dictionaries';
import request from '@/services/ant-design-pro/apiRequest';
import UserTreeSelect from '@/components/ProFormUser/UserTreeSelect';
import { useModel } from 'umi';
import moment from 'moment';
export default (props: any) => {
    const { initialState } = useModel('@@initialState');
    const formRef = useRef<ProFormInstance>();
    const userRef: any = useRef(null);
    const userRefInterviewer: any = useRef(null);
    const [userNameId, setUserNameId] = useState<any>(false);
    const [DepartId, setDepartId] = useState<any>();
    const [Interviewer, setInterviewer] = useState<any>(false);
    const { modalVisible, setModalVisible, callbackRef, renderData } = props;
    useEffect(() => {
        if ((renderData.type == 'eidt')) {
            setTimeout(async () => {
                if (renderData.sex) {
                    renderData.sex = '1';
                } else {
                    renderData.sex = '0';
                }
                Object.keys(renderData).forEach((keys) => {
                    if (typeof renderData[keys] == 'number') {
                        renderData[keys] = renderData[keys] + ''
                    }
                })
                let data = {}

                if (renderData.presenter) {
                    data = {
                        name: Dictionaries.getDepartmentUserName(Number(renderData.presenter)),
                        id: renderData.presenter,

                    }
                    userRef?.current?.setDepartment(data);
                    setUserNameId(data)
                }
                if (renderData.interviewer) {
                    data = {
                        name: Dictionaries.getDepartmentUserName(Number(renderData.interviewer)),
                        id: renderData.interviewer,
                        departmentId: Dictionaries.getDepartmentName(Number(renderData.departmentId))[0]
                    }
                    userRefInterviewer?.current?.setDepartment(data);

                    setDepartId(renderData.departmentId);
                    setInterviewer(data)

                }
                formRef?.current?.setFieldsValue({
                    ...renderData,
                    // departmentId: department?.name,
                });
                ++renderData.numberEidt;
                // setEidtNumber(1);
            }, 100);
        } else {
            setTimeout(() => {
                let data = {}
                data = {
                    name: initialState?.currentUser?.name,
                    id: initialState?.currentUser?.userid,
                }
                formRef?.current?.setFieldsValue({
                    status: '0',
                    time: moment().format()
                });
                userRef?.current?.setDepartment(data);
                setUserNameId(data)

            }, 100)

        }
    }, [])

    const submitok = (value: any) => {
        // if (value.departmentId) value.departmentId = department.id;
        if (value.departmentId) delete value.departmentId;
        if (!value.groupId) delete value.groupId;
        //presenter
        if (userNameId) value.presenter = userNameId.id
        if (Interviewer) value.interviewer = Interviewer.id
        if (DepartId) value.departmentId = DepartId;
        return new Promise((resolve) => {
            request
                .post('/sms/system/sysInterview', value)
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
        <DrawerForm<{
            name: string;
            company: string;
            id: number;
        }>
            // title="用户信息"
            formRef={formRef}
            width={1200}
            autoFocusFirstInput
            drawerProps={{
                destroyOnClose: true,
                onClose: () => {
                    setModalVisible();
                    // setDepartment('');
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
                <ProForm.Group>
                    <ProFormText
                        name="name"
                        width="md"
                        label="姓名"
                        placeholder="请输入姓名"
                        rules={[
                            {
                                required: true,
                                pattern: new RegExp(/^\S*$/),
                                message: '不能包含空格/请输入正确的用户名',
                            },
                        ]}
                    />
                    <ProFormText
                        name="age"
                        width="xs"
                        label="年龄"
                        placeholder="请输入年龄"
                    />
                    <ProFormSelect
                        label="性别"
                        name="sex"
                        width="xs"
                        valueEnum={{
                            '0': '男',
                            '1': '女',
                        }}
                    />
                    <ProFormText
                        width="md"
                        name="mobile"
                        label="联系电话"
                        placeholder="请输入联系电话"
                        rules={[
                            {
                                required: true,
                                pattern: new RegExp(Dictionaries.getRegex('mobile')),
                                message: '请输入正确的手机号',
                            },
                        ]}
                    />
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormText
                        label='专业'
                        name='profession'
                        width='sm'
                    />
                    <ProFormSelect
                        label="学历"
                        name="degree"
                        width="xs"
                        rules={[{ required: true, message: '请选择学历' }]}
                        request={async () => Dictionaries.getList('dict_education') as any}
                    />
                    <ProFormSelect
                        label="招聘渠道"
                        name="source"
                        width="xs"
                        rules={[{ required: true, message: '请选择招聘渠道' }]}
                        request={async () => Dictionaries.getList('Recruitment_channels') as any}
                    />
                    <UserTreeSelect
                        ref={userRef}
                        userLabel={'招聘人/内推人'}
                        userNames="userId"
                        userPlaceholder="请输入招聘人/内推人"
                        setUserNameId={(e: any) => setUserNameId(e)}
                        // setDepartId={(e: any) => setDepartId(e)}
                        flag={true}
                    // setFalgUser={(e: any) => setFalgUser(e)}
                    />
                </ProForm.Group>
                <ProForm.Group>
                    {/* <ProFormText label='应聘岗位' name='post' rules={[{ required: true }]} /> */}
                    <ProFormSelect
                        label="应聘岗位"
                        name="post"
                        width="sm"
                        rules={[{ required: true, message: '请选择应聘岗位' }]}
                        request={async () => Dictionaries.getList('Recruitment_Positions') as any}
                    />
                    <UserTreeSelect
                        ref={userRefInterviewer}
                        userLabel={'面试官'}
                        userNames="interviewer"
                        userPlaceholder="请输入面试官"
                        setUserNameId={(e: any) => setInterviewer(e)}
                        setDepartId={(e: any) => setDepartId(e)}
                        recruit={false}
                    // flag={true}
                    // setFalgUser={(e: any) => setFalgUser(e)}
                    />
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormText label='期薪工资' name='expectedSalary' />
                    <ProFormText label='录用薪酬体系' name='salary' />
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormDatePicker
                        name="time"
                        fieldProps={{
                            showTime: { format: 'HH:mm:ss' },
                            format: 'YYYY-MM-DD HH:MM:SS',
                        }}
                        width="sm"
                        label={`面试时间`}
                        rules={[{ required: true, message: '请选择面试时间' }]}
                    />
                    <ProFormDatePicker
                        name="entryTime"
                        fieldProps={{
                            format: 'YYYY-MM-DD HH:MM:SS',
                        }}
                        width="sm"
                        label={`通知入职时间`}
                    />
                    <ProFormSelect
                        label="招聘状态"
                        name="status"
                        width="xs"
                        rules={[{ required: true, message: '请选择招聘状态' }]}
                        request={async () => Dictionaries.getList('recruit_status') as any}
                    />
                </ProForm.Group>
                <ProForm.Group />
                <ProFormTextArea
                    name="suggestion"
                    label="面试关键印象及意见"
                    placeholder="请输入面试关键印象及意见..."
                />
                <ProFormTextArea
                    name="description"
                    label="最终结果"
                    placeholder="请输入描述..."
                />
                <ProFormTextArea
                    name="certInfo"
                    label="所获证书情况"
                />

            </div>

            {/* {CardVisible && (
                <DepartmentCard
                    CardVisible={CardVisible}
                    setCardVisible={() => setCardVisible(false)}
                    setGrouptment={(e: any) => setDepartment(e)}
                    ment={() => ment()}
                />
            )} */}
        </DrawerForm>
    );
};
