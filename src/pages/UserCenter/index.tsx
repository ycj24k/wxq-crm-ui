import { Tabs,
  //  Radio,
    Image, message, Divider, Pagination, Button, Space, Tag, Badge } from 'antd';
import { useEffect, useRef, useState } from 'react';
import request from '@/services/ant-design-pro/apiRequest';
import ProCard from '@ant-design/pro-card';
import type { ProFormInstance} from '@ant-design/pro-form';
import ProForm, { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { useModel, history } from 'umi';
import Dictionaries from '@/services/util/dictionaries';
import './index.less';
import moment from 'moment';
// import ImgUrl from '@/services/util/UpDownload';
import ChargeIframe from '@/pages/Admins/AdminCharge/ChargeIframe';
import UserModal from "@/pages/Admins/UserManage/userModal"
import { EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

export default () => {
  const formRef = useRef<ProFormInstance>();
  const formRefs = useRef<ProFormInstance>();
  // const bizNotice = JSON.parse(sessionStorage.getItem('bizNotice') as string);
  const { initialState } = useModel('@@initialState');
  const [getRegex, setGetRegex] = useState<any>();
  const [imgSrc, setImgSrc] = useState();
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [isModalVisibles, setisModalVisibles] = useState<boolean>(false);
  // const [bizNotices, setbizNotice] = useState(bizNotice?.data?.content);
  const [renderData, setRenderData] = useState<any>({});
  const [UserModalVisible, setUserModalVisible] = useState<boolean>(false)
  const [noticeData, setNoticeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const { query = { key: '1' } } = history.location;
  
  const callbackRef = () => {
    // 回调函数
  }

  // 获取消息通知列表
  const fetchNoticeList = async (params:any = {}) => {
    setLoading(true);
    try {
      const response = await request.get('/sms/business/bizNotice', {
        _page: params.current || pagination.current - 1,
        _size: params.pageSize || pagination.pageSize,
        ...params
      });
      
      if (response.status === 'success') {
        setNoticeData(response.data.content);
        setPagination({
          ...pagination,
          total: response.data.totalElements,
          current: params.current || pagination.current,
          pageSize: params.pageSize || pagination.pageSize
        });
      } else {
        message.error('获取通知列表失败');
      }
    } catch (error) {
      message.error('获取通知列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 全部已读处理函数
  const handleConfirmAll = async () => {
    setConfirmLoading(true);
    try {
      const response = await request.post('/sms/business/bizNotice/confirmAll');
      
      if (response.status === 'success') {
        message.success('全部标记为已读成功');
        // 更新本地数据状态
        const updatedData:any = noticeData.map((item :any) => ({
          ...item,
          isConfirm: true
        }));
        setNoticeData(updatedData);
      } else {
        message.error('操作失败');
      }
    } catch (error) {
      message.error('操作失败');
    } finally {
      setConfirmLoading(false);
    }
  };

  // 单条消息标记为已读
  const handleConfirmOne = async (id:any) => {
    try {
      const response = await request.post(`/sms/business/bizNotice/confirm/${id}`);
      
      if (response.status === 'success') {
        // 更新单条消息状态
        const updatedData:any = noticeData.map((item:any) => 
          item.id === id ? { ...item, isConfirm: true } : item
        );
        setNoticeData(updatedData);
      }
    } catch (error) {
      console.error('标记已读失败', error);
    }
  };

  useEffect(() => {
    request.get('/sms/public/getRegex').then((res) => {
      setGetRegex(res.data);
    });

    formRef?.current?.setFieldsValue({
      ...initialState?.currentUser,
      sex: initialState?.currentUser?.sex ? '1' : '0',
    });
    
    // 初始化获取通知列表
    fetchNoticeList();
  }, []);

  // const look = async (id: number, item: string) => {
  //   const type = item.slice(item.indexOf('.'));
  //   await ImgUrl('/sms/business/bizNotice/download', id, item).then((res: any) => {
  //     setImgSrc(res);
  //     if (type == '.png' || type == '.jpg' || type == '.jpeg') {
  //       setisModalVisibles(true);
  //     } else {
  //       setPreviewVisible(true);
  //     }
  //   });
  // };

  // 查看详情处理函数
  const handleViewDetail = (record: any) => {
    setRenderData(record);
    setUserModalVisible(true);
    // 如果消息未读，查看时标记为已读
    if (!record.isConfirm) {
      handleConfirmOne(record.id);
    }
  };

  // 格式化日期
  const formatDate = (dateString  :any) => {
    return moment(dateString).format('YYYY-MM-DD HH:mm:ss');
  };

  // 渲染通知列表
  const renderNoticeList = () => {
    // 计算未读消息数量
    const unreadCount = noticeData.filter((item:any) => !item.isConfirm).length;
    
    return (
      <div className="notice-list">
        <div className="notice-list-header">
          <Space>
            <h3>消息通知</h3>
            {unreadCount > 0 && (
              <Badge count={unreadCount} showZero={false} />
            )}
          </Space>
          <Button 
            type="primary" 
            icon={<CheckCircleOutlined />}
            loading={confirmLoading}
            onClick={handleConfirmAll}
          >
            全部已读
          </Button>
        </div>
        
        {noticeData.map((item:any) => (
          <div key={item.id} className={`notice-item ${item.isConfirm ? 'read' : 'unread'}`}>
            <div className="notice-header">
              <Space>
                {!item.isConfirm && (
                  <Badge dot color="red" />
                )}
                <h3 className="notice-title">{item.title}</h3>
              </Space>
              <Tag color="blue">{formatDate(item.createTime)}</Tag>
            </div>
            <div className="notice-content">
              <p>{item.content}</p>
            </div>
            <div className="notice-footer">
              <Space>
                <span>发布人: {item.userName}</span>
                <Button 
                  type="link" 
                  icon={<EyeOutlined />} 
                  onClick={() => handleViewDetail(item)}
                >
                  查看详情
                </Button>
              </Space>
            </div>
            <Divider />
          </div>
        ))}
        
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onChange={(page, pageSize) => {
            setPagination({
              ...pagination,
              current: page,
              pageSize: pageSize
            });
            fetchNoticeList({ current: page, pageSize });
          }}
          style={{ textAlign: 'right', marginTop: 16 }}
          showSizeChanger
          showQuickJumper
          showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`}
        />
      </div>
    );
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
                 />
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
                 />
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
                 />
                <ProFormText label="部门" name="departmentName" width="lg" readonly />

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
                 />
                <ProFormText label="微信号" name="weChat" width="lg" />
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
            </ProForm>
          </ProCard>
        </TabPane>
        <TabPane tab="消息通知" key="3">
          <ProCard loading={loading}>
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
            
            {renderNoticeList()}
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