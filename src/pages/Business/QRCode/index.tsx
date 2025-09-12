import ProCard from '@ant-design/pro-card';
import type {
  ProFormInstance} from '@ant-design/pro-form';
import ProForm, {
  ModalForm,
  ProFormCascader,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import Dictionaries from '@/services/util/dictionaries';
import filter from '@/services/util/filter';
import { Button, message } from 'antd';
import { useRef, useState } from 'react';
import request from '@/services/ant-design-pro/apiRequest';
import Tables from '@/components/Tables';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import moment from 'moment';
import ImgUrl from '@/services/util/ImgUrl';
import { PlusOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [ModalsVisible, setModalsVisible] = useState<boolean>(false);
  const { initialState } = useModel('@@initialState');
  const [CodeType, setCodeType] = useState(0)
  const [JobClassExamA, setJobClassExamA] = useState([])
  const [JobClass, setJobClass] = useState<any>(false)
  const callbackRef = () => {
    // @ts-ignore
    actionRef.current.reload();
  };
  const submits = (value: Record<string, any>) => {
    if (!value.projectId) {
      message.error('请选择项目');
      return;
    }
    if (value.isInWhiteList === undefined) {
      value.isInWhiteList = false;
    }

    const data: any = {
      p: value.projectId[value.projectId.length - 1],
    };
    data.t = CodeType
    data.u = initialState?.currentUser?.userid
    // data.description = '生成的二维有效期为七天'
    if (JobClass) {
      data.classType = JobClass.classType
      data.examType = JobClass.examType
      data.classYear = JobClass.classYear
      data.receivable = JobClass.receivable
      // data.userId = initialState?.currentUser?.userid
      data.t = '3'
    }
    console.log(data);

    request.post2('/sms/business/bizFile/createWeChatMiniQRCode', { fileName: value.fileName }, data).then((res) => {
      if (res.status == 'success') {
        setModalsVisible(false);
        callbackRef();
      }
    });
  };
  const columns: ProColumns<API.GithubIssueItem>[] = [
    {
      title: '项目二维码',
      dataIndex: 'name',
      sorter: true,
    },
    {
      title: '说明',
      dataIndex: 'description',
      sorter: true,
    },
    {
      title: '上传时间',
      dataIndex: 'updateTime',
      sorter: true,
      valueType: 'dateRange',
      render: (text, record) => (
        <span>{record.updateTime}</span>
      ),
    },
    {
      title: '操作',
      render: (text, record) => [
        <Button
          type="primary"
          style={{ marginRight: '10px' }}
          size="small"
          onClick={() => {
            record.files.split(',').forEach((item, index) => {
              const fileName = record.name + item.slice(item.indexOf('.'));
              ImgUrl('/sms/business/bizFile/download', record.id, item, fileName);
            });
          }}
        >
          下载
        </Button>,
      ],
    },
  ];
  const sortList: any = {
    updateTime: 'desc',
  };
  const toolBarRender = [
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => {
        setCodeType(1)
        setModalsVisible(true);
      }}
    >
      小程序分享二维码
    </Button>,
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => {
        // setRenderData({ eidtType: 'add', type: '2' });
        setCodeType(2)
        setModalsVisible(true);
      }}
    >
      资料收集二维码
    </Button>,
  ];
  const setFileName = () => {
    const data = formRef?.current?.getFieldsValue()
    if (data.JobClassExam) {
      const job = JSON.parse(data.JobClassExam)
      const fileName = Dictionaries.getCascaderName('dict_reg_job', job.project) + '/' + Dictionaries.getName('dict_class_type', job.classType) + '/' + Dictionaries.getName('dict_class_year', job.classYear) + '/' + Dictionaries.getName('dict_exam_type', job.examType)
      formRef?.current?.setFieldValue('fileName', fileName)
    }
  }
  async function onChange(value: any, index?: any, types?: string) {
    if (!value) return;
    const data: any = (
      await request.get(
        '/sms/business/bizChargeStandard?project=' +
        value[value.length - 1] +
        '&useNum=0&_size=999&enable=true',
      )
    ).data.content;
    const arr: any = projectClassExamListFn(data)
    console.log('arr', arr);
    setJobClassExamA(arr)

  }
  function projectClassExamListFn(data: any) {
    const arr: { label: string; value: any }[] = [];
    data.forEach((item: any) => {
      arr.push({
        label:
          Dictionaries.getName('dict_class_type', item.classType) +
          '/' +
          Dictionaries.getName('dict_exam_type', item.examType) +
          '/' +
          Dictionaries.getName('dict_class_year', item.classYear),
        value: JSON.stringify({
          classType: item.classType,
          examType: item.examType,
          classYear: item.classYear,
          receivable: item.receivable,
          project: item.project,
        }),
      });
    });

    return arr;
  }
  return (
    <>
      <PageContainer title="二维码">
        <ProCard>
          <Tables
            actionRef={actionRef}
            columns={columns}
            request={{ url: '/sms/business/bizFile', sortList: sortList, params: { type: 1 } }}
            toolBarRender={toolBarRender}
          />
        </ProCard>
        <ModalForm
          visible={ModalsVisible}
          formRef={formRef}
          modalProps={{
            destroyOnClose: true,
            onCancel: () => setModalsVisible(false),
          }}
          onFinish={async (value) => {
            await submits(value);
          }}
        >
          <ProForm.Group>
            <ProFormText
              name="fileName"
              placeholder="文件名称"
              label="文件名称"
              rules={[{ required: true, message: '文件名称' }]}
            />
            <ProFormCascader
              width="sm"
              name="projectId"
              placeholder="咨询报考岗位"
              label="报考岗位"
              rules={[{ required: true, message: '请选择报考岗位' }]}
              fieldProps={{
                options: Dictionaries.getCascader('dict_reg_job'),
                showSearch: { filter },
                onSearch: (value) => console.log(value),
                onChange: (e: any) => onChange(e, 'change')
              }}
            />
            <ProFormSelect
              label="班型选择"
              name="JobClassExam"
              hidden={CodeType == 1}
              fieldProps={{
                options: JobClassExamA,
                showSearch: true,
                onChange: (e) => {
                },
                onSearch: (e) => {
                },
                filterOption: (input, option: any) => {
                  return option!.children?.props?.label.indexOf(input) >= 0;
                },
                onSelect: (e: string) => {
                  setFileName()
                  setJobClass(JSON.parse(e))
                },
              }}
              width="sm"
            />
            {/* <ProFormSwitch
              label="	是否流转到白名单"
              name="isInWhiteList"
              fieldProps={{
                checkedChildren: '流转',
                unCheckedChildren: '不流转',
                onChange: async (e) => {
                  // CalculationFn(e, index);
                },
              }}
            /> */}
          </ProForm.Group>
        </ModalForm>
      </PageContainer>
    </>
  );
};
