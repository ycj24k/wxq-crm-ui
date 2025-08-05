import React, { useEffect, useRef, useState } from 'react';

import { PageContainer } from '@ant-design/pro-layout';
import Charge from '../../../Admins/AdminCharge/Charge';

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
      ]}
    >
      <Charge type="1" studentType={TabListNuber} chargeType="refundList" chargeBtn="hiddenBtn"/>
    </PageContainer>
  );
};
