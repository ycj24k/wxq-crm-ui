import { ProFormText } from '@ant-design/pro-form';
import { Button, Row } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import request from '@/services/ant-design-pro/apiRequest';
import UserManageCard from '../../pages/Admins/Department/UserManageCard';
import { useModel } from 'umi';

let content: any = null;
export default forwardRef((props: any, ref) => {
  const { label, name, setUserNameId, userName, formRefs, userNameChange = false } = props;
  const { initialState } = useModel('@@initialState');
  const [CardContent, setCardContent] = useState<any>();
  const [CardVisible, setCardVisible] = useState<boolean>(false);
  let [department, setDepartment] = useState<any>({
    name: initialState?.currentUser?.name,
    id: initialState?.currentUser?.userid,
  });
  useImperativeHandle(ref, () => ({
    setDepartment: (e: any) => {
      setDepartment(e);
    },
  }));
  useEffect(() => {
    if (userName) {
      setDepartment(userName);
    }
  }, []);
  useEffect(() => {
    setUserNameId(department);
    formRefs?.current?.setFieldsValue({ [name]: department.name });
  }, [department]);
  const Change = (e: string) => {
    if (userNameChange) {
      setDepartment({ name: e, id: -1 });
    } else {
      return;
    }
  };
  return (
    <>
      <Row>
        <ProFormText
          name={name}
          label={label}
          width="sm"
          fieldProps={{
            value: department.name,
            onChange: (e) => {
              Change(e.target.value);
            },
          }}
          rules={[{ required: true }]}
        />
        <Button
          style={{ marginTop: '30px', marginLeft: '-30px' }}
          type="primary"
          onClick={async () => {
            if (!content) {
              content = await request.get('/sms/share/getDepartmentAndUser');
            }
            setCardContent({ content: content.data, type: 'order' });
            setCardVisible(true);
          }}
        >
          选择
        </Button>
      </Row>
      {CardVisible && (
        <UserManageCard
          CardVisible={CardVisible}
          CardContent={CardContent}
          setCardVisible={() => setCardVisible(false)}
          setDepartment={(e: any) => setDepartment(e)}
          departments={[department]}
        />
      )}
    </>
  );
});
