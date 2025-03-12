import { PageContainer } from "@ant-design/pro-layout"
import { ActionType, ProColumns } from "@ant-design/pro-table"
import { useEffect, useRef, useState } from "react";
import Tables from "@/components/Tables"
import Dictionaries from '@/services/util/dictionaries';
import request from '@/services/ant-design-pro/apiRequest';
import { Badge, Button, message, Popconfirm, Space, Tag } from "antd";
import Preview from '@/services/util/preview';
import look from '@/services/util/viewLook';
import ModalAdd from "./ModalAdd"
import UserInfo from "@/pages/Admins/UserManage/UserInfo";
import { PlusOutlined } from "@ant-design/icons";
import DownTable from '@/services/util/timeFn';
import DownHeader from "./DownHeader";

export default () => {
    const actionRef = useRef<ActionType>();
    const [renderData, setRenderData] = useState<any>({});
    const [ModalVisible, setModalVisible] = useState<boolean>(false)
    const [params, setParams] = useState<any>({ enable: true })
    const [previewurl, setPreviewurl] = useState<any>();
    const [PreviewVisibles, setPreviewVisibles] = useState<boolean>(false);
    const [userInfoFalg, setUserInfoFalg] = useState<boolean>(false)
    const [selectedRowsList, setselectedRowsList] = useState<any>([]);

    const callbackRef = () => {
        // @ts-ignore
        actionRef.current.reload();

    };
    const filesDom = (value: any) => {

        let dom = <span></span>
        if (value) {
            dom = value.file?.split(',').map((items: any, indexs: number) => {
                return (
                    <div key={indexs} className="notice-files">
                        <a
                            onClick={() => {
                                look(
                                    value.id,
                                    items,
                                    '/sms/business/bizCertificate/download',
                                    setPreviewurl,
                                    setPreviewVisibles,
                                );
                            }}
                        >
                            证书附件{indexs}
                        </a>
                    </div>
                );
            })
        }
        return dom
    }
    const donwLoad = (id: string) => {
        let tokenName: any = sessionStorage.getItem('tokenName');
        let tokenValue = sessionStorage.getItem('tokenValue');
        let obj = {};
        obj[tokenName] = tokenValue;
        fetch('/sms/business/bizCertificate/export?idList=' + id, {
            method: 'GET',
            headers: { ...obj },
        }).then((res: any) => {
            res.blob().then((ress: any) => {
                let blobUrl = window.URL.createObjectURL(ress);
                const a = document.createElement('a'); //获取a标签元素
                document.body.appendChild(a);
                let filename = '附件'; //设置文件名称
                a.href = blobUrl; //设置a标签路径
                a.download = filename;
                a.target = '_blank';
                a.click();
                a.remove();
                callbackRef();
            });
        });
    };
    const columns: ProColumns<API.GithubIssueItem>[] = [
        {
            title: '持有人',
            dataIndex: 'userName',
            key: 'userName',
            sorter: true,
            render: (text, record) => (
                <span>
                    {
                        record.userId ? <a
                            onClick={async () => {
                                const user = (await request.get('/sms/system/sysUser', { id: record.createBy })).data.content[0]
                                setRenderData({ ...user });
                                setUserInfoFalg(true);
                            }}
                        >
                            {record.userName}
                        </a> : <span>{record.userName}</span>
                    }



                </span>

            )
        },
        {
            title: '持有人部门',
            dataIndex: 'departmentName',
            key: 'departmentName',
            sorter: true,
            render: (text, record) => (
                <span>
                    {Dictionaries.getDepartmentName(record.departmentId).join('-')}
                    {/* {record.departmentName} */}
                </span>
            ),
        },
        {
            title: '证书编号',
            dataIndex: 'num',
            sorter: true,
        },
        {
            title: '证书种类',
            dataIndex: 'kind',
            key: 'kind',
            valueType: 'select',
            sorter: true,
            filters: true,
            filterMultiple: false,
            valueEnum: Dictionaries.getSearch('certificateKind'),
            render: (text, record) => (
                <span >
                    {Dictionaries.getName('certificateKind', record.kind)}
                </span>
            ),
        },
        {
            title: '证书照片',
            key: 'file',
            dataIndex: 'file',
            render: (text, record) => (
                <span>
                    {
                        filesDom(record)
                    }
                </span>
            )
        },
        {
            title: '证书备注',
            dataIndex: 'remark',
            key: 'remark',
            sorter: true,
        },
        {
            title: '上交时间',
            key: 'uploadTime',
            dataIndex: 'uploadTime',
            valueType: 'dateTime',
            sorter: true,
            search: false,
        },
        {
            title: '最近归还时间',
            key: 'returnTime',
            dataIndex: 'returnTime',
            valueType: 'dateTime',
            sorter: true,
            search: false,
        },
        {
            title: '最近外带时间',
            key: 'takeTime',
            dataIndex: 'takeTime',
            valueType: 'dateTime',
            sorter: true,
            search: false,
        },
        {
            title: '最后更新时间',
            key: 'updateTime',
            dataIndex: 'updateTime',
            valueType: 'dateTime',
            sorter: true,
            search: false,
        },

        {
            title: '操作',
            search: false,
            width: 180,
            render: (text, record) => [
                <Space>
                    <a
                        onClick={() => {
                            setRenderData({ ...record, type: 'eidt', typeAdmin: true })
                            setModalVisible(true)
                        }}
                    >
                        更新证书状态
                    </a>
                    <Popconfirm
                        title="是否废除"
                        okText="废除"
                        key="delete"
                        cancelText="取消"
                        onConfirm={(e) => {
                            // callbackRef();
                            e?.stopPropagation();
                            request.post('/sms/business/bizCertificate/disable/' + record.id).then((res: any) => {
                                if (res.status == 'success') {
                                    message.success('废除成功');
                                    callbackRef();
                                }
                            });
                        }}
                    >
                        <a style={{ color: 'red' }}>废除</a>
                    </Popconfirm>
                </Space>
            ]
        }
    ]
    let sortList: any = {
        ['createTime,num']: 'desc,desc',
    };
    let toolbar = undefined;
    toolbar = {
        menu: {
            type: 'tab',
            items: [
                {
                    key: 'all',
                    label: (
                        <span>全部</span>
                    ),
                },
                {
                    key: 'false',
                    label: (
                        <span>已废除</span>
                    ),
                },

            ],
            onChange: (key: any) => {
                if (key == 'all') {
                    setParams({ enable: true });
                } else {
                    setParams({ enable: false });
                }

                callbackRef();
            },
        }
    }
    return (
        <PageContainer>
            <Tables
                className="Certificate"
                columns={columns}
                actionRef={actionRef}
                toolbar={toolbar}
                request={{ url: '/sms/business/bizCertificate', sortList, params }}
                search={{ defaultCollapsed: false, labelWidth: 120 }}
                toolBarRender={[
                    <Button
                        key="buttonq"
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={() => {

                            setRenderData({ type: 'add' })
                            setModalVisible(true);
                        }}
                    >
                        新增证书
                    </Button>,
                ]}
                rowSelection={{
                    onChange: (e, selectedRows) => {
                        setselectedRowsList(selectedRows as []);
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
                                    console.log('selectedRowKeys', selectedRows);
                                    DownTable(selectedRows, DownHeader, '证书列表信息')
                                }}
                            >
                                导出列表
                            </a>
                            <a
                                onClick={() => {

                                    const idList = selectedRowKeys.length > 0 ? selectedRowKeys.join(',') : ''
                                    donwLoad(idList)
                                }}
                            >
                                导出证书
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
            {PreviewVisibles && (
                <Preview
                    imgSrc={previewurl}
                    isModalVisibles={PreviewVisibles}
                    setisModalVisibles={(e: boolean | ((prevState: boolean) => boolean)) =>
                        setPreviewVisibles(e)
                    }
                />
            )}
            {userInfoFalg && (
                <UserInfo
                    setModalVisible={() => setUserInfoFalg(false)}
                    modalVisible={userInfoFalg}
                    callbackRef={() => callbackRef()}
                    renderData={renderData}
                />
            )}
        </PageContainer>
    )

}