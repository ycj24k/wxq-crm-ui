import { PageContainer } from "@ant-design/pro-layout"
import { useEffect, useRef, useState } from "react"
import request from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import ProCard from "@ant-design/pro-card";
import Tables from "@/components/Tables";
import { ProColumns } from "@ant-design/pro-table";
import { Column } from '@ant-design/plots';
import ProForm, { ProFormDateTimeRangePicker, ProFormInstance, ProFormTimePicker } from "@ant-design/pro-form";
import './index.less'
import { history, useModel } from "umi";
import { getDaysInMonth, getTodayDate, getFirstAndLastDayOfMonth } from '../AchievementUser/getTime'
import { Col, Progress, Row, Spin, Statistic } from "antd";
import AuthorityTable from './AuthorityTable'
type GithubIssueItem = {
    name: string;
    amount: number;
    MonthAmount: number;
    dealCount: number;
    RefundsAmount: number;
    RefundsMonthAmount: number;
    achievementMubiao: number;
    id: number;
    authority: number;
};
var configDatas: any[] = []
export default () => {
    const { initialState } = useModel('@@initialState');
    const day = getDaysInMonth()
    const [idList, setIdList] = useState<any>([])
    const formRef = useRef<ProFormInstance>();
    const [usersList, setUsersList] = useState<any>([])
    const [provideList, setProvideList] = useState<any>([])
    const [timeLength, setTimeLength] = useState<number>(0)
    const [time, setTime] = useState<any>([getTodayDate(0), getTodayDate(1)])
    const [spinning, setSpinning] = useState<boolean>(false)
    const [ColumnData, setColumn] = useState<any>(false)
    const [ColumnData2, setColumn2] = useState<any>(false)
    const [department, setDepartment] = useState<any>([{}])
    const [targetList, setTargetList] = useState<any>([])
    const [ModalsVisible, setModalsVisible] = useState<boolean>(false)
    const [renderData, setRenderData] = useState<any>({})
    const [tableType, setTableType] = useState<any>('yeji')
    const [users, setUsers] = useState<any>([])
    const [clueList, setClueList] = useState<any>([])
    useEffect(() => {

        formRef?.current?.setFieldValue('timeRange', time)
    }, [])
    useEffect(() => {
        //console.log(initialState.currentUser.departmentId,'initialState-----')
        userList([Dictionaries.getDepartmentList(initialState?.currentUser?.userid)])

        console.log([Dictionaries.getDepartmentList(initialState?.currentUser?.userid)],'qnmd')

    }, [time, timeLength])
    useEffect(() => {
        if (tableType != 'yeji') {


            getTargetClue(idList.join(','))
        }
    }, [tableType])
    const config2 = {
        data: ColumnData2,
        isGroup: true,
        xField: 'name',
        yField: 'amount',
        seriesField: 'type',

        /** 设置颜色 */
        color: ['#FF00FF', '#FF0000'],

        /** 设置间距 */
        // marginRatio: 0.1,
        label: {
            // 可手动配置 label 数据标签位置
            position: 'middle',
            // 'top', 'middle', 'bottom'
            // 可配置附加的布局方法
            layout: [
                // 柱形图数据标签位置自动调整
                {
                    type: 'interval-adjust-position',
                }, // 数据标签防遮挡
                {
                    type: 'interval-hide-overlap',
                }, // 数据标签文颜色自动调整
                {
                    type: 'adjust-color',
                },
            ],
        },
    };
    const config = {
        data: ColumnData,
        isGroup: true,
        xField: 'name',
        yField: 'amount',
        seriesField: 'type',

        /** 设置颜色 */
        //color: ['#1ca9e6', '#f88c24'],

        /** 设置间距 */
        // marginRatio: 0.1,
        label: {
            // 可手动配置 label 数据标签位置
            position: 'middle',
            // 'top', 'middle', 'bottom'
            // 可配置附加的布局方法
            layout: [
                // 柱形图数据标签位置自动调整
                {
                    type: 'interval-adjust-position',
                }, // 数据标签防遮挡
                {
                    type: 'interval-hide-overlap',
                }, // 数据标签文颜色自动调整
                {
                    type: 'adjust-color',
                },
            ],
        },
    };
    const getAuthorityClue = () => {
        let data = idList.map((item: any) => {
            return {
                'userId': item,
                'createTime-start': changeDate(time[0]) + ' ' + '00:00:00',
                'createTime-end': time[1] + ' ' + '00:00:00',
            }
        })
        let array = {
            array: JSON.stringify(data)
        }
        return array
    }
    const getTargetClue = async (ids: any) => {
        if (clueList.length > 0) return
        const timeAll = getFirstAndLastDayOfMonth()
        setSpinning(true)
        const data5 = (await request.get('/sms/business/bizTarget', {
            'userId-in': ids, type: 7, startTime: timeAll.firstDay,
            endTime: timeAll.lastDay, _isGetAll: true
        })).data.content
        const data8 = (await request.get('/sms/business/bizTarget', {
            'userId-in': ids, type: 8, startTime: timeAll.firstDay,
            endTime: timeAll.lastDay, _isGetAll: true
        })).data.content
        const data6 = (await request.get('/sms/business/bizStudent/statistics/provider', getprovider(ids))).data
        const data7 = (await request.get('/sms/business/bizStudent/statistics/provider', getproviders(ids))).data
        let list: any = []
        let list2: any = []
        const usersList = JSON.parse(JSON.stringify(users))
        const usersList2 = JSON.parse(JSON.stringify(users))
        usersList2.forEach((item: { id: any; dealCount: any; amountValue: any; achievementMubiao: any; MonthAmount: any; amount: any; RefundsAmount: any; RefundsMonthAmount: any; authority: any; }, index: string | number) => {
            data8.forEach((itemMonth: any) => {
                if (item.id == itemMonth.userId) {
                    item.achievementMubiao = itemMonth.count
                }

            })
            data6.forEach((itemCount: any) => {
                if (item.id == itemCount.id) {
                    item.MonthAmount = itemCount.amount
                    item.dealCount = itemCount.dealCount
                    // item.amount = itemCount.amount
                }

            })
            data7.forEach((itemCount: any) => {
                if (item.id == itemCount.id) {
                    item.amount = itemCount.amount
                }

            })
            if (item.amount || item.MonthAmount || item.RefundsAmount || item.RefundsMonthAmount || item.authority) {
                list2.push(item)
            }
        })
        usersList.forEach((item: { id: any; dealCount: any; amountValue: any; achievementMubiao: any; MonthAmount: any; amount: any; RefundsAmount: any; RefundsMonthAmount: any; authority: any; }, index: string | number) => {
            data5.forEach((itemMonth: any) => {
                if (item.id == itemMonth.userId) {
                    item.achievementMubiao = itemMonth.count
                }

            })
            data6.forEach((itemCount: any) => {
                if (item.id == itemCount.id) {
                    item.MonthAmount = itemCount.count
                    item.dealCount = itemCount.dealCount
                    item.amountValue = itemCount.amount
                }

            })
            data7.forEach((itemCount: any) => {
                if (item.id == itemCount.id) {
                    item.amount = itemCount.count
                }

            })
            // item.MonthAmount = data6[index]
            // item.amount = data7[index]
            if (item.amount || item.MonthAmount || item.RefundsAmount || item.RefundsMonthAmount || item.authority) {
                list.push(item)
            }
        })

        setSpinning(false)
        setClueList(list)
        setProvideList(list2)
    }
    const getTarget = async (id: number) => {
        const time = getFirstAndLastDayOfMonth()
        const list = (await request.get('/sms/business/bizTarget', {
            departmentId: id,
            startTime: time.firstDay,
            endTime: time.lastDay,
        })).data.content
        setTargetList(list)
    }
    const userList = async (list: any) => {

        let userIds: any[] = []
        let users: { name: any; id: any; }[] = []
        const userListDi = async (listChildren: { userId: any; name: any; children: any; }[]) => {

            listChildren.forEach((item: any) => {
                if (item.userId) { // && item.enable
                    userIds.push(item.userId)
                    users.push({
                        name: item.name,
                        id: item.userId
                    })
                }
                if (item.children) {
                    userListDi(item.children)
                }
            })
        }
        await userListDi(list)
        setUsers(users)
        setDepartment(list)
        getContentList(userIds.join(','), users)
        getTarget(list[0].id)
        setIdList(userIds)

    }
    const changeDate = (inputDate: string) => {
        var dateParts = inputDate.split("-");
        var year = dateParts[0];
        var month = dateParts[1];
        var day = "01"; // Changing the day to 01

        return year + '-' + month + '-' + day;
    }
    const getArray2 = (ids: any) => {
        return {
            startTime: time[0],
            endTime: time[1],
            idList: ids,
            type: 1
        }
    }
    const getArray = (ids: any) => {
        return {
            startTime: changeDate(time[0]),
            endTime: time[1],
            idList: ids,
            type: 1
        }
    }
    const getAuthority = (userIds: any, type: string) => {
        let data = userIds.map((item: any) => {
            if (type == 'userId') {
                return {
                    'userId': Number(item),
                    'createTime-start': changeDate(time[0]),
                    'createTime-end': time[1],
                    type: 3
                }
            } else {
                return {
                    'createBy': Number(item),
                    'createTime-start': changeDate(time[0]),
                    'createTime-end': time[1],
                    type: 3
                }
            }

        })
        let array = {
            array: JSON.stringify(data)
        }
        return array
    }
    const getprovider = (idList: any) => {
        return {
            startTime: changeDate(time[0]),
            endTime: time[1],
            _isGetAll: true,
            enable: true,
            idList: idList
        }
    }
    const getproviders = (idList: any) => {
        return {
            startTime: time[0],
            endTime: time[1],
            _isGetAll: true,
            enable: true,
            idList: idList
        }
    }
    const getAuthoritys = (userIds: any, type: string) => {
        let data = userIds.map((item: any) => {
            if (type == 'userId') {
                return {
                    'userId': item,
                    'createTime-start': time[0],
                    'createTime-end': time[1],
                    type: 3
                }
            } else {
                return {
                    'createBy': item,
                    'createTime-start': time[0],
                    'createTime-end': time[1],
                    type: 3
                }
            }

        })
        let array = {
            array: JSON.stringify(data)
        }
        return array
    }
    const getContentList = async (ids: string, users: any[]) => {
        setSpinning(true)
        const timeAll = getFirstAndLastDayOfMonth()
        const data = (await request.get('/sms/business/bizCharge/getPersonNewOrder', {
            startTime: time[0],
            endTime: time[1],
            userIdList: ids
            //departmentId: initialState?.currentUser?.departmentId
        })).data
        const data2 = (await request.get('/sms/business/bizStudent/statistics/user', {
            startTime: changeDate(time[0]),
            endTime: time[1],
            idList: ids,
            type: 0
        })).data
        let array2 = getArray2(ids)
        const data3 = (await request.get('/sms/business/bizStudent/statistics/user', array2)).data
        let array = getArray(ids)
        const data4 = (await request.get('/sms/business/bizStudent/statistics/user', array)).data
        const data5 = (await request.get('/sms/business/bizTarget', { 'userId-in': ids.split(','), type: 1, startTime: timeAll.firstDay, endTime: timeAll.lastDay, _isGetAll: true })).data.content
        const data6 = (await request.get('/sms/business/bizAuthorityLog/statistics', getAuthority(ids.split(','), 'userId'))).data
        let arr: any[] = []
        users.forEach((item, index) => {
            data.forEach((itemToDay: { id: any; amount: number; }) => {
                if (itemToDay.id == item.id) {
                    item.amount = itemToDay.amount
                }
            })
            data2.forEach((itemMonth: { id: any; amount: number; }) => {
                if (itemMonth.id == item.id && itemMonth.amount > 0) {
                    item.MonthAmount = itemMonth.amount
                }
            })
            data3.forEach((itemMonth: { id: any; amount: number; }) => {
                if (itemMonth.id == item.id) {
                    item.RefundsAmount = itemMonth.amount
                }
            })
            data4.forEach((itemMonth: { id: any; amount: number; }) => {
                if (itemMonth.id == item.id) {
                    item.RefundsMonthAmount = itemMonth.amount
                }
            })
            data5.forEach((itemMonth: any) => {
                if (item.id == itemMonth.userId) {
                    item.achievementMubiao = itemMonth.count
                }

            })
            item.authority = data6[index]
            // item.RefundsAmount = data3[index].amount
            // item.RefundsMonthAmount = data4[index].amount
            if (!item.MonthAmount) {
                item.MonthAmount = 0
            }
            if (item.amount || item.MonthAmount || item.RefundsAmount || item.RefundsMonthAmount || item.authority) {
                arr.push(item)
            }
        })
        arr.sort((a, b) => b.MonthAmount - a.MonthAmount)
        console.log('arr', arr);

        let configData: { name: any; type: string; amount: any; }[] = []
        let configData2: { name: any; type: string; amount: any; }[] = []
        arr.forEach((item) => {
            configData.push({
                name: item.name,
                type: '今日业绩',
                amount: item.amount ? item.amount : 0
            },
                {
                    name: item.name,
                    type: '本月业绩',
                    amount: item.MonthAmount
                }
            )
            configData2.push({
                name: item.name,
                type: '今日退费',
                amount: item.RefundsAmount ? item.RefundsAmount : 0
            },
                {
                    name: item.name,
                    type: '本月退费',
                    amount: item.RefundsMonthAmount ? item.RefundsMonthAmount : 0
                }
            )
        })
        setUsersList(arr)
        setColumn(configData)
        setColumn2(configData2)
        setSpinning(false)
    }

    const monthAmount = (index: number, Mubiao: any) => {
        let today = new Date();
        let days: number = today.getDate();
        let monthDayAmount: any = Math.ceil(Mubiao / day)
        return Math.ceil(monthDayAmount * days)


    }
    const monthTarget = () => {
        let num: any
        if (tableType == 'yeji') {
            targetList.forEach((item: { type: number; count: number; }) => {
                if (item.type == 3) {
                    num = item.count
                }
            })
        }
        if (tableType == 'xiansuo') {
            clueList.forEach((item: { achievementMubiao: number }) => {
                if (item.achievementMubiao) {
                    if (num) {
                        num = num + item.achievementMubiao
                    } else {
                        num = item.achievementMubiao
                    }
                }


            })
        }
        if (tableType == 'tigong') {
            provideList.forEach((item: { achievementMubiao: number }) => {
                if (item.achievementMubiao) {
                    if (num) {
                        num = num + item.achievementMubiao
                    } else {
                        num = item.achievementMubiao
                    }
                }


            })
        }


        return num
    }
    const columns: ProColumns<GithubIssueItem>[] = [
        {
            title: '姓名',
            dataIndex: 'name',
            width: 160,
            render: (text, record) => (
                <a className="green" onClick={() => {
                    history.push('/department/user?userId=' + record.id + '&name=' + record.name)
                }}>{record.name}</a>
            )
        },
        {
            title: '月目标',
            dataIndex: 'achievementMubiao',
            width: 160,
            render: (text, record) => (
                <span >{record.achievementMubiao ? record.achievementMubiao : '尚未设置本月目标'}</span>
            )
        },
        {
            title: '月完成进度',
            dataIndex: 'MonthAmount',
            width: 160,
            render: (text, record, index) => (
                <span className={record.MonthAmount - monthAmount(index, record.achievementMubiao) > 0 ? "green" : 'red'}>{record.MonthAmount ? record.MonthAmount : 0}</span>
            )
        },
        {
            title: '月轨道值',
            dataIndex: 'MonthAmounts',
            width: 160,
            render: (text, record, index) => (
                <span>{record.achievementMubiao ? monthAmount(index, record.achievementMubiao) : '尚未设置本月目标'}</span>
            )
        },
        {
            title: '日目标',
            dataIndex: 'amounts',
            width: 160,
            render: (text, record, index) => (
                <span>{record.achievementMubiao ? Math.ceil(record.achievementMubiao / day) : '尚未设置本月目标'}</span>
            )
        },
        {
            title: '日完成度',
            dataIndex: 'amount',
            width: 160,
            sorter: (a, b) => b.amount - a.amount,
            render: (text, record) => (
                <a className={record.amount - (record.achievementMubiao / day) > 0 ? "green" : 'red'}>{record.amount}</a>
            )
        },
        {
            title: '日完成度百分比',
            dataIndex: 'amountb',
            width: 160,
            sorter: (a, b) => b.amount - a.amount,
            render: (text, record) => (
                <a className={record.amount - (record.achievementMubiao / day) > 0 ? "green" : 'red'}>
                    {record.achievementMubiao ? ((record.amount / Math.ceil(record.achievementMubiao / day)) * 100).toFixed(2) + '%' : '0%'}

                </a>
            )
        },
        {
            title: '今日退费',
            dataIndex: 'RefundsAmount',
            hideInTable: tableType != 'yeji',
            width: 160,
            render: (text, record) => (
                <a className="red">{record.RefundsAmount}</a>
            )
        },
        {
            title: '本月退费',
            dataIndex: 'RefundsMonthAmount',
            hideInTable: tableType != 'yeji',
            render: (text, record) => (
                <a className="red">{record.RefundsMonthAmount}</a>
            )
        },
        {
            title: '本月获客数量',
            dataIndex: 'authority',
            hideInTable: tableType != 'yeji',
            render: (text, record) => (
                <a className="green"
                    onClick={() => {
                        setRenderData({
                            userId: record.id,
                            'createTime-start': changeDate(time[0]),
                            'createTime-end': time[1],
                            type: 3
                        })
                        setModalsVisible(true)
                    }}
                >{record.authority}</a>
            )
        },
        {
            title: '信息提供成交量',
            key: 'dealCount',
            width: 160,
            dataIndex: "dealCount",
            hideInTable: tableType != 'xiansuo',
        },
        {
            title: '信息提供成交转化率',
            key: 'Transactionrate',
            width: 160,
            dataIndex: "Transactionrate",
            hideInTable: tableType != 'xiansuo',
            render: (text, record) => (
                <span>{record.MonthAmount ? (record.dealCount / record.MonthAmount * 100).toFixed(2) : 0}%</span>
            )
        },

    ]
    const getMonth = () => {
        let num = 0
        if (tableType == 'yeji') {
            num = usersList.reduce((total: any, item: { MonthAmount: any; }) => total + item.MonthAmount, 0)
        } else if (tableType == 'xiansuo') {
            num = clueList.reduce((total: any, item: { MonthAmount: any; }) => total + item.MonthAmount, 0)
        } else {
            num = provideList.reduce((total: any, item: { MonthAmount: any; }) => total + item.MonthAmount, 0)
        }
        return num
    }
    const dayAmountFn = () => {
        let num: any = ''
        if (tableType == 'yeji') {
            num = Math.ceil(monthTarget() / day)
        }
        if (tableType == 'xiansuo') {
            clueList.forEach((item: { achievementMubiao: number }) => {
                if (item.achievementMubiao) {
                    if (num) {
                        num = num + Math.ceil(item.achievementMubiao / day)
                    } else {
                        num = Math.ceil(item.achievementMubiao / day)
                    }
                }


            })
        }
        if (tableType == 'tigong') {
            provideList.forEach((item: { achievementMubiao: number }) => {
                if (item.achievementMubiao) {
                    if (num) {
                        num = num + Math.ceil(item.achievementMubiao / day)
                    } else {
                        num = Math.ceil(item.achievementMubiao / day)
                    }
                }


            })
        }
        return num
    }
    const dayAmounts = () => {
        if (tableType == 'yeji') {
            return usersList.reduce((total: any, item: { amount: any; }) => total + item.amount, 0)
        } else if (tableType == 'xiansuo') {
            return clueList.reduce((total: any, item: { amount: any; }) => total + item.amount, 0)
        } else {
            return provideList.reduce((total: any, item: { amount: any; }) => total + item.amount, 0)
        }

    }
    const monthAmountsFn = () => {
        let num: any
        let today = new Date();
        num = dayAmountFn() * today.getDate()
        return num
    }
    const getTransactionrate = () => {
        const a = clueList.reduce((total: any, item: { dealCount: any; }) => total + item.dealCount, 0)
        const b = getMonth()
        return ((a / b) * 100).toFixed(2) + '%'
    }
    const getamountb = () => {
        let num = '0%'
        if (dayAmounts() && dayAmountFn()) {
            num = (dayAmounts() / dayAmountFn() * 100).toFixed(2) + '%'
        }
        return num
    }
    const summaryRow = {
        name: department[0].departmentName,
        achievementMubiao: monthTarget(),
        MonthAmount: getMonth(),
        MonthAmounts: monthAmountsFn(),
        amounts: dayAmountFn(),
        amount: dayAmounts(),
        amountb: getamountb(),
        RefundsAmount: usersList.reduce((total: any, item: { RefundsAmount: any; }) => total + item.RefundsAmount, 0),
        RefundsMonthAmount: usersList.reduce((total: any, item: { RefundsMonthAmount: any; }) => total + item.RefundsMonthAmount, 0),
        authority: '',
        dealCount: clueList.reduce((total: any, item: { dealCount: any; }) => total + item.dealCount, 0),
        amountValue: clueList.reduce((total: any, item: { amountValue: any; }) => total + item.amountValue, 0),
        Transactionrate: getTransactionrate()
    };
    const getfooter = () => {
        let columnsNew: JSX.Element[] = []
        columns.forEach((item, index) => {
            if (!item.hideInTable) {
                columnsNew.push(<td key={'Transactionrate' + index} className="ant-table-cell" style={{ width: tableType == 'yeji' ? '210px' : tableType == 'xiansuo' ? '200px' : '230px' }}>{summaryRow[item.dataIndex]}</td>)
            }
        })
        return columnsNew
    }
    let toolbar = {
        menu: {
            type: 'tab',
            items: [
                {
                    key: 'yeji',
                    label: (<span>业绩统计</span>)
                },
                {
                    key: 'xiansuo',
                    label: (<span>录入线索统计</span>)
                },
                {
                    key: 'tigong',
                    label: (<span>信息提供成交金额统计</span>)
                },
            ],
            onChange: (key: string) => {
                setTableType(key)
            }
        }
    }

    return (
        <PageContainer>
            <ProCard>
                <div style={{ width: '100%', display: 'flex' }}>
                    <Row gutter={24} style={{ width: '100%' }}>
                        <Col span={4}>
                            <Statistic title="部门" value={department[0]?.departmentName} />
                        </Col>
                        <Col span={4}>
                            <Statistic title="今日业绩" valueStyle={{ color: '#3f8600' }} value={dayAmounts()} precision={2} />
                        </Col>
                        <Col span={4}>
                            <Statistic title="本月业绩" valueStyle={{ color: '#3f8600' }} value={getMonth()} precision={2} />

                        </Col>
                        <Col span={4}>
                            <Statistic title="本月目标" value={monthTarget()} precision={2} />
                            <Progress percent={(getMonth() / monthTarget() * 100).toFixed(2)} />
                        </Col>
                        <Col span={4}>
                            <Statistic title="本月退费" valueStyle={{ color: '#cf1322' }} value={usersList.reduce((total: any, item: { RefundsAmount: any; }) => total + item.RefundsAmount, 0)} precision={2} />
                        </Col>
                    </Row>
                </div>
            </ProCard>
            <ProCard>
                <ProForm
                    formRef={formRef}
                    onFinish={async (values) => {
                        console.log(values);
                        setTime(values.timeRange)
                    }}
                    onReset={() => {
                        setTime([getTodayDate(0), getTodayDate(1)])
                    }}
                >
                    <ProFormDateTimeRangePicker fieldProps={{ showTime: false }} name="timeRange" label="时间区间" />
                </ProForm>
            </ProCard>
            <ProCard>
                <Spin spinning={spinning}>
                    <Tables
                        search={false}
                        className="ECContent"
                        columns={columns}
                        dataSource={tableType == 'yeji' ? usersList : tableType == 'xiansuo' ? clueList : provideList}
                        toolbar={toolbar}
                        footer={() => (
                            <tr >
                                {getfooter()}
                            </tr>
                        )}

                    />

                </Spin>
            </ProCard>
            <ProCard>
                {ColumnData && <Column {...config} />}
                {ColumnData2 && <Column {...config2} />}
            </ProCard>
            {
                ModalsVisible && <AuthorityTable
                    ModalsVisible={ModalsVisible}
                    setModalsVisible={() => setModalsVisible(false)}
                    renderData={renderData}
                />
            }
        </PageContainer>
    )
}