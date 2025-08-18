import { PageContainer } from "@ant-design/pro-layout"
import {
    ProCard,
    ProForm,
    ProFormGroup,
    ProFormList,
    ProFormText,
} from '@ant-design/pro-components';


export default () => {
    return <>
        <PageContainer>
            <ProCard>
                <ProForm onFinish={async (e) => console.log(e)}>
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
                                <ProFormText name="value" label="值" />
                                <ProFormText name="label" label="显示名称" />
                                <ProFormText name="label" label="显示名称" />
                            </ProFormGroup>
                        </ProFormList>
                    </ProFormList>
                </ProForm>
            </ProCard>
        </PageContainer>
    </>
}