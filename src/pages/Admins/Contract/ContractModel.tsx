import { Modal } from 'antd';
import Contract from './Contract';

export default (props: any) => {
  const { setModalVisible, modalVisible, callbackRef, setCompanyId } = props;
  return (
    <Modal width={1200} visible={modalVisible} onCancel={() => setModalVisible()}>
      <Contract
        type="contract"
        setCompanyId={(e: any) => {
          setCompanyId(e);
        }}
        onCancel={() => {
          setModalVisible();
        }}
      />
    </Modal>
  );
};
