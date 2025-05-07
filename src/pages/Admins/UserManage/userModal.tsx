import React, { useEffect, useRef, useState } from 'react';
import { Button, message, Descriptions } from 'antd';
import { ProFormDatePicker, ProFormInstance } from '@ant-design/pro-form';
import ProForm, {
  DrawerForm,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
  ProFormSwitch,
} from '@ant-design/pro-form';
import Dictionaries from '@/services/util/dictionaries';
import request from '@/services/ant-design-pro/apiRequest';
import moment from 'moment';
import DepartmentCard from '../Department/DepartmentCard';
import GroupCard from './groupModal';
import UploadDragger from '@/components/UploadDragger/UploadDragger';
import UserTreeSelect from '@/components/ProFormUser/UserTreeSelect';
import apiRequest from '@/services/ant-design-pro/apiRequest';
import { getCompanyRequest } from '@/services/util/util';
export default (props: any) => {
  const [CardVisible, setCardVisible] = useState<boolean>(false);
  const [groupVisible, setGroupisible] = useState<boolean>(false);
  let [department, setDepartment] = useState<any>({ name: '' });
  let [groupment, setGrouptment] = useState<any>({ name: '' });
  const formRef = useRef<ProFormInstance>();
  const userRef: any = useRef(null);
  const [userNameId, setUserNameId] = useState<any>(false);
  const { modalVisible, setModalVisible, callbackRef, renderData, typeStatus, setStatus } = props;
  const typeUser = renderData.typeUser == 'user' ? true : false
  let url = renderData.typeUser == 'user' ? '/sms/user' : '/sms/system/sysUser'
  let uploadUrl = renderData.typeUser == 'user' ? '/sms/user/upload' : '/sms/system/sysUser/upload'
  let downloadUrl = renderData.typeUser == 'user' ? '/sms/user/download' : '/sms/system/sysUser/download'
  const ment = () => {
    formRef?.current?.setFieldsValue({
      departmentId: department.name,
    });
  };
  useEffect(() => {
    ment();
  }, [department]);
  const groupmentFn = () => {
    formRef?.current?.setFieldsValue({
      groupId: groupment.name,
    });
  };
  useEffect(() => {
    groupmentFn();
  }, [groupment]);
  useEffect(() => {
    if ((renderData.type == 'eidt', renderData.numberEidt == 0)) {
      setTimeout(async () => {
        if (renderData.departmentId && !typeUser) {
          department = (await Dictionaries.getDepartment(renderData.departmentId)).data.content[0];
        }
        if (typeUser) {
          console.log('1');
          department = { name: renderData.departmentName, id: renderData.departmentId }
          setDepartment({ name: renderData.departmentName, id: renderData.departmentId })
        }
        if (renderData.sex) {
          renderData.sex = '1';
        } else {
          renderData.sex = '0';
        }
        Object.keys(renderData).forEach((keys) => {
          if (typeof renderData[keys] == 'number') {
            renderData[keys] = renderData[keys] + ''
          }
        })
        let data = {}

        if (renderData.presenter) {
          data = {
            name: Dictionaries.getDepartmentUserName(Number(renderData.presenter)),
            id: renderData.presenter
          }
          userRef?.current?.setDepartment(data);
          setUserNameId(data)

        }
        if (renderData.idCardPhoto) {
          let arr: { uid: number; name: any; response: { data: any } }[] = [];
          renderData.idCardPhoto.split(',').forEach((item: any, index: number) => {
            arr.push({
              uid: index + 1,
              name: item,
              response: { data: item },
            });
          });
          renderData.idCardPhoto = arr;
        }
        if (renderData.graduationPhoto) {
          let arr: { uid: number; name: any; response: { data: any } }[] = [];
          renderData.graduationPhoto.split(',').forEach((item: any, index: number) => {
            arr.push({
              uid: index + 1,
              name: item,
              response: { data: item },
            });
          });
          renderData.graduationPhoto = arr;
        }
        if (renderData.gradePhoto) {
          let arr: { uid: number; name: any; response: { data: any } }[] = [];
          renderData.gradePhoto.split(',').forEach((item: any, index: number) => {
            arr.push({
              uid: index + 1,
              name: item,
              response: { data: item },
            });
          });
          renderData.gradePhoto = arr;
        }
        console.log('department', department);

        formRef?.current?.setFieldsValue({
          ...renderData,
          sex: renderData.sex,
          departmentId: department?.name,
        });
        ++renderData.numberEidt;
        // setEidtNumber(1);
      }, 100);
    }
    if (renderData.type == 'addUser') {
      let data: any = {
        name: renderData.name,
        privateMobile: renderData.mobile,
        degree: renderData.degree + '',
        entryTime: moment().format('GGGG-MM-DD HH:mm:ss'),
        profession: renderData.profession,
        status: '0',
        newOrderType: '0'
      }
      if (renderData.presenter) {
        let presenter = {
          name: Dictionaries.getDepartmentUserName(Number(renderData.presenter)),
          id: renderData.presenter
        }
        userRef?.current?.setDepartment(presenter);
        setUserNameId(presenter)

      }
      setTimeout(() => {
        formRef?.current?.setFieldsValue(data)
      }, 100)
    }
  }, [])

  const submitok = (value: any) => {
    if (value.departmentId) value.departmentId = department.id;
    if (value.groupId) value.groupId = groupment.id;
    if (!value.departmentId) delete value.departmentId;
    if (!value.groupId) delete value.groupId;
    //presenter
    if (userNameId) value.presenter = userNameId.id
    delete value.userId
    if (value.idCardPhoto) {
      let arr: any[] = [];
      value.idCardPhoto.forEach((item: any) => {
        arr.push(item.response.data);
      });
      value.idCardPhoto = arr.join(',');
    }
    if (value.graduationPhoto) {
      let arr: any[] = [];
      value.graduationPhoto.forEach((item: any) => {
        arr.push(item.response.data);
      });
      value.graduationPhoto = arr.join(',');
    }
    if (value.gradePhoto) {
      let arr: any[] = [];
      value.gradePhoto.forEach((item: any) => {
        arr.push(item.response.data);
      });
      value.gradePhoto = arr.join(',');
    }
    if (value.status == 3) {
      value.enable = false
    }
    return new Promise((resolve) => {
      request
        .post(url, value)
        .then((res: any) => {
          if (res.status == 'success') {
            message.success('操作成功');
            setModalVisible();
            setDepartment('');

            callbackRef();
            if (typeStatus == 'Entry') {
              setStatus(6)
            }
            resolve(true);
          }
        })
        .catch((err: any) => {
          resolve(true);
        });
    });
  };
  return (
    <DrawerForm<{
      name: string;
      company: string;
      id: number;
    }>
      // title="用户信息"
      formRef={formRef}
      width={1200}
      autoFocusFirstInput
      drawerProps={{
        destroyOnClose: true,
        onClose: () => {
          setModalVisible();
          setDepartment('');
        },
      }}
      onFinish={async (values) => {
        if (renderData.id && renderData.type != 'addUser') values.id = renderData.id;
        if (!values.groupId) values.groupId = -1
        await submitok(values);
        // message.success('提交成功');
      }}
      visible={modalVisible}
    >
      {renderData.type != 'look' ? (
        <div>
          <ProForm.Group>
            <ProFormText
              name="name"
              width="md"
              label="姓名"
              placeholder="请输入姓名"
              rules={[
                {
                  required: true,
                  pattern: new RegExp(/^\S*$/),
                  message: '不能包含空格/请输入正确的用户名',
                },
              ]}
              disabled={typeUser}
            />
            <ProFormText
              width="md"
              name="userName"
              label="账号/姓名拼音"
              placeholder="请输入账号"
              rules={[
                {
                  required: true,
                  pattern: new RegExp(/^\S*$/),
                  message: '不能包含空格/请输入正确的账号',
                },
              ]}
            />
            {/* <ProFormSelect
              label="性别"
              name="sex"
              width="xs"
              valueEnum={{
                0: '男',
                1: '女',
              }}
            /> */}
            <ProFormSelect
              label="民族"
              name="ethnic"
              width="xs"
              fieldProps={{
                showSearch: true,
              }}
              // rules={[{ required: true, message: '请选择民族' }]}
              request={async () => Dictionaries.getList('dict_nation') as any}
            />
            <ProFormSwitch name="enable" label="用户状态" required disabled={typeUser} />
          </ProForm.Group>
          <ProForm.Group>
            <ProFormText
              width="md"
              name="mobile"
              label="工作电话"
              disabled={typeUser}
              placeholder="请输入联系电话"
              rules={[
                {
                  required: true,
                  pattern: new RegExp(Dictionaries.getRegex('mobile')),
                  message: '请输入正确的手机号',
                },
              ]}
            />
            <ProFormText
              width="md"
              name="idCard"
              label="身份证"
              disabled={typeUser}
              placeholder="请输入身份证"
              rules={[
                {
                  required: true,
                  pattern: new RegExp(Dictionaries.getRegex('idCard')),
                  message: '请输入正确的身份证号',
                },
              ]}
            />
            <ProFormText
              width="md"
              name="privateMobile"
              label="私人电话号码"
              placeholder="请输入私人电话号码"
              rules={[
                {
                  pattern: new RegExp(Dictionaries.getRegex('mobile')),
                  message: '请输入正确的手机号',
                },
              ]}
            />
            <ProFormText width="md" name="weChat" label="微信" placeholder="请输入微信" />
            <ProFormText width="md" name="email" label="邮箱" placeholder="请输入email" />
            <ProFormSelect
              label="学历"
              name="degree"
              width="xs"
              rules={[{ required: true, message: '请选择学历' }]}
              request={async () => Dictionaries.getList('dict_education') as any}
            />
            <ProFormSelect
              label="政治面貌"
              name="formalAppearance"
              width="xs"
              request={async () => Dictionaries.getList('PoliticalLandscape') as any}
            />
            <ProFormText
              label='婚姻信息'
              name='marriageInfo'
              width='xs'
            />
            <ProFormText
              label='籍贯'
              name='nativePlace'
              width='xs'
            />
            {/* <ProFormText
              label='推荐人'
              name='presenter'
              width='xs'
            /> */}
            <UserTreeSelect
              ref={userRef}
              userLabel={'推荐人/招聘人'}
              userNames="userId"
              userPlaceholder="请输入推荐人"
              setUserNameId={(e: any) => setUserNameId(e)}
              // setDepartId={(e: any) => setDepartId(e)}
              flag={true}
            // setFalgUser={(e: any) => setFalgUser(e)}
            />
            <ProFormText
              label='前单位'
              name='frontUnit'
              width='sm'
            />
            <ProFormSwitch name="isMiddle" label="是否为管理层" required />
            <ProFormSelect
              label="业绩排名类型"
              name="newOrderType"
              width="sm"
              valueEnum={{
                0: '不展示',
                1: '展示在个人排名',
                2: '展示在部门负责人排名'
              }}
            />
          </ProForm.Group>
          <ProForm.Group>
            <ProFormText name="departmentId" label="部门" rules={[{ required: true }]} />
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
            <ProFormText name="groupId" label="小组" />
            <Button
              style={{ marginTop: '30px', marginLeft: '-30px' }}
              type="primary"
              onClick={async () => {
                setGroupisible(true);
              }}
            >
              选择
            </Button>
            <ProFormSelect
              label="职称级别"
              name="level"
              width="xs"
              disabled={typeUser}
              rules={[{ required: true, message: '请选择职称级别' }]}
              request={async () => Dictionaries.getList('ProfessionalTitle') as any}
            />
            <ProFormSelect
              label="办公地点"
              name="officeAddress"
              width="xs"
              rules={[{ required: true, message: '请选择办公地点' }]}
              request={async () => Dictionaries.getList('officeLocation') as any}
            />
            <ProFormSelect
              label="人员状态"
              name="status"
              width="xs"
              disabled={typeUser}
              rules={[{ required: true, message: '请选择人员状态' }]}
              request={async () => Dictionaries.getList('onJobStatus') as any}
            />
            <ProFormSelect
              label="所属公司"
              name="companyId"
              width="xl"
              initialValue={renderData.companyId}
              request={getCompanyRequest}
              rules={[
                {
                  required: true,
                },
              ]}
            ></ProFormSelect>
          </ProForm.Group>
          <ProForm.Group>
            <ProFormDatePicker
              name="entryTime"
              fieldProps={{
                format: 'YYYY-MM-DD',
              }}
              width="sm"
              label={`入职时间`}
              disabled={typeUser}
              rules={[{ required: true, message: '请选择入职时间' }]}
            />
            <ProFormDatePicker
              name="formalTime"
              fieldProps={{
                format: 'YYYY-MM-DD',
              }}
              width="sm"
              disabled={typeUser}
              label={`转正时间`}
            />
            <ProFormDatePicker
              name="turnoverTime"
              fieldProps={{
                format: 'YYYY-MM-DD',
              }}
              width="sm"
              disabled={typeUser}
              label={`离职时间`}
            />
            <ProFormDatePicker
              name="birthday"
              fieldProps={{
                format: 'YYYY-MM-DD',
              }}
              width="sm"
              label={`生日日期`}
            />
          </ProForm.Group>
          <ProForm.Group>
            <ProFormText
              label='毕业院校'
              name='graduationSchool'
              width='sm'
            />
            <ProFormText
              label='专业'
              name='profession'
              width='sm'
            />
            <ProFormDatePicker
              name="graduationTime"
              fieldProps={{
                format: 'YYYY-MM-DD',
              }}
              width="sm"
              label={`毕业时间`}
            />
          </ProForm.Group>
          <ProFormTextArea
            name="residentialAddress"
            label="现居住地址"
            placeholder="请输入现居住地址..."
          // fieldProps={inputTextAreaProps}
          />
          <ProFormTextArea
            name="idCardAddress"
            label="身份证居住地址"
            placeholder="请输入身份证居住地址..."
          // fieldProps={inputTextAreaProps}
          />
          <ProFormTextArea
            name="householdRegistrationAddress"
            label="户籍所在地"
            placeholder="请输入户籍所在地..."
          // fieldProps={inputTextAreaProps}
          />
          <ProFormTextArea
            name="familyInfo"
            label="家属联系方式"
            placeholder="请输入描述..."
          // fieldProps={inputTextAreaProps}
          />

          <ProFormTextArea
            name="description"
            label="描述"
            placeholder="请输入描述..."
          // fieldProps={inputTextAreaProps}
          />
          <UploadDragger
            width={1100}
            label="身份证正反面"
            name="idCardPhoto"
            action={uploadUrl}
            renderData={renderData}
            fileUrl={downloadUrl}
          />
          <UploadDragger
            width={1100}
            label="毕业证照片"
            name="graduationPhoto"
            action={uploadUrl}
            renderData={renderData}
            fileUrl={downloadUrl}
          />
          <UploadDragger
            width={1100}
            label="技能等级证照片"
            name="gradePhoto"
            action={uploadUrl}
            renderData={renderData}
            fileUrl={downloadUrl}
          />
        </div>
      ) : null}

      {CardVisible && (
        <DepartmentCard
          CardVisible={CardVisible}
          setCardVisible={() => setCardVisible(false)}
          setGrouptment={(e: any) => setDepartment(e)}
          ment={() => ment()}
        />
      )}
      {groupVisible && (
        <GroupCard
          CardVisible={groupVisible}
          setCardVisible={() => setGroupisible(false)}
          setGrouptment={(e: any) => setGrouptment(e)}
        />
      )}
    </DrawerForm>
  );
};
