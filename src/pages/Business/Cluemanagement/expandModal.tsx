import type {
  ProFormInstance} from '@ant-design/pro-form';
import ProForm, {
  ModalForm,
  ProFormList,
  ProFormSelect,
  ProFormText
} from '@ant-design/pro-form';
// import { message, Upload, Image } from 'antd';
import request from '@/services/ant-design-pro/apiRequest';
import { useEffect, useRef, useState } from 'react';
import { CloseCircleOutlined, SmileOutlined } from '@ant-design/icons';
import { message } from 'antd';
export default (props: any) => {
  const { visible, setVisible } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const actionRef = useRef<any>();
  const formRef = useRef<ProFormInstance>();

  const loadExpandFields = async () => {
    try {
      setLoading(true);
      const res: any = await request.post('/sms/lead/ladRule/getExpandField');
      const result = (res?.data || []).map((item: any) => ({
        ...item,
        operationType: String(item.operationType || '')?.split(',').filter((v: string) => v !== ''),
      }));
      // 将拉取的数据写入表单
      formRef.current?.setFieldsValue({ labels: result });
    } catch (e) {
      message.error('获取拓展信息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadExpandFields();
    }
  }, [visible])
//   const submitok = (values: any) => {
//     return new Promise((resolve) => {
//       request
//         .postAll('/sms/contract/conParameter/saveArray', { array: values.labels })
//         .then((res: any) => {
//           if (res.status == 'success') {
//             message.success('操作成功!');
//             resolve(true);
//           }
//         })
//         .catch((err: any) => {
//           resolve(true);
//         });
//     });
//   };
  return (
    <ModalForm
      width={800}
      formRef={formRef}
      submitter={{
        searchConfig: { submitText: '保存', resetText: '重置' },
      }}
      onFinish={async (values) => {
        try {
          const changeValues = (values.labels || []).map((item: any) => ({
            field: item.field,
            name: item.field, // 与接口示例一致
            operationType: Array.isArray(item.operationType) ? item.operationType.join(',') : String(item.operationType || ''),
          }));
          const res: any = await request.postAll('/sms/lead/ladRule/expandField', changeValues);
          if (res.status === 'success') {
            message.success('保存成功');
            setVisible(false);
          } else {
            message.error(res.msg || '保存失败');
          }
        } catch (e) {
          message.error('保存失败');
        }
      }}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {
            setVisible();
        },
        maskClosable: false,
      }}
      visible={visible}
      loading={loading}
    >
      <ProFormList
        actionRef={actionRef}
        name="labels"
        label="配置拓展信息"
        actionGuard={{
        //   beforeRemoveRow: async (params_0: number | number[], params_1: number) => {
        //     return new Promise((resolve) => {
        //       if (renderData.parameter.length >= params_0 && renderData.parameter != false) {
        //         let a = renderData.parameter.splice(params_0, 1);
        //         request.delete('/sms/contract/conParameter', { id: a[0].id }).then((res: any) => {
        //           if (res.status == 'success') {
        //             message.success('删除成功');
        //             resolve(true);
        //           }
        //         });
        //       } else {
        //         resolve(true);
        //       }
        //     });
        //   },
        }}
        initialValue={[]}
        copyIconProps={{ Icon: SmileOutlined, tooltipText: '复制此行到末尾' }}
        deleteIconProps={{
          Icon: CloseCircleOutlined,
          tooltipText: '不需要这行了',
        }}
      >
        <ProForm.Group key="group">
          <ProFormText name="field" label="字段标识" rules={[{ required: true, message: '请输入字段标识' }]} />
          <ProFormSelect
            label="运算类型（可多选）"
            width="md"
            name="operationType"
            options={[
                { label: '等于', value: '0' },
                { label: '不等于', value: '1' },
                { label: '包含', value: '2' },
                { label: '不包含', value: '3' },
                { label: '数字大于', value: '6' },
                { label: '数字小于', value: '7' },
                { label: '正则表达式', value: '8' },
                { label: '日期时间大于', value: '9' },
                { label: '日期时间小于', value: '10' },
                { label: '时间大于', value: '11' },
                { label: '时间小于', value: '12' },
                { label: '在列表', value: '13' },
                { label: '是', value: '14' },
                { label: '否', value: '15' }
            ]}
            fieldProps={{
                mode: 'multiple',
            }}
        />
        </ProForm.Group>
      </ProFormList>
    </ModalForm>
  );
};