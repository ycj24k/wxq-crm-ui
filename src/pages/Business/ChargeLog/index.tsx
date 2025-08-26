import Tables from "@/components/Tables"
import apiRequest from "@/services/ant-design-pro/apiRequest"
import Dictionaries from "@/services/util/dictionaries"
import DownTable from "@/services/util/timeFn"
import { ExportOutlined, RedoOutlined } from "@ant-design/icons"
import { ProColumns } from "@ant-design/pro-table"
import { Button, Space, Tag, Modal, Row, Col, message, Popconfirm } from "antd"
import { useState, useRef, useEffect } from "react"
import { useModel } from 'umi';
import DownHeader from "./DownHeader"
import StudentMessage from "./studentMessage"
import request from '@/services/ant-design-pro/apiRequest';
import UserTreeSelect from '@/components/ProFormUser/UserTreeSelect';
import UploadDragger from '@/components/UploadDragger/UploadDragger';
import SchoolList from '@/pages/Business/ClassList'
import AllStudent from './allStudentlist'
import './index.less'
import {
    ModalForm,
    ProFormCascader,
    ProFormInstance,
    ProFormUploadDragger
} from '@ant-design/pro-form';
import ProForm, {
    ProFormText,
    ProFormSelect,
} from '@ant-design/pro-form';
import ClassList from "./classList"
import PayWay from "./payWay"
import type { ActionType } from '@ant-design/pro-table';

export default (props: any) => {
    const { initialState } = useModel('@@initialState');
    const actionRef = useRef<ActionType>();
    const { reBuild, select, getAll = false, type = 0, showBtn, num, Orderpage } = props
    const [exportLoading, setExportLoading] = useState<boolean>();
    const [selectData, setSelectData] = useState<Array<any>>();
    const [studentlistmessage, setStudentlistmessage] = useState<any>();
    const [selectStudentData, setSelectStudentData] = useState<any>();
    //学生详情下单
    const [studentModal, setStudentModal] = useState<boolean>(false)
    //下单弹窗
    const [isPayModalOpen, setIsPayModalOpen] = useState<boolean>(false)
    //存储根据电话号码查询的数据
    const [phoneTableData, setPhoneTableData] = useState<Array<any>>([])
    //存储支付信息
    const [payMessage, setPayMessage] = useState<any>({})
    //选择新建学员或选择学员弹窗
    const [ChooseStudent, setChooseStudent] = useState<boolean>(false);
    //保存新建学员时数据
    const [studentInfo, setStudentInfo] = useState<any>([])
    //查询所有学员弹窗
    const [allStudent, setAllStudent] = useState<boolean>(false);
    //
    const [confirmLoading, setConfirmLoading] = useState(false);
    //选择班级
    const [ClassFalg, setClassFalg] = useState<boolean>(false);
    const [classRef, setClassRef] = useState<any>({});
    //申请退费
    const [refund, setRefund] = useState<boolean>(false);

    const userRef: any = useRef(null);
    const userRefs: any = useRef(null);
    const userRef2: any = useRef(null);
    const [userNameId, setUserNameId] = useState<any>();
    const [userNameIds, setUserNameIds] = useState<any>();
    const [userNameId2, setUserNameId2] = useState<any>();
    const [totalReceivable, setTotalReceivable] = useState<number>(0);

    let tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
    let tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
    let obj = {};
    obj[tokenName] = tokenValue;


    const formRef = useRef<ProFormInstance>();
    const classListRef = useRef<{ handleChangeData: (data: any) => any[] }>(null);
    const payWayRef = useRef<{
        getFormValues: () => Promise<any>;
        addPayWayItem?: () => void;
        removePayWayItem?: (index: number) => void;
        resetPayWay: () => void;
    }>(null);
    //选择班级信息
    useEffect(() => {
        formRef?.current?.setFieldsValue({
            classId: classRef.id,
            className: classRef.name,
        });
    }, [classRef])

    //confirm: true, isRefund:true
    //const param = getAll ? {} : { isUseUp: false }
    let param = null
    if (num == 'isTrue') {
        console.log('123')
        param = { isRefund: false, isUseup: false, enable: true }
    }
    if (!num) {
        console.log('456')
        param = getAll ? {} : { isUseUp: false, isRefund: false, enable: false }
    }
    if(Orderpage){
        console.log('789')
        param = getAll ? {} : { isUseUp: false, isRefund: false }
    }
    // if(getAll){
    //     param = {}
    // }else{
    //    param = { isUseUp: false }
    // }
    const exportNotUseUp = () => {
        setExportLoading(true)
        apiRequest.get('/sms/business/bizChargeLog', { isUseUp: false, _isGetAll: true }).then(res => {
            DownTable(res.data.content, DownHeader.transaction, '专属收款码未下单记录', 'chargeLog')
            setExportLoading(false)
        })
    }
    const filter = (inputValue: string, path: any[]) => {
        return path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
    };
    //新建学员
    const addStudent = () => {
        setTimeout(() => {
            let data = {}
            data = {
                name: initialState?.currentUser?.name,
                id: initialState?.currentUser?.userid,
            }
            userRef?.current?.setDepartment(data);
            userRefs?.current?.setDepartment(data);
            userRef2?.current?.setDepartment(data);
            setUserNameId(data)
            setUserNameIds(data)
            setUserNameId2(data)
            formRef.current?.setFieldsValue({
                name: payMessage.name,
                mobile: payMessage.phone,
            })
        }, 500)
        setIsPayModalOpen(true)
    }
    const chooseStudent = () => {
        setAllStudent(true)
    }
    //快捷下单弹窗
    const QuickOrder = (record: any) => {
        console.log(record, 'record------->')
        setPayMessage(record)
        apiRequest.get('/sms/business/bizStudentUser', { mobile: record.phone }).then(res => {
            if (res.data.content.length === 0) {
                setStudentInfo(record)
                setChooseStudent(true)
                //旧代码注释
                // setTimeout(() => {
                //     formRef.current?.setFieldsValue({
                //         name: record.name,
                //         mobile: record.phone,
                //         idCard: record.idCard
                //     })
                // }, 500)
                // setIsPayModalOpen(true)
            } else {
                setStudentModal(true)
                setPhoneTableData(res.data.content)
            }
        })
    }
    //下单取消
    const handleCancelIsPay = () => {
        // 重置支付方式组件
        // if (payWayRef.current) {
        //     payWayRef.current.resetPayWay();
        // }
        setIsPayModalOpen(false)
    }
    const handleChooseStudentMessageOrder = () => {
        handleSureOrder()
    }
    //下单确认
    const handleSureOrder = () => {
        setIsPayModalOpen(true)
        setTimeout(() => {
            formRef.current?.setFieldsValue({
                name: studentlistmessage.name,
                mobile: studentlistmessage.mobile,
                idCard: studentlistmessage.idCard,
                owner: studentlistmessage.owner,
                provider: studentlistmessage.provider,
                userId: studentlistmessage.userId,
                source: studentlistmessage.studentSource.toString(),
                project: Dictionaries.getCascaderValue('dict_reg_job', studentlistmessage.project)
            })

            let data = {}
            let datas = {
                id: studentlistmessage.userId,
                name: studentlistmessage.userName
            }

            let data2 = {}
            if (studentlistmessage.provider) {
                data = {
                    id: studentlistmessage.provider,
                    name: studentlistmessage.providerName
                }
            } else {
                data = {
                    name: initialState?.currentUser?.name,
                    id: initialState?.currentUser?.userid,
                }
            }

            if (studentlistmessage.owner) {
                data2 = {
                    id: studentlistmessage.owner,
                    name: studentlistmessage.ownerName ? studentlistmessage.ownerName : '无'
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
        setAllStudent(false)
        setStudentModal(false)
    }
    //申请退费
    const handleRefound = () => {
        setRefund(true)
    }
    const columns: ProColumns<any>[] = [
        {
            title: '收款编号',
            dataIndex: 'num'
        },
        {
            title: '学员姓名',
            dataIndex: 'name',
        },
        {
            title: '学员手机号',
            dataIndex: 'phone',
        },
        {
            title: '收付款方式',
            dataIndex: 'method',
            valueType: 'select',
            sorter: true,
            valueEnum: Dictionaries.getSearch('dict_stu_refund_type')
        },
        {
            title: '收费人',
            dataIndex: 'userName',
        },
        {
            title: '收款金额',
            dataIndex: 'amount'
        },
        {
            title: '已下单金额',
            dataIndex: 'usedAmount',
            sorter: true
        },
        {
            title: '是否已全部下单',
            dataIndex: 'isUseUp',
            valueType: 'switch',
            search: getAll,
            sorter: true,
            render: (text, record) => record.isUseUp ? <Tag color='green'>已下单</Tag> : <Tag color='red'>未下单</Tag>
        },
        {
            title: '收款时间',
            dataIndex: 'paymentTime',
            valueType: 'dateRange',
            sorter: true,
            render: (text, record) => record.paymentTime
        },
        {
            title: '操作',
            search: false,
            hideInTable: type !== 0,
            render: (text, record) => (
                <>
                    <Button type='primary' hidden={!showBtn} disabled={record.isUseUp == true} onClick={() => QuickOrder(record)}>快捷下单</Button>
                    <Popconfirm
                        style={{ marginBottom: 5 }}
                        key={record.id}
                        title="是否确认废除？"
                        onConfirm={() => {
                            request.post(`/sms/business/bizChargeLog/disable/${record.id}`).then((res: any) => {
                                if (res.status == 'success') {
                                    message.success('废除成功');
                                    actionRef?.current?.reload();
                                }
                            });
                        }}
                        okText="确认"
                        cancelText="取消"
                    >
                        <Button
                            type="primary"
                            size="small"
                            danger
                            hidden={showBtn}
                            disabled={record.enable == false || record.confirm === null && record.isRefund === true}
                        >
                            { record.enable == false ? '已废除' : '废除'}
                        </Button>

                    </Popconfirm>
                    {/* <Button type="primary" style={{ marginTop: '5px' }} hidden={record.isUseUp == true} danger onClick={() => handleRefound(record)}>申请退款</Button> */}
                </>

            )
        },
    ];
    //确认下单
    const handlePayOrder = async () => {
        setConfirmLoading(true)
        //const studentValues = await formRef.current?.validateFields();
        let studentValues: any;
        let studentMsg = {}
        try {
            studentValues = await formRef.current?.validateFields();
            const updateFieldWithUserId = (fieldValue: any, fieldName: keyof typeof studentValues) => {
                if (fieldValue) {
                    const ids = Dictionaries.getUserId(fieldValue.label);
                    studentValues[fieldName] = ids[0];
                }
            };
            if (phoneTableData.length === 0) {
                // 修改 project 数组，只保留第一项并转换为字符串
                if (Array.isArray(studentValues.project)) {
                    studentValues.project = String(studentValues.project[0]);
                }
                // 将 selectStudentData.type 添加到 studentValues 中
                if (studentlistmessage && studentlistmessage.type !== undefined) {
                    studentValues.type = studentlistmessage.type;
                }
                studentValues.type = 0
                updateFieldWithUserId(studentValues.userId, 'userId');
                updateFieldWithUserId(studentValues.owner, 'owner');
                updateFieldWithUserId(studentValues.provider, 'provider');
                studentMsg = studentValues
            } else {
                const studentValues = await formRef.current?.validateFields();
                // 修改 project 数组，只保留第一项并转换为字符串
                if (Array.isArray(studentValues.project)) {
                    studentValues.project = String(studentValues.project[0]);
                }
                // 将 selectStudentData.type 添加到 studentValues 中
                if (studentlistmessage && studentlistmessage.type !== undefined) {
                    studentValues.type = studentlistmessage.type;
                }
                studentMsg = studentValues
            }
        } catch (error) {
            setConfirmLoading(false)
            return
        }


        //const classListValues = await classListRef.current?.getFormValues();
        // 2. 验证班级列表表单
        let classListValues;
        try {
            classListValues = await classListRef.current?.getFormValues();
            console.log(classListValues.description, 'classListValues')
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
            // ClassList组件内的验证错误已经被处理并显示
            setConfirmLoading(false)
            return;
        }

        const processedUsers = Dictionaries.filterByValue(classListValues, classListValues.description)
        console.log(processedUsers, 'processedUsers')
        //const payWayValues = await payWayRef.current?.getFormValues();
        let payWayValues: any;
        try {
            payWayValues = await payWayRef.current?.getFormValues();
        } catch (error) {
            setConfirmLoading(false)
            return;
        }



        //根据processedUsers数组长度创建auditsParam数组
        let auditsParam: any = processedUsers.map((order: any, index: number) => ({
            "student": studentMsg,
            "order": order,
            "charge": payWayValues[index]
        }));
        console.log(auditsParam, 'auditsParam')
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

                    // 4. 重置所有相关状态变量
                    setPhoneTableData([]);
                    setPayMessage({});
                    setStudentlistmessage(undefined);
                    setSelectStudentData(undefined);
                    setTotalReceivable(0);
                    setClassRef({});

                    setIsPayModalOpen(false);
                    setChooseStudent(false);
                    setStudentModal(false);
                    //window.location.reload()
                } else {
                    message.error(res.msg)
                }
            }).catch((err) => {
                if (err.status == 'error') {
                    setConfirmLoading(false)
                }
            })
    }
    return <>
        <Tables
            columns={columns}
            actionRef={actionRef}
            request={{ url: '/sms/business/bizChargeLog' }}
            params={param}
            rowSelection={type !== 0 && {
                onChange(id, e) {
                    setSelectData(e)
                }
            }}
            tableAlertOptionRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => <Space>
                <a onClick={onCleanSelected}>
                    取消选择
                </a>
                <a onClick={() => select(selectData)}>
                    绑定到缴费
                </a>
            </Space>}
            toolBarRender={[
                <Button icon={<ExportOutlined />} onClick={exportNotUseUp} loading={exportLoading} >导出未下单记录</Button>,
                <Button hidden={!reBuild} icon={<RedoOutlined />} onClick={reBuild} >重新生成二维码</Button>,
            ]}
        />

        {/* 查询学员信息弹窗 */}
        <Modal
            width={1200}
            maskClosable={false}
            title="选择学员缴费"
            open={studentModal}
            onCancel={() => setStudentModal(false)}
            onOk={handleSureOrder}
        >
            <StudentMessage
                select={setStudentlistmessage}
                phoneTableData={phoneTableData}
            />
        </Modal>
        {/* 下单弹窗 */}
        <Modal
            title="下单"
            maskClosable={false}
            width={1200}
            open={isPayModalOpen}
            confirmLoading={confirmLoading}
            onCancel={() => handleCancelIsPay()}
            onOk={() => { handlePayOrder() }}
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
                        disabled={selectStudentData}
                    />

                    <ProFormText
                        name="className"
                        width={300}
                        label="班级"
                        placeholder="请选择班级"
                        fieldProps={{
                            onClick: () => { setClassFalg(true) }
                        }}
                    // disabled
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
                        disabled={selectStudentData}
                    />
                    <ProFormText
                        name="idCard"
                        width="sm"
                        label="身份证号"
                        placeholder="请输入身份证号码"
                        rules={[{ required: true, message: '请填写身份证号' }]}
                        disabled={selectStudentData}
                    />
                    <ProFormSelect
                        label="客户来源"
                        name="source"
                        width="sm"
                        disabled={selectStudentData}
                        rules={[{ required: true, message: '请选择客户来源' }]}
                        request={async () => Dictionaries.getList('dict_source') as any}
                    />
                    <ProFormCascader
                        width="sm"
                        name="project"
                        placeholder="咨询报考岗位"
                        label="报考岗位"
                        disabled={selectStudentData}
                        rules={[{ required: true, message: '请选择报考岗位' }]}
                        fieldProps={{
                            options: Dictionaries.getCascader('dict_reg_job'),
                            showSearch: { filter },
                            onSearch: (value) => console.log(value)
                        }}
                    />
                    <UserTreeSelect
                        ref={userRef}
                        width={300}
                        userLabel={'招生老师'}
                        userNames="userId"
                        userPlaceholder="请输入招生老师"
                        disabled={selectStudentData}
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
                        disabled={selectStudentData}
                        setUserNameId={(e: any) => setUserNameIds(e.value)}
                        flag={true}
                    />
                    <UserTreeSelect
                        ref={userRef2}
                        width={300}
                        userLabel={'信息所有人'}
                        disabled={selectStudentData}
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
            <ClassList
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

            <PayWay renderData={studentlistmessage} payMessage={payMessage} ref={payWayRef} />
        </Modal>
        {/* 班级选择 */}
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
        {/* 选择学员还是新增学员*/}
        <Modal
            open={ChooseStudent}
            onOk={() => setChooseStudent(false)}
            onCancel={() => setChooseStudent(false)}
            footer={null}
        >
            <div className="student-message">
                <div className="student-message-title">根据手机号未能匹配到学员</div>
                <div className="student-btn">
                    <Button type="primary" onClick={() => addStudent()}>新建学员</Button>
                    <Button type="primary" onClick={() => chooseStudent()} style={{ marginLeft: '20px' }}>选择学员</Button>
                </div>
            </div>

        </Modal>
        {/* 查询所有待支付学员以及潜在学员 */}
        <Modal
            open={allStudent}
            width={1200}
            title="选择学员"
            onOk={handleChooseStudentMessageOrder}
            onCancel={() => setAllStudent(false)}
        >
            <AllStudent
                StudentMessage={setStudentlistmessage}
            />
        </Modal>

        {/* 退费申请弹窗 */}
        <ModalForm
            title="退费申请"
            visible={refund}
            width={600}
            formRef={formRef}
            onFinish={async (values) => {
                if (values.filess) {
                    let arr: any[] = [];
                    values.filess.forEach((item: any) => {
                        arr.push(item.response.data);
                    });
                    delete values.filess;
                    values.files = arr.join(',');
                    console.log(values, 'values-----ModalForm,')
                }
            }}
            modalProps={{
                destroyOnClose: true,
                onCancel: () => {
                    setRefund(false);
                },
            }}
        >
            <a
                download="汇德退费申请书模板（两个--企业和个人）"
                href="./template/汇德退费申请书模板（两个--企业和个人）.doc"
            >
                下载退费申请书模板(两个--企业和个人)
            </a>,
            <ProFormUploadDragger
                width="xl"
                label="上传附件"
                name="filess"
                action="/sms/business/bizNotice/upload"
                fieldProps={{
                    multiple: true,
                    headers: {
                        ...obj,
                    },
                    listType: 'picture',
                    onRemove: (e: any) => { },
                    beforeUpload: (file: any) => {
                        console.log('file', file);
                    },
                    onPreview: async (file: any) => {
                        console.log('file', file);

                        if (!file.url && !file.preview) {
                            console.log('1');

                            //   file.preview = await getBase64(file.originFileObj);
                        }
                        // setPreviewImage(file.url || file.preview);
                        // setPreviewVisible(true);
                    },
                    onChange: (info: any) => {
                        const { status } = info.file;
                        if (status !== 'uploading') {
                        }
                        if (status === 'done') {
                            message.success(`${info.file.name} 上传成功.`);
                        } else if (status === 'error') {
                            message.error(`${info.file.name} 上传失败.`);
                        }
                    },
                }}
            />
        </ModalForm>


        {/* <Modal
            open={refund}
            width={1200}
            title="申请退费"
            onOk={handleChooseStudentMessageOrder}
            onCancel={() => setRefund(false)}
        >
            <a download="下载退费申请书模板" href="./template/新学员导入模板.xlsx" key="ordera">
                下载退费申请书模板
            </a>
            <UploadDragger
                width={1100}
                label="上传附件"
                name="files"
                action="/sms/business/bizCharge/upload"
                fileUrl={'/sms/business/bizCharge/download'}
            />
        </Modal> */}
    </>
}