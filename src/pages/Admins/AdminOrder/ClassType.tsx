import {
    ProForm,
    ProFormGroup,
    ProFormList,
    ProFormSelect,
    ProFormCascader,
    ProFormDigit,
    ProFormText,
    ProFormInstance,
    ProFormTreeSelect
} from '@ant-design/pro-form';
import ProCard from '@ant-design/pro-card';
import Dictionaries from '@/services/util/dictionaries';
import request from '@/services/ant-design-pro/apiRequest';
import React, { forwardRef, useImperativeHandle, useEffect, useRef, useState } from 'react';
import { Button, message } from 'antd';

let JobClassExamA: any[] = [];
let quantitys: any[] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let comNumbers: any[] = [0, 0, 0, 0, 0, 0, 0, 0, 0];


interface ClassListMethods {
    getFormValues: () => Promise<any>;
    resetForm: () => void;
}


interface ClassListProps {
    renderData?: any;
    onAddClassType?: () => void;
    onRemoveClassType?: (index: number) => void;
    onTotalPriceChange?: (price: number) => void;
    onTotalQuantityChange?: (quantity: number) => void;
}

const ClassList = forwardRef<ClassListMethods, ClassListProps>((props, ref) => {
    const { renderData, onTotalPriceChange, onTotalQuantityChange, onAddClassType, onRemoveClassType } = props;

    useImperativeHandle(ref, () => ({
        getFormValues: async () => {
            try {
                // 执行表单验证
                const values = await formRef.current?.validateFields();
                return values;
            } catch (error) {
                // 显示验证错误信息
                if (error && error.errorFields) {
                    // 获取第一个错误信息并显示
                    const firstError = error.errorFields[0];
                    message.error(firstError.errors[0] || '表单验证失败');
                } else {
                    message.error('表单验证失败，请检查表单填写是否完整');
                }
                // 重新抛出错误，确保调用方知道验证失败
                throw error;
            }
        },
        resetForm: () => {
            // 重置表单数据
            formRef.current?.resetFields();
            // 重置状态
            setTotalPrice(0);
            setTotalQuantity(0);
            // 重置班型数据
            setJobClassExam([]);
            // 保留第一行，但重置其值
            const initialUsers = [{
                project: [],
                quantity: 1,
                receivable: 0,
                discount: 0,
                discountRemark: '',
                source: ''
            }];
            formRef.current?.setFieldsValue({
                users: initialUsers
            });
        }
    }));
    const [userNameId, setUserNameId] = useState<any>();
    const [orderList, setOrderList] = useState<any>([]);
    const [JobClassExam, setJobClassExam] = useState<any>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [totalQuantity, setTotalQuantity] = useState<number>(0);
    const formRef = useRef<ProFormInstance>(null);
    const userRef = useRef<any>(null);

    useEffect(() => {
        formRef?.current?.setFieldsValue({
            provider: userNameId?.id,
        });
    }, [userNameId])
    useEffect(() => {
        // 即使renderData不存在或不包含project字段，也继续初始化
        if (!renderData) {
            // 初始化一个空的用户列表，确保表单能够正常显示
            formRef?.current?.setFieldsValue({
                users: [{
                    project: [],
                    quantity: 1,
                    receivable: 0,
                    discount: 0,
                    discountRemark: '',
                    //source: ''
                }]
            });
            return;
        }

        // 如果renderData.project存在，则处理项目变更
        if (renderData.project) {
            handleChangeProject([renderData.project], 0);
        }

        let list: any = [];
        const orderList = [renderData];
        setOrderList(orderList);

        orderList.forEach(async (item: any, index: number) => {
            if (item.project) {
                handleChangeProject([item.project], index);
            }
            quantitys[index] = item.quantity || 1;
            comNumbers[index] = item.receivable || 0;
            list.push({
                project: item.project ? Dictionaries.getCascaderValue('dict_reg_job', item.project) : [],
                quantity: item.quantity || 1,
                receivable: item.receivable || 0,
                discount: item.discount || 0,
                source: item.studentSource ? Dictionaries.getName('dict_source', item.studentSource) : undefined,
                // source: item.source ? item.source.toString() : undefined,
                discountRemark: item.discountRemark || '',
                provider: { "value": renderData.provider },
                studentUserId: item.id || null
            });
        });

        setTimeout(async () => {
            formRef?.current?.setFieldsValue({
                ...renderData,
                percent: renderData.percent ? renderData.percent * 100 : 0,
                quantity: quantitys.length > 0 ? eval(quantitys.join('+')) : 1,
                project: renderData.project ? Dictionaries.getCascaderValue('dict_reg_job', renderData.project) : [],
                users: list,
                provider: renderData.provider,
            });

            if (renderData.provider && renderData.providerName) {
                const data = {
                    id: renderData.provider,
                    name: renderData.providerName
                }
                userRef?.current?.setDepartment(data);
                setUserNameId(data)
            }
        }, 500);

    }, [renderData])

    const filter = (inputValue: string, path: any[]) => {
        return path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
    };

    const handleChangeProject = async (value: any, index: number) => {
        // 即使value不存在，也重置相关字段
        formRef?.current?.setFieldsValue({ JobClassExam: '', receivable: 0 });
        const arr = JSON.parse(JSON.stringify(JobClassExam));

        // 如果value存在且有长度，则获取对应的班型数据
        if (value && value.length > 0) {
            try {
                const response = await request.get(
                    '/sms/business/bizChargeStandard?project=' +
                    value[value.length - 1] +
                    '&useNum=0&_size=999&enable=true',
                );

                const data = response.data.content;

                if (data && data.length > 0) {
                    arr[index] = projectClassExamListFn(data);
                    JobClassExamA[index] = projectClassExamListFn(data);
                } else {
                    arr[index] = null;
                }
            } catch (error) {
                console.error('获取班型数据失败:', error);
                arr[index] = null;
            }
        } else {
            // 如果value不存在，设置为null但不阻止渲染
            arr[index] = null;
        }

        // 确保 renderData 存在，否则使用空对象
        const safeRenderData = renderData || {};

        setTimeout(() => {
            try {
                // 安全处理 type 属性
                const renderType = safeRenderData.type || '';
                if (renderType !== 'order') {
                    setJobClassExam(arr);
                } else {
                    setJobClassExam(JobClassExamA);
                }
            } catch (error) {
                console.error('设置班型数据失败:', error);
                // 默认设置 arr 作为回退
                setJobClassExam(arr);
            }
        }, 100);
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
        return arr;
    }

    //获取部门
    const getDepartment = async () => {
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

    return (
        <ProForm
            formRef={formRef}
            submitter={false}
            onFinish={async (e: any) => console.log(e)}>
            <ProFormList
                name="users"
                creatorButtonProps={{
                    creatorButtonText: '新增一条班型信息',
                }}
                creatorRecord={() => {
                    // 创建一个新记录时的默认值
                    const defaultRecord = {
                        project: renderData?.project ?
                            Dictionaries.getCascaderValue('dict_reg_job', renderData.project) :
                            [],
                        quantity: 1,
                        source: renderData?.source ? renderData.source.toString() : undefined,
                        provider: {
                            value: renderData?.provider ?? null
                        },
                        receivable: 0,
                        studentUserId: renderData?.id ?? null,
                        discount: 0,
                        discountRemark: '',
                        JobClassExam: null // 确保班型选择字段存在但初始为null
                    };

                    // 如果没有renderData，也要确保返回一个有效的记录
                    if (!renderData) {
                        return {
                            ...defaultRecord,
                            project: [], // 空数组作为初始值，确保下拉框可以显示
                            source: '',
                            provider: { value: null },
                            studentUserId: null
                        };
                    }

                    return defaultRecord;
                }}
                actionGuard={{
                    beforeAddRow: async (defaultValue, insertIndex) => {
                        try {
                            // 安全处理project不存在的情况
                            const projectValue = renderData?.project || [];
                            await handleChangeProject(
                                Array.isArray(projectValue) ? projectValue : [projectValue],
                                insertIndex as number
                            );

                            // 调用父组件传入的回调函数，通知需要添加支付方式
                            if (onAddClassType) {
                                onAddClassType();
                            }
                        } catch (error) {
                            console.error('添加行时处理项目失败:', error);
                        }
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                // 添加行后，重新计算总receivable
                                const users = formRef?.current?.getFieldValue('users') || [];
                                const receivableSum = users.reduce((total: number, user: any) => {
                                    return total + (Number(user.receivable) || 0);
                                }, 0);
                                const quantitySum = users.reduce((total: number, user: any) => {
                                    return total + (Number(user.quantity) || 0);
                                }, 0);
                                setTotalPrice(receivableSum);
                                setTotalQuantity(quantitySum);
                                onTotalPriceChange?.(receivableSum);
                                onTotalQuantityChange?.(quantitySum);
                                formRef?.current?.setFieldsValue({
                                    receivable: receivableSum,
                                    quantity: quantitySum
                                });
                                resolve(true);
                            }, 1000);
                        });
                    },
                    beforeRemoveRow: async (index) => {
                        return new Promise((resolve) => {
                            if (index === 0) {
                                message.error('这行不能删');
                                resolve(false);
                                return;
                            }

                            // 先通知父组件删除对应的支付方式
                            if (props.onRemoveClassType) {
                                props.onRemoveClassType(index);
                            }

                            // 删除行后，重新计算总receivable
                            const users = formRef?.current?.getFieldValue('users') || [];
                            // 模拟删除该行后的数组
                            const newUsers = [...users];
                            newUsers.splice(index, 1);
                            const receivableSum = newUsers.reduce((total: number, user: any) => {
                                return total + (Number(user.receivable) || 0);
                            }, 0);
                            const quantitySum = newUsers.reduce((total: number, user: any) => {
                                return total + (Number(user.quantity) || 0);
                            }, 0);
                            setTotalPrice(receivableSum);
                            setTotalQuantity(quantitySum);
                            onTotalPriceChange?.(receivableSum);
                            onTotalQuantityChange?.(quantitySum);

                            setTimeout(() => {
                                formRef?.current?.setFieldsValue({
                                    receivable: receivableSum,
                                    quantity: quantitySum
                                });
                                resolve(true);
                            }, 100);
                        });
                    },
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
                                    {/* 报考岗位下拉框，无条件渲染 */}
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

                                    {/* 班型选择，有条件渲染 */}
                                    {JobClassExam[index] ? (<>
                                        <ProFormSelect
                                            label="班型选择"
                                            name="JobClassExam"
                                            fieldProps={{
                                                options: JobClassExam[index],
                                                showSearch: true,
                                                onSelect: (e: string) => {
                                                    try {
                                                        const arr = JSON.parse(e);
                                                        if (!arr || typeof arr !== 'object') {
                                                            throw new Error('Invalid data format');
                                                        }
                                                        const users = formRef?.current?.getFieldValue('users') || [];
                                                        if (!Array.isArray(users)) {
                                                            throw new Error('Users data is not an array');
                                                        }
                                                        // 创建新数组，确保React能检测到状态变化
                                                        const newUsers = [...users];
                                                        newUsers[index] = {
                                                            ...newUsers[index],
                                                            receivable: arr.receivable || 0
                                                        };

                                                        // 使用setFieldsValue更新表单状态
                                                        formRef?.current?.setFieldsValue({
                                                            users: newUsers
                                                        });

                                                        // 计算所有receivable和quantity的总和
                                                        const receivableSum = newUsers.reduce((total, user) => {
                                                            return total + (Number(user.receivable) || 0);
                                                        }, 0);
                                                        const quantitySum = newUsers.reduce((total, user) => {
                                                            return total + (Number(user.quantity) || 0);
                                                        }, 0);

                                                        // 更新状态和回调
                                                        setTotalPrice(receivableSum);
                                                        setTotalQuantity(quantitySum);
                                                        onTotalPriceChange?.(receivableSum);
                                                        onTotalQuantityChange?.(quantitySum);

                                                        // 更新表单字段
                                                        formRef?.current?.setFieldsValue({
                                                            receivable: receivableSum,
                                                            quantity: quantitySum
                                                        });
                                                    } catch (error) {
                                                        message.error('操作失败，请重试');
                                                    }
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
                                            disabled={true}
                                            fieldProps={{
                                                onChange: (e: any) => { },
                                            }}
                                            rules={[{ required: true, message: '请填写报名人数' }]}
                                        />

                                        <ProFormDigit
                                            name="receivable"
                                            label="收费标准"
                                            width="sm"
                                            disabled={JobClassExam[index]}
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
                                            allowClear={true}
                                            fieldProps={{
                                                showSearch: true,
                                                placeholder: '请选择订单来源',
                                            }}
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
                                        <ProFormText
                                            name="studentUserId"
                                            hidden={true}
                                            label="订单优惠原因"
                                            width="sm"
                                            fieldProps={{
                                                autoComplete: 'no',
                                            }}
                                            rules={[
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
                                            required
                                            fieldProps={{
                                                treeDefaultExpandAll: true,
                                                filterTreeNode: true,
                                                showSearch: true,
                                                dropdownMatchSelectWidth: false,
                                                labelInValue: true,
                                                treeNodeFilterProp: 'title',
                                                fieldNames: {
                                                    label: 'title',
                                                },

                                            }}
                                        />
                                    </>) : (
                                        <span style={{ display: 'inline-block', marginTop: '32px' }}>
                                            该项目尚未设置收费标准,请联系管理员设置!
                                        </span>
                                    )}

                                </ProForm.Group>
                            </ProFormGroup>
                        </ProCard>
                    );
                }}
            >
            </ProFormList>
        </ProForm>
    );
})

export default ClassList;