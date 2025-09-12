import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Button, Descriptions, message, Image, Tag, Upload, Row, Switch, Modal, Drawer } from 'antd';
import type { ProFormInstance} from '@ant-design/pro-form';
import { ProFormDatePicker, ProFormSwitch } from '@ant-design/pro-form';
import ProForm, {
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
  ProFormDateTimePicker,
  ProFormSelect,
  ProFormUploadDragger,
  ProFormCascader,
} from '@ant-design/pro-form';
import moment from 'moment';
import Dictionaries from '@/services/util/dictionaries';
import request from '@/services/ant-design-pro/apiRequest';
import ImgUrl from '@/services/util/UpDownload';
import Tables from '@/components/Tables';
import UserManageCard from '../Department/UserManageCard';
import { useModel } from 'umi';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import ProFormUser from '@/components/ProFormUser';
import CompanyOrder from '../AdminOrder/companyOrder';
import UserTreeSelect from '@/components/ProFormUser/UserTreeSelect';
import Invoice from '@/pages/Business/Invoice/Invoice';
import Audit from './Audit';
let content: any = null;
export default (props: any) => {
  const {
    modalVisible,
    setModalVisible,
    callbackRef,
    renderData,
    callback,
    admin,
    isEdit,
    setPreviewImage,
    setPreviewVisible,
  } = props;
  console.log(renderData,'renderData======')
  // const url = '/sms/business/bizCharge/edit';
  const { initialState } = useModel('@@initialState');
  const [falg, setFalg] = useState<boolean>(false);
  const [order, setorder] = useState<any>(false);
  const [imgSrc, setImgSrc] = useState();
  const [isModalVisibles, setisModalVisibles] = useState<boolean>(false);
  const [CardVisible, setCardVisible] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openType, setOpenType] = useState<string>('edit');
  const [CorderVisibleFalg, setCOrderVisible] = useState<boolean>(false);
  const [CardContent, setCardContent] = useState<any>();
  const [amounts, setAmounts] = useState<any>({ amount: 0, discount: 0 });
  const [switchLoding, setSwitchLoding] = useState<boolean>(false);
  const [userNameId, setUserNameId] = useState<any>();
  const [invoiceVisible, setInvoiceVisible] = useState<boolean>(false);
  const [AuditVisibleFalg, setAuditVisible] = useState<boolean>(false);
  const [auditData, setAuditData] = useState<any>({});
  const userRef: any = useRef(null);
  const childRef = useRef();
  const actionRefs = useRef<ActionType>();
  const CompanyOrders = forwardRef(CompanyOrder);
  const [servedOrderIds, setservedOrderIds] = useState<any>(
    renderData.servedOrderIds?.split(',').map((item: string) => {
      return Number(item);
    }),
  );
  const [servedOrderTable, setservedOrderTable] = useState<any>([]);
  const [department, setDepartment] = useState<any>({
    name: initialState?.currentUser?.name,
    id: initialState?.currentUser?.userid,
  });
  const ment = () => {
    formRef?.current?.setFieldsValue({
      agent: department.name,
    });
  };
  useEffect(() => {
    ment();
  }, [department]);
  const tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
  const tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
  const obj = {};
  obj[tokenName] = tokenValue;
  const orderTitle = renderData.type == '1' ? '退费' : '收费';
  const orderAmountTitle = renderData.type == '1' ? '（-）' : '（+）';
  const formRef = useRef<ProFormInstance>();
  const getOrder = () => {
    request.get('/sms/business/bizOrder', { id: renderData.orderId }).then((res: any) => {
      setorder(res.data.content[0]);
      actionRefs?.current?.reload();
    });
  };
  useEffect(() => {
    setAmounts({ amount: renderData.amount, discount: renderData.discount });
    getOrder();
    if (renderData.type == '1') {
      const data: { parentId?: string; id?: string } = {};
      renderData.studentType == 1
        ? (data.parentId = renderData.orderId)
        : (data.id = renderData.orderId);
      request.get('/sms/business/bizOrder/registration', data).then((res) => {
        setservedOrderTable(res.data.content);
      });
    }
    if (renderData.types == 'eidt') {
      setTimeout(() => {
        const Data = renderData;
        const arr: { uid: number; name: any; response: { data: any } }[] = [];
        if (renderData.files) {
          renderData.files.split(',').forEach((item: any, index: number) => {
            arr.push({
              uid: index + 1,
              name: item,
              response: { data: item },
            });
          });
        }
        // delete Data.files;
        // delete Data.type;
        Data.type = Data.type + '';
        Data.refundType = Data.refundType + '';
        Data.agent = renderData.agentName;
        userRef?.current?.setDepartment({
          id: renderData.userId,
          name: renderData.userName,
        });
        setUserNameId({ name: renderData.userName, id: renderData.userId });

        formRef?.current?.setFieldsValue({
          ...Data,
          method: renderData.method.toString(),
          files: arr,
        });
      }, 100);
    }
    setDepartment({ name: renderData.agentName, id: renderData.agent });
    formRef?.current?.setFieldsValue({
      chargeTime: moment().format('YYYY-MM-DD'),
    });
  }, []);
  const columns: ProColumns<any>[] = [
    {
      title: '学员',
      dataIndex: 'studentName',
      sorter: true,
      // width: 100,
      // search: false,
    },
    {
      title: '所属团组',
      dataIndex: 'studentParentName',
      sorter: true,
      // width: 100,
      // search: false,
      render: (text, record) => (
        <>
          <span> {record.studentParentName}</span>
        </>
      ),
    },
    {
      title: '报考班型',
      dataIndex: 'classType',
      sorter: true,
      valueEnum: Dictionaries.getSearch('dict_class_type'),
      render: (text, record) => <>{Dictionaries.getName('dict_class_type', record.classType)}</>,
    },
    {
      title: '班型年限',
      sorter: true,
      dataIndex: 'classYear',
      valueEnum: Dictionaries.getSearch('dict_class_year'),
      render: (text, record) => <>{Dictionaries.getName('dict_class_year', record.classYear)}</>,
    },
    {
      title: '考试类型',
      sorter: true,
      dataIndex: 'examType',
      valueEnum: Dictionaries.getSearch('dict_exam_type'),
      render: (text, record) => <>{Dictionaries.getName('dict_exam_type', record.examType)}</>,
    },
    {
      title: '报考岗位',
      dataIndex: 'project',
      // search: false,
      key: 'project',
      sorter: true,
      valueType: 'cascader',
      fieldProps: {
        options: Dictionaries.getCascader('dict_reg_job'),
      },
      render: (text, record) => (
        <span key="project">
          {record.project &&
            [...new Set(record.project.split(','))].map((item: any, index: number) => {
              return (
                <span key={`charge-order-audit-${item}-${index}`}>
                  {Dictionaries.getCascaderName('dict_reg_job', item)} <br />
                </span>
              );
            })}
        </span>
      ),
    },
  ];
  const look = async (id: any, item: any) => {
    const type = item.slice(item.indexOf('.'));
    await ImgUrl('/sms/business/bizCharge/download', id, item).then((res: any) => {
      setImgSrc(res);
      if (type == '.png' || type == '.jpg' || type == '.jpeg') {
        setisModalVisibles(true);
      } else {
        // console.log("res", res)
        setPreviewImage(res)
        setPreviewVisible(true);
      }
    });
  };
  const filter = (inputValue: string, path: any[]) => {
    return path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
  };
  function onChange(value: any, selectedOptions: any) {
    console.log(value, selectedOptions);
  }
  const submitok = (value: any, types: any) => {
    if (value.files.length > 0) {
      const arr: any[] = [];
      value.files.forEach((item: any) => {
        arr.push(item.response.data);
      });
      value.files = arr.join(',');
    } else {
      delete value.files;
    }

    if (renderData.orderId) {
      // value.orderId = renderData.orderId;
      value.id = renderData.id;
    } else {
      value.orderId = renderData.id;
    }
    console.log('userNameId', userNameId);

    if (renderData.type == '1') {
      value.agent = department.id;
      value.chargeTime = moment(value.chargeTime).format('YYYY-MM-DD HH:mm:ss'),
      value.paymentTime = value.chargeTime;
      value.userId = userNameId.id;
      value.userName = userNameId.name;
      if (servedOrderIds?.length > 0) {
        value.servedOrderIds = servedOrderIds.join(',');
      } else {
        value.servedOrderIds = '';
      }
    } else {
      value.userId = userNameId.id;
      value.userName = userNameId.name;
    }
    value.isSubmit = true
    console.log('valuevalue', value);

    delete value.isCalculation;
    return new Promise((resolve) => {
      // let url = renderData.confirm !== false ? '/sms/business/bizCharge/edit' : '/sms/business/bizCharge';
      let url = ''
      let dataValye = undefined
      let postAll = undefined
      if (types == 'edit') {
        url = '/sms/business/bizCharge/edit'
        dataValye = [value]
        postAll = true
      } else if (types == 'submit') {
        url = '/sms/business/bizCharge'
        dataValye = value
        postAll = false
      } else if (types == 'audit') {
        url = '/sms/business/bizCharge/edit/1'
        dataValye = [value]
        postAll = true
      }
      const callbackFn = (res: { status: string; }, types: string) => {
        if (res.status == 'success' && types == 'edit') {
          message.success('操作成功');
          setModalVisible();
          callbackRef();
          resolve(true);
        } else if (res.status == 'success' && types == 'submit') {
          message.success('操作成功');
          setModalVisible();
          callbackRef();
          resolve(true);
        } else if (res.status == 'success' && types == 'audit') {
          let auditNumber = 0;
          if (renderData.type == 1) {
            auditNumber = renderData.auditNum ? renderData.auditNum + 1 : 1;
          }
          request
            .post(`/sms/business/bizAudit/audit/${auditNumber}`, {
              // auditType: '0',
              confirm: true,
              entityId: renderData.id,
            })
            .then((audit) => {
              if (audit.status == 'success') {
                message.success('操作成功');
                setModalVisible();
                callbackRef();
                resolve(true);
              }
            });
        }
      }
      if (postAll) {
        request.postAll(url, dataValye).then((res) => {
          callbackFn(res, types)
        })
      } else {
        request.post(url, dataValye).then((res) => {
          callbackFn(res, types)
        })
      }
      // request
      //   .post(url, dataValye)
      //   .then((res: any) => {

      //   })
      //   .catch((err: any) => {
      //     resolve(true);
      //   });
    });
  };
  return (
    <ModalForm<{
      name: string;
      company: string;
      id: number;
    }>
      title={orderTitle}
      width={950}
      formRef={formRef}
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {
          setModalVisible();
        },
        maskClosable: false,
        okText: '修改',
      }}
      submitter={{
        render: (props, doms) => {
          return [
            ...doms,
            <Button
              htmlType="button"
              type="primary"
              hidden={!renderData.isSubmit}
              onClick={async () => {
                if (order.arrears - amounts.amount - amounts.discount < 0) {
                  setOpenModal(true);
                  setOpenType('audit');
                  return;
                }
                formRef.current?.validateFieldsReturnFormatValue?.().then(async (values) => {
                  console.log('校验表单并返回格式化后的所有数据：', values);
                  const data = {
                    ...values,
                    chargeTime: moment(values.chargeTime).format('YYYY-MM-DD HH:mm:ss'),
                  };
                  await submitok(data, 'audit');
                });
              }}
              key="edit-charge-order-audit-1"
            >
              修改并审核通过
            </Button>,
            <>
              <Button
                htmlType="button"
                type="dashed"
                hidden={!renderData.isSubmit}
                onClick={async () => {
                  setAuditData({ ...renderData, confirm: false });
                  setAuditVisible(true);
                }}
                key="edit-charge-order-audit-1"
              >
                不通过
              </Button>
              {/* {AuditVisibleFalg && ( */}
              <Audit
                setModalVisible={() => {
                  setAuditVisible(false)
                  setModalVisible()
                }}
                modalVisible={AuditVisibleFalg}
                callbackRef={() => callbackRef()}
                renderData={auditData}
              />
              {/* )} */}
            </>,
            <Button
              htmlType="button"
              type="primary"
              hidden={renderData.isSubmit}
              onClick={async () => {
                if (order.arrears - amounts.amount - amounts.discount < 0) {
                  setOpenModal(true);
                  setOpenType('submit');
                  return;
                }
                formRef.current?.validateFieldsReturnFormatValue?.().then(async (values) => {
                  await submitok(values, 'submit');
                });
              }}
              key="edit-charge-order-audit-2"
            >
              修改并提交
            </Button>,
          ];
        },
      }}
      onFinish={async (values) => {
        if (renderData.type == 1) {
          if (order.charge - amounts.amount < 0) {
            setOpenModal(true);
            setOpenType('edit');
            return;
          }
        } else {
          if (order.arrears - amounts.amount - amounts.discount < 0) {
            setOpenModal(true);
            setOpenType('edit');
            return;
          }
        }

        await submitok(values, 'edit');
        // message.success('提交成功');
      }}
      visible={modalVisible}
    >
      {order && (
        <Descriptions
          title={`订单信息:${order.num ? order.num : ''}`}
          bordered
          size="small"
          style={{ marginBottom: '10px' }}
        >
          <Descriptions.Item label="学员/企业">{order.studentName}</Descriptions.Item>
          <Descriptions.Item label="订单总收费金额">{order.totalReceivable}</Descriptions.Item>
          <Descriptions.Item label="订单实际应收金额">{order.actualReceivable}</Descriptions.Item>
          <Descriptions.Item label="订单已收金额">
            <span style={{ color: 'green' }}>{order.charge}</span>
          </Descriptions.Item>

          <Descriptions.Item label="订单累计优惠金额">{order.discount}</Descriptions.Item>

          <Descriptions.Item label="订单未收金额">
            <span style={{ color: 'red' }}>{order.arrears}</span>
          </Descriptions.Item>
          <Descriptions.Item label="报名人数">{order.quantity}</Descriptions.Item>
          <Descriptions.Item label="下单时间">
            {order.createTime}
          </Descriptions.Item>
          <Descriptions.Item label="是否已完结">
            {order.isServed === true ? (
              <Tag color={'#87d068'}>已完结</Tag>
            ) : (
              <Tag color={'#FF0000'}>未完结</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="已开票金额" span={3}>
            <span style={{ color: 'red' }}>{order.invoiceAmount}</span>
          </Descriptions.Item>
          {renderData.type == 1 ? (
            <>
              <Descriptions.Item label="本次订单退费金额">
                <span style={{ color: 'green' }}>{amounts.amount}</span>
              </Descriptions.Item>
              <Descriptions.Item label="本次订单退费结余" span={2}>
                <span style={{ color: 'red' }}>{(order.charge - amounts.amount).toFixed(2)}</span>
              </Descriptions.Item>
            </>
          ) : (
            <>
              <Descriptions.Item label="本次订单收费金额">
                <span style={{ color: 'green' }}>{amounts.amount}</span>
              </Descriptions.Item>
              <Descriptions.Item label="本次订单优惠金额">
                <span style={{ color: 'green' }}>{amounts.discount}</span>
              </Descriptions.Item>
              <Descriptions.Item label="本次订单收费结余">
                <span style={{ color: 'red' }}>
                  {order.arrears - amounts.amount - amounts.discount}
                </span>
              </Descriptions.Item>
            </>
          )}
          {/* <Descriptions.Item label="子订单班型">
            <ProTable
              actionRef={actionRefs}
              bordered
              columns={[
                {
                  title: '项目总称',
                  dataIndex: 'parentProjects',
                  key: 'parentProjects',
                  valueType: 'cascader',
                  fieldProps: {
                    options: Dictionaries.getList('dict_reg_job'),
                    showSearch: { filter },
                  },
                  width: 120,
                  render: (text, record) => (
                    <span key="parentProjects">
                      {Dictionaries.getCascaderAllName('dict_reg_job', record.project)}
                    </span>
                  ),
                },
                {
                  title: '报考岗位',
                  // dataIndex: 'classType',
                  search: false,
                  render: (text, record) => (
                    <span>
                      {record.project &&
                        [...new Set(record.project.split(','))].map((item: any, index: number) => {
                          return (
                            <span key={`charge-order-audit-2-${item}-${index}`}>
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
                  render: (text, record) => (
                    <span>{Dictionaries.getName('dict_class_type', record.classType)}</span>
                  ),
                },
                {
                  title: '班型年限',
                  dataIndex: 'classYear',
                  search: false,
                  render: (text, record) => (
                    <span>{Dictionaries.getName('dict_class_year', record.classYear)}</span>
                  ),
                },
                {
                  title: '考试类型',
                  dataIndex: 'examType',
                  search: false,
                  render: (text, record) => (
                    <span>{Dictionaries.getName('dict_exam_type', record.examType)}</span>
                  ),
                },
                {
                  title: '班型收费/人',
                  dataIndex: 'receivable',
                },
                {
                  title: '班型人数',
                  dataIndex: 'quantity',
                },
              ]}
              search={false}
              rowKey="id"
              // rowClassName={(record) => style.backgrounds}
              options={false}
              request={async (params, sort, filter) => {
                const dataList: any = await request.get('/sms/business/bizOrder', {
                  parentId: order.id,
                });

                return {
                  data: dataList.data.content,
                  success: dataList.success,
                  total: dataList.data.totalElements,
                };
              }}
              // dataSource={[record]}
              pagination={false}
            />
          </Descriptions.Item> */}
        </Descriptions>
      )}
      <span style={{ margin: '15px', float: 'right' }}>
        <Button type="primary" onClick={() => setInvoiceVisible(true)}>
          查看发票
        </Button>
      </span>
      <span style={{ margin: '15px', float: 'right' }}>
        <Button type="primary" onClick={() => setCOrderVisible(true)}>
          编辑订单
        </Button>
      </span>
      <ProForm.Group>
        <ProFormDigit
          label={`本次${orderTitle}金额`}
          name="amount"
          width="md"
          fieldProps={{
            precision: 2,
            onChange: (e) => {
              const obj = { amount: e };
              setAmounts({ ...amounts, ...obj });
            },
          }}
          rules={[
            {
              required: true,

              message: '请输入正确的金额',
            },
          ]}
        />
        <ProFormDigit
          label={`退费业绩金额` + orderAmountTitle}
          name="performanceAmount"
          width="sm"
          rules={[
            {
              required: true,
            },
          ]}
        />
        <ProFormDigit
          label="退费提成金额"
          name="commissionBase"
          width="sm"
          rules={[
            {
              required: true,
            },
          ]}
        />
        <ProFormSelect
          label="付款方式"
          name="method"
          width="sm"
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
          width="sm"
          // request={async () => Dictionaries.getList('chargeType')}
          valueEnum={{
            0: '订单缴费',
            1: '订单退费',
          }}
          required
          disabled
          fieldProps={{ defaultValue: renderData.type == '1' ? ['订单退费'] : ['订单缴费'] }}
        />
      </ProForm.Group>
      {/* {renderData.type == 0 ? (
        <ProForm.Group>
          <ProFormDigit
            name="discount"
            label="本次优惠金额"
            disabled={renderData.type == 'orders'}
            hidden={renderData.type == 'orders'}
            width="md"
            min={-99999}
            fieldProps={{
              precision: 2,
              onChange: (e) => {
                let obj = { discount: e };
                setAmounts({ ...amounts, ...obj });
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
      ) : (
        ''
      )} */}

      <ProForm.Group>
        <ProFormDatePicker
          name="chargeTime"
          fieldProps={{
            showTime: false,
            onChange:(e) => {
              console.log(e)
            }
          }}
          width="md"
          label={`${orderTitle}日期`}
          rules={[{ required: true, message: '请填写缴费日期' }]}
        />
        {renderData.type == 0 ? (
          <>
            <ProFormDateTimePicker
              name="paymentTime"
              fieldProps={{
                showTime: { format: 'HH:mm' },
                format: 'YYYY-MM-DD HH:mm',
              }}
              width="md"
              label={`${orderTitle == '收费' ? '实际到账' : orderTitle}日期`}
              rules={[{ required: true, message: '请填写缴费日期' }]}
            />
            <ProFormDateTimePicker
              name="nextPaymentTime"
              width="md"
              label="下次缴费时间"
              fieldProps={{
                showTime: { format: 'HH:mm' },
                format: 'YYYY-MM-DD HH:mm',
              }}
              hidden={renderData.type == 'orders'}
              disabled={renderData.type == 'orders'}
            />
          </>
        ) : (
          ''
        )}
        <UserTreeSelect
          ref={userRef}
          userLabel="招生老师(在职老师可以输入名字搜索)"
          userNames="userName"
          userPlaceholder="请输入招生老师的名字"
          flag={true}
          setUserNameId={(e: any) => setUserNameId(e)}
        />
        {/* <ProFormSwitch
          label="是否统计业绩"
          name="isCalculation"
          hidden={renderData.type == '1' && renderData.auditNum != 2}
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
        /> */}
      </ProForm.Group>
      <ProForm.Group>
        <ProFormTextArea width={800} label="备注" name="description" rules={[{ required: true }]} />
        <ProFormTextArea width={800} label="收据备注" name="description2" />
        <ProFormUploadDragger
          width={800}
          label="上传附件"
          name="files"
          action="/sms/business/bizCharge/upload"
          fieldProps={{
            multiple: true,
            // method: 'POST',
            headers: {
              ...obj,
            },
            listType: 'picture',
            defaultFileList: [],
            onDrop: (e) => { },
            beforeUpload: (file) => {
              if (file.size > 40960000) {
                message.error(`上次大小不能超过40M`);
                return Upload.LIST_IGNORE;
              }
              if (
                file.type != 'image/png' &&
                file.type != 'image/jpeg' &&
                file.type != 'application/pdf'
              ) {
                message.error(`只能上传png、jpg或者PDF格式`);
                return Upload.LIST_IGNORE;
              }
            },
            onPreview: async (file: any) => {
              look(renderData.id, file.name);
            },
            onChange: (info) => {
              const { status } = info.file;
              if (status !== 'uploading') {
              }
              if (status === 'done') {
                message.success(`${info.file.name} 上传成功.`);
              } else if (status === 'error') {
                message.error(`${info.file.name} 上传失败.`);
              }
            },
          }}
        />
      </ProForm.Group>
      {renderData.type != '1' ? (
        ''
      ) : (
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
              rules={[
                {
                  required: true,
                  message: '请选择退款类型',
                },
              ]}
            />
          </ProForm.Group>
          <ProForm.Group>
            <ProFormText name="accountName" label="开户名" width="md" />
            <ProFormText name="account" label="卡号" width="md" />
            <ProFormText name="bank" label="开户行（精确到支行）" width="md" />
          </ProForm.Group>
          <Row>
            <ProFormText name="agent" label="经办人" width="sm" />
            <Button
              style={{ marginTop: '30px', marginLeft: '-30px' }}
              type="primary"
              onClick={async () => {
                if (!content) {
                  content = await request.get('/sms/share/getDepartmentAndUser');
                }
                setCardContent({ content: content.data, type: 'order' });
                setCardVisible(true);
              }}
            >
              选择
            </Button>
          </Row>
          <ProForm.Group title="完结学员" />
          <Tables
            rowSelection={{
              // selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
              onChange: (e, selectedRows) => {
                console.log('e', e);

                setservedOrderIds(e);
              },
              defaultSelectedRowKeys: servedOrderIds,
            }}
            columns={columns}
            dataSource={servedOrderTable}
            search={false}
            rowKey="id"
          />
        </div>
      )}
      <div style={{ display: 'none' }}>
        <Image
          width={200}
          style={{ display: 'none' }}
          preview={{
            visible: isModalVisibles,
            src: imgSrc,
            onVisibleChange: (value: any) => {
              setisModalVisibles(value);
            },
          }}
        />
      </div>
      {CardVisible && (
        <UserManageCard
          CardVisible={CardVisible}
          CardContent={CardContent}
          setCardVisible={() => setCardVisible(false)}
          setDepartment={(e: any) => setDepartment(e)}
          departments={[department]}
        />
      )}
      <Modal
        open={openModal}
        onCancel={() => {
          setOpenModal(false);
        }}
        onOk={() => {
          setOpenModal(false);
          formRef.current?.validateFieldsReturnFormatValue?.().then(async (values) => {
            await submitok(values, openType);
          });
          setOpenModal(false);
        }}
        okText="确认无误提交"
        cancelText="返回修改"
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '20px' }}>注意!</div>
          <div>当前订单欠费金额为负数,请确认是否有误</div>
        </div>
      </Modal>
      <Modal
        title="编辑"
        width={1200}
        visible={CorderVisibleFalg}
        onCancel={() => setCOrderVisible(false)}
        destroyOnClose={true}
        footer={null}
      >
        {CorderVisibleFalg && (
          <CompanyOrders
            ref={childRef}
            setModalVisible={() => setCOrderVisible(false)}
            modalVisible={CorderVisibleFalg}
            callbackRef={() => getOrder()}
            renderData={{ ...order, type: 'order', orderNumber: 0, projectClassExamList: [] }}
          />
        )}
      </Modal>
      <Drawer
        open={invoiceVisible}
        onClose={() => setInvoiceVisible(false)}
        width={1400}
      >
        <Invoice param={{ orderIds: ',' + order?.id + ',' }} />
      </Drawer>
    </ModalForm>
  );
};
