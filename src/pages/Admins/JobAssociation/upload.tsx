import React, { useContext, useState } from 'react';
import ProForm, { ModalForm, ProFormUploadDragger } from '@ant-design/pro-form';
import * as XLSX from 'XLSX';
import request from '../../../services/ant-design-pro/apiRequest';
import dictionaries from '../../../services/util/dictionaries';
import { message, Spin } from 'antd';
export default (props: any) => {
  const {
    modalVisible,
    setModalVisible,
    url,
    type,
    callbackRef,
    // propsData,
    uploadtype,
    callbackFn = undefined,
  } = props;
  const [SpingFalg, SetSpingFalg] = useState<boolean>(false);
  console.log('pp', props);

  const ExcelList = (data: any) => {
    let heradKey: any = data[0];
    // let heradKey: any = data[0].splice(0, data[0].indexOf('null'));
    let array: any = [];
    let array2: any = [];

    // data[0].forEach((item: string) => {
    //   heradKey.push(item.slice(item.indexOf('.') + 1));
    // });

    data.forEach((item: any, index: number) => {
      if (index > 2) {
        if (item.length > 0) {
          let obj = {};
          let parentProject = '';
          item.forEach((items: string, indexs: number) => {
            if (indexs < heradKey.length) {
              let str = heradKey[indexs];
              //Excel为空判断,在进行字典匹配返回对应的值
              if ((items + '3').replace(/(^\s*)|(\s*$)/g, '') != '3') {
                if (str == 'type' && type == 'student') {
                  obj[str] = dictionaries.getValue('studentType', items);
                } else if (str == 'project') {
                  obj[str] = dictionaries.getProjectValue('dict_reg_job', item[indexs - 1], items);
                } else if (str == 'classType') {
                  obj[str] = dictionaries.getValue('dict_class_type', items);
                } else if (str == 'classYear') {
                  obj[str] = dictionaries.getValue('dict_class_year', items);
                } else if (str == 'examType') {
                  obj[str] = dictionaries.getValue('dict_exam_type', items);
                } else {
                  if (str != 'parentProject') obj[str] = items;
                }
              }
            }
          });
          array.push({ ...obj });
          console.log('array', array);
        }
      }
    });

    request.postAll(url, { array }).then((res: any) => {
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
  };

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
        <a download="收费标准导入模板" href="./template/收费标准导入模板.xlsx" key="ordera">
          下载导入模板
        </a>
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
      </Spin>
    </ModalForm>
  );
};
