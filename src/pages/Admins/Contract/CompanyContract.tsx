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
import { useRef, useState } from 'react';
export default (props: any) => {
  const { setModalVisible, modalVisible, callbackRef, renderData } = props;
  const [isModalVisibles, setisModalVisibles] = useState<boolean>(false);
  const [imgSrc, setImgSrc] = useState();
  const formRef = useRef<ProFormInstance>();
  if (renderData?.type == 'eidt' && renderData?.renderDataNumber === 0) {
    setTimeout(() => {
      formRef?.current?.setFieldsValue({
        name: renderData.name,
        code: renderData.code,
        description: renderData.description,
        codeFile: [
          {
            uid: '1',
            name: renderData.codeFile,
            response: { data: renderData.codeFile },
          },
        ],
        powerAttorneyFile: [
          {
            uid: '1',
            name: renderData.powerAttorneyFile,
            response: { data: renderData.powerAttorneyFile },
          },
        ],
      });
    }, 100);

    ++renderData.renderDataNumber;
  }
  const tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
  const tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
  const obj = {};
  obj[tokenName] = tokenValue;
  const submitok = (values: any) => {
    return new Promise((resolve) => {
      request
        .post('/sms/business/bizStudent', values)
        .then((res: any) => {
          console.log('res', res);

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
      width={905}
      formRef={formRef}
      onFinish={async (values) => {
        values.id = renderData.studentId;
        if (values.codeFile) values.codeFile = values.codeFile.at(-1).response.data;
        if (values.powerAttorneyFile)
          values.powerAttorneyFile = values.powerAttorneyFile.at(-1).response.data;
        console.log('values', values);

        await submitok(values);
      }}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {
          callbackRef();
          setModalVisible();
        },
        maskClosable: false,
      }}
      visible={modalVisible}
    >
      {/* <a download="委托授权及数字证书申请表" href="/template/委托授权及数字证书申请表.docx">
        下载委托授权及数字证书申请表
      </a> */}
      <ProForm.Group>
        {/* <ProFormUploadDragger
          width={400}
          label="授权委托书电子版"
          name="powerAttorneyFile"
          action="/sms/business/bizStudent/upload"
          required
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
              console.log('file', file);
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
        /> */}
        <ProFormUploadDragger
          width={400}
          label="统一社会信用码电子版"
          name="codeFile"
          required
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
              console.log('file', file);
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
    </ModalForm>
  );
};
