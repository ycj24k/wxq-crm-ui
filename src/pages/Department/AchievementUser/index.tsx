import { PageContainer } from "@ant-design/pro-layout"
import { useEffect, useRef, useState } from "react"
import request from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import ProCard from "@ant-design/pro-card";
import Tables from "@/components/Tables";
import { ProColumns } from "@ant-design/pro-table";
import { Column } from '@ant-design/plots';
import { DualAxes } from '@ant-design/plots';
import ProForm, { ProFormDateTimeRangePicker, ProFormInstance, ProFormTimePicker } from "@ant-design/pro-form";
import './index.less'
import { useModel } from "umi";
import Modals from './Modal'
import ModalCharge from "./ModalCharge";
import { Col, Modal, Row, Statistic, Spin } from "antd";
import { getFirstAndLastDayOfMonth, getDaysInMonth, getTodayDate, getTodayDates, getAllTimesInPeriod, getDaysInMonthBeforeToday } from './getTime'
import Performance from '../../Business/Statistics/Performance'
import { history } from "umi";
type GithubIssueItem = {
    name: string;
    amount: number;
    MonthAmount: number;
    RefundsAmount: number;
    RefundsMonthAmount: number;
    time: number;
};
var configDatas: any[] = []
export default () => {
    const { initialState } = useModel('@@initialState');
    let userId = history.location.query?.userId ? history.location.query.userId : initialState?.currentUser?.userid
    let name = history.location.query?.userId ? history.location.query.name : initialState?.currentUser?.name
    const formRef = useRef<ProFormInstance>();
    const [usersList, setUsersList] = useState<any>([])
    const [culeList, setCuleList] = useState<any>([])
    const [provideList, setProvideList] = useState<any>([])
    const [time, setTime] = useState<any>([getTodayDate(0), getTodayDate(1)])
    const [spinning, setSpinning] = useState<boolean>(false)
    const [ColumnData, setColumn] = useState<any>(false)
    const [ColumnData2, setColumn2] = useState<any>(false)
    // const [userId, setUserId] = useState(initialState?.currentUser?.userid)
    const [modalVisible, setModalVisible] = useState(false);
    const [renderData, setRenderData] = useState<any>();
    const [callMubiao, setCallMubiao] = useState<any>(0);
    const [clueNumber, setclueNumber] = useState<any>(0);
    const [provideNumber, setProvideNumber] = useState<any>(0);
    const [achievementMubiao, setAchievementMubiao] = useState<any>(0);
    const [timeArr, setTimeArr] = useState<any>(getDaysInMonthBeforeToday());
    const [modalsOpen, setModalsOpen] = useState<boolean>(false)
    const [chargeType, setChargeType] = useState<any>('chargeList')
    const [tableType, setTableType] = useState<any>('yeji')
    const [LsitFalg, setListFalg] = useState(false);
    const day = getDaysInMonth()
    useEffect(() => {
        // formRef?.current?.setFieldValue('timeRange', time)
        getMuBiao()

    }, [timeArr])
    useEffect(() => {
        if (tableType != 'yeji') {
            getClueContent()
        }
    }, [tableType])
    const getMuBiao = async () => {
        const time = getFirstAndLastDayOfMonth()
        let data: any = {
            startTime: time.firstDay,
            endTime: time.lastDay,
            userId: userId
        }
        const call = (await request.get('/sms/business/bizTarget', { ...data, type: 0 })).data.content[0]
        const achievement = (await request.get('/sms/business/bizTarget', { ...data, type: 1 })).data.content[0]
        const clueNumber = (await request.get('/sms/business/bizTarget', { ...data, type: 7 })).data.content[0]
        const provideNumber = (await request.get('/sms/business/bizTarget', { ...data, type: 8 })).data.content[0]
        if (call) {
            setCallMubiao(call.count)
        }
        if (clueNumber) {
            setclueNumber(clueNumber.count)
        }
        if (provideNumber) {
            setProvideNumber(provideNumber.count)
        }
        if (achievement) {
            setAchievementMubiao(achievement.count)
            getContentList(achievement.count)
        } else {
            getContentList(0)
        }

    }
    const getArrayClue = (timeList: any[]) => {

        return {
            'userId': userId,
            'startTime': timeList[0] + ' ' + '00:00:00',
            'endTime': timeList[timeList.length - 1] + ' ' + '23:59:59',
        }


    }
    const getClueContent = async () => {
        if (culeList.length > 0) return
        let list = (await request.get('/sms/business/bizStudent/statistics/providerOfDay', getArrayClue(timeArr))).data
        const clueLists = timeArr.map((item: any, index: number) => {
            return {
                time: item,
                amount: list[item]?.count,
                // offerAmount: list[item]?.amount
            }
        })
        const provideLists = timeArr.map((item: any, index: number) => {
            return {
                time: item,
                amount: list[item]?.amount,
                // offerAmount: list[item]?.amount
            }
        })
        setProvideList(provideLists)
        setCuleList(clueLists)
    }
    const getDayClue = () => {
        let num: any = '尚未设置本月目标';
        let cule = tableType == 'yeji' ? achievementMubiao : tableType == 'xiansuo' ? clueNumber : provideNumber
        if (cule) num = Math.ceil(cule / day)
        return num
    }

    const config = {
        data: ColumnData,
        isGroup: true,
        xField: 'time',
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
    const getArray = (timeList: any[]) => {

        return {
            'userId': userId,
            'startTime': timeList[0] + ' ' + '00:00:00',
            'endTime': timeList[timeList.length - 1] + ' ' + '23:59:59',
            type: '0'
        }
    }
    const getArray2 = (timeList: any[]) => {

        return {
            'userId': userId,
            'startTime': timeList[0] + ' ' + '00:00:00',
            'endTime': timeList[timeList.length - 1] + ' ' + '23:59:59',
            type: '1'
        }
    }
    const getContentList = async (Mubiao: any) => {
        if (usersList.length > 0 && LsitFalg) return
        setSpinning(true)
        let array = getArray(timeArr)
        let array2 = getArray2(timeArr)

        const data = (await request.get('/sms/business/bizStudent/statistics/userOfDay', array)).data
        const data2 = (await request.get('/sms/business/bizStudent/statistics/userOfDay', array2)).data
        let List = timeArr.map((item: any, index: string | number) => {
            return {
                time: item,
                amount: data[item]?.amount,
                RefundsAmount: data2[item]?.amount
            }
        })
        let configData: any = []
        let configData2: any = []
        List.forEach((item: any, index: number) => {
            configData.push({
                time: item.time,
                type: '今日业绩',
                amount: item.amount ? item.amount : 0
            },
                {
                    time: item.time,
                    type: '日目标',
                    amount: Mubiao ? (Mubiao / day).toFixed(2) : 0
                },
                {
                    time: item.time,
                    type: '本月业绩',
                    amount: toDayAmount(index, List)
                },
                {
                    time: item.time,
                    type: '月轨道值',
                    amount: Mubiao ? monthAmount(index, Mubiao) : 0
                }
            )
        })
        setColumn(configData)
        setColumn2(configData2)
        setUsersList(List)
        setSpinning(false)
        setListFalg(true)
    }


    const toDayAmount = (index: number) => {

        let list = tableType == 'yeji' ? usersList : tableType == 'xiansuo' ? culeList : provideList
        let amount = 0
        list.forEach((item: { amount: number; }, indexs: number) => {
            if (indexs <= index) {
                amount = amount + item.amount
            }
        })
        return amount
    }
    const toDayAmountB = (index: number) => {
        let num = '0%'
        let clue = tableType == 'yeji' ? achievementMubiao : tableType == 'xiansuo' ? clueNumber : provideNumber
        if (clue) {
            num = (index / (clue / day) * 100).toFixed(2) + '%'
        }
        return num
    }
    const monthAmount = (index: number, Mubiao: any = achievementMubiao) => {
        let num = tableType == 'yeji' ? achievementMubiao : tableType == 'xiansuo' ? clueNumber : provideNumber
        let monthDayAmount: any = (num / day).toFixed(2)
        return Math.ceil(monthDayAmount * (index + 1))


    }
    const GoChargeList = (time: any) => {
        const timeData = new Date(time)

        setRenderData({
            'chargeTime-start': time,
            'chargeTime-end': getTodayDates(timeData.getDate() + 1)
        })

        setModalsOpen(true)
    }
    const getAchievementMubiao = () => {
        let str = '尚未设置本月目标'
        switch (tableType) {
            case 'yeji':
                if (achievementMubiao) str = achievementMubiao
                break
            case 'xiansuo':
                if (clueNumber) str = clueNumber
                break
            case 'tigong':
                if (provideNumber) str = provideNumber
                break
        }
        return str
    }
    const columns: ProColumns<GithubIssueItem>[] = [
        {
            title: '日期',
            dataIndex: 'time',
            width: 180
        },
        {
            title: '月目标',
            width: 180,
            dataIndex: 'achievementMubiao',
            render: (text, record) => (
                <>
                    {
                        getAchievementMubiao()
                    }
                </>
            )
        },
        {
            title: '月完成进度',
            width: 180,
            dataIndex: 'achievementMubiaos',
            render: (text, record, index) => (
                <span className={toDayAmount(index) - monthAmount(index) > 0 ? "green" : 'red'}>{toDayAmount(index)}</span>
            )
        },
        {
            title: '月轨道值',
            width: 180,
            dataIndex: 'achievementMubiaoa',
            render: (text, record, index) => (

                <span>{achievementMubiao ? monthAmount(index) : '尚未设置本月目标'}</span>
            )
        },
        {
            title: '日目标',
            width: 180,
            dataIndex: 'achievementMubiaoday',
            render: (text, record, index) => (
                <span>{getDayClue()}</span>
            )
        },
        {
            title: '日完成度(点击金额查看详情)',
            dataIndex: 'amount',
            sorter: (a, b) => b.amount - a.amount,
            width: 180,
            render: (text, record) => (
                <a className={record.amount - getDayClue() > 0 ? "green" : 'red'}
                    onClick={() => {
                        if (record.amount != 0) {
                            GoChargeList(record.time)
                            setChargeType('chargeList')
                        }

                    }}
                >{record.amount}</a>
            )
        },
        {
            title: '日完成度百分比',
            dataIndex: 'amountb',
            width: 180,
            render: (text, record) => (
                <a className={record.amount - (achievementMubiao / day) > 0 ? "green" : 'red'}>
                    {toDayAmountB(record.amount)}

                </a>
            )
        },
        {
            title: '退费(点击金额查看详情)',
            dataIndex: 'RefundsAmount',
            hideInTable: tableType != 'yeji',
            hideInDescriptions: tableType != 'yeji',
            render: (text, record) => (
                <a className="red"
                    onClick={() => {
                        if (record.amount != 0) {
                            GoChargeList(record.time)
                            setChargeType('refundList')
                        }

                    }}
                >{record.RefundsAmount}</a>
            )
        },

    ]
    const getachievementMubiaos = () => {
        let num = 0
        if (tableType == 'yeji') {
            num = usersList.reduce((total: any, item: { amount: any; }) => total + item.amount, 0)
        } else if (tableType == 'xiansuo') {
            num = culeList.reduce((total: any, item: { amount: any; }) => total + item.amount, 0)
        } else {
            num = provideList.reduce((total: any, item: { amount: any; }) => total + item.amount, 0)
        }
        return num
    }
    const summaryRow = {
        time: '总计',
        achievementMubiao: tableType == 'yeji' ? achievementMubiao : tableType == 'xiansuo' ? clueNumber : provideNumber,
        achievementMubiaos: getachievementMubiaos(),
        achievementMubiaoa: '',
        achievementMubiaoday: '',
        amount: '',
        amountb: '',
        RefundsAmount: usersList.reduce((total: any, item: { RefundsAmount: any; }) => total + item.RefundsAmount, 0),
    };
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
    const getfooter = () => {
        let columnsNew: JSX.Element[] = []
        columns.forEach((item, index) => {
            if (!item.hideInTable) {
                columnsNew.push(<td key={'Transactionrate' + index} className="ant-table-cell" style={{ width: '180px' }}>{summaryRow[item.dataIndex]}</td>)
            }
        })
        return columnsNew
    }
    return (
        <PageContainer>
            <ProCard>
                <div style={{ width: '100%', display: 'flex' }}>
                    <Row gutter={24} style={{ width: '100%' }}>
                        <Col span={3}>
                            <Statistic title="姓名" value={name} />
                        </Col>
                        <Col span={3}>
                            <Statistic title="今日业绩" valueStyle={{ color: '#3f8600' }} value={usersList[usersList.length - 1]?.amount} precision={2} />
                        </Col>
                        <Col span={3}>
                            <Statistic title="本月业绩" valueStyle={{ color: '#3f8600' }} value={usersList.reduce((total: any, item: { amount: any; }) => total + item.amount, 0)} precision={2} />
                        </Col>
                        <Col span={3}>
                            <Statistic title="本月目标" value={achievementMubiao} precision={2} />
                            <a
                                onClick={() => {
                                    setRenderData({ typeNumber: 1, type: 'performance', userId: userId })
                                    setModalVisible(true)
                                }}
                            >设置目标</a>
                        </Col>
                        <Col span={3}>
                            <Statistic title="通话量" value={callMubiao} />
                            <a
                                onClick={() => {
                                    setRenderData({ typeNumber: 0, type: 'Phone', userId: userId })
                                    setModalVisible(true)
                                }}
                            >设置通话量</a>
                        </Col>
                        <Col span={3}>
                            <Statistic title="录入线索量" value={clueNumber} />
                            <a
                                onClick={() => {
                                    setRenderData({ typeNumber: 7, type: 'clue', userId: userId })
                                    setModalVisible(true)
                                }}
                            >设置录入线索量目标</a>
                        </Col>
                        <Col span={3}>
                            <Statistic title="信息提供成交金额" value={provideNumber} />
                            <a
                                onClick={() => {
                                    setRenderData({ typeNumber: 8, type: 'tigong', userId: userId })
                                    setModalVisible(true)
                                }}
                            >设置目标</a>
                        </Col>
                        <Col span={3}>
                            <Statistic title="本月退费" valueStyle={{ color: '#cf1322' }} value={usersList.reduce((total: any, item: { RefundsAmount: any; }) => total + item.RefundsAmount, 0)} precision={2} />
                        </Col>
                    </Row>
                </div>
            </ProCard>
            <ProCard>
                <ProForm
                    formRef={formRef}
                    onFinish={async (values) => {
                        const times = values.timeRange
                        setListFalg(false)
                        setTimeArr(getAllTimesInPeriod(times[0], times[times.length - 1]))
                    }}
                    onReset={() => {
                        setListFalg(false)
                        setTimeArr(getDaysInMonthBeforeToday())
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
                        dataSource={tableType == 'yeji' ? usersList : tableType == 'xiansuo' ? culeList : provideList}
                        pagesizes={31}
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
                {/* {ColumnData2 && <Column {...config2} />} */}
                <Performance
                    startTime={timeArr[0]}
                    endTime={timeArr[timeArr.length - 1]}
                    id={userId}
                />
            </ProCard>

            {modalVisible && (
                <Modals
                    modalVisible={modalVisible}
                    setModalVisible={() => setModalVisible(false)}
                    // callbackRef={() => getContentList()}
                    renderData={renderData}
                />
            )}
            {modalsOpen && (
                <ModalCharge
                    modalVisible={modalsOpen}
                    setModalVisible={() => setModalsOpen(false)}
                    userId={userId}
                    renderData={renderData}
                    chargeType={chargeType}
                />
            )}

        </PageContainer>
    )
}