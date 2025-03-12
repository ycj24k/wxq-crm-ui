import React, { useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';
import { Button, Form, Input, message, Space } from 'antd';
import { ProFormGroup, ProFormInstance, ProFormList } from '@ant-design/pro-form';
import ProForm, {
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
  ProFormSelect,
  ProFormCascader,
} from '@ant-design/pro-form';
import Dictionaries from '@/services/util/dictionaries';
import request from '@/services/ant-design-pro/apiRequest';
import UserManageCard from '../Department/UserManageCard';
import StudentModals from './Modals';
import { DeleteOutlined } from '@ant-design/icons';
let content: any = null;

export default (props: any) => {
  const { modalVisible, setModalVisible, callbackRef, renderData, admin, callback } = props;
  const { initialState } = useModel('@@initialState');
  const [disabledFalg, setdisabledFalg] = useState<boolean>(false);
  const [CardVisible, setCardVisible] = useState<boolean>(false);
  const [CardContent, setCardContent] = useState<any>();
  const [JobClassExam, setJobClassExam] = useState<any>(null);
  const [StudentModalsVisible, setStudentModalsVisible] = useState(false);
  const [companyStudent, setCompanyStudent] = useState<any>([]);
  let [department, setDepartment] = useState<any>({
    name: initialState?.currentUser?.name,
    id: initialState?.currentUser?.userid,
  });
  const url = '/sms/business/bizChargeStandard';

  const formRef = useRef<ProFormInstance>();
  // formRef?.current?.resetFields();
  const ment = () => {
    formRef?.current?.setFieldsValue({
      userId: department.name,
    });
  };
  useEffect(() => { }, [companyStudent]);
  // useEffect(() => {
  //   setDepartment({ name: initialState?.currentUser?.name, id: initialState?.currentUser?.userid });
  // }, [modalVisible]);
  useEffect(() => {
    ment();
  }, [department]);
  if (renderData.type == 'companyStudent' && renderData.orderNumber === 0) {
    setTimeout(() => {
      formRef?.current?.setFieldsValue({
        ...renderData,
        classYear: renderData.classYear + '',
        classType: renderData.classType + '',
        examType: renderData.examType + '',
        quantity: 1,
        receivable: renderData.receivable,
        userName: department.name,
        project: Dictionaries.getCascaderValue('dict_reg_job', renderData.project),
      });
    }, 100);
    setdisabledFalg(true);
    ++renderData.orderNumber;
  }
  if (renderData.type == 'order') {
    setTimeout(async () => {
      if (renderData.orderNumber === 0) {
        onChange([renderData.project]);
        // setDepartment(await Dictionaries.getUserName(renderData.userId));
        formRef?.current?.setFieldsValue({
          ...renderData,
          userName: department.name,
          project: Dictionaries.getCascaderValue('dict_reg_job', renderData.project),
          JobClassExam: JSON.stringify({
            receivable: renderData.receivable,
            standardId: renderData.standardId,
          }),
        });
        ++renderData.orderNumber;
      }
    }, 100);
  }
  // if (renderData.typee == 'add' && renderData.orderNumber === 0) {
  //   if (renderData.project) {
  //     onChange([renderData.project]);
  //   }
  //   setTimeout(() => {
  //     formRef?.current?.setFieldsValue({
  //       studentName: renderData.name,
  //       quantity: 1,
  //       userName: department.name,
  //       project: Dictionaries.getCascaderValue('dict_reg_job', renderData.project),
  //     });
  //     ++renderData.orderNumber;
  //   }, 100);
  // }

  const filter = (inputValue: string, path: any[]) => {
    return path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
  };
  async function onChange(value: any, selectedOptions?: any) {
    const data: any = (await request.get('/sms/business/bizChargeStandard?project=' + value.at(-1)))
      .data.content;
    if (data.length != 0) {
      let arr: { label: string; value: any }[] = [];
      data.forEach((item: any) => {
        arr.push({
          label:
            Dictionaries.getName('dict_class_type', item.classType) +
            '/' +
            Dictionaries.getName('dict_exam_type', item.examType) +
            '/' +
            Dictionaries.getName('dict_class_year', item.classYear),
          value: JSON.stringify({
            receivable: item.receivable,
            standardId: item.id,
          }),
        });
      });

      setJobClassExam(arr);
    } else {
      setJobClassExam(null);
    }
  }
  const submitok = (value: any) => {
    let data: any = {};
    data.orderId = renderData.orderId;
    data.quantity = value.quantity;
    data.standardId = JSON.parse(value.JobClassExam).standardId;
    data.id = renderData.id;
    return new Promise((resolve) => {
      request
        .post('/sms/business/orderStandard', data)
        .then((res: any) => {
          if (res.status == 'success') {
            message.success('操作成功');
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
    <ModalForm<{
      name: string;
      company: string;
      id: number;
    }>
      title={'下单'}
      width={700}
      formRef={formRef}
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {
          setModalVisible();
        },
        maskClosable: false,
      }}
      onFinish={async (values) => {
        if (renderData.id) values.id = renderData.id;
        await submitok(values);
        // message.success('提交成功');
      }}
      visible={modalVisible}
    >
      <ProForm.Group>
        <ProFormText
          name="studentName"
          width="sm"
          label={renderData.group ? '企业团组' : '学员姓名'}
          placeholder="请输入姓名"
          disabled={!disabledFalg}
          rules={[
            {
              required: true,
              pattern: new RegExp(/^\S*$/),
              message: '不能包含空格/请输入正确的用户名',
            },
          ]}
        />
        <ProFormCascader
          width="md"
          name="project"
          placeholder="选择报考岗位"
          label="报考岗位"
          disabled={disabledFalg}
          rules={[{ required: true, message: '请选择报考岗位' }]}
          fieldProps={{
            options: Dictionaries.getCascader('dict_reg_job'),
            showSearch: { filter },
            onChange: onChange,
            onSearch: (value) => console.log(value),
            // defaultValue: ['0', '00'],
          }}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormDigit
          name="quantity"
          width="sm"
          label="报名人数"
          disabled={renderData.type == 0 || disabledFalg}
        />
        {JobClassExam ? (
          <>
            <ProFormSelect
              label="班型选择"
              disabled={disabledFalg}
              name="JobClassExam"
              options={JobClassExam}
              fieldProps={{
                onChange: (e) => {
                  const a = JSON.parse(e);
                  formRef?.current?.setFieldsValue({
                    receivable: a.receivable,
                  });
                },
              }}
              width="sm"
            />
          </>
        ) : (
          <>
            <span style={{ display: 'inline-block', marginTop: '32px' }}>
              该项目尚未设置收费标准，请联系管理员设置！
            </span>
          </>
        )}
      </ProForm.Group>
      <ProForm.Group>
        <ProFormDigit
          name="receivable"
          label="收费标准"
          disabled={JobClassExam || disabledFalg}
          width="sm"
          rules={[{ required: true, message: '请输入金额' }]}
        />
        <ProFormText name="userName" label="收费人" required />
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
      </ProForm.Group>
      <ProForm.Group>
        {renderData.group && (
          <Button
            // style={{ marginLeft: '-30px' }}
            type="primary"
            onClick={async () => {
              setStudentModalsVisible(true);
            }}
          >
            添加学员
          </Button>
        )}
      </ProForm.Group>

      {companyStudent.length > 0 &&
        companyStudent.map((item: any, index: number) => {
          return (
            <ProForm.Group key={index}>
              <ProFormText
                name="studentNames"
                width="xs"
                label={'学员姓名'}
                placeholder="请输入姓名"
                disabled
                fieldProps={{ value: item.name }}
              />
              <ProFormSelect
                label="班型选择"
                name={'JobClassExam'}
                options={JobClassExam}
                fieldProps={{
                  onChange: (e) => {
                    const a = JSON.parse(e);
                    let objs = {};
                    objs['receivables' + index] = a.receivable;
                    formRef?.current?.setFieldsValue(objs);
                  },
                }}
                disabled
                width="sm"
              />
              <ProFormDigit
                fieldProps={{ precision: 2 }}
                name={'receivable'}
                label="本次收费"
                width="xs"
                disabled
              />
              <DeleteOutlined
                style={{ marginTop: '40px', marginLeft: '-15px', cursor: 'pointer' }}
                onClick={() => {
                  const arr = JSON.parse(JSON.stringify(companyStudent));
                  arr.splice(index, 1);
                  setCompanyStudent(arr);
                }}
              />
            </ProForm.Group>
          );
        })}

      {/* <ProForm.Group>
        <ProFormTextArea width="xl" label="备注" name="description" />
      </ProForm.Group> */}
      {CardVisible && (
        <UserManageCard
          CardVisible={CardVisible}
          CardContent={CardContent}
          setCardVisible={() => setCardVisible(false)}
          setDepartment={(e: any) => setDepartment(e)}
          departments={[department]}
        />
      )}

      {StudentModalsVisible && (
        <StudentModals
          type={0}
          modalVisible={StudentModalsVisible}
          parentId={renderData.id}
          setModalVisible={() => setStudentModalsVisible(false)}
          renderData={{ type: 'order' }}
          companyStudent={companyStudent}
          setStudentId={(e: any) => {
            let arr = Array.isArray(e) ? e : [e];

            setCompanyStudent([...companyStudent, ...arr]);
          }}
        />
      )}
    </ModalForm>
  );
};
