import { useEffect, useImperativeHandle, useState } from "react"
import Dictionaries from '@/services/util/dictionaries';
import request from '@/services/ant-design-pro/apiRequest';
import { Pie } from '@ant-design/plots';
import ProCard from "@ant-design/pro-card";






export default (props: any, orderRef: any) => {
    const { orderContent } = props
    // const [orderContent, SetOrderContent] = useState<any>([])
    const config = {
        appendPadding: 10,
        // data,
        angleField: 'value',
        colorField: 'source',
        radius: 0.8,
        label: {
            type: 'inner',
            offset: '-8%',
            content: '{name}',
            style: {
                fontSize: 12,
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
    const config1 = {
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
                fontSize: 12,
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
    useImperativeHandle(orderRef, () => ({
        getPieData: getPieData,
    }));
    const getPieData = async (start: any, end: any, userId: any) => {

        // SetOrderContent(result)
    }

    // useEffect(() => {
    //     getPieData()
    // }, [])

    return (
        <div>
            <ProCard split="vertical" className="cards">
                <ProCard title="订单来源占比" style={{ height: '400px' }}>
                    <Pie data={orderContent} {...config} />
                </ProCard>
                <ProCard title="订单来源笔数" style={{ height: '400px' }}>
                    <Pie data={orderContent} {...config1} />
                </ProCard>
            </ProCard>
        </div>
    )


}