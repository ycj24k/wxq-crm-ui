import React, { useEffect, useState } from 'react';
import { Modal, Button, message, Steps, theme } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import request from '@/services/ant-design-pro/apiRequest';
import ChargeIframe from '../AdminCharge/ChargeIframe';

const { Step } = Steps;
export default (props: any) => {
  const { modalVisible, setModalVisible, renderData } = props;
  const [renderDatas, setrenderDatas] = useState(renderData);
  const [current, setCurrent] = useState(renderData.indexOf(false));
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [previewImage, setpreviewImage] = useState<boolean>(false);

  useEffect(() => {
    console.log('renderData', renderData);
  }, []);
  const shuaxin = async () => {
    const status = (await request.get('/sms/share/isVerify')).data;
    const autoSign = (await request.get('/sms/share/isVerifyAutoSign')).data;
    setrenderDatas([status, autoSign]);
  };
  const steps = [
    {
      title: '实名认证',
      content: (
        <div>
          {renderDatas[0] ? (
            <div>
              <CheckOutlined style={{ fontSize: '66px', color: 'green' }} />
              <div style={{ marginTop: '10px' }}>你已实名认证</div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '30px' }}>
                您还未实名认证，点击实名跳转实名认证页面。<a onClick={() => shuaxin()}>刷新</a>
              </div>
              <Button
                type="primary"
                onClick={async () => {
                  const urls = (await request.post('/sms/share/verify')).data;
                  setpreviewImage(urls);
                  setPreviewVisible(true);
                }}
              >
                点击实名
              </Button>
            </div>
          )}
        </div>
      ),
    },
    {
      title: '自动签署',
      content: (
        <div>
          {renderDatas[1] ? (
            <div>
              <CheckOutlined style={{ fontSize: '66px', color: 'green' }} />
              <div style={{ marginTop: '10px' }}>你已实名认证</div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '30px' }}>
                您还未授权自动签署，点击授权跳转授权页面。<a onClick={() => shuaxin()}>刷新</a>
              </div>
              <Button
                type="primary"
                onClick={async () => {
                  const urls = (await request.post('/sms/share/verifyAutoSign')).data;
                  setpreviewImage(urls);
                  setPreviewVisible(true);
                }}
              >
                点击授权
              </Button>
            </div>
          )}
        </div>
      ),
    },
  ];
  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };
  const items = steps.map((item) => ({ key: item.title, title: item.title }));
  return (
    <Modal
      title="合同授权认证"
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      onOk={() => setModalVisible(false)}
      width={800}
      footer={null}
    >
      <Steps current={current}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div style={{ width: '100%', height: '200px', textAlign: 'center', paddingTop: '60px' }}>
        {steps[current].content}
      </div>
      <div style={{ marginTop: 24 }}>
        {current < steps.length - 1 && (
          <Button type="primary" onClick={() => next()}>
            下一步
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button type="primary" onClick={() => setModalVisible(false)}>
            完成
          </Button>
        )}
        {current > 0 && (
          <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
            上一步
          </Button>
        )}
      </div>
      {previewVisible && (
        <ChargeIframe
          setPreviewVisible={() => setPreviewVisible(false)}
          previewVisible={previewVisible}
          previewImage={previewImage}
          // callback={() => oncancel()}
          // admin={admin}
        />
      )}
    </Modal>
  );
};
