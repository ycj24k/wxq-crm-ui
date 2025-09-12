import { useEffect, useRef, useState } from 'react';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Table, message, Tag, Modal } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import request from '@/services/ant-design-pro/apiRequest';
import moment from 'moment';
import Dictionaries from '@/services/util/dictionaries';
import Upload from '@/services/util/upload';
import { PageContainer } from '@ant-design/pro-layout';
import StudentInfo from '@/pages/Admins/StudentManage/studentInfo';
import DepartmentCard from "@/pages/Admins/Department/DepartmentCard";

import Tables from '@/components/Tables';
import filter from '@/services/util/filter';
import AddResource from './AddResource'
import { useModel } from 'umi';
import type { ProFormInstance} from '@ant-design/pro-form';
import ProForm, { ModalForm, ProFormText } from '@ant-design/pro-form';
type GithubIssueItem = {
    name: string;
    sex: number;
    departmentId: number;
    id: number;
    url: string;
    enable: boolean;
    isVisit: boolean;
    source: string;
    studentSource: string;
    type: string | number;
    isFormal: boolean;
    createTime: any;
    circulationTime: any;
    idCard: string;
    project: string;
    code: any;
    receiveDate: any;
};

export default (props: any) => {
    const { initialState } = useModel('@@initialState');
    const { hidden } = props;
    // const departmentId = initialState?.currentUser?.departmentId
    const [renderData, setRenderData] = useState<any>(null);
    const [UploadFalg, setUploadVisible] = useState<boolean>(false);
    const [InfoVisibleFalg, setInfoVisible] = useState<boolean>(false);
    const [AddResourceFalg, setAddResource] = useState<boolean>(false);
    const [TabListNuber, setTabListNuber] = useState<any>('1');
    const [StudentIds, setStudentIds] = useState<any>([]);
    const actionRef = useRef<ActionType>();
    const [ModalVisible, setModalVisible] = useState<boolean>(false);
    const [CardVisible, setCardVisible] = useState<boolean>(false);
    const [department, setDepartment] = useState<any>({ name: '' });
    const [departmentId, setDepartmentId] = useState<any>(initialState?.currentUser?.departmentId);
    const formRef = useRef<ProFormInstance>();

    const callbackRef = () => {
        // @ts-ignore
        actionRef.current.reload();
    };
    const ment = () => {
        formRef?.current?.setFieldsValue({
            departmentId: department.name,
        });
        setDepartmentId(department.id)
    };
    const columns: ProColumns<GithubIssueItem>[] = [
        {
            title: '姓名',
            dataIndex: 'name',
            // width: 100,
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
        // {
        //   title: '企业负责人',
        //   dataIndex: 'chargePersonName',
        //   hideInTable: type == '学员' ? true : false,
        // },
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
            hideInTable: true,
            sorter: true,
        },
        {
            title: '微信号',
            dataIndex: 'weChat',
            hideInTable: true,
            sorter: true,
        },


        {
            title: '学员类型',
            dataIndex: 'type',
            valueType: 'select',
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
            sorter: true,
            valueType: 'select',

            fieldProps: {
                options: Dictionaries.getList('dict_reg_job'),
                showSearch: { filter },
                mode: 'tags',
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
            dataIndex: 'project-in',
            // search: false,
            // sorter: true,
            key: 'project-in',
            valueType: 'select',
            fieldProps: {
                showSearch: { filter },
                options: Dictionaries.getCascader('dict_reg_job'),
                mode: 'tags',
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
            title: '学员信息提供人',
            dataIndex: 'providerName',
            sorter: true,
        },
        // {
        //   title: '未领取天数',
        //   dataIndex: 'receiveDate',
        //   search: false,
        //   sorter: true,
        //   render: (text, record) => <span>{record.receiveDate}天</span>,
        // },
        // {
        //     title: '领取次数',
        //     sorter: true,
        //     dataIndex: 'circulationNum',
        //     key: 'circulationNum',
        // },
        {
            title: '当前所在部门',
            sorter: true,
            dataIndex: 'departmentName',
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
    ];
    const sortList: any = {
        ['circulationTime']: 'desc',
    };
    return (
        <>
            <PageContainer
            >
                <Tables
                    columns={columns}
                    actionRef={actionRef}
                    request={{
                        url: '/sms/business/bizStudentUser',
                        params: { source: TabListNuber, 'userId-isNull': true, circulationNum: 0 },
                        sortList: sortList,
                    }}
                    search={hidden ? false : { defaultCollapsed: false }}
                    rowSelection={{
                        // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
                        // 注释该行则默认不显示下拉选项
                        selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                        onChange: (e, selectedRows) => {
                            setStudentIds(e);
                        },
                    }}
                    toolBarRender={[
                        <a

                            download="新学员导入模板"
                            href="./template/新学员导入模板.xlsx"
                        >
                            下载导入模板
                        </a>,
                        <Button
                            key="button"
                            icon={<DownloadOutlined />}
                            type="primary"
                            onClick={() => {

                                setModalVisible(true)
                            }}
                        >
                            批量导入
                        </Button>,
                        <Button
                            key="button"
                            icon={<PlusOutlined />}
                            type="primary"
                            onClick={() => {
                                setRenderData({ types: 'add' })
                                setAddResource(true)
                            }}
                        >
                            新建
                        </Button>,
                        <Button
                            key="button"
                            icon={<PlusOutlined />}
                            type="primary"
                            onClick={() => {
                                if (StudentIds.length == 0) {
                                    message.error('请选择需要领取的学员!');
                                    return;
                                }
                                console.log(StudentIds);
                                request
                                    .post('/sms/business/bizStudentUser/receive', {
                                        ids: StudentIds.join(','),
                                        source: TabListNuber,
                                    })
                                    .then((res: any) => {
                                        if (res.status == 'success') {
                                            message.success('操作成功');
                                            callbackRef();
                                        }
                                    });
                            }}
                        >
                            领取
                        </Button>,
                    ]}
                />
                <ModalForm
                    visible={ModalVisible}
                    formRef={formRef}
                    modalProps={{
                        destroyOnClose: true,
                        maskClosable: false,
                        onCancel: () => {
                            setModalVisible(false);
                        },
                    }}
                    title='选择部门'
                    width={800}
                    onFinish={async (values: any) => {
                        setUploadVisible(true);
                        setModalVisible(false);
                    }}
                >
                    <ProForm.Group>
                        <ProFormText name="departmentId" label="部门" rules={[{ required: true }]} width={500} />
                        <Button
                            style={{ marginTop: '30px', marginLeft: '-30px' }}
                            type="primary"
                            onClick={async () => {
                                // request.get('/sms/share/getDepartmentAndUser');
                                setCardVisible(true);
                            }}
                        >
                            选择
                        </Button>
                    </ProForm.Group>
                </ModalForm>
                {UploadFalg && (
                    <Upload
                        setModalVisible={() => setUploadVisible(false)}
                        modalVisible={UploadFalg}
                        url={'/sms/business/bizStudent/addCirculationRepository?departmentId=' + departmentId}
                        type={'student'}
                        uploadtype="student"
                        propsData={{ resourceType: TabListNuber }}
                        callbackRef={() => callbackRef()}
                        departmentType={true}
                    />
                )}
                {InfoVisibleFalg && (
                    <StudentInfo
                        setModalVisible={() => setInfoVisible(false)}
                        modalVisible={InfoVisibleFalg}
                        renderData={renderData}
                        callbackRef={() => callbackRef()}
                        mobileHide={true}
                    />
                )}
                {AddResourceFalg && (
                    <AddResource
                        setModalVisible={() => setAddResource(false)}
                        modalVisible={AddResourceFalg}
                        renderData={renderData}
                        callbackRef={() => callbackRef()}
                        mobileHide={true}
                    />
                )}
                {CardVisible && (
                    <DepartmentCard
                        CardVisible={CardVisible}
                        setCardVisible={() => setCardVisible(false)}
                        setGrouptment={(e: any) => setDepartment(e)}
                        ment={() => ment()}
                    />
                )}
            </PageContainer>
        </>
    );
};
