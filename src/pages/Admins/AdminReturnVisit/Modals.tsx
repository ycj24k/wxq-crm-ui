import React, { useRef } from 'react';
import { Modal, message } from 'antd';
import Student from '../StudentManage/student';
interface valueType {
  name: string;
  value: string;
  description: string;
  parentId: number;
  id: number | string;
}

export default (props: any) => {
  const { modalVisible, setModalVisible, callbackRef, renderData, type } = props;

  return (
    <Modal
      title="选择学员"
      width={1200}
      // @ts-ignore
      onCancel={() => setModalVisible()}
      onOk={() => setModalVisible()}
      visible={modalVisible}
    >
      <Student
        type={type}
        order={renderData.type}
        oncancel={() => {
          setModalVisible();
          callbackRef();
        }}
      />
    </Modal>
  );
};
