import ProForm, {
  ModalForm,
  ProFormDigit,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormUploadDragger,
} from '@ant-design/pro-form';
import { message, Upload, Image } from 'antd';
import request from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import { useEffect, useRef, useState } from 'react';
import UserTreeSelect from '@/components/ProFormUser/UserTreeSelect';
import filter from '@/services/util/filter';
export default (props: any) => {
  const { setModalVisible, modalVisible, callbackRef, renderData } = props;
  const userRef: any = useRef(null);
  const [userNameId, setUserNameId] = useState<any>();
  const [DepartId, setDepartId] = useState<any>();
  const [falgUser, setFalgUser] = useState<boolean>(false);
  const formRef = useRef<ProFormInstance>();

  useEffect(() => {
    if (renderData.type == 'eidt') {
      userRef.current.setDepartment({
        id: renderData.userId,
        name: renderData.userName,
      });
    }
    setUserNameId({
      id: renderData.userId,
      name: renderData.userName,
    });
    formRef.current?.setFieldsValue({
      ...renderData,
      percent: renderData.percent * 100,
    });
  }, []);
  const submitok = (values: any) => {
    return new Promise((resolve) => {
      request
        .post('/sms/business/bizIntroductionProject', values)
        .then((res: any) => {
          console.log('res', res);

          if (res.status == 'success') {
            message.success('操作成功!');
            setModalVisible();
            callbackRef();
            resolve(true);
          }
        })
        .catch((err: any) => {
          resolve(true);
        });
    });
  };
  return (
    <ModalForm
      width={550}
      formRef={formRef}
      onFinish={async (values) => {
        delete values.userName;
        values.userId = userNameId.id;
        if (renderData.type == 'eidt') {
          values.id = renderData.id;
        }
        values.percent = values.percent / 100;
        await submitok(values);
      }}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {
          setModalVisible();
        },
        maskClosable: false,
      }}
      visible={modalVisible}
    >
      <UserTreeSelect
        ref={userRef}
        userLabel="被推荐人"
        userNames="userName"
        userPlaceholder="请输入招生老师的名字"
        setUserNameId={(e: any) => setUserNameId(e)}
        setDepartId={(e: any) => setDepartId(e)}
        flag={true}
        setFalgUser={(e: any) => setFalgUser(e)}
      />
      <ProForm.Group>
        <ProFormSelect
          width="md"
          name="project"
          placeholder="选择报考岗位"
          disabled={renderData.type == 'eidt'}
          label="报考岗位"
          rules={[{ required: true, message: '请选择报考岗位' }]}
          fieldProps={{
            options: Dictionaries.getList('dict_reg_job'),
            showSearch: { filter },
            // onChange: onChange,
            onSearch: (value) => console.log(value),
            // defaultValue: ['0', '00'],
          }}
        />
        <ProFormDigit
          name="percent"
          label="抽成（百分比）"
          width={100}
          fieldProps={{
            addonAfter: '%',
          }}
          rules={[
            {
              required: true,
            },
          ]}
        />
      </ProForm.Group>
    </ModalForm>
  );
};
