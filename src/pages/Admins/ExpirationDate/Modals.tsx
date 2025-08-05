import { useEffect, useRef } from 'react';
import ProForm, {
  ModalForm,
  ProFormText,
  ProFormCascader,
} from '@ant-design/pro-form';
import Dictionaries from '@/services/util/dictionaries';
import type { ProFormInstance } from '@ant-design/pro-form';
import request from '@/services/ant-design-pro/apiRequest';
import { message } from 'antd';
export default (props: any) => {
  const { modalVisible, setModalVisible, callbackRef, renderData, url } = props;
  console.log(renderData, 'renderData')
  const formRef = useRef<ProFormInstance>();

  useEffect(() => {
    if (renderData.types == 'edit') {
      setTimeout(() => {
        formRef?.current?.setFieldsValue({
          cluesValidityPeriod: renderData.cluesValidityPeriod,
          allocationValidityPeriod: renderData.allocationValidityPeriod,
          project: Dictionaries.getCascaderValue('dict_reg_job', renderData.project),
        });
      }, 100);
    }
  },[])


  const filter = (inputValue: string, path: any[]) => {
    return path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
  };
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title={renderData.types == 'edit' ? '编辑有效期' : '新建有效期'}
      formRef={formRef}
      visible={modalVisible}
      width={400}
      autoFocusFirstInput
      modalProps={{
        onCancel: () => setModalVisible(),
        destroyOnClose: true,
      }}
      onFinish={async (values: any) => {
        if (values.project) values.project = values.project[values.project.length - 1];
        console.log(values, 'values')

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
        <ProFormCascader
          width="xl"
          name="project"
          placeholder="咨询报考岗位"
          label="报考岗位"
          rules={[{ required: true, message: '请选择报考岗位' }]}
          fieldProps={{
            options: Dictionaries.getList('dict_reg_job'),
            showSearch: { filter },
            // onChange: (e: any) => { handleChangeProject(e, index) }
            // onSearch: (value) => console.log(value)
          }}
        />
        <ProFormText
          width="xl"
          label="线索有效期"
          name="cluesValidityPeriod"
          rules={[
            {
              required: true,
              message: '请填写线索有效期',
            },
          ]}
        />
        <ProFormText
          width="xl"
          label="分成有效期"
          name="allocationValidityPeriod"
          rules={[
            {
              required: true,
              message: '请填写分成有效期',
            },
          ]} />
      </ProForm.Group></ModalForm>
  );
};
