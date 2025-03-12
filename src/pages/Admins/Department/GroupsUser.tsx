import { Modal } from 'antd';
import UserManage from '../UserManage';
export default (props: any) => {
  const { CardVisible, setCardVisible, renderData } = props;
  return (
    <Modal
      width={1200}
      visible={CardVisible}
      onCancel={() => setCardVisible()}
      onOk={() => {
        setCardVisible();
      }}
    >
      <UserManage params={renderData} />
    </Modal>
  );
};
