import Tables from "@/components/Tables";
import apiRequest from "@/services/ant-design-pro/apiRequest";
import dictionaries from "@/services/util/dictionaries";
import { getCompanyRequest } from "@/services/util/util";
import { PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from "@ant-design/pro-table";
import { Button, message, Popconfirm, Switch } from "antd";
import { useEffect, useRef, useState } from "react";
import Edit from "./edit";


export default () => {
    const actionRef = useRef<ActionType>();
    const [renderData, setRenderData] = useState<any>();
    const [editVisible, setEditVisible] = useState<boolean>();
    const [switchLoding, setSwitchLoding] = useState<boolean>(false);
    const callbackRef = () => {
        actionRef.current?.reload();
    };
    const columns: ProColumns<any>[] = [
        {
            title: '公司名称',
            dataIndex: 'companyId',
            valueType: 'select',
            request: getCompanyRequest
        },
        {
            title: '银行名称',
            dataIndex: 'name',
        },
        {
            title: '银行类型',
            dataIndex: 'type',
            valueType: 'select',
            valueEnum: dictionaries.getSearch('bankType')
        },
        {
            title: '收付款方式',
            dataIndex: 'method',
            valueType: 'select',
            valueEnum: dictionaries.getSearch('dict_stu_refund_type')
        },
        {
            title: '应用ID',
            dataIndex: 'appid',
            sorter: true,
        },
        {
            title: '启用状态',
            dataIndex: 'enable',
            search: false,
            render: (text, record) => (
                <Switch
                    key={record.id}
                    checkedChildren="已启用"
                    unCheckedChildren="已禁用"
                    defaultChecked={record.enable}
                    loading={switchLoding}
                    onChange={async () => {
                        setSwitchLoding(true);
                        await apiRequest.post('/sms/system/sysBank', {
                            id: record.id,
                            enable: !record.enable,
                        });
                        setSwitchLoding(false);
                        callbackRef();
                    }}
                />
            ),
        },
        {
            title: '操作',
            dataIndex: 'options',
            search: false,
            render: (text, record) => [
                <Button
                    key="eidt"
                    type="primary"
                    size="small"
                    style={{ marginRight: '15px' }}
                    onClick={() => {
                        setRenderData(record);
                        setEditVisible(true);
                    }}
                >
                    编辑
                </Button>,
                <Popconfirm
                    title="是否删除"
                    okText="删除"
                    key="delete"
                    cancelText="取消"
                    onConfirm={() => {
                        apiRequest.delete('/sms/system/sysBank', { id: record.id }).then((res: any) => {
                            if (res.status == 'success') {
                                message.success('操作成功!');
                                callbackRef();
                            }
                        });
                    }}
                >
                    <Button key="delete" type="primary" size="small" danger>
                        删除
                    </Button>
                </Popconfirm>
            ],
        },
    ];
    return <>
        <Tables
            actionRef={actionRef}
            columns={columns}
            request={{ url: '/sms/system/sysBank' }}
            toolBarRender={[
                <Button
                    key="button"
                    icon={<PlusOutlined />}
                    type="primary"
                    onClick={() => {
                        setRenderData({});
                        setEditVisible(true);
                        //   setModalVisible(true);
                    }}
                >
                    新建
                </Button>,
            ]}
        />
        <Edit
            renderData={renderData}
            visible={editVisible}
            setVisible={setEditVisible}
            callbackRef={callbackRef}
        />
    </>
}