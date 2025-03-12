import React, { useState } from 'react';
import { Button, Upload, message, Spin, Row, Col } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
// import Tesseract from 'tesseract.js';
const { Dragger } = Upload;
const ImageRecognizer = (propsP: any) => {
  // const { setChargeModals, setFromDataUp } = propsP;
  // const [imageUrl, setImageUrl] = useState(null);
  // const [loading, setLoading] = useState(false);
  // let tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
  // let tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
  // let obj = {};
  // obj[tokenName] = tokenValue;
  // const recognizeText = async (file: Tesseract.ImageLike) => {
  //   setLoading(true);
  //   const worker = Tesseract.createWorker({
  //     logger: (m) => console.log(m),
  //   });
  //   await worker.load();
  //   await worker.loadLanguage('chi_sim');
  //   await worker.initialize('chi_sim');
  //   const { data } = await worker.recognize(file);
  //   // console.log('data', data);
  //   let obj: any = {};
  //   let obj2 = {
  //     订单金额: 'amount',
  //     创建时间: 'chargeTime',
  //     支付时间: 'chargeTime',
  //     收款方全称: 'corporateName',
  //     商户全称: 'corporateName',
  //   };
  //   if (data) {
  //     data.lines.forEach((item) => {
  //       let str = item.text.replace(/\s+/g, '');
  //       Object.keys(obj2).forEach((key) => {
  //         if (str.indexOf(key) >= 0) {
  //           obj[obj2[key]] = str.slice(str.indexOf(key) + key.length);
  //         }
  //       });
  //     });
  //   }
  //   setLoading(false);

  //   return obj;
  //   // return data.text;
  // };
  // const handleUpload = async (file: any, files: any) => {
  //   try {
  //     const url: any = URL.createObjectURL(file);
  //     setImageUrl(url);
  //     const filesUrl = [
  //       {
  //         uid: 1,
  //         name: files.response.data,
  //         response: { data: files.response.data },
  //         thumbUrl: url,
  //       },
  //     ];
  //     const text = await recognizeText(file);
  //     setFromDataUp({ ...text, files: filesUrl });
  //     setChargeModals(false);
  //     message.success('上传成功!');
  //   } catch (error) {
  //     console.log('Recognition error:', error);
  //     message.error('操作失败!');
  //   }
  // };
  // const props = {
  //   name: 'files',
  //   multiple: false,
  //   action: '/sms/business/bizCharge/upload',
  //   showUploadList: false,
  //   headers: { ...obj },
  //   beforeUpload: (file: { type: string }) => {
  //     const isImage = file.type.startsWith('image/');
  //     if (!isImage) {
  //       message.error('You can only upload image files!');
  //     }
  //     return isImage;
  //   },
  //   onChange: ({ file }: any) => {
  //     if (file.status === 'done') {
  //       handleUpload(file.originFileObj, file);
  //     }
  //   },
  //   onPreview: async (file: any) => {
  //     console.log('file1', file);
  //   },
  // };
  return (
    <>
      {/* <Spin spinning={loading}>
        <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>支付宝或微信付款截图:</div>
        <Dragger {...props}>
          <p className="ant-upload-text">请点击或拖动上传付款截图</p>
          <p className="ant-upload-hint">
            Support for a single upload. Only image files are allowed.
          </p>
        </Dragger>
        <Row
          style={{
            width: '927px',
            backgroundColor: '#d9edf7',
            border: '1px solid #bce8f1',
            padding: '20px',
            marginBottom: '20px',
            marginTop: '20px',
          }}
        >
          <Col span={2} style={{ color: 'red' }}>
            注意：
          </Col>
          <Col span={22}>
            （1）目前只支持上传支付宝和微信的转账付款截图页面,暂不支持银行回单上传。
            <br />
            （2）上传成功后会自动填充到缴费信息，请您大致检查一下信息是否正确；
            <br />
            （3）因微信转账截图识别不到金额，请您自行填写。
            <br />
            （4）
            <span style={{ color: 'red' }}>
              第一次使用需要下载资源，拖入付款截图后需要等待半个小时左右，急需下单请勿使用此功能。
            </span>
          </Col>
        </Row>
        {imageUrl && (
          <div>
            <img src={imageUrl} alt="Uploaded file" width="200" />
          </div>
        )}
        {loading && <p>加载中...</p>}
      </Spin> */}
    </>
  );
};
export default ImageRecognizer;
