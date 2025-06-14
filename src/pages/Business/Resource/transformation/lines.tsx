import { Line } from '@ant-design/plots';
import { useEffect, useState } from 'react';
export default (props: any) => {
    const { studentData } = props
    const [studentLineData, setStudentLineData] = useState<any>([])

    useEffect(() => {
        setStudentLineData(studentData)
    }, [studentData])
    const config = {
        data: studentLineData,
        xField: 'date',
        yField: 'quantity',
        seriesField: 'x', // 如果需要多系列数据，可以设置此字段
        point: { size: 5 }, // 点的大小
        smooth: false, // 平滑曲线
        label: { // 配置标签显示方式
          position: 'top', // 标签位置在顶部
          style: { fill: '#FFFFFF' }, // 标签文本颜色为白色
        },
        color: ['#1890FF'], // 线条颜色
        tooltip: {
          customContent: (title: string, items: any[]) => {
            return (
              <div style={{ padding: '12px', background: '#fff', borderRadius: '4px' }}>
                <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>{title}</div>
                {items?.map((item, index) => {
                  const { name, value, color } = item;
                  return (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ 
                        display: 'inline-block',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        marginRight: '8px'
                      }}/>
                      <span style={{ marginRight: '12px' }}>新增人数:</span>
                      <span style={{ color: '#333' }}>{value}</span>
                    </div>
                  );
                })}
              </div>
            );
          },
          domStyles: {
            'g2-tooltip': {
              background: '#fff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              padding: '0',
              border: 'none',
            },
          },
        },
    };
    return (
        <>
            <Line {...config} />
        </>
    )
}