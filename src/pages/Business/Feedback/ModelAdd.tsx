import type {
  ProFormInstance} from '@ant-design/pro-form';
import ProForm, {
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormUploadDragger,
} from '@ant-design/pro-form';
import { message, Upload, Image } from 'antd';
import request from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import { useEffect, useRef, useState } from 'react';
import UploadDragger from '@/components/UploadDragger/UploadDragger';
import { useModel } from 'umi';
export default (props: any) => {
  const { setModalVisible, modalVisible, callbackRef, renderData } = props;
  const formRef = useRef<ProFormInstance>();
  const { initialState, setInitialState } = useModel('@@initialState');
  const userInfo = initialState?.currentUser
  useEffect(() => {
    if (renderData?.type == 'eidt') {
      if (renderData.file) {
        const arr: { uid: number; name: any; response: { data: any } }[] = [];
        renderData.file.split(',').forEach((item: any, index: number) => {
          arr.push({
            uid: index + 1,
            name: item,
            response: { data: item },
          });
        });
        renderData.file = arr;
      }
      setTimeout(() => {
        formRef?.current?.setFieldsValue(renderData);
      }, 100);
    }
    if (renderData?.type == 'add') {

      formRef?.current?.setFieldsValue({
        createBy: userInfo?.name

      })
    }
  }, []);

  const submitok = (value: any) => {
    if (value.file) {
      const arr: any[] = [];
      value.file.forEach((item: any) => {
        arr.push(item.response.data);
      });
      value.file = arr.join(',');
    }
    if (renderData.type == 'add') {
      value.createBy = userInfo?.userid
    }
    if (renderData.type == 'eidt') {
      value.id = renderData.id
    }
    return new Promise((resolve) => {
      request
        .post('/sms/business/bizFeedback', value)
        .then((res: any) => {
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
      width={700}
      formRef={formRef}
      onFinish={async (values) => {
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
      {/* <ProFormText label='创建人' name='createBy' readonly /> */}
      <ProFormText label='功能模块' name='function' />
      <ProFormTextArea
        label="具体内容"
        name="content"
        rules={[
          {
            required: true,
            message: '请填写具体内容',
          },
        ]}
       />
      <UploadDragger
        width={630}
        label="反馈意见附件"
        name="file"
        action={'/sms/business/bizFeedback/upload'}
        renderData={renderData}
        fileUrl={'/sms/business/bizFeedback/download'}
      />
    </ModalForm>
  );
};
