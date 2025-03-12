import React, { useEffect, useRef, useState } from 'react';
import { Button, message } from 'antd';
import { useModel } from 'umi';
import StudentModals from '../AdminOrder/Modals';
import ProForm, {
  ModalForm,
  ProFormText,
  ProFormDateTimePicker,
  ProFormSelect,
  ProFormTextArea,
  ProFormDatePicker,
} from '@ant-design/pro-form';
import Dictionaries from '@/services/util/dictionaries';
import type { ProFormInstance } from '@ant-design/pro-form';
import request from '@/services/ant-design-pro/apiRequest';
import moment from 'moment';

interface valueType {
  name: string;
  value: string;
  description: string;
  parentId: number;
  id: number | string;
}
export default (props: any) => {
  const { modalVisible, setModalVisible, callbackRef, renderData, url } = props;
  const { initialState } = useModel('@@initialState');
  const [StudentModalsVisible, setStudentModalsVisible] = useState(false);
  const [StudentId, setStudentId] = useState<any>(null);
  const [nextTime, setNextTime] = useState<any>()
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState<boolean>(false);
  const getPersonVisitTimeout = async () => {
    // const value = (await request.get('/sms/system/sysConfig', { name: '默认个人回访超时天数' })).data.content[0].value
    const futureTime = moment().add(Number(4) - 1, 'days');
    formRef?.current?.setFieldsValue({
      nextVisitDate: futureTime.format('YYYY-MM-DD HH:mm:ss'),
    });
    // setNextTime(value)
  }
  useEffect(() => {

    StudentId &&
      formRef?.current?.setFieldsValue({
        studentName: StudentId.name,
      });
  }, [StudentId]);
  useEffect(() => {
    getPersonVisitTimeout()

  }, [])
  if (renderData.types == 'edit' && renderData.n === 0) {
    setTimeout(() => {
      formRef?.current?.setFieldsValue({
        ...renderData,
        type: renderData.type + '',
        intention: renderData.intention + '',
      });
    }, 100);
    ++renderData.n;
  }
  if (renderData.types == 'add' && renderData.n === 0) {
    setTimeout(() => {
      formRef?.current?.setFieldsValue({
        studentName: renderData.name,
      });
    }, 100);
    ++renderData.n;
  }
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title="回访学员"
      formRef={formRef}
      visible={modalVisible}
      width={800}
      autoFocusFirstInput
      modalProps={{
        onCancel: () => setModalVisible(),
        destroyOnClose: true,
      }}
      onFinish={async (values: any) => {
        if (loading) return
        else setLoading(true)
        message.loading("加载中", 0)
        //学员id
        //招生老师id
        values.updateBy = initialState?.currentUser?.userid;
        values.studentUserId = StudentId ? StudentId.id : renderData.id;
        if (renderData.types == 'edit') {
          values.id = renderData.id;
        }
        console.log(values);
        request
          .post(url, values)
          .then((res: any) => {
            setLoading(false)
            if (res.status == 'success') {
              message.destroy()
              message.success('操作成功');
              setModalVisible();
              callbackRef();
              return true;
            } else {
              message.error(res.msg)
              return false;
            }
          })
          .catch((err: any) => {
            setLoading(false)
            message.error(err)
            return false;
          });
      }}
    >
      <ProForm.Group>
        <ProFormText
          width="lg"
          name="studentName"
          label="学员"
          tooltip="最长为 24 位"
          placeholder="请输入名称"
          required
          disabled
        />
        <Button
          style={{ marginTop: '30px', marginLeft: '-30px' }}
          type="primary"
          disabled={renderData.types}
          onClick={async () => {
            //   setCardContent({ content: content.data, type: 'order' });
            setStudentModalsVisible(true);
          }}
        >
          选择
        </Button>
        {/* <ProFormText width="md" name="company" label="我方公司名称" placeholder="请输入名称" /> */}
      </ProForm.Group>
      <ProForm.Group>
        <ProFormSelect
          label="沟通方式"
          name="type"
          width="md"
          rules={[{ required: true, message: '请填写沟通方式' }]}
          request={async () => Dictionaries.getList('dict_c_type') as any}
        />
        <ProFormSelect
          label="意向级别"
          name="intention"
          width="md"
          rules={[{ required: true, message: '请填写意向级别' }]}
          request={async () => Dictionaries.getList('dict_intention_level') as any}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText
          label="跟进人"
          name="updateBy"
          width="md"
          fieldProps={{ value: initialState?.currentUser?.name, readOnly: true }}
        />
        <ProFormDateTimePicker
          width="md"
          name="createTime"
          label="跟进时间"
          rules={[{ required: true, message: '请填写跟进时间' }]}
        />
        {/* <span>今日回访后,默认的流转日期为<span style={{ color: 'red' }}>{nextTime}天后</span>。请及时更新回访,以为数据流转。</span> */}
        <ProFormDatePicker
          width="md"
          name="nextVisitDate"
          label="下一次跟进时间"
        />
      </ProForm.Group>
      <ProFormTextArea
        width={750}
        label="跟进内容"
        name="content"
        rules={[{ required: true, message: '请填写跟进内容' }]}
      />
      {StudentModalsVisible && (
        <StudentModals
          modalVisible={StudentModalsVisible}
          setModalVisible={() => setStudentModalsVisible(false)}
          renderData={{ type: 'order' }}
          setStudentId={(e: any) => {
            setStudentId(e);
          }}
        />
      )}
    </ModalForm>
  );
};
