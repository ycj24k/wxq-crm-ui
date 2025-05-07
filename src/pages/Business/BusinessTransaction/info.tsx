import { Descriptions } from 'antd';
export default (props: any) => {
    const { data } = props;
    return (
        // <Descriptions title={`订单信息:${order.num ? order.num : ''}`} bordered size="small">
        <Descriptions title="银行流水详情" bordered size="small">
            <Descriptions.Item label="订单号">{data.num}</Descriptions.Item>
            <Descriptions.Item label="商户号">{data.cusid}</Descriptions.Item>
            <Descriptions.Item label="门店名">{data.store}</Descriptions.Item>
            <Descriptions.Item label="终端号">{data.terminalNum}</Descriptions.Item>
            <Descriptions.Item label="交易类型">{data.transactionType}</Descriptions.Item>
            <Descriptions.Item label="交易批次号">{data.TransactionBatchNum}</Descriptions.Item>
            <Descriptions.Item label="凭证号">{data.voucherNum}</Descriptions.Item>
            <Descriptions.Item label="参考号">{data.referenceNum}</Descriptions.Item>
            <Descriptions.Item label="卡号">{data.cardNum}</Descriptions.Item>
            <Descriptions.Item label="卡类别">{data.cardCategory}</Descriptions.Item>
            <Descriptions.Item label="发卡行机构代码">{data.issuingBankInstitutionCode}</Descriptions.Item>
            <Descriptions.Item label="发卡行名称">{data.issuingBankName}</Descriptions.Item>
            <Descriptions.Item label="交易金额">{data.amount}</Descriptions.Item>
            <Descriptions.Item label="手续费">{data.commission}</Descriptions.Item>
            <Descriptions.Item label="交易日期">{data.date}</Descriptions.Item>
            <Descriptions.Item label="交易时间">{data.time}</Descriptions.Item>
            <Descriptions.Item label="交易单号">{data.transactionNumber}</Descriptions.Item>
            <Descriptions.Item label="商户备注">{data.remark}</Descriptions.Item>
            <Descriptions.Item label="对接应用号">{data.dockingApplicationNum}</Descriptions.Item>
            <Descriptions.Item label="原始金额">{data.originalAmount}</Descriptions.Item>
            <Descriptions.Item label="结算金额">{data.settlementAmount}</Descriptions.Item>
            <Descriptions.Item label="产品类型">{data.productType}</Descriptions.Item>
        </Descriptions>
    );
};
