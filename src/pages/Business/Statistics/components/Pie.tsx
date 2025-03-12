import { Column, Pie } from '@ant-design/plots';
import ProCard from '@ant-design/pro-card';
import { history } from 'umi';
export default (props: any) => {
  const { data, todayContent = false, moon } = props;

  const configa = {
    appendPadding: 10,
    // datas,
    angleField: 'amount',
    colorField: 'project',
    radius: 0.8,
    legend: {
      layout: 'horizontal',
      position: 'bottom',
    },
    label: {
      type: 'outer',
      content: (e: any) => `${e.project}${e.amount}元`,
    },
    interactions: [
      {
        type: 'pie-legend-active',
      },
      {
        type: 'element-active',
      },
    ],
  };
  const configs = {
    appendPadding: 10,
    // datas,
    angleField: 'num',
    colorField: 'project',
    radius: 0.8,
    legend: {
      layout: 'horizontal',
      position: 'bottom',
    },
    label: {
      type: 'outer',
      labelHeight: 28,
      content: '{name}\n{percentage}',
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
    meta: {
      num: {
        alias: '人数',
      },
      amount: {
        project: '项目',
      },
    },
  };
  return (
    <ProCard split="vertical" className="cards">
      <ProCard title="业绩金额" style={{ height: '400px' }}>
        <Pie data={data} {...configa} />
      </ProCard>
      <ProCard title="招生人数" style={{ height: '400px' }}>
        <Pie data={data} {...configs} />
      </ProCard>
      {todayContent && (
        <ProCard title="业绩排名" colSpan="20%">
          <ul className="contentUl" style={{ overflow: 'auto', height: '390px' }}>
            {todayContent.map((item: any, index: number) => {
              return (
                <li
                  key={index}
                  onClick={() => {
                    history.push(
                      '/business/statistics/performance?userId=' +
                      item.userId +
                      '&moonTime=' +
                      moon,
                    );
                  }}
                >
                  <div>
                    <span>{index + 1}</span>
                    {item.name}
                  </div>
                  <div>{item.amount}元</div>
                </li>
              );
            })}
          </ul>
        </ProCard>
      )}
    </ProCard>
  );
};
