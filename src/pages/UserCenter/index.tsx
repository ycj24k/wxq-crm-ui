import { Tabs, Radio, Image, message, Divider, Pagination } from 'antd';
import { useEffect, useRef, useState } from 'react';
import request from '@/services/ant-design-pro/apiRequest';
import ProCard from '@ant-design/pro-card';
import ProForm, { ProFormInstance, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { useModel, history } from 'umi';
import Dictionaries from '@/services/util/dictionaries';
import './index.less';
import moment from 'moment';
import ImgUrl from '@/services/util/UpDownload';
import ChargeIframe from '@/pages/Admins/AdminCharge/ChargeIframe';
import UserModal from "@/pages/Admins/UserManage/userModal"

const { TabPane } = Tabs;

export default () => {
  const formRef = useRef<ProFormInstance>();
  const formRefs = useRef<ProFormInstance>();
  const bizNotice = JSON.parse(sessionStorage.getItem('bizNotice') as string);
  const { initialState } = useModel('@@initialState');
  const [getRegex, setGetRegex] = useState<any>();
  const [imgSrc, setImgSrc] = useState();
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [isModalVisibles, setisModalVisibles] = useState<boolean>(false);
  const [bizNotices, setbizNotice] = useState(bizNotice?.data?.content);
  const [renderData, setRenderData] = useState<any>({});
  const [UserModalVisible, setUserModalVisible] = useState<boolean>(false)
  const { query = { key: '1' } } = history.location;
  const callbackRef = () => {

  }
  useEffect(() => {
    request.get('/sms/public/getRegex').then((res) => {
      setGetRegex(res.data);
    });

    formRef?.current?.setFieldsValue({
      ...initialState?.currentUser,
      sex: initialState?.currentUser?.sex ? '1' : '0',
    });
    // settotalAll(bizNotice?.data.totalPages);
  }, []);
  const look = async (id: number, item: string) => {
    const type = item.slice(item.indexOf('.'));
    await ImgUrl('/sms/business/bizNotice/download', id, item).then((res: any) => {
      setImgSrc(res);
      if (type == '.png' || type == '.jpg' || type == '.jpeg') {
        setisModalVisibles(true);
      } else {
        setPreviewVisible(true);
      }
    });
  };
  return (
    <ProCard>
      <Tabs tabPosition="left" defaultActiveKey={query.key as string}>
        <TabPane tab="基本设置" key="1">
          <ProCard split="vertical">
            <ProCard title="基本设置" colSpan="40%" >
              <ProForm
                formRef={formRef}
                submitter={{
                  resetButtonProps: {
                    style: {
                      display: 'none',
                    },
                  },
                }}
                onFinish={async (values) => {
                  Object.keys(values).forEach((key: any) => {
                    if (values[key] == '') {
                      delete values[key];
                    }
                  });
                  request
                    .post('/sms/user', { ...values, id: initialState?.currentUser?.userid })
                    .then(async (res: any) => {
                      if (res.status == 'success') {
                        message.success('修改成功！');
                        sessionStorage.removeItem('userInfo');
                        const userInfo = await request.get('/sms/user');
                        sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
                      }
                    });
                }}
              >
                <ProFormText
                  label="用户名称"
                  name="name"
                  width="lg"
                  disabled
                  rules={[
                    {
                      // required: true,
                      pattern: new RegExp(/^\S*$/),
                      message: '不能包含空格/请输入正确的用户名',
                    },
                  ]}
                ></ProFormText>
                <ProFormText
                  label="登陆账号"
                  name="userName"
                  width="lg"
                  rules={[
                    {
                      // required: true,
                      pattern: new RegExp(/^\S*$/),
                      message: '不能包含空格/请输入正确的账号',
                    },
                  ]}
                ></ProFormText>
                <ProFormText
                  label="手机号"
                  name="mobile"
                  width="lg"
                // readonly
                // rules={[
                //   {
                //     required: true,
                //     pattern: new RegExp(Dictionaries.getRegex('mobile')),
                //     message: '请输入正确的手机号',
                //   },
                // ]}
                ></ProFormText>
                <ProFormText label="部门" name="departmentName" width="lg" readonly></ProFormText>

                <ProForm.Group>
                  <ProFormSelect
                    label="性别"
                    name="sex"
                    width="sm"
                    valueEnum={{
                      0: '男',
                      1: '女',
                    }}
                  />
                </ProForm.Group>
                <ProFormText
                  label="身份证"
                  name="idCard"
                  width="lg"
                  disabled
                  rules={[
                    {
                      pattern: new RegExp(Dictionaries.getRegex('idCard')),
                      message: '请输入正确的身份证号',
                    },
                  ]}
                ></ProFormText>
                <ProFormText label="微信号" name="weChat" width="lg"></ProFormText>
              </ProForm>
            </ProCard>
            <ProCard title="员工信息设置">
              <a
                onClick={async () => {
                  const record = (await request.get('/sms/user')).data
                  setRenderData({ ...record, type: 'eidt', numberEidt: 0, typeUser: 'user' })
                  setUserModalVisible(true)
                }}
              >个人信息设置</a>
            </ProCard>
          </ProCard>

        </TabPane>
        <TabPane tab="安全设置" key="2">
          <ProCard title="安全设置">
            <span>为了保障账户信息安全，请定时修改账户密码。</span>
            <ProForm
              formRef={formRefs}
              style={{ marginTop: '30px' }}
              onFinish={async (values) => {
                delete values.Passwords;
                request
                  .post('/sms/user', { ...values, id: initialState?.currentUser?.userid })
                  .then(async (res: any) => {
                    if (res.status == 'success') {
                      message.success('修改成功！');
                      sessionStorage.removeItem('userInfo');
                      const userInfo = await request.get('/sms/user');
                      sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
                      history.push('/user/login');
                    }
                  });
              }}
            >
              <ProFormText.Password
                label="旧密码"
                name="oldPassword"
                width="lg"
                rules={[
                  {
                    required: true,
                  },
                ]}
              ></ProFormText.Password>
              <ProFormText.Password
                label="新密码"
                name="Password"
                width="lg"
                hasFeedback
                placeholder="请输入您的密码..."
                rules={[
                  {
                    required: true,
                    pattern: getRegex?.password.value,
                    message: '密码长度为8-16位字母加数字组合',
                  },
                ]}
              ></ProFormText.Password>
              <ProFormText.Password
                label="确认新密码"
                placeholder="请再次输入您的密码..."
                dependencies={['Password']}
                hasFeedback
                name="Passwords"
                width="lg"
                rules={[
                  {
                    required: true,
                    message: '请再次输入您的密码...',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('Password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次密码输入不一致'));
                    },
                  }),
                ]}
              ></ProFormText.Password>
            </ProForm>
          </ProCard>
        </TabPane>
        <TabPane tab="消息通知" key="3">
          <ProCard title="消息通知">
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
            <Divider></Divider>
            {bizNotices?.map((item: any, index: number) => {
              return (
                <div className="notice" key={index}>
                  <div className="notice-Title">{item.title}</div>
                  <div className="notice-content">{item.content}</div>
                  {item?.files
                    ? item.files.split(',').map((items: any, indexs: number) => {
                      return (
                        <div key={indexs} className="notice-files">
                          附件内容：{' '}
                          <a
                            onClick={() => {
                              look(item.id, items);
                            }}
                          >
                            {items}
                          </a>
                        </div>
                      );
                    })
                    : ''}

                  <div className="notice-createBy">
                    {item.userName} 与 {item.createTime} 发布
                  </div>
                  <Divider></Divider>
                </div>
              );
            })}
            <Pagination
              defaultCurrent={1}
              total={bizNotice?.data.totalPages * 10}
              style={{ textAlign: 'right', marginRight: '50px' }}
              onChange={(page, pageSize) => {
                request
                  .get('/sms/business/bizNotice', { _page: page - 1, _size: pageSize })
                  .then((res: any) => {
                    if (res.status == 'success') {
                      setbizNotice(res.data.content);
                    }
                  });
              }}
            />
          </ProCard>
        </TabPane>
      </Tabs>
      {previewVisible && (
        <ChargeIframe
          previewImage={imgSrc}
          previewVisible={previewVisible}
          setPreviewVisible={() => {
            setPreviewVisible(false);
          }}
        />
      )}
      {UserModalVisible && (
        <UserModal
          setModalVisible={() => setUserModalVisible(false)}
          modalVisible={UserModalVisible}
          callbackRef={() => callbackRef()}
          renderData={renderData}
        />
      )}
    </ProCard>
  );
};
