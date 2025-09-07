import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import moment from 'moment';
import type { Moment } from 'moment';
import { Calendar, Button, Card, Tag, message, Badge } from 'antd'
import { useEffect, useState } from 'react';
import apiRequest from '@/services/ant-design-pro/apiRequest';
import 'moment/locale/zh-cn';
import './index.less'

type TodoItem = {
  id: number;
  title: string;
  project?: string;
  participants?: string; // 参与人，逗号分隔
  deadline?: string; // 截止日期时间
  status?: '待办' | '已完成';
};

export default () => {
  const [MonthToday, setMonthToday] = useState<any>(moment().month() + 1)
  const [selectedDate, setSelectedDate] = useState<moment.Moment>(moment());
  const [list, setList] = useState<TodoItem[]>([]);
  const [monthMap, setMonthMap] = useState<Record<string, number>>({});
  moment.locale('zh-cn');

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
    setSelectedDate(data);

    // 获取选择的日期的月份

    // const selectedDay = data.date();
    console.log('2', selectedMonth);
    // 判断用户是点击了日期还是切换了月份
    if (MonthToday === selectedMonth) {
    } else {


    }
  }

  const fetchList = async (date: moment.Moment) => {
    // 占位接口：GET /sms/todo/list?date=YYYY-MM-DD
    const res = await apiRequest.get('/sms/todo/list', { date: date.format('YYYY-MM-DD') });
    setList(res.data?.content || []);
  };

  useEffect(() => {
    fetchList(selectedDate);
  }, [selectedDate]);

  const fetchMonth = async (date: moment.Moment) => {
    // 占位接口：GET /sms/todo/month?year=YYYY&month=MM
    const res = await apiRequest.get('/sms/todo/month', { year: date.year(), month: date.month() + 1 });
    const map: Record<string, number> = res.data?.map || {};
    setMonthMap(map);
  };

  useEffect(() => {
    fetchMonth(selectedDate);
  }, [selectedDate.year(), selectedDate.month()]);

  const handleComplete = async (item: TodoItem) => {
    await apiRequest.post('/sms/todo/complete', { id: item.id });
    message.success('已完成');
    fetchList(selectedDate);
  };


  return (
    <PageContainer>
      <ProCard split="vertical">
        <ProCard title="日历视图" colSpan="70%">
          <Calendar
            value={selectedDate}
            onSelect={onSelect}
            onPanelChange={(d: any) => setSelectedDate(moment(d))}
            dateCellRender={(value) => {
              const key = value.format('YYYY-MM-DD');
              const count = monthMap[key] || 0;
              if (!count) return null;
              return (
                <div className="todo_cell">
                  <span className="todo_dot" />
                </div>
              );
            }}
          />
        </ProCard>
        <ProCard headerBordered>
          <div className='todo_right_header'>
            <div className='date_title'>待办事项 {selectedDate.format('YYYY年M月D日 dddd')}</div>
            <Button type="primary" onClick={async () => {
              // 预留：添加事项弹窗/路由
              // 这里仅占位请求
              await apiRequest.post('/sms/todo/create', { date: selectedDate.format('YYYY-MM-DD') });
              fetchList(selectedDate);
            }}>添加事项</Button>
          </div>
          <div className='todo_list'>
            {list.map((item) => (
              <Card
                className='todo_card'
                key={item.id}
                size="small"
                extra={
                  item.status === '已完成' ? (
                    <Tag color="default">已完成</Tag>
                  ) : (
                    <Button size='small' type='primary' onClick={() => handleComplete(item)}>完成</Button>
                  )
                }
              >
                <div className='todo_title'>{item.title}</div>
                <div className='todo_meta'>参与人：{item.participants || '-'} <span style={{ marginLeft: 12 }}>项目：{item.project || '-'}</span></div>
                <div className='todo_time'>提醒时间：{item.deadline || '-'}</div>
              </Card>
            ))}
          </div>
        </ProCard>
      </ProCard>

    </PageContainer>
  );
};
