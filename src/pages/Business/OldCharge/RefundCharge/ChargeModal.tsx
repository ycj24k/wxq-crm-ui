import type {
  ProFormInstance} from '@ant-design/pro-form';
import ProForm, {
  ModalForm,
  ProFormCascader,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect,
} from '@ant-design/pro-form';
import Dictionaries from '@/services/util/dictionaries';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { Button, message, Row } from 'antd';
import UploadDragger from '@/components/UploadDragger/UploadDragger';
import request from '@/services/ant-design-pro/apiRequest';
import ProFormUser from '@/components/ProFormUser';
import filter from '@/services/util/filter';
import convertTime from '@/services/util/monentTime';
import UserTreeSelect from '@/components/ProFormUser/UserTreeSelect';
import { history } from 'umi';
import '../index.less'
export default forwardRef((props: any, ref) => {
  const { renderData, ModalsVisible, setModalsVisible, callbackRef } = props;
  const formRef = useRef<ProFormInstance>();
  const [refundTypeFalg, setRefundTypeFalg] = useState<number>(0);
  const [userNameId, setUserNameId] = useState<any>();
  const [DepartId, setDepartId] = useState<any>();
  const [agentNameId, setAgentNameId] = useState<any>();
  const [falgUser, setFalgUser] = useState<boolean>(false);

  const [DepartmentList, setDepartment] = useState<any>([]);
  const userRef: any = useRef(null);
  const agentRef: any = useRef(null);
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

      renderData.oldProject = Dictionaries.getCascaderValue('dict_reg_job', renderData.oldProject);
      if (renderData.refundType == '1') setRefundTypeFalg(renderData.refundType);
      formRef.current?.setFieldsValue(renderData);
      userRef.current.setDepartment({
        id: renderData.userId,
        name: renderData.userName,
        departmentId: Dictionaries.getDepartmentName(Number(renderData.departmentId))[0],
      });
      setDepartId(renderData.departmentId);
      setUserNameId({ name: renderData.userName, id: renderData.userId });
      agentRef.current.setDepartment({
        id: renderData.agent,
        name: renderData.agentName,
      });
    }
  }, []);
  const meg = () => {
    message.success('操作成功');
    setModalsVisible();
    callbackRef();
  };

  const submits = (value: any, subType?: string) => {
    if (falgUser) {
      message.error('请填写正确的姓名/部门');
    }
    if (renderData.eidtType == 'eidt') {
      value.id = renderData.id;
    }
    if (value.files) {
      const arr: any[] = [];
      value.files.forEach((item: any) => {
        arr.push(item.response.data);
      });
      value.files = arr.join(',');
    }

    // value.userId = userNameId.id ? userNameId.id :userNameId.name;
    value.userName = userNameId.name;
    value.userId = userNameId.id;

    value.agent = agentNameId.id;
    // value
    value.type = renderData.type;
    value.oldProject = value.oldProject[value.oldProject.length - 1];
    value.paymentTime = convertTime(value.chargeTime);
    value.chargeTime = convertTime(value.chargeTime);
    value.departmentId = DepartId;
    delete value.isCalculation;
    return new Promise(async (resolve) => {
      if (renderData.eidtType == 'eidt') {
        const url =
          renderData.confirm !== false ? '/sms/business/bizCharge/edit' : '/sms/business/bizCharge';
        let eidts: any = {}
        if (renderData.confirm === false) {
          eidts = await request.post(url, value)
        } else {
          eidts = await request.postAll(url, [value]);
        }

        if (eidts.status != 'success') return;
        if (subType == 'audit') {
          const auditNum = renderData.auditNum ? Number(renderData.auditNum) + 1 : 1;
          const audits = await request.post(`/sms/business/bizAudit/audit/${auditNum}`, {
            confirm: true,
            entityId: renderData.id,
          });
          if (audits.status != 'success') return;
        }
        meg();
        resolve(true);
      } else {
        request
          .post2('/sms/business/bizCharge/complex', value)
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
    history.push('/business/businessorder');
  };
  return (
    <ModalForm
      title="添加退费"
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
          formRefs={formRef}
          name="userId"
          userNameChange={true}
          setUserNameId={(e: any) => setUserNameId(e)}
        /> */}
        <UserTreeSelect
          ref={userRef}
          userLabel="招生老师"
          userNames="userName"
          userPlaceholder="请输入招生老师的名字"
          setUserNameId={(e: any) => setUserNameId(e)}
          setDepartId={(e: any) => setDepartId(e)}
          setFalgUser={(e: any) => setFalgUser(e)}
        />
      </ProForm.Group>
      <ProForm.Group>
        <div
          className='zhuyi'
        >
          <text className='zhuyis'>注意:</text> 2023年4月后的订单禁止在此退费，请去
          <text
            style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
            onClick={() => GotoDingdan()}
          >
            订单列表
          </text>
          搜索对应订单进行退费!
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
              message: '不能包含空格/请输入正确的用客户姓名',
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
        {/* <ProFormSelect
          label="客户来源"
          name="oldSource"
          width={200}
          rules={[{ required: true, message: '请选择客户来源' }]}
          request={async () => Dictionaries.getList('dict_source') as any}
        /> */}
      </ProForm.Group>
      <ProForm.Group>
        <ProFormDigit
          label={`本次退费金额`}
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
          label="退款方式"
          name="method"
          width="md"
          request={async () => Dictionaries.getList('dict_stu_refund_type') as any}
          rules={[
            {
              required: true,
              message: '请选择退款方式',
            },
          ]}
        />
        <ProFormSelect
          label="退费类型"
          name="type"
          width="md"
          // request={async () => Dictionaries.getList('chargeType')}
          valueEnum={{
            0: '订单退费',
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
          label={`本次消费金额`}
          name="oldConsumptionAmount"
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
        <ProFormDatePicker
          name="chargeTime"
          fieldProps={{
            showTime: false,
          }}
          width="md"
          label={`退费日期`}
          rules={[{ required: true, message: '请填写退费日期' }]}
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
      </ProForm.Group>

      <ProForm.Group>
        <ProFormTextArea
          width={1100}
          label={'退款原因'}
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
          label={refundTypeFalg == 2 ? '上传附件(付款截图)' : '上传附件(退款申请书)'}
          name="files"
          action="/sms/business/bizCharge/upload"
          rules={[{ required: refundTypeFalg != 1 }]}
          renderData={renderData}
          fileUrl={'/sms/business/bizCharge/download'}
        />
      </ProForm.Group>
      <div>
        <ProForm.Group title="退款领取人信息">
          <ProFormText
            name="recipientName"
            label="退费领取人"
            rules={[{ required: true }]}
            width="sm"
          />
          <ProFormSelect
            label="退款类型"
            name="refundType"
            width="md"
            request={async () => Dictionaries.getList('dict_refundType') as any}
            fieldProps={{
              onChange: (e) => {
                setRefundTypeFalg(e);
              },
            }}
            rules={[
              {
                required: true,
                message: '请选择退款类型',
              },
            ]}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText
            name="accountName"
            label="开户名"
            width="md"
            disabled={refundTypeFalg == 1}
            rules={[{ required: refundTypeFalg != 1 }]}
          />
          <ProFormText
            name="account"
            label="卡号"
            width="md"
            disabled={refundTypeFalg == 1}
            rules={[{ required: refundTypeFalg != 1 }]}
          />
          <ProFormText
            name="bank"
            label="开户行（精确到支行）"
            width="md"
            disabled={refundTypeFalg == 1}
            rules={[{ required: refundTypeFalg != 1 }]}
          />
        </ProForm.Group>
        <Row>
          <ProFormUser
            ref={agentRef}
            label="经办人"
            name="agent"
            formRefs={formRef}
            setUserNameId={(e: any) => setAgentNameId(e)}
          />
        </Row>
      </div>
    </ModalForm>
  );
});
