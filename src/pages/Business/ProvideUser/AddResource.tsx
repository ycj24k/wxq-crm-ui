import filter from "@/services/util/filter";
import ProForm, { ModalForm, ProFormCascader, ProFormDatePicker, ProFormInstance, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-form";
import { Button, message } from "antd";
import Dictionaries from '@/services/util/dictionaries';
import moment from 'moment';
import request from '@/services/ant-design-pro/apiRequest';
import { useEffect, useRef, useState } from "react";
import { useModel } from "umi";
import DepartmentCard from "@/pages/Admins/Department/DepartmentCard";
export default (props: any) => {
    const { initialState } = useModel('@@initialState');
    const provider = initialState?.currentUser?.userid
    // const departmentId = initialState?.currentUser?.departmentId
    const { modalVisible, setModalVisible, callbackRef, renderData, type } = props;
    const [company, setCompany] = useState('学员姓名');
    // const [department, setDepartment] = useState({});
    const [CardVisible, setCardVisible] = useState<boolean>(false);
    let [department, setDepartment] = useState<any>({ name: '' });
    const formRef = useRef<ProFormInstance>();
    const ment = () => {
        formRef?.current?.setFieldsValue({
            departmentId: department.name,
        });
    };
    const submitok = async (value: any) => {
        if (!department.id) {
            message.error('请重新选择一下部门')
            return
        }
        if (value.departmentId) value.departmentId = department.id;
        return new Promise((resolve) => {
            request.post2('/sms/business/bizStudent/addCirculationRepository', { departmentId: value.departmentId }, [value]).then((res) => {
                if (res.status == 'success') {
                    message.success('操作成功')
                    setModalVisible(false)
                    callbackRef()
                }
            })
            resolve(true)
        })
    }
    return (
        <ModalForm<{
            name: string;
            company: string;
            id: number;
        }>
            title={'新建'}
            formRef={formRef}
            autoFocusFirstInput
            modalProps={{
                destroyOnClose: true,
                maskClosable: false,
                onCancel: () => {
                    setModalVisible();
                },
            }}
            onFinish={async (values: any) => {
                if (!values.QQ && !values.weChat && !values.mobile) {
                    message.error('QQ、微信、电话，三种联系方式必须要添加一个', 5);
                    return;
                }
                if (values.project) values.project = values.project[values.project.length - 1];
                values.provider = provider
                values.consultationTime = values.consultationTime;
                console.log('values', values);

                await submitok(values);
                // message.success('提交成功');
            }}
            visible={modalVisible}
        >
            <ProForm.Group>
                <ProFormSelect
                    label="学员类型"
                    name="type"
                    width="xs"
                    request={async () => Dictionaries.getList('studentType') as any}
                    fieldProps={{
                        onChange: (e) => {
                            // onchange(e);
                            if (e == '1') {
                                setCompany('企业名称');
                            } else if (e == '2') {
                                setCompany('代理人姓名');
                            } else if (e == '3') {
                                setCompany('介绍人姓名');
                            } else {
                                setCompany('学员姓名');
                            }
                        },
                    }}
                    rules={[{ required: true, message: '请选择学员类型' }]}
                />
                <ProFormText
                    name="name"
                    width="md"
                    label={company}
                    placeholder="请输入姓名"
                    rules={[
                        {
                            required: true,
                            pattern: new RegExp(/^\S*$/),
                            message: '不能包含空格/请输入正确的用户名',
                        },
                    ]}
                />
                {company === '企业名称' ? (
                    <ProFormText
                        width="sm"
                        name="chargePersonName"
                        label="企业负责人"
                        placeholder="请输入企业负责人"
                        rules={[
                            {
                                required: true,
                                pattern: new RegExp(/^\S*$/),
                                message: '不能包含空格/请输入正确的名字',
                            },
                        ]}
                    />
                ) : null}
            </ProForm.Group>
            <ProForm.Group>
                {company === '企业名称' || type === '个人代理' ? (
                    ''
                ) : (
                    <ProFormSelect
                        label="学历"
                        hidden={company === '企业名称' || type === '个人代理'}
                        name="education"
                        width="xs"
                        rules={[{ required: true, message: '请选择学历' }]}
                        request={async () => Dictionaries.getList('dict_education') as any}
                    />
                )}

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
                    label={company === '企业名称' ? '企业负责人身份证号' : '身份证号'}
                    placeholder="请输入身份证"
                    rules={[
                        {
                            pattern: new RegExp(Dictionaries.getRegex('idCard')),
                            message: '请输入正确的身份证号',
                        },
                    ]}
                />
            </ProForm.Group>
            <ProForm.Group>
                <ProFormText width="xs" name="weChat" label="微信" placeholder="请输入微信" />
                <ProFormText width="xs" name="QQ" label="QQ" placeholder="请输入QQ" />
                <ProFormSelect
                    label="性别"
                    name="sex"
                    width="xs"
                    valueEnum={{
                        false: '男',
                        true: '女',
                    }}
                />
                <ProFormCascader
                    width="sm"
                    name="project"
                    placeholder="咨询报考岗位"
                    label="报考岗位"
                    rules={[{ required: true, message: '请选择报考岗位' }]}
                    fieldProps={{
                        options: Dictionaries.getCascader('dict_reg_job'),
                        showSearch: { filter },
                        // onChange: onChange,
                        onSearch: (value) => console.log(value),
                        // defaultValue: ['0', '00'],
                    }}
                />
                <ProFormSelect
                    label="客户来源"
                    name="source"
                    width={200}
                    rules={[{ required: true, message: '请选择客户来源' }]}
                    request={async () => Dictionaries.getList('dict_source') as any}
                />
                <ProFormDatePicker
                    name="consultationTime"
                    fieldProps={{
                        showTime: { format: 'HH:mm:ss' },
                        format: 'YYYY-MM-DD HH:mm:ss',
                    }}
                    width="sm"
                    label={`咨询日期`}
                    rules={[{ required: true, message: '请选择咨询日期' }]}
                />
            </ProForm.Group>
            <ProForm.Group>
                <ProFormText name="departmentId" label="部门" rules={[{ required: true }]} />
                <Button
                    style={{ marginTop: '30px', marginLeft: '-30px' }}
                    type="primary"
                    onClick={async () => {
                        // request.get('/sms/share/getDepartmentAndUser');
                        setCardVisible(true);
                    }}
                >
                    选择
                </Button>
            </ProForm.Group>
            <ProFormTextArea
                name="address"
                label="地址"
                placeholder="请输入描述..."
            // fieldProps={inputTextAreaProps}
            />
            <ProFormTextArea
                name="description"
                label="备注"
                placeholder="请输入描述..."
            // fieldProps={inputTextAreaProps}
            />
            {CardVisible && (
                <DepartmentCard
                    CardVisible={CardVisible}
                    setCardVisible={() => setCardVisible(false)}
                    setGrouptment={(e: any) => setDepartment(e)}
                    ment={() => ment()}
                />
            )}

        </ModalForm>
    );


}