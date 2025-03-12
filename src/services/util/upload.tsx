import React, { useContext, useState } from 'react';
import ProForm, { ModalForm, ProFormUploadDragger } from '@ant-design/pro-form';
import * as XLSX from 'XLSX';
import request from '../ant-design-pro/apiRequest';
import dictionaries from './dictionaries';
import { message, Space, Spin } from 'antd';
import { useModel } from 'umi';
import ModbileListOrder from '@/pages/Admins/StudentManage/ModbileListOrder';
export default (props: any) => {
  const {
    modalVisible,
    setModalVisible,
    url,
    type,
    upType,
    callbackRef,
    propsData,
    uploadtype,
    callbackFn = undefined,
    departmentType = false
  } = props;
  const { initialState } = useModel('@@initialState');
  const providerId = initialState?.currentUser?.userid
  const [SpingFalg, SetSpingFalg] = useState<boolean>(false);
  const [ModiledataSource, setModiledataSource] = useState([{}]);
  const [ModbileListVisible, setModbileListVisible] = useState<boolean>(false);
  const [ModileData, setModileData] = useState({})
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day} 00:00:00`;
  }
  const ExcelList = async (data: any, typeValue: boolean = true) => {
    let heradKey: any = data[0];
    // let heradKey: any = data[0].splice(0, data[0].indexOf('null'));
    let array: any = [];
    let array2: any = [];
    // let postData: string[] = [];
    let flag = false
    let TimeList = ['consultationTime', 'birthday', 'entryTime', 'formalTime', 'turnoverTime', 'examStartTime', 'examEndTime']
    // data[0].forEach((item: string) => {
    //   heradKey.push(item.slice(item.indexOf('.') + 1));
    // });
    const call = (res: { status: string; data: any }) => {
      SetSpingFalg(false);
      if (res.status == 'success') {
        message.success('导入成功');

        if (callbackFn) {
          callbackFn(res.data);
          setModalVisible();
        } else {
          setModalVisible();
        }
      }
    };
    data.forEach((item: any, index: number) => {
      if (index > 2) {
        if (item.length > 0) {
          let obj: any = {};
          let obj2 = {};

          item.forEach((items: string, indexs: number) => {
            let projects: any = [];

            if (indexs < heradKey.length) {
              let str = heradKey[indexs];
              //Excel为空判断,在进行字典匹配返回对应的值
              if ((items + '3').replace(/(^\s*)|(\s*$)/g, '') != '3') {

                if (str == 'type') {
                  obj[str] = dictionaries.getValue('studentType', items);
                } else if (str == 'projects') {
                  projects = dictionaries.getChildren('dict_reg_job', items);
                  // obj[str] = dictionaries.getList('dict_reg_job', items);
                } else if (str == 'project') {
                  projects.forEach((itemLabel: any) => {
                    if (itemLabel.label == items) {
                      obj[str] = itemLabel.value;
                    }
                  });
                  obj[str] = dictionaries.getCascaderValues('dict_reg_job', items);
                  if (obj[str] === false) {
                    message.error(`系统里没有项目${items}请更改后导入`, 5)
                    flag = true
                    return
                  }

                } else if (str == 'source') {
                  obj[str] = dictionaries.getValue('dict_source', items);
                } else if (str == 'isPeer') {
                  if (items == '是') {
                    obj[str] = 1;
                  } else {
                    obj[str] = 0;
                  }
                } else if (str == 'isInWhitelist') {
                  if (items == '是') {
                    obj[str] = true;
                  } else {
                    obj[str] = false;
                  }
                } else if (str == 'sex') {
                  if (items == '男') {
                    obj[str] = false;
                  } else {
                    obj[str] = true;
                  }
                } else if (str == 'education') {
                  obj[str] = dictionaries.getValue('dict_education', items);
                } else if (str == 'provider' && !items) {
                  console.log('provider', items);
                  obj[str] = items
                } else if (str == 'providerName') {
                  items = items.replace(/\s*/g, "")
                  const arr = dictionaries.getUserId(items)
                  //17为模板R列，更改模板需要更改下标
                  console.log('obj', obj);

                  if (arr.length == 1) {
                    obj['provider'] = arr[0]
                  } else if (arr.length == 0) {
                    message.error(`系统里没有老师${items}`)
                    flag = true
                    return
                  } else if (arr.length > 1) {
                    message.error(`系统里招生老师${items}重复，请联系管理人员`)
                    flag = true
                    return
                  }



                } else if (str == 'ownerName') {
                  items = items.replace(/\s*/g, "")
                  const arr = items == '无' ? [-1] : dictionaries.getUserId(items)
                  //17为模板R列，更改模板需要更改下标
                  console.log('obj', obj);

                  if (arr.length == 1) {
                    obj['owner'] = arr[0]
                  } else if (arr.length == 0) {
                    message.error(`系统里没有老师${items}`)
                    flag = true
                    return
                  } else if (arr.length > 1) {
                    message.error(`系统里招生老师${items}重复，请联系管理人员`)
                    flag = true
                    return
                  }



                } else if (str == 'resourceType') {
                  obj[str] = dictionaries.getValue('circulationType', items);
                } else if (str == 'content') {
                  obj2[str] = items;
                } else if (str == 'companyId' && type == 'studentOrder') {
                  obj[str] = items;
                } else if (str == 'types' && type == 'student') {
                  obj2['type'] = dictionaries.getValue('dict_c_type', items);
                } else if (str == 'intention') {
                  obj2[str] = dictionaries.getValue('dict_intention_level', items);
                } else if (str == 'createBy' && upType == 'post2') {
                  // postData.push(items);
                  const arr = dictionaries.getUserId(items)
                  if (arr.length == 1) {


                    obj[str] = arr[0]
                  } else if (arr.length == 0) {
                    message.error(`系统里没有老师${items}`)
                    flag = true
                    return
                  } else if (arr.length > 1) {
                    message.error(`系统里招生老师${items}重复，请联系管理人员`)
                    flag = true
                    return
                  }
                } else {
                  if (TimeList.includes(str)) {
                    items = formatDate(new Date(items));
                  }
                  obj[str] = items;
                }
              }
            }
          });
          array.push({ ...obj, ...propsData });
          if (JSON.stringify(obj2) !== '{}') {
            array2.push({ ...obj2 });
          }
        }
      }
    });
    let arrayData = {};
    if (flag) return

    if (type == 'studentOrder') {
      arrayData = array;
    } else {
      if (array2.length > 0) {
        arrayData = { array: array, array2: array2 };
      } else {
        arrayData = { array: array };
      }
    }
    let mobileList: any[] = []
    //信息提供人
    array.forEach((item: any) => {
      if (item.mobile) {
        mobileList.push(item.mobile)
      }
      if (!item.provider) {
        item.provider = providerId
      }
    })
    if (type != 'classlist') {
      const MobileTrue = (await request.get('/sms/business/bizStudent/findOrderByMobile', { mobileList: mobileList.join(','), _isGetAll: true })).data
      if ((MobileTrue.order.length !== 0 || MobileTrue.visit.length !== 0) && typeValue) {
        let values = array
        setModileData(values)
        setModiledataSource(MobileTrue)
        setModbileListVisible(true)
        return
      }
    }

    submitok(upType == 'post2' ? array : arrayData)
    // if (upType == 'post2') {
    //   submitok(array)
    // } else {
    //   submitok(uploadtype == 'student' ? array : arrayData)
    // }

    // if (upType == 'post2') {

    //   request.postAll(url, array).then((res: any) => {
    //     SetSpingFalg(false);
    //     if (res.status == 'success') {
    //       message.success('导入成功');

    //       if (callbackFn) {
    //         callbackFn(res.data);
    //         setModalVisible();
    //       } else {
    //         setModalVisible();
    //       }
    //     }
    //   });
    // } else {
    //   request.postAll(url, uploadtype == 'student' ? array : arrayData).then((res: any) => {
    //     SetSpingFalg(false);
    //     if (res.status == 'success') {
    //       message.success('导入成功');

    //       if (callbackFn) {
    //         callbackFn(res.data);
    //         setModalVisible();
    //       } else {
    //         setModalVisible();
    //       }
    //     }
    //   });
    // }
  };
  const submitok = (value: any) => {
    request.postAll(url, value).then((res: any) => {
      SetSpingFalg(false);
      if (res.status == 'success') {
        message.success('导入成功');

        if (callbackFn) {
          callbackFn(res.data);
          setModalVisible();
        } else {
          setModalVisible();
        }
      }
    });
  }
  const uploadprops = {
    // 这里我们只接受excel2007以后版本的文件，accept就是指定文件选择框的文件类型
    accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    name: 'file',
    headers: {
      authorization: 'authorization-text',
    },
    showUploadList: false,
    // 把excel的处理放在beforeUpload事件，否则要把文件上传到通过action指定的地址去后台处理
    // 这里我们没有指定action地址，因为没有传到后台
    fieldProps: {
      beforeUpload: (file: any, fileList: any[]) => {
        const rABS = true;
        const f = fileList[0];
        const reader = new FileReader();
        reader.onload = (e: any) => {
          let dataResult = e.target.result;
          if (!rABS) dataResult = new Uint8Array(dataResult);
          const workbook = XLSX.read(dataResult, {
            type: rABS ? 'binary' : 'array',
            cellDates: true,
          });
          // 假设我们的数据在第一个标签
          const firstWorksheet = workbook.Sheets[workbook.SheetNames[0]];
          // XLSX自带了一个工具把导入的数据转成json
          const jsonArr = XLSX.utils.sheet_to_json(firstWorksheet, { header: 1 });
          // 通过自定义的方法处理Json,得到Excel原始数据传给后端，后端统一处理
          // this.importUserListExcel(jsonArr);
          ExcelList(jsonArr);
        };
        if (rABS) reader.readAsBinaryString(f);
        else reader.readAsArrayBuffer(f);
        return false;
      },
    },
  };
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title="批量导入"
      autoFocusFirstInput
      modalProps={{
        onCancel: () => {
          setModalVisible();
        },
      }}
      onFinish={async (values) => {
        // await waitTime(2000);
        // fatherRef();
        // setModalVisible();
        // message.success('提交成功');
        // @ts-ignore
        setModalVisible();
        callbackRef();
        // return true;
      }}
      visible={modalVisible}
    >
      <Spin spinning={SpingFalg}>
        <Space>
          <a hidden={type == 'classlist'} download="新学员导入模板" href="./template/新学员导入模板.xlsx" key="ordera">
            下载导入学员模板
          </a>
          <a hidden={type != 'classlist'} download="新建班级模板" href="./template/班级模板.xlsx" key="ordera">
            下载新建班级模板
          </a>
          <a hidden={type != 'classlist'} download="批量加入班级模板" href="./template/批量修改班级.xlsx" key="ordera">
            下载批量加入班级模板
          </a>
        </Space>

        <div style={{ marginBottom: '5px' }}></div>
        <ProFormUploadDragger
          {...uploadprops}
        // fieldProps={{
        //   onChange: () => {
        //     SetSpingFalg(true);
        //   },
        // }}
        >
          {/* <Tooltip title="">
          <Button type="primary">批量导入</Button>
        </Tooltip> */}
        </ProFormUploadDragger>
        {ModbileListVisible && (
          <ModbileListOrder
            modalVisible={ModbileListVisible}
            setModalVisible={() => setModbileListVisible(false)}
            dataSource={ModiledataSource}
            renderData={ModileData}
            type='studentList'
            submitok={(value: any) => submitok(value)}
          />
        )}
      </Spin>
    </ModalForm>
  );
};
