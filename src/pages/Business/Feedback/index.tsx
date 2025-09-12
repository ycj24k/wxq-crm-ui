import { LikeOutlined, MessageOutlined, PlusOutlined, StarOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { PageContainer } from '@ant-design/pro-layout';
import { Avatar, Button, List, message, Popconfirm, Space, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import request from '@/services/ant-design-pro/apiRequest';
import ModelAdd from './ModelAdd';
import moment from 'moment';
import look from '@/services/util/viewLook';
import Preview from '@/services/util/preview';
import Dictionaries from '@/services/util/dictionaries';
import { useModel } from 'umi';
import './index.less'
const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
    <Space>
        {React.createElement(icon)}
        {text}
    </Space>
);


export default () => {
    const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
    const { initialState } = useModel('@@initialState');
    const [renderData, setRenderData] = useState<any>(null);
    const [contentData, setContentData] = useState<any>([])
    const [previewurl, setPreviewurl] = useState<any>();
    const [PreviewVisibles, setPreviewVisibles] = useState<boolean>(false);
    const [spinning, setSpinning] = useState<boolean>(false);
    const callbackRef = async () => {
        const data = (await request.get('/sms/business/bizFeedback')).data.content
        setContentData(data)
        setSpinning(false)
    }
    useEffect(() => {
        console.log('Dictionaries.getDepartmentUserName(item)', Dictionaries.getDepartmentUserName(2));

        callbackRef()
    }, [])
    const filesDom = (value: any, id: number) => {

        let dom = <span />
        if (value) {
            dom = value.split(',').map((items: any, indexs: number) => {
                return (
                    <div key={indexs} className="notice-files">
                        <a
                            onClick={() => {
                                look(
                                    id,
                                    items,
                                    '/sms/business/bizFeedback/download',
                                    setPreviewurl,
                                    setPreviewVisibles,
                                );
                            }}
                        >
                            {items}
                        </a>
                    </div>
                );
            })
        }
        return dom
    }
    const agree = (id: number, item: any) => {
        setSpinning(true)
        const isAgree = item.upUserList.split(',').indexOf(initialState?.currentUser?.userid + '') >= 0 ? true : false
        request.post('/sms/business/bizFeedback/agree', { id, isAgree: !isAgree }).then((res) => {
            if (res.status == 'success') {
                if (isAgree) {
                    message.success('取消点赞成功')
                } else {
                    message.success('点赞成功')
                }
                callbackRef()
            }
        })
    }
    const deleteId = (id: number) => {
        request.delete('/sms/business/bizFeedback?id=' + id).then((res) => {
            if (res.status == 'success') {
                message.success('删除成功')
                callbackRef()
            }
        })
    }
    const onisSolve = (id: number) => {
        request.post('/sms/business/bizFeedback', { id: id, isSolve: true }).then((res: any) => {
            if (res.status == 'success') {
                message.success('删除成功');
                callbackRef();
            }
        });
    }
    return (
        <PageContainer>
            <ProCard
            >
                <div
                    style={{ textAlign: 'right', paddingRight: '25px' }}
                >
                    <Button
                        icon={<PlusOutlined />}
                        type='primary'
                        onClick={() => {
                            setRenderData({ type: 'add' })
                            setModalVisible(true)
                        }}
                    >
                        我要提议/反馈
                    </Button>
                </div>
                <List
                    itemLayout="vertical"
                    size="large"
                    pagination={{
                        onChange: page => {
                            console.log(page);
                        },
                        pageSize: 3,
                    }}
                    dataSource={contentData}
                    footer={
                        <div />
                    }
                    renderItem={(item: any) => (
                        <List.Item
                            key={item.id}
                            actions={[

                                <Spin spinning={spinning}><a onClick={() => agree(item.id, item)}><Space><LikeOutlined style={{ color: item.upUserList.split(',').indexOf(initialState?.currentUser?.userid + '') >= 0 ? '#1890ff' : '#ccc' }} /> <a>{item.upCount ? item.upCount : 0}</a></Space></a></Spin>,
                                <div hidden={item.createBy !== initialState?.currentUser?.userid}>
                                    <Space>
                                        <a onClick={() => {
                                            setRenderData({ type: 'eidt', ...item })
                                            setModalVisible(true)
                                        }}>编辑</a>
                                        <a style={{ color: 'red' }} onClick={() => {
                                            deleteId(item.id)
                                        }}>删除</a>
                                    </Space>
                                </div>,
                                <div className='useName'>
                                    <div className='useName-name'>{item.upUserNameList ? item.upUserNameList : ''}</div><div>表示赞同</div>
                                </div>
                            ]}
                            extra={
                                <div className='file'>
                                    <div>
                                        反馈意见附件:
                                        {filesDom(item.file, item.id)}
                                    </div>
                                    <div className='file-bot' style={{ marginTop: '30px' }}>
                                        <div>解决状态:</div>
                                        {
                                            item.isSolve ? <a>已解决</a> :
                                                <Popconfirm
                                                    title="是否已经解决"
                                                    okText="已解决"
                                                    cancelText="取消"
                                                    onConfirm={() => {
                                                        onisSolve(item.id)
                                                    }}
                                                >
                                                    <span style={{ color: '#ccc' }}>未完成</span>
                                                </Popconfirm>

                                        }

                                    </div>
                                </div>
                            }
                        >
                            <List.Item.Meta
                                avatar={<Avatar src={'http://m.imeitou.com/uploads/allimg/220713/7-220G3111245.jpg'} />}
                                title={<a>{item.userName}<a style={{ color: '#ccc', fontSize: '12px', paddingLeft: '20px' }}>{item.createTime}</a></a>}
                                description={item.function}
                            />
                            {item.content}
                        </List.Item>
                    )}
                />
            </ProCard>
            {modalVisibleFalg && (
                <ModelAdd
                    setModalVisible={() => setModalVisible(false)}
                    modalVisible={modalVisibleFalg}
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
        </PageContainer>
    )
}