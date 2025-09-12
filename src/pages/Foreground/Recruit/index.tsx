import Tables from "@/components/Tables"
import { DownloadOutlined, DownOutlined, PlusOutlined } from "@ant-design/icons"
import { PageContainer } from "@ant-design/pro-layout"
import type { ActionType, ProColumns } from "@ant-design/pro-table"
import { Badge, Button, Dropdown, Menu, message, Popconfirm, Space, Tag, Table, DatePicker } from "antd"
import { useEffect, useRef, useState } from "react"
import ModalAdd from "./ModalAdd"
import Dictionaries from '@/services/util/dictionaries';
import request from '@/services/ant-design-pro/apiRequest';
import UserModal from "@/pages/Admins/UserManage/userModal"
import './index.less'
import DownHeader from './DownHeader'
import DownTable from '@/services/util/timeFn';
import ProCard from "@ant-design/pro-card"
import { getFirstAndLastDayOfMonthDate } from '../../Department/AchievementUser/getTime'
import type { ProFormInstance } from "@ant-design/pro-form"
export default () => {
    const [ModalVisible, setModalVisible] = useState<boolean>(false)
    const [UserModalVisible, setUserModalVisible] = useState<boolean>(false)
    const [renderData, setRenderData] = useState<any>({});
    const [Params, setParams] = useState<any>({ enable: true });
    const [Badges, setBadges] = useState<any>([0, 0]);
    const [BadgesAll, setBadgesAll] = useState<any>(0);
    const [searchData, setSearchData] = useState<any>({});
    const actionRef = useRef<ActionType>();
    const formRef = useRef<ProFormInstance>();
    const callbackRef = (type = 'Badges') => {
        // @ts-ignore
        actionRef.current.reload();
        if (type == 'Badges') {
            BadgesNumbers()
        }

    };
    const BadgesNumbers = () => {
        const data = []
        for (let i = 0; i <= 9; i++) {
            data.push({ status: i })
        }
        request.get('/sms/system/sysInterview/statistics', {
            array: JSON.stringify(data)
        }).then((res) => {
            setBadges(res.data);
        })
    }
    useEffect(() => {
        let isMounted = true;
        
        const loadBadges = async () => {
            try {
                const data = []
                for (let i = 0; i <= 9; i++) {
                    data.push({ status: i })
                }
                const res = await request.get('/sms/system/sysInterview/statistics', {
                    array: JSON.stringify(data)
                });
                
                if (isMounted) {
                    setBadges(res.data);
                }
            } catch (error) {
                if (isMounted) {
                    console.error('加载统计数据失败:', error);
                }
            }
        };
        
        loadBadges();
        
        return () => {
            isMounted = false;
        };
    }, [])
    const setStatus = (key: number) => {
        request.post('/sms/system/sysInterview', { status: key, id: renderData.id }).then((res) => {
            if (res.status == 'success') {
                message.success('操作成功')
                callbackRef()
            }
        })
    }
    const menu = (
        <Menu
            items={[
                {
                    key: '7',
                    label: (
                        <span style={{ color: 'green' }}
                            onClick={() => {
                                setStatus(7)
                            }}
                        >
                            合适
                        </span>
                    ),
                },
                {
                    key: '8',
                    label: (
                        <span style={{ color: 'red' }}
                            onClick={() => {
                                setStatus(8)
                            }}
                        >
                            不合适
                        </span>
                    ),
                },
                {
                    key: '2',
                    label: (
                        <span style={{ color: 'blue' }}
                            onClick={() => {
                                setStatus(2)
                            }}
                        >
                            储备
                        </span>
                    ),
                },
                {
                    key: '1',
                    label: (
                        <span onClick={() => {
                            setStatus(1)
                        }}>
                            待复试
                        </span>
                    )
                },
                {
                    key: '6',
                    label: (
                        <span style={{ color: 'green' }}
                            onClick={() => {
                                setStatus(6)
                            }}
                        >
                            已入职
                        </span>
                    ),
                },
                {
                    key: '9',
                    label: (
                        <span style={{ color: 'red' }}
                            onClick={() => {
                                setStatus(9)
                            }}
                        >
                            离职
                        </span>
                    ),
                },
            ]}
        />
    )
    const getColor = (value: string) => {
        let color = '#87d068'
        if (value == '1') {
            color = '#2db7f5'
        } else if (value == '5') {
            color = '#f50'
        } else if (value == '2') {
            color = '#108ee9'
        } else if (value == '0' || value == '1') {
            color = '#108ee9'
        }
        return color
    }
    const columns: ProColumns<API.GithubIssueItem>[] = [
        {
            title: '初试日期',
            dataIndex: 'time',
            key: 'time',
            width: 100,
            sorter: true,
            valueType: 'dateRange',
            render: (text, record) => (
                <span>{record.time}</span>)
        },
        {
            title: '姓名',
            dataIndex: 'name',
            width: 80,
            key: 'name',
            sorter: true
        },
        {
            title: '面试部门',
            dataIndex: 'departmentName',
            key: 'departmentName',
            width: 200,
            render: (text, record) => (
                <span>
                    {Dictionaries.getDepartmentName(record.departmentId).join('-')}
                    {/* {record.departmentName} */}
                </span>
            ),
        },
        {
            title: '面试职位',
            dataIndex: 'post',
            key: 'post',
            width: 100,
            sorter: true,
            filterMultiple: false,
            valueEnum: Dictionaries.getSearch('Recruitment_Positions'),
            render: (text, record) => (
                <span>{Dictionaries.getName('Recruitment_Positions', record.post)}</span>
            ),

        },
        {
            title: '联系电话',
            dataIndex: 'mobile',
            key: 'mobile',
            width: 110,
            sorter: true
        },
        {
            title: '面试官',
            dataIndex: 'interviewer',
            key: 'interviewer',
            width: 80,
            sorter: true,
            render: (text, record) => (
                <span>{record.interviewer && Dictionaries.getDepartmentUserName(record.interviewer)}</span>
            ),
        },
        {
            title: '状态',
            dataIndex: 'status',
            width: 120,
            key: 'status',
            sorter: true,
            valueEnum: Dictionaries.getSearch('recruit_status'),
            render: (text, record) => (
                <Tag color={getColor(record.status)}>{Dictionaries.getName('recruit_status', record.status)}</Tag>)
        },
        // {
        //     title: '是否入职',
        //     dataIndex: 'statusa',
        //     width: 120,
        //     key: 'statusa',
        //     sorter: true,
        //     render: (text, record) => (
        //         <span>{record.status == 6 ? '否' : '是'}</span>
        //     )
        // },
        {
            title: '通知入职时间',
            dataIndex: 'entryTime',
            key: 'entryTime',
            width: 100,
            sorter: true,
            render: (text, record) => (
                <span>{record.entryTime}</span>
            ),
        },
        {
            title: '面试关键印象及意见',
            dataIndex: 'suggestion',
            key: 'suggestion',
            width: 300,
            sorter: true,
            ellipsis: true,
            tip: '过长会自动收缩',
        },
        {
            title: '最终结果',
            dataIndex: 'description',
            key: 'description',
            width: 150,
            sorter: true,
            ellipsis: true,
            tip: '过长会自动收缩',
        },
        {
            title: '性别',
            dataIndex: 'sex',
            width: 50,
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
            title: '年龄',
            dataIndex: 'age',
            width: 60,
            key: 'age',
            sorter: true
        },


        {
            title: '专业',
            dataIndex: 'profession',
            key: 'profession',
            width: 80,
            sorter: true,

        },
        {
            title: '学历',
            dataIndex: 'degree',
            key: 'degree',
            filters: true,
            width: 60,
            sorter: true,
            filterMultiple: false,
            valueEnum: Dictionaries.getSearch('dict_education'),
            render: (text, record) => (
                <span>{Dictionaries.getName('dict_education', record.degree)}</span>
            ),
        },

        {
            title: '期薪工资',
            dataIndex: 'expectedSalary',
            key: 'expectedSalary',
            width: 80,
            sorter: true
        },
        {
            title: '录用薪酬体系',
            dataIndex: 'salary',
            key: 'salary',
            width: 80,
            sorter: true
        },

        {
            title: '招聘渠道',
            dataIndex: 'source',
            key: 'source',
            filters: true,
            sorter: true,
            width: 80,
            filterMultiple: false,
            valueEnum: Dictionaries.getSearch('Recruitment_channels'),
            render: (text, record) => (
                <span>{Dictionaries.getName('Recruitment_channels', record.source)}</span>
            ),
        },
        {
            title: '招聘人资',
            dataIndex: 'presenterName',
            key: 'presenterName',
            width: 80,
            sorter: true
        },
        // {
        //     title: '招聘状态',
        //     dataIndex: 'status',
        //     key: 'status',
        //     width: 80,
        //     sorter: true,
        //     render: (text, record) => (
        //         <span>{Dictionaries.getName('recruit_status', record.status)}</span>
        //     ),
        // },

        {
            title: '操作',
            dataIndex: 'options',
            width: 260,
            fixed: 'right',
            render: (text, record) => (
                <Space>
                    <a
                        key='eidt'
                        onClick={() => {
                            setRenderData({ ...record, type: 'eidt' })
                            setModalVisible(true)
                        }}
                    >
                        编辑
                    </a>
                    <Dropdown menu={{ items: menu }} onOpenChange={(e) => {
                        setRenderData(record)
                    }}>
                        <a onClick={e => {
                            e.preventDefault()
                        }}>

                            更改状态
                            <DownOutlined />

                        </a>
                    </Dropdown>
                    <a
                        hidden={record.status != 6}
                        onClick={() => {
                            setRenderData({ ...record, type: 'addUser' })
                            setUserModalVisible(true)
                        }}
                    >
                        创建账号
                    </a>
                    <Popconfirm
                        key={record.id}
                        title="是否删除？"
                        onConfirm={() => {
                            request.delete('/sms/system/sysInterview', { id: record.id }).then((res: any) => {
                                if (res.status == 'success') {
                                    message.success('删除成功');
                                    callbackRef();
                                }
                            });
                        }}
                        okText="删除"
                        cancelText="取消"
                    >
                        <a style={{ color: 'red' }}>删除</a>
                    </Popconfirm>
                </Space>
            )
        },
    ]
    let toolbar = undefined;
    toolbar = {
        menu: {
            type: 'tab',
            // activeKey: activeKey,
            items: [
                {
                    key: 'all',
                    label: (
                        <Badge overflowCount={9999} count={BadgesAll} size="small" offset={[5, 3]}>
                            <span>全部</span>
                        </Badge>
                    ),
                },
                {
                    key: '7',
                    label: (
                        <Badge count={Badges[7]} size="small" offset={[5, 3]}>
                            <span>合适</span>
                        </Badge>
                    ),
                },
                {
                    key: '8',
                    label: (
                        <Badge count={Badges[8]} size="small" offset={[5, 3]}>
                            <span>不合适</span>
                        </Badge>
                    ),
                },
                {
                    key: '2',
                    label: (
                        <Badge count={Badges[2]} size="small" offset={[5, 3]}>
                            <span>储备</span>
                        </Badge>
                    ),
                },
                {
                    key: '1',
                    label: (
                        <Badge count={Badges[1]} size="small" offset={[5, 3]}>
                            <span>待复试</span>
                        </Badge>
                    ),
                },
                {
                    key: '6',
                    label: (
                        <Badge count={Badges[6]} size="small" offset={[5, 3]}>
                            <span>已入职</span>
                        </Badge>

                    ),
                },
                {
                    key: '9',
                    label: (
                        <Badge count={Badges[9]} size="small" offset={[5, 3]}>
                            <span>离职</span>
                        </Badge>
                    ),
                },
                // {
                //     key: '3',
                //     label: (
                //         <Badge count={Badges[3]} size="small" offset={[5, 3]}>
                //             <span>通过等待回复</span>
                //         </Badge>
                //     ),
                // },
                // {
                //     key: '4',
                //     label: (
                //         <Badge count={Badges[4]} size="small" offset={[5, 3]}>
                //             <span>通过</span>
                //         </Badge>
                //     ),
                // },

                // {
                //     key: '5',
                //     label: (

                //         <span>不通过/失联</span>

                //     ),
                // },

            ],
            onChange: (key: any) => {
                if (key == 'all') {
                    setParams({ enable: true });
                } else {
                    setParams({ status: key, enable: true });
                }

                callbackRef('reload');
            },
        },
    };
    const sortList: any = {
        ['time']: 'desc',
    };
    return (
        <PageContainer>
            <ProCard >
                <div>
                    <div>日期选择:</div>
                    <DatePicker onChange={(e) => {
                        if (e) {
                            const time = getFirstAndLastDayOfMonthDate(e?.toDate())
                            setSearchData({
                                'time-start': time.firstDay,
                                'time-end': time.lastDay
                            })
                        } else {
                            setSearchData({})
                        }
                    }} picker="month" />
                </div>

            </ProCard>
            <Tables
                className="Recruit"
                columns={columns}
                formRef={formRef}
                actionRef={actionRef}
                scroll={{ x: 1500 }}
                toolbar={toolbar}
                searchData={searchData}
                request={{ url: '/sms/system/sysInterview', params: Params, sortList }}
                getTotalElements={(e) => {
                    setBadgesAll(e)
                }}
                toolBarRender={[
                    <Popconfirm
                        title="是否根据当前搜索条件导出全部数据？"
                        onConfirm={() => {
                            let param = formRef.current?.getFieldsValue();
                            Object.keys(param).forEach(key => {
                                if (!param[key]) delete param[key]
                            })
                            param = JSON.parse(JSON.stringify(param))
                            param._isGetAll = true
                            request.get("/sms/system/sysInterview", { ...searchData, ...Params, ...param }).then(res => {
                                if (res.status == 'success') {
                                    DownTable(res.data.content, DownHeader.Header, '招聘信息', 'recruit')
                                    // console.log()
                                } else {
                                    message.error(res.data)
                                }
                            })
                        }}
                        okText="导出"
                        cancelText="取消"
                    >
                        <Button
                            icon={<DownloadOutlined />}
                            type="primary"
                            onClick={() => {
                            }}
                        >
                            条件导出
                        </Button>
                    </Popconfirm>,
                    <Button
                        key="add-recruit"
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={() => {
                            setRenderData({ type: 'add' })
                            setModalVisible(true);
                        }}
                    >
                        新建
                    </Button>,
                ]}
                rowSelection={{
                    // 注释该行则默认不显示下拉选项
                    selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                    onChange: (e, selectedRows) => {
                        // setStudentIds(e);
                    },
                }}
                tableAlertOptionRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => {
                    return (
                        <Space size={24}>
                            <span>
                                <a style={{ marginInlineStart: 8 }} onClick={onCleanSelected}>
                                    取消选择
                                </a>
                            </span>
                            <a
                                onClick={() => {
                                    DownTable(selectedRows, DownHeader.Header, '招聘信息', 'recruit')
                                }}
                            >
                                导出选中
                            </a>
                        </Space>
                    );
                }}
            />
            {ModalVisible && (
                <ModalAdd
                    setModalVisible={() => setModalVisible(false)}
                    modalVisible={ModalVisible}
                    callbackRef={() => callbackRef()}
                    renderData={renderData}
                />
            )}
            {UserModalVisible && (
                <UserModal
                    setModalVisible={() => setUserModalVisible(false)}
                    modalVisible={UserModalVisible}
                    callbackRef={() => callbackRef()}
                    renderData={renderData}
                    typeStatus='Entry'
                    setStatus={() => setStatus(6)}
                />
            )}
        </PageContainer>
    )
}   