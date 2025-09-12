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
export default (props: any) => {
  const { setModalVisible, modalVisible, callbackRef, renderData } = props;
  const [isModalVisibles, setisModalVisibles] = useState<boolean>(false);
  const [imgSrc, setImgSrc] = useState();
  const formRef = useRef<ProFormInstance>();
  useEffect(() => {
    if (
      (renderData?.type == 'eidt' || renderData?.type == 'eidtTitle') &&
      renderData?.renderDataNumber === 0
    ) {
      setTimeout(() => {
        formRef?.current?.setFieldsValue({
          name: renderData.name,
          parameter: renderData.parameter,
          description: renderData.description,
          file: [
            {
              uid: '1',
              name: renderData.file,
              response: { data: renderData.file },
            },
          ],
          newFile: renderData.newFile
            ? [
                {
                  uid: '1',
                  name: renderData.newFile,
                  response: { data: renderData.newFile },
                },
              ]
            : [],
        });
      }, 100);

      ++renderData.renderDataNumber;
    }
  }, []);

  const tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
  const tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
  const obj = {};
  obj[tokenName] = tokenValue;
  const submitok = (values: any) => {
    return new Promise((resolve) => {
      request
        .post('/sms/contract/conTemplate', values)
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
        if (renderData?.type == 'eidt' || renderData?.type == 'eidtTitle') {
          values.id = renderData.id;
        }
        if (values.file) {
          values.file = values.file[values.file.length - 1].response.data;
        }
        if (values.newFile) {
          values.newFile = values.newFile[values.newFile.length - 1].response.data;
        }
        if (renderData?.type == 'eidtTitle') {
          delete values.file;
        }
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
      <ProFormText
        label="合同模板名称"
        name="name"
        rules={[
          {
            required: true,
            message: '请填写合同模板名称',
          },
        ]}
       />
      {/* <ProFormTextArea label="模板字段" name="parameter"></ProFormTextArea> */}
      <ProFormTextArea label="注释" name="description" />
      <ProForm.Group>
        <ProFormUploadDragger
          width={630}
          // hidden={renderData?.type == 'eidtTitle'}
          label="上传下载合同"
          name="newFile"
          action="/sms/contract/conTemplate/upload"
          // required
          fieldProps={{
            multiple: false,
            // method: 'POST',
            headers: {
              ...obj,
            },
            listType: 'picture',
            defaultFileList: [],
            // onDrop: (e) => {},
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
      <ProForm.Group>
        <ProFormUploadDragger
          width={630}
          hidden={renderData?.type == 'eidtTitle'}
          label="上传合同模板"
          name="file"
          action="/sms/contract/conTemplate/upload"
          // required
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
              if (file.type != 'application/pdf') {
                message.error(`只能上传PDF格式`);
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
    </ModalForm>
  );
};
