import React, { useRef } from 'react';
import { Button, message } from 'antd';
import { ModalForm, ProFormText, ProFormTextArea, ProFormSelect } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import request from '@/services/ant-design-pro/apiRequest';
interface valueType {
  name: string;
  content: string;
  description: string;
  type: number;
  id: number | string;
}

export default (props: any) => {
  const formRef = useRef<ProFormInstance>();
  const { modalVisible, setModalVisible, callbackRef, renderData } = props;
  setTimeout(() => {
    formRef?.current?.resetFields();
    if (renderData.types == 'eidt') {
      renderData.type = renderData.type + '';
      formRef?.current?.setFieldsValue(renderData);
    }
  }, 100);

  const styleLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 14 },
  };
  const submitok = (values: valueType) => {
    if (renderData.types == 'eidt') values.id = renderData.id;
    values.type = 0;
    return new Promise((resolve, reject) => {
      request
        .post('/sms/business/bizText', values)
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
      title={renderData.types == 'add' ? '新建喜报语句' : '修改喜报语句'}
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
        console.log('s', values);

        await submitok(values);
      }}
      visible={modalVisible}
    >
      <ProFormSelect
        label="文本类型"
        name="type"
        width="md"
        // request={async () => Dictionaries.getList('chargeType')}
        valueEnum={{
          0: '喜报文本',
        }}
        required
        disabled
        fieldProps={{ defaultValue: ['喜报文本'] }}
      />
      <ProFormTextArea width="xl" name="content" label="喜报内容" />
    </ModalForm>
  );
};
