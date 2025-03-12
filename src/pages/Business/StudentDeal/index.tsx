import StudentInfo from "@/pages/Admins/StudentManage/studentInfo";
import Dictionaries from "@/services/util/dictionaries";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from "@ant-design/pro-table";
import { Button, Tag } from "antd";
import moment from 'moment';
import filter from '@/services/util/filter';
import { useEffect, useRef, useState } from "react";
import { ProFormInstance } from "@ant-design/pro-form";
import Tables from "@/components/Tables";
import { history } from "umi";
import DownTable from "@/services/util/timeFn";
import apiRequest from "@/services/ant-design-pro/apiRequest";

type GithubIssueItem = {
    name: string;
    mobile: string;
    sex: number;
    receiveNum: number;
    id: number;
    studentId: number;
    url: string;
    enable: boolean;
    isVisit: boolean;
    isPeer: boolean;
    source: string;
    studentSource: string;
    type: string | number;
    isFormal: boolean;
    isDeal: boolean;
    createTime: any;
    consultationTime: any;
    dealTime: any;
    circulationTime: any;
    presentationTime: any;
    idCard: string;
    project: string;
    dealProject: string;
    percent: number;
    userId: number;
    code: any;
    visitTime: any;
    dealDate: any;
    lastDealTime: any;
};
export default () => {
    const actionRef = useRef<ActionType>();
    const [InfoVisibleFalg, setInfoVisible] = useState<boolean>(false);
    const [renderData, setRenderData] = useState<any>(null);
    const formRef = useRef<ProFormInstance>();
    const [paramsA, setparamsA] = useState<any>({});
    const [selectedRowsId, setselectedRowsId] = useState<any>([]);
    const [selectedRowsList, setselectedRowsList] = useState<any>([]);
    const [exportloading, setExportloading] = useState<boolean>(false);
    const url = '/sms/business/bizStudentUser/studentDeal';
    const exportUrl = '/sms/business/bizStudentUser/export/studentDeal';
    let sortList = {
        createTime: 'desc',
    }
    const downObj = {
        线索录入时间: 'createTime',
        学员姓名: 'name',
        手机号: 'mobile',
        微信: 'weChat',
        QQ: 'QQ',
        项目总称: 'project',
        咨询岗位: 'projects',
        咨询时间: 'consultationTime',
        客户来源: 'studentSource',
        现所属老师: 'userName',
        录入时所属老师: 'firstUserName',
        信息提供人: 'providerName',
        成交日期: 'dealTime',
        成交项目: 'dealProject',
        成交岗位: 'dealProjects',
        成交金额: 'dealAmount',
        成交老师: 'dealUserName'
    }
    useEffect(() => {
        // console.log('123', history.location.query)
        formRef.current?.setFieldsValue(history.location.query);
        setparamsA(history.location.query);
        // actionRef?.current?.reload();
    }, []);
    const callbackRef = () => {
        actionRef?.current?.reload();
        // @ts-ignore
        actionRef?.current?.clearSelected();
    };
    const columns: ProColumns<GithubIssueItem>[] = [
        {
            title: '手机号',
            dataIndex: 'mobile',
            key: 'mobile',
            hideInTable: true,
        },
        {
            title: '微信',
            dataIndex: 'weChat',
            key: 'weChat',
            hideInTable: true,
        },
        {
            title: 'QQ',
            dataIndex: 'QQ',
            key: 'QQ',
            hideInTable: true,
        },
        {
            title: '线索录入时间',
            key: 'createTime',
            dataIndex: 'createTime',
            valueType: 'dateRange',
            sorter: true,
            render: (text, record) => (
                <span>{record.createTime}</span>
            ),
        },
        {
            title: '学员姓名',
            dataIndex: 'name',
            align: 'center',
            key: 'name',
            render: (text, record) => (
                <div>
                    <a
                        onClick={() => {
                            setRenderData({ ...record, admin: false });
                            setInfoVisible(true);
                        }}
                    >
                        {record.name}
                        <SearchOutlined />
                    </a>
                </div>
            ),
        },
        {
            title: '项目总称',
            dataIndex: 'parentProjects',
            key: 'parentProjects',
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
            width: 180,
            dataIndex: 'project-in',
            key: 'project-in',
            valueType: 'select',
            fieldProps: {
                options: Dictionaries.getCascader('dict_reg_job'),
                showSearch: { filter },
                mode: 'tags',
            },
            render: (text, record) => (
                <span>{Dictionaries.getCascaderName('dict_reg_job', record.project)}</span>
            ),
        },
        {
            title: '咨询时间',
            key: 'consultationTime',
            dataIndex: 'consultationTime',
            valueType: 'dateRange',
            sorter: true,
            render: (text, record) => (
                <span>
                    {record.consultationTime}
                </span>
            ),
        },
        {
            title: '客户来源',
            dataIndex: 'studentSource',
            valueType: 'select',
            key: 'studentSource',
            filters: true,
            filterMultiple: false,
            valueEnum: Dictionaries.getSearch('dict_source'),
            render: (text, record) => (
                <span>{Dictionaries.getName('dict_source', record.studentSource)}</span>
            ),
        },
        {
            title: '现所属老师',
            dataIndex: 'userName',
        },
        {
            title: '录入时所属老师',
            dataIndex: 'firstUserName',
        },
        {
            title: '信息提供人',
            dataIndex: 'providerName',
        },
        {
            title: '成交日期',
            key: 'dealTime',
            dataIndex: 'dealTime',
            valueType: 'dateRange',
            sorter: true,
            hideInTable: true,
            render: (text, record) => (
                <span>
                    {record.dealTime ? (
                        record.dealTime
                    ) : (
                        <Tag color="error">未成交</Tag>
                    )}
                </span>
            ),
        },
        {
            title: '成交状态',
            dataIndex: 'isDeal',
            width: 80,
            // search: false,
            valueType: 'select',
            key: 'isDeal',
            valueEnum: {
                false: '未成交',
                true: '已成交',
            },
            render: (text, record) => (
                record.isDeal ?
                    <div>
                        <a
                            onClick={() => {
                                setRenderData({ ...record, admin: false, key: '2' });
                                setInfoVisible(true);
                            }}
                        >
                            {text}
                            <SearchOutlined />
                        </a>
                    </div>
                    :
                    <div>{text}</div>
            ),
        },
        {
            title: '成交项目',
            dataIndex: 'dealParentProjects',
            key: 'dealParentProjects',
            valueType: 'select',
            fieldProps: {
                options: Dictionaries.getList('dict_reg_job'),
                mode: 'tags',
            },
            width: 180,
            render: (text, record) => (
                <span key="dealParentProjects">
                    {record.dealProject ? Dictionaries.getCascaderAllName('dict_reg_job', record.dealProject) : '-'}
                </span>
            ),
        },
        {
            title: '成交岗位',
            dataIndex: 'dealProject-in',
            key: 'dealProject-in',
            valueType: 'select',
            fieldProps: {
                options: Dictionaries.getCascader('dict_reg_job'),
                showSearch: { filter },
                mode: 'tags',
            },
            render: (text, record) => (
                <span>{record.dealProject ? Dictionaries.getCascaderName('dict_reg_job', record.dealProject) : '-'}</span>
            ),
        },
        {
            title: '成交金额',
            dataIndex: 'dealAmount',
        },
        {
            title: '成交老师',
            dataIndex: 'dealUserName',
        },
    ];
    return (
        <>
            <Tables
                columns={columns}
                className="student"
                actionRef={actionRef}
                formRef={formRef}
                cardBordered
                scroll={{ x: 1500 }}
                search={{
                    labelWidth: 120,
                    defaultCollapsed: false,
                }}
                rowClassName={""}
                onReset={() => {
                    setparamsA({});
                }}
                toolbar={toolbar}
                request={{ url: url, sortList: sortList }}
                rowSelection={{
                    onChange: (e, selectedRows) => {
                        setselectedRowsId(e);
                        setselectedRowsList(selectedRows as []);
                    },
                }}
                toolBarRender={[
                    <Button type="primary" icon={<DownloadOutlined />} loading={exportloading} onClick={() => {
                        setExportloading(true)
                        let param = formRef.current?.getFieldsValue();
                        Object.keys(param).forEach(key => {
                            if (!param[key]) delete param[key]
                        })
                        param = JSON.parse(JSON.stringify(param))
                        param._isGetAll = true
                        // console.log(param)
                        apiRequest.get(exportUrl, {
                            ...param
                        }).then(e => {
                            // console.log(e.data.content)
                            DownTable(e.data.content, downObj, '提供人学员')
                            setExportloading(false)
                        })
                    }}>根据搜索条件导出所有学员</Button>
                ]}
            />
            {InfoVisibleFalg && (
                <StudentInfo
                    setModalVisible={() => setInfoVisible(false)}
                    modalVisible={InfoVisibleFalg}
                    renderData={renderData}
                    admin={false}
                    callbackRef={() => callbackRef()}
                />
            )}
        </>
    )
}