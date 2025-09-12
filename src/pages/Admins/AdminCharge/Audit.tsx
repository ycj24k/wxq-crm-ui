import React, { useRef, useState } from 'react';
import { Button, message, Modal, Upload } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ModalForm, ProFormTextArea } from '@ant-design/pro-form';
import request from '@/services/ant-design-pro/apiRequest';
export default (props: any) => {
  const { modalVisible, setModalVisible, callbackRef, renderData, callback } = props;
  console.log('renderData', renderData);

  const formRef = useRef<ProFormInstance>();
  const submitok = (value: any) => {
    let type = 0;
    if (renderData.type != 0) {
      type = renderData?.auditNum ? renderData?.auditNum + 1 : 1;
    }
    // const type
    value.confirm = renderData.confirm;
    value.entityId = renderData.id;
    if (value.entityId instanceof Array) {
      const arr = []
      for (let i = 0; i < value.entityId.length; i++) {
        arr[i] = { ...value, entityId: value.entityId[i] }
      }
      value = arr
    } else {
      value = [value]
    }
    return new Promise((resolve) => {
      request
        .postAll('/sms/business/bizAudit/audits/' + type, value)
        .then((res: any) => {
          if (res.status == 'success') {
            message.success('操作成功');
            setModalVisible();
            callbackRef();
            resolve(true);
          }
        })
        .catch((err: any) => {
          resolve(true);
        });
    });
  };
  return (
    <ModalForm<{
      name: string;
      company: string;
      id: number;
    }>
      title={'审核意见'}
      formRef={formRef}
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {
          setModalVisible();
        },
        maskClosable: false,
      }}
      onFinish={async (values) => {
        // if (renderData.id) values.id = renderData.id;
        await submitok(values);
        // message.success('提交成功');
      }}
      visible={modalVisible}
    >
      <ProForm.Group>
        <ProFormTextArea
          label="审核意见"
          name="remark"
          width="lg"
          rules={[
            {
              required: !renderData.confirm,
              message: '请输入未通过原因',
            },
          ]}
        />
      </ProForm.Group>
    </ModalForm>
  );
};
