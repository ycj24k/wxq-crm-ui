import React, { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import Student from './student';

export default () => {
  return (
    <PageContainer>
      <Student admin={true} />
    </PageContainer>
  );
};
