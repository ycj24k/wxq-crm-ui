import ProCard from '@ant-design/pro-card';
import { PageContainer } from '@ant-design/pro-layout';
import UserManageCard from '@/pages/Admins/Department/UserManageCard';
import { useEffect, useRef, useState } from 'react';
import request from '@/services/ant-design-pro/apiRequest';
import ProForm, { ProFormDateRangePicker, ProFormInstance } from '@ant-design/pro-form';
import { useModel, history } from 'umi';
import moment from 'moment';
import { message, Table } from 'antd';
import Tables from '@/components/Tables';
import { ProColumns } from '@ant-design/pro-table';
import Dictionaries from '@/services/util/dictionaries';
import DownTable from '@/services/util/timeFn';
import DownHeader from './DownHeader';
import DownHeaders from '../../../Admins/AdminCharge/DownHeader';

export default () => {
    const [CadrContent, setCardContent] = useState<any>(false);
    const { initialState, setInitialState } = useModel('@@initialState');
    // @ts-ignore
    const { currentUser } = initialState;
    const userIds = history.location.query?.userId
        ? history.location.query?.userId
        : currentUser.userid;
    const moonTime: any = history.location.query?.moonTime
        ? JSON.parse(history.location.query?.moonTime as any)
        : [moment().format('YYYY-MM-DD'), moment(new Date()).add(1, 'days').format('YYYY-MM-DD')];
    const [userId, setUserID] = useState<any>([]);
    const [statistics, setStatistics] = useState<any>([]);
    const [perTime, setPerTime] = useState<any>(moonTime);
    const [providerContetn, setProvider] = useState<any>([]);
    const [userContetn, setUser] = useState<any>([]);
    const formRef = useRef<ProFormInstance>();
    useEffect(() => {
        // volume(perTime[0], perTime[1]);
        formRef.current?.setFieldsValue({
            createTime: perTime,
        });
    }, [userId]);

    const getXinmeiTi = (arr: any[], value: any) => {
        for (let item of arr) {
            if (item.departmentName == value) {
                console.log('item.departmentName', item.departmentName, value);
                return item;
            }
            if (item.children) {
                let data: any = getXinmeiTi(item.children, value);
                if (data) {
                    return data;
                }
            }
        }
    }
    useEffect(() => {
        request.get('/sms/share/getOperationDepartmentAndUser').then((res) => {
            const arr: any = res.data
            const arrData = getXinmeiTi(arr, '中台')
            const operations = getXinmeiTi([arrData], '新媒体运营部')
            setCardContent({ content: [operations], type: 'performance' });
            // setCardContent({ content: arr, type: 'performance' });
        });
        // volume(perTime[0], perTime[1]);
    }, []);
    const volume = async (start: any, end: any, f?: string) => {
        if (userId.length == 0) {
            message.error('请先勾选招生老师')
            return
        }
        const contnet = (
            await request.get('/sms/business/bizStudent/statistics/provider', {
                'startTime': start,
                'endTime': end,
                _isGetAll: true,
                enable: true,
                idList: userId.join(','),
            })
        ).data;
        const contnet2 = (
            await request.get('/sms/business/bizStudent/statistics/user', {
                'startTime': start,
                'endTime': end,
                _isGetAll: true,
                enable: true,
                type: 0,
                idList: userId.join(','),
            })
        ).data;
        setProvider(contnet)
        setUser(contnet2)
    };
    const columns: ProColumns<API.GithubIssueItem>[] = [
        {
            title: '运营老师',
            key: 'name',
            dataIndex: "id",
            width: 160,
            render: (text, record) => (
                <span>{Dictionaries.getDepartmentUserName(record.id as any)}</span>
            )
        },
        {
            title: '开始时间',
            key: 'start',
            dataIndex: "start",
            width: 160,
            render: (text, record) => (
                <span>{perTime[0]}</span>
            )
        },
        {
            title: '结束时间',
            key: 'end',
            dataIndex: "end",
            width: 160,
            render: (text, record) => (
                <span>{perTime[1]}</span>
            )
        },
        {
            title: '线索量',
            key: 'count',
            width: 160,
            dataIndex: "count"
        },
        {
            title: '成交量',
            key: 'dealCount',
            width: 160,
            dataIndex: "dealCount"
        },
        {
            title: '成交金额',
            key: 'amount',
            width: 160,
            dataIndex: "amount",
        },
        {
            title: '成交率',
            key: 'Transactionrate',
            dataIndex: "Transactionrate",
            render: (text, record) => (
                <span>{record.count ? (record.dealCount / record.count * 100).toFixed(2) : 0}%</span>
            )
        },
    ]
    const columns2: ProColumns<API.GithubIssueItem>[] = [
        {
            title: '所属部门',
            key: 'bumen',
            dataIndex: "bumen",
            width: 160,
            render: (text, record) => (
                <span>{Dictionaries.getDepartmentNames(record.id)[0]}</span>
            )
        },
        {
            title: '咨询老师',
            key: 'name',
            dataIndex: "id",
            width: 160,
            render: (text, record) => (
                <span>{Dictionaries.getDepartmentUserName(record.id as any)}</span>
            )
        },

        {
            title: '开始时间',
            key: 'start',
            width: 160,
            dataIndex: "start",
            render: (text, record) => (
                <span>{perTime[0]}</span>
            )
        },
        {
            title: '结束时间',
            key: 'end',
            width: 160,
            dataIndex: "end",
            render: (text, record) => (
                <span>{perTime[1]}</span>
            )
        },
        {
            title: '获取总数据量',
            key: 'count',
            width: 160,
            dataIndex: "count"
        },
        {
            title: '总成交量',
            key: 'dealCount',
            width: 160,
            dataIndex: "dealCount"
        },
        {
            title: '总成交金额',
            key: 'amount',
            width: 160,
            dataIndex: "amount"
        },
        {
            title: '总成交转化率',
            key: 'Transactionrate',
            width: 160,
            dataIndex: "Transactionrate",
            render: (text, record) => (
                <span>{record.count ? (record.dealCount / record.count * 100).toFixed(2) : 0}%</span>
            )
        },
    ]
    const onFinish = async (values: any) => {
        return new Promise((resolve) => {
            // setTiem(values.createTime);
            volume(values.createTime[0], values.createTime[1]);
            setPerTime(values.createTime);
            resolve(true);
        });
        // console.log('Received values from form: ', moment(values[0]).format('YYYY-MM-DD'));
    };
    const getTransactionrate = (type: number) => {
        const content = type == 1 ? providerContetn : userContetn

        const countAll = content.reduce((total: any, item: { count: any; }) => total + item.count, 0)
        const dealCountAll = content.reduce((total: any, item: { dealCount: any; }) => total + item.dealCount, 0)
        if (countAll == 0) {
            return '0%'
        } else {
            const baifenbi = `${(dealCountAll / countAll * 100).toFixed(2)}%`
            return baifenbi
        }
    }
    const summaryRow = {
        id: '总计',
        start: perTime[0],
        end: perTime[1],
        amount: providerContetn.reduce((total: any, item: { amount: any; }) => total + item.amount, 0),
        dealCount: providerContetn.reduce((total: any, item: { dealCount: any; }) => total + item.dealCount, 0),
        count: providerContetn.reduce((total: any, item: { count: any; }) => total + item.count, 0),
        Transactionrate: getTransactionrate(1),
    };
    const summaryRows = {
        id: '总计',
        bumen: '-',
        start: perTime[0],
        end: perTime[1],
        amount: userContetn.reduce((total: any, item: { amount: any; }) => total + item.amount, 0),
        dealCount: userContetn.reduce((total: any, item: { dealCount: any; }) => total + item.dealCount, 0),
        count: userContetn.reduce((total: any, item: { count: any; }) => total + item.count, 0),
        Transactionrate: getTransactionrate(2),
    };
    const downOrder = async (type: number) => {
        if (userId.length == 0) {
            message.error('请先左侧勾选招生老师')
            return
        }
        let data = {
            parentId: -1,
            enable: true,
            //  'provider-in': userId.join(','), 
            'createTime-start': perTime[0],
            'createTime-end': perTime[1],
            'status-isNot': 0,
            _isGetAll: true
        }
        if (type == 0) {
            data['provider-in'] = userId.join(',')
        } else if (type == 1) {
            data['userId-in'] = userId.join(',')
        }
        const content = (await request.get('/sms/business/bizOrder', data)).data.content

        DownTable(content, DownHeader, '订单信息', 'charge')
    }
    const downCharge = async () => {
        if (userId.length == 0) {
            message.error('请先左侧勾选招生老师')
            return
        }
        let data = {
            enable: true,
            //  'provider-in': userId.join(','), 
            'chargeTime-start': perTime[0],
            'chargeTime-end': perTime[1],
            'provider-in': userId.join(','),
            'auditType-in': "0,4",
            'confirm': true,
            // 'type-in': '0,2',
            _isGetAll: true
        }
        const content = (await request.get('/sms/business/bizCharge/getListOfFinance3', data)).data
        DownTable(content, DownHeaders.jiaoPayHeader, '缴费信息', 'charge');
    }
    return (
        <PageContainer>
            <ProCard split="vertical" className="cardsd">
                <ProCard colSpan="20%" style={{ padding: '0 5px' }}>
                    {CadrContent && (
                        <UserManageCard
                            CardVisible={true}
                            checkable={true}
                            CardContent={CadrContent}
                            setUserID={(e: any) => {
                                setUserID(e);
                            }}
                        />
                    )}
                </ProCard>
                <ProCard>
                    <div>
                        <ProForm
                            //   name="customized_form_controls"
                            layout="inline"
                            onFinish={async (values) => {
                                await onFinish(values);
                            }}
                            formRef={formRef}
                        >
                            <ProFormDateRangePicker name="createTime" label="日期时间" />
                        </ProForm>
                    </div>
                    <div>
                        <ProCard title='学员信息提供成交比'>
                            <Tables
                                columns={columns}
                                dataSource={providerContetn}
                                search={false}
                                toolBarRender={[
                                    <a
                                        onClick={() => downOrder(0)}
                                    >
                                        导出下单明细
                                    </a>,
                                    <a onClick={() => downCharge()}>
                                        导出缴费明细
                                    </a>
                                ]}
                                footer={() => (
                                    <tr >
                                        {columns.map((column) => (
                                            <td key={'Transactionrate'} className="ant-table-cell" style={{ width: '160px' }}>{summaryRow[column.dataIndex]}</td>
                                        ))}
                                    </tr>
                                )}
                            />
                        </ProCard>
                        <ProCard title='总数据成交比'>
                            <Tables
                                columns={columns2}
                                dataSource={userContetn}
                                search={false}
                                toolBarRender={[
                                    <a
                                        onClick={() => downOrder(1)}
                                    >
                                        导出下单明细
                                    </a>
                                ]}
                                footer={() => (
                                    <tr >
                                        {columns2.map((column) => (
                                            <td key={'Transactionrates'} className="ant-table-cell" style={{ width: '160px' }}>{summaryRows[column.dataIndex]}</td>
                                        ))}
                                    </tr>
                                )}
                            />
                        </ProCard>
                    </div>
                </ProCard>
            </ProCard>
        </PageContainer>
    );
};
