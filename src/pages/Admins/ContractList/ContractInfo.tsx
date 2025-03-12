import { Descriptions, Drawer, Tag } from 'antd';
import React, { useState } from 'react';
import Dictionaries from '@/services/util/dictionaries';
import moment from 'moment';
import getWindowSize from '@/services/util/windowSize';
export default (props: any) => {
  const { ModalVisibles, setModalVisibles, renderData } = props;
  const [windowSize, setWindowSize] = useState(getWindowSize());

  return (
    <Drawer
      //   title="合同详情"
      placement="right"
      onClose={() => setModalVisibles()}
      open={ModalVisibles}
      width={windowSize.innerWidth / 1.5}
    >
      <Descriptions title="合同详情" bordered size="small">
        <Descriptions.Item label="合同编号">{renderData.num}</Descriptions.Item>
        <Descriptions.Item label="签署人姓名">{renderData.studentName}</Descriptions.Item>
        <Descriptions.Item label="签署人类型">
          {Dictionaries.getName('studentType', renderData.type)}
        </Descriptions.Item>
        <Descriptions.Item label="合同名称">{renderData.name}</Descriptions.Item>
        <Descriptions.Item label="合同金额">{renderData.amount}</Descriptions.Item>
        <Descriptions.Item label="签署老师">{renderData.userName}</Descriptions.Item>
        <Descriptions.Item label="对应项目">
          {Dictionaries.getCascaderName('dict_reg_job', renderData.project)}
        </Descriptions.Item>
        <Descriptions.Item label="创建时间">
          {renderData.createTime}
        </Descriptions.Item>
        <Descriptions.Item label="审核时间">
          {renderData.auditTime ? (
            renderData.auditTime
          ) : (
            <Tag color="#FF0000">未审核</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="审核状态">
          <Tag color={renderData.auditType == 5 ? '#87d068' : '#FF0000'}>
            {renderData.auditType == 5 ? '已审核' : '未审核'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="审核人">{renderData.auditor}</Descriptions.Item>
        <Descriptions.Item label="审核建议">{renderData.remark}</Descriptions.Item>
        <Descriptions.Item label="签署状态">
          <Tag color={!renderData.isFinish ? '#FF0000' : '#87d068'}>
            {renderData.isFinish ? '已签署' : '未签署'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="签署时间">
          {renderData.otherSignTime ? (
            renderData.otherSignTime
          ) : (
            <Tag color="#FF0000">未签署</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="归档状态">
          <Tag color={!renderData?.filingNum ? '#FF0000' : '#87d068'}>
            {renderData.filingNum ? '已归档' : '未归档'}
          </Tag>
        </Descriptions.Item>
      </Descriptions>
      <iframe src={renderData.viewUrl} style={{ width: '100%', height: '600px' }}></iframe>
    </Drawer>
  );
};
