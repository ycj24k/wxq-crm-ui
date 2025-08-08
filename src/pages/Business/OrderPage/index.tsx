import ProCard from '@ant-design/pro-card';
import { PageContainer } from '@ant-design/pro-layout';
import ProForm, {
    ProFormList,
    ProFormText,
    ProFormInstance,
    ProFormSelect,
    ProFormCascader,
    ModalForm,
    ProFormGroup,
    ProFormTextArea
} from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Radio, RadioChangeEvent, } from 'antd';
import { useRef, useState } from 'react';
import Dictionaries from '@/services/util/dictionaries';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import request from '@/services/ant-design-pro/apiRequest';
import UserTreeSelect from '@/components/ProFormUser/UserTreeSelect';
import OrderClassType from './orderClassType'
import OrderPayWay from './orderPayWay'
export default () => {
    const formRef = useRef<ProFormInstance>();
    const [findStudent, setFindStudent] = useState<boolean>(false)
    const [modalStudentInfo, setModalStudentInfo] = useState<boolean>(false)
    const [modalOrderVisible, setModalOrderVisible] = useState<boolean>(false)
    const [type, setType] = useState<string>('0')
    const [steps, setSteps] = useState<any>(1)

    const userRef: any = useRef(null);
    const userRefs: any = useRef(null);
    const userRef2: any = useRef(null);
    const [userNameId, setUserNameId] = useState<any>();
    const [userNameIds, setUserNameIds] = useState<any>();
    const [userNameId2, setUserNameId2] = useState<any>();

    const actionRef = useRef<ActionType>();
    const classListRef = useRef<{ handleChangeData: (data: any) => any[] }>(null);
    const payWayRef = useRef<{
        getFormValues: () => Promise<any>;
        addPayWayItem?: () => void;
        removePayWayItem?: (index: number) => void;
        resetPayWay: () => void;
    }>(null);
    const setRadio = (e: RadioChangeEvent) => {
        setSteps(e.target.value)
    }
    let params: any = {
        isPay: true,
        isFormal: true,
        'userId-isNull': false,
        type: 0,
        _orderBy: 'isPay,isFormal,createTime',
        _direction: 'asc,asc,desc',
        _page: 0,
        _size: 10,
    };
    let sortList: any = {}
    const url = '/sms/business/bizStudentUser'
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
        qq: string;
    };
    const columns: ProColumns<GithubIssueItem>[] = [
        {
            width: 100,
            fixed: 'left',
            title: '学员',
            dataIndex: 'name',
            align: 'center',
            key: 'name',
            search: false
        },
        {
            title: '手机号',
            dataIndex: 'mobile',
            key: 'mobile',
            width: 130,
        },
        {
            width: 90,
            title: '所属老师',
            dataIndex: 'userName',
            search: false
        },
        {
            width: 100,
            title: '信息所有人',
            dataIndex: 'ownerName',
            render: (text, record) => <div>{record.ownerName}<span>{record.ownerName && '(' + (record.percent * 100) + '%)'}</span></div>,
            search: false
            // search: true,
            // key: 'ownerName',
            // hideInTable: !recommend,
        },
        {
            width: 100,
            title: '信息提供人',
            dataIndex: 'providerName',
            search: false
        },
        {
            width: 100,
            title: '客户来源',
            dataIndex: 'studentSource',
            valueType: 'select',
            key: 'studentSource',
            search: false,
            filters: true,
            filterMultiple: false,
            valueEnum: Dictionaries.getSearch('dict_source'),
            render: (text, record) => (
                <span>{Dictionaries.getName('dict_source', record.studentSource)}</span>
            ),
        },
        {
            width: 100,
            title: '咨询岗位',
            dataIndex: 'project-in',
            search: false,
            sorter: true,
            key: 'project-in',
            valueType: 'select',
            fieldProps: {
                options: Dictionaries.getCascader('dict_reg_job'),
                //showSearch: { filter },
                mode: 'tags',
            },
            render: (text, record) => (
                <span>{Dictionaries.getCascaderName('dict_reg_job', record.project)}</span>
            ),
        },
        {
            title: '性别',
            dataIndex: 'sex',
            width: 70,
            search: false,
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
            title: '项目总称',
            dataIndex: 'parentProjects',
            search: false,
            key: 'parentProjects',
            sorter: true,
            valueType: 'select',
            fieldProps: {
                options: Dictionaries.getList('dict_reg_job'),
                mode: 'tags',
            },
            width: 100,
            render: (text, record) => (
                <span key="parentProjects">
                    {Dictionaries.getCascaderAllName('dict_reg_job', record.project)}
                </span>
            ),
        },


        {
            title: 'QQ',
            dataIndex: 'qq',
            search: false,
            key: 'qq',
            width: 100,
            render: (text, record) => <span style={{ userSelect: 'none' }}>{record.qq}</span>,
        },
        {
            title: '身份证',
            search: false,
            dataIndex: 'idCard',
            key: 'idCard',
            hideInTable: true,
        },
        {
            title: '信用代码',
            search: false,
            dataIndex: 'code',
            key: 'code',
            hideInTable: true,
        },
        {
            title: '是否是同行企业',
            dataIndex: 'isPeer',
            // width: 80,
            search: false,
            valueType: 'select',
            key: 'isPeer',
            valueEnum: {
                false: '否',
                true: '是',
            },
            hideInTable: true,
        },
        // {
        //     // title: '手机号',
        //     dataIndex: 'isFormal',
        //     search: false,
        //     key: 'isFormal',
        //     // width: 80,
        //     hideInTable: !admin,
        //     render: (text, record) => (
        //         <span style={{ color: record.isFormal ? 'rgb(0,172,132)' : 'red' }}>
        //             {record.isFormal ? '正式' : '潜在'}
        //         </span>
        //     ),
        // },
        {
            width: 100,
            title: '资源类型',
            dataIndex: 'source',
            valueType: 'select',
            search: false,
            key: 'source',
            filters: true,
            filterMultiple: false,
            valueEnum: Dictionaries.getSearch('circulationType'),
            render: (text, record) => (
                <span>{Dictionaries.getName('circulationType', record.source)}</span>
            ),
        },
        // {
        //     width: 100,
        //     title: '接收信息负责人',
        //     dataIndex: 'userName',
        //     key: 'userNames',
        //     search: false,
        //     hideInTable: !recommend,
        // },
        // {
        //     width: 110,
        //     title: '信息提供人所占业绩比例(%)',
        //     sorter: true,
        //     dataIndex: 'percent',
        //     hideInTable: !recommend,
        //     render: (text, record) => <span key="parentProjects">{record.percent * 100}%</span>,
        // },
        {
            width: 100,
            title: '领取时间',
            search: false,
            key: 'receiveTime',
            dataIndex: 'circulationTime',
            valueType: 'dateRange',
            sorter: true,
            render: (text, record) => (
                <span>{record.circulationTime}</span>
            ),
        },
        {
            width: 100,
            title: '介绍时间',
            search: false,
            key: 'createTime',
            dataIndex: 'createTimes',
            valueType: 'dateRange',
            sorter: true,
            render: (text, record) => (
                <span>{record.createTime}</span>
            ),
        },
        {
            width: 100,
            title: '创建时间',
            key: 'createTime',
            search: false,
            dataIndex: 'createTime',
            valueType: 'dateRange',
            sorter: true,
            render: (text, record) => (
                <span>{record.createTime}</span>
            ),
        },
        {
            width: 100,
            title: '咨询时间',
            key: 'consultationTime',
            search: false,
            dataIndex: 'consultationTime',
            valueType: 'dateRange',
            sorter: true,
            render: (text, record) => (
                <span>
                    {record.consultationTime}
                </span>
            ),
        },
        {
            title: '是否为出镜人专属资源',
            key: 'isLive',
            dataIndex: 'isLive',
            search: false,
            valueType: 'select',
            valueEnum: {
                true: '是',
                false: '否'
            },
            hideInTable: true
        },


        {
            width: 100,
            title: '备注',
            search: false,
            dataIndex: 'description',
            key: 'descriptions',
            ellipsis: true,
            tip: '备注过长会自动收缩',
        },
        {
            title: '操作',
            valueType: 'option',
            width: 260,
            key: 'options',
            fixed: 'right',
            render: (text, record, _, action) => (
                //order为选择学员时所用，parentId为企业添加学员时所用
                <>
                    <Button type='primary'>下单</Button>
                </>
            ),
        },
    ];
    return (
        <PageContainer>
            <ProCard>
                <ProTable
                    columns={columns}
                    className="student"
                    actionRef={actionRef}
                    formRef={formRef}
                    cardBordered
                    scroll={{ x: 1500 }}
                    params={params}
                    request={async (
                        params: {
                            current?: any;
                            page?: number;
                            pageSize?: number;
                        } = {

                            },
                        sort,
                        filter,
                    ) => {
                        const res = await request.get(url, params);
                        console.log(res.data.content)
                        if (res.data.content.length === 0) {
                            setFindStudent(true)
                        }
                        return {
                            data: res.data.content,
                            success: res.success,
                            total: res.data.totalElements,
                        };
                    }}
                // request={
                //     { url: url, params: params, sortList: sortList }
                // }
                />

                {/* <ProForm<{
                    mobile: string;
                }>
                    formRef={formRef}
                    layout="horizontal"
                    submitter={{
                        render: (props, doms) => {
                            return [
                                <Button htmlType="button" onClick={handleSelect} key="edit">
                                    查询下单
                                </Button>
                            ];
                        },
                    }}
                >

                </ProForm> */}
            </ProCard>

            <Modal
                title="查询结果"
                onCancel={() => {
                    setFindStudent(false)
                }}
                onOk={() => {
                    setFindStudent(false)
                    setModalStudentInfo(true)
                }}
                open={findStudent}
            >
                <p>学员资料不存在，请完善资料后再下单</p>
            </Modal>
            <ModalForm
                visible={modalStudentInfo}
                title="新建表单"
                width={1000}
                layout='horizontal'
                formRef={formRef}
                autoFocusFirstInput
                modalProps={{
                    destroyOnClose: true,
                    onCancel: () => {
                        setType('0')
                        setModalStudentInfo(false);
                    },
                    maskClosable: false,
                }}
                onFinish={async (values) => {
                    setType('0');
                    setModalOrderVisible(true)
                    console.log('完整表单数据:', JSON.stringify(values, null, 2));
                    if (values?.labels) {
                        console.log('共享分成数据:', values.labels);
                    } else {
                        console.log('未提交共享分成数据或当前未启用共享功能');
                    }
                    return true;
                }}
            >
                <Button type='primary' style={{ marginBottom: '15px' }}>设置常用报考项目</Button>
                <ProForm.Group>
                    <ProFormSelect
                        label="学员类型"
                        name="type"
                        width="md"
                        request={async () => Dictionaries.getList('studentType') as any}
                        fieldProps={{
                            onChange: (e) => {
                                setType(e)
                            },
                        }}
                        rules={[{ required: true, message: '请选择学员类型' }]}
                    />

                    <ProFormText
                        width="md"
                        name="name"
                        label={type === '0' ? '学员姓名' : type === '1' ? '企业名称' : '代理名称'}
                        placeholder="请输入学员名称"
                        rules={[{ required: true, message: '请输入学员名称' }]}
                    />
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormText
                        width="md"
                        name="mobile"
                        label="身份证号"
                        placeholder="请输入身份证号"
                        rules={[{ required: true, message: '请输入身份证号' }]}
                    />
                    <ProFormSelect
                        label="客户来源"
                        name="source"
                        width="md"
                        rules={[{ required: true, message: '请选择客户来源' }]}
                        request={async () => Dictionaries.getList('dict_source') as any}
                    />
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormCascader
                        width="md"
                        name="project"
                        placeholder="咨询报考岗位"
                        label="报考岗位"
                        rules={[{ required: true, message: '请选择报考岗位' }]}
                        fieldProps={{
                            options: Dictionaries.getCascader('dict_reg_job'),
                            //showSearch: { filter },
                            onChange: (e: any) => { }
                            // onSearch: (value) => console.log(value)
                        }}
                    />
                    <UserTreeSelect
                        ref={userRef}
                        userLabel={'招生老师'}
                        userNames="userId"
                        userPlaceholder="请输入招生老师"
                        setUserNameId={(e: any) => setUserNameId(e)}
                        flag={true}
                    />
                </ProForm.Group>
                <ProForm.Group>
                    <UserTreeSelect
                        ref={userRef2}
                        userLabel={'出镜人'}
                        filter={(e: Array<any>) => {
                            e.unshift({
                                title: '无',
                                userId: -1,
                                value: '-1'
                            })
                            return e;
                        }}
                        userNames="owner"
                        newMedia={false}
                        userPlaceholder="请输入信息所有人"
                        setUserNameId={(e: any) => setUserNameId2(e)}
                        flag={true}
                    />
                    <UserTreeSelect
                        ref={userRefs}
                        userLabel={'信息提供人'}
                        userNames="provider"
                        userPlaceholder="请输入信息提供人"
                        setUserNameId={(e: any) => setUserNameIds(e)}
                        flag={true}
                    />
                </ProForm.Group>
                <ProFormTextArea
                    width={1100}
                    label='备注'
                    name="description"
                />


                {type == '1' ? (
                    <>
                        <ProForm.Group>
                            <ProFormText
                                width="md"
                                name="companyPeople"
                                label="企业联系人"
                                placeholder="请输入企业联系人"
                                rules={[{ required: true, message: '请输入企业联系人' }]}
                            />
                            <ProFormText
                                width="md"
                                name="code"
                                label="统一社会信用代码"
                                placeholder="请输入统一社会信用代码"
                                rules={[{ required: true, message: '请输入统一社会信用代码' }]}
                            />
                        </ProForm.Group>
                        <div>
                            <ProForm.Group title="是否共享订单"></ProForm.Group>
                            <Radio.Group name="radiogroup" onChange={(e) => { setRadio(e) }}>
                                <Radio value={1}>非共享</Radio>
                                <Radio value={2}>共享下单</Radio>
                            </Radio.Group>
                        </div>


                        {steps == '2' ? (
                            <ProFormList
                                style={{ marginTop: '15px' }}
                                name="labels"
                                label="共享分成"
                                deleteIconProps={false}
                                copyIconProps={false}
                            >
                                <ProFormGroup key="group">
                                    <UserTreeSelect
                                        ref={userRef}
                                        userNames="userId"
                                        userPlaceholder="请选择"
                                        setUserNameId={(e: any) => setUserNameId(e)}
                                        flag={true}
                                    />
                                    <ProFormText name="label" placeholder={"请输入分成的占比"} />
                                </ProFormGroup>
                            </ProFormList>
                        ) : (
                            ''
                        )}


                    </>
                ) : (
                    ''
                )}


            </ModalForm>

            <ModalForm
                title="下单"
                width={1200}
                visible={modalOrderVisible}
                autoFocusFirstInput
                modalProps={{
                    destroyOnClose: true,
                    onCancel: () => {
                        setModalOrderVisible(false);
                    },
                    maskClosable: false,
                }}
                onFinish={async (values) => { 
                    let classListValues = {}
                    classListValues = await classListRef.current?.getFormValues();
                    console.log(classListValues,'classListValues')
                }}
            >
                <OrderClassType
                    ref={classListRef}
                    onTotalQuantityChange={(quantity: number) => {
                        formRef.current?.setFieldsValue({
                            quantity: quantity
                        });
                    }}
                    onAddClassType={() => {
                        // 调用 payWay 组件的添加方法
                        payWayRef.current?.addPayWayItem?.();
                    }}
                    onRemoveClassType={(index: number) => {
                        // 调用 payWay 组件的删除方法
                        if (payWayRef.current) {
                            const payWayComponent = payWayRef.current as any;
                            if (payWayComponent.removePayWayItem) {
                                payWayComponent.removePayWayItem(index);
                            }
                        }
                    }} />
                <OrderPayWay ref={payWayRef} />
            </ModalForm>
        </PageContainer>
    );
};
