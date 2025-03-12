import {
  ModalForm,
  ProFormInstance,
  ProFormText,
  ProFormTextArea,
  ProFormUploadDragger,
} from '@ant-design/pro-form';
import request from '@/services/ant-design-pro/apiRequest';
import { message } from 'antd';
import sokect from '../../../services/util/websocket';
import { useRef, useState } from 'react';
import UpDownload from '@/services/util/UpDownload';
export default (props: any) => {
  const { modalVisibleFalg, callbackRef, setModalVisible, modalContent } = props;
  const formRef = useRef<ProFormInstance>();
  if (modalContent.type == 'edit') {
    setTimeout(() => {
      formRef?.current?.setFieldsValue({ ...modalContent });
    }, 100);
  }

  function getBase64(file: any) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
  let tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
  let tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
  let obj = {};
  obj[tokenName] = tokenValue;
  return (
    <ModalForm
      visible={modalVisibleFalg}
      width={600}
      formRef={formRef}
      onFinish={async (values) => {
        if (values.filess) {
          let arr: any[] = [];
          values.filess.forEach((item: any) => {
            arr.push(item.response.data);
          });
          delete values.filess;
          values.files = arr.join(',');
        }
        return new Promise((resolve) => {
          request
            .post('/sms/business/bizNotice', values)
            .then((res: any) => {
              if (res.status == 'success') {
                message.success('操作成功');
                // setModalVisible();
                // const socketType = modalContent.type == 'edit' ? 'noticeUpdate' : 'noticeCreate';
                // sokect.send(
                //   {
                //     name: '全体',
                //     id: '-1',
                //   },
                //   '通知',
                //   socketType,
                // );
                callbackRef();
                setModalVisible(false);

                resolve(true);
              }
            })
            .catch((err: any) => {
              resolve(true);
            });
        });
      }}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {
          setModalVisible(false);
        },
      }}
    >
      <ProFormText width="xl" label="通知标题" name="title" />
      <ProFormTextArea width="xl" label="通知内容" name="content" />
      <ProFormTextArea width="xl" label="备注" name="remark" />
      <ProFormUploadDragger
        width="xl"
        label="上传附件"
        name="filess"
        action="/sms/business/bizNotice/upload"
        fieldProps={{
          multiple: true,
          // method: 'POST',
          headers: {
            ...obj,
          },
          listType: 'picture',
          //   defaultFileList: modalContent.defaults,
          onRemove: (e) => {},
          beforeUpload: (file) => {
            console.log('file', file);
          },
          onPreview: async (file: any) => {
            console.log('file', file);

            if (!file.url && !file.preview) {
              console.log('1');

              //   file.preview = await getBase64(file.originFileObj);
            }
            // setPreviewImage(file.url || file.preview);
            // setPreviewVisible(true);
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
    </ModalForm>
  );
};
