import ProCard from '@ant-design/pro-card';
import { PageContainer } from '@ant-design/pro-layout';
import UserManageCard from '@/pages/Admins/Department/UserManageCard';
import { forwardRef, useEffect, useRef, useState } from 'react';
import request from '@/services/ant-design-pro/apiRequest';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormDatePicker } from '@ant-design/pro-form';
import './index.less';
import moment from 'moment';
import { Column } from '@ant-design/plots';
import Pie from '../components/Pie';
import SourcePie from '../components/SourcePie';
import contentData from '../components/util';
import sourceFn from '../components/sourceFn';
import { Spin, Table } from 'antd';
export default () => {
  const [Performances, setPerformances] = useState<any>([]);
  const [projectContent, setProjectContent] = useState<any>([]);
  const [orderDepartment, setOrderDepartment] = useState<any>({ department: [], num: 0 });
  const [projectAll, setProjectAll] = useState<any>([]);
  const [todayContent, settodayContent] = useState<any>(false);
  const [moon, setMoon] = useState<any>();
  const [orderContent, SetOrderContent] = useState<any>([])
  const [perTime, setPerTime] = useState<any>(moment().format('YYYY'));
  const formRef = useRef<ProFormInstance>();
  const [spinning, setSpinning] = useState<boolean>(false)
  const SourcePies = forwardRef(SourcePie)
  useEffect(() => {
    const arr: any = [];
    const arr2: any = [];
    formRef.current?.setFieldsValue({
      createTime: perTime,
    });
    for (let i = 1; i <= 12; i++) {
      arr.push({
        'createTime-start': `${perTime}-${i < 10 ? '0' + i : i}-01`,
        'createTime-end': `${perTime}-${i < 10 ? '0' + i : i}-31`,
      });
      arr2.push({
        'auditTime-start': `${perTime}-${i < 10 ? '0' + i : i}-01`,
        'auditTime-end': `${perTime}-${i < 10 ? '0' + i : i}-31`,
        auditType: 4,
        confirm: true,
        enable: true,
        'type-in': '1,3'
      });
    }
    volume(arr, arr2);
  }, [perTime]);
  const volume = async (arr: any, arr2 = false) => {
    const arrs = (await request
      .get('/sms/business/bizOrder/newOrder/totals', {
        array: JSON.stringify(arr),
        totalFields: 'amount',
      })).data
    // const arrs2 = (await request.get('/sms/business/bizCharge/totals', {
    //   array: JSON.stringify(arr2),
    //   totalFields: 'amount',
    // })).data

    const arrContent: any = [];
    arrs.forEach((item: any, index: number) => {
      arrContent.push({ name: '缴费', '月份': `${index + 1}月`, '金额': item.amount, time: arr[index] });
    });
    // arrs2.forEach((item: any, index: number) => {
    //   arrContent.push({ name: '退费', '月份': `${index + 1}月`, '金额': item.amount, time: arr[index] });
    // });
    console.log('arrContent', arrContent);

    setPerformances(arrContent);
  };
  const config = {
    // data,
    isGroup: true,
    xField: '月份',
    yField: '金额',
    seriesField: 'name',
    label: {
      // 可手动配置 label 数据标签位置
      position: 'middle',
      // 'top', 'bottom', 'middle',
      // 配置样式
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
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      type: {
        alias: '月份',
      },
      amount: {
        alias: '业绩额',
      },
    },
  };
  const onReadyColumn = (plot: any) => {
    plot.on('element:click', async (...args: any) => {
      setSpinning(true)
      const data = args[0].data?.data;
      console.log(data);
      const contnet = (
        await request.get('/sms/business/bizOrder/newOrder', {
          parentId: '-1',
          'createTime-start': data.time['createTime-start'],
          'createTime-end': data.time['createTime-end'],
          _isGetAll: true,
        })
      ).data.content;
      const datas = contentData(contnet);

      // const quantity = (
      //   await request.get('/sms/business/bizOrder/totals', {
      //     array: JSON.stringify(
      //       datas.arrProject.map((item: any) => {
      //         return { project: item };
      //       }),
      //     ),
      //     totalFields: 'quantity',
      //   })
      // ).data;
      // datas.arr2.forEach((item: { num: any }, index: string | number) => {
      //   item.num = quantity[index].quantity;
      // });
      setProjectContent(datas.arr2);
      setMoon(JSON.stringify([data.time['createTime-start'], data.time['createTime-end']]));
      setProjectAll(datas.arr3);
      settodayContent(datas.arr4);
      const resultData = (await sourceFn(data.time['createTime-start'], data.time['createTime-end'], null))
      console.log('resultData1', resultData);
      setOrderDepartment(resultData.department)
      SetOrderContent(resultData.result)
      setSpinning(false)
    });
  };


  const onFinish = async (values: any) => {
    return new Promise((resolve) => {
      setPerTime(values.createTime);
      resolve(true);
    });
  };
  return (
    <PageContainer>
      <Spin spinning={spinning}>
        <ProCard>
          <div>
            <ProForm
              //   name="customized_form_controls"
              layout="inline"
              onFinish={async (values) => {
                await onFinish(values);
              }}
              formRef={formRef}
            >
              <ProFormDatePicker
                name="createTime"
                label="日期时间"
                fieldProps={{ picker: 'year', format: 'YYYY' }}
              />
            </ProForm>
            <ProCard split="vertical" style={{ margin: '30px 0' }} title='点击具体某个月份业绩矩形，可以查看详细细节'>
              <Column data={Performances} {...config} onReady={onReadyColumn} />
            </ProCard>
            {todayContent && (
              <Pie data={projectContent} todayContent={todayContent} moon={moon} />
            )}
            <SourcePies orderContent={orderContent} />
            <div className="statistics">
              {
                orderDepartment.department.map((item: any) => {
                  return <ProCard className="statistics-card">
                    <div className="statistics-card-title">{item.departmentName}</div>
                    <div className="statistics-card-people">订单人数:{item.num}人</div>
                  </ProCard>
                })
              }
              <ProCard className="statistics-card">
                <div className="statistics-card-title">总订单人数</div>
                <div className="statistics-card-people">{orderDepartment.num}人</div>
              </ProCard>
            </div>
            {/* <div>
              <Table
                dataSource={projectContent}
                key="table"
                columns={[
                  {
                    title: '项目',
                    key: 'project',
                    dataIndex: 'project',
                    sorter: true,
                  },
                  {
                    title: '业绩金额',
                    key: 'amount',
                    dataIndex: 'amount',
                    sorter: true,
                  },
                  {
                    title: '人数',
                    key: 'num',
                    dataIndex: 'num',
                    sorter: true,
                  },
                  // {
                  //   title: '招生老师',
                  //   key: 'name',
                  //   dataIndex: 'name',
                  // },
                ]}
              />
            </div> */}
          </div>
        </ProCard>
      </Spin>
    </PageContainer>
  );
};
