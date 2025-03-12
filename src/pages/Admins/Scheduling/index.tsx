




import { useEffect, useRef, useState } from "react";
import { ActionType, ProColumns } from "@ant-design/pro-table";
import { Badge, BadgeProps, Button, Calendar, message, Space, Tag } from "antd";
import request from '@/services/ant-design-pro/apiRequest';
import moment from 'moment';
import ModelAdd from './ModelAdd';
import { PageContainer } from "@ant-design/pro-layout";
import type { Moment } from 'moment';
import { formatDate, getDaysInMonths, getFirstAndLastDayOfMonth } from '../../Department/AchievementUser/getTime'
import ProCard from "@ant-design/pro-card";

export default () => {
    const [renderData, setRenderData] = useState<any>(null);
    const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
    const [listContent, SetListData] = useState<any>([{ userName: 'hh' }])
    const [MonthToday, setMonthToday] = useState<any>(moment().month() + 1)
    // const [time, setTime] = useState<any>({ createTime: '', endTime: '' })
    const actionRef = useRef<ActionType>();
    let url = '/sms/business/BizSchedule'
    const callbackRef = () => {
    };

    useEffect(() => {

        getSchedule(getFirstAndLastDayOfMonth(), new Date())

    }, [])
    useEffect(() => {

    }, [listContent])
    const getSchedule = async (date, monthsDay) => {
        let list = (await request.get('/sms/business/bizSchedule', { 'date-start': date.firstDay, 'date-end': date.lastDay, _isGetAll: true })).data.content
        if (list.length < 29) {
            list = getDaysInMonths(monthsDay).map((item) => {
                return {
                    date: item,
                    isWork: true
                }
            })
        }

        SetListData(list)
    }
    const getListData = (value: Moment) => {
        let listData: any = [];
        const currentMonth = value.month();

        listContent.forEach((item: any) => {
            if (moment(item.date).date() == value.date() && moment(item.date).month() == currentMonth) {
                listData.push({ type: item.isWork ? 'success' : 'error', content: `${item.isWork ? '工作日' : '休息日'}` })
            }
        })
        return listData || [];
    };




    const dateCellRender = (value: Moment) => {
        const listData = getListData(value);


        return (
            <ul className="events">
                {listData.map(item => (
                    <li key={item.content}>
                        <Badge status={item.type as BadgeProps['status']} text={item.content} />
                    </li>
                ))}
            </ul>
        );
    };
    const onSelect = (data) => {
        const selectedMonth = data.month() + 1;
        setMonthToday(selectedMonth)

        // 获取选择的日期的月份

        // const selectedDay = data.date();
        console.log('2', selectedMonth);
        // 判断用户是点击了日期还是切换了月份
        if (MonthToday === selectedMonth) {
            SetListDatas({
                date: formatDate(data._d)
            })
            // setRenderData({ type: 'eidt', isWork: getIsWork(formatDate(data._d)), date: formatDate(data._d) })
            // setModalVisible(true)
        } else {
            getSchedule(getFirstAndLastDayOfMonth(data._d), data._d)

        }
    }
    const getIsWork = (date: string) => {
        const data = JSON.parse(JSON.stringify(listContent))
        let falg = true
        data.forEach((item: { date: string; isWork: boolean; }) => {
            if (item.date == date) {
                falg = item.isWork
            }
        })
        return falg
    }
    const SetListDatas = (value: any) => {



        const data = JSON.parse(JSON.stringify(listContent))
        data.forEach((item: any) => {
            if (item.date == value.date + ' ' + "00:00:00") {
                item.isWork = !item.isWork
            }
        })
        SetListData(data)
    }
    const update = () => {
        console.log('listContent', listContent);

        request.postAll('/sms/business/bizSchedule/saveArray', { array: listContent }).then((res) => {
            if (res.status == 'success') {
                message.success('更新成功')
            }
        })
    }
    return (
        <PageContainer>
            <ProCard>
                <Button type="primary" onClick={() => update()}>更新排班</Button>
                <Calendar dateCellRender={dateCellRender} onSelect={onSelect} />
            </ProCard>


            {modalVisibleFalg && (
                <ModelAdd
                    setModalVisible={() => setModalVisible(false)}
                    modalVisible={modalVisibleFalg}
                    renderData={renderData}
                    callbackRef={() => callbackRef()}
                    SetListData={(e) => SetListDatas(e)}
                />
            )}
        </PageContainer>
    )
}