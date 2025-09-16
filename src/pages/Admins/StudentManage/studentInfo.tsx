import  { useEffect, useState } from 'react';
import {  Divider, Descriptions, Tabs, Drawer, Tag } from 'antd';
import Dictionaries from '@/services/util/dictionaries';
// import request from '@/services/ant-design-pro/apiRequest';
// import moment from 'moment';
import getWindowSize from '@/services/util/windowSize';
import Order from '../AdminOrder/Order';
import Return from '../AdminReturnVisit/Return';
import Student from './student';
import Contract from '../ContractList/Contract';
import Charge from '../AdminCharge/Charge';
import Receive from '../../Business/Receive/Receive';
import Invoice from '@/pages/Business/Invoice/Invoice';

const { TabPane } = Tabs;
export default (props: any) => {
  const { modalVisible, setModalVisible, renderData, mobileHide } = props;
  const [tabsKey, setTabsKey] = useState<string>(renderData.key ? renderData.key : '1');
  const [tabsOrder, setTabsOrder] = useState<any>(null);
  const [tabsOrders, setTabsOrders] = useState<any>(null);
  const [tabsReturnVisit, setTabsReturnVisit] = useState<any>(null);
  const [tabsStudent, setTabsStudent] = useState<any>(null);
  const [tabContract, setTabsContract] = useState<any>(null);
  const [tabChargets, setTabsCharges] = useState<any>(null);
  const [tabCharget, setTabsCharge] = useState<any>(null);
  const [tabReceive, setTabsReceive] = useState<any>(null);
  const [tabInvoice, setTabInvoice] = useState<any>(null);
  const [windowSize, setWindowSize] = useState(getWindowSize());
  useEffect(() => {
    if (tabsKey == '1' && !tabsReturnVisit && renderData.id) {
      const a = <Return admin={renderData.admin} studentUserId={renderData.id} />;
      setTabsReturnVisit(a);
    }
    if (tabsKey == '2' && !tabsOrder && renderData.id) {
      const a = <Order studentUserId={renderData.id} type={renderData.type} />;
      setTabsOrder(a);
    }
    if (tabsKey == '8' && !tabsOrders && renderData.id) {
      const a = <Order admins={renderData.lastDealTime} studentUserId={renderData.id} type={renderData.type} />;
      setTabsOrder(a);
    }
    if (tabsKey == '4' && !tabReceive && renderData.id) {
      const a = <Receive studentUserId={renderData.id} />;
      setTabsReceive(a);
    }
    if (tabsKey == '6' && !tabsStudent && renderData.id) {
      const a = <Student parentId={renderData.id} isFormal={null} />;
      setTabsStudent(a);
    }
    if (tabsKey == '5' && !tabContract && renderData.id) {
      const a = <Contract mobile={renderData.mobile} />;
      setTabsContract(a);
    }
    if (tabsKey == '3' && !tabCharget && renderData.id) {
      const a = (
        <Charge
          type="1"
          studentType={renderData.type}
          chargeType="refund"
          studentUserId={renderData.id}
        />
      );
      setTabsCharge(a);
    }
    if (tabsKey == '7' && !tabChargets && renderData.id) {
      const a = (
        <Charge
          type="0"
          studentType={renderData.type}
          chargeType="chargeList"
          studentUserId={renderData.id}
        />
      );
      setTabsCharges(a);
    }
    if (tabsKey == '9') {
      const a = <Invoice param={{ studentUserIds: ',' + renderData.id + ',' }} />;
      setTabInvoice(a);
    }
    if (tabsKey == '10' && !tabsOrder && renderData.id) {
      const a = <Order studentUserId={renderData.id} type={renderData.type} />;
      setTabsOrder(a);
    }
  }, [tabsKey, renderData]);
  let nameInfo = '学员';
  switch (renderData.type) {
    case 1:
      nameInfo = '企业';
      break;
    case 2:
      nameInfo = '代理人';
      break;
    case 3:
      nameInfo = '介绍人';
      break;
  }
console.log(renderData)
  return (
    <Drawer
      onClose={() => {
        setTabsKey('1');
        setTabsOrder(null);
        setTabsStudent(null);
        setTabsReturnVisit(null);
        // setTabsCharge(null);
        setModalVisible();
      }}
      width={windowSize.innerWidth / 1.5}
      visible={modalVisible}
      destroyOnClose={true}
    >
      {renderData && (
        <>
          <Descriptions
            title={<span>{nameInfo}信息 {renderData.isInWhitelist ? <Tag color='green'>白名单</Tag> : <></>}</span>}
            bordered
            size="small"
            labelStyle={{ fontSize: '12px' }}
          >
            <Descriptions.Item label={nameInfo == '企业' ? '企业名称' : nameInfo + '姓名'}>
              <div>{renderData.name}</div>
              <div> {renderData.isPeer && <Tag color="#87CEEB">同行企业</Tag>}</div>
            </Descriptions.Item>
            <Descriptions.Item label="类型">
              {Dictionaries.getName('studentType', renderData.type)}
            </Descriptions.Item>
            {renderData.parentName ? (
              <Descriptions.Item label="所属企业">{renderData.parentName}</Descriptions.Item>
            ) : (
              <Descriptions.Item label="企业负责人">
                {renderData.chargePersonName}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="性别">
              {renderData.sex == null ? '未知' : renderData.sex ? '女' : '男'}
            </Descriptions.Item>
            <Descriptions.Item label="联系电话">
              {!mobileHide && renderData.mobile}
            </Descriptions.Item>
            <Descriptions.Item label="身份证">{renderData.idCard}</Descriptions.Item>
            <Descriptions.Item label="微信">{renderData.weChat}</Descriptions.Item>
            <Descriptions.Item label="QQ">{renderData.qq}</Descriptions.Item>
            <Descriptions.Item
              label="是否正式学员"
              contentStyle={{ color: renderData.isFormal ? 'rgb(0,172,132)' : 'red' }}
            >
              {renderData.isFormal ? '正式' + nameInfo : '潜在' + nameInfo}
            </Descriptions.Item>

            <Descriptions.Item label="客户来源">
              {Dictionaries.getName('dict_source', renderData.source)}
            </Descriptions.Item>
            <Descriptions.Item label="流转次数">{renderData.receiveNum}</Descriptions.Item>
            <Descriptions.Item label="资源类型">
              {Dictionaries.getName('circulationType', renderData.source)}
            </Descriptions.Item>
            <Descriptions.Item label="是否为出镜人专属资源">
              {renderData.isLive ? '是' : '否'}
            </Descriptions.Item>
            <Descriptions.Item
              label="用户状态"
              contentStyle={{ color: renderData.enable === false ? 'red' : 'rgb(0,172,132)' }}
            >
              {renderData.enable === false ? '禁用' : '使用中'}
            </Descriptions.Item>
            <Descriptions.Item label="咨询时间">
              {renderData.createTime}
            </Descriptions.Item>
            <Descriptions.Item label="学历">
              {Dictionaries.getName('dict_education', renderData.education)}
            </Descriptions.Item>
            <Descriptions.Item label="联系地址">{renderData.address}</Descriptions.Item>

            <Descriptions.Item label="备注">{renderData.description}</Descriptions.Item>
          </Descriptions>
          <Divider />
          <div>
            <Tabs
              centered
              defaultActiveKey={tabsKey}
              size="large"
              style={{ marginBottom: 32 }}
              onChange={(e) => {
                setTabsKey(e);
              }}
            >
              
              <TabPane tab="跟进/回访进度" key="1">
                {tabsReturnVisit}
              </TabPane>
              <TabPane tab="同项目订单" key="8">
                {tabsOrder}
              </TabPane>
              <TabPane tab="资源列表" key="10">
                    {tabsOrder}
                  </TabPane>
              {renderData.isFormal ? (
                <>
                
                
                  <TabPane tab="订单记录" key="2">
                    {tabsOrder}
                  </TabPane>
                  {/* {renderData.type ? (
                    <TabPane tab="企业学员信息" key="6">
                      {tabsStudent}
                    </TabPane>
                  ) : (
                    ''
                  )} */}
                  <TabPane tab="缴费记录" key="7">
                    {tabChargets}
                  </TabPane>
                  <TabPane tab="开票记录" key="9">
                    {tabInvoice}
                  </TabPane>
                  <TabPane tab="退费记录" key="3">
                    {tabCharget}
                  </TabPane>
                  <TabPane tab="合同列表" key="5">
                    {tabContract}
                  </TabPane>
                </>
              ) : (
                <TabPane tab="领取记录" key="4">
                  {tabReceive}
                </TabPane>
              )}
            </Tabs>
          </div>
        </>
      )}
    </Drawer>
  );
};
