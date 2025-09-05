import {
    ProForm,
    ProFormGroup,
    ProFormList,
    ProFormSelect,
    ProFormCascader,
    ProFormDigit,
    ProFormText,
    ProFormMoney,
    ProFormInstance,
    ProFormDateTimePicker,
    ProFormTreeSelect,
    ProFormTextArea,
    ProFormUploadDragger
} from '@ant-design/pro-form';
import ProCard from '@ant-design/pro-card';
import Dictionaries from '@/services/util/dictionaries';
import moment from 'moment';
import { ExclamationCircleFilled } from '@ant-design/icons';
import request from '@/services/ant-design-pro/apiRequest';
import { forwardRef, useImperativeHandle, useEffect, useRef, useState } from 'react';
import { Button, message, Modal } from 'antd';
import ChargeLog from '@/pages/Business/ChargeLog';

let JobClassExamA: any[] = [];
let quantitys: any[] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let comNumbers: any[] = [0, 0, 0, 0, 0, 0, 0, 0, 0];



interface ClassListMethods {
    getFormValues: () => Promise<any>;
    resetForm: () => void;
}


interface ClassListProps {
    renderData?: any;
    projectslist?: any;
    onAddClassType?: () => void;
    onRemoveClassType?: (index: number) => void;
    onTotalPriceChange?: (price: number) => void;
    onTotalQuantityChange?: (quantity: number) => void;
}

const ClassList = forwardRef<ClassListMethods, ClassListProps>((props, ref) => {
    const { renderData, onTotalPriceChange, onTotalQuantityChange, onAddClassType, onRemoveClassType, projectslist,typeStatus } = props;
    console.log(typeStatus,'typeStatus')
    useImperativeHandle(ref, () => ({
        getFormValues: async () => {
            try {
                // 执行表单验证
                const values = await formRef.current?.validateFields();
                return values;
            } catch (error: any) {
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
            setDiscountPrice(0);
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
    const [discountPrice, setDiscountPrice] = useState<number>(0);
    const [totalQuantity, setTotalQuantity] = useState<number>(0);
    const [discountRemake, setDiscountRemake] = useState<boolean>(false)
    const [chargeType, setChargeType] = useState<string[]>([]);
    const [chargeLogVisible, setChargeLogVisible] = useState<any>(false);
    const [chargeLog, setChargeLog] = useState<Array<any> | null>();
    const [chargeLogIndex, setChargeLogIndex] = useState<any>()
    const [newProjectslist, setProjectslist] = useState<any>();

    let tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
    let tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
    let obj: { [key: string]: string } = {};
    if (tokenValue !== null) {
        obj[tokenName] = tokenValue;
    } else {
        // 处理 tokenValue 为 null 的情况，例如显示错误消息或设置默认值
        console.error('Token value is null');
    }

    const formRef = useRef<ProFormInstance>(null);
    //const userRef = useRef<any[]>([]); // 初始化为空数组
    const userRef = useRef<any>(null);
    // 将岗位转换为Tree组件可用的格式
    const convertToTreeData = (data: any[]): any[] => {
        if (!data || !Array.isArray(data)) return [];

        return data.map((item) => ({
            key: item.id,
            value: item.value,
            label: item.name,
            children: item.children ? convertToTreeData(item.children) : [],
        }));
    };

    const getProject = async () => {
        const res = await request.get('/sms/commonProjects')
        const dictionariesList = localStorage.getItem('dictionariesList');
        if (dictionariesList) {
            let dictionariesArray = JSON.parse(dictionariesList)[1].children
            const result = Dictionaries.extractMatchingItems(dictionariesArray, res.data);
            if (result) {
                const formattedData1 = Dictionaries.findObjectAndRelated(dictionariesArray, renderData.project)
                let newData = convertToTreeData([[formattedData1.parent][0]])

                const foundObject = projectslist?.find((item: any) => JSON.stringify(item) === JSON.stringify(newData[0]))
                if (foundObject) {
                    setProjectslist(projectslist)
                } else {
                    let newProject = [...(projectslist || []), newData[0]];
                    setProjectslist(newProject)
                }
            }
        }
    }

    useEffect(() => {
        getProject()
    }, [projectslist])


    // useEffect(() => {
    //     formRef?.current?.setFieldsValue({
    //         provider: userNameId?.id,
    //     });
    // }, [userNameId])


    useEffect(() => {
        console.log(renderData,)
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
            let scoreName = Dictionaries.getName('dict_source', item.source)
            list.push({
                project: item.project ? Dictionaries.getCascaderValue('dict_reg_job', item.project) : [],
                quantity: item.quantity || 1,
                receivable: item.receivable || 0,
                discount: item.discount || 0,
                source: scoreName,
                discountRemark: item.discountRemark || '',
                userId: { "value": item.userId },
                // { "value": renderData.provider },
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
                provider: renderData.provider
            });

            // const data = {
            //     id: renderData.userId,
            //     name: renderData.userName
            // }
            // userRef?.current?.setDepartment(data);
            // setUserNameId(data)

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

    useEffect(() => {
        if (chargeLog) {
            setChargeLogVisible(false);

            // 获取当前 users 数据
            const users = formRef?.current?.getFieldValue('users') || [];
            const newUsers = [...users];

            if (Array.isArray(chargeLog)) {
                chargeLog.forEach((log) => {
                    newUsers[chargeLogIndex] = {
                        ...newUsers[chargeLogIndex],
                        chargeLogIds: chargeLog[0].id,
                        amount: chargeLog[0].amount,
                        chargeLogName: chargeLog.map(x => x.name).join('、') + '的收款记录',
                        paymentTime: chargeLog[0].paymentTime,
                        //userId: chargeLog[0].userId + '',
                        userId: { "value": chargeLog[0].userId },
                        method: chargeLog[0].method + '',
                        surplus: users[chargeLogIndex].receivable - chargeLog[0].amount,
                    };
                });
            }

            // 更新表单数据
            formRef?.current?.setFieldsValue({
                users: newUsers
            });
        }
    }, [chargeLog])


    const handlejisuan = () => {
        const users = formRef?.current?.getFieldValue('users') || [];
        let totalReceivable = 0;
        users.forEach((item:any) => {
            const jobClassExam = JSON.parse(item.JobClassExam);
            totalReceivable += jobClassExam.receivable * item.quantity - item.discount;
        })
        onTotalPriceChange?.(totalReceivable)
        console.log(totalReceivable,'totalReceivable------totalReceivable')
    }

    return (
        <>
            <ProForm
                formRef={formRef}
                submitter={false}
                onFinish={async (e: any) => console.log(e)}>
                <ProFormList
                    name="users"
                    creatorButtonProps={{
                        creatorButtonText: '新增一条班型信息'
                    }}
                    creatorRecord={() => {
                        // 创建一个新记录时的默认值
                        const defaultRecord = {
                            project: renderData?.project ?
                                Dictionaries.getCascaderValue('dict_reg_job', renderData.project) :
                                [],
                            quantity: 1,
                            //source: renderData && renderData.studentSource ? Dictionaries.getName('dict_source', renderData.studentSource) : undefined,
                            provider: {
                                value: renderData?.provider ?? null
                            },
                            userId: renderData?.userId ?? null,
                            receivable: 0,
                            studentUserId: renderData?.id ?? null,
                            discount: 0,
                            discountRemark: '',
                            JobClassExam: null, // 确保班型选择字段存在但初始为null
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
                            // console.log(defaultValue, 'defaultValue----->')
                            try {
                                // 安全处理project不存在的情况
                                const projectValue = renderData?.project || [];
                                await handleChangeProject(
                                    Array.isArray(projectValue) ? projectValue : [projectValue],
                                    insertIndex as number
                                );

                                // 立即获取最新的 users 数据
                                const users = formRef?.current?.getFieldValue('users') || [];
                                // 优惠的金额
                                const discountSum = users.reduce((total: number, user: any) => {
                                    return total + (Number(user.discount) || 0);
                                }, 0);
                                // 报名人数
                                const quantitySum = users.reduce((total: number, user: any) => {
                                    return total + (Number(user.quantity) || 0);
                                }, 0);

                                // 总金额
                                const receivableSum = users.reduce((total: number, user: any) => {
                                    return total + (Number(user.receivable) || 0) - (Number(user.discount) || 0);
                                }, 0) + defaultValue.receivable - defaultValue.discount;

                                const newTotalPrice = defaultValue.receivable * (quantitySum + defaultValue.quantity) - (discountSum + defaultValue.discount)
                                //handlejisuan()
                                // 更新状态和回调
                                setDiscountPrice(discountSum);
                                setTotalPrice(receivableSum);
                                setTotalQuantity(quantitySum);
                                //二次注释
                                onTotalPriceChange?.(newTotalPrice);

                                //onTotalPriceChange?.(receivableSum);
                                onTotalQuantityChange?.(quantitySum);
                                formRef?.current?.setFieldsValue({
                                    receivable: receivableSum,
                                    quantity: quantitySum
                                });

                                // 调用父组件传入的回调函数
                                // if (onAddClassType) {
                                //     onAddClassType();
                                // }
                                return true;
                            } catch (error) {
                                console.error('添加行时处理项目失败:', error);
                                return false;
                            }
                        },
                        beforeRemoveRow: async (index) => {
                            return new Promise((resolve) => {
                                if (index === 0) {
                                    message.error('这行不能删');
                                    resolve(false);
                                    return;
                                }

                                // 先通知父组件删除对应的支付方式
                                // if (props.onRemoveClassType) {
                                //     props.onRemoveClassType(index);
                                // }

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
                                const discountSum = newUsers.reduce((total: number, user: any) => {
                                    return total + (Number(user.discount) || 0);
                                }, 0)


                                const newTotalPrice = (receivableSum - discountSum) * quantitySum;
                                onTotalPriceChange?.(newTotalPrice);


                                setTotalPrice(receivableSum);
                                setTotalQuantity(quantitySum);
                                setDiscountPrice(discountSum)
                                //onTotalPriceChange?.(receivableSum);
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
                            <>
                                <ProCard
                                    bordered
                                    title={'报考班型'}
                                    extra={action}
                                    style={{
                                        width: '1000px',
                                        margin: '0 auto',
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
                                                    options: newProjectslist,
                                                    showSearch: { filter },
                                                    onChange: (e: any) => { handleChangeProject(e, index) }
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
                                                            handlejisuan()
                                                            let newE = JSON.parse(e)
                                                            
                                                            // const users = formRef?.current?.getFieldValue('users') || [];
                                                            // const TotalSum = users.reduce((total: number, user: any) => {
                                                            //     return total + (Number(user.receivable) || 0);
                                                            // }, 0) + newE.receivable;

                                                            // const TotalDiscount = users.reduce((total: number, user: any) => {
                                                            //     return total + (Number(user.discount) || 0);
                                                            // }, 0)
                                                            // onTotalPriceChange?.(TotalSum - TotalDiscount);

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

                                                                console.log(newE.receivable, 'newE=====>')

                                                                // const quantitySum = newUsers.reduce((total, user) => {
                                                                //     return total + (Number(user.quantity) || 0);
                                                                // }, 0);

                                                                // const TotalSum = users.reduce((total: number, user: any) => {
                                                                //     return total + (Number(user.receivable) || 0);
                                                                // }, 0) + newE.receivable * users[index].quantity;


    
                                                                // const TotalDiscount = users.reduce((total: number, user: any) => {
                                                                //     return total + (Number(user.discount) || 0);
                                                                // }, 0)

                                                                // 更新状态和回调
                                                                // setTotalQuantity(quantitySum);
                                                                // onTotalPriceChange?.(TotalSum - TotalDiscount);
                                                                // onTotalQuantityChange?.(quantitySum);

                                                                // 更新表单字段
                                                                // formRef?.current?.setFieldsValue({
                                                                //     //receivable: receivableSum,
                                                                //     receivable:TotalSum,
                                                                //     quantity: quantitySum
                                                                // });
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
                                                    //disabled={typeStatus != '1'}
                                                    fieldProps={{
                                                        onChange: (e: any) => {
                                                            handlejisuan()

                                                            //二次注释
                                                            //const users = formRef?.current?.getFieldValue('users') || [];

                                                            // const TotalSum = users.reduce((total: number, user: any) => {
                                                            //     return total + (Number(user.receivable) || 0);
                                                            // },0)
                                                            
                                                            //二次注释
                                                            // const discountSum = users.reduce((total: number, user: any) => {
                                                            //     return total + (Number(user.discount) || 0);
                                                            // }, 0);

                                                            //二次注释
                                                            // const quantitySum = users.reduce((total: number, user: any) => {
                                                            //     return total + (Number(user.quantity) || 0);
                                                            // }, 0);

                                                            //二次注释
                                                            //onTotalPriceChange?.((users[0].receivable) * quantitySum  - discountSum);


                                                            // const users = formRef?.current?.getFieldValue('users') || [];
                                                            // const TotalSum = users.reduce((total: number, user: any) => {
                                                            //     return total + (Number(user.receivable) || 0);
                                                            // }, 0) * e
                                                            // const TotalDiscount = users.reduce((total: number, user: any) => {
                                                            //     return total + (Number(user.discount) || 0);
                                                            // }, 0)
                                                            // onTotalPriceChange?.(TotalSum - TotalDiscount);
                                                        },
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

                                                {/* <ProFormSelect
                                                    label="订单来源"
                                                    name="source"
                                                    placeholder="请选择订单来源"
                                                    //hidden={true}
                                                    width="sm"
                                                    rules={[{ required: true, message: '请选择订单来源' }]}
                                                    request={async () => Dictionaries.getList('dict_source') as any}
                                                    allowClear={true}
                                                    fieldProps={{
                                                        showSearch: true,
                                                        placeholder: '请选择订单来源',
                                                    }}
                                                /> */}
                                                <ProFormMoney
                                                    name="discount"
                                                    label="订单优惠金额"
                                                    width="sm"
                                                    customSymbol="¥"
                                                    fieldProps={{
                                                        onChange: (e) => {
                                                            handlejisuan()

                                                            //二次注释
                                                            // const users = formRef?.current?.getFieldValue('users') || [];

                                                            // const TotalSum = users.reduce((total: number, user: any) => {
                                                            //     return total + (Number(user.receivable) || 0);
                                                            // },0)
                                                            // const discountSum = users.reduce((total: number, user: any) => {
                                                            //     return total + (Number(user.discount) || 0);
                                                            // }, 0);

                                                            // const quantitySum = users.reduce((total: number, user: any) => {
                                                            //     return total + (Number(user.quantity) || 0);
                                                            // }, 0);

                                                            
                                                            //二次注释
                                                            //onTotalPriceChange?.((users[0].receivable) * quantitySum  - discountSum);

                                                            // const discountSum = users.reduce((total: number, user: any) => {
                                                            //     return total + (Number(user.discount) || 0);
                                                            // }, 0);
                                                            // const quantitySum = users.reduce((total: number, user: any) => {
                                                            //     return total + (Number(user.quantity) || 0);
                                                            // }, 0);
                                                            // const moneySum = users.reduce((total: number, user: any) => {
                                                            //     return total + (Number(user.receivable) || 0);
                                                            // }, 0) * quantitySum;
                                                            // setDiscountPrice(discountSum);
                                                            // onTotalPriceChange?.(moneySum - discountSum);
                                                            // 动态设置 discountRemark 的 rules
                                                            const isDiscount = Number(e) !== 0;
                                                            setDiscountRemake(isDiscount);
                                                        },
                                                    }}
                                                    rules={[
                                                        { required: true },
                                                    ]}
                                                />
                                                <ProFormText
                                                    name="discountRemark"
                                                    label="订单优惠原因"
                                                    width="sm"
                                                    fieldProps={{
                                                        autoComplete: 'no',
                                                    }}
                                                    rules={[
                                                        { required: discountRemake, message: '请填写本次折扣原因' },
                                                    ]}
                                                />
                                                <ProFormText
                                                    name="studentUserId"
                                                    hidden={true}
                                                    label="隐藏赋值"
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
                                                    hidden={true}
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
                                        <div style={{ fontSize: '16px', fontWeight: '500', color: 'rgba(0, 0, 0, 0.85)', marginBottom: '20px' }}>支付方式</div>
                                        <ProForm.Group>
                                            <ProFormSelect
                                                label="缴费类型"
                                                name="type"
                                                width="sm"
                                                request={async () =>
                                                    Dictionaries.getList('chargeType')?.filter(x => ['0', '4', '5', '6'].indexOf(x.value) != -1) as any
                                                }
                                                fieldProps={{
                                                    onChange(e, record) {
                                                        const newChargeType = [...chargeType];
                                                        newChargeType[index] = e;
                                                        setChargeType(newChargeType);
                                                    }
                                                }}
                                                required
                                            />
                                            <ProFormText
                                                label="chargeLogIds"
                                                name="chargeLogIds"
                                                width="sm"
                                                hidden={true}
                                            />
                                            {chargeType[index] === '6' ? (
                                                <>
                                                    <ProFormText
                                                        label="收款记录"
                                                        name="chargeLogName"
                                                        width="sm"
                                                        rules={[
                                                            {
                                                                required: true,
                                                            },
                                                        ]}
                                                        fieldProps={{
                                                            onClick: () => {
                                                                setChargeLogIndex(index)
                                                                setChargeLog(null);
                                                                setChargeLogVisible(true);
                                                                return false;
                                                            }
                                                        }}
                                                    />
                                                </>
                                            ) : null}

                                            <ProFormSelect
                                                label="付款方式"
                                                name="method"
                                                width="sm"
                                                request={async () => Dictionaries.getList('dict_stu_refund_type') as any}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: '请选择付款方式',
                                                    },
                                                ]}
                                            />
                                            <ProFormSelect
                                                label="付款方式"
                                                name="departmentId"
                                                width="sm"
                                                hidden={true}
                                            />
                                            <ProFormTreeSelect
                                                name={'userId'}
                                                label={'收费人'}
                                                placeholder={'请输入收费人'}
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
                                            <ProFormDateTimePicker
                                                name="chargeTime"
                                                width="sm"
                                                label="收费日期"
                                                initialValue={moment().format('YYYY-MM-DD HH:mm:ss')}
                                                fieldProps={{
                                                    onChange(e) {
                                                        //formRef.current[index]?.setFieldValue('paymentTime', undefined)
                                                        const users = formRef?.current?.getFieldValue('users') || [];
                                                        const newUsers = [...users];
                                                        newUsers[index] = {
                                                            ...newUsers[index],
                                                            chargeTime: moment(e).format('YYYY-MM-DD HH:mm:ss')
                                                        };
                                                        formRef?.current?.setFieldsValue({
                                                            users: newUsers
                                                        });
                                                    },
                                                    format: 'YYYY-MM-DD HH:mm:ss',
                                                }}
                                                rules={[{ required: true, message: '请填写收费日期' }]}
                                            />
                                            <ProFormDateTimePicker
                                                name="paymentTime"
                                                label="实际到账日期"
                                                fieldProps={{
                                                    showTime: { format: 'HH:mm:ss' },
                                                    format: 'YYYY-MM-DD HH:mm:ss',
                                                    onChange(e) {
                                                        // 使用用户选择的时间，而不是当前时间
                                                        if (e) {
                                                            //formRefs.current[index]?.setFieldValue('paymentTime', moment(e).format('YYYY-MM-DD HH:mm:ss'))
                                                            const users = formRef?.current?.getFieldValue('users') || [];
                                                            const newUsers = [...users];
                                                            newUsers[index] = {
                                                                ...newUsers[index],
                                                                paymentTime: moment(e).format('YYYY-MM-DD HH:mm:ss')
                                                            };
                                                            formRef?.current?.setFieldsValue({
                                                                users: newUsers
                                                            });
                                                        }
                                                    },
                                                }}
                                                width="sm"
                                                disabled={chargeType[index] == '4' || chargeType[index] == '6'}
                                                rules={[{ required: ['4', '6'].indexOf(chargeType[index]) == -1, message: '请填写缴费日期' }]}
                                            />
                                            <ProFormDateTimePicker
                                                name="nextPaymentTime"
                                                width="sm"
                                                label="下次缴费时间"
                                                fieldProps={{
                                                    showTime: { format: 'HH:mm' },
                                                    format: 'YYYY-MM-DD HH:mm',
                                                    onChange(e) {
                                                        // 使用用户选择的时间，而不是当前时间
                                                        if (e) {
                                                            //formRefs.current[index]?.setFieldValue('nextPaymentTime', moment(e).format('YYYY-MM-DD HH:mm:ss'))
                                                            const users = formRef?.current?.getFieldValue('users') || [];
                                                            const newUsers = [...users];
                                                            newUsers[index] = {
                                                                ...newUsers[index],
                                                                nextPaymentTime: moment(e).format('YYYY-MM-DD HH:mm:ss')
                                                            };
                                                            formRef?.current?.setFieldsValue({
                                                                users: newUsers
                                                            });
                                                        }
                                                    },
                                                }}
                                            />
                                            <ProFormMoney
                                                label={`本次收费金额`}
                                                name="amount"
                                                width="sm"
                                                customSymbol="¥"
                                                fieldProps={{
                                                    onChange(e) {
                                                        const users = formRef?.current?.getFieldValue('users') || [];
                                                        const amount = Number(e) || 0;
                                                        const totalReceivable = users[index].receivable || 0;
                                                        const totalquantity = users[index].quantity || 0;
                                                        const commonPrice = totalReceivable * totalquantity
                                                        const surplus = commonPrice - amount;
                                                        const performance = amount - users[index].collectedAmount;
                                                        if (isNaN(performance)) {
                                                            const newUsers = [...users];
                                                            newUsers[index] = {
                                                                ...newUsers[index],
                                                                surplus: surplus,
                                                                performanceAmount: 0,
                                                                commissionBase: 0
                                                            };
                                                            formRef?.current?.setFieldsValue({
                                                                users: newUsers,
                                                            });
                                                        } else {
                                                            const newUsers = [...users];
                                                            newUsers[index] = {
                                                                ...newUsers[index],
                                                                surplus: surplus,
                                                                performanceAmount: performance,
                                                                commissionBase: performance
                                                            };
                                                            formRef?.current?.setFieldsValue({
                                                                users: newUsers,
                                                            });
                                                        }
                                                    }
                                                }}
                                                rules={[
                                                    { required: true, message: '请输入收费金额' },
                                                    { type: 'number', min: 0, message: '金额必须大于等于0' },
                                                    {
                                                        validator: async (_, value) => {
                                                            if (value && value > 999999999) {
                                                                throw new Error('金额不能超过9位数');
                                                            }
                                                            return Promise.resolve();
                                                        }
                                                    }
                                                ]}
                                            />
                                            <ProFormMoney
                                                tooltip="返代理费、快递费、税费，不包含在收费标准里的报名费等"
                                                label={`代收款项`}
                                                name="collectedAmount"
                                                width="sm"
                                                customSymbol="¥"
                                                min={0}
                                                fieldProps={{
                                                    onChange(e) {
                                                        const users = formRef?.current?.getFieldValue('users') || [];
                                                        const collectedAmount = Number(e) || 0;
                                                        const amount = users[index].amount;
                                                        const performance = amount - collectedAmount;
                                                        if (collectedAmount > amount) {
                                                            Modal.info({
                                                                title: '注意！当前代收款项金额大于收费金额！',
                                                                icon: <ExclamationCircleFilled />,
                                                                onOk() {
                                                                    const newUsers = [...users];
                                                                    newUsers[index] = {
                                                                        ...newUsers[index],
                                                                        performanceAmount: 0,
                                                                        commissionBase: 0,
                                                                        collectedAmount: ''
                                                                    };
                                                                    formRef?.current?.setFieldsValue({
                                                                        users: newUsers
                                                                    });
                                                                }
                                                            });
                                                        } else {
                                                            const newUsers = [...users];
                                                            newUsers[index] = {
                                                                ...newUsers[index],
                                                                performanceAmount: performance,
                                                                commissionBase: performance
                                                            };
                                                            formRef?.current?.setFieldsValue({
                                                                users: newUsers
                                                            });
                                                        }
                                                    },
                                                }}
                                                rules={[
                                                    { required: true, message: '请输入代收款项金额' },
                                                    { type: 'number', min: 0, message: '金额必须大于等于0' },
                                                    {
                                                        validator: async (_, value) => {
                                                            if (value && value > 999999999) {
                                                                throw new Error('金额不能超过9位数');
                                                            }
                                                            return Promise.resolve();
                                                        }
                                                    }
                                                ]}
                                            />
                                            <ProFormDigit
                                                label={`业绩金额（+）`}
                                                readonly={true}
                                                name="performanceAmount"
                                                width="sm"
                                            />
                                            <ProFormDigit
                                                label={`提成基数（+）`}
                                                readonly={true}
                                                name="commissionBase"
                                                width="sm"
                                            />
                                            <ProFormText label="本次收费后剩余尾款" name="surplus" readonly />
                                        </ProForm.Group>
                                    </ProFormGroup>
                                    <ProFormTextArea
                                        width={1100}
                                        label='备注'
                                        name="description"
                                    />
                                    <ProFormUploadDragger
                                        width={950}
                                        label="上传附件"
                                        name="files"
                                        action="/sms/business/bizNotice/upload"
                                        fieldProps={{
                                            multiple: true,
                                            headers: {
                                                ...obj,
                                            },
                                            listType: 'picture',
                                            onRemove: (e: any) => { },
                                            beforeUpload: (file: any) => {
                                                console.log('file', file);
                                            },
                                            onPreview: async (file: any) => {
                                                console.log('file', file);

                                                if (!file.url && !file.preview) {
                                                    console.log('1');
                                                }
                                            },
                                            onChange: (info: any) => {
                                                const { status } = info.file;
                                                if (status !== 'uploading') {
                                                }
                                                if (status === 'done') {
                                                    message.success(`${info.file.name} 上传成功.`);
                                                } else if (status === 'error') {
                                                    message.error(`${info.file.name} 上传失败.`);
                                                }
                                            },
                                        }}
                                    />
                                </ProCard>
                            </>
                        );
                    }}
                >

                </ProFormList>
                {/* <ProFormTextArea
                width={1100}
                label={'备注'}
                name="description"
            /> */}
            </ProForm>
            <Modal
                title="选择收款记录"
                width={1200}
                open={chargeLogVisible}
                onCancel={() => setChargeLogVisible(false)}
                footer={null}
            >
                <ChargeLog select={setChargeLog} type={1} Orderpage={true} />
            </Modal>
        </>
    );
})

export default ClassList;