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
import { useEffect, useRef, useState } from 'react';
import { Button, message } from 'antd';

let JobClassExamA: any[] = [];
let quantitys: any[] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let comNumbers: any[] = [0, 0, 0, 0, 0, 0, 0, 0, 0];


export default (props: any) => {
    const { renderData, onTotalPriceChange, onTotalQuantityChange } = props
    const [userNameId, setUserNameId] = useState<any>();
    const [orderList, setOrderList] = useState<any>([]);
    const [JobClassExam, setJobClassExam] = useState<any>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [totalQuantity, setTotalQuantity] = useState<number>(0);
    const formRef = useRef<ProFormInstance>(null);
    const userRef = useRef<any>(null);


    useEffect(() => {
        handleChangeProject([renderData.project], 0)
        let list: any = [];
        const orderList = [renderData];
        setOrderList(orderList);

        orderList.forEach(async (item: any, index: number) => {
            handleChangeProject([item.project], index);
            quantitys[index] = item.quantity;
            comNumbers[index] = item.receivable;
            list.push({
                project: Dictionaries.getCascaderValue('dict_reg_job', item.project),
                quantity: 1,
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
                project: Dictionaries.getCascaderValue('dict_reg_job', renderData.project),
                users: list,
                provider: renderData.provider,
            });
            const data = {
                id: renderData.provider,
                name: renderData.providerName
            }
            userRef?.current?.setDepartment(data);
            setUserNameId(data)
        }, 500);

    }, [])

    const filter = (inputValue: string, path: any[]) => {
        return path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
    };

    const handleChangeProject = async (value: any, index: number) => {
        if (!value) return;
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
        // let standardsLsit = formRef?.current?.getFieldValue('users')
        //     ? formRef?.current?.getFieldValue('users')
        //     : [];

        // if (standardsLsit[index]) {
        //     standardsLsit[index].JobClassExam = undefined;
        // }

        setTimeout(() => {
            if (renderData.type != 'order') {
                setJobClassExam(arr);
            } else {
                setJobClassExam(JobClassExamA);
            }

            // formRef?.current?.setFieldsValue({
            //     users: standardsLsit,
            // });

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
    const handleChangeData = (data: any) => {
        const processedUsers = data.users.map((user: any) => {
            // 解析 JobClassExam JSON
            const jobClassData = user.JobClassExam 
                ? JSON.parse(user.JobClassExam)
                : { classType: 0, examType: 0, classYear: 0, project: '' };
            
            // 处理 project 数组
            const projectId = Array.isArray(user.project) 
                ? user.project[user.project.length - 1] 
                : user.project;
            
            // 处理 provider 对象
            const providerValue = user.provider && typeof user.provider === 'object' 
                ? user.provider.value 
                : user.provider;
            
            return {
                classType: jobClassData.classType || 0,
                classYear: jobClassData.classYear || 0,
                examType: jobClassData.examType || 0,
                project: projectId,
                provider: providerValue,
                quantity: user.quantity || 0,
                receivable: user.receivable || 0,
                source: user.source || '0',
                discount: user.discount || 0,
                studentUserId: renderData.studentUserId || 0
            };
        });
        
        console.log('Processed users:', processedUsers);
        return processedUsers;
    }
    
    // users:[
    //     {
    //         classType: 18,
    //         classYear: 0,
    //         discount: 0,
    //         examType: 4,
    //         project: "00536a6a3b5c3bd9ad82957ec7f69105",
    //         provider: 143,
    //         quantity: 1,
    //         receivable: 300,
    //         source: "6",
    //         studentUserId: 12927,
    //     }
    // ]

    // [
    //     {
    //         JobClassExam: "{\"classType\":0,\"examType\":1,\"classYear\":0,\"receivable\":350,\"project\":\"3ea3ddc2b637daedec8a413ed36fbd48\"}",
    //         discount: 0,
    //         project: ['234338f798454e69bd9cd986311a634b', '3ea3ddc2b637daedec8a413ed36fbd48'],
    //         provider: {value: 2},
    //         quantity: 1,
    //         receivable: 350,
    //         source: "0"
    //     }
    // ];
    return (
        <ProForm
            formRef={formRef}
            onFinish={async (e: any) => handleChangeData(e)}>
            <ProFormList
                name="users"
                // initialValue={typeClass}
                creatorButtonProps={{
                    creatorButtonText: '新增一条班型信息',
                }}
                creatorRecord={{
                    project: Dictionaries.getCascaderValue('dict_reg_job', renderData.project),
                    quantity: 1,
                    source: renderData.source + '',
                    provider: { value: renderData.provider }
                }}
                actionGuard={{
                    beforeAddRow: async (defaultValue, insertIndex) => {
                        handleChangeProject([renderData.project], insertIndex as number);
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
                            setTimeout(() => {
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
                                }, 100);
                                resolve(true);
                            }, 300);
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

                                                    console.log(users, 'b======b');
                                                    console.log(users[index]);

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
                                                    console.error('Error in onSelect handler:', error);
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
                                    >
                                        取消
                                    </Button>

                                    <ProFormDigit
                                        name="quantity"
                                        width="sm"
                                        label="报名人数"
                                        disabled={renderData.type == 0}
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