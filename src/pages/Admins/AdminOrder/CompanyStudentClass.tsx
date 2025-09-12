import React, { useEffect, useRef, useState } from 'react';
import { Modal, message, Popconfirm, Button, Tooltip } from 'antd';
import Student from '../StudentManage/student';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import Dictionaries from '@/services/util/dictionaries';
import request from '@/services/ant-design-pro/apiRequest';
import { DeleteOutlined, DownloadOutlined, EditOutlined } from '@ant-design/icons';
import moment from 'moment';
import Upload from '@/services/util/upload';
interface valueType {
  name: string;
  value: string;
  description: string;
  parentId: number;
  id: number | string;
}

export default (props: any) => {
  const { modalVisible, setModalVisible, callbackRef, renderData } = props;
  const actionRefClass = useRef<ActionType>();
  const [UploadFalg, setUploadVisible] = useState<boolean>(false);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [url, setUrl] = useState<string>('/sms/business/bizOrder/batch/import');
  let objData = {};
  // let url = '/sms/business/bizOrder/batch/import';
  useEffect(() => {
    const arr: string[] = [];
    objData = {
      classType: renderData.order.classType,
      examType: renderData.order.examType,
      classYear: renderData.order.classYear,
      project: renderData.order.project,
      orderId: renderData.order.orderId,
      receivable: renderData.order.receivable,
      // standardId: renderData.standardId,
      quantity: 1,
    };
    Object.keys(objData).forEach((key: string | number) => {
      arr.push(encodeURIComponent(key) + '=' + encodeURIComponent(objData[key]));
    });
    setUrl(url + '?' + arr.join('&'));
  }, []);
  useEffect(() => {
    console.log('editableKeys', editableKeys);
  }, [editableKeys]);
  const callbackRefs = () => {
    // @ts-ignore
    actionRefClass.current.reload();
  };
  const callbackFn = (data: any) => {
    callbackRefs();
  };
  return (
    <Modal
      width={1200}
      // @ts-ignore
      title="子订单学员费用分配"
      onCancel={() => {
        setModalVisible();
      }}
      onOk={() => setModalVisible()}
      visible={modalVisible}
      destroyOnClose
    >
      <ProTable
        // toolBarRender={() => [
        //   <a download="新学员导入模板" href="/template/新学员导入模板.xlsx">
        //     下载导入模板
        //   </a>,
        //   <Button
        //     key="buttons"
        //     icon={<DownloadOutlined />}
        //     type="primary"
        //     onClick={() => {
        //       setUploadVisible(true);
        //     }}
        //   >
        //     批量导入
        //   </Button>,
        // ]}
        columns={[
          {
            title: '学员',
            dataIndex: 'studentName',
            readonly: true,
          },

          {
            title: '班型应收金额',
            dataIndex: 'receivable',
            readonly: true,
          },
          {
            title: '班型人数',
            dataIndex: 'quantity',
            readonly: true,
          },
          // {
          //   title: '平均实际应收',
          //   dataIndex: 'averageReceivable',
          //   readonly: true,
          // },
          // {
          //   title: '平均优惠金额',
          //   dataIndex: 'averageDiscount',
          //   readonly: true,
          // },
          // {
          //   title: '分配金额',
          //   dataIndex: 'amount',
          //   // readonly: true,
          // },
          {
            title: '报考岗位',
            // dataIndex: 'classType',
            search: false,
            readonly: true,
            render: (text, record) => (
              <span>
                {record.project &&
                  [...new Set(record.project.split(','))].map((item: any, index: number) => {
                    return (
                      <span key={`company-student-class-${item}-${index}`}>
                        {Dictionaries.getCascaderName('dict_reg_job', item)} <br />
                      </span>
                    );
                  })}
              </span>
            ),
          },
          {
            title: '班级类型',
            dataIndex: 'classType',
            search: false,
            readonly: true,
            render: (text, record) => (
              <span>{Dictionaries.getName('dict_class_type', record.classType)}</span>
            ),
          },
          {
            title: '班型年限',
            dataIndex: 'classYear',
            search: false,
            readonly: true,
            render: (text, record) => (
              <span>{Dictionaries.getName('dict_class_year', record.classYear)}</span>
            ),
          },
          {
            title: '考试类型',
            dataIndex: 'examType',
            readonly: true,
            search: false,
            render: (text, record) => (
              <span>{Dictionaries.getName('dict_exam_type', record.examType)}</span>
            ),
          },
          {
            title: '创建时间',
            key: 'createTime',
            sorter: true,
            dataIndex: 'createTime',
            valueType: 'dateRange',
            render: (text, record) => (
              <span>{record.createTime}</span>
            ),
          },
          // {
          //   title: '操作',
          //   dataIndex: 'operation',
          //   key: 'operation',
          //   valueType: 'option',
          //   render: (text, record, _, action) => (
          //     <>
          //       <Tooltip placement="topLeft" title={'分配金额'}>
          //         <Button
          //           key="editable"
          //           type="primary"
          //           size="small"
          //           icon={<EditOutlined />}
          //           className="tablebut"
          //           onClick={() => {
          //             action?.startEditable?.(record.id);
          //             // setRenderData({ ...record, type: 'order', orderNumber: 0 });
          //             // if (record.studentType == 0) {
          //             //   setOrderVisible(true);
          //             // } else {
          //             //   setCOrderVisible(true);
          //             // }
          //           }}
          //         >
          //           {/* 编辑 */}
          //         </Button>
          //       </Tooltip>
          //       <Popconfirm
          //         key="delete"
          //         title="是否确定删除？"
          //         onConfirm={() => {
          //           request.delete('/sms/business/bizOrder', { id: record.id }).then((res: any) => {
          //             if (res.status == 'success') {
          //               message.success('删除成功');
          //               callbackRefs();
          //             }
          //           });
          //         }}
          //         okText="删除"
          //         cancelText="取消"
          //       >
          //         <Button key="delete" size="small" type="primary" danger icon={<DeleteOutlined />}>
          //           {/* 删除 */}
          //         </Button>
          //       </Popconfirm>
          //     </>
          //   ),
          // },
        ]}
        search={false}
        cardBordered
        rowKey="id"
        actionRef={actionRefClass}
        editable={{
          type: 'multiple',
          editableKeys,
          onSave: async (rowKey, data, row) => {
            const array = [
              {
                amount: data.amount,
                id: data.id,
              },
            ];
            console.log(data);
            if (data.amount > data.averageReceivable) {
              // setEditableRowKeys(editableKeys);
              message.error('分配金额不得大于实际应收金额');
              callbackRefs();
              return false;
            }
            request.postAll('/sms/business/bizOrder/saveArray', {
              array: array,
            });
            // await waitTime(2000);
            setTimeout(() => {
              callbackRefs();
            }, 500);
          },
          onChange: setEditableRowKeys,
        }}
        request={async (params: any = {}, sort, filter) => {
          params.parentId = renderData.id;
          // params.standardId = renderData.standardId;
          // params.classType = renderData.order.classType;
          // params.examType = renderData.order.examType;
          // params.classYear = renderData.order.classYear;
          // params.project = renderData.order.project;
          // params.receivable = renderData.order.receivable;
          ///sms/business/bizOrder
          const dataList: any = await request.get('/sms/business/bizOrder', {
            ...params,
          });
          return {
            data: dataList.data.content,
            success: dataList.success,
            total: dataList.data.totalElements,
          };
        }}
       />
      {UploadFalg && (
        <Upload
          setModalVisible={() => setUploadVisible(false)}
          modalVisible={UploadFalg}
          url={url}
          type="student"
          propsData={{ resourceType: 0, parentId: renderData.studentId }}
          callbackRef={() => callbackRefs()}
          callbackFn={(e: any) => callbackFn(e)}
        />
      )}
    </Modal>
  );
};
