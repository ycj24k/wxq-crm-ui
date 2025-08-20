import React, { useEffect, useRef, useState } from 'react';

import { PageContainer } from '@ant-design/pro-layout';
import Order from '../../Admins/AdminOrder/Order';

export default () => {
  const [TabListNuber, setTabListNuber] = useState<any>('all');
  return (
    <PageContainer
      onTabChange={(e) => {
        setTabListNuber(e);
      }}
      tabList={[
        {
          tab: '全部',
          key: 'all',
        },
        {
          tab: '学员',
          key: '0',
        },
        {
          tab: '企业或同行机构',
          key: '1',
        },
        {
          tab: '个人代理',
          key: '2',
        },
        {
          tab: '废除的订单',
          key: '3',
        },
      ]}
    >
      <Order admin={true} type={TabListNuber} refund={true}/>
    </PageContainer>
  );
};
