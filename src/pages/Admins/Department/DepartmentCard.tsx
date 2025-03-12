import { Modal } from 'antd';
import DepartmentCards from './DepartmentCards';
export default (props: any) => {
  const { CardVisible, setCardVisible, setGrouptment, ment } = props;
  return (
    <Modal
      visible={CardVisible}
      onCancel={() => setCardVisible()}
      onOk={() => {
        setCardVisible();
        ment();
      }}
    >
      <DepartmentCards
        type="modal"
        setParentIdTree={(e: any) => {
          setGrouptment(e);
        }}
        setCardVisible={() => setCardVisible()}
      />
    </Modal>
  );
};
