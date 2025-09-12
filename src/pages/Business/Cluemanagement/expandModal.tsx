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
  const [ expandData, setExpandData ] = useState<any>([]);
  const actionRef = useRef<any>();
  const formRef = useRef<ProFormInstance>();

  const getRule = () => {
    request.post('/sms/lead/ladRule/getExpandField').then((res: any) => {
      console.log(res.data,'res------>')
      const result = res.data.map((item: any) => {
        return {
          ...item,
          operationType: item.operationType.split(',')
        }
      })
      console.log(result,'result------>')
      setExpandData(result)
    })
  }

  useEffect(() => {
    getRule()
  },[])
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
      onFinish={async (values) => {
        const changeValues = values.labels.map((item: any) => {
            return {
                ...item,
                name:item.field,
                operationType: item.operationType.join(','),
            }
        })
        request
        .postAll('/sms/lead/ladRule/expandField',changeValues)
        .then((res: any) => {
          if (res.status == 'success') {
            message.success('操作成功!');
          }
        })
        .catch((err: any) => {
          
        });
      }}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {
            setVisible();
        },
        maskClosable: false,
      }}
      visible={visible}
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
        initialValue={expandData}
        copyIconProps={{ Icon: SmileOutlined, tooltipText: '复制此行到末尾' }}
        deleteIconProps={{
          Icon: CloseCircleOutlined,
          tooltipText: '不需要这行了',
        }}
      >
        <ProForm.Group key="group">
          <ProFormText 
            name="field" 
            label="线索信息"  
            rules={[{ required: true, message: '请输入线索信息' }]}
          />
          <ProFormSelect
            label="运算类型"
            width="md"
            name="operationType"
            options={[
                { label: '等于', value: '0' },
                { label: '不等于', value: '1' },
                { label: '包含', value: '2' },
                { label: '不包含', value: '3' },
                { label: '为空', value: '4' },
                { label: '不为空', value: '5' },
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