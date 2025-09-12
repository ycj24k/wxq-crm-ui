import ProCard from '@ant-design/pro-card';
import { PageContainer } from '@ant-design/pro-layout';
import UserManageCard from '@/pages/Admins/Department/UserManageCard';
import { forwardRef, useEffect, useRef, useState } from 'react';
import request from '@/services/ant-design-pro/apiRequest';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormDateRangePicker } from '@ant-design/pro-form';
import { useModel, history } from 'umi';
import moment from 'moment';
// import { Pie } from '@ant-design/plots';
import Pies from '../components/Pie';
import contentData from '../components/util';
import SourcePie from '../components/SourcePie';
import Dictionaries from '@/services/util/dictionaries';
import sourceFn from '../components/sourceFn';
import DownTable from '@/services/util/timeFn';
import { Table } from 'antd';
import './index.less'
export default (props: any) => {
  const { startTime, endTime, id } = props
  const [CadrContent, setCardContent] = useState<any>(false);
  const { initialState, setInitialState } = useModel('@@initialState');
  // @ts-ignore
  const { currentUser } = initialState;
  const userIds = history.location.query?.userId
    ? history.location.query?.userId
    : currentUser.userid;
  const moonTime: any = history.location.query?.moonTime
    ? JSON.parse(history.location.query?.moonTime as any)
    : [moment().format('YYYY-MM-DD'), moment(new Date()).add(1, 'days').format('YYYY-MM-DD')];
  const [projectContent, setProjectContent] = useState<any>([]);
  const [projectRefundContent, setProjectRefundContent] = useState<any>([]);
  const [projectAll, setProjectAll] = useState<any>([]);
  const [projectRefundAll, setProjectRefundAll] = useState<any>([]);
  const [RefundContent, setRefundContent] = useState<any>([]);
  const [userId, setUserID] = useState<any>(userIds);
  const [perTime, setPerTime] = useState<any>(moonTime);
  const [peopleNumber, setpeopleNumber] = useState<number>(0);
  const [orderContent, SetOrderContent] = useState<any>([])
  const formRef = useRef<ProFormInstance>();
  const SourcePies = forwardRef(SourcePie)
  const PieRef = useRef() as any;
  useEffect(() => {

    volume(startTime, endTime);
    formRef.current?.setFieldsValue({
      createTime: perTime,
    });
  }, [userId, startTime, endTime]);
  useEffect(() => {
    request.get('/sms/share/getDepartmentAndUser').then((res) => {
      setCardContent({ content: res.data, type: 'performance' });
    });
    // volume(perTime[0], perTime[1]);
  }, []);

  const volume = async (start: any, end: any, f?: string) => {
    const contnet = (
      await request.get('/sms/business/bizOrder/newOrder', {
        parentId: '-1',
        'createTime-start': start,
        'createTime-end': end,
        _isGetAll: true,
        auditType: 0,
        userId: id,
      })
    ).data.content;
    // const RefundContent = (await request.get('/sms/business/bizCharge', {
    //   auditType: 4,
    //   confirm: true,
    //   enable: true,
    //   'auditTime-start': start,
    //   'auditTime-end': end,
    //   'type-in': '1,3',
    //   userId: userId,
    //   _isGetAll: true,
    // })).data.content



    const data = contentData(contnet);
    // const data2 = contentData(RefundContent);
    const quantity = (
      await request.get('/sms/business/bizOrder/totals', {
        array: JSON.stringify(
          data.arrProject.map((item: any) => {
            return { project: item, userId: userId, parentId: '-1', enable: true, 'createTime-start': start, 'createTime-end': end, };
          }),
        ),
        totalFields: 'quantity',
      })
    ).data;
    data.arr2.forEach((item: { num: any }, index: string | number) => {
      item.num = quantity[index].quantity;
    });
    let people = 0;
    quantity.forEach((item: { quantity: number }) => {
      people = people + item.quantity;
    });
    const resultData = await sourceFn(start, end, userId)
    // PieRef.current.getPieData(start, end, userId)
    setRefundContent(RefundContent)
    SetOrderContent(resultData.result)
    setpeopleNumber(people);
    setProjectContent(data.arr2);
    // setProjectRefundContent(data2.arr2);
    setProjectAll(data.arr3);
    // setProjectRefundAll(data2.arr3);
  };

  const onFinish = async (values: any) => {
    return new Promise((resolve) => {
      // setTiem(values.createTime);
      volume(values.createTime[0], values.createTime[1]);
      setPerTime(values.createTime);
      resolve(true);
    });
  };
  return (
    <>
      <ProCard className="cardsd">
        {/* <ProCard colSpan="20%" style={{ padding: '0 5px' }}>
          <div className='userTree' style={{ height: '1000px', overflow: 'auto' }}>
            {CadrContent && (
              <UserManageCard
                CardVisible={true}
                CardContent={CadrContent}
                setUserID={(e: any) => {
                  setUserID(e);
                }}
              />
            )}
          </div>
        </ProCard> */}
        <ProCard>
          <div>

            {/* <div style={{ textAlign: 'center', fontSize: '20px', marginTop: '10px' }}>
              合计招生 {peopleNumber} 人,业绩金额 {projectAll.amount} 元。
            </div> */}

            <Pies data={projectContent} />
            <SourcePies ref={PieRef} orderContent={orderContent} />
            {/* <Pie data={orderContent} {...config} /> */}
            <div key="tablxe">
              <Table
                dataSource={projectContent}
                key="table"
                columns={[
                  {
                    title: '项目',
                    key: 'project',
                    dataIndex: 'project',
                  },
                  {
                    title: '业绩金额',
                    key: 'amount',
                    dataIndex: 'amount',
                  },
                  {
                    title: '人数',
                    key: 'num',
                    dataIndex: 'num',
                  },
                  {
                    title: '招生老师',
                    key: 'name',
                    dataIndex: 'name',
                  },
                ]}
              />
            </div>
          </div>
        </ProCard>
      </ProCard>
    </>
  );
};
