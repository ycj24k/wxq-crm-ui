import React, { useEffect, useRef, useState } from 'react';

import { PageContainer } from '@ant-design/pro-layout';
import Order from './Order';

export default () => {
  const [TabListNuber, setTabListNuber] = useState<any>('1');
  return (
    <PageContainer
      onTabChange={(e) => {
        setTabListNuber(e);
      }}
      tabList={[
        {
          tab: '学员订单',
          key: '1',
        },
        {
          tab: '团组订单',
          key: '2',
        },
      ]}
    >
      <Order admin={true} />
    </PageContainer>
  );
};
