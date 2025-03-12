import React, { useEffect, useRef, useState } from 'react';
import { Button, message, Image, Upload, Modal } from 'antd';
import {
  ProFormCascader,
  ProFormDatePicker,
  ProFormInstance,
  ProFormUploadDragger,
} from '@ant-design/pro-form';
import ProForm, {
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
  ProFormSwitch,
  ProFormCheckbox,
} from '@ant-design/pro-form';
import Dictionaries from '@/services/util/dictionaries';
import request from '@/services/ant-design-pro/apiRequest';
import moment from 'moment';
import UserManageCard from '../Department/UserManageCard';
import StudentModals from '../AdminOrder/Modals';
import { history, useModel } from 'umi';
import { ExclamationCircleFilled } from '@ant-design/icons';
import UserTreeSelect from '@/components/ProFormUser/UserTreeSelect';
import ModbileListOrder from './ModbileListOrder';
const { confirm } = Modal;
let content: any = null;
export default (props: any) => {
  const { initialState } = useModel('@@initialState');
  const [company, setCompany] = useState('学员姓名');
  const { modalVisible, setModalVisible, callbackRef, url, type } = props;
  let { renderData } = props;
  const [StudentModalsVisible, setStudentModalsVisible] = useState(false);
  const [Student, setStudentId] = useState<any>(null);
  const [isModalVisibles, setisModalVisibles] = useState<boolean>(false);
  const [imgSrc, setImgSrc] = useState();
  const [ModiledataSource, setModiledataSource] = useState([{}]);
  const [ModileData, setModileData] = useState({})
  const [CardVisible, setCardVisible] = useState<boolean>(false);
  const [ModbileListVisible, setModbileListVisible] = useState<boolean>(false);
  const [CardContent, setCardContent] = useState<any>();
  let [department, setDepartment] = useState<any>({});
  const userRef: any = useRef(null);
  const userRefs: any = useRef(null);
  const userRef2: any = useRef(null);
  const [userNameId, setUserNameId] = useState<any>();
  const [userNameIds, setUserNameIds] = useState<any>();
  const [userNameId2, setUserNameId2] = useState<any>();

  const formRef = useRef<ProFormInstance>();
  useEffect(() => {
    if (JSON.stringify(department) != '{}') {
      console.log(department);

      formRef?.current?.setFieldValue('refereeName', department.name);
    }
  }, [department]);

  useEffect(() => {
    //从企业选择过来的
    if (Student) {
      const { record } = Student;
      setTimeout(() => {
        // if (!renderData.sex) renderData.sex = 0;
        if (renderData.type == 1) setCompany('企业名称');
        formRef?.current?.setFieldsValue({
          ...record,
          sex: renderData?.sex === false ? 'false' : renderData?.sex === true ? 'true' : '',
          type: record.type.toString(),
          source: record.source.toString(),
          project: Dictionaries.getCascaderValue('dict_reg_job', record.project),
        });
      }, 100);
    }
  }, [Student]);
  // formRef?.current?.resetFields();
  useEffect(() => {
    if (renderData.typee == 'eidt') {
      delete renderData.codeFile;
      delete renderData.powerAttorneyFile;
      setTimeout(() => {
        if (renderData.type == 1) setCompany('企业名称');
        formRef?.current?.setFieldsValue({
          ...renderData,
          sex: renderData?.sex === false ? 'false' : renderData?.sex === true ? 'true' : '',
          type: renderData.type.toString(),
          source: renderData.studentSource.toString(),
          project: Dictionaries.getCascaderValue('dict_reg_job', renderData.project),
          education: renderData.education?.toString(),
          QQ: renderData?.qq,
        });

        let data = {}
        let datas = {
          id: renderData.userId,
          name: renderData.userName
        }
        let data2 = {}
        if (renderData.provider) {
          data = {
            id: renderData.provider,
            name: renderData.providerName
          }
        } else {
          data = {
            name: initialState?.currentUser?.name,
            id: initialState?.currentUser?.userid,
          }
        }
        if (renderData.owner) {
          data2 = {
            id: renderData.owner,
            name: renderData.ownerName ? renderData.ownerName : '无'
          }
        } else {
          data2 = {
            name: initialState?.currentUser?.name,
            id: initialState?.currentUser?.userid,
          }
        }
        userRef?.current?.setDepartment(datas);
        userRefs?.current?.setDepartment(data);
        userRef2?.current?.setDepartment(data2);
        setUserNameId(datas)
        setUserNameIds(data)
        setUserNameId2(data2)
      }, 100);
    } else {
      formRef?.current?.setFieldsValue({
        consultationTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      });
      const data = {
        name: initialState?.currentUser?.name,
        id: initialState?.currentUser?.userid,
      }
      // userRef?.current?.setDepartment(data);
      // userRefs?.current?.setDepartment(data);
      // userRef2?.current?.setDepartment(data);
      // setUserNameId(data)
      // setUserNameIds(data)
      // setUserNameId2(data)
      if (renderData?.teacher) {
        userRef?.current?.setDepartment(data);
        setUserNameId(data)
        userRef2?.current?.setDepartment(data);
        setUserNameId2(data)
      }
      if (renderData?.newMedia) {
        userRefs?.current?.setDepartment(data);
        setUserNameIds(data)
      }
    }
  }, []);
  // useEffect(() => {
  // console.log(JSON.stringify(userNameId))
  // if (renderData.typee == 'add' && userNameId) {
  // userRef2?.current?.setDepartment(userNameId);
  // setUserNameId2(userNameId)
  // formRef?.current?.setFieldsValue({
  //   owner: { "label": userNameId?.name },
  // });
  // console.log(userNameId)
  // console.log(userNameIds)
  // console.log(userNameId2)
  // console.log(formRef?.current?.getFieldsValue())
  // }
  // }, [userNameId]);
  if (type == '学员' || renderData.parentId != -1) {
    setTimeout(() => {
      formRef?.current?.setFieldsValue({
        type: '0',
      });
    }, 100);
  }
  if (
    (!renderData.parentId && type == '企业/同行机构') ||
    (!renderData.parentId && type == '同行机构')
  ) {
    setTimeout(() => {
      setCompany('企业名称');
      formRef?.current?.setFieldsValue({
        type: '1',
      });
    }, 100);
  }
  if (type == '个人代理' && !renderData.parentId) {
    setTimeout(() => {
      setCompany('代理人姓名');
      formRef?.current?.setFieldsValue({
        type: '2',
      });
    }, 100);
  }
  const submitok = async (value: any, typeValue: boolean = true) => {
    delete value.userId
    value.provider = userNameIds.id || ''
    value.owner = userNameId2.id || ''
    value.createBy = userNameId.id || ''
    //检查是否为正式学员
    const MobileTrue = value.mobile ? (await request.get('/sms/business/bizStudent/findOrderByMobile', { mobileList: value.mobile })).data : { order: [], visit: [] }
    if ((MobileTrue.order.length !== 0 || MobileTrue.visit.length !== 0) && renderData.typee == 'add' && typeValue) {
      setModileData(value)
      setModiledataSource(MobileTrue)
      setModbileListVisible(true)
      return
    }

    //是否团组
    if (value.type == '1') {
      value.isPeer ? '' : (value.isPeer = false);
    }
    if (renderData.typee == 'eidt') value.id = renderData.studentId;
    if (Student) value.id = Student.id;
    if (renderData.parentId) value.parentId = renderData.parentId;
    if (JSON.stringify(department) != '{}') {
      value.refereeId = department.id;
      delete value.refereeName;
    }
    Object.keys(value).forEach((key) => {
      if (value[key] == '' && renderData.typee == 'add' && key != 'isPeer') {
        delete value[key];
      }
    });

    let url = renderData.newMedia ? '/sms/business/bizStudent/batch/importForOther' : '/sms/business/bizStudent'
    let data = renderData.newMedia ? [value] : value
    const callBackFn = (res) => {
      if (res.status == 'success') {
        if (renderData.typee == 'eidt') {
          let dataValue: any = {
            id: renderData.id,
            project: value.project,
            studentSource: value.source,
            consultationTime: value.consultationTime,
            provider: userNameIds.id
          }
          request.post('/sms/business/bizStudentUser', dataValue);
        }
        message.success('操作成功');
        setModalVisible();
        callbackRef();
        return true

      }
    }
    return new Promise((resolve) => {
      if (renderData.newMedia) {
        request
          .postAll(url, data)
          .then((res: any) => {
            resolve(callBackFn(res))
          })
          .catch((err: any) => {
            resolve(true);
          });
      } else {
        request
          .post(url, data)
          .then((res: any) => {
            resolve(callBackFn(res))
          })
          .catch((err: any) => {
            resolve(true);
          });
      }

    });
  };
  const filter = (inputValue: string, path: any[]) => {
    return path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
  };
  function onChange(value: any, selectedOptions: any) { }
  let tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
  let tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
  let obj = {};
  obj[tokenName] = tokenValue;
  return (
    <ModalForm<{
      name: string;
      company: string;
      id: number;
    }>
      title={renderData.typee == 'add' ? '新建' : '编辑'}
      formRef={formRef}
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
        onCancel: () => {
          setModalVisible();
        },
      }}
      onFinish={async (values: any) => {
        if (!values.QQ && !values.weChat && !values.mobile) {
          message.error('QQ、微信、电话，三种联系方式必须要添加一个', 5);
          return;
        }

        if (renderData.studentId) values.id = renderData.studentId;
        if (values.project) values.project = values.project[values.project.length - 1];
        if (values.codeFile) values.codeFile = values.codeFile.at(-1).response.data;
        if (values.powerAttorneyFile) values.powerAttorneyFile = values.powerAttorneyFile.at(-1).response.data;
        await submitok(values, true);
        // message.success('提交成功');
      }}
      visible={modalVisible}
    >
      <ProForm.Group>
        <ProFormSelect
          label="学员类型"
          name="type"
          width="xs"
          disabled
          request={async () => Dictionaries.getList('studentType') as any}
          fieldProps={{
            onChange: (e) => {
              // onchange(e);
              if (e == '1') {
                setCompany('企业名称');
              } else if (e == '2') {
                setCompany('代理人姓名');
              } else if (e == '3') {
                setCompany('介绍人姓名');
              } else {
                setCompany('学员姓名');
              }
            },
          }}
          rules={[{ required: true, message: '请选择学员类型' }]}
        />
        <ProFormText
          name="name"
          width="md"
          label={company}
          placeholder="请输入姓名"
          rules={[
            {
              required: true,
              pattern: new RegExp(/^\S*$/),
              message: '不能包含空格/请输入正确的用户名',
            },
          ]}
        />
        <Button
          style={{ marginTop: '30px', marginLeft: '-30px' }}
          type="primary"
          hidden={renderData.parentId == undefined || renderData.parentId == -1}
          disabled={renderData.types}
          onClick={async () => {
            //   setCardContent({ content: content.data, type: 'order' });
            setStudentModalsVisible(true);
          }}
        >
          选择学员
        </Button>
        {company === '企业名称' ? (
          <ProFormText
            width="sm"
            name="chargePersonName"
            label="企业负责人"
            placeholder="请输入企业负责人"
            rules={[
              {
                required: true,
                pattern: new RegExp(/^\S*$/),
                message: '不能包含空格/请输入正确的名字',
              },
            ]}
          />
        ) : null}
      </ProForm.Group>
      <ProForm.Group>
        {company === '企业名称' || type === '个人代理' ? (
          ''
        ) : (
          <ProFormSelect
            label="学历"
            hidden={company === '企业名称' || type === '个人代理'}
            name="education"
            width="xs"
            rules={[{ required: true, message: '请选择学历' }]}
            request={async () => Dictionaries.getList('dict_education') as any}
          />
        )}

        <ProFormText
          width="sm"
          name="mobile"
          label="联系电话"
          placeholder="请输入联系电话"
          rules={[
            {
              // required: true,
              pattern: new RegExp(Dictionaries.getRegex('mobile')),
              message: '请输入正确的手机号',
            },
          ]}
        />
        <ProFormText
          width="md"
          name="idCard"
          label={company === '企业名称' ? '企业负责人身份证号' : '身份证号'}
          placeholder="请输入身份证"
          rules={[
            {
              pattern: new RegExp(Dictionaries.getRegex('idCard')),
              message: '请输入正确的身份证号',
            },
          ]}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText width="xs" name="weChat" label="微信" placeholder="请输入微信" />
        <ProFormText width="xs" name="QQ" label="QQ" placeholder="请输入QQ" />
        <ProFormSelect
          label="性别"
          name="sex"
          width="xs"
          valueEnum={{
            false: '男',
            true: '女',
          }}
        />
        <ProFormCascader
          width="sm"
          name="project"
          placeholder="咨询报考岗位"
          label="报考岗位"
          rules={[{ required: true, message: '请选择报考岗位' }]}
          fieldProps={{
            options: Dictionaries.getCascader('dict_reg_job'),
            showSearch: { filter },
            onChange: onChange,
            onSearch: (value) => console.log(value),
            // defaultValue: ['0', '00'],
          }}
        />
        <ProFormSelect
          label="客户来源"
          name="source"
          width={200}
          rules={[{ required: true, message: '请选择客户来源' }]}
          request={async () => Dictionaries.getList('dict_source') as any}
        />
        <ProFormDatePicker
          name="consultationTime"
          fieldProps={{
            showTime: { format: 'HH:mm:ss' },
            format: 'YYYY-MM-DD HH:mm:ss',
          }}
          width="sm"
          label={`咨询日期`}
          rules={[{ required: true, message: '请选择咨询日期' }]}
        />
        {company === '企业名称' ? <ProFormCheckbox name="isPeer" label="是否同行" /> : ''}
      </ProForm.Group>
      {company === '企业名称' ? (
        <ProFormText
          name="code"
          label="统一社会信用代码"
          rules={[
            {
              required: true,
              pattern: new RegExp(Dictionaries.getRegex('code')),
              message: '请输入正确的社会信用代码',
            },
          ]}
        />
      ) : (
        ''
      )}
      <UserTreeSelect
        ref={userRef}
        userLabel={'招生老师'}
        userNames="userId"
        newMedia={renderData?.teacher && !(renderData.typee == 'eidt')}
        userPlaceholder="请输入招生老师"
        setUserNameId={(e: any) => setUserNameId(e)}
        // setDepartId={(e: any) => setDepartId(e)}
        flag={true}
      // setFalgUser={(e: any) => setFalgUser(e)}
      />
      <UserTreeSelect
        ref={userRefs}
        userLabel={'信息提供人'}
        userNames="provider"
        newMedia={renderData?.newMedia && !(renderData.typee == 'eidt')}
        userPlaceholder="请输入信息提供人"
        setUserNameId={(e: any) => setUserNameIds(e)}
        // setDepartId={(e: any) => setDepartId(e)}
        flag={true}
      // setFalgUser={(e: any) => setFalgUser(e)}
      />
      <UserTreeSelect
        ref={userRef2}
        userLabel={'信息所有人'}
        filter={(e: Array<any>) => {
          e.unshift({
            title: '无',
            userId: -1,
            value: '-1'
          })
          return e;
        }}
        userNames="owner"
        newMedia={false}
        userPlaceholder="请输入信息所有人"
        setUserNameId={(e: any) => setUserNameId2(e)}
        // setDepartId={(e: any) => setDepartId(e)}
        flag={true}
      // setFalgUser={(e: any) => setFalgUser(e)}
      />
      <ProFormTextArea
        name="address"
        label="地址"
        placeholder="请输入描述..."
      // fieldProps={inputTextAreaProps}
      />
      <ProFormTextArea
        name="description"
        label="备注"
        placeholder="请输入描述..."
      // fieldProps={inputTextAreaProps}
      />

      {company === '企业名称' ? (
        <>
          {/* <a download="委托授权及数字证书申请表" href="/template/委托授权及数字证书申请表.docx">
            下载委托授权及数字证书申请表
          </a> */}
          <ProForm.Group>
            <ProFormUploadDragger
              width={340}
              label="统一社会信用码电子版"
              name="codeFile"
              action="/sms/business/bizStudent/upload"
              fieldProps={{
                multiple: false,
                // method: 'POST',
                headers: {
                  ...obj,
                },
                listType: 'picture',
                defaultFileList: [],
                // onDrop: (e) => {},
                beforeUpload: (file) => {
                  if (file.type != 'image/png' && file.type != 'image/jpeg') {
                    message.error(`只能上传png、jpg格式`);
                    return Upload.LIST_IGNORE;
                  }
                },
                onPreview: async (file: any) => {
                  setImgSrc(file.thumbUrl);
                  setisModalVisibles(true);
                },
                onChange: (info) => {
                  const { status } = info.file;
                  if (status !== 'uploading') {
                  }
                  if (status === 'done') {
                    message.success(`${info.file.name} 上传成功.`);
                  } else if (status === 'error') {
                    message.error(`${info.file.name} 上传失败.`);
                  }
                },
              }}
            />

            <div style={{ display: 'none' }}>
              <Image
                width={200}
                style={{ display: 'none' }}
                preview={{
                  visible: isModalVisibles,
                  src: imgSrc,
                  onVisibleChange: (value: any) => {
                    setisModalVisibles(value);
                  },
                }}
              />
            </div>
          </ProForm.Group>
        </>
      ) : null}
      {StudentModalsVisible && (
        <StudentModals
          type={0}
          modalVisible={StudentModalsVisible}
          setModalVisible={() => setStudentModalsVisible(false)}
          renderData={{ type: 'order' }}
          setStudentId={(e: any) => {
            setStudentId(e);
          }}
        />
      )}
      {CardVisible && (
        <UserManageCard
          CardVisible={CardVisible}
          CardContent={CardContent}
          setCardVisible={() => setCardVisible(false)}
          setDepartment={(e: any) => setDepartment(e)}
          departments={[department]}
        />
      )}
      {ModbileListVisible && (
        <ModbileListOrder
          modalVisible={ModbileListVisible}
          setModalVisible={() => setModbileListVisible(false)}
          dataSource={ModiledataSource}
          renderData={ModileData}
          type='student'
          submitok={(value: any) => submitok(value, false)}
        />
      )}
    </ModalForm>
  );
};
