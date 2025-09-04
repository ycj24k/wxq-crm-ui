import apiRequest from "@/services/ant-design-pro/apiRequest"
import { PlusOutlined } from "@ant-design/icons"
import { ActionType, ProColumns } from "@ant-design/pro-table"
import { Button, message, Popconfirm, Space } from "antd"
import { useEffect, useRef, useState } from "react"
import Modal from "./edit"
import ExpandModal from './expandModal'
import { PageContainer } from "@ant-design/pro-layout"
import dictionaries from "@/services/util/dictionaries"
import ProTable from '@ant-design/pro-table';
import UserChoose from "./UserChoose"

export default () => {
    const actionRef = useRef<ActionType>();
    const callbackRef = () => actionRef.current?.reload()
    const [modalVisible, setModalVisible] = useState<boolean>(false)
    const [ExpandModalVisible, setExpandModalVisible] = useState<boolean>(false)
    const [renderData, setRenderData] = useState<any>({});
    const [CardContent, setCardContent] = useState<any>();
    const [parentIdTree, setParentIdTree] = useState<string | number>('-1');
    let [department, setDepartment] = useState<any>();
    const [UserChooseVisible, setUserChooseVisible] = useState<boolean>(false);
    const url = '/sms/lead/ladUserGroup'
    let content: any = null;
    let roleContent: any = null;
    type GithubIssueItem = {
        url: string;
        id: number;
        name: string;
        sort: string;
        userList: any[];
    };
    const transformProviderList = (providerList: string) => {
        // 将字符串分割并转换为数字数组
        const numbers = providerList.split(',').map(Number);
        
        // 转换为所需格式
        return numbers.map(id => ({
            id: id
        }));
    }
    
    const columns: ProColumns<GithubIssueItem>[] = [
        {
            title: '小组名称',
            dataIndex: 'name'
        },
        {
            title: '优先级',
            dataIndex: 'sort'
        },
        {
            title: '当前所在部门',
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
            title: '绑定销售人员',
            dataIndex: 'userNameList',
            colSpan: 2,
            ellipsis: true,
            search: false,
            tip: '过长会自动收缩'
        },
        {
            width: 80,
            search: false,
            colSpan: 0,
            render: (text: any, record: any, _: any, action: any) => (
                <Button
                    size="small"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={async () => {
                        if (!content) {
                            content = await apiRequest.get('/sms/share/getDepartmentAndUser');
                        }
                        setCardContent({ content: content.data, type: 'role' });
                        let list = transformProviderList(record.userList)
                        setDepartment(list);
                        setParentIdTree(record.id);
                        // setCardVisible(true);
                        setUserChooseVisible(true)
                        setRenderData({ record, type: 'sale' })
                    }}
                >
                    绑定
                </Button>
            ),
        },
        {
            title: '绑定新媒体人员',
            dataIndex: 'providerNameList',
            colSpan: 2,
            ellipsis: true,
            search: false,
            tip: '过长会自动收缩'
        },
        {
            width: 80,
            search: false,
            colSpan: 0,
            render: (text: any, record: any, _: any, action: any) => (
                <Button
                    size="small"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={async () => {
                        if (!content) {
                            content = await apiRequest.get('/sms/share/getDepartmentAndUser');
                        }
                        setCardContent({ content: content.data, type: 'role' });
                        let list = transformProviderList(record.providerList)
                        setDepartment(list);
                        setParentIdTree(record.id);
                        setUserChooseVisible(true)
                        setRenderData({ record, type: 'newMedia' })
                    }}
                >
                    绑定
                </Button>
            ),
        },

        {
            title: '描述',
            dataIndex: 'description'
        },

        {
            title: '创建时间',
            dataIndex: 'createTime',
            valueType: 'dateRange',
            sorter: true,
            render: (text: any, record: any) => <span>{record.createTime}</span>
        },
        {
            title: '操作',
            search: false,
            render: (text: any, record: any) => [
                <Space>
                    <a
                        onClick={() => {
                            setRenderData({ record, type: 'eidt' })
                            setModalVisible(true)
                        }}
                    >
                        编辑
                    </a>

                    <Popconfirm
                        key={record.id}
                        title="是否确定删除？"
                        onConfirm={() => {
                            apiRequest.delete(url, { id: record.id }).then((res: any) => {
                                if (res.status == 'success') {
                                    message.success('删除成功');
                                    callbackRef();
                                }
                            });
                        }}
                        okText="删除"
                        cancelText="取消"
                    >
                        <a style={{ color: 'red' }}>
                            删除
                        </a>
                    </Popconfirm>
                </Space>
            ]
        }
    ]
    const getDepartmentUser = async () => {
        const res = await apiRequest.get('/sms/share/getDepartmentAndUser');
        setCardContent(res.data)
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
                        key="button"
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={() => {
                            setRenderData({ type: 'add' })
                            setExpandModalVisible(true)
                        }}
                    >
                        添加拓展信息
                    </Button>,
                    <Button
                        key="button"
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={() => {
                            setRenderData({ type: 'add' })
                            setModalVisible(true)
                        }}
                    >
                        添加资源小组
                    </Button>
                ]}
                dateFormatter="string"
            />
            <Modal
                renderData={renderData}
                visible={modalVisible}
                setVisible={setModalVisible}
                callbackRef={callbackRef}
            />
            <ExpandModal 
                visible={ExpandModalVisible}
                setVisible={setExpandModalVisible}
                callbackRef={callbackRef}
            />

            {UserChooseVisible && (
                <UserChoose
                    UserChooseVisible={UserChooseVisible}
                    CardContent={CardContent}
                    renderData={renderData}
                    departments={department}
                    callbackRef={() => callbackRef()}
                    setUserChooseVisible={() => setUserChooseVisible(false)}
                />
            )}
        </PageContainer>
    </>
}