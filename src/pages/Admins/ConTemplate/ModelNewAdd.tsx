import ProForm, {
    ModalForm,
    ProFormInstance,
    ProFormList,
    ProFormSelect,
    ProFormText,
    ProFormTextArea,
    ProFormUploadDragger,
} from '@ant-design/pro-form';
import { message, Upload, Image } from 'antd';
import request from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import { useRef, useState } from 'react';
import { CloseCircleOutlined, SmileOutlined } from '@ant-design/icons';
import { Item } from 'rc-menu';


import type { ProColumns } from '@ant-design/pro-components';
import {
    EditableProTable,
    ProCard,
    ProFormField,
} from '@ant-design/pro-components';
import { Button } from 'antd';

const defaultData: DataSourceType[] = new Array(4).fill(1).map((_, index) => {
    return {
      id: (Date.now() + index).toString(),
      title: `活动名称${index}`,
      decs: '这个活动真好玩',
      state: 'open',
      created_at: 1590486176000,
    };
  });


type DataSourceType = {
    id: React.Key;
    title?: string;
    decs?: string;
    state?: string;
    created_at?: number;
    children?: DataSourceType[];
};

export default (props: any) => {
    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() =>
        defaultData.map((item) => item.id),
    );
    const [dataSource, setDataSource] = useState<readonly DataSourceType[]>(
        () => defaultData,
    );

    const columns: ProColumns<DataSourceType>[] = [
        {
            title: '活动名称',
            dataIndex: 'title',
            width: '30%',
            formItemProps: {
                rules: [
                    {
                        required: true,
                        whitespace: true,
                        message: '此项是必填项',
                    },
                    {
                        message: '必须包含数字',
                        pattern: /[0-9]/,
                    },
                    {
                        max: 16,
                        whitespace: true,
                        message: '最长为 16 位',
                    },
                    {
                        min: 6,
                        whitespace: true,
                        message: '最小为 6 位',
                    },
                ],
            },
        },
        {
            title: '状态',
            key: 'state',
            dataIndex: 'state',
            valueType: 'select',
            valueEnum: {
                all: { text: '全部', status: 'Default' },
                open: {
                    text: '未解决',
                    status: 'Error',
                },
                closed: {
                    text: '已解决',
                    status: 'Success',
                },
            },
        },
        {
            title: '描述',
            dataIndex: 'decs',
        },
        {
            title: '操作',
            valueType: 'option',
            width: 250,
            render: () => {
                return null;
            },
        },
    ];



    const { setModalVisible, modalVisible, callbackRef, renderData } = props;
    const actionRef = useRef<any>();
    const formRef = useRef<ProFormInstance>();
    if (renderData?.parameter.length > 0 && renderData.recordNumber === 0) {
        renderData?.parameter.forEach((item: any) => {
            item.type = item.type + '';
            item.isRequired = item.isRequired + '';
        });
        setTimeout(() => {
            formRef?.current?.setFieldsValue({
                labels: renderData.parameter,
            });
        }, 100);
    }
    const submitok = (values: any) => {
        return new Promise((resolve) => {
            request
                .postAll('/sms/contract/conParameter/saveArray', { array: values.labels })
                .then((res: any) => {
                    if (res.status == 'success') {
                        message.success('操作成功!');
                        setModalVisible();
                        callbackRef();
                        resolve(true);
                    }
                })
                .catch((err: any) => {
                    resolve(true);
                });
        });
    };
    return (
        <ModalForm
            width={900}
            formRef={formRef}
            onFinish={async (values) => {
                if (renderData?.type == 'eidt') {
                    values.id = renderData.id;
                }
                // console.log('values', JSON.parse(values.batchCode));
                let batchCode: any;
                if (values.batchCode) {
                    batchCode = JSON.parse(values.batchCode);
                    const bacthFn = () => {
                        batchCode.forEach((item: any, index: number) => {
                            // if (item.type == 'input' || item.type == 'span' || item.key == 'partB') {
                            //   item.type = '0';
                            // }
                            // if (item.key == 'partBCardName') {
                            //   item.isRequired = true;
                            //   item.type = '4';
                            // }
                            // if (item.key == 'linkAdressPartB') {
                            //   item.isRequired = true;
                            //   item.type = '6';
                            // }
                            // if (item.key == 'totalAmount') {
                            //   item.isRequired = true;
                            //   item.type = '3';
                            // }
                            // if (item.key == 'gnNameNmOneAmount' || item.key == 'gnNameNmTwoAmount') {
                            //   item.type = '3';
                            // }
                            // if (item.type == 'checkbox') {
                            //   item.type = '2';
                            // }
                            // if (
                            //   item.key == 'partA' ||
                            //   item.key == 'partB' ||
                            //   item.key == 'linkTelephonePartA' ||
                            //   item.key == 'linkAdressPartA' ||
                            //   item.key == 'linkTelephonePartB'
                            // ) {
                            //   item.isRequired = true;
                            // }
                            if (
                                item.code == 'partBCardNo' ||
                                item.code == 'partBCardBankName' ||
                                item.code == 'confirmTotalAmount' ||
                                item.code == 'gnNameNm' ||
                                item.code == 'totalAmountBig' ||
                                item.code == 'gnNameNmOneAmountBig' ||
                                item.code == 'gnNameNmTwoAmountBig'
                            ) {
                                batchCode.splice(index, 1);
                                bacthFn();
                                return;
                            }
                            // item.code = item.key;
                        });
                    };
                    bacthFn();
                    // batchCode.push(
                    //   { code: 'timeOutPartA', name: '甲方签署时间', type: '5', isRequired: true },
                    //   { code: 'timeOutPartB', name: '乙方签署时间', type: '5', isRequired: true },
                    // );
                    batchCode.forEach((item: any) => {
                        delete item.id
                        item.templateId = renderData.id;
                        // if (item.isRequired) {
                        //   item.isRequired = true;
                        // } else {
                        //   item.isRequired = false;
                        // }
                        // delete item.key;
                    });
                    values.labels = batchCode;
                    delete values.batchCode;
                }
                await submitok(values);
            }}
            modalProps={{
                destroyOnClose: true,
                onCancel: () => {
                    setModalVisible();
                },
                maskClosable: false,
            }}
            visible={modalVisible}
        >
            <EditableProTable<DataSourceType>
                headerTitle="可编辑表格"
                columns={columns}
                rowKey="id"
                scroll={{
                    x: 960,
                }}
                value={dataSource}
                onChange={setDataSource}
                recordCreatorProps={{
                    newRecordType: 'dataSource',
                    record: () => ({
                        id: Date.now(),
                    }),
                }}
                toolBarRender={() => {
                    return [
                        <Button
                            type="primary"
                            key="save"
                            onClick={() => {
                                // dataSource 就是当前数据，可以调用 api 将其保存
                                console.log(dataSource);
                            }}
                        >
                            保存数据
                        </Button>,
                    ];
                }}
                editable={{
                    type: 'multiple',
                    editableKeys,
                    actionRender: (row, config, defaultDoms) => {
                        return [defaultDoms.delete];
                    },
                    onValuesChange: (record, recordList) => {
                        setDataSource(recordList);
                    },
                    onChange: setEditableRowKeys,
                }}
            />
            {/* <ProCard title="表格数据" headerBordered collapsible defaultCollapsed>
                <ProFormField
                    ignoreFormItem
                    fieldProps={{
                        style: {
                            width: '100%',
                        },
                    }}
                    mode="read"
                    valueType="jsonCode"
                    text={JSON.stringify(dataSource)}
                />
            </ProCard> */}


            <ProFormList
                actionRef={actionRef}
                name="labels"
                label="合同表单信息"
                actionGuard={{
                    beforeRemoveRow: async (params_0: number | number[], params_1: number) => {
                        return new Promise((resolve) => {
                            if (renderData.parameter.length >= params_0 && renderData.parameter != false) {
                                let a = renderData.parameter.splice(params_0, 1);
                                request.delete('/sms/contract/conParameter', { id: a[0].id }).then((res: any) => {
                                    if (res.status == 'success') {
                                        message.success('删除成功');
                                        resolve(true);
                                    }
                                });
                            } else {
                                resolve(true);
                            }
                        });
                    },
                }}
                initialValue={[
                    {
                        isRequired: 'false',
                        templateId: renderData.id,
                    },
                ]}
                creatorRecord={{
                    templateId: renderData.id,
                    isRequired: 'false',
                }}
                copyIconProps={{ Icon: SmileOutlined, tooltipText: '复制此行到末尾' }}
                deleteIconProps={{
                    Icon: CloseCircleOutlined,
                    tooltipText: '不需要这行了',
                }}
            >
                <ProForm.Group key="group">
                    <ProFormText name="name" label="表单名称" />
                    <ProFormText name="code" label="表单代码" />
                    <ProFormSelect
                        label="表单类型"
                        width={100}
                        name="type"
                        request={async () => Dictionaries.getList('contract_type') as any}
                    />
                    <ProFormSelect
                        label="是否必填"
                        width={100}
                        name="isRequired"
                        valueEnum={{
                            true: '是',
                            false: '否',
                        }}
                        fieldProps={{
                            defaultValue: 'false',
                        }}
                    />
                    <ProFormText name="templateId" fieldProps={{ style: { display: 'none' } }} />
                </ProForm.Group>
            </ProFormList>
            <ProForm.Group title="批量代码上传" />
            <ProFormTextArea label="上传代码" name="batchCode" />
        </ModalForm>
    );
};
