import type {
  ProFormInstance} from '@ant-design/pro-form';
import ProForm, {
  ModalForm,
  ProFormDigit,
  ProFormSelect,
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
  console.log('renderData', renderData);

  const [isModalVisibles, setisModalVisibles] = useState<boolean>(false);
  const [imgSrc, setImgSrc] = useState();
  const formRef = useRef<ProFormInstance>();
  if (renderData?.type == 'eidt' && renderData?.renderDataNumber === 0) {
    setTimeout(() => {
      formRef?.current?.setFieldsValue({
        name: renderData.name,
        code: renderData.code,
        description: renderData.description,
        account: renderData.account,
        mobile: renderData.mobile,
        accountName: renderData.accountName,
        bank: renderData.bank,
        chargeMethod: renderData.chargeMethod?.split(','),
        codeFile: [
          {
            uid: '1',
            name: renderData.codeFile,
            response: { data: renderData.codeFile },
          },
        ],
        // powerAttorneyFile: [
        //   {
        //     uid: '1',
        //     name: renderData.powerAttorneyFile,
        //     response: { data: renderData.powerAttorneyFile },
        //   },
        // ],
        sealFile: [
          {
            uid: '1',
            name: renderData.sealFile,
            response: { data: renderData.sealFile },
          },
        ],
        cusid: renderData.cusid,
        appid: renderData.appid,
        privateKey: renderData.privateKey,
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
        .post('/sms/contract/conCompany', values)
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
        if (renderData?.type == 'eidt') {
          values.id = renderData.id;
        }
        if (values.codeFile)
          values.codeFile = values.codeFile[values.codeFile.length - 1].response.data;
        // if (values.powerAttorneyFile)
        //   values.powerAttorneyFile = values.powerAttorneyFile.at(-1).response.data;
        if (values.sealFile)
          values.sealFile = values.sealFile[values.sealFile.length - 1].response.data;
        values.chargeMethod = values.chargeMethod.join(',');
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
        label="公司名称"
        name="name"
        rules={[
          {
            required: true,
            message: '请填写公司名称',
          },
        ]}
       />
      <ProFormText
        label="统一社会信用代码"
        name="code"
        rules={[
          {
            required: true,
            pattern: new RegExp(Dictionaries.getRegex('code')),
            message: '请输入正确的社会信用代码',
          },
        ]}
       />
      <ProFormDigit
        name="mobile"
        label="法人手机号"
        rules={[
          {
            required: true,
            message: '请填写法人手机号',
          },
        ]}
      />
      <ProFormSelect
        label="收费方式"
        name="chargeMethod"
        width="sm"
        mode="multiple"
        request={async () => Dictionaries.getList('dict_stu_refund_type') as any}
        rules={[
          {
            required: true,
            message: '请选择付款方式',
          },
        ]}
      />
      <ProFormText
        label="开户名"
        name="accountName"
        rules={[
          {
            required: true,
          },
        ]}
       />
      <ProFormText
        label="开户行"
        name="bank"
        rules={[
          {
            required: true,
          },
        ]}
       />
      <ProFormText
        label="银行账号"
        name="account"
        rules={[
          {
            required: true,
          },
        ]}
       />
      <ProFormText label="银行行号" name="bankNum" />
      <ProFormDigit name="mobile2" label="税票手机号" />
      <ProFormTextArea label="税票地址" name="address" />
      <ProFormTextArea label="注释" name="description" />
      <ProForm.Group>
        <ProFormUploadDragger
          width={400}
          label="统一社会信用码电子版"
          name="codeFile"
          required
          action="/sms/contract/conCompany/upload"
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
        {/* <ProFormUploadDragger
          width={400}
          label="授权委托书电子版"
          name="powerAttorneyFile"
          action="/sms/contract/conCompany/upload"
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
          label="财务印章"
          name="sealFile"
          action="/sms/contract/conCompany/upload"
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
      {/* <ProForm.Group>
        <ProFormText label="民生商户号ID" name="cusid"></ProFormText>
        <ProFormText label="民生AppID" name="appid"></ProFormText>
      </ProForm.Group>
      <ProFormTextArea label="民生私钥" name="privateKey"></ProFormTextArea> */}
    </ModalForm>
  );
};
