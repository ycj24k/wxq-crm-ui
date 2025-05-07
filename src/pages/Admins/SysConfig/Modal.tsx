import React, { useEffect, useRef, useState } from 'react';
import { Button, message } from 'antd';
import {
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
  ProFormSwitch,
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import request from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import dictionaries from '@/services/util/dictionaries';
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
  const [ValueType, setValueType] = useState<any>();

  useEffect(() => {
    setTimeout(() => {
      formRef?.current?.resetFields();
      if (renderData.types == 'eidt') {
        renderData.configGroup = renderData?.configGroup.toString();
        renderData.type = renderData.type.toString();
        formRef?.current?.setFieldsValue(renderData);
      } else {
        formRef?.current?.setFieldsValue({
          type: '1',
        });
        setValueType('1');
      }
    }, 100);
  }, [renderData]);

  const styleLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 14 },
  };
  const submitok = (values: valueType) => {
    if (renderData.type == 'eidt') values.id = renderData.id;
    return new Promise((resolve, reject) => {
      request
        .post('/sms/system/sysConfig', values)
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
      title={renderData.type == 'add' ? '新建系统设置' : '修改系统设置'}
      autoFocusFirstInput
      {...styleLayout}
      // width={500}
      // @ts-ignore
      layout="LAYOUT_TYPE_HORIZONTAL"
      modalProps={{
        onCancel: () => setModalVisible(),
      }}
      formRef={formRef}
      onFinish={async (values: any) => {
        if (values.value) {
          values.value = values.value;
        } else {
          values.value = false;
        }
        if (renderData.types == 'eidt') values.id = renderData.id;
        await submitok(values);
      }}
      visible={modalVisible}
    >
      <ProFormSelect
        label="值类型"
        name="configGroup"
        width={200}
        required
        request={async () => Dictionaries.getList('configGroup') as any}
      // fieldProps={{
      //   onChange: (e) => {
      //     setValueType(e);
      //   },
      // }}
      />
      <ProFormText width="xl" name="code" label="代码" rules={[{ required: true }]} />
      <ProFormText width="xl" name="name" label="名称" rules={[{ required: true }]} />
      <ProFormSelect
        label="值类型"
        name="type"
        width={200}
        required
        request={async () => Dictionaries.getList('configType') as any}
        fieldProps={{
          onChange: (e) => {
            setValueType(e);
          },
        }}
      />
      {ValueType === '1' && (
        <ProFormText width="xl" name="value" label="值" />
      )}
      {ValueType === '2' && (
        <ProFormSwitch name="value" label="值" checkedChildren="开启" unCheckedChildren="关闭" />
      )}
      {ValueType == '3' && (
        <ProFormSelect request={async () => dictionaries.getList('bankType') as any} name="value" label="值" />
      )}

      <ProFormTextArea width="xl" name="description" label="描述" />
    </ModalForm>
  );
};
