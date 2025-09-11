import React, { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import Student from '../../Admins/StudentManage/student';
export default () => {

  const [TabListNuber, setTabListNuber] = useState<any>('0');

  return (
    <PageContainer
      onTabChange={(e) => {
        setTabListNuber(e);

      }}
      tabList={[
        {
          tab: '个人',
          key: '0',
        },
        {
          tab: '企业',
          key: '1',
        },
        {
          tab: '代理人',
          key: '2'
        },

      ]}
    >
      {TabListNuber == '0' ? (

        <Student type="学员" isFormal={false} toolbar='潜在学员'/>
      ) : TabListNuber == '1' ? (
        <Student type="企业/同行机构" isFormal={false} toolbar='潜在学员'/>
      ) : (
        <Student type="个人代理" isFormal={false} toolbar='潜在学员'/>
      )}

    </PageContainer>
  );
};
