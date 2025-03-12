import { Modal } from "antd"
import { useEffect, useState } from "react";
import request from '@/services/ant-design-pro/apiRequest';
import { Column } from '@ant-design/plots';

export default (props: any) => {
    const { renderData, ModalsVisible, setModalsVisible, callbackRef } = props;
    const [ColumnData, setColumnData] = useState<any>([{}])
    useEffect(() => {
        getList()

    }, [])
    const config = {
        xField: 'name',
        yField: 'value',
        label: {
            text: (d: any) => `${(d.frequency * 100).toFixed(1)}%`,
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
    const getList = async () => {
        const data = (await request.get('/sms/business/bizAuthorityLog', { ...renderData, _isGetAll: true })).data.content

        let configData = data.reduce((acc: { [x: string]: number; }, obj: { creator: string | number; }) => {
            acc[obj.creator] = acc[obj.creator] ? acc[obj.creator] + 1 : 1;
            return acc;
        }, {});
        const ColumnDatas = Object.keys(configData).map((key) => {
            return {
                name: key,
                value: configData[key]
            }
        })
        setColumnData(ColumnDatas)
    }
    return <Modal
        title='获客来源'
        open={ModalsVisible}
        onCancel={() => setModalsVisible(false)}
        onOk={() => setModalsVisible(false)}
        width={800}

    >
        <Column data={ColumnData} {...config} />

    </Modal>

}