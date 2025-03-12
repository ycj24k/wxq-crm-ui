import ProForm, {
  ModalForm,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormUploadDragger,
} from '@ant-design/pro-form';
import { message, Upload, Image, Button } from 'antd';
import request from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import UserManageCard from '@/pages/Admins/Department/UserManageCard';
import { useModel } from 'umi';
import '@/pages/Admins/AdminCharge/Charge.less';
import ImgUrl from '@/services/util/UpDownload';
import ChargeIframe from '@/pages/Admins/AdminCharge/ChargeIframe';
let content: any = null;
export default (props: any) => {
  const { setModalVisible, modalVisible, callbackRef, renderData } = props;
  console.log('renderData', renderData);
  const [url, setUrl] = useState<string>('/sms/business/bizPaymentApply');
  let tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
  let tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
  let obj = {};
  obj[tokenName] = tokenValue;

  useEffect(() => {
    if (renderData?.audit <= 8) {
      setUrl('/sms/business/bizPaymentApply/edit/' + renderData.audit);
    } else if (renderData?.audit == 9) {
      setUrl('/sms/business/bizPaymentApply/edit/end');
    } else {
      setUrl('/sms/business/bizPaymentApply');
    }
    if (
      (renderData.type == 'eidt' || renderData.type == 'adds') &&
      renderData.renderDataNum === 0
    ) {
      // delete renderData.files;
      let arr: any = [];
      if (renderData.files) {
        renderData.files.split(',').forEach((item: any, index: number) => {
          arr.push({ uid: index, name: item, response: { data: item } });
        });
      }
      setTimeout(() => {
        formRef.current?.setFieldsValue({
          ...renderData,
          source: renderData.source + '',
          hasInvoice: renderData.hasInvoice + '',
          files: arr,
        });
        ++renderData.renderDataNum;
        setchargePerson({ name: renderData.chargePersonName, id: renderData.chargePerson });
      }, 100);
    }
  }, []);
  const [isModalVisibles, setisModalVisibles] = useState<boolean>(false);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [CardVisible, setCardVisible] = useState<boolean>(false);
  const { initialState } = useModel('@@initialState');
  const { currentUser }: any = initialState;
  const [CardContent, setCardContent] = useState<any>();
  const [chargePerson, setchargePerson] = useState<any>({
    name: currentUser.name,
    id: currentUser.userid,
  });
  const [imgSrc, setImgSrc] = useState();
  const formRef = useRef<ProFormInstance>();
  const look = async (id: any, item: any) => {
    if (!id) return
    const type = item.slice(item.indexOf('.'));
    await ImgUrl('/sms/business/bizPaymentApply/download', id, item).then((res: any) => {
      setImgSrc(res);
      if (type == '.png' || type == '.jpg' || type == '.jpeg') {
        setisModalVisibles(true);
      } else {
        setPreviewVisible(true);
      }
    });
  };
  const submitok = (values: any, types: any = 'sub') => {
    if (renderData?.type == 'eidt') {
      values.id = renderData.id;
    }
    if (values.files) {
      //values.files = values.files.at(-1).response.data;
      let a: any = [];
      values.files.forEach((item: any) => {
        a.push(item.response.data);
      });
      values.files = a.join(',');
    }
    values.chargePerson = chargePerson.id;
    if (renderData.type == 'eidt') values.id = renderData.id;
    return new Promise((resolve) => {
      request
        .post(url, values)
        .then((res: any) => {
          if (res.status == 'success') {
            if (types == 'audit') {
              let auditNumber = renderData.auditNum ? renderData.auditNum + 1 : 7;
              request.post(`/sms/business/bizAudit/audit/${auditNumber}`, {
                // auditType: '0',
                confirm: true,
                entityId: renderData.id,
              });
            }
            setTimeout(() => {
              message.success('操作成功!');
              setModalVisible();
              callbackRef();
              resolve(true);
            }, 100);
          }
        })
        .catch((err: any) => {
          resolve(true);
        });
    });
  };
  return (
    <ModalForm
      width={810}
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
        okText: renderData.type == 'add' || renderData.type == 'adds' ? '提交' : '修改',
      }}
      submitter={{
        render: (props, doms) => {
          return [
            ...doms,
            <Button
              htmlType="button"
              type="primary"
              hidden={renderData.type == 'add' || renderData.type == 'adds'}
              onClick={async () => {
                formRef.current?.validateFieldsReturnFormatValue?.().then(async (values) => {
                  console.log('校验表单并返回格式化后的所有数据：', values);
                  await submitok(values, 'audit');
                });
              }}
              key="edit"
            >
              修改并审核
            </Button>,
          ];
        },
      }}
      visible={modalVisible}
    >
      <div className="scrollX" style={{ height: '600px', overflowY: 'scroll', marginTop: '20px' }}>
        <ProForm.Group label="基本信息:">
          <ProFormDateTimePicker
            // name="paymentTimess"
            width="md"
            label="申请日期"
            fieldProps={{
              value: moment(),
            }}
            disabled
          />
          <ProFormText
            label="申请人"
            fieldProps={{
              value: currentUser.name,
            }}
            readonly
          />
        </ProForm.Group>
        <ProForm.Group label="收款方信息：">
          <ProFormText
            width="md"
            name="payee"
            label="收款方单位"
            placeholder="请输入收款方单位"
            rules={[
              {
                required: true,
              },
            ]}
          />
          <ProFormText
            width="md"
            name="mobile"
            label="收款方联系电话"
            placeholder="请输入联系电话"
            rules={[
              {
                required: true,
                // pattern: new RegExp(Dictionaries.getRegex('mobile')),
                message: '请输入正确的手机号',
              },
            ]}
          />
          <ProFormText
            label="开户行（详细到支行）"
            placeholder="如:中国建行（江西九江共青支行）"
            name="bank"
            width="md"
            rules={[
              {
                required: true,
              },
            ]}
          />
          <ProFormText
            label="开户行银行账号"
            name="account"
            placeholder="请输入银行账号"
            width="md"
            rules={[
              {
                required: true,
              },
            ]}
          />
        </ProForm.Group>
        <ProForm.Group label="付款方信息：">
          <ProFormSelect
            label="付款方式"
            name="source"
            width="md"
            request={async () => Dictionaries.getList('dict_stu_refund_type') as any}
            rules={[
              {
                required: true,
                message: '请选择付款方式',
              },
            ]}
          />
          <ProFormDigit
            label="付款金额"
            name="amount"
            fieldProps={{
              precision: 2,
            }}
            rules={[
              {
                required: true,
              },
            ]}
          />
          <ProFormDateTimePicker
            name="paymentTime"
            width="md"
            label="要求付款时间"
            rules={[{ required: true, message: '请填写付款时间' }]}
          />

          <ProFormText
            label="负责人"
            name="chargePerson"
            width="md"
            fieldProps={{
              onClick: async () => {
                if (!content) {
                  content = await request.get('/sms/share/getDepartmentAndUser');
                }

                setCardContent({ content: content.data, type: 'pay' });
                setCardVisible(true);
              },
              value: chargePerson.name,
            }}
          // rules={[
          //   {
          //     required: true,
          //   },
          // ]}
          />
          <ProFormSelect
            label="是否有发票"
            name="hasInvoice"
            valueEnum={{
              true: '有',
              false: '否',
            }}
            required
          />
        </ProForm.Group>
        <ProFormTextArea
          label="明细"
          name="details"
          rules={[
            {
              required: true,
            },
          ]}
        />
        <ProForm.Group>
          <ProFormUploadDragger
            width={700}
            label="附件上传"
            name="files"
            action="/sms/business/bizPaymentApply/upload"
            // required
            fieldProps={{
              multiple: true,
              // method: 'POST',
              headers: {
                ...obj,
              },
              listType: 'picture',
              defaultFileList: [],
              // onDrop: (e) => {},
              beforeUpload: (file) => {
                if (file.size > 40960000) {
                  message.error(`上次大小不能超过40M`);
                  return Upload.LIST_IGNORE;
                }
                // if (file.type != 'image/png' && file.type != 'image/jpeg') {
                //   message.error(`只能上传png、jpg格式`);
                //   return Upload.LIST_IGNORE;
                // }
              },
              onPreview: async (file: any) => {
                look(renderData.id, file.name);
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
        <ProFormTextArea label="备注" name="description" />
        {CardVisible && (
          <UserManageCard
            CardVisible={CardVisible}
            CardContent={CardContent}
            callbackRef={() => callbackRef()}
            setCardVisible={() => setCardVisible(false)}
            setchargePerson={(e: any) => setchargePerson(e)}
          // setDepartment={(e: any) => setDepartment(e)}
          //   parentIdTree={parentIdTree}
          //   departments={department}
          />
        )}
        {previewVisible && (
          <ChargeIframe
            previewImage={imgSrc}
            previewVisible={previewVisible}
            setPreviewVisible={() => {
              setPreviewVisible(false);
            }}
          />
        )}
      </div>
    </ModalForm>
  );
};
