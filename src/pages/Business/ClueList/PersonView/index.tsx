import apiRequest from "@/services/ant-design-pro/apiRequest"
import { PlusOutlined } from "@ant-design/icons"
import { ActionType, ProColumns } from "@ant-design/pro-table"
import { Button } from "antd"
import { useEffect, useRef, useState } from "react"
import { PageContainer } from "@ant-design/pro-layout"
import dictionaries from "@/services/util/dictionaries"
import ProTable from '@ant-design/pro-table'
import { DownloadOutlined } from '@ant-design/icons'
//添加用户
import Modals from '@/pages/Admins/StudentManage/userModal'

export default () => {
    const actionRef = useRef<ActionType>();
    const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
    const callbackRef = () => actionRef.current?.reload()
    const url = '/sms/lead/ladUserGroup'
    let roleContent: any = null;
    type GithubIssueItem = {
        name: string;
        url: string;
        id: number;
        sort: string;
        userList: any[];
    };

    const columns: ProColumns<GithubIssueItem>[] = [
        {
            title: '学员姓名',
            dataIndex: 'name'
        },
        {
            title: '现所属老师',
            dataIndex: 'sort'
        },
        {
            title: '录入时所属老师',
            sorter: true,
            dataIndex: 'departmentName',
            search: false,
            render: (text: any, record: any) => (
                <span>
                    {dictionaries.getDepartmentName(record.departmentId).join('-')}
                </span>
            ),
        },
        {
            title: '信息提供人',
            dataIndex: 'sort'
        },
        {
            title: '线索录入时间',
            dataIndex: 'sort'
        },
        {
            title: '项目总称',
            dataIndex: 'sort'
        },
        {
            title: '咨询岗位',
            dataIndex: 'sort'
        },
        {
            title: '咨询时间',
            dataIndex: 'sort'
        },
        {
            title: '客户来源',
            dataIndex: 'sort'
        },
        {
            title: '成交状态',
            dataIndex: 'sort'
        },
        {
            title: '成交项目',
            dataIndex: 'sort'
        },
        {
            title: '成交岗位',
            dataIndex: 'sort'
        },
        {
            title: '成交金额',
            dataIndex: 'sort'
        },
        {
            title: '成交老师',
            dataIndex: 'sort'
        }
    ]
    const getDepartmentUser = async () => {
        const res = await apiRequest.get('/sms/share/getDepartmentAndUser');
    }
    useEffect(() => {
        getDepartmentUser()
    }, [])
    return <>
        <PageContainer>
            <ProTable<GithubIssueItem>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                scroll={{ x: 1500 }}
                request={async (
                    params: {
                        current?: any;
                        page?: number;
                    } = {

                        },
                    sort,
                    filter,
                ) => {
                    roleContent = await apiRequest.get(url, params);
                    return {
                        data: roleContent.data.content,
                        success: roleContent.success,
                        total: roleContent.data.totalElements,
                    };
                }}
                rowKey="id"
                search={{
                    labelWidth: 'auto',
                    collapsed: false,
                }}
                onSubmit={() => {
                    roleContent = null;
                }}
                onReset={() => {
                    roleContent = null;
                }}
                options={{
                    reload: () => {
                        roleContent = null;
                        callbackRef();
                    },
                }}
                toolBarRender={() => [
                    <Button
                        key="buttona"
                        icon={<DownloadOutlined />}
                        type="primary"
                        onClick={() => { }}
                    >
                        批量导入
                    </Button>,
                    <Button
                        key="button"
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={() => {
                            setModalVisible(true)
                        }}
                    >
                        新建
                    </Button>
                ]}
                dateFormatter="string"
            />

            {/* 添加学员弹窗 */}
            {modalVisibleFalg && (
                <Modals
                    setModalVisible={() => setModalVisible(false)}
                    modalVisible={modalVisibleFalg}
                    callbackRef={() => callbackRef()}
                    renderData={{ parentId: 1 , typee: 'add', from:'newmide'}}
                    url={url}
                    type={'学员'}
                    sourceType={2}
                />
            )}
        </PageContainer>
    </>
}