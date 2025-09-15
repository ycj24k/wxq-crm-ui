import { useEffect, useRef } from 'react';
import ProForm, { ModalForm, ProFormSelect, ProFormDigit } from '@ant-design/pro-form';
import Dictionaries from '@/services/util/dictionaries';
import type { ProFormInstance } from '@ant-design/pro-form';
import request from '@/services/ant-design-pro/apiRequest';
import { message } from 'antd';
export default (props: any) => {
  const { modalVisible, setModalVisible, callbackRef, renderData, url } = props;
  console.log(renderData, 'renderData');
  const formRef = useRef<ProFormInstance>();

  useEffect(() => {
    if (renderData.types == 'edit') {
      setTimeout(() => {
        formRef?.current?.setFieldsValue({
          project: renderData.project,
          clueValidityPeriod: renderData.clueValidityPeriod || renderData.cluesValidityPeriod,
          firstOrderProtectionPeriod: renderData.firstOrderProtectionPeriod,
          unclaimedTransferTime: renderData.unclaimedTransferTime,
          unclaimedDegradationTime: renderData.unclaimedDegradationTime,
          unfollowedTransferTime: renderData.unfollowedTransferTime,
          customerProtectionPeriod: renderData.customerProtectionPeriod,
          activePercent: renderData.activePercent,
          passivePercent: renderData.passivePercent,
        });
      }, 100);
    }
  }, []);

  const filter = (inputValue: string, path: any[]) => {
    return path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
  };
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title={renderData.types == 'edit' ? '编辑项目有效期配置' : '添加项目有效期配置'}
      formRef={formRef}
      visible={modalVisible}
      width={600}
      autoFocusFirstInput
      modalProps={{
        onCancel: () => setModalVisible(),
        destroyOnClose: true,
        style: { maxHeight: '80vh' },
        bodyStyle: {
          maxHeight: '60vh',
          overflowY: 'auto',
          padding: '24px',
        },
      }}
      onFinish={async (values: any) => {
        console.log(values, 'values');

        if (renderData.types == 'edit') values.id = renderData.id;
        request
          .post(url, values)
          .then((res: any) => {
            if (res.status == 'success') {
              message.success('操作成功');
              setModalVisible();
              callbackRef();
            }
            return true;
          })
          .catch((err: any) => {
            return true;
          });
      }}
    >
      <ProFormSelect
        width="md"
        name="project"
        placeholder="请选择项目名称"
        label="项目名称"
        rules={[{ required: true, message: '请选择项目名称' }]}
        fieldProps={{
          options:
            Dictionaries.getList('dict_reg_job')?.map((item: any) => ({
              label: item.label,
              value: item.value,
            })) || [],
          showSearch: true,
          filterOption: (input: string, option: any) => option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0,
        }}
      />

      <ProFormDigit
        width="md"
        label="资源有效保护期"
        name="clueValidityPeriod"
        rules={[{ required: true, message: '请输入资源有效保护期' }]}
        min={0}
        fieldProps={{
          placeholder: '请输入天数',
          addonAfter: '天',
        }}
      />

      <ProFormDigit
        width="md"
        label="首单保护期"
        name="firstOrderProtectionPeriod"
        rules={[{ required: true, message: '请输入首单保护期' }]}
        min={0}
        fieldProps={{
          placeholder: '请输入天数',
          addonAfter: '天',
        }}
      />

      <ProFormDigit
        width="md"
        label="流入分公司公海流转保护期"
        name="unclaimedTransferTime"
        rules={[{ required: true, message: '请输入流入分公司公海流转保护期' }]}
        min={0}
        fieldProps={{
          placeholder: '请输入天数',
          addonAfter: '天',
        }}
      />

      <ProFormDigit
        width="md"
        label="流入平台公海流转保护期"
        name="unclaimedDegradationTime"
        rules={[{ required: true, message: '请输入流入平台公海流转保护期' }]}
        min={0}
        fieldProps={{
          placeholder: '请输入天数',
          addonAfter: '天',
        }}
      />

      <ProFormDigit
        width="md"
        label="未跟进流转时间"
        name="unfollowedTransferTime"
        rules={[{ required: true, message: '请输入未跟进流转时间' }]}
        min={0}
        fieldProps={{
          placeholder: '请输入天数',
          addonAfter: '天',
        }}
      />

      <ProFormDigit
        width="md"
        label="成交客户保护期"
        name="customerProtectionPeriod"
        rules={[{ required: true, message: '请输入成交客户保护期' }]}
        min={0}
        fieldProps={{
          placeholder: '请输入天数',
          addonAfter: '天',
        }}
      />

      <ProFormDigit
        width="md"
        label="主动共享分配比例"
        name="activePercent"
        rules={[{ required: true, message: '请输入主动共享分配比例' }]}
        min={0}
        max={100}
        fieldProps={{
          placeholder: '请输入百分比',
          addonAfter: '%',
        }}
      />

      <ProFormDigit
        width="md"
        label="被动共享分配比例"
        name="passivePercent"
        rules={[{ required: true, message: '请输入被动共享分配比例' }]}
        min={0}
        max={100}
        fieldProps={{
          placeholder: '请输入百分比',
          addonAfter: '%',
        }}
      />
    </ModalForm>
  );
};
