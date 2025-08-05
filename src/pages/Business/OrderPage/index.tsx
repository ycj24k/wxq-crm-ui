import ProCard from '@ant-design/pro-card';
import { PageContainer } from '@ant-design/pro-layout';
import ProForm, {
    ProFormText,
    ProFormSelect,
    ProFormCascader,
} from '@ant-design/pro-form';
import { Button, Modal } from 'antd';
import { useRef, useState } from 'react';
import Dictionaries from '@/services/util/dictionaries';
export default () => {
    const formRef = useRef();
    const [findStudent, setFindStudent] = useState<boolean>(false)
    const filter = (inputValue: string, path: any[]) => {
        return path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
    };
    const handleSelect = () => {
        setFindStudent(true)
    };
    return (
        <PageContainer>
            <ProCard>
                <ProForm<{
                    mobile: string;
                }>
                    formRef={formRef}
                    submitter={{
                        render: (props, doms) => {
                            return [
                                <Button htmlType="button" onClick={handleSelect} key="edit">
                                    查询下单
                                </Button>
                            ];
                        },
                    }}
                >
                    <ProForm.Group>
                        <ProFormText
                            width="md"
                            name="mobile"
                            label="联系方式"
                            placeholder="请输入联系方式"
                        />
                    </ProForm.Group>
                </ProForm>



                <ProForm<{
                    mobile: string;
                }>
                    formRef={formRef}
                    layout="horizontal"
                    submitter={{
                        render: (props, doms) => {
                            return [
                                <Button htmlType="button" onClick={handleSelect} key="edit">
                                    查询下单
                                </Button>
                            ];
                        },
                    }}
                >
                    <ProForm.Group>
                        <ProFormSelect
                            label="学员类型"
                            name="type"
                            width="md"
                            request={async () => Dictionaries.getList('studentType') as any}
                            fieldProps={{
                                onChange: (e) => {
                                },
                            }}
                            rules={[{ required: true, message: '请选择学员类型' }]}
                        />
                    </ProForm.Group>
                    <ProForm.Group>
                        <ProFormText
                            width="md"
                            name="mobile"
                            label="联系方式"
                            placeholder="请输入联系方式"
                        />
                    </ProForm.Group>
                    <ProForm.Group>
                        <ProFormText
                            width="md"
                            name="mobile"
                            label="联系方式"
                            placeholder="请输入联系方式"
                        />
                    </ProForm.Group>
                    <ProForm.Group>
                        <ProFormSelect
                            label="客户来源"
                            name="source"
                            width="md"
                            rules={[{ required: true, message: '请选择客户来源' }]}
                            request={async () => Dictionaries.getList('dict_source') as any}
                        />
                    </ProForm.Group>
                    <ProForm.Group>
                        <ProFormCascader
                            width="md"
                            name="project"
                            placeholder="咨询报考岗位"
                            label="报考岗位"
                            rules={[{ required: true, message: '请选择报考岗位' }]}
                            fieldProps={{
                                options: Dictionaries.getCascader('dict_reg_job'),
                                showSearch: { filter },
                                onChange: (e: any) => { }
                                // onSearch: (value) => console.log(value)
                            }}
                        />
                    </ProForm.Group>
                </ProForm>
            </ProCard>

            <Modal
                title="查询结果"
                onCancel={() => {
                    setFindStudent(false)
                }}
                onOk={() => {
                    setFindStudent(false)
                }}
                open={findStudent}
            >
                <p>学员资料不存在，请完善资料后再下单</p>
            </Modal>
        </PageContainer>
    );
};
