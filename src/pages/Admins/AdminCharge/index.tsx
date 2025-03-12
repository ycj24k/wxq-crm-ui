import React, { useEffect, useRef, useState } from 'react';

import { PageContainer } from '@ant-design/pro-layout';
import Charge from './Charge';

export default () => {
  return (
    <PageContainer>
      <Charge admin={true} />
    </PageContainer>
  );
};
