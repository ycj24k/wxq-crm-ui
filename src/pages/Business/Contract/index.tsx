import { PageContainer } from '@ant-design/pro-layout';
import Contract from '@/pages/Admins/Contract/Contract';

export default () => {
  return (
    <PageContainer>
      <Contract admin={false} />
    </PageContainer>
  );
};
