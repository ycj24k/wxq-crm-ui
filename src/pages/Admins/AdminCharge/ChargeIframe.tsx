import { Modal } from 'antd';

export default (props: any) => {
  const { previewVisible, setPreviewVisible, previewImage } = props;
  return (
    <Modal
      visible={previewVisible}
      title="信息"
      footer={null}
      width={1200}
      onCancel={() => setPreviewVisible(false)}
    >
      <iframe src={previewImage} style={{ width: '100%', height: '600px' }} />
    </Modal>
  );
};
