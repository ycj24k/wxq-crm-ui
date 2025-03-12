import React, { useEffect, useRef, useState } from 'react';

import { PageContainer } from '@ant-design/pro-layout';
import Return from './Return';

export default () => {
  return (
    <PageContainer>
      <Return admin={true} />
    </PageContainer>
  );
};
