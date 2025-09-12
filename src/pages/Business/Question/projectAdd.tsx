import { useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import ProForm, {
    ModalForm,
    ProFormText,
    ProFormCascader,
    ProFormSelect,
    ProFormTreeSelect
} from '@ant-design/pro-form';
import Dictionaries from '@/services/util/dictionaries';
import type { ProFormInstance } from '@ant-design/pro-form';
import requestApi from '@/services/ant-design-pro/apiRequest';
import request from '@/services/ant-design-pro/apiRequest';

export default (props: any) => {
    const { renderData, Subjectlist } = props;
    //subjectId  当type为题库时subjectId可不填，题库时subjectId必填
    const [type, setType] = useState<string>('')
    //保存agentId
    const [agentId, setAgentId] = useState<string>('')
    //存储课程列表数据
    const [projectList, setProjectList] = useState<any[]>([])
    //存储科目列表数据
    const [SubjectList, setSubjectList] = useState<any[]>([])
    //存储题库/课程列表数据
    const [subjectID, setSubjectID] = useState<string>('')
    //存储题库列表数据
    const [Courselist, setCourselist] = useState<any[]>([])

    useEffect(() => {
        //编辑并且是02课程
        if (renderData.typeEdit == '1' && renderData.type == '03') {
            setType('03')
            getProject(renderData.agentId)
            getSubject(renderData.agentId, renderData.productId)
            setTimeout(() => {
                formRef?.current?.setFieldsValue({
                    ...renderData,
                    subjectId: Dictionaries.getNameBySubjectName(Subjectlist, renderData.subjectId),
                    project: Dictionaries.getCascaderValue('dict_reg_job', renderData.project),

                });
            }, 100);
        } else if (renderData.typeEdit == '1' && renderData.type == '02') {//编辑并且是01题库
            setType('02');
            setAgentId(renderData.agentId);
            // 使用异步函数处理数据加载和表单设置
            const loadDataAndSetForm = async () => {
                try {
                    // 获取题库列表数据
                    const courseData = await getTikulist(renderData.agentId);
                    // 查找完整路径
                    const nodePath = Dictionaries.findFullPath(courseData, renderData.productId);
                    // 设置表单值
                    formRef?.current?.setFieldsValue({
                        ...renderData,
                        productId: {
                            value: renderData.productId,
                            label: nodePath ? nodePath.join(' / ') : renderData.productId
                        },
                        project: Dictionaries.getCascaderValue('dict_reg_job', renderData.project),
                    });
                    // 更新 Courselist 状态
                    setCourselist(courseData);
                } catch (error) {
                    message.error("加载题库数据失败，请重试");
                }
            };

            loadDataAndSetForm();
        }
        else if (renderData.typeEdit == '0') {//添加
            setTimeout(() => {
                formRef?.current?.setFieldsValue({});
            }, 100);
        }
    }, [])

    useEffect(() => {
        if (agentId && type == '03') {
            getProject(agentId)
        }
        if (agentId && type == '02') {
            getTikulist(agentId)
        }
        if (agentId && subjectID) {
            getSubject(agentId, subjectID)
        }
    }, [type, subjectID, agentId])

    const filter = (inputValue: string, path: any[]) => {
        return path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
    };
    //获取题库/课程
    const getProject = (agentId: string) => {
        requestApi.get(`/sms/business/bizQuestionAccredit/getCourseList/${agentId}`).then(res => {
            const newArr = res.data.map((item: any) => {
                return {
                    label: item.title,
                    value: item.id,
                }
            })
            setProjectList(newArr)
        })
    }
    //获取科目
    const getSubject = (agentId: string, courseId: string) => {
        requestApi.get(`/sms/business/bizQuestionAccredit/getCourseSubjectList/${agentId}/${courseId}`).then(res => {
            const newArr = res.data.map((item: any) => {
                return {
                    label: item.title,
                    value: item.id,
                }
            })
            setSubjectList(newArr)
        })
    }
    //获取课程
    const getTikulist = async (agentId: string) => {
        try {
            const res = await requestApi.get(`/sms/business/bizQuestionAccredit/getSubjectTreeList/${agentId}`);
            const newArr1 = Dictionaries.addLabelToChildren(res.data);
            setCourselist(newArr1);
            return newArr1; // 返回处理后的数据
        } catch (error) {
            return [];
        }
    }


    const { modalVisible, setModalVisible, callbackRef } = props;
    const formRef = useRef<ProFormInstance>();
    const [loading, setLoading] = useState<boolean>(false);
    return (
        <ModalForm
            title={renderData.typeEdit == '1' ? '编辑' : '新增'}
            formRef={formRef}
            visible={modalVisible}
            width={500}
            autoFocusFirstInput
            modalProps={{
                onCancel: () => setModalVisible(),
                destroyOnClose: true,
            }}
            onFinish={async (values: any) => {
                if (renderData.typeEdit == '1' && renderData.id) {
                    values.id = renderData.id
                }
                let productID
                if (values.type == '02') {
                    productID = values.productId.value
                }

                if (values.type == '03') {
                    productID = values.productId
                }
                const submitData = {
                    ...values,
                    productId: productID,
                    project: values.project[1],
                };
                if (loading) return
                else setLoading(true)
                message.loading("加载中", 0)
                if (renderData?.record) {
                    console.log('有record')
                    request
                        .postAll(`/sms/business/bizOrder/questionAccredit/${renderData.record}`, submitData)
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
                            message.error('操作失败')
                            return false;
                        });
                } else {
                    requestApi
                        .post('/sms/business/bizQuestionAccredit', submitData)
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
                }
            }}
        >
            <ProForm.Group>
                <ProFormSelect
                    label="小程序"
                    name="agentId"
                    width="md"
                    request={async () => {
                        try {
                            const res = await requestApi.get('/sms/business/bizQuestionAccredit/getAgentList');
                            localStorage.setItem('agentId', JSON.stringify(res.data))
                            if (res && res.data) {
                                return res.data.map((item: any) => ({
                                    label: item.name,
                                    value: item.id,
                                }));
                            }
                            return [];
                        } catch (error) {
                            message.error(`获取小程序列表失败:${error}`);
                            return [];
                        }
                    }}
                    fieldProps={{
                        showSearch: true,
                        filterOption: (input: string, option: any) =>
                            option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0,
                        onChange: (e) => {
                            setAgentId(e)
                        }
                    }}
                    rules={[
                        {
                            required: true,
                            message: '请选择小程序',
                        },
                    ]}
                />
            </ProForm.Group>
            <ProForm.Group>
                <ProFormSelect
                    label="类型"
                    name="type"
                    width="md"
                    options={[
                        { label: '题库', value: '02' },
                        { label: '课程', value: '03' }
                    ]}
                    fieldProps={{
                        onChange: setType
                    }}
                    rules={[
                        {
                            required: true,
                            message: '请选择类型',
                        },
                    ]}
                />
            </ProForm.Group>

            {type == '02' && (
                <ProForm.Group>
                    <ProFormTreeSelect
                        label="题库"
                        name="productId"
                        placeholder="请选择题库"
                        allowClear
                        width={330}
                        secondary
                        request={async () => {
                            if (Courselist.length === 0 && agentId) {
                                // 如果 Courselist 为空且有 agentId，则获取数据并直接返回
                                return await getTikulist(agentId);
                            }
                            return Courselist;
                        }}
                        fieldProps={{
                            placeholder: '请选择题库',
                            labelInValue: true,
                            treeDefaultExpandAll: false,
                            showSearch: true,
                            treeNodeFilterProp: 'label',
                            onChange: (value, labelList) => {
                                // 获取选中节点的完整路径并设置回表单
                                if (value && value.value) {
                                    const nodePath = Dictionaries.findNodePath(Courselist, value.value);
                                    if (nodePath && nodePath.length > 0) {
                                        const pathString = nodePath.join('/');
                                        // 设置回表单字段
                                        formRef.current?.setFieldsValue({
                                            productId: {
                                                value: value.value,
                                                label: pathString
                                            }
                                        });
                                    }
                                }
                            }
                        }}
                        rules={[
                            {
                                required: true,
                                message: '请选择题库',
                            },
                        ]}
                    />
                </ProForm.Group>
            )}



            {type == '03' ? (
                <ProForm.Group>
                    <ProFormSelect
                        label="课程"
                        name="productId"
                        width="md"
                        options={projectList}
                        fieldProps={{
                            showSearch: true,
                            filterOption: (input: string, option: any) =>
                                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0,
                            placeholder: '请选择题库/课程',
                            loading: projectList.length === 0 && !!agentId,
                            onChange: (e) => {
                                setSubjectID(e)
                                if (renderData.typeEdit == '1' && renderData.type == '03') {
                                    getSubject(renderData.agentId, e)
                                }
                            }
                        }}
                        rules={[
                            {
                                required: true,
                                message: '请选择题库/课程',
                            },
                        ]}
                    />
                </ProForm.Group>
            ) : null}

            {type == '03' ? (
                <ProForm.Group>
                    <ProFormSelect
                        label="科目"
                        name="subjectId"
                        width="md"
                        options={SubjectList}
                        fieldProps={{
                            showSearch: true,
                            filterOption: (input: string, option: any) =>
                                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0,
                            placeholder: '科目',
                        }}

                        rules={[
                            {
                                required: type === '03' ? true : false,
                                message: '请选择科目',
                            },
                        ]}
                    />
                </ProForm.Group>
            ) : null}

            <ProForm.Group>
                <ProFormText
                    label="授权天数"
                    name="days"
                    width="md"
                    rules={[
                        {
                            required: true,
                            message: '请填写授权天数',
                        },
                    ]}
                />
            </ProForm.Group>
            <ProForm.Group>
                <ProFormCascader
                    width={"md"}
                    name="project"
                    placeholder="选择报考岗位"
                    label="报考岗位"
                    rules={[{ required: true, message: '请选择报考岗位' }]}
                    fieldProps={{
                        options: Dictionaries.getCascader('dict_reg_job'),
                        showSearch: { filter }
                    }}

                />
            </ProForm.Group>
        </ModalForm>
    );
};