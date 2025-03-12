import Tables from "@/components/Tables";
import { ModalForm } from "@ant-design/pro-form"
import { ProColumns } from "@ant-design/pro-table";
import Dictionaries from '@/services/util/dictionaries';
import { history } from "umi";
import { useEffect, useState } from "react";
import { Button, Col, Row, Space } from "antd";
import ProCard from "@ant-design/pro-card";

type GithubIssueItem = {
    project: string
}




export default (props: any) => {
    const { modalVisible, setModalVisible, submitok, type, dataSource, renderData } = props;
    const [userList, setUserList] = useState([])
    const [list, setList] = useState([])
    useEffect(() => {
        console.log('dataSource', dataSource);

    }, [])

    const columns: ProColumns<GithubIssueItem>[] = [
        {
            title: '信息所有人',
            dataIndex: 'ownerName',
            key: 'ownerName',
        },
        {
            title: '招生老师',
            dataIndex: 'userName',
            key: 'userName',
        },
        {
            title: '手机号',
            dataIndex: 'mobile',
            key: 'mobile',
        },
        {
            title: '下单项目',
            dataIndex: 'project',
            key: 'project',
            render: (text, record) => (
                <span>{Dictionaries.getCascaderName('dict_reg_job', record.project)}</span>
            ),
        },
        {
            title: '下单时间',
            dataIndex: 'createTime',
            key: 'createTime',
        },
    ]
    const columns2: ProColumns<GithubIssueItem>[] = [
        {
            title: '信息所有人',
            dataIndex: 'ownerName',
            key: 'ownerName',
        },
        {
            title: '回访老师',
            dataIndex: 'userName',
            key: 'userName',
        },
        {
            title: '手机号',
            dataIndex: 'mobile',
            key: 'mobile',
        },
        {
            title: '回访项目',
            dataIndex: 'project',
            key: 'project',
            render: (text, record) => (
                <span>{Dictionaries.getCascaderName('dict_reg_job', record.project)}</span>
            ),
        },
        {
            title: '回访时间',
            dataIndex: 'createTime',
            key: 'createTime',
        },
    ]

    return (
        <ModalForm
            title='订单、回访列表'
            width={1200}
            modalProps={{
                destroyOnClose: true,
                maskClosable: false,
                onCancel: () => {
                    setModalVisible();
                },
                okText: '继续新增',
                cancelText: '返回'
            }}
            visible={modalVisible}
            onFinish={async (values: any) => {
                submitok(renderData, false)
            }}
        // submitter={{
        //     render: (_, dom) => {
        //         return (
        //             <Row>
        //                 <Col span={24} >
        //                     <Space>
        //                         {dom}
        //                         {
        //                             type != 'student' &&
        //                             <Button
        //                                 htmlType="button"
        //                                 type="primary"
        //                                 onClick={() => {
        //                                     submitok(list, false)
        //                                 }}
        //                             >
        //                                 仅导入未成交数据
        //                             </Button>
        //                         }
        //                     </Space>
        //                 </Col>
        //             </Row>
        //         )
        //     }
        // }}
        >
            {type == 'student' ? <div>手机号:{renderData.mobile}学员在系统里已有下单或回访记录。
                <br />
                如果所属老师是你，请前往所属潜在学员或正式学员查看
                <br />
                如果所属老师不是你，请点击右下角返回，根据实际情况将信息所有人填写正确后，再点右下角继续新增
                <br />
                信息所有人填写规则：
                <br />
                若系统中已存在该学员，并且有信息所有人，则填写此人，否则根据实际情况填写信息所有人
                {/* <a onClick={() => {
                history.push('/business/studentmanagetrue?mobile=' + renderData.mobile)
            }}>点击前往</a>正式学员下单 */}
            </div>
                : ''
                // <div>以下列表学员已有下单记录,是否继续导入
                //     <ul>
                //         {userList.map((item: any, index: number) => {
                //             return <li key={index}>姓名:{item.name},手机号:{item.mobile}</li>
                //         })}
                //     </ul>
                // </div>
            }
            <ProCard title='下列学员已有订单' hidden={!dataSource.order || dataSource.order.length == 0}>
                <Tables
                    search={false}
                    columns={columns}
                    dataSource={dataSource.order ? dataSource.order : []}

                />
            </ProCard>
            <ProCard title='下列学员已在跟踪回访' hidden={!dataSource.visit || dataSource.visit.length == 0}>
                <Tables
                    search={false}
                    columns={columns2}
                    dataSource={dataSource.visit ? dataSource.visit : []}

                />
            </ProCard>


        </ModalForm>

    )
}