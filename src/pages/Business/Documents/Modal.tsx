import type { ProFormInstance} from '@ant-design/pro-form';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import UploadDragger from '@/components/UploadDragger/UploadDragger';
import { useEffect, useRef } from 'react';
import request from '@/services/ant-design-pro/apiRequest';
import { message } from 'antd';

export default (props: any) => {
  const { renderData, ModalsVisible, setModalsVisible, callbackRef } = props;
  const formRef = useRef<ProFormInstance>();
  useEffect(() => {
    if (renderData.eidtType == 'eidt') {
      const arr: { uid: number; name: any; response: { data: any } }[] = [];
      if (renderData.files) {
        renderData.files.split(',').forEach((item: any, index: number) => {
          arr.push({
            uid: index + 1,
            name: item,
            response: { data: item },
          });
        });
        renderData.files = arr;
      }
      formRef.current?.setFieldsValue(renderData);
    }
  }, []);
  const submits = (value: any) => {
    if (value.files) {
      const arr: any[] = [];
      value.files.forEach((item: any) => {
        arr.push(item.response.data);
      });
      value.files = arr.join(',');
    }
    if (renderData.eidtType == 'eidt') {
      value.id = renderData.id;
    }
    value.type = 0;
    return new Promise(async (resolve) => {
      request
        .post('/sms/business/bizFile', value)
        .then((res: any) => {
          if (res.status == 'success') {
            message.success('操作成功');
            setModalsVisible();
            callbackRef();
            resolve(res);
          }
        })
        .catch((err: any) => {
          resolve(true);
        });
    });
  };
  return (
    <ModalForm
      title="文件上传"
      visible={ModalsVisible}
      formRef={formRef}
      width={1200}
      modalProps={{
        onCancel: () => setModalsVisible(false),
      }}
      onFinish={async (value) => {
        await submits(value);
      }}
    >
      <ProFormText label="文件名称" name="name" rules={[{ required: true }]} />
      <ProFormTextArea label="备注说明" name="description" />
      <UploadDragger
        width={1100}
        label="上传附件"
        name="files"
        action="/sms/business/bizFile/upload"
        fileUrl="/sms/business/bizFile/download"
        rules={[
          {
            required: true,
          },
        ]}
      />
    </ModalForm>
  );
};
