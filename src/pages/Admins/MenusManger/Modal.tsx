import { useRef } from 'react';
import { message, Space } from 'antd';
import ProForm, {
  ModalForm,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProFormSelect
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import request from '@/services/ant-design-pro/apiRequest';
import {
  SmileOutlined,
  HeartOutlined,
  CrownOutlined,
  TableOutlined,
  UserOutlined,
  FolderOpenOutlined,
  TeamOutlined,
  ClusterOutlined,
  ReadOutlined,
  SolutionOutlined,
  BellOutlined,
  MessageOutlined,
  AccountBookOutlined,
  DashboardOutlined,
  AreaChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';
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
        .post('/sms/system/sysMenu', values)
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
      title={renderData.type == 'add' ? '新建菜单' : '修改菜单信息'}
      autoFocusFirstInput
      {...styleLayout}
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
        label="菜单名称"
        rules={[
          { required: true, message: '请正确填写，不能包含空格', pattern: new RegExp(/^\S*$/) },
        ]}
      />
      <ProFormText
        width="xl"
        name="code"
        label="菜单代码"
        rules={[
          { required: true, message: '请正确填写，不能包含空格', pattern: new RegExp(/^\S*$/) },
        ]}
      />
      <ProFormText
        width="xl"
        name="path"
        label="菜单路径"
        rules={[
          { required: true, message: '请正确填写，不能包含空格', pattern: new RegExp(/^\S*$/) },
        ]}
      />
      <ProFormSelect
        name="icon"
        label="菜单图标"
        width="xl"
        placeholder="请选择图标"
        request={async () => [
          { label: '设置', value: 'SettingOutlined', icon: <SettingOutlined /> },
          { label: '图表', value: 'AreaChartOutlined', icon: <AreaChartOutlined /> },
          { label: '仪表盘', value: 'DashboardOutlined', icon: <DashboardOutlined /> },
          { label: '笑脸', value: 'SmileOutlined', icon: <SmileOutlined /> },
          { label: '心形', value: 'HeartOutlined', icon: <HeartOutlined /> },
          { label: '皇冠', value: 'CrownOutlined', icon: <CrownOutlined /> },
          { label: '表格', value: 'TableOutlined', icon: <TableOutlined /> },
          { label: '用户', value: 'UserOutlined', icon: <UserOutlined /> },
          { label: '文件夹', value: 'FolderOpenOutlined', icon: <FolderOpenOutlined /> },
          { label: '团队', value: 'TeamOutlined', icon: <TeamOutlined /> },
          { label: '集群', value: 'ClusterOutlined', icon: <ClusterOutlined /> },
          { label: '阅读', value: 'ReadOutlined', icon: <ReadOutlined /> },
          { label: '解决方案', value: 'SolutionOutlined', icon: <SolutionOutlined /> },
          { label: '通知', value: 'BellOutlined', icon: <BellOutlined /> },
          { label: '消息', value: 'MessageOutlined', icon: <MessageOutlined /> },
          { label: '账本', value: 'AccountBookOutlined', icon: <AccountBookOutlined /> },
        ]}
        fieldProps={{
          optionItemRender: (item) => (
            <Space>
              {item.icon} {item.label}
            </Space>
          ),
        }}
      />
      <ProFormText width="lg" name="parentId" label="父类" disabled />
      <ProFormTextArea width="md" name="description" label="描述" />
    </ModalForm>
  );
};