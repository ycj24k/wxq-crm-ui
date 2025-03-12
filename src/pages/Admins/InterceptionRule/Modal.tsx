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
  const { modalVisible, setModalVisible, callbackRef, renderData } = props;
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
        .post('/sms/system/syInterceptionRule', values)
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
      title={renderData.type == 'add' ? '新建赋权规则' : '修改赋权规则'}
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
      <ProFormText width="xl" name="permissionCodes" label="权限代码" />
      <ProFormText width="xl" name="uri" label="许可路径" />
      <ProFormText width="xl" name="excludeUris" label="排除路径" />

      <ProFormSelect
        width="sm"
        name="method"
        label="请求方式"
        valueEnum={{
          GET: 'GET',
          POST: 'POST',
          DELETE: 'DELETE',
          ALL: 'ALL',
        }}
        fieldProps={{
          mode: 'multiple',
        }}
      />
      <ProFormTextArea width="md" name="description" label="描述" />
    </ModalForm>
  );
};
