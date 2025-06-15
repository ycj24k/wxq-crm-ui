import Tables from "@/components/Tables"
import apiRequest from "@/services/ant-design-pro/apiRequest"
import Dictionaries from "@/services/util/dictionaries"
import DownTable from "@/services/util/timeFn"
import { ExportOutlined, RedoOutlined } from "@ant-design/icons"
import { ProColumns } from "@ant-design/pro-table"
import { Button, Space, Tag, Modal, Row, Col, message } from "antd"
import { useState, useRef, useEffect } from "react"
import { useModel } from 'umi';
import DownHeader from "./DownHeader"
import StudentMessage from "./studentMessage"
import request from '@/services/ant-design-pro/apiRequest';
import UserTreeSelect from '@/components/ProFormUser/UserTreeSelect';
import SchoolList from '@/pages/Business/ClassList'
import './index.less'
import {
    ProFormCascader,
    ProFormInstance
} from '@ant-design/pro-form';
import ProForm, {
    ProFormText,
    ProFormSelect,
} from '@ant-design/pro-form';
import ClassList from "./classList"
import PayWay from "./payWay"

export default (props: any) => {
    const { initialState } = useModel('@@initialState');
    const { reBuild, select, getAll = false, type = 0 } = props
    const [exportLoading, setExportLoading] = useState<boolean>();
    const [selectData, setSelectData] = useState<Array<any>>();
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
    //选择班级
    const [ClassFalg, setClassFalg] = useState<boolean>(false);
    const [classRef, setClassRef] = useState<any>({});

    const userRef: any = useRef(null);
    const userRefs: any = useRef(null);
    const userRef2: any = useRef(null);
    const [userNameId, setUserNameId] = useState<any>();
    const [userNameIds, setUserNameIds] = useState<any>();
    const [userNameId2, setUserNameId2] = useState<any>();
    const [totalReceivable, setTotalReceivable] = useState<number>(0);



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
    const param = getAll ? {} : { isUseUp: false }

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
            formRef.current?.setFieldsValue({
                name: studentInfo.name,
                mobile: studentInfo.phone,
                idCard: studentInfo.idCard
            })
        }, 500)
        setIsPayModalOpen(true)
        setIsPayModalOpen(true)
    }
    const chooseStudent = () => {

    }
    //快捷下单弹窗
    const QuickOrder = (record: any) => {
        setPayMessage(record)
        apiRequest.get('/sms/business/bizStudentUser', { mobile: record.phone }).then(res => {
            if (res.data.content.length === 0) {
                // setStudentInfo(record)
                // setChooseStudent(true)
                setTimeout(() => {
                    formRef.current?.setFieldsValue({
                        name: record.name,
                        mobile: record.phone,
                        idCard: record.idCard
                    })
                }, 500)
                setIsPayModalOpen(true)
            } else {
                setStudentModal(true)
                setPhoneTableData(res.data.content)
            }
        })
    }
    //下单取消
    const handleCancelIsPay = () => {
        // 重置支付方式组件
        if (payWayRef.current) {
            payWayRef.current.resetPayWay();
        }
        setIsPayModalOpen(false)
    }
    //下单确认
    const handleSureOrder = () => {
        setIsPayModalOpen(true)
        setTimeout(() => {
            formRef.current?.setFieldsValue({
                name: selectStudentData.name,
                mobile: selectStudentData.mobile,
                idCard: selectStudentData.idCard,
                owner: selectStudentData.owner,
                provider: selectStudentData.provider,
                userId: selectStudentData.userId,
                source: selectStudentData.source.toString(),
                project: Dictionaries.getCascaderValue('dict_reg_job', selectStudentData.project)
            })

            let data = {}
            let datas = {
                id: selectStudentData.userId,
                name: selectStudentData.userName
            }

            let data2 = {}
            if (selectStudentData.provider) {
                data = {
                    id: selectStudentData.provider,
                    name: selectStudentData.providerName
                }
            } else {
                data = {
                    name: initialState?.currentUser?.name,
                    id: initialState?.currentUser?.userid,
                }
            }

            if (selectStudentData.owner) {
                data2 = {
                    id: selectStudentData.owner,
                    name: selectStudentData.ownerName ? selectStudentData.ownerName : '无'
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
        setStudentModal(false)
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
            render: (text, record) => <Button type='primary' disabled={record.isUseUp == true} onClick={() => QuickOrder(record)}>快捷下单</Button>
        },
    ];
    //确认下单
    const handlePayOrder = async () => {
        const studentValues = await formRef.current?.validateFields();
        const updateFieldWithUserId = (fieldValue: any, fieldName: keyof typeof studentValues) => {
            if (fieldValue) {
                const ids = Dictionaries.getUserId(fieldValue.label);
                studentValues[fieldName] = ids[0];
            }
        };
        let studentMsg = {}
        if (phoneTableData.length === 0) {
            // 修改 project 数组，只保留第一项并转换为字符串
            if (Array.isArray(studentValues.project)) {
                studentValues.project = String(studentValues.project[0]);
            }
            // 将 selectStudentData.type 添加到 studentValues 中
            if (selectStudentData && selectStudentData.type !== undefined) {
                studentValues.type = selectStudentData.type;
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
            if (selectStudentData && selectStudentData.type !== undefined) {
                studentValues.type = selectStudentData.type;
            }
            studentMsg = studentValues
        }
        const classListValues = await classListRef.current?.getFormValues();
        const processedUsers = Dictionaries.filterByValue(classListValues)
        const payWayValues = await payWayRef.current?.getFormValues();
        //根据processedUsers数组长度创建auditsParam数组
        let auditsParam: any = processedUsers.map((order: any, index: number) => ({
            "student": studentMsg,
            "order": order,
            "charge": payWayValues[index]
        }));
        request
            .postAll('/sms/business/bizOrder/intelligence', auditsParam)
            .then((res: any) => {
                if (res.status == 'success') {
                    message.success('操作成功');
                    // 重置支付方式组件
                    if (payWayRef.current) {
                        payWayRef.current.resetPayWay();
                    }
                    setIsPayModalOpen(false);
                    setStudentModal(false);
                } else {
                    message.error(res.msg)
                }
            })
    }
    return <>
        <Tables
            columns={columns}
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
            title="选择学员缴费"
            open={studentModal}
            onCancel={() => setStudentModal(false)}
            onOk={handleSureOrder}
        >
            <StudentMessage
                select={setSelectStudentData}
                phoneTableData={phoneTableData}
            />
        </Modal>

        {/* 下单弹窗 */}
        <Modal
            title="下单"
            width={1200}
            open={isPayModalOpen}
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
                renderData={selectStudentData}
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

            <PayWay renderData={selectStudentData} payMessage={payMessage} ref={payWayRef} />
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
    </>
}