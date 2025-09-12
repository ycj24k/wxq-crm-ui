import React, { useRef } from 'react';
import { Button, message, Modal } from 'antd';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import request from '@/services/ant-design-pro/apiRequest';
interface valueType {
  name: string;
  value: string;
  description: string;
  parentId: number;
  id: number | string;
}

export default (props: any) => {
  const formRef = useRef<ProFormInstance>();
  const { modalVisible, setModalVisible, callbackRef, renderData } = props;

  const styleLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 14 },
  };

  return (
    <Modal
      visible={modalVisible}
      title="班级信息"
      width={1200}
      onCancel={() => setModalVisible()}
      onOk={() => setModalVisible()}
     />
  );
};
