import React, { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import {
  Card,
  Alert,
  Typography,
  Avatar,
  Divider,
  Image,
  DatePicker,
  Progress,
  message,
} from 'antd';
import { Link, useModel, history } from 'umi';
import moment from 'moment';
import ProCard from '@ant-design/pro-card';
import './Welcome.less';
import Countdown from 'antd/lib/statistic/Countdown';
import request from '@/services/ant-design-pro/apiRequest';
import { Column } from '@ant-design/plots';
import Dictionaries from '@/services/util/dictionaries';
import { ModalForm, ProFormDigit, ProFormText } from '@ant-design/pro-form';
import {
  FileSearchOutlined,
  FileTextOutlined,
  InboxOutlined,
  SolutionOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  UsergroupAddOutlined,
  UsergroupDeleteOutlined,
} from '@ant-design/icons';
import TableContentFn from '@/services/util/TableContentFn';
import { getNextDay } from '../Department/AchievementUser/getTime'
const { RangePicker } = DatePicker;
let timss: any = null;
let i = 0;
const Welcome: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  // @ts-ignore
  const { currentUser } = initialState;
  const [times, setTimes] = useState<any>();
  const navigationTabr = [
    {
      url: '/business/studentmanage',
      name: '潜在学员',
      icon: <UserDeleteOutlined style={{ fontSize: '32px' }} />,
    },
    {
      url: '/business/companymanage',
      name: '潜在团组',
      icon: <UsergroupDeleteOutlined style={{ fontSize: '32px' }} />,
    },
    {
      url: '/business/studentmanagetrue',
      name: '正式学员',
      icon: <UserAddOutlined style={{ fontSize: '32px' }} />,
    },
    {
      url: '/business/companymanagetrue',
      name: '正式团组',
      icon: <UsergroupAddOutlined style={{ fontSize: '32px' }} />,
    },
    {
      url: '/business/adminreturnvisit',
      name: '跟踪回访记录',
      icon: <SolutionOutlined style={{ fontSize: '32px' }} />,
    },
    {
      url: '/business/resource',
      name: '资源库',
      icon: <InboxOutlined style={{ fontSize: '32px' }} />,
    },
    {
      url: '/business/businessorder',
      name: '订单列表',
      icon: <FileSearchOutlined style={{ fontSize: '32px' }} />,
    },
    {
      url: '/business/businesscharge/list',
      name: '缴费列表',
      icon: <FileTextOutlined style={{ fontSize: '32px' }} />,
    },
  ];
  const contentTitle = ['今日', '本周', '本月', '时间选择'];
  const [contentTitleIndex, setTitleIndex] = useState<any>(0);
  const [returnVisit, setReturnVisit] = useState<number>(0)
  const [contentList, setContentList] = useState<any>([]);
  const [ModalVisible, setModalVisible] = useState<any>(false);
  const [todayContent, settodayContent] = useState<any>(false);
  const [performanceList, setperformanceList] = useState<any>(false);
  const [AchievementUser, setAchievement] = useState<any>(false);
  const [depYeji, setDepYeji] = useState<any>(false);
  const [department, setdepartment] = useState<any>(false);
  const [visitList, setVisitList] = useState<any>([0, 0]);
  const moneyYeJi: any = JSON.parse(sessionStorage.getItem('userInfo') as string).data.targetAmount
    ? JSON.parse(sessionStorage.getItem('userInfo') as string).data.targetAmount
    : 0;

  const [timeChange, setTime] = useState<any>([]);
  // Moment is also OK
  const yStartDate = moment().format('YYYY') + '-01-01';
  const vStartDate = moment().format('YYYY-MM') + '-01';
  const vEndM = moment(vStartDate).add('month', 1);
  const vEndDate = moment(vEndM).format('YYYY-MM-DD');
  const deadline = Number(moment(vEndDate).endOf('day').format('x'));
  const str = moment().format('YYYY-MM-DD, h:mm:ss a');
  const str2 = moment().format('YYYY-MM-DD');
  const str3 = moment(new Date()).add(1, 'days').format('YYYY-MM-DD');
  const data = todayContent;
  const data1 = depYeji;
  const lists: any = useRef();
  useEffect(() => {
    getStudentSource()
  }, [])
  const getStudentSource = async () => {
    const data = [
      {
        type: 0,
        isFormal: false,
        studentSource: 21,
        'createTime-start': getNextDay().todayFormatted,
        'createTime-end': getNextDay().tomorrowFormatted,
        userId: initialState?.currentUser?.userid,
        'visitTime-isNull': true
      },
      {
        type: 0,
        isFormal: false,
        'createTime-start': getNextDay().todayFormatted,
        'createTime-end': getNextDay().tomorrowFormatted,
        'provider-isNot': initialState?.currentUser?.userid,
        userId: initialState?.currentUser?.userid,
        'visitTime-isNull': true
      },
    ]
    const value = (await request.get('/sms/business/bizStudentUser/statistics', {
      array: JSON.stringify(data)
    })).data
    setVisitList(value)
  }
  const config = {
    data,
    // height: ,
    xField: 'name',
    yField: 'amount',
    point: {
      size: 5,
      shape: 'diamond',
    },
    meta: {
      name: {
        alias: '类别',
      },
      amount: {
        alias: '金额',
      },
    },
  };
  const config1 = {
    data: data1,
    // height: ,
    xField: 'name',
    yField: 'chargeTargetDay',

    point: {
      size: 5,
      shape: 'diamond',
    },
    meta: {
      name: {
        alias: '事业部',
      },
      chargeTargetDay: {
        alias: '金额',
      },
    },
  };
  const config2 = {
    data: data1,
    // height: ,
    xField: 'name',
    yField: 'chargeMonth',

    point: {
      size: 5,
      shape: 'diamond',
    },
    meta: {
      name: {
        alias: '事业部',
      },
      chargeMonth: {
        alias: '金额',
      },
    },
  };
  useEffect(() => {
    return () => {
      clearInterval(timss);
    };
  }, []);
  const contentTitleClick = (val: number) => {
    if (val === 0) {
      volume(str2, str3);
    }
    if (val === 1) {
      const weekOfday = parseInt(moment().format('d'));
      const start = moment().subtract(weekOfday, 'days').format('YYYY-MM-DD'); // 周一日期
      const end = moment()
        .add(7 - weekOfday - 1, 'days')
        .format('YYYY-MM-DD'); // 周日日期
      volume(start, end);
    }
    if (val === 2) {
      volume(vStartDate, vEndDate);
    }
  };
  const getReturnVisit = async () => {
    const list = (await request.get('/sms/business/bizReturnVisit', { nextVisitDate: str2, _isGetAll: true })).data.content
    setReturnVisit(list.length)
  }
  useEffect(() => {
    getReturnVisit()
    performance();
    // console.log('2', Dictionaries.getDepartmentName(currentUser.departmentId));
    getDepatrment();
    volume(str2, str3, 'effect');
    setTimes(str.slice(str.length - 2));
    // setTime([moment(str2, dateFormat), moment(str3, dateFormat)]);
  }, []);
  /**
   * 部门业绩
   */
  const getDepatrment = async () => {
    let userDep = Dictionaries.getDepartmentName(currentUser.departmentId);
    userDep = userDep[userDep.length - 2];
    const DepatrmentAchievement = await TableContentFn();
    const Achievement: any[] = [];
    const configs: any = [];
    DepatrmentAchievement.forEach((item: any) => {
      if (item.name == userDep) {
        Achievement.push(item);
      }
      if (item.parentId == 15) {
        configs.push({
          name: item.name,
          chargeTargetDay: item.chargeTargetDay,
          chargeMonth: item.chargeMonth
        });
      }
    });
    setDepYeji(configs);
    setdepartment(userDep);
    setAchievement(Achievement[0]);
  };
  /**
   * 个人业绩
   */
  const performance = async () => {
    const arr = [
      {
        startTime: str2,
        endTime: str3,
        userIdList: currentUser.userid,
      },
      {
        startTime: vStartDate,
        endTime: vEndDate,
        userIdList: currentUser.userid,
      },
      {
        startTime: yStartDate,
        endTime: vEndDate,
        userIdList: currentUser.userid,
      },
    ];
    const promiseArr = arr.map((item) => {
      return request.get('/sms/business/bizCharge/getPersonNewOrder', item);
    });
    Promise.all(promiseArr).then((res) => {
      const list = res.map((item: any) => {
        return item.data[0];
      });

      setperformanceList(list);
    });
    // const list = (
    //   await request.get('/sms/business/bizOrder/newOrder/totals', {
    //     array: JSON.stringify(arr),
    //     totalFields: 'amount',
    //   })
    // ).data;
    // setperformanceList(list);
  };
  const volume = (start: any, end: any, f?: string) => {
    request
      .get('/sms/business/bizOrder/newOrder', {
        parentId: '-1',
        'chargeTime-start': start,
        'chargeTime-end': end,
        auditType: 0,
        _isGetAll: true,
      })
      .then((res: any) => {
        // setContentList(['1111111111111']);
        const list = res.data.content;
        const contentlist: any = [];
        const content: any = [];
        list.forEach((item: any, index: number) => {
          if (
            content.find((e: any) => {
              return e.name == item.userName;
            })
          ) {
            content.forEach((items: any) => {
              if (items.name == item.userName) {
                items.money = items.money + item.amount;
              }
            });
          } else {
            content.push({ name: item.userName, money: item.amount });
          }
          if (f == 'effect') {
            contentlist.push(
              <li key={`effect-${item.userName}-${item.project}-${index}`} className="content">
                <p>
                  <a className="bianpao" />
                  <span>{`${item.userName}成交了一笔${Dictionaries.getCascaderName(
                    'dict_reg_job',
                    item.project,
                  )}${item.amount}元`}</span>
                </p>
              </li>,
            );
          }
        });
        if (f == 'effect') {
          //喜报列表
          setContentList(contentlist);
        }
        content.sort((a: any, b: any) => {
          return b.money - a.money;
        });
        //表格列表
        // settodayContent(content.splice(0, 10));

        FnTime(contentlist.length);
      });
    request
      .get('/sms/business/bizCharge/getPersonNewOrder', {
        startTime: start,
        endTime: end,
      })
      .then((res) => {
        const datas: any = [];
        res.data.forEach((item: any) => {
          if (item.amount > 0) {
            datas.push(item);
          }
        });
        datas.sort((a: any, b: any) => {
          return b.amount - a.amount;
        });
        settodayContent(datas.splice(0, 10));
      });
  };

  const FnTime = (value: number) => {
    const list = document.getElementsByClassName('content');
    if (value > 5) {
      timss = setInterval(() => {
        if (list[i] === undefined) {
          i = 0;
        }

        const obj = list[i];
        if (obj != undefined) {
          obj.setAttribute('style', 'display:none');
          setTimeout(() => obj.setAttribute('style', 'display:block'), 500);
          i++;
        }
      }, 1000);
    } else {
      for (let j = 0; j < value; j++) {
        list[j].setAttribute('style', `display:block;animation:none;top:${j * 80}px`);
      }
    }
  };
  const goToReturnVisit = () => {
    history.push('/business/adminreturnvisit?nextVisitDate=' + str2)
  }
  const goToReturnVisits = (type: number) => {
    let data = {}
    if (type == 1) {
      data = {
        studentSource: 21,
        'visitTime-isNull': true,
        'createTime-start': getNextDay().todayFormatted,
        'createTime-end': getNextDay().tomorrowFormatted,
        userId: initialState?.currentUser?.userid,
      }
    } else {
      data = {
        'provider-isNot': initialState?.currentUser?.userid,
        'visitTime-isNull': true,
        'createTime-start': getNextDay().todayFormatted,
        'createTime-end': getNextDay().tomorrowFormatted,
        userId: initialState?.currentUser?.userid,
      }
    }
    history.push({
      pathname: '/business/studentmanage',
      query: data,
    })
  }
  return (
    <PageContainer
      title={false}
      content={
        <ProCard split="vertical" className="cards">
          <ProCard colSpan="70%">
            <div className="leftBox">
              <Avatar size={70} src={currentUser.avatar} alt="avatar" />
              <div className="leftBox-div">
                <p className="leftBox-title">
                  {times}好,{currentUser?.name}，祝你开心每一天！！
                </p>

                <p className="leftBox-wh">今天又是业绩满满的一天,加油、加油。加油！</p>
              </div>
            </div>
          </ProCard>
          <ProCard>
            <div style={{ textAlign: 'center' }}>
              <Countdown title="月底冲刺倒计时" value={deadline} format="D 天 H 时 m 分 s 秒" />
            </div>
          </ProCard>
        </ProCard>
      }
    >
      <div style={{ width: '100%', display: 'flex' }}>
        <div style={{ width: '75%' }}>
          <div className="yeji">
            <ProCard
              style={{ width: '23%' }}
              title={<span style={{ color: 'white' }}>个人业绩</span>}
              headerBordered
              hoverable
              headStyle={{ backgroundColor: 'rgb(24,144,255)', borderRadius: '5px' }}
            >
              <div className="yuan">
                <span style={{ fontSize: '16px' }}>今日业绩: </span>
                <span>￥</span> {performanceList[0]?.amount} 元
              </div>
              <div className="yuan">
                <span style={{ fontSize: '16px' }}>本月业绩:</span> <span>￥</span>{' '}
                {performanceList[1]?.amount} 元
              </div>
              <div className="yuan">
                <span style={{ fontSize: '16px' }}> &nbsp;&nbsp;&nbsp;&nbsp;年总业绩:</span>{' '}
                <span>￥</span> {performanceList[2]?.amount} 元
              </div>
              <div>可能存在误差，具体以财务公布的数据为准</div>
            </ProCard>
            <ProCard
              style={{ width: '23%' }}
              title={<span style={{ color: 'white' }}>事业部业绩:{department}</span>}
              headerBordered
              hoverable
              headStyle={{ backgroundColor: 'rgb(24,144,255)', borderRadius: '5px' }}
            >
              <div className="yuan">
                <span style={{ fontSize: '16px' }}>今日业绩: </span>
                <span>￥</span> {AchievementUser?.chargeTargetDay} 元
              </div>
              <div className="yuan">
                <span style={{ fontSize: '16px' }}>本月业绩:</span> <span>￥</span>{' '}
                {AchievementUser?.chargeMonth} 元
              </div>
              <div>可能存在误差，具体以财务公布的数据为准</div>
            </ProCard>
            <ProCard
              style={{ width: '50%' }}
              title={<span style={{ color: 'white' }}>今日回访提醒</span>}
              headerBordered
              hoverable
              headStyle={{ backgroundColor: 'rgb(186,28,33)', borderRadius: '5px' }}
            >
              <div>
                <p>今日有<a>{returnVisit}</a>人需要回访,<a onClick={() => { goToReturnVisit() }}>点击前往回访</a></p>
                <p>今日小程序获客<a>{visitList[0]}</a>人需要回访,<a onClick={() => { goToReturnVisits(1) }}>点击前往回访</a></p>
                <p>今日新媒体获客<a>{visitList[1]}</a>人需要回访,<a onClick={() => { goToReturnVisits(2) }}>点击前往回访</a></p>
              </div>
            </ProCard>
            {/* <ProCard
              className="AchievementUser"
              style={{ width: '23%' }}
              title={<span style={{ color: 'white' }}>事业部目标业绩</span>}
              headerBordered
              hoverable
              headStyle={{
                backgroundColor: 'rgb(186,28,33)',
                borderRadius: '5px',
              }}
            >
              <div>
                <span>今日目标业绩{AchievementUser?.chargeTarget}元</span>
                <Progress
                  percent={
                    (
                      (AchievementUser?.chargeTargetDay / AchievementUser?.chargeTarget) *
                      100
                    ).toFixed(2) as any
                  }
                  size="small"
                />
              </div>
              <div>
                <span>本月保底目标业绩{AchievementUser?.bottomTarget}元</span>
                <Progress
                  percent={
                    ((AchievementUser?.chargeMonth / AchievementUser?.bottomTarget) * 100).toFixed(
                      2,
                    ) as any
                  }
                  size="small"
                />
              </div>
              <div>
                <span>本月次级目标业绩{AchievementUser?.secondaryTarget}元</span>
                <Progress
                  percent={
                    (
                      (AchievementUser?.chargeMonth / AchievementUser?.secondaryTarget) *
                      100
                    ).toFixed(2) as any
                  }
                  size="small"
                />
              </div>
              <div>
                <span>本月冲刺目标业绩{AchievementUser?.sprintTarget}元</span>
                <Progress
                  percent={
                    ((AchievementUser?.chargeMonth / AchievementUser?.sprintTarget) * 100).toFixed(
                      2,
                    ) as any
                  }
                  size="small"
                />
              </div>
            </ProCard> */}
          </div>
          {/* <div className="yeji">
            <ProCard
              style={{ width: '23%' }}
              title={<span style={{ color: 'white' }}>本日业绩</span>}
              headerBordered
              hoverable
              headStyle={{ backgroundColor: 'rgb(24,144,255)', borderRadius: '5px' }}
            >
              <div className="yuan">
                <span>￥</span> {performanceList[0]?.amount} 元
              </div>
              <div>可能存在误差，具体以财务公布的数据为准</div>
            </ProCard>
            <ProCard
              style={{ width: '23%' }}
              title={<span style={{ color: 'white' }}>本月业绩</span>}
              headerBordered
              hoverable
              headStyle={{ backgroundColor: 'rgb(24,144,255)', borderRadius: '5px' }}
            >
              <div className="yuan">
                <span>￥</span> {performanceList[1]?.amount} 元
              </div>
            </ProCard>
            <ProCard
              style={{ width: '23%' }}
              title={<span style={{ color: 'white' }}>本月冲刺金额</span>}
              headerBordered
              hoverable
              headStyle={{ backgroundColor: 'rgb(24,144,255)', borderRadius: '5px' }}
              extra={
                <span
                  style={{ color: 'white' }}
                  onClick={() => {
                    setModalVisible(true);
                  }}
                >
                  设置目标
                </span>
              }
            >
              {moneyYeJi ? (
                <div>
                  <span>业绩冲刺金额{moneyYeJi}元</span>
                  <Progress
                    percent={((performanceList[1]?.amount / moneyYeJi) * 100).toFixed(2) as any}
                    size="small"
                  />
                </div>
              ) : (
                <div
                  style={{ fontSize: '18px', textAlign: 'center' }}
                  onClick={() => {
                    setModalVisible(true);
                  }}
                >
                  请先设置冲刺目标
                </div>
              )}
            </ProCard>
            <ProCard
              style={{ width: '23%' }}
              title={<span style={{ color: 'white' }}>总业绩</span>}
              headerBordered
              hoverable
              headStyle={{ backgroundColor: 'rgb(186,28,33)', borderRadius: '5px' }}
            >
              <div className="yuan">
                <span>￥</span> {performanceList[2]?.amount} 元
              </div>
            </ProCard>
          </div> */}
          <ProCard
            split="vertical"
            className="cards"
            title={<span style={{ color: 'white' }}>业绩排名</span>}
            style={{ marginTop: '20px' }}
            headerBordered
            hoverable
            extra={
              <span
                onClick={() => {
                  history.push('/business/statistics/performances');
                }}
                style={{ color: 'white' }}
              >{`查看更多>>`}</span>
            }
            headStyle={{ backgroundColor: 'rgb(24,144,255)', borderRadius: '5px' }}
          >
            <ProCard
              colSpan="70%"
              title="业绩"
              // headerBordered
              style={{ height: '350px', paddingLeft: '20px' }}
            >
              <Column {...config} />
            </ProCard>
            <ProCard
              title={
                <div className="contentTitle">
                  {contentTitle.map((item: any, index: number) => {
                    if (item == '时间选择') {
                      return (
                        <RangePicker
                          defaultValue={timeChange}
                          key={`time-picker-${index}`}
                          style={{ width: '250px' }}
                          onChange={(e: any) => {
                            volume(
                              moment(e[0]).format('YYYY-MM-DD'),
                              moment(e[1]).format('YYYY-MM-DD'),
                            );
                            setTitleIndex(4);
                          }}
                        />
                      );
                    } else {
                      return (
                        <span
                          key={`content-title-${index}`}
                          style={{ color: index == contentTitleIndex ? '#1890ff' : 'black' }}
                          onClick={() => {
                            setTitleIndex(index);
                            contentTitleClick(index);
                          }}
                        >
                          {item}
                        </span>
                      );
                    }
                  })}
                  {/* <span style={{ color: '#1890ff' }}>今日</span>
                  <span>本周</span>
                  <span>今年</span> */}
                </div>
              }
            // headerBordered
            >
              <div style={{ padding: '10px 30px' }}>业绩排名</div>
              <ul className="contentUl">
                {todayContent &&
                  todayContent.map((item: any, index: number) => {
                    return (
                      <li key={`ranking-${item.name}-${index}`}>
                        <div className="indexSpan">{index + 1}</div>
                        <div>{item.name}</div>
                        <div>{item.amount}元</div>
                      </li>
                    );
                  })}
              </ul>
            </ProCard>
          </ProCard>
          <ProCard
            split="vertical"
            className="cards"
            title={<span style={{ color: 'white' }}>事业部业绩展示</span>}
            style={{ marginTop: '20px' }}
            headerBordered
            hoverable
            extra={
              <span
                onClick={() => {
                  history.push('/business/statistics/performances');
                }}
                style={{ color: 'white' }}
              >{`查看更多>>`}</span>
            }
            headStyle={{ backgroundColor: 'rgb(186,28,33)', borderRadius: '5px' }}
          >
            <ProCard
              colSpan="50%"
              title="各事业部今日业绩"
              // headerBordered
              style={{ height: '420px', paddingLeft: '20px' }}
            >
              <Column {...config1} />
            </ProCard>
            <ProCard
              colSpan="50%"
              title="各事业部本月业绩"
              // headerBordered
              style={{ height: '420px', paddingLeft: '20px' }}
            >
              <Column {...config2} />
            </ProCard>
          </ProCard>
        </div>
        <div style={{ flex: '1', marginLeft: '2%' }}>
          <ProCard
            title={<span style={{ color: 'white' }}>便捷导航</span>}
            headerBordered
            hoverable
            headStyle={{ backgroundColor: 'rgb(24,144,255)', borderRadius: '5px' }}
          >
            <div className="navigation">
              {navigationTabr.map((item: any, index: number) => {
                return (
                  <div
                    key={`navigation-${item.name}-${index}`}
                    className="navigation-icon"
                    onClick={() => {
                      history.push(item.url);
                    }}
                  >
                    {/* <p></p> */}
                    <div
                      style={{
                        width: '100%',
                        marginBottom: '0px',
                      }}
                    >
                      {item.icon}
                    </div>
                    <Link to={item.url}>{item.name}</Link>
                  </div>
                );
              })}
            </div>
          </ProCard>
          <ProCard
            title={<span style={{ color: 'white' }}>喜报（今日成交）</span>}
            style={{ marginTop: '20px' }}
            headerBordered
            hoverable
            headStyle={{ backgroundColor: 'rgb(186,28,33)', borderRadius: '5px' }}
          >
            <div className="xibao" id="rule">
              <ul
                className="list"
                id="list"
                // style={{ transform: CssList }}
                ref={lists}
                onClick={(e) => { }}
              >
                {contentList &&
                  contentList.map((item: any, index: number) => {
                    return item;
                  })}
              </ul>
            </div>
          </ProCard>
        </div>
      </div>

      <ModalForm
        title="设置冲刺目标"
        width={800}
        visible={ModalVisible}
        onFinish={async (values) => {
          request
            .post('/sms/user', {
              targetAmount: values.money,
              id: initialState?.currentUser?.userid,
            })
            .then(async (res: any) => {
              if (res.status == 'success') {
                message.success('修改成功！');
                sessionStorage.removeItem('userInfo');
                const userInfo = await request.get('/sms/user');
                sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
                setModalVisible(false);
              }
            });
        }}
        modalProps={{
          onCancel: () => setModalVisible(false),
        }}
      >
        <ProFormDigit
          width="md"
          name="money"
          label="目标金额"
          placeholder="请输入冲刺金额"
          rules={[
            {
              required: true,
            },
          ]}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default Welcome;
