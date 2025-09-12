import { ProFormUploadDragger } from '@ant-design/pro-form';
import { message, Upload } from 'antd';
import Preview from '@/services/util/preview';
import { useState } from 'react';
import look from '@/services/util/viewLook';
import ChargeIframe from '@/pages/Admins/AdminCharge/ChargeIframe';
import ImgUrl from '@/services/util/ImgUrl';
export default (props: any) => {
  const { width, action, name, fieldProps = {}, label, rules, renderData, fileUrl } = props;
  const [PreviewVisibles, setPreviewVisibles] = useState<boolean>(false);
  const [previewurl, setPreviewurl] = useState<any>();
  const [previewImage, setPreviewImage] = useState<any>();
  const [previewVisible, setPreviewVisible] = useState<any>(false);

  const tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
  const tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
  const obj = {};
  obj[tokenName] = tokenValue;
  return (
    <>
      <ProFormUploadDragger
        width={width}
        action={action}
        name={name}
        label={label}
        fieldProps={{
          ...fieldProps,
          multiple: true,
          listType: 'picture',
          headers: { ...obj },
          defaultFileList: [],
          beforeUpload: (file: { size: number; type: string }) => {
            if (file.size > 40960000) {
              message.error(`上次大小不能超过40M`);
              return Upload.LIST_IGNORE;
            }
          },
          onPreview: async (file: any) => {
            console.log('file', file);

            if (file.thumbUrl) {
              setPreviewurl(file.thumbUrl);
              setPreviewVisibles(true);
            } else {
              const type = file.name.slice(file.name.indexOf('.'));
              if (type == '.pdf') {
                look(renderData.id, file.name, fileUrl, setPreviewImage, setPreviewVisible);
              } else {
                look(renderData.id, file.name, fileUrl, setPreviewurl, setPreviewVisibles);
              }
            }
          },
          onChange: (info: { file: { name?: any; status?: any } }) => {
            const { status } = info.file;
            console.log('info', info);

            if (status !== 'uploading') {
            }
            if (status === 'done') {
              message.success(`${info.file.name} 上传成功.`);
            } else if (status === 'error') {
              message.error(`${info.file.name} 上传失败.`);
            }
          },
        }}
        rules={rules}
      />
      {PreviewVisibles && (
        <Preview
          imgSrc={previewurl}
          isModalVisibles={PreviewVisibles}
          setisModalVisibles={(e: boolean | ((prevState: boolean) => boolean)) =>
            setPreviewVisibles(e)
          }
        />
      )}
      <ChargeIframe
        previewVisible={previewVisible}
        setPreviewVisible={() => setPreviewVisible(false)}
        previewImage={previewImage}
      />
    </>
  );
};
