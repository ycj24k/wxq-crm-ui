import React, { useEffect, useRef, useState } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import Dictionaries from '@/services/util/dictionaries';
import Tables from '@/components/Tables';
// import IsVerifyModel from './isVerifyModel';
import { useModel, history } from 'umi';
import { Button } from 'antd'
import filter from '@/services/util/filter';
import './index.less'
import { PlusOutlined } from '@ant-design/icons';
type GithubIssueItem = {
    name: string;
    mobile: string;
    sex: number;
    receiveNum: number;
    id: number;
    studentId: number;
    url: string;
    enable: boolean;
    isVisit: boolean;
    isPeer: boolean;
    source: string;
    studentSource: string;
    type: string | number;
    isFormal: boolean;
    createTime: any;
    consultationTime: any;
    circulationTime: any;
    presentationTime: any;
    idCard: string;
    project: string;
    userId: number;
    code: any;
    visitTime: any;
    dealDate: any;
    lastDealTime: any;
    ownerName: string;
    percent: number;
    weChat: string;
    qq: string;
};
export default (props: any) => {
    const {
        type,
        isFormal = false,
        StudentMessage,
        setOrderModalVisible,
    } = props;
    const actionRef = useRef<ActionType>();
    const [paramsA, setparamsA] = useState<any>({});
    const { initialState } = useModel('@@initialState');
    const url = '/sms/business/bizStudentUser';
    const formRef = useRef<ProFormInstance>();
    useEffect(() => {
        callbackRef();
    }, [type]);
    useEffect(() => {
        formRef.current?.setFieldsValue(history.location.query);
        setparamsA(history.location.query);
    }, []);
    const callbackRef = () => {
        actionRef?.current?.reload();
        // @ts-ignore
        actionRef?.current?.clearSelected();
    };
    const columns: ProColumns<GithubIssueItem>[] = [
        {
            title: '名称',
            dataIndex: 'name',
            align: 'center',
            key: 'name',
        },
        {
            title: '咨询岗位',
            dataIndex: 'project-in',
            sorter: true,
            key: 'project-in',
            valueType: 'select',
            ellipsis: true,
            fieldProps: {
                options: Dictionaries.getCascader('dict_reg_job'),
                showSearch: { filter },
                mode: 'tags',
            },
            render: (text, record) => (
                <span>{Dictionaries.getCascaderName('dict_reg_job', record.project)}</span>
            ),
        },
        {
            title: '手机号',
            dataIndex: 'mobile',
            key: 'mobile'
        },
        {
            title: '微信号',
            dataIndex: 'weChat',
            key: 'weChat',
            hideInTable: isFormal,
            width: 100,
            render: (text, record) => <span style={{ userSelect: 'none' }}>{record.weChat}</span>,
        },
        {
            title: 'QQ',
            dataIndex: 'qq',
            key: 'qq',
            hideInTable: isFormal,
            width: 100,
            render: (text, record) => <span style={{ userSelect: 'none' }}>{record.qq}</span>,
        },
        {
            title: '身份证',
            dataIndex: 'idCard',
            key: 'idCard',
            hideInTable: true,
        },
        {
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
            title: '所属老师',
            dataIndex: 'userName',
        },
        {
            title: '信息所有人',
            dataIndex: 'ownerName'
        },
        {
            title: '信息提供人',
            dataIndex: 'providerName',
        }
    ];
    const params: any = {
        isPay: true,
        isFormal: true,
        'userId-isNull': false,
        type: 0,
        _orderBy: 'isPay,isFormal,createTime',
        _direction: 'asc,asc,desc',
        _page: 0,
        _size: 10
    };

    const sortList: any = {};
    Object.assign(params, paramsA);
    return (
        <>
            <Tables
                columns={columns}
                className="student"
                actionRef={actionRef}
                formRef={formRef}
                cardBordered
                scroll={{ x: 1500 }}
                search={{
                    labelWidth: 120,
                    defaultCollapsed: true,
                }}
                onReset={() => {
                    setparamsA({});
                }}
                toolbar={toolbar}
                toolBarRender={[
                    <Button
                        key="add-formal-student"
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setOrderModalVisible(true);
                        }}
                    >
                        新建学员
                    </Button>
                ]}
                request={
                    { url: url, params: params, sortList: sortList }
                }
                rowSelection={{
                    type: 'radio',
                    onSelect: StudentMessage
                }}
            />

        </>
    );
};