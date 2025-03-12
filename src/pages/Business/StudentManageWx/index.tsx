import React, { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import Student from '../../Admins/StudentManage/student';

export default () => {
  return (
    <PageContainer>
      <Student type="学员" source='8' isFormal={true} />
    </PageContainer>
  );
};
