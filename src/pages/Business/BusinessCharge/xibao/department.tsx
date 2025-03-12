import React, { useEffect, useRef, useState } from 'react';
import { Button, DatePicker, message, Modal, Spin, Switch } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import Tables from '@/components/Tables';
import request from '@/services/ant-design-pro/apiRequest';
import { ActionType, ProColumns } from '@ant-design/pro-table';
import { EditOutlined } from '@ant-design/icons';
import moment from 'moment';
import TableContentFn from '@/services/util/TableContentFn';
import ProCard from '@ant-design/pro-card';
import { getFirstAndLastDayOfMonth } from '../../../Department/AchievementUser/getTime'
type GithubIssueItem = {
  name: string;
  id: number;
  description: string;
  isDel?: number;
  code: string;
  isSend?: boolean;
};
export default (props: any) => {
  const actionRefClass = useRef<ActionType>();
  const { RangePicker } = DatePicker;

  const { modalVisible, setModalVisible, callbackRef, renderData } = props;
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [TableContent, setTableContent] = useState<any>([]);
  const [spping, setSpping] = useState<any>(false);
  const [searchTime, SetSearchTime] = useState<any>([]);
  const callbackRefs = () => {
    // @ts-ignore
    TableContentFn('admin');
  };
  useEffect(() => {
    setSpping(true);
    getTable();
  }, []);

  const getTable = async () => {
    let vStartDate = searchTime[0]
    let vEndDate = searchTime[1]
    const list = await TableContentFn('admin', vStartDate, vEndDate);
    console.log('list', list);

    setTableContent(list);
    setSpping(false);
  };
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: '部门名称',
      dataIndex: 'name',
      sorter: true,
      readonly: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      search: false,
      sorter: true,
      readonly: true,
    },
    {
      title: '今日业绩',
      dataIndex: 'chargeTargetDay',
      sorter: true,
      search: false,
      readonly: true,
    },
    {
      title: '本月业绩',
      dataIndex: 'chargeMonth',
      sorter: true,
      search: false,
      readonly: true,
    },
    {
      title: '每日目标',
      dataIndex: 'chargeTarget',
      sorter: true,
    },
    {
      title: '本月保底目标',
      dataIndex: 'bottomTarget',
      sorter: true,
      search: false,
    },
    {
      title: '本月次级目标',
      dataIndex: 'secondaryTarget',
      sorter: true,
      search: false,
    },
    {
      title: '本月冲刺目标',
      dataIndex: 'sprintTarget',
      sorter: true,
      search: false,
    },
    {
      title: '本月挑战目标',
      dataIndex: 'challengeTarget',
      sorter: true,
      search: false,
    },
    {
      title: '是否发送',
      dataIndex: 'isSend',
      search: false,
      readonly: true,
      render: (text, record) => (
        <Switch
          checked={record.isSend}
          onChange={(checked) => {
            console.log(checked);
            request
              .post('/sms/system/sysDepartment', {
                isSend: checked,
                id: record.id,
              })
              .then((res) => {
                if (res.status == 'success') {
                  message.success('操作成功');
                }
                callbackRefs();
              });
          }}
        />
      ),
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      valueType: 'option',
      render: (text, record, _, action) => (
        <>
          <Button
            key="editable"
            type="primary"
            size="small"
            icon={<EditOutlined />}
            className="tablebut"
            onClick={() => {
              action?.startEditable?.(record.id);
              // setRenderData({ ...record, type: 'order', orderNumber: 0 });
              // if (record.studentType == 0) {
              //   setOrderVisible(true);
              // } else {
              //   setCOrderVisible(true);
              // }
            }}
          >
            编辑
          </Button>
        </>
      ),
    },
  ];
  let sortList = {
    // chargeTarget: 'desc',
  };
  const getType = (type: string) => {
    let typeName = 2
    switch (type) {
      case 'chargeTarget':
        typeName = 2
        break
      case 'bottomTarget':
        typeName = 3
        break
      case 'secondaryTarget':
        typeName = 4
        break
      case 'sprintTarget':
        typeName = 5
        break
      case 'challengeTarget':
        typeName = 6
        break
    }
    return typeName
  }
  return (
    <Modal
      title="设置部门目标"
      width={1200}
      open={modalVisible}
      onOk={() => setModalVisible()}
      onCancel={() => setModalVisible()}
    >
      <Spin spinning={spping}>
        <ProCard
          title='按时间搜索'
        >
          <RangePicker onChange={(e, s) => {
            SetSearchTime(s)
          }} />
          <Button type='primary' onClick={() => getTable()}>搜索</Button>
        </ProCard>
        <Tables
          columns={columns}
          actionRef={actionRefClass}
          dataSource={TableContent}
          // request={{
          //   url: '/sms/system/sysDepartment',
          //   params: { _isGetAll: true },
          //   sortList: sortList,
          // }}
          editable={{
            type: 'multiple',
            editableKeys,
            onSave: async (rowKey: any, data: any, row: any) => {
              const arr = [
                'chargeTarget',
                'bottomTarget',
                'secondaryTarget',
                'sprintTarget',
                'challengeTarget',
              ];
              const arrId = [
                'chargeTargetId',
                'bottomTargetId',
                'secondaryTargetId',
                'sprintTargetId',
                'challengeTargetId',
              ];
              let dataObj = {};
              let arrs: { count: any; type: number; departmentId: any; startTime: string; endTime: string; id?: number }[] = []
              const time = getFirstAndLastDayOfMonth()
              Object.keys(data).forEach((key) => {
                if (arr.indexOf(key) >= 0) {
                  if (data[key + 'Id']) {
                    if (arr.indexOf(key) >= 0) {
                      arrs.push({
                        count: data[key] ? data[key] : 0,
                        type: getType(key),
                        departmentId: data.id,
                        startTime: time.firstDay,
                        endTime: time.lastDay,
                        id: data[key + 'Id']
                      })
                    }
                  } else {
                    arrs.push({
                      count: data[key] ? data[key] : 0,
                      type: getType(key),
                      departmentId: data.id,
                      startTime: time.firstDay,
                      endTime: time.lastDay,
                    })
                  }

                }

              });

              request
                .postAll('/sms/business/bizTarget/department', arrs)
                .then((res) => {
                  if (res.status == 'success') {
                    message.success('操作成功');
                  }
                });
              setTimeout(() => {
                callbackRefs();
              }, 100);
            },
            onChange: setEditableRowKeys,
          }}
        />
      </Spin>
    </Modal >
  );
};
