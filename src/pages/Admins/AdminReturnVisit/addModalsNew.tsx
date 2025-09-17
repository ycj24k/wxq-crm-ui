import React, { useEffect, useRef, useState } from 'react';
import { Button, message, Radio, Card, Row, Col } from 'antd';
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

export default (props: any) => {
  const { modalVisible, setModalVisible, callbackRef, renderData, url } = props;
  const { initialState } = useModel('@@initialState');
  const [StudentModalsVisible, setStudentModalsVisible] = useState(false);
  const [StudentId, setStudentId] = useState<any>(null);
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState<boolean>(false);
  const [consultationOptions, setConsultationOptions] = useState<any[]>([]);
  
  const getPersonVisitTimeout = async () => {
    const futureTime = moment().add(Number(4) - 1, 'days');
    formRef?.current?.setFieldsValue({
      nextVisitDate: futureTime.format('YYYY-MM-DD HH:mm:ss'),
    });
  }
  
  // 获取学员信息并设置单选按钮选项
  const getStudentInfo = async () => {
    if (renderData.id) {
      try {
        const response = await request.get('/sms/business/bizStudentUser', {
          studentId: renderData.id
        });
        
        const consultationData = response.data.content || [];
        const jobOptions = Dictionaries.getCascader('dict_reg_job') || [];
        
        // 处理咨询数据，匹配岗位信息
        const options = consultationData.map((consult: any) => {
          // 查找匹配的岗位信息
          let projectName = '';
          let jobName = '';
          
          // 遍历岗位选项找到匹配的项目和岗位
          jobOptions.forEach((category: any) => {
            if (category.children) {
              const matchedJob = category.children.find((job: any) => job.value === consult.project);
              if (matchedJob) {
                projectName = category.label;
                jobName = matchedJob.label;
              }
            }
          });
          
          return {
            id: consult.id,
            projectName,
            jobName,
            consultationTime: consult.consultationTime,
            value: consult.id,
            label: `${projectName} - ${jobName}`,
            timeText: moment(consult.consultationTime).format('YYYY-MM-DD HH:mm')
          };
        });
        
        setConsultationOptions(options);
        
        // 默认选择第一个选项
        if (options.length > 0) {
          formRef?.current?.setFieldsValue({
            studentUserId: options[0].id
          });
        }
      } catch (error) {
        console.error('获取学员信息失败:', error);
        message.error('获取学员信息失败');
      }
    }
  };
  
  // 组件挂载时立即执行数据获取
  useEffect(() => {
    getPersonVisitTimeout();
    getStudentInfo();
  }, []);

  useEffect(() => {
    StudentId &&
      formRef?.current?.setFieldsValue({
        studentName: StudentId.name,
      });
  }, [StudentId]);
  
  useEffect(() => {
    getPersonVisitTimeout();
  }, []);

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
        values.updateBy = initialState?.currentUser?.userid;
        
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
            setStudentModalsVisible(true);
          }}
        >
          选择
        </Button>
      </ProForm.Group>
      
      {/* 所属跟进项目 */}
      {consultationOptions.length > 0 && (
        <ProForm.Group>
          <ProForm.Item
            name="studentUserId"
            label="项目"
            rules={[{ required: true, message: '请选择所属跟进项目' }]}
          >
            {/* <Card size="small" title="请选择所属跟进项目" style={{ marginBottom: 16, width: '100%' }}> */}
              <Radio.Group style={{ width: '100%' }}>
                <Row gutter={[16, 16]}>
                  {consultationOptions.map(option => (
                    <Col span={24} key={option.id}>
                      <Radio value={option.id} style={{ width: '100%', padding: '12px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{option.label}</div>
                          <div style={{ color: '#999', fontSize: '12px' }}>咨询时间: {option.timeText}</div>
                        </div>
                      </Radio>
                    </Col>
                  ))}
                </Row>
              </Radio.Group>
            {/* </Card> */}
          </ProForm.Item>
        </ProForm.Group>
      )}
      
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
        placeholder="请输入本次跟进的具体内容"
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