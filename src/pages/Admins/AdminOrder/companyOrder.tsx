import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useModel } from 'umi';
import { Button, Col, Form, Input, message, Row, Space, Spin } from 'antd';
import { ProFormGroup, ProFormInstance, ProFormList, ProFormTreeSelect } from '@ant-design/pro-form';
import ProForm, {
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
  ProFormSelect,
  ProFormCascader,
} from '@ant-design/pro-form';
import Dictionaries from '@/services/util/dictionaries';
import request from '@/services/ant-design-pro/apiRequest';
import UserManageCard from '../Department/UserManageCard';
import StudentModals from './Modals';
import moment from 'moment';
import { CloseCircleOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import UserTreeSelect from '@/components/ProFormUser/UserTreeSelect';
import Modal from 'antd/lib/modal/Modal';
import ClassList from '@/pages/Business/ClassList';

let content: any = null;
let quantitys: any[] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let comNumbers: any[] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let JobClassExamA: any[] = [];
export default (props: any, childRef: any) => {
  const {
    modalVisible,
    setModalVisible = undefined,
    callbackRef = undefined,
    renderData,
    admin,
    editAll = false,
    url,
    callback,
  } = props;

  const { initialState } = useModel('@@initialState');
  const [CardVisible, setCardVisible] = useState<boolean>(false);
  const [spinning, setSpinning] = useState<boolean>(true);
  const [CardContent, setCardContent] = useState<any>();
  const [quantity, setquantity] = useState<any>([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [receivable, setreceivable] = useState<any>([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [discountOrder, setdiscountOrder] = useState<any>([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [JobClassExam, setJobClassExam] = useState<any>([]);
  const [sources, setSource] = useState<any>('9');
  const [orderLists, setOrderList] = useState<any>([]);
  const [userNameId, setUserNameId] = useState<any>();
  const [providerData, setprovider] = useState<any>({})
  const [ClassFalg, setClassFalg] = useState<boolean>(false);
  const providerEnum = { [renderData.userId]: renderData.userName, [renderData.provider]: renderData.providerName }
  const userRef: any = useRef(null);
  const [classRef, setClassRef] = useState<any>({});
  useImperativeHandle(childRef, () => ({
    submitok: submitok,
    formRefs: formRef,
    submitAddNew: submitAddNew,
  }));
  const [StudentModalsVisible, setStudentModalsVisible] = useState(false);
  const [companyStudent, setCompanyStudent] = useState<any>([]);
  const [comNumber, setComNumber] = useState<any>([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  let [department, setDepartment] = useState<any>({
    name: initialState?.currentUser?.name,
    id: initialState?.currentUser?.userid,
  });
  const urlGroup = '/sms/business/bizOrder';
  const eidtUrl = url ? url : '/sms/business/bizOrder/editOrder';
  const eidtUrls = '/sms/business/bizOrder/editOrders';
  const formRef = useRef<ProFormInstance>();
  const actionRefs = useRef<any>();
  // formRef?.current?.resetFields();
  const ment = () => {
    formRef?.current?.setFieldsValue({
      userName: department.name,
    });
  };
  useEffect(() => {
    formRef?.current?.setFieldsValue({
      classId: classRef.id,
      className: classRef.name,
    });
  }, [classRef])
  useEffect(() => {
    formRef?.current?.setFieldsValue({
      provider: userNameId?.id,
    });
  }, [userNameId])
  useEffect(() => {
    // setDepartment({ name: initialState?.currentUser?.name, id: initialState?.currentUser?.userid });
    quantitys = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    comNumbers = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  }, [modalVisible]);
  useEffect(() => {
    ment();
  }, [department]);
  useEffect(() => {
    let numberQ = eval(quantitys.join('+'));
    let numberS = eval(discountOrder.join('+'));
    let numberQ2 = 0;
    quantitys.forEach((item: any, index: number) => {
      numberQ2 = numberQ2 + item * comNumbers[index];
    });
    formRef?.current?.setFieldsValue({
      quantity: numberQ,
      receivable: comNumber[0],
      totalReceivable: numberQ2 - numberS,
    });
  }, [quantity, comNumber, discountOrder]);
  useEffect(() => {
    if (renderData.type == 'order' && renderData.orderNumber === 0) {
      // renderData.provider = renderData.provider + ''
      ++renderData.orderNumber;
      let list: any = [];
      // request
      //   .get('/sms/business/bizOrder', {
      //     id: renderData.id,
      //   })
      //   .then((res) => {
      const orderList = [renderData];
      setOrderList(orderList);

      orderList.forEach(async (item: any, index: number) => {
        onChange([item.project], index);
        quantitys[index] = item.quantity;
        comNumbers[index] = item.receivable;
        setquantity(quantitys);
        list.push({
          project: Dictionaries.getCascaderValue('dict_reg_job', item.project),
          JobClassExam: JSON.stringify({
            classType: item.classType,
            examType: item.examType,
            classYear: item.classYear,
            receivable: item.receivable,
            project: item.project,
          }),
          quantity: item.quantity,
          receivable: item.receivable,
          discount: item.discount,
          source: item.source + '',
          discountRemark: item.discountRemark,
          provider: { "value": renderData.provider },
        });
      });
      setTimeout(async () => {
        formRef?.current?.setFieldsValue({
          ...renderData,
          percent: renderData.percent * 100,
          quantity: eval(quantitys.join('+')),
          userName: department.name,
          project: Dictionaries.getCascaderValue('dict_reg_job', renderData.project),
          standards: list,
          provider: renderData.provider,
        });
        const data = {
          id: renderData.provider,
          name: renderData.providerName
        }
        userRef?.current?.setDepartment(data);
        setUserNameId(data)
      }, 500);
      // });
    }
    if (renderData.typee == 'add' && renderData.orderNumber === 0) {
      let source = renderData.studentSource + '';
      //正式默认复购
      // if (renderData.isFormal) source = '9';
      ++renderData.orderNumber;
      if (renderData.project) {
        onChange([renderData.project], 0);
      }
      // const providerUser = renderData.isFormal ? renderData.userId + '' : renderData.provider + ''
      setTimeout(() => {
        formRef?.current?.setFieldsValue({
          project: renderData.isFormal
            ? ''
            : Dictionaries.getCascaderValue('dict_reg_job', renderData.project),
          studentName: renderData.name,
          // quantity: 1,
          userName: department.name,
          // provider: renderData.provider,
          standards: [
            {
              project: Dictionaries.getCascaderValue('dict_reg_job', renderData.project),
              quantity: 1,
              source: source,
              provider: renderData.isFormal ? renderData.userId : renderData.provider
            },
          ],
        });
        quantitys[0] = 1;
        // const data = {
        //   id: renderData.provider,
        //   name: renderData.providerName
        // }
        // userRef?.current?.setDepartment(data);

        // setUserNameId(data)
        setSource(source);
        setquantity(quantitys);
        setSpinning(false);

      }, 100);
    }
  }, []);
  const getDepartment = async () => {
    // const list = (await request.get('/sms/share/getDepartmentAndUser')).data;
    const listFn = (data: any) => {
      let arr2: any = [];
      data.forEach((item: any, index: number) => {
        let arr3: any = [];
        if (item.children) {
          arr3 = listFn(item.children);
        }
        let str = '';
        let add = false;
        let obj: any = {};
        if (item.departmentName) {
          str = item.departmentName;
          obj.id = item.id;
          add = true
        } else if (item.enable) {
          str = item.name;
          obj.userId = item.userId;
          add = true
        }
        if (add) {
          if (arr3.length > 0) {
            arr2.push({
              ...obj,
              title: str,
              parentId: item.parentId,
              children: arr3,
            });
          } else {
            arr2.push({
              ...obj,
              title: str,
              parentId: item.parentId,
            });
          }
        }
      });


      return arr2;
    };
    const arrKey = (data: any, index?: number) => {
      data.forEach((items: any, indexs: number) => {
        items.value = items.userId;
        if (!items.value) items.value = index + '-' + indexs;
        if (items.children) {
          arrKey(items.children, items.value);
        }
      });
    };
    const lists = listFn(JSON.parse(localStorage.getItem('Department') as string));
    arrKey(lists, 0);
    return lists.reverse();
  };
  const filter = (inputValue: string, path: any[]) => {
    return path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
  };
  function projectClassExamListFn(data: any) {
    let arr: { label: string; value: any }[] = [];
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
          // examAmount: item.examAmount,
        }),
      });
    });

    return arr;
  }

  async function onChange(value: any, index?: any, types?: string) {
    if (!value) return;
    setSpinning(true);
    formRef?.current?.setFieldsValue({ JobClassExam: '', receivable: 0 });
    const arr = JSON.parse(JSON.stringify(JobClassExam));

    const data: any = (
      await request.get(
        '/sms/business/bizChargeStandard?project=' +
        value[value.length - 1] +
        '&useNum=0&_size=999&enable=true',
      )
    ).data.content;
    if (data.length != 0) {
      arr[index] = projectClassExamListFn(data);
      JobClassExamA[index] = projectClassExamListFn(data);
    } else {
      arr[index] = null;
    }
    let standardsLsit = formRef?.current?.getFieldValue('standards')
      ? formRef?.current?.getFieldValue('standards')
      : [];

    if (standardsLsit[index]) {
      standardsLsit[index].JobClassExam = undefined;
    }

    setTimeout(() => {
      if (renderData.type != 'order') {
        setJobClassExam(arr);
      } else {
        setJobClassExam(JobClassExamA);
      }

      formRef?.current?.setFieldsValue({
        standards: standardsLsit,
      });

      setSpinning(false);
    }, 100);
  }
  const submitAddNew = (value: any) => {
    const standards = value.standards;
    // const providerId = value.provider
    standards.forEach((item: any) => {
      let obj = JSON.parse(item.JobClassExam);
      item.studentUserId = renderData.id;
      item.classId = value.classId
      Object.keys(obj).forEach((key) => {
        item[key] = obj[key];
      });
      delete item.JobClassExam;
    });
    return new Promise((resolve) => {
      request
        .postAll('/sms/business/bizOrder/saveArray', { array: standards })
        .then((res: any) => {
          if (res.status == 'success') {
            message.success('操作成功');

            quantitys = [0, 0, 0, 0, 0, 0, 0, 0, 0];
            comNumbers = [0, 0, 0, 0, 0, 0, 0, 0, 0];
            if (setModalVisible) {
              setModalVisible();
              callbackRef();
            }
          }
          resolve(res);
        })
        .catch((err: any) => {
          resolve(true);
        });
    });
  };
  const submitAdd = (value: any) => {
    // value.project = renderData.project;
    //新增学员订单时添加学员studentid 不添加则为修改订单
    if (renderData.typee == 'add') {
      value.studentUserId = renderData.id;
      delete value.id;
    }
    let array: any = {};
    const JobClassExam = JSON.parse(value.JobClassExam);
    Object.keys(JobClassExam).forEach((key) => {
      array[key] = JobClassExam[key];
    });
    //收费人id
    let params: {
      userId?: number;
      id?: number;
      quantity?: number;
      studentUserId?: number;
      description?: string;
      project?: string;
      receivable?: string;
    } = {};
    params.userId = department.id;
    params.project = value.project[value.project.length - 1];

    params.quantity = 1;
    // params.quantity = value.quantity;
    params.receivable = value.totalReceivable;

    //新增学员订单时添加学员studentid 不添加则为修改订单
    if (renderData.typee == 'add') {
      params.studentUserId = renderData.id;
    } else {
      params.id = renderData.id;
    }
    if (value.description) {
      params.description = value.description;
    }
    const data = value.standards;
    if (renderData.parentId != '-1') value.parentId = renderData.parentId;

    return new Promise((resolve) => {
      request
        .post(urlGroup, { ...array, ...params })
        .then((res: any) => {
          if (res.status == 'success') {
            message.success('操作成功');

            quantitys = [0, 0, 0, 0, 0, 0, 0, 0, 0];
            comNumbers = [0, 0, 0, 0, 0, 0, 0, 0, 0];
            if (setModalVisible) {
              setModalVisible();
              callbackRef();
            }
          }
          resolve(res);
        })
        .catch((err: any) => {
          resolve(true);
        });
    });
  };
  const submitEidt = (value: any) => {
    // console.log(JSON.stringify(value))
    const standards = value.standards;
    // value = { ...value, ...value.standards[0] };
    value = { ...value, ...standards[0], ...JSON.parse(standards[0].JobClassExam) };
    value.id = renderData.id;
    if (value.provider) value.provider = value.provider.value;
    if (value.percent) value.percent = value.percent / 100;
    // value.project = standards[0].project[standards[0].project.length - 1];
    // value.quantity = value.quantity;
    // value.receivable = value.totalReceivable;
    delete value.standards;
    delete value.JobClassExam;
    delete value.totalReceivable;
    return new Promise((resolve) => {
      request
        .post(eidtUrl, value)
        .then((res: any) => {
          if (res.status == 'success') {
            message.success('操作成功');
            // standards.forEach((item: any, index: string | number) => {
            //   const JobClassExam = item.JobClassExam;
            //   delete item.JobClassExam;
            //   standards[index] = {
            //     ...standards[index],
            //     ...JSON.parse(JobClassExam),
            //     parentId: renderData.id,
            //   };
            //   if (orderLists[index]) standards[index].id = orderLists[index].id;
            // });
            // request.postAll(eidtUrls, standards);
            quantitys = [0, 0, 0, 0, 0, 0, 0, 0, 0];
            comNumbers = [0, 0, 0, 0, 0, 0, 0, 0, 0];
            if (setModalVisible) {
              setModalVisible();
              callbackRef();
            }
          }
          resolve(res);
        })
        .catch((err: any) => {
          resolve(true);
        });
    });
  };
  const submitok = (value: any) => {
    if (renderData.type == 'order') {
      return submitEidt(value);
    } else {
      return submitAdd(value);
    }
  };
  const onChange1 = (value: string) => { };

  const onSearch = (value: string) => { };
  return (
    <ProForm<{
      name: string;
      company: string;
      id: number;
    }>
      // title={'下单'}
      submitter={
        admin === 'step'
          ? false
          : {
            render: (_, dom) => {
              return (
                <Row>
                  {/* <Col span={10}></Col> */}
                  <Col span={24} offset={21}>
                    <Space>{dom}</Space>
                  </Col>
                </Row>
              );
            },
          }
      }
      // width={1200}
      formRef={formRef}
      autoFocusFirstInput
      onFinish={async (values) => {
        if (renderData.studentId) values.id = renderData.studentId;

        await submitok(values);
      }}
    >
      <Spin spinning={spinning}>
        <ProForm.Group>
          <ProFormText
            name="studentName"
            width="sm"
            label={renderData.group ? '企业团组' : '学员姓名'}
            placeholder="请输入姓名"
            disabled
          // rules={[
          //   {
          //     required: true,
          //     pattern: new RegExp(/^\S*$/),
          //     message: '不能包含空格/请输入正确的用户名',
          //   },
          // ]}
          />

          <ProFormText
            hidden={renderData.typee != 'add' || renderData.group}
            name="className"
            width="sm"
            label="班级"
            placeholder="请选择班级"
            fieldProps={{
              onClick: () => { setClassFalg(true) }
            }}
          // disabled
          />
          <ProFormText hidden={true} name="classId" />
          {/* <ProFormText name="userName" label="收费人" required width="sm" /> */}
          {/* <Button
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
          </Button> */}
          <ProFormText name="quantity" label="当前订单报名人数" required readonly width="sm" />
          <ProFormText
            name="totalReceivable"
            label="当前订单应收总额"
            required
            readonly
            width="sm"
          />
          <ProFormDigit
            hidden={!editAll}
            name="percent"
            label="业绩分成比例（%）"
            width="sm"
            min={0}
            max={100}
          />

          {/* <ProFormSelect
            label="信息提供人"
            name="provider"
            width="xs"
            valueEnum={providerEnum}
          /> */}

        </ProForm.Group>
        <Row
          style={{
            width: '1100px',
            backgroundColor: '#d9edf7',
            border: '1px solid #bce8f1',
            padding: '20px',
            marginBottom: '20px',
          }}
          hidden={renderData.type == 'orders'}
        >
          <Col span={2} style={{ color: 'red' }}>
            注意：
          </Col>
          <Col span={22}>
            （1）如果你的收费金额大于了收费标准，请在订单优惠金额里填写多收金额的负数。
          </Col>
        </Row>
        <ProFormList
          name="standards"
          max={renderData.type == 'order' ? 1 : 9}
          min={1}
          // copyIconProps={{ Icon: SmileOutlined, tooltipText: '复制此行到末尾' }}
          deleteIconProps={{
            Icon: CloseCircleOutlined,
            tooltipText: '不需要这行了',
          }}
          creatorButtonProps={{
            creatorButtonText: '新增一条班型信息',
          }}
          creatorRecord={{
            project: Dictionaries.getCascaderValue('dict_reg_job', renderData.project),
            quantity: 1,
            source: sources,
            provider: renderData.isFormal ? renderData.userId : renderData.provider
          }}
          actionGuard={{
            beforeAddRow: async (defaultValue, insertIndex) => {
              onChange([renderData.project], insertIndex);
              const arr = JSON.parse(JSON.stringify(quantity));
              arr[insertIndex as number] = 1;
              quantitys[insertIndex as number] = 1;
              setquantity(arr);
              return new Promise((resolve) => {
                setTimeout(() => resolve(true), 1000);
              });
            },
            beforeRemoveRow: async (index) => {
              return new Promise((resolve) => {
                if (index === 0) {
                  message.error('这行不能删');
                  resolve(false);
                  return;
                }
                const arr = JSON.parse(JSON.stringify(quantity));
                const arr2 = JSON.parse(JSON.stringify(receivable));
                const arr3 = JSON.parse(JSON.stringify(comNumber));
                arr[index as number] = 0;
                arr2[index as number] = 0;
                arr3[index as number] = 0;
                quantitys[index as number] = 0;
                comNumbers[index as number] = 0;
                setquantity(arr);
                setreceivable(arr2);
                setTimeout(() => resolve(true), 300);
              });
            },
          }}
          itemRender={({ listDom, action }, { record, index, name }) => {
            return (
              <ProCard
                bordered
                extra={action}
                title={'报考班型'}
                style={{
                  marginBottom: 8,
                }}
              >
                <ProFormGroup key={index}>
                  <ProForm.Group>
                    <ProFormCascader
                      width="sm"
                      name="project"
                      placeholder="选择报考岗位"
                      label="报考岗位"
                      rules={[{ required: true, message: '请选择报考岗位' }]}
                      fieldProps={{
                        options: Dictionaries.getCascader('dict_reg_job'),
                        showSearch: { filter },
                        onChange: (e: any) => onChange(e, index, 'change'),
                        // onSearch: (value) => console.log(value),
                        // defaultValue: ['0', '00'],
                      }}
                    />
                    {JobClassExam[index] ? (
                      <>
                        <ProFormSelect
                          label="班型选择"
                          name="JobClassExam"
                          fieldProps={{
                            options: JobClassExam[index],
                            showSearch: true,
                            onChange: (e) => {
                              onChange1(e);
                            },
                            onSearch: (e) => {
                              onSearch(e);
                            },
                            filterOption: (input, option: any) => {
                              return option!.children?.props?.label.indexOf(input) >= 0;
                            },
                            onSelect: (e: string) => {
                              const a = JSON.parse(e);
                              const arr2 = JSON.parse(JSON.stringify(comNumber));
                              const b = formRef?.current?.getFieldValue('standards');
                              b[index].receivable = a.receivable;
                              // b[index].examAmount = a.examAmount;
                              arr2[index] = a.receivable;
                              comNumbers[index] = a.receivable;
                              setComNumber(arr2);
                            },
                          }}
                          width="sm"
                          rules={[
                            {
                              required: true,
                              message: '请选择班型选择',
                            },
                          ]}
                        />
                        <Button
                          style={{ marginTop: '30px', marginLeft: '-30px' }}
                          type="primary"
                          onClick={async () => {
                            const arr1 = JSON.parse(JSON.stringify(JobClassExam));
                            arr1[index] = false;
                            setJobClassExam(arr1);
                          }}
                        >
                          取消
                        </Button>
                        <ProFormDigit
                          name="quantity"
                          width="sm"
                          label="报名人数"
                          key={index}
                          disabled={renderData.type == 0}
                          fieldProps={{
                            onChange: (e: any) => {
                              if (e == null || e == '') e = 0;
                              const arr = JSON.parse(JSON.stringify(quantity));
                              arr[index] = e;
                              quantitys[index] = e;
                              setquantity(arr);
                            },
                          }}
                          rules={[{ required: true, message: '请填写报名人数' }]}
                        />

                        <ProFormDigit
                          name="receivable"
                          label="收费标准"
                          disabled={JobClassExam[index]}
                          // width="sm"
                          fieldProps={{
                            onChange: (e: any) => {
                              if (e == null || e == '') e = 0;
                              const arr2 = JSON.parse(JSON.stringify(comNumber));
                              arr2[index] = e;
                              comNumbers[index] = e;
                              setComNumber(arr2);
                            },
                          }}
                          rules={[{ required: true, message: '请输入金额' }]}
                        />
                        {/* <ProFormDigit
                          name="examAmount"
                          label="考试费"
                          disabled={JobClassExam[index]}
                          rules={[{ message: '无' }]}
                        /> */}
                        <ProFormSelect
                          label="订单来源"
                          name="source"
                          width={200}
                          rules={[{ required: true, message: '请选择订单来源' }]}
                          request={async () => Dictionaries.getList('dict_source') as any}
                        />
                        <ProFormDigit
                          name="discount"
                          label="订单优惠金额"
                          disabled={renderData.type == 'orders'}
                          hidden={renderData.type == 'orders'}
                          min={-999999}
                          width={280}
                          rules={[
                            {
                              required: true,
                            },
                          ]}
                          fieldProps={{
                            precision: 2,
                            onChange: (e) => {
                              if (e == null || e == '') e = 0;
                              const arr2 = JSON.parse(JSON.stringify(discountOrder));
                              arr2[index] = e;
                              setdiscountOrder(arr2);
                              // if (e) {
                              //   setFalg(true);
                              // } else {
                              //   setFalg(false);
                              // }
                            },
                          }}
                        />
                        <ProFormText
                          name="discountRemark"
                          label="订单优惠原因"
                          width="sm"
                          fieldProps={{
                            autoComplete: 'no',
                          }}
                          disabled={renderData.type == 'orders'}
                          hidden={renderData.type == 'orders'}
                          rules={[
                            { required: discountOrder[index], message: '请填写本次折扣原因' },
                          ]}
                        />
                        <ProFormTreeSelect
                          name={'provider'}
                          label={'信息提供人'}
                          placeholder={'请输入信息提供人'}
                          allowClear
                          width={'sm'}
                          secondary
                          request={() => {
                            return getDepartment();
                          }}
                          // tree-select args
                          required
                          fieldProps={{
                            // onSelect: (e: any, node: any) => {
                            // onSelectUser(node);
                            // },
                            // value: { lable: renderData.providerName, value: renderData.provider },
                            treeDefaultExpandAll: true,
                            filterTreeNode: true,
                            showSearch: true,
                            dropdownMatchSelectWidth: false,
                            labelInValue: true,
                            // autoClearSearchValue: true,
                            // multiple: true,
                            treeNodeFilterProp: 'title',
                            fieldNames: {
                              label: 'title',
                            },

                          }}
                        />
                        {/* <UserTreeSelect
                          ref={userRef}
                          userLabel={'信息提供人'}
                          userNames="provider"
                          width="sm"
                          userPlaceholder="请输入信息提供人"
                          setUserNameId={(e: any) => setUserNameId(e)}
                          // setDepartId={(e: any) => setDepartId(e)}
                          flag={true}
                        // setFalgUser={(e: any) => setFalgUser(e)}
                        /> */}
                      </>
                    ) : (
                      <span style={{ display: 'inline-block', marginTop: '32px' }}>
                        该项目尚未设置收费标准,请联系管理员设置!
                      </span>
                      // <ProForm.Group key={index}>
                      //   <ProFormSelect
                      //     label="班级类型"
                      //     name="classType"
                      //     width="xs"
                      //     request={async () => Dictionaries.getList('dict_class_type')}
                      //     rules={[
                      //       {
                      //         required: true,
                      //         message: '请选择班级类型',
                      //       },
                      //     ]}
                      //   />
                      //   <ProFormSelect
                      //     label="班型年限"
                      //     name="classYear"
                      //     width="xs"
                      //     request={async () => Dictionaries.getList('dict_class_year')}
                      //     rules={[
                      //       {
                      //         required: true,
                      //         message: '请选择班型年限',
                      //       },
                      //     ]}
                      //   />
                      //   <ProFormSelect
                      //     label="考试类型"
                      //     name="examType"
                      //     width="xs"
                      //     request={async () => Dictionaries.getList('dict_exam_type')}
                      //     rules={[
                      //       {
                      //         required: true,
                      //         message: '请选择考试类型',
                      //       },
                      //     ]}
                      //   />
                      // </ProForm.Group>
                    )}
                  </ProForm.Group>
                </ProFormGroup>
              </ProCard>
            );
          }}
        ></ProFormList>
        <ProForm.Group>
          <ProFormTextArea width={1000} label="备注" name="description" />
        </ProForm.Group>
        {CardVisible && (
          <UserManageCard
            CardVisible={CardVisible}
            CardContent={CardContent}
            setCardVisible={() => setCardVisible(false)}
            setDepartment={(e: any) => setDepartment(e)}
            departments={[department]}
          />
        )}

        {StudentModalsVisible && (
          <StudentModals
            type={0}
            modalVisible={StudentModalsVisible}
            parentId={renderData.studentId}
            setModalVisible={() => setStudentModalsVisible(false)}
            renderData={{ type: 'order' }}
            companyStudent={companyStudent}
            setStudentId={(e: any) => {
              let arr = Array.isArray(e) ? e : [e];

              setCompanyStudent([...companyStudent, ...arr]);
            }}
          />
        )}


        <Modal
          open={ClassFalg}
          width={1200}
          onOk={() => setClassFalg(false)}
          onCancel={() => setClassFalg(false)}
          footer={null}
        >
          <ClassList
            setClassRef={setClassRef}
            setClassFalg={() => setClassFalg(false)}
          />
        </Modal>
      </Spin>
    </ProForm>
  );
};
