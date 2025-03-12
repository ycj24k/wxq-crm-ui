import React, { useEffect, useRef, useState } from 'react';
import { Button, message, Transfer } from 'antd';
import ProForm, {
  ModalForm,
  ProFormText,
  ProFormDateTimePicker,
  ProFormSelect,
  ProFormTextArea,
  ProFormCascader,
  ProFormDigit,
} from '@ant-design/pro-form';
import Dictionaries from '@/services/util/dictionaries';
import type { ProFormInstance } from '@ant-design/pro-form';
import request from '@/services/ant-design-pro/apiRequest';
import { TransferDirection } from 'antd/lib/transfer';
interface RecordType {
  key: string;
  title: string;
  // description: string;
}

export default (props: any) => {
  const { modalVisible, setModalVisible, callbackRef, renderData, url } = props;
  const [projects, setprojects] = useState(
    renderData.types == 'edit' ? renderData.parentProject : '',
  );
  useEffect(() => {
    console.log('projects', projects);
  }, [projects]);
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
      formRef?.current?.setFieldsValue({
        project: renderData.parentProject,
        projects: [renderData.project],
        classType: renderData.classType + '',
        classYear: renderData.classYear + '',
        examType: renderData.examType + '',
        receivable: renderData.receivable,
      });
    }, 100);
  }
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title="新建表单"
      formRef={formRef}
      visible={modalVisible}
      width={800}
      autoFocusFirstInput
      modalProps={{
        onCancel: () => setModalVisible(),
        destroyOnClose: true,
      }}
      onFinish={async (values: any) => {
        // values.project = values.project[values.project.length - 1];
        // if (renderData.types == 'edit') values.id = renderData.id;
        let arr: any = [];
        values.projects.forEach((item: any) => {
          if (renderData.types == 'edit') {
            arr.push({
              classType: values.classType,
              id: renderData.id,
              classYear: values.classYear,
              examType: values.examType,
              project: item,
              receivable: values.receivable,
              // examAmount: values.examAmount,
            });
          } else {
            arr.push({
              classType: values.classType,
              classYear: values.classYear,
              examType: values.examType,
              project: item,
              receivable: values.receivable,
              // examAmount: values.examAmount,
            });
          }
        });
        console.log('arr', arr);

        request
          .postAll('/sms/business/bizChargeStandard/saveArray', { array: arr })
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
        <ProFormSelect
          width="md"
          name="project"
          placeholder="选择报考岗位"
          disabled={renderData.types == 'edit'}
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
          name="projects"
          disabled={renderData.types == 'edit'}
          placeholder="选择报考岗位"
          label="报考岗位"
          rules={[{ required: true, message: '请选择报考岗位' }]}
          fieldProps={{
            options: Dictionaries.getList('dict_reg_job', projects),
            mode: 'multiple',
            showSearch: { filter },
            // onChange: onChange,
            // onSearch: (value) => console.log(value),
            // defaultValue: ['0', '00'],
          }}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormSelect
          label="报考班型"
          name="classType"
          width="sm"
          fieldProps={{ showSearch: { filter } }}
          request={async () => Dictionaries.getList('dict_class_type') as any}
          rules={[
            {
              required: true,
              message: '请选择班级类型',
            },
          ]}
        />
        <ProFormSelect
          label="班型年限"
          name="classYear"
          width="sm"
          fieldProps={{ showSearch: { filter } }}
          request={async () => Dictionaries.getList('dict_class_year') as any}
          rules={[
            {
              required: true,
              message: '请选择班型年限',
            },
          ]}
        />
        <ProFormSelect
          label="考试类型"
          name="examType"
          width="sm"
          fieldProps={{ showSearch: { filter } }}
          request={async () => Dictionaries.getList('dict_exam_type') as any}
          rules={[
            {
              required: true,
              message: '请选择考试类型',
            },
          ]}
        />
      </ProForm.Group>

      <ProForm.Group>
        <ProFormDigit
          width="md"
          label="收费标准"
          name="receivable"
          rules={[
            {
              required: true,
              message: '请填写收费标准',
            },
          ]}
        />

        {/* <ProFormDigit
          width="md"
          label="考试费"
          name="examAmount"
          rules={[
            {
              required: true,
            },
          ]}
        /> */}
      </ProForm.Group>
    </ModalForm>
  );
};
