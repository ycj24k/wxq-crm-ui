import { LockOutlined, MobileOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, message, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
  LoginForm,
  ModalForm,
} from '@ant-design/pro-form';
import { useIntl, history, FormattedMessage, SelectLang, useModel } from 'umi';
import Footer from '@/components/Footer';
import { request as requests } from 'umi';
import request from '@/services/ant-design-pro/apiRequest';
import { getFakeCaptcha } from '@/services/ant-design-pro/login';
import Socket from '@/services/util/websocket';
import styles from './index.less';
import Dictionaries from '@/services/util/dictionaries';
import user from 'mock/user';
const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const [type, setType] = useState<string>('account');
  const { initialState, setInitialState } = useModel('@@initialState');
  const [modalVisible, setmodalVisible] = useState(false);
  const [getRegex, setGetRegex] = useState<any>();
  const [userInfo, setUserInfo] = useState<any>();
  const intl = useIntl();
  useEffect(() => {
    request.get('/sms/public/getRegex').then((res: any) => {
      setGetRegex(res.data);
    });
  }, []);
  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    console.log('userInfo', userInfo);

    if (userInfo) {
      await setInitialState((s) => ({
        ...s,
        currentUser: userInfo,
      }));
    }
    return userInfo;
  };

  const handleSubmit = async (values: API.LoginParams) => {
    if (type === 'account') {
      try {
        // 登录
        const user: any = await request.get('/sms/public/login', {
          userName: values.username,
          password: values.password,
        });
        setUserInfo(user);
        // const user = await login({ ...values, type });
        localStorage.removeItem('tokenName');
        localStorage.removeItem('tokenValue');

        if (user.status == 'success' || user.status == 'ok') {
          // if (values.password == 'huide123') {
          //   setmodalVisible(true);
          //   return;
          // }
          sessionStorage.setItem('tokenName', user.data.tokenName);
          sessionStorage.setItem('tokenValue', user.data.tokenValue);
          // await Socket.open();

          const defaultLoginSuccessMessage = intl.formatMessage({
            id: 'pages.login.success',
            defaultMessage: '登录成功！',
          });
          message.success(defaultLoginSuccessMessage);
          // await fetchUserInfo();
          const userInfo = await initialState?.fetchUserInfo?.();
          if (!userInfo.isReset) {
            setmodalVisible(true);
            return;
          }
          if (userInfo) {
            await setInitialState((s) => ({
              ...s,
              currentUser: userInfo,
            }));
          }

          /** 此方法会跳转到 redirect 参数所在的位置 */
          if (!history) return;
          const { query } = history.location;
          const { redirect } = query as { redirect: string };
          history.push(redirect || '/');
          setTimeout(() => {
            location.reload();
          }, 100);
          return;
        }
        // 如果失败去设置用户错误信息
        setUserLoginState(user);
      } catch (error) {
        // const defaultLoginFailureMessage = intl.formatMessage({
        //   id: 'pages.login.failure',
        //   defaultMessage: '登录失败，请重试！',
        // });
        // message.error(defaultLoginFailureMessage);
      }
    } else {
      try {
        // 登录
        const user: any = await request.post('/sms/public/login', {
          userName: values.username,
          password: values.password,
          mobile: values.mobile,
        });
        // const user = await login({ ...values, type });
        localStorage.removeItem('tokenName');
        localStorage.removeItem('tokenValue');
        if (user.status == 'success' || user.status == 'ok') {
          sessionStorage.setItem('tokenName', user.data.tokenName);
          sessionStorage.setItem('tokenValue', user.data.tokenValue);
          sessionStorage;
          const defaultLoginSuccessMessage = intl.formatMessage({
            id: 'pages.login.success',
            defaultMessage: '注册成功！',
          });
          message.success(defaultLoginSuccessMessage);
          await fetchUserInfo();

          /** 此方法会跳转到 redirect 参数所在的位置 */
          if (!history) return;
          const { query } = history.location;
          const { redirect } = query as { redirect: string };
          history.push(redirect || '/');
          setTimeout(() => {
            location.reload();
          }, 100);
          return;
        }
        // 如果失败去设置用户错误信息
        setUserLoginState(user);
      } catch (error) {
        const defaultLoginFailureMessage = intl.formatMessage({
          id: 'pages.login.failure',
          defaultMessage: '登录失败，请重试！',
        });
        message.error(defaultLoginFailureMessage);
      }
      // console.log('v', values);
      // const register = await request.post('/sms/public/login', {
      //   userName: values.username,
      //   password: values.password,
      //   mobile: values.mobile,
      // });
    }
  };
  const { status, type: loginType } = userLoginState;

  return (
    <div className={styles.container}>
      {/* <div className={styles.lang} data-lang>
        {SelectLang && <SelectLang />}
      </div> */}
      <div className={styles.content}>
        <LoginForm
          logo={<img alt="logo" src="./biglogo.png" />}
          title="文星棋管理系统"
          subTitle="用心服务学员"
          initialValues={{
            autoLogin: true,
          }}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          <Tabs activeKey={type} onChange={setType}>
            <Tabs.TabPane
              key="account"
              tab={intl.formatMessage({
                id: 'pages.login.accountLogin.tab',
                defaultMessage: '账户密码登录',
              })}
            />
            <Tabs.TabPane key="mobile" tab="新用户注册" />
          </Tabs>

          {status === 'error' && loginType === 'account' && (
            <LoginMessage
              content={intl.formatMessage({
                id: 'pages.login.accountLogin.errorMessage',
                defaultMessage: '账户或密码错误(admin/ant.design)',
              })}
            />
          )}
          {type === 'account' && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={styles.prefixIcon} />,
                }}
                placeholder="请输入您的账号..."
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.username.required"
                        defaultMessage="请输入用户名!"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                placeholder="请输入您的密码..."
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="请输入密码！"
                      />
                    ),
                  },
                ]}
              />
            </>
          )}

          {/* {status === 'error' && loginType === 'mobile' && <LoginMessage content="验证码错误" />} */}
          {type === 'mobile' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined className={styles.prefixIcon} />,
                }}
                name="mobile"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.required"
                        defaultMessage="请输入手机号！"
                      />
                    ),
                  },
                  {
                    pattern: getRegex.mobile.value,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.invalid"
                        defaultMessage="手机号格式错误！"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={styles.prefixIcon} />,
                }}
                placeholder="请输入您的账号..."
                rules={[
                  {
                    pattern: getRegex.userName.value,
                    message: '2-32位首尾不能为空',
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                placeholder="请输入您的密码..."
                rules={[
                  {
                    pattern: getRegex.password.value,
                    message: '密码长度为8-16位字母加数字组合',
                  },
                ]}
              />
              <ProFormText.Password
                name="password1"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                placeholder="请再次输入您的密码..."
                dependencies={['password']}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: '请再次输入您的密码...',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次密码输入不一致'));
                    },
                  }),
                ]}
              />
            </>
          )}
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              <FormattedMessage id="pages.login.rememberMe" defaultMessage="自动登录" />
            </ProFormCheckbox>
          </div>
        </LoginForm>
        <ModalForm
          title="修改密码"
          autoFocusFirstInput
          // width={500}
          // @ts-ignore
          layout="LAYOUT_TYPE_HORIZONTAL"
          onFinish={async (values) => {
            delete values.Passwords;
            const headers: any = {};
            headers[userInfo.data.tokenName] = [userInfo.data.tokenValue];
            console.log('userInfo', userInfo);

            // await Socket.open(userInfo.data.tokenValue);
            requests('/sms/user', { headers }).then((user) => {
              requests(
                '/sms/user?id=' +
                user.data.id +
                '&Password=' +
                values.Password +
                '&oldPassword=' +
                values.oldPassword,
                {
                  method: 'POST',
                  headers: headers,
                },
              ).then(async (res: any) => {
                if (res.status == 'success') {
                  message.success('修改成功！', 5);
                  setmodalVisible(false);
                  if (!history) return;
                  const { query } = history.location;
                  const { redirect } = query as { redirect: string };
                  history.push(redirect || '/');
                  setTimeout(() => {
                    location.reload();
                  }, 100);
                  // sessionStorage.removeItem('userInfo');
                  // const userInfo = await request.get('/sms/user');
                  // sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
                  // history.push('/user/login');
                } else {
                  message.error(res.msg)
                }
              });
            });
          }}
          visible={modalVisible}
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
           />
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
           />
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
           />
        </ModalForm>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Login;