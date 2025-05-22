import {
    ProForm,
    ProFormGroup,
    ProFormList,
    ProFormSelect,
    ProFormCascader,
    ProFormDigit,
    ProFormText,
    ProFormInstance
} from '@ant-design/pro-form';
import ProCard from '@ant-design/pro-card';
import Dictionaries from '@/services/util/dictionaries';
import request from '@/services/ant-design-pro/apiRequest';
import { useEffect, useRef, useState } from 'react';
import UserTreeSelect from '@/components/ProFormUser/UserTreeSelect';
import { Button } from 'antd';
import { useModel } from 'umi';

export default (props: any) => {
    const { renderData } = props
    const userRefs: any = useRef(null);
    const { initialState } = useModel('@@initialState');
    const [userNameIds, setUserNameIds] = useState<any>();
    const formRef = useRef<ProFormInstance>();

    //posForm表单初始值
    const typeClass = [{
        project: Dictionaries.getCascaderValue('dict_reg_job', renderData.project),
        JobClassExam: '',
        quantity: 1,
        receivable: '',
        discount: '',
        source: Dictionaries.getName('dict_source', renderData.source),
        discountRemark: '',
        provider: renderData.providerName,
    },]
    // useEffect(()=>{
    //     console.log(formRef?.current?.getFieldValue('users'),'====>')
    // })
    useEffect(() => {
        let data = {}
        if (renderData.provider) {
            data = {
                id: renderData.provider,
                name: renderData.providerName
            }
        } else {
            data = {
                name: initialState?.currentUser?.name,
                id: initialState?.currentUser?.userid,
            }
        }
        userRefs?.current?.setDepartment(data);
    }, [renderData])
    //班型
    const [JobClassExam, setJobClassExam] = useState<any>([]);
    const filter = (inputValue: string, path: any[]) => {
        return path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
    };

    const handleChangeProject = (e: any, index: number) => {
        console.log(e,index, '====>')
    }
    //获取班型
    const getJobClassExam = async () => {
        let res = await request.get(
            '/sms/business/bizChargeStandard?project=' + renderData.project + '&useNum=0&_size=999&enable=true',
        )
        //将请求到的班型解析成需要下拉的数据
        projectClassExamListFn(res.data.content)
    }

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
                }),
            });
        });
        
        setJobClassExam(arr)
        return arr;
    }
    //页面进入初始调用获取班型
    useEffect(() => {
        getJobClassExam()
    }, [renderData.project])
    return (
        <ProForm
            formRef={formRef}
            submitter={false} onFinish={async (e) => console.log(e)}>
            <ProFormList
                name="users"
                initialValue={typeClass}
                creatorButtonProps={{
                    creatorButtonText: '新增一条班型信息',
                }}
                creatorRecord={{
                    project: Dictionaries.getCascaderValue('dict_reg_job', renderData.project),
                    quantity: 1,
                    source: Dictionaries.getName('dict_source', renderData.source),
                }}
                itemRender={({ listDom, action }, { record, index }) => {
                    return (
                        <ProCard
                            bordered
                            title={'报考班型'}
                            extra={action}
                            style={{
                                marginBlockEnd: 8,
                            }}
                        >
                            <ProFormGroup key={index}>
                                <ProForm.Group>
                                    <ProFormCascader
                                        width="sm"
                                        name="project"
                                        placeholder="咨询报考岗位"
                                        label="报考岗位"
                                        rules={[{ required: true, message: '请选择报考岗位' }]}
                                        fieldProps={{
                                            options: Dictionaries.getCascader('dict_reg_job'),
                                            showSearch: { filter },
                                            onChange: (e: any) => { handleChangeProject(e, index) }
                                            // onSearch: (value) => console.log(value)
                                        }}
                                    />
                                    <ProFormSelect
                                        label="班型选择"
                                        name="JobClassExam"
                                        fieldProps={{
                                            options: JobClassExam,
                                            showSearch: true,
                                            onSelect: (e: string) => {
                                                //console.log(e, '班型选择')
                                                const arr = JSON.parse(e)
                                                //console.log(arr.receivable,'arr====>')
                                                const b = formRef?.current?.getFieldValue('users');
                                                //console.log(b,'b======b')
                                                setTimeout(() => {
                                                    b[index].receivable = arr.receivable
                                                }, 100)

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
                                    >
                                        取消
                                    </Button>

                                    <ProFormDigit
                                        name="quantity"
                                        width="sm"
                                        label="报名人数"
                                        fieldProps={{
                                            onChange: (e: any) => { },
                                        }}
                                        rules={[{ required: true, message: '请填写报名人数' }]}
                                    />

                                    <ProFormDigit
                                        name="receivable"
                                        label="收费标准"
                                        width="sm"
                                        fieldProps={{
                                            onChange: (e: any) => { },
                                        }}
                                        rules={[{ required: true, message: '请输入金额' }]}
                                    />

                                    <ProFormSelect
                                        label="订单来源"
                                        name="source"
                                        placeholder="请选择订单来源"
                                        width="sm"
                                        rules={[{ required: true, message: '请选择订单来源' }]}
                                        request={async () => Dictionaries.getList('dict_source') as any}
                                    />
                                    <ProFormDigit
                                        name="discount"
                                        label="订单优惠金额"
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
                                        rules={[
                                        ]}
                                    />
                                    <UserTreeSelect
                                        ref={userRefs}
                                        width='sm'
                                        userLabel={'信息提供人'}
                                        userNames="provider"
                                        userPlaceholder="请输入信息提供人"
                                        setUserNameId={(e: any) => setUserNameIds(e)}
                                        // setDepartId={(e: any) => setDepartId(e)}
                                        flag={true}
                                    // setFalgUser={(e: any) => setFalgUser(e)}
                                    />
                                </ProForm.Group>
                            </ProFormGroup>
                        </ProCard>
                    );
                }}
            >
            </ProFormList>
        </ProForm>
    );
}