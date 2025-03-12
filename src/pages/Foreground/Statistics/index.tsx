import ProCard from "@ant-design/pro-card"
import ProForm, { ProFormDatePicker, ProFormDateRangePicker, ProFormInstance } from "@ant-design/pro-form"
import { PageContainer } from "@ant-design/pro-layout"
import Dictionaries from '@/services/util/dictionaries';
import request from '@/services/ant-design-pro/apiRequest';
import './index.less'
import { useEffect, useRef, useState } from "react";
import { Pie, Column } from '@ant-design/plots';
import FnReduce from './Fn'
import { DatePicker } from "antd";
import { getFirstAndLastDayOfMonthDate, formatDate } from '../../Department/AchievementUser/getTime'


export default () => {
    const [createContent, setCreateContent] = useState<any>()
    const [entrylength, setEntryLength] = useState<number>(0)
    const [conetnLength, setContentLength] = useState<number[]>([0, 0, 0])
    const [PieContent, setPieContent] = useState<any>([])
    const [RecruitmentPositions, setRecruitmentPositions] = useState<any>([])
    const [RecruitmentEnter, setRecruitmentEnter] = useState<any>([])
    const [presenterPie, setPresenterPie] = useState<any>([])
    const [searchData, setSearchData] = useState<any>({});
    const [DepNumber, setDepNumber] = useState<any>({
        20: 0,
        17: 0,
        16: 0,
        18: 0,
        19: 0
    })
    const formRef = useRef<ProFormInstance>();
    useEffect(() => {
        formRef.current?.setFieldValue('times', formatDate(new Date()))
        submitok({ times: formatDate(new Date()) })
    }, [])
    const config = {
        xField: 'type',
        yField: 'value',
        label: {
            text: (d) => `${(d.frequency * 100).toFixed(1)}%`,
            textBaseline: 'bottom',
        },
        axis: {
            y: {
                labelFormatter: '.0%',
            },
        },
        style: {
            // 圆角样式
            radiusTopLeft: 10,
            radiusTopRight: 10,
        },
    };
    const config1 = {
        xField: 'type',
        yField: 'value',
        label: {
            text: (d) => `${(d.frequency * 100).toFixed(1)}%`,
            textBaseline: 'bottom',
        },
        axis: {
            y: {
                labelFormatter: '.0%',
            },
        },
        style: {
            // 圆角样式
            radiusTopLeft: 10,
            radiusTopRight: 10,
        },
        // appendPadding: 10,
        // // data,
        // angleField: 'value',
        // colorField: 'source',
        // radius: 0.8,
        // label: {
        //     type: 'inner',
        //     offset: '-8%',
        //     content: '{name}',
        //     style: {
        //         fontSize: 16,
        //     },
        // },
        // interactions: [
        //     {
        //         type: 'pie-legend-active',
        //     },
        //     {
        //         type: 'element-active',
        //     },
        // ],
    };
    const config2 = {
        appendPadding: 10,
        // data,
        angleField: 'value',
        colorField: 'sourceValue',
        radius: 0.8,
        label: {
            type: 'inner',
            offset: '-8%',
            content: '{name}',
            style: {
                fontSize: 16,
            },
        },
        interactions: [
            {
                type: 'pie-legend-active',
            },
            {
                type: 'element-active',
            },
        ],
    };
    const config3 = {
        appendPadding: 10,
        // data,
        angleField: 'value',
        colorField: 'sourceValue',
        radius: 0.8,
        label: {
            type: 'inner',
            offset: '-8%',
            content: '{name}',
            style: {
                fontSize: 16,
            },
        },
        interactions: [
            {
                type: 'pie-legend-active',
            },
            {
                type: 'element-active',
            },
        ],
    };
    const submitok = async (value: Record<string, any>) => {
        let date = {}
        if (value.times) {
            const timeDate = getFirstAndLastDayOfMonthDate(value.times)
            date = {
                'createTime-start': timeDate.firstDay,
                'createTime-end': timeDate.lastDay,
                _isGetAll: true
            }
        }
        if (value.time) {
            date = {
                'createTime-start': value.time[0],
                'createTime-end': value.time[1],
                _isGetAll: true
            }
        }
        const create = (await request.get('/sms/system/sysInterview', date)).data.content
        let entry = 0
        let entryPople: any[] = []
        let reserve = 0
        let adopt = 0
        let arrNumber = JSON.parse(JSON.stringify(DepNumber))
        create.forEach((item: { status: number; departmentId: number }) => {
            if (item.status == 2) {
                reserve = reserve + 1
            }
            if (item.status == 4) {
                adopt = adopt + 1
            }
            if (item.status == 6) {
                entry = entry + 1
                adopt = adopt + 1
                entryPople.push(item)
            }
            if (item.departmentId) {
                const arr = Dictionaries.getDepartmentNamesId(item.departmentId)

                arrNumber[arr] = arrNumber[arr] + 1

            }
        })
        const result = FnReduce(create, 'Recruitment_channels', 'source')
        const presenterNames = FnReduce(create, false, 'presenterName')
        const Recruitment = FnReduce(create, 'Recruitment_Positions', 'post')
        const RecruitmentE = FnReduce(entryPople, 'Recruitment_Positions', 'post')
        const NewArr = Object.keys(arrNumber).map((key: any) => {
            return {
                type: Dictionaries.getDepartmentUserName(key, 'Dep'),
                value: arrNumber[key]
            }
        })

        setRecruitmentPositions(Recruitment)
        setRecruitmentEnter(NewArr)
        // setRecruitmentEnter(RecruitmentE)
        setPieContent(result)
        setPresenterPie(presenterNames)
        setCreateContent(create)
        setEntryLength(entry)
        setContentLength([create.length, reserve, adopt])
        setDepNumber(arrNumber)
    }
    return (
        <PageContainer>
            <ProCard>
                <ProForm
                    formRef={formRef}
                    onFinish={async (value) => submitok(value)}
                >
                    <ProForm.Group>
                        <ProFormDatePicker
                            label='请选择需要查询的月份:'
                            name='times'
                            fieldProps={{
                                picker: "month",
                                format: 'YYYY-MM'
                            }} />
                        <ProFormDateRangePicker label='请选择需要查询的时间区间:' name='time' />
                    </ProForm.Group>
                </ProForm>
                {/* <div style={{ margin: '50px' }} /> */}
            </ProCard>
            <div className="statistics">
                <ProCard className="statistics-card">
                    <div className="statistics-card-title">到面登记人数(/人):</div>
                    <div className="statistics-card-people">{conetnLength[0]}</div>
                </ProCard>
                <ProCard className="statistics-card">
                    <div className="statistics-card-title">储备人数(/人):</div>
                    <div className="statistics-card-people">{conetnLength[1]}</div>
                </ProCard>
                <ProCard className="statistics-card">
                    <div className="statistics-card-title">面试通过人数(/人):</div>
                    <div className="statistics-card-people">{conetnLength[2]}</div>
                </ProCard>
                <ProCard className="statistics-card">
                    <div className="statistics-card-title">面试通过率:</div>
                    <div className="statistics-card-people">{conetnLength[0] ? (conetnLength[2] / conetnLength[0] * 100).toFixed(2) : 0}%</div>
                </ProCard>
                <ProCard className="statistics-card">
                    <div className="statistics-card-title">入职人数(/人):</div>
                    <div className="statistics-card-people">{entrylength}</div>
                </ProCard>
                <ProCard className="statistics-card">
                    <div className="statistics-card-title">入职率:</div>
                    <div className="statistics-card-people">{entrylength ? (entrylength / conetnLength[0] * 100).toFixed(2) : 0}%</div>
                </ProCard>

            </div>
            <div className="statistics" style={{ margin: '20px 0' }}>
                {
                    Object.keys(DepNumber).map((key: any) => {
                        return (
                            <ProCard className="statistics-card">
                                <div className="statistics-card-title">{Dictionaries.getDepartmentUserName(key, 'Dep')}:</div>
                                <div className="statistics-card-people">{DepNumber[key]}</div>
                            </ProCard>
                        )
                    })
                }
            </div>
            <ProCard
                className="sourceContetn"
                split="vertical"
            >
                <ProCard title='面试人员来源占比'>
                    <Column data={PieContent} {...config} />
                </ProCard>
                <ProCard title='面试人员招聘人占比'>
                    <Column data={presenterPie} {...config} />
                </ProCard>


            </ProCard>
            <ProCard
                className="sourceContetn"
                split="vertical"
            >
                <ProCard title='招聘岗位到面占比'>
                    <Column data={RecruitmentPositions} {...config} />
                </ProCard>
                <ProCard title='部门面试人数'>
                    <Column data={RecruitmentEnter} {...config} />
                </ProCard>


            </ProCard>
        </PageContainer>
    )
}