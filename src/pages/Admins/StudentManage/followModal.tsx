import { useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';
import ProForm, {
    ModalForm,
    type ProFormInstance,
    ProFormCascader,
    ProFormDatePicker,
    ProFormTextArea,
    ProFormSelect,
    ProFormUploadDragger,
    ProFormText
} from '@ant-design/pro-form';

import './follow.less'
import { Button, message, Modal, Input, Space } from 'antd';
import Dictionaries from '@/services/util/dictionaries';
import request from '@/services/ant-design-pro/apiRequest';
const { Search } = Input;


export default (props: any) => {
    const { modalVisible, setModalVisible, renderData, url } = props;
    const { initialState } = useModel('@@initialState');
    const [followModal, setFollowModal] = useState<boolean>(false);
    const [ImgUrl, setImageUrl] = useState<any>();
    const [followImage, setFollowImage] = useState<any>()
    const [followList, setFollowList] = useState<any>([])
    const [expandedItems, setExpandedItems] = useState<number[]>([]);
    //编辑时的id
    const [editId, setEditId] = useState<string>('');
    //展开收起
    const toggleExpand = (id: number) => {
        if (expandedItems.includes(id)) {
            setExpandedItems(expandedItems.filter(item => item !== id));
        } else {
            setExpandedItems([...expandedItems, id]);
        }
    };
    //编辑
    const handleEdit = (item: any) => {
        setEditId(item.id)
        setTimeout(() => {
            formRef?.current?.setFieldsValue({
                content: item.content,
                project: Dictionaries.getCascaderValue('dict_reg_job', item.project),
                type: Dictionaries.getName('dict_c_type', item.type),
                intention: Dictionaries.getName('dict_intention_level', item.intention),
                createTime: item.createTime,
                nextVisitDate: item.nextVisitDate
            });
        }, 100);
        setFollowModal(true)
    }
    useEffect(() => {
        getFollow()
    }, [url])

    const param = { studentUserId: renderData.id }
    const getFollow = async () => {
        const res = await request.get(url, param)
        setFollowList(res.data.content)
    }
    const search = async (val: string) => {
        const res = await request.get(url, { content: val, studentUserId: renderData.id })
        setFollowList(res.data.content)
    }
    const formRef = useRef<ProFormInstance>();
    const userRefs: any = useRef(null);

    const tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
    const tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
    const obj: Record<string, string> = {};
    if (tokenValue !== null) {
        obj[tokenName] = tokenValue;
    } else {
        // 处理 tokenValue 为 null 的情况，例如显示错误消息或设置默认值
        console.error('Token value is null');
    }



    const handleWatch = async (id: any, file: any) => {
        const tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
        const tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
        const src = '/sms/business/bizReturnVisit/download?id=' + id + '&fileName=' + file + '&' + tokenName + '=' + tokenValue;
        setImageUrl(src)
        setFollowImage(true)
    }

    const handleAddfollow = () => {
        console.log(editId)
        setFollowModal(true)
    }
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
                <div className='header_search'>
                    <div className='search_left'>
                        <Search style={{ width: '200px', marginLeft: '20px' }} placeholder="输入跟进内容" onSearch={search} enterButton />
                        <ProFormSelect
                            style={{ width: '200px', marginTop: '24px' }}
                            name="type"
                            width="xl"
                            placeholder={'请选择沟通类型'}
                            fieldProps={{
                                onChange: async (val: string) => {
                                    if (!val) {
                                        const res = await request.get(url, { studentUserId: renderData.id })
                                        setFollowList(res.data.content)
                                    } else {
                                        const res = await request.get(url, { type: val, studentUserId: renderData.id })
                                        setFollowList(res.data.content)
                                    }
                                }
                            }}
                            request={async () => Dictionaries.getList('dict_c_type') as any}
                        />
                    </div>
                    <div className='search_right'>
                        <Button key="add-follow-record"
                            type="primary"
                            onClick={handleAddfollow}>添加跟进记录</Button>
                    </div>

                </div>
                <div className='header_bottom'>
                    <div className='table_header'>
                        <div>沟通类型</div>
                        <div>跟进项目</div>
                        <div>跟进内容</div>
                        <div>跟进时间</div>
                        <div>跟进人</div>
                        <div>下次跟进时间</div>
                        <div>操作</div>
                    </div>
                    <div className='table_content'>
                        {followList.map((item: any) => {
                            return (
                                <div>
                                    <div className='header_content_top'>
                                        <div>{Dictionaries.getName('dict_c_type', item.type)}</div>
                                        <div>{Dictionaries.getCascaderName('dict_reg_job', item.project)}</div>
                                        <div>{item.content}</div>
                                        <div>{item.createTime}</div>
                                        <div>{item.userName}</div>
                                        <div>{item.nextVisitDate}</div>
                                        <div>
                                            <a onClick={() => toggleExpand(item.id)}>{expandedItems.includes(item.id) ? '收起' : '详情'}</a>,
                                            <a onClick={() => handleEdit(item)}>编辑</a>
                                        </div>
                                    </div>
                                    {expandedItems.includes(item.id) && (
                                        <div className='header_content'>
                                            <div className='content_top'>
                                                <div className='projectName'>
                                                    <div className='left'>{Dictionaries.getCascaderName('dict_reg_job', item.project)} </div>
                                                    <div>跟进人：{item.userName}</div>
                                                </div>
                                                {/* <div>
                                                    <Button onClick={() => handleWatch(item.id, item.file)} type='primary'>查看</Button>
                                                </div>
                                                <div>跟进人：{item.userName}</div>
                                               
                                                <div>沟通类型：{Dictionaries.getName('dict_c_type', item.type)}</div> */}
                                            </div>

                                            <div className='content_middle' style={{ marginTop: '20px' }}>沟通内容：{item.content}</div>
                                            <div className='content_middle'>下次跟进时间：{item.nextVisitDate}</div>
                                            <div className='content_middle'>
                                                <Button onClick={() => handleWatch(item.id, item.file)} type='primary' size="small">查看图片</Button>
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
                                key="add-follow-record-toolbar"
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
                title={editId ? '编辑' : '新建'}
                formRef={formRef}
                visible={followModal}
                width={1000}
                autoFocusFirstInput
                modalProps={{
                    onCancel: () => {
                        setFollowModal(false)
                        setEditId('')
                    },
                    destroyOnClose: true,
                }}
                onFinish={async (values: any) => {
                    if (values.project) values.project = values.project[values.project.length - 1];
                    values.studentUserId = renderData.id;
                    values.updateBy = initialState?.currentUser?.userid;
                    if (values.filess) {
                        const arr: any[] = [];
                        values.filess.forEach((item: any) => {
                            arr.push(item.response.data);
                        });
                        delete values.filess;
                        values.file = arr.join(',');
                        console.log(values.files)
                    }
                    values.files = values.files
                    console.log(values, 'values')
                    setEditId('')
                    if (editId) {
                        values.id = editId;
                        values.type = Dictionaries.getValue('dict_c_type', values.type)
                        values.intention = Dictionaries.getValue('dict_intention_level', values.intention)
                    }
                    request
                        .post(url, values)
                        .then((res: any) => {
                            if (res.status == 'success') {
                                message.success('操作成功');
                                setFollowModal(false);
                                getFollow()
                            }
                            return true;
                        })
                        .catch((err: any) => {
                            return true;
                        });
                }}
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
                        name="createTime"
                        fieldProps={{
                            showTime: { format: 'HH:mm:ss' },
                            format: 'YYYY-MM-DD HH:mm:ss',
                        }}
                        width="sm"
                        label={`跟进时间`}
                        rules={[{ required: true, message: '请选择跟进时间' }]}
                    />
                    <ProFormDatePicker
                        name="nextVisitDate"
                        fieldProps={{
                            showTime: { format: 'HH:mm:ss' },
                            format: 'YYYY-MM-DD HH:mm:ss',
                        }}
                        width="sm"
                        label={`下次跟进时间`}
                    />
                    <ProFormText
                        label="跟进人"
                        name="updateBy"
                        width="md"
                        fieldProps={{ value: initialState?.currentUser?.name, readOnly: true }}
                    />
                    {/* <UserTreeSelect
                        ref={userRefs}
                        width="sm"
                        userLabel={'跟进人'}
                        userNames="provider"
                        // newMedia={sourceType == 1}
                        userPlaceholder="跟进人"
                        setUserNameId={(e: any) => setUserNameIds(e)}
                        // setDepartId={(e: any) => setDepartId(e)}
                        flag={true}
                    // setFalgUser={(e: any) => setFalgUser(e)}
                    /> */}
                    <ProFormUploadDragger
                        width="xl"
                        label="上传图片"
                        name="filess"
                        action="/sms/business/bizReturnVisit/upload"
                        fieldProps={{
                            multiple: true,
                            headers: {
                                ...obj,
                            },
                            accept: "image/*",
                            listType: 'picture',
                            onRemove: (e: any) => { },
                            beforeUpload: (file: any) => {
                                console.log('file', file);
                                const isImage = file.type.startsWith('image/')
                                if (!isImage) {
                                    message.error('只能上传图片')
                                    return false
                                }
                                return true
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
                    <ProFormTextArea width={800} label="跟进内容" name="content" rules={[{ required: true }]} />
                </ProForm.Group>
            </ModalForm>

            <Modal
                title="跟进记录图"
                width={400}
                open={followImage}
                onOk={() => {
                    setFollowImage(false);
                }}
                onCancel={() => {
                    setFollowImage(false);
                }}
            >
                <img style={{ width: '100%' }} src={ImgUrl} />
            </Modal>
        </>
    );
};
