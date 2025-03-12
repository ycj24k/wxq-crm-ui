import { PlusOutlined } from '@ant-design/icons';
import { Badge, Button, Space } from 'antd';
import { useState, useRef, useEffect } from 'react';
import OldCharge from '../index';
import ChargeModal from './ChargeModal';
import request from '@/services/ant-design-pro/apiRequest';
import DownTable from '@/services/util/timeFn';
import DownHeader from '@/pages/Admins/AdminCharge/DownHeader';
export default () => {
  const [ModalsVisible, setModalsVisible] = useState<boolean>(false);
  const [renderData, setRenderData] = useState<any>(null);
  const [Params, setParams] = useState<any>({ 'auditNum-isNull': true, enable: true });
  const childRef: any = useRef(null);
  const [Badges, setBadges] = useState<any>([0, 0]);
  const [ChangeKey, setChangeKey] = useState<any>('list');

  useEffect(() => {
    BadgesNumbers();
  }, []);
  const callbackRef = () => {
    childRef.current.callbackRef();
  };
  const BadgesNumbers = () => {
    request
      .get('/sms/business/bizCharge/statistics', {
        array: JSON.stringify([{ type: 2, 'auditNum-isNull': true }]),
      })
      .then((res) => {
        setBadges(res.data);
      });
  };
  const toolBarRender = [
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => {
        setRenderData({ eidtType: 'add', type: '2' });
        setModalsVisible(true);
      }}
    >
      新增缴费信息
    </Button>,
  ];
  const toolbar = {
    menu: {
      type: 'tab',
      // activeKey: activeKey,
      items: [

        {
          key: 'shenhe',
          label: (
            <Badge count={Badges[0]} size="small" offset={[5, 3]}>
              <span>财务审核</span>
            </Badge>
          ),
        },
        {
          key: 'true',
          label: <span>审核通过</span>,
        },
        {
          key: 'false',
          label: <span>审核未通过</span>,
        },
        {
          key: 'list',
          label: <span>缴费列表</span>,
        },
        {
          key: 'enable',
          label: <span>已废除</span>,
        },
      ],
      onChange: (key: any) => {
        setChangeKey(key);
        if (key == 'shenhe') {
          // params['auditType-isNull'] = true;
          setParams({ 'auditNum-isNull': true, enable: true });
        } else if (key == 'true') {
          setParams({ confirm: true, enable: true });
          // params.confirm = true;
        } else if (key == 'false') {
          setParams({ confirm: false, enable: true });
          // params.confirm = false;
        } else if (key === 'enable') {
          setParams({ enable: false });
        } else if (key === 'list') {
          setParams({ enable: true, confirm: true });
        }
        callbackRef();
      },
    },
  };

  return (
    <>
      <OldCharge
        params={{ type: 2, ...Params }}
        ref={childRef}
        toolbar={toolbar}
        toolBarRender={toolBarRender}
        setModalsVisible={(e: boolean) => setModalsVisible(e)}
        setRenderData={(e: any) => setRenderData(e)}
        BadgesNumbers={() => BadgesNumbers()}
        ChangeKey={ChangeKey}
        tableAlertOptionRender={({ selectedRowKeys }: any) => {
          return (
            <Space size={24}>
              <a
                onClick={() => {
                  request
                    .get('/sms/business/bizCharge/getListOfFinance', {
                      idList: selectedRowKeys.join(','),
                    })
                    .then((res) => {
                      if (res.status == 'success') {
                        DownTable(res.data, DownHeader.PayHeader, '缴费信息', 'charge');
                      }
                    });
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
