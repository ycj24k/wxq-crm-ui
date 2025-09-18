import { useEffect, useRef, useState } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import requestApi from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import Tables from '@/components/Tables';
import filter from '@/services/util/filter';
import type { ProFormInstance } from '@ant-design/pro-form';
type GithubIssueItem = {
  name: string;
  days: number;
  id: number;
  type: string | number;
  createTime: any;
  project: string;
  agentId: string;
  productId: string;
  subjectId: string;
};
export default (props: any) => {
  const {
    type
  } = props;

  const actionRef = useRef<ActionType>();
  //存储小程序列表
  const [SmallProgram, setSmallProgram] = useState<any>([]);
  const [Subjectlist, setSubjectList] = useState<any>([]);
  const [Questionlist, setQuestionList] = useState<any>([]);
  const [Course, setCourselist] = useState<any>([]);
  const [productType, setProroductType] = useState<string>('01')
  const [columns, setColumns] = useState<ProColumns<GithubIssueItem>[]>([]);
  const url = '/sms/business/bizQuestionAccreditLog';
  const formRef = useRef<ProFormInstance>();
  useEffect(() => {
    callbackRef();
  }, [type]);
  useEffect(() => {
    setColumns([...columns.filter((item: any) => item.dataIndex != 'productId'),{
      title: '题库/课程',
      dataIndex: 'productId',
      key: 'productId',
      //search: true,
      align: 'center',
      valueType: 'cascader',
      fieldProps: {
        showSearch: true,
        filterTreeNode: (input: string, option: any) =>
          option.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
      },
      request: async () => {
        try {
          if (productType === '01') {
            try {
              if (Questionlist && Questionlist.length > 0) {
                return Questionlist;
              } else {
                const data = await getQuestionBankList();
                return data || [];
              }
            } catch (error) {
              return [];
            }
          }

          if (productType === '02') {
            try {
              if (Course && Course.length > 0) {
                return Course;
              } else {
                const data = await getCourselist();
                return data || [];
              }
            } catch (error) {
              return [];
            }
          }
          return [];
        } catch (error) {
          return [];
        }
      },
      dependencies: ['type'], // 依赖于表单中的type字段
      render: (text, record) => {
        if (record.type == '02') {
          return Dictionaries.getNameById(Course, record.productId)
        }
        if (record.type == '01') {
          return Dictionaries.findAncestorsName(record.productId, Questionlist)
        }
        return '无'
      }
    },])
  }, [productType]);

  useEffect(() => {
    (async function init() {
      const SmallProgram = (await getSmallProgram())
      const Subjectlist = (await getSubjectlist())
      const Questionlist = (await getQuestionBankList())
      const Course = (await getCourselist())

      setColumns([
        {
          title: '小程序名称',
          dataIndex: 'agentId',
          align: 'center',
          key: 'agentId',
          valueType: 'select',
          request: async () => SmallProgram
        },
        {
          title: '授权天数',
          dataIndex: 'days',
          key: 'days',
          render: (text, record) => <span>{'' + record.days + '天'}</span>,
        },
        {
          title: '类型',
          dataIndex: 'type',
          key: 'type',
          valueType: 'select',
          valueEnum: {
            '02': '题库',
            '03': '课程',
          },
          fieldProps: {
            onChange: (value: string) => {
              // 更新productType状态
              setProroductType(value);
            }
          }
        },

        {
          title: '题库/课程',
          dataIndex: 'productId',
          key: 'productId',
          //search: true,
          align: 'center',
          valueType: 'cascader',
          fieldProps: {
            showSearch: true,
            filterTreeNode: (input: string, option: any) =>
              option.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
          },
          request: async () => {
            try {
              if (productType === '01') {
                try {
                  if (Questionlist && Questionlist.length > 0) {
                    return Questionlist;
                  } else {
                    const data = await getQuestionBankList();
                    return data || [];
                  }
                } catch (error) {
                  return [];
                }
              }

              if (productType === '02') {
                try {
                  // 直接使用已经存储的课程数据，如果没有则重新获取
                  if (Course && Course.length > 0) {
                    return Course;
                  } else {
                    const data = await getCourselist();
                    return data || [];
                  }
                } catch (error) {
                  return [];
                }
              }
              return [];
            } catch (error) {
              return [];
            }
          },
          dependencies: ['type'], // 依赖于表单中的type字段
          render: (text, record) => {
            if (record.type == '02') {
              return Dictionaries.getNameById(Course, record.productId)
            }
            if (record.type == '01') {
              return Dictionaries.findAncestorsName(record.productId, Questionlist)
            }
            return '无'
          }
        },
        {
          title: '科目',
          dataIndex: 'subjectId',
          key: 'subjectId',
          sorter: true,
          valueType: 'select',
          request: async () => Subjectlist,
          // render:(text, record) => {
          //   return Dictionaries.getNameBySubjectName(Subjectlist,record.subjectId)
          // }
        },
        {
          title: '项目总称',
          dataIndex: 'parentProjects',
          key: 'parentProjects',
          // sorter: true,
          valueType: 'select',
          fieldProps: {
            options: Dictionaries.getList('dict_reg_job'),
            mode: 'tags',
          },
          width: 180,
          render: (text, record) => (
            <span key="parentProjects">
              {Dictionaries.getCascaderAllName('dict_reg_job', record.project)}
            </span>
          ),
        },
        {
          title: '咨询岗位',
          dataIndex: 'project-in',
          // search: false,
          // sorter: true,
          key: 'project-in',
          valueType: 'select',
          fieldProps: {
            options: Dictionaries.getCascader('dict_reg_job'),
            showSearch: { filter },
            mode: 'tags',
          },
          render: (text, record) => (
            <span>{Dictionaries.getCascaderName('dict_reg_job', record.project)}</span>
          ),
        },
        {
          title: '创建时间',
          key: 'createTime',
          dataIndex: 'createTime',
          valueType: 'dateRange',
          sorter: true,
          render: (text, record) => (
            <span>{record.createTime}</span>
          ),
        },
        {
          title: '联系电话',
          key: 'mobile',
          dataIndex: 'mobile',
          sorter: true,
        },
        {
          title: '订单编号',
          key: 'orderNum',
          dataIndex: 'orderNum',
          sorter: true,
        }
      ]);
    })()
  }, [])

  //获取小程序
  const getSmallProgram = async () => {
    const res = await requestApi.get('/sms/business/bizQuestionAccredit/getAgentList');
    if (res && res.data) {
      const newArr = res.data.map((item: any) => {
        return {
          ...item,
          label: item.name,
          value: item.id
        }
      })
      setSmallProgram(newArr)
      return newArr;
    }
    return [];
  }
  //获取科目
  const getSubjectlist = async () => {
    const res = await requestApi.get('/sms/business/bizQuestionAccredit/getCourseSubjectList/0/0');
    if (res && res.data) {
      const newArr1 = res.data.map((item: any) => {
        return {
          ...item,
          label: item.subjectName,
          value: item.id
        }
      })
      setSubjectList(newArr1)
      return newArr1;
    }
    return [];
  }
  //获取题库列表
  const getQuestionBankList = async () => {
    const res = await requestApi.get('/sms/business/bizQuestionAccredit/getSubjectTreeList/0')
    if (res && res.data) {
      const newArr1 = Dictionaries.addLabelToChildren(res.data);
      setQuestionList(newArr1)
      return newArr1;
    }
    return [];
  }
  //获取课程列表
  const getCourselist = async () => {
    const res = await requestApi.get('/sms/business/bizQuestionAccredit/getCourseList/0');
    if (res && res.data) {
      const newArr1 = res.data.map((item: any) => {
        return {
          ...item,
          label: item.title,
          value: item.id
        }
      })
      setCourselist(newArr1)
      return newArr1;
    }
    return [];
  }


  const callbackRef = () => {
    actionRef?.current?.reload();
    // @ts-ignore
    actionRef?.current?.clearSelected();
  };
  const highlightRow = (record: { provider: any; userId: any; }) => {
    // 判断是否为目标行，这里以 id 为 2 的行为例
    if (record.provider != record.userId) {
      return 'highlight-row'; // 返回自定义的样式类名
    }
    return ''; // 返回空字符串
  };
  // 添加强制刷新样式
  const forceRefreshStyle = `
    .force-refresh {
      animation: refresh 0.1s;
    }
    @keyframes refresh {
      0% { opacity: 0.99; }
      100% { opacity: 1; }
    }
  `;

  return (
    <>
      <style>{forceRefreshStyle}</style>
      <Tables
        columns={columns}
        className="student"
        actionRef={actionRef}
        formRef={formRef}
        cardBordered
        scroll={{ x: 1500 }}
        search={{
          labelWidth: 120,
          defaultCollapsed: false,
        }}
        rowClassName={highlightRow}
        toolbar={toolbar}
        request={{ url: url }}
      />

    </>
  );
};