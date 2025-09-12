import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Pie } from '@ant-design/plots';
import { Button, DatePicker } from 'antd';
import Dictionaries from '@/services/util/dictionaries';
import {
  ProFormCascader,
} from '@ant-design/pro-form';
import moment from 'moment';
import Line from './lines'
import request from '@/services/ant-design-pro/apiRequest';
import './index.less'
import { useEffect, useState } from 'react';
type GithubIssueItem = {
  studentName: string;
  type: string;
  userName: string;
  createTime: string;
  source: string;
  project: string;
  creatorName: string;
  studentId: number;
  studentUserId: number;
  chargeDuration: number;
  amount: number;
  visitNum: number;
};
export default (props: any) => {
  const today = moment();
  const { RangePicker } = DatePicker;
  const dateFormat = 'YYYY/MM/DD';
  //文字描述
  const [text, setText] = useState<string>('潜在')
  //开始时间
  const [chooseStartTime, setStartTime] = useState<string>(today.format('YYYY-MM-DD'))
  //结束时间
  const [chooseEndTime, setEndTime] = useState<string>(today.format('YYYY-MM-DD'))
  //跟进数据
  const [followData, setFollowData] = useState<any>([])
  //潜在学员数据
  const [studentData, setStudentData] = useState<any>([])
  //总数
  const [totalQuantity, setTotalQuantity] = useState<number>(0)

  const [project, setProject] = useState<any>()


  useEffect(() => {
    if (project) {
      handleChangeProject(project)
    }
  }, [project])


  useEffect(() => {
    handleGetTeacher()
    handleGetStudent()
  }, [chooseStartTime, chooseEndTime])

  //选择日期事件
  const handleChangeDate = (date: any, dateString: any) => {
    setStartTime(dateString[0]);
    setEndTime(dateString[1]);
  }
  //老师跟进率
  const handleGetTeacher = () => {
    request
      .get('/sms/business/bizReturnVisit/getVisitRanking', {
        startTime: chooseStartTime,
        endTime: chooseEndTime,
        limit: 20
      }).then((res) => {
        setFollowData(res.data)
      })
  }
  //选择岗位
  const handleChangeProject = (value: any) => {
    if (!chooseStartTime || !chooseEndTime) {
      return; // 如果没有选择日期，则不发送请求
    }
    request
      .get('/sms/business/bizCharge/getProjectNewOrder', {
        startTime: chooseStartTime,
        endTime: chooseEndTime,
        projects: Array.isArray(value) ? value.join(',') : value // 将岗位数组转换为逗号分隔的字符串

      })
      .then((res) => {
        // 处理响应数据
        const pieData = Object.keys(res.data).map(key => ({ [key]: res.data[key] }))
        console.log(pieData, 'pieData====>')
        const data = []
        pieData.forEach((item: any) => {
          data.push({
            type: Dictionaries.getCascaderAllName('dict_reg_job', Object.keys(item)),
            value: item[Object.keys(item)[0]],
          });
          console.log(data, 'data')
        })

      })
      .catch((error) => {
        console.error('请求失败：', error);
      });
  }
  //学员数
  const handleGetStudent = () => {
    request
      .get('/sms/business/bizStudent/getAddedQuantityOfDay', {
        startTime: chooseStartTime,
        endTime: chooseEndTime,
        limit: 20
      }).then((res) => {
        setStudentData(res.data)
        // 计算 quantity 总和
        const total = res.data?.reduce((sum: number, item: any) => {
          return sum + (Number(item.quantity) || 0)
        }, 0)
        setTotalQuantity(total)
      })
  }
  const handleQZ = () => {
    setText('潜在')
  }
  const handleZS = () => {
    setText('正式')
  }
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: '订单编号',
      dataIndex: 'num',
    },
    {
      title: '订单金额',
      dataIndex: 'amount',
      render: (text, record) => (
        <span>
          {record.amount ? record.amount : '0.00'}元
        </span>
      ),
    },
    {
      title: '报考项目',
      dataIndex: 'project',
      width: 150,
      key: 'project',
      sorter: true,
      valueType: 'cascader',
      fieldProps: {
        options: Dictionaries.getCascader('dict_reg_job')
      },
    },
    {
      title: '成交时间',
      dataIndex: 'chargeTime'
    },
    {
      title: '成交转化周期',
      dataIndex: 'chargeDuration',
      render: (text, record) => (
        <span>
          {record.chargeDuration ? record.chargeDuration : '0'}天
        </span>
      ),
    },
    {
      title: '销售人',
      dataIndex: 'userName',
    }
  ];
  const columnsfloow: ProColumns<GithubIssueItem>[] = [
    {
      title: '排名',
      valueType: 'index',
      render: (text, record, index) => (
        <span>
          NO.{index + 1}
        </span>
      ),
    },
    {
      title: '姓名',
      dataIndex: 'userName',
    },
    {
      title: '跟进次数',
      dataIndex: 'visitNum',
      render: (text, record) => (
        <span>
          {record.visitNum}次
        </span>
      ),
    }
  ];
  const data = [
    {
      type: '事例一',
      value: 40,
    }
  ];

  const config = {
    appendPadding: 10,
    data,
    angleField: 'value',
    colorField: 'type',
    radius: 0.9, // 饼图的半径占比，1 为最大半径，0.5 为半径占画布的一半
    label: {
      type: 'inner', // 'inner' | 'spider' | 'outer' | false, 'inner' 表示内部标签，'spider' 表示蜘蛛网标签，'outer' 表示外部标签，false 表示不显示标签
      style: {
        fontSize: 14, // 字体大小
      },
      autoRotate: false, // 是否自动旋转标签，当内部标签长度超出一定范围时会发生旋转，可以设置为 true 或 false，默认为 true。设置为 false 时，内部标签将不会自动旋转。
      content: ({ percent }) => `${(percent * 100).toFixed(0)}%`, // 自定义标签内容，此处显示百分比形式
    },
    interactions: [{ type: 'element-active' }], // 交互类型，此处为激活元素时显示更多信息，如提示框等。
  };

  return (
    <PageContainer>
      <ProCard
        direction="column"
        ghost
        gutter={{
          xs: 8,
          sm: 8,
          md: 8,
          lg: 8,
          xl: 8,
          xxl: 8,
        }}
      >
        <ProCard bordered>
          <div className="top_content">
            <div className='top_text'>资源转化看板</div>
            <div className='choose_date'>
              <RangePicker
                onChange={handleChangeDate} defaultValue={[today, today]} format={dateFormat} />
            </div>
          </div>
        </ProCard>
        <ProCard
          layout="center"
          bordered
        >
          <div className="content">
            <div className="content_left">
              <div className="middle_text">岗位销售额统计</div>
              <div className="choose" style={{ marginTop: '20px' }}>
                <ProFormCascader
                  width="sm"
                  name="project"
                  placeholder="咨询报考岗位"
                  label="报考岗位"
                  rules={[{ required: true, message: '请选择报考岗位' }]}
                  fieldProps={{
                    options: Dictionaries.getCascader('dict_reg_job'),
                    changeOnSelect: true, // 允许选择任何级别的选项
                    expandTrigger: 'hover', // 鼠标悬停时展开子菜单，提升用户体验

                    onChange: (value: any) => {
                      // handleChangeProject(value)
                      setProject(value)
                    }
                  }}
                />
              </div>
              <div>
                <Pie {...config} />
              </div>
            </div>
            <div className="content_middle">
              <div className="middle_text">订单成交数据</div>
              <div>
                <ProTable
                  search={false}
                  columns={columns}
                  pagination={{
                    pageSize: 10
                  }}
                  request={async (
                    params: {
                      current?: any;
                      isError?: string | boolean;
                      isPass?: string | boolean;
                      page?: number;
                      pageSize?: number;
                    } = { pageSize: 10 },
                    sort,
                    filter,
                  ) => {
                    const param = { _orderBy: 'chargeTime', _direction: 'desc' }
                    const dataList: any = await request.get('/sms/business/bizCharge/getChargeInfo', { ...param, ...params });
                    return {
                      data: dataList.data.content,
                      success: dataList.success,
                      total: dataList.data.totalElements,
                    };
                  }}
                />
              </div>
            </div>
            <div className="content_right">
              <div className="middle_text">老师跟进率</div>
              <div>
                <ProTable
                  search={false}
                  pagination={false}
                  dataSource={followData}
                  columns={columnsfloow}
                />
              </div>
            </div>
          </div>
        </ProCard>
        <ProCard>
          <div className="line_content">
            <div className='header_content'>
              <div className="left_content">新增{text}学员总数（总人数：{totalQuantity}人）</div>
              <div className="right_content">
                <Button value="large" type="primary" style={{ marginRight: '10px' }} onClick={() => handleQZ()}>新增潜在学员数</Button>
                <Button value="large" type="primary" onClick={() => handleZS()}>新增正式学员数</Button>
              </div>
            </div>
            <div className='line_s'>
              <Line studentData={studentData} />
            </div>
          </div>
        </ProCard>
      </ProCard>

    </PageContainer>
  );
};