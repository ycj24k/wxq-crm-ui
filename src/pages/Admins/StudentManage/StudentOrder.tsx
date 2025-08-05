import { Modal, Typography } from 'antd';
import { history } from 'umi';
const { Title, Paragraph, Text } = Typography;
import Order from '../AdminOrder/Order';
export default (props: any) => {
  const { setModalVisible, modalVisible, renderData, callbackRef, placeAnOrder } = props;

  console.log(renderData ,'dnmd')
  const chargeType = renderData.chargeType == '0' ? '缴费' : '退费';
  const gotoDingdan = (number: number) => {
    if (number == 0) {
      history.push('/business/oldcharge/charges/audit');
    } else {
      history.push('/business/oldcharge/refundCharges/audit');
    }
  };
  return (
    <Modal
      title={
        <Typography>
          <Title style={{ fontSize: '20px' }}>请选择订单进行{chargeType}</Title>
          <Paragraph style={{ fontSize: '14px' }}>
            如果下列表格为空,而你需要下单请先去
            <a
              onClick={() => {
                placeAnOrder(renderData);
                setModalVisible();
              }}
            >
              新增订单!
            </a>
          </Paragraph>
          <Paragraph style={{ fontSize: '14px' }}>
            如果是老系统学员需要给老系统的订单缴纳尾款或者给老系统的订单进行退费,请去历史遗留进行
            <a onClick={() => gotoDingdan(0)}>缴费</a>或 <a onClick={() => gotoDingdan(1)}>退费</a>!
          </Paragraph>
        </Typography>
      }
      open={modalVisible}
      onCancel={() => setModalVisible()}
      footer={null}
      width={1500}
    >
      <Order studentUserId={renderData.id} type={renderData.type} showType={renderData.Type} showStudentBtn={renderData.chargeBtn} />
    </Modal>
  );
};
