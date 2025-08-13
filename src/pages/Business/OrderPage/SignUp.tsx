import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Image, message, Modal, Upload } from 'antd';
import ProForm, {
  ModalForm,
  ProFormSelect,
  ProFormText,
  ProFormUploadDragger,
} from '@ant-design/pro-form';
import Dictionaries from '@/services/util/dictionaries';
import type { ProFormInstance } from '@ant-design/pro-form';
import request from '@/services/ant-design-pro/apiRequest';
import ImgUrl from '@/services/util/ImgUrl';
import SubmitData from './submitData';
import { values } from 'lodash';
export default (props: any) => {
  const { modalVisible, setModalVisible, callbackRef, renderData, url, studentid } = props;
  console.log(studentid, 'studentid')
  const [HtmlProForm, setHtmlProForm] = useState<any>(false);
  const [isModalVisibles, setisModalVisibles] = useState<boolean>(false);
  const [submitDataModal, setsubmitDataModal] = useState<boolean>(false);
  const [submitFieldId, setsubmitFieldId] = useState<boolean | number>(false);
  const [subimtDatas, setSubimtDatas] = useState<any>({});
  const [qrcodeVisible, setQrcodeVisible] = useState(false)
  const [qrcodeSrc, setQrcodeSrc] = useState<any>()
  const [datas, setDatas] = useState<any>({});
  const [imgSrc, setImgSrc] = useState();
  const formRef = useRef<ProFormInstance>();
  let tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
  let tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
  let obj = {};
  obj[tokenName] = tokenValue;
  useMemo(() => {
    console.log('subimtDatas', subimtDatas);
    formRef?.current?.setFieldValue(submitFieldId, subimtDatas)
  }, [subimtDatas])
  useEffect(() => {
    let hl = [];
    hl = renderData.signup.map((item: any) => {
      return fromList(item);
    });

    setHtmlProForm(hl);
    setTimeout(() => {
      let obj = {};
      let studentName = '';
      renderData.signup.forEach(async (item: any) => {
        if (item.name == '学员姓名') {
          // studentName = item.fieldId;
          obj[item.fieldId] = renderData.studentName;
        }
        if (!item.value) return;
        if (item.value.indexOf('.') > 0) {
          obj[item.fieldId] = [
            {
              uid: item.orderFieldId,
              name: item.name,
              //   url: await Img(item.orderFieldId, item.value),
              response: { data: item.value },
            },
          ];
        } else {
          obj[item.fieldId] = item.value;
        }
      });

      formRef?.current?.setFieldsValue({
        ...obj,
        // studentName: renderData.studentName,
      });
    }, 100);
  }, []);

  const Img = async (id: number, name: string) => {
    const url = await ImgUrl('/sms/business/bizOrderField/download', id, name);
    return url.imgUrl[0];
  };
  const handleQrCode = async () => {
    let tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
    let tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
    const src = '/sms/business/bizOrder/buildSubmitQrcode?id=' + studentid.studentId + '&' + tokenName + '=' + tokenValue;
    setQrcodeSrc(src)
  }
  const submitData = (id: any) => {
    request.get('/sms/business/bizStudentUser', { id: studentid.studentId }).then((res: any) => {
      const data = res.data.content[0]
      let obj = {
        name: data.name,
        mobile: data.mobile,
        idCard: data.idCard,
        sex: data.sex + '',
        degree: data.education + '',
        job: Dictionaries.getCascaderValue('dict_reg_job', renderData.project)[0],
        project: renderData.project
      }
      setDatas(obj)
      setsubmitDataModal(true)
      setsubmitFieldId(id)
    })


  }
  const fromList = (value: any) => {
    const format: any = value.format ? new Function('return' + value.format)() : {};
    const { size = null, required = false } = format;

    switch (value.type) {
      case 0:
        return (
          <ProFormText
            name={value.fieldId}
            label={<text>{value.name} {format.typeName == 'ChengruoData' ? <a onClick={() => submitData(value.fieldId)}>提交资料</a> : ''}</text>}
            width={560}
            disabled={format.typeName == 'ChengruoData'}
            key={value.fieldId}
            rules={[
              {
                required: required,
                pattern: new RegExp(/^\S*$/),
                message: '不能包含空格/请输入正确的用户名',
              },
            ]}
          />
        );
      case 1:
        return (
          <ProFormText
            name={value.fieldId}
            label={value.name}
            width={560}
            key={value.fieldId}
            rules={[
              {
                required: required,
                pattern: new RegExp(Dictionaries.getRegex('idCard')),
                message: '请输入正确的身份证号',
              },
            ]}
          />
        );
      case 2:
        return (
          <ProFormText
            name={value.fieldId}
            label={value.name}
            width={560}
            key={value.fieldId}
            rules={[
              {
                required: required,
                pattern: new RegExp(Dictionaries.getRegex('mobile')),
                message: '请输入正确的手机号',
              },
            ]}
          />
        );
      case 3:
        return (
          <ProFormUploadDragger
            width={560}
            name={value.fieldId}
            label={value.name}
            key={value.fieldId}
            action="/sms/business/bizOrderField/upload"
            rules={[
              {
                required: required,
              },
            ]}
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
                if (size && file.size > size * 1000) {
                  message.error(`上传文件不能大于${size}kb`);
                  return Upload.LIST_IGNORE;
                }
                if (file.type != 'image/png' && file.type != 'image/jpeg') {
                  message.error(`只能上传png、jpg格式`);
                  return Upload.LIST_IGNORE;
                }
              },
              onPreview: async (file: any) => {
                const url = await Img(file.uid, file.response.data);
                // Img(9, 'f10203b3b2cd4ad389285449dd3db28c.png').then((res) => {
                //   console.log('ress', res);
                // });
                // console.log('url', url);
                setImgSrc(url);
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
        );
      case 4:
        return (
          <ProFormUploadDragger
            width={560}
            name={value.fieldId}
            label={value.name}
            key={value.fieldId}
            action="/sms/business/bizOrderField/upload"
            rules={[
              {
                required: required,
              },
            ]}
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
                if (size && file.size > size * 1000) {
                  message.error(`上传文件不能大于${size}kb`);
                  return Upload.LIST_IGNORE;
                }
              },
              onPreview: async (file: any) => {
                const url = await Img(file.uid, file.response.data);
                // Img(9, 'f10203b3b2cd4ad389285449dd3db28c.png').then((res) => {
                //   console.log('ress', res);
                // });
                // console.log('url', url);
                setImgSrc(url);
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
        );
      case 5:
        return (
          <ProFormSelect
            width={560}
            name={value.fieldId}
            placeholder={value.name}
            label={value.name}
            rules={[{ required: true, message: '请选择报考岗位' }]}
            fieldProps={{
              options: Dictionaries.getList(
                'dict_reg_job',
                Dictionaries.getCascaderAllName('dict_reg_job', renderData.project, 'value'),
                false,
              ),
              // mode: 'multiple',
              // showSearch: { filter },
              // onChange: onChange,
              // onSearch: (value) => console.log(value),
              // defaultValue: ['0', '00'],
            }}
          />
        );
    }
  };

  const submitok = (values: any, type: string) => {
    let array: {
      orderFieldId?: number;
      fieldId: string;
      value: any;
      orderId: any;
      id?: any;
      type: number;
    }[] = [];

    Object.keys(values).forEach((key, index) => {
      renderData.signup.forEach((item: any) => {
        if (item.fieldId == key) {
          if (typeof values[key] == 'object') {
            // values[key] = values[key][0].response.data;
            array.push({
              fieldId: key,
              value: values[key][0].response.data,
              orderId: renderData.id,
              type: renderData.valueType,
            });
          } else {
            array.push({
              fieldId: key,
              value: values[key],
              orderId: renderData.id,
              type: renderData.valueType,
            });
          }

          if (item.orderFieldId) {
            array[index].id = item.orderFieldId;
          }
        }
      });
    });

    request.postAll('/sms/business/bizOrderField/saveArray', { array: array }).then((res) => {
      if (res.status == 'success') {
        if (type == 'audit') {
          request
            .post('/sms/business/bizOrder', { id: renderData.id, isComplete: true })
            .then((ress) => {
              if (ress.status == 'success') {
                message.success('操作成功');
                setModalVisible();
                callbackRef();
              }
            });
        } else {
          message.success('操作成功');
          setModalVisible();
          callbackRef();
        }

        // resolve(true);
      }
    });
  };
  return (
    <>
      <Modal
        title="提交资料二维码"
        open={qrcodeVisible}
        width={500}
        onCancel={() => setQrcodeVisible(false)}
        footer={null}
        destroyOnClose
      >

        <img style={{ width: '400px', height: '400px' }} src={qrcodeSrc} />
      </Modal>
      <ModalForm<{
        name: string;
        company: string;
      }>
        title="提交资料"
        formRef={formRef}
        visible={modalVisible}
        width={660}
        autoFocusFirstInput
        modalProps={{
          onCancel: () => setModalVisible(),
          destroyOnClose: true,
          maskClosable: false,
          okText: '暂存',
        }}
        submitter={{
          render: (props, doms) => {
            return [
              ...doms,
              <Button
                htmlType="button"
                type="primary"
                hidden={renderData.type == 1}
                onClick={async () => {
                  formRef.current?.validateFieldsReturnFormatValue?.().then(async (values) => {
                    console.log('校验表单并返回格式化后的所有数据：', values);
                    await submitok(values, 'audit');
                  });
                }}
                key="edit"
              >
                提交审核
              </Button>,
            ];
          },
        }}
        onFinish={async (values: any) => {
          // if (renderData.types == 'edit') values.id = renderData.id;
          await submitok(values, 'edit');
        }}
      >
        <Button type='primary' onClick={() => handleQrCode()}>收集资料二维码</Button>
        <ProForm.Group>{HtmlProForm}</ProForm.Group>
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
        {
          submitDataModal &&
          <SubmitData
            setModalVisible={() => setsubmitDataModal(false)}
            modalVisible={submitDataModal}
            renderData={renderData}
            callbackRef={() => callbackRef()}
            setSubimtDatas={(e: any) => setSubimtDatas(e)}
            datas={datas}
          />
        }
      </ModalForm>
    </>
  );
};
