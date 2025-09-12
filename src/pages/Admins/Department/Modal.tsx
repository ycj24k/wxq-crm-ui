import React, { useRef } from 'react';
import { Button, Col, message, Row } from 'antd';
import ProForm, {
  ModalForm,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
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
        // parentId: renderData.name,
        // name: renderData.name,
        // value: renderData.value,
        // description: renderData.description,
        // code: renderData.code,
        ...renderData,
      });
    } else if (renderData.type == 'add') {
      formRef?.current?.setFieldsValue({
        parentId: -1,
      });
    } else if (renderData.type == 'addChild') {
      formRef?.current?.setFieldsValue({
        parentId: renderData.name,
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
      } else {
        values.id = renderData.id;
        // @ts-ignore
        delete values.parentId;
      }
      request
        .post('/sms/system/sysDepartment', values)
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
      title={renderData.type == 'add' ? '新建部门' : '修改部门信息'}
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
      labelCol={{ span: 5, offset: 1 }}
    >
      <ProFormText
        width="xl"
        name="name"
        label="部门名称"
        rules={[
          { required: true, message: '请正确填写，不能包含空格', pattern: new RegExp(/^\S*$/) },
        ]}
      />

      <ProFormText width="lg" name="parentId" label="父类" disabled />
      <ProFormTextArea width="md" name="description" label="描述" />
      <ProForm.Group label="喜报配置：" />
      <ProFormText width="lg" name="chargeTarget" label="每日业绩目标" />
      <ProFormText width="lg" name="bottomTarget" label="本月保底目标" />
      <ProFormText width="lg" name="secondaryTarget" label="本月次级目标" />
      <ProFormText width="lg" name="sprintTarget" label="本月冲刺目标" />
      <ProFormText width="lg" name="challengeTarget" label="本月挑战目标" />
      <ProFormSwitch name="isSend" label="是否发送到喜报" fieldProps={{ defaultChecked: false }} />
      <ProForm.Group label="配置部门流转规则：" />
      <ProFormText width="lg" name="personVisitTimeout" label="个人回访超时天数" />
      <ProFormText width="lg" name="personDealTimeout" label="个人成交超时天数" />
      <ProFormText width="lg" name="groupVisitTimeout" label="团组回访超时天数" />
      <ProFormText width="lg" name="groupDealTimeout" label="团组成交超时天数" />
      <ProFormText width="lg" name="personReceiveTimeout" label="个人未领取超时天数" />
      <ProFormText width="lg" name="groupReceiveTimeout" label="团组未领取超时天数" />
      <ProFormText width="lg" name="formalPersonVisitTimeout" label="正式个人回访超时天数" />
      <ProFormText width="lg" name="formalPersonDealTimeout" label="正式个人成交超时天数" />
      <ProFormText width="lg" name="formalPersonReceiveTimeout" label="正式个人未领取超时天数" />
      <ProFormText width="lg" name="formalGroupVisitTimeout" label="正式团组回访超时天数" />
      <ProFormText width="lg" name="formalGroupDealTimeout" label="正式团组成交超时天数" />
      <ProFormText width="lg" name="formalGroupReceiveTimeout" label="正式团组未领取超时天数" />
      <div style={{ width: '500px', color: '#7c7878', marginLeft: '190px' }}>
        团组未领取超时天数和个人未领取超时天数
        <br />
        值为-1时，此部门的的资源不会流转到上级部门
        <br />
        值为0时，此部门老师的资源和此部门下级部门的资源流转时会跳过此部门
        <br />
        值大于零时按照此值天数正常流转
        <br />
      </div>
    </ModalForm>
  );
};
