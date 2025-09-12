import Tables from '@/components/Tables';
import ProCard from '@ant-design/pro-card';
import ProForm, { ProFormDateRangePicker, ProFormInstance } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import moment from 'moment';
import request from '@/services/ant-design-pro/apiRequest';
import { useEffect, useRef, useState } from 'react';
import Dictionaries from '@/services/util/dictionaries';
import { Checkbox, Col, Row } from 'antd';
import { Column, Pie } from '@ant-design/plots';
export default (props: any) => {
  const [Piesource, setPieSource] = useState<any>(false);
  const [source, setSource] = useState<any>(false);
  // const [tiem, setTiem] = useState<any>(false);
  const time: any[] | null = null;
  const [statisticsData, setStatisticsData] = useState<any>(0);
  useEffect(() => {
    // console.log(Dictionaries.getList('dict_source'));
    // const str2 = moment().format('YYYY-MM-DD');
    // const vStartDate = moment().add('month', 0).format('YYYY-MM') + '-01';
    // formRef?.current?.setFieldsValue({
    //   createTime: [vStartDate, str2],
    // });
    statisticsAll()
  }, []);
  const statisticsAll = async () => {
    const all = (await request.get('/sms/business/bizStudentUser/statistics', {
      array: JSON.stringify([{
        source: 1,
        'userId-isNull': true,
      }])
    })).data[0];
    setStatisticsData(all)
  }
  const onChange = async (checkedValues: any) => {
    const data: any = [];
    let PieData: any = []
    let statisticsDatas = statisticsData
    const arr: any[] = checkedValues.map((item: string | undefined) => {
      const Projects = Dictionaries.getList('dict_reg_job', item);
      const projectIn = Projects.map((itemList: any) => itemList.value).join(',');
      return {
        source: 1,
        'userId-isNull': true,
        'project-in': projectIn + ',' + item
      };
    });

    const sourcecontent = await request.get('/sms/business/bizStudentUser/statistics', {
      array: JSON.stringify(arr),
    });
    checkedValues.forEach((item: any, index: number) => {
      data.push({
        type: Dictionaries.getCascaderAllName('dict_reg_job', item),
        sales: sourcecontent.data[index],
      });
      statisticsDatas = statisticsDatas - sourcecontent.data[index]
    });
    console.log(data,'======>');
    PieData = [...data, { type: '其他', sales: statisticsDatas }]
    // setcheckedValue(checkedValues);
    setPieSource(PieData)
    setSource(data);
  };
  const data: any = source;
  const config: any = {
    data,
    xField: 'type',
    yField: 'sales',
    label: {
      // 可手动配置 label 数据标签位置
      position: 'middle',
      // 'top', 'bottom', 'middle',
      // 配置样式
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      type: {
        alias: '类别',
      },
      sales: {
        alias: '销售额',
      },
    },
  };
  const config2 = {
    data: Piesource,
    angleField: 'sales',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: (e: any) => `${e.type}\n${e.sales}`,
    },
    legend: {
      color: {
        title: false,
        position: 'right',
        rowPadding: 5,
      },
    },
  };
  return (
    <PageContainer>
      <ProCard title="来源" headerBordered className="cardss">
        <Checkbox.Group style={{ width: '100%' }} onChange={onChange}>
          <Row>
            {Dictionaries.getList('dict_reg_job')?.map((item: any, index: number) => {
              return (
                <Col span={4} key={`reg-job-${item.value}-${index}`}>
                  <Checkbox value={item.value}>{item.label}</Checkbox>
                </Col>
              );
            })}
          </Row>
        </Checkbox.Group>
      </ProCard>
      <ProCard split="vertical">
        <ProCard colSpan="70%">
          <Column {...config} />
        </ProCard>
        <ProCard>
          {Piesource && <Pie {...config2} />};
        </ProCard>
      </ProCard>

    </PageContainer>
  );
};
