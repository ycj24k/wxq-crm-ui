import Tables from "@/components/Tables"
import apiRequest from "@/services/ant-design-pro/apiRequest"
import dictionaries from "@/services/util/dictionaries"
import DownTable from "@/services/util/timeFn"
import { ExportOutlined, RedoOutlined } from "@ant-design/icons"
import Dictionaries from "@/services/util/dictionaries"
import { ProColumns } from "@ant-design/pro-table"
import { Button, Space, Tag, Modal } from "antd"
import { useState } from "react"
import DownHeader from "./DownHeader"
import {
    ProFormCheckbox,
    ProFormDatePicker,
    ProFormGroup,
    ProFormInstance,
    ProFormList,
} from '@ant-design/pro-form';
import ProForm, {
    ProFormText,
    ProFormTextArea,
    ProFormDigit,
    ProFormDateTimePicker,
    ProFormSelect,
} from '@ant-design/pro-form';


export default (props: any) => {
    //type 0:原页面 1:缴费
    const { reBuild, select, getAll = false, type = 0 } = props
    const [exportLoading, setExportLoading] = useState<boolean>();
    const [selectData, setSelectData] = useState<Array<any>>();
    //选择缴费弹窗
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    //下单弹窗
    const [isPayModalOpen, setIsPayModalOpen] = useState<boolean>(false)
    //缴费关联人员表格信息
    const [dataSourceAboutPeoplePay, setdataSourceAboutPeoplePay] = useState<Array<any>>();
    const param = getAll ? {} : { isUseUp: false }
    const exportNotUseUp = () => {
        setExportLoading(true)
        apiRequest.get('/sms/business/bizChargeLog', { isUseUp: false, _isGetAll: true }).then(res => {
            DownTable(res.data.content, DownHeader.transaction, '专属收款码未下单记录', 'chargeLog')
            setExportLoading(false)
        })
    }
    //获取表格数据
    const getTableStudentData = (data: string) => {
        apiRequest.get('/sms/business/bizStudentUser', { mobile: data }).then(res => {
            setdataSourceAboutPeoplePay(res.data.content)
        })
    }
    //快捷下单按钮事件
    const quickOrder = (record: any) => {
        setIsModalOpen(true)
        getTableStudentData(record.phone)
    }
    //关闭弹窗
    const handleClose = () => {
        setIsModalOpen(false)
    }
    //关闭下单弹窗
    const handleClosePay = () => {
        setIsPayModalOpen(false)
    }
    //绑定到缴费
    const bindPay = () => {
        setIsPayModalOpen(true)
    }
    //快捷下单columns
    const quickColumns: ProColumns<any>[] = [
        {
            title: '学员姓名',
            dataIndex: 'name'
        },
        {
            title: '学员手机号',
            dataIndex: 'mobile'
        },
        {
            title: '项目总称',
            dataIndex: 'parentProjects',
            key: 'parentProjects',
            sorter: true,
            valueType: 'select',
            fieldProps: {
                options: Dictionaries.getList('dict_reg_job'),
                mode: 'tags',
            },
            width: 180,
            render: (text, record) => (
                <span key="parentProjects">
                    {Dictionaries.getCascaderAllName('dict_reg_job', record.project)}
                </span>
            ),
        },
        {
            title: '咨询岗位',
            dataIndex: 'project-in',
            // search: false,
            sorter: true,
            key: 'project-in',
            valueType: 'select',
            fieldProps: {
                options: Dictionaries.getCascader('dict_reg_job'),
                mode: 'tags',
            },
            render: (text, record) => (
                <span>{Dictionaries.getCascaderName('dict_reg_job', record.project)}</span>
            ),
        },
        {
            title: '所属老师',
            dataIndex: 'userName'
        },
        {
            title: '信息提供人',
            dataIndex: 'providerName'
        },
        {
            title: '信息所有人',
            dataIndex: 'ownerName'
        }
    ]
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
            valueEnum: dictionaries.getSearch('dict_stu_refund_type')
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
            hideInTable: !(type == 0),
            render: (text, record) => <Button type='primary' onClick={() => { quickOrder(record) }}>快捷下单</Button>
        },
    ];
    return <><Tables
        columns={columns}
        request={{ url: '/sms/business/bizChargeLog' }}
        params={param}
        rowSelection={type == 1 && {
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
        {/* 选择缴费弹窗 */}
        <Modal
            title="选择缴费"
            width={1200}
            open={isModalOpen}
            onCancel={handleClose}
            footer={null}
        >
            <Tables
                dataSource={dataSourceAboutPeoplePay} columns={quickColumns}
                rowSelection={{
                    onSelect: (record) => {
                        console.log(record, 'e======>')
                    }
                }}
                tableAlertOptionRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => <Space>
                    <a onClick={onCleanSelected}>
                        取消选择
                    </a>
                    <a onClick={() => { bindPay() }}>
                        绑定到缴费
                    </a>
                </Space>}
                toolBarRender={[
                    <Button icon={<ExportOutlined />} onClick={exportNotUseUp} loading={exportLoading} >导出未下单记录</Button>,
                    <Button hidden={!reBuild} icon={<RedoOutlined />} onClick={reBuild} >重新生成二维码</Button>,
                ]}
            />
        </Modal>

        {/* 下单弹窗 */}
        <Modal
            title="下单"
            width={1200}
            open={isPayModalOpen}
            onCancel={handleClosePay}
            footer={null}
        >
            <ProForm>
                <ProForm.Group>
                    <ProFormText
                        name="studentName"
                        width="sm"
                        label="学员姓名"
                        placeholder="请输入姓名"
                        disabled
                    />

                    <ProFormText
                        name="className"
                        width="sm"
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
                        name="studentName"
                        width="sm"
                        label="学员姓名"
                        placeholder="请输入姓名"
                        disabled
                    />
                    <ProFormText
                        name="studentName"
                        width="sm"
                        label="学员姓名"
                        placeholder="请输入姓名"
                        disabled
                    />
                    <ProFormText
                        name="studentName"
                        width="sm"
                        label="学员姓名"
                        placeholder="请输入姓名"
                        disabled
                    />
                    <ProFormText
                        name="studentName"
                        width="sm"
                        label="学员姓名"
                        placeholder="请输入姓名"
                        disabled
                    />
                    <ProFormText
                        name="studentName"
                        width="sm"
                        label="学员姓名"
                        placeholder="请输入姓名"
                        disabled
                    />
                    <ProFormText
                        name="studentName"
                        width="sm"
                        label="学员姓名"
                        placeholder="请输入姓名"
                        disabled
                    />
                    <ProFormText
                        name="studentName"
                        width="sm"
                        label="学员姓名"
                        placeholder="请输入姓名"
                        disabled
                    />
                </ProForm.Group>
            </ProForm>
        </Modal>
    </>

}