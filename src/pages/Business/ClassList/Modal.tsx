import React, { useRef, useState } from 'react';
import { Button, message } from 'antd';
import ProForm, {
  ModalForm,
  ProFormCascader,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import Dictionaries from '@/services/util/dictionaries';

import request from '@/services/ant-design-pro/apiRequest';
interface valueType {
  project: any;
  name: string;
  value: string;
  description: string;
  parentId: number;
  id: number | string;
  JobClassExam: any;
}

export default (props: any) => {
  const formRef = useRef<ProFormInstance>();
  const { modalVisible, setModalVisible, callbackRef, renderData } = props;
  const [project, setproject] = useState<string>('');
  const [JobClassExam, setJobClassExam] = useState<any>([]);
  setTimeout(() => {
    // formRef?.current?.resetFields();
    if (renderData.typee == 'eidt') {
      renderData.classType = renderData.classType + '';
      renderData.classYear = renderData.classYear + '';
      renderData.examType = renderData.examType + '';
      renderData.project = Dictionaries.getCascaderValue('dict_reg_job', renderData.project);
      formRef?.current?.setFieldsValue(renderData);
    }
  }, 100);

  const styleLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 14 },
  };
  const filter = (inputValue: string, path: any[]) => {
    return path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
  };
  async function onChange(value: any, selectedOptions: any) {
    if (!value) return;
    const arr = [];
    const data: any = (
      await request.get(
        '/sms/business/bizChargeStandard?project=' + value[value.length - 1] + '&useNum=0',
      )
    ).data.content;
    if (data.length != 0) {
      arr[0] = projectClassExamListFn(data);
    }
    console.log('arr', arr);
    setJobClassExam(arr);
    // if (renderData.type != 'order') setJobClassExam(arr);
  }
  function projectClassExamListFn(data: any) {
    const arr: { label: string; value: any }[] = [];
    data.forEach((item: any) => {
      arr.push({
        label:
          Dictionaries.getName('dict_class_type', item.classType) +
          '/' +
          Dictionaries.getName('dict_exam_type', item.examType) +
          '/' +
          Dictionaries.getName('dict_class_year', item.classYear),
        value: JSON.stringify({
          classType: item.classType,
          examType: item.examType,
          classYear: item.classYear,
        }),
      });
    });

    return arr;
  }

  const submitok = (values: valueType) => {
    console.log('values', values);

    if (renderData.typee == 'eidt') values.id = renderData.id;
    values.project = values.project[values.project.length - 1];
    // const classVlaue = JSON.parse(values.JobClassExam);
    // delete values.JobClassExam;
    return new Promise((resolve, reject) => {
      request
        .post('/sms/business/bizClass', { ...values })
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
      title={renderData.typee == 'add' ? '新建班级' : '修改班级'}
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
      <ProFormText width="lg" name="name" label="班级名称" rules={[{ required: true }]} />

      <ProFormCascader
        width="sm"
        name="project"
        placeholder="咨询报考岗位"
        label="报考岗位"
        rules={[{ required: true, message: '请选择报考岗位' }]}
        fieldProps={{
          options: Dictionaries.getCascader('dict_reg_job'),
          showSearch: { filter },
          // onChange: onChange,
          onSearch: (value) => console.log(value),
          // defaultValue: ['0', '00'],
        }}
      />
      <ProFormDigit label='班级人数' name='quantity' rules={[{ required: true, message: '请选择班级人数' }]} />
      <ProFormDatePicker
        name="examStartTime"
        fieldProps={{
          // showTime: { format: 'HH:mm:ss' },
          format: 'YYYY-MM-DD',
        }}
        width="sm"
        label={`考试开始时间`}
      />
      <ProFormDatePicker
        name="examEndTime"
        fieldProps={{
          // showTime: { format: 'HH:mm:ss' },
          format: 'YYYY-MM-DD',
        }}
        width="sm"
        label={`考试结束时间`}
      />
      <ProFormTextArea width="md" name="description" label="备注" />
    </ModalForm>
  );
};
