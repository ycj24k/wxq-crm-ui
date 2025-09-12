import type {
  ProFormInstance} from '@ant-design/pro-form';
import ProForm, {
  ModalForm,
  ProFormCascader,
  ProFormCheckbox,
  ProFormDatePicker,
  ProFormDigit,
  ProFormDigitRange,
  ProFormGroup,
  ProFormList,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-form';
import { message, Upload, Image, Button } from 'antd';
import request from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import { useEffect, useRef, useState } from 'react';
import ContractModel from '../Contract/ContractModel';
import ContractModels from '../ConTemplate/ContractModel';
import ChargeIframe from '../AdminCharge/ChargeIframe';
import ImgUrl from '@/services/util/ImgUrl';
import convertCurrency from '@/services/util/converCurrency';
import moment from 'moment';
import { useModel } from 'umi';
import QRcodes from '@/pages/Foreground/Certificate/Qcodes';
import './ContractModel.less'
export default (props: any) => {
  const { setModalVisible, modalVisible, callbackRef, renderData } = props;
  const { initialState, setInitialState } = useModel('@@initialState');
  // @ts-ignore
  const { currentUser } = initialState;
  const [CompanyId, setCompanyId] = useState<any>();
  const [CompanyIds, setCompanyIds] = useState<any>();
  const [HtmlProForm, setHtmlProForm] = useState<any>(false);
  const [QRcodesFalg, setQRcodesFalg] = useState<any>(false);
  const [isContractModelVisibles, setContractModelVisibles] = useState<boolean>(false);
  const [isContractModelVisible, setContractModelVisible] = useState<boolean>(false);
  const [previewVisible, setPreviewVisible] = useState<any>(false);
  const [previewImage, setPreviewImage] = useState<any>();
  const formRef = useRef<ProFormInstance>();
  if (renderData.addNumber === 0) {
    setTimeout(() => {
      formRef?.current?.setFieldsValue({
        name:
          Dictionaries.getCascaderName('dict_reg_job', renderData.project) +
          '(' +
          renderData.name +
          ')',
        project: Dictionaries.getCascaderValue('dict_reg_job', renderData.project),
        userName: renderData.name,
      });
    }, 100);
    ++renderData.addNumber;
  }
  if (renderData.type == 'staff') {
    setTimeout(() => {
      formRef?.current?.setFieldsValue({
        name:
          '服务协议(' +
          Dictionaries.getCascaderName('certificateKind', renderData.kind) +
          ')',
        project: Dictionaries.getCascaderValue('dict_reg_job', renderData.project),
        userName: renderData.userName,
      });
    }, 100);
  }
  useEffect(() => {
    request.get('/sms/contract/conContract/findCompany', { id: renderData.id }).then((res) => {
      if (res.data?.id) {
        setCompanyId(res.data);
      }
    });
  }, [renderData]);
  useEffect(() => {
    if (!CompanyId) return;
    contentText();
  }, [CompanyId]);
  useEffect(() => {
    formRef?.current?.setFieldsValue({
      parameter: [{}],
    });
    let hl = [];
    if (!CompanyIds) return;
    CompanyIds &&
      formRef?.current?.setFieldsValue({
        templateId: CompanyIds.name,
      });

    hl = CompanyIds.parameter.map((item: any) => {
      return formList(item);
    });
    setHtmlProForm(hl);
    // console.log('hl', hl);

    contentText();
    getImgUrl();


    console.log(CompanyIds, 'CompanyIds.name-------->')

  }, [CompanyIds]);

  const getImgUrl = async () => {
    await ImgUrl('/sms/contract/conTemplate/download', CompanyIds.id, CompanyIds.file).then(
      (res: any) => {
        setPreviewImage(res.pdfUrl[0]);
        //setPreviewVisible(true);
      },
    );
  }

  const contentText = () => {
    const arr = ['partBCardBankName', 'partBCardName', 'partBCardNo', 'signatureDate'];
    const content = JSON.parse(JSON.stringify(formRef?.current?.getFieldValue('parameter')));
    CompanyIds?.parameter?.forEach((item: any) => {
      if (item.code == 'partBCardName') {
        content[0].partBCardBankName = CompanyId?.bank;
        content[0].partBCardName = CompanyId?.accountName;
        content[0].partBCardNo = CompanyId?.account;
      }
      if (item.code == 'timeOutPartA') content[0].timeOutPartA = moment().format('YYYY-MM-DD');
      if (item.code == 'timeOutPartB') content[0].timeOutPartB = moment().format('YYYY-MM-DD');
      if (item.code == 'partA') content[0].partA = renderData?.name ? renderData?.name : renderData?.userName;
      if (item.code == 'partB') content[0].partB = CompanyId?.name;
      if (item.code == 'linkTelephonePartA') content[0].linkTelephonePartA = renderData?.mobile;
      if (item.code == 'linkTelephonePartB') content[0].linkTelephonePartB = currentUser?.mobile;
      if (item.code == 'idCard') content[0].idCard = renderData?.idCard;
    });

    formRef?.current?.setFieldsValue({
      ourSeal: CompanyId?.name,
      parameter: content,
    });
  };
  const formList = (value: any) => {
    if (value.type == '0') {
      return (
        <ProFormText
          name={value.code}
          label={value.name}
          width="sm"
          key={value.code}
          rules={[{ required: value.isRequired, message: `请填写${value.name}` }]}
        />
      );
    } else if (value.type == '1') {
      return (
        <ProFormDigit
          name={value.code}
          label={value.name}
          width="sm"
          key={value.code}
          rules={[{ required: value.isRequired, message: `请填写${value.name}` }]}
        />
      );
    } else if (value.type == '5') {
      return (
        <ProFormDatePicker
          name={value.code}
          label={value.name}
          width="sm"
          key={value.code}
          rules={[{ required: value.isRequired, message: `请填写${value.name}` }]}
        />
      );
    } else if (value.type == '2') {
      return (
        <ProFormCheckbox
          name={value.code}
          label={value.name}
          width="sm"
          key={value.code}
          rules={[{ required: value.isRequired, message: `请填写${value.name}` }]}
        />
      );
    } else if (value.type == '3') {
      return (
        <ProForm.Group key={value.code}>
          <ProFormDigit
            name={value.code}
            label={value.name}
            width="sm"
            key={value.code + 's'}
            fieldProps={{
              precision: 2,
              onChange: (e) => {
                const content = JSON.parse(
                  JSON.stringify(formRef?.current?.getFieldValue('parameter')),
                );
                content[0][value.code + 'Big'] = convertCurrency(e);
                formRef?.current?.setFieldsValue({
                  parameter: content,
                });
              },
            }}
            rules={[{ required: value.isRequired, message: `请填写${value.name}` }]}
          />
          <ProFormText
            name={value.code + 'Big'}
            label={`${value.name}大写`}
            width="sm"
            disabled
            key={`${value.name}big`}
          />
        </ProForm.Group>
      );
    } else if (value.type == '4') {
      return (
        <ProForm.Group key="banks">
          <ProFormText
            name="partBCardName"
            label="开户名"
            width="sm"
            key="partBCardName"
            disabled
            fieldProps={{ defaultValue: CompanyId?.partBCardName }}
          />
          <ProFormText
            name="partBCardBankName"
            label="开户行"
            width="sm"
            key="partBCardBankName"
            disabled
            fieldProps={{ defaultValue: CompanyId?.partBCardBankName }}
          />
          <ProFormText
            name="partBCardNo"
            label="账号"
            width="sm"
            key="partBCardNo"
            disabled
            fieldProps={{ defaultValue: CompanyId?.partBCardNo }}
          />
        </ProForm.Group>
      );
    } else if (value.type == '6') {
      return (
        <ProFormSelect
          label={value.name}
          name={value.code}
          width="sm"
          key={value.code}
          request={async () => Dictionaries.getList('companyAddress') as any}
          rules={[{ required: value.isRequired, message: `请填写${value.name}` }]}
        />
      );
    } else {
      return (
        <ProFormText
          name={value.code}
          label={value.name}
          width="sm"
          key={value.code}
          rules={[{ required: value.isRequired, message: `请填写${value.name}` }]}
        />
      );
    }
  };

  const tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
  const tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
  const obj: Record<string, string> = {};
  if (tokenValue !== null) {
    obj[tokenName] = tokenValue;
  } else {
    // 处理 tokenValue 为 null 的情况，例如显示错误消息或设置默认值
    console.error('Token value is null');
  }
  const submitok = (values: any) => {
    const url = renderData.type == 'staff' ? '/sms/business/bizCertificateApply/createServiceFile' : '/sms/contract/conContract'
    return new Promise((resolve) => {
      request
        .post(url, values)
        .then((res: any) => {
          if (res.status == 'success') {
            message.success('操作成功!');
            setQRcodesFalg(true)
            // setModalVisible();
            // callbackRef();
            resolve(true);
          }
        })
        .catch((err: any) => {
          resolve(true);
        });
    });
  };
  const filter = (inputValue: string, path: any[]) => {
    return path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
  };
  function onChange(value: any, selectedOptions: any) { }
  return (
    <ModalForm
      width={1600}
      title='合同签署'
      formRef={formRef}
      onFinish={async (values) => {
        // if (renderData.type == 'eidt') {
        //   values.id = renderData.id;
        // }
        values.templateId = CompanyIds.id;
        Object.keys(values.parameter[0]).forEach((key: any) => {
          if (values.parameter[0][key] === true) {
            values.parameter[0][key] = '是';
          }
        });
        if (renderData.type == 'staff') {
          const obj: any = {}
          obj.id = renderData.id;
          obj.serviceName = values.name
          obj.param = JSON.stringify(values.parameter[0]);
          obj.templateId = CompanyIds.id;
          obj.companyId = CompanyId.id
          await submitok(obj);
        } else {

          values.studentUserId = renderData.id;
          values.ourSeal = CompanyId.id;
          values.parameter = JSON.stringify(values.parameter[0]);
          if (values.project) values.project = values.project[values.project.length - 1];
          delete values.userName;
          await submitok(values);
        }

        console.log('values', values);

        // 
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
      <div className='common'>
        <div className='common_left'>
          <ProFormText
            label="合同名称"
            name="name"
            rules={[
              {
                required: true,
                message: '请填写合同名称',
              },
            ]}
           />
          <ProForm.Group label="合同信息：" >

            {/* hidden={renderData.type == 'staff'} */}
            <div hidden={renderData.type == 'staff'}>
              <ProFormCascader
                width="sm"
                name="project"
                placeholder="咨询报考岗位"
                label="报考岗位"
                rules={[{ required: renderData.type != 'staff', message: '请选择报考岗位' }]}
                fieldProps={{
                  options: Dictionaries.getCascader('dict_reg_job'),
                  showSearch: { filter },
                  onChange: onChange,
                  onSearch: (value) => console.log(value),
                  // defaultValue: ['0', '00'],
                }}
              />
              <ProFormDigit
                name="amount"
                label="合同共计金额"
                width="sm"
                rules={[
                  {
                    required: renderData.type != 'staff',
                  },
                ]}
               />
            </div>
          </ProForm.Group>
          <ProForm.Group>
            <ProFormText
              label="合同模板"
              name="templateId"
              width="sm"
              rules={[
                {
                  required: true,
                },
              ]}
             />
            <Button
              style={{ marginTop: '30px', marginLeft: '-30px' }}
              type="primary"
              onClick={async () => {
                //   setCardContent({ content: content.data, type: 'order' });
                // setStudentModalsVisible(true);
                setContractModelVisible(true);
              }}
            >
              选择合同模板
            </Button>
            {/* <Button
              type="primary"
              style={{ marginTop: '30px', marginLeft: '-30px' }}
              onClick={async () => {
                if (!CompanyIds) {
                  message.error('请先选择合同模板!');
                  return;
                }
                await ImgUrl('/sms/contract/conTemplate/download', CompanyIds.id, CompanyIds.file).then(
                  (res: any) => {
                    setPreviewImage(res.pdfUrl[0]);
                    setPreviewVisible(true);
                  },
                );
              }}
            >
              查看
            </Button> */}
            <ProFormText
              label="我方签署公司"
              name="ourSeal"
              width="sm"
              rules={[
                {
                  required: true,
                },
              ]}
             />
            <Button
              style={{ marginTop: '30px', marginLeft: '-30px' }}
              type="primary"
              onClick={async () => {
                // setCardContent({ content: content.data, type: 'order' });
                // setStudentModalsVisible(true);
                setContractModelVisibles(true);
              }}
            >
              选择公司
            </Button>
          </ProForm.Group>

          <ProForm.Group label="以下为合同填充信息(选择模板后展示)：">
            <ProFormList
              name="parameter"
              initialValue={[{}]}
              creatorButtonProps={false}
              creatorRecord={{
                useMode: 'none',
              }}
              copyIconProps={false}
              deleteIconProps={false}
            >
              <ProForm.Group>{HtmlProForm}</ProForm.Group>
            </ProFormList>
          </ProForm.Group>
        </div>
        <div className='common_right'>
          {previewImage ? <iframe src={previewImage} style={{ width: '100%', height: '100%' }} /> : <div className='noFile'>暂未选择合同</div>}
        </div>
      </div>



      {/* <ProForm.Group>{HtmlProForm}</ProForm.Group> */}

      {isContractModelVisibles && (
        <ContractModel
          modalVisible={isContractModelVisibles}
          setModalVisible={() => setContractModelVisibles(false)}
          setCompanyId={(e: any) => {
            setCompanyId(e);
          }}
        />
      )}
      {isContractModelVisible && (
        <ContractModels
          modalVisible={isContractModelVisible}
          setModalVisible={() => setContractModelVisible(false)}
          setCompanyId={(e: any) => {
            setCompanyIds(e);
          }}
        />
      )}
      <ChargeIframe
        previewVisible={previewVisible}
        setPreviewVisible={() => setPreviewVisible(false)}
        previewImage={previewImage}
      />
      {
        QRcodesFalg && <QRcodes
          setModalVisible={() => setQRcodesFalg(false)}
          modalVisible={QRcodesFalg}
          callbackRef={() => callbackRef()}
          setPModalVisible={() => setModalVisible()}
        />
      }

    </ModalForm>
  );
};
