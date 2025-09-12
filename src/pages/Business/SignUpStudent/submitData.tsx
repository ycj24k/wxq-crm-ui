import React, { useEffect, useRef, useState } from 'react';
import { Button, Image, message, Upload } from 'antd';
import type {
  ProFormInstance} from '@ant-design/pro-form';
import ProForm, {
  ModalForm,
  ProFormDatePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormUploadDragger,
} from '@ant-design/pro-form';
import Dictionaries from '@/services/util/dictionaries';

export default (props: any) => {
  const { modalVisible, setModalVisible, callbackRef, datas, url, setSubimtDatas } = props;
  const [projects, setprojects] = useState('')
  const formRef2 = useRef<ProFormInstance>();

  useEffect(() => {
    setprojects(datas.job)
    formRef2?.current?.setFieldsValue(datas)
  }, [])
  const submitok = (values: any) => {
    setSubimtDatas(JSON.stringify(values))
    setModalVisible()
  };
  const filter = (inputValue: string, path: any[]) => {
    return path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
  };
  function onChange(value: any, selectedOptions: any) {
    setprojects(value);
    console.log(value, selectedOptions);
  }
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title="健康承若书资料"
      visible={modalVisible}
      formRef={formRef2}
      width={660}
      autoFocusFirstInput
      modalProps={{
        onCancel: () => setModalVisible(),
        destroyOnClose: true,
      }}
      onFinish={async (values: any) => {
        // if (renderData.types == 'edit') values.id = renderData.id;
        values.job = Dictionaries.getCascaderAllName('dict_reg_job', values.job)
        values.project = Dictionaries.getCascaderName('dict_reg_job', values.project)
        values.degree = Dictionaries.getName('dict_education', values.degree)
        values.sex = values.sex ? '女' : '男'
        await submitok(values);
      }}
    >
      <ProFormRadio.Group
        name="type"
        label="培训方式"
        options={[
          {
            label: '初训',
            value: '1',
          },
          {
            label: '复训',
            value: '2',
          },
        ]}
      />
      <ProFormText
        label={'姓名'}
        name='name'
        key='name1'
      />
      <ProFormText
        label={'手机号码'}
        name='mobile'
        key='mobile1'
      />
      <ProFormText
        label={'身份证'}
        name='idCard'
        key='idCard1'
      />
      <ProFormSelect
        label="性别"
        name="sex"
        width="xs"
        valueEnum={{
          false: '男',
          true: '女',
        }}
      />
      <ProFormSelect
        label="学历"
        name="degree"
        width="xs"
        rules={[{ required: true, message: '请选择学历' }]}
        request={async () => Dictionaries.getList('dict_education') as any}
      />
      <ProFormSelect
        width="md"
        name="job"
        placeholder="选择报考岗位"
        label="报考岗位"
        rules={[{ required: true, message: '请选择报考岗位' }]}
        fieldProps={{
          options: Dictionaries.getList('dict_reg_job'),
          showSearch: { filter },
          onChange: onChange,
          onSearch: (value) => console.log(value),
          // defaultValue: ['0', '00'],
        }}
      />
      <ProFormSelect
        width="md"
        name="project"
        placeholder="选择报考岗位"
        label="报考岗位"
        rules={[{ required: true, message: '请选择报考岗位' }]}
        fieldProps={{
          options: Dictionaries.getList('dict_reg_job', projects),
          showSearch: { filter },
          // onChange: onChange,
          // onSearch: (value) => console.log(value),
          // defaultValue: ['0', '00'],
        }}
      />
      <ProFormText
        label={'工作单位或住址'}
        name='address'
        key='address1'
      />
      <ProForm.Group title="工作经历">
        <ProFormDatePicker
          name="jobTime"
          fieldProps={{
            showTime: { format: 'HH:mm:ss' },
            format: 'YYYY-MM-DD',
          }}
          width="sm"
          label={`工作时间段`}
        />
        <ProFormText
          label={'在何地何单位'}
          name='jobAdress'
          key='jobAdress1'
        />
        <ProFormText
          label={'所从事工种'}
          name='jobType'
          key='jobType1'
        />
      </ProForm.Group>

    </ModalForm>
  );
};
