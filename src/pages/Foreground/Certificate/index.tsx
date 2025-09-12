import { PageContainer } from "@ant-design/pro-layout"
import type { ActionType, ProColumns } from "@ant-design/pro-table"
import { useEffect, useRef, useState } from "react";
import Tables from "@/components/Tables"
import UploadDragger from '@/components/UploadDragger/UploadDragger';
import Dictionaries from '@/services/util/dictionaries';
import request from '@/services/ant-design-pro/apiRequest';
import { Badge, Button, message, Modal, Popconfirm, Space, Tag } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, FileDoneOutlined, PlusOutlined, SyncOutlined } from "@ant-design/icons";
import ModalAdd from "./ModalAdd"
import ModalAddAdmin from "../Certificateadmin/ModalAdd"
import type { ProFormInstance} from "@ant-design/pro-form";
import { ModalForm, ProFormTextArea } from "@ant-design/pro-form";
import UserInfo from "@/pages/Admins/UserManage/UserInfo";
import IsVerifyModel from '../../Admins/StudentManage/isVerifyModel';
import ContractS from "@/pages/Admins/StudentManage/ContractS";
// import Qcodes from "./Qcodes";

export default () => {
    const actionRef = useRef<ActionType>();
    const formRefPhoto = useRef<ProFormInstance>();
    const formRefAuditing = useRef<ProFormInstance>();
    const [renderData, setRenderData] = useState<any>({});
    const [ModalVisible, setModalVisible] = useState<boolean>(false)
    const [ModalVisibleAdmin, setModalVisibleAdmin] = useState<boolean>(false)
    const [ModalAuditingVisible, setModalAuditingVisible] = useState<boolean>(false)
    const [params, setParams] = useState<any>({})
    const [Badges, setBadges] = useState<any>([0, 0]);
    const [userInfoFalg, setUserInfoFalg] = useState<boolean>(false)
    const [IsVerifyModelFalg, setIsVerifyModelVisible] = useState<boolean>(false);
    const [ContractSFalg, setContractSVisible] = useState<boolean>(false);
    const [contractModal, setContractModal] = useState<boolean>(false);
    // const [QcodesFalg, setQcodesFalg] = useState<any>(false);

    const callbackRef = () => {
        // @ts-ignore
        actionRef.current.reload();
        BadgesNumbers()

    };
    const BadgesNumbers = () => {
        request.get('/sms/business/bizCertificateApply/statistics', {
            array: JSON.stringify([
                {
                    'auditConfirm-isNull': true,
                },
                {
                    auditConfirm: true, hasCertificate:
                        false
                }
            ])
        }).then((res) => {
            setBadges(res.data);
        })
    }
    useEffect(() => {
        BadgesNumbers()
    }, [])
    const audits = (falg: boolean, remark: any, id: number) => {
        request.post('/sms/business/bizAudit', { auditType: 10, entityId: id, confirm: falg, remark }).then((res) => {
            if (res.status == 'success') {
                message.success('操作成功');
                setModalAuditingVisible(false);

                callbackRef();
            }
        })
    }
    const otherSignFn = (record: any) => {
        let span: any = ''
        if (record.serviceName) {
            span = <Tag color={'#FF0000'}>未签署</Tag>
            if (record.otherSign) {
                span = <Tag color={'#87d068'}>已签署</Tag>
            }
        }
        return span
    }
    const filing = (record: any) => {
        request.post('/sms/business/bizCertificateApply/filing', { id: record.id }).then((res) => {
            if (res.status == 'success') {
                message.success('操作成功');
                setModalAuditingVisible(false);

                callbackRef();
            }
        })
    }
    const submitok = (values: any, type: string) => {
        const falg = false
        const remark = values.auditRemark
        // values.auditConfirm = true
        return new Promise((resolve) => {
            audits(falg, remark, renderData.id)
        });
    }

    const qianding = async (record: any) => {
        const status = (await request.get('/sms/share/isVerify')).data;
        const autoSign = (await request.get('/sms/share/isVerifyAutoSign')).data;
        if (status && autoSign) {
            setRenderData({ ...record, type: 'staff' })
            setContractSVisible(true);
        } else {
            setRenderData([status, autoSign]);
            setIsVerifyModelVisible(true);
        }
    }
    const columns: ProColumns<API.GithubIssueItem>[] = [
        {
            title: '申请人',
            dataIndex: 'userName',
            key: 'userName',
            width: 80,
            render: (text, record) => (
                <a
                    onClick={async () => {
                        const user = (await request.get('/sms/system/sysUser', { id: record.createBy })).data.content[0]
                        setRenderData({ ...user });
                        setUserInfoFalg(true);
                    }}
                >
                    {record.userName}
                </a>
            )
        },
        {
            title: '申请人部门',
            dataIndex: 'departmentName',
            key: 'departmentName',
            render: (text, record) => (
                <span>
                    {Dictionaries.getDepartmentName(record.departmentId).join('-')}
                    {/* {record.departmentName} */}
                </span>
            ),
        },
        {
            title: '证书种类',
            dataIndex: 'kind',
            key: 'kind',
            valueType: 'select',
            filters: true,
            filterMultiple: false,
            valueEnum: Dictionaries.getSearch('certificateKind'),
            render: (text, record) => (
                <span>
                    {Dictionaries.getName('certificateKind', record.kind)}
                </span>
            ),
        },
        {
            title: '费用类型',
            dataIndex: 'chargeType',
            key: 'chargeType',
            valueType: 'select',
            filters: true,
            filterMultiple: false,
            valueEnum: Dictionaries.getSearch('ExpenseType'),
            render: (text, record) => (
                <span>
                    {Dictionaries.getName('ExpenseType', record.chargeType)}
                </span>
            ),
        },
        {
            title: '申请时间',
            key: 'showTime',
            dataIndex: 'createTime',
            valueType: 'dateTime',
            // sorter: true,
            search: false,
        },
        {
            title: '申请备注',
            dataIndex: 'remark',
            key: 'remark',
            search: false,
            ellipsis: true,
            tip: '备注过长会自动收缩',
        },
        {
            title: '培训开始时间',
            key: 'startTime',
            dataIndex: 'startTime',
            valueType: 'dateTime',
            // sorter: true,
            search: false,
        },
        {
            title: '培训结束时间',
            key: 'endTime',
            dataIndex: 'endTime',
            valueType: 'dateTime',
            // sorter: true,
            search: false,
        },
        {
            title: '审核状态',
            dataIndex: 'auditConfirm',
            key: 'auditConfirm',
            render: (text, record) => (
                <span>
                    {
                        record.auditConfirm === null ? <Tag icon={<SyncOutlined spin />} color={'#f50'}>审核中</Tag> : record.auditConfirm === false ? <Tag color={'#FF0000'} icon={<CloseCircleOutlined />}>审核未通过</Tag> : <Tag color={'#87d068'} icon={<CheckCircleOutlined />}>已通过</Tag>
                    }
                </span>
            ),
        },

        {
            title: '审核建议',
            dataIndex: 'auditRemark',
            key: 'auditRemark',
            search: false,
            hideInTable: params.auditConfirm !== false,
            ellipsis: true,
            tip: '备注过长会自动收缩',
        },
        {
            title: '合同',
            dataIndex: 'num',
            key: 'num',
            render: (text, record) => (
                <a onClick={() => {
                    setRenderData({ viewUrl: record.viewUrl })
                    setContractModal(true)
                }}>查看</a>
            )
        },
        {
            title: '签署状态',
            dataIndex: 'otherSign',
            key: 'otherSign',
            render: (text, record) => (
                <span>{otherSignFn(record)}</span>
            )
        },
        {
            title: '归档编号',
            dataIndex: 'filingNum'
        },
        {
            title: '操作',
            search: false,
            width: 180,
            render: (text, record) => [

                <Space>
                    <a
                        onClick={() => {
                            setRenderData({ ...record, type: 'eidt' })
                            setModalVisible(true)
                        }}
                    >
                        编辑
                    </a>
                    <Popconfirm
                        title="审核"
                        okText="通过"
                        key="look-certificate"
                        cancelText="未通过"
                        onConfirm={(e) => {
                            // callbackRef();
                            e?.stopPropagation();
                            setRenderData({ ...record, type: 'Auditing' })
                            audits(true, '', record.id)
                        }}
                        onCancel={() => {
                            setRenderData({ ...record, type: 'Auditing' })
                            setModalAuditingVisible(true)
                        }}
                    >
                        <a hidden={record.auditConfirm !== null}> 行政审核</a>
                    </Popconfirm>
                    <a onClick={() => {
                        setRenderData({ userName: record.userName, kind: record.kind, type: 'eidt', applyId: record.id, typeName: 'cert' })
                        setModalVisibleAdmin(true);
                    }}>
                        上传证书
                    </a>
                    <a onClick={() => qianding(record)} hidden={record.filingNum}>
                        签订协议
                    </a>
                    <Popconfirm
                        title="合同归档"
                        okText="归档"
                        key="filing"
                        cancelText="取消"
                        onConfirm={(e) => {
                            filing(record)
                        }}
                        onCancel={() => {
                        }}
                    >
                        <a
                            hidden={record.filingNum}
                        >
                            合同归档
                        </a>
                    </Popconfirm>
                    {/* <Popconfirm
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
                    </Popconfirm> */}
                </Space>
            ]
        }
    ]
    const sortList: any = {
        ['createTime']: 'desc',
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
                    key: '-isNull',
                    label: (
                        <Badge count={Badges[0]} size="small" offset={[5, 3]}>
                            <span>未审核</span>
                        </Badge>
                    ),
                },
                {
                    key: 'true',
                    label: (
                        <Badge count={Badges[1]} size="small" offset={[5, 3]}>
                            <span>审核通过待下证</span>
                        </Badge>
                    ),
                },
                {
                    key: 'false',
                    label: (
                        <span>未通过</span>
                    ),
                },
                {
                    key: 'enableFalse',
                    label: (
                        <span>已上传证书</span>
                    ),
                },
            ],
            onChange: (key: any) => {
                if (key == 'all') {
                    setParams({});
                } else if (key == '-isNull') {
                    setParams({ 'auditConfirm-isNull': true, });
                } else if (key == 'true') {
                    setParams({ auditConfirm: true, hasCertificate: false });
                } else if (key == 'false') {
                    setParams({ auditConfirm: false });
                } else if (key == 'enableFalse') {
                    setParams({ hasCertificate: true });
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
                request={{ url: '/sms/business/bizCertificateApply', sortList, params }}
                toolBarRender={[
                    <Button
                        key="add-certificate"
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={() => {

                            setRenderData({ type: 'add' })
                            setModalVisible(true);
                        }}
                    >
                        新增申请
                    </Button>,
                ]}
                search={{ defaultCollapsed: false, labelWidth: 120 }}
            />
            {ModalVisible && (
                <ModalAdd
                    setModalVisible={() => setModalVisible(false)}
                    modalVisible={ModalVisible}
                    callbackRef={() => callbackRef()}
                    renderData={renderData}
                />
            )}
            {ModalVisibleAdmin && (
                <ModalAddAdmin
                    setModalVisible={() => setModalVisibleAdmin(false)}
                    modalVisible={ModalVisibleAdmin}
                    callbackRef={() => callbackRef()}
                    renderData={renderData}
                />
            )}
            <ModalForm
                title='审核决议'
                formRef={formRefAuditing}
                visible={ModalAuditingVisible}
                modalProps={{
                    destroyOnClose: true,
                    maskClosable: false,
                    onCancel: () => {
                        setModalAuditingVisible(false);

                    },
                }}
                onFinish={async (values) => {
                    if (renderData.id) values.id = renderData.id;
                    await submitok(values, 'Auditing');
                    // message.success('提交成功');

                }}
            >
                <ProFormTextArea label='审核建议' name='auditRemark' />
            </ModalForm>
            <Modal
                title='查看合同'
                open={contractModal}
                onCancel={() => setContractModal(false)}
                width={1000}
            >
                <iframe src={renderData.viewUrl} style={{ width: '100%', height: '600px' }} />

            </Modal>
            {userInfoFalg && (
                <UserInfo
                    setModalVisible={() => setUserInfoFalg(false)}
                    modalVisible={userInfoFalg}
                    callbackRef={() => callbackRef()}
                    renderData={renderData}
                />
            )}
            {IsVerifyModelFalg && (
                <IsVerifyModel
                    modalVisible={IsVerifyModelFalg}
                    setModalVisible={() => setIsVerifyModelVisible(false)}
                    renderData={renderData}
                />
            )}
            {ContractSFalg && (
                <ContractS
                    setModalVisible={() => setContractSVisible(false)}
                    modalVisible={ContractSFalg}
                    renderData={renderData}
                    callbackRef={() => callbackRef()}
                // callback={() => oncancel()}
                // admin={admin}
                />
            )}
            {/* {
                QcodesFalg && <Qcodes
                    setModalVisible={() => setQcodesFalg(false)}
                    modalVisible={QcodesFalg}
                    renderData={renderData}
                    callbackRef={() => callbackRef()}
                />
            } */}
        </PageContainer>
    )

}