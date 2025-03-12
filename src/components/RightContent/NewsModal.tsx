import { PaperClipOutlined } from '@ant-design/icons';
import { Divider, Modal, Image } from 'antd';
import ImgUrl from '@/services/util/UpDownload';
import ChargeIframe from '@/pages/Admins/AdminCharge/ChargeIframe';
import { useState } from 'react';

export default (props: any) => {
  const { isModalVisible, setisModalVisible, modalContent, renderData } = props;
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [imgSrc, setImgSrc] = useState();
  const [isModalVisibles, setisModalVisibles] = useState<boolean>(false);
  const look = async (id: any, item: any) => {
    const type = item.slice(item.indexOf('.'));
    await ImgUrl('/sms/business/bizNotice/download', id, item).then((res: any) => {
      setImgSrc(res);
      if (type == '.png' || type == '.jpg' || type == '.jpeg') {
        setisModalVisibles(true);
      } else {
        setPreviewVisible(true);
      }
    });
  };
  return (
    <Modal
      mask={false}
      title={modalContent?.title ? modalContent.title : '通知'}
      visible={isModalVisible}
      afterClose={() => {
        //   setDropdownFalg(!dropdownFalg);
      }}
      onOk={() => {
        setisModalVisible(false);
      }}
      onCancel={() => {
        setisModalVisible(false);
      }}
    >
      <p>{modalContent && modalContent.content}</p>
      <Divider />

      {modalContent &&
        modalContent.files &&
        modalContent.files.split(',').map((item: any, index: number) => {
          return (
            <div
              style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}
              key={index}
            >
              <p>
                <a
                  onClick={() => {
                    look(modalContent.id, item);
                  }}
                >
                  附件{item.slice(item.indexOf('.'))}
                  <PaperClipOutlined />
                </a>
              </p>
              <p>
                <a
                  onClick={() => {
                    look(modalContent.id, item);
                  }}
                  style={{ marginRight: '20px' }}
                >
                  查看
                </a>
                <a
                  onClick={() => {
                    ImgUrl(
                      '/sms/business/bizNotice/download',
                      modalContent.id,
                      item,
                      item.slice(item.indexOf('.')),
                    );
                  }}
                >
                  下载
                </a>
              </p>
            </div>
          );
        })}
      {previewVisible && (
        <ChargeIframe
          previewImage={imgSrc}
          previewVisible={previewVisible}
          setPreviewVisible={() => {
            setPreviewVisible(false);
          }}
        />
      )}
      <div style={{ display: 'none' }}>
        <Image
          width={200}
          style={{ display: 'none' }}
          preview={{
            visible: isModalVisibles,
            src: imgSrc,
            onVisibleChange: (value: any) => {
              setisModalVisibles(value);
            },
          }}
        />
      </div>
    </Modal>
  );
};
