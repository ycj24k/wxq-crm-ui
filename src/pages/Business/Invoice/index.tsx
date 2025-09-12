import { PageContainer } from '@ant-design/pro-layout';
import { forwardRef, useEffect, useRef } from 'react';
import Invoice from './Invoice';

export default () => {
  return (
    <PageContainer>
      <Invoice />
    </PageContainer>
  );
};
