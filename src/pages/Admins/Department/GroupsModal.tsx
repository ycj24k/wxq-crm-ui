import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, message, Row } from 'antd';
import ProForm, {
  ModalForm,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import request from '@/services/ant-design-pro/apiRequest';
import DepartmentCard from './DepartmentCard';
import Dictionaries from '@/services/util/dictionaries';

interface valueType {
  name: string;
  value: string;
  description: string;
  parentId: number;
  id: number | string;
  departmentId: number;
}

export default (props: any) => {
  const formRef = useRef<ProFormInstance>();
  const [CardVisible, setCardVisible] = useState<boolean>(false);
  const [department, setDepartment] = useState<any>({ name: '' });
  const { modalVisible, setModalVisible, callbackRef, renderData } = props;
  useEffect(() => {
    if (renderData.type == 'add') {
    } else if (renderData.type == 'eidt') {
      getDepartment();
      console.log('department', department);

      formRef?.current?.setFieldsValue({ ...renderData, departmentId: department.name });
    }
  }, []);
  const ment = () => {
    formRef?.current?.setFieldsValue({
      departmentId: department.name,
    });
  };
  const getDepartment = async () => {
    setDepartment((await Dictionaries.getDepartment(renderData.departmentId)).data.content[0]);
  };
  useEffect(() => {
    ment();
  }, [department]);
  const styleLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 14 },
  };
  const submitok = (values: valueType) => {
    if (values.departmentId) values.departmentId = department.id;
    if (renderData.type == 'eidt') values.id = renderData.id;
    return new Promise((resolve, reject) => {
      request
        .post('/sms/system/sysGroup', values)
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
      title={renderData.type == 'add' ? '新建小组' : '修改小组信息'}
      autoFocusFirstInput
      width={600}
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
        label="小组名称"
        rules={[
          { required: true, message: '请正确填写，不能包含空格', pattern: new RegExp(/^\S*$/) },
        ]}
      />
      <ProForm.Group>
        <ProFormText name="departmentId" label="部门" rules={[{ required: true }]} width="md" />
        <Button
          style={{ marginTop: '30px', marginLeft: '-30px' }}
          type="primary"
          onClick={async () => {
            request.get('/sms/share/getDepartmentAndUser');
            setCardVisible(true);
          }}
        >
          选择
        </Button>
      </ProForm.Group>

      <ProFormTextArea width="md" name="description" label="描述" />
      <DepartmentCard
        CardVisible={CardVisible}
        setCardVisible={() => setCardVisible(false)}
        setGrouptment={(e: any) => setDepartment(e)}
        ment={() => ment()}
      />
    </ModalForm>
  );
};
