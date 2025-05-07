import React, { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import Student from '../../Admins/StudentManage/student';

export default () => {
  const [TabListNuber, setTabListNuber] = useState<any>('1');
  return (
    <PageContainer
      onTabChange={(e) => {
        setTabListNuber(e);
      }}
      tabList={[
        {
          tab: '企业/同行机构',
          key: '1',
        },
        {
          tab: '个人代理',
          key: '2',
        },
        // {
        //   tab: '同行机构',
        //   key: '3',
        // },
      ]}
    >
      {TabListNuber == 1 ? (
        <Student type="企业/同行机构" isFormal={true} isPay={false} />
      ) : TabListNuber == 2 ? (
        <Student type="个人代理" isFormal={true} isPay={false} />
      ) : (
        <Student type="同行机构" isFormal={true} isPay={false} />
      )}
    </PageContainer>
  );
};
