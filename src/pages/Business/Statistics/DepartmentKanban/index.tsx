import ProCard from '@ant-design/pro-card';
import { PageContainer } from '@ant-design/pro-layout';
import { useModel } from 'umi';
import UserCard from './Component/UserCard';
export default (props: any) => {
  const { initialState } = useModel('@@initialState');
  return (
    <PageContainer>
      <ProCard split="vertical">
        <ProCard colSpan="25%">
          <UserCard />
        </ProCard>
        <ProCard>
          <div>
            <span>{initialState?.currentUser?.name}</span><span />
          </div>
        </ProCard>
      </ProCard>
    </PageContainer>
  );
};
