import Tables from '@/components/Tables';
import ProCard from '@ant-design/pro-card';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormDateRangePicker } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import moment from 'moment';
import request from '@/services/ant-design-pro/apiRequest';
import './index.less';
import { useEffect, useRef, useState } from 'react';
import Dictionaries from '@/services/util/dictionaries';
import { Checkbox, Col, Row } from 'antd';
import { Column } from '@ant-design/plots';
export default (props: any) => {
  const [source, setSource] = useState<any>(false);
  // const [tiem, setTiem] = useState<any>(false);
  let time: any[] | null = null;
  const [checkedValue, setcheckedValue] = useState<any>([]);
  const formRef = useRef<ProFormInstance>();
  useEffect(() => {
    // console.log(Dictionaries.getList('dict_source'));
    // const str2 = moment().format('YYYY-MM-DD');
    // const vStartDate = moment().add('month', 0).format('YYYY-MM') + '-01';
    // formRef?.current?.setFieldsValue({
    //   createTime: [vStartDate, str2],
    // });
  }, []);
  const onFinish = async (values: any) => {
    return new Promise((resolve) => {
      // setTiem(values.createTime);
      time = values.createTime;
      onChange(checkedValue);
      resolve(true);
    });
    // console.log('Received values from form: ', moment(values[0]).format('YYYY-MM-DD'));
  };
  const onChange = async (checkedValues: any) => {
    const arr: any = [];
    const data: any = [];
    checkedValues &&
      checkedValues?.forEach((item: any) => {
        if (time) {
          arr.push({
            isFormal: true,
            source: item,
            'createTime-start': time[0],
            'createTime-end': time[1],
          });
        } else {
          arr.push({ isFormal: true, source: item });
        }
      });
    const sourcecontent = await request.get('/sms/business/bizStudent/statistics', {
      array: JSON.stringify(arr),
    });
    checkedValues.forEach((item: any, index: number) => {
      data.push({
        type: Dictionaries.getName('dict_source', item),
        sales: sourcecontent.data[index],
      });
    });
    console.log('data', data);
    setcheckedValue(checkedValues);
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
  return (
    <PageContainer>
      <ProCard>
        <ProForm
          //   name="customized_form_controls"
          layout="inline"
          onFinish={async (values) => {
            await onFinish(values);
          }}
          formRef={formRef}
        >
          <ProFormDateRangePicker name="createTime" label="日期时间" />
        </ProForm>
      </ProCard>
      <ProCard title="来源" headerBordered className="cardss">
        <Checkbox.Group style={{ width: '100%' }} onChange={onChange}>
          <Row>
            {Dictionaries.getList('dict_source')?.map((item: any, index: number) => {
              return (
                <Col span={4} key={`source-${item.value}-${index}`}>
                  <Checkbox value={item.value}>{item.label}</Checkbox>
                </Col>
              );
            })}
          </Row>
        </Checkbox.Group>
      </ProCard>
      <ProCard>
        <Column {...config} />
      </ProCard>
    </PageContainer>
  );
};
