import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import moment from 'moment';
import type { Moment } from 'moment';
import { Calendar } from 'antd'
import { useState } from 'react';
import './index.less'

export default () => {
  const [MonthToday, setMonthToday] = useState<any>(moment().month() + 1)

  const dateCellRender = (value: Moment) => {
    // const listData = getListData(value);
    // return (
    //   <ul className="events">
    //     {listData.map(item => (
    //       <li key={item.content}>
    //         <Badge status={item.type as BadgeProps['status']} text={item.content} />
    //       </li>
    //     ))}
    //   </ul>
    // );
  };

  const onSelect = (data: any) => {
    const selectedMonth = data.month() + 1;
    setMonthToday(selectedMonth)

    // 获取选择的日期的月份

    // const selectedDay = data.date();
    console.log('2', selectedMonth);
    // 判断用户是点击了日期还是切换了月份
    if (MonthToday === selectedMonth) {
    } else {


    }
  }


  return (
    <PageContainer>
      <ProCard split="vertical">
        <ProCard title="日历" colSpan="70%">
          <Calendar dateCellRender={dateCellRender} onSelect={onSelect} />
        </ProCard>
        <ProCard headerBordered>
          <div className='todo_list'>
            <div className="list_item">
              <div className='list_top'>
                <div className='left' style={{ fontSize: '18px',color: '#333333' }}>标题标题</div>
                <div className='right'></div>
              </div>
              <div className='list_top'>
                <div className='left'>项目岗位</div>
                <div className='right'></div>
              </div>
              <div className='list_top'>
                <div className='left'>任务描述</div>
                <div className='right'></div>
              </div>
              <div className='list_top'>
                <div className='left'>本次跟进时间</div>
                <div className='right'></div>
              </div>
            </div>
          </div>
        </ProCard>
      </ProCard>

    </PageContainer>
  );
};
