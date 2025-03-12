import { Modal } from 'antd';
import { useEffect } from 'react';
import DepartmentCards from '../Department/Groups';
export default (props: any) => {
  const { CardVisible, setCardVisible, setGrouptment, ment } = props;
  useEffect(() => {}, []);
  return (
    <Modal
      visible={CardVisible}
      width={800}
      onCancel={() => setCardVisible()}
      onOk={() => {
        setCardVisible();
        ment();
      }}
    >
      <DepartmentCards
        falg={false}
        setGrouptment={(e: any) => {
          setGrouptment(e);
        }}
        setCardVisible={() => setCardVisible(false)}
      />
    </Modal>
  );
};
