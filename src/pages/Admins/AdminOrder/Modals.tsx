import React, { useRef, useState } from 'react';
import { Modal, message } from 'antd';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import Student from '../StudentManage/student';
import request from '@/services/ant-design-pro/apiRequest';
interface valueType {
  name: string;
  value: string;
  description: string;
  parentId: number;
  id: number | string;
}

export default (props: any) => {
  const {
    modalVisible,
    setModalVisible,
    callbackRef,
    parentId = '-1',
    renderData,
    setStudentId,
    companyStudent = null,
    isFormal = false,
  } = props;
  return (
    <Modal
      title="选择学员"
      width={1200}
      // @ts-ignore
      onCancel={() => setModalVisible()}
      onOk={() => setModalVisible()}
      visible={modalVisible}
      destroyOnClose
    >
      <Student
        order={renderData.type}
        setStudentId={(e: any) => {
          setStudentId(e);
        }}
        companyStudent={companyStudent}
        parentId={parentId}
        isFormal={isFormal}
        type="学员"
        setStudentVisible={() => setModalVisible(false)}
        oncancel={() => {
          setModalVisible();
          callbackRef();
        }}
      />
    </Modal>
  );
};
