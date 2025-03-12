import Tables from "@/components/Tables"
import apiRequest from "@/services/ant-design-pro/apiRequest"
import Preview from "@/services/util/preview"
import look from "@/services/util/viewLook"
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons"
import { ActionType } from "@ant-design/pro-table"
import { Button, message, Popconfirm, Space } from "antd"
import moment from "moment"
import { useRef, useState } from "react"
import Modal from "./edit"

export default () => {
    const actionRef = useRef<ActionType>();
    const callbackRef = () => actionRef.current?.reload()
    const [modalVisible, setModalVisible] = useState<boolean>(false)
    const [renderData, setRenderData] = useState<any>({});
    const [previewurl, setPreviewurl] = useState<any>();
    const [previewVisible, setPreviewVisible] = useState<boolean>(false);
    const url = '/sms/business/bizAgreement'
    const columns = [
        {
            title: '老师',
            dataIndex: 'personName'
        },
        {
            title: '项目',
            dataIndex: 'project'
        },
        {
            title: '金额',
            dataIndex: 'amount',
            valueType: 'money',
            sorter: true,
        },
        {
            title: '开始时间',
            dataIndex: 'startDate',
            valueType: 'dateRange',
            sorter: true,
            render: (text: any, record: any) => <span>{record.startDate}</span>
        },
        {
            title: '结束时间',
            dataIndex: 'endDate',
            valueType: 'dateRange',
            sorter: true,
            render: (text: any, record: any) => <span>{record.endDate}</span>
        },
        {
            title: '备注',
            dataIndex: 'remark',
            valueType: 'textarea'
        },
        {
            title: '协议文件',
            dataIndex: 'file',
            search: false,
            render(text: any, record: any) {
                return <Space>
                    {
                        record.file?.split(',').map((items: any, indexs: number) => {
                            return (
                                <a
                                    onClick={() => {
                                        look(
                                            record.id,
                                            items,
                                            '/sms/business/bizAgreement/download',
                                            setPreviewurl,
                                            setPreviewVisible,
                                        );
                                    }}
                                >
                                    协议文件{indexs == 0 ? '' : indexs + 1}
                                </a>
                            );
                        })
                    }
                </Space>
            }
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
                            setRenderData(record)
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
    return <>
        <Tables
            columns={columns}
            actionRef={actionRef}
            request={{ url: url }}
            toolBarRender={[
                <Button
                    icon={<PlusOutlined />}
                    type="primary"
                    onClick={() => {
                        setRenderData({})
                        setModalVisible(true);
                    }}
                >
                    新增服务协议
                </Button>,
            ]}
        />
        <Modal
            renderData={renderData}
            visible={modalVisible}
            setVisible={setModalVisible}
            callbackRef={callbackRef}
        />
        <Preview
            imgSrc={previewurl}
            isModalVisibles={previewVisible}
            setisModalVisibles={(e: boolean | ((prevState: boolean) => boolean)) =>
                setPreviewVisible(e)
            }
        />
    </>
}