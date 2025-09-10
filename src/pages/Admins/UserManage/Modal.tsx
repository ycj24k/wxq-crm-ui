import React, { useRef } from 'react';
import { Button, message } from 'antd';
import { ModalForm, ProFormText, ProFormTextArea, ProFormSelect } from '@ant-design/pro-form';
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
  const { modalVisible, setModalVisible, callbackRef, renderData, url } = props;
  setTimeout(() => {
    formRef?.current?.resetFields();
    if (renderData.type == 'eidt') {
      formRef?.current?.setFieldsValue(renderData);
    }
  }, 100);

  const styleLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 14 },
  };
  const submitok = (values: valueType) => {
    if (renderData.type == 'eidt') values.id = renderData.id;
    return new Promise((resolve, reject) => {
      request
        .post(url, values)
        .then((res: any) => {
          if (res.status == 'success') {
            resolve(true);
            message.success('提交成功');
            setModalVisible();
            callbackRef();
          }
        })
        .catch((err: any) => {
          resolve(true);
        });
    });
  };
  return (
    <ModalForm<valueType>
      title={renderData.type == 'add' ? '新建' : '修改'}
      autoFocusFirstInput
      {...styleLayout}
      // width={500}
      // @ts-ignore
      layout="LAYOUT_TYPE_HORIZONTAL"
      modalProps={{
        onCancel: () => setModalVisible(),
      }}
      formRef={formRef}
      onFinish={async (values) => {
        await submitok(values);
      }}
      visible={modalVisible}
    >
      <ProFormText width="xl" name="name" label="名称" />
      <ProFormText width="xl" name="code" label="权限代码" />

      <ProFormTextArea width="md" name="description" label="描述" />
    </ModalForm>
  );
};
