import React, { useEffect, useRef, useState } from 'react';

import { PageContainer } from '@ant-design/pro-layout';
import Order from '../../../Admins/AdminOrder/Order';
import ProCard from '@ant-design/pro-card';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { Col, Row } from 'antd';

export default () => {
    const [searchData, setSearchData] = useState<any>({ studentName: '财务查询' })


    const Refresh = (valuse: any) => {
        setSearchData({ studentName: '财务查询' })
        setTimeout(() => {
            Object.keys(valuse).forEach((key) => {
                if (!valuse[key]) {
                    delete valuse[key]
                }
            })
            setSearchData(valuse)
        }, 200)
    }
    return (
        <PageContainer>
            <ProCard>
                <ProForm
                    onFinish={async (valuse: any) => {
                        await Refresh(valuse)
                    }}
                    onReset={() => {
                        setSearchData({ studentName: '财务查询' })
                    }}
                >
                    <Row>
                        <Col span={4}>
                            <ProFormText name='studentName' label='姓名/企业' width='sm' />
                        </Col>

                        <ProFormText name='num' label='订单编号' width='sm' />
                    </Row>

                </ProForm>
            </ProCard>
            {
                searchData.studentName == '财务查询' ? <span /> : <Order admin={true} searchFalg={searchData} type='all' />
            }

        </PageContainer>
    );
};
