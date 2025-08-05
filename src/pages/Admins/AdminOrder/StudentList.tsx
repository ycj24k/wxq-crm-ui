import { Modal, Tabs, message, Row, Col } from 'antd'
import { useState, useRef, useEffect } from 'react'
import { useModel } from 'umi';
import AllStudent from '@/pages/Business/ChargeLog/allStudentlist'
import FormalStudent from './formalStudent'
import Dictionaries from "@/services/util/dictionaries"
import ClassType from './ClassType';
import Paylist from './Paylist'
import request from '@/services/ant-design-pro/apiRequest';
import {
    ProFormCascader,
    ProFormInstance
} from '@ant-design/pro-form';
import ProForm, {
    ProFormText,
    ProFormSelect,
} from '@ant-design/pro-form';
import UserTreeSelect from '@/components/ProFormUser/UserTreeSelect';
import SchoolList from '@/pages/Business/ClassList'

const { TabPane } = Tabs;
export default (props: any) => {
    const { initialState } = useModel('@@initialState');
    const { modalVisible, setModalVisible, callbackRef } = props;
    const [tabsKey, setTabsKey] = useState<string>('1');
    // 添加状态来存储选中的学生信息
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [selectedFormalStudent, setSelectedFormalStudent] = useState<any>(null);
    const [studentlistmessage, setStudentlistmessage] = useState<any>();
    // 下单弹窗
    const [orderModalVisible, setOrderModalVisible] = useState<boolean>(false);
    // 下单确认按钮加载
    const [confirmLoading, setConfirmLoading] = useState(false);
    //选择班级
    const [ClassFalg, setClassFalg] = useState<boolean>(false);
    const [classRef, setClassRef] = useState<any>({});
    //定义的ref
    const formRef = useRef<ProFormInstance>();
    const classListRef = useRef<{ handleChangeData: (data: any) => any[] }>(null);
    const payWayRef = useRef<{
        getFormValues: () => Promise<any>;
        addPayWayItem?: () => void;
        removePayWayItem?: (index: number) => void;
        resetPayWay: () => void;
    }>(null);

    useEffect(() => {
        formRef?.current?.setFieldsValue({
            classId: classRef.id,
            className: classRef.name,
        });
    }, [classRef])

    //用户选择
    const userRef: any = useRef(null);
    const userRefs: any = useRef(null);
    const userRef2: any = useRef(null);
    const [userNameId, setUserNameId] = useState<any>();
    const [userNameIds, setUserNameIds] = useState<any>();
    const [userNameId2, setUserNameId2] = useState<any>();
    const [totalReceivable, setTotalReceivable] = useState<number>(0);

    // 处理潜在学员选择
    const handleStudentSelect = (record: any) => {
        setSelectedStudent(record);
        setStudentlistmessage(record)
    };

    // 处理正式学员选择
    const handleFormalStudentSelect = (record: any) => {
        setSelectedFormalStudent(record);
        setStudentlistmessage(record)
    };


    // 处理确认按钮点击
    const handleOk = () => {
        // 根据当前激活的标签页，获取选中的学生信息
        const student = tabsKey === '1' ? selectedStudent : selectedFormalStudent;

        if (!student) {
            message.error('请先选择一名学员');
            return;
        }

        // 这里可以调用父组件传递的回调函数，将选中的学生信息传递给父组件
        // if (callbackRef) {
        //     callbackRef(student);
        // }

        setTimeout(() => {
            formRef.current?.setFieldsValue({
                name: student.name,
                mobile: student.mobile,
                idCard: student.idCard,
                owner: student.owner,
                provider: student.provider,
                userId: student.userId,
                source: student.studentSource.toString(),
                project: Dictionaries.getCascaderValue('dict_reg_job', student.project)
            })

            let data = {}
            let datas = {
                id: student.userId,
                name: student.userName
            }

            let data2 = {}
            if (student.provider) {
                data = {
                    id: student.provider,
                    name: student.providerName
                }
            } else {
                data = {
                    name: initialState?.currentUser?.name,
                    id: initialState?.currentUser?.userid,
                }
            }

            if (student.owner) {
                data2 = {
                    id: student.owner,
                    name: student.ownerName ? student.ownerName : '无'
                }
            } else {
                data2 = {
                    name: initialState?.currentUser?.name,
                    id: initialState?.currentUser?.userid,
                }
            }

            userRef?.current?.setDepartment(datas);
            userRefs?.current?.setDepartment(data);
            userRef2?.current?.setDepartment(data2);
            setUserNameId(datas)
            setUserNameIds(data)
            setUserNameId2(data2)
        }, 100)

        // 只设置下单弹窗为可见，useEffect会监听到这个变化并关闭选择学员弹窗
        setOrderModalVisible(true);
    };
    //下单
    const handleOrder = async () => {
        setConfirmLoading(true)
        // 1. 验证学员信息表单
        let studentValues: any;
        let studentMsg = {}
        try {
            studentValues = await formRef.current?.validateFields();
            studentValues.project = String(studentValues.project[0]);
            studentValues.type = 0
            studentMsg = studentValues
        } catch (error) {
            setConfirmLoading(false)
            return
        }

        // 2. 验证班级信息表单
        let classListValues;
        try {
            classListValues = await classListRef.current?.getFormValues();
            if (!classListValues || !classListValues.users || classListValues.users.length === 0) {
                message.error('请至少添加一个班级信息');
                setConfirmLoading(false)
                return;
            }
            // 验证每个班级信息是否完整
            for (let i = 0; i < classListValues.users.length; i++) {
                const user = classListValues.users[i];
                if (!user.project || user.project.length === 0) {
                    message.error(`第${i + 1}个班级的报考岗位不能为空`);
                    setConfirmLoading(false)
                    return;
                }
                if (!user.JobClassExam) {
                    message.error(`第${i + 1}个班级的班型选择不能为空`);
                    setConfirmLoading(false)
                    return;
                }
                if (!user.source) {
                    message.error(`第${i + 1}个班级的订单来源不能为空`);
                    setConfirmLoading(false)
                    return;
                }
                // 其他必填字段的验证...
            }
        } catch (error) {
            setConfirmLoading(false)
            return
        }
        const processedUsers = Dictionaries.filterByValue(classListValues)

        // 3. 验证支付方式表单
        let payWayValues: any;
        //let payMsg = {}
        let newPay
        try {
            payWayValues = await payWayRef.current?.getFormValues();
            newPay = payWayValues.map((item: any) => {
                const userIdValue = item.userId && typeof item.userId === 'object' ? Dictionaries.getUserId(item.userId.label) : item.userId;
                return {
                    ...item,
                    userId: userIdValue[0]
                }
            })
        } catch (error) {
            setConfirmLoading(false)
            return;
        }

        //根据processedUsers数组长度创建auditsParam数组
        let auditsParam: any = processedUsers.map((order: any, index: number) => ({
            "student": studentMsg,
            "order": order,
            "charge": newPay[index]
        }));
        request
            .postAll('/sms/business/bizOrder/intelligence', auditsParam)
            .then((res: any) => {
                if (res.status == 'success') {
                    message.success('操作成功');
                    setConfirmLoading(false)
                    // 重置所有表单数据
                    // 1. 重置学生表单
                    formRef.current?.resetFields();
                    userRef?.current?.setDepartment({});
                    userRefs?.current?.setDepartment({});
                    userRef2?.current?.setDepartment({});

                    // 2. 重置班级列表表单
                    if (classListRef.current) {
                        classListRef.current.resetForm();
                    }

                    // 3. 重置支付方式组件
                    if (payWayRef.current) {
                        payWayRef.current.resetPayWay();
                    }

                    //window.location.reload()
                } else {
                    message.error(res.msg)
                }
            }).catch((err: any) => {
                if (err.status == 'error') {
                    setConfirmLoading(false)
                }
            })
        if (callbackRef) {
            callbackRef();
        }
        setOrderModalVisible(false);
    }

    return (
        <div>
            <Modal
                title="选择学员"
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                width={1400}
                destroyOnClose
                onOk={handleOk}
            >
                <Tabs
                    defaultActiveKey={tabsKey}
                    style={{ marginBottom: 32 }}
                    onChange={(e) => {
                        setTabsKey(e)
                    }}
                >
                    <TabPane tab="潜在学员" key="1">
                        <AllStudent 
                            StudentMessage={handleStudentSelect} 
                            setOrderModalVisible={setOrderModalVisible}
                        />
                    </TabPane>
                    <TabPane tab="正式学员" key="2">
                        <FormalStudent
                            StudentMessage={handleFormalStudentSelect}
                            setOrderModalVisible={setOrderModalVisible}
                        />
                    </TabPane>
                </Tabs>
            </Modal>

            <Modal
                title="下单"
                open={orderModalVisible}
                confirmLoading={confirmLoading}
                onCancel={() => setOrderModalVisible(false)}
                width={1200}
                destroyOnClose
                onOk={() => {
                    handleOrder()
                }}
            >
                <ProForm
                    formRef={formRef}
                    submitter={false}
                >
                    <ProForm.Group>
                        <ProFormText
                            name="name"
                            width={300}
                            label="学员姓名"
                            placeholder="请输入姓名"
                        />

                        <ProFormText
                            name="className"
                            width={300}
                            label="班级"
                            placeholder="请选择班级"
                            fieldProps={{
                                onClick: () => { setClassFalg(true) }
                            }}
                        />
                        <ProFormText hidden={true} name="classId" />
                        <ProFormText name="quantity" label="当前订单报名人数" required readonly width="sm" />
                        <ProFormText
                            name="totalReceivable"
                            label="当前订单应收总额"
                            required
                            readonly
                            width="sm"
                        />
                        <ProFormText
                            name="mobile"
                            width="sm"
                            label="手机号码"
                            placeholder="请输入手机号码"
                        // disabled={selectStudentData}
                        />
                        <ProFormText
                            name="idCard"
                            width="sm"
                            label="身份证号"
                            placeholder="请输入身份证号码"
                            rules={[{ required: true, message: '请填写身份证号' }]}
                        //disabled={selectStudentData}
                        />
                        <ProFormSelect
                            label="客户来源"
                            name="source"
                            width="sm"
                            //disabled={selectStudentData}
                            rules={[{ required: true, message: '请选择客户来源' }]}
                            request={async () => Dictionaries.getList('dict_source') as any}
                        />
                        <ProFormCascader
                            width="sm"
                            name="project"
                            placeholder="咨询报考岗位"
                            label="报考岗位"
                            //disabled={selectStudentData}
                            rules={[{ required: true, message: '请选择报考岗位' }]}
                            fieldProps={{
                                options: Dictionaries.getCascader('dict_reg_job'),
                                //showSearch: { filter },
                                onSearch: (value) => console.log(value)
                            }}
                        />
                        <UserTreeSelect
                            ref={userRef}
                            width={300}
                            userLabel={'招生老师'}
                            userNames="userId"
                            userPlaceholder="请输入招生老师"
                            //disabled={selectStudentData}
                            setUserNameId={(e: any) => setUserNameId(e.value)}
                            //setDepartId={(e: any) => setDepartId(e)}
                            flag={true}
                        />
                        <UserTreeSelect
                            ref={userRefs}
                            width={300}
                            userLabel={'信息提供人'}
                            userNames="provider"
                            userPlaceholder="请输入信息提供人"
                            //disabled={selectStudentData}
                            setUserNameId={(e: any) => setUserNameIds(e.value)}
                            flag={true}
                        />
                        <UserTreeSelect
                            ref={userRef2}
                            width={300}
                            userLabel={'信息所有人'}
                            //disabled={selectStudentData}
                            filter={(e: Array<any>) => {
                                e.unshift({
                                    title: '无',
                                    userId: -1,
                                    value: '-1'
                                })
                                return e;
                            }}
                            userNames="owner"
                            newMedia={false}
                            userPlaceholder="请输入信息所有人"
                            setUserNameId={(e: any) => setUserNameId2(e.value)}
                            flag={true}
                        />
                    </ProForm.Group>
                </ProForm>
                <Row
                    style={{
                        width: '1100px',
                        backgroundColor: '#d9edf7',
                        border: '1px solid #bce8f1',
                        padding: '20px',
                        marginBottom: '20px',
                    }}
                >
                    <Col span={2} style={{ color: 'red' }}>
                        注意：
                    </Col>
                    <Col span={22}>
                        （1）如果你的收费金额大于了收费标准，请在订单优惠金额里填写多收金额的负数。
                    </Col>
                </Row>
                <ClassType
                    ref={classListRef}
                    renderData={studentlistmessage}
                    onTotalPriceChange={(price: number) => {
                        setTotalReceivable(price);
                        formRef.current?.setFieldsValue({
                            totalReceivable: price
                        });
                    }}
                    onTotalQuantityChange={(quantity: number) => {
                        formRef.current?.setFieldsValue({
                            quantity: quantity
                        });
                    }}
                    onAddClassType={() => {
                        // 调用 payWay 组件的添加方法
                        payWayRef.current?.addPayWayItem?.();
                    }}
                    onRemoveClassType={(index: number) => {
                        // 调用 payWay 组件的删除方法
                        if (payWayRef.current) {
                            const payWayComponent = payWayRef.current as any;
                            if (payWayComponent.removePayWayItem) {
                                payWayComponent.removePayWayItem(index);
                            }
                        }
                    }}
                />

                <Paylist
                    renderData={studentlistmessage}
                    //payMessage={payMessage} 
                    ref={payWayRef} />
            </Modal>

            <Modal
                open={ClassFalg}
                width={1200}
                onOk={() => setClassFalg(false)}
                onCancel={() => setClassFalg(false)}
                footer={null}
            >
                <SchoolList setClassRef={setClassRef}
                    setClassFalg={() => setClassFalg(false)} />
            </Modal>
        </div>
    );
};