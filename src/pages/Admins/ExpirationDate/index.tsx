import { useRef, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Table, Space, Popconfirm, message } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import request from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import Modals from './Modals';
import filter from '@/services/util/filter';

export default (props: any) => {
    const [renderData, setRenderData] = useState<any>(null);
    const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
    const [deletId, setDeletId] = useState('');
    const actionRef = useRef<ActionType>();
    const url = '/sms/business/bizEffectiveConfig';
    type GithubIssueItem = {
        url: string;
        uri: string;
        id: number;
        project: string;
        type: string;
        cluesValidityPeriod: string;
        allocationValidityPeriod: string;
    };
    const callbackRef = () => {
        // @ts-ignore
        actionRef.current.reload();
    };
    const columns: ProColumns<GithubIssueItem>[] = [
        {
            title: '项目总称',
            dataIndex: 'parentProjects',
            key: 'parentProjects',
            sorter: true,
            valueType: 'cascader',
            fieldProps: {
                options: Dictionaries.getList('dict_reg_job'),
                showSearch: { filter },
            },
            render: (text, record) => (
                <span key="parentProjects">
                    {Dictionaries.getCascaderAllName('dict_reg_job', record.project)}
                </span>
            ),
        },
        // {
        //     title: '岗位名称',
        //     dataIndex: 'project',
        //     key: 'project',
        //     valueType: 'cascader',
        //     fieldProps: {
        //         options: Dictionaries.getCascader('dict_reg_job'),
        //         showSearch: { filter },
        //     },
        //     render: (text, record) => <>{Dictionaries.getCascaderName('dict_reg_job', record.project)}</>,
        // },
        {
            title: '线索有效期(天)',
            dataIndex: 'cluesValidityPeriod',
            key: 'cluesValidityPeriod',
            render: (text, record) => <span>{'' + record.cluesValidityPeriod + '天'}</span>,
        },
        {
            title: '分成有效期(天)',
            dataIndex: 'allocationValidityPeriod',
            key: 'allocationValidityPeriod',
            render: (text, record) => <span>{'' + record.allocationValidityPeriod + '天'}</span>,
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            width: 200,
            render: (text, record, _, action) => (
                <>
                    <Button
                        key="editable"
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        style={{ marginRight: '10px', marginBottom: '8px' }}
                        onClick={() => {
                            setRenderData({ ...record, types: 'edit' });
                            setModalVisible(true);
                        }}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        key={record.id}
                        title="是否确定删除？"
                        onConfirm={() => {
                            request.delete(url, { id: record.id }).then((res: any) => {
                                if (res.status == 'success') {
                                    message.success('删除成功');
                                    callbackRef();
                                }
                            });
                        }}
                        okText="删除"
                        cancelText="取消"
                    >
                        <Button key="delete" size="small" type="primary" danger icon={<DeleteOutlined />}>
                            删除
                        </Button>
                    </Popconfirm>
                </>
            ),
        },
    ];
    return (
        <>
            <ProTable<GithubIssueItem>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (
                    params: { name?: string; mobile?: string; current?: any; project?: string } = {},
                    sort,
                    filter,
                ) => {
                    const dataList: any = await request.get(url, params);
                    return {
                        data: dataList.data.content,
                        success: dataList.success,
                        total: dataList.data.totalElements,
                    };
                }}
                rowKey="id"
                search={{
                    labelWidth: 'auto',
                }}
                pagination={{
                    pageSize: 10,
                }}
                rowSelection={{
                    // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
                    // 注释该行则默认不显示下拉选项
                    selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                    onChange: (e, selectedRows) => {
                        setDeletId(e.join(','));
                    },
                }}
                tableAlertOptionRender={() => {
                    return (
                        <Space size={16}>
                            <Popconfirm
                                title="是否批量删除？"
                                okText="删除"
                                onConfirm={() => {
                                    
                                    request
                                        .delete('/sms/business/bizEffectiveConfig', { ids: deletId })
                                        .then((res: any) => {
                                            if (res.status == 'success') {
                                                message.success('删除成功');
                                                callbackRef();
                                            }
                                        });
                                }}
                            >
                                <a>批量删除</a>
                            </Popconfirm>
                        </Space>
                    );
                }}
                dateFormatter="string"
                toolBarRender={() => [
                    <Button
                        key="button"
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={() => {
                            setRenderData({ type: 'order', orderNumber: 0 });
                            setModalVisible(true);
                        }}
                    >
                        新建有效期
                    </Button>
                ]}
            />
            {modalVisibleFalg && (
                <Modals
                    setModalVisible={() => setModalVisible(false)}
                    modalVisible={modalVisibleFalg}
                    callbackRef={() => callbackRef()}
                    renderData={renderData}
                    // admin={admin}
                    url={url}
                />
            )}
        </>
    );
};
