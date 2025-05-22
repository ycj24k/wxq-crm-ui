import Tables from "@/components/Tables"
import apiRequest from "@/services/ant-design-pro/apiRequest"
import Dictionaries from "@/services/util/dictionaries"
import { ProColumns } from "@ant-design/pro-table"
import { useEffect, useState } from "react"


export default (props: any) => {
    const { tableData, select } = props;
    //缴费关联人员表格信息
    const [dataSourceAboutPeoplePay, setdataSourceAboutPeoplePay] = useState<Array<any>>();
    //关注表格是否有数据
    const [haveData, setHaveData] = useState<boolean>(false)

    useEffect(() => {
        getTableStudentData(tableData.phone)
    }, [tableData.phone])
    //获取表格数据
    const getTableStudentData = (data: string) => {
        apiRequest.get('/sms/business/bizStudentUser', { mobile: data }).then(res => {
            setdataSourceAboutPeoplePay(res.data.content)
            if(res.data.content.length === 0) {
                setHaveData(true)
            }
        })
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
    return <>
        <Tables
            search={false}
            dataSource={dataSourceAboutPeoplePay} columns={quickColumns}
            rowSelection={{
                onSelect: select
            }}
        />
    </>

}