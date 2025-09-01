import { PageContainer } from "@ant-design/pro-layout"
import {
    ProCard,
    ProForm,
    ProFormGroup,
    ProFormList,
    ProFormText,
    ProFormSelect
} from '@ant-design/pro-components';
import './index.less'
import { Button, Input, Select } from "antd";
import { PlusOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useState } from "react";


export default () => {
    const [rulelist, setRuleList] = useState<any>([
        {
            id: 1,
            name: '规则1',
            children: [
                {
                    id: '1-1',
                    text: '出镜人',
                    isInclude: '0',
                    name: '张三'
                }
            ],
            childrenProject: [
                {
                    id: '1-1-1',
                    andOr: 'and',
                    text1: '项目',
                    isInclude: '1',
                    project: '高级职称'
                }
            ]
        },
        {
            id: 2,
            name: '规则2',
            children: [
                {
                    id: '1-1',
                    text: '出镜人',
                    isInclude: '0',
                    name: '张三'
                }
            ],
            childrenProject: [
                {
                    id: '1-1-1',
                    andOr: 'and',
                    text1: '项目',
                    isInclude: '1',
                    project: '高级职称'
                }
            ]
        },
        {
            id: 3,
            name: '规则3',
            children: [
                {
                    id: '1-1',
                    text: '出镜人',
                    isInclude: '0',
                    name: '张三'
                }
            ],
            childrenProject: [
                {
                    id: '1-1-1',
                    andOr: 'and',
                    text1: '项目',
                    isInclude: '1',
                    project: '高级职称'
                }
            ]
        }
    ])
    const [hoverStates, setHoverStates] = useState<any>({})
    const handleMouseEnter = (id: any) => {
        setHoverStates((prev: any) => ({ ...prev, [id]: true }))
    }
    const handleMouseLeave = (id: any) => {
        setHoverStates((prev: any) => ({ ...prev, [id]: false }))
    }
    const handleDelete = (id: any) => {
        setRuleList((prev: any) => prev.filter((item: any) => item.id !== id))
    }
    return <>
        <PageContainer>
            <ProCard>
                {/* <ProForm onFinish={async (e) => console.log(e)}>
                    <ProFormList
                        name="users"
                        label="规则配置"
                        creatorButtonProps={{
                            position: 'top',
                            creatorButtonText: '新增一条配置规则',
                        }}
                        itemRender={({ listDom, action }, { record }) => {
                            return (
                                <ProCard
                                    bordered
                                    extra={action}
                                    title={record?.name}
                                    style={{
                                        marginBlockEnd: 8,
                                    }}
                                >
                                    {listDom}
                                </ProCard>
                            );
                        }}
                    >
                        <ProFormGroup>
                            <ProFormText name="name" label="姓名" />
                            <ProFormText name="nickName" label="昵称" />
                        </ProFormGroup>
                        <ProFormList
                            name="labels"
                            initialValue={[
                                {
                                    value: '333',
                                    label: '333',
                                    label1: '666'
                                },
                            ]}
                            creatorButtonProps={{
                                creatorButtonText: '添加规则',
                            }}
                            copyIconProps={{
                                tooltipText: '复制此项到末尾',
                            }}
                            deleteIconProps={{
                                tooltipText: '不需要这行了',
                            }}
                        >
                            <ProFormGroup key="group">
                                <ProFormText name="value" />
                                <ProFormSelect
                                    name="type"
                                    width="md"
                                    options={[
                                        { label: '包含', value: '0' },
                                        { label: '不包含', value: '1' }
                                    ]}
                                    // fieldProps={{
                                    //     onChange: setType
                                    // }}
                                    rules={[
                                        {
                                            required: true,
                                            message: '请选择类型',
                                        },
                                    ]}
                                />
                                <ProFormText name="label1" />
                            </ProFormGroup>
                        </ProFormList>
                    </ProFormList>
                </ProForm> */}
                <div className="top_container">
                    <Button type="primary" icon={<PlusOutlined />}>添加规则设置</Button>
                </div>
                <div className="rule_list">
                    {rulelist.map((item: any) => {
                        return <>
                            <div
                                onMouseEnter={() => handleMouseEnter(item.id)}
                                onMouseLeave={() => handleMouseLeave(item.id)}
                                key={item.id}
                                className="rule_item"
                            >
                                {hoverStates[item.id] && (
                                    <CloseCircleOutlined
                                        onClick={() => { handleDelete(item.id) }}
                                        style={{
                                            color: '#d81e06',
                                            position: 'absolute',
                                            right: '0px',
                                            top: '0px',
                                            fontSize: '16px',
                                            zIndex: 99
                                        }}
                                        className="close_icon"
                                    />
                                )}
                                {item.name}
                                <div style={{ display: 'flex', marginLeft: '100px' }}>
                                    <Input
                                        style={{ width: '200px', height: '32px' }}
                                        size="small"
                                        placeholder="Basic usage"
                                        value={item.children?.[0]?.text || ''}
                                    // onChange={(e) => {
                                    //     setRuleList((prev: any) => prev.map((rule: any) => {
                                    //         const currentChild = rule.children?.[0] || { text: '' };
                                    //         return rule.id === item.id
                                    //             ? {
                                    //                 ...rule,
                                    //                 children: [{ ...currentChild, text: e.target.value }]
                                    //             }
                                    //             : rule;
                                    //     }));
                                    // }}
                                    />
                                    <Select
                                        defaultValue="lucy"
                                        style={{ width: 100 }}
                                        // onChange={handleChange}
                                        options={[
                                            { value: 'jack', label: '包含' },
                                            { value: 'lucy', label: '不包含' }
                                        ]}
                                    />
                                    
                                    <Button style={{ marginLeft: '10px' }} type="primary">添加</Button>
                                    <Button style={{ marginLeft: '5px' }} danger>删除</Button>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <ProFormSelect
                                        name="type"
                                        width="md"
                                        options={[
                                            { label: '或', value: 'or' },
                                            { label: '且', value: 'and' }
                                        ]}
                                    />
                                    <ProFormText width={200} style={{ marginRight: '10px' }} name="name" />
                                    <ProFormSelect
                                        name="type"
                                        width="md"
                                        options={[
                                            { label: '包含', value: '01' },
                                            { label: '不包含', value: '02' }
                                        ]}
                                    />
                                    <ProFormSelect></ProFormSelect>
                                </div>
                            </div>
                        </>
                    })}
                </div>
            </ProCard>
        </PageContainer>
    </>
}