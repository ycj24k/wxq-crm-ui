import { useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-table";
import { Button, Space, Tag } from "antd";
import Dictionaries from '@/services/util/dictionaries';
import filter from '@/services/util/filter';
import request from '@/services/ant-design-pro/apiRequest';
import moment from 'moment';
import StudentInfo from "@/pages/Admins/StudentManage/studentInfo";
import Tables from "@/components/Tables";
import { useModel } from "umi";



export default () => {
    const { initialState } = useModel('@@initialState');
    const provide = initialState?.currentUser?.userid
    const [renderData, setRenderData] = useState<any>(null);
    const [InfoVisibleFalg, setInfoVisible] = useState<boolean>(false);
    const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
    const [params, setParams] = useState<Object>({ provider: provide });

    const actionRef = useRef<ActionType>();
    const url = '/sms/business/bizStudentUser'
    const callbackRef = () => {
        // @ts-ignore
        actionRef.current.reload();
    };
    const columns: ProColumns<API.GithubIssueItem>[] = [
        {
            title: '学员/企业',
            dataIndex: 'name',
            align: 'center',
            key: 'name',
            render: (text, record) => (
                <div>
                    <a
                        onClick={() => {
                            setRenderData({ ...record });
                            setInfoVisible(true);
                        }}
                    >
                        {record.name}

                        <SearchOutlined />
                    </a>
                    <div>{record.isPeer && <Tag color="#87CEEB">同行企业</Tag>}</div>
                    <Tag color={record.visitTime ? 'success' : 'error'}>
                        {record.visitTime ? '已回访' : '未回访'}
                    </Tag>
                </div>
            ),
        },
        {
            title: '企业负责人',
            dataIndex: 'chargePersonName',
            key: 'chargePersonName',
        },
        {
            title: '所属老师',
            dataIndex: 'userName',
        },
        {
            title: '信息提供人',
            dataIndex: 'providerName',
        },
        {
            title: '咨询岗位',
            dataIndex: 'project',
            // search: false,
            // sorter: true,
            key: 'project',
            valueType: 'cascader',
            fieldProps: {
                options: Dictionaries.getCascader('dict_reg_job'),
                showSearch: { filter },
            },
            render: (text, record) => (
                <span>{Dictionaries.getCascaderName('dict_reg_job', record.project)}</span>
            ),
        },
        {
            title: '性别',
            dataIndex: 'sex',
            valueType: 'select',
            key: 'sex',
            valueEnum: {
                false: '男',
                true: '女',
            },
            render: (text, record) => (
                <span>{record.sex == null ? '未知' : record.sex ? '女' : '男'}</span>
            ),
        },
        {
            title: '是否是同行企业',
            dataIndex: 'isPeer',
            // width: 80,
            // search: false,
            valueType: 'select',
            key: 'isPeer',
            valueEnum: {
                false: '否',
                true: '是',
            },
            hideInTable: true,
        },
        {
            title: '项目总称',
            dataIndex: 'parentProjects',
            key: 'parentProjects',
            // sorter: true,
            valueType: 'cascader',
            fieldProps: {
                options: Dictionaries.getList('dict_reg_job'),
                showSearch: { filter },
            },
            width: 180,
            render: (text, record) => (
                <span key="parentProjects">
                    {Dictionaries.getCascaderAllName('dict_reg_job', record.project)}
                </span>
            ),
        },

        {
            title: '手机号',
            dataIndex: 'mobile',
            key: 'mobile',
            width: 100,
            render: (text, record) => <span style={{ userSelect: 'none' }}>{record.mobile}</span>,
        },
        {
            title: '身份证',
            dataIndex: 'idCard',
            key: 'idCard',
            hideInTable: true,
        },
        // {
        //   title: '所属企业名称',
        //   dataIndex: 'parentName',
        //   hideInTable: type != '学员' ? true : false,
        //   // valueType: 'select',
        //   // valueEnum: Dictionaries.getSearch('studentType'),
        //   // render: (text, record) => <span>{Dictionaries.getName('studentType', record.type)}</span>,
        // },
        {
            width: 100,
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
            width:100,
            title: '资源类型',
            dataIndex: 'source',
            valueType: 'select',
            key: 'source',
            filters: true,
            filterMultiple: false,
            valueEnum: Dictionaries.getSearch('circulationType'),
            render: (text, record) => (
                <span>{Dictionaries.getName('circulationType', record.source)}</span>
            ),
        },
        {
            title: '下单时间',
            key: 'dealTimes',
            dataIndex: 'dealTime',
            valueType: 'dateRange',
            sorter: true,
            render: (text, record) => (
                <span>
                    {record.dealTime ? (
                        record.dealTime
                    ) : (
                        <Tag color="error">未下单</Tag>
                    )}
                </span>
            ),
        },
        {
            title: '创建时间',
            key: 'createTime',
            dataIndex: 'createTime',
            valueType: 'dateRange',
            sorter: true,
            render: (text, record) => (
                <span>{record.createTime}</span>
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
            title: '备注',
            dataIndex: 'description',
            key: 'descriptions',
            search: false,
            ellipsis: true,
            tip: '备注过长会自动收缩',
        },
        {
            title: '操作',
            valueType: 'option',
            width: 180,
            key: 'options',
            fixed: 'right',
            render: (text, record, _, action) => (
                //order为选择学员时所用，parentId为企业添加学员时所用
                <Space>

                    <a
                        key="look-provide-user"
                        // icon={<SearchOutlined />}
                        onClick={() => {
                            setRenderData({ ...record });
                            setInfoVisible(true);
                        }}
                    >
                        查看
                    </a>

                    <a
                        key="editable"
                        onClick={() => {
                            setRenderData({ ...record, typee: 'eidt' });
                            setModalVisible(true);
                        }}
                    >
                        编辑
                    </a>
                </Space>
            ),
        },
    ];

    // let sortList = {
    //     ['dealTime,visitTime,circulationTime,createTime']: 'asc,asc,desc,desc',
    // };
    const sortList = {
        ['circulationTime,createTime']: 'desc,desc',
    };
    // let params = {
    //     provider: provide
    // }
    const toolbar = {
        menu: {
            type: 'tab',
            items: [
                {
                    key: 'me',
                    label: (
                        <span>我提供的</span>
                    )
                },
                {
                    key: 'receive',
                    label: (
                        <span>我领取的</span>
                    )
                },
            ],
            onChange: (key: any) => {
                if (key == 'me') {
                    setParams({ provider: provide })
                }
                if (key == 'receive') {
                    setParams({ 'provider-isNot': provide, 'provider-isNull': false, userId: provide })
                }
                console.log('123');

                callbackRef()
            }
        }
    }
    return (
        <div>
            <Tables
                actionRef={actionRef}
                columns={columns}
                className="provideuser"
                request={{ url, sortList, params }}
                toolbar={toolbar}
                search={{ defaultCollapsed: true, labelWidth: 150, defaultColsNumber: 10 }}
                toolBarRender={[

                ]}
            />

            {InfoVisibleFalg && (
                <StudentInfo
                    setModalVisible={() => setInfoVisible(false)}
                    modalVisible={InfoVisibleFalg}
                    renderData={renderData}
                    callbackRef={() => callbackRef()}
                />
            )}
        </div>
    )
}