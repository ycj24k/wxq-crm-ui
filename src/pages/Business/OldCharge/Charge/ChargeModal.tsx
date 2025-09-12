import type {
  ProFormInstance} from '@ant-design/pro-form';
import ProForm, {
  ModalForm,
  ProFormCascader,
  ProFormDatePicker,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormList,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import Dictionaries from '@/services/util/dictionaries';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { Button, Col, message, Row, Upload } from 'antd';
import ProCard from '@ant-design/pro-card';
import UploadDragger from '@/components/UploadDragger/UploadDragger';
import request from '@/services/ant-design-pro/apiRequest';
import ProFormUser from '@/components/ProFormUser';
import { history } from 'umi';
import filter from '@/services/util/filter';
import convertTime from '@/services/util/monentTime';
import UserTreeSelect from '@/components/ProFormUser/UserTreeSelect';
import moment from 'moment';
import InvoiceRemarks from '../../Invoice/InvoiceRemarks';
export default forwardRef((props: any, ref) => {
  const { renderData, ModalsVisible, setModalsVisible, callbackRef } = props;
  const formRef = useRef<ProFormInstance>();
  const [falg, setFalg] = useState<boolean>(false);
  const [falgUser, setFalgUser] = useState<boolean>(false);
  const [fapiaoFalg, setfapiaoFalgFalg] = useState<boolean>(false);
  const [invoiceFalg, setinvoiceFalg] = useState<boolean>(false);
  const [userNameId, setUserNameId] = useState<any>();
  const [DepartId, setDepartId] = useState<any>();
  const userRef: any = useRef(null);
  useEffect(() => {
    if (renderData.eidtType == 'add') {
      formRef.current?.setFieldsValue({ type: renderData.type });
    }
    if (renderData.eidtType == 'eidt') {
      Object.keys(renderData).forEach((keys) => {
        if (typeof renderData[keys] == 'number') {
          renderData[keys] = renderData[keys] + '';
        }
      });
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
      const fapiao = [];
      if (renderData.invoiceTitle) {
        fapiao.push({
          title: renderData.invoiceTitle,
          productType: renderData.invoiceProductType + '',
          taxCode: renderData.invoiceTaxCode,
          amount: renderData.invoiceAmount,
          email: renderData.invoiceEmail,
          remark: renderData.invoiceRemark,
          cautions: renderData.invoiceCautions,
          type: renderData.invoiceType + '',
          bank: renderData.invoiceBank,
          account: renderData.invoiceAccount,
          mobile: renderData.invoiceMobile,
          address: renderData.invoiceAddress,
        });
        renderData.fapiao = fapiao;
        renderData.fFalg = '是';
        setfapiaoFalgFalg(true);
      } else {
        renderData.fFalg = '否';
      }
      renderData.oldProject = Dictionaries.getCascaderValue('dict_reg_job', renderData.oldProject);
      formRef.current?.setFieldsValue(renderData);
      userRef.current.setDepartment({
        id: renderData.userId,
        name: renderData.userName,
        departmentId: Dictionaries.getDepartmentName(Number(renderData.departmentId))[0],
      });
      setDepartId(renderData.departmentId);
      setUserNameId({ name: renderData.userName, id: renderData.userId });
    }
  }, []);
  const meg = () => {
    message.success('操作成功');
    setModalsVisible();
    callbackRef();
  };

  const submits = (value: any, subType?: string) => {
    let arrData = {};
    if (falgUser) {
      message.error('请填写正确的姓名/部门');
    }
    if (renderData.eidtType == 'eidt') {
      value.id = renderData.id;
      // value.paymentTime = moment(value.paymentTime).toDate();
    }
    if (value.files) {
      const arr: any[] = [];
      value.files.forEach((item: any) => {
        arr.push(item.response.data);
      });
      value.files = arr.join(',');
    }
    if (value.fapiao) {
      arrData = value.fapiao[0];
      delete value.fapiao;
    }
    value.chargeTime = convertTime(value.chargeTime)
    value.userId = userNameId.id;
    value.userName = userNameId.name;
    value.departmentId = DepartId;
    value.type = renderData.type;
    value.oldProject = value.oldProject[value.oldProject.length - 1];
    delete value.isCalculation;
    // console.log('userNameId', userNameId);
    // console.log('value', value);

    return new Promise(async (resolve) => {
      if (renderData.eidtType == 'eidt') {
        const eidts = await request.postAll('/sms/business/bizCharge/edit', [value]);
        if (eidts.status != 'success') return;
        if (JSON.stringify(arrData) != '{}') {
          const Invoice = await request.post('/sms/business/bizInvoice', {
            id: renderData.invoiceId,
            ...arrData,
          });
          if (Invoice.status != 'success') return;
        }
        if (subType == 'audit') {
          const audits = await request.post(`/sms/business/bizAudit/audit/0`, {
            confirm: true,
            entityId: renderData.id,
          });
          if (audits.status != 'success') return;
        }
        meg();
        resolve(true);
      } else {
        request
          .post2(
            '/sms/business/bizCharge/complex',
            value,
            JSON.stringify(arrData) != '{}' ? arrData : '',
          )
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
      }
    });
  };
  const GotoDingdan = () => {
    history.push('/business/companymanagetrue');
  };
  const GotoDingdans = () => {
    history.push('/business/studentmanage');
  };
  return (
    <ModalForm
      title="添加缴费"
      visible={ModalsVisible}
      formRef={formRef}
      width={1200}
      modalProps={{
        onCancel: () => setModalsVisible(false),
        okText: renderData.eidtType == 'eidt' ? '修改' : '提交',
        maskClosable: false,
      }}
      submitter={{
        render: (props, doms) => {
          return [
            ...doms,
            <Button
              htmlType="button"
              type="primary"
              hidden={renderData.eidtType == 'add'}
              onClick={async () => {
                formRef.current?.validateFieldsReturnFormatValue?.().then(async (values) => {
                  console.log('校验表单并返回格式化后的所有数据：', values);
                  await submits(values, 'audit');
                });
              }}
              key="edit"
            >
              修改并审核
            </Button>,
          ];
        },
      }}
      onFinish={async (value) => {
        await submits(value);
      }}
    >
      <ProForm.Group>
        {/* <ProFormUser
          ref={userRef}
          label="招生老师"
          name="userId"
          userNameChange={true}
          formRefs={formRef}
          setUserNameId={(e: any) => setUserNameId(e)}
        /> */}
        <UserTreeSelect
          ref={userRef}
          userLabel="招生老师(在职老师可以输入名字搜索)"
          userNames="userName"
          userPlaceholder="请输入招生老师的名字"
          setUserNameId={(e: any) => setUserNameId(e)}
          setDepartId={(e: any) => setDepartId(e)}
          setFalgUser={(e: any) => setFalgUser(e)}
        />
      </ProForm.Group>

      <ProForm.Group>
        <div
          style={{
            width: '1100px',
            backgroundColor: '#d9edf7',
            border: '1px solid #bce8f1',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <text style={{ color: 'red' }}>注意:</text> 如果是学员需要下单，请去
          <text style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>
            <text onClick={() => GotoDingdan()}>正式学员</text>
            <text onClick={() => GotoDingdans()}>/潜在学员</text>
          </text>
          搜索学员名字查询到学员(潜在就新增学员)进行下单。这里是给老系统文星棋有过订单的学员缴纳尾款的
        </div>
        <ProFormText
          name="oldStudentName"
          width="md"
          label="客户姓名"
          placeholder="请输入客户姓名"
          rules={[
            {
              required: true,
              pattern: new RegExp(/^\S*$/),
              message: '不能包含空格/请输入正确的客户姓名',
            },
          ]}
        />
        <ProFormCascader
          width="sm"
          name="oldProject"
          placeholder="咨询报考岗位"
          label="报考岗位"
          rules={[{ required: true, message: '请选择报考岗位' }]}
          fieldProps={{
            options: Dictionaries.getCascader('dict_reg_job'),
            showSearch: { filter },
            onSearch: (value) => console.log(value),
            // defaultValue: ['0', '00'],
          }}
        />
        <ProFormSelect
          label="客户来源"
          name="oldSource"
          width={200}
          rules={[{ required: true, message: '请选择客户来源' }]}
          request={async () => Dictionaries.getList('dict_source') as any}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormDigit
          label={`本次缴费金额`}
          name="amount"
          width="md"
          fieldProps={{
            precision: 2,
          }}
          rules={[
            {
              required: true,
            },
          ]}
        />
        <ProFormSelect
          label="付款方式"
          name="method"
          width="md"
          request={async () => Dictionaries.getList('dict_stu_refund_type') as any}
          rules={[
            {
              required: true,
              message: '请选择付款方式',
            },
          ]}
        />
        <ProFormSelect
          label="缴费类型"
          name="type"
          width="md"
          // request={async () => Dictionaries.getList('chargeType')}
          valueEnum={{
            0: '订单缴费',
            1: '订单退费',
            2: '历史遗留缴费',
            3: '历史遗留退费或未下单直接退款',
          }}
          required
          disabled
        // fieldProps={{ defaultValue: renderData.type}}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormDigit
          name="discount"
          label="本次优惠金额"
          disabled={renderData.type == 'orders'}
          hidden={renderData.type == 'orders'}
          min={-999999}
          width="md"
          fieldProps={{
            onChange: (e) => {
              if (e) {
                setFalg(true);
              } else {
                setFalg(false);
              }
            },
          }}
        />
        <ProFormText
          name="discountRemark"
          label="本次优惠原因"
          width="lg"
          disabled={renderData.type == 'orders'}
          hidden={renderData.type == 'orders'}
          rules={[{ required: falg, message: '请填写本次折扣原因' }]}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormDatePicker
          name="chargeTime"
          fieldProps={{
            showTime: false,
          }}
          width="md"
          label={`缴费日期`}
          rules={[{ required: true, message: '请填写缴费日期' }]}
        />
        <ProFormDateTimePicker
          name="paymentTime"
          width="md"
          label={`实际到账日期`}
          rules={[{ required: true, message: '请填写实际到账日期' }]}
        />
        <ProFormDateTimePicker name="nextPaymentTime" width="md" label="下次缴费时间" />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormSelect
          name="fFalg"
          label="是否开具发票"
          valueEnum={{
            false: '否',
            true: '是',
          }}
          width="xs"
          fieldProps={{
            onChange: (e) => {
              if (e == 'false') {
                setfapiaoFalgFalg(false);
              } else {
                setfapiaoFalgFalg(true);
              }
            },
            placeholder: '请选择',
          }}
          rules={[
            {
              required: true,
            },
          ]}
        />
        <ProFormSwitch
          label="是否统计业绩"
          name="isCalculation"
          hidden={renderData.eidtType !== 'eidt'}
          fieldProps={{
            checkedChildren: '计算',
            unCheckedChildren: '不计算',
            defaultChecked: renderData.isCalculation,
            onChange: async () => {
              const status: any = await request.post(
                '/sms/business/bizCharge/reports/setIsCalculation',
                {
                  ids: renderData.id,
                  isCalculation: !renderData.isCalculation,
                },
              );
            },
          }}
        />
        {fapiaoFalg && (
          <div>
            <ProFormList
              name="fapiao"
              creatorButtonProps={false}
              initialValue={[
                {
                  title: '',
                },
              ]}
              max={1}
              itemRender={({ listDom, action }, { record, index, name }) => {
                return (
                  <ProCard
                    title="发票信息"
                    style={{
                      width: '1050px',
                      border: '1px solid #bce8f1',
                      padding: '20px',
                      // marginTop: '10px',
                    }}
                  >
                    <ProForm.Group>
                      <ProFormText name="title" label="发票抬头" width="lg" required />
                      <ProFormSelect
                        label="商品种类"
                        name="productType"
                        width="md"
                        initialValue="0"
                        request={async () => Dictionaries.getList('invoiceProductType') as any}
                      />
                    </ProForm.Group>
                    <ProForm.Group>
                      <ProFormText name="taxCode" label="税号" width="md" required />
                      <ProFormDigit
                        name="amount"
                        label="金额"
                        width="md"
                        required
                        fieldProps={{ precision: 2 }}
                      />
                      <ProFormText name="email" label="学员邮箱" width="md" required />
                    </ProForm.Group>
                    <ProForm.Group>
                      <ProFormTextArea width={1100} label="发票备注" name="remark" />
                      <ProFormTextArea width={1100} label="注意事项" name="cautions" />
                    </ProForm.Group>
                    <ProForm.Group>
                      <ProFormSelect
                        label="发票种类"
                        name="type"
                        width="md"
                        fieldProps={{
                          onChange: (e) => {
                            const falgs = e == 0 ? false : true;
                            setinvoiceFalg(falgs);
                          },
                        }}
                        initialValue="0"
                        request={async () => Dictionaries.getList('invoiceType') as any}
                      />
                    </ProForm.Group>
                    <div hidden={!invoiceFalg}>
                      <ProForm.Group>
                        <ProFormText name="bank" label="开户行" width="md" required />
                        <ProFormText name="account" label="账号" width="md" required />
                      </ProForm.Group>
                      <ProForm.Group>
                        <ProFormText name="mobile" label="电话" width="md" required />
                        <ProFormText name="address" label="地址" width="md" required />
                      </ProForm.Group>
                    </div>
                  </ProCard>
                );
              }}
             />
          </div>
        )}
      </ProForm.Group>
      <ProForm.Group title="税票信息">
        <InvoiceRemarks />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormTextArea
          width={1100}
          label={'备注'}
          name="description"
          rules={[{ required: true }]}
        />
        <ProFormTextArea
          width={1100}
          label={'财务备注'}
          name="description2"
          hidden={renderData.eidtType != 'eidt'}
        />
        <UploadDragger
          width={1100}
          label="上传附件"
          name="files"
          action="/sms/business/bizCharge/upload"
          renderData={renderData}
          fileUrl={'/sms/business/bizCharge/download'}
        />
      </ProForm.Group>
    </ModalForm>
  );
});
