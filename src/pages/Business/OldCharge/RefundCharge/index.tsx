import { PlusOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import { useState, useRef } from 'react';
import OldCharge from '../index';
import ChargeModal from './ChargeModal';
import request from '@/services/ant-design-pro/apiRequest';
import DownTable from '@/services/util/timeFn';
import DownHeader from '@/pages/Admins/AdminCharge/DownHeader';
export default () => {
  const [ModalsVisible, setModalsVisible] = useState<boolean>(false);
  const [renderData, setRenderData] = useState<any>(null);
  const childRef: any = useRef(null);
  const callbackRef = () => {
    childRef.current.callbackRef();
  };
  const toolBarRender = [
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => {
        setRenderData({ eidtType: 'add', type: '3' });
        setModalsVisible(true);
      }}
    >
      新增退费信息
    </Button>,
  ];

  return (
    <>
      <OldCharge
        params={{ type: 3, list: true }}
        toolBarRender={toolBarRender}
        ref={childRef}
        setModalsVisible={(e: boolean) => setModalsVisible(e)}
        setRenderData={(e: any) => setRenderData(e)}
        tableAlertOptionRender={({ selectedRows }: any) => {
          return (
            <Space size={24}>
              <a
                onClick={() => {
                  DownTable(selectedRows, DownHeader.RefundHeader, '退费信息', 'charge');
                }}
              >
                导出数据
              </a>
            </Space>
          );
        }}
      />

      {ModalsVisible && (
        <ChargeModal
          renderData={renderData}
          ModalsVisible={ModalsVisible}
          setModalsVisible={() => setModalsVisible(false)}
          callbackRef={() => callbackRef()}
        />
      )}
    </>
  );
};
