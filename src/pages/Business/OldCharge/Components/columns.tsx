import type { ProColumns } from '@ant-design/pro-table';
import { Tag } from 'antd';
import moment from 'moment';
import Dictionaries from '@/services/util/dictionaries';
import filter from '@/services/util/filter';
type GithubIssueItem = {
  createTime: string;
  project: string;
  method: string;
  confirm: boolean;
};
export default (type: any) => {
  let columns: ProColumns<GithubIssueItem>[] = [];
  switch (type) {
    case '2':
      columns = [
        {
          title: '缴费编号',
          dataIndex: 'num',
          width: 130,
          fixed: 'left',
          sorter: true,
        },
        {
          title: '学员',
          dataIndex: 'studentName',
          width: 80,
          // search: false,
          fixed: 'left',
          sorter: true,
        },
        {
          title: '收费日期',
          key: 'chargeTime',
          sorter: true,
          width: 120,
          dataIndex: 'chargeTime',
          valueType: 'dateRange',
          render: (text, record) => <span key={`createTime-${record.id}`}>{record.createTime}</span>,
        },
        {
          title: '到账日期',
          key: 'paymentTime',
          sorter: true,
          width: 120,
          dataIndex: 'paymentTime',
          valueType: 'dateRange',
          render: (text, record) => (
            <span>{record.createTime}</span>
          ),
        },

        {
          title: '项目总称',
          dataIndex: 'parentProjects',
          key: 'parentProjects',
          // sorter: true,
          valueType: 'cascader',
          fieldProps: {
            options: Dictionaries.getList('dict_reg_job'),
            showSearch: { filter },
          },
          width: 150,
          render: (text, record) => (
            <span key="parentProjects">
              {Dictionaries.getCascaderAllName('dict_reg_job', record.project)}
            </span>
          ),
        },
        {
          title: '收费项目',
          dataIndex: 'project',
          width: 150,
          // search: false,
          key: 'project',
          sorter: true,
          valueType: 'cascader',
          fieldProps: {
            options: Dictionaries.getCascader('dict_reg_job'),
            showSearch: { filter },
          },
          render: (text, record) => (
            <span>
              {record.project &&
                [...new Set(record.project.split(','))].map((item: any, index: number) => {
                  return (
                    <span key={`project-${item}-${index}`}>
                      {Dictionaries.getCascaderName('dict_reg_job', item)} <br />
                    </span>
                  );
                })}
            </span>
          ),
        },
        {
          title: '收费金额',
          dataIndex: 'amount',
          sorter: true,
          width: 80,
          search: false,
        },
        {
          title: '优惠金额',
          sorter: true,
          width: 80,
          dataIndex: 'discount',
          search: false,
        },
        {
          title: '收费方式',
          dataIndex: 'method',
          width: 80,
          valueType: 'select',
          valueEnum: Dictionaries.getSearch('dict_stu_refund_type'),
          render: (text, record) => (
            <span>{Dictionaries.getCascaderName('dict_stu_refund_type', record.method)}</span>
          ),
        },
        {
          title: '备注',
          dataIndex: 'description',
          search: false,
          ellipsis: true,
          width: 150,
          tip: '备注过长会自动收缩',
        },
        {
          title: '财务摘要',
          width: 150,
          dataIndex: 'description2',
          search: false,
          ellipsis: true,
          tip: '备注过长会自动收缩',
        },
        {
          title: '收费人',
          dataIndex: 'userName',
          width: 80,
          // search: false,
        },
        {
          title: '发票信息',
          width: 80,
          sorter: true,
          dataIndex: 'hasInvoice',
        },

        {
          title: '审核建议',
          dataIndex: 'remark',
          width: 150,
          search: false,
          ellipsis: true,
          sorter: true,
          tip: '建议过长会自动收缩',
        },

        {
          title: '审核状态',
          dataIndex: 'confirm',
          width: 100,
          sorter: true,
          filters: true,
          filterMultiple: false,
          // onFilter: true,
          valueType: 'select',
          formItemProps: {
            rules: [
              {
                required: true,
                message: '此项为必填项',
              },
            ],
          },
          valueEnum: {
            '': {
              text: <Tag color="#f50">未审核</Tag>,
              status: 'Processing',
            },
            false: {
              text: <Tag color="#FF0000">未通过</Tag>,
              status: 'Error',
            },
            true: {
              text: <Tag color="#87d068">已审核</Tag>,
              status: 'Success',
            },
          },

          render: (text, record) => (
            <Tag
              color={
                record.confirm === true ? '#87d068' : record.confirm === false ? '#FF0000' : '#f50'
              }
            >
              {record.confirm === true
                ? '审核通过'
                : record.confirm === false
                  ? '未通过'
                  : '未审核'}
            </Tag>
          ),
        },
        {
          title: '是否废除',
          dataIndex: 'enable',
          filters: true,
          hideInTable: true,
          sorter: true,
          filterMultiple: false,
          // onFilter: true,
          valueType: 'select',
          valueEnum: {
            false: {
              text: '已废除',
              status: 'Error',
            },
            true: {
              text: '未废除',
              status: 'Success',
            },
          },
        },
        {
          title: '审核员',
          dataIndex: 'auditor',
          search: false,
          sorter: true,
        },
        {
          title: '操作',
          valueType: 'option',
          key: 'option',
          fixed: 'right',
          width: 120,
          // hideInTable: !admin,
        },
      ];
  }
  return columns;
};
