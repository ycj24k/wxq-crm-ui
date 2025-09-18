import { useEffect, useRef, useState } from 'react';
import { DownloadOutlined, PlusOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import {
    Button, Table, message,
    //  Tag,
    Popconfirm, Space
} from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import request from '@/services/ant-design-pro/apiRequest';
// import moment from 'moment';
import {
    ModalForm,
    //  ProFormCascader,
    ProFormInstance
} from '@ant-design/pro-form';
import Dictionaries from '@/services/util/dictionaries';
import Upload from '@/services/util/upload';
import { PageContainer } from '@ant-design/pro-layout';
import StudentInfo from '@/pages/Admins/StudentManage/studentInfo';
import Tables from '@/components/Tables';
import filter from '@/services/util/filter';
import { useModel } from 'umi';
//添加用户
import Modals from '@/pages/Admins/StudentManage/userModal'
import UserTreeSelect from '@/components/ProFormUser/UserTreeSelect';
// import Modals from './Modals';
//新资源库
type GithubIssueItem = {
    name: string;
    sex: number;
    id: number;
    departmentId: number;
    url: string;
    enable: boolean;
    isVisit: boolean;
    source: string;
    studentSource: string;
    type: string | number;
    createTime: any;
    circulationTime: any;
    idCard: string;
    project: string;
    code: any;
    receiveDate: any;
    studentStatus: string
};

export default (props: any) => {
    const formRefs = useRef<ProFormInstance>();
    const { initialState } = useModel('@@initialState');
    const [userNameId1, setUserNameId1] = useState<any>();
    const [renderData, setRenderData] = useState<any>(null);
    const [userFromTeacher, setuserFromTeacher] = useState<boolean>(false);
    const [InfoVisibleFalg, setInfoVisible] = useState<boolean>(false);
    const [TabListNuber, setTabListNuber] = useState<any>('9');
    const [StudentIds, setStudentIds] = useState<any>([]);
    const [params, setParams] = useState<any>({});
    const [departmentId, setDepartmentId] = useState<number>();
    const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
    const url = '/sms/business/bizStudentUser';

    const actionRef = useRef<ActionType>();
    
    // 监听 initialState 变化
    useEffect(() => {
        if (initialState?.currentUser?.userid) {
            const deptId = Dictionaries.getDepartmentList(initialState.currentUser.userid)?.id;
            console.log('deptId', deptId);
            setDepartmentId(deptId);
            // 只有在非特定标签页时才设置 departmentId
            if (TabListNuber !== '7' && TabListNuber !== '9') {
                setParams({ departmentId: deptId });
            }
        }
    }, [initialState?.currentUser?.userid, TabListNuber]);

    const callbackRef = () => {
        actionRef.current?.reload();
    };
    useEffect(() => {
        if (TabListNuber == '7' || TabListNuber == '9') {
            setParams({})
        }
    }, [TabListNuber])//切换到非学员公海时，清空查询条件
    //列表
    const columns: ProColumns<GithubIssueItem>[] = [
        {
            title: '出镜人',
            dataIndex: 'name',

        },
        {
            width: 120,
            title: '匹配线索分组',
            dataIndex: 'groupName',

        },
        {
            title: '线索提供人',
            dataIndex: 'provider',
        },
        {
            title: '姓名',
            dataIndex: 'name',
            width: 100,
            sorter: true,
            fixed: 'left',
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
                </div>
            ),
        },
        {
            title: '性别',
            dataIndex: 'sex',
            // width: 80,
            // search: false,
            valueType: 'select',
            valueEnum: {
                false: '男',
                true: '女',
            },
            render: (text, record) => (
                <span>{record.sex == null ? '未知' : record.sex ? '女' : '男'}</span>
            ),
            sorter: true,
        },
        {
            title: '身份证',
            dataIndex: 'idCard',
            hideInTable: true,
            sorter: true,
        },
        {
            title: '手机号',
            dataIndex: 'mobile',
            key: 'mobile',
            hideInTable: true,
        },
        {
            title: '微信号',
            dataIndex: 'weChat',
            key: 'weChat',
            hideInTable: true,
        },
        {
            title: '学员类型',
            dataIndex: 'type',
            valueType: 'select',
            width: 130,
            sorter: true,
            order: 9,
            filters: true,
            filterMultiple: false,
            valueEnum: Dictionaries.getSearch('studentType'),
            render: (text, record) => <span>{Dictionaries.getName('studentType', record.type)}</span>,
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
            width: 150,
            render: (text, record) => (
                <span key="parentProjects">
                    {Dictionaries.getCascaderAllName('dict_reg_job', record.project)}
                </span>
            ),
        },
        {
            title: '咨询岗位',
            dataIndex: 'project',
            // search: false,
            // sorter: true,
            key: 'project',
            valueType: 'cascader',
            fieldProps: {
                showSearch: { filter },
                options: Dictionaries.getCascader('dict_reg_job'),
            },
            render: (text, record) => (
                <span>{Dictionaries.getCascaderName('dict_reg_job', record.project)}</span>
            ),
        },
        {
            title: '咨询时间',
            key: 'createTime',
            sorter: true,
            dataIndex: 'createTime',
            valueType: 'dateRange',
            render: (text, record) => (
                <span>{record.createTime}</span>
            ),
        },
        {
            title: '客户来源',
            dataIndex: 'studentSource',
            valueType: 'select',
            sorter: true,
            valueEnum: Dictionaries.getSearch('dict_source'),
            render: (text, record) => (
                <span>{Dictionaries.getName('dict_source', record.studentSource)}</span>
            ),
        },
        {
            title: '领取次数',
            sorter: true,
            dataIndex: 'receiveNum',
            key: 'receiveNum',
        },
        {
            title: '当前所在部门',
            width: 120,
            sorter: true,
            dataIndex: 'departmentId',
            search: false,
            render: (text, record) => (
                <span>
                    {Dictionaries.getDepartmentName(record.departmentId).join('-')}
                    {/* {record.departmentName} */}
                </span>
            ),
        },
        {
            title: '备注',
            dataIndex: 'description',
            ellipsis: true,
            tip: '备注过长会自动收缩',
        },
        {
            title: '流转时间',
            sorter: true,
            key: 'circulationTime',
            dataIndex: 'circulationTime',
            valueType: 'dateRange',
            render: (text, record) => (
                <span>{record.circulationTime}</span>
            ),
        },
        {
            title: '信息提供人',
            dataIndex: 'providerName',
            key: 'providerName',
            hideInTable: true,
        },
        {
            title: '当前学员状态',
            dataIndex: 'studentStatus',
            valueType: 'select',
            filters: true,
            width: 120,
            valueEnum: Dictionaries.getSearch('visitStatus'),
            render: (text, record) => <span>{Dictionaries.getName('visitStatus', record.studentStatus)}</span>
        },
        {
            title: '操作',
            valueType: 'option',
            width: 200,
            key: 'options',
            fixed: 'right',
            render: (text, record, _, action) => (
                <>
                    <Space>
                        <a
                            key={`edit-${record.id || Math.random()}`}
                            // size="small"
                            type="primary"
                            // icon={<FormOutlined />}
                            onClick={() => {
                                request
                                    .post('/sms/business/bizStudentUser/receive', {
                                        ids: record.id,
                                        ...({ source: TabListNuber }),//99为潜在学员，不传source
                                    })
                                    .then((res: any) => {
                                        if (res.status == 'success') {
                                            message.success('领取成功');
                                            callbackRef();
                                        }
                                    });
                            }}
                        >
                            领取
                        </a>
                        {TabListNuber == '9' && <Popconfirm
                            key="deletePop"
                            title="是否确定删除？"
                            style={{ marginRight: '15px', marginBottom: '8px' }}
                            onConfirm={() => {
                                request.delete('/sms/business/bizStudentUser/deleteArray', { ids: record.id }).then((res: any) => {
                                    if (res.status == 'success') {
                                        message.success('删除成功');
                                        callbackRef();
                                    }
                                });
                            }}

                            okText="删除"
                            cancelText="取消"
                        >
                            <a key="deletes" style={{ color: 'red' }}>
                                删除
                            </a>
                        </Popconfirm>}

                    </Space>

                </>

            )
        }
    ];
    let tabs = [
        {
            key: 'fen',
            label: (<span>分公司资源库</span>)
        },
        {
            key: 'zong',
            label: (<span>总公司资源库</span>)
        },
        {
            key: 'all',
            label: (<span>所有资源</span>)
        },
    ];
  
    
    const toolbar = {
        menu: {
            type: 'tab',
            items: tabs,
            onChange: (key: string) => {
                if (key == 'fen') {
                    setParams({ departmentId: departmentId })//分公海传对应的
                } else if (key == 'zong') {
                    setParams({ departmentId: '15' })//总公海固定传15
                } else {
                    setParams({})//其他不传
                }
                callbackRef();//刷新页面
            }
        }
    }
    return (
        <>
            <PageContainer
                onTabChange={(e) => {
                    setTabListNuber(e);
                    callbackRef();
                }}
                tabList={[
                    {
                        tab: '新媒体资源',
                        key: '9'
                    },
                    {
                        tab: '潜在学员公海',
                        key: '1',
                    },
                    {
                        tab: '正式学员公海',
                        key: '4',
                    },

                    {
                        tab: '无效资源库',
                        key: '7',
                    },
                ]}
            >
                {/* 学员列表 */}
                <Tables
                    columns={columns}
                    actionRef={actionRef}
                    toolbar={TabListNuber == '7' || TabListNuber == '9' ? undefined : toolbar}
                    request={{
                        url: TabListNuber == '9' ? '/sms/business/bizStudentUser/leadStudent' : '/sms/business/bizStudentUser/circulationLibrary',
                        params: { ...({ source: TabListNuber }), 'userId-isNull': true, ...params },
                        sortList: TabListNuber == '9' ? 
                        {
                            ['circulationTime']: 'asc,desc',
                        } :
                         {
                            ['receiveNum,circulationTime']: 'asc,desc',
                        },//新媒体资源不传receiveNum
                    }}
                    search={ { defaultCollapsed: true, defaultColsNumber: 10 }}
                    rowSelection={{
                        // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
                        // 注释该行则默认不显示下拉选项
                        selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                        onChange: (e, selectedRows) => {
                            setStudentIds(e);
                        },
                    }}
                    toolBarRender={[
                        <Button
                            key="ordere"
                            type="primary"
                            hidden={TabListNuber != '1' && TabListNuber != '9'}
                            icon={<PlusOutlined />}
                            onClick={async () => {
                                if (StudentIds.length == 0) {
                                    message.error('请先勾选至少一个学员在进行分配!');
                                    return;
                                }
                                setuserFromTeacher(true);
                            }}
                        >
                            批量分配
                        </Button>,
                        <Button
                            key="button"
                            icon={<PlusOutlined />}
                            type="primary"
                            hidden={TabListNuber == '9'}
                            onClick={() => {
                                if (StudentIds.length == 0) {
                                    message.error('请选择需要领取的学员!');
                                    return;
                                }
                                request
                                    .post('/sms/business/bizStudentUser/receive', {
                                        ids: StudentIds.join(','),
                                        ...({ source: TabListNuber }),//99为潜在学员，不传source
                                    })
                                    .then((res: any) => {
                                        if (res.status == 'success') {
                                            message.success('操作成功');
                                            callbackRef();
                                        }
                                    });
                            }}
                        >
                            批量领取
                        </Button>,

                        <Button
                            key="button"
                            icon={<DeleteOutlined />}
                            type="primary"
                            danger
                            hidden={TabListNuber != '9'}
                            onClick={() => {
                                if (StudentIds.length == 0) {
                                    message.error('请选择需要删除的学员!');
                                    return;
                                }

                                request
                                    .delete('/sms/business/bizStudentUser/deleteArray', {
                                        ids: StudentIds.join(','),
                                    })
                                    .then((res: any) => {
                                        if (res.status == 'success') {
                                            message.success('删除成功');
                                            callbackRef();
                                        }
                                    });
                            }}
                        >
                            批量删除
                        </Button>,
                    ]}
                />
                {modalVisibleFalg && (//添加学员弹窗
                    <Modals
                        setModalVisible={() => setModalVisible(false)}
                        modalVisible={modalVisibleFalg}
                        callbackRef={() => callbackRef()}
                        renderData={renderData}
                        url={url}
                        type={'学员'}
                        sourceType={1}
                    />
                )}
                {userFromTeacher && (//分配老师弹窗
                    <ModalForm
                        width={450}
                        visible={userFromTeacher}
                        modalProps={{
                            // destroyOnClose: true,
                            maskClosable: false,
                            onCancel: () => {
                                setuserFromTeacher(false);
                            },
                        }}
                        formRef={formRefs}
                        onFinish={async (value: any) => {
                            if (!userNameId1) {
                                message.error('请选择老师！')
                                return
                            }
                            new Promise((resolve) => {
                                request
                                    .postAll(`/sms/business/bizStudentUser/assign/${userNameId1.id}`,
                                        StudentIds,
                                    )
                                    .then((res) => {
                                        if (res.status == 'success') {
                                            message.success('分配成功!');
                                            setuserFromTeacher(false);
                                            callbackRef();
                                            // resolve(res);
                                        }
                                    });
                            });
                        }}
                    >
                        <UserTreeSelect
                            ref={null}
                            userLabel={'推荐给'}
                            userNames="userId"
                            enable={true}
                            userPlaceholder="请选择老师"
                            setUserNameId={(e: any) => setUserNameId1(e)}
                            flag={true}
                        />
                    </ModalForm>
                )}
                {InfoVisibleFalg && (//查看学员详情弹窗
                    <StudentInfo
                        setModalVisible={() => setInfoVisible(false)}
                        modalVisible={InfoVisibleFalg}
                        renderData={renderData}
                        callbackRef={() => callbackRef()}
                        mobileHide={true}
                    />
                )}
            </PageContainer>
        </>
    );
};
