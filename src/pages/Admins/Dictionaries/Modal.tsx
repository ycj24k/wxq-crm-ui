import React, { useRef } from 'react';
import { Button, message } from 'antd';
import { ModalForm, ProFormDigit, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
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
      formRef?.current?.setFieldsValue({
        parentId: renderData.name,
        name: renderData.name,
        value: renderData.value,
        description: renderData.description,
        code: renderData.code,
      });
    } else if (renderData.type == 'add') {
      formRef?.current?.setFieldsValue({
        parentId: -1,
      });
    } else if (renderData.type == 'addChild') {
      formRef?.current?.setFieldsValue({
        parentId: renderData.name,
      });
    } else if (renderData.type == 'addChildern') {
      formRef?.current?.setFieldsValue({
        parentId: renderData.title,
      });
    }
  }, 100);

  const styleLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 14 },
  };
  const submitok = (values: valueType) => {
    return new Promise((resolve, reject) => {
      if (renderData.type == 'add') {
        values.parentId = -1;
      } else if (renderData.type == 'addChild') {
        values.parentId = renderData.id;
      } else if (renderData.type == 'addChildern') {
        values.parentId = renderData.parentId2;
      } else {
        values.id = renderData.id;
        // @ts-ignore
        delete values.parentId;
      }
      request
        .post('/sms/system/sysDict', values)
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
      title={renderData.type == 'add' ? '新建字典' : '修改字典'}
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
      <ProFormText
        width="xl"
        name="name"
        label="字典名称"
        rules={[
          { required: true, message: '请正确填写，不能包含空格', pattern: new RegExp(/^\S*$/) },
        ]}
      />
      <ProFormText width="xl" name="code" label="code" />
      {renderData.type == 'add' ? (
        <ProFormText
          width="xl"
          name="value"
          label="值"
          // rules={[{ required: true, message: '这是必填项' }]}
        />
      ) : (
        <ProFormText width="xl" name="value" label="值" />
      )}
      <ProFormDigit name="sort" label="排序" width="xl" />
      <ProFormText width="lg" name="parentId" label="父类" disabled />
      <ProFormTextArea width="md" name="description" label="描述" />
    </ModalForm>
  );
};
