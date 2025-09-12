import { PageContainer } from "@ant-design/pro-layout"
import { useEffect, useRef, useState } from "react"
import request from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import ProCard from "@ant-design/pro-card";
import Tables from "@/components/Tables";
import type { ProColumns } from "@ant-design/pro-table";
import type { ProFormInstance} from "@ant-design/pro-form";
import ProForm, { ProFormDateTimeRangePicker, ProFormTimePicker } from "@ant-design/pro-form";
type GithubIssueItem = {
    name: string;
    num: string;
    timeLength: number
};
export default () => {
    const getTodayDate = (num: number = 0) => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Adding 1 because January is 0
        const day = num ? String(today.getDate() + num).padStart(2, '0') : String(today.getDate()).padStart(2, '0');

        return year + '-' + month + '-' + day;
    }
    const [idList, setIdList] = useState<any>([])
    const formRef = useRef<ProFormInstance>();
    const [usersList, setUsersList] = useState<any>([])
    const [timeLength, setTimeLength] = useState<number>(0)
    const [time, setTime] = useState<any>([getTodayDate(0), getTodayDate(1)])
    const userId = JSON.parse(sessionStorage.getItem('userInfo') as string).data.id
    useEffect(() => {
        formRef?.current?.setFieldValue('timeRange', time)
    }, [])
    useEffect(() => {
        userList([Dictionaries.getDepartmentList(userId)])

    }, [time, timeLength])
    const userList = async (list: any) => {

        const userIds: any[] = []
        const users: { name: any; id: any; }[] = []
        const userListDi = async (listChildren: { userId: any; name: any; children: any; }[]) => {

            listChildren.forEach((item: any) => {
                if (item.userId && item.enable) {
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
        setIdList(userIds)
        EcContent(userIds, users)
    }
    const getArray = (userIds: any) => {
        const array = userIds.map((item: any) => {
            return {
                'userId': item,
                'startTime-start': time[0],
                'startTime-end': time[1],
                'timeLength-start': timeLength,
            }
        })
        return array
    }
    const getArray3 = (userIds: any) => {
        const array = userIds.map((item: any) => {
            return {
                'userId': item,
                'startTime-start': time[0],
                'startTime-end': time[1],
                'timeLength-start': 1,
            }
        })
        return array
    }
    const getArray2 = (userIds: any) => {
        const data = userIds.map((item: any) => {
            return {
                'userId': item,
                'startTime-start': time[0],
                'startTime-end': time[1],
                'timeLength-start': timeLength,
            }
        })
        const array = {
            array: JSON.stringify(data),
            totalFields: 'timeLength',
        }
        return array
    }
    const EcContent = async (userId: any[], users: any[]) => {
        const array = getArray(userId)
        const array2 = getArray2(userId)
        const array3 = getArray3(userId)
        const {data} = await request.get('/sms/ec/ecCallLog/statistics', { array: JSON.stringify(array) })
        const data3 = (await request.get('/sms/ec/ecCallLog/statistics', { array: JSON.stringify(array3) })).data
        const data2 = (await request.get('/sms/ec/ecCallLog/totals', array2)).data
        const list: any[] = []
        users.forEach((item: any, index: number) => {
            if (data[index]) {
                list.push(
                    {
                        ...item,
                        num: data[index],
                        connect: data3[index],
                        connectRatio: ((data3[index] / data[index]) * 100).toFixed(2) + '%',
                        timeLength: data2[index].timeLength
                    }
                )
            }


        })
        setUsersList(list)

    }

    const secondsToHms = (d: number) => {
        d = Number(d);
        const h = Math.floor(d / 3600);
        const m = Math.floor(d % 3600 / 60);
        const s = Math.floor(d % 3600 % 60);

        const hDisplay = h > 0 ? h + (h == 1 ? " 时, " : " 时, ") : "";
        const mDisplay = m > 0 ? m + (m == 1 ? " 分, " : " 分, ") : "";
        const sDisplay = s > 0 ? s + (s == 1 ? " 秒" : " 秒") : "";
        return hDisplay + mDisplay + sDisplay;
    }
    const toolbar = {
        menu: {
            type: 'tab',
            items: [
                {
                    key: 'all',
                    label: <span>全部</span>
                },
                {
                    key: '15',
                    label: <span>15秒以上</span>
                }
            ],
            onChange: (key: any) => {
                if (key == 'all') {
                    setTimeLength(0)
                } else {
                    setTimeLength(15)
                }
            }
        }
    }
    const columns: ProColumns<GithubIssueItem>[] = [
        {
            title: '姓名',
            dataIndex: 'name',
        },
        {
            title: '通话次数',
            dataIndex: 'num',
        },
        {
            title: '接通数量',
            dataIndex: 'connect',
        },
        {
            title: '接通率',
            dataIndex: 'connectRatio',
        },
        {
            title: '通话时长',
            dataIndex: 'timeLength',
            render: (text, record) => (
                <>{record.timeLength ? secondsToHms(record.timeLength) : 0}</>
            )
        },
    ]
    return (
        <PageContainer>
            <ProCard>
                <ProForm
                    formRef={formRef}
                    onFinish={async (values) => {
                        setTime(values.timeRange)
                    }}
                >
                    <ProFormDateTimeRangePicker fieldProps={{ showTime: false }} name="timeRange" label="时间区间" />
                </ProForm>
            </ProCard>
            <ProCard>
                <Tables
                    search={false}
                    className="ECContent"
                    columns={columns}
                    dataSource={usersList}
                    toolbar={toolbar}
                />
            </ProCard>
        </PageContainer>
    )
}