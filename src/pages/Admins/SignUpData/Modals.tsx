import React, { useEffect, useRef, useState } from 'react';
import { Button, message } from 'antd';
import ProForm, {
  ModalForm,
  ProFormText,
  ProFormDateTimePicker,
  ProFormSelect,
  ProFormTextArea,
  ProFormCascader,
} from '@ant-design/pro-form';
import Dictionaries from '@/services/util/dictionaries';
import type { ProFormInstance } from '@ant-design/pro-form';
import request from '@/services/ant-design-pro/apiRequest';
export default (props: any) => {
  const { modalVisible, setModalVisible, callbackRef, renderData, url } = props;
  const [projects, setprojects] = useState(
    renderData.types == 'edit' ? renderData.parentProject : '',
  );
  const formRef = useRef<ProFormInstance>();
  const filter = (inputValue: string, path: any[]) => {
    return path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
  };
  function onChange(value: any, selectedOptions: any) {
    setprojects(value);
    console.log(value, selectedOptions);
  }
  if (renderData.types == 'edit') {
    setTimeout(() => {
      renderData.type = renderData.type + '';
      formRef?.current?.setFieldsValue(renderData);
    }, 100);
  }
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title="新建字段"
      formRef={formRef}
      visible={modalVisible}
      width={800}
      autoFocusFirstInput
      modalProps={{
        onCancel: () => setModalVisible(),
        destroyOnClose: true,
      }}
      onFinish={async (values: any) => {
        if (renderData.types == 'edit') values.id = renderData.id;

        request
          .post(url, values)
          .then((res: any) => {
            if (res.status == 'success') {
              message.success('操作成功');
              setModalVisible();
              callbackRef();
            }
            return true;
          })
          .catch((err: any) => {
            return true;
          });
      }}
    >
      <ProForm.Group>
        <ProFormText
          width={500}
          label="字段名"
          name="name"
          rules={[
            {
              required: true,
              message: '请填写收费标准',
            },
          ]}
        />
        <ProFormSelect
          label="字段类型"
          name="type"
          width="sm"
          request={async () => Dictionaries.getList('SignUpData') as any}
          rules={[
            {
              required: true,
              message: '请选择字段类型',
            },
          ]}
        />
        {/* <ProFormText
          width={500}
          label="字段类型"
          name="type"
          rules={[
            {
              required: true,
              message: '请填写收费标准',
            },
          ]}
        /> */}
        <ProFormText
          width={500}
          label="说明"
          name="description"
          rules={[
            {
              required: true,
              message: '请填写说明',
            },
          ]}
        />
        <ProFormText width={500} label="格式限制" name="format" />
      </ProForm.Group>
      <span>{`格式限制的格式:{size:限制上传的大小单位kb,required:是否必填,requirement：名称后提示,Example：图片示例链接,Download:下载模板链接,hidden:是否隐藏}`}</span>
    </ModalForm>
  );
};
