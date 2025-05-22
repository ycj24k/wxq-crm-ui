import Tables from "@/components/Tables"
import apiRequest from "@/services/ant-design-pro/apiRequest"
import Dictionaries from "@/services/util/dictionaries"
import DownTable from "@/services/util/timeFn"
import { ExportOutlined, RedoOutlined } from "@ant-design/icons"
import { ProColumns } from "@ant-design/pro-table"
import { Button, Space, Tag, Modal, Row, Col } from "antd"
import { useState, useRef, forwardRef } from "react"
import { useModel } from 'umi';
import DownHeader from "./DownHeader"
import StudentMessage from "./studentMessage"
import UserTreeSelect from '@/components/ProFormUser/UserTreeSelect';
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
import CompanyOrder from "@/pages/Admins/AdminOrder/companyOrder"
const CompanyOrders = forwardRef(CompanyOrder);




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
    //存储数据
    const [renderData, setRenderData] = useState<Array<any>>()
    //存储表单数据
    const [tableData, setTableData] = useState<Array<any>>([])

    const userRef: any = useRef(null);
    const userRefs: any = useRef(null);
    const userRef2: any = useRef(null);
    const [userNameId, setUserNameId] = useState<any>();
    const [userNameIds, setUserNameIds] = useState<any>();
    const [userNameId2, setUserNameId2] = useState<any>();
    const formRef = useRef<ProFormInstance>();
    const childRef = useRef();

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

    //快捷下单弹窗
    const QuickOrder = (record: any) => {
        setStudentModal(true)
        setTableData(record)
        
    }
    //下单确认
    const handleSureOrder = () => {
        console.log(selectStudentData,'tableData====>')
        setIsPayModalOpen(true)
        setTimeout(() => {
            formRef.current?.setFieldsValue({
                name: selectStudentData.name,
                mobile: selectStudentData.mobile,
                idCard: selectStudentData.idCard,
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
            render: (text, record) => <Button type='primary' onClick={() => QuickOrder(record)}>快捷下单</Button>
        },
    ];
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
                tableData={tableData}
            />
        </Modal>

        {/* 下单弹窗 */}
        <Modal
            title="下单"
            width={1200}
            open={isPayModalOpen}
            onCancel={() => setIsPayModalOpen(false)}
            onOk={() => { }}
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
                        disabled
                    />

                    <ProFormText
                        name="className"
                        width={300}
                        label="班级"
                        placeholder="请选择班级"
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
                        disabled
                    />
                    <ProFormText
                        name="idCard"
                        width="sm"
                        label="身份证号"
                        placeholder="请输入身份证号码"
                        disabled
                    />
                    <ProFormSelect
                        label="客户来源"
                        name="source"
                        width="sm"
                        rules={[{ required: true, message: '请选择客户来源' }]}
                        request={async () => Dictionaries.getList('dict_source') as any}
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
                            onSearch: (value) => console.log(value),
                            // defaultValue: ['0', '00'],
                        }}
                    />
                    <UserTreeSelect
                        ref={userRef}
                        width={300}
                        userLabel={'招生老师'}
                        userNames="userId"
                        userPlaceholder="请输入招生老师"
                        setUserNameId={(e: any) => setUserNameId(e)}
                        // setDepartId={(e: any) => setDepartId(e)}
                        flag={true}
                    // setFalgUser={(e: any) => setFalgUser(e)}
                    />
                    <UserTreeSelect
                        ref={userRefs}
                        width={300}
                        userLabel={'信息提供人'}
                        userNames="provider"
                        userPlaceholder="请输入信息提供人"
                        setUserNameId={(e: any) => setUserNameIds(e)}
                        // setDepartId={(e: any) => setDepartId(e)}
                        flag={true}
                    // setFalgUser={(e: any) => setFalgUser(e)}
                    />
                    <UserTreeSelect
                        ref={userRef2}
                        width={300}
                        userLabel={'信息所有人'}
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
                        setUserNameId={(e: any) => setUserNameId2(e)}
                        // setDepartId={(e: any) => setDepartId(e)}
                        flag={true}
                    // setFalgUser={(e: any) => setFalgUser(e)}
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
            
            <ClassList renderData={selectStudentData} />
            <PayWay />
        </Modal>
    </>

}