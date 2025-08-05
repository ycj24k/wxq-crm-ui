import { useRef, useState } from 'react';
import Tables from "@/components/Tables"
import ProForm, {
    ModalForm,
    type ProFormInstance,
    ProFormCascader,
    ProFormDatePicker,
    ProFormTextArea,
    ProFormSelect,
    ProFormUploadDragger
} from '@ant-design/pro-form';
import { ProColumns } from "@ant-design/pro-table"
import './follow.less'
import { Button, message, Modal, Input, Space } from 'antd';
import Dictionaries from '@/services/util/dictionaries';
import UserTreeSelect from '@/components/ProFormUser/UserTreeSelect';
const { Search } = Input;


export default (props: any) => {
    const { modalVisible, setModalVisible, callbackRef, renderData } = props;
    const [followModal, setFollowModal] = useState<boolean>(false);
    const [userNameIds, setUserNameIds] = useState<number>(0);

    const [expandedItems, setExpandedItems] = useState<number[]>([]);
    const toggleExpand = (id: number) => {
        if (expandedItems.includes(id)) {
            setExpandedItems(expandedItems.filter(item => item !== id));
        } else {
            setExpandedItems([...expandedItems, id]);
        }
    };

    const url = '/sms/business/bizReturnVisit/findOne'
    console.log(renderData, 'studentId')
    const formRef = useRef<ProFormInstance>();
    const userRefs: any = useRef(null);

    let tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
    let tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
    let obj: { [key: string]: string } = {};
    if (tokenValue !== null) {
        obj[tokenName] = tokenValue;
    } else {
        // 处理 tokenValue 为 null 的情况，例如显示错误消息或设置默认值
        console.error('Token value is null');
    }

    const [followList, setFollowList] = useState<any>([
        {
            id: 1,
            name: '电话沟通',
            project: '土建中级-一建',
            followContent: '沟通内容dshauiofhaofjaosifiaofhahf',
            followTime: '2025-08-07 10:30:22',
            followPeople: '张三',
            followStatus: '已完成',
            nextTime: '2025-08-07 10:30:22'
        },
        {
            id: 2,
            name: '电话沟通',
            project: '土建中级-一建',
            followContent: '沟通内容',
            followTime: '2025-08-07 10:30:22',
            followPeople: '张三',
            followStatus: '已完成',
            nextTime: '2025-08-07 10:30:22'
        },
        {
            name: '电话沟通',
            project: '土建中级-一建',
            followContent: '沟通内容',
            followTime: '2025-08-07 10:30:22',
            followPeople: '张三',
            followStatus: '已完成',
            nextTime: '2025-08-07 10:30:22'
        }
    ])



    // const handleAddfollow = () => {
    //     setFollowModal(true)
    // }
    // const columns: ProColumns<any>[] = [
    //     {
    //         title: '沟通类型',
    //         dataIndex: 'num'
    //     },
    //     {
    //         title: '跟进项目',
    //         dataIndex: 'name',
    //     },
    //     {
    //         title: '跟进内容',
    //         dataIndex: 'phone',
    //     },
    //     {
    //         title: '跟进时间',
    //         dataIndex: 'method',
    //         valueType: 'select',
    //         sorter: true
    //     },
    //     {
    //         title: '跟进人',
    //         dataIndex: 'userName',
    //     },
    //     {
    //         title: '跟进状态',
    //         dataIndex: 'amount'
    //     },
    //     {
    //         title: '下次跟进时间',
    //         dataIndex: 'usedAmount',
    //         sorter: true
    //     },
    //     {
    //         title: '操作',
    //         search: false,
    //         render: (text, record) => (
    //             <>
    //                 <Button type='primary' onClick={() => { }}>快捷下单</Button>

    //                 {/* <Button type="primary" style={{ marginTop: '5px' }} hidden={record.isUseUp == true} danger onClick={() => handleRefound(record)}>申请退款</Button> */}
    //             </>

    //         )
    //     },
    // ];

    return (
        <>
            <Modal
                width={1200}
                title="跟进记录"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
            >
                <div className='header_top'>
                    <p>姓名：{renderData.name}</p>
                    <p>联系电话：{renderData.mobile}</p>
                    <p>微信号：{renderData.weChat || '未填写'}</p>
                </div>
                {/* <div className='header_top'>
                    <p>姓名：{renderData.name}</p>
                    <p>联系电话：{renderData.mobile}</p>
                    <p>微信号：{renderData.weChat || '未填写'}</p>
                </div> */}
                <div className='header_search'>
                    <Search style={{ width: '200px',marginLeft: '20px'}} placeholder="input search text" enterButton />
                    <ProFormSelect
                        name="type"
                        width="xl"
                        placeholder={'请选择沟通类型'}
                        request={async () => Dictionaries.getList('dict_c_type') as any}
                    />
                </div>
                <div className='header_bottom'>
                    <div className='table_header'>
                        <div>沟通类型</div>
                        <div>跟进项目</div>
                        <div>跟进内容</div>
                        <div>跟进时间</div>
                        <div>跟进人</div>
                        <div>跟进状态</div>
                        <div>下次跟进时间</div>
                        <div>操作</div>
                    </div>
                    <div className='table_content'>
                        {followList.map((item: any) => {
                            return (
                                <div>
                                    <div className='header_content_top'>
                                        <div>{item.name}</div>
                                        <div>{item.project}</div>
                                        <div>{item.followContent}</div>
                                        <div>{item.followTime}</div>
                                        <div>{item.followPeople}</div>
                                        <div>{item.followStatus}</div>
                                        <div>{item.nextTime}</div>
                                        <div onClick={() => toggleExpand(item.id)}>{expandedItems.includes(item.id) ? '收起' : '详情'}</div>
                                    </div>
                                    {expandedItems.includes(item.id) && (
                                        <div className='header_content'>
                                            <div className='content_top'>
                                                <div>沟通项目：{item.project}</div>
                                                <div>跟进人：{item.followPeople}</div>
                                            </div>
                                            <div className='content_middle'>沟通内容：{item.followContent}</div>
                                            <div className='content_bottom'>
                                                <div>已完成</div>
                                                <div>下次跟进时间：2025-08-07 10:30:22</div>
                                                <div>跟进人：张三</div>
                                                <div>沟通类型：电话沟通</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                    </div>
                    {/* <Tables
                        columns={columns}
                        toolBarRender={[
                            <Button
                                key="ordere"
                                type="primary"
                                onClick={handleAddfollow}
                            >
                                添加跟进记录
                            </Button>
                        ]}
                        request={{ url: url }}
                        params={{ id: renderData.id }}
                    /> */}
                </div>
            </Modal>

            <ModalForm<{
                name: string;
                company: string;
            }>
                title={renderData.types == 'edit' ? '编辑有效期' : '新建有效期'}
                formRef={formRef}
                visible={followModal}
                width={1000}
                autoFocusFirstInput
                modalProps={{
                    onCancel: () => setFollowModal(false),
                    destroyOnClose: true,
                }}
            // onFinish={async (values: any) => {
            //     if (values.project) values.project = values.project[values.project.length - 1];
            //     console.log(values, 'values')

            //     if (renderData.types == 'edit') values.id = renderData.id;
            //     request
            //         .post(url, values)
            //         .then((res: any) => {
            //             if (res.status == 'success') {
            //                 message.success('操作成功');
            //                 setModalVisible();
            //                 callbackRef();
            //             }
            //             return true;
            //         })
            //         .catch((err: any) => {
            //             return true;
            //         });
            // }}
            >
                <ProForm.Group>
                    <ProFormCascader
                        width="sm"
                        name="project"
                        placeholder="咨询报考岗位"
                        label="报考岗位"
                        rules={[{ required: true, message: '请选择报考岗位' }]}
                        fieldProps={{
                            options: Dictionaries.getCascader('dict_reg_job'),
                            // showSearch: { filter },
                            // onChange: onChange,
                            onSearch: (value) => console.log(value),
                            // defaultValue: ['0', '00'],
                        }}
                    />
                    <ProFormSelect
                        label="沟通方式"
                        name="type"
                        width="sm"
                        rules={[{ required: true, message: '请填写沟通方式' }]}
                        request={async () => Dictionaries.getList('dict_c_type') as any}
                    />
                    <ProFormSelect
                        label="意向级别"
                        name="intention"
                        width="sm"
                        rules={[{ required: true, message: '请填写意向级别' }]}
                        request={async () => Dictionaries.getList('dict_intention_level') as any}
                    />
                    <ProFormDatePicker
                        name="consultationTime"
                        fieldProps={{
                            showTime: { format: 'HH:mm:ss' },
                            format: 'YYYY-MM-DD HH:mm:ss',
                        }}
                        width="sm"
                        label={`跟进时间`}
                        rules={[{ required: true, message: '请选择跟进时间' }]}
                    />
                    <ProFormDatePicker
                        name="consultationTime"
                        fieldProps={{
                            showTime: { format: 'HH:mm:ss' },
                            format: 'YYYY-MM-DD HH:mm:ss',
                        }}
                        width="sm"
                        label={`下次跟进时间`}
                        rules={[{ required: true, message: '请选择下次跟进时间' }]}
                    />
                    <UserTreeSelect
                        ref={userRefs}
                        width="sm"
                        userLabel={'信息提供人'}
                        userNames="provider"
                        // newMedia={sourceType == 1}
                        userPlaceholder="请输入信息提供人"
                        setUserNameId={(e: any) => setUserNameIds(e)}
                        // setDepartId={(e: any) => setDepartId(e)}
                        flag={true}
                    // setFalgUser={(e: any) => setFalgUser(e)}
                    />
                    <ProFormUploadDragger
                        width="xl"
                        label="上传附件"
                        name="filess"
                        action="/sms/business/bizNotice/upload"
                        fieldProps={{
                            multiple: true,
                            headers: {
                                ...obj,
                            },
                            listType: 'picture',
                            onRemove: (e: any) => { },
                            beforeUpload: (file: any) => {
                                console.log('file', file);
                            },
                            onPreview: async (file: any) => {
                                console.log('file', file);

                                if (!file.url && !file.preview) {
                                    console.log('1');
                                }
                            },
                            onChange: (info: any) => {
                                const { status } = info.file;
                                if (status !== 'uploading') {
                                }
                                if (status === 'done') {
                                    message.success(`${info.file.name} 上传成功.`);
                                } else if (status === 'error') {
                                    message.error(`${info.file.name} 上传失败.`);
                                }
                            },
                        }}
                    />
                    <ProFormTextArea width={800} label="跟进内容" name="description" rules={[{ required: true }]} />
                </ProForm.Group>
            </ModalForm>
        </>
    );
};
